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
    approvedBy: 'Harun Bhai',
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
        approvedBy: 'Harun Bhai',
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
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold font-heading text-slate-100 flex items-center gap-2">
            Voucher Entry Form
          </h2>
          <p className="text-xs text-slate-400">Fill in voucher details and upload scanned receipt image/PDF.</p>
        </div>
        <div className="badge badge-gold font-mono">
          Auto ID: {formData.id}
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium">Voucher saved successfully! You can view it under Voucher Records or export to Excel.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Voucher ID */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Voucher Number *</label>
            <input 
              type="text" 
              required
              value={formData.id}
              onChange={(e) => setFormData({ ...formData, id: e.target.value })}
              className="form-control font-mono font-bold text-amber-400"
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Voucher Date *</label>
            <input 
              type="date" 
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="form-control"
            />
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Amount (TK) *</label>
            <input 
              type="number" 
              step="0.01"
              required
              placeholder="e.g. 500.00"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="form-control font-mono text-lg font-bold text-emerald-400"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Expense Category *</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="form-control"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Project */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Project Name *</label>
            <select
              value={formData.project}
              onChange={(e) => setFormData({ ...formData, project: e.target.value })}
              className="form-control"
            >
              {projects.map((proj) => (
                <option key={proj} value={proj}>{proj}</option>
              ))}
            </select>
          </div>

          {/* Requested By */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Requested / Paid To *</label>
            <input
              type="text"
              required
              placeholder="Person name"
              value={formData.requestedBy}
              onChange={(e) => setFormData({ ...formData, requestedBy: e.target.value })}
              className="form-control"
              list="staff-list-options"
            />
            <datalist id="staff-list-options">
              {staffList.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </div>

          {/* Transport Mode (if Conveyance) */}
          {formData.category === 'Conveyance' && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Transport Mode</label>
              <select
                value={formData.transportMode}
                onChange={(e) => setFormData({ ...formData, transportMode: e.target.value })}
                className="form-control"
              >
                {transportModes.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          )}

          {/* Approved By */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Approved By</label>
            <input 
              type="text"
              value={formData.approvedBy}
              onChange={(e) => setFormData({ ...formData, approvedBy: e.target.value })}
              className="form-control"
            />
          </div>
        </div>

        {/* Description / Particulars */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Description / Particulars *</label>
          <textarea
            rows="3"
            required
            placeholder="e.g. Office to DBBL to IMS via Rickshaw for cash deposit..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="form-control"
          ></textarea>
        </div>

        {/* Scanned Receipt Upload Attachment */}
        <div className="border border-dashed border-slate-700 rounded-xl p-5 bg-slate-900/50 text-center space-y-3">
          <div className="flex items-center justify-center gap-2 text-slate-400">
            <UploadCloud className="w-6 h-6 text-blue-400" />
            <span className="text-sm font-semibold text-slate-200">Optionally Attach Scanned Cash Voucher</span>
          </div>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Upload voucher receipt image (JPG/PNG) or PDF scanned document (Max size: 5MB).
          </p>

          <input 
            type="file"
            accept="image/*,application/pdf"
            onChange={handleFileChange}
            id="scanned-receipt-input"
            className="hidden"
          />

          <label 
            htmlFor="scanned-receipt-input"
            className="btn btn-secondary text-xs inline-flex items-center gap-2 cursor-pointer"
          >
            <ImageIcon className="w-4 h-4 text-amber-400" />
            <span>Select Scanned Receipt File</span>
          </label>

          {formData.scanAttachment && (
            <div className="mt-3 p-3 bg-slate-800 rounded-lg inline-flex items-center gap-3 border border-slate-700">
              {formData.attachmentType?.startsWith('image/') ? (
                <img 
                  src={formData.scanAttachment} 
                  alt="Scanned Voucher" 
                  className="w-12 h-12 object-cover rounded border border-slate-600"
                />
              ) : (
                <FileText className="w-8 h-8 text-rose-400" />
              )}
              <div className="text-left text-xs">
                <p className="font-semibold text-slate-200 truncate max-w-[200px]">{formData.attachmentName}</p>
                <p className="text-slate-400">Scan Attached Successfully</p>
              </div>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, scanAttachment: null, attachmentName: '', attachmentType: '' }))}
                className="text-rose-400 hover:text-rose-300 ml-2 text-xs font-bold"
              >
                Remove
              </button>
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="btn btn-primary px-6"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Voucher...' : 'Save Voucher Data'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
