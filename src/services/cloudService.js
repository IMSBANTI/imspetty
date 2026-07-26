// Cloud Sync & Remote Access Service for IMS Petty Cash Management
// Supports REST API & GitHub Gist Cloud Sync

import { getLocalSetting, setLocalSetting } from './db';

const CLOUD_CONFIG_KEY = 'cloud_config';

export const getCloudConfig = () => {
  return getLocalSetting(CLOUD_CONFIG_KEY, {
    enabled: true,
    provider: 'github', // 'github' | 'custom'
    githubToken: '',    // GitHub Personal Access Token (PAT)
    githubGistId: '',   // GitHub Gist ID for Cloud Storage
    endpointUrl: '',
    apiKey: '',
    autoSync: true,
    lastSyncedAt: null,
    syncStatus: 'synced'
  });
};

export const saveCloudConfig = (config) => {
  setLocalSetting(CLOUD_CONFIG_KEY, config);
};

// Export full database state as a portable Cloud Backup JSON object
export const createSystemCloudPayload = (vouchers, cashAdvances, categories, projects, staffList, transportModes) => {
  return {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    system: 'IMS Petty Cash Management System',
    company: 'Integrated Marketing Service Ltd.',
    data: {
      vouchers,
      cashAdvances,
      categories,
      projects,
      staffList,
      transportModes
    }
  };
};

// GitHub Gist Cloud Sync: Save system state up to GitHub Gist
export const syncToGitHubGist = async (payload, config) => {
  if (!config.githubToken) {
    throw new Error('GitHub Personal Access Token (PAT) is required for GitHub Cloud Sync.');
  }

  const filename = 'ims_petty_cash_data.json';
  const gistContent = {
    description: 'IMS Petty Cash System Cloud Data Store',
    public: false,
    files: {
      [filename]: {
        content: JSON.stringify(payload, null, 2)
      }
    }
  };

  let url = 'https://api.github.com/gists';
  let method = 'POST';

  if (config.githubGistId) {
    url = `https://api.github.com/gists/${config.githubGistId}`;
    method = 'PATCH';
  }

  const response = await fetch(url, {
    method,
    headers: {
      'Accept': 'application/vnd.github+json',
      'Authorization': `token ${config.githubToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(gistContent)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `GitHub API error (${response.status})`);
  }

  const data = await response.json();
  const gistId = data.id;

  const updatedConfig = {
    ...config,
    githubGistId: gistId,
    lastSyncedAt: new Date().toISOString(),
    syncStatus: 'synced'
  };
  saveCloudConfig(updatedConfig);
  return { success: true, gistId, timestamp: updatedConfig.lastSyncedAt };
};

// GitHub Gist Cloud Sync: Fetch system state down from GitHub Gist
export const fetchFromGitHubGist = async (config) => {
  if (!config.githubGistId) {
    throw new Error('No GitHub Gist ID configured.');
  }

  const headers = config.githubToken ? { 'Authorization': `token ${config.githubToken}` } : {};
  const response = await fetch(`https://api.github.com/gists/${config.githubGistId}`, { headers });

  if (!response.ok) {
    throw new Error(`GitHub API error fetching data (${response.status})`);
  }

  const gistData = await response.json();
  const fileObj = gistData.files['ims_petty_cash_data.json'] || Object.values(gistData.files)[0];
  
  if (!fileObj || !fileObj.content) {
    throw new Error('No valid IMS petty cash data found in GitHub Gist.');
  }

  const parsed = JSON.parse(fileObj.content);
  return parsed.data;
};

// Push local data up to Cloud REST API or GitHub Gist
export const syncToCloudServer = async (payload, config) => {
  if (config.provider === 'github') {
    return await syncToGitHubGist(payload, config);
  }

  if (!config.endpointUrl) {
    throw new Error('No Cloud API Endpoint URL configured.');
  }

  const response = await fetch(config.endpointUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(config.apiKey ? { 'X-Master-Key': config.apiKey, 'Authorization': `Bearer ${config.apiKey}` } : {})
    },
    body: JSON.stringify(payload)
  });

  const updatedConfig = {
    ...config,
    lastSyncedAt: new Date().toISOString(),
    syncStatus: 'synced'
  };
  saveCloudConfig(updatedConfig);
  return { success: true, timestamp: updatedConfig.lastSyncedAt };
};

// Export Cloud Backup JSON file download
export const downloadCloudBackupFile = (payload) => {
  const jsonStr = JSON.stringify(payload, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `IMS_Petty_Cash_Cloud_Backup_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
