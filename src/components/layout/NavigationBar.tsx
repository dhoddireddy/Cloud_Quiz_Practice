import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Home, BookOpen, Send, Clock, Zap, Sun, Moon, Menu, X, Target, UserCircle, Download, GraduationCap, FileText } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';

export const NavigationBar = () => {
  const { theme, setTheme, quizzes, activeDownloadQuizId } = useAppContext();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isStrategyOpen, setIsStrategyOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const location = useLocation();

  const toggleStrategy = () => {
    setIsStrategyOpen(prev => !prev);
    setIsProfileOpen(false);
  };

  const toggleProfile = () => {
    setIsProfileOpen(prev => !prev);
    setIsStrategyOpen(false);
  };

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/learning', label: 'Learning', icon: BookOpen },
    { path: '/practice', label: 'Practice', icon: Send },
    { path: '/assessment', label: 'Assessment', icon: Clock },
    { path: '/test', label: 'Test', icon: Target },
    { path: '/questions-2025', label: '2025 Questions', icon: Zap },
  ];

  const activeDownloadQuiz = quizzes.find(quiz => quiz.id === activeDownloadQuizId) || null;

  const escapeHtml = (value: string) =>
    value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');

  const handleDownloadPdf = () => {
    if (!activeDownloadQuiz) {
      alert('Open a topic first, then use Download to save that topic as PDF.');
      return;
    }

    const confirmed = confirm(`Download ${activeDownloadQuiz.title} content in PDF format?`);
    if (!confirmed) return;

    const printable = window.open('', '_blank', 'width=900,height=700');
    if (!printable) {
      alert('Please allow popups to download the topic as PDF.');
      return;
    }

    const questionsHtml = activeDownloadQuiz.questions.map((question, index) => `
      <section class="question">
        <h2>${index + 1}. ${escapeHtml(question.text)}</h2>
        <ol type="A">
          ${question.options.map((option, optionIndex) => `
            <li class="${optionIndex === question.correctAnswer ? 'correct' : ''}">
              ${escapeHtml(option)}
              ${optionIndex === question.correctAnswer ? '<strong>Correct Answer</strong>' : ''}
            </li>
          `).join('')}
        </ol>
      </section>
    `).join('');

    printable.document.write(`
      <!doctype html>
      <html>
        <head>
          <title>${escapeHtml(activeDownloadQuiz.title)} MCQs</title>
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
            <h1>${escapeHtml(activeDownloadQuiz.title)} MCQs</h1>
            <div class="meta">${escapeHtml(activeDownloadQuiz.category)} • ${activeDownloadQuiz.questions.length} Questions • Built by Reddy</div>
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
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-zinc-900/90 backdrop-blur-md border-b border-zinc-200 dark:border-amber-500/20 px-4">
      <div className="max-w-7xl mx-auto h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link 
          to="/"
          className="flex items-center gap-2 cursor-pointer group"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div className="p-1.5 bg-zinc-900 dark:bg-amber-500 text-white dark:text-zinc-950 rounded-lg group-hover:scale-110 transition-transform">
            <Zap size={16} />
          </div>
          <span className="font-heading font-black text-sm tracking-tight hidden sm:block dark:text-amber-500 uppercase">Practice to Achieve</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1 bg-zinc-100/50 dark:bg-zinc-800/50 p-1 rounded-xl">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                location.pathname === item.path 
                  ? 'bg-white dark:bg-amber-500 text-zinc-900 dark:text-zinc-950 shadow-sm' 
                  : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-amber-400'
              }`}
            >
              <item.icon size={14} />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="relative hidden md:flex items-center gap-2">
          {location.pathname === '/learning' && (
            <button
              onClick={handleDownloadPdf}
              className={`flex h-10 items-center gap-2 rounded-xl border px-3 text-xs font-black transition-all ${
                activeDownloadQuiz
                  ? theme === 'dark' ? 'bg-zinc-900 text-emerald-400 border-emerald-500/20 hover:border-emerald-500/50' : 'bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50'
                  : theme === 'dark' ? 'bg-zinc-900/60 text-zinc-400 border-zinc-800 cursor-not-allowed' : 'bg-zinc-50 text-zinc-400 border-zinc-200 cursor-not-allowed'
              }`}
              title={activeDownloadQuiz ? `Download ${activeDownloadQuiz.title} as PDF` : 'Open a topic to download'}
            >
              <Download size={16} />
              <span>Download</span>
            </button>
          )}
          <button
            onClick={toggleStrategy}
            className={`flex h-10 items-center gap-2 rounded-xl border px-3 text-xs font-black transition-all ${
              isStrategyOpen
                ? 'bg-amber-500 text-zinc-950 border-amber-500 shadow-sm'
                : theme === 'dark' ? 'bg-zinc-900 text-amber-400 border-amber-500/20 hover:border-amber-500/50' : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50'
            }`}
            title="Strategy"
          >
            <Target size={16} />
            <span>Strategy</span>
          </button>
          <button
            onClick={toggleProfile}
            className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-all ${
              isProfileOpen
                ? 'bg-zinc-900 text-white border-zinc-900 dark:bg-amber-500 dark:text-zinc-950 dark:border-amber-500'
                : theme === 'dark' ? 'bg-zinc-900 text-amber-500 border-amber-500/20 hover:border-amber-500/50' : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50'
            }`}
            title="Profile"
          >
            <UserCircle size={19} />
          </button>
          <button
            onClick={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
            className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all ${
              theme === 'dark' ? 'bg-zinc-900 text-amber-500 border border-amber-500/20' : 'bg-white text-zinc-500 border border-zinc-200 hover:bg-zinc-50'
            }`}
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <AnimatePresence>
            {isStrategyOpen && (
              <>
                <div 
                  className="fixed inset-0 z-50 bg-transparent" 
                  onClick={() => setIsStrategyOpen(false)} 
                />
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.98 }}
                  className={`absolute right-0 top-12 w-[450px] rounded-2xl border p-6 shadow-2xl z-[60] ${
                    theme === 'dark' ? 'bg-zinc-900 border-amber-500/20 text-amber-50' : 'bg-white border-zinc-200 text-zinc-900'
                  }`}
                >
                  <div className="flex items-center justify-between border-b border-zinc-100 pb-4 dark:border-zinc-800">
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl bg-amber-500 p-2 text-zinc-950 shadow-lg shadow-amber-500/20">
                        <Target size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-black">2025 Success Strategy</p>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-300">Mastery Roadmap</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setIsStrategyOpen(false)}
                      className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-colors text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <div className="mt-6 space-y-4">
                    {[
                      { step: '01', title: 'Deep Learning Mode', body: 'Start in the Learning tab. Read each question carefully and understand the logic behind the correct answer.' },
                      { step: '02', title: 'Active Practice', body: 'Move to Practice mode. Solve questions without assistance to test your memory and conceptual clarity.' },
                      { step: '03', title: 'Target Weakness', body: 'Focus on your missed questions. Analyze why you failed and review those concepts in the learning section.' },
                      { step: '04', title: 'Exam Simulation', body: 'Take the timed Assessment once you hit 90% accuracy in practice. This prepares you for the real exam pressure.' },
                      { step: '05', title: 'Offline Revision', body: 'Download the Topic PDF from the Learning page. Use it for final revision and quick concept recalls offline.' },
                    ].map((item) => (
                      <div key={item.step} className="flex gap-4 group">
                        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-xs font-black text-amber-500 border border-zinc-200 dark:border-zinc-800 group-hover:border-amber-500/50 transition-colors">
                          {item.step}
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-black uppercase tracking-tight text-zinc-900 dark:text-amber-400">{item.title}</p>
                          <p className="text-[11px] font-semibold leading-relaxed text-zinc-500 dark:text-zinc-300">{item.body}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-50/50 p-4 text-[11px] font-bold text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400 flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Goal: 100% conceptual clarity before final exam day.
                  </div>
                </motion.div>
              </>
            )}

            {isProfileOpen && (
              <>
                <div 
                  className="fixed inset-0 z-50 bg-transparent" 
                  onClick={() => setIsProfileOpen(false)} 
                />
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.98 }}
                  className={`absolute right-0 top-12 w-80 overflow-hidden rounded-2xl border shadow-2xl z-[60] ${
                    theme === 'dark' ? 'bg-zinc-900 border-amber-500/20 text-amber-50' : 'bg-white border-zinc-200 text-zinc-900'
                  }`}
                >
                  <div className="bg-zinc-950 p-5 text-white flex items-start justify-between">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-amber-300">Builder Profile</p>
                      <h3 className="mt-1 text-lg font-black">Reddy</h3>
                    </div>
                    <button 
                      onClick={() => setIsProfileOpen(false)}
                      className="p-1.5 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400 hover:text-white"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <div className="space-y-4 p-5 text-xs font-semibold text-zinc-600 dark:text-zinc-300">
                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-zinc-900 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-50">
                      <p className="text-[9px] font-black uppercase tracking-widest text-amber-700 dark:text-amber-300">Project</p>
                      <p className="mt-1 font-black">Cloud Quiz Practice</p>
                    </div>
                    <p className="leading-relaxed">This learning and quiz platform was built by Reddy for students to learn, practice, revise, and assess technical MCQs.</p>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Mobile Header Controls */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={toggleProfile}
            className={`flex items-center justify-center w-9 h-9 rounded-xl transition-all ${
              theme === 'dark' ? 'bg-zinc-900 text-amber-500' : 'bg-zinc-100 text-zinc-500'
            }`}
            title="Profile"
          >
            <UserCircle size={17} />
          </button>
          <button
            onClick={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
            className={`flex items-center justify-center w-9 h-9 rounded-xl transition-all ${
              theme === 'dark' ? 'bg-zinc-900 text-amber-500' : 'bg-zinc-100 text-zinc-500'
            }`}
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`flex items-center justify-center w-9 h-9 rounded-xl transition-all ${
              theme === 'dark' ? 'bg-amber-500 text-zinc-950' : 'bg-zinc-900 text-white'
            }`}
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`md:hidden overflow-hidden border-t ${
              theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-100'
            }`}
          >
            <div className="p-4 space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-4 p-4 rounded-2xl text-sm font-bold transition-all ${
                    location.pathname === item.path 
                      ? 'bg-amber-500 text-zinc-950' 
                      : theme === 'dark' ? 'text-zinc-300 hover:bg-zinc-900' : 'text-zinc-600 hover:bg-zinc-50'
                  }`}
                >
                  <item.icon size={18} />
                  {item.label}
                </Link>
              ))}
              {location.pathname === '/learning' && (
                <button
                  onClick={() => {
                    handleDownloadPdf();
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex w-full items-center gap-4 p-4 rounded-2xl text-sm font-bold transition-all ${
                    activeDownloadQuiz
                      ? theme === 'dark' ? 'text-emerald-400 hover:bg-zinc-900' : 'text-emerald-700 hover:bg-emerald-50'
                      : theme === 'dark' ? 'text-zinc-500' : 'text-zinc-400'
                  }`}
                >
                  <Download size={18} />
                  Download PDF
                </button>
              )}
              <button
                onClick={() => {
                  setIsStrategyOpen(true);
                  setIsProfileOpen(false);
                  setIsMobileMenuOpen(false);
                }}
                className={`flex w-full items-center gap-4 p-4 rounded-2xl text-sm font-bold transition-all ${
                  theme === 'dark' ? 'text-zinc-300 hover:bg-zinc-900' : 'text-zinc-600 hover:bg-zinc-50'
                }`}
              >
                <Target size={18} />
                Strategy
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isStrategyOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            className={`md:hidden fixed inset-4 z-[70] overflow-y-auto rounded-3xl border p-6 shadow-2xl flex flex-col ${
              theme === 'dark' ? 'bg-zinc-900 border-amber-500/20 text-amber-50' : 'bg-white border-zinc-200 text-zinc-900'
            }`}
          >
            <div className="flex items-center justify-between border-b border-zinc-100 pb-4 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-amber-500 p-2 text-zinc-950 shadow-lg shadow-amber-500/20">
                  <Target size={18} />
                </div>
                <div>
                  <p className="text-sm font-black">2025 Success Strategy</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-300">Mastery Roadmap</p>
                </div>
              </div>
              <button 
                onClick={() => setIsStrategyOpen(false)}
                className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl transition-colors text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-zinc-100 dark:border-zinc-800"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-8 space-y-6 flex-1">
              {[
                { step: '01', title: 'Deep Learning Mode', body: 'Start in the Learning tab. Read each question carefully and understand the logic behind the correct answer.' },
                { step: '02', title: 'Active Practice', body: 'Move to Practice mode. Solve questions without assistance to test your memory and conceptual clarity.' },
                { step: '03', title: 'Target Weakness', body: 'Focus on your missed questions. Analyze why you failed and review those concepts in the learning section.' },
                { step: '04', title: 'Exam Simulation', body: 'Take the timed Assessment once you hit 90% accuracy in practice. This prepares you for the real exam pressure.' },
                { step: '05', title: 'Offline Revision', body: 'Download the Topic PDF from the Learning page. Use it for final revision and quick concept recalls offline.' },
              ].map((item) => (
                <div key={item.step} className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-sm font-black text-amber-500 border border-zinc-200 dark:border-zinc-800">
                    {item.step}
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-black uppercase tracking-tight text-zinc-900 dark:text-amber-400">{item.title}</p>
                    <p className="text-xs font-semibold leading-relaxed text-zinc-500 dark:text-zinc-300">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-2xl border border-emerald-500/20 bg-emerald-50/50 p-5 text-xs font-bold text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400 flex items-center gap-4">
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
              Goal: 100% conceptual clarity before final exam day.
            </div>
          </motion.div>
        )}

        {isProfileOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            className={`md:hidden fixed inset-4 z-[70] overflow-y-auto rounded-3xl border shadow-2xl flex flex-col ${
              theme === 'dark' ? 'bg-zinc-950 border-amber-500/20 text-amber-50' : 'bg-white border-zinc-200 text-zinc-900'
            }`}
          >
            <div className="flex items-start justify-between bg-zinc-950 p-6 text-white rounded-t-3xl">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-amber-300">Builder Profile</p>
                <h3 className="mt-1 text-xl font-black">Reddy</h3>
              </div>
              <button 
                onClick={() => setIsProfileOpen(false)} 
                className="p-2 hover:bg-zinc-800 rounded-xl transition-colors text-zinc-400 hover:text-white border border-zinc-800"
              >
                <X size={18} />
              </button>
            </div>
            <div className="space-y-5 p-6 text-sm font-semibold text-zinc-600 dark:text-zinc-300 flex-1">
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-zinc-900 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-50">
                <p className="text-[9px] font-black uppercase tracking-widest text-amber-700 dark:text-amber-300">Project</p>
                <p className="mt-1 font-black text-base">Cloud Quiz Practice</p>
              </div>
              <p className="leading-relaxed">This learning and quiz platform was built by Reddy for students to learn, practice, revise, and assess technical MCQs.</p>
            </div>
            <div className="p-6 border-t border-zinc-100 dark:border-zinc-800">
               <button 
                onClick={() => setIsProfileOpen(false)}
                className="w-full py-4 bg-zinc-900 dark:bg-amber-500 text-white dark:text-zinc-950 rounded-2xl font-black uppercase tracking-widest text-xs"
               >
                Close Profile
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute bottom-0 left-0 right-0 h-[2px] overflow-hidden">
        <div className="absolute inset-[-1000%] animate-spin-slow bg-[conic-gradient(from_0deg,transparent_25%,#fbbf24_50%,transparent_75%,#fbbf24_100%)] opacity-100" />
      </div>
    </header>
  );
};
