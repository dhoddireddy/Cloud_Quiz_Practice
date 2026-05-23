import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  ChevronRight, 
  ArrowLeft, 
  CheckCircle2, 
  BookOpen, 
  Layers, 
  Search, 
  Database, 
  Download, 
  Info 
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';

// --- DATA STRUCTURES ---

interface DumpQuestion {
  id: number | string;
  section: string;
  question: string;
  options: string[];
  answer: string;
  correctAnswer?: string;
  explanation?: string;
}

// --- STATIC JSON DUMP IMPORT ---
import dumpCloudFSD from '../previous_year_dumps_json/Cloud FSD Questions.json';

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

const CloudFsd: React.FC = () => {
  const { theme } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);
  
  // Active Deck filters
  const [deckSection, setDeckSection] = useState<string>('All');
  const [deckSearchQuery, setDeckSearchQuery] = useState<string>('');

  const handleBack = () => {
    setIsOpen(false);
    setDeckSection('All');
    setDeckSearchQuery('');
  };

  const questions: DumpQuestion[] = useMemo(() => {
    return (dumpCloudFSD as any[]).map(q => {
      const hasOptions = q.options && q.options.length > 0;
      const ansStr = String(q.answer || q.correctAnswer || '').trim();
      const hasAnswer = ansStr !== '' && ansStr.toLowerCase() !== 'n/a';
      if (!hasOptions || !hasAnswer) {
        return {
          ...q,
          options: ["No answer refer to main PDF"],
          answer: "No answer refer to main PDF"
        };
      }
      return q;
    });
  }, []);

  const deckSections = useMemo(() => {
    const sectionsSet = new Set<string>();
    questions.forEach(q => {
      if (q.section) {
        sectionsSet.add(q.section.trim());
      }
    });
    return ['All', ...Array.from(sectionsSet)];
  }, [questions]);

  const filteredQuestions = useMemo(() => {
    return questions.filter(q => {
      const matchesSection = deckSection === 'All' || (q.section && q.section.trim() === deckSection);
      const qText = q.question || '';
      const matchesSearch = qText.toLowerCase().includes(deckSearchQuery.toLowerCase()) ||
                            (q.options && q.options.some(opt => opt.toLowerCase().includes(deckSearchQuery.toLowerCase()))) ||
                            (q.answer && q.answer.toLowerCase().includes(deckSearchQuery.toLowerCase()));
      return matchesSection && matchesSearch;
    });
  }, [questions, deckSection, deckSearchQuery]);

  const escapeHtml = (value: string) =>
    value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');

  const handleDownloadPdf = () => {
    const confirmed = confirm('Download "Questions" study guide in PDF format?');
    if (!confirmed) return;

    const printable = window.open('', '_blank', 'width=900,height=700');
    if (!printable) {
      alert('Please allow popups to download the study guide as PDF.');
      return;
    }

    const questionsHtml = questions.map((question, index) => {
      const parsedIdx = parseCorrectAnswer(question.options || [], question.answer || question.correctAnswer || '');
      const hasOptions = question.options && question.options.length > 0;

      return `
        <section class="question">
          <h2>${index + 1}. ${escapeHtml(question.question)}</h2>
          ${hasOptions ? `
            <ol type="A">
              ${question.options.map((option, optionIndex) => `
                <li class="${optionIndex === parsedIdx ? 'correct' : ''}">
                  ${escapeHtml(option)}
                  ${optionIndex === parsedIdx ? '<strong>Correct Answer</strong>' : ''}
                </li>
              `).join('')}
            </ol>
          ` : `
            <div class="direct-answer">
              <strong>Answer:</strong> ${escapeHtml(question.answer || question.correctAnswer || 'N/A')}
            </div>
          `}
          ${question.explanation ? `<p class="explanation"><em>Explanation:</em> ${escapeHtml(question.explanation)}</p>` : ''}
        </section>
      `;
    }).join('');

    printable.document.write(`
      <!doctype html>
      <html>
        <head>
          <title>Cloud FSD Questions Study Guide</title>
          <style>
            body { font-family: Arial, sans-serif; color: #111827; margin: 10mm; line-height: 1.3; font-size: 11px; }
            header { border-bottom: 2px solid #f59e0b; margin-bottom: 12px; padding-bottom: 8px; position: relative; z-index: 1; }
            h1 { margin: 0; font-size: 18px; }
            .meta { color: #4b5563; font-size: 10px; font-weight: 700; margin-top: 2px; text-transform: uppercase; letter-spacing: 0.05em; }
            .questions-container { column-count: 2; column-gap: 15px; }
            .question { break-inside: avoid; border: 1px solid #e5e7eb; border-radius: 6px; padding: 10px; margin-bottom: 10px; position: relative; z-index: 1; background: white; }
            h2 { font-size: 12px; margin: 0 0 6px; }
            ol { margin: 0; padding-left: 18px; }
            li { margin: 2px 0; padding: 2px 4px; }
            .correct { background: #ecfdf5; border-left: 3px solid #10b981; font-weight: 700; }
            .correct strong { color: #047857; font-size: 9px; margin-left: 4px; text-transform: uppercase; }
            .direct-answer { background: #f3f4f6; border-left: 3px solid #6b7280; padding: 6px; border-radius: 4px; margin-top: 4px; font-weight: 600; }
            .explanation { margin-top: 6px; color: #4b5563; font-size: 10px; }
            .watermark {
              position: fixed;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%) rotate(-45deg);
              font-size: 60px;
              font-weight: 900;
              color: rgba(0, 0, 0, 0.02);
              white-space: nowrap;
              pointer-events: none;
              z-index: 0;
              text-transform: uppercase;
              letter-spacing: 0.1em;
            }
            @media print { 
              body { margin: 10mm; } 
              .question { break-inside: avoid; } 
              .watermark { display: block; }
            }
          </style>
        </head>
        <body>
          <div class="watermark">Built for Students</div>
          <header>
            <h1>Cloud FSD Questions Study Guide</h1>
            <div class="meta">Cloud FSD • ${questions.length} Questions • Study Guide Mode</div>
          </header>
          <div class="questions-container">
            ${questionsHtml}
          </div>
          <script>
            window.onload = () => {
              window.focus();
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    printable.document.close();
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="w-full max-w-7xl space-y-8 px-4 py-8"
    >
      {!isOpen ? (
        <div className="space-y-12">
          {/* Header */}
          <div className="text-center space-y-3 mb-4 pt-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <BookOpen size={12} />
              <span>Auto-Revealed Study Guide</span>
            </div>
            <h2 className={`text-3xl font-sans font-black tracking-tight ${theme === 'dark' ? 'text-amber-50' : 'text-zinc-900'}`}>
              Cloud FSD Questions
            </h2>
            <p className={`${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'} text-xs font-semibold max-w-xl mx-auto leading-relaxed`}>
              Study FSD and Cloud questions with answers immediately highlighted for maximum revision efficiency.
            </p>
          </div>

          {/* Grid with Single Card "questions" */}
          <div className="flex justify-center">
            <motion.div 
              onClick={() => setIsOpen(true)}
              whileHover={{ y: -6, scale: 1.02 }}
              className={`p-8 cursor-pointer transition-all border-2 rounded-[32px] group relative flex flex-col justify-between min-h-[240px] w-full max-w-md ${
                theme === 'dark' 
                  ? 'bg-zinc-900/40 border-zinc-800 hover:border-amber-500/30 shadow-2xl shadow-amber-500/5' 
                  : 'bg-white border-zinc-100 hover:border-zinc-200 shadow-xl shadow-zinc-200/20'
              }`}
            >
              <div>
                <div className="flex justify-between items-start mb-6">
                  <span className={`inline-block px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest ${
                    theme === 'dark' ? 'bg-zinc-950 text-zinc-500' : 'bg-zinc-50 text-zinc-500'
                  }`}>
                    Fullstack
                  </span>
                  <div className={`p-2 rounded-xl ${
                    theme === 'dark' ? 'bg-zinc-950 text-amber-500' : 'bg-zinc-50 text-zinc-650'
                  }`}>
                    <Database size={16} />
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className={`text-xl font-heading font-black leading-tight uppercase tracking-tight group-hover:text-amber-500 transition-colors ${
                    theme === 'dark' ? 'text-amber-50' : 'text-zinc-900'
                  }`}>
                    Questions
                  </h3>
                  <p className={`text-xs font-semibold leading-relaxed ${theme === 'dark' ? 'text-zinc-550' : 'text-zinc-400'}`}>
                    Access the complete list of Cloud and Fullstack Development study questions.
                  </p>
                </div>
              </div>

              <div className="pt-6 flex items-center justify-between border-t border-zinc-100/50 dark:border-zinc-800/50 mt-6 mt-auto">
                <div className="flex flex-col gap-0.5 text-[9px] font-black uppercase tracking-widest text-zinc-450 dark:text-zinc-400">
                  <span>{questions.length} Modules</span>
                  <span>Interactive Guide</span>
                </div>
                <div className={`p-2.5 rounded-xl transition-all group-hover:translate-x-1 ${
                  theme === 'dark' ? 'bg-zinc-800 text-amber-500' : 'bg-zinc-50 text-zinc-900'
                }`}>
                  <ChevronRight size={16} />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      ) : (
        /* Detailed Questions Study view */
        <div className="relative mx-auto w-full max-w-3xl pb-32">
          
          {/* Floating Back Action */}
          <button 
            onClick={handleBack}
            className={`fixed left-4 top-24 z-40 h-12 px-4 border rounded-2xl transition-all shadow-lg flex items-center gap-2 group ${
              theme === 'dark' ? 'bg-zinc-900 border-amber-500/30 text-amber-500 hover:text-amber-400 hover:border-amber-500' : 'bg-white border-zinc-200 text-zinc-500 hover:text-zinc-900 hover:border-zinc-900'
            }`}
            aria-label="Back"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs font-black uppercase tracking-widest">Back</span>
          </button>

          {/* Floating Action Details Aside Card */}
          <aside className={`hidden lg:block fixed right-4 top-24 z-40 w-60 overflow-hidden rounded-2xl border shadow-xl backdrop-blur-xl ${
            theme === 'dark' ? 'bg-zinc-900/95 border-amber-500/20 text-amber-50' : 'bg-white border-zinc-300 text-zinc-950'
          }`}>
            <div className="border-t-4 border-amber-500 bg-zinc-950 p-4 text-white">
              <p className="text-[10px] font-black uppercase tracking-widest text-amber-400">Study Set</p>
              <h3 className="mt-1 text-sm font-black leading-snug">Questions</h3>
              <span className="mt-3 inline-flex rounded-full bg-amber-500 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-zinc-950">
                Fullstack
              </span>
            </div>
            <div className="space-y-4 p-4">
              <div className="rounded-xl border-2 border-amber-500/40 bg-zinc-950/60 p-3 text-amber-50 shadow-sm">
                <p className="text-[9px] font-black uppercase tracking-widest text-amber-400">Total Questions</p>
                <p className="mt-1 text-xl font-black">{questions.length}</p>
              </div>

              <button
                onClick={handleDownloadPdf}
                className="w-full py-3 rounded-xl border-2 border-emerald-500/40 bg-emerald-950/20 text-emerald-400 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all hover:bg-emerald-950/40 hover:border-emerald-500"
              >
                <Download size={14} />
                Download PDF
              </button>
              
              <button 
                onClick={handleBack}
                className={`w-full py-3 rounded-xl border-2 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                  theme === 'dark' ? 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-amber-500 hover:border-amber-500/50' : 'border-zinc-100 bg-zinc-50 text-zinc-500 hover:text-zinc-900 hover:border-zinc-200'
                }`}
              >
                <ArrowLeft size={14} />
                Back to Decks
              </button>
            </div>
          </aside>

          {/* Filtering & searching inside active dump */}
          <div className="mx-auto w-full max-w-2xl mb-8 space-y-4">
            <h2 className={`text-2xl font-sans font-black leading-tight ${theme === 'dark' ? 'text-amber-50' : 'text-zinc-900'}`}>
              Questions
            </h2>
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
              {/* Search Inside Deck */}
              <div className="relative w-full group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-amber-500 transition-colors">
                  <Search size={14} />
                </div>
                <input
                  type="text"
                  placeholder="Search questions..."
                  value={deckSearchQuery}
                  onChange={(e) => setDeckSearchQuery(e.target.value)}
                  className={`w-full h-10 pl-9 pr-3 rounded-xl border-2 transition-all outline-none text-xs font-bold ${
                    theme === 'dark'
                      ? 'bg-zinc-900 border-zinc-800 text-white focus:border-amber-500/40'
                      : 'bg-white border-zinc-150 text-zinc-900 focus:border-zinc-900'
                  }`}
                />
              </div>

              {/* Mobile Download Action */}
              <button
                onClick={handleDownloadPdf}
                className="w-full sm:w-auto px-4 h-10 flex items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-450 text-white text-[10px] font-black uppercase tracking-widest transition-all shadow-md lg:hidden"
              >
                <Download size={14} />
                <span>PDF Guide</span>
              </button>
            </div>

            {/* Sections Horizontal Scroll */}
            {deckSections.length > 2 && (
              <div className="flex gap-1.5 overflow-x-auto pb-2 custom-scrollbar">
                {deckSections.map((sec) => (
                  <button
                    key={sec}
                    onClick={() => setDeckSection(sec)}
                    className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider border-2 transition-all shrink-0 cursor-pointer ${
                      deckSection === sec
                        ? 'bg-amber-500 text-zinc-950 border-amber-500 font-black shadow-sm'
                        : theme === 'dark' 
                          ? 'bg-zinc-950 border-zinc-850 text-zinc-400 hover:border-amber-500/30' 
                          : 'bg-zinc-55 border-zinc-150 text-zinc-650 hover:bg-zinc-100'
                    }`}
                  >
                    {sec}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Render List of Questions */}
          <div className="mx-auto w-full space-y-6">
            {filteredQuestions.map((q, i) => {
              const correctOptIdx = parseCorrectAnswer(q.options || [], q.answer || q.correctAnswer || '');
              const hasOptions = q.options && q.options.length > 0;

              return (
                <motion.div 
                  key={q.id || i} 
                  className="glass-card p-6 space-y-6 border-2 border-transparent hover:border-zinc-100 dark:hover:border-zinc-800 transition-all"
                  whileHover={{ y: -2 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.03, 0.5) }}
                >
                  {/* Card Header Tags */}
                  <div className="flex justify-between items-center pb-2 border-b border-zinc-100/50 dark:border-zinc-800/50">
                    <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-zinc-900 dark:bg-amber-500 text-white dark:text-zinc-950 flex items-center justify-center text-xs font-black">
                      {i + 1}
                    </span>
                    {q.section && (
                      <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                        theme === 'dark' ? 'bg-amber-500/10 text-amber-400' : 'bg-amber-50 text-amber-700'
                      }`}>
                        {q.section}
                      </span>
                    )}
                  </div>

                  {/* Question Text */}
                  <h4 className={`text-sm md:text-base font-bold font-sans leading-relaxed whitespace-pre-line ${theme === 'dark' ? 'text-amber-50' : 'text-zinc-850'}`}>
                    {q.question}
                  </h4>

                  {/* Options rendering */}
                  {hasOptions ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-0 md:pl-4">
                      {q.options.map((option, optIdx) => {
                        const isCorrect = optIdx === correctOptIdx;
                        
                        return (
                          <div 
                            key={optIdx}
                            className={`p-3 rounded-xl border-2 text-xs md:text-sm font-medium flex items-center gap-3 transition-all ${
                              isCorrect 
                                ? theme === 'dark' ? 'border-emerald-500/50 bg-emerald-950/20 text-emerald-300 font-bold' : 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold' 
                                : theme === 'dark' ? 'border-zinc-700/60 bg-zinc-900/80 text-zinc-300' : 'border-zinc-200 bg-white text-zinc-700'
                            }`}
                          >
                            <span className={`flex-shrink-0 w-5 h-5 rounded-md ${theme === 'dark' ? 'bg-zinc-950' : 'bg-zinc-55'} border border-current flex items-center justify-center text-[10px] font-black uppercase`}>
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <span className="flex-1 leading-relaxed">{option}</span>
                            {isCorrect && (
                              <CheckCircle2 size={16} className="text-emerald-500 stroke-[2.5]" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    /* Open ended answers display (Direct Answer Card) */
                    <div className={`p-4 rounded-2xl border-2 flex items-start gap-3 pl-0 md:pl-4 ${
                      theme === 'dark' ? 'border-emerald-500/20 bg-emerald-950/10 text-emerald-300' : 'border-emerald-100 bg-emerald-50/50 text-emerald-900'
                    }`}>
                      <div className="p-1 rounded bg-emerald-500 text-white shrink-0 mt-0.5">
                        <CheckCircle2 size={12} />
                      </div>
                      <div className="space-y-1 text-left flex-1 text-xs md:text-sm">
                        <span className="font-black uppercase tracking-widest text-[9px] block text-emerald-500">
                          Direct Key Answer
                        </span>
                        <p className="font-black leading-relaxed">
                          {q.answer || q.correctAnswer || 'Answer Key Missing'}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Explanation (if provided in dump) */}
                  {q.explanation && (
                    <div className={`rounded-xl border p-4 text-xs ${
                      theme === 'dark' ? 'bg-zinc-950/60 border-zinc-800 text-zinc-400' : 'bg-zinc-50 border-zinc-200 text-zinc-650'
                    }`}>
                      <p className="font-bold uppercase text-[9px] tracking-widest text-zinc-400 mb-1">Concept Explanation</p>
                      <p className="leading-relaxed font-semibold">{q.explanation}</p>
                    </div>
                  )}
                </motion.div>
              );
            })}

            {filteredQuestions.length === 0 && (
              <div className="py-16 text-center">
                <p className="text-zinc-500 font-bold text-sm">No questions matched your active filters or search queries.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default CloudFsd;
