import React, { useState } from 'react';
import logoImg from '../assets/logo.png';
import { Lock, ShieldCheck, User, ArrowRight, Sparkles } from 'lucide-react';
import { getAuthCredentials } from '../services/db';

export default function LoginModal({ onLoginSuccess }) {
  const [role, setRole] = useState('admin'); // 'admin' or 'user'
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    const creds = getAuthCredentials();

    if (role === 'admin') {
      if (password === creds.adminPass) {
        onLoginSuccess({ role: 'admin' });
      } else {
        setErrorMsg('Invalid Admin Password.');
      }
    } else {
      if (password === creds.userPass) {
        onLoginSuccess({ role: 'user' });
      } else {
        setErrorMsg('Invalid User Password.');
      }
    }
  };

  const handleQuickDemoLogin = (targetRole) => {
    const creds = getAuthCredentials();
    setRole(targetRole);
    setPassword(targetRole === 'admin' ? creds.adminPass : creds.userPass);
    onLoginSuccess({ role: targetRole });
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#08090d] flex items-center justify-center p-4">
      {/* Red Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-600/10 rounded-full blur-[140px] pointer-events-none"></div>

      <div className="glass-panel max-w-md w-full p-8 rounded-3xl border border-red-900/30 space-y-6 shadow-2xl relative overflow-hidden bg-[#10121a]/90 backdrop-blur-2xl">
        {/* IMS Red Top Accent Ribbon */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-red-700 via-red-500 to-rose-600"></div>

        {/* Logo & Brand Header */}
        <div className="text-center space-y-3 pt-2">
          <div className="relative inline-block">
            <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-rose-600 rounded-2xl blur-md opacity-50"></div>
            <img 
              src={logoImg} 
              alt="IMS Group Logo" 
              className="relative h-16 w-auto mx-auto rounded-2xl object-contain bg-white p-2 border border-red-500/40 shadow-2xl"
            />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold font-heading tracking-tight">
              <span className="ims-red-gradient-text">IMS GROUP</span>
            </h2>
            <p className="text-[11px] font-bold text-slate-400 tracking-widest uppercase mt-0.5">
              Integrated Marketing Service Ltd.
            </p>
            <p className="text-xs text-red-400 font-semibold mt-1">PETTY CASH SYSTEM</p>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-500/15 border border-rose-500/40 text-rose-400 text-xs rounded-xl text-center font-semibold">
            {errorMsg}
          </div>
        )}

        {/* Role Toggle Tabs */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950/90 rounded-2xl border border-slate-800 w-full">
          <button
            type="button"
            onClick={() => { setRole('admin'); setErrorMsg(''); }}
            className={`py-2.5 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all w-full ${
              role === 'admin' 
                ? 'bg-red-600 text-white shadow-lg shadow-red-950' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>ADMIN ROLE</span>
          </button>

          <button
            type="button"
            onClick={() => { setRole('user'); setErrorMsg(''); }}
            className={`py-2.5 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all w-full ${
              role === 'user' 
                ? 'bg-red-600 text-white shadow-lg shadow-red-950' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-4 h-4" />
            <span>STAFF ROLE</span>
          </button>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4 w-full">
          <div className="w-full space-y-1.5">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              Enter {role === 'admin' ? 'Administrator' : 'Staff'} Password
            </label>
            <div className="relative w-full">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 z-10" />
              <input 
                type="password"
                required
                placeholder="Enter access password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-control w-full pl-10 py-3 text-sm font-mono block rounded-xl"
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-red w-full py-3 text-sm font-bold shadow-xl flex items-center justify-center gap-2 rounded-xl"
          >
            <span>Sign In to System</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Sign In Helpers */}
        <div className="pt-4 border-t border-slate-800/80 text-center space-y-2.5 w-full">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-center gap-1">
            <Sparkles className="w-3 h-3 text-red-400" />
            Quick Demo Sign-In
          </p>
          <div className="grid grid-cols-2 gap-2 w-full">
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('admin')}
              className="btn btn-secondary text-xs py-2 border-red-500/30 text-red-400 hover:bg-red-500/10 w-full rounded-xl"
            >
              Admin (admin123)
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('user')}
              className="btn btn-secondary text-xs py-2 border-red-500/30 text-red-400 hover:bg-red-500/10 w-full rounded-xl"
            >
              Staff (user123)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
