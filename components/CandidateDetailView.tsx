
// FIX: Changed React import to namespace import `* as React` to resolve widespread JSX intrinsic element type errors, which likely stem from a project configuration that requires this import style.
// FIX: Switched to namespace React import to correctly populate the global JSX namespace.
import * as React from 'react';
import { CandidateProfile, ChatMessage, CVFile } from '../types';
import { Icon } from './icons';
import { createAIChat } from '../services/geminiService';
import { Chat, GenerateContentResponse } from '@google/genai';
import { useTranslation } from '../i18n';
import { Bar, BarChart, CartesianGrid, LabelList, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface AIAssistantProps {
    cvFile: CVFile;
    isOpen: boolean;
    onClose: () => void;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ cvFile, isOpen, onClose }) => {
    const { t, language } = useTranslation();
    const [chat, setChat] = React.useState<Chat | null>(null);
    const [messages, setMessages] = React.useState<ChatMessage[]>([{role: 'model', text: t('ai_assistant.greeting')}]);
    const [input, setInput] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);
    const messagesEndRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        setChat(createAIChat(cvFile));
        setMessages([{role: 'model', text: t('ai_assistant.greeting')}]);
    }, [cvFile, t]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    React.useEffect(scrollToBottom, [messages]);
    
    const formatMessage = (text: string) => {
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .split('\n')
            .filter(line => line.trim() !== '')
            .map(line => `<p>${line.replace(/^\s*[\*\-]\s*/, '&bull; ')}</p>`)
            .join('');
    };

    const sendMessage = async () => {
        if (!input.trim() || !chat || isLoading) return;
        const userMessage: ChatMessage = { role: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response: GenerateContentResponse = await chat.sendMessage({ message: input });
            const modelMessage: ChatMessage = { role: 'model', text: response.text };
            setMessages(prev => [...prev, modelMessage]);
        } catch (error) {
            console.error("Error sending chat message:", error);
            const errorMessage: ChatMessage = { role: 'model', text: t('ai_assistant.error') };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const quickQuestions = [
        t('ai_assistant.quick_questions.summary'),
        t('ai_assistant.quick_questions.strengths'),
        t('ai_assistant.quick_questions.fit_for_role'),
    ];

    return (
        <>
            <div onClick={onClose} className={`fixed inset-0 bg-black/50 z-40 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} />
            <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-gray-50 dark:bg-gray-900/80 dark:backdrop-blur-sm flex flex-col z-50 transform transition-transform duration-300 ease-in-out border-l dark:border-gray-700 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="p-4 border-b dark:border-gray-700 flex-shrink-0 flex items-center justify-between">
                    <h4 className="font-bold font-display text-lg flex items-center gap-2"><Icon name="bot" className="w-6 h-6 text-pink-500" /> {t('ai_assistant.title')}</h4>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                        <Icon name="close" className="w-6 h-6" />
                    </button>
                </div>
                <div className="flex-1 p-4 overflow-y-auto space-y-4">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xs lg:max-w-md p-3 rounded-xl shadow-sm ${
                                msg.role === 'user' 
                                ? 'bg-gradient-button text-white' 
                                : 'bg-white dark:bg-gray-700 prose prose-sm dark:prose-invert max-w-none'
                            }`}
                            dangerouslySetInnerHTML={{__html: formatMessage(msg.text)}}>
                            </div>
                        </div>
                    ))}
                    {isLoading && <div className="flex justify-start"><div className="p-3 rounded-lg bg-white dark:bg-gray-700"><Icon name="spinner" className="w-5 h-5"/></div></div>}
                    <div ref={messagesEndRef} />
                </div>
                <div className="p-4 border-t dark:border-gray-700 bg-white dark:bg-gray-800">
                    <div className="flex flex-wrap gap-2 mb-3">
                        {quickQuestions.map(q => <button key={q} onClick={() => setInput(q)} className="text-sm font-semibold bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 px-3 py-1 rounded-full transition-colors">{q}</button>)}
                    </div>
                    <div className="flex items-center gap-2">
                        <input 
                            type="text" 
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyPress={e => e.key === 'Enter' && sendMessage()}
                            placeholder={t('ai_assistant.input_placeholder')}
                            className="w-full p-3 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-600 focus:ring-2 focus:ring-pink-500"
                        />
                        <button onClick={sendMessage} disabled={isLoading} className="bg-gradient-button text-white p-3 rounded-full disabled:bg-none disabled:bg-gray-400 hover:opacity-90 transition-opacity">
                            <Icon name="send" className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}

interface CandidateDetailProps {
    candidate: CandidateProfile | null;
    cvFile: CVFile | null;
    onBack: () => void;
    isFavorite: boolean;
    onToggleFavorite: () => void;
    comparisonList: string[];
    onToggleCompare: (candidateId: string) => void;
}

const getScoreEmoji = (score: number): string => {
    if (score >= 90) return '🤩';
    if (score >= 70) return '😜';
    if (score >= 50) return '😅';
    if (score >= 30) return '🤬';
    if (score >= 10) return '😭';
    return '';
};

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border dark:border-gray-600 shadow-lg">
                <p className="font-bold text-gray-500 dark:text-gray-400 text-sm mb-1">{label}</p>
                <p className="font-bold text-lg" style={{ color: '#ec4899' }}>
                    {`${payload[0].name}: ${payload[0].value}`}
                </p>
            </div>
        );
    }
    return null;
};

