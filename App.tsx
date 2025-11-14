// FIX: Changed React import to namespace import `* as React` to resolve widespread JSX intrinsic element type errors, which likely stem from a project configuration that requires this import style.
import * as React from 'react';

// NOTE: The global JSX type definition for 'dotlottie-wc' has been moved to types.ts
// to centralize all global type definitions and fix JSX intrinsic element errors.

import { Sidebar } from './components/Sidebar';
import { UploadView } from './components/UploadView';
import { DashboardView } from './components/DashboardView';
import { CandidateDetailView } from './components/CandidateDetailView';
import { CompareView } from './components/CompareView';
import { AnalysisLoader } from './components/AnalysisLoader';
import { SettingsView } from './components/SettingsView';
import { QuotaModal } from './components/QuotaModal';
import { MobileNavBar } from './components/MobileNavBar';
import { CVFile, View, CandidateProfile, Theme, User } from './types';
import { parseCvContent } from './services/geminiService';
import { Icon } from './components/icons';
import { LanguageProvider, useTranslation } from './i18n';
import { logoDark, logoLight } from './assets';

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
    jobCategory: 'Développeur Full-Stack',
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
    jobCategory: 'Développeur Full-Stack', // Grouped with developers
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
    // FIX: Corrected typo from `readDataURL` to `readAsDataURL`.
    reader.readAsDataURL(file);
  });
};

