import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, RotateCcw, CheckCircle2, XCircle, BookOpen, Info, SlidersHorizontal, X } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import dumpCloudFSD from '../previous_year_dumps_json/Cloud FSD Questions.json';

interface DumpQuestion {
  id: number | string;
  section: string;
  question: string;
  options: string[];
  answer: string;
  correctAnswer?: string;
  explanation?: string;
}

// --- CORRECT ANSWER PARSING UTILITY ---
const parseCorrectAnswer = (options: string[], answerStr: string): number => {
  if (!options || options.length === 0 || !answerStr) return -1;

  const cleanAns = answerStr.trim().toLowerCase();
  let baseAns = cleanAns;
  if (baseAns.startsWith('-')) {
    baseAns = baseAns.substring(1).trim();
  }

  let match = baseAns.match(/^(?:ans:\s*|option\s*)?([a-e])(?:\.|\)|$|\s)/i);
  if (match) {
    const letter = match[1].toLowerCase();
    const index = letter.charCodeAt(0) - 97;
    if (index >= 0 && index < options.length) {
      return index;
    }
  }

  for (let i = 0; i < options.length; i++) {
    const optClean = options[i].trim().toLowerCase();
    const optLetterMatch = optClean.match(/^([a-e])(?:\.|\)|\s)/i);
    if (optLetterMatch) {
      const optLetter = optLetterMatch[1];
      if (baseAns === optLetter || baseAns.startsWith(optLetter + ' ') || baseAns === optLetter + '.' || baseAns === optLetter + ')') {
        return i;
      }
      const afterPrefix = optClean.substring(optLetterMatch[0].length).trim();
      if (baseAns === afterPrefix || afterPrefix.includes(baseAns) || baseAns.includes(afterPrefix)) {
        if (baseAns.length > 2 && afterPrefix.length > 2) {
          return i;
        }
      }
    }
    if (optClean === baseAns || optClean.includes(baseAns) || baseAns.includes(optClean)) {
      if (baseAns.length > 1 && optClean.length > 1) {
        return i;
      }
    }
  }

  if (baseAns.length === 1) {
    const code = baseAns.charCodeAt(0) - 97;
    if (code >= 0 && code < options.length) {
      return code;
    }
  }

  return -1;
};

const cleanOption = (option: string): string => {
  if (!option) return '';
  return option.replace(/^[A-Ea-e]\s*(?:-|\.|\))\s*/, '').trim();
};