export const CandidateDetailView: React.FC<CandidateDetailProps> = ({ candidate, cvFile, onBack, isFavorite, onToggleFavorite, comparisonList, onToggleCompare }) => {
    const { t, language } = useTranslation();
    const [isAiAssistantOpen, setIsAiAssistantOpen] = React.useState(false);

    const skillsExpertiseData = React.useMemo(() => {
        if (!candidate || !candidate.skills?.hard) {
            return [];
        }

        const experienceText = (candidate.experience || [])
            .map(exp => `${exp.title} ${exp.description}`)
            .join(' ')
            .toLowerCase();

        return candidate.skills.hard
            .map(skill => {
                const skillLower = skill.toLowerCase();
                try {
                    const skillRegex = new RegExp(`\\b${skillLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g');
                    const count = (experienceText.match(skillRegex) || []).length;
                    return { name: skill, expertise: 1 + count };
                } catch(e) {
                    console.warn("Could not create regex for skill", skillLower);
                    return { name: skill, expertise: 1 };
                }
            })
            .sort((a, b) => b.expertise - a.expertise)
            .slice(0, 15);
    }, [candidate]);
    
    if (!candidate || !cvFile) return <div className="p-8 text-center">{t('detail.loading')}</div>;

    const hasHardSkills = candidate.skills?.hard && candidate.skills.hard.length > 0;
    const hasSoftSkills = candidate.skills?.soft && candidate.skills.soft.length > 0;

    const isInCompare = comparisonList.includes(candidate.id);
    const isCompareDisabled = !isInCompare && comparisonList.length >= 2;

    const truncateText = (text: string, maxLength: number) => {
        if (text.length <= maxLength) return text;
        return text.slice(0, maxLength) + '...';
    };

    return (
        <div className="h-full flex flex-col bg-white dark:bg-gray-800 relative">
            <div className="w-full flex flex-col">
                <header className="p-4 border-b dark:border-gray-700 flex flex-col sm:flex-row sm:justify-between sm:items-center flex-shrink-0 gap-4">
                    <div className="flex items-center gap-3 order-2 sm:order-1 w-full sm:w-auto">
                        <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                            <Icon name={language === 'ar' ? 'chevron-right' : 'chevron-left'} className="w-6 h-6" />
                        </button>
                        <div>
                            <h2 className="text-2xl font-bold font-display text-gray-800 dark:text-gray-100">{candidate.name && candidate.name !== 'N/A' ? candidate.name : t('common.name_not_available')}</h2>
                            <div className="text-gray-500 text-base flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                                <span>{candidate.email && candidate.email !== 'N/A' ? candidate.email : t('common.email_not_available')}</span>
                                <span className="hidden sm:inline">&bull;</span>
                                <span>{candidate.location && candidate.location !== 'N/A' ? candidate.location : t('common.location_not_available')}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 order-1 sm:order-2 w-full sm:w-auto justify-end">
                         <button
                            onClick={() => onToggleCompare(candidate.id)}
                            disabled={isCompareDisabled}
                            className={`p-2 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${isInCompare ? 'bg-primary-100 dark:bg-primary-900/50' : 'hover:bg-primary-100 dark:hover:bg-gray-700'}`}
                            title={isInCompare ? t('dashboard.compare.remove') : isCompareDisabled ? t('dashboard.compare.limit_reached') : t('dashboard.compare.add')}
                        >
                            <Icon name="compare" className={`w-6 h-6 ${isInCompare ? 'text-primary-600 dark:text-primary-300' : 'text-gray-400'}`} />
                        </button>
                        <button 
                            onClick={onToggleFavorite} 
                            className="p-2 rounded-full hover:bg-secondary-100 dark:hover:bg-gray-700 transition-colors"
                            title={isFavorite ? t('detail.remove_from_favorites') : t('detail.add_to_favorites')}
                        >
                            <Icon name="heart" className={`w-6 h-6 ${isFavorite ? 'fill-secondary-500 text-secondary-500' : 'text-gray-400'}`} />
                        </button>
                        <span className={`flex items-center justify-center gap-2 text-lg font-bold px-4 py-2 rounded-lg ${candidate.performanceScore > 75 ? 'bg-green-100 text-green-800' : candidate.performanceScore > 50 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                            <span className="text-2xl">{getScoreEmoji(candidate.performanceScore)}</span>
                            <span>{t('detail.score')}: {candidate.performanceScore || 0}/100</span>
                        </span>
                    </div>
                </header>
                <main className="p-4 sm:p-6 space-y-6 flex-1 overflow-y-auto">
                    <section className="bg-white dark:bg-gray-800/50 p-6 rounded-xl border dark:border-gray-700/50">
                        <h3 className="font-semibold font-display text-xl border-b pb-2 mb-4">{t('detail.profile_summary')}</h3>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-base">{candidate.summary && candidate.summary !== 'N/A' ? candidate.summary : <span className="italic text-gray-500">{t('detail.no_summary')}</span>}</p>
                    </section>
                    
                    {(hasHardSkills || hasSoftSkills) && (
                    <section className="bg-white dark:bg-gray-800/50 p-6 rounded-xl border dark:border-gray-700/50">
                        <h3 className="font-semibold font-display text-xl border-b pb-2 mb-4">{t('detail.skills')}</h3>
                        <div className="flex flex-col gap-4">
                            {hasHardSkills && (
                            <div>
                                <h4 className="font-bold text-sm uppercase text-gray-500 mb-2">{t('detail.hard_skills')}</h4>
                                <div className="flex flex-wrap gap-2">
                                    {candidate.skills.hard.map(s => <span key={s} className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full dark:bg-blue-900 dark:text-blue-300">{s}</span>)}
                                </div>
                            </div>
                            )}
                             {hasSoftSkills && (
                             <div>
                                <h4 className="font-bold text-sm uppercase text-gray-500 mb-2">{t('detail.soft_skills')}</h4>
                                <div className="flex flex-wrap gap-2">
                                    {candidate.skills.soft.map(s => <span key={s} className="bg-secondary-100 text-secondary-800 text-sm font-medium px-3 py-1 rounded-full dark:bg-secondary-900 dark:text-secondary-300">{s}</span>)}
                                </div>
                            </div>
                            )}
                        </div>
                    </section>
                    )}

                    {hasHardSkills && skillsExpertiseData.length > 2 && (
                        <section className="bg-white dark:bg-gray-800/50 p-6 rounded-xl border dark:border-gray-700/50">
                            <h3 className="font-semibold font-display text-xl border-b pb-2 mb-4">{t('detail.skills_chart')}</h3>
                            <div className="w-full h-[400px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        layout="vertical"
                                        data={skillsExpertiseData}
                                        margin={{ top: 5, right: 40, left: 20, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                        <XAxis type="number" allowDecimals={false} stroke="currentColor" />
                                        <YAxis dataKey="name" type="category" width={140} tick={{ fontSize: 12, fill: 'currentColor' }} interval={0} />
                                        <Tooltip 
                                            cursor={{fill: 'rgba(236, 72, 153, 0.1)'}} 
                                            content={<CustomTooltip />}
                                        />
                                        <Legend verticalAlign="top" height={36}/>
                                        <Bar dataKey="expertise" name={t('detail.expertise_score')} fill="#ec4899">
                                            <LabelList dataKey="expertise" position="right" style={{ fill: 'currentColor', fontSize: 12 }} />
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </section>
                    )}
                    
                    {candidate.experience?.length > 0 && (
                    <section className="bg-white dark:bg-gray-800/50 p-6 rounded-xl border dark:border-gray-700/50">
                        <h3 className="font-semibold font-display text-xl border-b pb-2 mb-4">{t('detail.work_experience')}</h3>
                        <div className="space-y-6">
                        {candidate.experience.map((exp, i) => (
                            <div key={i}>
                                <h4 className="font-bold text-lg">{exp.title || t('common.title_not_available')}</h4>
                                <p className="text-gray-600 dark:text-gray-400 font-medium">{exp.company || t('common.company_not_available')} &bull; <span className="italic">{exp.dates || t('common.dates_not_available')}</span></p>
                                <p className="text-base text-gray-700 dark:text-gray-300 mt-2 whitespace-pre-line">{truncateText(exp.description, 250) || <span className="italic text-gray-500">{t('detail.no_description')}</span>}</p>
                            </div>
                        ))}
                        </div>
                    </section>
                    )}
                     {candidate.education?.length > 0 && (
                     <section className="bg-white dark:bg-gray-800/50 p-6 rounded-xl border dark:border-gray-700/50">
                        <h3 className="font-semibold font-display text-xl border-b pb-2 mb-4">{t('detail.education')}</h3>
                         <div className="space-y-4">
                        {candidate.education.map((edu, i) => (
                            <div key={i}>
                                <h4 className="font-bold text-lg">{edu.degree || t('common.degree_not_available')}</h4>
                                <p className="text-gray-600 dark:text-gray-400 font-medium">{edu.school || t('common.school_not_available')} &bull; <span className="italic">{edu.dates || t('common.dates_not_available')}</span></p>
                            </div>
                        ))}
                        </div>
                    </section>
                    )}
                </main>
            </div>
             <button
                onClick={() => setIsAiAssistantOpen(true)}
                className="fixed bottom-6 right-6 md:bottom-8 md:right-8 rtl:right-auto rtl:left-6 md:rtl:left-8 bg-secondary-500 text-white font-semibold rounded-full px-5 py-3 shadow-lg hover:bg-secondary-600 transition-transform hover:scale-110 z-30 flex items-center gap-2"
                >
                <Icon name="bot" className="w-6 h-6" />
                <span className="">{t('ai_assistant.title')}</span>
            </button>
            <AIAssistant cvFile={cvFile} isOpen={isAiAssistantOpen} onClose={() => setIsAiAssistantOpen(false)} />
        </div>
    );
};
