import React, { useState } from 'react';
import { Cloud, UploadCloud, DownloadCloud, RefreshCw, CheckCircle2, Server, Key, Smartphone, AlertCircle, Save, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { getCloudConfig, saveCloudConfig, createSystemCloudPayload, syncToSimpleCloud, fetchFromSimpleCloud, downloadCloudBackupFile } from '../services/cloudService';

export default function CloudSyncManager({ vouchers, cashAdvances, categories, projects, staffList, transportModes, onImportData }) {
  const [config, setConfig] = useState(getCloudConfig());
  const [syncCodeInput, setSyncCodeInput] = useState(config.syncCode || `IMS-${Math.floor(100000 + Math.random() * 900000)}`);
  const [syncing, setSyncing] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });
  const [showAdvanced, setShowAdvanced] = useState(false);

  // 1-Click Upload to Cloud via Sync Code
  const handleUploadToCloud = async () => {
    if (!syncCodeInput.trim()) {
      alert('Please enter a Sync Code.');
      return;
    }
    setSyncing(true);
    setStatusMsg({ type: '', text: '' });
    try {
      const payload = createSystemCloudPayload(vouchers, cashAdvances, categories, projects, staffList, transportModes);
      await syncToSimpleCloud(payload, syncCodeInput);
      const updatedCfg = { ...config, syncCode: syncCodeInput.trim().toUpperCase() };
      setConfig(updatedCfg);
      saveCloudConfig(updatedCfg);
      setStatusMsg({
        type: 'success',
        text: `Data successfully uploaded to Cloud! Use Sync Code "${syncCodeInput.trim().toUpperCase()}" on any device to access.`
      });
    } catch (err) {
      console.error(err);
      setStatusMsg({ type: 'error', text: 'Cloud upload failed: ' + err.message });
    } finally {
      setSyncing(false);
    }
  };

  // 1-Click Download from Cloud via Sync Code
  const handleDownloadFromCloud = async () => {
    if (!syncCodeInput.trim()) {
      alert('Please enter your Sync Code.');
      return;
    }
    setFetching(true);
    setStatusMsg({ type: '', text: '' });
    try {
      const remoteData = await fetchFromSimpleCloud(syncCodeInput);
      if (confirm(`Load cloud data for Sync Code "${syncCodeInput.trim().toUpperCase()}"? This will import remote vouchers & advances.`)) {
        await onImportData(remoteData);
        const updatedCfg = { ...config, syncCode: syncCodeInput.trim().toUpperCase() };
        setConfig(updatedCfg);
        saveCloudConfig(updatedCfg);
        setStatusMsg({
          type: 'success',
          text: `Data successfully downloaded from Cloud! Loaded ${remoteData.vouchers?.length || 0} vouchers & ${remoteData.cashAdvances?.length || 0} cash advances.`
        });
      }
    } catch (err) {
      console.error(err);
      setStatusMsg({ type: 'error', text: 'Cloud download failed: ' + err.message });
    } finally {
      setFetching(false);
    }
  };

  const handleDownloadBackup = () => {
    const payload = createSystemCloudPayload(vouchers, cashAdvances, categories, projects, staffList, transportModes);
    downloadCloudBackupFile(payload);
  };

  const handleRestoreFromFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (!parsed.data || !parsed.data.vouchers) {
          alert('Invalid Cloud Backup File format.');
          return;
        }

        if (confirm('Restoring will merge/load cloud backup records into your current system. Proceed?')) {
          await onImportData(parsed.data);
          setStatusMsg({
            type: 'success',
            text: `Backup restored successfully! Loaded ${parsed.data.vouchers.length} vouchers & ${parsed.data.cashAdvances?.length || 0} cash advances.`
          });
        }
      } catch (err) {
        alert('Failed to parse backup file: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-red-950/40">
        <h2 className="text-xl font-bold font-heading text-slate-800 dark:text-slate-100 flex items-center gap-2.5">
          <Cloud className="w-5 h-5 text-red-500" />
          Easy 1-Click Cloud Access & Backup
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Sync your petty cash data between laptops, phones, and computers effortlessly using a simple 6-digit Sync Code.
        </p>
      </div>

      {statusMsg.text && (
        <div className={`p-4 rounded-2xl flex items-center gap-3 ${
          statusMsg.type === 'error'
            ? 'bg-rose-500/15 border border-rose-500/40 text-rose-600 dark:text-rose-400'
            : 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-600 dark:text-emerald-400'
        }`}>
          {statusMsg.type === 'error' ? <AlertCircle className="w-5 h-5 flex-shrink-0" /> : <CheckCircle2 className="w-5 h-5 flex-shrink-0" />}
          <span className="text-sm font-semibold">{statusMsg.text}</span>
        </div>
      )}

      {/* 🌟 SIMPLE 1-CLICK CLOUD SYNC CARD (NO TOKENS NEEDED!) */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-red-900/30 bg-gradient-to-r from-red-500/5 via-slate-900/10 to-slate-900/5 space-y-6 shadow-xl">
        <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold font-heading text-slate-800 dark:text-slate-100">
              Simple Sync Code Sharing
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              No technical setup or password tokens required! Just use a simple 6-character Sync Code.
            </p>
          </div>
        </div>

        {/* Sync Code Entry */}
        <div className="space-y-2 max-w-lg">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Your Secret Cloud Sync Code
          </label>
          <div className="flex items-center gap-3">
            <input 
              type="text"
              value={syncCodeInput}
              onChange={(e) => setSyncCodeInput(e.target.value.toUpperCase())}
              placeholder="e.g. IMS-882914"
              className="form-control text-lg font-mono font-bold tracking-widest text-red-600 dark:text-red-400 uppercase py-2.5 px-4 text-center border-2 border-red-500/30 rounded-xl"
            />
            <button
              type="button"
              onClick={() => setSyncCodeInput(`IMS-${Math.floor(100000 + Math.random() * 900000)}`)}
              className="btn btn-secondary text-xs py-3 px-3 rounded-xl whitespace-nowrap"
              title="Generate New Code"
            >
              New Code 🎲
            </button>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            💡 <strong>How it works:</strong> To open your petty cash data on your mobile phone or another computer, open the app on that device, type this same code, and click <strong>"Download from Cloud"</strong>!
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={handleUploadToCloud}
            disabled={syncing}
            className="btn btn-red w-full py-3.5 text-sm font-bold rounded-xl shadow-lg flex items-center justify-center gap-2"
          >
            <UploadCloud className={`w-5 h-5 ${syncing ? 'animate-spin' : ''}`} />
            <span>{syncing ? 'Uploading to Cloud...' : 'Upload Data to Cloud'}</span>
          </button>

          <button
            onClick={handleDownloadFromCloud}
            disabled={fetching}
            className="btn btn-secondary w-full py-3.5 text-sm font-bold rounded-xl flex items-center justify-center gap-2 border-red-500/40 text-red-600 dark:text-red-400 hover:bg-red-500/10"
          >
            <DownloadCloud className={`w-5 h-5 ${fetching ? 'animate-spin' : ''}`} />
            <span>{fetching ? 'Downloading from Cloud...' : 'Download Data from Cloud'}</span>
          </button>
        </div>
      </div>

      {/* Offline Backup File Download & Restore */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Export JSON Backup */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500">
              <DownloadCloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Export Backup File</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Save a single backup file to your computer.</p>
            </div>
          </div>
          <button
            onClick={handleDownloadBackup}
            className="btn btn-secondary w-full py-2.5 text-xs font-bold rounded-xl flex items-center justify-center gap-2 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"
          >
            <DownloadCloud className="w-4 h-4" />
            <span>Download Backup File (.json)</span>
          </button>
        </div>

        {/* Restore JSON Backup */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-500">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Restore from File</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Load a backup file onto any device.</p>
            </div>
          </div>
          <div>
            <input 
              type="file"
              accept=".json"
              onChange={handleRestoreFromFile}
              id="cloud-backup-restore-input"
              className="hidden"
            />
            <label
              htmlFor="cloud-backup-restore-input"
              className="btn btn-secondary w-full py-2.5 text-xs font-bold rounded-xl flex items-center justify-center gap-2 border-blue-500/40 text-blue-600 dark:text-blue-400 hover:bg-blue-500/10 cursor-pointer"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Select Backup File to Load</span>
            </label>
          </div>
        </div>
      </div>

      {/* Collapsible Advanced Developer Options */}
      <div className="pt-2">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-red-500 flex items-center gap-1.5 transition-colors mx-auto"
        >
          <span>{showAdvanced ? 'Hide Advanced Developer Settings' : 'Show Advanced Developer Settings'}</span>
          {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showAdvanced && (
          <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 mt-4 animate-fade-in">
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Key className="w-4 h-4 text-red-500" />
              Advanced GitHub Token Settings
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">GitHub Personal Access Token (PAT)</label>
                <input 
                  type="password"
                  placeholder="ghp_xxxxxxxxxxxxxxxx"
                  value={config.githubToken || ''}
                  onChange={(e) => setConfig({ ...config, githubToken: e.target.value })}
                  className="form-control font-mono text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">GitHub Gist Store ID</label>
                <input 
                  type="text"
                  placeholder="Auto-created Gist ID"
                  value={config.githubGistId || ''}
                  onChange={(e) => setConfig({ ...config, githubGistId: e.target.value })}
                  className="form-control font-mono text-xs"
                />
              </div>
            </div>
            <button
              onClick={() => { saveCloudConfig(config); alert('Advanced settings saved.'); }}
              className="btn btn-secondary text-xs py-1.5 px-3 rounded-lg"
            >
              Save Advanced Settings
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