const calculateFileHash = async (file: File): Promise<string> => {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

const UPLOAD_SELECTION_LIMIT = 5;

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
    const [comparisonList, setComparisonList] = React.useState<string[]>(() => {
        try {
            const saved = localStorage.getItem('comparisonList');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error("Failed to load comparison list from localStorage", error);
            return [];
        }
    });
    const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = React.useState(false);
    const [storageError, setStorageError] = React.useState<string | null>(null);
    const [analysisSummaryMessage, setAnalysisSummaryMessage] = React.useState<string | null>(null);
    const [currentUser, setCurrentUser] = React.useState<User | null>(null);
    const [isOwner, setIsOwner] = React.useState(false);
    const [analysisLimit, setAnalysisLimit] = React.useState({ count: 0, limit: 3 });
    const [limitError, setLimitError] = React.useState<string | null>(null);
    const [uploadError, setUploadError] = React.useState<string | null>(null);
    const [isQuotaModalOpen, setIsQuotaModalOpen] = React.useState(false);
    
    const [processedCVsCache, setProcessedCVsCache] = React.useState<Record<string, CandidateProfile>>(() => {
        try {
            const cache = localStorage.getItem('processedCVsCache');
            return cache ? JSON.parse(cache) : {};
        } catch {
            return {};
        }
    });

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
    
    // FIX: Removed state and scroll listeners for mobile nav visibility.
    // The nav bars will now be persistently visible on mobile.
    const mainContentRef = React.useRef<HTMLElement>(null);


    React.useEffect(() => {
        try {
            localStorage.setItem('processedCVsCache', JSON.stringify(processedCVsCache));
        } catch (error) {
            console.error("Failed to save CV cache to localStorage", error);
        }
    }, [processedCVsCache]);

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
    const [isAnalysisDone, setIsAnalysisDone] = React.useState(false);
    const [analysisStartTime, setAnalysisStartTime] = React.useState<number | null>(null);
    const [analysisTotal, setAnalysisTotal] = React.useState(0);

    React.useEffect(() => {
        const fetchUser = async () => {
            let specialUserFound = false;
            try {
                const specialUser = localStorage.getItem('specialUser');
                if (specialUser) {
                    const { userId, email } = JSON.parse(specialUser);
                    if (email.toLowerCase() === 'moslihayoub@gmail.com' || userId === 'Moslih84') {
                        specialUserFound = true;
                    }
                }
            } catch (e) {
                console.error("Failed to check special user from localStorage", e);
            }

            if (specialUserFound) {
                setIsOwner(true);
            }

            try {
                if (window.aistudio && typeof window.aistudio.getAuthenticatedUser === 'function') {
                    const user = await window.aistudio.getAuthenticatedUser();
                    setCurrentUser(user);
                    if (user && (user.email.toLowerCase() === 'moslihayoub@gmail.com' || user.id === 'Moslih84')) {
                        setIsOwner(true);
                    }
                } else if (!specialUserFound) {
                    console.warn("User authentication service not found.");
                    setIsOwner(false);
                    setCurrentUser({ email: 'guest@example.com', id: 'guest' });
                }
            } catch (e) {
                console.error("Could not get authenticated user:", e);
                if (!specialUserFound) setIsOwner(false);
                setCurrentUser(null);
            }
        };
        fetchUser();
    }, []);

    React.useEffect(() => {
        if (isOwner) return; // Owner usage is not tracked

        const today = new Date().toISOString().split('T')[0];
        try {
            const usageDataStr = localStorage.getItem('analysisOperationUsage');
            if (usageDataStr) {
                const usageData = JSON.parse(usageDataStr);
                if (usageData.date === today) {
                    setAnalysisLimit(prev => ({ ...prev, count: usageData.count }));
                } else {
                    localStorage.setItem('analysisOperationUsage', JSON.stringify({ date: today, count: 0 }));
                    setAnalysisLimit(prev => ({ ...prev, count: 0 }));
                }
            } else {
                localStorage.setItem('analysisOperationUsage', JSON.stringify({ date: today, count: 0 }));
                setAnalysisLimit(prev => ({ ...prev, count: 0 }));
            }
        } catch (e) {
            console.error("Error reading usage from localStorage", e);
            localStorage.setItem('analysisOperationUsage', JSON.stringify({ date: today, count: 0 }));
        }
    }, [isOwner]);

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
            localStorage.setItem('comparisonList', JSON.stringify(comparisonList));
        } catch (error) {
            console.error("Failed to save comparison list from localStorage", error);
        }
    }, [comparisonList]);

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
    
    const comparisonProfiles = React.useMemo((): (CandidateProfile | undefined)[] => {
        return [
            candidateProfiles.find(p => p.id === comparisonList[0]),
            candidateProfiles.find(p => p.id === comparisonList[1])
        ];
    }, [candidateProfiles, comparisonList]);


    const handleAddFiles = React.useCallback(async (files: File[]) => {
        setUploadError(null);
    
        let currentFiles = isDummyDataActive ? [] : cvFiles;
    
        if (!isOwner && currentFiles.length >= UPLOAD_SELECTION_LIMIT) {
            setUploadError(t('errors.upload_limit_reached'));
            return;
        }
    
        const remainingSlots = isOwner ? Infinity : UPLOAD_SELECTION_LIMIT - currentFiles.length;
        const filesToAdd = files.slice(0, remainingSlots);
        
        if (!isOwner && files.length > remainingSlots && remainingSlots > 0) {
            setUploadError(t('errors.upload_selection_ignored', { count: remainingSlots }));
        }
    
        const jsonFiles = filesToAdd.filter(f => f.name.endsWith('.json') || f.type === 'application/json');
        const otherFiles = filesToAdd.filter(f => !jsonFiles.includes(f));
    
        // 1. Process JSON imports to update existing profiles or add new ones
        let wasUpdatedFromJson = false;
        if (jsonFiles.length > 0) {
            const importedProfilesByEmail = new Map<string, CandidateProfile>();
            const errorFiles: CVFile[] = [];

            for (const file of jsonFiles) {
                try {
                    const content = await file.text();
                    const parsedData = JSON.parse(content);
                    const profiles: CandidateProfile[] = Array.isArray(parsedData) ? parsedData : [parsedData];
                    
                    profiles.forEach(profile => {
                        if (profile.email) {
                            // Last one wins if duplicate emails in same import
                            importedProfilesByEmail.set(profile.email, {
                                ...profile,
                                fileName: profile.fileName || file.name,
                                analysisDuration: 0,
                            });
                        }
                    });
                } catch (error) {
                    console.error(`Failed to parse JSON file ${file.name}:`, error);
                    errorFiles.push({
                        id: `${file.name}-${Date.now()}`,
                        file,
                        status: 'error',
                        error: t('errors.invalid_json'),
                    });
                }
            }

            const updatedFiles = currentFiles.map(cvFile => {
                if (cvFile.profile?.email && importedProfilesByEmail.has(cvFile.profile.email)) {
                    const newProfileData = importedProfilesByEmail.get(cvFile.profile.email)!;
                    importedProfilesByEmail.delete(cvFile.profile.email); // Remove so it's not added again
                    wasUpdatedFromJson = true;
                    return {
                        ...cvFile,
                        status: 'success' as const,
                        profile: { ...newProfileData, id: cvFile.id },
                        error: undefined,
                    };
                }
                return cvFile;
            });

            const newFilesFromJson = Array.from(importedProfilesByEmail.values()).map(profile => {
                const id = profile.id || `imported-${profile.name?.replace(/\s/g, '') || 'profile'}-${Date.now()}`;
                return {
                    id,
                    file: new File([], profile.fileName || 'imported.json'),
                    status: 'success' as const,
                    profile: { ...profile, id },
                };
            });
            
            currentFiles = [...updatedFiles, ...newFilesFromJson, ...errorFiles];
        }

        // 2. Process other file uploads (PDF, DOCX, etc.)
        const existingFileNames = new Set(currentFiles.map(f => f.file.name));
        const newOtherCvFiles: CVFile[] = otherFiles
            .filter(file => !existingFileNames.has(file.name))
            .map(file => ({
                id: `${file.name}-${Date.now()}`,
                file,
                status: 'pending',
            }));
            
        // 3. Combine everything and set state
        setCvFiles([...currentFiles, ...newOtherCvFiles]);
        
        if (isDummyDataActive && (wasUpdatedFromJson || newOtherCvFiles.length > 0 || jsonFiles.length > 0)) {
            setIsDummyDataActive(false);
        }
    }, [cvFiles, isDummyDataActive, t, isOwner]);


    const handleClearFile = (fileId: string) => {
        setCvFiles(prev => prev.filter(f => f.id !== fileId));
    };
    
    const handleStartAnalysis = async () => {
        const pendingFiles = cvFiles.filter(f => f.status === 'pending');
        if (pendingFiles.length === 0) return;

        setLimitError(null);
        setAnalysisSummaryMessage(null);

        if (!isOwner) {
            if (analysisLimit.count >= analysisLimit.limit) {
                setLimitError(t('errors.limit_exceeded', { limit: analysisLimit.limit }));
                setIsQuotaModalOpen(true);
                return;
            }

            const newCount = analysisLimit.count + 1;
            try {
                const today = new Date().toISOString().split('T')[0];
                localStorage.setItem('analysisOperationUsage', JSON.stringify({ date: today, count: newCount }));
                setAnalysisLimit(prev => ({ ...prev, count: newCount }));
            } catch (e) {
                console.error("Failed to update usage in localStorage", e);
            }
        }

        setAnalysisTotal(pendingFiles.length);
        setIsAnalyzing(true);
        setIsAnalysisDone(false);
        setAnalysisStartTime(Date.now());
        
        // Set all pending files to 'parsing' state at once for immediate UI feedback.
        setCvFiles(prevFiles =>
            prevFiles.map(file =>
                pendingFiles.some(pf => pf.id === file.id) ? { ...file, status: 'parsing', analysisStartTime: Date.now() } : file
            )
        );

        const analysisPromises = pendingFiles.map(async (cvFile) => {
            const analysisStartTimeForFile = Date.now();
            const hash = await calculateFileHash(cvFile.file);

            if (processedCVsCache[hash]) {
                const profile = processedCVsCache[hash];
                // The profile from cache might have a different ID, so we re-assign the current file's ID.
                const updatedProfile = { ...profile, id: cvFile.id, fileName: cvFile.file.name, analysisDuration: 0 };
                 return { ...cvFile, status: 'success' as const, profile: updatedProfile, content: '', analysisDuration: 0, hash };
            }

            try {
                const fileData = await readFileAsBase64(cvFile.file);
                const profileData = await parseCvContent(fileData);
                const duration = Date.now() - analysisStartTimeForFile;
                const profile: CandidateProfile = {
                    ...profileData,
                    id: cvFile.id,
                    fileName: cvFile.file.name,
                    analysisDuration: duration,
                };
                
                setProcessedCVsCache(prev => ({ ...prev, [hash]: profile }));
                return { ...cvFile, status: 'success' as const, profile, content: '', analysisDuration: duration, hash };
            } catch (error) {
                const duration = Date.now() - analysisStartTimeForFile;
                const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
                return { ...cvFile, status: 'error' as const, error: errorMessage, analysisDuration: duration, hash };
            }
        });

        const results = await Promise.all(analysisPromises);
        
        // Update the main state once with all the results.
        setCvFiles(prevFiles => {
            const filesMap = new Map(prevFiles.map(f => [f.id, f]));
            results.forEach(result => {
                filesMap.set(result.id, result);
            });
            return Array.from(filesMap.values());
        });

        const incompleteCount = results.filter(f => 
            f.status === 'success' && 
            f.profile && 
            (!f.profile.name || f.profile.name === 'N/A' || !f.profile.jobCategory || f.profile.jobCategory === 'N/A')
        ).length;
        
        if (incompleteCount > 0) {
            setAnalysisSummaryMessage(t('analysis.summary_incomplete', {count: incompleteCount}));
        }

        setIsAnalysisDone(true);
    };

    const handleCancelAnalysis = () => {
        setIsAnalyzing(false);
        // Note: background analysis might continue, this just closes the UI.
    };

    const handleViewResults = () => {
        setIsAnalyzing(false);
        setView('dashboard');
    };

    const handleSelectCandidate = (candidate: CandidateProfile) => {
        setSelectedProfileId(candidate.id);
        mainContentRef.current?.scrollTo(0, 0);
    };

    const handleBackToDashboard = () => {
        setSelectedProfileId(null);
    };

    const handleBackFromCompare = () => {
        setView('dashboard');
        // setComparisonList([]);
    };

    const handleToggleCompare = (candidateId: string) => {
        // This is a special call from the header button to navigate
        if (candidateId === '' && comparisonList.length === 2) {
            setView('compare');
            return;
        }

        setComparisonList(prev => {
            if (prev.includes(candidateId)) {
                return prev.filter(id => id !== candidateId);
            }
            if (prev.length < 2) {
                const newList = [...prev, candidateId];
                if (newList.length === 2) {
                    // Automatically navigate to compare view when 2 are selected
                    setView('compare');
                }
                return newList;
            }
            return prev; // Don't add if already 2
        });
    };

    const handleReset = () => {
        // Confirmation is now handled within the components.
        setCvFiles([]);
        setFavorites([]);
        setComparisonList([]);
        setSelectedProfileId(null);
        setView('upload');
        setIsDummyDataActive(false);
        localStorage.removeItem('cvFiles');
        localStorage.removeItem('favorites');
        localStorage.removeItem('isDummyDataActive');
        localStorage.removeItem('analysisOperationUsage');
        localStorage.removeItem('specialUser');
        localStorage.removeItem('comparisonList');
        localStorage.removeItem('processedCVsCache');
        localStorage.removeItem('lightCycleHighScore');
        setProcessedCVsCache({});
        setAnalysisLimit(prev => ({...prev, count: 0}));
        setStorageError(null);
        setAnalysisSummaryMessage(null);
        setUploadError(null);
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

    const handleImportProfiles = (profiles: Partial<CandidateProfile>[]) => {
        const existingEmails = new Set(cvFiles.map(f => f.profile?.email).filter(Boolean));
        
        const newCvFiles: CVFile[] = profiles
            .filter(p => p.email && !existingEmails.has(p.email)) // Filter out duplicates by email
            .map((profile, index) => {
                const id = `imported-${profile.name?.replace(/\s/g, '') || 'profile'}-${Date.now() + index}`;
                const fullProfile: CandidateProfile = {
                    id,
                    fileName: 'imported.csv',
                    name: profile.name || 'N/A',
                    email: profile.email || 'N/A',
                    phone: profile.phone || 'N/A',
                    location: profile.location || 'N/A',
                    summary: profile.summary || 'Imported profile.',
                    experience: profile.experience || [],
                    education: profile.education || [],
                    skills: profile.skills || { hard: [], soft: [] },
                    languages: profile.languages || [],
                    certifications: profile.certifications || [],
                    detectedLanguage: profile.detectedLanguage || 'N/A',
                    jobCategory: profile.jobCategory || 'Other',
                    totalExperienceYears: profile.totalExperienceYears || 0,
                    performanceScore: profile.performanceScore || 0,
                    analysisDuration: 0,
                };
                return {
                    id,
                    file: new File([], 'imported.csv'),
                    status: 'success',
                    profile: fullProfile,
                };
            });
        
        setCvFiles(prev => [...prev, ...newCvFiles]);
        setView('dashboard');
    };
    
    const handleConnect = (credentials: { userId: string; email: string; rememberMe: boolean }): boolean => {
        const { userId, email, rememberMe } = credentials;
        if (email.toLowerCase() === 'moslihayoub@gmail.com' || userId === 'Moslih84') {
            setIsOwner(true);
            if (rememberMe) {
                try {
                    localStorage.setItem('specialUser', JSON.stringify({ userId, email }));
                } catch (e) {
                    console.error("Failed to save special user to localStorage", e);
                }
            }
            setIsQuotaModalOpen(false);
            setLimitError(null);
            return true;
        }
        return false;
    };

    const handleDisconnect = () => {
        setIsOwner(false);
        setCurrentUser({ email: 'guest@example.com', id: 'guest' });
        try {
            localStorage.removeItem('specialUser');
        } catch (e) {
            console.error("Failed to remove special user from localStorage", e);
        }
    };


    const selectedCvFile = cvFiles.find(f => f.id === selectedProfileId);
    
    const renderContent = () => {
        if (selectedProfileId && selectedCvFile && selectedCvFile.profile) {
            const isFavorite = favorites.includes(selectedProfileId);
            const handleToggleFavorite = () => toggleFavorite(selectedProfileId);
            return <CandidateDetailView candidate={selectedCvFile.profile} cvFile={selectedCvFile} onBack={handleBackToDashboard} isFavorite={isFavorite} onToggleFavorite={handleToggleFavorite} comparisonList={comparisonList} onToggleCompare={handleToggleCompare}/>;
        }

        switch (view) {
            case 'upload':
                return <UploadView cvFiles={cvFiles} onAddFiles={handleAddFiles} onStartAnalysis={handleStartAnalysis} onClearFile={handleClearFile} onClearAllFiles={handleReset} isAnalyzing={isAnalyzing} storageError={storageError} isOwner={isOwner} analysisLimit={analysisLimit} limitError={limitError} uploadLimit={isOwner ? Infinity : UPLOAD_SELECTION_LIMIT} />;
            case 'dashboard':
                return <DashboardView candidates={candidateProfiles} onSelectCandidate={handleSelectCandidate} onReset={handleReset} favorites={favorites} onToggleFavorite={toggleFavorite} setSearchQuery={() => {}} comparisonList={comparisonList} onToggleCompare={handleToggleCompare} onImportProfiles={handleImportProfiles} />;
            case 'favorites':
                return <DashboardView candidates={favoriteProfiles} onSelectCandidate={handleSelectCandidate} onReset={handleReset} favorites={favorites} onToggleFavorite={toggleFavorite} setSearchQuery={() => {}} isFavoritesView comparisonList={comparisonList} onToggleCompare={handleToggleCompare} onImportProfiles={handleImportProfiles} />;
            case 'settings':
                return <SettingsView 
                            theme={theme} 
                            setTheme={setTheme} 
                            onLoadDummyData={handleLoadDummyData}
                            isDummyDataButtonDisabled={cvFiles.length > 0 && !isDummyDataActive}
                            onOpenQuotaModal={() => setIsQuotaModalOpen(true)}
                            isOwner={isOwner}
                            onDisconnect={handleDisconnect}
                            isDummyDataActive={isDummyDataActive}
                            onReset={handleReset}
                        />;
            case 'compare':
                 const [profile1, profile2] = comparisonProfiles;
                 return <CompareView profile1={profile1} profile2={profile2} onBack={handleBackFromCompare} />;
            default:
                return <UploadView cvFiles={cvFiles} onAddFiles={handleAddFiles} onStartAnalysis={handleStartAnalysis} onClearFile={handleClearFile} onClearAllFiles={handleReset} isAnalyzing={isAnalyzing} storageError={storageError} isOwner={isOwner} analysisLimit={analysisLimit} limitError={limitError} uploadLimit={isOwner ? Infinity : UPLOAD_SELECTION_LIMIT} />;
        }
    };

    // FIX: Removed 'compare' from the full-screen view conditions to fix a bug where the mobile nav bar would disappear.
    const isFullScreenView = view === 'settings' || !!selectedProfileId;

    return (
        <div className="h-screen text-gray-800 dark:text-gray-200 bg-white dark:bg-black">
            <div className="flex h-full w-full">
                {isAnalyzing && <AnalysisLoader total={analysisTotal} startTime={analysisStartTime} isAnalysisDone={isAnalysisDone} onViewResults={handleViewResults} onCancel={handleCancelAnalysis} />}
                {isQuotaModalOpen && <QuotaModal onClose={() => setIsQuotaModalOpen(false)} onConnect={handleConnect} />}

                <Sidebar
                    currentView={view}
                    setCurrentView={(v) => { setView(v); setSelectedProfileId(null); }}
                    isCollapsed={isSidebarCollapsed}
                    setIsCollapsed={setIsSidebarCollapsed}
                    isMobileOpen={isMobileSidebarOpen}
                    setIsMobileOpen={setIsMobileSidebarOpen}
                />
                <div className="flex-1 flex flex-col overflow-hidden">
                    <header className={`md:hidden flex items-center justify-between p-4 border-b dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-20`}>
                        <>
                            <img src={logoLight} alt="ParseLIQ HR Logo" className="h-8 w-auto dark:hidden" />
                            <img src={logoDark} alt="ParseLIQ HR Logo" className="h-8 w-auto hidden dark:block" />
                        </>
                        <button onClick={() => setIsMobileSidebarOpen(true)} className="p-1 text-gray-600 dark:text-gray-300">
                           <Icon name="menu" className="w-6 h-6"/>
                        </button>
                    </header>
                    {storageError ? (
                        <div className="p-4 mx-4 sm:mx-8 mt-4 sm:mt-8 bg-red-100 dark:bg-red-900/50 border-l-4 border-red-500 text-red-800 dark:text-red-200 rounded-r-lg flex justify-between items-center" role="alert">
                            <p><span className="font-bold">{t('common.storageError')}:</span> {storageError}</p>
                            <button onClick={() => setStorageError(null)} className="p-1 rounded-full hover:bg-red-200 dark:hover:bg-red-800/50">
                                <Icon name="close" className="w-5 h-5"/>
                            </button>
                        </div>
                    ) : uploadError ? (
                        <div className="p-4 mx-4 sm:mx-8 mt-4 sm:mt-8 bg-yellow-100 dark:bg-yellow-900/50 border-l-4 border-yellow-500 text-yellow-800 dark:text-yellow-200 rounded-r-lg flex justify-between items-center" role="alert">
                            <p><span className="font-bold">{t('common.info')}:</span> {uploadError}</p>
                            <button onClick={() => setUploadError(null)} className="p-1 rounded-full hover:bg-yellow-200 dark:hover:bg-yellow-800/50">
                                <Icon name="close" className="w-5 h-5"/>
                            </button>
                        </div>
                    ) : analysisSummaryMessage ? (
                        <div className="p-4 mx-4 sm:mx-8 mt-4 sm:mt-8 bg-yellow-100 dark:bg-yellow-900/50 border-l-4 border-yellow-500 text-yellow-800 dark:text-yellow-200 rounded-r-lg flex justify-between items-center" role="alert">
                            <p><span className="font-bold">{t('common.info')}:</span> {analysisSummaryMessage}</p>
                            <button onClick={() => setAnalysisSummaryMessage(null)} className="p-1 rounded-full hover:bg-yellow-200 dark:hover:bg-yellow-800/50">
                                <Icon name="close" className="w-5 h-5"/>
                            </button>
                        </div>
                    ) : null}
                    <main ref={mainContentRef} className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 pb-16 md:pb-0">
                        {renderContent()}
                    </main>
                     <MobileNavBar 
                        currentView={view}
                        setCurrentView={(v) => { setView(v); setSelectedProfileId(null); }}
                        isVisible={!isMobileSidebarOpen && !isFullScreenView}
                    />
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