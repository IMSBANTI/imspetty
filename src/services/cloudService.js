// 1-Click Cloud & File Transfer Engine for IMS Petty Cash

import { getLocalSetting, setLocalSetting } from './db';

const CLOUD_CONFIG_KEY = 'cloud_config';

export const getCloudConfig = () => {
  return getLocalSetting(CLOUD_CONFIG_KEY, {
    syncCode: getLocalSetting('cloud_sync_code', `IMS-${Math.floor(100000 + Math.random() * 900000)}`),
    lastSyncedAt: null,
    githubToken: getLocalSetting('github_token', ''),
    githubGistId: getLocalSetting('github_gist_id', '')
  });
};

export const saveCloudConfig = (config) => {
  if (config.syncCode) setLocalSetting('cloud_sync_code', config.syncCode);
  if (config.githubToken !== undefined) setLocalSetting('github_token', config.githubToken);
  if (config.githubGistId !== undefined) setLocalSetting('github_gist_id', config.githubGistId);
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

// GitHub Gist Sync
export const syncToGitHubGist = async (payload, config) => {
  if (!config.githubToken) {
    throw new Error('GitHub Personal Access Token is required.');
  }

  const filename = 'ims_petty_cash_data.json';
  const gistContent = {
    description: `IMS Petty Cash System Data (${config.syncCode || 'IMS-DATA'})`,
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
      'Authorization': `token ${config.githubToken.trim()}`,
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
    lastSyncedAt: new Date().toISOString()
  };
  saveCloudConfig(updatedConfig);
  return { success: true, gistId, timestamp: updatedConfig.lastSyncedAt };
};

export const fetchFromGitHubGist = async (config) => {
  if (!config.githubGistId) {
    throw new Error('No GitHub Gist ID found. Please upload to GitHub Cloud first.');
  }

  const headers = config.githubToken ? { 'Authorization': `token ${config.githubToken.trim()}` } : {};
  const response = await fetch(`https://api.github.com/gists/${config.githubGistId}`, { headers });

  if (!response.ok) {
    throw new Error(`GitHub API error (${response.status})`);
  }

  const gistData = await response.json();
  const fileObj = gistData.files['ims_petty_cash_data.json'] || Object.values(gistData.files)[0];
  
  if (!fileObj || !fileObj.content) {
    throw new Error('No valid IMS petty cash data found in GitHub Gist.');
  }

  return JSON.parse(fileObj.content).data;
};

// Export Cloud Backup JSON file download
export const downloadCloudBackupFile = (payload) => {
  const jsonStr = JSON.stringify(payload, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `IMS_Petty_Cash_Backup_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
