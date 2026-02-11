import React, { useEffect, useState } from 'react';
import './LandingPage.css';
import Navbar from './Navbar';
import Hero from './Hero';
import HowItWorks from './HowItWorks';
import Features from './Features';
import Footer from './Footer';

interface LandingPageProps {
  t: any;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onToggleLanguage: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ t, isDarkMode, onToggleTheme, onToggleLanguage }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500 overflow-x-hidden">
      {/* Navbar Overlay */}
      <Navbar t={t} isDarkMode={isDarkMode} onToggleTheme={onToggleTheme} onToggleLanguage={onToggleLanguage} />

      {/* Hero Section */}
      <Hero t={t} isVisible={isVisible} />

      {/* How it Works */}
      <HowItWorks t={t} />

      {/* Features with Images */}
      <Features t={t} />

      {/* Footer */}
      <Footer t={t} />
    </div>
  );
};

export default LandingPage;
