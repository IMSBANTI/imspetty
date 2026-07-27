import React, { useState } from 'react';
import { Search, Printer, Trash2, FileSpreadsheet, Eye, FileText, AlertCircle, X, Download } from 'lucide-react';
import { exportVouchersToExcel } from '../services/excelService';

export default function VoucherList({ vouchers, categories, projects, onDeleteVoucher, isAdmin }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedProject, setSelectedProject] = useState('All');
  const [viewAttachment, setViewAttachment] = useState(null); // { name, type, data }
  const [printReceiptVoucher, setPrintReceiptVoucher] = useState(null); // Voucher object for print receipt modal

  // Filter vouchers
  const filteredVouchers = vouchers.filter((v) => {
    const matchesSearch = 
      v.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.requestedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.amount.toString().includes(searchTerm);
    
    const matchesCategory = selectedCategory === 'All' || v.category === selectedCategory;
    const matchesProject = selectedProject === 'All' || v.project === selectedProject;

    return matchesSearch && matchesCategory && matchesProject;
  });

  const totalFilteredAmount = filteredVouchers.reduce((sum, v) => sum + Number(v.amount || 0), 0);

  const handleExportExcel = () => {
    exportVouchersToExcel(filteredVouchers, [], 'IMS_Petty_Cash_Vouchers.xlsx');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header & Controls */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input 
              type="text"
              placeholder="Search voucher #, description, staff..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-control pl-9 text-xs"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <select 
              value={selectedCategory} 
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="form-control text-xs w-full sm:w-44"
            >
              <option value="All">All Categories</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            <select 
              value={selectedProject} 
              onChange={(e) => setSelectedProject(e.target.value)}
              className="form-control text-xs w-full sm:w-44"
            >
              <option value="All">All Projects</option>
              {projects.map(p => <option key={p} value={p}>{p}</option>)}
            </select>

            <button
              onClick={handleExportExcel}
              className="btn btn-red text-xs py-2 px-4 rounded-xl flex items-center justify-center gap-1.5 font-bold shadow-md w-full sm:w-auto"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Export Excel</span>
            </button>
          </div>
        </div>

        {/* Filter Summary Counter */}
        <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
          <span className="text-slate-500 font-medium">
            Showing <strong className="text-slate-800 dark:text-slate-200">{filteredVouchers.length}</strong> of {vouchers.length} vouchers
          </span>
          <span className="font-bold text-slate-700 dark:text-slate-300">
            Filtered Expenditure: <strong className="text-red-600 dark:text-red-400 font-mono text-sm ml-1">৳{totalFilteredAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
          </span>
        </div>
      </div>

      {/* Vouchers Table Container */}
      <div className="glass-panel rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/90 dark:bg-slate-900/90 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider text-[11px]">
                <th className="px-3.5 py-3 whitespace-nowrap">Voucher No</th>
                <th className="px-3 py-3 whitespace-nowrap">Date</th>
                <th className="px-3 py-3 whitespace-nowrap">Category</th>
                <th className="px-3 py-3 whitespace-nowrap">Project</th>
                <th className="px-3 py-3 whitespace-nowrap">Requested By</th>
                <th className="px-3.5 py-3">Description / Particulars</th>
                <th className="px-3 py-3 text-center whitespace-nowrap">Scan Receipt</th>
                <th className="px-3.5 py-3 text-right whitespace-nowrap">Amount (TK)</th>
                <th className="px-3.5 py-3 text-center whitespace-nowrap bg-slate-100/95 dark:bg-slate-900/95 sticky right-0 shadow-l">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70 dark:divide-slate-800/70">
              {filteredVouchers.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-12 text-slate-400">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <span>No petty cash vouchers match your filter criteria.</span>
                  </td>
                </tr>
              ) : (
                filteredVouchers.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-500/5 transition-colors group">
                    {/* Voucher ID */}
                    <td className="px-3.5 py-3 font-mono font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                      {v.id}
                    </td>

                    {/* Date */}
                    <td className="px-3 py-3 text-slate-600 dark:text-slate-400 font-mono whitespace-nowrap">
                      {v.date}
                    </td>

                    {/* Category - Single Line */}
                    <td className="px-3 py-3 whitespace-nowrap">
                      <span className="inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold bg-red-500/10 dark:bg-red-600/20 text-red-600 dark:text-red-400 border border-red-500/30 whitespace-nowrap">
                        {v.category}
                      </span>
                    </td>

                    {/* Project */}
                    <td className="px-3 py-3 text-slate-700 dark:text-slate-300 font-medium whitespace-nowrap">
                      {v.project}
                    </td>

                    {/* Requested By */}
                    <td className="px-3 py-3 text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      {v.requestedBy}
                    </td>

                    {/* Description */}
                    <td className="px-3.5 py-3 text-slate-600 dark:text-slate-400 max-w-xs truncate" title={v.description}>
                      {v.description}
                    </td>

                    {/* Scan Receipt Attachment */}
                    <td className="px-3 py-3 text-center whitespace-nowrap">
                      {v.scanAttachment ? (
                        <button
                          onClick={() => setViewAttachment({
                            name: v.attachmentName || `Receipt-${v.id}`,
                            type: v.attachmentType || 'image',
                            data: v.scanAttachment
                          })}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[11px] font-bold hover:bg-emerald-500/20 transition-all"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Receipt</span>
                        </button>
                      ) : (
                        <span className="text-slate-400 text-[11px] italic">None</span>
                      )}
                    </td>

                    {/* Amount */}
                    <td className="px-3.5 py-3 text-right font-mono font-bold text-slate-800 dark:text-slate-100 whitespace-nowrap">
                      ৳{Number(v.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>

                    {/* Actions - Always Visible Sticky Column */}
                    <td className="px-3.5 py-3 text-center whitespace-nowrap sticky right-0 bg-white/95 dark:bg-[#0b0c10]/95 group-hover:bg-slate-100/90 dark:group-hover:bg-slate-900/90 shadow-l">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Print Receipt Button */}
                        <button
                          onClick={() => setPrintReceiptVoucher(v)}
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-red-500/10 text-slate-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 border border-slate-200 dark:border-slate-700 transition-all"
                          title="Print Payment Voucher Receipt"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete Button (Admin Only) */}
                        {isAdmin && (
                          <button
                            onClick={() => {
                              if (confirm(`Delete Voucher ${v.id} (৳${v.amount})?`)) {
                                onDeleteVoucher(v.id);
                              }
                            }}
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 transition-all"
                            title="Delete Voucher"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 1. Attachment View Modal */}
      {viewAttachment && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-3xl rounded-3xl p-6 border border-slate-700 space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <FileText className="w-5 h-5 text-red-500" />
                Scanned Receipt: {viewAttachment.name}
              </h3>
              <button 
                onClick={() => setViewAttachment(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-auto flex items-center justify-center p-2 bg-slate-900/80 rounded-2xl border border-slate-800">
              {viewAttachment.data.startsWith('data:application/pdf') ? (
                <iframe 
                  src={viewAttachment.data} 
                  title={viewAttachment.name}
                  className="w-full h-[60vh] rounded-xl border-none"
                />
              ) : (
                <img 
                  src={viewAttachment.data} 
                  alt={viewAttachment.name}
                  className="max-h-[60vh] max-w-full object-contain rounded-xl shadow-lg"
                />
              )}
            </div>

            <div className="flex items-center justify-between pt-2">
              <a
                href={viewAttachment.data}
                download={viewAttachment.name}
                className="btn btn-secondary text-xs py-2 px-4 rounded-xl flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                <span>Download Attachment</span>
              </a>

              <button
                onClick={() => setViewAttachment(null)}
                className="btn btn-red text-xs py-2 px-4 rounded-xl"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Printable Voucher Receipt Modal */}
      {printReceiptVoucher && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-xl rounded-3xl p-6 border border-slate-700 space-y-6 bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
            {/* Printable Receipt Container */}
            <div id="printable-voucher-receipt" className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-5 text-xs">
              {/* Header */}
              <div className="flex items-center justify-between border-b-2 border-red-600 pb-3">
                <div>
                  <h2 className="text-base font-black text-red-600 uppercase tracking-wide">Integrated Marketing Service Ltd.</h2>
                  <p className="text-[11px] text-slate-500 font-semibold">PETTY CASH PAYMENT VOUCHER</p>
                </div>
                <div className="text-right">
                  <div className="font-mono text-sm font-bold text-slate-900 dark:text-slate-100">{printReceiptVoucher.id}</div>
                  <div className="text-slate-500">{printReceiptVoucher.date}</div>
                </div>
              </div>

              {/* Grid Info */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 font-medium block text-[10px] uppercase">Paid To (Employee):</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">{printReceiptVoucher.requestedBy}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block text-[10px] uppercase">Project / Department:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">{printReceiptVoucher.project}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block text-[10px] uppercase">Expense Category:</span>
                  <span className="font-semibold text-red-600 dark:text-red-400">{printReceiptVoucher.category}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block text-[10px] uppercase">Transport Mode:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{printReceiptVoucher.transportMode || '-'}</span>
                </div>
              </div>

              {/* Particulars / Description Box */}
              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 font-bold text-[10px] uppercase block mb-1">Particulars / Description:</span>
                <p className="text-slate-800 dark:text-slate-200 text-xs leading-relaxed">{printReceiptVoucher.description}</p>
              </div>

              {/* Amount Display */}
              <div className="flex items-center justify-between p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
                <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">TOTAL PAID AMOUNT:</span>
                <span className="font-mono text-lg font-black text-red-600 dark:text-red-400">
                  ৳{Number(printReceiptVoucher.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>

              {/* Signature Lines */}
              <div className="grid grid-cols-3 gap-4 pt-8 text-center text-[10px] text-slate-500 font-semibold">
                <div className="border-t border-slate-300 dark:border-slate-700 pt-1">Prepared By</div>
                <div className="border-t border-slate-300 dark:border-slate-700 pt-1">Checked By</div>
                <div className="border-t border-slate-300 dark:border-slate-700 pt-1">Approved By ({printReceiptVoucher.approvedBy})</div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setPrintReceiptVoucher(null)}
                className="btn btn-secondary text-xs py-2 px-4 rounded-xl"
              >
                Close
              </button>

              <button
                onClick={() => window.print()}
                className="btn btn-red text-xs py-2 px-5 rounded-xl flex items-center gap-1.5 font-bold shadow-lg"
              >
                <Printer className="w-4 h-4" />
                <span>Print Payment Voucher</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