const PracticeCloud: React.FC = () => {
  const { theme } = useAppContext();
  
  // Collapsible Sidebar Drawer state
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  
  // States
  const [activeSection, setActiveSection] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Track user selections: { [questionId: string]: selectedOptionIndex }
  const [userSelections, setUserSelections] = useState<Record<string, number>>({});

  const questions: DumpQuestion[] = dumpCloudFSD as DumpQuestion[];

  // Memoize sections list
  const sections = useMemo(() => {
    const set = new Set<string>();
    questions.forEach(q => {
      if (q.section) set.add(q.section.trim());
    });
    return ['All', ...Array.from(set)];
  }, [questions]);

  // Handle option click
  const handleSelectOption = (qId: string | number, optionIdx: number) => {
    if (userSelections[String(qId)] !== undefined) return;
    setUserSelections(prev => ({
      ...prev,
      [String(qId)]: optionIdx
    }));
  };

  // Reset practice progress
  const handleResetProgress = () => {
    if (confirm('Are you sure you want to reset your practice progress for this session?')) {
      setUserSelections({});
    }
  };

  // Filtered questions
  const filteredQuestions = useMemo(() => {
    return questions.filter(q => {
      const matchesSection = activeSection === 'All' || (q.section && q.section.trim() === activeSection);
      const qText = q.question || '';
      const matchesSearch = qText.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (q.options && q.options.some(opt => opt.toLowerCase().includes(searchQuery.toLowerCase())));
      return matchesSection && matchesSearch;
    });
  }, [questions, activeSection, searchQuery]);

  // Statistics calculation
  const stats = useMemo(() => {
    let answered = 0;
    let correct = 0;
    
    questions.forEach(q => {
      const key = String(q.id);
      const selection = userSelections[key];
      if (selection !== undefined) {
        answered++;
        const correctIdx = parseCorrectAnswer(q.options || [], q.answer || q.correctAnswer || '');
        if (selection === correctIdx) {
          correct++;
        }
      }
    });

    const incorrect = answered - correct;
    const accuracy = answered > 0 ? Math.round((correct / answered) * 100) : 0;

    return { answered, correct, incorrect, accuracy };
  }, [questions, userSelections]);

  return (
    <div className="w-full max-w-7xl px-4 py-8 relative">
      
      {/* Floating Toggle Button (Appears when sidebar is closed) */}
      {!isSidebarOpen && (
        <button
          onClick={() => setIsSidebarOpen(true)}
          className={`fixed left-6 top-24 z-40 h-12 px-4 border-2 rounded-2xl transition-all shadow-xl flex items-center gap-2 group cursor-pointer ${
            theme === 'dark' 
              ? 'bg-zinc-900 border-amber-500/30 text-amber-400 hover:border-amber-500 hover:text-amber-300' 
              : 'bg-white border-zinc-200 text-zinc-650 hover:border-zinc-900 hover:text-zinc-900'
          }`}
          title="Open Filters & Session Stats"
        >
          <SlidersHorizontal size={15} className="animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest">Filters & Stats</span>
        </button>
      )}

      {/* Collapsible Left Sidebar Panel */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            {/* Dark Blur Overlay Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            />

            {/* Slide Out Panel */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className={`fixed left-0 top-0 bottom-0 z-50 w-80 sm:w-96 p-6 shadow-2xl border-r flex flex-col overflow-hidden ${
                theme === 'dark' ? 'bg-zinc-900 border-zinc-800 text-amber-50' : 'bg-white border-zinc-150 text-zinc-900'
              }`}
            >
              {/* Header Title & Close button */}
              <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
                <div className="flex items-center gap-2.5 text-amber-550 dark:text-amber-450">
                  <SlidersHorizontal size={18} />
                  <span className="text-xs font-black uppercase tracking-widest">Practice Desk</span>
                </div>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-950 rounded-xl transition-colors text-zinc-400 hover:text-zinc-900 dark:hover:text-white cursor-pointer"
                  title="Close Sidebar"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Scrollable contents inside sidebar */}
              <div className="flex-1 overflow-y-auto pr-1 py-4 space-y-6 custom-scrollbar">
                
                {/* Search Bar */}
                <div className="space-y-2">
                  <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Search Module</p>
                  <div className="relative group">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-amber-500 transition-colors">
                      <Search size={14} />
                    </div>
                    <input
                      type="text"
                      placeholder="Search questions & choices..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={`w-full h-10 pl-9 pr-3 rounded-xl border-2 transition-all outline-none text-[11px] font-bold ${
                        theme === 'dark'
                          ? 'bg-zinc-950 border-zinc-800 text-white focus:border-amber-500/40'
                          : 'bg-white border-zinc-150 text-zinc-900 focus:border-zinc-900'
                      }`}
                    />
                  </div>
                </div>

                {/* Session Statistics Dashboard */}
                <div className="space-y-3">
                  <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Session Progress</p>
                  
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className={`p-3 rounded-2xl border text-center ${theme === 'dark' ? 'bg-zinc-950/60 border-zinc-800' : 'bg-zinc-50/50 border-zinc-100'}`}>
                      <p className="text-[8px] font-black uppercase tracking-widest text-zinc-400">Total Qs</p>
                      <p className="text-base font-black mt-0.5">{questions.length}</p>
                    </div>
                    <div className={`p-3 rounded-2xl border text-center ${theme === 'dark' ? 'bg-zinc-950/60 border-zinc-800' : 'bg-zinc-50/50 border-zinc-100'}`}>
                      <p className="text-[8px] font-black uppercase tracking-widest text-zinc-400">Answered</p>
                      <p className="text-base font-black mt-0.5">{stats.answered}</p>
                    </div>
                    <div className={`p-3 rounded-2xl border text-center ${theme === 'dark' ? 'bg-emerald-950/20 border-emerald-500/20' : 'bg-emerald-50 border-emerald-100'}`}>
                      <p className="text-[8px] font-black uppercase tracking-widest text-emerald-500">Correct</p>
                      <p className="text-base font-black mt-0.5 text-emerald-600 dark:text-emerald-450">{stats.correct}</p>
                    </div>
                    <div className={`p-3 rounded-2xl border text-center ${theme === 'dark' ? 'bg-rose-950/20 border-rose-500/20' : 'bg-rose-50 border-rose-100'}`}>
                      <p className="text-[8px] font-black uppercase tracking-widest text-rose-500">Incorrect</p>
                      <p className="text-base font-black mt-0.5 text-rose-600 dark:text-rose-455">{stats.incorrect}</p>
                    </div>
                  </div>

                  <div className={`p-3 rounded-2xl border flex justify-between items-center ${theme === 'dark' ? 'bg-zinc-950/60 border-zinc-800' : 'bg-zinc-50/50 border-zinc-100'}`}>
                    <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Accuracy Rate</p>
                    <p className="text-lg font-black text-amber-500 dark:text-amber-450">{stats.accuracy}%</p>
                  </div>
                </div>

                {/* Reset Progress Button */}
                <div className="pt-1">
                  <button
                    onClick={handleResetProgress}
                    className="w-full py-3 flex items-center justify-center gap-2 rounded-xl bg-zinc-950 dark:bg-zinc-850 hover:bg-zinc-900 text-white text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer shadow-md"
                  >
                    <RotateCcw size={12} />
                    Reset Session Progress
                  </button>
                </div>

                {/* Topic Filters */}
                <div className="space-y-3">
                  <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Section Domains</p>
                  <div className="flex flex-col gap-1.5 pr-1 max-h-[30vh] overflow-y-auto custom-scrollbar">
                    {sections.map((sec) => (
                      <button
                        key={sec}
                        onClick={() => setActiveSection(sec)}
                        className={`w-full px-3.5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-wider border text-left transition-all cursor-pointer flex justify-between items-center ${
                          activeSection === sec
                            ? 'bg-amber-500 text-zinc-950 border-amber-500 font-black shadow-sm'
                            : theme === 'dark' 
                              ? 'bg-zinc-950 border-zinc-850 text-zinc-400 hover:border-amber-500/20' 
                              : 'bg-zinc-50 border-zinc-150 text-zinc-650 hover:bg-zinc-100'
                        }`}
                      >
                        <span>{sec}</span>
                        {activeSection === sec && <span className="h-1.5 w-1.5 rounded-full bg-zinc-950" />}
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="space-y-8">
        
        {/* Title and Intro */}
        <div className="text-center space-y-3 pt-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <BookOpen size={12} />
            <span>Active Practice Mode</span>
          </div>
          <h2 className={`text-3xl sm:text-5xl font-sans font-black tracking-tight ${theme === 'dark' ? 'text-amber-50' : 'text-zinc-900'}`}>
            Practice Cloud Questions
          </h2>
          <p className={`${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'} text-xs font-semibold max-w-xl mx-auto leading-relaxed`}>
            Evaluate your knowledge. Answers are hidden until clicked. Tap on the **Filters & Stats** tab on the left to change topic filters and search questions.
          </p>
        </div>

        {/* Scrollable Questions list container */}
        <div className="mx-auto w-full max-w-3xl space-y-6 pb-20">
          {filteredQuestions.map((q, i) => {
            const qKey = String(q.id);
            const selection = userSelections[qKey];
            const hasAnswered = selection !== undefined;
            const correctOptIdx = parseCorrectAnswer(q.options || [], q.answer || q.correctAnswer || '');
            const hasOptions = q.options && q.options.length > 0;

            return (
              <motion.div 
                key={q.id || i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.02, 0.4) }}
                className={`p-6 rounded-[32px] border-2 transition-all shadow-sm ${
                  theme === 'dark' 
                    ? 'bg-zinc-900/40 border-zinc-800/80 hover:border-zinc-800' 
                    : 'bg-white border-zinc-100 hover:border-zinc-200'
                }`}
              >
                {/* Question Header */}
                <div className="flex justify-between items-center pb-3 border-b border-zinc-100/50 dark:border-zinc-800/50 mb-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-xl bg-zinc-950 dark:bg-amber-500 text-white dark:text-zinc-950 flex items-center justify-center text-xs font-black shadow-sm">
                    {i + 1}
                  </span>
                  <div className="flex gap-2">
                    {hasAnswered && (
                      <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded flex items-center gap-1 ${
                        selection === correctOptIdx
                          ? 'bg-emerald-500/10 text-emerald-500'
                          : 'bg-rose-500/10 text-rose-500'
                      }`}>
                        {selection === correctOptIdx ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
                        {selection === correctOptIdx ? 'Correct' : 'Incorrect'}
                      </span>
                    )}
                    {q.section && (
                      <span className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded ${
                        theme === 'dark' ? 'bg-amber-500/10 text-amber-450 border border-amber-500/20' : 'bg-amber-50 text-amber-800 border border-amber-100'
                      }`}>
                        {q.section}
                      </span>
                    )}
                  </div>
                </div>

                {/* Question text */}
                <h4 className={`text-sm md:text-base font-bold leading-relaxed whitespace-pre-line mb-6 ${theme === 'dark' ? 'text-amber-50' : 'text-zinc-900'}`}>
                  {q.question}
                </h4>

                {/* Options rendering */}
                {hasOptions ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {q.options.map((option, optIdx) => {
                      const isSelected = selection === optIdx;
                      const isCorrectOption = optIdx === correctOptIdx;
                      
                      let buttonStyle = theme === 'dark' 
                        ? 'border-zinc-700/60 bg-zinc-900/80 text-zinc-300 hover:border-zinc-700' 
                        : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50';

                      if (hasAnswered) {
                        if (isCorrectOption) {
                          buttonStyle = theme === 'dark' 
                            ? 'border-emerald-500/40 bg-emerald-950/20 text-emerald-300 font-bold ring-2 ring-emerald-500/10' 
                            : 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold';
                        } else if (isSelected && !isCorrectOption) {
                          buttonStyle = theme === 'dark' 
                            ? 'border-rose-500/40 bg-rose-950/20 text-rose-300 font-bold ring-2 ring-rose-500/10' 
                            : 'border-rose-500 bg-rose-50 text-rose-900 font-bold';
                        } else {
                          buttonStyle = 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40 text-zinc-400 dark:text-zinc-500 cursor-not-allowed';
                        }
                      }

                      return (
                        <button
                          key={optIdx}
                          disabled={hasAnswered}
                          onClick={() => handleSelectOption(q.id, optIdx)}
                          className={`p-3.5 rounded-2xl border-2 text-xs md:text-sm font-semibold flex items-center gap-3 transition-all text-left ${buttonStyle}`}
                        >
                          <span className={`flex-shrink-0 w-6.5 h-6.5 rounded-lg border flex items-center justify-center text-[10px] font-black uppercase ${
                            hasAnswered
                              ? isCorrectOption
                                ? 'bg-emerald-500 text-white border-emerald-500'
                                : isSelected
                                  ? 'bg-rose-500 text-white border-rose-500'
                                  : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-400 dark:text-zinc-500 border-transparent'
                              : theme === 'dark' ? 'bg-zinc-955 border-zinc-800 text-amber-500' : 'bg-zinc-50 border-zinc-200 text-zinc-850'
                          }`}>
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          
                          <span className="flex-1 leading-relaxed">{cleanOption(option)}</span>
                          
                          {hasAnswered && isCorrectOption && (
                            <CheckCircle2 size={16} className="text-emerald-500 stroke-[2.5]" />
                          )}
                          {hasAnswered && isSelected && !isCorrectOption && (
                            <XCircle size={16} className="text-rose-500 stroke-[2.5]" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {!hasAnswered ? (
                      <button
                        onClick={() => handleSelectOption(q.id, 0)}
                        className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-zinc-950 text-xs font-black uppercase tracking-widest transition-all cursor-pointer shadow-md"
                      >
                        Show Answer Key
                      </button>
                    ) : (
                      <div className={`p-4 rounded-2xl border-2 flex items-start gap-3 ${
                        theme === 'dark' ? 'border-emerald-500/20 bg-emerald-950/10 text-emerald-300' : 'border-emerald-100 bg-emerald-50/50 text-emerald-900'
                      }`}>
                        <div className="p-1 rounded bg-emerald-500 text-white shrink-0 mt-0.5">
                          <CheckCircle2 size={12} />
                        </div>
                        <div className="space-y-1 text-left flex-1 text-xs md:text-sm">
                          <span className="font-black uppercase tracking-widest text-[9px] block text-emerald-500">
                            Correct Key Answer
                          </span>
                          <p className="font-black leading-relaxed">
                            {q.answer || q.correctAnswer || 'Answer Key Missing'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Explanation block */}
                {hasAnswered && (q.explanation || q.answer) && (
                  <div className={`mt-4 rounded-2xl border p-4 text-xs ${
                    theme === 'dark' ? 'bg-zinc-950/60 border-zinc-800 text-zinc-400' : 'bg-zinc-50 border-zinc-200 text-zinc-650'
                  }`}>
                    <p className="font-bold uppercase text-[9px] tracking-widest text-zinc-400 mb-1 flex items-center gap-1">
                      <Info size={11} />
                      Concept Explanation
                    </p>
                    <p className="leading-relaxed font-semibold">
                      {q.explanation || `The correct answer is confirmed as: ${q.answer || q.correctAnswer}. Review this concept for reinforcement.`}
                    </p>
                  </div>
                )}

              </motion.div>
            );
          })}

          {filteredQuestions.length === 0 && (
            <div className="py-24 text-center space-y-3">
              <p className="text-zinc-500 font-bold text-sm">No questions matched your active filters or search queries.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default PracticeCloud;
