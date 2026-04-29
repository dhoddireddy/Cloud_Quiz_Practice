import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { AppProvider, useAppContext } from './context/AppContext';
import Home from './pages/Home';
import Learning from './pages/Learning';
import Practice from './pages/Practice';
import Assessment from './pages/Assessment';
import Questions2025 from './pages/Questions2025';

import MainLayout from './layouts/MainLayout';

const AppContent: React.FC = () => {
  const [showSplash, setShowSplash] = React.useState(false);
  const location = useLocation();

  React.useEffect(() => {
    const hasSeenSplash = sessionStorage.getItem('pta_seen_splash');
    if (!hasSeenSplash) {
      setShowSplash(true);
      sessionStorage.setItem('pta_seen_splash', 'true');
    }
  }, []);

  return (
    <MainLayout>
      <AnimatePresence mode="wait">
        <motion.div 
          key={location.pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="w-full h-full flex flex-col items-center"
        >
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/learning" element={<Learning />} />
            <Route path="/practice" element={<Practice />} />
            <Route path="/assessment" element={<Assessment />} />
            <Route path="/questions-2025" element={<Questions2025 />} />
          </Routes>
        </motion.div>
      </AnimatePresence>

      {/* Splash/Intro Quote Card */}
      <AnimatePresence>
        {showSplash && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-zinc-950/40 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white dark:bg-zinc-900 p-8 md:p-12 rounded-[48px] border border-zinc-100 dark:border-zinc-800 shadow-2xl max-w-lg w-full text-center space-y-8"
            >
              <div className="mx-auto w-16 h-16 bg-amber-500 rounded-2xl flex items-center justify-center text-zinc-950 shadow-lg mb-6">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
              </div>
              
              <div className="space-y-4">
                <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500">Daily Inspiration</h2>
                <p className="text-2xl md:text-3xl font-heading font-black tracking-tight leading-tight dark:text-amber-50">
                  "Arise, awake, and stop not until the goal is reached."
                </p>
                <div className="h-0.5 w-12 bg-zinc-100 dark:bg-zinc-800 mx-auto" />
                <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">
                  — Swami Vivekananda
                </p>
              </div>

              <button
                onClick={() => setShowSplash(false)}
                className="w-full py-4 rounded-2xl bg-zinc-900 dark:bg-amber-500 text-white dark:text-zinc-950 text-[10px] font-black uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-95 transition-all shadow-xl"
              >
                Enter Workspace
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </MainLayout>
  );
};

export default function App() {
  return (
    <AppProvider>
      <Router>
        <AppContent />
      </Router>
    </AppProvider>
  );
}
