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

const Assessment: React.FC = () => {
  const { theme, quizzes, userStats, setUserStats, resetStats, setIsImmersive } = useAppContext();
  
  const [quizStatus, setQuizStatus] = useState<QuizStatus>('IDLE');
  const [activeQuizIndex, setActiveQuizIndex] = useState(0);
  const [currentQuestions, setCurrentQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [score, setScore] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [currentAssignIdx, setCurrentAssignIdx] = useState(0);
  const [shakingIdx, setShakingIdx] = useState<number | null>(null);
  
  const [timeLeft, setTimeLeft] = useState(20);
  const [isTimerPaused, setIsTimerPaused] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState<number>(0);
  const [questionResults, setQuestionResults] = useState<{ id: number, isCorrect: boolean, timeSpent: number, category: string }[]>([]);

  React.useEffect(() => {
    setIsImmersive(quizStatus === 'QUIZ');
    return () => setIsImmersive(false);
  }, [quizStatus, setIsImmersive]);

  const activeQuiz = quizzes[activeQuizIndex];
  
  // Timer logic
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (quizStatus === 'QUIZ' && !isTimerPaused && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && !isTimerPaused && quizStatus === 'QUIZ') {
      handleNextAssign(true);
    }

    return () => clearInterval(timer);
  }, [quizStatus, timeLeft, isTimerPaused]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (quizStatus !== 'QUIZ' || answers[currentAssignIdx] !== null) return;
      
      const key = e.key.toLowerCase();
      if (key === 'a' && activeQuiz.questions[currentAssignIdx].options.length > 0) handleSelectOption(currentAssignIdx, 0);
      if (key === 'b' && activeQuiz.questions[currentAssignIdx].options.length > 1) handleSelectOption(currentAssignIdx, 1);
      if (key === 'c' && activeQuiz.questions[currentAssignIdx].options.length > 2) handleSelectOption(currentAssignIdx, 2);
      if (key === 'd' && activeQuiz.questions[currentAssignIdx].options.length > 3) handleSelectOption(currentAssignIdx, 3);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [quizStatus, currentAssignIdx, answers, activeQuiz]);

  const handleNextAssign = (skipped: boolean = false) => {
    if (currentAssignIdx < currentQuestions.length - 1) {
      if (skipped) {
        setAnswers(prev => {
          const next = [...prev];
          next[currentAssignIdx] = null;
          return next;
        });
      }
      setCurrentAssignIdx(prev => prev + 1);
      setTimeLeft(20);
      setIsTimerPaused(false);
      setQuestionStartTime(Date.now());
    } else {
      finishQuiz();
    }
  };

  const handleStartAssessment = (index: number) => {
    const quiz = quizzes[index];
    const shuffled = [...quiz.questions].sort(() => Math.random() - 0.5);
    
    setCurrentQuestions(shuffled);
    setActiveQuizIndex(index);
    setQuizStatus('QUIZ');
    setAnswers(new Array(shuffled.length).fill(null));
    setScore(0);
    setTotalPoints(0);
    setCurrentAssignIdx(0);
    setTimeLeft(20);
    setIsTimerPaused(false);
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
      const speedBonus = timeLeft * 5;
      setTotalPoints(prev => prev + 100 + speedBonus);
    } else {
      setShakingIdx(qIdx);
      setTimeout(() => setShakingIdx(null), 400);
    }

    setIsTimerPaused(true);
    setTimeout(() => {
      handleNextAssign();
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
            <h2 className="text-2xl font-sans font-bold">Timed Assessment</h2>
            <p className={`${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'} text-sm`}>20 Seconds per question. No pauses. Are you ready?</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quizzes.map((quiz, idx) => (
              <motion.div 
                key={quiz.id}
                whileHover={{ y: -4, backgroundColor: "rgba(255, 255, 255, 0.6)" }}
                className="glass-card p-6 flex flex-col justify-between hover:shadow-lg transition-all border-white/40 border-2 border-transparent hover:border-zinc-200"
              >
                <div className="space-y-4">
                  <span className={`inline-block px-2.5 py-1 ${theme === 'dark' ? 'bg-amber-900/30 text-amber-500' : 'bg-amber-100 text-amber-700'} text-[10px] font-bold uppercase tracking-wider rounded-md`}>
                    {quiz.category}
                  </span>
                  <h3 className="text-lg font-sans font-bold leading-tight uppercase tracking-tight">{quiz.title}</h3>
                  <p className={`text-xs ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'} leading-relaxed`}>
                    {quiz.description}
                  </p>
                </div>
                <div className="pt-8 flex items-center justify-between border-t border-zinc-100/50 mt-4">
                  <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-medium">
                    <Timer size={14} />
                    {quiz.questions.length} questions
                  </div>
                  <button 
                    onClick={() => handleStartAssessment(idx)}
                    className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-xl text-xs font-bold hover:bg-amber-700 transition-colors"
                  >
                    Start Challenge
                    <ChevronRight size={14} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {quizStatus === 'QUIZ' && (
        <div className="w-full max-w-2xl mx-auto">
          <div className={`sticky top-0 z-40 ${theme === 'dark' ? 'bg-zinc-950/90' : 'bg-zinc-50/90'} backdrop-blur-xl -mx-4 px-4 border-b ${theme === 'dark' ? 'border-amber-500/20 ml-0.5' : 'border-zinc-200/50'} shadow-sm mb-12`}>
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
                  <p className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest mt-1">Timed Assessment Challenge</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest leading-none block">Points</span>
                  <p className={`text-xl font-display font-bold ${theme === 'dark' ? 'text-amber-500' : 'text-amber-600'} leading-none mt-1`}>
                    {totalPoints}
                  </p>
                </div>
              </div>
            </div>

            <div className="pb-4 space-y-2.5">
              <div className="flex items-center justify-between text-[8px] font-mono font-bold text-zinc-400 uppercase tracking-widest px-0.5">
                <span className="flex items-center gap-1.5">
                  <Clock size={10} className={`${timeLeft < 5 ? 'text-rose-500 animate-pulse' : 'text-amber-500'}`} />
                  <span className={`text-[10px] font-mono font-bold uppercase tracking-widest ${theme === 'dark' ? 'text-zinc-300' : 'text-zinc-900'}`}>
                    Time: <span className={timeLeft < 5 ? 'text-rose-500' : ''}>{timeLeft}s</span>
                  </span>
                </span>
                <span>{currentAssignIdx + 1} / {currentQuestions.length} Questions</span>
              </div>
              <div className="flex gap-1.5 h-1.5 w-full">
                {currentQuestions.map((_, i) => {
                  const isCompleted = i < currentAssignIdx;
                  const isCurrent = i === currentAssignIdx;
                  return (
                    <div key={i} className={`flex-1 h-full rounded-full overflow-hidden ${theme === 'dark' ? 'bg-zinc-900' : 'bg-zinc-100'} shadow-inner`}>
                       {isCompleted && (
                         <div className={`h-full w-full ${theme === 'dark' ? 'bg-amber-500/40' : 'bg-zinc-900'}`} />
                       )}
                       {isCurrent && (
                         <motion.div 
                           className={`h-full ${timeLeft < 5 ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.4)]' : 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.3)]'}`}
                           initial={{ width: '100%' }}
                           animate={{ width: `${(timeLeft / 20) * 100}%` }}
                           transition={{ duration: 1, ease: "linear" }}
                         />
                       )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <motion.div 
            key={currentAssignIdx}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className={`glass-card p-8 md:p-12 space-y-8 transition-all ${shakingIdx === currentAssignIdx ? 'shake' : ''} shadow-xl border-2 ${theme === 'dark' ? 'border-amber-200' : 'border-amber-100'}`}
          >
            <div className="flex items-start gap-4">
              <span className={`flex-shrink-0 w-8 h-8 rounded-lg ${theme === 'dark' ? 'bg-amber-500 text-zinc-950' : 'bg-amber-600 text-white'} flex items-center justify-center text-sm font-bold mt-1 shadow-lg shadow-amber-200 dark:shadow-amber-400/20`}>
                {currentAssignIdx + 1}
              </span>
              <h2 className={`text-lg md:text-xl font-sans font-bold leading-relaxed ${theme === 'dark' ? 'text-amber-50' : 'text-zinc-800'}`}>
                {currentQuestions[currentAssignIdx].text}
              </h2>
            </div>

            <div className="space-y-3">
              {currentQuestions[currentAssignIdx].options.map((option, optIdx) => {
                const userAnswer = answers[currentAssignIdx];
                const isAnswered = userAnswer !== null;
                const isSelected = userAnswer === optIdx;
                const isCorrect = isAnswered && optIdx === currentQuestions[currentAssignIdx].correctAnswer;
                const isWrong = isAnswered && isSelected && optIdx !== currentQuestions[currentAssignIdx].correctAnswer;
                
                return (
                  <motion.button
                    key={optIdx}
                    disabled={isAnswered}
                    whileHover={{ x: isAnswered ? 0 : 4 }}
                    onClick={() => handleSelectOption(currentAssignIdx, optIdx)}
                    className={`answer-option py-3 px-5 transition-all !gap-4 border-2 ${
                      isSelected ? (theme === 'dark' ? 'border-amber-500 bg-zinc-900 text-amber-50' : 'border-zinc-900 scale-[1.01]') : (theme === 'dark' ? 'border-zinc-800 bg-zinc-900/40 text-zinc-300' : 'border-zinc-100')
                    } ${isCorrect ? (theme === 'dark' ? 'border-emerald-500 bg-emerald-950/40 text-emerald-300' : 'border-emerald-500 bg-emerald-50 text-emerald-900') : ''} ${
                      isWrong ? (theme === 'dark' ? 'border-rose-500 bg-rose-950/40 text-rose-300' : 'border-rose-500 bg-rose-50 text-rose-900') : ''
                    }`}
                  >
                    <span className={`flex-shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center text-xs font-black uppercase transition-colors ${
                      isSelected ? (theme === 'dark' ? 'bg-amber-500 text-zinc-950 border-amber-500' : 'border-zinc-900 bg-zinc-900 text-white') : (theme === 'dark' ? 'border-zinc-700 text-zinc-500' : 'border-zinc-200 text-zinc-400')
                    } ${isCorrect ? 'border-emerald-500 bg-emerald-500 text-white' : ''} ${
                      isWrong ? 'border-rose-500 bg-rose-500 text-white' : ''
                    }`}>
                      {String.fromCharCode(65 + optIdx)}
                    </span>
                    <span className="flex-1 text-xs md:text-sm font-semibold">{option}</span>
                    {isCorrect && <CheckCircle2 className="text-emerald-500" size={18} />}
                    {isWrong && <XCircle className="text-rose-500" size={18} />}
                  </motion.button>
                );
              })}
            </div>

            {timeLeft < 5 && !isTimerPaused && (
              <p className="text-center text-[10px] font-black text-rose-500 uppercase tracking-widest animate-pulse">
                Hurry! Time is almost up
              </p>
            )}
          </motion.div>
        </div>
      )}

      {quizStatus === 'RESULTS' && (
        <div className="w-full max-w-4xl mx-auto text-center space-y-12">
          {/* Reuse RESULTS rendering from Practice or factor it out? Let's keep it here for now for simplicity as per refactor request. */}
          {/* I'll use a simplified version or copy it, but best is to have it consistent. */}
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
            <h2 className="text-3xl font-sans font-bold">Victory Summary</h2>
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

          <div className="pt-6 flex flex-col sm:flex-row gap-4">
            <button 
              onClick={() => handleStartAssessment(activeQuizIndex)}
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
        </div>
      )}
    </motion.div>
  );
};

export default Assessment;
