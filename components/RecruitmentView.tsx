
import * as React from 'react';
import { CandidateProfile, RecruitmentData, PipelineStage } from '../types';
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
    onCreateMission: (candidate: CandidateProfile) => void;
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

export const RecruitmentView: React.FC<RecruitmentViewProps> = ({ candidates, recruitmentData, onUpdateRecruitmentData, onSelectCandidate, onTogglePipeline, onSaveSnapshot, lastSnapshotId, onCreateMission }) => {
    const { t } = useTranslation();
    const { showToast } = useToast();
    const [jobFilter, setJobFilter] = React.useState<string>('all');
    const [isFilterDrawerOpen, setIsFilterDrawerOpen] = React.useState(false);
    
    // Kanban State
    const [draggedCandidateId, setDraggedCandidateId] = React.useState<string | null>(null);

    // Merge recruitment data with candidates, filtering only those in the pipeline
    const pipelineData = React.useMemo(() => {
        return recruitmentData.map(data => {
            const profile = candidates.find(c => c.id === data.candidateId);
            if (!profile) return null;
            // Migration for existing data without stage
            const stage = data.stage || 'NEW';
            return { ...data, profile, stage };
        }).filter(Boolean) as (RecruitmentData & { profile: CandidateProfile })[];
    }, [candidates, recruitmentData]);

    const filteredData = React.useMemo(() => {
        if (jobFilter === 'all') return pipelineData;
        return pipelineData.filter(item => item.profile.jobCategory === jobFilter);
    }, [pipelineData, jobFilter]);

    const allJobCategories = React.useMemo(() => {
        return [...new Set(pipelineData.map(item => item.profile.jobCategory).filter(Boolean))].sort();
    }, [pipelineData]);

    const stages: { id: PipelineStage; label: string; color: string }[] = [
        { id: 'NEW', label: 'Nouveau', color: 'border-gray-200 dark:border-gray-700' },
        { id: 'SCREENING', label: 'Screening', color: 'border-blue-200 dark:border-blue-800' },
        { id: 'INTERVIEW_1', label: 'Entretien 1', color: 'border-purple-200 dark:border-purple-800' },
        { id: 'INTERVIEW_2', label: 'Entretien 2', color: 'border-pink-200 dark:border-pink-800' },
        { id: 'OFFER', label: 'Offre', color: 'border-yellow-200 dark:border-yellow-800' },
        { id: 'PLACED', label: 'Placé', color: 'border-green-200 dark:border-green-800' },
        { id: 'REJECTED', label: 'Rejeté', color: 'border-red-200 dark:border-red-800' },
    ];

    const handleDragStart = (e: React.DragEvent, candidateId: string) => {
        setDraggedCandidateId(candidateId);
        e.dataTransfer.effectAllowed = 'move';
        // Add a transparent drag image or customize if needed
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e: React.DragEvent, stage: PipelineStage) => {
        e.preventDefault();
        if (draggedCandidateId) {
            const item = pipelineData.find(p => p.candidateId === draggedCandidateId);
            if (item && item.stage !== stage) {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { profile, ...rest } = item;
                onUpdateRecruitmentData({ ...rest, stage });
                showToast(`Déplacé vers ${stages.find(s => s.id === stage)?.label}`, 'success');
            }
            setDraggedCandidateId(null);
        }
    };

    if (pipelineData.length === 0) {
         return (
            <div className="p-4 sm:p-8 text-center flex flex-col items-center justify-center h-full">
                {/* @ts-ignore */}
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
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 flex-shrink-0">
                <div>
                    <h2 className="text-3xl font-bold font-display text-gray-800 dark:text-gray-100">{t('recruitment.title')}</h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">{t('recruitment.subtitle')}</p>
                </div>
                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                    <div className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 w-full sm:w-auto">
                        <span className="text-sm font-semibold text-gray-600 dark:text-gray-300 whitespace-nowrap">{t('recruitment.filter_jobs')}:</span>
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
                        <button 
                            onClick={() => setIsFilterDrawerOpen(true)}
                            className="md:hidden flex items-center justify-between gap-2 bg-transparent text-gray-900 dark:text-gray-100 text-sm font-medium w-full"
                        >
                            <span className="truncate max-w-[120px]">{jobFilter === 'all' ? t('recruitment.all_jobs') : jobFilter}</span>
                            <Icon name="chevron-down" className="w-4 h-4 text-gray-500" />
                        </button>
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

            {/* Kanban Board */}
            <div className="flex-1 overflow-x-auto pb-4">
                <div className="flex gap-4 min-w-[1400px] h-full">
                    {stages.map(stage => {
                        const items = filteredData.filter(d => d.stage === stage.id);
                        return (
                            <div 
                                key={stage.id}
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, stage.id)}
                                className={`flex-1 min-w-[280px] bg-gray-50 dark:bg-gray-900/50 rounded-xl border-t-4 ${stage.color} flex flex-col h-full max-h-[calc(100vh-200px)]`}
                            >
                                <div className="p-3 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-gray-100/50 dark:bg-gray-800/50 rounded-t-xl">
                                    <h3 className="font-bold text-gray-700 dark:text-gray-200 text-sm uppercase">{stage.label}</h3>
                                    <span className="bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-300 text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">
                                        {items.length}
                                    </span>
                                </div>
                                <div className="p-3 overflow-y-auto flex-1 space-y-3 custom-scrollbar">
                                    {items.map(item => (
                                        <div 
                                            key={item.candidateId}
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, item.candidateId)}
                                            className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow group relative"
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h4 className="font-bold text-gray-900 dark:text-white truncate max-w-[160px]">{item.profile.name}</h4>
                                                    <p className="text-xs font-semibold text-primary-600 dark:text-primary-400 truncate max-w-[160px]">{item.profile.jobCategory}</p>
                                                </div>
                                                <div className="text-xl" title={`Score: ${item.profile.performanceScore}`}>
                                                    {getScoreEmoji(item.profile.performanceScore)}
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-3">
                                                <span className={`px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700`}>{item.profile.totalExperienceYears}y</span>
                                                <span className="truncate">{item.profile.location}</span>
                                            </div>

                                            {stage.id === 'PLACED' && (
                                                <button
                                                    onClick={() => onCreateMission(item.profile)}
                                                    className="w-full mb-3 bg-gradient-button text-white text-xs font-bold py-1.5 px-3 rounded shadow-sm hover:opacity-90 flex items-center justify-center gap-1"
                                                >
                                                    <Icon name="plus" className="w-3 h-3" />
                                                    Créer Mission
                                                </button>
                                            )}

                                            <div className="flex justify-between items-center pt-2 border-t border-gray-100 dark:border-gray-700">
                                                <span className="text-[10px] text-gray-400">{new Date(item.applicationDate).toLocaleDateString()}</span>
                                                <div className="flex gap-1">
                                                    <button 
                                                        onClick={() => onSelectCandidate(item.profile)}
                                                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-400 hover:text-primary-500"
                                                        title="Voir Profil"
                                                    >
                                                        <Icon name="user" className="w-4 h-4" />
                                                    </button>
                                                    <button 
                                                        onClick={() => onTogglePipeline(item.candidateId)}
                                                        className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded text-gray-400 hover:text-red-500"
                                                        title="Supprimer"
                                                    >
                                                        <Icon name="close" className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

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
        </div>
    );
};