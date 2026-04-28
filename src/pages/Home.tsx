import React from 'react';
import { motion } from 'motion/react';
import { Zap, BookOpen, Send, Clock, Trophy, Flame } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { UserStats } from '../types';
import Magnetic from '../components/ui/Magnetic';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar } from 'recharts';

const Home: React.FC = () => {
  const { theme, userStats } = useAppContext();
  const navigate = useNavigate();

  const colorClasses: Record<string, any> = {
    emerald: {
      darkBorder: 'hover:border-emerald-500/40',
      lightBorder: 'hover:border-emerald-200',
      darkIconBg: 'text-emerald-400',
      lightIconBg: 'bg-emerald-50 text-emerald-600',
      text: 'text-emerald-500',
      btn: 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'
    },
    blue: {
      darkBorder: 'hover:border-blue-500/40',
      lightBorder: 'hover:border-blue-200',
      darkIconBg: 'text-blue-400',
      lightIconBg: 'bg-blue-50 text-blue-600',
      text: 'text-blue-500',
      btn: 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'
    },
    amber: {
      darkBorder: 'hover:border-amber-500/40',
      lightBorder: 'hover:border-amber-200',
      darkIconBg: 'text-amber-400',
      lightIconBg: 'bg-amber-50 text-amber-600',
      text: 'text-amber-500',
      btn: 'bg-amber-600 hover:bg-amber-700 shadow-amber-500/20'
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-7xl space-y-20 py-12 px-6"
    >
      {/* Hero / Dashboard Header */}
      <section className="relative">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12 pt-8">
          <div className="flex-1 space-y-8 text-center md:text-left">
            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="inline-flex items-center gap-3 px-4 py-2 bg-zinc-900 dark:bg-amber-500/10 text-white dark:text-amber-500 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-zinc-500/10 border border-white/10"
            >
              <Zap size={12} className="text-amber-400" />
              Academic Command Center • 2026
            </motion.div>
            
            <div className="space-y-4">
              <h1 className={`text-4xl md:text-8xl font-heading font-black tracking-tight leading-[0.9] ${theme === 'dark' ? 'text-amber-50' : 'text-zinc-950'}`}>
                PRACTICE <br /> 
                <span className="text-zinc-400 font-display italic font-light text-2xl md:text-6xl lowercase">to</span> <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600">ACHIEVE.</span>
              </h1>
              <p className="text-zinc-500 text-lg md:text-xl max-w-xl leading-relaxed font-medium">
                Your personalized roadmap to academic mastery. Scientific retention met with high-performance assessment.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-4">
              <button 
                onClick={() => navigate('/practice')}
                className="button-primary px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all"
              >
                Jump to Practice
              </button>
              <button 
                onClick={() => navigate('/learning')}
                className={`px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest border transition-all ${
                  theme === 'dark' ? 'border-zinc-800 bg-zinc-900/50 text-zinc-100 hover:border-amber-500/30' : 'border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50'
                }`}
              >
                Browse Study Sets
              </button>
            </div>
          </div>

          {/* Quick Stats Widget */}
          <div className="w-full md:w-[400px]">
            <motion.div 
              whileHover={{ y: -5 }}
              className={`p-8 rounded-[40px] border shadow-2xl relative overflow-hidden group ${
                theme === 'dark' ? 'bg-zinc-900/50 border-amber-500/20' : 'bg-white border-zinc-100'
              }`}
            >
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <Zap size={120} />
              </div>

              <div className="relative z-10 space-y-8">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Total Score</p>
                    <p className={`text-4xl font-display font-black mt-1 ${theme === 'dark' ? 'text-amber-500' : 'text-zinc-950'}`}>
                      {userStats.totalPoints.toLocaleString()}
                    </p>
                  </div>
                  <div className={`p-4 rounded-2xl ${theme === 'dark' ? 'bg-amber-500/10 text-amber-500' : 'bg-amber-50 text-amber-600'}`}>
                    <Trophy size={24} />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between text-xs font-bold uppercase tracking-tighter">
                    <span className="text-zinc-500">Mastery Level {Math.floor(userStats.totalPoints / 2000) + 1}</span>
                    <span className={theme === 'dark' ? 'text-amber-500' : 'text-zinc-900'}>{Math.round((userStats.totalPoints % 2000) / 20)}% to next</span>
                  </div>
                  <div className={`h-2 w-full rounded-full overflow-hidden ${theme === 'dark' ? 'bg-zinc-800' : 'bg-zinc-100'}`}>
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(userStats.totalPoints % 2000) / 20}%` }}
                      className={`h-full rounded-full ${theme === 'dark' ? 'bg-amber-500' : 'bg-zinc-900'}`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className={`p-4 rounded-3xl border ${theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-50 border-zinc-100'}`}>
                      <p className="text-[9px] font-black uppercase tracking-widest text-orange-500 mb-1 flex items-center gap-1">
                        <Flame size={10} className="fill-orange-500" />
                        Streak
                      </p>
                      <p className={`text-xl font-black ${theme === 'dark' ? 'text-amber-50' : 'text-zinc-950'}`}>{userStats.streak} Days</p>
                   </div>
                   <div className={`p-4 rounded-3xl border ${theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-50 border-zinc-100'}`}>
                      <p className="text-[9px] font-black uppercase tracking-widest text-blue-500 mb-1">Accuracy</p>
                      <p className={`text-xl font-black ${theme === 'dark' ? 'text-amber-50' : 'text-zinc-950'}`}>
                        {(() => {
                          let total = 0;
                          let correct = 0;
                          (Object.values(userStats.categoryPerformance) as { correct: number; total: number }[]).forEach((perf) => {
                            total += perf.total;
                            correct += perf.correct;
                          });
                          return total > 0 ? Math.round((correct / total) * 100) : 0;
                        })()}%
                      </p>
                   </div>
                </div>

                {/* Subject Mastery Radar (Simplified) */}
                {Object.keys(userStats.categoryPerformance).length >= 3 && (
                  <div className="h-48 w-full mt-4 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="60%" data={
                        (Object.entries(userStats.categoryPerformance) as [string, { correct: number; total: number }][]).map(([name, perf]) => ({
                          subject: name,
                          score: (perf.correct / perf.total) * 100
                        }))
                      }>
                        <PolarGrid stroke={theme === 'dark' ? "#3f3f46" : "#e4e4e7"} />
                        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 8, fontWeight: 700, fill: '#71717a' }} />
                        <Radar
                          name="Mastery"
                          dataKey="score"
                          stroke="#f59e0b"
                          fill="#f59e0b"
                          fillOpacity={0.5}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pathways Grid */}
      <section className="space-y-8">
        <div className="flex items-end justify-between px-2">
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500">Select Activity</p>
            <h2 className="text-3xl font-heading font-black tracking-tight">Main Pathways</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-0">
          {[
            { id: '1', title: 'MASTERY', step: '01', color: 'emerald', icon: BookOpen, desc: 'Internalize concepts with side-by-side study sets.', route: '/learning', label: 'Study' },
            { id: '2', title: 'PRACTICE', step: '02', color: 'blue', icon: Send, desc: 'Validate progress with untimed practice quizzes.', route: '/practice', label: 'Test' },
            { id: '3', title: 'ASSESSMENT', step: '03', color: 'amber', icon: Clock, desc: 'Prove excellence under pressure with timers.', route: '/assessment', label: 'Blitz' }
          ].map((item) => {
            const classes = colorClasses[item.color];
            return (
              <motion.div 
                key={item.id}
                whileHover={{ y: -8 }}
                className={`p-10 rounded-[48px] flex flex-col items-center text-center group border transition-all duration-500 ${
                  theme === 'dark' 
                    ? `bg-zinc-900/50 border-zinc-800 ${classes.darkBorder}` 
                    : `bg-white border-zinc-100 ${classes.lightBorder}`
                }`}
              >
                <div className={`w-20 h-20 rounded-[32px] flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500 shadow-inner ${
                  theme === 'dark' ? `bg-zinc-950 ${classes.darkIconBg}` : `${classes.lightIconBg}`
                }`}>
                  <item.icon size={32} />
                </div>
                <span className={`text-[10px] font-black uppercase tracking-[0.2em] mb-2 opacity-60 ${classes.text}`}>Step {item.step}</span>
                <h3 className={`text-2xl font-black mb-4 tracking-tight ${theme === 'dark' ? 'text-zinc-50' : 'text-zinc-900'}`}>{item.title}</h3>
                <p className={`${theme === 'dark' ? 'text-zinc-500' : 'text-zinc-400'} text-sm leading-relaxed mb-10 flex-1`}>
                  {item.desc}
                </p>
                <Magnetic>
                  <button 
                    onClick={() => navigate(item.route)}
                    className={`px-8 py-3 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all shadow-xl ${
                      theme === 'dark' 
                        ? `bg-zinc-800 text-zinc-100 hover:bg-zinc-700` 
                        : `${classes.btn} text-white`
                    }`}
                  >
                    {item.label} Mode
                  </button>
                </Magnetic>
              </motion.div>
            );
          })}
        </div>
      </section>
    </motion.div>
  );
};

export default Home;
