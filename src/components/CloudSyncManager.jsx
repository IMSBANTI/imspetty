import React, { useState } from 'react';
import { Cloud, UploadCloud, DownloadCloud, RefreshCw, CheckCircle2, Server, Key, Sparkles, AlertCircle, Github } from 'lucide-react';
import { getCloudConfig, saveCloudConfig, createSystemCloudPayload, syncToGitHubGist, fetchFromGitHubGist, downloadCloudBackupFile } from '../services/cloudService';

export default function CloudSyncManager({ vouchers, cashAdvances, categories, projects, staffList, transportModes, onImportData }) {
  const [config, setConfig] = useState(getCloudConfig());
  const [githubToken, setGithubToken] = useState(config.githubToken || '');
  const [syncing, setSyncing] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  // 1-Click Download Backup File
  const handleDownloadBackup = () => {
    const payload = createSystemCloudPayload(vouchers, cashAdvances, categories, projects, staffList, transportModes);
    downloadCloudBackupFile(payload);
    setStatusMsg({
      type: 'success',
      text: 'System Backup File downloaded! You can now upload/restore this file on GitHub Pages or any laptop.'
    });
  };

  // Restore Backup File
  const handleRestoreFromFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (!parsed.data || !parsed.data.vouchers) {
          alert('Invalid Backup File format.');
          return;
        }

        if (confirm(`Restore system backup from "${file.name}"? This will import ${parsed.data.vouchers.length} vouchers and cash advances.`)) {
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

  // GitHub Cloud Sync Upload
  const handleGitHubSyncUpload = async () => {
    if (!githubToken.trim()) {
      alert('Please enter your GitHub Personal Access Token.');
      return;
    }
    setSyncing(true);
    setStatusMsg({ type: '', text: '' });
    try {
      const payload = createSystemCloudPayload(vouchers, cashAdvances, categories, projects, staffList, transportModes);
      const newConfig = { ...config, githubToken: githubToken.trim() };
      const res = await syncToGitHubGist(payload, newConfig);
      setConfig(getCloudConfig());
      setStatusMsg({
        type: 'success',
        text: `Data successfully uploaded to GitHub Cloud Gist! (Gist ID: ${res.gistId})`
      });
    } catch (err) {
      console.error(err);
      setStatusMsg({ type: 'error', text: 'GitHub Sync Upload failed: ' + err.message });
    } finally {
      setSyncing(false);
    }
  };

  // GitHub Cloud Sync Download
  const handleGitHubSyncDownload = async () => {
    if (!config.githubGistId) {
      alert('No GitHub Cloud Gist ID saved yet. Please upload from your primary device first.');
      return;
    }
    setFetching(true);
    setStatusMsg({ type: '', text: '' });
    try {
      const remoteData = await fetchFromGitHubGist(config);
      if (confirm(`Download latest data from GitHub Cloud? This will import remote vouchers and cash advances.`)) {
        await onImportData(remoteData);
        setStatusMsg({
          type: 'success',
          text: `GitHub Cloud data downloaded successfully! Loaded ${remoteData.vouchers?.length || 0} vouchers.`
        });
      }
    } catch (err) {
      console.error(err);
      setStatusMsg({ type: 'error', text: 'GitHub Cloud Fetch failed: ' + err.message });
    } finally {
      setFetching(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-red-950/40">
        <h2 className="text-xl font-bold font-heading text-slate-800 dark:text-slate-100 flex items-center gap-2.5">
          <Cloud className="w-5 h-5 text-red-500" />
          Data Backup & Transfer Center
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Transfer your petty cash records instantly between localhost, GitHub Pages, and secondary laptops.
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

      {/* 🌟 METHOD 1: 1-CLICK BACKUP FILE TRANSFER (RECOMMENDED & 100% GUARANTEED) */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-emerald-900/40 bg-gradient-to-r from-emerald-500/5 via-slate-900/10 to-slate-900/5 space-y-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold font-heading text-slate-800 dark:text-slate-100">
                1-Click Backup File Transfer (Guaranteed 100% Working)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Easily move data between your local PC and GitHub Pages (`https://imsbanti.github.io/imspetty/`).
              </p>
            </div>
          </div>
          <span className="badge badge-green font-bold">FAST & OFFLINE</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Step 1: Export File */}
          <div className="p-5 bg-slate-100 dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
              <DownloadCloud className="w-4 h-4" />
              <span>STEP 1: Export Data File</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Click below to download your complete petty cash dataset file to your computer.
            </p>
            <button
              onClick={handleDownloadBackup}
              className="btn btn-secondary w-full py-3 text-xs font-bold rounded-xl border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"
            >
              <DownloadCloud className="w-4 h-4" />
              <span>Download System Backup File (.json)</span>
            </button>
          </div>

          {/* Step 2: Restore File */}
          <div className="p-5 bg-slate-100 dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-xs">
              <UploadCloud className="w-4 h-4" />
              <span>STEP 2: Restore File on GitHub Pages / Laptop</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Open the web app on GitHub Pages or another laptop and select the downloaded file to load.
            </p>
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
                className="btn btn-secondary w-full py-3 text-xs font-bold rounded-xl flex items-center justify-center gap-2 border-blue-500/40 text-blue-600 dark:text-blue-400 hover:bg-blue-500/10 cursor-pointer"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Select Backup File to Load</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* METHOD 2: GITHUB DIRECT CLOUD AUTO-SYNC */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500">
            <Github className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Direct GitHub Cloud Gist Sync</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Sync data directly to your GitHub account using a GitHub Personal Access Token (PAT).</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              GitHub Personal Access Token (PAT)
            </label>
            <div className="relative">
              <Key className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input 
                type="password"
                placeholder="ghp_xxxxxxxxxxxxxxxx"
                value={githubToken}
                onChange={(e) => setGithubToken(e.target.value)}
                className="form-control pl-9 text-xs font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              GitHub Gist Store ID (Auto-saved)
            </label>
            <input 
              type="text"
              readOnly
              placeholder="Saved Gist ID will appear here..."
              value={config.githubGistId || ''}
              className="form-control text-xs font-mono bg-slate-100 dark:bg-slate-900"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          {config.githubGistId && (
            <button
              onClick={handleGitHubSyncDownload}
              disabled={fetching}
              className="btn btn-secondary text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 border-blue-500/40 text-blue-600 dark:text-blue-400"
            >
              <DownloadCloud className={`w-4 h-4 ${fetching ? 'animate-spin' : ''}`} />
              <span>Fetch from GitHub Cloud</span>
            </button>
          )}

          <button
            onClick={handleGitHubSyncUpload}
            disabled={syncing}
            className="btn btn-red text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 font-bold shadow-md"
          >
            <UploadCloud className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            <span>{syncing ? 'Uploading to GitHub...' : 'Upload to GitHub Cloud Gist'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
