import React, { useState } from 'react';
import { KeyRound, ShieldAlert, CheckCircle2, Lock } from 'lucide-react';
import { getAuthCredentials, saveAuthCredentials } from '../services/db';

export default function PasswordManager({ currentUser }) {
  const [adminForm, setAdminForm] = useState({
    currentPass: '',
    newPass: '',
    confirmPass: ''
  });

  const [userForm, setUserForm] = useState({
    newPass: '',
    confirmPass: ''
  });

  const [msg, setMsg] = useState({ type: '', text: '' });

  const handleAdminPasswordChange = (e) => {
    e.preventDefault();
    const creds = getAuthCredentials();

    if (adminForm.currentPass !== creds.adminPass) {
      setMsg({ type: 'error', text: 'Current Admin Password is incorrect.' });
      return;
    }

    if (adminForm.newPass.length < 4) {
      setMsg({ type: 'error', text: 'New password must be at least 4 characters long.' });
      return;
    }

    if (adminForm.newPass !== adminForm.confirmPass) {
      setMsg({ type: 'error', text: 'New Admin Passwords do not match.' });
      return;
    }

    saveAuthCredentials({
      ...creds,
      adminPass: adminForm.newPass
    });

    setMsg({ type: 'success', text: 'Admin Password changed successfully!' });
    setAdminForm({ currentPass: '', newPass: '', confirmPass: '' });
  };

  const handleUserPasswordChange = (e) => {
    e.preventDefault();
    const creds = getAuthCredentials();

    if (userForm.newPass.length < 4) {
      setMsg({ type: 'error', text: 'New password must be at least 4 characters long.' });
      return;
    }

    if (userForm.newPass !== userForm.confirmPass) {
      setMsg({ type: 'error', text: 'New User Passwords do not match.' });
      return;
    }

    saveAuthCredentials({
      ...creds,
      userPass: userForm.newPass
    });

    setMsg({ type: 'success', text: 'Staff User Password changed successfully!' });
    setUserForm({ newPass: '', confirmPass: '' });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="glass-panel p-6 rounded-3xl border border-red-950/40">
        <h2 className="text-xl font-bold font-heading text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <KeyRound className="w-5 h-5 text-red-500" />
          Password Management Center
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Change Admin password and Staff User password.</p>
      </div>

      {msg.text && (
        <div className={`p-4 rounded-2xl flex items-center gap-3 ${
          msg.type === 'error' 
            ? 'bg-rose-500/15 border border-rose-500/40 text-rose-600 dark:text-rose-400' 
            : 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-600 dark:text-emerald-400'
        }`}>
          {msg.type === 'error' ? <ShieldAlert className="w-5 h-5 flex-shrink-0" /> : <CheckCircle2 className="w-5 h-5 flex-shrink-0" />}
          <span className="text-sm font-semibold">{msg.text}</span>
        </div>
      )}

      {/* Card Grid with Equal Height Flex items */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        {/* Change Admin Password */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between h-full space-y-4">
          <div className="space-y-4">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-lg font-bold font-heading text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-500" />
                Change Admin Password
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Updates password for Admin user role.</p>
            </div>

            <form id="admin-pass-form" onSubmit={handleAdminPasswordChange} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Current Admin Password</label>
                <input 
                  type="password"
                  required
                  placeholder="Enter current admin password"
                  value={adminForm.currentPass}
                  onChange={(e) => setAdminForm({ ...adminForm, currentPass: e.target.value })}
                  className="form-control"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">New Admin Password</label>
                <input 
                  type="password"
                  required
                  placeholder="Enter new admin password"
                  value={adminForm.newPass}
                  onChange={(e) => setAdminForm({ ...adminForm, newPass: e.target.value })}
                  className="form-control"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Confirm New Password</label>
                <input 
                  type="password"
                  required
                  placeholder="Confirm new admin password"
                  value={adminForm.confirmPass}
                  onChange={(e) => setAdminForm({ ...adminForm, confirmPass: e.target.value })}
                  className="form-control"
                />
              </div>
            </form>
          </div>

          <div className="pt-4">
            <button 
              type="submit" 
              form="admin-pass-form"
              className="btn btn-red w-full text-xs font-bold py-3 rounded-xl shadow-lg"
            >
              Update Admin Password
            </button>
          </div>
        </div>

        {/* Change User Password */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between h-full space-y-4">
          <div className="space-y-4">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-lg font-bold font-heading text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Lock className="w-4 h-4 text-blue-500" />
                Change Staff User Password
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Updates password for Staff User role.</p>
            </div>

            <form id="user-pass-form" onSubmit={handleUserPasswordChange} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">New Staff User Password</label>
                <input 
                  type="password"
                  required
                  placeholder="Enter new staff user password"
                  value={userForm.newPass}
                  onChange={(e) => setUserForm({ ...userForm, newPass: e.target.value })}
                  className="form-control"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Confirm New Password</label>
                <input 
                  type="password"
                  required
                  placeholder="Confirm new staff user password"
                  value={userForm.confirmPass}
                  onChange={(e) => setUserForm({ ...userForm, confirmPass: e.target.value })}
                  className="form-control"
                />
              </div>
            </form>
          </div>

          <div className="pt-4">
            <button 
              type="submit" 
              form="user-pass-form"
              className="btn btn-red w-full text-xs font-bold py-3 rounded-xl shadow-lg"
            >
              Update User Password
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
