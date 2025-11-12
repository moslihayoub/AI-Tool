// FIX: Changed to default react import and updated hooks usage to resolve JSX intrinsic element type errors.
import * as React from 'react';
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

const dummyProfiles: Omit<CandidateProfile, 'id' | 'fileName' | 'analysisDuration'>[] = [
  {
    name: 'Alice Dubois',
    email: 'alice.dubois@example.com',
    phone: '+33 6 12 34 56 78',
    location: 'Paris, France',
    summary: 'Développeuse Full Stack passionnée avec 3 ans d\'expérience dans la création d\'applications web robustes et scalables. Adepte des méthodologies agiles et du travail en équipe.',
    experience: [
      { title: 'Développeur Full Stack', company: 'Tech Solutions Inc.', dates: 'Jan 2021 - Présent', description: 'Développement et maintenance d\'une plateforme SaaS. Utilisation de React, Node.js, et PostgreSQL.' },
      { title: 'Développeur Web Junior', company: 'Web Agency', dates: 'Juin 2019 - Déc 2020', description: 'Création de sites vitrines pour divers clients avec WordPress et PHP.' },
    ],
    education: [
      { degree: 'Master en Informatique', school: 'Université Paris-Saclay', dates: '2017 - 2019' },
    ],
    skills: {
      hard: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'Docker', 'Git'],
      soft: ['Travail d\'équipe', 'Résolution de problèmes', 'Communication', 'Agile'],
    },
    languages: ['Français (Natif)', 'Anglais (Courant)'],
    certifications: ['AWS Certified Developer - Associate'],
    detectedLanguage: 'French',
    jobCategory: 'Développeur Full Stack',
    totalExperienceYears: 3.5,
    performanceScore: 88,
  },
  {
    name: 'Bob Martin',
    email: 'bob.martin@example.com',
    phone: '+44 20 7946 0958',
    location: 'London, UK',
    summary: 'Senior Product Designer with over 8 years of experience leading design for B2B and B2C products. Expert in user-centered design, prototyping, and design systems.',
    experience: [
      { title: 'Senior Product Designer', company: 'Innovate Ltd.', dates: 'May 2018 - Present', description: 'Led the redesign of the main dashboard, resulting in a 20% increase in user engagement. Created and maintained the company\'s design system.' },
      { title: 'UX/UI Designer', company: 'Creative Minds', dates: 'Jul 2015 - Apr 2018', description: 'Designed mobile and web interfaces for various clients in the e-commerce sector.' },
    ],
    education: [
      { degree: 'BSc in Graphic Design', school: 'University of the Arts London', dates: '2012 - 2015' },
    ],
    skills: {
      hard: ['Figma', 'Sketch', 'Adobe XD', 'User Research', 'Prototyping', 'Design Systems'],
      soft: ['Leadership', 'Empathy', 'Storytelling', 'Collaboration'],
    },
    languages: ['English (Native)'],
    certifications: [],
    detectedLanguage: 'English',
    jobCategory: 'Product Design',
    totalExperienceYears: 8,
    performanceScore: 95,
  },
  {
    name: 'Carla Rodriguez',
    email: 'carla.rodriguez@example.com',
    phone: '+34 911 23 45 67',
    location: 'Madrid, Spain',
    summary: 'QA Automation Engineer with a strong background in building and maintaining automated test frameworks. Proficient in Selenium, Cypress, and CI/CD pipelines.',
    experience: [
      { title: 'QA Automation Engineer', company: 'Software Quality Co.', dates: 'Feb 2020 - Present', description: 'Developed a Cypress-based E2E testing framework from scratch. Reduced manual testing time by 60%.' },
      { title: 'Manual QA Tester', company: 'App Testers', dates: 'Sep 2018 - Jan 2020', description: 'Performed manual regression and exploratory testing for mobile applications.' },
    ],
    education: [
      { degree: 'Bachelor in Computer Science', school: 'Polytechnic University of Madrid', dates: '2014 - 2018' },
    ],
    skills: {
      hard: ['Cypress', 'Selenium', 'JavaScript', 'CI/CD', 'Jenkins', 'Jira'],
      soft: ['Attention to detail', 'Analytical thinking', 'Reporting'],
    },
    languages: ['Spanish (Native)', 'English (Professional)'],
    certifications: ['ISTQB Certified Tester'],
    detectedLanguage: 'English',
    jobCategory: 'QA Automation',
    totalExperienceYears: 4,
    performanceScore: 82,
  },
  {
    name: 'David Chen',
    email: 'david.chen@example.com',
    phone: '+1 415-555-0101',
    location: 'San Francisco, USA',
    summary: 'Data Scientist with a passion for machine learning and data visualization. Experienced in Python, R, and building predictive models to drive business decisions.',
    experience: [
        { title: 'Data Scientist', company: 'Data Insights Corp', dates: 'Aug 2019 - Present', description: 'Built a customer churn prediction model with 92% accuracy. Created interactive dashboards using Tableau.'},
    ],
    education: [
        { degree: 'M.S. in Data Science', school: 'Stanford University', dates: '2017 - 2019'},
    ],
    skills: {
        hard: ['Python', 'R', 'SQL', 'Scikit-learn', 'TensorFlow', 'Tableau'],
        soft: ['Critical Thinking', 'Problem Solving', 'Communication'],
    },
    languages: ['English (Native)', 'Mandarin (Conversational)'],
    certifications: [],
    detectedLanguage: 'English',
    jobCategory: 'Développeur Full Stack', // Grouped with developers
    totalExperienceYears: 3,
    performanceScore: 91,
  },
];


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
    const [cvFiles, setCvFiles] = React.useState<CVFile[]>(() => {
        try {
            const savedFiles = localStorage.getItem('cvFiles');
            return savedFiles ? JSON.parse(savedFiles).map((f: any) => ({ ...f, file: new File([], f.fileName), content: '' })) : [];
        } catch (error) {
            console.error("Failed to load CVs from localStorage", error);
            return [];
        }
    });
    
    const [favorites, setFavorites] = React.useState<string[]>(() => {
        try {
            const savedFavorites = localStorage.getItem('favorites');
            return savedFavorites ? JSON.parse(savedFavorites) : [];
        } catch (error) {
            console.error("Failed to load favorites from localStorage", error);
            return [];
        }
    });

    const [view, setView] = React.useState<View>('upload');
    const [selectedProfileId, setSelectedProfileId] = React.useState<string | null>(null);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = React.useState(false);
    const [storageError, setStorageError] = React.useState<string | null>(null);
    const [analysisSummaryMessage, setAnalysisSummaryMessage] = React.useState<string | null>(null);
    
    const [theme, setTheme] = React.useState<Theme>(() => (localStorage.getItem('theme') as Theme) || 'system');

    // Refactored theme logic
    const [systemTheme, setSystemTheme] = React.useState(() =>
        window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    );
     const [isDummyDataActive, setIsDummyDataActive] = React.useState<boolean>(() => {
        try {
            return localStorage.getItem('isDummyDataActive') === 'true';
        } catch {
            return false;
        }
    });

    React.useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e: MediaQueryListEvent) => {
            setSystemTheme(e.matches ? 'dark' : 'light');
        };
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    const isDarkMode = React.useMemo(() => {
        if (theme === 'system') {
            return systemTheme === 'dark';
        }
        return theme === 'dark';
    }, [theme, systemTheme]);

    React.useEffect(() => {
        const root = window.document.documentElement;
        if (isDarkMode) {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [isDarkMode, theme]);
    // End of refactored theme logic

    const [isAnalyzing, setIsAnalyzing] = React.useState(false);
    const [analysisProgress, setAnalysisProgress] = React.useState(0);
    const [analysisStartTime, setAnalysisStartTime] = React.useState<number | null>(null);
    const [analysisTotal, setAnalysisTotal] = React.useState(0);

    React.useEffect(() => {
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
    
    React.useEffect(() => {
        try {
            localStorage.setItem('favorites', JSON.stringify(favorites));
        } catch (error) {
            console.error("Failed to save favorites to localStorage", error);
        }
    }, [favorites]);

     React.useEffect(() => {
        try {
            localStorage.setItem('isDummyDataActive', String(isDummyDataActive));
        } catch (error) {
            console.error("Failed to save dummy data state to localStorage", error);
        }
    }, [isDummyDataActive]);

    const candidateProfiles = React.useMemo((): CandidateProfile[] => {
        return cvFiles
            .filter(file => file.status === 'success' && file.profile)
            .map(file => file.profile as CandidateProfile);
    }, [cvFiles]);
    
    const favoriteProfiles = React.useMemo((): CandidateProfile[] => {
        return candidateProfiles.filter(p => favorites.includes(p.id));
    }, [candidateProfiles, favorites]);

    const handleAddFiles = React.useCallback((files: File[]) => {
        setCvFiles(currentCvFiles => {
            const initialCvFiles = isDummyDataActive ? [] : currentCvFiles;
            
            const newCvFiles: CVFile[] = files
                .filter(file => !initialCvFiles.some(cvFile => cvFile.file.name === file.name))
                .map(file => ({
                    id: `${file.name}-${Date.now()}`,
                    file,
                    content: '',
                    status: 'pending',
                }));
            
            return [...initialCvFiles, ...newCvFiles];
        });

        if (isDummyDataActive) {
            setIsDummyDataActive(false);
        }
    }, [isDummyDataActive]);


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
        setFavorites([]);
        setSelectedProfileId(null);
        setView('upload');
        setIsDummyDataActive(false);
        localStorage.removeItem('cvFiles');
        localStorage.removeItem('favorites');
        localStorage.removeItem('isDummyDataActive');
        setStorageError(null);
        setAnalysisSummaryMessage(null);
    };

     const handleLoadDummyData = () => {
        if (cvFiles.length > 0 && !isDummyDataActive) return;
        
        const dummyCvFiles: CVFile[] = dummyProfiles.map((profile, index) => {
            const id = `dummy-${profile.name.replace(/\s/g, '')}-${index}`;
            return {
                id: id,
                file: new File([], `${profile.name.replace(/\s/g, '_')}.pdf`),
                status: 'success',
                profile: {
                    ...profile,
                    id: id,
                    fileName: `${profile.name.replace(/\s/g, '_')}.pdf`,
                    analysisDuration: Math.random() * 5000 + 1000,
                },
                analysisDuration: Math.random() * 5000 + 1000,
            };
        });
        
        setCvFiles(dummyCvFiles);
        setIsDummyDataActive(true);
        setView('dashboard');
    };

    const toggleFavorite = (candidateId: string) => {
        setFavorites(prev => 
            prev.includes(candidateId) 
                ? prev.filter(id => id !== candidateId) 
                : [...prev, candidateId]
        );
    };
    
    const selectedCvFile = cvFiles.find(f => f.id === selectedProfileId);
    
    const renderContent = () => {
        if (selectedProfileId && selectedCvFile && selectedCvFile.profile) {
            const isFavorite = favorites.includes(selectedProfileId);
            const handleToggleFavorite = () => toggleFavorite(selectedProfileId);
            return <CandidateDetailView candidate={selectedCvFile.profile} cvFile={selectedCvFile} onBack={handleBackToDashboard} isFavorite={isFavorite} onToggleFavorite={handleToggleFavorite}/>;
        }

        switch (view) {
            case 'upload':
                return <UploadView cvFiles={cvFiles} onAddFiles={handleAddFiles} onStartAnalysis={handleStartAnalysis} onClearFile={handleClearFile} onClearAllFiles={handleReset} isAnalyzing={isAnalyzing} storageError={storageError}/>;
            case 'dashboard':
                return <DashboardView candidates={candidateProfiles} onSelectCandidate={handleSelectCandidate} onReset={handleReset} favorites={favorites} onToggleFavorite={toggleFavorite} setSearchQuery={() => {}} />;
            case 'favorites':
                return <DashboardView candidates={favoriteProfiles} onSelectCandidate={handleSelectCandidate} onReset={handleReset} favorites={favorites} onToggleFavorite={toggleFavorite} setSearchQuery={() => {}} isFavoritesView />;
            case 'settings':
                return <SettingsView 
                            theme={theme} 
                            setTheme={setTheme} 
                            onLoadDummyData={handleLoadDummyData}
                            isDummyDataButtonDisabled={cvFiles.length > 0 && !isDummyDataActive}
                        />;
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