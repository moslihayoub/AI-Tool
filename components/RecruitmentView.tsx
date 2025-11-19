
import * as React from 'react';
import { CandidateProfile, RecruitmentData } from '../types';
import { useTranslation } from '../i18n';
import { Icon } from './icons';
import { useToast } from './Toast';
import { Drawer } from './Drawer';

interface RecruitmentViewProps {
    candidates: CandidateProfile[];
    recruitmentData: RecruitmentData[];
    onUpdateRecruitmentData: (data: RecruitmentData) => void;
    onSelectCandidate: (candidate: CandidateProfile) => void;
    onTogglePipeline: (candidateId: string) => void;
    onSaveSnapshot: () => void;
    lastSnapshotId?: string | null;
}

const getScoreClass = (score: number) => {
    if (score > 75) return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    if (score > 50) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
    return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
};

const getScoreEmoji = (score: number): string => {
    if (score >= 90) return '🤩';
    if (score >= 70) return '😜';
    if (score >= 50) return '😅';
    if (score >= 30) return '🤬';
    if (score >= 10) return '😭';
    return '';
};

const ToggleSwitch = ({ checked, onChange, title }: { checked: boolean; onChange: (checked: boolean) => void, title?: string }) => (
    <button
        type="button"
        role="switch"
        aria-checked={checked}
        title={title}
        onClick={() => onChange(!checked)}
        className={`${
            checked ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-600'
        } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900`}
    >
        <span
            className={`${
                checked ? 'translate-x-6' : 'translate-x-1'
            } inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm`}
        />
    </button>
);

const getStatus = (data: RecruitmentData): string => {
    // 1. Manual Hired Override (explicit Start Date)
    if (data.startDate) return 'hired';

    // 2. Evaluation Logic
    const results = [data.interview1Result, data.interview2Result].filter(r => !!r);
    const resultCount = results.length;

    // Critical Step Check: Fair in Interview 2 -> Selected
    if (data.interview2Result === 'Fair') {
        return 'selected';
    }

    if (resultCount > 0) {
        const excellentCount = results.filter(r => r === 'Excellent').length;
        const goodCount = results.filter(r => r === 'Good').length;

        // Majority Excellent -> Hired
        if (excellentCount > resultCount / 2) {
             return 'hired';
        }
        // Majority Good -> Approved
        if (goodCount > resultCount / 2 || (excellentCount + goodCount === resultCount && resultCount > 0)) {
             return 'approved';
        }
    }

    // 3. Chronological Stage Fallback
    if (data.interview2Date) return 'interview2';
    if (data.challengeDoneDate) return 'challenge';
    if (data.interview1Date) return 'interview1';
    
    return 'application';
};

