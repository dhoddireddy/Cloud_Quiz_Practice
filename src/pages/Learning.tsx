import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const Learning: React.FC = () => {
  const { theme, quizzes, userStats, setIsImmersive, setActiveDownloadQuizId } = useAppContext();
  const [learningQuizIndex, setLearningQuizIndex] = useState<number | null>(null);

  React.useEffect(() => {
    setIsImmersive(learningQuizIndex !== null);
    setActiveDownloadQuizId(learningQuizIndex !== null ? quizzes[learningQuizIndex]?.id ?? null : null);
    return () => {
      setIsImmersive(false);
      setActiveDownloadQuizId(null);
    };
  }, [learningQuizIndex, quizzes, setActiveDownloadQuizId, setIsImmersive]);

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="w-full max-w-7xl space-y-8 px-4 py-8"
    >
      {learningQuizIndex === null ? (
        <div className="space-y-12">
          <div className="text-center space-y-2 mb-4">
            <h2 className={`text-2xl font-sans font-bold ${theme === 'dark' ? 'text-amber-50' : 'text-zinc-900'}`}>Browse Topics</h2>
            <p className={`${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'} text-sm`}>Choose a subject to see detailed questions and answers.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {quizzes.map((quiz, idx) => {
              const stats = userStats.categoryPerformance[quiz.category];
              const progress = stats ? Math.round((stats.correct / (stats.total || 1)) * 100) : 0;
              
              return (
                <motion.div 
                  key={quiz.id}
                  onClick={() => setLearningQuizIndex(idx)}
                  whileHover={{ y: -4, scale: 1.02 }}
                  className={`p-8 cursor-pointer transition-all border-2 rounded-[32px] group relative overflow-hidden ${
                    theme === 'dark' 
                      ? 'bg-zinc-900/40 border-zinc-800 hover:border-amber-500/30 shadow-2xl shadow-amber-500/5' 
                      : 'bg-white border-zinc-100 hover:border-zinc-200 shadow-xl shadow-zinc-200/20'
                  }`}
                >
                  <div className="flex justify-between items-start mb-6">
                    <span className={`inline-block px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest ${
                      theme === 'dark' ? 'bg-zinc-950 text-zinc-500' : 'bg-zinc-50 text-zinc-500'
                    }`}>
                      {quiz.category}
                    </span>
                    {stats && (
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-500">
                        <CheckCircle2 size={12} />
                        {progress}%
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <h3 className={`text-lg font-heading font-black leading-tight uppercase tracking-tight group-hover:text-amber-500 transition-colors ${
                      theme === 'dark' ? 'text-amber-50' : 'text-zinc-900'
                    }`}>
                      {quiz.title}
                    </h3>
                    <p className={`text-xs ${theme === 'dark' ? 'text-zinc-500' : 'text-zinc-400'} leading-relaxed line-clamp-2 pr-4`}>
                      {quiz.description}
                    </p>
                  </div>

                  <div className="pt-8 flex items-center justify-between border-t border-zinc-100/50 dark:border-zinc-800/50 mt-6 mt-auto">
                    <div className="flex items-center gap-1.5 text-zinc-400 text-[10px] font-bold uppercase tracking-widest">
                      {quiz.questions.length} Modules
                    </div>
                    <div className={`p-2 rounded-xl transition-all group-hover:translate-x-1 ${
                      theme === 'dark' ? 'bg-zinc-800 text-amber-500' : 'bg-zinc-50 text-zinc-900'
                    }`}>
                      <ChevronRight size={16} />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="relative mx-auto w-full max-w-3xl pb-32">
          <button 
            onClick={() => setLearningQuizIndex(null)}
            className={`fixed left-4 top-24 z-40 h-12 px-4 border rounded-2xl transition-all shadow-lg flex items-center gap-2 group ${
              theme === 'dark' ? 'bg-zinc-900 border-amber-500/30 text-amber-500 hover:text-amber-400 hover:border-amber-500' : 'bg-white border-zinc-200 text-zinc-500 hover:text-zinc-900 hover:border-zinc-900'
            }`}
            aria-label="Back to topics"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs font-black uppercase tracking-widest">Back</span>
          </button>
          <aside className={`hidden lg:block fixed right-4 top-24 z-40 w-60 overflow-hidden rounded-2xl border shadow-xl backdrop-blur-xl ${
            theme === 'dark' ? 'bg-zinc-900/95 border-amber-500/20 text-amber-50' : 'bg-white border-zinc-300 text-zinc-950'
          }`}>
            <div className="border-t-4 border-emerald-400 bg-zinc-950 p-4 text-white">
              <p className="text-[10px] font-black uppercase tracking-widest text-emerald-300">Learning Topic</p>
              <h3 className="mt-1 text-base font-black leading-snug">{quizzes[learningQuizIndex].title}</h3>
              <span className="mt-3 inline-flex rounded-full bg-emerald-400 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-zinc-950">
                {quizzes[learningQuizIndex].category}
              </span>
            </div>
            <div className="space-y-4 p-4">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-xl border-2 border-emerald-500 bg-white p-3 text-zinc-950 shadow-sm dark:border-emerald-400/40 dark:bg-zinc-950 dark:text-emerald-50">
                  <p className="text-[9px] font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-300">Questions</p>
                  <p className="mt-1 text-xl font-black">{quizzes[learningQuizIndex].questions.length}</p>
                </div>
                <div className="rounded-xl border-2 border-cyan-500 bg-white p-3 text-zinc-950 shadow-sm dark:border-cyan-400/40 dark:bg-zinc-950 dark:text-cyan-50">
                  <p className="text-[9px] font-black uppercase tracking-widest text-cyan-700 dark:text-cyan-300">Answers</p>
                  <p className="mt-1 text-xl font-black">Shown</p>
                </div>
              </div>
              <div className="rounded-xl border-2 border-amber-500 bg-white p-3 text-zinc-950 shadow-sm dark:border-amber-400/40 dark:bg-zinc-950 dark:text-amber-50">
                <p className="text-[9px] font-black uppercase tracking-widest text-amber-700 dark:text-amber-300">Mode</p>
                <p className="mt-1 text-sm font-black leading-snug">Auto-revealed study</p>
              </div>
              
              <button 
                onClick={() => setLearningQuizIndex(null)}
                className={`w-full py-3 rounded-xl border-2 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                  theme === 'dark' ? 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-amber-500 hover:border-amber-500/50' : 'border-zinc-100 bg-zinc-50 text-zinc-500 hover:text-zinc-900 hover:border-zinc-200'
                }`}
              >
                <ArrowLeft size={14} />
                Back to Topics
              </button>
            </div>
          </aside>
          {/* Removed legacy subheader; the fixed back arrow and side card carry this context. */}
          <div className="hidden">
            <div className="flex items-center gap-6">
              <button 
                onClick={() => setLearningQuizIndex(null)}
                className={`p-3 border rounded-2xl transition-all shadow-sm ${
                  theme === 'dark' ? 'bg-zinc-900 border-amber-500/30 text-amber-500 hover:text-amber-400 hover:border-amber-500' : 'bg-white border-zinc-200 text-zinc-400 hover:text-zinc-900 hover:border-zinc-900'
                }`}
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h2 className={`text-2xl font-sans font-bold leading-tight ${theme === 'dark' ? 'text-amber-50' : 'text-zinc-900'}`}>{quizzes[learningQuizIndex].title}</h2>
                <p className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest mt-1">Study Guide • Learning Mode</p>
              </div>
            </div>
            <div className={`hidden md:flex px-4 py-2 ${theme === 'dark' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-emerald-50 text-emerald-700 border-emerald-100'} rounded-xl text-xs font-bold items-center gap-2 border`}>
              <CheckCircle2 size={16} />
              Auto-Revealed Mode
            </div>
          </div>

          <div className="mx-auto w-full space-y-6">
            {quizzes[learningQuizIndex].questions.map((q, i) => (
              <motion.div 
                key={q.id} 
                className="glass-card p-6 space-y-6 border-2 border-transparent hover:border-zinc-100 transition-all"
                whileHover={{ y: -2 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <div className="flex items-start gap-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-zinc-900 dark:bg-amber-500 text-white dark:text-zinc-950 flex items-center justify-center text-sm font-bold mt-1">
                    {i + 1}
                  </span>
                  <h4 className={`text-sm md:text-base font-bold pt-0.5 font-sans leading-relaxed ${theme === 'dark' ? 'text-amber-50' : 'text-zinc-800'}`}>{q.text}</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-0 md:pl-12">
                  {q.options.map((option, optIdx) => (
                    <div 
                      key={optIdx}
                      className={`p-3 rounded-xl border-2 text-xs md:text-sm font-medium flex items-center gap-3 ${
                        optIdx === q.correctAnswer 
                          ? theme === 'dark' ? 'border-emerald-500/50 bg-emerald-950/20 text-emerald-300' : 'border-emerald-500 bg-emerald-50 text-emerald-900' 
                          : theme === 'dark' ? 'border-zinc-700 bg-zinc-900/80 text-zinc-200' : 'border-zinc-200 bg-white text-zinc-700'
                      }`}
                    >
                      <span className={`flex-shrink-0 w-5 h-5 rounded-md ${theme === 'dark' ? 'bg-zinc-950' : 'bg-zinc-50'} border border-current flex items-center justify-center text-[10px] font-black uppercase`}>
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <span className="flex-1">{option}</span>
                      {optIdx === q.correctAnswer && (
                        <CheckCircle2 size={16} className="text-emerald-500 stroke-[2.5]" />
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Learning;
