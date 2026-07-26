import React, { useState } from 'react';
import { Search, Filter, Eye, Printer, Trash2, Download, Image as ImageIcon, X, FileText } from 'lucide-react';
import { exportVouchersToExcel } from '../services/excelService';

export default function VoucherList({ vouchers, categories, projects, onDeleteVoucher, isAdmin }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [projectFilter, setProjectFilter] = useState('ALL');
  const [selectedVoucherForScan, setSelectedVoucherForScan] = useState(null);
  const [selectedVoucherForPrint, setSelectedVoucherForPrint] = useState(null);

  // Filter logic
  const filteredVouchers = vouchers.filter((v) => {
    const matchesSearch = 
      v.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.requestedBy.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = categoryFilter === 'ALL' || v.category === categoryFilter;
    const matchesProject = projectFilter === 'ALL' || v.project === projectFilter;

    return matchesSearch && matchesCategory && matchesProject;
  });

  const totalFilteredAmount = filteredVouchers.reduce((sum, v) => sum + (parseFloat(v.amount) || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Filter Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 glass-panel p-5 rounded-2xl border border-slate-800">
        <div className="flex-1 w-full flex flex-col sm:flex-row items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input 
              type="text"
              placeholder="Search voucher #, description, or person..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-control pl-9"
            />
          </div>

          {/* Category Filter */}
          <select 
            value={categoryFilter} 
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="form-control sm:w-48"
          >
            <option value="ALL">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          {/* Project Filter */}
          <select 
            value={projectFilter} 
            onChange={(e) => setProjectFilter(e.target.value)}
            className="form-control sm:w-48"
          >
            <option value="ALL">All Projects</option>
            {projects.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        {/* Excel Export Button */}
        <button
          onClick={() => exportVouchersToExcel(filteredVouchers, 'IMS Voucher Records Export')}
          className="btn btn-gold flex items-center gap-2 whitespace-nowrap"
        >
          <Download className="w-4 h-4" />
          <span>Export Excel</span>
        </button>
      </div>

      {/* Summary KPI Bar */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-2">
        <span>Showing {filteredVouchers.length} of {vouchers.length} vouchers</span>
        <span className="font-mono text-sm font-bold text-amber-400">
          Filtered Expenditure: ৳{totalFilteredAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </span>
      </div>

      {/* Vouchers Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Voucher No</th>
                <th>Date</th>
                <th>Category</th>
                <th>Project</th>
                <th>Requested By</th>
                <th>Description / Particulars</th>
                <th>Scan Receipt</th>
                <th className="text-right">Amount (TK)</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredVouchers.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-8 text-slate-500">
                    No matching voucher records found.
                  </td>
                </tr>
              ) : (
                filteredVouchers.map((v) => (
                  <tr key={v.id}>
                    <td className="font-mono text-blue-400 font-semibold">{v.id}</td>
                    <td className="text-slate-300 whitespace-nowrap">{v.date}</td>
                    <td><span className="badge badge-blue">{v.category}</span></td>
                    <td className="text-slate-300 whitespace-nowrap">{v.project}</td>
                    <td className="text-slate-300 whitespace-nowrap">{v.requestedBy}</td>
                    <td className="text-slate-300 max-w-xs truncate" title={v.description}>{v.description}</td>
                    <td className="text-center">
                      {v.scanAttachment ? (
                        <button
                          onClick={() => setSelectedVoucherForScan(v)}
                          className="btn btn-secondary py-1 px-2.5 text-xs text-amber-400 border-amber-500/30 hover:bg-amber-500/10"
                          title="View Scanned Cash Receipt"
                        >
                          <ImageIcon className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>
                      ) : (
                        <span className="text-slate-600 text-xs italic">None</span>
                      )}
                    </td>
                    <td className="text-right font-mono font-bold text-amber-400 whitespace-nowrap">
                      ৳{parseFloat(v.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setSelectedVoucherForPrint(v)}
                          className="p-1.5 rounded bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700"
                          title="Print Receipt"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        {isAdmin && (
                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete voucher ${v.id}?`)) {
                                onDeleteVoucher(v.id);
                              }
                            }}
                            className="p-1.5 rounded bg-rose-500/10 text-rose-400 hover:bg-rose-500/20"
                            title="Delete Voucher"
                          >
                            <Trash2 className="w-4 h-4" />
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

      {/* Scanned Receipt Modal */}
      {selectedVoucherForScan && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-amber-400" />
                  Scanned Voucher Receipt - {selectedVoucherForScan.id}
                </h3>
                <p className="text-xs text-slate-400">Date: {selectedVoucherForScan.date} | Amount: ৳{selectedVoucherForScan.amount}</p>
              </div>
              <button 
                onClick={() => setSelectedVoucherForScan(null)}
                className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto flex items-center justify-center bg-slate-950 p-4 rounded-xl border border-slate-800">
              {selectedVoucherForScan.attachmentType?.startsWith('image/') || selectedVoucherForScan.scanAttachment?.startsWith('data:image/') ? (
                <img 
                  src={selectedVoucherForScan.scanAttachment} 
                  alt="Scanned Cash Voucher Receipt"
                  className="max-w-full max-h-[60vh] object-contain rounded shadow"
                />
              ) : (
                <div className="text-center p-8 space-y-3">
                  <FileText className="w-16 h-16 text-blue-400 mx-auto" />
                  <p className="text-sm text-slate-300">Scanned document is in PDF format: {selectedVoucherForScan.attachmentName}</p>
                  <a
                    href={selectedVoucherForScan.scanAttachment}
                    download={selectedVoucherForScan.attachmentName || `Voucher_${selectedVoucherForScan.id}.pdf`}
                    className="btn btn-primary text-xs inline-flex items-center gap-2"
                  >
                    Download Scanned PDF Document
                  </a>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button 
                onClick={() => setSelectedVoucherForScan(null)}
                className="btn btn-secondary text-xs"
              >
                Close Receipt Viewer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Print Voucher Modal */}
      {selectedVoucherForPrint && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full p-6 space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 no-print">
              <h3 className="text-lg font-bold text-slate-100">Printable Voucher Receipt</h3>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => window.print()}
                  className="btn btn-gold text-xs py-1.5 px-3 flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Receipt</span>
                </button>
                <button 
                  onClick={() => setSelectedVoucherForPrint(null)}
                  className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Receipt Printable Area */}
            <div className="printable-area bg-white text-slate-900 p-6 rounded-xl border border-slate-200 space-y-4">
              <div className="text-center border-b-2 border-slate-900 pb-3">
                <h2 className="text-xl font-bold font-heading uppercase tracking-wide">IMS GROUP</h2>
                <p className="text-xs text-slate-600">PETTY CASH PAYMENT VOUCHER</p>
              </div>

              <div className="flex justify-between text-xs font-mono">
                <div><strong>Voucher No:</strong> {selectedVoucherForPrint.id}</div>
                <div><strong>Date:</strong> {selectedVoucherForPrint.date}</div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div><strong>Project:</strong> {selectedVoucherForPrint.project}</div>
                <div><strong>Category:</strong> {selectedVoucherForPrint.category}</div>
                <div><strong>Paid To / Requested By:</strong> {selectedVoucherForPrint.requestedBy}</div>
                <div><strong>Transport Mode:</strong> {selectedVoucherForPrint.transportMode || '-'}</div>
              </div>

              <div className="border-t border-b border-slate-300 py-3 my-2 text-sm">
                <p className="text-xs text-slate-500 font-semibold mb-1">Particulars / Description:</p>
                <p className="italic text-slate-800">{selectedVoucherForPrint.description}</p>
              </div>

              <div className="flex justify-between items-center bg-slate-100 p-3 rounded text-sm font-bold font-mono">
                <span>TOTAL AMOUNT PAID:</span>
                <span className="text-lg">৳{parseFloat(selectedVoucherForPrint.amount).toFixed(2)}</span>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-12 text-center text-xs">
                <div className="border-t border-slate-400 pt-1">Prepared By</div>
                <div className="border-t border-slate-400 pt-1">Received By</div>
                <div className="border-t border-slate-400 pt-1">Approved By ({selectedVoucherForPrint.approvedBy})</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
