// A new component for a full-page AI assistant for dashboard-level queries.
import * as React from 'react';
import { CandidateProfile, ChatMessage } from '../types';
import { Icon } from './icons';
import { createDashboardAIChat } from '../services/geminiService';
import { Chat, GenerateContentResponse } from '@google/genai';
import { useTranslation } from '../i18n';

interface AIAssistantViewProps {
    candidates: CandidateProfile[];
}

export const AIAssistantView: React.FC<AIAssistantViewProps> = ({ candidates }) => {
    const { t } = useTranslation();
    const [chat, setChat] = React.useState<Chat | null>(null);
    const [messages, setMessages] = React.useState<ChatMessage[]>([]);
    const [input, setInput] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const messagesEndRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (candidates.length > 0) {
            try {
                setError(null);
                setChat(createDashboardAIChat(candidates));
                setMessages([{role: 'model', text: t('ai_assistant.dashboard_greeting')}]);
            } catch (e) {
                console.error("Failed to initialize dashboard chat:", e);
                setError(e instanceof Error ? e.message : "Failed to start AI chat.");
            }
        } else {
            setMessages([]);
        }
    }, [candidates, t]);

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
    
    if (candidates.length === 0) {
        return (
            <div className="p-4 sm:p-8 space-y-8 flex flex-col h-full">
                <header>
                    <h2 className="text-3xl font-bold font-display text-gray-800 dark:text-gray-100">{t('ai_assistant.dashboard_title')}</h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">{t('ai_assistant.dashboard_subtitle')}</p>
                </header>
                 <div className="flex-1 flex flex-col items-center justify-center text-center">
                    {/* FIX: Changed `autoPlay` prop to `autoplay` to align with the updated global type definition for the 'dotlottie-wc' custom element. */}
                    <dotlottie-wc
                        src="https://lottie.host/89c66344-281d-4450-91d3-4574a47fec47/31ogoyP4Mh.lottie"
                        autoplay
                        loop
                        style={{ width: '200px', height: '200px' }}
                    ></dotlottie-wc>
                    <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-md">{t('dashboard.no_cv_analyzed')}</p>
                </div>
            </div>
        )
    }

    return (
        <div className="h-full flex flex-col">
            <header className="p-4 sm:p-8 border-b dark:border-gray-800 flex-shrink-0">
                <h2 className="text-3xl font-bold font-display text-gray-800 dark:text-gray-100">{t('ai_assistant.dashboard_title')}</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-1">{t('ai_assistant.dashboard_subtitle')}</p>
            </header>
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
                 {messages.map((msg, index) => (
                    <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.role === 'model' && <div className="flex-shrink-0 w-8 h-8 rounded-full bg-pink-200 dark:bg-pink-900 flex items-center justify-center"><Icon name="bot" className="w-5 h-5 text-pink-600 dark:text-pink-300"/></div>}
                        <div className={`max-w-xl p-4 rounded-xl shadow-sm ${
                            msg.role === 'user' 
                            ? 'bg-gradient-button text-white' 
                            : 'bg-white dark:bg-gray-800 prose prose-sm dark:prose-invert max-w-none'
                        }`}
                        dangerouslySetInnerHTML={{__html: formatMessage(msg.text)}}>
                        </div>
                    </div>
                ))}
                {isLoading && <div className="flex justify-start"><div className="p-3 rounded-lg bg-white dark:bg-gray-800"><Icon name="spinner" className="w-5 h-5"/></div></div>}
                <div ref={messagesEndRef} />
            </div>
            <div className="p-4 border-t dark:border-gray-800 bg-white dark:bg-gray-800/50 flex-shrink-0">
                <div className="flex items-center gap-2 rtl:space-x-reverse">
                    <input 
                        type="text" 
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyPress={e => e.key === 'Enter' && sendMessage()}
                        placeholder={t('ai_assistant.input_placeholder')}
                        disabled={isLoading || !!error}
                        className="w-full p-3 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-pink-500"
                    />
                    <button onClick={sendMessage} disabled={isLoading || !!error} className="bg-gradient-button text-white p-3 rounded-full disabled:bg-none disabled:bg-gray-400 hover:opacity-90 transition-opacity">
                        <Icon name="send" className="w-6 h-6" />
                    </button>
                </div>
            </div>
        </div>
    )
}