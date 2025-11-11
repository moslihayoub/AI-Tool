// FIX: Changed react import to namespace import to resolve JSX intrinsic element type errors.
import * as React from 'react';
import { Icon } from './icons';
import { Theme } from '../types';
import { useTranslation } from '../i18n';

interface SettingsViewProps {
    theme: Theme;
    setTheme: (theme: Theme) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ theme, setTheme }) => {
    const { t, language, setLanguage } = useTranslation();

    const activeBtnClasses = "bg-primary-600 text-white";
    const inactiveBtnClasses = "bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600";

    return (
        <div className="p-4 sm:p-8 space-y-8">
            <header>
                <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">{t('settings.title')}</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-1">{t('settings.subtitle')}</p>
            </header>

            <div className="max-w-md space-y-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border dark:border-gray-700">
                    <h3 className="text-lg font-semibold mb-3">{t('settings.language.title')}</h3>
                    <div className="flex space-x-2">
                        <button 
                            onClick={() => setLanguage('fr')} 
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${language === 'fr' ? activeBtnClasses : inactiveBtnClasses}`}
                        >
                            <Icon name="fr-flag" className="w-6 h-6 rounded-full" />
                            <span>{t('settings.language.french')}</span>
                        </button>
                        <button
                            onClick={() => setLanguage('en')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${language === 'en' ? activeBtnClasses : inactiveBtnClasses}`}
                        >
                             <Icon name="gb-flag" className="w-6 h-6 rounded-full" />
                            <span>{t('settings.language.english')}</span>
                        </button>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border dark:border-gray-700">
                    <h3 className="text-lg font-semibold mb-3">{t('settings.theme.title')}</h3>
                    <div className="flex space-x-2">
                        <button 
                            onClick={() => setTheme('light')} 
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors w-full justify-center ${theme === 'light' ? activeBtnClasses : inactiveBtnClasses}`}
                        >
                            <Icon name="sun" className="w-5 h-5"/>
                            <span>{t('settings.theme.light')}</span>
                        </button>
                         <button 
                            onClick={() => setTheme('dark')} 
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors w-full justify-center ${theme === 'dark' ? activeBtnClasses : inactiveBtnClasses}`}
                        >
                             <Icon name="moon" className="w-5 h-5"/>
                            <span>{t('settings.theme.dark')}</span>
                        </button>
                         <button 
                            onClick={() => setTheme('system')} 
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors w-full justify-center ${theme === 'system' ? activeBtnClasses : inactiveBtnClasses}`}
                        >
                             <Icon name="desktop" className="w-5 h-5"/>
                            <span>{t('settings.theme.system')}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};