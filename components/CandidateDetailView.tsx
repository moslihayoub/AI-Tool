// FIX: Changed React import to namespace import `* as React` to resolve widespread JSX intrinsic element type errors, which likely stem from a project configuration that requires this import style.
import * as React from 'react';
import { CandidateProfile, ChatMessage, CVFile } from '../types';
import { Icon } from './icons';
import { createAIChat } from '../services/geminiService';
import { Chat, GenerateContentResponse } from '@google/genai';
import { useTranslation } from '../i18n';
import { Bar, BarChart, CartesianGrid, LabelList, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface AIAssistantProps {
    cvFile: CVFile;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ cvFile }) => {
    const { t } = useTranslation();
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
        // Enhanced markdown to HTML converter for paragraphs, lists, and emphasis.
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
        <div className="w-full md:w-2/5 xl:w-1/3 bg-gray-50 dark:bg-gray-900/50 border-l dark:border-gray-700 flex flex-col h-full">
            <div className="p-4 border-b dark:border-gray-700 flex-shrink-0">
                <h4 className="font-bold text-lg flex items-center gap-2"><Icon name="bot" className="w-6 h-6 text-primary-500" /> {t('ai_assistant.title')}</h4>
            </div>
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs lg:max-w-md p-3 rounded-xl shadow-sm ${
                            msg.role === 'user' 
                            ? 'bg-primary-600 text-white' 
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
                    {quickQuestions.map(q => <button key={q} onClick={() => setInput(q)} className="text-sm font-semibold bg-gray-900 text-gray-100 hover:bg-primary-600 dark:bg-black dark:text-gray-200 dark:hover:bg-primary-600 px-3 py-1 rounded-full transition-colors">{q}</button>)}
                </div>
                <div className="flex items-center gap-2">
                    <input 
                        type="text" 
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyPress={e => e.key === 'Enter' && sendMessage()}
                        placeholder={t('ai_assistant.input_placeholder')}
                        className="w-full p-3 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-600 focus:ring-2 focus:ring-primary-500"
                    />
                    <button onClick={sendMessage} disabled={isLoading} className="bg-primary-600 text-white p-3 rounded-lg disabled:bg-gray-400 hover:bg-primary-700 transition-colors">
                        <Icon name="send" className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    )
}

interface CandidateDetailProps {
    candidate: CandidateProfile | null;
    cvFile: CVFile | null;
    onBack: () => void;
    isFavorite: boolean;
    onToggleFavorite: () => void;
}

const getScoreEmoji = (score: number): string => {
    if (score >= 90) return '🤩';
    if (score >= 70) return '😜';
    if (score >= 50) return '😅';
    if (score >= 30) return '🤬';
    if (score >= 10) return '😭';
    return '';
};

