// A new component for a fixed bottom navigation bar on mobile devices.
import * as React from 'react';
import { Icon } from './icons';
import { View } from '../types';
import { useTranslation } from '../i18n';

interface MobileNavBarProps {
  currentView: View;
  setCurrentView: (view: View) => void;
  isVisible: boolean;
}

export const MobileNavBar: React.FC<MobileNavBarProps> = ({ currentView, setCurrentView, isVisible }) => {
  const { t } = useTranslation();

  const navItems = [
    { id: 'upload', label: t('sidebar.upload'), icon: 'upload' },
    { id: 'dashboard', label: t('sidebar.dashboard'), icon: 'dashboard' },
    { id: 'favorites', label: t('sidebar.favorites'), icon: 'heart' },
    { id: 'compare', label: t('sidebar.compare'), icon: 'compare' },
  ];
  
  // FIX: Fixed bug where navbar would disappear on scroll by ensuring it is always visible.
  return (
    <nav className={`fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-t border-gray-200 dark:border-gray-800 md:hidden z-40 transform transition-transform duration-300 ${isVisible ? 'translate-y-0' : 'translate-y-full'}`}>
      <div className="flex justify-around items-center h-16 px-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentView(item.id as View)}
            className={`flex flex-col items-center justify-center flex-grow py-2 mx-1 rounded-lg transition-all duration-200
            ${
                currentView === item.id
                ? 'bg-gradient-button text-white shadow-md'
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <Icon name={item.icon} className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};