


// FIX: Changed React import to namespace import `* as React` to resolve widespread JSX intrinsic element type errors, which likely stem from a project configuration that requires this import style.
// FIX: Switched to namespace React import to correctly populate the global JSX namespace.
import * as React from 'react';
import { CandidateProfile, FilterCriteria } from '../types';
import { Icon } from './icons';
import { FilterView } from './FilterView';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList, LineChart, Line } from 'recharts';
import { useTranslation } from '../i18n';
import { Drawer } from './Drawer';

interface DashboardViewProps {
  candidates: CandidateProfile[];
  onSelectCandidate: (candidate: CandidateProfile) => void;
  onReset: () => void;
  favorites: string[];
  onToggleFavorite: (candidateId: string) => void;
  isFavoritesView?: boolean;
  comparisonList: string[];
  onToggleCompare: (candidateId: string) => void;
  onImportProfiles: (profiles: Partial<CandidateProfile>[]) => void;
  pipelineCandidateIds: string[];
  onTogglePipeline: (candidateId: string) => void;
  showBars?: boolean;
}

const COLORS = ['#3b82f6', '#ec4899', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444'];

const isProfileIncomplete = (candidate: CandidateProfile): boolean => {
    return !candidate.name || candidate.name === 'N/A' ||
           !candidate.jobCategory || candidate.jobCategory === 'N/A';
};

const getScoreEmoji = (score: number): string => {
    if (score >= 90) return '🤩';
    if (score >= 70) return '😜';
    if (score >= 50) return '😅';
    if (score >= 30) return '🤬';
    if (score >= 10) return '😭';
    return '';
};

const CandidateCard: React.FC<{ 
    candidate: CandidateProfile; 
    onSelect: () => void; 
    isFavorite: boolean; 
    onToggleFavorite: (e: React.MouseEvent) => void;
    isInCompare: boolean;
    isCompareDisabled: boolean;
    onToggleCompare: (e: React.MouseEvent) => void;
    isInPipeline: boolean;
    onTogglePipeline: (e: React.MouseEvent) => void;
}> = ({ candidate, onSelect, isFavorite, onToggleFavorite, isInCompare, isCompareDisabled, onToggleCompare, isInPipeline, onTogglePipeline }) => {
    const { t } = useTranslation();
    
    return (
        <div onClick={onSelect} className={`relative bg-white dark:bg-gray-800 p-5 rounded-xl border shadow-md hover:shadow-xl hover:border-pink-500 cursor-pointer transition-all hover:scale-[1.03] duration-200 flex flex-col justify-between min-h-[220px] ${isInCompare ? 'ring-2 ring-primary-500 dark:ring-primary-400' : isFavorite ? 'ring-2 ring-secondary-500 dark:ring-secondary-400' : 'dark:border-gray-700'}`}>
            <div>
                <h3 className="font-bold font-display text-lg text-gray-800 dark:text-gray-100">{candidate.name && candidate.name !== 'N/A' ? candidate.name : t('common.name_not_available')}</h3>
                
                <div className="flex justify-between items-start mt-2">
                     <div className="flex items-start gap-3">
                        <button 
                            onClick={onToggleFavorite} 
                            className="flex flex-col items-center text-center text-gray-500 dark:text-gray-400 hover:text-secondary-500 dark:hover:text-secondary-400 transition-colors z-10 w-14"
                            title={isFavorite ? t('detail.remove_from_favorites') : t('detail.add_to_favorites')}
                            aria-label="Toggle favorite"
                        >
                            <div className={`p-1.5 rounded-full ${isFavorite ? '' : 'hover:bg-secondary-100 dark:hover:bg-gray-700'}`}>
                                <Icon name="heart" className={`w-6 h-6 ${isFavorite ? 'fill-secondary-500 text-secondary-500' : 'text-gray-400'}`} />
                            </div>
                            <span className="text-xs mt-1">{t('dashboard.card.favorite')}</span>
                        </button>
                         <button 
                            onClick={onToggleCompare} 
                            disabled={isCompareDisabled}
                            className={`flex flex-col items-center text-center transition-colors z-10 w-14 ${isInCompare ? 'text-primary-600 dark:text-primary-300' : 'text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-300'} disabled:opacity-50 disabled:cursor-not-allowed`}
                            title={isInCompare ? t('dashboard.compare.remove') : isCompareDisabled ? t('dashboard.compare.limit_reached') : t('dashboard.compare.add')}
                            aria-label="Toggle compare"
                        >
                            <div className={`p-1.5 rounded-full ${isInCompare ? 'bg-primary-100 dark:bg-primary-900/50' : 'hover:bg-primary-100 dark:hover:bg-gray-700'}`}>
                                <Icon name="compare" className={`w-6 h-6`} />
                            </div>
                            <span className="text-xs mt-1">{t('dashboard.card.compare')}</span>
                        </button>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                        {isProfileIncomplete(candidate) && (
                            <div className="group relative flex items-center">
                                <Icon name="alert-triangle" className="w-5 h-5 text-yellow-500" />
                                <span className="absolute bottom-full right-0 rtl:right-auto rtl:left-0 mb-2 w-48 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 text-center">
                                    {t('dashboard.incomplete_profile_tooltip')}
                                </span>
                            </div>
                        )}
                         <div className="flex items-center gap-1.5">
                           <span className="text-3xl">{getScoreEmoji(candidate.performanceScore)}</span>
                           <span className={`text-base font-bold px-3 py-1.5 rounded-full ${candidate.performanceScore > 75 ? 'bg-green-100 text-green-800' : candidate.performanceScore > 50 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                             {candidate.performanceScore || 0}/100
                           </span>
                        </div>
                    </div>
                </div>

                <p className="text-base font-semibold text-gray-600 dark:text-gray-400 truncate mt-2">{candidate.jobCategory && candidate.jobCategory !== 'N/A' ? candidate.jobCategory : t('common.category_not_available')}</p>
                 {candidate.experience?.[0]?.title && (
                    <p className="text-sm font-semibold text-[#FF585F] truncate mt-1">
                        {candidate.experience[0].title}
                    </p>
                )}
                <div className="text-base text-gray-500 dark:text-gray-400 flex items-center justify-between mt-1">
                  <span className="truncate pr-2 rtl:pr-0 rtl:pl-2">{candidate.location && candidate.location !== 'N/A' ? candidate.location : t('common.location_not_available')}</span>
                  <span className="font-medium flex-shrink-0">{t('dashboard.experience_years', {count: candidate.totalExperienceYears || 0})}</span>
                </div>
            </div>
            <div className="mt-4">
                <div className="flex flex-wrap gap-2 mb-3">
                    {(candidate.skills.hard || []).slice(0, 3).map(skill => (
                        <span key={skill} className="text-sm bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300 px-3 py-1 rounded-full inline-block max-w-full truncate">{skill}</span>
                    ))}
                </div>
                 <button 
                    onClick={onTogglePipeline}
                    className={`w-full font-bold py-2 px-4 rounded-lg transition-colors z-10 ${
                        isInPipeline 
                        ? 'bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40' 
                        : 'bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/40'
                    }`}
                >
                    {isInPipeline ? t('dashboard.card.remove_pipeline') : t('dashboard.card.add_pipeline')}
                </button>
                {candidate.analysisDuration !== undefined && <p className="text-xs text-right rtl:text-left text-gray-400 mt-2">{candidate.analysisDuration > 0 ? t('common.analyzed_in', {duration: (candidate.analysisDuration / 1000).toFixed(1)}) : 'From cache'}</p>}
            </div>
        </div>
    );
}

const groupData = (data: string[], t: (key: string) => string) => {
    const validData = data.filter(item => item && item.trim() && item.trim() !== 'N/A');
    const freqMap = validData.reduce((acc: Record<string, number>, item) => {
        const key = item.trim();
        acc[key] = (acc[key] || 0) + 1;
        return acc;
    }, {});

    const sortedData = Object.entries(freqMap).sort((a, b) => b[1] - a[1]);

    if (sortedData.length > 5) {
        const top5 = sortedData.slice(0, 5);
        const otherCount = sortedData.slice(5).reduce((sum, entry) => sum + entry[1], 0);
        return [...top5.map(([name, value]) => ({ name, value })), { name: t('dashboard.charts.other'), value: otherCount }];
    }
    return sortedData.map(([name, value]) => ({ name, value }));
};

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border dark:border-gray-600 shadow-lg">
                <p className="font-bold text-gray-500 dark:text-gray-400 text-sm mb-1">{label || payload[0].payload.name}</p>
                <p className="font-bold text-lg" style={{ color: '#ec4899' }}>
                    {`${payload[0].name}: ${payload[0].value}`}
                </p>
            </div>
        );
    }
    return null;
};

const EmptyChartState: React.FC = () => {
    const { t } = useTranslation();
    return (
        <div className="flex flex-col items-center justify-center h-[300px] text-gray-500">
            <dotlottie-wc
                src="https://lottie.host/89c66344-281d-4450-91d3-4574a47fec47/31ogoyP4Mh.lottie"
                autoplay
                loop
                style={{ width: '120px', height: '120px' }}
            ></dotlottie-wc>
            <p className="mt-2 text-sm italic">{t('dashboard.charts.no_data')}</p>
        </div>
    );
};

export const DashboardView: React.FC<DashboardViewProps> = ({ candidates, onSelectCandidate, onReset, favorites, onToggleFavorite, isFavoritesView = false, comparisonList, onToggleCompare, onImportProfiles, pipelineCandidateIds, onTogglePipeline, showBars = true }) => {
    const { t } = useTranslation();
    const [filters, setFilters] = React.useState<FilterCriteria>({ jobCategories: [], locations: [], experienceLevels: [], skills: [] });
    const [isFilterViewOpen, setIsFilterViewOpen] = React.useState(false);
    const [isActionsOpen, setIsActionsOpen] = React.useState(false);
    const [confirmReset, setConfirmReset] = React.useState(false);
    const actionsRef = React.useRef<HTMLDivElement>(null);
    const importInputRef = React.useRef<HTMLInputElement>(null);
    const graphsRef = React.useRef<HTMLDivElement>(null);
    const profilesRef = React.useRef<HTMLDivElement>(null);

    const handleScrollTo = (ref: React.RefObject<HTMLDivElement>) => {
        ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const handleImportClick = () => {
        importInputRef.current?.click();
        setIsActionsOpen(false);
    };

    const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            
            try {
                let profiles: Partial<CandidateProfile>[] = [];

                if (file.name.endsWith('.csv')) {
                    const rows = text.split('\n').map(row => row.trim()).filter(row => row);
                    if (rows.length < 2) {
                        alert('Invalid or empty CSV file.');
                        return;
                    }
                    const header = rows[0].split(',').map(h => h.replace(/"/g, '').trim());
                    profiles = rows.slice(1).map(row => {
                        const values = row.match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g)?.map(v => v.replace(/^"|"$/g, '').trim()) || [];
                        const profileData: any = {};
                        header.forEach((key, index) => {
                            profileData[key] = values[index];
                        });

                        const reconstructedProfile: Partial<CandidateProfile> = {
                            name: profileData['Name'],
                            email: profileData['Email'],
                            phone: profileData['Phone'],
                            location: profileData['Location'],
                            jobCategory: profileData['Job Category'],
                            totalExperienceYears: parseFloat(profileData['Experience Years']) || 0,
                            performanceScore: parseInt(profileData['Performance Score'], 10) || 0,
                            skills: {
                                hard: profileData['Hard Skills'] ? profileData['Hard Skills'].split(',').map(s => s.trim()) : [],
                                soft: profileData['Soft Skills'] ? profileData['Soft Skills'].split(',').map(s => s.trim()) : [],
                            },
                            experience: profileData['Current Title'] ? [{ title: profileData['Current Title'], company: 'N/A', dates: 'N/A', description: 'Imported from CSV' }] : [],
                        };
                        return reconstructedProfile;
                    });
                } else if (file.name.endsWith('.json')) {
                    const parsedData = JSON.parse(text);
                    const rawProfiles = Array.isArray(parsedData) ? parsedData : [parsedData];
                    if (rawProfiles.every(p => typeof p === 'object' && p !== null)) {
                        profiles = rawProfiles;
                    } else {
                        throw new Error("Invalid JSON structure for profiles.");
                    }
                } else {
                    alert("Unsupported file type for import. Please use CSV or JSON.");
                    return;
                }

                if (profiles.length > 0) {
                    onImportProfiles(profiles);
                }
            } catch (error) {
                console.error("Failed to parse import file:", error);
                alert(`Error parsing file: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        };
        reader.readAsText(file);
        event.target.value = '';
    };

    const shortenJobCategory = (category: string) => {
        const mapping: { [key: string]: string } = {
            'Product Design': 'Design',
            'Développeur Full-Stack': 'Full-Stack',
            'QA Automation': 'QA',
        };
        return mapping[category] || category;
    };

    const filteredCandidates = React.useMemo(() => {
        const { jobCategories, locations, experienceLevels, skills } = filters;
        
        const experienceLevelToYears = (level: string): [number, number] => {
            if (level === t('dashboard.exp_buckets.junior')) return [0, 2];
            if (level === t('dashboard.exp_buckets.confirmed')) return [3, 5];
            if (level === t('dashboard.exp_buckets.senior')) return [6, 10];
            if (level === t('dashboard.exp_buckets.expert')) return [11, Infinity];
            return [-1, -1];
        };

        const selectedRanges = experienceLevels.map(experienceLevelToYears).filter(r => r[0] !== -1);

        const filtered = candidates.filter(c => {
            if (jobCategories.length > 0 && !jobCategories.includes(c.jobCategory)) return false;
            if (locations.length > 0 && !locations.includes(c.location)) return false;
            if (skills.length > 0 && !skills.every(skill => c.skills.hard.some(hardSkill => hardSkill.toLowerCase().includes(skill.toLowerCase())))) return false;
            
            if (selectedRanges.length > 0) {
                const years = c.totalExperienceYears || 0;
                const isInRange = selectedRanges.some(([min, max]) => years >= min && years <= max);
                if (!isInRange) return false;
            }

            return true;
        });

        return filtered.sort((a, b) => {
            if (b.performanceScore !== a.performanceScore) {
                return b.performanceScore - a.performanceScore;
            }
            return (a.jobCategory || '').localeCompare(b.jobCategory || '');
        });
    }, [candidates, filters, t]);

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (actionsRef.current && !actionsRef.current.contains(event.target as Node)) {
                setIsActionsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleResetClick = () => {
        if (confirmReset) {
            onReset();
            setConfirmReset(false);
        } else {
            setConfirmReset(true);
            setTimeout(() => setConfirmReset(false), 3000);
        }
    };
    
    const formatLocationTick = (tick: string) => {
        if (!tick) return '';
        const parts = tick.split(',');
        const lastPart = parts[parts.length - 1].trim();
        const abbreviations: {[key: string]: string} = { 'United States': 'USA', 'United Kingdom': 'UK' };
        return abbreviations[lastPart] || lastPart;
    };

    const locationDistribution = React.useMemo(() => {
        return groupData(filteredCandidates.map(c => c.location), t);
    }, [filteredCandidates, t]);

    const jobCategoryDistribution = React.useMemo(() => {
        const validData = filteredCandidates.map(c => c.jobCategory).filter(item => item && item.trim() && item.trim() !== 'N/A');
        const freqMap = validData.reduce((acc: Record<string, number>, item) => {
            const key = item.trim();
            acc[key] = (acc[key] || 0) + 1;
            return acc;
        }, {});
        return Object.entries(freqMap).map(([name, value]) => ({ name: shortenJobCategory(name), value }));
    }, [filteredCandidates]);
    
    const experienceDistribution = React.useMemo(() => {
        const buckets = { [t('dashboard.exp_buckets.junior')]: 0, [t('dashboard.exp_buckets.confirmed')]: 0, [t('dashboard.exp_buckets.senior')]: 0, [t('dashboard.exp_buckets.expert')]: 0, };
        filteredCandidates.forEach(c => {
            const years = c.totalExperienceYears || 0;
            if (years <= 2) buckets[t('dashboard.exp_buckets.junior')]++;
            else if (years <= 5) buckets[t('dashboard.exp_buckets.confirmed')]++;
            else if (years <= 10) buckets[t('dashboard.exp_buckets.senior')]++;
            else buckets[t('dashboard.exp_buckets.expert')]++;
        });
        return Object.entries(buckets).map(([name, count]) => ({ name, count }));
    }, [filteredCandidates, t]);
    
     const performanceByJobCategory = React.useMemo(() => {
        const dataToProcess = filteredCandidates.filter(c => c.jobCategory && c.jobCategory.trim() && c.jobCategory !== 'N/A');

        const categoryScores: Record<string, { totalScore: number, count: number }> = dataToProcess.reduce((acc, candidate) => {
            const category = candidate.jobCategory;
            if (!acc[category]) acc[category] = { totalScore: 0, count: 0 };
            acc[category].totalScore += candidate.performanceScore || 0;
            acc[category].count++;
            return acc;
        }, {} as Record<string, { totalScore: number, count: number }>);

        return Object.entries(categoryScores).map(([name, data]) => ({
            name: shortenJobCategory(name), averageScore: data.count > 0 ? Math.round(data.totalScore / data.count) : 0
        })).sort((a, b) => b.averageScore - a.averageScore);
    }, [filteredCandidates]);

    const aggregatedSkillsExpertise = React.useMemo(() => {
        const skillMap: Record<string, number> = {};
    
        filteredCandidates.forEach(candidate => {
            if (!candidate.skills?.hard || candidate.skills.hard.length === 0) {
                return;
            }
    
            const experienceText = (candidate.experience || [])
                .map(exp => `${exp.title || ''} ${exp.description || ''}`)
                .join(' ')
                .toLowerCase();
    
            candidate.skills.hard.forEach(skill => {
                const skillLower = skill.toLowerCase();
                if (!skillLower) return;
                try {
                    const skillRegex = new RegExp(`\\b${skillLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g');
                    const countInExperience = (experienceText.match(skillRegex) || []).length;
                    
                    const expertiseScore = 1 + countInExperience;
        
                    skillMap[skill] = (skillMap[skill] || 0) + expertiseScore;
                } catch (e) {
                    console.warn(`Could not create regex for skill: "${skillLower}"`, e);
                }
            });
        });
    
        return Object.entries(skillMap)
            .map(([name, expertise]) => ({ name, expertise }))
            .sort((a, b) => b.expertise - a.expertise)
            .slice(0, 15);
    }, [filteredCandidates]);
    
    if (candidates.length === 0 && !isFavoritesView) {
        return (
            <div className="p-4 sm:p-8 space-y-8">
                <header>
                    <h2 className="text-3xl font-bold font-display text-gray-800 dark:text-gray-100">{t('dashboard.title')}</h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">{t('dashboard.subtitle')}</p>
                </header>
                <div className="flex flex-col items-center justify-center min-h-[calc(100vh-15rem)] text-center -mt-8">
                    <input type="file" ref={importInputRef} onChange={handleFileImport} accept=".csv,.json" className="hidden" />
                    <dotlottie-wc
                        src="https://lottie.host/89c66344-281d-4450-91d3-4574a47fec47/31ogoyP4Mh.lottie"
                        autoplay
                        loop
                        style={{ width: '200px', height: '200px' }}
                    ></dotlottie-wc>
                    <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">{t('dashboard.no_cv_analyzed')}</p>
                    <div className="mt-6">
                        <button onClick={handleImportClick} className="flex items-center justify-center gap-2 bg-gradient-button text-white font-semibold px-6 py-3 rounded-full hover:opacity-90 transition-opacity">
                            <Icon name="upload" className="w-6 h-6" />
                            <span>{t('common.import')}</span>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const exportToCsv = () => {
        const headers = ['Name', 'Email', 'Phone', 'Location', 'Job Category', 'Current Title', 'Experience Years', 'Performance Score', 'Hard Skills', 'Soft Skills'];
        const rows = filteredCandidates.map(c => [
            `"${c.name || ''}"`,
            `"${c.email || ''}"`,
            `"${c.phone || ''}"`,
            `"${c.location || ''}"`,
            `"${c.jobCategory || ''}"`,
            `"${c.experience?.[0]?.title || ''}"`,
            c.totalExperienceYears || 0,
            c.performanceScore || 0,
            `"${(c.skills.hard || []).join(', ')}"`,
            `"${(c.skills.soft || []).join(', ')}"`
        ].join(','));
        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "candidates_export.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setIsActionsOpen(false);
    };
    
    const exportToJson = () => {
        const jsonString = JSON.stringify(filteredCandidates, null, 2);
        const blob = new Blob([jsonString], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", "candidates_export.json");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        setIsActionsOpen(false);
    };

    const activeFilterCount = filters.jobCategories.length + filters.locations.length + filters.experienceLevels.length + filters.skills.length;

    return (
        <div>
            <FilterView
                isOpen={isFilterViewOpen}
                onClose={() => setIsFilterViewOpen(false)}
                onApply={setFilters}
                candidates={candidates}
                currentFilters={filters}
            />
            <header className={`sticky top-0 z-20 bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-sm px-4 sm:px-8 py-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b dark:border-gray-800 transition-transform duration-300 ${showBars ? 'translate-y-0' : '-translate-y-full sm:translate-y-0'}`}>
                <div>
                    <h2 className="text-3xl font-bold font-display text-gray-800 dark:text-gray-100">{isFavoritesView ? t('dashboard.favorites_title') : t('dashboard.title')}</h2>
                    {!isFavoritesView && <p className="text-gray-500 dark:text-gray-400 mt-1 hidden sm:block">{t('dashboard.subtitle')}</p>}
                </div>
                {!isFavoritesView && (
                 <div className="w-full sm:w-auto flex justify-between items-center gap-2 rtl:flex-row-reverse">
                    <div className="relative">
                        <button onClick={() => setIsFilterViewOpen(true)} title={t('dashboard.filter_by_job')} className="relative flex items-center justify-center gap-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-200 font-semibold px-3 sm:px-4 py-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                            <Icon name="filter" className="w-5 h-5"/>
                            <span>{t('dashboard.filter_by_job')}</span>
                            {activeFilterCount > 0 && <span className="absolute -top-1 -right-1 rtl:-right-auto rtl:-left-1 bg-primary-600 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">{activeFilterCount}</span>}
                        </button>
                    </div>

                    <div className="hidden lg:flex items-center gap-2">
                        <button onClick={() => handleScrollTo(graphsRef)} className="bg-gray-900 text-white font-semibold py-2 px-4 rounded-full hover:bg-gray-700 transition-colors items-center gap-2 flex">
                            <Icon name="dashboard" className="w-5 h-5"/>
                            <span>{t('dashboard.quick_nav.graphs')}</span>
                        </button>
                        <button onClick={() => handleScrollTo(profilesRef)} className="bg-gray-900 text-white font-semibold py-2 px-4 rounded-full hover:bg-gray-700 transition-colors items-center gap-2 flex">
                            <Icon name="users" className="w-5 h-5"/>
                            <span>{t('dashboard.quick_nav.profiles')}</span>
                        </button>
                    </div>
                    
                    <input type="file" ref={importInputRef} onChange={handleFileImport} accept=".csv,.json" className="hidden" />
                    
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <button onClick={handleResetClick} title={t('common.reset')} className={`flex items-center justify-center gap-2 font-semibold px-3 sm:px-4 py-2 rounded-full transition-colors ${
                                confirmReset 
                                ? 'bg-green-600 text-white hover:bg-green-700' 
                                : 'bg-red-600 text-white hover:bg-red-700'
                            }`}>
                                <Icon name="refresh-cw" className="w-5 h-5" />
                                <span className="hidden sm:inline">{confirmReset ? t('common.reset_confirm_action') : t('common.reset')}</span>
                            </button>
                            {confirmReset && (
                                <div className="absolute bottom-full right-0 rtl:right-auto rtl:left-0 mb-2 w-max max-w-xs bg-gray-900 text-white text-xs rounded py-2 px-3 opacity-100 transition-opacity pointer-events-none z-10 shadow-lg text-center dark:bg-gray-700">
                                    {t('common.reset_confirm')}
                                </div>
                            )}
                        </div>
                        <div className="relative" ref={actionsRef}>
                            <button onClick={() => setIsActionsOpen(prev => !prev)} title={t('common.actions')} className="flex items-center justify-center gap-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-200 font-semibold p-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                <Icon name="plus" className="w-5 h-5" />
                            </button>
                            {/* Desktop Dropdown */}
                            {isActionsOpen && (
                                <div className="hidden md:block absolute top-full right-0 rtl:right-auto rtl:left-0 mt-2 w-48 bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-lg shadow-xl z-10 py-1">
                                    <button onClick={handleImportClick} className="w-full text-left rtl:text-right flex items-center gap-3 p-3 text-sm hover:bg-gray-100 dark:hover:bg-gray-700">
                                        <Icon name="upload" className="w-5 h-5"/> {t('common.import')}
                                    </button>
                                    <button onClick={exportToCsv} className="w-full text-left rtl:text-right flex items-center gap-3 p-3 text-sm hover:bg-gray-100 dark:hover:bg-gray-700">
                                        <Icon name="export" className="w-5 h-5"/> {t('dashboard.export_as_csv')}
                                    </button>
                                    <button onClick={exportToJson} className="w-full text-left rtl:text-right flex items-center gap-3 p-3 text-sm hover:bg-gray-100 dark:hover:bg-gray-700">
                                        <Icon name="export" className="w-5 h-5"/> {t('dashboard.export_as_json')}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                )}
            </header>
            
            <div className="p-2 sm:p-8">
                {!isFavoritesView && (
                    <div className={`lg:hidden fixed bottom-20 left-0 right-0 w-full flex justify-center z-30 pointer-events-none transition-opacity duration-300 ${showBars ? 'opacity-100' : 'opacity-0'}`}>
                        <div className="flex gap-2 pointer-events-auto">
                            <button onClick={() => handleScrollTo(graphsRef)} className="bg-gray-900 text-white font-semibold py-2 px-4 rounded-full shadow-lg hover:bg-gray-700 transition-colors flex items-center gap-2">
                                <Icon name="dashboard" className="w-5 h-5"/>
                                <span>{t('dashboard.quick_nav.graphs')}</span>
                            </button>
                            <button onClick={() => handleScrollTo(profilesRef)} className="bg-gray-900 text-white font-semibold py-2 px-4 rounded-full shadow-lg hover:bg-gray-700 transition-colors flex items-center gap-2">
                                <Icon name="users" className="w-5 h-5"/>
                                <span>{t('dashboard.quick_nav.profiles')}</span>
                            </button>
                        </div>
                    </div>
                )}


                {!isFavoritesView && (
                <div ref={graphsRef} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border dark:border-gray-700 shadow-lg">
                        <div className="flex flex-wrap items-center justify-between w-full mb-4 gap-2">
                            <h3 className="font-semibold font-display text-lg">{t('dashboard.charts.perf_by_job')}</h3>
                        </div>
                        {performanceByJobCategory.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={performanceByJobCategory} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                    <defs>
                                        <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor="#ec4899" stopOpacity={0.8}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" tick={{fontSize: 12}} />
                                    <YAxis domain={[0, 100]}/>
                                    <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(236, 72, 153, 0.1)'}}/>
                                    <Bar dataKey="averageScore" fill="url(#colorScore)" name={t('dashboard.charts.avg_score')} barSize={50}>
                                    <LabelList dataKey="averageScore" position="top" style={{ fill: 'currentColor', fontSize: 12 }} />
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <EmptyChartState />
                        )}
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border dark:border-gray-700 shadow-lg">
                        <div className="flex flex-wrap items-center justify-between w-full mb-4 gap-2">
                            <h3 className="font-semibold font-display text-lg">{t('dashboard.charts.job_distribution')}</h3>
                        </div>
                        {jobCategoryDistribution.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={jobCategoryDistribution} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" tick={{fontSize: 12}} interval={0} />
                                    <YAxis allowDecimals={false} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend verticalAlign="top" height={36}/>
                                    <Line type="monotone" dataKey="value" name={t('dashboard.charts.num_cvs')} stroke={COLORS[0]} strokeWidth={2} activeDot={{ r: 8 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <EmptyChartState />
                        )}
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border dark:border-gray-700 shadow-lg">
                        <div className="flex flex-wrap items-center justify-between w-full mb-4 gap-2">
                            <h3 className="font-semibold font-display text-lg">{t('dashboard.charts.exp_distribution')}</h3>
                        </div>
                        {filteredCandidates.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={experienceDistribution} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                    <defs>
                                        <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0.8}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" tick={{fontSize: 12}}/>
                                    <YAxis allowDecimals={false} />
                                    <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(59, 130, 246, 0.1)'}}/>
                                    <Bar dataKey="count" fill="url(#colorExp)" name={t('dashboard.charts.candidates')} barSize={60}>
                                    <LabelList dataKey="count" position="top" style={{ fill: 'currentColor', fontSize: 12 }}/>
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <EmptyChartState />
                        )}
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border dark:border-gray-700 shadow-lg">
                        <div className="flex flex-wrap items-center justify-between w-full mb-4 gap-2">
                           <h3 className="font-semibold font-display text-lg">{t('dashboard.charts.location_distribution')}</h3>
                        </div>
                        {locationDistribution.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={locationDistribution} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                    <defs>
                                        <linearGradient id="colorLoc" x1="0" y1="0" x2="1" y2="0">
                                            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0.8}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                    <XAxis type="number" allowDecimals={false} />
                                    <YAxis type="category" dataKey="name" width={80} tick={{fontSize: 12}} interval={0} tickFormatter={formatLocationTick} />
                                    <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(245, 158, 11, 0.1)'}}/>
                                    <Bar dataKey="value" fill="url(#colorLoc)" name={t('dashboard.charts.num_cvs')} barSize={30}>
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <EmptyChartState />
                        )}
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border dark:border-gray-700 shadow-lg lg:col-span-2">
                        <div className="flex flex-wrap items-center justify-between w-full mb-4 gap-2">
                            <h3 className="font-semibold font-display text-lg">{t('dashboard.charts.aggregated_skills_expertise')}</h3>
                        </div>
                        {aggregatedSkillsExpertise.length > 0 ? (
                            <ResponsiveContainer width="100%" height={400}>
                                <BarChart data={aggregatedSkillsExpertise} layout="vertical" margin={{ top: 5, right: 40, left: 20, bottom: 5 }}>
                                    <defs>
                                        <linearGradient id="colorSkill" x1="0" y1="0" x2="1" y2="0">
                                            <stop offset="5%" stopColor="#ec4899" stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor="#F857A6" stopOpacity={0.8}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                    <XAxis type="number" allowDecimals={false} />
                                    <YAxis type="category" dataKey="name" width={120} tick={{fontSize: 12}} interval={0} />
                                    <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(236, 72, 153, 0.1)'}}/>
                                    <Bar dataKey="expertise" fill="url(#colorSkill)" name={t('detail.expertise_score')} barSize={20}>
                                        <LabelList dataKey="expertise" position="right" style={{ fill: 'currentColor', fontSize: 12 }}/>
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <EmptyChartState />
                        )}
                    </div>
                </div>
                )}

                <div ref={profilesRef} className="mt-8 pb-24 lg:pb-0">
                    <h3 className="text-lg font-semibold font-display text-gray-500 dark:text-gray-400 mb-4">{t('dashboard.candidate_profiles', {count: filteredCandidates.length})}</h3>
                    {filteredCandidates.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredCandidates.map(candidate => {
                                const isInCompare = comparisonList.includes(candidate.id);
                                const isInPipeline = pipelineCandidateIds.includes(candidate.id);
                                return (
                                    <CandidateCard 
                                        key={candidate.id} 
                                        candidate={candidate} 
                                        onSelect={() => onSelectCandidate(candidate)} 
                                        isFavorite={favorites.includes(candidate.id)}
                                        onToggleFavorite={(e) => { e.stopPropagation(); onToggleFavorite(candidate.id); }}
                                        isInCompare={isInCompare}
                                        isCompareDisabled={!isInCompare && comparisonList.length >= 2}
                                        onToggleCompare={(e) => { e.stopPropagation(); onToggleCompare(candidate.id); }}
                                        isInPipeline={isInPipeline}
                                        onTogglePipeline={(e) => { e.stopPropagation(); onTogglePipeline(candidate.id); }}
                                    />
                                );
                            })}
                        </div>
                    ) : (
                        isFavoritesView && (
                            <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center">
                                <dotlottie-wc
                                    src="https://lottie.host/89c66344-281d-4450-91d3-4574a47fec47/31ogoyP4Mh.lottie"
                                    autoplay
                                    loop
                                    style={{ width: '200px', height: '200px' }}
                                ></dotlottie-wc>
                                <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">{t('dashboard.no_favorites')}</p>
                            </div>
                        )
                    )}
                </div>
            </div>

             {/* Mobile Actions Drawer */}
             <div className="md:hidden">
                <Drawer 
                    isOpen={isActionsOpen} 
                    onClose={() => setIsActionsOpen(false)} 
                    title={t('common.actions')}
                >
                    <div className="flex flex-col gap-2">
                        <button onClick={handleImportClick} className="w-full text-left flex items-center gap-3 p-4 text-base bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                            <Icon name="upload" className="w-5 h-5"/> {t('common.import')}
                        </button>
                        <button onClick={exportToCsv} className="w-full text-left flex items-center gap-3 p-4 text-base bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                            <Icon name="export" className="w-5 h-5"/> {t('dashboard.export_as_csv')}
                        </button>
                        <button onClick={exportToJson} className="w-full text-left flex items-center gap-3 p-4 text-base bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                            <Icon name="export" className="w-5 h-5"/> {t('dashboard.export_as_json')}
                        </button>
                    </div>
                </Drawer>
            </div>
        </div>
    )
}
