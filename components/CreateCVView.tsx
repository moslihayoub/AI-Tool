import React, { useState, useEffect } from 'react';
import { Icon } from './icons';
import { useTranslation } from '../i18n';
import { parseCvContent } from '../services/geminiService';
import { useToast } from './Toast';
import type { CandidateProfile } from '../types';

type CVTemplate = 'minimalist' | 'technical' | 'executive' | 'freelance';

interface Experience { id: string; title: string; company: string; period: string; description: string; }
interface Education { id: string; degree: string; school: string; year: string; }
interface Language { id: string; name: string; level: string; }
interface Certification { id: string; name: string; organization: string; year: string; }

export const CreateCVView: React.FC = () => {
    const { t } = useTranslation();
    const { showToast } = useToast();
    const [template, setTemplate] = useState<CVTemplate>('minimalist');

    const [activeSection, setActiveSection] = useState<string>('personal');
    const [photo, setPhoto] = useState<string | null>(null);

    const [hasDraft, setHasDraft] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [shareVisibility, setShareVisibility] = useState<'private' | 'public' | 'listed'>('private');
    const shareLink = `https://parseliq.app/cv/${Math.random().toString(36).substring(2, 10)}`;

    const [isImporting, setIsImporting] = useState(false);
    const [importProgress, setImportProgress] = useState(0);
    const [importStatus, setImportStatus] = useState<string | null>(null);
    const [importTab, setImportTab] = useState<'link'|'doc'>('link');
    const [urlImportLink, setUrlImportLink] = useState('');

    const [personalInfo, setPersonalInfo] = useState({
        name: 'Jean Dupont',
        jobTitle: 'Développeur Full Stack',
        email: 'jean.dupont@example.com',
        phone: '06 12 34 56 78',
        location: 'Paris, France',
        linkedin: 'linkedin.com/in/jeandupont',
        website: 'jeandupont.dev',
        summary: 'Développeur passionné avec 5 ans d\'expérience dans la création d\'applications web robustes et scalables. Adepte des méthodologies agiles.',
        skills: 'React, Node.js, TypeScript, AWS, Docker'
    });

    const [experiences, setExperiences] = useState<Experience[]>([
        { id: '1', title: 'Lead Tech', company: 'Startup inc', period: '2020 - Présent', description: 'Direction technique de l\'équipe front-end.' },
        { id: '2', title: 'Développeur web', company: 'Agence X', period: '2018 - 2020', description: 'Création de sites vitrines et applications métiers.' }
    ]);

    const [education, setEducation] = useState<Education[]>([
        { id: '1', degree: 'Master Informatique', school: 'Ensimag', year: '2018' }
    ]);

    const [languages, setLanguages] = useState<Language[]>([
        { id: '1', name: 'Français', level: 'Natif' },
        { id: '2', name: 'Anglais', level: 'Courant' }
    ]);

    const [certifications, setCertifications] = useState<Certification[]>([
        { id: '1', name: 'AWS Cloud Practitioner', organization: 'Amazon', year: '2021' }
    ]);

    useEffect(() => {
        const draft = localStorage.getItem('parseLIQ_cv_draft');
        if (draft) {
            setHasDraft(true);
        }

        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isDirty) {
                e.preventDefault();
                e.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        
        // Sync with window object for App.tsx navigation blocker
        window.isCVDirty = isDirty;
        
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isDirty]);

    // Handle AI Suggestions
    useEffect(() => {
        const handleAiSuggestion = (e: CustomEvent) => {
            const { field, content } = e.detail;
            if (field === 'summary') {
                setPersonalInfo(prev => ({ ...prev, summary: content }));
                // Trigger a highlight effect later if possible
                const el = document.getElementById('summary-input');
                if (el) {
                    el.classList.add('ring-2', 'ring-yellow-400', 'bg-yellow-50', 'dark:bg-yellow-900/30');
                    setTimeout(() => {
                        el.classList.remove('ring-2', 'ring-yellow-400', 'bg-yellow-50', 'dark:bg-yellow-900/30');
                    }, 2000);
                }
            } else if (field === 'skills') {
               setPersonalInfo(prev => ({ ...prev, skills: content }));
            }
        };

        window.addEventListener('apply-ai-suggestion', handleAiSuggestion as EventListener);
        return () => window.removeEventListener('apply-ai-suggestion', handleAiSuggestion as EventListener);
    }, []);

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        setIsDirty(true);
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setPhoto(event.target?.result as string);
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const handleSaveDraft = () => {
        const data = { personalInfo, experiences, education, languages, certifications, template, photo };
        localStorage.setItem('parseLIQ_cv_draft', JSON.stringify(data));
        setHasDraft(false);
        setIsDirty(false);
        showToast('Brouillon enregistré avec succès !', 'success');
    };

    const handleLoadDraft = () => {
        const data = JSON.parse(localStorage.getItem('parseLIQ_cv_draft') || '{}');
        if (data.personalInfo) setPersonalInfo(data.personalInfo);
        if (data.experiences) setExperiences(data.experiences);
        if (data.education) setEducation(data.education);
        if (data.languages) setLanguages(data.languages);
        if (data.certifications) setCertifications(data.certifications);
        if (data.template) setTemplate(data.template);
        if (data.photo) setPhoto(data.photo);
        setHasDraft(false);
        setIsDirty(false);
    };

    const simulateProgress = () => {
        setIsImporting(true);
        setImportProgress(0);
        const interval = setInterval(() => {
            setImportProgress(prev => {
                if (prev >= 95) {
                    clearInterval(interval);
                    return 95;
                }
                return prev + Math.random() * 15;
            });
        }, 300);
        return interval;
    };

    const populateFromProfile = (profile: CandidateProfile) => {
        setPersonalInfo({
            name: profile.name && profile.name !== 'N/A' ? profile.name : '',
            jobTitle: profile.jobCategory && profile.jobCategory !== 'N/A' && profile.jobCategory !== 'Other' ? profile.jobCategory : '',
            skills: profile.skills ? [...(profile.skills.hard || []), ...(profile.skills.soft || [])].join(', ') : '',
            summary: profile.summary && profile.summary !== 'N/A' ? profile.summary : '',
            email: profile.email && profile.email !== 'N/A' ? profile.email : '',
            phone: profile.phone && profile.phone !== 'N/A' ? profile.phone : '',
            location: profile.location && profile.location !== 'N/A' ? profile.location : '',
            linkedin: profile.linkedin && profile.linkedin !== 'N/A' ? profile.linkedin : '',
            website: profile.website && profile.website !== 'N/A' ? profile.website : '',
        });

        if (profile.experience && profile.experience.length > 0) {
            setExperiences(profile.experience.map((exp) => ({
                id: Math.random().toString(),
                title: exp.title || '',
                company: exp.company || '',
                period: exp.dates || '',
                description: exp.description || ''
            })));
        } else {
            setExperiences([]);
        }

        if (profile.education && profile.education.length > 0) {
            setEducation(profile.education.map((edu) => ({
                id: Math.random().toString(),
                degree: edu.degree || '',
                school: edu.school || '',
                year: edu.dates || ''
            })));
        } else {
            setEducation([]);
        }

        if (profile.languages && profile.languages.length > 0) {
            setLanguages(profile.languages.map((lang: string) => ({
                 id: Math.random().toString(),
                 name: lang,
                 level: 'Courant'
            })));
        } else {
            setLanguages([]);
        }

        if (profile.certifications && profile.certifications.length > 0) {
            setCertifications(profile.certifications.map((cert: string) => ({
                 id: Math.random().toString(),
                 name: cert,
                 organization: '',
                 year: ''
            })));
        } else {
            setCertifications([]);
        }
        setIsDirty(true);
        setTimeout(() => {
            setImportStatus(null);
            setIsImporting(false);
            setImportProgress(100);
        }, 1000);
    };

    const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setImportStatus('Analyse du document...');
        const interval = simulateProgress();
        
        try {
            const fileData = await new Promise<{mimeType: string, data: string}>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve({ mimeType: file.type, data: (reader.result as string).split(',')[1] });
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
            
            const profile = await parseCvContent(fileData);
            clearInterval(interval);
            setImportProgress(100);
            populateFromProfile(profile);
            setImportStatus('Données importées avec succès !');
        } catch (err) {
            clearInterval(interval);
            setIsImporting(false);
            setImportStatus("Erreur lors de l'importation CV");
            console.error(err);
        }
    };

    const handleUrlImport = async () => {
        if (!urlImportLink) return;
        setImportStatus('Analyse du profil...');
        const interval = simulateProgress();
        
        try {
            const fileName = urlImportLink.includes('.pdf') ? 'doc.pdf' : 'doc.txt';
            const file = new File(['Contenu importé depuis: ' + urlImportLink], fileName, { type: 'text/plain' });
            
            const fileData = await new Promise<{mimeType: string, data: string}>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve({ mimeType: file.type, data: (reader.result as string).split(',')[1] });
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
            
            const profile = await parseCvContent(fileData);
            clearInterval(interval);
            setImportProgress(100);
            populateFromProfile(profile);
            setImportStatus('Données importées avec succès !');
        } catch (err) {
            clearInterval(interval);
            setIsImporting(false);
            setImportStatus("Erreur lors de l'importation URL");
            console.error(err);
        }
    };

    const handleExportPDF = () => {
        window.print();
    };

    const handleExportWord = () => {
        // Simple HTML to Word export
        const content = document.getElementById('cv-preview-content');
        if (!content) return;

        const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Export CV</title><style>body { font-family: sans-serif; }</style></head><body>";
        const footer = "</body></html>";
        const sourceHTML = header + content.innerHTML + footer;
        
        const blob = new Blob(['\ufeff', sourceHTML], {
            type: 'application/msword'
        });
        
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${personalInfo.name.replace(/\s+/g, '_')}_CV.doc`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleChange = <T,>(setter: React.Dispatch<React.SetStateAction<T>>) => (val: T) => {
        setIsDirty(true);
        setter(val);
    };

    const SectionHeader = ({ id, icon, title }: { id: string, icon: string, title: string }) => (
        <button 
            className={`w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg font-bold border transition-colors ${activeSection === id ? 'border-pink-500 text-pink-600 dark:text-pink-400' : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'}`}
            onClick={() => setActiveSection(activeSection === id ? '' : id)}
        >
            <div className="flex items-center gap-2">
                <Icon name={icon} className="w-5 h-5"/> {title}
            </div>
            <Icon name={activeSection === id ? 'chevron-up' : 'chevron-down'} className="w-4 h-4" />
        </button>
    );

    return (
        <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50 dark:bg-gray-900 print:bg-white text-gray-900 dark:text-gray-100">
            {/* Form Side */}
            <div className="w-full lg:w-1/3 p-6 lg:h-screen lg:overflow-y-auto border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 print:hidden relative">
                <div className="mb-6 flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-bold font-display flex items-center gap-2">
                            <Icon name="file-pen" className="w-6 h-6 text-pink-500" />
                            {t('create_cv.title')}
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{t('create_cv.subtitle')}</p>
                    </div>
                </div>

                {hasDraft && (
                    <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700/50 rounded-xl flex flex-col gap-3">
                        <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-200">{t('create_cv.draft_banner')}</p>
                        <div className="flex gap-2">
                            <button onClick={handleLoadDraft} className="flex-1 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 px-3 py-1.5 rounded text-xs font-bold transition-colors">{t('create_cv.resume')}</button>
                            <button onClick={() => { localStorage.removeItem('parseLIQ_cv_draft'); setHasDraft(false); }} className="flex-1 border border-yellow-300 dark:border-yellow-700 text-yellow-700 dark:text-yellow-300 px-3 py-1.5 rounded text-xs font-bold hover:bg-yellow-500/10 transition-colors">{t('create_cv.ignore')}</button>
                        </div>
                    </div>
                )}

                <div className="mb-6 p-5 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold flex items-center gap-2"><Icon name="download" className="w-4 h-4"/> {t('create_cv.import_data')}</h3>
                    </div>
                    <div className="flex flex-col sm:flex-row xl:flex-row gap-2 p-1 bg-gray-200/50 dark:bg-gray-700/50 rounded-xl mb-4">
                        <button 
                            onClick={() => setImportTab('link')} 
                            className={`flex-1 py-2 px-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${importTab === 'link' ? 'bg-white dark:bg-gray-800 text-pink-600 shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-white/50 dark:hover:bg-gray-800/50'}`}
                        >
                            <Icon name="link" className="w-3.5 h-3.5" />
                            {t('create_cv.via_link')}
                        </button>
                        <button 
                            onClick={() => setImportTab('doc')} 
                            className={`flex-1 py-2 px-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${importTab === 'doc' ? 'bg-white dark:bg-gray-800 text-pink-600 shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-white/50 dark:hover:bg-gray-800/50'}`}
                        >
                            <Icon name="upload" className="w-3.5 h-3.5" />
                            {t('create_cv.import_doc')}
                        </button>
                    </div>

                    {importTab === 'link' ? (
                        <div className="flex flex-col 2xl:flex-row gap-2">
                            <input 
                              type="url" 
                              placeholder="Lien (LinkedIn, GDocs..)" 
                              className="flex-1 p-2 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 outline-none focus:ring-1 focus:ring-pink-500" 
                              value={urlImportLink}
                              onChange={(e) => setUrlImportLink(e.target.value)}
                              disabled={isImporting}
                            />
                            <button onClick={handleUrlImport} disabled={isImporting} className="bg-pink-500 text-white px-4 py-2 2xl:py-1.5 rounded-lg text-xs font-bold hover:bg-pink-600 transition shadow-sm disabled:opacity-50 shrink-0 w-full 2xl:w-auto">Analyser</button>
                        </div>
                    ) : (
                        <div className="flex flex-col">
                            <label className={`cursor-pointer border border-dashed border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-xl p-4 flex flex-col items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-800 transition shadow-sm ${isImporting ? 'opacity-50 pointer-events-none' : ''}`}>
                                <input type="file" accept=".pdf,.csv,.xlsx,.xls,.ods" className="hidden" onChange={handleFileImport} disabled={isImporting} />
                                <Icon name="upload" className="w-5 h-5 text-gray-400 mb-2" />
                                <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Sélectionner un fichier</span>
                            </label>
                            <p className="text-[10px] text-gray-500 mt-2 text-center">Formats acceptés : PDF, CSV, Excel (XLSX, XLS), ODS</p>
                        </div>
                    )}
                    
                    {isImporting && (
                        <div className="mt-4 animate-in fade-in slide-in-from-bottom-2">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-[10px] font-bold text-pink-600 animate-pulse">{importStatus}</span>
                                <span className="text-[10px] font-bold text-gray-500">{Math.round(importProgress)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
                                <div 
                                    className="bg-pink-500 h-full transition-all duration-300 ease-out shadow-[0_0_8px_rgba(236,72,153,0.5)]" 
                                    style={{ width: `${importProgress}%` }}
                                />
                            </div>
                        </div>
                    )}
                    
                    {!isImporting && importStatus && (
                        <p className={`text-xs mt-2 font-medium animate-in fade-in ${importStatus.includes('Erreur') ? 'text-red-500' : 'text-green-600 dark:text-green-400'}`}>
                            {importStatus}
                        </p>
                    )}
                </div>

                <div className="space-y-4">
                    <div className="p-4 bg-gray-50 dark:bg-gray-800/30 border border-gray-200 dark:border-gray-700 rounded-2xl">
                        <label className="block text-sm font-bold mb-2 flex items-center gap-2">
                            <Icon name="palette" className="w-4 h-4 text-pink-500"/>
                            Modèle visuel
                        </label>
                        <select 
                            value={template} 
                            onChange={e => setTemplate(e.target.value as CVTemplate)}
                            className="w-full p-2.5 border rounded-xl bg-white dark:bg-gray-800 dark:border-gray-700 outline-none focus:ring-2 focus:ring-pink-500 transition-shadow text-sm"
                        >
                            <option value="minimalist">Minimaliste</option>
                            <option value="technical">Technique (Code)</option>
                            <option value="executive">Cadre (Élégant)</option>
                            <option value="freelance">Freelance (Créatif)</option>
                        </select>
                    </div>

                    <div className="space-y-3">
                        <SectionHeader id="personal" icon="user" title="Infos Personnelles & Profil" />
                        {activeSection === 'personal' && (
                            <div className="p-5 border rounded-2xl dark:border-gray-700 space-y-5 animate-in slide-in-from-top-2 shadow-sm bg-white dark:bg-gray-900">
                                <div className="flex flex-col items-center gap-3">
                                    <div className="w-20 h-20 rounded-full border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center overflow-hidden bg-gray-50 dark:bg-gray-800 relative group cursor-pointer">
                                        {photo ? (
                                            <img src={photo} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            <Icon name="user" className="w-8 h-8 text-gray-400" />
                                        )}
                                        <div className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center">
                                            <Icon name="upload" className="w-5 h-5 text-white" />
                                        </div>
                                        <input type="file" accept="image/*" onChange={handlePhotoUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                                    </div>
                                    {photo && <button onClick={() => setPhoto(null)} className="text-xs text-red-500 hover:underline">Supprimer</button>}
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold mb-1">Nom Complet</label>
                                        <input type="text" value={personalInfo.name} onChange={e => handleChange(setPersonalInfo)({...personalInfo, name: e.target.value})} className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 outline-none text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold mb-1">Titre</label>
                                        <input type="text" value={personalInfo.jobTitle} onChange={e => handleChange(setPersonalInfo)({...personalInfo, jobTitle: e.target.value})} className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 outline-none text-sm" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold mb-1">Résumé / Profil</label>
                                    <textarea id="summary-input" rows={4} value={personalInfo.summary} onChange={e => handleChange(setPersonalInfo)({...personalInfo, summary: e.target.value})} className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 outline-none text-sm resize-none transition-colors duration-300" placeholder="Utilisez l'assistant IA pour l'améliorer !"></textarea>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold mb-1">Email</label>
                                        <input type="email" value={personalInfo.email} onChange={e => handleChange(setPersonalInfo)({...personalInfo, email: e.target.value})} className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 outline-none text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold mb-1">Téléphone</label>
                                        <input type="tel" value={personalInfo.phone} onChange={e => handleChange(setPersonalInfo)({...personalInfo, phone: e.target.value})} className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 outline-none text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold mb-1">Localisation</label>
                                        <input type="text" value={personalInfo.location} onChange={e => handleChange(setPersonalInfo)({...personalInfo, location: e.target.value})} className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 outline-none text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold mb-1">LinkedIn URL</label>
                                        <input type="text" value={personalInfo.linkedin} onChange={e => handleChange(setPersonalInfo)({...personalInfo, linkedin: e.target.value})} className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 outline-none text-sm" />
                                    </div>
                                </div>
                            </div>
                        )}

                        <SectionHeader id="experience" icon="briefcase" title="Expériences" />
                        {activeSection === 'experience' && (
                            <div className="p-5 border rounded-2xl dark:border-gray-700 space-y-4 animate-in slide-in-from-top-2 shadow-sm bg-white dark:bg-gray-900">
                                {experiences.map((exp, idx) => (
                                    <div key={exp.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border dark:border-gray-600 relative group transition-all hover:border-pink-300 dark:hover:border-pink-800 hover:shadow-md">
                                        <button onClick={() => handleChange(setExperiences)(experiences.filter(e => e.id !== exp.id))} className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition-colors"><Icon name="trash" className="w-4 h-4"/></button>
                                        <div className="grid grid-cols-2 gap-2 mb-2">
                                            <input type="text" placeholder="Poste" value={exp.title} onChange={e => handleChange(setExperiences)(experiences.map(x => x.id === exp.id ? {...x, title: e.target.value} : x))} className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 outline-none text-sm text-gray-900 dark:text-gray-100 focus:ring-1 focus:ring-pink-500" />
                                            <input type="text" placeholder="Entreprise" value={exp.company} onChange={e => handleChange(setExperiences)(experiences.map(x => x.id === exp.id ? {...x, company: e.target.value} : x))} className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 outline-none text-sm text-gray-900 dark:text-gray-100 focus:ring-1 focus:ring-pink-500" />
                                        </div>
                                        <input type="text" placeholder="Période (ex: Jan 2020 - Présent)" value={exp.period} onChange={e => handleChange(setExperiences)(experiences.map(x => x.id === exp.id ? {...x, period: e.target.value} : x))} className="w-full p-2 mb-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 outline-none text-sm text-gray-900 dark:text-gray-100 focus:ring-1 focus:ring-pink-500" />
                                        <textarea placeholder="Description" value={exp.description} onChange={e => handleChange(setExperiences)(experiences.map(x => x.id === exp.id ? {...x, description: e.target.value} : x))} className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 outline-none text-sm text-gray-900 dark:text-gray-100 resize-none focus:ring-1 focus:ring-pink-500" rows={3}></textarea>
                                    </div>
                                ))}
                                <button onClick={() => handleChange(setExperiences)([...experiences, { id: Date.now().toString(), title: '', company: '', period: '', description: '' }])} className="w-full border-2 border-dashed border-gray-300 dark:border-gray-600 p-3 rounded-xl text-sm font-bold text-gray-500 hover:text-pink-500 hover:border-pink-500 hover:bg-pink-50/50 dark:hover:bg-pink-900/10 flex justify-center items-center gap-2 transition-all"><Icon name="plus" className="w-4 h-4"/> Ajouter une expérience</button>
                            </div>
                        )}

                        <SectionHeader id="skills" icon="star" title="Compétences" />
                        {activeSection === 'skills' && (
                            <div className="p-5 border rounded-2xl dark:border-gray-700 animate-in slide-in-from-top-2 shadow-sm bg-white dark:bg-gray-900">
                                <label className="block text-xs font-bold mb-2 text-gray-500 uppercase tracking-wider">Mots-clés séparés par des virgules</label>
                                <textarea id="skills-input" value={personalInfo.skills} onChange={e => handleChange(setPersonalInfo)({...personalInfo, skills: e.target.value})} rows={3} className="w-full p-3 border rounded-xl dark:bg-gray-800 dark:border-gray-700 outline-none text-sm text-gray-900 dark:text-gray-100 transition-all focus:ring-2 focus:ring-pink-500" placeholder="React, Node.js, Leadership..."></textarea>
                            </div>
                        )}

                        <SectionHeader id="education" icon="graduation-cap" title="Formation" />
                        {activeSection === 'education' && (
                            <div className="p-5 border rounded-2xl dark:border-gray-700 space-y-4 animate-in slide-in-from-top-2 shadow-sm bg-white dark:bg-gray-900">
                                {education.map((edu) => (
                                    <div key={edu.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border dark:border-gray-600 relative group transition-all hover:border-pink-300 dark:hover:border-pink-800 hover:shadow-md">
                                        <button onClick={() => handleChange(setEducation)(education.filter(e => e.id !== edu.id))} className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition-colors"><Icon name="trash" className="w-4 h-4"/></button>
                                        <input type="text" placeholder="Diplôme" value={edu.degree} onChange={e => handleChange(setEducation)(education.map(x => x.id === edu.id ? {...x, degree: e.target.value} : x))} className="w-full p-2 mb-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 outline-none text-sm text-gray-900 dark:text-gray-100 focus:ring-1 focus:ring-pink-500" />
                                        <div className="grid grid-cols-2 gap-2">
                                            <input type="text" placeholder="École" value={edu.school} onChange={e => handleChange(setEducation)(education.map(x => x.id === edu.id ? {...x, school: e.target.value} : x))} className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 outline-none text-sm text-gray-900 dark:text-gray-100 focus:ring-1 focus:ring-pink-500" />
                                            <input type="text" placeholder="Année" value={edu.year} onChange={e => handleChange(setEducation)(education.map(x => x.id === edu.id ? {...x, year: e.target.value} : x))} className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 outline-none text-sm text-gray-900 dark:text-gray-100 focus:ring-1 focus:ring-pink-500" />
                                        </div>
                                    </div>
                                ))}
                                <button onClick={() => handleChange(setEducation)([...education, { id: Date.now().toString(), degree: '', school: '', year: '' }])} className="w-full border-2 border-dashed border-gray-300 dark:border-gray-600 p-3 rounded-xl text-sm font-bold text-gray-500 hover:text-pink-500 hover:border-pink-500 hover:bg-pink-50/50 dark:hover:bg-pink-900/10 flex justify-center items-center gap-2 transition-all"><Icon name="plus" className="w-4 h-4"/> Ajouter une formation</button>
                            </div>
                        )}

                        <SectionHeader id="lang-cert" icon="check" title="Langues & Certifs." />
                        {activeSection === 'lang-cert' && (
                            <div className="p-5 border rounded-2xl dark:border-gray-700 space-y-6 animate-in slide-in-from-top-2 shadow-sm bg-white dark:bg-gray-900">
                                <div>
                                    <h4 className="text-sm font-bold mb-3 flex items-center gap-2"><Icon name="globe" className="w-4 h-4 text-pink-500"/> Langues</h4>
                                    {languages.map((lang) => (
                                        <div key={lang.id} className="flex gap-2 mb-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg border dark:border-gray-700">
                                            <input type="text" placeholder="Langue" value={lang.name} onChange={e => handleChange(setLanguages)(languages.map(x => x.id === lang.id ? {...x, name: e.target.value} : x))} className="w-1/2 p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 outline-none text-sm text-gray-900 dark:text-gray-100 focus:ring-1 focus:ring-pink-500" />
                                            <select value={lang.level} onChange={e => handleChange(setLanguages)(languages.map(x => x.id === lang.id ? {...x, level: e.target.value} : x))} className="w-1/2 p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 outline-none text-sm text-gray-900 dark:text-gray-100 focus:ring-1 focus:ring-pink-500">
                                                <option value="Débutant">Débutant</option>
                                                <option value="Intermédiaire">Intermédiaire</option>
                                                <option value="Courant">Courant</option>
                                                <option value="Bilingue/Natif">Bilingue/Natif</option>
                                            </select>
                                            <button onClick={() => handleChange(setLanguages)(languages.filter(x => x.id !== lang.id))} className="p-2 text-gray-400 hover:text-red-500 transition-colors"><Icon name="trash" className="w-4 h-4" /></button>
                                        </div>
                                    ))}
                                    <button onClick={() => handleChange(setLanguages)([...languages, { id: Date.now().toString(), name: '', level: 'Débutant' }])} className="text-xs font-bold text-pink-500 flex items-center gap-1 mt-2 hover:underline"><Icon name="plus" className="w-3 h-3"/> Ajouter langue</button>
                                </div>
                                <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                                    <h4 className="text-sm font-bold mb-3 flex items-center gap-2"><Icon name="award" className="w-4 h-4 text-pink-500"/> Certifications</h4>
                                     {certifications.map((cert) => (
                                        <div key={cert.id} className="flex flex-col gap-2 mb-3 bg-gray-50 dark:bg-gray-800 p-3 rounded-xl border dark:border-gray-700 relative group transition-all hover:shadow-sm">
                                            <div className="flex justify-between items-center">
                                                <input type="text" placeholder="Nom Certification" value={cert.name} onChange={e => handleChange(setCertifications)(certifications.map(x => x.id === cert.id ? {...x, name: e.target.value} : x))} className="flex-1 p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 outline-none text-sm text-gray-900 dark:text-gray-100 mr-2 focus:ring-1 focus:ring-pink-500 font-bold" />
                                                <button onClick={() => handleChange(setCertifications)(certifications.filter(x => x.id !== cert.id))} className="text-gray-400 hover:text-red-500 transition-colors"><Icon name="trash" className="w-4 h-4" /></button>
                                            </div>
                                            <div className="flex gap-2">
                                                 <input type="text" placeholder="Organisme" value={cert.organization} onChange={e => handleChange(setCertifications)(certifications.map(x => x.id === cert.id ? {...x, organization: e.target.value} : x))} className="w-2/3 p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 outline-none text-sm text-gray-900 dark:text-gray-100 focus:ring-1 focus:ring-pink-500" />
                                                 <input type="text" placeholder="Année" value={cert.year} onChange={e => handleChange(setCertifications)(certifications.map(x => x.id === cert.id ? {...x, year: e.target.value} : x))} className="w-1/3 p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 outline-none text-sm text-gray-900 dark:text-gray-100 focus:ring-1 focus:ring-pink-500" />
                                            </div>
                                        </div>
                                    ))}
                                    <button onClick={() => handleChange(setCertifications)([...certifications, { id: Date.now().toString(), name: '', organization: '', year: '' }])} className="text-xs font-bold text-pink-500 flex items-center gap-1 mt-2 hover:underline"><Icon name="plus" className="w-3 h-3"/> Ajouter certification</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-10 space-y-4 pb-8">
                    <div className="flex flex-col gap-3">
                         <div className="flex gap-2">
                             <button onClick={handleExportPDF} className="flex-1 bg-pink-500 text-white py-3.5 rounded-2xl font-bold shadow-md hover:shadow-lg transition-all flex justify-center items-center gap-2 text-xs group">
                                 <Icon name="download" className="w-4 h-4 group-hover:translate-y-0.5 transition-transform"/>
                                 PDF
                             </button>
                             <button onClick={handleExportWord} className="flex-1 bg-blue-600 text-white py-3.5 rounded-2xl font-bold shadow-md hover:shadow-lg transition-all flex justify-center items-center gap-2 text-xs group">
                                 <Icon name="word" className="w-4 h-4 group-hover:translate-y-0.5 transition-transform"/>
                                 Word
                             </button>
                         </div>
                         <button onClick={() => setShowShareModal(true)} className="w-full bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 py-3.5 rounded-2xl font-bold shadow-md hover:shadow-lg transition-all flex justify-center items-center gap-2 text-sm group">
                             <Icon name="share-2" className="w-4 h-4 group-hover:scale-110 transition-transform"/>
                             Partager mon CV
                         </button>
                    </div>
                    <button onClick={handleSaveDraft} className="w-full border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-3.5 rounded-2xl font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all flex justify-center items-center gap-2 text-sm">
                        <Icon name="save" className="w-4 h-4"/>
                        {t('create_cv.save_draft')}
                    </button>
                </div>
            </div>

            {/* Share Modal */}
            {showShareModal && (
                <div className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden animate-in zoom-in-95 border border-gray-100 dark:border-gray-800">
                        <div className="p-8">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-2xl font-bold font-display">Partager votre CV</h3>
                                <button onClick={() => setShowShareModal(false)} className="bg-gray-100 dark:bg-gray-800 p-2 rounded-full text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"><Icon name="close" className="w-5 h-5"/></button>
                            </div>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold mb-3 flex items-center gap-2 uppercase tracking-widest opacity-70">
                                        <Icon name="eye" className="w-4 h-4 text-pink-500"/>
                                        Visibilité
                                    </label>
                                    <div className="grid grid-cols-3 gap-2">
                                        <button onClick={() => setShareVisibility('private')} className={`py-3 px-2 rounded-xl border text-[10px] font-bold flex flex-col items-center gap-2 transition-all ${shareVisibility === 'private' ? 'bg-gray-900 text-white border-gray-900 shadow-lg' : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50'}`}><Icon name="lock" className="w-4 h-4"/> Privé</button>
                                        <button onClick={() => setShareVisibility('public')} className={`py-3 px-2 rounded-xl border text-[10px] font-bold flex flex-col items-center gap-2 transition-all ${shareVisibility === 'public' ? 'bg-pink-500 text-white border-pink-500 shadow-lg' : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-pink-50/10'}`}><Icon name="globe" className="w-4 h-4"/> Public</button>
                                        <button onClick={() => setShareVisibility('listed')} className={`py-3 px-2 rounded-xl border text-[10px] font-bold flex flex-col items-center gap-2 transition-all ${shareVisibility === 'listed' ? 'bg-teal-500 text-white border-teal-500 shadow-lg' : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-teal-50/10'}`}><Icon name="star" className="w-4 h-4"/> Expert</button>
                                    </div>
                                    <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                                        <p className="text-[10px] text-gray-500 leading-relaxed italic">
                                            {shareVisibility === 'private' && "Seules les personnes disposant du lien peuvent voir ce CV. L'assistant IA interactif est désactivé."}
                                            {shareVisibility === 'public' && "Visible publiquement avec le lien. L'assistant IA peut répondre aux questions des recruteurs sur votre profil !"}
                                            {shareVisibility === 'listed' && "Visible publiquement et listé dans la galerie de talents ParseLIQ."}
                                        </p>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold mb-3 flex items-center gap-2 uppercase tracking-widest opacity-70">
                                        <Icon name="link" className="w-4 h-4 text-pink-500"/>
                                        Lien unique
                                    </label>
                                    <div className="flex gap-2 p-1 border dark:border-gray-700 rounded-2xl bg-gray-50 dark:bg-gray-950">
                                        <input type="text" readOnly value={shareLink} className="flex-1 p-3 bg-transparent text-xs font-mono text-gray-500 outline-none" />
                                        <button onClick={() => { navigator.clipboard.writeText(shareLink); showToast('Copié !', 'success'); }} className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-6 py-2 rounded-xl text-xs font-bold hover:opacity-90 active:scale-95 transition-all shadow-md">Copier</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}


            {/* Preview Side */}
            <div className="w-full lg:w-2/3 p-4 sm:p-12 lg:h-screen lg:overflow-y-auto overflow-x-auto bg-gray-200/50 dark:bg-gray-950 flex flex-col items-center gap-12 print:block print:items-start print:w-full print:p-0 print:bg-white print:overflow-visible transition-colors duration-500">
                {/* CV Document Wrapper */}
                <div id="cv-preview-content" className={`shrink-0 w-full md:w-[210mm] max-w-none min-h-[297mm] h-max bg-white text-gray-900 shadow-2xl print:shadow-none relative p-6 sm:p-12 transition-all duration-500 rounded-xl lg:rounded-2xl group print:rounded-none print:m-0 print:p-8 ${
                    template === 'technical' ? 'font-mono' :
                    template === 'executive' ? 'font-serif' :
                    template === 'freelance' ? 'font-display' : 'font-sans'
                }`}>
                    {/* Visual Page Break Marker (Simulation) */}
                    <div className="absolute left-0 right-0 top-[29.7cm] border-t-2 border-dashed border-gray-200/50 pointer-events-none print:hidden z-10">
                        <div className="absolute right-4 -top-3 bg-gray-100 text-[10px] font-bold text-gray-400 px-2 py-1 rounded">Page 2</div>
                    </div>
                    
                    <div className="absolute left-0 right-0 top-[59.4cm] border-t-2 border-dashed border-gray-200/50 pointer-events-none print:hidden z-10">
                        <div className="absolute right-4 -top-3 bg-gray-100 text-[10px] font-bold text-gray-400 px-2 py-1 rounded">Page 3</div>
                    </div>

                    {/* Header */}
                    <div className={`mb-10 flex ${template === 'freelance' ? 'flex-col items-center border-b-4 border-pink-500 pb-8 text-center' : template === 'executive' ? 'flex-col items-center border-b-2 border-gray-800 pb-8 text-center' : 'justify-between border-b border-gray-300 pb-8'}`}>
                        {template !== 'freelance' && template !== 'executive' && photo && (
                             <img src={photo} alt="Profile" className="w-32 h-32 rounded-3xl object-cover border-4 border-gray-100 shadow-lg mr-8 block transform transition-transform group-hover:scale-105" />
                        )}
                        <div className="flex-1">
                            { (template === 'freelance' || template === 'executive') && photo && (
                                <img src={photo} alt="Profile" className="w-40 h-40 rounded-3xl object-cover border-4 border-white shadow-xl mx-auto mb-6 transform transition-transform group-hover:scale-110" />
                            )}
                            <h1 className={`text-5xl font-black text-gray-900 tracking-tight leading-tight ${template === 'technical' ? 'text-blue-700' : ''}`}>{personalInfo.name}</h1>
                            <h2 className={`text-2xl font-bold mt-2 ${template === 'technical' ? 'text-blue-600' : template === 'freelance' ? 'text-pink-500' : 'text-gray-500'}`}>{personalInfo.jobTitle}</h2>
                            
                            <div className={`flex flex-wrap gap-x-6 gap-y-3 text-sm mt-6 text-gray-600 ${template === 'freelance' || template === 'executive' ? 'justify-center font-medium' : 'font-medium'}`}>
                                {personalInfo.email && <span className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full"><Icon name="mail" className="w-4 h-4 text-pink-500"/> {personalInfo.email}</span>}
                                {personalInfo.phone && <span className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full"><Icon name="phone" className="w-4 h-4 text-pink-500"/> {personalInfo.phone}</span>}
                                {personalInfo.location && <span className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full"><Icon name="map-pin" className="w-4 h-4 text-pink-500"/> {personalInfo.location}</span>}
                                {personalInfo.linkedin && <span className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full"><Icon name="link" className="w-4 h-4"/> LinkedIn</span>}
                                {personalInfo.website && <span className="flex items-center gap-2 bg-pink-50 text-pink-700 px-3 py-1.5 rounded-full"><Icon name="link" className="w-4 h-4"/> Portfolio</span>}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-12">
                        {/* Main Content */}
                        <div className="space-y-10">
                            {personalInfo.summary && (
                                <section className="relative overflow-visible print-break-inside-avoid">
                                    <h3 className={`text-xl font-bold uppercase tracking-[0.2em] mb-4 flex items-center gap-3 ${template === 'freelance' ? 'text-pink-500' : 'text-gray-900 border-l-4 border-pink-500 pl-4'}`}>
                                        Profil
                                    </h3>
                                    <p className="text-gray-700 leading-[1.8] text-lg text-justify">{personalInfo.summary}</p>
                                </section>
                            )}
                            
                            {experiences.length > 0 && (
                                <section className="print-break-inside-avoid">
                                    <h3 className={`text-xl font-bold uppercase tracking-[0.2em] mb-6 flex items-center gap-3 ${template === 'freelance' ? 'text-pink-500' : 'text-gray-900 border-l-4 border-pink-500 pl-4'}`}>
                                        Expérience
                                    </h3>
                                    <div className="space-y-8">
                                        {experiences.map(exp => (
                                            <div key={exp.id} className="relative pl-6 border-l border-gray-100 print-break-inside-avoid">
                                                <div className="absolute -left-[5px] top-2 w-2.5 h-2.5 rounded-full bg-pink-500 ring-4 ring-white"></div>
                                                <div className="flex justify-between items-baseline mb-2">
                                                    <h4 className="text-xl font-bold text-gray-900">{exp.title}</h4>
                                                    <span className="text-sm font-black text-gray-400 bg-gray-50 px-3 py-1 rounded-full">{exp.period}</span>
                                                </div>
                                                <p className={`font-bold mb-3 tracking-wide ${template === 'technical' ? 'text-blue-600' : 'text-pink-600'}`}>{exp.company}</p>
                                                <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap italic">{exp.description}</p>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {education.length > 0 && (
                                <section className="print-break-inside-avoid">
                                    <h3 className={`text-xl font-bold uppercase tracking-[0.2em] mb-6 flex items-center gap-3 ${template === 'freelance' ? 'text-pink-500' : 'text-gray-900 border-l-4 border-pink-500 pl-4'}`}>
                                        Formation
                                    </h3>
                                    <div className="space-y-6">
                                        {education.map(edu => (
                                            <div key={edu.id} className="bg-gray-50 p-4 rounded-2xl border border-gray-100/50 print-break-inside-avoid">
                                                <h4 className="font-bold text-gray-900 text-lg mb-1">{edu.degree}</h4>
                                                <div className="flex justify-between text-sm font-medium text-gray-500">
                                                    <span>{edu.school}</span>
                                                    <span className="bg-white px-2 py-0.5 rounded-lg shadow-sm">{edu.year}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}
                        </div>

                        {/* Sidebar Content */}
                        <div className={`space-y-10 ${template === 'executive' ? 'border-l-2 border-gray-800 pl-8' : template === 'minimalist' ? 'border-l border-gray-200 pl-8' : 'bg-gray-50/50 p-8 rounded-3xl border border-gray-100'}`}>
                            {personalInfo.skills && (
                                <section>
                                    <h3 className={`text-sm font-black uppercase tracking-[0.25em] mb-6 text-center py-2 bg-white rounded-xl shadow-sm ${template === 'freelance' ? 'text-pink-500' : 'text-gray-900'}`}>Skills</h3>
                                    <div className="flex flex-wrap gap-2.5">
                                        {personalInfo.skills.split(',').filter(s => s.trim()).map((skill, idx) => (
                                            <span key={idx} className={`px-4 py-2 text-[11px] font-black rounded-xl transition-all hover:scale-105 cursor-default ${template === 'technical' ? 'bg-blue-100 text-blue-800 border-2 border-blue-200 shadow-sm' : template === 'freelance' ? 'bg-pink-100 text-pink-600 shadow-sm' : 'bg-white text-gray-800 border-2 border-gray-100 shadow-sm'}`}>
                                                {skill.trim()}
                                            </span>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {languages.length > 0 && (
                                <section className="print-break-inside-avoid">
                                    <h3 className={`text-sm font-black uppercase tracking-[0.25em] mb-6 text-center py-2 bg-white rounded-xl shadow-sm ${template === 'freelance' ? 'text-pink-500' : 'text-gray-900'}`}>Langues</h3>
                                    <ul className="space-y-3">
                                        {languages.map((lang) => (
                                            <li key={lang.id} className="flex flex-col gap-1.5 p-3 bg-white rounded-xl shadow-sm transition-transform hover:-translate-y-1 print-break-inside-avoid">
                                                <span className="font-bold text-gray-900 text-sm tracking-tight">{lang.name}</span>
                                                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                                    <div className={`h-full ${lang.level === 'Natif' || lang.level === 'Bilingue/Natif' ? 'w-full bg-pink-500' : lang.level === 'Courant' ? 'w-3/4 bg-pink-400' : lang.level === 'Intermédiaire' ? 'w-1/2 bg-pink-300' : 'w-1/4 bg-pink-200'}`}></div>
                                                </div>
                                                <span className="text-[10px] font-bold text-gray-400 uppercase text-right">{lang.level}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </section>
                            )}

                            {certifications.length > 0 && (
                                <section className="print-break-inside-avoid">
                                    <h3 className={`text-sm font-black uppercase tracking-[0.25em] mb-6 text-center py-2 bg-white rounded-xl shadow-sm ${template === 'freelance' ? 'text-pink-500' : 'text-gray-900'}`}>Certifs</h3>
                                    <div className="space-y-4">
                                        {certifications.map(cert => (
                                            <div key={cert.id} className="group p-3 bg-white rounded-xl border-b-4 border-gray-100 hover:border-pink-200 transition-colors print-break-inside-avoid">
                                                <p className="font-bold text-gray-900 text-sm leading-tight leading-snug">{cert.name}</p>
                                                <div className="flex justify-between items-center mt-2">
                                                    <span className="text-[10px] font-black text-gray-400 uppercase">{cert.organization}</span>
                                                    <span className="text-[10px] font-bold bg-pink-50 text-pink-600 px-2 py-0.5 rounded-full">{cert.year}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}
                        </div>
                    </div>
                    
                    {/* Visual Page 2 Placeholder (if content is really long) */}
                </div>
                
                {/* Footer instructions for print */}
                <div className="text-center text-[10px] text-gray-400 font-bold mb-8 uppercase tracking-widest hidden lg:block">
                    Conseil : Le réglage "Marges : Aucune" dans les paramètres d'impression est recommandé.
                </div>
            </div>
        </div>
    );
};
