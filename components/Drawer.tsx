
import * as React from 'react';
import { Icon } from './icons';

interface DrawerProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

export const Drawer: React.FC<DrawerProps> = ({ isOpen, onClose, title, children }) => {
    const [animate, setAnimate] = React.useState(false);

    React.useEffect(() => {
        if (isOpen) {
            setAnimate(true);
            document.body.style.overflow = 'hidden';
        } else {
            const timer = setTimeout(() => setAnimate(false), 300);
            document.body.style.overflow = 'unset';
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!isOpen && !animate) return null;

    return (
        <div className={`fixed inset-0 z-[60] flex justify-end flex-col transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
            <div className="absolute inset-0 bg-black/50" onClick={onClose} />
            <div 
                className={`relative bg-white dark:bg-gray-900 rounded-t-2xl shadow-xl w-full max-h-[80vh] overflow-y-auto transform transition-transform duration-300 ease-out ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}
            >
                 <div className="sticky top-0 bg-white dark:bg-gray-900 z-10 border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center justify-between">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white font-display">{title}</h3>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                         <Icon name="close" className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    </button>
                </div>
                <div className="p-4 pb-8">
                    {children}
                </div>
            </div>
        </div>
    );
};
