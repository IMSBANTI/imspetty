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
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold font-heading text-slate-100 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
              Customized Report Generator
            </h2>
            <p className="text-xs text-slate-400">Build custom expenditure reports, preview summaries, and download formatted Excel sheets.</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="btn btn-secondary text-xs flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
            <button
              onClick={() => exportVouchersToExcel(filteredVouchers, 'IMS Customized Petty Cash Report')}
              className="btn btn-gold text-xs flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Generate Excel Sheet</span>
            </button>
            <button
              onClick={() => window.print()}
              className="btn btn-primary text-xs flex items-center gap-1.5 no-print"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
          </div>
        </div>

        {/* Filter Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2 border-t border-slate-800">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Start Date</label>
            <input 
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              className="form-control"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">End Date</label>
            <input 
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              className="form-control"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Category</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="form-control"
            >
              <option value="ALL">All Categories</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Project</label>
            <select
              value={filters.project}
              onChange={(e) => setFilters({ ...filters, project: e.target.value })}
              className="form-control"
            >
              <option value="ALL">All Projects</option>
              {projects.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Staff / Employee</label>
            <select
              value={filters.staff}
              onChange={(e) => setFilters({ ...filters, staff: e.target.value })}
              className="form-control"
            >
              <option value="ALL">All Staff</option>
              {staffList.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Printable Report Output Area */}
      <div className="printable-area glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
        <div className="text-center border-b border-slate-700 pb-4">
          <h2 className="text-2xl font-bold font-heading text-slate-100">IMS GROUP - PETTY CASH EXPENDITURE REPORT</h2>
          <p className="text-xs text-slate-400 mt-1">
            Report Period: {filters.startDate || 'Beginning'} to {filters.endDate || 'Present'} | Category: {filters.category} | Project: {filters.project}
          </p>
        </div>

        {/* Report Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
            <p className="text-xs font-medium text-slate-400">Total Filtered Vouchers</p>
            <h4 className="text-xl font-bold text-slate-100 mt-1">{filteredVouchers.length}</h4>
          </div>

          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
            <p className="text-xs font-medium text-slate-400">Total Expenditure</p>
            <h4 className="text-xl font-bold font-mono text-amber-400 mt-1">
              ৳{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </h4>
          </div>

          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
            <p className="text-xs font-medium text-slate-400">Average Voucher Amount</p>
            <h4 className="text-xl font-bold text-emerald-400 mt-1">
              ৳{(filteredVouchers.length > 0 ? totalAmount / filteredVouchers.length : 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </h4>
          </div>
        </div>

        {/* Breakdown Tables */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Category Summary */}
          <div>
            <h4 className="text-sm font-bold text-slate-200 mb-2">Category Summary</h4>
            <table className="custom-table text-xs">
              <thead>
                <tr>
                  <th>Category</th>
                  <th className="text-right">Total (TK)</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(catSummary).map(([c, amt]) => (
                  <tr key={c}>
                    <td className="text-slate-300">{c}</td>
                    <td className="text-right font-mono font-semibold text-amber-400">৳{amt.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Project Summary */}
          <div>
            <h4 className="text-sm font-bold text-slate-200 mb-2">Project Summary</h4>
            <table className="custom-table text-xs">
              <thead>
                <tr>
                  <th>Project</th>
                  <th className="text-right">Total (TK)</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(projSummary).map(([p, amt]) => (
                  <tr key={p}>
                    <td className="text-slate-300">{p}</td>
                    <td className="text-right font-mono font-semibold text-amber-400">৳{amt.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Itemized Vouchers Table */}
        <div>
          <h4 className="text-sm font-bold text-slate-200 mb-2">Itemized Voucher List</h4>
          <div className="table-container">
            <table className="custom-table text-xs">
              <thead>
                <tr>
                  <th>Voucher #</th>
                  <th>Date</th>
                  <th>Project</th>
                  <th>Category</th>
                  <th>Requested By</th>
                  <th>Description</th>
                  <th className="text-right">Amount (TK)</th>
                </tr>
              </thead>
              <tbody>
                {filteredVouchers.map((v) => (
                  <tr key={v.id}>
                    <td className="font-mono text-blue-400">{v.id}</td>
                    <td>{v.date}</td>
                    <td>{v.project}</td>
                    <td>{v.category}</td>
                    <td>{v.requestedBy}</td>
                    <td>{v.description}</td>
                    <td className="text-right font-mono font-semibold text-amber-400">
                      ৳{parseFloat(v.amount).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
