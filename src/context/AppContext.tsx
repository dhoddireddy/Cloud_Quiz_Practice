import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import devOpsData from '../data/DevOps_MCQs.json';
import htmlCssData from '../data/HTML_CSS_mcqs.json';
import javaData from '../data/Java_MCQs.json';
import jsNodeData from '../data/JavaScript_NodeJS_MCQs.json';
import mongoData from '../data/MongoDB_MCQs.json';
import springData from '../data/Spring_Core_Spring_Boot_MCQs.json';
import tsData from '../data/TypeScript_MCQs.json';
import { Quiz, UserStats, AppContextType } from '../types';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isImmersive, setIsImmersive] = useState(false);
  const [isAuth, setAuth] = useState(false);
  const [userStats, setUserStats] = useState<UserStats>({
    highScore: 0,
    quizzesCompleted: 0,
    categoryPerformance: {},
    totalPoints: 0,
    streak: 0,
    lastActiveDate: null
  });

  // Load from localStorage
  useEffect(() => {
    const savedAuth = localStorage.getItem('pta_team_auth');
    if (savedAuth === 'true') {
      setAuth(true);
    }
    const saved = localStorage.getItem('quizwise_user_stats');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const today = new Date().toISOString().split('T')[0];
        let newStreak = parsed.streak || 0;
        let lastDateString = parsed.lastActiveDate || null;

        if (lastDateString !== today) {
          const lastDate = lastDateString ? new Date(lastDateString) : null;
          const currentDate = new Date(today);
          
          if (!lastDate) {
            newStreak = 1;
          } else {
            const diffTime = Math.abs(currentDate.getTime() - lastDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays === 1) {
              // Streak continues - will be incremented fully when they complete a quiz or just login? 
              // Usually streak increments on LOGIN if it's a "Daily login streak"
              newStreak += 1;
            } else if (diffDays > 1) {
              newStreak = 1;
            }
          }
          lastDateString = today;
        }

        setUserStats({
          ...parsed,
          streak: newStreak,
          lastActiveDate: lastDateString
        });
      } catch (e) {
        console.error("Failed to load stats", e);
      }
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('quizwise_user_stats', JSON.stringify(userStats));
  }, [userStats]);

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

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
          correctAnswer: foundIdx !== -1 ? foundIdx : 0
        };
      })
    })) as Quiz[];
  }, []);

  // Activity Tracking for 30min timeout
  useEffect(() => {
    if (!isAuth) return;

    const timeoutDuration = 30 * 60 * 1000; // 30 minutes
    
    const checkTimeout = () => {
      const lastActivity = localStorage.getItem('pta_last_activity');
      if (lastActivity) {
        const diff = Date.now() - parseInt(lastActivity, 10);
        if (diff > timeoutDuration) {
          setAuth(false);
          localStorage.removeItem('pta_team_auth');
          localStorage.removeItem('pta_last_activity');
        }
      }
    };

    const updateActivity = () => {
      localStorage.setItem('pta_last_activity', Date.now().toString());
    };

    // Initialize activity on mount/auth
    updateActivity();

    // Event listeners for activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => window.addEventListener(event, updateActivity));

    // Check timeout every minute
    const interval = setInterval(checkTimeout, 60000);

    return () => {
      events.forEach(event => window.removeEventListener(event, updateActivity));
      clearInterval(interval);
    };
  }, [isAuth]);

  return (
    <AppContext.Provider value={{ 
      theme, setTheme, userStats, setUserStats, resetStats, isImmersive, setIsImmersive, quizzes, isAuth, setAuth 
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
