import React, { useState } from 'react';
import { Cloud, UploadCloud, DownloadCloud, RefreshCw, CheckCircle2, Server, Key, Smartphone, AlertCircle, Save, Github, Link2 } from 'lucide-react';
import { getCloudConfig, saveCloudConfig, createSystemCloudPayload, syncToCloudServer, fetchFromGitHubGist, downloadCloudBackupFile } from '../services/cloudService';

export default function CloudSyncManager({ vouchers, cashAdvances, categories, projects, staffList, transportModes, onImportData }) {
  const [config, setConfig] = useState(getCloudConfig());
  const [syncing, setSyncing] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  const handleSyncNow = async () => {
    setSyncing(true);
    setStatusMsg({ type: '', text: '' });
    try {
      const payload = createSystemCloudPayload(vouchers, cashAdvances, categories, projects, staffList, transportModes);
      const res = await syncToCloudServer(payload, config);
      setConfig(getCloudConfig());
      setStatusMsg({
        type: 'success',
        text: `Cloud Sync Completed! Data saved to GitHub Cloud Gist (ID: ${res.gistId || config.githubGistId || 'Saved'}) at ${new Date().toLocaleTimeString()}`
      });
    } catch (err) {
      console.error(err);
      setStatusMsg({ type: 'error', text: 'Cloud Sync Failed: ' + err.message });
    } finally {
      setSyncing(false);
    }
  };

  const handleFetchFromGitHub = async () => {
    setFetching(true);
    setStatusMsg({ type: '', text: '' });
    try {
      const remoteData = await fetchFromGitHubGist(config);
      if (confirm(`Fetch data from GitHub Cloud? This will load remote vouchers and cash advances.`)) {
        await onImportData(remoteData);
        setStatusMsg({
          type: 'success',
          text: `GitHub Cloud Sync Fetch Successful! Loaded latest data from GitHub Gist.`
        });
      }
    } catch (err) {
      console.error(err);
      setStatusMsg({ type: 'error', text: 'GitHub Cloud Fetch Failed: ' + err.message });
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
            text: `Cloud Backup restored successfully! Loaded ${parsed.data.vouchers.length} vouchers & ${parsed.data.cashAdvances?.length || 0} cash advances.`
          });
        }
      } catch (err) {
        alert('Failed to parse Cloud Backup file: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();
    saveCloudConfig(config);
    setStatusMsg({ type: 'success', text: 'Cloud Integration configuration saved!' });
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-red-950/40">
        <h2 className="text-xl font-bold font-heading text-slate-800 dark:text-slate-100 flex items-center gap-2.5">
          <Github className="w-5 h-5 text-red-500" />
          GitHub Cloud Access & Global Sync Engine
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Access your Petty Cash software globally from any network, PC, or mobile device using GitHub Cloud Storage.
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

      {/* GitHub Cloud Sync Feature Card */}
      <div className="glass-panel p-6 rounded-3xl border border-red-900/30 bg-gradient-to-r from-red-500/5 via-slate-900/10 to-slate-900/5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500">
              <Github className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">GitHub Cloud Auto-Sync</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Stores and synchronizes all petty cash vouchers automatically in your GitHub Account.</p>
            </div>
          </div>
          <span className="badge badge-red font-bold">FREE GLOBAL CLOUD</span>
        </div>

        <form onSubmit={handleSaveSettings} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              GitHub Personal Access Token (PAT) *
            </label>
            <div className="relative">
              <Key className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input 
                type="password"
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxx text token"
                value={config.githubToken}
                onChange={(e) => setConfig({ ...config, githubToken: e.target.value })}
                className="form-control pl-9 text-xs font-mono"
              />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Generate at <a href="https://github.com/settings/tokens" target="_blank" rel="noreferrer" className="text-red-500 underline font-semibold">GitHub Settings &gt; Developer Tokens</a> (Scope: Gist).
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              GitHub Gist Cloud Store ID (Auto-generated on 1st sync)
            </label>
            <div className="relative">
              <Link2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input 
                type="text"
                placeholder="Auto-created after first GitHub sync..."
                value={config.githubGistId}
                onChange={(e) => setConfig({ ...config, githubGistId: e.target.value })}
                className="form-control pl-9 text-xs font-mono"
              />
            </div>
          </div>

          <div className="md:col-span-2 flex flex-wrap items-center justify-between gap-3 pt-2">
            <button type="submit" className="btn btn-secondary text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 border-slate-300 dark:border-slate-700">
              <Save className="w-4 h-4" />
              <span>Save GitHub Credentials</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleFetchFromGitHub}
                disabled={fetching || !config.githubGistId}
                className="btn btn-secondary text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 border-blue-500/40 text-blue-600 dark:text-blue-400 hover:bg-blue-500/10"
              >
                <DownloadCloud className={`w-4 h-4 ${fetching ? 'animate-spin' : ''}`} />
                <span>Fetch Latest from GitHub</span>
              </button>

              <button
                type="button"
                onClick={handleSyncNow}
                disabled={syncing || !config.githubToken}
                className="btn btn-red text-xs py-2 px-5 rounded-xl shadow-lg flex items-center gap-1.5 font-bold"
              >
                <UploadCloud className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                <span>Sync to GitHub Cloud Now</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Offline Backup File Export & Restore */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Export JSON Backup */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500">
              <DownloadCloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Export Backup JSON</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Download system database file for manual transfer.</p>
            </div>
          </div>
          <button
            onClick={handleDownloadBackup}
            className="btn btn-secondary w-full py-2.5 text-xs font-bold rounded-xl flex items-center justify-center gap-2 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"
          >
            <DownloadCloud className="w-4 h-4" />
            <span>Download Backup File</span>
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
              <p className="text-xs text-slate-500 dark:text-slate-400">Import backup JSON file onto any device.</p>
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
              <span>Restore Backup File</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
