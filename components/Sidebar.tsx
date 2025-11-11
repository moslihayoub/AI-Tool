// FIX: Changed react import to namespace import to resolve JSX intrinsic element type errors.
import * as React from 'react';
import { Icon } from './icons';
import { View } from '../types';
import { useTranslation } from '../i18n';

interface SidebarProps {
  currentView: View;
  setCurrentView: (view: View) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (isOpen: boolean) => void;
  isCollapsed: boolean;
  setIsCollapsed: (isCollapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView, isMobileOpen, setIsMobileOpen, isCollapsed, setIsCollapsed }) => {
  const { t } = useTranslation();
  
  const navItems = [
    { id: 'upload', label: t('sidebar.upload'), icon: 'upload' },
    { id: 'dashboard', label: t('sidebar.dashboard'), icon: 'dashboard' },
    { id: 'settings', label: t('sidebar.settings'), icon: 'settings' },
  ];

  const sidebarClasses = `
    fixed top-0 left-0 h-full bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 
    flex flex-col z-40 transition-all duration-300 ease-in-out
    ${isCollapsed ? 'w-20' : 'w-64'}
  `;

  const mobileTransformClasses = isMobileOpen ? 'translate-x-0' : '-translate-x-full';
  
  return (
    <>
      <div onClick={() => setIsMobileOpen(false)} className={`fixed inset-0 bg-black/60 z-30 md:hidden transition-opacity ${isMobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} aria-hidden="true" />
      <aside className={`${sidebarClasses} md:relative md:translate-x-0 transform ${mobileTransformClasses}`}>
        <div className={`p-4 h-16 border-b border-gray-200 dark:border-gray-800 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          <div className={`flex items-center gap-2 overflow-hidden transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
            <Icon name="bot" className="w-8 h-8 text-primary-600 flex-shrink-0"/>
            <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-primary whitespace-nowrap">HR Auto Analyzer</h1>
          </div>
          
          <button onClick={() => setIsCollapsed(!isCollapsed)} className="hidden md:block p-1 text-gray-500 hover:text-gray-200">
            <Icon name="panel-left" className={`w-6 h-6 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`}/>
          </button>
          
          <button onClick={() => setIsMobileOpen(false)} className={`md:hidden p-1`}>
              <Icon name="close" className="w-5 h-5"/>
          </button>
        </div>
        <nav className="flex-1 p-2 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setCurrentView(item.id as View);
                setIsMobileOpen(false);
              }}
              title={isCollapsed ? item.label : undefined}
              className={`w-full flex items-center p-3 rounded-lg text-left transition-colors ${isCollapsed ? 'justify-center' : ''} ${
                currentView === item.id
                  ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-200'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
              }`}
            >
              <Icon name={item.icon} className="w-6 h-6" />
              <span className={`transition-opacity duration-200 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100 ml-3'}`}>{item.label}</span>
            </button>
          ))}
        </nav>
        <footer className={`p-4 border-t border-gray-200 dark:border-gray-800 ${isCollapsed ? 'text-center' : ''}`}>
           <p className={`text-xs text-gray-500 dark:text-gray-400 transition-opacity duration-200 ${isCollapsed ? 'opacity-0 w-0 h-0' : 'opacity-100'}`}>
              {t('sidebar.footer')}
            </p>
        </footer>
      </aside>
    </>
  );
};