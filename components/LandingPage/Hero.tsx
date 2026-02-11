import React from 'react';
import { useNavigate } from 'react-router-dom';

interface HeroProps {
  t: any;
  isVisible: boolean;
}

const Hero: React.FC<HeroProps> = ({ t, isVisible }) => {
  const navigate = useNavigate();

  return (
    <section className="relative pt-32 pb-20 px-6 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12">
      <div className={`flex-1 space-y-8 transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        <div className="inline-flex px-4 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100 dark:border-indigo-800">
          {t.secureDeliveryMarketplace}
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-slate-900 dark:text-white leading-[1.1] tracking-tight">
          {t.heroTitle}
        </h1>
        <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-2xl">
          {t.heroSubtitle}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <button onClick={() => navigate('/dashboard')} className="px-10 py-5 bg-indigo-600 text-white rounded-[2rem] font-black text-lg hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-600/30 active:scale-95 hover:scale-[1.02]">
            {t.startShipping}
          </button>
          <button onClick={() => navigate('/dashboard')} className="px-10 py-5 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-[2rem] font-black text-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-xl active:scale-95">
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
  );
};

export default Hero;
