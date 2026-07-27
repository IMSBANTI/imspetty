import React from 'react';
import { Wallet, FileText, PlusCircle, ArrowUpRight, CheckCircle2, PieChart, Landmark, ArrowDownLeft, Eye, Clock } from 'lucide-react';

export default function Dashboard({ vouchers, cashAdvances, onNavigateAdd, onNavigateCashIn }) {
  const totalReceived = cashAdvances.reduce((acc, a) => acc + (parseFloat(a.amount) || 0), 0);
  const totalExpenditure = vouchers.reduce((acc, v) => acc + (parseFloat(v.amount) || 0), 0);
  const remainingBalance = totalReceived - totalExpenditure;

  // Group by project
  const projectTotals = {};
  vouchers.forEach(v => {
    const proj = v.project || 'IMS Head Office';
    projectTotals[proj] = (projectTotals[proj] || 0) + (parseFloat(v.amount) || 0);
  });

  // Group by category
  const categoryTotals = {};
  vouchers.forEach(v => {
    const cat = v.category || 'Office Others';
    categoryTotals[cat] = (categoryTotals[cat] || 0) + (parseFloat(v.amount) || 0);
  });

  // Find top spending category
  let topCategory = 'N/A';
  let topCatAmount = 0;
  Object.entries(categoryTotals).forEach(([cat, amt]) => {
    if (amt > topCatAmount) {
      topCatAmount = amt;
      topCategory = cat;
    }
  });

  // Get recent 5 vouchers sorted newest first
  const recentVouchers = [...vouchers].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 6);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Executive Hero Banner */}
      <div className="glass-panel p-8 rounded-3xl border border-slate-200 dark:border-slate-800 relative overflow-hidden flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 shadow-2xl bg-gradient-to-r from-[#14161e] via-[#1a1c27] to-[#0f1118]">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-red-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="space-y-2 relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>IMS Petty Cash & Accounts Fund Control Active</span>
          </div>
          <h2 className="text-3xl font-extrabold font-heading text-slate-100 tracking-tight leading-tight">
            Financial Dashboard & Cash Ledger Overview
          </h2>
          <p className="text-sm text-slate-400">
            Real-time tracking of Cash Advances received from Accounts, voucher payments, and current balance in hand.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-3">
          <button
            onClick={onNavigateCashIn}
            className="btn btn-secondary py-3 px-4 rounded-xl text-xs font-bold border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10"
          >
            <Landmark className="w-4 h-4" />
            <span>Receive Cash Advance</span>
          </button>
          <button
            onClick={onNavigateAdd}
            className="btn btn-red py-3 px-5 rounded-xl shadow-lg flex items-center gap-2 text-sm font-bold transition-all hover:scale-[1.02]"
          >
            <PlusCircle className="w-5 h-5" />
            <span>Enter Voucher</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Balance in Hand */}
        <div className={`glass-panel p-6 rounded-3xl border flex items-center justify-between relative overflow-hidden group transition-all shadow-lg ${
          remainingBalance < 0 ? 'border-rose-500/50 bg-rose-500/10' : 'border-slate-200 dark:border-slate-800'
        }`}>
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Cash Balance in Hand</p>
            <h3 className={`text-2xl font-extrabold font-mono ${remainingBalance < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-800 dark:text-slate-100'}`}>
              ৳{remainingBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium">
              <Wallet className="w-3.5 h-3.5 text-red-500" /> Fund in Petty Cash Box
            </p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
            <Wallet className="w-7 h-7" />
          </div>
        </div>

        {/* Card 2: Cash Advances Received */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 flex items-center justify-between relative overflow-hidden group hover:border-emerald-500/40 transition-all shadow-lg">
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Cash From Accounts</p>
            <h3 className="text-2xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
              ৳{totalReceived.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </h3>
            <p className="text-xs text-emerald-600/80 dark:text-emerald-400/80 flex items-center gap-1 font-medium">
              <ArrowDownLeft className="w-3.5 h-3.5" /> {cashAdvances.length} Advances received
            </p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
            <Landmark className="w-7 h-7" />
          </div>
        </div>

        {/* Card 3: Total Spent */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 flex items-center justify-between relative overflow-hidden group hover:border-red-500/40 transition-all shadow-lg">
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Spent (Vouchers)</p>
            <h3 className="text-2xl font-extrabold font-mono text-red-600 dark:text-red-400">
              ৳{totalExpenditure.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{vouchers.length} Vouchers paid out</p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
            <FileText className="w-7 h-7" />
          </div>
        </div>

        {/* Card 4: Top Category */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 flex items-center justify-between relative overflow-hidden group hover:border-red-500/40 transition-all shadow-lg">
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Top Spending Area</p>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 truncate max-w-[130px]" title={topCategory}>{topCategory}</h3>
            <p className="text-xs text-red-600 dark:text-red-400 font-mono font-bold">
              ৳{topCatAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
            <PieChart className="w-7 h-7" />
          </div>
        </div>
      </div>

      {/* Main Grid: Recent Vouchers Activity & Topsheet */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Vouchers Activity Table (2 Cols) */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <h3 className="text-lg font-bold font-heading text-slate-800 dark:text-slate-100 flex items-center gap-2.5">
              <Clock className="w-5 h-5 text-red-500" />
              Recent Vouchers Activity
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Total {vouchers.length} Recorded
            </span>
          </div>

          <div className="table-container border border-slate-200 dark:border-slate-800 rounded-2xl overflow-x-auto">
            <table className="custom-table text-xs w-full">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-semibold text-[11px] uppercase tracking-wider">
                  <th className="px-3.5 py-3 whitespace-nowrap">Voucher No</th>
                  <th className="px-3.5 py-3 whitespace-nowrap">Date</th>
                  <th className="px-3.5 py-3 whitespace-nowrap">Category</th>
                  <th className="px-3.5 py-3">Description</th>
                  <th className="px-3.5 py-3 text-right whitespace-nowrap">Amount (TK)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {recentVouchers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-8 text-slate-400">
                      No vouchers recorded yet.
                    </td>
                  </tr>
                ) : (
                  recentVouchers.map((v) => (
                    <tr key={v.id} className="hover:bg-slate-500/5 transition-colors">
                      <td className="px-3.5 py-3 font-mono font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                        {v.id}
                      </td>
                      <td className="px-3.5 py-3 font-mono text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {v.date}
                      </td>
                      <td className="px-3.5 py-3 whitespace-nowrap">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/30 whitespace-nowrap">
                          {v.category}
                        </span>
                      </td>
                      <td className="px-3.5 py-3 text-slate-600 dark:text-slate-400 max-w-xs truncate" title={v.description}>
                        {v.description}
                      </td>
                      <td className="px-3.5 py-3 text-right font-mono font-bold text-red-600 dark:text-red-400 whitespace-nowrap">
                        ৳{Number(v.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Category Breakdown Progress Bars (1 Col) */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-lg">
          <h3 className="text-lg font-bold font-heading text-slate-800 dark:text-slate-100 flex items-center gap-2.5">
            <PieChart className="w-5 h-5 text-red-500" />
            Category Breakdown
          </h3>

          <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
            {Object.keys(categoryTotals).length === 0 ? (
              <p className="text-center text-xs text-slate-400 py-6">No category data recorded yet.</p>
            ) : (
              Object.entries(categoryTotals)
                .sort((a, b) => b[1] - a[1])
                .map(([cat, amt]) => {
                  const pct = totalExpenditure > 0 ? ((amt / totalExpenditure) * 100).toFixed(1) : 0;
                  return (
                    <div key={cat} className="p-3 bg-slate-100 dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-800 dark:text-slate-200">{cat}</span>
                        <span className="font-mono text-red-600 dark:text-red-400 font-bold">
                          ৳{amt.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-rose-600 to-red-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, pct)}%` }}
                        ></div>
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 text-right font-mono">{pct}% of total</div>
                    </div>
                  );
                })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
