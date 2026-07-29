import React, { useState } from 'react';
import { Save, UploadCloud, CheckCircle2, FileText, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { fileToBase64 } from '../services/db';

export default function VoucherForm({ categories, projects, staffList, transportModes, onSaveVoucher }) {
  const [formData, setFormData] = useState({
    id: `VOU-${Date.now().toString().slice(-6)}`,
    date: new Date().toISOString().slice(0, 10),
    category: categories[0] || 'Conveyance',
    project: projects[0] || 'IMS Head Office',
    requestedBy: staffList[0] || 'Office Staff',
    description: '',
    transportMode: transportModes[0] || 'Rickshaw',
    approvedBy: '',
    amount: '',
    scanAttachment: null, // Base64 data URL
    attachmentName: '',
    attachmentType: ''
  });

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds 5MB limit. Please upload a smaller image/PDF.');
        return;
      }
      try {
        const base64 = await fileToBase64(file);
        setFormData(prev => ({
          ...prev,
          scanAttachment: base64,
          attachmentName: file.name,
          attachmentType: file.type
        }));
      } catch (err) {
        console.error('File reading failed', err);
        alert('Failed to process file attachment.');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      alert('Please enter a valid amount.');
      return;
    }
    if (!formData.description.trim()) {
      alert('Please enter particulars / description for the voucher.');
      return;
    }

    setSaving(true);
    try {
      await onSaveVoucher({
        ...formData,
        amount: parseFloat(formData.amount)
      });
      setSuccessMsg(true);

      // Reset form
      setFormData({
        id: `VOU-${Date.now().toString().slice(-6)}`,
        date: new Date().toISOString().slice(0, 10),
        category: categories[0] || 'Conveyance',
        project: projects[0] || 'IMS Head Office',
        requestedBy: staffList[0] || 'Office Staff',
        description: '',
        transportMode: transportModes[0] || 'Rickshaw',
        approvedBy: '',
        amount: '',
        scanAttachment: null,
        attachmentName: '',
        attachmentType: ''
      });

      setTimeout(() => setSuccessMsg(false), 4000);
    } catch (err) {
      console.error(err);
      alert('Error saving voucher.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold font-heading text-slate-800 dark:text-slate-100 flex items-center gap-2">
            Voucher Entry Form
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Fill in voucher details and upload scanned receipt image/PDF.</p>
        </div>
        <div className="badge badge-red font-mono font-bold">
          Auto ID: {formData.id}
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium">Voucher saved successfully! You can view it under Voucher Records or export to Excel.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Voucher ID */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Voucher Number *</label>
            <input 
              type="text" 
              required
              value={formData.id}
              onChange={(e) => setFormData({ ...formData, id: e.target.value })}
              className="form-control font-mono font-bold text-red-600 dark:text-red-400 text-xs"
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Date *</label>
            <input 
              type="date" 
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="form-control text-xs"
            />
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Amount (TK) *</label>
            <input 
              type="number" 
              step="0.01"
              required
              placeholder="e.g. 350.00"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="form-control font-mono text-sm font-bold text-red-600 dark:text-red-400"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Expense Category *</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="form-control text-xs"
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Project */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Project Name *</label>
            <select
              value={formData.project}
              onChange={(e) => setFormData({ ...formData, project: e.target.value })}
              className="form-control text-xs"
            >
              {projects.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* Requested By / Staff */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Requested By / Paid To *</label>
            <select
              value={formData.requestedBy}
              onChange={(e) => setFormData({ ...formData, requestedBy: e.target.value })}
              className="form-control text-xs"
            >
              {staffList.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Transport Mode (if category is Conveyance or optional) */}
          {formData.category === 'Conveyance' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Transport Mode</label>
              <select
                value={formData.transportMode}
                onChange={(e) => setFormData({ ...formData, transportMode: e.target.value })}
                className="form-control text-xs"
              >
                {transportModes.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          )}

          {/* Approved By */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Approved By</label>
            <input 
              type="text"
              placeholder="Enter approving manager name..."
              value={formData.approvedBy}
              onChange={(e) => setFormData({ ...formData, approvedBy: e.target.value })}
              className="form-control text-xs"
            />
          </div>
        </div>

        {/* Description / Particulars */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Description / Particulars *</label>
          <textarea
            rows="3"
            required
            placeholder="e.g. Office to DBBL to IMS via Rickshaw for cash deposit..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="form-control text-xs"
          ></textarea>
        </div>

        {/* Scanned Receipt Upload Attachment */}
        <div className="border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-2xl p-5 bg-slate-50 dark:bg-slate-900/50 text-center space-y-3">
          <div className="flex justify-center text-slate-400">
            {formData.scanAttachment ? (
              <CheckCircle2 className="w-10 h-10 text-emerald-500" />
            ) : (
              <UploadCloud className="w-10 h-10 text-red-500" />
            )}
          </div>
          <div>
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {formData.scanAttachment ? 'Receipt Attached:' : 'Attach Scanned Cash Voucher / Receipt (Image or PDF)'}
            </p>
            {formData.scanAttachment && (
              <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold block mt-1">
                {formData.attachmentName}
              </span>
            )}
          </div>
          <input 
            type="file" 
            accept="image/*,.pdf"
            onChange={handleFileChange}
            id="scan-receipt-upload"
            className="hidden"
          />
          <label 
            htmlFor="scan-receipt-upload" 
            className="btn btn-secondary text-xs py-2 px-4 rounded-xl cursor-pointer inline-flex items-center gap-1.5"
          >
            <ImageIcon className="w-4 h-4" />
            <span>{formData.scanAttachment ? 'Change Receipt Attachment' : 'Browse File (Max 5MB)'}</span>
          </label>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end pt-2 border-t border-slate-200 dark:border-slate-800">
          <button 
            type="submit" 
            disabled={saving}
            className="btn btn-red py-3 px-8 text-xs font-bold rounded-xl shadow-lg flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Voucher...' : 'Save Petty Cash Voucher'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
