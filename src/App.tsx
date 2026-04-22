import { useState, useMemo, useEffect } from 'react';
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
  Sun
} from 'lucide-react';
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

type AppTab = 'HOME' | 'LEARNING' | 'PRACTICE' | 'ASSIGNMENTS';
type QuizStatus = 'IDLE' | 'QUIZ' | 'RESULTS';

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('HOME');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [quizStatus, setQuizStatus] = useState<QuizStatus>('IDLE');
  const [activeQuizIndex, setActiveQuizIndex] = useState(0);
  const [learningQuizIndex, setLearningQuizIndex] = useState<number | null>(null);
  
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [score, setScore] = useState(0);
  
  const [currentQuestions, setCurrentQuestions] = useState<Question[]>([]);
  const [shakingIdx, setShakingIdx] = useState<number | null>(null);
  
  // Timed Assignments State
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
    if (activeTab !== 'ASSIGNMENTS' || quizStatus !== 'QUIZ') return;
    
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
  };

  const handleSelectOption = (qIdx: number, optIdx: number) => {
    if (answers[qIdx] !== null) return;
    
    const newAnswers = [...answers];
    newAnswers[qIdx] = optIdx;
    setAnswers(newAnswers);

    const question = currentQuestions[qIdx];
    const isCorrect = optIdx === question.correctAnswer;
    
    if (isCorrect) {
      setScore(prev => prev + 1);
    } else {
      setShakingIdx(qIdx);
      setTimeout(() => setShakingIdx(null), 400);
    }

    if (activeTab === 'ASSIGNMENTS') {
      setIsTimerPaused(true);
      setTimeout(() => {
        handleNextAssign();
      }, 1500);
    }
  };

  const handleStartAssignments = (index: number) => {
    const quiz = quizzes[index];
    const shuffled = [...quiz.questions].sort(() => Math.random() - 0.5);
    
    setCurrentQuestions(shuffled);
    setActiveQuizIndex(index);
    setQuizStatus('QUIZ');
    setAnswers(new Array(shuffled.length).fill(null));
    setScore(0);
    setCurrentAssignIdx(0);
    setTimeLeft(20);
    setIsTimerPaused(false);
  };

  const resetQuiz = () => {
    setQuizStatus('IDLE');
  };

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (activeTab === 'ASSIGNMENTS' && quizStatus === 'QUIZ' && !isTimerPaused && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && !isTimerPaused) {
      handleNextAssign(true);
    }

    return () => clearInterval(timer);
  }, [activeTab, quizStatus, timeLeft, isTimerPaused]);

  const NavigationBar = () => {
    // Hide navigation if inside a learning set or actively practicing
    if (learningQuizIndex !== null || (activeTab === 'PRACTICE' && quizStatus === 'QUIZ') || (activeTab === 'ASSIGNMENTS' && quizStatus === 'QUIZ')) {
      return null;
    }

    return (
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 glass-card px-2 py-2 flex items-center gap-1 shadow-xl border-white/50 backdrop-blur-2xl">
        {[
          { id: 'HOME', label: 'Home', icon: Home },
          { id: 'LEARNING', label: 'Learning', icon: BookOpen },
          { id: 'PRACTICE', label: 'Practice', icon: Send },
          { id: 'ASSIGNMENTS', label: 'Assignments', icon: Clock },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id as AppTab);
              setQuizStatus('IDLE');
              setLearningQuizIndex(null);
            }}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl text-sm font-semibold transition-all ${
              activeTab === tab.id 
                ? (theme === 'dark' ? 'bg-white text-zinc-950 shadow-lg shadow-black/50' : 'bg-zinc-900 text-white shadow-lg shadow-zinc-200') 
                : (theme === 'dark' ? 'text-zinc-400 hover:bg-zinc-800' : 'text-zinc-500 hover:bg-zinc-100')
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
        <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-700 mx-2" />
        <button
          onClick={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
          className={`flex items-center justify-center p-2.5 rounded-xl transition-all ${
            theme === 'dark' ? 'bg-zinc-800 text-amber-400 border border-zinc-700' : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'
          }`}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    );
  };

  const isImmersive = learningQuizIndex !== null || (activeTab === 'PRACTICE' && quizStatus === 'QUIZ');

  return (
    <div className={`relative min-h-screen p-4 md:p-8 flex flex-col items-center transition-all duration-500 ${isImmersive ? 'pt-4 md:pt-8' : 'pt-24 md:pt-32'}`}>
      <div className="atmosphere" />
      <NavigationBar />
      
      <AnimatePresence mode="wait">
        {activeTab === 'HOME' && (
          <motion.div 
            key="home"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-4xl space-y-12 py-12"
          >
            <div className="text-center space-y-4">
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="inline-flex p-4 bg-zinc-900 text-white rounded-3xl"
              >
                <Cpu size={32} />
              </motion.div>
              <h1 className="text-4xl md:text-6xl font-sans font-black tracking-tight text-zinc-900">
                Quiz<span className="text-zinc-500 italic font-display">Wise</span>
              </h1>
              <p className="text-zinc-500 text-base max-w-xl mx-auto leading-relaxed">
                Your ultimate educational companion. Master any subject through dedicated study paths and real-time performance testing.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
              <div className="glass-card p-8 space-y-4">
                <div className="text-emerald-600 bg-emerald-100 w-12 h-12 rounded-2xl flex items-center justify-center">
                  <BookOpen size={24} />
                </div>
                <h3 className="text-lg font-sans font-bold">Concept Mastery</h3>
                <p className={`${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'} text-xs leading-relaxed`}>
                  Deep dive into core concepts. Browse through topic-specific question sets with answers highlighted for efficient learning.
                </p>
                <button onClick={() => setActiveTab('LEARNING')} className={`button-primary w-full shadow-none border ${theme === 'dark' ? 'border-zinc-700 bg-transparent text-zinc-100 hover:bg-zinc-800' : 'border-zinc-200 !bg-transparent !text-zinc-900 hover:!bg-zinc-50'}`}>
                  Enter Learning Mode
                </button>
              </div>
              <div className="glass-card p-8 space-y-4">
                <div className="text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 w-12 h-12 rounded-2xl flex items-center justify-center">
                  <Send size={24} />
                </div>
                <h3 className="text-lg font-sans font-bold">Skills Testing</h3>
                <p className={`${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'} text-xs leading-relaxed`}>
                  Challenge yourself with timed practice runs. Get instant feedback on your answers and a complete analysis of your results.
                </p>
                <button onClick={() => setActiveTab('PRACTICE')} className="button-primary w-full">
                  Begin Practice
                </button>
              </div>
              <div className="glass-card p-8 space-y-4 md:col-span-2">
                <div className="text-amber-600 bg-amber-100 w-12 h-12 rounded-2xl flex items-center justify-center">
                  <Clock size={24} />
                </div>
                <h3 className="text-lg font-sans font-bold">Timed Assignments</h3>
                <p className={`${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'} text-xs leading-relaxed`}>
                  The ultimate challenge. 20 seconds per question with automatic progression. Test your speed and accuracy under pressure.
                </p>
                <button onClick={() => setActiveTab('ASSIGNMENTS')} className="button-primary w-full bg-amber-600 hover:bg-amber-700">
                  Take the Challenge
                </button>
              </div>
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
                  <h2 className="text-2xl font-sans font-bold">Browse Topics</h2>
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
                      <h3 className="text-lg font-sans font-bold mb-2 group-hover:text-emerald-600 transition-colors uppercase tracking-tight">{quiz.title}</h3>
                      <p className={`text-xs ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'} mb-6 leading-relaxed`}>{quiz.description}</p>
                      <div className={`flex items-center text-xs font-bold ${theme === 'dark' ? 'text-zinc-100' : 'text-zinc-900'}`}>
                        View Study Set <ChevronRight size={14} className="ml-1 transition-transform group-hover:translate-x-0.5" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-8 pb-32">
                <div className={`flex items-center justify-between sticky top-0 z-40 ${theme === 'dark' ? 'bg-zinc-950/90' : 'bg-zinc-50/90'} backdrop-blur-xl py-6 -mx-4 px-4 border-b ${theme === 'dark' ? 'border-zinc-800' : 'border-zinc-200/50'} shadow-sm`}>
                  <div className="flex items-center gap-6">
                    <button 
                      onClick={() => setLearningQuizIndex(null)}
                      className={`p-3 border rounded-2xl transition-all shadow-sm ${
                        theme === 'dark' ? 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:text-zinc-100 hover:border-zinc-500' : 'bg-white border-zinc-200 text-zinc-400 hover:text-zinc-900 hover:border-zinc-900'
                      }`}
                    >
                      <ArrowLeft size={20} />
                    </button>
                    <div>
                      <h2 className={`text-2xl font-sans font-bold leading-tight ${theme === 'dark' ? 'text-zinc-100' : 'text-zinc-900'}`}>{quizzes[learningQuizIndex].title}</h2>
                      <p className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest mt-1">Study Guide • Learning Mode</p>
                    </div>
                  </div>
                  <div className={`hidden md:flex px-4 py-2 ${theme === 'dark' ? 'bg-emerald-900/20 text-emerald-400 border-emerald-800/50' : 'bg-emerald-50 text-emerald-700 border-emerald-100'} rounded-xl text-xs font-bold items-center gap-2 border`}>
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
                        <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center text-sm font-bold mt-1">
                          {i + 1}
                        </span>
                        <h4 className={`text-sm md:text-base font-bold pt-0.5 font-sans leading-relaxed ${theme === 'dark' ? 'text-zinc-100' : 'text-zinc-800'}`}>{q.text}</h4>
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
                            <span className={`flex-shrink-0 w-5 h-5 rounded-md ${theme === 'dark' ? 'bg-zinc-900' : 'bg-white'} border border-current flex items-center justify-center text-[10px] font-black uppercase`}>
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
                        <span className={`inline-block px-2.5 py-1 ${theme === 'dark' ? 'bg-zinc-800 text-zinc-400' : 'bg-zinc-100 text-zinc-500'} text-[10px] font-bold uppercase tracking-wider rounded-md`}>
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
                          onClick={() => handleStartPractice(idx)}
                          className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-xl text-xs font-bold hover:bg-zinc-800 transition-colors"
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
                <div className={`sticky top-0 z-40 ${theme === 'dark' ? 'bg-zinc-950/90' : 'bg-zinc-50/90'} backdrop-blur-xl -mx-4 px-4 border-b ${theme === 'dark' ? 'border-zinc-800' : 'border-zinc-200/50'} shadow-sm mb-12`}>
                   <div className="flex items-center justify-between py-6">
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={resetQuiz}
                        className={`p-3 border rounded-2xl transition-all shadow-sm ${
                          theme === 'dark' ? 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:text-zinc-100 hover:border-zinc-500' : 'bg-white border-zinc-200 text-zinc-400 hover:text-zinc-900 hover:border-zinc-900'
                        }`}
                      >
                        <ArrowLeft size={20} />
                      </button>
                      <div>
                        <h3 className={`text-lg font-sans font-bold leading-tight ${theme === 'dark' ? 'text-zinc-100' : 'text-zinc-900'}`}>{activeQuiz.title}</h3>
                        <p className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest">Test • Live Session</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest leading-none">Score</span>
                        <p className={`text-xl font-display font-bold ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'} leading-none`}>
                          {score}
                        </p>
                      </div>
                      <div className={`text-right border-l ${theme === 'dark' ? 'border-zinc-800' : 'border-zinc-200'} pl-6`}>
                        <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest leading-none">Ans</span>
                        <p className={`text-xl font-display font-bold leading-none ${theme === 'dark' ? 'text-zinc-100' : 'text-zinc-900'}`}>
                          {answeredCount}<span className={theme === 'dark' ? 'text-zinc-700 text-base' : 'text-zinc-300 font-normal'}>/{currentQuestions.length}</span>
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
                        className={`h-full ${theme === 'dark' ? 'bg-white' : 'bg-zinc-950'} transition-all duration-500 rounded-full`}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-16">
                  {currentQuestions.map((question, qIdx) => {
                    const userAnswer = answers[qIdx];
                    const isAnswered = userAnswer !== null;
                    
                    return (
                      <motion.div 
                        key={question.id}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        whileHover={{ y: -2 }}
                        viewport={{ once: true, margin: "-10% 0px -10% 0px" }}
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
                  })}
                </div>

                <div className="pt-12 flex justify-center">
                  <button 
                    onClick={() => setQuizStatus('RESULTS')}
                    className="button-primary px-12 py-5 text-xl font-black rounded-3xl"
                  >
                    Finish and See Results
                    <ChevronRight size={24} className="ml-2" />
                  </button>
                </div>
              </div>
            )}

            {quizStatus === 'RESULTS' && (
              <div className="w-full max-w-xl mx-auto text-center space-y-8">
                <div className="space-y-4">
                  <div className="relative inline-block">
                    <motion.div 
                      initial={{ rotate: -20, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      transition={{ type: 'spring', damping: 10 }}
                      className="p-5 bg-amber-100 text-amber-600 rounded-full inline-flex relative z-10"
                    >
                      <Trophy size={48} />
                    </motion.div>
                    <motion.div 
                      animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className={`absolute inset-0 ${theme === 'dark' ? 'bg-zinc-700' : 'bg-amber-400'} blur-2xl rounded-full`}
                    />
                  </div>
                  <h2 className="text-2xl font-sans font-bold">{activeTab === 'ASSIGNMENTS' ? 'Assignment Results' : 'Practice Results'}</h2>
                  <p className={`${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'} text-sm`}>{activeTab === 'ASSIGNMENTS' ? 'Timed session complete.' : 'Evaluation complete.'} Here is your summary.</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="glass-card p-6">
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Questions Correct</p>
                    <p className="text-5xl font-display font-black pt-2 text-zinc-900">
                      {score}<span className="text-xl text-zinc-300 font-normal">/{currentQuestions.length}</span>
                    </p>
                  </div>
                  <div className="glass-card p-6">
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Accuracy Rating</p>
                    <p className="text-5xl font-display font-black pt-2 text-zinc-900">
                      {currentQuestions.length > 0 ? Math.round((score / currentQuestions.length) * 100) : 0}%
                    </p>
                  </div>
                </div>

                <div className="space-y-4 text-left">
                  <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 px-2 flex items-center gap-2">
                    <Layout size={14} />
                    Session Analysis
                  </h3>
                  <div className="space-y-2 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                    {currentQuestions.map((q, i) => {
                      const userAnswer = answers[i];
                      const isCorrect = userAnswer === q.correctAnswer;
                      return (
                        <div key={q.id} className={`p-4 rounded-2xl border-2 transition-all ${isCorrect ? 'bg-emerald-50/40 border-emerald-100/50' : 'bg-rose-50/40 border-rose-100/50'}`}>
                          <p className="text-xs md:text-sm font-bold mb-3">{q.text}</p>
                          <div className="flex flex-col gap-2">
                            <div className={`text-xs md:text-sm flex items-center gap-2 font-semibold ${isCorrect ? 'text-emerald-700' : 'text-rose-700'}`}>
                              {isCorrect ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                              Your Answer: <span className="opacity-60">({String.fromCharCode(65 + (userAnswer ?? 0))})</span> {userAnswer !== null ? q.options[userAnswer] : 'Skipped'}
                            </div>
                            {!isCorrect && (
                              <div className="text-emerald-700 text-sm flex items-center gap-2 font-semibold pl-6 opacity-75">
                                <CheckCircle2 size={16} />
                                Correct Answer: <span className="opacity-60">({String.fromCharCode(65 + q.correctAnswer)})</span> {q.options[q.correctAnswer]}
                              </div>
                            )}
                          </div>
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
              </div>
            )}
          </motion.div>
        )}
        {activeTab === 'ASSIGNMENTS' && (
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
                  <h2 className="text-2xl font-sans font-bold">Timed Assignments</h2>
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
                          onClick={() => handleStartAssignments(idx)}
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
                <div className={`sticky top-0 z-40 ${theme === 'dark' ? 'bg-zinc-950/90' : 'bg-zinc-50/90'} backdrop-blur-xl -mx-4 px-4 border-b ${theme === 'dark' ? 'border-zinc-800 ml-0.5' : 'border-zinc-200/50'} shadow-sm mb-12`}>
                   <div className="flex items-center justify-between py-6">
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={resetQuiz}
                        className={`p-3 border rounded-2xl transition-all shadow-sm ${
                          theme === 'dark' ? 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:text-zinc-100 hover:border-zinc-500' : 'bg-white border-zinc-200 text-zinc-400 hover:text-zinc-900 hover:border-zinc-900'
                        }`}
                      >
                        <ArrowLeft size={20} />
                      </button>
                      <div>
                        <h3 className={`text-lg font-sans font-bold leading-tight ${theme === 'dark' ? 'text-zinc-100' : 'text-zinc-900'}`}>{activeQuiz.title}</h3>
                        <p className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest mt-1">Timed Assignments Challenge</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest leading-none block">Score</span>
                        <p className={`text-xl font-display font-bold ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'} leading-none mt-1`}>
                          {score}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Segmented Progress Bar with Integrated Timer */}
                  <div className="pb-4 space-y-2.5">
                    <div className="flex items-center justify-between text-[8px] font-mono font-bold text-zinc-400 uppercase tracking-widest px-0.5">
                      <span className="flex items-center gap-1.5">
                        <Clock size={10} className={`${timeLeft < 5 ? 'text-rose-500 animate-pulse' : 'text-amber-500'}`} />
                        Question Time: <span className={timeLeft < 5 ? 'text-rose-500' : 'text-zinc-100'}>{timeLeft}s</span>
                      </span>
                      <span>{currentAssignIdx + 1} / {currentQuestions.length} Questions</span>
                    </div>
                    <div className="flex gap-1.5 h-1.5 w-full">
                      {currentQuestions.map((_, i) => {
                        const isCompleted = i < currentAssignIdx;
                        const isCurrent = i === currentAssignIdx;
                        return (
                          <div key={i} className={`flex-1 h-full rounded-full overflow-hidden bg-zinc-200 dark:bg-zinc-900 shadow-inner`}>
                             {isCompleted && (
                               <div className={`h-full w-full ${theme === 'dark' ? 'bg-zinc-100' : 'bg-zinc-900'}`} />
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
                  className={`glass-card p-8 md:p-12 space-y-8 transition-all ${shakingIdx === currentAssignIdx ? 'shake' : ''} shadow-xl border-2 ${theme === 'dark' ? 'border-amber-900/50' : 'border-amber-100'}`}
                >
                  <div className="flex items-start gap-4">
                    <span className={`flex-shrink-0 w-8 h-8 rounded-lg ${theme === 'dark' ? 'bg-amber-500 text-zinc-950' : 'bg-amber-600 text-white'} flex items-center justify-center text-sm font-bold mt-1 shadow-lg shadow-amber-200 dark:shadow-amber-900/20`}>
                      {currentAssignIdx + 1}
                    </span>
                    <h2 className={`text-lg md:text-xl font-sans font-bold leading-relaxed ${theme === 'dark' ? 'text-zinc-100' : 'text-zinc-800'}`}>
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
                            isSelected ? (theme === 'dark' ? 'border-zinc-400 bg-zinc-800' : 'border-zinc-900 scale-[1.01]') : (theme === 'dark' ? 'border-zinc-800 bg-zinc-900/40' : 'border-zinc-100')
                          } ${isCorrect ? theme === 'dark' ? 'border-emerald-500/50 bg-emerald-950/20 text-emerald-300' : 'border-emerald-500 bg-emerald-50 text-emerald-900' : ''} ${
                            isWrong ? theme === 'dark' ? 'border-rose-500/50 bg-rose-950/20 text-rose-300' : 'border-rose-500 bg-rose-50 text-rose-900' : ''
                          }`}
                        >
                          <span className={`flex-shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center text-xs font-black uppercase transition-colors ${
                            isSelected ? (theme === 'dark' ? 'border-zinc-100 bg-zinc-100 text-zinc-950' : 'border-zinc-900 bg-zinc-900 text-white') : (theme === 'dark' ? 'border-zinc-700 text-zinc-500' : 'border-zinc-200 text-zinc-400')
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
