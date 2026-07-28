import React, { useState } from 'react';
import { Landmark, ArrowDownLeft, ArrowUpRight, Plus, Trash2, Wallet, FileText, CheckCircle2 } from 'lucide-react';

export default function CashAdvanceManager({ cashAdvances, vouchers, onSaveAdvance, onDeleteAdvance, isAdmin }) {
  const [formData, setFormData] = useState({
    id: `ADV-${Math.floor(10000 + Math.random() * 90000)}`,
    date: new Date().toISOString().substring(0, 10),
    receivedFrom: 'Accounts Department',
    paymentMethod: 'Bank Transfer',
    description: '',
    approvedBy: 'Head of Accounts',
    amount: ''
  });

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  // Total cash received from Accounts
  const totalReceived = cashAdvances.reduce((sum, a) => sum + (parseFloat(a.amount) || 0), 0);

  // Total cash spent via vouchers
  const totalSpent = vouchers.reduce((sum, v) => sum + (parseFloat(v.amount) || 0), 0);

  // Current balance in hand
  const remainingBalance = totalReceived - totalSpent;

  // Build combined Cash Book Ledger
  const combinedLedger = [
    ...cashAdvances.map(a => ({
      id: a.id,
      date: a.date,
      type: 'INCOME',
      description: a.description || 'Cash advance received from Accounts',
      person: a.receivedFrom || 'Accounts',
      inAmount: parseFloat(a.amount) || 0,
      outAmount: 0,
      timestamp: new Date(a.date).getTime()
    })),
    ...vouchers.map(v => ({
      id: v.id,
      date: v.date,
      type: 'EXPENSE',
      description: `${v.description} [${v.project}]`,
      person: v.requestedBy || 'Staff',
      inAmount: 0,
      outAmount: parseFloat(v.amount) || 0,
      timestamp: new Date(v.date).getTime()
    }))
  ];

  // Sort chronological for running balance computation
  combinedLedger.sort((a, b) => a.timestamp - b.timestamp);

  let running = 0;
  const ledgerWithBalance = combinedLedger.map(tx => {
    running += (tx.inAmount - tx.outAmount);
    return { ...tx, runningBalance: running };
  });

  // Reverse newest first for display table
  ledgerWithBalance.reverse();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      alert('Please enter a valid cash advance amount.');
      return;
    }

    setSaving(true);
    try {
      await onSaveAdvance({
        ...formData,
        amount: parseFloat(formData.amount)
      });

      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 4000);

      // Reset form
      setFormData({
        id: `ADV-${Math.floor(10000 + Math.random() * 90000)}`,
        date: new Date().toISOString().substring(0, 10),
        receivedFrom: 'Accounts Department',
        paymentMethod: 'Bank Transfer',
        description: '',
        approvedBy: 'Head of Accounts',
        amount: ''
      });
    } catch (err) {
      alert('Error saving cash advance: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* 3 Fund Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Total Received */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-lg">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Cash Received (Accounts)</p>
            <h3 className="text-2xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
              ৳{totalReceived.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5 flex items-center gap-1">
              <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-500" /> {cashAdvances.length} Advance Disbursements
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500">
            <Landmark className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Total Spent */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-lg">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Spent via Vouchers</p>
            <h3 className="text-2xl font-extrabold font-mono text-red-600 dark:text-red-400 mt-1">
              ৳{totalSpent.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5 flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5 text-red-500" /> {vouchers.length} Expense Vouchers
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Remaining Balance in Hand */}
        <div className={`glass-panel p-6 rounded-3xl border flex items-center justify-between shadow-lg ${
          remainingBalance < 0 
            ? 'border-rose-500/60 bg-rose-500/10' 
            : 'border-red-500/30 bg-red-500/5'
        }`}>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Petty Cash Balance in Hand</p>
            <h3 className={`text-2xl font-extrabold font-mono mt-1 ${
              remainingBalance < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-slate-100'
            }`}>
              ৳{remainingBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              {remainingBalance < 0 ? '⚠️ Deficit (Expenses exceed advances)' : 'Available Fund Balance'}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-500">
            <Wallet className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Cash Advance Entry Form */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-lg">
        <h3 className="text-lg font-bold font-heading text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Plus className="w-4 h-4 text-emerald-500" />
          Receive Cash Advance from Accounts
        </h3>

        {successMsg && (
          <div className="p-3.5 bg-emerald-500/15 border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 text-xs rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Cash advance recorded successfully! Running cash book balance has been updated.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Receipt / Ref # *</label>
            <input 
              type="text"
              required
              value={formData.id}
              onChange={(e) => setFormData({ ...formData, id: e.target.value })}
              className="form-control font-mono font-bold text-red-600 dark:text-red-400 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Date Received *</label>
            <input 
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="form-control text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Amount Received (TK) *</label>
            <input 
              type="number"
              step="0.01"
              required
              placeholder="e.g. 20000.00"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="form-control font-mono text-sm font-bold text-emerald-600 dark:text-emerald-400"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Received From</label>
            <input 
              type="text"
              value={formData.receivedFrom}
              onChange={(e) => setFormData({ ...formData, receivedFrom: e.target.value })}
              className="form-control text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Payment Method</label>
            <select
              value={formData.paymentMethod}
              onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
              className="form-control text-xs"
            >
              <option value="Cash">Cash</option>
              <option value="Cheque">Cheque</option>
              <option value="Bank Transfer">Bank Transfer</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Authorized / Approved By</label>
            <input 
              type="text"
              value={formData.approvedBy}
              onChange={(e) => setFormData({ ...formData, approvedBy: e.target.value })}
              className="form-control text-xs"
            />
          </div>

          <div className="sm:col-span-2 lg:col-span-3">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Description / Remarks</label>
            <input 
              type="text"
              placeholder="e.g. Cash advance received from accounts for December 2025 petty expenses..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="form-control text-xs"
            />
          </div>

          <div className="sm:col-span-2 lg:col-span-3 flex justify-end pt-2">
            <button type="submit" disabled={saving} className="btn btn-red px-6 text-xs">
              <Landmark className="w-4 h-4" />
              <span>{saving ? 'Saving Advance...' : 'Record Cash Advance Received'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Cash Book Ledger Statement Table */}
      <div className="glass-panel rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-lg space-y-4 p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold font-heading text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <FileText className="w-5 h-5 text-red-500" />
            Complete Cash Book Statement & Running Balance
          </h3>
          <span className="text-xs text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-900 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-800 font-semibold">
            {ledgerWithBalance.length} Statement Entries
          </span>
        </div>

        <div className="table-container border border-slate-200 dark:border-slate-800 rounded-2xl overflow-x-auto">
          <table className="custom-table text-xs w-full min-w-[900px]">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-semibold text-[11px] uppercase tracking-wider">
                <th className="px-3 py-3 whitespace-nowrap">Date</th>
                <th className="px-3 py-3 whitespace-nowrap">Ref / ID</th>
                <th className="px-3 py-3 whitespace-nowrap">Transaction Type</th>
                <th className="px-3.5 py-3">Particulars / Description</th>
                <th className="px-3 py-3 whitespace-nowrap">Person / Source</th>
                <th className="px-3.5 py-3 text-right whitespace-nowrap">Cash In (+)</th>
                <th className="px-3.5 py-3 text-right whitespace-nowrap">Cash Out (-)</th>
                <th className="px-3.5 py-3 text-right whitespace-nowrap bg-slate-200/80 dark:bg-slate-800/80 font-bold">Running Balance (TK)</th>
                {isAdmin && <th className="px-3 py-3 text-center whitespace-nowrap">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {ledgerWithBalance.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-8 text-slate-400">
                    No cash advances or vouchers recorded yet.
                  </td>
                </tr>
              ) : (
                ledgerWithBalance.map((tx) => (
                  <tr key={tx.id} className={tx.type === 'INCOME' ? 'bg-emerald-500/5 dark:bg-emerald-950/20' : 'hover:bg-slate-500/5'}>
                    <td className="px-3 py-3 font-mono text-slate-600 dark:text-slate-400 whitespace-nowrap">{tx.date}</td>
                    <td className="px-3 py-3 font-mono font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">{tx.id}</td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      {tx.type === 'INCOME' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 whitespace-nowrap">
                          <ArrowDownLeft className="w-3 h-3" /> ADVANCE IN
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/30 whitespace-nowrap">
                          <ArrowUpRight className="w-3 h-3" /> EXPENSE OUT
                        </span>
                      )}
                    </td>
                    <td className="px-3.5 py-3 text-slate-600 dark:text-slate-400 max-w-xs truncate" title={tx.description}>{tx.description}</td>
                    <td className="px-3 py-3 text-slate-700 dark:text-slate-300 whitespace-nowrap">{tx.person}</td>
                    <td className="px-3.5 py-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                      {tx.inAmount > 0 ? `+৳${tx.inAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '-'}
                    </td>
                    <td className="px-3.5 py-3 text-right font-mono font-bold text-red-600 dark:text-red-400 whitespace-nowrap">
                      {tx.outAmount > 0 ? `-৳${tx.outAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '-'}
                    </td>
                    <td className="px-3.5 py-3 text-right font-mono font-extrabold text-slate-900 dark:text-slate-100 bg-slate-100/70 dark:bg-slate-900/70 whitespace-nowrap">
                      ৳{tx.runningBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    {isAdmin && (
                      <td className="px-3 py-3 text-center whitespace-nowrap">
                        {tx.type === 'INCOME' && (
                          <button
                            onClick={() => {
                              if (confirm(`Delete cash advance ${tx.id}?`)) {
                                onDeleteAdvance(tx.id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10"
                            title="Delete Cash Advance"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
