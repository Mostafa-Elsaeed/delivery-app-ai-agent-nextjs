import React from 'react';

interface FeaturesProps {
  t: any;
}

const Features: React.FC<FeaturesProps> = ({ t }) => {
  return (
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
  );
};

export default Features;
