import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Lock, User, Zap, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const Login: React.FC = () => {
  const { theme, setAuth } = useAppContext();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (data.success) {
        // Success - set local state
        setAuth(true);
        localStorage.setItem('pta_team_auth', 'true');
      } else {
        setError(data.message || 'Invalid credentials');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 md:p-6 relative overflow-hidden">
      {/* Background Atmosphere */}
      <div className={`absolute inset-0 transition-opacity duration-1000 ${
        theme === 'dark' ? 'bg-zinc-950' : 'bg-white'
      }`} />
      
      <div className={`absolute top-0 right-0 w-[500px] h-[500px] blur-[150px] rounded-full opacity-20 ${
        theme === 'dark' ? 'bg-amber-500' : 'bg-amber-200'
      }`} />

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`relative z-10 w-full max-w-md p-8 md:p-12 rounded-[48px] border shadow-2xl ${
          theme === 'dark' ? 'bg-zinc-900/50 border-amber-500/10' : 'bg-white border-zinc-100'
        }`}
      >
        <div className="flex flex-col items-center text-center space-y-8">
          <div className="p-4 bg-zinc-900 dark:bg-amber-500 text-white dark:text-zinc-950 rounded-[28px] shadow-xl group hover:scale-110 transition-transform">
            <Zap size={32} />
          </div>

          <div className="space-y-2">
            <h1 className={`text-3xl font-heading font-black tracking-tighter uppercase ${
              theme === 'dark' ? 'text-amber-50' : 'text-zinc-900'
            }`}>
              Team Access
            </h1>
            <p className="text-zinc-500 text-sm font-medium">
              Enter your credentials to access the academic bank.
            </p>
          </div>

          <form onSubmit={handleLogin} className="w-full space-y-4">
            <div className="space-y-4">
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-amber-500 transition-colors">
                  <User size={18} />
                </div>
                <input 
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={`w-full pl-12 pr-4 py-4 rounded-2xl border bg-transparent text-sm font-bold transition-all focus:outline-none focus:ring-2 focus:ring-amber-500/20 ${
                    theme === 'dark' 
                      ? 'border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:border-amber-500/50' 
                      : 'border-zinc-100 text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-300'
                  }`}
                  required
                />
              </div>

              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-amber-500 transition-colors">
                  <Lock size={18} />
                </div>
                <input 
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full pl-12 pr-4 py-4 rounded-2xl border bg-transparent text-sm font-bold transition-all focus:outline-none focus:ring-2 focus:ring-amber-500/20 ${
                    theme === 'dark' 
                      ? 'border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:border-amber-500/50' 
                      : 'border-zinc-100 text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-300'
                  }`}
                  required
                />
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[10px] font-black uppercase tracking-widest"
              >
                <AlertCircle size={14} />
                {error}
              </motion.div>
            )}

            <button 
              type="submit"
              disabled={isLoading}
              className={`w-full py-4 rounded-2xl flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest transition-all ${
                isLoading 
                  ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' 
                  : 'bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-amber-500 dark:text-zinc-950 dark:hover:bg-amber-400'
              }`}
            >
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : 'Authorize Access'}
              {!isLoading && <ArrowRight size={18} />}
            </button>
          </form>

          <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest opacity-50">
            Internal Academic Dashboard v2.0
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
