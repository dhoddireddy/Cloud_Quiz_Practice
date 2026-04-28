import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { AppProvider, useAppContext } from './context/AppContext';
import Home from './pages/Home';
import Learning from './pages/Learning';
import Practice from './pages/Practice';
import Assessment from './pages/Assessment';
import Questions2025 from './pages/Questions2025';
import Login from './pages/Login';

import MainLayout from './layouts/MainLayout';

const AppContent: React.FC = () => {
  const { isAuth } = useAppContext();
  const location = useLocation();

  if (!isAuth) {
    return <Login />;
  }

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