export const CandidateDetailView: React.FC<CandidateDetailProps> = ({ candidate, cvFile, onBack, isFavorite, onToggleFavorite }) => {
    const { t } = useTranslation();
    
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
                const skillRegex = new RegExp(`\\b${skillLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g');
                const count = (experienceText.match(skillRegex) || []).length;

                // Base score of 1 for being listed, plus counts from experience.
                return {
                    name: skill,
                    expertise: 1 + count,
                };
            })
            .sort((a, b) => b.expertise - a.expertise)
            .slice(0, 15); // Show top 15
    }, [candidate]);
    
    if (!candidate || !cvFile) return <div className="p-8 text-center">{t('detail.loading')}</div>;

    const hasHardSkills = candidate.skills?.hard && candidate.skills.hard.length > 0;
    const hasSoftSkills = candidate.skills?.soft && candidate.skills.soft.length > 0;

    return (
        <div className="h-full flex flex-col md:flex-row bg-white dark:bg-gray-800">
            <div className="w-full md:w-3/5 xl:w-2/3 flex flex-col">
                <header className="p-4 border-b dark:border-gray-700 flex justify-between items-center flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                            <Icon name="chevron-left" className="w-6 h-6" />
                        </button>
                        <div>
                            <h2 className="text-2xl font-bold text-primary-700 dark:text-primary-300">{candidate.name && candidate.name !== 'N/A' ? candidate.name : t('common.name_not_available')}</h2>
                            <div className="text-gray-500 text-base flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                                <span>{candidate.email && candidate.email !== 'N/A' ? candidate.email : t('common.email_not_available')}</span>
                                <span className="hidden sm:inline">&bull;</span>
                                <span>{candidate.location && candidate.location !== 'N/A' ? candidate.location : t('common.location_not_available')}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={onToggleFavorite} 
                            className="p-2 rounded-full hover:bg-secondary-100 dark:hover:bg-gray-700 transition-colors"
                            title={isFavorite ? t('detail.remove_from_favorites') : t('detail.add_to_favorites')}
                        >
                            <Icon name="heart" className={`w-6 h-6 ${isFavorite ? 'fill-secondary-500 text-secondary-500' : 'text-gray-400'}`} />
                        </button>
                        <span className={`flex items-center gap-2 text-lg font-bold px-4 py-2 rounded-lg ${candidate.performanceScore > 75 ? 'bg-green-100 text-green-800' : candidate.performanceScore > 50 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                            <span className="text-2xl">{getScoreEmoji(candidate.performanceScore)}</span>
                            <span>{t('detail.score')}: {candidate.performanceScore || 0}/100</span>
                        </span>
                    </div>
                </header>
                <main className="p-6 overflow-y-auto space-y-8 flex-1">
                    <div>
                        <h3 className="font-semibold text-xl border-b pb-2 mb-3">{t('detail.profile_summary')}</h3>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-base">{candidate.summary && candidate.summary !== 'N/A' ? candidate.summary : <span className="italic text-gray-500">{t('detail.no_summary')}</span>}</p>
                    </div>
                    {(hasHardSkills || hasSoftSkills) && (
                    <div>
                        <h3 className="font-semibold text-xl border-b pb-2 mb-3">{t('detail.skills')}</h3>
                        <div className="flex flex-col gap-3">
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
                    </div>
                    )}

                    {hasHardSkills && (
                        <div>
                            <h3 className="font-semibold text-xl border-b pb-2 mb-3">{t('detail.skills_chart')}</h3>
                            <div className="w-full h-96">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        layout="vertical"
                                        data={skillsExpertiseData}
                                        margin={{ top: 5, right: 40, left: 20, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                        <XAxis type="number" allowDecimals={false} stroke="currentColor" />
                                        <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 12, fill: 'currentColor' }} />
                                        <Tooltip 
                                            cursor={{fill: 'rgba(236, 72, 153, 0.1)'}} 
                                        />
                                        <Legend verticalAlign="top" height={36}/>
                                        <Bar dataKey="expertise" name={t('detail.expertise_score')} fill="#ec4899">
                                            <LabelList dataKey="expertise" position="right" style={{ fill: 'currentColor' }} />
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}
                    
                    {candidate.experience?.length > 0 && (
                    <div>
                        <h3 className="font-semibold text-xl border-b pb-2 mb-4">{t('detail.work_experience')}</h3>
                        <div className="space-y-6">
                        {candidate.experience.map((exp, i) => (
                            <div key={i}>
                                <h4 className="font-bold text-lg">{exp.title || t('common.title_not_available')}</h4>
                                <p className="text-gray-600 dark:text-gray-400 font-medium">{exp.company || t('common.company_not_available')} &bull; <span className="italic">{exp.dates || t('common.dates_not_available')}</span></p>
                                <p className="text-base text-gray-700 dark:text-gray-300 mt-2 whitespace-pre-line">{exp.description || <span className="italic text-gray-500">{t('detail.no_description')}</span>}</p>
                            </div>
                        ))}
                        </div>
                    </div>
                    )}
                     {candidate.education?.length > 0 && (
                     <div>
                        <h3 className="font-semibold text-xl border-b pb-2 mb-4">{t('detail.education')}</h3>
                         <div className="space-y-4">
                        {candidate.education.map((edu, i) => (
                            <div key={i}>
                                <h4 className="font-bold text-lg">{edu.degree || t('common.degree_not_available')}</h4>
                                <p className="text-gray-600 dark:text-gray-400 font-medium">{edu.school || t('common.school_not_available')} &bull; <span className="italic">{edu.dates || t('common.dates_not_available')}</span></p>
                            </div>
                        ))}
                        </div>
                    </div>
                    )}
                </main>
            </div>
            <AIAssistant cvFile={cvFile} />
        </div>
    );
};