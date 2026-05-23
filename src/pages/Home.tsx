import React from 'react';
import { motion } from 'motion/react';
import { Zap, BookOpen, Send, Clock, Trophy, Flame, ChevronRight, Layers, Database, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
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
      className="w-full max-w-7xl space-y-16 py-8 px-4 sm:px-6"
    >
      {/* ================= CLOUD FSD TOP REGION ================= */}
      <section className="relative overflow-hidden rounded-[40px] border border-amber-500/20 bg-gradient-to-br from-amber-500/5 via-orange-500/5 to-transparent p-8 sm:p-12 shadow-2xl">
        <div className="absolute top-0 right-0 p-8 opacity-5 text-amber-500 pointer-events-none">
          <Database size={160} />
        </div>

        <div className="space-y-10 relative z-10">
          {/* Section tag */}
          <div className="flex justify-center md:justify-start">
            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 dark:bg-amber-500/10 text-white dark:text-amber-500 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg"
            >
              <Zap size={12} className="text-amber-400 animate-pulse" />
              Primary Hub • Cloud FSD Program
            </motion.div>
          </div>

          {/* Hero text */}
          <div className="text-center md:text-left space-y-4 max-w-3xl">
            <h1 className={`text-4xl sm:text-6xl font-heading font-black tracking-tight leading-none ${theme === 'dark' ? 'text-amber-50' : 'text-zinc-950'}`}>
              CLOUD FULL STACK <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600">DEVELOPER (FSD)</span>
            </h1>
            <p className="text-zinc-500 text-base sm:text-lg leading-relaxed font-semibold">
              Accelerate your preparation with the official Cloud FSD question bank. Access our extensive study modules and comprehensive examination simulator.
            </p>
          </div>

          {/* Core Study & Exam Actions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            
            {/* Card 1: Interactive Study Decks */}
            <motion.div 
              whileHover={{ y: -6, scale: 1.01 }}
              onClick={() => navigate('/cloud-fsd')}
              className={`p-8 cursor-pointer rounded-[32px] border transition-all duration-300 flex flex-col justify-between group min-h-[220px] ${
                theme === 'dark' 
                  ? 'bg-zinc-900/60 border-zinc-800 hover:border-amber-500/40 hover:shadow-amber-500/5' 
                  : 'bg-white border-zinc-100 hover:border-zinc-200 hover:shadow-zinc-200/20'
              } shadow-xl`}
            >
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className={`px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest ${
                    theme === 'dark' ? 'bg-zinc-950 text-zinc-400' : 'bg-zinc-50 text-zinc-505'
                  }`}>
                    Study Deck Mode
                  </span>
                  <div className={`p-2.5 rounded-xl ${
                    theme === 'dark' ? 'bg-zinc-950 text-amber-400' : 'bg-zinc-50 text-zinc-700'
                  }`}>
                    <BookOpen size={18} />
                  </div>
                </div>
                <h3 className={`text-xl font-heading font-black uppercase tracking-tight group-hover:text-amber-500 transition-colors ${
                  theme === 'dark' ? 'text-amber-50' : 'text-zinc-900'
                }`}>
                  FSD Study Modules
                </h3>
                <p className={`text-xs font-semibold leading-relaxed ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`}>
                  Study all 563 comprehensive question cards with answers instantly highlighted for fast review and concepts revision.
                </p>
              </div>

              <div className="pt-6 flex items-center justify-between border-t border-zinc-100/50 dark:border-zinc-800/50 mt-6">
                <span className="text-[9px] font-black uppercase tracking-widest text-amber-500">
                  563 Curated Questions
                </span>
                <div className={`p-2 rounded-xl transition-all group-hover:translate-x-1 ${
                  theme === 'dark' ? 'bg-zinc-800 text-amber-400' : 'bg-zinc-50 text-zinc-900'
                }`}>
                  <ChevronRight size={14} />
                </div>
              </div>
            </motion.div>

            {/* Card 2: Timed Examination Hall */}
            <motion.div 
              whileHover={{ y: -6, scale: 1.01 }}
              onClick={() => navigate('/examination')}
              className={`p-8 cursor-pointer rounded-[32px] border transition-all duration-300 flex flex-col justify-between group min-h-[220px] ${
                theme === 'dark' 
                  ? 'bg-zinc-900/60 border-zinc-800 hover:border-amber-500/40 hover:shadow-amber-500/5' 
                  : 'bg-white border-zinc-100 hover:border-zinc-200 hover:shadow-zinc-200/20'
              } shadow-xl`}
            >
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className={`px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest ${
                    theme === 'dark' ? 'bg-zinc-950 text-zinc-400' : 'bg-zinc-50 text-zinc-505'
                  }`}>
                    Exam Simulation
                  </span>
                  <div className={`p-2.5 rounded-xl ${
                    theme === 'dark' ? 'bg-zinc-950 text-amber-400' : 'bg-zinc-50 text-zinc-700'
                  }`}>
                    <Play size={18} />
                  </div>
                </div>
                <h3 className={`text-xl font-heading font-black uppercase tracking-tight group-hover:text-amber-500 transition-colors ${
                  theme === 'dark' ? 'text-amber-50' : 'text-zinc-900'
                }`}>
                  Timed Examination Hall
                </h3>
                <p className={`text-xs font-semibold leading-relaxed ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`}>
                  Launch a full 60-question timed certification simulation. Follows strict topic metrics and active browser anti-cheat.
                </p>
              </div>

              <div className="pt-6 flex items-center justify-between border-t border-zinc-100/50 dark:border-zinc-800/50 mt-6">
                <span className="text-[9px] font-black uppercase tracking-widest text-amber-500">
                  60 Qs • Shuffled • 1 Hr Timer
                </span>
                <div className={`p-2 rounded-xl transition-all group-hover:translate-x-1 ${
                  theme === 'dark' ? 'bg-zinc-800 text-amber-400' : 'bg-zinc-50 text-zinc-900'
                }`}>
                  <ChevronRight size={14} />
                </div>
              </div>
            </motion.div>

          </div>

          {/* Quick Metrics Tagbar */}
          <div className="flex flex-wrap items-center gap-6 pt-4 text-xs font-semibold text-zinc-500 dark:text-zinc-400 justify-center md:justify-start">
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              11 Curriculum Topics
            </span>
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              Active Revision Tracking
            </span>
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              Anti-Cheat Session Locks
            </span>
          </div>

        </div>
      </section>

      {/* ================= SLEEK VISUAL DIVIDER ================= */}
      <div className="relative py-4 flex items-center justify-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-zinc-200 dark:border-zinc-800" />
        </div>
        <span className="relative px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.3em] bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-400">
          Amerpet Core Pathways & Analytics
        </span>
      </div>

      {/* ================= AMERPET BOTTOM REGION ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Welcome & Mastery progress */}
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500">Curriculum Dashboard</p>
            <h2 className="text-3xl font-heading font-black tracking-tight">Amerpet Mastery Overview</h2>
            <p className="text-zinc-500 text-xs font-medium max-w-xl">
              Track your cumulative academic points, daily active learning streaks, and detailed subject mastery levels from the core Amerpet pathways.
            </p>
          </div>

          {/* Points Progress Card */}
          <div className={`p-8 rounded-[32px] border relative overflow-hidden group ${
            theme === 'dark' ? 'bg-zinc-900/40 border-zinc-800' : 'bg-white border-zinc-150'
          } shadow-xl`}>
            <div className="relative z-10 space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Mastery Score</p>
                  <p className={`text-4xl font-display font-black mt-1 ${theme === 'dark' ? 'text-amber-500' : 'text-zinc-950'}`}>
                    {userStats.totalPoints.toLocaleString()}
                  </p>
                </div>
                <div className={`p-3.5 rounded-xl ${theme === 'dark' ? 'bg-amber-500/10 text-amber-500' : 'bg-amber-50 text-amber-600'}`}>
                  <Trophy size={20} />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                  <span className="text-zinc-500">Mastery Level {Math.floor(userStats.totalPoints / 2000) + 1}</span>
                  <span className={theme === 'dark' ? 'text-amber-500' : 'text-zinc-900'}>{Math.round((userStats.totalPoints % 2000) / 20)}% to next</span>
                </div>
                <div className={`h-2.5 w-full rounded-full overflow-hidden ${theme === 'dark' ? 'bg-zinc-800' : 'bg-zinc-100'}`}>
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(userStats.totalPoints % 2000) / 20}%` }}
                    className={`h-full rounded-full ${theme === 'dark' ? 'bg-amber-500' : 'bg-zinc-900'}`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                 <div className={`p-4 rounded-2xl border ${theme === 'dark' ? 'bg-zinc-950/60 border-zinc-800' : 'bg-zinc-50/50 border-zinc-100'}`}>
                    <p className="text-[9px] font-black uppercase tracking-widest text-orange-500 mb-1 flex items-center gap-1">
                      <Flame size={10} className="fill-orange-500" />
                      Active Streak
                    </p>
                    <p className={`text-lg font-black ${theme === 'dark' ? 'text-amber-50' : 'text-zinc-950'}`}>{userStats.streak} Days</p>
                 </div>
                 <div className={`p-4 rounded-2xl border ${theme === 'dark' ? 'bg-zinc-950/60 border-zinc-800' : 'bg-zinc-50/50 border-zinc-100'}`}>
                    <p className="text-[9px] font-black uppercase tracking-widest text-blue-500 mb-1">Mean Accuracy</p>
                    <p className={`text-lg font-black ${theme === 'dark' ? 'text-amber-50' : 'text-zinc-950'}`}>
                      {(() => {
                        let total = 0;
                        let correct = 0;
                        Object.values(userStats.categoryPerformance).forEach((perf: any) => {
                          total += perf.total;
                          correct += perf.correct;
                        });
                        return total > 0 ? Math.round((correct / total) * 100) : 0;
                      })()}%
                    </p>
                 </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Mastery radar chart & Recent simulation history */}
        <div className="space-y-6">
          <div className={`p-6 rounded-[32px] border ${
            theme === 'dark' ? 'bg-zinc-900/30 border-zinc-800' : 'bg-white border-zinc-100'
          } shadow-xl flex flex-col justify-between min-h-[300px]`}>
            <div className="space-y-2 text-center">
              <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Subject Domains</p>
              <h4 className="text-sm font-black uppercase">Skill Mastery Matrix</h4>
            </div>

            {Object.keys(userStats.categoryPerformance).length >= 3 ? (
              <div className="h-44 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="55%" data={
                    Object.entries(userStats.categoryPerformance).map(([name, perf]: any) => ({
                      subject: name.length > 8 ? name.substring(0, 7) + '..' : name,
                      score: (perf.correct / perf.total) * 100
                    }))
                  }>
                    <PolarGrid stroke={theme === 'dark' ? "#27272a" : "#f4f4f5"} />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 8, fontWeight: 700, fill: '#71717a' }} />
                    <Radar
                      name="Mastery"
                      dataKey="score"
                      stroke="#f59e0b"
                      fill="#f59e0b"
                      fillOpacity={0.4}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-zinc-400 text-xs py-8">
                Not enough practice records to map skill metrics.
              </div>
            )}

            {/* Recent simulation test widget */}
            <div className="border-t border-zinc-100/50 dark:border-zinc-800/50 pt-4">
              <div className="flex items-center justify-between text-xs">
                <div>
                  <p className="text-[9px] font-black uppercase text-zinc-400">Last Assessment</p>
                  <p className="font-bold text-zinc-700 dark:text-zinc-300">
                    {(function(){ try { const raw = localStorage.getItem('pta_tests'); const list = raw ? JSON.parse(raw) as any[] : []; return list && list.length > 0 ? list[0].id : 'None'; } catch { return 'None'; } })()}
                  </p>
                </div>
                <button 
                  onClick={() => { 
                    try { 
                      const raw = localStorage.getItem('pta_tests'); 
                      const list = raw ? JSON.parse(raw) as any[] : []; 
                      if (list && list.length > 0) window.open(`/test/history/${list[0].id}`, '_blank'); 
                    } catch {} 
                  }} 
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold text-[9px] uppercase tracking-wider transition-colors"
                >
                  Review
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Pathways Cards Row */}
      <section className="space-y-8">
        <div className="px-2 space-y-1">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500">Core Pathways</p>
          <h2 className="text-2xl font-heading font-black tracking-tight">Amerpet Active Learning Steps</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { id: '1', title: 'MASTERY', step: '01', color: 'emerald', icon: BookOpen, desc: 'Internalize fundamental concepts with clean side-by-side study decks.', route: '/learning', label: 'Study' },
            { id: '2', title: 'PRACTICE', step: '02', color: 'blue', icon: Send, desc: 'Validate progress dynamically with non-timed customizable practice quizzes.', route: '/practice', label: 'Practice' },
            { id: '3', title: 'ASSESSMENT', step: '03', color: 'amber', icon: Clock, desc: 'Prove curriculum excellence under pressure with strict full-timed modules.', route: '/assessment', label: 'Assessment' }
          ].map((item) => {
            const classes = colorClasses[item.color];
            return (
              <motion.div 
                key={item.id}
                whileHover={{ y: -8 }}
                className={`p-8 rounded-[36px] flex flex-col items-center text-center group border transition-all duration-300 ${
                  theme === 'dark' 
                    ? `bg-zinc-900/40 border-zinc-800 ${classes.darkBorder}` 
                    : `bg-white border-zinc-100 ${classes.lightBorder}`
                } shadow-xl`}
              >
                <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-300 shadow-inner ${
                  theme === 'dark' ? `bg-zinc-950 ${classes.darkIconBg}` : `${classes.lightIconBg}`
                }`}>
                  <item.icon size={26} />
                </div>
                <span className={`text-[9px] font-black uppercase tracking-[0.2em] mb-1.5 opacity-60 ${classes.text}`}>Step {item.step}</span>
                <h3 className={`text-xl font-black mb-3 tracking-tight ${theme === 'dark' ? 'text-zinc-50' : 'text-zinc-900'}`}>{item.title}</h3>
                <p className={`${theme === 'dark' ? 'text-zinc-500' : 'text-zinc-400'} text-xs leading-relaxed mb-6 flex-1`}>
                  {item.desc}
                </p>
                <Magnetic>
                  <button 
                    onClick={() => navigate(item.route)}
                    className={`px-6 py-2.5 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all shadow-md ${
                      theme === 'dark' 
                        ? `bg-zinc-850 text-zinc-100 hover:bg-zinc-800` 
                        : `${classes.btn} text-white`
                    }`}
                  >
                    Launch {item.label}
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
