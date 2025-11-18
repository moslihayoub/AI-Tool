// FIX: Changed React import to namespace import `* as React` to resolve widespread JSX intrinsic element type errors, which likely stem from a project configuration that requires this import style.
// FIX: Switched to namespace React import to correctly populate the global JSX namespace.
import * as React from 'react';
import { Icon } from './icons';
import { View } from '../types';
import { useTranslation } from '../i18n';
import { logoDark, logoIcon, logoLight } from '../assets';

interface SidebarProps {
  currentView: View;
  setCurrentView: (view: View) => void;
  isCollapsed: boolean;
  setIsCollapsed: (isCollapsed: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (isOpen: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView, isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen }) => {
  const { t } = useTranslation();
  
  const navItems = [
    { id: 'upload', label: t('sidebar.upload'), icon: 'upload' },
    { id: 'dashboard', label: t('sidebar.dashboard'), icon: 'dashboard' },
    { id: 'ai', label: t('sidebar.ai_assistant'), icon: 'bot' },
    { id: 'favorites', label: t('sidebar.favorites'), icon: 'heart' },
    { id: 'compare', label: t('sidebar.compare'), icon: 'compare' },
    { id: 'settings', label: t('sidebar.settings'), icon: 'settings' },
  ];

  const sidebarClasses = `
    h-full bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800
    flex flex-col z-40 transition-all duration-300 ease-in-out
    fixed md:static inset-y-0 left-0 transform md:transform-none
    ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
    ${isCollapsed ? 'w-20' : 'w-64'} flex-shrink-0
  `;
  
  return (
    <>
      {isMobileOpen && <div onClick={() => setIsMobileOpen(false)} className="fixed inset-0 bg-black/50 z-30 md:hidden" />}
      <aside className={sidebarClasses}>
        <div className={`p-4 h-16 border-b border-gray-200 dark:border-gray-800 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          <div className={`flex items-center gap-2 overflow-hidden transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
            <img src={logoLight} alt="ParseLIQ HR" className="h-9 dark:hidden" />
            <img src={logoDark} alt="ParseLIQ HR" className="h-9 hidden dark:block" />
          </div>
          
          <button onClick={() => setIsCollapsed(!isCollapsed)} className="hidden md:block p-1 text-gray-500 hover:text-gray-200">
            <Icon name="panel-left" className={`w-6 h-6 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`}/>
          </button>
           <button onClick={() => setIsMobileOpen(false)} className="md:hidden p-1 text-gray-500 hover:text-gray-200">
            <Icon name="close" className="w-6 h-6"/>
          </button>
        </div>
        <nav className="flex-1 p-2 space-y-3">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setCurrentView(item.id as View);
                setIsMobileOpen(false);
              }}
              title={isCollapsed ? item.label : undefined}
              className={`w-full flex items-center p-3 rounded-lg ltr:text-left rtl:text-right rtl:flex-row-reverse gap-3 transition-colors ${isCollapsed ? 'justify-center' : ''} ${
                currentView === item.id
                  ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-200'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
              }`}
            >
              <Icon name={item.icon} className="w-6 h-6" />
              <span className={`transition-opacity duration-200 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>{item.label}</span>
            </button>
          ))}
        </nav>
        <footer className={`p-4 border-t border-gray-200 dark:border-gray-800 flex items-center gap-2 ${isCollapsed ? 'justify-center' : ''}`}>
           <img src={logoIcon} alt="ParseLIQ HR Icon" className="w-6 h-6"/>
           <a href="https://bento.me/moslih84" target="_blank" rel="noopener noreferrer" className={`text-sm text-gray-500 dark:text-gray-400 hover:underline transition-opacity duration-200 ${isCollapsed ? 'opacity-0 w-0 h-0' : 'opacity-100'}`}>
              {t('sidebar.footer')}
            </a>
        </footer>
      </aside>
    </>
  );
};