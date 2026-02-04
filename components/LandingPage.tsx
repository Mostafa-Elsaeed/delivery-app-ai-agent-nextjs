
import React, { useEffect, useState } from 'react';

interface LandingPageProps {
  onExplore: () => void;
  t: any;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onToggleLanguage: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onExplore, t, isDarkMode, onToggleTheme, onToggleLanguage }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500 overflow-x-hidden">
      {/* Navbar Overlay */}
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
          <button onClick={onExplore} className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20 active:scale-95 text-xs">
            {t.enterApp}
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12">
        <div className={`flex-1 space-y-8 transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="inline-flex px-4 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100 dark:border-indigo-800">
            {t.secureDeliveryMarketplace}
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white leading-[1.1] tracking-tight">
            {t.heroTitle}
          </h1>
          <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-2xl">
            {t.heroSubtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button onClick={onExplore} className="px-10 py-5 bg-indigo-600 text-white rounded-[2rem] font-black text-lg hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-600/30 active:scale-95 hover:scale-[1.02]">
              {t.startShipping}
            </button>
            <button onClick={onExplore} className="px-10 py-5 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-[2rem] font-black text-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-xl active:scale-95">
              {t.joinAsRider}
            </button>
          </div>
        </div>
        <div className={`flex-1 relative transition-all duration-1000 delay-300 transform ${isVisible ? 'scale-100 opacity-100' : 'scale-90 opacity-0'}`}>
           <div className="absolute -top-10 -left-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl animate-pulse"></div>
           <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
           <img src="/hero.png" alt="Delivery Hero" className="w-full h-auto rounded-[3rem] shadow-2xl relative z-10 border-4 border-white/50 dark:border-slate-800/50" />
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 bg-slate-100 dark:bg-slate-900/50 transition-colors">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl font-black text-slate-900 dark:text-white">{t.howItWorks}</h2>
            <div className="w-20 h-1.5 bg-indigo-600 mx-auto rounded-full"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((step) => (
              <div key={step} className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl space-y-6 hover:-translate-y-2 transition-transform">
                <div className="w-16 h-16 bg-indigo-600 text-white rounded-2xl flex items-center justify-center text-3xl font-black shadow-lg">
                  {step}
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">{(t as any)[`step${step}Title`]}</h3>
                <p className="text-slate-500 dark:text-slate-400 font-medium">{(t as any)[`step${step}Desc`]}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features with Images */}
      <section className="py-20 max-w-7xl mx-auto px-6 space-y-32">
        {/* Feature 1 */}
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1 order-2 lg:order-1">
            <img src="/bidding.png" alt="Bidding" className="w-full rounded-[3rem] shadow-2xl border-4 border-white dark:border-slate-800" />
          </div>
          <div className="flex-1 space-y-6 order-1 lg:order-2">
            <h3 className="text-4xl font-black text-slate-900 dark:text-white">{t.feature1Title}</h3>
            <p className="text-lg text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{t.feature1Desc}</p>
            <div className="h-1 w-20 bg-emerald-500 rounded-full"></div>
          </div>
        </div>

        {/* Feature 2 */}
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1 space-y-6">
            <h3 className="text-4xl font-black text-slate-900 dark:text-white">{t.feature2Title}</h3>
            <p className="text-lg text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{t.feature2Desc}</p>
            <div className="h-1 w-20 bg-indigo-500 rounded-full"></div>
          </div>
          <div className="flex-1">
            <img src="/security.png" alt="Security" className="w-full rounded-[3rem] shadow-2xl border-4 border-white dark:border-slate-800" />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-900 text-center space-y-6">
        <h2 className="text-3xl font-black text-slate-900 dark:text-white">{t.startShipping}</h2>
        <button onClick={onExplore} className="px-12 py-5 bg-indigo-600 text-white rounded-full font-black text-xl hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-600/30">
          {t.enterApp}
        </button>
        <p className="text-slate-400 dark:text-slate-600 text-sm mt-8">
          &copy; 2024 {t.appName}. {t.secureDeliveryMarketplace}.
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;