const StatusBadge = ({ status }: { status: string }) => {
    const { t } = useTranslation();
    const styles: Record<string, string> = {
        application: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
        interview1: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
        challenge: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
        interview2: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
        hired: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
        approved: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300',
        selected: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
    };

    return (
        <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase whitespace-nowrap ${styles[status] || styles.application}`}>
            {t(`recruitment.status.${status}`)}
        </span>
    );
};

export const RecruitmentView: React.FC<RecruitmentViewProps> = ({ candidates, recruitmentData, onUpdateRecruitmentData, onSelectCandidate, onTogglePipeline, onSaveSnapshot, lastSnapshotId }) => {
    const { t } = useTranslation();
    const { showToast } = useToast();
    const [jobFilter, setJobFilter] = React.useState<string>('all');
    const [isExportOpen, setIsExportOpen] = React.useState(false);
    const [isFilterDrawerOpen, setIsFilterDrawerOpen] = React.useState(false);
    const exportRef = React.useRef<HTMLDivElement>(null);

    // Mobile Drawer State
    const [activeDrawer, setActiveDrawer] = React.useState<{ type: 'interview1' | 'interview2', candidateId: string } | null>(null);

    // Get today's date in YYYY-MM-DD format to disable past dates
    const today = new Date().toISOString().split('T')[0];

    // Merge recruitment data with candidates, filtering only those in the pipeline
    const pipelineData = React.useMemo(() => {
        return recruitmentData.map(data => {
            const profile = candidates.find(c => c.id === data.candidateId);
            if (!profile) return null;
            return { ...data, profile };
        }).filter(Boolean) as (RecruitmentData & { profile: CandidateProfile })[];
    }, [candidates, recruitmentData]);

    const filteredData = React.useMemo(() => {
        if (jobFilter === 'all') return pipelineData;
        return pipelineData.filter(item => item.profile.jobCategory === jobFilter);
    }, [pipelineData, jobFilter]);

    const allJobCategories = React.useMemo(() => {
        return [...new Set(pipelineData.map(item => item.profile.jobCategory).filter(Boolean))].sort();
    }, [pipelineData]);

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (exportRef.current && !exportRef.current.contains(event.target as Node)) {
                setIsExportOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const validateDateOrder = (currentData: RecruitmentData, field: keyof RecruitmentData, newValue: string): boolean => {
        if (!newValue) return true; // Clearing a date is always allowed

        const dates = {
            applicationDate: field === 'applicationDate' ? newValue : currentData.applicationDate,
            interview1Date: field === 'interview1Date' ? newValue : currentData.interview1Date,
            challengeSentDate: field === 'challengeSentDate' ? newValue : currentData.challengeSentDate,
            interview2Date: field === 'interview2Date' ? newValue : currentData.interview2Date,
            startDate: field === 'startDate' ? newValue : currentData.startDate
        };

        // Check order: App < Int1 < Chal < Int2 < Start
        // Only check if both dates in a pair exist
        if (dates.applicationDate && dates.interview1Date && dates.applicationDate > dates.interview1Date) return false;
        if (dates.interview1Date && dates.challengeSentDate && dates.interview1Date > dates.challengeSentDate) return false;
        if (dates.challengeSentDate && dates.interview2Date && dates.challengeSentDate > dates.interview2Date) return false;
        if (dates.interview2Date && dates.startDate && dates.interview2Date > dates.startDate) return false;
        
        // Also check transitive properties if intermediate steps are missing
        const sequence = [dates.applicationDate, dates.interview1Date, dates.challengeSentDate, dates.interview2Date, dates.startDate].filter(Boolean);
        for (let i = 0; i < sequence.length - 1; i++) {
            if (sequence[i] > sequence[i+1]) return false;
        }

        return true;
    };

    const handleDateChange = (candidateId: string, field: keyof RecruitmentData, value: string) => {
        const current = pipelineData.find(p => p.candidateId === candidateId);
        if (current) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { profile, ...dataToSave } = current;
            
            if (!validateDateOrder(dataToSave, field, value)) {
                showToast(t('recruitment.date_error'), 'error');
                return;
            }

            onUpdateRecruitmentData({ ...dataToSave, [field]: value });
        }
    };

    const handleResultChange = (candidateId: string, field: keyof RecruitmentData, value: string) => {
        const current = pipelineData.find(p => p.candidateId === candidateId);
         if (current) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
             const { profile, ...dataToSave } = current;
             onUpdateRecruitmentData({ ...dataToSave, [field]: value });
         }
    };

    const exportToCsv = () => {
        const headers = ['Name', 'Job Category', 'Performance Score', 'Experience', 'Location', 'Status', 'App Date', 'Interview 1', 'Result 1', 'Challenge Sent', 'Challenge Done', 'Interview 2', 'Result 2', 'Start Date'];
        const rows = filteredData.map(d => [
            `"${d.profile.name}"`,
            `"${d.profile.jobCategory}"`,
            d.profile.performanceScore,
            d.profile.totalExperienceYears,
            `"${d.profile.location}"`,
            getStatus(d),
            d.applicationDate,
            d.interview1Date,
            d.interview1Result,
            d.challengeSentDate,
            d.challengeDoneDate ? 'Yes' : 'No',
            d.interview2Date,
            d.interview2Result,
            d.startDate
        ].join(','));
        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "recruitment_pipeline.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setIsExportOpen(false);
    };
    
    const exportToJson = () => {
        const jsonString = JSON.stringify(filteredData, null, 2);
        const blob = new Blob([jsonString], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", "recruitment_pipeline.json");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        setIsExportOpen(false);
    };

    const resultOptions = [
        { value: '', label: '-', color: 'bg-white text-gray-500 border-gray-300 dark:bg-gray-700 dark:text-gray-400 dark:border-gray-600' },
        { value: 'Excellent', label: t('recruitment.results.excellent'), color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' },
        { value: 'Good', label: t('recruitment.results.good'), color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' },
        { value: 'Fair', label: t('recruitment.results.fair'), color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' },
        { value: 'Medium', label: t('recruitment.results.medium'), color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-700' },
    ];

    if (pipelineData.length === 0) {
         return (
            <div className="p-4 sm:p-8 text-center flex flex-col items-center justify-center h-full">
                <dotlottie-wc
                    src="https://lottie.host/89c66344-281d-4450-91d3-4574a47fec47/31ogoyP4Mh.lottie"
                    autoplay
                    loop
                    style={{ width: '200px', height: '200px' }}
                ></dotlottie-wc>
                <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">{t('recruitment.empty')}</p>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-8 space-y-6 h-full flex flex-col">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold font-display text-gray-800 dark:text-gray-100">{t('recruitment.title')}</h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">{t('recruitment.subtitle')}</p>
                </div>
                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                    <div className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 w-full sm:w-auto">
                        <span className="text-sm font-semibold text-gray-600 dark:text-gray-300 whitespace-nowrap">{t('recruitment.filter_jobs')}:</span>
                        {/* Desktop Select */}
                        <select 
                            value={jobFilter} 
                            onChange={(e) => setJobFilter(e.target.value)}
                            className="hidden md:block bg-transparent text-gray-900 dark:text-gray-100 text-sm focus:outline-none max-w-[150px]"
                        >
                            <option value="all">{t('recruitment.all_jobs')}</option>
                            {allJobCategories.map(job => (
                                <option key={job} value={job}>{job}</option>
                            ))}
                        </select>
                        {/* Mobile Button for Drawer */}
                        <button 
                            onClick={() => setIsFilterDrawerOpen(true)}
                            className="md:hidden flex items-center justify-between gap-2 bg-transparent text-gray-900 dark:text-gray-100 text-sm font-medium w-full"
                        >
                            <span className="truncate max-w-[120px]">{jobFilter === 'all' ? t('recruitment.all_jobs') : jobFilter}</span>
                            <Icon name="chevron-down" className="w-4 h-4 text-gray-500" />
                        </button>
                    </div>
                    
                    <div className="relative w-full sm:w-auto" ref={exportRef}>
                        <button 
                            onClick={() => setIsExportOpen(!isExportOpen)} 
                            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                            <Icon name="download" className="w-5 h-5"/>
                            <span>{t('common.export')}</span>
                            <Icon name="chevron-down" className="w-4 h-4 ml-1"/>
                        </button>
                        {/* Desktop Dropdown */}
                        {isExportOpen && (
                            <div className="hidden md:block absolute top-full right-0 mt-2 w-40 bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-lg shadow-xl z-20 py-1">
                                <button onClick={exportToCsv} className="w-full text-left flex items-center gap-3 p-3 text-sm hover:bg-gray-100 dark:hover:bg-gray-700">
                                    <Icon name="export" className="w-4 h-4"/> CSV
                                </button>
                                <button onClick={exportToJson} className="w-full text-left flex items-center gap-3 p-3 text-sm hover:bg-gray-100 dark:hover:bg-gray-700">
                                    <Icon name="export" className="w-4 h-4"/> JSON
                                </button>
                            </div>
                        )}
                    </div>

                    <button 
                        onClick={onSaveSnapshot}
                        className={`w-full sm:w-auto flex items-center justify-center gap-2 text-white font-bold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity ${lastSnapshotId ? 'bg-green-600 hover:bg-green-700' : 'bg-gradient-button'}`}
                    >
                        <Icon name="save" className="w-5 h-5"/>
                        <span>{lastSnapshotId ? t('recruitment.update_pipeline') : t('recruitment.save_pipeline')}</span>
                    </button>
                </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block flex-1 overflow-x-auto bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700">
                <table className="w-full text-left border-collapse min-w-[1600px]">
                    <thead>
                        <tr className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-200 text-sm uppercase tracking-wider font-bold border-b border-gray-200 dark:border-gray-700">
                            <th className="p-4 w-36 border-b border-gray-200 dark:border-gray-700">{t('recruitment.table.app_date')}</th>
                            <th className="p-4 sticky left-0 bg-gray-50 dark:bg-gray-800 z-10 w-56 border-b border-gray-200 dark:border-gray-700 shadow-xl">{t('recruitment.table.name')}</th>
                            <th className="p-4 w-28 text-center border-b border-gray-200 dark:border-gray-700">{t('recruitment.table.score')}</th>
                            <th className="p-4 w-24 text-center border-b border-gray-200 dark:border-gray-700">{t('recruitment.table.experience')}</th>
                            <th className="p-4 w-36 border-b border-gray-200 dark:border-gray-700">{t('recruitment.table.location')}</th>
                            <th className="p-4 text-center bg-blue-50 dark:bg-blue-900/20 border-b border-gray-200 dark:border-gray-700" colSpan={2}>{t('recruitment.table.interview1')}</th>
                            <th className="p-4 text-center bg-purple-50 dark:bg-purple-900/20 border-b border-gray-200 dark:border-gray-700" colSpan={2}>{t('recruitment.table.challenge')}</th>
                            <th className="p-4 text-center bg-pink-50 dark:bg-pink-900/20 border-b border-gray-200 dark:border-gray-700" colSpan={2}>{t('recruitment.table.interview2')}</th>
                            <th className="p-4 w-36 border-b border-gray-200 dark:border-gray-700">{t('recruitment.table.start_date')}</th>
                            <th className="p-4 w-32 border-b border-gray-200 dark:border-gray-700">{t('recruitment.table.status')}</th>
                            <th className="p-4 w-20 text-center sticky right-0 bg-gray-50 dark:bg-gray-800 z-10 border-b border-gray-200 dark:border-gray-700 shadow-[-5px_0_10px_-5px_rgba(0,0,0,0.1)] dark:shadow-[-5px_0_10px_-5px_rgba(0,0,0,0.3)]">{t('recruitment.table.actions')}</th>
                        </tr>
                        <tr className="text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                            <th className="p-2"></th>
                            <th className="p-2 sticky left-0 bg-gray-50/50 dark:bg-gray-800/50 z-10"></th>
                            <th className="p-2"></th>
                            <th className="p-2"></th>
                            <th className="p-2"></th>
                            <th className="p-2 text-center bg-blue-50/50 dark:bg-blue-900/10">{t('common.dates_not_available')}</th>
                            <th className="p-2 text-center bg-blue-50/50 dark:bg-blue-900/10 w-40">{t('recruitment.table.result')}</th>
                            <th className="p-2 text-center bg-purple-50/50 dark:bg-purple-900/10">{t('recruitment.table.sent')}</th>
                            <th className="p-2 text-center bg-purple-50/50 dark:bg-purple-900/10">{t('recruitment.table.done')}</th>
                            <th className="p-2 text-center bg-pink-50/50 dark:bg-pink-900/10">{t('common.dates_not_available')}</th>
                            <th className="p-2 text-center bg-pink-50/50 dark:bg-pink-900/10 w-40">{t('recruitment.table.result')}</th>
                            <th className="p-2"></th>
                            <th className="p-2"></th>
                            <th className="p-2 sticky right-0 bg-gray-50/50 dark:bg-gray-800/50 z-10"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
                        {filteredData.map((row) => (
                            <tr key={row.candidateId} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                                <td className="p-4 text-sm text-gray-600 dark:text-gray-400">
                                    <input 
                                        type="date" 
                                        min={today}
                                        value={row.applicationDate} 
                                        onChange={(e) => handleDateChange(row.candidateId, 'applicationDate', e.target.value)}
                                        className="bg-transparent border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-gray-900 dark:text-gray-300 text-sm w-full focus:ring-1 focus:ring-primary-500"
                                    />
                                </td>
                                <td className="p-4 font-semibold text-gray-900 dark:text-gray-100 sticky left-0 bg-white dark:bg-gray-900 group-hover:bg-gray-50 dark:group-hover:bg-gray-800/50 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] dark:shadow-[2px_0_5px_-2px_rgba(0,0,0,0.3)]">
                                    <div className="flex flex-col">
                                        <span className="text-lg font-bold text-gray-900 dark:text-white">{row.profile.name}</span>
                                        <span className="text-sm font-bold text-primary-600 mt-0.5">{row.profile.jobCategory}</span>
                                    </div>
                                </td>
                                <td className="p-4 text-center">
                                     <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-base ${getScoreClass(row.profile.performanceScore)}`}>
                                        <span className="text-2xl leading-none">{getScoreEmoji(row.profile.performanceScore)}</span>
                                        <span>{row.profile.performanceScore}</span>
                                    </div>
                                </td>
                                <td className="p-4 text-center text-sm font-medium text-gray-600 dark:text-gray-300">
                                    {row.profile.totalExperienceYears}
                                </td>
                                <td className="p-4 text-sm text-gray-600 dark:text-gray-300 truncate max-w-[150px]" title={row.profile.location}>
                                    {row.profile.location}
                                </td>
                                
                                {/* Interview 1 */}
                                <td className="p-4 bg-blue-50/30 dark:bg-blue-900/10">
                                     <input 
                                        type="date" 
                                        min={today}
                                        value={row.interview1Date} 
                                        onChange={(e) => handleDateChange(row.candidateId, 'interview1Date', e.target.value)}
                                        className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-200 rounded px-3 py-2 text-sm w-full focus:outline-none focus:border-primary-500"
                                    />
                                </td>
                                <td className="p-4 bg-blue-50/30 dark:bg-blue-900/10">
                                    <div className="flex justify-center">
                                        <select 
                                            value={row.interview1Result} 
                                            onChange={(e) => handleResultChange(row.candidateId, 'interview1Result', e.target.value)}
                                            className={`appearance-none text-center font-bold border rounded-md px-2 py-2 text-sm w-full min-w-[140px] cursor-pointer focus:outline-none ${
                                                row.interview1Result === 'Excellent' ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-400 dark:border-green-700' :
                                                row.interview1Result === 'Good' ? 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/50 dark:text-blue-400 dark:border-blue-700' :
                                                row.interview1Result === 'Fair' ? 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-400 dark:border-yellow-700' :
                                                row.interview1Result === 'Medium' ? 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/50 dark:text-orange-400 dark:border-orange-700' :
                                                'bg-white text-gray-500 border-gray-300 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600'
                                            }`}
                                        >
                                            {resultOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                        </select>
                                    </div>
                                </td>

                                {/* Challenge */}
                                <td className="p-4 bg-purple-50/30 dark:bg-purple-900/10">
                                     <input 
                                        type="date" 
                                        min={today}
                                        value={row.challengeSentDate} 
                                        onChange={(e) => handleDateChange(row.candidateId, 'challengeSentDate', e.target.value)}
                                        className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-200 rounded px-3 py-2 text-sm w-full focus:outline-none focus:border-primary-500"
                                    />
                                </td>
                                <td className="p-4 bg-purple-50/30 dark:bg-purple-900/10 text-center">
                                    <div className="flex justify-center">
                                        <ToggleSwitch 
                                            checked={!!row.challengeDoneDate} 
                                            onChange={(checked) => handleDateChange(row.candidateId, 'challengeDoneDate', checked ? new Date().toISOString().split('T')[0] : '')}
                                            title={row.challengeDoneDate ? `Done on ${row.challengeDoneDate}` : 'Not done'}
                                        />
                                    </div>
                                </td>

                                {/* Interview 2 */}
                                <td className="p-4 bg-pink-50/30 dark:bg-pink-900/10">
                                     <input 
                                        type="date" 
                                        min={today}
                                        value={row.interview2Date} 
                                        onChange={(e) => handleDateChange(row.candidateId, 'interview2Date', e.target.value)}
                                        className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-200 rounded px-3 py-2 text-sm w-full focus:outline-none focus:border-primary-500"
                                    />
                                </td>
                                <td className="p-4 bg-pink-50/30 dark:bg-pink-900/10">
                                    <div className="flex justify-center">
                                        <select 
                                            value={row.interview2Result} 
                                            onChange={(e) => handleResultChange(row.candidateId, 'interview2Result', e.target.value)}
                                            className={`appearance-none text-center font-bold border rounded-md px-2 py-2 text-sm w-full min-w-[140px] cursor-pointer focus:outline-none ${
                                                row.interview2Result === 'Excellent' ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-400 dark:border-green-700' :
                                                row.interview2Result === 'Good' ? 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/50 dark:text-blue-400 dark:border-blue-700' :
                                                row.interview2Result === 'Fair' ? 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-400 dark:border-yellow-700' :
                                                 row.interview2Result === 'Medium' ? 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/50 dark:text-orange-400 dark:border-orange-700' :
                                                'bg-white text-gray-500 border-gray-300 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600'
                                            }`}
                                        >
                                            {resultOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                        </select>
                                    </div>
                                </td>

                                {/* Start Date */}
                                <td className="p-4">
                                     <input 
                                        type="date" 
                                        min={today}
                                        value={row.startDate} 
                                        onChange={(e) => handleDateChange(row.candidateId, 'startDate', e.target.value)}
                                        className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-200 rounded px-3 py-2 text-sm w-full focus:outline-none focus:border-primary-500"
                                    />
                                </td>
                                
                                {/* Status */}
                                <td className="p-4">
                                    <StatusBadge status={getStatus(row)} />
                                </td>

                                {/* Actions */}
                                <td className="p-4 sticky right-0 bg-white dark:bg-gray-900 group-hover:bg-gray-50 dark:group-hover:bg-gray-800/50 z-10 shadow-[-5px_0_10px_-5px_rgba(0,0,0,0.1)] dark:shadow-[-5px_0_10px_-5px_rgba(0,0,0,0.3)]">
                                    <div className="flex items-center justify-center gap-2">
                                        <button 
                                            onClick={() => onSelectCandidate(row.profile)}
                                            className="p-1.5 text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                                            title={t('common.actions')}
                                        >
                                            <Icon name="user" className="w-5 h-5" />
                                        </button>
                                        <button 
                                            onClick={() => onTogglePipeline(row.candidateId)}
                                            className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                                            title={t('dashboard.card.remove_pipeline')}
                                        >
                                            <Icon name="close" className="w-5 h-5" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4 pb-24">
                {filteredData.map((row) => (
                    <div key={row.candidateId} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border dark:border-gray-700">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{row.profile.name}</h3>
                                <p className="text-sm font-bold text-primary-600 dark:text-primary-400">{row.profile.jobCategory}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{row.profile.location} • {row.profile.totalExperienceYears} years exp.</p>
                            </div>
                             <div className={`flex items-center justify-center gap-1 px-2 py-1 rounded-full font-bold ${getScoreClass(row.profile.performanceScore)}`}>
                                <span className="text-xl">{getScoreEmoji(row.profile.performanceScore)}</span>
                                <span>{row.profile.performanceScore}</span>
                            </div>
                        </div>

                        <div className="space-y-3 text-sm">
                             <div className="flex justify-between items-center mb-2">
                                <StatusBadge status={getStatus(row)} />
                             </div>
                            {/* Application Date */}
                            <div>
                                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">{t('recruitment.table.app_date')}</label>
                                <input 
                                    type="date" 
                                    min={today}
                                    value={row.applicationDate} 
                                    onChange={(e) => handleDateChange(row.candidateId, 'applicationDate', e.target.value)}
                                    className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded px-2 py-1.5 text-gray-900 dark:text-gray-100"
                                />
                            </div>

                            {/* Interview 1 */}
                            <div className="p-3 bg-blue-50/50 dark:bg-blue-900/10 rounded-lg space-y-2">
                                <p className="font-semibold text-xs text-blue-800 dark:text-blue-200">{t('recruitment.table.interview1')}</p>
                                <div className="grid grid-cols-2 gap-2">
                                    <input 
                                        type="date" 
                                        min={today}
                                        value={row.interview1Date} 
                                        onChange={(e) => handleDateChange(row.candidateId, 'interview1Date', e.target.value)}
                                        className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded px-2 py-1 w-full text-gray-900 dark:text-gray-100"
                                    />
                                    <button
                                        onClick={() => setActiveDrawer({ type: 'interview1', candidateId: row.candidateId })}
                                        className="flex items-center justify-between bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded px-2 py-1 w-full text-left"
                                    >
                                        <span className={!row.interview1Result ? 'text-gray-400' : 'text-gray-900 dark:text-gray-100'}>
                                           {row.interview1Result || t('recruitment.results.none')}
                                        </span>
                                        <Icon name="chevron-down" className="w-4 h-4 text-gray-500" />
                                    </button>
                                </div>
                            </div>

                            {/* Challenge */}
                             <div className="p-3 bg-purple-50/50 dark:bg-purple-900/10 rounded-lg space-y-2">
                                <div className="flex justify-between items-center">
                                    <p className="font-semibold text-xs text-purple-800 dark:text-purple-200">{t('recruitment.table.challenge')}</p>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs">{t('recruitment.table.done')}:</span>
                                        <ToggleSwitch 
                                            checked={!!row.challengeDoneDate} 
                                            onChange={(checked) => handleDateChange(row.candidateId, 'challengeDoneDate', checked ? new Date().toISOString().split('T')[0] : '')}
                                        />
                                    </div>
                                </div>
                                <input 
                                    type="date" 
                                    min={today}
                                    value={row.challengeSentDate} 
                                    onChange={(e) => handleDateChange(row.candidateId, 'challengeSentDate', e.target.value)}
                                    className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded px-2 py-1 w-full text-gray-900 dark:text-gray-100"
                                    placeholder={t('recruitment.table.sent')}
                                />
                            </div>

                            {/* Interview 2 */}
                             <div className="p-3 bg-pink-50/50 dark:bg-pink-900/10 rounded-lg space-y-2">
                                <p className="font-semibold text-xs text-pink-800 dark:text-pink-200">{t('recruitment.table.interview2')}</p>
                                <div className="grid grid-cols-2 gap-2">
                                    <input 
                                        type="date" 
                                        min={today}
                                        value={row.interview2Date} 
                                        onChange={(e) => handleDateChange(row.candidateId, 'interview2Date', e.target.value)}
                                        className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded px-2 py-1 w-full text-gray-900 dark:text-gray-100"
                                    />
                                    <button
                                        onClick={() => setActiveDrawer({ type: 'interview2', candidateId: row.candidateId })}
                                        className="flex items-center justify-between bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded px-2 py-1 w-full text-left"
                                    >
                                        <span className={!row.interview2Result ? 'text-gray-400' : 'text-gray-900 dark:text-gray-100'}>
                                           {row.interview2Result || t('recruitment.results.none')}
                                        </span>
                                        <Icon name="chevron-down" className="w-4 h-4 text-gray-500" />
                                    </button>
                                </div>
                            </div>

                            {/* Start Date */}
                            <div>
                                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">{t('recruitment.table.start_date')}</label>
                                <input 
                                    type="date" 
                                    min={today}
                                    value={row.startDate} 
                                    onChange={(e) => handleDateChange(row.candidateId, 'startDate', e.target.value)}
                                    className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded px-2 py-1.5 text-gray-900 dark:text-gray-100"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-4 pt-4 border-t dark:border-gray-700">
                             <button 
                                onClick={() => onSelectCandidate(row.profile)}
                                className="p-2 text-gray-500 hover:text-primary-600 bg-gray-100 dark:bg-gray-700 hover:bg-primary-50 rounded-lg transition-colors"
                                title={t('common.actions')}
                            >
                                <Icon name="user" className="w-5 h-5" />
                            </button>
                            <button 
                                onClick={() => onTogglePipeline(row.candidateId)}
                                className="p-2 text-red-500 hover:text-red-600 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 rounded-lg transition-colors"
                                title={t('dashboard.card.remove_pipeline')}
                            >
                                <Icon name="close" className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            
            {/* Mobile Selection Drawer for Result */}
            <Drawer 
                isOpen={!!activeDrawer} 
                onClose={() => setActiveDrawer(null)} 
                title={activeDrawer?.type === 'interview1' ? t('recruitment.table.interview1') : t('recruitment.table.interview2')}
            >
                <div className="flex flex-col gap-2">
                    {resultOptions.map(opt => (
                        <button
                            key={opt.value}
                            onClick={() => {
                                if (activeDrawer) {
                                    handleResultChange(activeDrawer.candidateId, activeDrawer.type === 'interview1' ? 'interview1Result' : 'interview2Result', opt.value);
                                    setActiveDrawer(null);
                                }
                            }}
                            className={`p-3 rounded-lg text-left font-medium flex items-center gap-3 transition-colors ${opt.color} hover:opacity-80`}
                        >
                            <div className={`w-3 h-3 rounded-full ${opt.value ? 'bg-current' : 'border border-current'}`}></div>
                            {opt.label}
                        </button>
                    ))}
                </div>
            </Drawer>

            {/* Mobile Filter Drawer */}
             <Drawer 
                isOpen={isFilterDrawerOpen} 
                onClose={() => setIsFilterDrawerOpen(false)} 
                title={t('recruitment.filter_jobs')}
            >
                <div className="flex flex-col gap-2">
                    <button
                        onClick={() => { setJobFilter('all'); setIsFilterDrawerOpen(false); }}
                        className={`p-3 rounded-lg text-left font-medium transition-colors ${jobFilter === 'all' ? 'bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300' : 'bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-200'}`}
                    >
                        {t('recruitment.all_jobs')}
                    </button>
                    {allJobCategories.map(job => (
                        <button
                            key={job}
                            onClick={() => { setJobFilter(job); setIsFilterDrawerOpen(false); }}
                            className={`p-3 rounded-lg text-left font-medium transition-colors ${jobFilter === job ? 'bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300' : 'bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-200'}`}
                        >
                            {job}
                        </button>
                    ))}
                </div>
            </Drawer>

            {/* Mobile Export Drawer */}
             <Drawer 
                isOpen={isExportOpen && window.innerWidth < 768} 
                onClose={() => setIsExportOpen(false)} 
                title={t('common.export')}
            >
                <div className="flex flex-col gap-2">
                    <button onClick={exportToCsv} className="w-full text-left flex items-center gap-3 p-4 text-base bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                        <Icon name="export" className="w-5 h-5"/> CSV
                    </button>
                    <button onClick={exportToJson} className="w-full text-left flex items-center gap-3 p-4 text-base bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                        <Icon name="export" className="w-5 h-5"/> JSON
                    </button>
                </div>
            </Drawer>
        </div>
    );
};
