import React from 'react';
import { useNavigate } from 'react-router-dom';

interface NavbarProps {
  t: any;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onToggleLanguage: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ t, isDarkMode, onToggleTheme, onToggleLanguage }) => {
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/10 dark:bg-slate-900/10 backdrop-blur-md border-b border-white/20 dark:border-slate-800/20 px-6 py-4 flex justify-between items-center transition-all">
      <div className="flex items-center space-x-3">
        <img src="/logo.svg" alt="Logo" className="w-10 h-10 object-contain rounded-xl shadow-lg" />
        <span className="text-xl font-black text-slate-900 dark:text-white hidden sm:block tracking-tight">{t.appName}</span>
      </div>
      <div className="flex items-center space-x-3">
        <button onClick={onToggleLanguage} className="px-3 py-2 bg-white/20 dark:bg-slate-800/20 text-slate-900 dark:text-white rounded-xl hover:bg-white/40 dark:hover:bg-slate-800/40 transition-all text-xs font-bold ring-1 ring-white/30 dark:ring-slate-700/30">
          {t.switchLanguage}
        </button>
        <button onClick={onToggleTheme} className="p-3 bg-white/20 dark:bg-slate-800/20 text-slate-900 dark:text-white rounded-xl hover:bg-white/40 dark:hover:bg-slate-800/40 transition-all ring-1 ring-white/30 dark:ring-slate-700/30">
            {isDarkMode ? '🌞' : '🌙'}
        </button>
        <button onClick={() => navigate('/dashboard')} className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20 active:scale-95 text-xs">
          {t.enterApp}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
