import React from 'react';

interface HowItWorksProps {
  t: any;
}

const HowItWorks: React.FC<HowItWorksProps> = ({ t }) => {
  return (
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
  );
};

export default HowItWorks;
