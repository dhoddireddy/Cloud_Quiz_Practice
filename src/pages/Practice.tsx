import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
    ChevronRight, ArrowLeft, Timer, CheckCircle2, XCircle, 
    Trophy, BarChart3, Layout, Zap, Target, Flame, Clock, RotateCcw, RefreshCcw 
} from 'lucide-react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { useAppContext } from '../context/AppContext';
import { Question } from '../types';

type QuizStatus = 'IDLE' | 'QUIZ' | 'RESULTS';

const Practice: React.FC = () => {
  const { theme, quizzes, userStats, setUserStats, resetStats, setIsImmersive } = useAppContext();
  
  const [quizStatus, setQuizStatus] = useState<QuizStatus>('IDLE');
  const [activeQuizIndex, setActiveQuizIndex] = useState(0);
  const [currentQuestions, setCurrentQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [score, setScore] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [currentAssignIdx, setCurrentAssignIdx] = useState(0);
  const [shakingIdx, setShakingIdx] = useState<number | null>(null);
  const [questionStartTime, setQuestionStartTime] = useState<number>(0);
  const [questionResults, setQuestionResults] = useState<{ id: number, isCorrect: boolean, timeSpent: number, category: string }[]>([]);

  React.useEffect(() => {
    setIsImmersive(quizStatus === 'QUIZ');
    return () => setIsImmersive(false);
  }, [quizStatus, setIsImmersive]);

  const activeQuiz = quizzes[activeQuizIndex];
  const answeredCount = answers.filter(a => a !== null).length;
  const progress = currentQuestions.length > 0 ? (answeredCount / currentQuestions.length) * 100 : 0;

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (quizStatus !== 'QUIZ' || answers[currentAssignIdx] !== null) return;
      
      const key = e.key.toLowerCase();
      if (key === 'a') handleSelectOption(currentAssignIdx, 0);
      if (key === 'b') handleSelectOption(currentAssignIdx, 1);
      if (key === 'c') handleSelectOption(currentAssignIdx, 2);
      if (key === 'd') handleSelectOption(currentAssignIdx, 3);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [quizStatus, currentAssignIdx, answers]);

  const handleStartPractice = (index: number) => {
    const quiz = quizzes[index];
    const shuffled = [...quiz.questions].sort(() => Math.random() - 0.5);
    
    setCurrentQuestions(shuffled);
    setActiveQuizIndex(index);
    setQuizStatus('QUIZ');
    setAnswers(new Array(shuffled.length).fill(null));
    setScore(0);
    setTotalPoints(0);
    setCurrentAssignIdx(0);
    setQuestionResults([]);
    setQuestionStartTime(Date.now());
  };

  const handleSelectOption = (qIdx: number, optIdx: number) => {
    if (answers[qIdx] !== null) return;
    
    const endTime = Date.now();
    const timeSpent = (endTime - questionStartTime) / 1000;
    
    const newAnswers = [...answers];
    newAnswers[qIdx] = optIdx;
    setAnswers(newAnswers);

    const question = currentQuestions[qIdx];
    const isCorrect = optIdx === question.correctAnswer;
    
    setQuestionResults(prev => [...prev, { 
      id: question.id, 
      isCorrect, 
      timeSpent, 
      category: activeQuiz.category 
    }]);

    if (isCorrect) {
      setScore(prev => prev + 1);
      setTotalPoints(prev => prev + 100);
    } else {
      setShakingIdx(qIdx);
      setTimeout(() => setShakingIdx(null), 400);
    }

    setTimeout(() => {
      if (currentAssignIdx < currentQuestions.length - 1) {
        setCurrentAssignIdx(prev => prev + 1);
        setQuestionStartTime(Date.now());
      }
    }, 1500);
  };

  const finishQuiz = () => {
    setQuizStatus('RESULTS');
    
    setUserStats(prev => {
      const newStats = { ...prev };
      newStats.quizzesCompleted += 1;
      newStats.totalPoints += totalPoints;
      if (totalPoints > newStats.highScore) {
        newStats.highScore = totalPoints;
      }

      const cat = activeQuiz.category;
      const currentCat = newStats.categoryPerformance[cat] || { correct: 0, total: 0 };
      newStats.categoryPerformance[cat] = {
        correct: currentCat.correct + score,
        total: currentCat.total + currentQuestions.length
      };

      return newStats;
    });
  };

  const resetQuiz = () => {
    setQuizStatus('IDLE');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="w-full max-w-4xl py-12"
    >
      {quizStatus === 'IDLE' && (
        <div className="space-y-12">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-sans font-bold">Challenge Your Knowledge</h2>
            <p className={`${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'} text-sm`}>Pick a topic and see if you can get a perfect score.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz, idx) => {
              const stats = userStats.categoryPerformance[quiz.category];
              const progress = stats ? Math.round((stats.correct / (stats.total || 1)) * 100) : 0;

              return (
                <motion.div 
                  key={quiz.id}
                  whileHover={{ y: -6, scale: 1.02 }}
                  className={`p-8 rounded-[40px] flex flex-col justify-between transition-all border-2 group relative overflow-hidden ${
                    theme === 'dark' 
                      ? 'bg-zinc-900/40 border-zinc-800 hover:border-blue-500/30 shadow-2xl shadow-blue-500/5' 
                      : 'bg-white border-zinc-100 hover:border-zinc-200 shadow-xl shadow-zinc-200/20'
                  }`}
                >
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <span className={`inline-block px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest ${
                        theme === 'dark' ? 'bg-zinc-950 text-zinc-500' : 'bg-zinc-50 text-zinc-500'
                      }`}>
                        {quiz.category}
                      </span>
                      {stats && (
                        <div className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                          progress > 80 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                        }`}>
                          {progress}% Mastered
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <h3 className={`text-xl font-heading font-black leading-tight uppercase tracking-tight ${
                        theme === 'dark' ? 'text-amber-50' : 'text-zinc-950'
                      }`}>
                        {quiz.title}
                      </h3>
                      <p className={`text-xs ${theme === 'dark' ? 'text-zinc-500' : 'text-zinc-400'} leading-relaxed`}>
                        {quiz.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-10 flex items-center justify-between border-t border-zinc-100/50 dark:border-zinc-800/50 mt-8">
                    <div className="flex items-center gap-1.5 text-zinc-400 text-[10px] font-bold uppercase tracking-widest">
                      <Timer size={14} />
                      {quiz.questions.length} Concepts
                    </div>
                    <button 
                      onClick={() => handleStartPractice(idx)}
                      className="p-3 bg-zinc-900 dark:bg-amber-500 text-white dark:text-zinc-950 rounded-2xl hover:scale-110 transition-transform active:scale-95 shadow-lg dark:shadow-amber-500/20"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {quizStatus === 'QUIZ' && (
        <div className="w-full max-w-3xl mx-auto pb-20">
          <div className={`sticky top-0 z-40 ${theme === 'dark' ? 'bg-zinc-950/90' : 'bg-zinc-50/90'} backdrop-blur-xl -mx-4 px-4 border-b ${theme === 'dark' ? 'border-amber-500/20' : 'border-zinc-200/50'} shadow-sm mb-12`}>
             <div className="flex items-center justify-between py-6">
              <div className="flex items-center gap-4">
                <button 
                  onClick={resetQuiz}
                  className={`p-3 border rounded-2xl transition-all shadow-sm ${
                    theme === 'dark' ? 'bg-zinc-900 border-amber-500/30 text-amber-500 hover:text-amber-400 hover:border-amber-500' : 'bg-white border-zinc-200 text-zinc-400 hover:text-zinc-900 hover:border-zinc-900'
                  }`}
                >
                  <ArrowLeft size={20} />
                </button>
                <div>
                  <h3 className={`text-lg font-sans font-bold leading-tight ${theme === 'dark' ? 'text-amber-50' : 'text-zinc-900'}`}>{activeQuiz.title}</h3>
                  <p className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest">Test • Live Session</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest leading-none">Points</span>
                  <p className={`text-xl font-display font-bold ${theme === 'dark' ? 'text-amber-500' : 'text-amber-600'} leading-none`}>
                    {totalPoints}
                  </p>
                </div>
                <div className={`text-right border-l ${theme === 'dark' ? 'border-zinc-800' : 'border-zinc-200'} pl-6`}>
                  <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest leading-none">Ans</span>
                  <p className={`text-xl font-display font-bold leading-none ${theme === 'dark' ? 'text-amber-50' : 'text-zinc-900'}`}>
                    {answeredCount}<span className={theme === 'dark' ? 'text-zinc-600 text-base' : 'text-zinc-300 font-normal'}>/{currentQuestions.length}</span>
                  </p>
                </div>
              </div>
            </div>
            
            <div className="pb-4">
              <div className="flex items-center justify-between text-[8px] font-mono font-bold text-zinc-400 uppercase tracking-widest mb-1.5 px-0.5">
                <span>Live Progress</span>
                <span>{Math.round(progress)}% Complete</span>
              </div>
              <div className={`h-1 w-full ${theme === 'dark' ? 'bg-zinc-900' : 'bg-zinc-200'} rounded-full overflow-hidden shadow-inner`}>
                <motion.div 
                  animate={{ width: `${progress}%` }}
                  className={`h-full ${theme === 'dark' ? 'bg-amber-500' : 'bg-zinc-900'} transition-all duration-500 rounded-full`}
                />
              </div>
            </div>
          </div>

          <div className="relative min-h-[500px]">
            <AnimatePresence mode="wait">
              {(() => {
                const question = currentQuestions[currentAssignIdx];
                if (!question) return null;
                
                const qIdx = currentAssignIdx;
                const userAnswer = answers[qIdx];
                const isAnswered = userAnswer !== null;
                
                return (
                  <motion.div 
                    key={question.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className={`glass-card p-6 md:p-10 space-y-6 transition-all ${shakingIdx === qIdx ? 'shake' : ''} max-w-3xl mx-auto shadow-lg border-2 border-transparent hover:border-zinc-100`}
                  >
                    <div className="flex items-start gap-4">
                      <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center text-sm font-bold mt-1">
                        {qIdx + 1}
                      </span>
                      <h2 className={`text-base md:text-lg font-sans font-bold leading-relaxed ${theme === 'dark' ? 'text-zinc-100' : 'text-zinc-800'}`}>
                        {question.text}
                      </h2>
                    </div>

                    <div className="space-y-3 pl-0 md:pl-12">
                      {question.options.map((option, optIdx) => {
                        const isSelected = userAnswer === optIdx;
                        const isCorrect = isAnswered && optIdx === question.correctAnswer;
                        const isWrong = isAnswered && isSelected && optIdx !== question.correctAnswer;
                        
                        return (
                          <motion.button
                            key={optIdx}
                            disabled={isAnswered}
                            whileHover={{ x: isAnswered ? 0 : 6 }}
                            onClick={() => handleSelectOption(qIdx, optIdx)}
                            className={`answer-option py-3.5 px-5 !gap-4 ${isSelected ? 'selected' : ''} ${isCorrect ? 'correct text-emerald-900' : ''} ${isWrong ? 'incorrect text-rose-900' : ''}`}
                          >
                            <span className={`flex-shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center text-xs font-black uppercase transition-colors ${
                              isSelected ? (theme === 'dark' ? 'bg-white text-zinc-950 border-white' : 'border-zinc-900 bg-zinc-900 text-white') : (theme === 'dark' ? 'border-zinc-700 text-zinc-400' : 'border-zinc-200 text-zinc-400')
                            } ${isCorrect ? 'border-emerald-500 bg-emerald-500 text-white' : ''} ${isWrong ? 'border-rose-500 bg-rose-500 text-white' : ''}`}>
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <span className="flex-1 text-xs md:text-sm font-semibold">{option}</span>
                            {isCorrect && <CheckCircle2 className="text-emerald-500" size={20} />}
                            {isWrong && <XCircle className="text-rose-500" size={20} />}
                          </motion.button>
                        );
                      })}
                    </div>
                  </motion.div>
                );
              })()}
            </AnimatePresence>
          </div>

          {currentAssignIdx === currentQuestions.length - 1 && answers[currentAssignIdx] !== null && (
            <div className="pt-12 flex justify-center">
              <motion.button 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={finishQuiz}
                className="button-primary px-12 py-5 text-xl font-black rounded-3xl"
              >
                Finish and See Results
                <ChevronRight size={24} className="ml-2" />
              </motion.button>
            </div>
          )}
        </div>
      )}

      {quizStatus === 'RESULTS' && (
        <div className="w-full max-w-4xl mx-auto text-center space-y-12">
          <div className="space-y-4">
            <div className="relative inline-block">
              <motion.div 
                initial={{ rotate: -20, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                transition={{ type: 'spring', damping: 10 }}
                className="p-5 bg-amber-100 dark:bg-amber-500 text-amber-600 dark:text-zinc-950 rounded-full inline-flex relative z-10"
              >
                <Trophy size={48} />
              </motion.div>
              <motion.div 
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
                className={`absolute inset-0 ${theme === 'dark' ? 'bg-amber-500' : 'bg-amber-400'} blur-2xl rounded-full`}
              />
            </div>
            <h2 className="text-3xl font-sans font-bold">Session Analysis</h2>
            <p className={`${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'} text-base`}>Outstanding performance! Your knowledge profile has been updated.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="glass-card p-6 col-span-1 border-amber-500/10">
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Correct</p>
              <p className={`text-4xl font-display font-black pt-2 ${theme === 'dark' ? 'text-amber-50' : 'text-zinc-900'}`}>
                {score}<span className="text-lg text-zinc-300 font-normal">/{currentQuestions.length}</span>
              </p>
            </div>
            <div className="glass-card p-6 col-span-1 border-amber-500/10">
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Points</p>
              <p className={`text-4xl font-display font-black pt-2 ${theme === 'dark' ? 'text-amber-500' : 'text-amber-600'}`}>
                {totalPoints}
              </p>
            </div>
            <div className="glass-card p-6 col-span-1 md:col-span-2 flex flex-col items-center justify-center border-amber-500/10">
              <div className="flex items-center gap-3 w-full">
                 <div className="flex-1 text-left">
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Overall Level</p>
                    <p className={`text-xl font-bold mt-1 ${theme === 'dark' ? 'text-amber-50' : 'text-zinc-900'}`}>Mastery Tier {Math.floor(userStats.totalPoints / 2000) + 1}</p>
                 </div>
                 <Target className="text-zinc-300" size={32} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             <div className="lg:col-span-2 space-y-6">
                <div className="glass-card p-8 h-80">
                   <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400 mb-6 text-left flex items-center gap-2">
                     <BarChart3 size={16} /> Knowledge Distribution
                   </h3>
                   <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={
                        (Object.entries(userStats.categoryPerformance) as [string, { correct: number; total: number }][]).map(([name, data]) => ({
                          subject: name,
                          score: Math.round((data.correct / (data.total || 1)) * 100),
                          fullMark: 100,
                        }))
                      }>
                        <PolarGrid stroke={theme === 'dark' ? '#3f3f46' : '#e4e4e7'} />
                        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: theme === 'dark' ? '#a1a1aa' : '#71717a' }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
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

                <div className="space-y-4 text-left">
                  <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 px-2 flex items-center gap-2">
                    <Layout size={14} /> Result Breakdown
                  </h3>
                  <div className="space-y-3">
                     {[
                       { title: 'Speed Demon', icon: Zap, color: 'text-amber-500', darkColor: 'text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/40', count: questionResults.filter(r => r.isCorrect && r.timeSpent < 5).length, desc: 'Correct in under 5s' },
                       { title: 'Precision Hit', icon: Target, color: 'text-emerald-500', darkColor: 'text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/40', count: questionResults.filter(r => r.isCorrect && r.timeSpent >= 5).length, desc: 'Fully processed & correct' },
                       { title: 'Near Miss', icon: Flame, color: 'text-rose-500', darkColor: 'text-rose-400', bg: 'bg-rose-50 dark:bg-rose-950/40', count: questionResults.filter(r => !r.isCorrect).length, desc: 'Growth opportunity' }
                     ].map(group => (
                       <div key={group.title} className={`glass-card p-4 flex items-center justify-between border-2 ${theme === 'dark' ? 'border-amber-500/10' : 'border-transparent'}`}>
                          <div className="flex items-center gap-4">
                             <div className={`p-2 rounded-xl ${group.bg} ${theme === 'dark' ? group.darkColor : group.color}`}>
                                <group.icon size={20} />
                             </div>
                             <div>
                                <p className={`text-sm font-bold uppercase tracking-tighter ${theme === 'dark' ? 'text-amber-50' : 'text-zinc-900'}`}>{group.title}</p>
                                <p className={`text-[10px] ${theme === 'dark' ? 'text-zinc-500' : 'text-zinc-400'} font-medium`}>{group.desc}</p>
                             </div>
                          </div>
                          <p className={`text-2xl font-black ${theme === 'dark' ? group.darkColor : group.color}`}>{group.count}</p>
                       </div>
                     ))}
                  </div>
                </div>
             </div>

             <div className="space-y-6">
                <div className="glass-card p-6 h-full flex flex-col">
                   <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-6 text-left flex items-center gap-2">
                     <Clock size={14} /> Time Analysis
                   </h3>
                   <div className="flex-1 space-y-4">
                      {questionResults.slice(-5).reverse().map((r, i) => (
                        <div key={i} className="flex items-center justify-between py-2 border-b border-zinc-100 last:border-0">
                           <p className="text-xs font-bold text-zinc-600 truncate max-w-[120px]">Q.{r.id + 1}</p>
                           <p className={`text-xs font-mono font-bold ${r.timeSpent < 5 ? 'text-amber-600' : 'text-zinc-400'}`}>{r.timeSpent.toFixed(1)}s</p>
                        </div>
                      ))}
                      {questionResults.length === 0 && <p className="text-xs text-zinc-400 text-center py-10 italic">Complete a quiz to see stats</p>}
                   </div>
                   <div className="pt-6 mt-auto">
                      <div className="p-4 bg-zinc-900 rounded-2xl text-white">
                         <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Lifetime Points</p>
                         <p className="text-2xl font-black">{userStats.totalPoints.toLocaleString()}</p>
                      </div>
                   </div>
                </div>
             </div>
          </div>

          <div className="space-y-6 text-left">
             <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 px-2 flex items-center gap-2">
               <RotateCcw size={14} /> Question-by-Question Review
             </h3>
             <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
               {currentQuestions.map((q, i) => {
                 const userAnswer = answers[i];
                 const isCorrect = userAnswer === q.correctAnswer;
                 const result = questionResults.find(r => r.id === q.id);
                 
                 return (
                   <div key={q.id} className={`glass-card p-6 border-2 transition-all ${isCorrect ? 'border-emerald-100/30' : 'border-rose-100/30'}`}>
                     <div className="justify-between flex items-start mb-4">
                       <p className={`text-sm font-bold flex-1 pr-4 ${theme === 'dark' ? 'text-amber-50' : 'text-zinc-900'}`}>{i + 1}. {q.text}</p>
                       <span className={`text-[10px] font-mono font-bold px-2 py-1 rounded-md ${isCorrect ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                         {isCorrect ? 'PASSED' : 'FAILED'}
                       </span>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className={`p-3 rounded-xl border flex items-center gap-2 text-xs font-semibold ${isCorrect ? 'bg-emerald-50 border-emerald-100 text-emerald-900' : 'bg-rose-50 border-rose-100 text-rose-900'}`}>
                           {isCorrect ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                           {userAnswer !== null ? q.options[userAnswer] : 'Skipped'}
                        </div>
                        {!isCorrect && (
                          <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/50 text-emerald-900 text-xs font-semibold flex items-center gap-2">
                             <CheckCircle2 size={14} />
                             Correct: {q.options[q.correctAnswer]}
                          </div>
                        )}
                     </div>
                     {result && (
                       <p className="text-[10px] text-zinc-400 mt-3 font-mono">Response Time: {result.timeSpent.toFixed(2)}s • {result.timeSpent < 5 ? 'Elite Speed' : 'Steady Pace'}</p>
                     )}
                   </div>
                 );
               })}
             </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row gap-4">
            <button 
              onClick={() => handleStartPractice(activeQuizIndex)}
              className="button-primary flex-1 py-4 group"
            >
              Retake Challenge
              <RefreshCcw size={18} className="ml-2 transition-transform group-hover:rotate-180 duration-500" />
            </button>
            <button 
              onClick={resetQuiz}
              className={`px-8 py-4 rounded-2xl border font-bold transition-all flex-1 ${
                theme === 'dark' ? 'bg-zinc-900 border-zinc-700 text-zinc-100 hover:bg-zinc-800' : 'bg-white border-zinc-200 text-zinc-900 hover:bg-zinc-100'
              }`}
            >
              Exit to Menu
            </button>
          </div>
          <button 
            onClick={resetStats}
            className="flex mt-8 mx-auto items-center gap-2 text-[10px] font-black text-rose-400 hover:text-rose-600 uppercase tracking-widest transition-colors opacity-50 hover:opacity-100"
          >
            <RotateCcw size={12} /> Reset Knowledge Profile
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default Practice;
