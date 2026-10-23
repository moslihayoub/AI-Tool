
// FIX: Changed React import to namespace import `* as React` to resolve widespread JSX intrinsic element type errors, which likely stem from a project configuration that requires this import style.
// FIX: Switched to namespace React import to correctly populate the global JSX namespace.
import * as React from 'react';
import { Icon } from './icons';
import { View, User } from '../types';
import { useTranslation } from '../i18n';
import { logoDark, logoIcon, logoLight } from '../assets';
import { LogIn, LogOut, User as UserIcon, ShieldCheck } from 'lucide-react';

interface SidebarProps {
  currentView: View;
  setCurrentView: (view: View) => void;
  isCollapsed: boolean;
  setIsCollapsed: (isCollapsed: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (isOpen: boolean) => void;
  isOwner: boolean;
  currentUser?: User | null;
  onOpenAuthModal?: () => void;
  onSignOut?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  currentView, 
  setCurrentView, 
  isCollapsed, 
  setIsCollapsed, 
  isMobileOpen, 
  setIsMobileOpen, 
  isOwner,
  currentUser,
  onOpenAuthModal,
  onSignOut
}) => {
  const { t } = useTranslation();
  
  const recruitmentItems = [
    { id: 'upload', label: t('sidebar.upload'), icon: 'upload' },
    { id: 'create-cv', label: t('sidebar.create_cv'), icon: 'file-pen' },
    { id: 'dashboard', label: t('sidebar.dashboard'), icon: 'dashboard' },
    { id: 'recruitment', label: t('sidebar.recruitment'), icon: 'users' },
    { id: 'compare', label: t('sidebar.compare'), icon: 'compare' },
  ];

  const managementItems = [
    { id: 'missions', label: t('sidebar.missions'), icon: 'briefcase' },
    { id: 'timesheets', label: t('sidebar.timesheets'), icon: 'clock' },
    { id: 'leaves', label: t('sidebar.leaves'), icon: 'calendar-heart' },
    { id: 'purchase-orders', label: t('sidebar.purchase_orders'), icon: 'receipt' },
  ];

  const toolItems = [
    { id: 'history', label: t('sidebar.history'), icon: 'history' },
    { id: 'ai', label: t('sidebar.ai_assistant'), icon: 'bot' },
    { id: 'favorites', label: t('sidebar.favorites'), icon: 'heart' },
    { id: 'settings', label: t('sidebar.settings'), icon: 'settings' },
  ];
  
  if (isOwner) {
      toolItems.push({ id: 'infra', label: t('sidebar.infra'), icon: 'activity' });
  }

  const sidebarClasses = `
    h-full bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800
    flex flex-col z-40 transition-all duration-300 ease-in-out
    fixed md:static inset-y-0 left-0
    ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
    ${isCollapsed ? 'w-20' : 'w-64'} flex-shrink-0
  `;

  const NavGroup = ({ title, items }: { title: string, items: typeof recruitmentItems }) => (
      <div className="mb-4">
          <div className={`px-4 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider ${isCollapsed ? 'hidden' : 'block'}`}>
              {title}
          </div>
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setCurrentView(item.id as View);
                setIsMobileOpen(false);
              }}
              title={isCollapsed ? item.label : undefined}
              className={`w-full flex items-center p-3 rounded-lg ltr:text-left rtl:text-right rtl:flex-row-reverse transition-colors mb-1 ${
                isCollapsed ? 'justify-center' : 'gap-3'
              } ${
                currentView === item.id
                  ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-200'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
              }`}
            >
              <div className={`flex-shrink-0 flex items-center justify-center ${isCollapsed ? 'w-10 h-10 rounded-md' : 'w-8'}`}>
                <Icon name={item.icon} className="w-5 h-5" />
              </div>
              <span className={`transition-opacity duration-200 ${isCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100 text-sm font-medium'}`}>{item.label}</span>
            </button>
          ))}
      </div>
  );
  
  return (
    <>
      {isMobileOpen && <div onClick={() => setIsMobileOpen(false)} className="fixed inset-0 bg-black/50 z-30 md:hidden print:hidden" />}
      <aside className={`${sidebarClasses} print:hidden`}>
        <div className={`p-4 h-16 border-b border-gray-200 dark:border-gray-800 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          <div className={`flex items-center gap-2 overflow-hidden transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
            <img src={logoLight} alt="ParseLIQ HR" className="h-8 dark:hidden" />
            <img src={logoDark} alt="ParseLIQ HR" className="h-8 hidden dark:block" />
          </div>
          
          <button onClick={() => setIsCollapsed(!isCollapsed)} className="hidden md:block p-1 text-gray-500 hover:text-gray-200">
            <Icon name="panel-left" className={`w-6 h-6 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`}/>
          </button>
           <button onClick={() => setIsMobileOpen(false)} className="md:hidden p-1 text-gray-500 hover:text-gray-200">
            <Icon name="close" className="w-6 h-6"/>
          </button>
        </div>
        
        <nav className="flex-1 p-2 overflow-y-auto">
          <NavGroup title="Recrutement" items={recruitmentItems} />
          <NavGroup title="Gestion" items={managementItems} />
          <NavGroup title="Outils" items={toolItems} />
        </nav>

        {/* User Profile / Supabase Auth Card */}
        <div className="p-3 border-t border-gray-200 dark:border-gray-800">
          {currentUser && currentUser.id !== 'guest' ? (
            <div className={`flex items-center gap-2 p-2 rounded-xl bg-gray-100 dark:bg-gray-800/60 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-pink-500 to-rose-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                  {currentUser.email ? currentUser.email.charAt(0).toUpperCase() : 'U'}
                </div>
                {!isCollapsed && (
                  <div className="min-w-0 truncate">
                    <p className="text-xs font-bold text-gray-800 dark:text-gray-100 truncate flex items-center gap-1">
                      {currentUser.email.split('@')[0]}
                      {isOwner && <ShieldCheck className="w-3.5 h-3.5 text-pink-500 flex-shrink-0" />}
                    </p>
                    <p className="text-[10px] text-gray-400 truncate">
                      {isOwner ? 'Administrateur' : 'Utilisateur'}
                    </p>
                  </div>
                )}
              </div>
              {!isCollapsed && onSignOut && (
                <button
                  onClick={onSignOut}
                  title="Se déconnecter"
                  className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              title="Se connecter"
              className={`w-full py-2.5 px-3 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer ${
                isCollapsed ? 'px-0' : ''
              }`}
            >
              <LogIn className="w-4 h-4" />
              {!isCollapsed && <span>Connexion / Inscription</span>}
            </button>
          )}
        </div>

        <footer className={`p-3 border-t border-gray-200 dark:border-gray-800 flex items-center gap-2 ${isCollapsed ? 'justify-center' : ''}`}>
           <img src={logoIcon} alt="ParseLIQ HR Icon" className="w-5 h-5"/>
           <a href="https://www.linkedin.com/in/moslih84/" target="_blank" rel="noopener noreferrer" className={`text-xs text-gray-500 dark:text-gray-400 hover:underline transition-opacity duration-200 ${isCollapsed ? 'opacity-0 w-0 h-0' : 'opacity-100'}`}>
              {t('sidebar.footer')}
            </a>
        </footer>
      </aside>
    </>
  );
};
