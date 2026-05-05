import React from 'react';
import { motion } from 'motion/react';

import {
  ArrowUpRight,
  CalendarCheck,
  CheckCircle2,
  Database,
  Gauge,
  Zap
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const Questions2025: React.FC = () => {
  const { theme } = useAppContext();

  const portalFeatures = [
    { icon: Database, label: 'Full exam bank' },
    { icon: Gauge, label: 'Practice environments' },
    { icon: CalendarCheck, label: '2025 calibrated set' }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-6xl py-10 px-4 md:px-6"
    >
      <div className="space-y-10">
        <section className="relative overflow-hidden rounded-[36px] p-[4px] shadow-2xl">
          <div className="absolute inset-[-50%] animate-[spin_3s_linear_infinite_reverse] bg-[conic-gradient(from_0deg,#ef4444,#f59e0b,#eab308,#22c55e,#3b82f6,#a855f7,#ef4444)]" />
          <div className={`relative rounded-[32px] p-6 md:p-10 ${
            theme === 'dark'
              ? 'bg-zinc-950/95 shadow-amber-500/5'
              : 'bg-white/95 shadow-zinc-200/50'
          }`}>
            <div className="grid gap-10 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">
            <div className="space-y-7">
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest ${
                theme === 'dark' ? 'bg-amber-500/10 text-amber-400' : 'bg-zinc-950 text-white'
              }`}>
                <Zap size={13} />
                Exclusive Release
              </div>

              <div className="space-y-4">
                <h1 className={`text-4xl md:text-7xl font-heading font-black tracking-tight leading-[0.92] ${
                  theme === 'dark' ? 'text-amber-50' : 'text-zinc-950'
                }`}>
                  2025 Exam <span className="text-amber-500">Bank</span>
                </h1>
                <p className={`max-w-2xl text-sm md:text-lg leading-relaxed ${
                  theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'
                }`}>
                  The 2025 question set is currently being calibrated for maximum accuracy.
                  Access the official portal below for the full 2025 exam bank and practice environments.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                {portalFeatures.map((feature) => (
                  <div
                    key={feature.label}
                    className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-3 text-xs font-black uppercase tracking-widest ${
                      theme === 'dark'
                        ? 'border-zinc-800 bg-zinc-900/60 text-zinc-300'
                        : 'border-zinc-200 bg-zinc-50 text-zinc-700'
                    }`}
                  >
                    <feature.icon size={15} className="text-amber-500" />
                    {feature.label}
                  </div>
                ))}
              </div>
            </div>

            <div className={`rounded-[28px] border p-6 ${
              theme === 'dark'
                ? 'border-zinc-800 bg-zinc-900/70'
                : 'border-zinc-100 bg-zinc-50'
            }`}>
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Portal Status</p>
                    <h2 className={`mt-1 text-2xl font-heading font-black ${
                      theme === 'dark' ? 'text-amber-50' : 'text-zinc-950'
                    }`}>
                      Ready
                    </h2>
                  </div>
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                    theme === 'dark' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600'
                  }`}>
                    <CheckCircle2 size={24} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className={`rounded-2xl p-4 ${
                    theme === 'dark' ? 'bg-zinc-950/80' : 'bg-white'
                  }`}>
                    <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Set</p>
                    <p className={`mt-1 text-xl font-black ${theme === 'dark' ? 'text-amber-50' : 'text-zinc-950'}`}>2025</p>
                  </div>
                  <div className={`rounded-2xl p-4 ${
                    theme === 'dark' ? 'bg-zinc-950/80' : 'bg-white'
                  }`}>
                    <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Mode</p>
                    <p className={`mt-1 text-xl font-black ${theme === 'dark' ? 'text-amber-50' : 'text-zinc-950'}`}>Live</p>
                  </div>
                </div>

                <a
                  href="https://cloudexam2025.netlify.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="button-primary w-full px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-2"
                >
                  Visit 2025 Exam Portal
                  <ArrowUpRight size={16} />
                </a>
              </div>
            </div>
          </div>
          </div>
        </section>
      </div>
    </motion.div>
  );
};

export default Questions2025;
