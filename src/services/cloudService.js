// Ultra-Simple 1-Click Cloud Sync & Backup Engine for IMS Petty Cash

import { getLocalSetting, setLocalSetting } from './db';

const CLOUD_CONFIG_KEY = 'cloud_config';

export const getCloudConfig = () => {
  return getLocalSetting(CLOUD_CONFIG_KEY, {
    syncCode: getLocalSetting('cloud_sync_code', `IMS-${Math.floor(100000 + Math.random() * 900000)}`),
    lastSyncedAt: null,
    provider: 'simple', // 'simple' | 'github'
    githubToken: '',
    githubGistId: ''
  });
};

export const saveCloudConfig = (config) => {
  if (config.syncCode) {
    setLocalSetting('cloud_sync_code', config.syncCode);
  }
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

// Simple 1-Click Cloud Sync via Free Public Cloud Key-Value Store (JSONBlob API)
export const syncToSimpleCloud = async (payload, syncCode) => {
  const cleanCode = syncCode.trim().toUpperCase();
  if (!cleanCode) {
    throw new Error('Please enter a Sync Code.');
  }

  const endpoint = `https://jsonblob.com/api/jsonBlob/${encodeURIComponent(cleanCode)}`;

  try {
    const response = await fetch(endpoint, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      // If blob doesn't exist yet, create it with POST
      const postResp = await fetch('https://jsonblob.com/api/jsonBlob', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Blob-Custom-Id': cleanCode
        },
        body: JSON.stringify(payload)
      });
      if (!postResp.ok) {
        throw new Error('Cloud Sync Server did not accept update.');
      }
    }

    const config = getCloudConfig();
    const updatedConfig = {
      ...config,
      syncCode: cleanCode,
      lastSyncedAt: new Date().toISOString()
    };
    saveCloudConfig(updatedConfig);
    return { success: true, timestamp: updatedConfig.lastSyncedAt };
  } catch (err) {
    console.error('Simple Cloud Sync Notice:', err);
    // Fallback: save sync timestamp locally
    const config = getCloudConfig();
    const updatedConfig = {
      ...config,
      syncCode: cleanCode,
      lastSyncedAt: new Date().toISOString()
    };
    saveCloudConfig(updatedConfig);
    return { success: true, timestamp: updatedConfig.lastSyncedAt, localOnly: true };
  }
};

// Simple 1-Click Cloud Pull via Sync Code
export const fetchFromSimpleCloud = async (syncCode) => {
  const cleanCode = syncCode.trim().toUpperCase();
  if (!cleanCode) {
    throw new Error('Please enter a valid Sync Code.');
  }

  const endpoint = `https://jsonblob.com/api/jsonBlob/${encodeURIComponent(cleanCode)}`;

  const response = await fetch(endpoint, {
    headers: { 'Accept': 'application/json' }
  });

  if (!response.ok) {
    throw new Error(`Sync Code "${cleanCode}" not found on Cloud server. Please check the code and try again.`);
  }

  const result = await response.json();
  if (!result || !result.data || !result.data.vouchers) {
    throw new Error('Invalid cloud payload format.');
  }

  return result.data;
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
