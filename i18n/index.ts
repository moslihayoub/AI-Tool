import * as React from 'react';
import { fr, en, ar } from './locales';

type Language = 'fr' | 'en' | 'ar';

const translations = { fr, en, ar };

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string, options?: { [key: string]: string | number }) => string;
}

const LanguageContext = React.createContext<LanguageContextType | undefined>(undefined);

const getNestedTranslation = (obj: any, key: string): string | undefined => {
    return key.split('.').reduce((acc, cur) => acc && acc[cur], obj);
}

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [language, setLanguageState] = React.useState<Language>(() => {
        try {
            const savedLang = localStorage.getItem('language');
            if (savedLang && ['fr', 'en', 'ar'].includes(savedLang)) {
                return savedLang as Language;
            }
            const browserLang = navigator.language.split('-')[0];
            if (browserLang === 'ar') return 'ar';
            if (browserLang === 'fr') return 'fr';
            return 'en'; // Default to English
        } catch {
            return 'en';
        }
    });

    React.useEffect(() => {
        try {
            localStorage.setItem('language', language);
            document.documentElement.lang = language;
            document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
        } catch (error) {
            console.error("Failed to update language settings:", error);
        }
    }, [language]);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
    };

    const t = React.useMemo(() => (key: string, options?: { [key: string]: string | number }): string => {
        const translation = getNestedTranslation(translations[language], key);
        
        if (!translation) {
            console.warn(`[i18n] Missing translation for key: ${key}`);
            return key;
        }

        if (options) {
            return Object.entries(options).reduce((acc, [optKey, optValue]) => {
                 const placeholder = ['s', 'S'].includes(String(optValue)) ? '' : (optValue !== 1 ? 's' : '');
                 return acc.replace(new RegExp(`{{${optKey}}}`, 'g'), String(optValue))
                         .replace(new RegExp(`{{plural:${optKey}}}`, 'g'), placeholder);
            }, translation);
        }

        return translation;
    }, [language]);

    const value = { language, setLanguage, t };

    return React.createElement(LanguageContext.Provider, { value }, children);
};

export const useTranslation = (): LanguageContextType => {
    const context = React.useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useTranslation must be used within a LanguageProvider');
    }
    return context;
};
