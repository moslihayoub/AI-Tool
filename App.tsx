// FIX: Changed react import to default and named hooks import to resolve JSX intrinsic element type errors.
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { UploadView } from './components/UploadView';
import { DashboardView } from './components/DashboardView';
import { CandidateDetailView } from './components/CandidateDetailView';
import { AnalysisLoader } from './components/AnalysisLoader';
import { SettingsView } from './components/SettingsView';
import { CVFile, View, CandidateProfile, Theme } from './types';
import { parseCvContent } from './services/geminiService';
import { Icon } from './components/icons';
import { LanguageProvider, useTranslation } from './i18n';

const readFileAsBase64 = (file: File): Promise<{ mimeType: string; data: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64String = (reader.result as string).split(',')[1];
      if (!base64String) {
          reject(new Error("Could not read file as base64."));
          return;
      }
      resolve({ mimeType: file.type || 'application/octet-stream', data: base64String });
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

function AppContent() {
    const { t } = useTranslation();
    const [cvFiles, setCvFiles] = useState<CVFile[]>(() => {
        try {
            const savedFiles = localStorage.getItem('cvFiles');
            return savedFiles ? JSON.parse(savedFiles).map((f: any) => ({ ...f, file: new File([], f.fileName), content: '' })) : [];
        } catch (error) {
            console.error("Failed to load CVs from localStorage", error);
            return [];
        }
    });

    const [view, setView] = useState<View>('upload');
    const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [storageError, setStorageError] = useState<string | null>(null);
    const [analysisSummaryMessage, setAnalysisSummaryMessage] = useState<string | null>(null);
    
    const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('theme') as Theme) || 'system');

    // Refactored theme logic
    const [systemTheme, setSystemTheme] = useState(() =>
        window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    );

    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e: MediaQueryListEvent) => {
            setSystemTheme(e.matches ? 'dark' : 'light');
        };
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    const isDarkMode = useMemo(() => {
        if (theme === 'system') {
            return systemTheme === 'dark';
        }
        return theme === 'dark';
    }, [theme, systemTheme]);

    useEffect(() => {
        const root = window.document.documentElement;
        if (isDarkMode) {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [isDarkMode, theme]);
    // End of refactored theme logic

    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisProgress, setAnalysisProgress] = useState(0);
    const [analysisStartTime, setAnalysisStartTime] = useState<number | null>(null);
    const [analysisTotal, setAnalysisTotal] = useState(0);

    useEffect(() => {
        try {
            const storableFiles = cvFiles.map(f => {
                const { file, content, ...rest } = f;
                return { ...rest, fileName: file.name };
            });
            localStorage.setItem('cvFiles', JSON.stringify(storableFiles));
            if (storageError) {
                setStorageError(null); 
            }
        } catch (error) {
            console.error("Failed to save CVs to localStorage", error);
            if (error instanceof DOMException && (error.name === 'QuotaExceededError' || error.code === 22)) {
                 setStorageError(t('errors.storageFull'));
            } else if (error instanceof Error) {
                 setStorageError(`${t('errors.saveError')}: ${error.message}`);
            } else {
                 setStorageError(t('errors.unknownSaveError'));
            }
        }
    }, [cvFiles, storageError, t]);

    const candidateProfiles = useMemo((): CandidateProfile[] => {
        return cvFiles
            .filter(file => file.status === 'success' && file.profile)
            .map(file => file.profile as CandidateProfile);
    }, [cvFiles]);

    const handleAddFiles = useCallback((files: File[]) => {
        const newCvFiles: CVFile[] = files
          .filter(file => !cvFiles.some(cvFile => cvFile.file.name === file.name))
          .map(file => ({
            id: `${file.name}-${Date.now()}`,
            file,
            content: '',
            status: 'pending',
          }));
        setCvFiles(prev => [...prev, ...newCvFiles]);
    }, [cvFiles]);

    const handleClearFile = (fileId: string) => {
        setCvFiles(prev => prev.filter(f => f.id !== fileId));
    };
    
    const handleStartAnalysis = async () => {
        const pendingFiles = cvFiles.filter(f => f.status === 'pending');
        if (pendingFiles.length === 0) return;

        setAnalysisSummaryMessage(null);
        setAnalysisTotal(pendingFiles.length);
        setIsAnalyzing(true);
        setAnalysisProgress(0);
        setAnalysisStartTime(Date.now());
        
        const analysisPromises = pendingFiles.map(async (cvFile) => {
            let analysisStartTime = Date.now();
            let updatedFile: CVFile;
            try {
                setCvFiles(prev => prev.map(f => f.id === cvFile.id ? { ...f, status: 'parsing', analysisStartTime } : f));
                
                const fileData = await readFileAsBase64(cvFile.file);
                const profileData = await parseCvContent(fileData);

                const analysisEndTime = Date.now();
                const duration = analysisEndTime - analysisStartTime;

                const profile: CandidateProfile = {
                    ...profileData,
                    id: cvFile.id,
                    fileName: cvFile.file.name,
                    analysisDuration: duration,
                };

                updatedFile = { ...cvFile, status: 'success', profile, content: '', analysisDuration: duration };
                setCvFiles(prev => prev.map(f => f.id === cvFile.id ? updatedFile : f));
            } catch (error) {
                console.error(`Failed to process ${cvFile.file.name}:`, error);
                const analysisEndTime = Date.now();
                const duration = analysisEndTime - analysisStartTime;
                const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
                updatedFile = { ...cvFile, status: 'error', error: errorMessage, analysisDuration: duration };
                setCvFiles(prev => prev.map(f => f.id === cvFile.id ? updatedFile : f));
            } finally {
                setAnalysisProgress(p => p + 1);
            }
            return updatedFile;
        });

        const results = await Promise.all(analysisPromises);
        
        const incompleteCount = results.filter(f => 
            f.status === 'success' && 
            f.profile && 
            (!f.profile.name || f.profile.name === 'N/A' || !f.profile.jobCategory || f.profile.jobCategory === 'N/A')
        ).length;

        if (incompleteCount > 0) {
            setAnalysisSummaryMessage(t('analysis.summary_incomplete', {count: incompleteCount}));
        }

        setIsAnalyzing(false);
        setAnalysisStartTime(null);
        setView('dashboard');
    };

    const handleSelectCandidate = (candidate: CandidateProfile) => {
        setSelectedProfileId(candidate.id);
    };

    const handleBackToDashboard = () => {
        setSelectedProfileId(null);
    };

    const handleReset = () => {
        // Confirmation is now handled within the components.
        setCvFiles([]);
        setSelectedProfileId(null);
        setView('upload');
        localStorage.removeItem('cvFiles');
        setStorageError(null);
        setAnalysisSummaryMessage(null);
    };
    
    const selectedCvFile = cvFiles.find(f => f.id === selectedProfileId);

    const renderContent = () => {
        if (selectedProfileId && selectedCvFile && selectedCvFile.profile) {
            return <CandidateDetailView candidate={selectedCvFile.profile} cvFile={selectedCvFile} onBack={handleBackToDashboard} />;
        }

        switch (view) {
            case 'upload':
                return <UploadView cvFiles={cvFiles} onAddFiles={handleAddFiles} onStartAnalysis={handleStartAnalysis} onClearFile={handleClearFile} onClearAllFiles={handleReset} isAnalyzing={isAnalyzing} storageError={storageError}/>;
            case 'dashboard':
                return <DashboardView candidates={candidateProfiles} onSelectCandidate={handleSelectCandidate} onReset={handleReset} setSearchQuery={() => {}} />;
            case 'settings':
                return <SettingsView theme={theme} setTheme={setTheme} />;
            default:
                return <UploadView cvFiles={cvFiles} onAddFiles={handleAddFiles} onStartAnalysis={handleStartAnalysis} onClearFile={handleClearFile} onClearAllFiles={handleReset} isAnalyzing={isAnalyzing} storageError={storageError}/>;
        }
    };

    return (
        <div className="relative h-screen text-gray-800 dark:text-gray-200">
            <div
                className={`absolute inset-0 bg-200% animate-gradient-flow ${isDarkMode ? 'bg-animated-gradient' : 'bg-animated-gradient-light'}`}
                aria-hidden="true"
            />
            {isDarkMode && <div className="absolute inset-0 bg-gray-900 opacity-60" aria-hidden="true" />}

            <div className="relative flex h-full w-full">
                {isAnalyzing && <AnalysisLoader progress={analysisProgress} total={analysisTotal} startTime={analysisStartTime} />}
                <Sidebar
                    currentView={view}
                    setCurrentView={(v) => { setView(v); setSelectedProfileId(null); }}
                    isMobileOpen={isMobileSidebarOpen}
                    setIsMobileOpen={setIsMobileSidebarOpen}
                    isCollapsed={isSidebarCollapsed}
                    setIsCollapsed={setIsSidebarCollapsed}
                />
                <div className="flex-1 flex flex-col overflow-hidden">
                    <header className="md:hidden flex items-center justify-between p-4 border-b dark:border-gray-800 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                        <button onClick={() => setIsMobileSidebarOpen(true)}>
                            <Icon name="menu" className="w-6 h-6"/>
                        </button>
                        <h1 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-primary">HR Analyzer</h1>
                    </header>
                    <main className="flex-1 overflow-y-auto bg-white/70 dark:bg-gray-900/70 backdrop-blur-lg">
                         {storageError && (
                            <div className="p-4 mx-4 sm:mx-8 mt-4 sm:mt-8 bg-red-100 dark:bg-red-900/50 border-l-4 border-red-500 text-red-800 dark:text-red-200 rounded-r-lg" role="alert">
                                <p><span className="font-bold">{t('common.storageError')}:</span> {storageError}</p>
                            </div>
                        )}
                        {analysisSummaryMessage && (
                            <div className="p-4 mx-4 sm:mx-8 mt-4 sm:mt-8 bg-yellow-100 dark:bg-yellow-900/50 border-l-4 border-yellow-500 text-yellow-800 dark:text-yellow-200 rounded-r-lg flex justify-between items-center" role="alert">
                                <p><span className="font-bold">{t('common.info')}:</span> {analysisSummaryMessage}</p>
                                <button onClick={() => setAnalysisSummaryMessage(null)} className="p-1 rounded-full hover:bg-yellow-200 dark:hover:bg-yellow-800/50">
                                    <Icon name="close" className="w-5 h-5"/>
                                </button>
                            </div>
                        )}
                        {renderContent()}
                    </main>
                </div>
            </div>
        </div>
    );
}

function App() {
    return (
        <LanguageProvider>
            <AppContent />
        </LanguageProvider>
    );
}

export default App;
