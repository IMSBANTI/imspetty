import React, { useState, useEffect } from 'react';
import logoImg from '../assets/logo.png';
import { LogOut, ShieldCheck, User, Clock, Sun, Moon } from 'lucide-react';

export default function Header({ currentUser, onLogout, theme, onToggleTheme }) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="bg-white/95 dark:bg-[#0f1118]/95 border-b border-rose-100 dark:border-rose-900/30 px-6 py-3 sticky top-0 z-30 shadow-md dark:shadow-2xl backdrop-blur-xl transition-colors duration-200">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Official IMS Logo & Brand */}
        <div className="flex items-center gap-4">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-rose-700 rounded-xl blur opacity-30 group-hover:opacity-70 transition duration-300"></div>
            <img 
              src={logoImg} 
              alt="IMS Group Logo" 
              className="relative h-12 w-auto object-contain bg-white rounded-xl p-1.5 border border-red-500/30 shadow-lg"
            />
          </div>
          <div>
            <h1 className="text-xl font-extrabold font-heading tracking-tight flex items-center gap-2">
              <span className="ims-red-gradient-text">IMS GROUP</span>
              <span className="text-slate-400 font-light">|</span>
              <span className="text-slate-800 dark:text-slate-200 font-bold">PETTY CASH SYSTEM</span>
            </h1>
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Integrated Marketing Service Ltd.
            </p>
          </div>
        </div>

        {/* User Info & Header Actions - Perfectly Aligned H-10 Buttons */}
        <div className="flex items-center gap-3">
          {/* Day / Dark Mode Toggle Button */}
          <button
            onClick={onToggleTheme}
            className="h-10 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:border-red-500/50 hover:text-red-600 dark:hover:text-red-400 transition-all flex items-center justify-center gap-2 text-xs font-bold shadow-sm"
            title={`Switch to ${theme === 'dark' ? 'Day Mode (Light)' : 'Dark Mode'}`}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400 flex-shrink-0" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700 flex-shrink-0" />
            )}
            <span className="whitespace-nowrap">{theme === 'dark' ? 'Day Mode' : 'Dark Mode'}</span>
          </button>

          {/* Live Date/Time */}
          <div className="hidden lg:flex items-center h-10 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-900 text-slate-600 dark:text-slate-400 text-xs font-mono shadow-sm">
            <Clock className="w-4 h-4 text-rose-500 flex-shrink-0 mr-2" />
            <span className="whitespace-nowrap">
              {currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} | {currentTime.toLocaleTimeString()}
            </span>
          </div>

          {/* User Role Badge Pill */}
          <div className="flex items-center h-10 px-4 rounded-xl border border-rose-200 dark:border-rose-900/40 bg-slate-100/80 dark:bg-slate-900 gap-2.5 shadow-sm">
            {currentUser?.role === 'admin' ? (
              <ShieldCheck className="w-4 h-4 text-rose-500 flex-shrink-0" />
            ) : (
              <User className="w-4 h-4 text-rose-400 flex-shrink-0" />
            )}
            <div className="flex items-center gap-2 text-xs">
              <span className="font-bold text-slate-800 dark:text-slate-100 capitalize whitespace-nowrap">
                {currentUser?.role === 'admin' ? 'Administrator' : 'Staff User'}
              </span>
              <span className="badge badge-red font-bold text-[11px] py-0.5 px-2">
                {currentUser?.role === 'admin' ? 'ADMIN' : 'STAFF'}
              </span>
            </div>
          </div>

          {/* Logout Button */}
          <button 
            onClick={onLogout}
            className="h-10 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:border-red-500/50 hover:text-red-600 dark:hover:text-red-400 transition-all flex items-center justify-center gap-2 text-xs font-bold shadow-sm"
            title="Log Out"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            <span className="whitespace-nowrap">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
