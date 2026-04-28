import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Zap, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';

const MoreDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, setAuth } = useAppContext();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    setAuth(false);
    localStorage.removeItem('pta_team_auth');
    localStorage.removeItem('pta_last_activity');
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div 
      className="relative hidden lg:block" 
      ref={dropdownRef}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
          isOpen
            ? 'bg-white dark:bg-amber-500 text-zinc-900 dark:text-zinc-950 shadow-sm' 
            : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-500 dark:hover:text-amber-400'
        }`}
      >
        <span>More</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown size={14} />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className={`absolute top-full right-0 mt-2 w-48 rounded-xl border p-1 shadow-2xl backdrop-blur-xl z-50 ${
              theme === 'dark' 
                ? 'bg-zinc-900/90 border-amber-500/20' 
                : 'bg-white/90 border-zinc-200'
            }`}
          >
            <Link
              to="/questions-2025"
              onClick={() => setIsOpen(false)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-bold transition-all hover:translate-x-1 ${
                theme === 'dark' 
                  ? 'text-zinc-400 hover:bg-zinc-800 hover:text-amber-400' 
                  : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-950'
              }`}
            >
              <div className={`p-1.5 rounded-md ${theme === 'dark' ? 'bg-amber-500/10' : 'bg-zinc-100'}`}>
                <Zap size={14} className={theme === 'dark' ? 'text-amber-500' : 'text-zinc-600'} />
              </div>
              <span>2025 Questions</span>
            </Link>

            <button
              onClick={handleLogout}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-bold transition-all hover:translate-x-1 border-t mt-1 pt-2 ${
                theme === 'dark' 
                  ? 'text-rose-400 border-zinc-800 hover:bg-rose-500/10' 
                  : 'text-rose-500 border-zinc-100 hover:bg-rose-50'
              }`}
            >
              <div className={`p-1.5 rounded-md ${theme === 'dark' ? 'bg-rose-500/10' : 'bg-rose-50'}`}>
                <LogOut size={14} className="text-rose-500" />
              </div>
              <span>Sign Out Team</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MoreDropdown;
