import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Home, BookOpen, Send, Clock, Zap, Sun, Moon, LogOut, Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import MoreDropdown from './MoreDropdown';

export const NavigationBar = () => {
  const { theme, setTheme, isImmersive } = useAppContext();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  if (isImmersive) return null;

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/learning', label: 'Learning', icon: BookOpen },
    { path: '/practice', label: 'Practice', icon: Send },
    { path: '/assessment', label: 'Assessment', icon: Clock },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200 dark:border-amber-500/20 px-4">
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
        <nav className="hidden md:flex items-center gap-1 bg-zinc-100/50 dark:bg-zinc-900/50 p-1 rounded-xl">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                location.pathname === item.path 
                  ? 'bg-white dark:bg-amber-500 text-zinc-900 dark:text-zinc-950 shadow-sm' 
                  : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-500 dark:hover:text-amber-400'
              }`}
            >
              <item.icon size={14} />
              <span>{item.label}</span>
            </Link>
          ))}
          <div className="mx-1 h-4 w-px bg-zinc-200 dark:bg-zinc-800" />
          <MoreDropdown />
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
            className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all ${
              theme === 'dark' ? 'bg-zinc-900 text-amber-500 border border-amber-500/20' : 'bg-white text-zinc-500 border border-zinc-200 hover:bg-zinc-50'
            }`}
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>

        {/* Mobile Header Controls */}
        <div className="flex md:hidden items-center gap-2">
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
              theme === 'dark' ? 'bg-zinc-950 border-zinc-800' : 'bg-white border-zinc-100'
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
                      : theme === 'dark' ? 'text-zinc-400 hover:bg-zinc-900' : 'text-zinc-600 hover:bg-zinc-50'
                  }`}
                >
                  <item.icon size={18} />
                  {item.label}
                </Link>
              ))}
              
              <Link
                to="/questions-2025"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-4 p-4 rounded-2xl text-sm font-bold transition-all ${
                  location.pathname === '/questions-2025'
                    ? 'bg-amber-500 text-zinc-950'
                    : theme === 'dark' ? 'text-zinc-400 hover:bg-zinc-900' : 'text-zinc-600 hover:bg-zinc-50'
                }`}
              >
                <Zap size={18} />
                2025 Questions Bank
              </Link>
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
