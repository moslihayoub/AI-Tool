
import * as React from 'react';
import { PipelineSnapshot, RecruitmentData } from '../types';
import { useTranslation } from '../i18n';
import { Icon } from './icons';

interface HistoryViewProps {
    history: PipelineSnapshot[];
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

const getStatus = (data: RecruitmentData): string => {
    if (data.startDate) return 'hired';
    if (data.interview2Result) return 'interview2';
    if (data.challengeDoneDate) return 'challenge';
    if (data.interview1Result) return 'interview1';
    return 'application';
};

const StatusBadge = ({ status }: { status: string }) => {
    const { t } = useTranslation();
    const styles: Record<string, string> = {
        application: 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300',
        interview1: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
        challenge: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
        interview2: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
        hired: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    };

    return (
        <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${styles[status] || styles.application}`}>
            {t(`recruitment.status.${status}`)}
        </span>
    );
};

export const HistoryView: React.FC<HistoryViewProps> = ({ history }) => {
    const { t } = useTranslation();
    const [expandedId, setExpandedId] = React.useState<string | null>(null);

    if (history.length === 0) {
        return (
            <div className="p-4 sm:p-8 text-center flex flex-col items-center justify-center h-full">
                 <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-full mb-4">
                    <Icon name="history" className="w-12 h-12 text-gray-400" />
                 </div>
                <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">{t('history.empty')}</p>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-8 space-y-6 h-full flex flex-col">
            <div>
                <h2 className="text-3xl font-bold font-display text-gray-800 dark:text-gray-100">{t('history.title')}</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-1">{t('history.subtitle')}</p>
            </div>

            <div className="space-y-4">
                {history.slice().reverse().map(snapshot => (
                    <div key={snapshot.id} className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 shadow-sm overflow-hidden">
                        <div 
                            className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                            onClick={() => setExpandedId(expandedId === snapshot.id ? null : snapshot.id)}
                        >
                            <div className="flex items-center gap-4">
                                <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                                    <Icon name="archive" className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">{t('history.snapshot_title', { date: new Date(snapshot.date).toLocaleString() })}</h4>
                                    <p className="text-sm text-gray-500">{t('history.candidate_count', { count: snapshot.count })}</p>
                                </div>
                            </div>
                            <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                                <Icon name={expandedId === snapshot.id ? "chevron-up" : "chevron-down"} className="w-5 h-5" />
                            </button>
                        </div>
                        
                        {expandedId === snapshot.id && (
                            <div className="border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30 p-4 overflow-x-auto">
                                {/* Desktop Table View */}
                                <div className="hidden md:block overflow-x-auto bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700">
                                    <table className="w-full text-left text-sm border-collapse min-w-[1400px]">
                                        <thead>
                                             <tr className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 uppercase tracking-wider font-semibold">
                                                <th className="p-3 w-32 border-b dark:border-gray-700">{t('recruitment.table.app_date')}</th>
                                                <th className="p-3 w-48 border-b dark:border-gray-700">{t('recruitment.table.name')}</th>
                                                <th className="p-3 w-24 text-center border-b dark:border-gray-700">{t('recruitment.table.score')}</th>
                                                <th className="p-3 w-24 text-center border-b dark:border-gray-700">{t('recruitment.table.experience')}</th>
                                                <th className="p-3 w-32 border-b dark:border-gray-700">{t('recruitment.table.location')}</th>
                                                <th className="p-3 text-center border-b dark:border-gray-700 bg-blue-50 dark:bg-blue-900/20" colSpan={2}>{t('recruitment.table.interview1')}</th>
                                                <th className="p-3 text-center border-b dark:border-gray-700 bg-purple-50 dark:bg-purple-900/20" colSpan={2}>{t('recruitment.table.challenge')}</th>
                                                <th className="p-3 text-center border-b dark:border-gray-700 bg-pink-50 dark:bg-pink-900/20" colSpan={2}>{t('recruitment.table.interview2')}</th>
                                                <th className="p-3 w-32 border-b dark:border-gray-700">{t('recruitment.table.start_date')}</th>
                                                <th className="p-3 w-28 border-b dark:border-gray-700">{t('recruitment.table.status')}</th>
                                            </tr>
                                            <tr className="text-xs text-gray-500 dark:text-gray-400 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                                                <th colSpan={5}></th>
                                                <th className="p-2 text-center bg-blue-50/50 dark:bg-blue-900/10">{t('common.dates_not_available')}</th>
                                                <th className="p-2 text-center bg-blue-50/50 dark:bg-blue-900/10 w-40">{t('recruitment.table.result')}</th>
                                                <th className="p-2 text-center bg-purple-50/50 dark:bg-purple-900/10">{t('recruitment.table.sent')}</th>
                                                <th className="p-2 text-center bg-purple-50/50 dark:bg-purple-900/10">{t('recruitment.table.done')}</th>
                                                <th className="p-2 text-center bg-pink-50/50 dark:bg-pink-900/10">{t('common.dates_not_available')}</th>
                                                <th className="p-2 text-center bg-pink-50/50 dark:bg-pink-900/10 w-40">{t('recruitment.table.result')}</th>
                                                <th colSpan={2}></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y dark:divide-gray-700">
                                            {snapshot.data.map(item => (
                                                <tr key={item.candidateId} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                                    <td className="p-3 text-gray-500 dark:text-gray-400">{item.applicationDate || '-'}</td>
                                                    <td className="p-3">
                                                        <div className="flex flex-col">
                                                            <span className="font-bold text-gray-900 dark:text-white">{item.profile?.name || 'Unknown'}</span>
                                                            <span className="text-xs font-bold text-primary-600 dark:text-primary-400">{item.profile?.jobCategory || '-'}</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-3 text-center">
                                                        {item.profile && (
                                                            <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold text-sm ${getScoreClass(item.profile.performanceScore)}`}>
                                                                <span>{getScoreEmoji(item.profile.performanceScore)}</span>
                                                                <span>{item.profile.performanceScore}</span>
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="p-3 text-center text-gray-600 dark:text-gray-300">{item.profile?.totalExperienceYears ?? '-'}</td>
                                                    <td className="p-3 text-gray-600 dark:text-gray-300 truncate max-w-[120px]" title={item.profile?.location}>{item.profile?.location ?? '-'}</td>
                                                    
                                                    <td className="p-3 text-center text-gray-600 dark:text-gray-300 bg-blue-50/30 dark:bg-blue-900/5">{item.interview1Date || '-'}</td>
                                                    <td className="p-3 text-center font-medium bg-blue-50/30 dark:bg-blue-900/5">
                                                        {item.interview1Result && t(`recruitment.results.${item.interview1Result.toLowerCase()}`) || '-'}
                                                    </td>
                                                    
                                                    <td className="p-3 text-center text-gray-600 dark:text-gray-300 bg-purple-50/30 dark:bg-purple-900/5">{item.challengeSentDate || '-'}</td>
                                                    <td className="p-3 text-center bg-purple-50/30 dark:bg-purple-900/5">
                                                        {item.challengeDoneDate ? <Icon name="check" className="w-4 h-4 text-purple-600 mx-auto" /> : '-'}
                                                    </td>
                                                    
                                                    <td className="p-3 text-center text-gray-600 dark:text-gray-300 bg-pink-50/30 dark:bg-pink-900/5">{item.interview2Date || '-'}</td>
                                                    <td className="p-3 text-center font-medium bg-pink-50/30 dark:bg-pink-900/5">
                                                        {item.interview2Result && t(`recruitment.results.${item.interview2Result.toLowerCase()}`) || '-'}
                                                    </td>

                                                    <td className="p-3 text-center text-gray-600 dark:text-gray-300">{item.startDate || '-'}</td>
                                                    <td className="p-3 text-center">
                                                        <StatusBadge status={getStatus(item)} />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Mobile Card View */}
                                <div className="md:hidden space-y-3">
                                    {snapshot.data.map(item => (
                                        <div key={item.candidateId} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border dark:border-gray-600 text-sm">
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <h5 className="font-bold text-gray-900 dark:text-white text-lg">{item.profile?.name || 'Unknown'}</h5>
                                                    <p className="text-xs font-bold text-primary-600 dark:text-primary-400">{item.profile?.jobCategory}</p>
                                                </div>
                                                {item.profile && (
                                                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full font-bold text-xs ${getScoreClass(item.profile.performanceScore)}`}>
                                                        <span>{getScoreEmoji(item.profile.performanceScore)}</span>
                                                        <span>{item.profile.performanceScore}</span>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <div className="flex justify-between items-center mb-3">
                                                <StatusBadge status={getStatus(item)} />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 mb-3">
                                                <div>
                                                    <span className="text-xs text-gray-500 dark:text-gray-400 block">{t('recruitment.table.location')}</span>
                                                    <span className="font-medium">{item.profile?.location || '-'}</span>
                                                </div>
                                                <div>
                                                    <span className="text-xs text-gray-500 dark:text-gray-400 block">{t('recruitment.table.experience')}</span>
                                                    <span className="font-medium">{item.profile?.totalExperienceYears} years</span>
                                                </div>
                                            </div>

                                            <div className="border-t dark:border-gray-700 pt-3 space-y-2">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500 dark:text-gray-400">{t('recruitment.table.app_date')}</span>
                                                    <span className="font-medium">{item.applicationDate || '-'}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500 dark:text-gray-400">{t('recruitment.table.interview1')}</span>
                                                    <span className="font-medium">
                                                        {item.interview1Date || '-'} 
                                                        ({item.interview1Result && t(`recruitment.results.${item.interview1Result.toLowerCase()}`) || '-'})
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500 dark:text-gray-400">{t('recruitment.table.challenge')}</span>
                                                    <span className="font-medium">{item.challengeDoneDate ? t('recruitment.table.done') : t('upload.status.pending')}</span>
                                                </div>
                                                 <div className="flex justify-between">
                                                    <span className="text-gray-500 dark:text-gray-400">{t('recruitment.table.interview2')}</span>
                                                    <span className="font-medium">
                                                        {item.interview2Date || '-'} 
                                                        ({item.interview2Result && t(`recruitment.results.${item.interview2Result.toLowerCase()}`) || '-'})
                                                    </span>
                                                </div>
                                                <div className="flex justify-between pt-2 border-t dark:border-gray-700">
                                                    <span className="text-gray-500 dark:text-gray-400 font-bold">{t('recruitment.table.start_date')}</span>
                                                    <span className="font-medium text-primary-600 dark:text-primary-400">{item.startDate || '-'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};
