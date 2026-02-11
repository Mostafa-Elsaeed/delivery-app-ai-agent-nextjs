
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { translations } from '../translations';

interface RootContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
  lang: 'en' | 'ar';
  toggleLanguage: () => void;
  t: any;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const RootContext = createContext<RootContextType | undefined>(undefined);

export const RootProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser === 'undefined' || !savedUser) return null;
    try {
      return JSON.parse(savedUser);
    } catch (e) {
      console.error('Failed to parse user from local storage:', e);
      localStorage.removeItem('currentUser');
      return null;
    }
  });

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) return savedTheme === 'dark';
    return document.documentElement.classList.contains('dark');
  });

  const [lang, setLang] = useState<'en' | 'ar'>(() => {
    const savedLang = localStorage.getItem('lang') as 'en' | 'ar';
    return savedLang || 'en';
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    localStorage.setItem('lang', lang);
  }, [lang]);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  const toggleTheme = () => setIsDarkMode(prev => !prev);
  const toggleLanguage = () => setLang(prev => (prev === 'en' ? 'ar' : 'en'));

  const handleSetCurrentUser = (user: User | null) => {
    setCurrentUser(user);
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('token');
    }
  };

  const t = translations[lang];

  return (
    <RootContext.Provider
      value={{
        currentUser,
        setCurrentUser: handleSetCurrentUser,
        isDarkMode,
        toggleTheme,
        lang,
        toggleLanguage,
        t,
        isLoading,
        setIsLoading,
      }}
    >
      {children}
    </RootContext.Provider>
  );
};

export const useRoot = () => {
  const context = useContext(RootContext);
  if (context === undefined) {
    throw new Error('useRoot must be used within a RootProvider');
  }
  return context;
};
