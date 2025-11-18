
import * as React from 'react';
import { CandidateProfile, FilterCriteria } from '../types';
import { Icon } from './icons';
import { useTranslation } from '../i18n';

interface FilterViewProps {
    isOpen: boolean;
    onClose: () => void;
    onApply: (filters: FilterCriteria) => void;
    candidates: CandidateProfile[];
    currentFilters: FilterCriteria;
}

const FilterSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-white dark:bg-gray-800/50 p-6 rounded-xl border dark:border-gray-700/50">
        <h3 className="font-semibold font-display text-lg border-b dark:border-gray-600 pb-3 mb-4">{title}</h3>
        {children}
    </div>
);

export const FilterView: React.FC<FilterViewProps> = ({ isOpen, onClose, onApply, candidates, currentFilters }) => {
    const { t } = useTranslation();
    const [localFilters, setLocalFilters] = React.useState<FilterCriteria>(currentFilters);
    const [skillInput, setSkillInput] = React.useState('');

    const allJobCategories = React.useMemo(() => [...new Set(candidates.map(c => c.jobCategory).filter(c => c && c !== 'N/A'))].sort(), [candidates]);
    const allLocations = React.useMemo(() => [...new Set(candidates.map(c => c.location).filter(c => c && c !== 'N/A'))].sort(), [candidates]);
    const experienceLevels = React.useMemo(() => [
        t('dashboard.exp_buckets.junior'),
        t('dashboard.exp_buckets.confirmed'),
        t('dashboard.exp_buckets.senior'),
        t('dashboard.exp_buckets.expert'),
    ], [t]);

    React.useEffect(() => {
        if (isOpen) {
            setLocalFilters(currentFilters);
        }
    }, [isOpen, currentFilters]);

    const handleToggle = (key: keyof FilterCriteria, value: string) => {
        setLocalFilters(prev => {
            const currentValues = prev[key] as string[];
            const newValues = currentValues.includes(value)
                ? currentValues.filter(v => v !== value)
                : [...currentValues, value];
            return { ...prev, [key]: newValues };
        });
    };

    const handleAddSkill = () => {
        if (skillInput && !localFilters.skills.includes(skillInput)) {
            setLocalFilters(prev => ({ ...prev, skills: [...prev.skills, skillInput] }));
            setSkillInput('');
        }
    };

    const handleRemoveSkill = (skillToRemove: string) => {
        setLocalFilters(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skillToRemove) }));
    };

    const handleApply = () => {
        onApply(localFilters);
        onClose();
    };

    const handleReset = () => {
        const freshFilters = { jobCategories: [], locations: [], experienceLevels: [], skills: [] };
        setLocalFilters(freshFilters);
    };
    
    const handleResetAndApply = () => {
        const freshFilters = { jobCategories: [], locations: [], experienceLevels: [], skills: [] };
        setLocalFilters(freshFilters);
        onApply(freshFilters);
        onClose();
    }

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-gray-50 dark:bg-gray-900 flex flex-col animate-fade-in">
            <header className="flex-shrink-0 flex items-center justify-between p-4 border-b dark:border-gray-800 bg-white dark:bg-gray-800">
                <h2 className="text-2xl font-bold font-display text-gray-800 dark:text-gray-100">{t('dashboard.filter_by_job')}</h2>
                <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                    <Icon name="close" className="w-6 h-6" />
                </button>
            </header>

            <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
                <FilterSection title={t('dashboard.charts.location_distribution')}>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {allLocations.map(loc => (
                             <label key={loc} className="flex items-center p-3 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border dark:border-gray-700 has-[:checked]:bg-primary-50 dark:has-[:checked]:bg-primary-900/30 has-[:checked]:border-primary-500">
                                <input
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                    checked={localFilters.locations.includes(loc)}
                                    onChange={() => handleToggle('locations', loc)}
                                />
                                <span className="ml-3 rtl:ml-0 rtl:mr-3 text-gray-700 dark:text-gray-300 truncate">{loc}</span>
                            </label>
                        ))}
                    </div>
                </FilterSection>

                <FilterSection title={t('detail.skills')}>
                    <div className="flex items-center gap-2 mb-4">
                        <input
                            type="text"
                            value={skillInput}
                            onChange={e => setSkillInput(e.target.value)}
                            onKeyPress={e => e.key === 'Enter' && handleAddSkill()}
                            placeholder={t('filter.add_skill_placeholder')}
                            className="w-full p-3 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-pink-500"
                        />
                        <button onClick={handleAddSkill} className="bg-primary-600 text-white p-3 rounded-lg hover:bg-primary-700 transition-colors">
                            <Icon name="plus" className="w-5 h-5"/>
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {localFilters.skills.map(skill => (
                            <span key={skill} className="flex items-center gap-2 bg-secondary-100 text-secondary-800 text-sm font-medium px-3 py-1 rounded-full dark:bg-secondary-900 dark:text-secondary-300">
                                {skill}
                                <button onClick={() => handleRemoveSkill(skill)} className="text-secondary-500 hover:text-secondary-700">
                                    <Icon name="close" className="w-4 h-4"/>
                                </button>
                            </span>
                        ))}
                    </div>
                </FilterSection>

                <FilterSection title={t('dashboard.charts.job_distribution')}>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {allJobCategories.map(cat => (
                            <label key={cat} className="flex items-center p-3 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border dark:border-gray-700 has-[:checked]:bg-primary-50 dark:has-[:checked]:bg-primary-900/30 has-[:checked]:border-primary-500">
                                <input
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                    checked={localFilters.jobCategories.includes(cat)}
                                    onChange={() => handleToggle('jobCategories', cat)}
                                />
                                <span className="ml-3 rtl:ml-0 rtl:mr-3 text-gray-700 dark:text-gray-300 truncate">{cat}</span>
                            </label>
                        ))}
                    </div>
                </FilterSection>

                <FilterSection title={t('dashboard.charts.exp_distribution')}>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {experienceLevels.map(level => (
                             <label key={level} className="flex items-center p-3 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border dark:border-gray-700 has-[:checked]:bg-primary-50 dark:has-[:checked]:bg-primary-900/30 has-[:checked]:border-primary-500">
                                <input
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                    checked={localFilters.experienceLevels.includes(level)}
                                    onChange={() => handleToggle('experienceLevels', level)}
                                />
                                <span className="ml-3 rtl:ml-0 rtl:mr-3 text-gray-700 dark:text-gray-300 truncate">{level}</span>
                            </label>
                        ))}
                    </div>
                </FilterSection>
            </main>

            <footer className="flex-shrink-0 flex items-center justify-end gap-4 p-4 border-t dark:border-gray-800 bg-white dark:bg-gray-800">
                <button
                    onClick={handleResetAndApply}
                    className="font-semibold py-3 px-6 rounded-full text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                    {t('dashboard.clear_filters')}
                </button>
                 <button 
                    onClick={handleApply}
                    className="bg-gradient-button text-white font-bold py-3 px-8 rounded-full hover:opacity-90 transition-opacity"
                >
                    {t('filter.apply_filters')}
                </button>
            </footer>

             <style>{`
                @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
                .animate-fade-in { animation: fade-in 0.2s ease-out forwards; }
            `}</style>
        </div>
    );
};
