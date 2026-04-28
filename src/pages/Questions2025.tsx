import React from 'react';
import { motion } from 'motion/react';
import { Zap, ShieldCheck, Mail, HelpCircle } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const Questions2025: React.FC = () => {
  const { theme } = useAppContext();

  const previewQuestions = [
    { q: "What is the primary focus of the 2025 DevOps curriculum?", a: "Automation, CI/CD pipelines, and Cloud-Native security orchestration." },
    { q: "Which programming paradigm is emphasized in the 2025 Java updates?", a: "Modern functional programming patterns and Project Loom virtual threads." },
    { q: "What is the new standard for CSS layout in 2025?", a: "Advanced Container Queries and Subgrid for deep component-level responsiveness." }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-4xl py-12 px-4"
    >
      <div className="space-y-12">
        <div className="text-center space-y-6">
          <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
            theme === 'dark' ? 'bg-amber-500/10 text-amber-500' : 'bg-zinc-900 text-white'
          }`}>
            <Zap size={12} />
            Exclusive Release
          </div>
          <h1 className={`text-4xl md:text-6xl font-heading font-black tracking-tight ${
            theme === 'dark' ? 'text-amber-50' : 'text-zinc-950'
          }`}>
            2025 Exam <span className="text-amber-500">Bank</span>
          </h1>
          <p className="text-zinc-500 max-w-xl mx-auto text-sm md:text-base leading-relaxed">
            The 2025 question set is currently being calibrated for maximum accuracy. 
            Below is a preview of the high-priority topics prioritized for the upcoming academic cycle.
          </p>
        </div>

        <div className="grid gap-6">
          {previewQuestions.map((item, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`glass-card p-8 border-2 border-transparent hover:border-amber-500/20 transition-all ${
                theme === 'dark' ? 'bg-zinc-900/40' : 'bg-white/60'
              }`}
            >
              <div className="flex gap-4">
                <div className={`p-2 h-fit rounded-lg ${theme === 'dark' ? 'bg-amber-500/10 text-amber-500' : 'bg-zinc-100 text-zinc-900'}`}>
                  <HelpCircle size={20} />
                </div>
                <div className="space-y-3">
                  <h3 className={`text-lg font-bold leading-tight ${theme === 'dark' ? 'text-amber-200' : 'text-zinc-900'}`}>
                    {item.q}
                  </h3>
                  <div className={`pl-4 border-l-2 ${theme === 'dark' ? 'border-amber-500/30 text-zinc-400' : 'border-zinc-200 text-zinc-500'} text-sm leading-relaxed italic`}>
                    {item.a}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className={`p-8 rounded-3xl border-2 border-dashed flex flex-col items-center text-center space-y-6 ${
          theme === 'dark' ? 'border-zinc-800 bg-zinc-900/20' : 'border-zinc-100 bg-zinc-50/50'
        }`}>
          <div className={`p-4 rounded-full ${theme === 'dark' ? 'bg-amber-500/10 text-amber-500' : 'bg-amber-50 text-amber-600'}`}>
            <ShieldCheck size={32} />
          </div>
          <div className="space-y-2">
            <h4 className={`text-xl font-bold ${theme === 'dark' ? 'text-amber-50' : 'text-zinc-900'}`}>Unlock Full Access</h4>
            <p className="text-zinc-500 text-sm max-w-md">
              Full sets for 2025 are released quarterly. Register with your academic email to receive the direct download link when the next block goes live.
            </p>
          </div>
          <button className="button-primary px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-2">
            <Mail size={16} />
            Notify Me
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default Questions2025;
