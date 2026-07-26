import React from 'react';
import { 
  LayoutDashboard, 
  Landmark,
  FilePlus, 
  Receipt, 
  CalendarRange, 
  FileSpreadsheet, 
  Cloud,
  Settings, 
  KeyRound 
} from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, isAdmin }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'cashIn', label: 'Cash In', icon: Landmark },
    { id: 'addVoucher', label: 'Enter Voucher', icon: FilePlus },
    { id: 'records', label: 'Vouchers', icon: Receipt },
    { id: 'analytics', label: 'Analytics', icon: CalendarRange },
    { id: 'reports', label: 'Reports', icon: FileSpreadsheet },
    { id: 'cloud', label: 'Cloud Sync', icon: Cloud },
  ];

  if (isAdmin) {
    navItems.push({ id: 'admin', label: 'Admin', icon: Settings });
  }

  navItems.push({ id: 'passwords', label: 'Passwords', icon: KeyRound });

  return (
    <nav className="bg-white/95 dark:bg-[#0b0c10]/95 px-4 sm:px-6 py-2 sticky top-[69px] z-20 backdrop-blur-md transition-colors duration-200 border-none shadow-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-1 overflow-x-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-red-500/10 dark:bg-red-600/20 text-red-600 dark:text-red-400 border border-red-500/40 shadow-sm font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900/60'
              }`}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-red-600 dark:text-red-500' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
