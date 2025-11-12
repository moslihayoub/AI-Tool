// FIX: Changed to default react import and updated hooks usage to resolve JSX intrinsic element type errors.
import * as React from 'react';
import { CandidateProfile } from '../types';
import { Icon } from './icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList, LineChart, Line } from 'recharts';
import { useTranslation } from '../i18n';

interface DashboardViewProps {
  candidates: CandidateProfile[];
  onSelectCandidate: (candidate: CandidateProfile) => void;
  onReset: () => void;
  setSearchQuery: (query: string) => void;
  favorites: string[];
  onToggleFavorite: (candidateId: string) => void;
  isFavoritesView?: boolean;
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

const CandidateCard: React.FC<{ candidate: CandidateProfile; onSelect: () => void; isFavorite: boolean; onToggleFavorite: (e: React.MouseEvent) => void; }> = ({ candidate, onSelect, isFavorite, onToggleFavorite }) => {
    const { t } = useTranslation();
    
    return (
        <div onClick={onSelect} className={`relative bg-white dark:bg-gray-800 p-5 rounded-xl border shadow-md hover:shadow-xl hover:border-primary-500 cursor-pointer transition-all hover:scale-105 duration-200 flex flex-col justify-between min-h-[190px] ${isFavorite ? 'ring-2 ring-secondary-500 dark:ring-secondary-400' : 'dark:border-gray-700'}`}>
            <div>
                <h3 className="font-bold text-lg text-primary-700 dark:text-primary-300">{candidate.name && candidate.name !== 'N/A' ? candidate.name : t('common.name_not_available')}</h3>
                
                <div className="flex justify-between items-center mt-2">
                     <button 
                        onClick={onToggleFavorite} 
                        className="p-1.5 rounded-full hover:bg-secondary-100 dark:hover:bg-gray-700 transition-colors z-10"
                        title={isFavorite ? t('detail.remove_from_favorites') : t('detail.add_to_favorites')}
                        aria-label="Toggle favorite"
                    >
                        <Icon name="heart" className={`w-6 h-6 ${isFavorite ? 'fill-secondary-500 text-secondary-500' : 'text-gray-400'}`} />
                    </button>

                    <div className="flex items-center gap-2 flex-shrink-0">
                        {isProfileIncomplete(candidate) && (
                            <div className="group relative flex items-center">
                                <Icon name="alert-triangle" className="w-5 h-5 text-yellow-500" />
                                <span className="absolute bottom-full right-0 mb-2 w-48 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 text-center">
                                    {t('dashboard.incomplete_profile_tooltip')}
                                </span>
                            </div>
                        )}
                         <div className="flex items-center gap-1.5">
                           <span className="text-2xl">{getScoreEmoji(candidate.performanceScore)}</span>
                           <span className={`text-sm font-bold px-3 py-1 rounded-full ${candidate.performanceScore > 75 ? 'bg-green-100 text-green-800' : candidate.performanceScore > 50 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                             {candidate.performanceScore || 0}/100
                           </span>
                        </div>
                    </div>
                </div>

                <p className="text-base text-gray-600 dark:text-gray-400 truncate mt-2">{candidate.jobCategory && candidate.jobCategory !== 'N/A' ? candidate.jobCategory : t('common.category_not_available')}</p>
                <div className="text-base text-gray-500 dark:text-gray-400 flex items-center justify-between mt-1">
                  <span className="truncate pr-2">{candidate.location && candidate.location !== 'N/A' ? candidate.location : t('common.location_not_available')}</span>
                  <span className="font-medium flex-shrink-0">{t('dashboard.experience_years', {count: candidate.totalExperienceYears || 0})}</span>
                </div>
            </div>
            <div className="mt-4">
                <div className="flex flex-wrap gap-2">
                    {(candidate.skills.hard || []).slice(0, 3).map(skill => (
                        <span key={skill} className="text-sm bg-gradient-to-r from-primary-600 to-fuchsia-500 text-white px-3 py-1 rounded-full shadow-sm">{skill}</span>
                    ))}
                </div>
                {candidate.analysisDuration && <p className="text-xs text-right text-gray-400 mt-2">{t('common.analyzed_in', {duration: (candidate.analysisDuration / 1000).toFixed(1)})}</p>}
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
                <p className="font-bold">{label || payload[0].name}</p>
                <p className="text-sm" style={{ color: payload[0].stroke || payload[0].fill || payload[0].props?.fill }}>{`${payload[0].name}: ${payload[0].value}`}</p>
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

export const DashboardView: React.FC<DashboardViewProps> = ({ candidates, onSelectCandidate, onReset, favorites, onToggleFavorite, isFavoritesView = false }) => {
    const { t } = useTranslation();
    const [selectedJobCategories, setSelectedJobCategories] = React.useState<string[]>([]);
    const [isFilterOpen, setIsFilterOpen] = React.useState(false);
    const [confirmReset, setConfirmReset] = React.useState(false);
    const filterRef = React.useRef<HTMLDivElement>(null);

    const allJobCategories = React.useMemo(() => {
        const categories = new Set(candidates.map(c => c.jobCategory).filter(c => c && c !== 'N/A'));
        return Array.from(categories).sort();
    }, [candidates]);

    const filteredCandidates = React.useMemo(() => {
        const filtered = selectedJobCategories.length === 0
            ? candidates
            : candidates.filter(c => c.jobCategory && selectedJobCategories.includes(c.jobCategory));

        return filtered.sort((a, b) => {
            if (b.performanceScore !== a.performanceScore) {
                return b.performanceScore - a.performanceScore;
            }
            return (a.jobCategory || '').localeCompare(b.jobCategory || '');
        });
    }, [candidates, selectedJobCategories]);

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
                setIsFilterOpen(false);
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
    
    const handleCategoryToggle = (category: string) => {
        setSelectedJobCategories(prev =>
            prev.includes(category)
                ? prev.filter(c => c !== category)
                : [...prev, category]
        );
    };

    const locationDistribution = React.useMemo(() => groupData(filteredCandidates.map(c => c.location), t), [filteredCandidates, t]);
    const jobCategoryDistribution = React.useMemo(() => {
        const validData = filteredCandidates.map(c => c.jobCategory).filter(item => item && item.trim() && item.trim() !== 'N/A');
        const freqMap = validData.reduce((acc: Record<string, number>, item) => {
            const key = item.trim();
            acc[key] = (acc[key] || 0) + 1;
            return acc;
        }, {});
        return Object.entries(freqMap).map(([name, value]) => ({ name, value }));
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
        const validCandidates = filteredCandidates.filter(c => c.jobCategory && c.jobCategory.trim() && c.jobCategory !== 'N/A');
        const categoryScores: Record<string, { totalScore: number, count: number }> = validCandidates.reduce((acc, candidate) => {
            const category = candidate.jobCategory;
            if (!acc[category]) acc[category] = { totalScore: 0, count: 0 };
            acc[category].totalScore += candidate.performanceScore || 0;
            acc[category].count++;
            return acc;
        }, {} as Record<string, { totalScore: number, count: number }>);

        return Object.entries(categoryScores).map(([name, data]) => ({
            name, averageScore: data.count > 0 ? Math.round(data.totalScore / data.count) : 0
        })).sort((a, b) => b.averageScore - a.averageScore);
    }, [filteredCandidates]);

    if (candidates.length === 0 && !isFavoritesView) {
        return (
            <div className="p-4 sm:p-8 space-y-8">
                <header>
                    <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">{t('dashboard.title')}</h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">{t('dashboard.subtitle')}</p>
                </header>
                <div className="flex flex-col items-center justify-center min-h-[calc(100vh-15rem)] text-center">
                    <dotlottie-wc
                        src="https://lottie.host/89c66344-281d-4450-91d3-4574a47fec47/31ogoyP4Mh.lottie"
                        autoplay
                        loop
                        style={{ width: '200px', height: '200px' }}
                    ></dotlottie-wc>
                    <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">{t('dashboard.no_cv_analyzed')}</p>
                </div>
            </div>
        );
    }

    const exportToCsv = () => {
        const headers = ['Name', 'Email', 'Phone', 'Location', 'Job Category', 'Experience Years', 'Performance Score', 'Hard Skills', 'Soft Skills'];
        const rows = filteredCandidates.map(c => [
            `"${c.name}"`, `"${c.email}"`, `"${c.phone}"`, `"${c.location}"`, `"${c.jobCategory}"`, c.totalExperienceYears, c.performanceScore,
            `"${c.skills.hard.join(', ')}"`, `"${c.skills.soft.join(', ')}"`
        ].join(','));
        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "candidates_export.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="p-4 sm:p-8 space-y-8">
            <header className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">{isFavoritesView ? t('dashboard.favorites_title') : t('dashboard.title')}</h2>
                    {!isFavoritesView && <p className="text-gray-500 dark:text-gray-400 mt-1">{t('dashboard.subtitle')}</p>}
                </div>
                {!isFavoritesView && (
                 <div className="flex items-center gap-2">
                    <div className="relative" ref={filterRef}>
                        <button onClick={() => setIsFilterOpen(!isFilterOpen)} className="flex items-center gap-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 font-semibold px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors w-56 justify-between">
                            <span className="truncate">
                                {selectedJobCategories.length === 0
                                    ? t('dashboard.filter_by_job')
                                    : t('dashboard.jobs_selected', { count: selectedJobCategories.length })}
                            </span>
                            <Icon name="chevron-down" className={`w-5 h-5 transition-transform duration-200 ${isFilterOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {isFilterOpen && (
                            <div className="absolute top-full mt-2 w-56 bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-lg shadow-xl z-10">
                                <div className="max-h-60 overflow-y-auto">
                                    {allJobCategories.map(category => (
                                        <label key={category} className="flex items-center p-3 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:bg-gray-900 dark:border-gray-600"
                                                checked={selectedJobCategories.includes(category)}
                                                onChange={() => handleCategoryToggle(category)}
                                            />
                                            <span className="ml-3 text-gray-700 dark:text-gray-300 truncate">{category}</span>
                                        </label>
                                    ))}
                                </div>
                                {selectedJobCategories.length > 0 && (
                                    <div className="p-2 border-t dark:border-gray-700">
                                        <button
                                            onClick={() => {
                                                setSelectedJobCategories([]);
                                                setIsFilterOpen(false);
                                            }}
                                            className="w-full text-center text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline focus:outline-none"
                                        >
                                            {t('dashboard.clear_filters')}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    <button onClick={exportToCsv} className="flex items-center gap-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 font-semibold px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                        <Icon name="export" className="w-5 h-5" /> {t('common.export')}
                    </button>
                    <div className="relative">
                        <button onClick={handleResetClick} className={`flex items-center gap-2 font-semibold px-4 py-2 rounded-lg transition-colors ${
                            confirmReset 
                            ? 'bg-yellow-500 text-white hover:bg-yellow-600' 
                            : 'bg-red-600 text-white hover:bg-red-700'
                        }`}>
                            <Icon name="refresh-cw" className="w-5 h-5" />
                            {confirmReset ? t('common.reset_confirm_action') : t('common.reset')}
                        </button>
                        {confirmReset && (
                            <div className="absolute bottom-full right-0 mb-2 w-max max-w-xs bg-gray-900 text-white text-xs rounded py-2 px-3 opacity-100 transition-opacity pointer-events-none z-10 shadow-lg text-center dark:bg-gray-700">
                                {t('common.reset_confirm')}
                            </div>
                        )}
                    </div>
                </div>
                )}
            </header>

            {!isFavoritesView && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                 <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border dark:border-gray-700 shadow-lg">
                    <h3 className="font-semibold mb-4 text-lg">{t('dashboard.charts.perf_by_job')}</h3>
                    {performanceByJobCategory.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={performanceByJobCategory} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
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
                                <Bar dataKey="averageScore" fill="url(#colorScore)" name={t('dashboard.charts.avg_score')} barSize={40}>
                                <LabelList dataKey="averageScore" position="top" style={{ fill: 'currentColor' }} />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <EmptyChartState />
                    )}
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border dark:border-gray-700 shadow-lg">
                    <h3 className="font-semibold mb-4 text-lg">{t('dashboard.charts.job_distribution')}</h3>
                    {jobCategoryDistribution.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={jobCategoryDistribution} margin={{ top: 5, right: 20, left: 10, bottom: 60 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" tick={{fontSize: 12}} angle={-45} textAnchor="end" interval={0} height={70}/>
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
                    <h3 className="font-semibold mb-4 text-lg">{t('dashboard.charts.exp_distribution')}</h3>
                    {filteredCandidates.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={experienceDistribution} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                                <defs>
                                    <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.8}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" tick={{fontSize: 12}}/>
                                <YAxis />
                                <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(59, 130, 246, 0.1)'}}/>
                                <Bar dataKey="count" fill="url(#colorExp)" name={t('dashboard.charts.candidates')} barSize={60}>
                                <LabelList dataKey="count" position="top" style={{ fill: 'currentColor' }}/>
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <EmptyChartState />
                    )}
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border dark:border-gray-700 shadow-lg">
                    <h3 className="font-semibold mb-4 text-lg">{t('dashboard.charts.location_distribution')}</h3>
                    {locationDistribution.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={locationDistribution} layout="vertical" margin={{ top: 5, right: 30, left: 50, bottom: 5 }}>
                                <defs>
                                    <linearGradient id="colorLoc" x1="0" y1="0" x2="1" y2="0">
                                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0.8}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                <XAxis type="number" />
                                <YAxis type="category" dataKey="name" width={100} tick={{fontSize: 12}} />
                                <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(245, 158, 11, 0.1)'}}/>
                                <Bar dataKey="value" fill="url(#colorLoc)" name={t('dashboard.charts.num_cvs')} barSize={25}>
                                    <LabelList dataKey="value" position="right" style={{ fill: 'currentColor' }}/>
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <EmptyChartState />
                    )}
                </div>
            </div>
            )}

            <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-500 dark:text-gray-400 mb-4">{t('dashboard.candidate_profiles', {count: filteredCandidates.length})}</h3>
                 {filteredCandidates.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredCandidates.map(candidate => (
                            <CandidateCard 
                                key={candidate.id} 
                                candidate={candidate} 
                                onSelect={() => onSelectCandidate(candidate)} 
                                isFavorite={favorites.includes(candidate.id)}
                                onToggleFavorite={(e) => { e.stopPropagation(); onToggleFavorite(candidate.id); }}
                            />
                        ))}
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
    )
}