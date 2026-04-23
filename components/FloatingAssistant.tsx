import React, { useState, useEffect, useRef } from 'react';
import { Icon } from './icons';
import { View, CVFile } from '../types';
import { createGeneralAIChat, createAIChat } from '../services/geminiService';
import { Chat, GenerateContentResponse } from '@google/genai';

interface FloatingAssistantProps {
    currentView: View;
    cvFile?: CVFile | null;
}

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    actionableField?: string;
    actionableContent?: string;
}

import { useTranslation } from '../i18n';

export const FloatingAssistant: React.FC<FloatingAssistantProps> = ({ currentView, cvFile }) => {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [chat, setChat] = useState<Chat | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Initialize or re-initialize chat when view or selected CV changes
    useEffect(() => {
        let newChat = null;
        try {
            if (currentView === 'compare' || currentView === 'dashboard') { // maybe we could pass all profiles later, but for now fallback to general
                 newChat = createGeneralAIChat(currentView);
            } else if (cvFile && cvFile.profile) {
                 newChat = createAIChat(cvFile);
            } else {
                 newChat = createGeneralAIChat(currentView);
            }
            setChat(newChat);
        } catch(e) {
            console.error("Error creating chat:", e);
        }

        // Reset messages with proper greeting based on context
        let greeting = "Salut ! Je suis votre assistant ParseLIQ.";
        if (cvFile && cvFile.profile) {
            greeting = `Je suis prêt à répondre à vos questions sur le profil de ${cvFile.profile.name || 'ce candidat'}.`;
        } else if (currentView === 'create-cv') {
            greeting = "Besoin d'aide pour rédiger votre CV ? Décrivez votre expérience et je vous aiderai à optimiser le contenu !";
        } else if (currentView === 'leaves') {
            greeting = "Je peux vous aider à formuler vos demandes de congés ou vérifier la politique de l'entreprise.";
        } else if (currentView === 'purchase-orders') {
            greeting = "Des questions sur les bons de commande ou la facturation des missions ?";
        } else if (currentView === 'upload') {
            greeting = "Importez des CV ! Je peux vous conseiller sur les critères d'évaluation.";
        }
        
        setMessages([{
            id: Date.now().toString(),
            role: 'assistant',
            content: greeting
        }]);

    }, [currentView, cvFile]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const formatMessage = (text: string) => {
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .split('\n')
            .filter(line => line.trim() !== '')
            .map(line => `<p>${line.replace(/^\s*[\*\-]\s*/, '&bull; ')}</p>`)
            .join('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isTyping || !chat) return;

        const userText = input;
        const userMsg: Message = { id: Date.now().toString(), role: 'user', content: userText };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        try {
            // First send to Gemini API
            const response: GenerateContentResponse = await chat.sendMessage({ message: userText });
            const aiText = response.text;

            let actionableField;
            let actionableContent;

            // Still demo actionable features if it's the create-cv view for presentation purposes
            // We intercept the AI response and parse if it contains something action-like
            const lowerInput = userText.toLowerCase();
            if (currentView === 'create-cv' && (lowerInput.includes('résumé') || lowerInput.includes('summary') || lowerInput.includes('profil'))) {
                actionableField = 'summary';
                // Extract best guess at summary from AI text or provide mock action content
                actionableContent = "Expert innovant avec une solide expérience. " + (aiText.slice(0, 100) + '...');
            }

            const aiMsg: Message = {
                id: Date.now().toString(),
                role: 'assistant',
                content: aiText,
                actionableField,
                actionableContent
            };
            
            setMessages(prev => [...prev, aiMsg]);
        } catch (error) {
            console.error("AI Assistant Error:", error);
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'assistant',
                content: "Désolé, j'ai rencontré une erreur en essayant de communiquer avec l'API."
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleApply = (field: string, content: string) => {
        window.dispatchEvent(new CustomEvent('apply-ai-suggestion', { detail: { field, content } }));
        setIsOpen(false);
    };

    if (currentView === 'ai') return null; // Hide completely on AI view according to specs

    return (
        <>
            {/* Floating Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed bottom-6 right-6 md:bottom-8 md:right-8 rtl:right-auto rtl:left-6 md:rtl:left-8 bg-secondary-500 text-white font-semibold rounded-full px-5 py-3 shadow-lg hover:bg-secondary-600 transition-transform hover:scale-110 z-[9999] flex items-center gap-2 ${isOpen ? 'translate-y-20 opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'}`}
                title="Assistant IA"
            >
                <Icon name="bot" className="w-6 h-6" />
                <span>{t('ai_assistant.title')}</span>
            </button>

            {/* Backdrop for mobile */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black/20 z-[9998] md:hidden" 
                    onClick={() => setIsOpen(false)} 
                />
            )}

            {/* Slide-in Panel */}
            <div 
                className={`fixed top-0 right-0 h-full w-full sm:w-[380px] bg-gray-50 dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 shadow-2xl z-[9999] flex flex-col transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
            >
                {/* Header */}
                <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                    <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-teal-400 to-pink-500 p-[2px]">
                           <div className="w-full h-full bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center">
                                <Icon name="bot" className="w-4 h-4 text-gray-900 dark:text-white" />
                           </div>
                        </div>
                        <div>
                            <h3 className="font-bold font-display text-sm">Assistant ParseLIQ</h3>
                            <p className="text-xs text-gray-500">{cvFile ? `Profil: ${cvFile.profile?.name}` : `Vue: ${currentView}`}</p>
                        </div>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                        <Icon name="close" className="w-5 h-5"/>
                    </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                                msg.role === 'user' 
                                ? 'bg-gradient-button text-white rounded-tr-sm' 
                                : 'bg-white text-gray-800 dark:bg-gray-800 dark:text-gray-100 rounded-tl-sm border dark:border-gray-700'
                            }`}>
                                <div 
                                    className="leading-relaxed prose prose-sm dark:prose-invert max-w-none" 
                                    dangerouslySetInnerHTML={{__html: formatMessage(msg.content)}} 
                                />
                                
                                {msg.actionableField && msg.actionableContent && (
                                    <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 italic">"{msg.actionableContent}"</p>
                                        <button 
                                            onClick={() => handleApply(msg.actionableField!, msg.actionableContent!)}
                                            className="w-full py-1.5 flex items-center justify-center gap-1.5 bg-white text-gray-900 border dark:border-transparent rounded-lg text-xs font-bold hover:bg-gray-100 transition-colors"
                                        >
                                            <Icon name="check" className="w-3.5 h-3.5" /> Appliquer
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    {isTyping && (
                        <div className="flex justify-start">
                             <div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 border dark:border-gray-700 flex gap-1 items-center">
                                 <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                                 <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-75"></span>
                                 <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-150"></span>
                             </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
                    <form onSubmit={handleSubmit} className="flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Demandez de l'aide..."
                            className="flex-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm rounded-full px-4 py-2 focus:outline-none focus:border-teal-500 transition-colors"
                        />
                        <button
                            type="submit"
                            disabled={!input.trim() || isTyping}
                            className="w-10 h-10 rounded-full bg-teal-500 text-white flex items-center justify-center shrink-0 hover:bg-teal-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <Icon name="send" className="w-4 h-4 ml-0.5" />
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
};
