import * as React from 'react';
import { Icon } from './icons';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  action?: ToastAction;
  duration?: number;
}

interface ToastContextType {
  showToast: (
    message: string, 
    type?: 'success' | 'error' | 'info',
    action?: ToastAction,
    duration?: number
  ) => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const showToast = (
    message: string, 
    type: 'success' | 'error' | 'info' = 'success',
    action?: ToastAction,
    duration?: number
  ) => {
    const id = Math.random().toString(36).substring(2, 9);
    const effectiveDuration = duration || (action ? 10000 : 3500);
    setToasts(prev => [...prev, { id, message, type, action, duration: effectiveDuration }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, effectiveDuration);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none max-w-md w-full px-4">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-xl shadow-2xl transform transition-all duration-300 animate-fade-in-down border border-white/20 ${
              toast.type === 'success' ? 'bg-green-600 text-white' :
              toast.type === 'error' ? 'bg-red-600 text-white' :
              'bg-blue-600 text-white'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Icon 
                  name={toast.type === 'success' ? 'check' : toast.type === 'error' ? 'alert-triangle' : 'info'} 
                  className="w-5 h-5 flex-shrink-0"
              />
              <span className="font-medium text-xs sm:text-sm leading-snug">{toast.message}</span>
            </div>
            {toast.action && (
              <button
                onClick={() => {
                  toast.action?.onClick();
                  setToasts(prev => prev.filter(t => t.id !== toast.id));
                }}
                className="ml-3 px-3 py-1.5 bg-white text-gray-900 hover:bg-gray-100 active:scale-95 font-bold text-xs rounded-lg shadow-sm transition-all flex-shrink-0 cursor-pointer"
              >
                {toast.action.label}
              </button>
            )}
          </div>
        ))}
      </div>
      <style>{`
        @keyframes fade-in-down {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-down {
          animation: fade-in-down 0.3s ease-out forwards;
        }
      `}</style>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};