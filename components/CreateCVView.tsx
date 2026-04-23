import React, { useState, useEffect } from 'react';
import { Icon } from './icons';

type CVTemplate = 'minimalist' | 'technical' | 'executive' | 'freelance';

interface Experience { id: string; title: string; company: string; period: string; description: string; }
interface Education { id: string; degree: string; school: string; year: string; }
interface Language { id: string; name: string; level: string; }
interface Certification { id: string; name: string; organization: string; year: string; }

export const CreateCVView: React.FC = () => {
    const [template, setTemplate] = useState<CVTemplate>('minimalist');
    const [activeSection, setActiveSection] = useState<string>('personal');
    const [photo, setPhoto] = useState<string | null>(null);

    const [hasDraft, setHasDraft] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [shareVisibility, setShareVisibility] = useState<'private' | 'public' | 'listed'>('private');
    const shareLink = `https://parseliq.app/cv/${Math.random().toString(36).substring(2, 10)}`;

    const [importStatus, setImportStatus] = useState<string | null>(null);
    const [importTab, setImportTab] = useState<'link'|'doc'>('link');


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
        (window as any).isCVDirty = isDirty;
        
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
        alert('Brouillon enregistré avec succès !');
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

    const handleMockImport = () => {
        setImportStatus('Synchronisation en cours...');
        setTimeout(() => {
            setPersonalInfo({
                ...personalInfo,
                name: 'Alice Martin',
                jobTitle: 'Data Eng',
                skills: 'Python, SQL, Snowflake',
                summary: 'Données importées depuis le document externe.'
            });
            setImportStatus('Données importées avec succès !');
            setIsDirty(true);
            setTimeout(() => setImportStatus(null), 3000);
        }, 1500);
    };

    const handleExportPDF = () => {
        window.print();
    };

    const handleChange = (setter: any) => (val: any) => {
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
        <div className="flex flex-col lg:flex-row h-full overflow-hidden bg-gray-50 dark:bg-gray-900 print:bg-white text-gray-900 dark:text-gray-100">
            {/* Form Side */}
            <div className="w-full lg:w-1/3 p-6 overflow-y-auto border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 print:hidden relative">
                <div className="mb-6 flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-bold font-display flex items-center gap-2">
                            <Icon name="file-pen" className="w-6 h-6 text-pink-500" />
                            Créer un CV
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Personnalisez votre CV interactif.</p>
                    </div>
                </div>

                {hasDraft && (
                    <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700/50 rounded-xl flex flex-col gap-3">
                        <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-200">Vous avez un brouillon non publié.</p>
                        <div className="flex gap-2">
                            <button onClick={handleLoadDraft} className="flex-1 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 px-3 py-1.5 rounded text-xs font-bold transition-colors">Reprendre</button>
                            <button onClick={() => { localStorage.removeItem('parseLIQ_cv_draft'); setHasDraft(false); }} className="flex-1 border border-yellow-300 dark:border-yellow-700 text-yellow-700 dark:text-yellow-300 px-3 py-1.5 rounded text-xs font-bold hover:bg-yellow-500/10 transition-colors">Ignorer</button>
                        </div>
                    </div>
                )}

                <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold flex items-center gap-2"><Icon name="download" className="w-4 h-4"/> Importer vos données</h3>
                    </div>
                    <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700 mb-4">
                        <button onClick={() => setImportTab('link')} className={`pb-2 text-xs font-semibold border-b-2 ${importTab === 'link' ? 'border-pink-500 text-pink-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Via un lien</button>
                        <button onClick={() => setImportTab('doc')} className={`pb-2 text-xs font-semibold border-b-2 ${importTab === 'doc' ? 'border-pink-500 text-pink-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Importer un doc</button>
                    </div>

                    {importTab === 'link' ? (
                        <div className="flex gap-2">
                            <input type="url" placeholder="Lien (LinkedIn, GDocs, Sheets)" className="flex-1 p-2 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 outline-none focus:ring-1 focus:ring-pink-500" />
                            <button onClick={handleMockImport} className="bg-pink-500 text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-pink-600 transition shadow-sm">Analyser</button>
                        </div>
                    ) : (
                        <div className="flex flex-col">
                            <label className="cursor-pointer border border-dashed border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg p-4 flex flex-col items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-800 transition shadow-sm">
                                <input type="file" accept=".pdf,.csv,.xlsx,.xls,.ods" className="hidden" onChange={handleMockImport} />
                                <Icon name="upload" className="w-5 h-5 text-gray-400 mb-2" />
                                <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Sélectionner un fichier</span>
                            </label>
                            <p className="text-[10px] text-gray-500 mt-2 text-center">Formats acceptés : PDF, CSV, Excel (XLSX, XLS), ODS</p>
                        </div>
                    )}
                    {importStatus && <p className="text-xs text-green-600 dark:text-green-400 mt-2 font-medium">{importStatus}</p>}
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold mb-2">Modèle visuel</label>
                        <select 
                            value={template} 
                            onChange={e => setTemplate(e.target.value as CVTemplate)}
                            className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700 outline-none focus:border-pink-500"
                        >
                            <option value="minimalist">Minimaliste</option>
                            <option value="technical">Technique (Code)</option>
                            <option value="executive">Cadre (Élégant)</option>
                            <option value="freelance">Freelance (Créatif)</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <SectionHeader id="personal" icon="user" title="Infos Personnelles & Profil" />
                        {activeSection === 'personal' && (
                            <div className="p-4 border rounded-lg dark:border-gray-700 space-y-4 animate-in slide-in-from-top-2">
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
                            <div className="p-4 border rounded-lg dark:border-gray-700 space-y-4 animate-in slide-in-from-top-2">
                                {experiences.map((exp, idx) => (
                                    <div key={exp.id} className="p-3 bg-gray-50 dark:bg-gray-800 rounded border dark:border-gray-600 relative">
                                        <button onClick={() => handleChange(setExperiences)(experiences.filter(e => e.id !== exp.id))} className="absolute top-2 right-2 text-gray-400 hover:text-red-500"><Icon name="close" className="w-4 h-4"/></button>
                                        <div className="grid grid-cols-2 gap-2 mb-2">
                                            <input type="text" placeholder="Poste" value={exp.title} onChange={e => handleChange(setExperiences)(experiences.map(x => x.id === exp.id ? {...x, title: e.target.value} : x))} className="w-full p-1.5 border rounded dark:bg-gray-700 dark:border-gray-600 outline-none text-sm text-gray-900 dark:text-gray-100" />
                                            <input type="text" placeholder="Entreprise" value={exp.company} onChange={e => handleChange(setExperiences)(experiences.map(x => x.id === exp.id ? {...x, company: e.target.value} : x))} className="w-full p-1.5 border rounded dark:bg-gray-700 dark:border-gray-600 outline-none text-sm text-gray-900 dark:text-gray-100" />
                                        </div>
                                        <input type="text" placeholder="Période (ex: Jan 2020 - Présent)" value={exp.period} onChange={e => handleChange(setExperiences)(experiences.map(x => x.id === exp.id ? {...x, period: e.target.value} : x))} className="w-full p-1.5 mb-2 border rounded dark:bg-gray-700 dark:border-gray-600 outline-none text-sm text-gray-900 dark:text-gray-100" />
                                        <textarea placeholder="Description" value={exp.description} onChange={e => handleChange(setExperiences)(experiences.map(x => x.id === exp.id ? {...x, description: e.target.value} : x))} className="w-full p-1.5 border rounded dark:bg-gray-700 dark:border-gray-600 outline-none text-sm text-gray-900 dark:text-gray-100 resize-none" rows={2}></textarea>
                                    </div>
                                ))}
                                <button onClick={() => handleChange(setExperiences)([...experiences, { id: Date.now().toString(), title: '', company: '', period: '', description: '' }])} className="w-full border-2 border-dashed border-gray-300 dark:border-gray-600 p-2 rounded text-sm font-semibold text-gray-500 hover:text-pink-500 hover:border-pink-500 flex justify-center items-center gap-1"><Icon name="plus" className="w-4 h-4"/> Ajouter une expérience</button>
                            </div>
                        )}

                        <SectionHeader id="skills" icon="star" title="Compétences" />
                        {activeSection === 'skills' && (
                            <div className="p-4 border rounded-lg dark:border-gray-700 animate-in slide-in-from-top-2">
                                <label className="block text-xs font-semibold mb-1 text-gray-500">Mots-clés séparés par des virgules</label>
                                <textarea id="skills-input" value={personalInfo.skills} onChange={e => handleChange(setPersonalInfo)({...personalInfo, skills: e.target.value})} rows={3} className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 outline-none text-sm text-gray-900 dark:text-gray-100 transition-colors duration-300"></textarea>
                            </div>
                        )}

                        <SectionHeader id="education" icon="layers" title="Formation" />
                        {activeSection === 'education' && (
                            <div className="p-4 border rounded-lg dark:border-gray-700 space-y-4 animate-in slide-in-from-top-2">
                                {education.map((edu) => (
                                    <div key={edu.id} className="p-3 bg-gray-50 dark:bg-gray-800 rounded border dark:border-gray-600 relative">
                                        <button onClick={() => handleChange(setEducation)(education.filter(e => e.id !== edu.id))} className="absolute top-2 right-2 text-gray-400 hover:text-red-500"><Icon name="close" className="w-4 h-4"/></button>
                                        <input type="text" placeholder="Diplôme" value={edu.degree} onChange={e => handleChange(setEducation)(education.map(x => x.id === edu.id ? {...x, degree: e.target.value} : x))} className="w-full p-1.5 mb-2 border rounded dark:bg-gray-700 dark:border-gray-600 outline-none text-sm text-gray-900 dark:text-gray-100" />
                                        <div className="grid grid-cols-2 gap-2">
                                            <input type="text" placeholder="École" value={edu.school} onChange={e => handleChange(setEducation)(education.map(x => x.id === edu.id ? {...x, school: e.target.value} : x))} className="w-full p-1.5 border rounded dark:bg-gray-700 dark:border-gray-600 outline-none text-sm text-gray-900 dark:text-gray-100" />
                                            <input type="text" placeholder="Année" value={edu.year} onChange={e => handleChange(setEducation)(education.map(x => x.id === edu.id ? {...x, year: e.target.value} : x))} className="w-full p-1.5 border rounded dark:bg-gray-700 dark:border-gray-600 outline-none text-sm text-gray-900 dark:text-gray-100" />
                                        </div>
                                    </div>
                                ))}
                                <button onClick={() => handleChange(setEducation)([...education, { id: Date.now().toString(), degree: '', school: '', year: '' }])} className="w-full border-2 border-dashed border-gray-300 dark:border-gray-600 p-2 rounded text-sm font-semibold text-gray-500 hover:text-pink-500 hover:border-pink-500 flex justify-center items-center gap-1"><Icon name="plus" className="w-4 h-4"/> Ajouter une formation</button>
                            </div>
                        )}

                        <SectionHeader id="lang-cert" icon="check" title="Langues & Certifs." />
                        {activeSection === 'lang-cert' && (
                            <div className="p-4 border rounded-lg dark:border-gray-700 space-y-6 animate-in slide-in-from-top-2">
                                <div>
                                    <h4 className="text-sm font-bold mb-2">Langues</h4>
                                    {languages.map((lang) => (
                                        <div key={lang.id} className="flex gap-2 mb-2">
                                            <input type="text" placeholder="Langue" value={lang.name} onChange={e => handleChange(setLanguages)(languages.map(x => x.id === lang.id ? {...x, name: e.target.value} : x))} className="w-1/2 p-1.5 border rounded dark:bg-gray-700 dark:border-gray-600 outline-none text-sm text-gray-900 dark:text-gray-100" />
                                            <select value={lang.level} onChange={e => handleChange(setLanguages)(languages.map(x => x.id === lang.id ? {...x, level: e.target.value} : x))} className="w-1/2 p-1.5 border rounded dark:bg-gray-700 dark:border-gray-600 outline-none text-sm text-gray-900 dark:text-gray-100">
                                                <option value="Débutant">Débutant</option>
                                                <option value="Intermédiaire">Intermédiaire</option>
                                                <option value="Courant">Courant</option>
                                                <option value="Bilingue/Natif">Bilingue/Natif</option>
                                            </select>
                                            <button onClick={() => handleChange(setLanguages)(languages.filter(x => x.id !== lang.id))} className="p-1 text-gray-400 hover:text-red-500"><Icon name="close" className="w-4 h-4" /></button>
                                        </div>
                                    ))}
                                    <button onClick={() => handleChange(setLanguages)([...languages, { id: Date.now().toString(), name: '', level: 'Débutant' }])} className="text-xs font-semibold text-pink-500">+ Ajouter langue</button>
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold mb-2">Certifications</h4>
                                     {certifications.map((cert) => (
                                        <div key={cert.id} className="flex flex-col gap-1 mb-3 bg-gray-50 dark:bg-gray-800 p-2 rounded">
                                            <div className="flex justify-between">
                                                <input type="text" placeholder="Nom Certification" value={cert.name} onChange={e => handleChange(setCertifications)(certifications.map(x => x.id === cert.id ? {...x, name: e.target.value} : x))} className="w-full p-1.5 border rounded dark:bg-gray-700 dark:border-gray-600 outline-none text-sm text-gray-900 dark:text-gray-100 mr-2" />
                                                <button onClick={() => handleChange(setCertifications)(certifications.filter(x => x.id !== cert.id))} className="text-gray-400 hover:text-red-500"><Icon name="close" className="w-4 h-4" /></button>
                                            </div>
                                            <div className="flex gap-2">
                                                 <input type="text" placeholder="Organisme" value={cert.organization} onChange={e => handleChange(setCertifications)(certifications.map(x => x.id === cert.id ? {...x, organization: e.target.value} : x))} className="w-2/3 p-1.5 border rounded dark:bg-gray-700 dark:border-gray-600 outline-none text-sm text-gray-900 dark:text-gray-100" />
                                                 <input type="text" placeholder="Année" value={cert.year} onChange={e => handleChange(setCertifications)(certifications.map(x => x.id === cert.id ? {...x, year: e.target.value} : x))} className="w-1/3 p-1.5 border rounded dark:bg-gray-700 dark:border-gray-600 outline-none text-sm text-gray-900 dark:text-gray-100" />
                                            </div>
                                        </div>
                                    ))}
                                    <button onClick={() => handleChange(setCertifications)([...certifications, { id: Date.now().toString(), name: '', organization: '', year: '' }])} className="text-xs font-semibold text-pink-500">+ Ajouter certification</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-8 space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                         <button onClick={handleExportPDF} className="bg-gradient-button text-white py-3 rounded-lg font-bold shadow-md hover:shadow-lg transition-all flex justify-center items-center gap-2 text-sm">
                             <Icon name="download" className="w-4 h-4"/>
                             Télécharger PDF
                         </button>
                         <button onClick={() => setShowShareModal(true)} className="bg-gray-800 text-white py-3 rounded-lg font-bold shadow-md hover:shadow-lg transition-all flex justify-center items-center gap-2 text-sm">
                             <Icon name="share-2" className="w-4 h-4"/>
                             Partager CV
                         </button>
                    </div>
                    <button onClick={handleSaveDraft} className="w-full border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-3 rounded-lg font-bold hover:bg-gray-100 dark:hover:bg-gray-800 transition-all flex justify-center items-center gap-2 text-sm">
                        <Icon name="save" className="w-4 h-4"/>
                        Enregistrer le brouillon
                    </button>
                </div>
            </div>

            {/* Share Modal */}
            {showShareModal && (
                <div className="fixed inset-0 z-[10000] bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-in zoom-in-95">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold">Partager votre CV</h3>
                                <button onClick={() => setShowShareModal(false)} className="text-gray-400 hover:text-gray-900 dark:hover:text-white"><Icon name="close" className="w-5 h-5"/></button>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold mb-2">Visibilité du profil</label>
                                    <div className="flex gap-2">
                                        <button onClick={() => setShareVisibility('private')} className={`flex-1 py-2 px-3 rounded-lg border text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${shareVisibility === 'private' ? 'bg-gray-100 dark:bg-gray-800 border-gray-900 dark:border-gray-100' : 'border-gray-200 dark:border-gray-700 text-gray-500'}`}><Icon name="lock" className="w-4 h-4"/> Privé</button>
                                        <button onClick={() => setShareVisibility('public')} className={`flex-1 py-2 px-3 rounded-lg border text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${shareVisibility === 'public' ? 'bg-pink-50 text-pink-700 border-pink-500' : 'border-gray-200 dark:border-gray-700 text-gray-500'}`}><Icon name="globe" className="w-4 h-4"/> Public</button>
                                        <button onClick={() => setShareVisibility('listed')} className={`flex-1 py-2 px-3 rounded-lg border text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${shareVisibility === 'listed' ? 'bg-teal-50 text-teal-700 border-teal-500' : 'border-gray-200 dark:border-gray-700 text-gray-500'}`}><Icon name="search" className="w-4 h-4"/> Répertorié</button>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">
                                        {shareVisibility === 'private' && "Seules les personnes disposant du lien peuvent voir ce CV. L'assistant IA interactif est désactivé."}
                                        {shareVisibility === 'public' && "Visible publiquement avec le lien. L'assistant IA peut répondre aux questions des recruteurs sur votre profil !"}
                                        {shareVisibility === 'listed' && "Visible publiquement et listé dans la galerie de talents ParseLIQ."}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-2">Lien de partage unique</label>
                                    <div className="flex gap-2">
                                        <input type="text" readOnly value={shareLink} className="flex-1 p-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-mono text-gray-600 outline-none" />
                                        <button onClick={() => { navigator.clipboard.writeText(shareLink); alert('Copié !'); }} className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-4 py-2 rounded-lg text-sm font-bold hover:opacity-90">Copier</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}


            {/* Preview Side */}
            <div className="w-full lg:w-2/3 p-4 sm:p-8 overflow-y-auto bg-gray-100 dark:bg-gray-950 flex justify-center items-start print:items-start print:w-full print:p-0 print:bg-white print:overflow-visible">
                {/* CV Document Wrapper */}
                <div className={`w-full max-w-[21cm] min-h-[29.7cm] bg-white text-gray-900 shadow-2xl print:shadow-none relative p-12 ${
                    template === 'technical' ? 'font-mono' :
                    template === 'executive' ? 'font-serif' :
                    template === 'freelance' ? 'font-display' : 'font-sans'
                }`}>
                    {/* Header */}
                    <div className={`mb-10 flex ${template === 'freelance' ? 'flex-col items-center border-b-4 border-pink-500 pb-8 text-center' : template === 'executive' ? 'flex-col items-center border-b-2 border-gray-800 pb-8 text-center' : 'justify-between border-b border-gray-300 pb-8'}`}>
                        {template !== 'freelance' && template !== 'executive' && photo && (
                             <img src={photo} alt="Profile" className="w-28 h-28 rounded-full object-cover border-4 border-gray-100 shadow-sm mr-8 block" />
                        )}
                        <div className="flex-1">
                            { (template === 'freelance' || template === 'executive') && photo && (
                                <img src={photo} alt="Profile" className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md mx-auto mb-6" />
                            )}
                            <h1 className={`text-5xl font-black text-gray-900 tracking-tight ${template === 'technical' ? 'text-blue-700' : ''}`}>{personalInfo.name}</h1>
                            <h2 className={`text-2xl font-bold mt-2 ${template === 'technical' ? 'text-blue-500' : template === 'freelance' ? 'text-pink-500' : 'text-gray-500'}`}>{personalInfo.jobTitle}</h2>
                            
                            <div className={`flex flex-wrap gap-x-6 gap-y-2 text-sm mt-5 text-gray-600 ${template === 'freelance' || template === 'executive' ? 'justify-center' : ''}`}>
                                {personalInfo.email && <span className="flex items-center gap-1.5"><Icon name="mail" className="w-4 h-4"/> {personalInfo.email}</span>}
                                {personalInfo.phone && <span className="flex items-center gap-1.5"><Icon name="phone" className="w-4 h-4"/> {personalInfo.phone}</span>}
                                {personalInfo.location && <span className="flex items-center gap-1.5"><Icon name="map-pin" className="w-4 h-4"/> {personalInfo.location}</span>}
                                {personalInfo.linkedin && <span className="flex items-center gap-1.5 text-blue-600"><Icon name="link" className="w-4 h-4"/> {personalInfo.linkedin}</span>}
                                {personalInfo.website && <span className="flex items-center gap-1.5 text-pink-600"><Icon name="link" className="w-4 h-4"/> {personalInfo.website}</span>}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-10">
                        {/* Main Content */}
                        <div className="space-y-8">
                            {personalInfo.summary && (
                                <section>
                                    <h3 className={`text-xl font-bold uppercase tracking-widest mb-3 flex items-center gap-2 ${template === 'freelance' ? 'text-pink-500' : 'text-gray-900'}`}>
                                        <Icon name="user" className="w-5 h-5"/> Profil
                                    </h3>
                                    <p className="text-gray-700 leading-relaxed text-justify">{personalInfo.summary}</p>
                                </section>
                            )}
                            
                            {experiences.length > 0 && (
                                <section>
                                    <h3 className={`text-xl font-bold uppercase tracking-widest mb-4 flex items-center gap-2 ${template === 'freelance' ? 'text-pink-500' : 'text-gray-900'}`}>
                                        <Icon name="briefcase" className="w-5 h-5"/> Expérience
                                    </h3>
                                    <div className="space-y-6">
                                        {experiences.map(exp => (
                                            <div key={exp.id}>
                                                <div className="flex justify-between items-baseline mb-1">
                                                    <h4 className="text-lg font-bold text-gray-900">{exp.title}</h4>
                                                    <span className="text-sm font-semibold text-gray-500">{exp.period}</span>
                                                </div>
                                                <p className={`font-medium mb-2 ${template === 'technical' ? 'text-blue-600' : 'text-pink-600'}`}>{exp.company}</p>
                                                <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{exp.description}</p>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {education.length > 0 && (
                                <section>
                                    <h3 className={`text-xl font-bold uppercase tracking-widest mb-4 flex items-center gap-2 ${template === 'freelance' ? 'text-pink-500' : 'text-gray-900'}`}>
                                        <Icon name="layers" className="w-5 h-5"/> Formation
                                    </h3>
                                    <div className="space-y-4">
                                        {education.map(edu => (
                                            <div key={edu.id}>
                                                <h4 className="font-bold text-gray-900">{edu.degree}</h4>
                                                <div className="flex justify-between text-sm text-gray-600">
                                                    <span>{edu.school}</span>
                                                    <span>{edu.year}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}
                        </div>

                        {/* Sidebar Content */}
                        <div className={`space-y-8 ${template === 'executive' ? 'border-l-2 border-gray-800 pl-8' : template === 'minimalist' ? 'border-l border-gray-200 pl-8' : 'bg-gray-50 p-6 rounded-xl'}`}>
                            {personalInfo.skills && (
                                <section>
                                    <h3 className={`text-lg font-bold uppercase tracking-widest mb-4 ${template === 'freelance' ? 'text-pink-500' : 'text-gray-900'}`}>Compétences</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {personalInfo.skills.split(',').filter(s => s.trim()).map((skill, idx) => (
                                            <span key={idx} className={`px-3 py-1.5 text-xs font-bold rounded-lg ${template === 'technical' ? 'bg-blue-100 text-blue-800 border border-blue-200' : template === 'freelance' ? 'bg-pink-100 text-pink-800' : 'bg-gray-200 text-gray-800'}`}>
                                                {skill.trim()}
                                            </span>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {languages.length > 0 && (
                                <section>
                                    <h3 className={`text-lg font-bold uppercase tracking-widest mb-4 ${template === 'freelance' ? 'text-pink-500' : 'text-gray-900'}`}>Langues</h3>
                                    <ul className="space-y-2 text-sm">
                                        {languages.map((lang) => (
                                            <li key={lang.id} className="flex justify-between items-center border-b border-gray-200/50 pb-1">
                                                <span className="font-bold text-gray-800">{lang.name}</span>
                                                <span className="text-gray-500 italic">{lang.level}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </section>
                            )}

                            {certifications.length > 0 && (
                                <section>
                                    <h3 className={`text-lg font-bold uppercase tracking-widest mb-4 ${template === 'freelance' ? 'text-pink-500' : 'text-gray-900'}`}>Certifications</h3>
                                    <div className="space-y-3 text-sm">
                                        {certifications.map(cert => (
                                            <div key={cert.id}>
                                                <p className="font-bold text-gray-800 leading-tight">{cert.name}</p>
                                                <p className="text-gray-500 mt-0.5">{cert.organization} <span className="text-gray-400 ml-1">({cert.year})</span></p>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
