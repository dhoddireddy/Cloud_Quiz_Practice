import React from 'react';

export interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswer: number;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  category: string;
  questions: Question[];
}

export interface UserStats {
  highScore: number;
  quizzesCompleted: number;
  categoryPerformance: Record<string, { correct: number; total: number }>;
  totalPoints: number;
  streak: number;
  lastActiveDate: string | null;
}

export interface AppContextType {
  theme: 'light' | 'dark';
  setTheme: React.Dispatch<React.SetStateAction<'light' | 'dark'>>;
  userStats: UserStats;
  setUserStats: React.Dispatch<React.SetStateAction<UserStats>>;
  resetStats: () => void;
  isImmersive: boolean;
  setIsImmersive: React.Dispatch<React.SetStateAction<boolean>>;
  quizzes: Quiz[];
}
