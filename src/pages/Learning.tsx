import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const Learning: React.FC = () => {
  const { theme, quizzes, userStats, setIsImmersive } = useAppContext();
  const [learningQuizIndex, setLearningQuizIndex] = useState<number | null>(null);

  React.useEffect(() => {
    setIsImmersive(learningQuizIndex !== null);
    return () => setIsImmersive(false);
  }, [learningQuizIndex, setIsImmersive]);

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="w-full max-w-4xl space-y-8 py-12"
    >
      {learningQuizIndex === null ? (
        <div className="space-y-12">
          <div className="text-center space-y-2 mb-4">
            <h2 className={`text-2xl font-sans font-bold ${theme === 'dark' ? 'text-amber-50' : 'text-zinc-900'}`}>Browse Topics</h2>
            <p className={`${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'} text-sm`}>Choose a subject to see detailed questions and answers.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
        <div className="space-y-8 pb-32">
          <div className={`flex items-center justify-between sticky top-0 z-40 ${theme === 'dark' ? 'bg-zinc-950/90' : 'bg-zinc-50/90'} backdrop-blur-xl py-6 -mx-4 px-4 border-b ${theme === 'dark' ? 'border-amber-500/20' : 'border-zinc-200/50'} shadow-sm`}>
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

          <div className="space-y-6">
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
                          : theme === 'dark' ? 'border-zinc-800 bg-zinc-900/40 text-zinc-400' : 'border-zinc-100 bg-zinc-50/30 text-zinc-400'
                      }`}
                    >
                      <span className={`flex-shrink-0 w-5 h-5 rounded-md ${theme === 'dark' ? 'bg-zinc-200' : 'bg-white'} border border-current flex items-center justify-center text-[10px] font-black uppercase`}>
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
