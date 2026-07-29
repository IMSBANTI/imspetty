import React, { useState } from 'react';
import { Filter, Download, Printer, FileSpreadsheet, RefreshCw } from 'lucide-react';
import { exportVouchersToExcel } from '../services/excelService';

export default function ReportGenerator({ vouchers, categories, projects, staffList }) {
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    category: 'ALL',
    project: 'ALL',
    staff: 'ALL'
  });

  const handleReset = () => {
    setFilters({
      startDate: '',
      endDate: '',
      category: 'ALL',
      project: 'ALL',
      staff: 'ALL'
    });
  };

  // Filter vouchers
  const filteredVouchers = vouchers.filter(v => {
    if (filters.startDate && v.date < filters.startDate) return false;
    if (filters.endDate && v.date > filters.endDate) return false;
    if (filters.category !== 'ALL' && v.category !== filters.category) return false;
    if (filters.project !== 'ALL' && v.project !== filters.project) return false;
    if (filters.staff !== 'ALL' && v.requestedBy !== filters.staff) return false;
    return true;
  });

  const totalAmount = filteredVouchers.reduce((sum, v) => sum + (parseFloat(v.amount) || 0), 0);

  // Group by category summary
  const catSummary = {};
  filteredVouchers.forEach(v => {
    catSummary[v.category] = (catSummary[v.category] || 0) + (parseFloat(v.amount) || 0);
  });

  // Group by project summary
  const projSummary = {};
  filteredVouchers.forEach(v => {
    projSummary[v.project] = (projSummary[v.project] || 0) + (parseFloat(v.amount) || 0);
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header & Controls */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold font-heading text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-red-500" />
              Customized Report Generator
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Build custom expenditure reports, preview summaries, and download formatted Excel sheets.</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="btn btn-secondary text-xs flex items-center gap-1.5 rounded-xl py-2 px-3"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
            <button
              onClick={() => exportVouchersToExcel(filteredVouchers, [], 'IMS_Customized_Petty_Cash_Report.xlsx')}
              className="btn btn-red text-xs flex items-center gap-1.5 rounded-xl py-2 px-4 font-bold shadow-md"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Generate Excel Sheet</span>
            </button>
            <button
              onClick={() => window.print()}
              className="btn btn-secondary text-xs flex items-center gap-1.5 rounded-xl py-2 px-3"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
          </div>
        </div>

        {/* Filter Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Start Date</label>
            <input 
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              className="form-control text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">End Date</label>
            <input 
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              className="form-control text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Category</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="form-control text-xs"
            >
              <option value="ALL">All Categories</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Project</label>
            <select
              value={filters.project}
              onChange={(e) => setFilters({ ...filters, project: e.target.value })}
              className="form-control text-xs"
            >
              <option value="ALL">All Projects</option>
              {projects.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Staff / Employee</label>
            <select
              value={filters.staff}
              onChange={(e) => setFilters({ ...filters, staff: e.target.value })}
              className="form-control text-xs"
            >
              <option value="ALL">All Staff</option>
              {staffList.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="glass-panel p-5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-1 shadow-md">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Filtered Records Count</p>
          <h3 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">{filteredVouchers.length} Vouchers</h3>
        </div>

        <div className="glass-panel p-5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-1 shadow-md">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Filtered Amount</p>
          <h3 className="text-2xl font-extrabold font-mono text-red-600 dark:text-red-400">
            ৳{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </h3>
        </div>

        <div className="glass-panel p-5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-1 shadow-md">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Active Category Breakdown</p>
          <h3 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">{Object.keys(catSummary).length} Categories</h3>
        </div>
      </div>

      {/* Preview Table */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-lg">
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Report Items Preview</h3>
        <div className="table-container border border-slate-200 dark:border-slate-800 rounded-2xl overflow-x-auto">
          <table className="custom-table text-xs w-full">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-semibold text-[11px] uppercase tracking-wider">
                <th className="px-3.5 py-3 whitespace-nowrap">Voucher No</th>
                <th className="px-3.5 py-3 whitespace-nowrap">Date</th>
                <th className="px-3.5 py-3 whitespace-nowrap">Category</th>
                <th className="px-3.5 py-3 whitespace-nowrap">Project</th>
                <th className="px-3.5 py-3 whitespace-nowrap">Requested By</th>
                <th className="px-3.5 py-3">Description</th>
                <th className="px-3.5 py-3 text-right whitespace-nowrap">Amount (TK)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredVouchers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-slate-400">
                    No vouchers match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredVouchers.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-500/5 transition-colors">
                    <td className="px-3.5 py-3 font-mono font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">{v.id}</td>
                    <td className="px-3.5 py-3 font-mono text-slate-600 dark:text-slate-400 whitespace-nowrap">{v.date}</td>
                    <td className="px-3.5 py-3 whitespace-nowrap">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/30 whitespace-nowrap">
                        {v.category}
                      </span>
                    </td>
                    <td className="px-3.5 py-3 font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">{v.project}</td>
                    <td className="px-3.5 py-3 text-slate-700 dark:text-slate-300 whitespace-nowrap">{v.requestedBy}</td>
                    <td className="px-3.5 py-3 text-slate-600 dark:text-slate-400 max-w-xs truncate" title={v.description}>{v.description}</td>
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
    </div>
  );
}
