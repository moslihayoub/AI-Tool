// A new component to display and share a side-by-side comparison of two candidate profiles.
// FIX: Added 'import * as React from "react";'. This is required for components that use JSX syntax and resolves "React is not defined" compilation errors and subsequent JSX intrinsic element type errors.
import * as React from 'react';
import { CandidateProfile } from '../types';
import { Icon } from './icons';
import { useTranslation } from '../i18n';

interface CompareViewProps {
    profile1?: CandidateProfile;
    profile2?: CandidateProfile;
    onBack: () => void;
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

const CompareSectionCard: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-white dark:bg-gray-800/50 p-6 rounded-xl border dark:border-gray-700/50">
        <h3 className="font-semibold font-display text-lg border-b dark:border-gray-600 pb-3 mb-4">{title}</h3>
        {children}
    </div>
);


export const CompareView: React.FC<CompareViewProps> = ({ profile1, profile2, onBack }) => {
    const { t } = useTranslation();
    const [isCopied, setIsCopied] = React.useState(false);
    const [isShareOpen, setIsShareOpen] = React.useState(false);
    const shareRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (shareRef.current && !shareRef.current.contains(event.target as Node)) {
                setIsShareOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!profile1 || !profile2) {
        return (
            <div className="p-4 sm:p-8 space-y-8 h-full flex flex-col">
                 <header className="flex items-center gap-3">
                    <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                        <Icon name="chevron-left" className="w-6 h-6" />
                    </button>
                    <div>
                        <h2 className="text-3xl font-bold font-display text-gray-800 dark:text-gray-100">{t('compare.empty_state_title')}</h2>
                    </div>
                </header>
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                    <dotlottie-wc
                        src="https://lottie.host/89c66344-281d-4450-91d3-4574a47fec47/31ogoyP4Mh.lottie"
                        autoplay
                        loop
                        style={{ width: '200px', height: '200px' }}
                    ></dotlottie-wc>
                    <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-md">{t('compare.empty_state_description')}</p>
                </div>
            </div>
        );
    }


    const commonHardSkills = React.useMemo(() => 
        profile1.skills.hard.filter(skill => profile2.skills.hard.includes(skill)), 
    [profile1, profile2]);

    const commonSoftSkills = React.useMemo(() => 
        profile1.skills.soft.filter(skill => profile2.skills.soft.includes(skill)),
    [profile1, profile2]);
    
    const generateComparisonSummary = React.useCallback(() => {
        const p1TopSkills = profile1.skills.hard.slice(0, 3).join(', ') || 'N/A';
        const p2TopSkills = profile2.skills.hard.slice(0, 3).join(', ') || 'N/A';

        return `
*Candidate Comparison: ${profile1.name} vs ${profile2.name}*

*--- ${profile1.name} ---*
- *Score:* ${profile1.performanceScore}/100
- *Experience:* ${profile1.totalExperienceYears} years
- *Location:* ${profile1.location}
- *Top Skills:* ${p1TopSkills}

*--- ${profile2.name} ---*
- *Score:* ${profile2.performanceScore}/100
- *Experience:* ${profile2.totalExperienceYears} years
- *Location:* ${profile2.location}
- *Top Skills:* ${p2TopSkills}

*Common Hard Skills:* ${commonHardSkills.join(', ') || 'None'}
        `.trim();
    }, [profile1, profile2, commonHardSkills]);

    const handleShare = (platform: 'whatsapp' | 'email' | 'copy') => {
        const summary = generateComparisonSummary();
        setIsShareOpen(false);
        if (platform === 'whatsapp') {
            window.open(`https://wa.me/?text=${encodeURIComponent(summary)}`, '_blank');
        } else if (platform === 'email') {
            const subject = `Candidate Comparison: ${profile1.name} vs ${profile2.name}`;
            window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(summary)}`;
        } else if (platform === 'copy') {
            navigator.clipboard.writeText(summary).then(() => {
                setIsCopied(true);
                setTimeout(() => setIsCopied(false), 2000);
            });
        }
    };

    const renderProfileColumn = (profile: CandidateProfile, commonHard: string[], commonSoft: string[]) => (
        <div className="space-y-6">
            {/* Overview */}
            <div className="bg-white dark:bg-gray-800/50 p-6 rounded-xl border dark:border-gray-700/50">
                <div className="flex justify-between items-start gap-4">
                    <div>
                        <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400">{t('common.name')}</h4>
                        <h3 className="text-2xl font-bold font-display">{profile.name}</h3>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">{profile.location}</p>
                    </div>
                    <div className={`text-xl font-bold px-4 py-2 rounded-full flex items-center gap-2 ${getScoreClass(profile.performanceScore)} shrink-0`}>
                        <span className="text-2xl">{getScoreEmoji(profile.performanceScore)}</span>
                        <span>{profile.performanceScore}/100</span>
                    </div>
                </div>
                <div className="flex justify-between items-center pt-4 mt-4 border-t dark:border-gray-700">
                    <span className="font-semibold">{t('dashboard.experience_years', {count: profile.totalExperienceYears})}</span>
                </div>
            </div>

            {/* Summary */}
            <CompareSectionCard title={t('compare.summary_title')}>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-base">{profile.summary}</p>
            </CompareSectionCard>

            {/* Skills */}
             <CompareSectionCard title={t('detail.skills')}>
                 <div className="space-y-4">
                    {profile.skills.hard.length > 0 && (
                        <div>
                            <h4 className="font-bold text-sm uppercase text-gray-500 mb-2">{t('detail.hard_skills')}</h4>
                            <div className="flex flex-wrap gap-2">
                                {profile.skills.hard.map(s => <span key={s} className={`text-sm font-medium px-3 py-1 rounded-full ${commonHard.includes(s) ? 'bg-green-200 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'}`}>{s}</span>)}
                            </div>
                        </div>
                    )}
                    {profile.skills.soft.length > 0 && (
                         <div>
                            <h4 className="font-bold text-sm uppercase text-gray-500 mb-2">{t('detail.soft_skills')}</h4>
                            <div className="flex flex-wrap gap-2">
                                {profile.skills.soft.map(s => <span key={s} className={`text-sm font-medium px-3 py-1 rounded-full ${commonSoft.includes(s) ? 'bg-green-200 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-secondary-100 text-secondary-800 dark:bg-secondary-900 dark:text-secondary-300'}`}>{s}</span>)}
                            </div>
                        </div>
                    )}
                </div>
            </CompareSectionCard>

            {/* Experience */}
            <CompareSectionCard title={t('compare.experience_title')}>
                <div className="space-y-6">{profile.experience.map((exp, i) => (
                    <div key={i}>
                        <h4 className="font-bold text-base">{exp.title}</h4>
                        <p className="text-gray-600 dark:text-gray-400 font-medium text-sm">{exp.company} &bull; <span className="italic">{exp.dates}</span></p>
                    </div>
                ))}</div>
            </CompareSectionCard>

             {/* Education */}
            <CompareSectionCard title={t('compare.education_title')}>
                <div className="space-y-4">{profile.education.map((edu, i) => (
                    <div key={i}>
                        <h4 className="font-bold text-base">{edu.degree}</h4>
                        <p className="text-gray-600 dark:text-gray-400 font-medium text-sm">{edu.school} &bull; <span className="italic">{edu.dates}</span></p>
                    </div>
                ))}</div>
            </CompareSectionCard>
        </div>
    );


    return (
        <div className="p-4 sm:p-8 space-y-8">
            <header className="flex justify-between items-center gap-4">
                <div className="flex items-center gap-3 min-w-0">
                    <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 flex-shrink-0">
                        <Icon name="chevron-left" className="w-6 h-6" />
                    </button>
                    <div className="truncate">
                        <h2 className="text-2xl sm:text-3xl font-bold font-display text-gray-800 dark:text-gray-100 truncate">{t('compare.title')}</h2>
                        <p className="text-gray-500 dark:text-gray-400 mt-1 truncate">{`${profile1.name} vs ${profile2.name}`}</p>
                    </div>
                </div>
                <div ref={shareRef} className="relative">
                    <button onClick={() => setIsShareOpen(prev => !prev)} className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-full py-2 px-4 font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        <Icon name="share" className="w-5 h-5" />
                        <span>{t('compare.share_title')}</span>
                         {isCopied && <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs rounded py-1 px-2">{t('compare.copied')}</span>}
                    </button>
                    {isShareOpen && (
                        <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-lg shadow-xl z-10 py-1">
                            <button onClick={() => handleShare('whatsapp')} className="w-full text-left flex items-center gap-3 p-3 text-sm hover:bg-gray-100 dark:hover:bg-gray-700">
                                <Icon name="whatsapp" className="w-5 h-5 text-green-500"/> {t('compare.share_whatsapp')}
                            </button>
                            <button onClick={() => handleShare('email')} className="w-full text-left flex items-center gap-3 p-3 text-sm hover:bg-gray-100 dark:hover:bg-gray-700">
                                <Icon name="mail" className="w-5 h-5"/> {t('compare.share_email')}
                            </button>
                            <button onClick={() => handleShare('copy')} className="w-full text-left flex items-center gap-3 p-3 text-sm hover:bg-gray-100 dark:hover:bg-gray-700">
                                <Icon name="copy" className="w-5 h-5"/> {t('compare.copy_summary')}
                            </button>
                        </div>
                    )}
                </div>
            </header>

            {/* Desktop View */}
            <div className="hidden lg:grid grid-cols-2 gap-8 items-start">
                {renderProfileColumn(profile1, commonHardSkills, commonSoftSkills)}
                {renderProfileColumn(profile2, commonHardSkills, commonSoftSkills)}
            </div>
            
            {/* Mobile View */}
            <div className="block lg:hidden space-y-6">
                 <div className="bg-white dark:bg-gray-800/50 p-4 rounded-xl border dark:border-gray-700/50">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col h-full">
                            <h3 className="text-lg font-bold font-display break-words">{profile1.name}</h3>
                            <p className="text-sm font-semibold text-[#FF585F] mt-1 truncate">{profile1.jobCategory}</p>
                            <div className={`text-base font-bold px-3 py-1 rounded-full flex items-center gap-1 ${getScoreClass(profile1.performanceScore)} self-start mt-2`}>
                                <span className="text-lg">{getScoreEmoji(profile1.performanceScore)}</span>
                                <span>{profile1.performanceScore}/100</span>
                            </div>
                            <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">{profile1.location}</p>
                            <div className="flex-grow"></div>
                            <p className="font-semibold text-sm pt-2 mt-2 border-t dark:border-gray-700">{t('dashboard.experience_years', {count: profile1.totalExperienceYears})}</p>
                        </div>
                        <div className="flex flex-col h-full">
                            <h3 className="text-lg font-bold font-display break-words">{profile2.name}</h3>
                            <p className="text-sm font-semibold text-[#FF585F] mt-1 truncate">{profile2.jobCategory}</p>
                             <div className={`text-base font-bold px-3 py-1 rounded-full flex items-center gap-1 ${getScoreClass(profile2.performanceScore)} self-start mt-2`}>
                                <span className="text-lg">{getScoreEmoji(profile2.performanceScore)}</span>
                                <span>{profile2.performanceScore}/100</span>
                            </div>
                            <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">{profile2.location}</p>
                            <div className="flex-grow"></div>
                            <p className="font-semibold text-sm pt-2 mt-2 border-t dark:border-gray-700">{t('dashboard.experience_years', {count: profile2.totalExperienceYears})}</p>
                        </div>
                    </div>
                </div>

                <CompareSectionCard title={t('compare.summary_title')}>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{profile1.summary}</p>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{profile2.summary}</p>
                    </div>
                </CompareSectionCard>

                <CompareSectionCard title={t('detail.skills')}>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-3">
                            {profile1.skills.hard.length > 0 && (
                                <div>
                                    <h4 className="font-bold text-xs uppercase text-gray-500 mb-2">{t('detail.hard_skills')}</h4>
                                    <div className="flex flex-wrap gap-1">
                                        {profile1.skills.hard.map(s => <span key={s} className={`text-xs font-medium px-2 py-0.5 rounded-full ${commonHardSkills.includes(s) ? 'bg-green-200 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'}`}>{s}</span>)}
                                    </div>
                                </div>
                            )}
                            {profile1.skills.soft.length > 0 && (
                                 <div>
                                    <h4 className="font-bold text-xs uppercase text-gray-500 mb-2">{t('detail.soft_skills')}</h4>
                                    <div className="flex flex-wrap gap-1">
                                        {profile1.skills.soft.map(s => <span key={s} className={`text-xs font-medium px-2 py-0.5 rounded-full ${commonSoftSkills.includes(s) ? 'bg-green-200 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-secondary-100 text-secondary-800 dark:bg-secondary-900 dark:text-secondary-300'}`}>{s}</span>)}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="space-y-3">
                            {profile2.skills.hard.length > 0 && (
                                <div>
                                    <h4 className="font-bold text-xs uppercase text-gray-500 mb-2">{t('detail.hard_skills')}</h4>
                                    <div className="flex flex-wrap gap-1">
                                        {profile2.skills.hard.map(s => <span key={s} className={`text-xs font-medium px-2 py-0.5 rounded-full ${commonHardSkills.includes(s) ? 'bg-green-200 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'}`}>{s}</span>)}
                                    </div>
                                </div>
                            )}
                            {profile2.skills.soft.length > 0 && (
                                 <div>
                                    <h4 className="font-bold text-xs uppercase text-gray-500 mb-2">{t('detail.soft_skills')}</h4>
                                    <div className="flex flex-wrap gap-1">
                                        {profile2.skills.soft.map(s => <span key={s} className={`text-xs font-medium px-2 py-0.5 rounded-full ${commonSoftSkills.includes(s) ? 'bg-green-200 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-secondary-100 text-secondary-800 dark:bg-secondary-900 dark:text-secondary-300'}`}>{s}</span>)}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </CompareSectionCard>

                 <CompareSectionCard title={t('compare.experience_title')}>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="space-y-4">{profile1.experience.map((exp, i) => (
                            <div key={i}>
                                <h4 className="font-bold">{exp.title}</h4>
                                <p className="text-gray-600 dark:text-gray-400 font-medium text-xs">{exp.company} &bull; <span className="italic">{exp.dates}</span></p>
                            </div>
                        ))}</div>
                        <div className="space-y-4">{profile2.experience.map((exp, i) => (
                            <div key={i}>
                                <h4 className="font-bold">{exp.title}</h4>
                                <p className="text-gray-600 dark:text-gray-400 font-medium text-xs">{exp.company} &bull; <span className="italic">{exp.dates}</span></p>
                            </div>
                        ))}</div>
                    </div>
                </CompareSectionCard>

                <CompareSectionCard title={t('compare.education_title')}>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="space-y-3">{profile1.education.map((edu, i) => (
                            <div key={i}>
                                <h4 className="font-bold">{edu.degree}</h4>
                                <p className="text-gray-600 dark:text-gray-400 font-medium text-xs">{edu.school} &bull; <span className="italic">{edu.dates}</span></p>
                            </div>
                        ))}</div>
                        <div className="space-y-3">{profile2.education.map((edu, i) => (
                            <div key={i}>
                                <h4 className="font-bold">{edu.degree}</h4>
                                <p className="text-gray-600 dark:text-gray-400 font-medium text-xs">{edu.school} &bull; <span className="italic">{edu.dates}</span></p>
                            </div>
                        ))}</div>
                    </div>
                </CompareSectionCard>
            </div>
            
            {(commonHardSkills.length > 0 || commonSoftSkills.length > 0) &&
                <CompareSectionCard title={t('compare.common_skills')}>
                    {commonHardSkills.length > 0 &&
                        <div className="mb-4">
                            <h4 className="font-bold text-sm uppercase text-gray-500 mb-2">{t('detail.hard_skills')}</h4>
                            <div className="flex flex-wrap gap-2">
                                {commonHardSkills.map(s => <span key={s} className="bg-green-200 text-green-800 text-sm font-medium px-3 py-1 rounded-full dark:bg-green-900 dark:text-green-200">{s}</span>)}
                            </div>
                        </div>
                    }
                     {commonSoftSkills.length > 0 &&
                        <div>
                            <h4 className="font-bold text-sm uppercase text-gray-500 mb-2">{t('detail.soft_skills')}</h4>
                            <div className="flex flex-wrap gap-2">
                                {commonSoftSkills.map(s => <span key={s} className="bg-green-200 text-green-800 text-sm font-medium px-3 py-1 rounded-full dark:bg-green-900 dark:text-green-200">{s}</span>)}
                            </div>
                        </div>
                    }
                </CompareSectionCard>
            }
        </div>
    );
};