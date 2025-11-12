// FIX: Changed React import to namespace import `* as React` to resolve widespread JSX intrinsic element type errors, which likely stem from a project configuration that requires this import style.
import * as React from 'react';
import { Icon } from './icons';
import { Theme } from '../types';
import { useTranslation } from '../i18n';

interface SettingsViewProps {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    onLoadDummyData: () => void;
    isDummyDataButtonDisabled: boolean;
    onOpenQuotaModal: () => void;
    isOwner: boolean;
    onDisconnect: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ theme, setTheme, onLoadDummyData, isDummyDataButtonDisabled, onOpenQuotaModal, isOwner, onDisconnect }) => {
    const { t, language, setLanguage } = useTranslation();
    const [confirmDisconnect, setConfirmDisconnect] = React.useState(false);

    const activeBtnClasses = "bg-primary-600 text-white";
    const inactiveBtnClasses = "bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600";
    
    const handleDisconnectClick = () => {
        if (confirmDisconnect) {
            onDisconnect();
            setConfirmDisconnect(false);
        } else {
            setConfirmDisconnect(true);
            setTimeout(() => setConfirmDisconnect(false), 3000);
        }
    };

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
                            <span className="hidden sm:inline">{t('settings.theme.light')}</span>
                        </button>
                         <button 
                            onClick={() => setTheme('dark')} 
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors w-full justify-center ${theme === 'dark' ? activeBtnClasses : inactiveBtnClasses}`}
                        >
                             <Icon name="moon" className="w-5 h-5"/>
                            <span className="hidden sm:inline">{t('settings.theme.dark')}</span>
                        </button>
                         <button 
                            onClick={() => setTheme('system')} 
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors w-full justify-center ${theme === 'system' ? activeBtnClasses : inactiveBtnClasses}`}
                        >
                             <Icon name="desktop" className="w-5 h-5"/>
                            <span className="hidden sm:inline">{t('settings.theme.system')}</span>
                        </button>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border dark:border-gray-700">
                    {isOwner ? (
                        <>
                            <h3 className="text-lg font-semibold mb-3">{t('settings.connection.title_connected')}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{t('settings.connection.description_connected')}</p>
                            <div className="relative">
                                <button
                                    onClick={handleDisconnectClick}
                                    className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${
                                        confirmDisconnect 
                                        ? 'bg-yellow-500 text-white hover:bg-yellow-600' 
                                        : 'bg-red-600 text-white hover:bg-red-700'
                                    }`}
                                >
                                    <Icon name="log-out" className="w-5 h-5"/>
                                    <span>{confirmDisconnect ? t('common.reset_confirm_action') : t('settings.connection.button_disconnect')}</span>
                                </button>
                                {confirmDisconnect && (
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs bg-gray-900 text-white text-xs rounded py-2 px-3 opacity-100 transition-opacity pointer-events-none z-10 shadow-lg text-center dark:bg-gray-700">
                                        {t('settings.connection.disconnect_confirm')}
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <>
                            <h3 className="text-lg font-semibold mb-3">{t('settings.connection.title')}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{t('settings.connection.description')}</p>
                            <button
                                onClick={onOpenQuotaModal}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors bg-primary-600 text-white hover:bg-primary-700"
                            >
                                <Icon name="link" className="w-5 h-5"/>
                                <span>{t('settings.connection.button')}</span>
                            </button>
                        </>
                    )}
                </div>


                 <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border dark:border-gray-700">
                    <h3 className="text-lg font-semibold mb-3">{t('settings.data.title')}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{t('settings.data.dummy_description')}</p>
                    <button 
                        onClick={onLoadDummyData}
                        disabled={isDummyDataButtonDisabled}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors bg-secondary-600 text-white hover:bg-secondary-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        <Icon name="bot" className="w-5 h-5"/>
                        <span>{t('settings.data.load_dummy')}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};