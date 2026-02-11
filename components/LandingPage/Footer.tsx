import React from 'react';
import { useNavigate } from 'react-router-dom';

interface FooterProps {
  t: any;
}

const Footer: React.FC<FooterProps> = ({ t }) => {
  const navigate = useNavigate();

  return (
    <footer className="py-12 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-900 text-center space-y-6">
      <h2 className="text-3xl font-black text-slate-900 dark:text-white">{t.startShipping}</h2>
      <button onClick={() => navigate('/dashboard')} className="px-12 py-5 bg-indigo-600 text-white rounded-full font-black text-xl hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-600/30">
        {t.enterApp}
      </button>
      <p className="text-slate-400 dark:text-slate-600 text-sm mt-8">
        &copy; 2024 {t.appName}. {t.secureDeliveryMarketplace}.
      </p>
    </footer>
  );
};

export default Footer;
