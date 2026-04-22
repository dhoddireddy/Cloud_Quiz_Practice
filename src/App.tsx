import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  ChevronRight, 
  RefreshCcw, 
  CheckCircle2, 
  XCircle, 
  ArrowLeft,
  Timer,
  Layout,
  Cpu,
  Home,
  BookOpen,
  Send,
  Clock,
  Moon,
  Sun,
  BarChart3,
  Flame,
  Target,
  Zap,
  RotateCcw
} from 'lucide-react';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell
} from 'recharts';
import devOpsData from './data/DevOps_MCQs.json';
import htmlCssData from './data/HTML_CSS_mcqs.json';
import javaData from './data/Java_MCQs.json';
import jsNodeData from './data/JavaScript_NodeJS_MCQs.json';
import mongoData from './data/MongoDB_MCQs.json';
import springData from './data/Spring_Core_Spring_Boot_MCQs.json';
import tsData from './data/TypeScript_MCQs.json';

// Types
interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswer: number;
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  category: string;
  questions: Question[];
}

type AppTab = 'HOME' | 'LEARNING' | 'PRACTICE' | 'ASSESSMENT';
type QuizStatus = 'IDLE' | 'QUIZ' | 'RESULTS';

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('HOME');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [quizStatus, setQuizStatus] = useState<QuizStatus>('IDLE');
  const [activeQuizIndex, setActiveQuizIndex] = useState(0);
  const [learningQuizIndex, setLearningQuizIndex] = useState<number | null>(null);
  
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [score, setScore] = useState(0); // Count of correct answers
  const [totalPoints, setTotalPoints] = useState(0); // Numeric points
  
  const [currentQuestions, setCurrentQuestions] = useState<Question[]>([]);
  const [shakingIdx, setShakingIdx] = useState<number | null>(null);
  
  // Analytics & Persistence State
  const [questionStartTime, setQuestionStartTime] = useState<number>(0);
  const [questionResults, setQuestionResults] = useState<{ id: number, isCorrect: boolean, timeSpent: number, category: string }[]>([]);
  const [userStats, setUserStats] = useState<{
    highScore: number;
    quizzesCompleted: number;
    categoryPerformance: Record<string, { correct: number; total: number }>;
    totalPoints: number;
  }>({
    highScore: 0,
    quizzesCompleted: 0,
    categoryPerformance: {},
    totalPoints: 0
  });

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('quizwise_user_stats');
    if (saved) {
      try {
        setUserStats(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load stats", e);
      }
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('quizwise_user_stats', JSON.stringify(userStats));
  }, [userStats]);
  
  const resetStats = () => {
    if (confirm('Are you sure you want to reset all lifetime points and category stats?')) {
      const empty = {
        highScore: 0,
        quizzesCompleted: 0,
        categoryPerformance: {},
        totalPoints: 0
      };
      setUserStats(empty);
      localStorage.setItem('quizwise_user_stats', JSON.stringify(empty));
    }
  };

  // Timed Assessment State
  const [currentAssignIdx, setCurrentAssignIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [isTimerPaused, setIsTimerPaused] = useState(false);
  
  const quizzes = useMemo(() => {
    const rawData = [
      { id: 'java', title: 'Java Mastery', description: 'Advanced Java concepts, JVM, and OOP.', category: 'Backend', data: javaData },
      { id: 'js-node', title: 'JS & Node.js', description: 'Fullstack JavaScript from frontend to server.', category: 'Fullstack', data: jsNodeData },
      { id: 'ts', title: 'TypeScript', description: 'Type safety, interfaces, and advanced TS features.', category: 'Frontend', data: tsData },
      { id: 'html-css', title: 'HTML & CSS', description: 'Modern layout techniques and semantic web.', category: 'Frontend', data: htmlCssData },
      { id: 'mongo', title: 'MongoDB', description: 'NoSQL databases and document orchestration.', category: 'Database', data: mongoData },
      { id: 'spring', title: 'Spring Boot', description: 'Enterprise Java with Spring framework.', category: 'Backend', data: springData },
      { id: 'devops', title: 'DevOps & Git', description: 'Pipelines, git workflows, and automation.', category: 'DevOps', data: devOpsData },
    ];

    return rawData.map(item => ({
      id: item.id,
      title: item.title,
      description: item.description,
      category: item.category,
      questions: item.data.map((q: any, qIdx: number) => {
        const correctStr = String(q.correct || '').trim();
        const options = Array.isArray(q.options) ? q.options : [];
        const foundIdx = options.findIndex((opt: any) => String(opt).trim() === correctStr);
        
        return {
          id: qIdx,
          text: q.question || 'Question text missing',
          options: options,
          correctAnswer: foundIdx !== -1 ? foundIdx : 0 // Default to first option if not found
        };
      })
    })) as Quiz[];
  }, []);
  const activeQuiz = quizzes[activeQuizIndex];
  const answeredCount = answers.filter(a => a !== null).length;
  const progress = currentQuestions.length > 0 ? (answeredCount / currentQuestions.length) * 100 : 0;

  const handleNextAssign = (skipped: boolean = false) => {
    if (activeTab !== 'ASSESSMENT' || quizStatus !== 'QUIZ') return;
    
    if (currentAssignIdx < currentQuestions.length - 1) {
      setCurrentAssignIdx(prev => prev + 1);
      setTimeLeft(20);
      setIsTimerPaused(false);
      if (skipped) {
        setAnswers(prev => {
          const next = [...prev];
          next[currentAssignIdx] = null;
          return next;
        });
      }
    } else {
      setQuizStatus('RESULTS');
    }
  };

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
    
    // Store result for analytics
    setQuestionResults(prev => [...prev, { 
      id: question.id, 
      isCorrect, 
      timeSpent, 
      category: activeQuiz.category 
    }]);

    if (isCorrect) {
      setScore(prev => prev + 1);
      
      // Calculate points
      let pointsToAdd = 100;
      if (activeTab === 'ASSESSMENT') {
        const speedBonus = timeLeft * 5;
        pointsToAdd += speedBonus;
      }
      setTotalPoints(prev => prev + pointsToAdd);
    } else {
      setShakingIdx(qIdx);
      setTimeout(() => setShakingIdx(null), 400);
    }

    if (activeTab === 'ASSESSMENT') {
      setIsTimerPaused(true);
      setTimeout(() => {
        handleNextAssign();
        setQuestionStartTime(Date.now());
      }, 1500);
    } else {
      setTimeout(() => {
        if (currentAssignIdx < currentQuestions.length - 1) {
          setCurrentAssignIdx(prev => prev + 1);
          setQuestionStartTime(Date.now());
        }
      }, 1500);
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

  const finishQuiz = () => {
    setQuizStatus('RESULTS');
    
    // Update Global Stats
    setUserStats(prev => {
      const newStats = { ...prev };
      newStats.quizzesCompleted += 1;
      newStats.totalPoints += totalPoints;
      if (totalPoints > newStats.highScore) {
        newStats.highScore = totalPoints;
      }

      // Category update
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

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (activeTab === 'ASSESSMENT' && quizStatus === 'QUIZ' && !isTimerPaused && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && !isTimerPaused) {
      handleNextAssign(true);
    }

    return () => clearInterval(timer);
  }, [activeTab, quizStatus, timeLeft, isTimerPaused]);

  const Magnetic = ({ children }: { children: React.ReactNode }) => {
    const ref = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });

    const handleMouseMove = (e: React.MouseEvent) => {
      const { clientX, clientY } = e;
      const { left, top, width, height } = ref.current?.getBoundingClientRect() || { left: 0, top: 0, width: 0, height: 0 };
      const centerX = left + width / 2;
      const centerY = top + height / 2;
      const x = (clientX - centerX) * 0.35;
      const y = (clientY - centerY) * 0.35;
      setPosition({ x, y });
    };

    const handleMouseLeave = () => {
      setPosition({ x: 0, y: 0 });
    };

    return (
      <motion.div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        animate={{ x: position.x, y: position.y }}
        transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
      >
        {children}
      </motion.div>
    );
  };

  const NavigationBar = () => {
    // Hide navigation if inside a learning set or actively practicing
    if (learningQuizIndex !== null || (activeTab === 'PRACTICE' && quizStatus === 'QUIZ') || (activeTab === 'ASSESSMENT' && quizStatus === 'QUIZ')) {
      return null;
    }

    return (
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200 dark:border-amber-500/20">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div 
            onClick={() => { setActiveTab('HOME'); setQuizStatus('IDLE'); }} 
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="p-1.5 bg-zinc-900 dark:bg-amber-500 text-white dark:text-zinc-950 rounded-lg group-hover:scale-110 transition-transform">
              <Zap size={16} />
            </div>
            <span className="font-heading font-black text-sm tracking-tight hidden lg:block dark:text-amber-500">PRACTICE TO ACHIEVE</span>
          </div>

          <nav className="flex items-center gap-1 bg-zinc-100/50 dark:bg-zinc-900/50 p-1 rounded-xl">
            {[
              { id: 'HOME', label: 'Home', icon: Home },
              { id: 'LEARNING', label: 'Learning', icon: BookOpen },
              { id: 'PRACTICE', label: 'Practice', icon: Send },
              { id: 'ASSESSMENT', label: 'Assessment', icon: Clock },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as AppTab);
                  setQuizStatus('IDLE');
                  setLearningQuizIndex(null);
                }}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === tab.id 
                    ? 'bg-white dark:bg-amber-500 text-zinc-900 dark:text-zinc-950 shadow-sm' 
                    : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-500 dark:hover:text-amber-400'
                }`}
              >
                <tab.icon size={14} />
                <span className="hidden md:inline">{tab.label}</span>
              </button>
            ))}
          </nav>

          <button
            onClick={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
            className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all ${
              theme === 'dark' ? 'bg-zinc-900 text-amber-500 border border-amber-500/20' : 'bg-white text-zinc-500 border border-zinc-200 hover:bg-zinc-50'
            }`}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>

        {/* Animated Gradient Underline (Scrolling Colors) */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] overflow-hidden">
          <div className="absolute inset-[-1000%] animate-spin-slow bg-[conic-gradient(from_0deg,transparent_25%,#fbbf24_50%,transparent_75%,#fbbf24_100%)] opacity-100" />
        </div>
      </header>
    );
  };

  const isImmersive = (learningQuizIndex !== null || quizStatus === 'QUIZ');

  return (
    <div className={`relative min-h-screen p-4 md:p-8 flex flex-col items-center transition-all duration-700 ${isImmersive ? 'pt-4 md:pt-8' : 'pt-24 md:pt-32'}`}>
      <div className={`atmosphere transition-opacity duration-1000 ${isImmersive ? 'opacity-20 translate-y-10' : 'opacity-100'}`} />
      <NavigationBar />
      
      <AnimatePresence mode="wait">
        {activeTab === 'HOME' && (
          <motion.div 
            key="home"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-7xl space-y-12 py-12"
          >
            <div className="text-center space-y-6 pt-8">
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="inline-flex items-center gap-3 px-6 py-2 bg-zinc-900 text-white rounded-full text-xs font-black uppercase tracking-widest mb-4 shadow-2xl shadow-zinc-500/20"
              >
                <Zap size={14} className="text-amber-400" />
                Live Exam Prep 2026
              </motion.div>
              <div className="relative inline-block py-8 px-8 md:px-16 border border-zinc-800 dark:border-amber-500/20 bg-white/50 dark:bg-zinc-900/40 backdrop-blur-md rounded-lg group transition-all duration-500 hover:border-amber-500/50">
                {/* Corner accents for the "Box" design */}
                <div className="absolute -top-px -left-px w-8 h-8 border-t-2 border-l-2 border-amber-500 rounded-tl-lg scale-0 group-hover:scale-100 transition-transform duration-500 origin-top-left" />
                <div className="absolute -bottom-px -right-px w-8 h-8 border-b-2 border-r-2 border-amber-500 rounded-br-lg scale-0 group-hover:scale-100 transition-transform duration-500 origin-bottom-right" />
                
                <h1 className="text-4xl md:text-7xl font-heading font-black tracking-[-0.04em] flex flex-wrap items-center justify-center gap-x-4 md:gap-x-6">
                  <span className={theme === 'dark' ? 'text-amber-50' : 'text-zinc-950'}>PRACTICE</span>
                  <span className="text-zinc-400 font-display italic font-light text-2xl md:text-5xl lowercase">to</span>
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600">ACHIEVE</span>
                </h1>
              </div>
              <p className="text-zinc-500 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed font-medium">
                Master your curriculum with a three-step methodology designed for maximum retention.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
              {/* Mastery Card */}
              <motion.div 
                whileHover={{ y: -8 }}
                className="glass-card p-10 flex flex-col items-center text-center group border-2 border-transparent hover:border-emerald-500/20 bg-white/40"
              >
                 <div className="w-20 h-20 rounded-[32px] bg-emerald-50 flex items-center justify-center text-emerald-600 mb-8 group-hover:scale-110 transition-transform duration-500 shadow-inner">
                   <BookOpen size={32} />
                 </div>
                 <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600/60 mb-2">Step 01</span>
                 <h3 className={`text-2xl font-black mb-4 tracking-tight ${theme === 'dark' ? 'text-emerald-400' : 'text-zinc-900'}`}>MASTERY</h3>
                 <p className={`${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'} text-sm leading-relaxed mb-10 flex-1`}>
                   Internalize core concepts with side-by-side study sets and detailed question breakdowns.
                 </p>
                 <Magnetic>
                    <button 
                      onClick={() => setActiveTab('LEARNING')}
                      className="button-primary px-8 py-3 text-xs font-black uppercase tracking-widest rounded-2xl bg-emerald-600 hover:bg-emerald-700 shadow-xl shadow-emerald-500/20"
                    >
                      Begin Learning
                    </button>
                 </Magnetic>
              </motion.div>

              {/* Testing Card */}
              <motion.div 
                whileHover={{ y: -8 }}
                className="glass-card p-10 flex flex-col items-center text-center group border-2 border-transparent hover:border-blue-500/20 bg-white/40"
              >
                 <div className="w-20 h-20 rounded-[32px] bg-blue-50 flex items-center justify-center text-blue-600 mb-8 group-hover:scale-110 transition-transform duration-500 shadow-inner">
                   <Send size={32} />
                 </div>
                 <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600/60 mb-2">Step 02</span>
                 <h3 className={`text-2xl font-black mb-4 tracking-tight ${theme === 'dark' ? 'text-blue-400' : 'text-zinc-900'}`}>PRACTICE</h3>
                 <p className={`${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'} text-sm leading-relaxed mb-10 flex-1`}>
                   Validate your progress with untimed practice quizzes and instant accuracy feedback.
                 </p>
                 <Magnetic>
                    <button 
                      onClick={() => setActiveTab('PRACTICE')}
                      className="button-primary px-8 py-3 text-xs font-black uppercase tracking-widest rounded-2xl bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-500/20"
                    >
                      Start Testing
                    </button>
                 </Magnetic>
              </motion.div>

              {/* Assessment Card */}
              <motion.div 
                whileHover={{ y: -8 }}
                className="glass-card p-10 flex flex-col items-center text-center group border-2 border-transparent hover:border-amber-500/20 bg-white/40"
              >
                 <div className="w-20 h-20 rounded-[32px] bg-amber-50 flex items-center justify-center text-amber-600 mb-8 group-hover:scale-110 transition-transform duration-500 shadow-inner">
                   <Clock size={32} />
                 </div>
                 <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-600/60 mb-2">Step 03</span>
                 <h3 className={`text-2xl font-black mb-4 tracking-tight ${theme === 'dark' ? 'text-amber-400' : 'text-zinc-900'}`}>ASSESSMENT</h3>
                 <p className={`${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'} text-sm leading-relaxed mb-10 flex-1`}>
                   Prove your excellence under pressure with 20-second timers and competitive high scores.
                 </p>
                 <Magnetic>
                    <button 
                      onClick={() => setActiveTab('ASSESSMENT')}
                      className="button-primary px-12 py-3 text-xs font-black uppercase tracking-widest rounded-2xl bg-amber-600 hover:bg-amber-700 shadow-xl shadow-amber-500/20"
                    >
                      Exam Blitz
                    </button>
                 </Magnetic>
              </motion.div>
            </div>
          </motion.div>
        )}

        {activeTab === 'LEARNING' && (
          <motion.div 
            key="learning"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full max-w-4xl space-y-8"
          >
            {learningQuizIndex === null ? (
              <div className="space-y-12">
                <div className="text-center space-y-2 mb-4">
                  <h2 className={`text-2xl font-sans font-bold ${theme === 'dark' ? 'text-amber-50' : 'text-zinc-900'}`}>Browse Topics</h2>
                  <p className={`${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'} text-sm`}>Choose a subject to see detailed questions and answers.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {quizzes.map((quiz, idx) => (
                    <motion.div 
                      key={quiz.id}
                      onClick={() => setLearningQuizIndex(idx)}
                      whileHover={{ y: -4, backgroundColor: "rgba(255, 255, 255, 0.6)" }}
                      className="glass-card p-6 cursor-pointer hover:shadow-lg transition-all border-white/40 group bg-white/40 border-2 border-transparent hover:border-zinc-200"
                    >
                      <span className={`inline-block px-2.5 py-1 ${theme === 'dark' ? 'bg-zinc-800 text-zinc-400' : 'bg-zinc-100 text-zinc-500'} text-[10px] font-bold uppercase tracking-wider rounded-md mb-4`}>
                        {quiz.category}
                      </span>
                      <h3 className={`text-lg font-sans font-bold mb-2 group-hover:text-emerald-500 transition-colors uppercase tracking-tight ${theme === 'dark' ? 'text-amber-100' : 'text-zinc-900'}`}>{quiz.title}</h3>
                      <p className={`text-xs ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'} mb-6 leading-relaxed`}>{quiz.description}</p>
                      <div className={`flex items-center text-xs font-bold ${theme === 'dark' ? 'text-amber-500' : 'text-zinc-900'}`}>
                        View Study Set <ChevronRight size={14} className="ml-1 transition-transform group-hover:translate-x-0.5" />
                      </div>
                    </motion.div>
                  ))}
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
        )}

        {activeTab === 'PRACTICE' && (
          <motion.div 
            key="practice"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="w-full max-w-4xl"
          >
            {quizStatus === 'IDLE' && (
              <div className="space-y-12">
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-sans font-bold">Challenge Your Knowledge</h2>
                  <p className={`${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'} text-sm`}>Pick a topic and see if you can get a perfect score.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {quizzes.map((quiz, idx) => (
                    <motion.div 
                      key={quiz.id}
                      whileHover={{ y: -4, backgroundColor: "rgba(255, 255, 255, 0.6)" }}
                      className="glass-card p-6 flex flex-col justify-between hover:shadow-lg transition-all border-white/40 border-2 border-transparent hover:border-zinc-200"
                    >
                      <div className="space-y-4">
                        <span className={`inline-block px-2.5 py-1 ${theme === 'dark' ? 'bg-zinc-900 text-zinc-500' : 'bg-zinc-100 text-zinc-500'} text-[10px] font-bold uppercase tracking-wider rounded-md`}>
                          {quiz.category}
                        </span>
                        <h3 className={`text-lg font-sans font-bold leading-tight uppercase tracking-tight ${theme === 'dark' ? 'text-amber-50' : 'text-zinc-900'}`}>{quiz.title}</h3>
                        <p className={`text-xs ${theme === 'dark' ? 'text-zinc-500' : 'text-zinc-500'} leading-relaxed`}>
                          {quiz.description}
                        </p>
                      </div>
                      <div className="pt-8 flex items-center justify-between border-t border-zinc-100/50 mt-4">
                        <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-medium">
                          <Timer size={14} />
                          {quiz.questions.length} questions
                        </div>
                        <button 
                          onClick={() => handleStartPractice(idx)}
                          className="flex items-center gap-2 px-4 py-2 bg-zinc-900 dark:bg-amber-500 text-white dark:text-zinc-950 rounded-xl text-xs font-bold hover:bg-zinc-800 dark:hover:bg-amber-400 transition-colors"
                        >
                          Start Test
                          <ChevronRight size={14} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
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
                  
                  {/* Integrated Progress Bar */}
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
                  <h2 className="text-3xl font-sans font-bold">{activeTab === 'ASSESSMENT' ? 'Victory Summary' : 'Session Analysis'}</h2>
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
                              Object.entries(userStats.categoryPerformance).map(([name, data]: [string, any]) => ({
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
                           {/* Groups */}
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
                           <div className="flex justify-between items-start mb-4">
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
        )}
        {activeTab === 'ASSESSMENT' && (
          <motion.div 
            key="assignments"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="w-full max-w-4xl"
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

                  {/* Segmented Progress Bar with Integrated Timer */}
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

                {/* Question Area */}
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
