import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { fr, en } from './locales';

type Language = 'fr' | 'en';

const translations = { fr, en };

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string, options?: { [key: string]: string | number }) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const getNestedTranslation = (obj: any, key: string): string | undefined => {
    return key.split('.').reduce((acc, cur) => acc && acc[cur], obj);
}

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [language, setLanguageState] = useState<Language>(() => {
        const savedLang = localStorage.getItem('language');
        return (savedLang === 'en' || savedLang === 'fr') ? savedLang : 'fr';
    });

    useEffect(() => {
        localStorage.setItem('language', language);
        document.documentElement.lang = language;
    }, [language]);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
    };

    const t = useMemo(() => (key: string, options?: { [key: string]: string | number }): string => {
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

    // FIX: Replaced JSX with React.createElement to be compatible with a .ts file extension.
    return React.createElement(LanguageContext.Provider, { value }, children);
};

export const useTranslation = (): LanguageContextType => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useTranslation must be used within a LanguageProvider');
    }
    return context;
};