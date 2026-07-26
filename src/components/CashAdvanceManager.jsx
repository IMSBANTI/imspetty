import React, { useState } from 'react';
import { Landmark, ArrowDownLeft, Wallet, Plus, Trash2, CheckCircle2, FileText, ArrowUpRight } from 'lucide-react';

export default function CashAdvanceManager({ cashAdvances, vouchers, onSaveAdvance, onDeleteAdvance, isAdmin }) {
  const [formData, setFormData] = useState({
    id: `ADV-${Date.now().toString().slice(-6)}`,
    date: new Date().toISOString().slice(0, 10),
    receivedFrom: 'Accounts Department',
    paymentMethod: 'Cash',
    description: 'Petty Cash Fund Advance Received from Accounts',
    approvedBy: 'Head of Accounts',
    amount: ''
  });

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  // Financial calculations
  const totalReceived = cashAdvances.reduce((sum, a) => sum + (parseFloat(a.amount) || 0), 0);
  const totalSpent = vouchers.reduce((sum, v) => sum + (parseFloat(v.amount) || 0), 0);
  const remainingBalance = totalReceived - totalSpent;

  // Build combined Chronological Cash Ledger
  const combinedTransactions = [
    ...cashAdvances.map(a => ({
      id: a.id,
      date: a.date,
      type: 'INCOME', // Cash received from accounts
      category: 'Accounts Cash Advance',
      description: `${a.description} (Ref: ${a.paymentMethod})`,
      person: a.receivedFrom,
      inAmount: parseFloat(a.amount) || 0,
      outAmount: 0,
      rawObj: a
    })),
    ...vouchers.map(v => ({
      id: v.id,
      date: v.date,
      type: 'EXPENSE', // Voucher payment
      category: v.category,
      description: `${v.description} [${v.project}]`,
      person: v.requestedBy,
      inAmount: 0,
      outAmount: parseFloat(v.amount) || 0,
      rawObj: v
    }))
  ];

  // Sort ascending by date for running balance calculation
  combinedTransactions.sort((a, b) => new Date(a.date) - new Date(b.date));

  let runningBal = 0;
  const ledgerWithBalance = combinedTransactions.map(tx => {
    runningBal += tx.inAmount - tx.outAmount;
    return { ...tx, runningBalance: runningBal };
  });

  // Reverse back for table display (newest first)
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

      // Reset form
      setFormData({
        id: `ADV-${Date.now().toString().slice(-6)}`,
        date: new Date().toISOString().slice(0, 10),
        receivedFrom: 'Accounts Department',
        paymentMethod: 'Cash',
        description: 'Petty Cash Fund Advance Received from Accounts',
        approvedBy: 'Head of Accounts',
        amount: ''
      });

      setTimeout(() => setSuccessMsg(false), 4000);
    } catch (err) {
      console.error(err);
      alert('Error saving cash advance.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Title & Summary */}
      <div className="glass-panel p-6 rounded-3xl border border-red-950/40">
        <h2 className="text-xl font-bold font-heading text-slate-100 flex items-center gap-2.5">
          <Landmark className="w-5 h-5 text-red-500" />
          Accounts Cash Advance & Fund Balance Manager
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Record cash advances disbursed from the Accounts Department and track real-time petty cash balance in hand.
        </p>
      </div>

      {/* KPI Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Total Received */}
        <div className="glass-panel p-6 rounded-2xl border border-emerald-900/30 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Received from Accounts</p>
            <h3 className="text-2xl font-extrabold font-mono text-emerald-400 mt-1">
              ৳{totalReceived.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </h3>
            <p className="text-[11px] text-emerald-400/80 font-medium mt-0.5 flex items-center gap-1">
              <ArrowDownLeft className="w-3.5 h-3.5" /> {cashAdvances.length} Cash Advances Recorded
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Landmark className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Total Spent */}
        <div className="glass-panel p-6 rounded-2xl border border-red-950/40 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Spent via Vouchers</p>
            <h3 className="text-2xl font-extrabold font-mono text-red-400 mt-1">
              ৳{totalSpent.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </h3>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5 flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5 text-red-400" /> {vouchers.length} Expense Vouchers
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Remaining Balance in Hand */}
        <div className={`glass-panel p-6 rounded-2xl border flex items-center justify-between ${
          remainingBalance < 0 
            ? 'border-rose-500/60 bg-rose-500/10' 
            : 'border-red-500/30 bg-red-500/5'
        }`}>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-300">Petty Cash Balance in Hand</p>
            <h3 className={`text-2xl font-extrabold font-mono mt-1 ${
              remainingBalance < 0 ? 'text-rose-400' : 'text-slate-100'
            }`}>
              ৳{remainingBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </h3>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">
              {remainingBalance < 0 ? '⚠️ Deficit (Expenses exceed advances)' : 'Available Fund Balance'}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400">
            <Wallet className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Cash Advance Entry Form */}
      <div className="glass-panel p-6 rounded-3xl border border-red-950/40 space-y-4">
        <h3 className="text-lg font-bold font-heading text-slate-100 flex items-center gap-2">
          <Plus className="w-4 h-4 text-emerald-400" />
          Receive Cash Advance from Accounts
        </h3>

        {successMsg && (
          <div className="p-3.5 bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-xs rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Cash advance recorded successfully! Running cash book balance has been updated.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Receipt / Ref # *</label>
            <input 
              type="text"
              required
              value={formData.id}
              onChange={(e) => setFormData({ ...formData, id: e.target.value })}
              className="form-control font-mono font-bold text-red-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Date Received *</label>
            <input 
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="form-control"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Amount Received (TK) *</label>
            <input 
              type="number"
              step="0.01"
              required
              placeholder="e.g. 20000.00"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="form-control font-mono text-base font-bold text-emerald-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Received From</label>
            <input 
              type="text"
              value={formData.receivedFrom}
              onChange={(e) => setFormData({ ...formData, receivedFrom: e.target.value })}
              className="form-control"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Payment Method</label>
            <select
              value={formData.paymentMethod}
              onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
              className="form-control"
            >
              <option value="Cash">Cash</option>
              <option value="Cheque">Cheque</option>
              <option value="Bank Transfer">Bank Transfer</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Authorized / Approved By</label>
            <input 
              type="text"
              value={formData.approvedBy}
              onChange={(e) => setFormData({ ...formData, approvedBy: e.target.value })}
              className="form-control"
            />
          </div>

          <div className="sm:col-span-2 lg:col-span-3">
            <label className="block text-xs font-semibold text-slate-300 mb-1">Description / Remarks</label>
            <input 
              type="text"
              placeholder="e.g. Cash advance received from accounts for December 2025 petty expenses..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="form-control"
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

      {/* Cash Book Ledger Statement */}
      <div className="glass-panel p-6 rounded-3xl border border-red-950/40 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold font-heading text-slate-100 flex items-center gap-2">
            <FileText className="w-5 h-5 text-red-400" />
            Complete Cash Book Statement & Running Balance
          </h3>
          <span className="text-xs text-slate-400 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
            {ledgerWithBalance.length} Statement Entries
          </span>
        </div>

        <div className="table-container border border-slate-800 rounded-2xl overflow-hidden">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Ref / ID</th>
                <th>Transaction Type</th>
                <th>Particulars / Description</th>
                <th>Person / Source</th>
                <th className="text-right">Cash In (+)</th>
                <th className="text-right">Cash Out (-)</th>
                <th className="text-right bg-slate-900">Running Balance (TK)</th>
                {isAdmin && <th className="text-center">Action</th>}
              </tr>
            </thead>
            <tbody>
              {ledgerWithBalance.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-8 text-slate-500">
                    No cash advances or vouchers recorded yet.
                  </td>
                </tr>
              ) : (
                ledgerWithBalance.map((tx) => (
                  <tr key={tx.id} className={tx.type === 'INCOME' ? 'bg-emerald-950/20' : ''}>
                    <td className="font-mono text-slate-300 whitespace-nowrap">{tx.date}</td>
                    <td className="font-mono font-bold text-slate-200">{tx.id}</td>
                    <td>
                      {tx.type === 'INCOME' ? (
                        <span className="badge badge-green font-bold flex items-center gap-1 w-fit">
                          <ArrowDownLeft className="w-3 h-3" /> ADVANCE IN
                        </span>
                      ) : (
                        <span className="badge badge-red font-bold flex items-center gap-1 w-fit">
                          <ArrowUpRight className="w-3 h-3" /> EXPENSE OUT
                        </span>
                      )}
                    </td>
                    <td className="text-slate-300 max-w-xs truncate" title={tx.description}>{tx.description}</td>
                    <td className="text-slate-300">{tx.person}</td>
                    <td className="text-right font-mono font-bold text-emerald-400">
                      {tx.inAmount > 0 ? `+৳${tx.inAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '-'}
                    </td>
                    <td className="text-right font-mono font-bold text-red-400">
                      {tx.outAmount > 0 ? `-৳${tx.outAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '-'}
                    </td>
                    <td className="text-right font-mono font-bold text-slate-100 bg-slate-900/60">
                      ৳{tx.runningBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    {isAdmin && (
                      <td className="text-center">
                        {tx.type === 'INCOME' && (
                          <button
                            onClick={() => {
                              if (confirm(`Delete cash advance ${tx.id}?`)) {
                                onDeleteAdvance(tx.id);
                              }
                            }}
                            className="p-1.5 rounded text-rose-400 hover:bg-rose-500/20"
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
