// FIX: Changed React import to namespace import `* as React` to resolve widespread JSX intrinsic element type errors, which likely stem from a project configuration that requires this import style.
import * as React from 'react';
import { Icon } from './icons';
import { useTranslation } from '../i18n';

interface QuotaModalProps {
    onClose: () => void;
    onConnect: (credentials: { userId: string; email: string; rememberMe: boolean }) => boolean;
}

export const QuotaModal: React.FC<QuotaModalProps> = ({ onClose, onConnect }) => {
    const { t } = useTranslation();
    const [userId, setUserId] = React.useState('');
    const [email, setEmail] = React.useState('');
    const [rememberMe, setRememberMe] = React.useState(false);
    const [error, setError] = React.useState('');
    const modalRef = React.useRef<HTMLDivElement>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const success = onConnect({ userId, email, rememberMe });
        if (!success) {
            setError(t('quota_modal.error'));
            if (modalRef.current) {
                modalRef.current.classList.add('animate-shake');
                setTimeout(() => modalRef.current?.classList.remove('animate-shake'), 500);
            }
        }
    };
    
    React.useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [onClose]);

    const handleWhatsAppClick = () => {
        window.open('https://wa.me/212663585065', '_blank');
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in" role="dialog" aria-modal="true" aria-labelledby="quota-modal-title">
            <div ref={modalRef} className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md m-auto flex flex-col relative animate-scale-up max-h-[95vh] overflow-y-auto">
                <div className="p-8 pt-12 text-center flex flex-col items-center">
                    <h2 id="quota-modal-title" className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">{t('quota_modal.title')}</h2>
                    <div className="my-2">
                         <dotlottie-wc src="https://lottie.host/352a0ebe-e2b1-4c2a-8e52-ca0386d46cfe/HRzXfUbyWz.lottie" style={{ width: '160px', height: '160px' }} autoplay loop></dotlottie-wc>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400">{t('quota_modal.description')}</p>
                    
                    <form onSubmit={handleSubmit} className="w-full mt-6 space-y-4 text-left">
                        <div>
                            <label htmlFor="userId" className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('quota_modal.user_id')}</label>
                            <input
                                id="userId"
                                type="text"
                                value={userId}
                                onChange={(e) => setUserId(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                placeholder={t('quota_modal.user_id_placeholder')}
                            />
                        </div>
                        <div>
                            <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('quota_modal.email')}</label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                placeholder={t('quota_modal.email_placeholder')}
                            />
                        </div>
                        <div className="flex items-center pt-2">
                            <input
                                id="rememberMe"
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                            />
                            <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-900 dark:text-gray-200">{t('quota_modal.remember_me')}</label>
                        </div>
                        {error && <p className="text-sm text-red-500 text-center pt-1" role="alert">{error}</p>}
                   

                        <div className="w-full pt-4 flex flex-col gap-3">
                            <div className="flex w-full gap-3">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="w-1/2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold py-3 px-4 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:focus:ring-offset-gray-800"
                                >
                                    {t('quota_modal.close')}
                                </button>
                                <button
                                    type="submit"
                                    className="w-1/2 bg-primary-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-primary-700 transition-colors disabled:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-800"
                                >
                                    {t('quota_modal.connect')}
                                </button>
                            </div>
                            <button
                                type="button"
                                onClick={handleWhatsAppClick}
                                className="w-full bg-green-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-gray-800"
                            >
                                {t('quota_modal.contact_support')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            {/* Animations */}
            <style>{`
                @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
                @keyframes scale-up { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
                @keyframes shake {
                  0%, 100% { transform: translateX(0); }
                  10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
                  20%, 40%, 60%, 80% { transform: translateX(5px); }
                }
                .animate-fade-in { animation: fade-in 0.2s ease-out forwards; }
                .animate-scale-up { animation: scale-up 0.2s ease-out forwards; }
                .animate-shake { animation: shake 0.5s ease-in-out; }
            `}</style>
        </div>
    );
};