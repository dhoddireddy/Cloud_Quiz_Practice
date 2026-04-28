import React from 'react';
import { motion } from 'motion/react';
import { Zap, Heart } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

export const Footer = () => {
  const { theme, isImmersive } = useAppContext();

  if (isImmersive) return null;

  return (
    <footer className={`w-full mt-32 border-t py-12 transition-all duration-500 ${
      theme === 'dark' 
        ? 'bg-zinc-950 border-zinc-800' 
        : 'bg-white border-zinc-100'
    }`}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-start gap-12">
          <div className="space-y-6 max-w-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-zinc-900 dark:bg-amber-500 text-white dark:text-zinc-950 rounded-xl">
                <Zap size={18} />
              </div>
              <span className={`font-heading font-black text-xl tracking-tight uppercase ${
                theme === 'dark' ? 'text-amber-500' : 'text-zinc-900'
              }`}>
                Practice to Achieve
              </span>
            </div>
            <p className={`text-sm leading-relaxed ${
              theme === 'dark' ? 'text-zinc-500' : 'text-zinc-400'
            }`}>
              An advanced educational platform dedicated to mastering modern tech curriculum through scientific retention and real-time assessments.
            </p>
          </div>

          <div className="space-y-6 md:text-right">
            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500">Academic Pledge</p>
              <p className={`text-sm md:text-base font-bold italic max-w-md ${
                theme === 'dark' ? 'text-zinc-300' : 'text-zinc-700'
              }`}>
                "Exclusively for educational purposes. This platform is not to be used for any commercial or non-academic intent."
              </p>
            </div>
          </div>
        </div>

        <div className={`mt-16 pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-4 ${
          theme === 'dark' ? 'border-zinc-800/50' : 'border-zinc-100'
        }`}>
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
            <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
              © {new Date().getFullYear()} Practice to Achieve
            </p>
            <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
              theme === 'dark' 
                ? 'bg-zinc-900 border-zinc-800 text-zinc-500' 
                : 'bg-zinc-50 border-zinc-100 text-zinc-400'
            }`}>
              v2.0 Academic Edition
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
            Built for Knowledge <Heart size={10} className="text-rose-500 fill-rose-500" /> 2026
          </div>
        </div>
      </div>
    </footer>
  );
};
