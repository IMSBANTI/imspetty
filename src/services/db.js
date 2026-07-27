// IndexedDB & LocalStorage Database Service for IMS Petty Cash Management System

import { INITIAL_VOUCHERS, INITIAL_CASH_ADVANCES } from './seedVouchers';

const DB_NAME = 'IMSPettyCashDB';
const DB_VERSION = 2;

// Default Item Categories
const DEFAULT_CATEGORIES = [
  'Conveyance',
  'Food for Guest',
  'Office Staff Food',
  'Grocery',
  'Stationery',
  'Laptop & Desktop',
  'Electric Purpose',
  'Household',
  'Office Others'
];

// Default Projects
const DEFAULT_PROJECTS = [
  'IMS Head Office',
  'BATB CE',
  'BATB PFP',
  'BHN',
  'Nagad'
];

// Default Staff List
const DEFAULT_STAFF = [
  'Mojnu',
  'Shohag',
  'Shathi',
  'Lipon',
  'Momin',
  'Jahangir',
  'Rakibul',
  'Asif',
  'Office Staff'
];

// Default Transport Modes
const DEFAULT_TRANSPORT_MODES = [
  'Rickshaw',
  'Bike',
  'Uber',
  'CNG',
  'Bus',
  'Rickshaw, Uber',
  'Bike, Rickshaw',
  '-'
];

// File to Base64 Converter Helper
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

// Open IndexedDB Connection
const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error('IndexedDB error:', event.target.error);
      reject(event.target.error);
    };

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Store 1: Vouchers
      if (!db.objectStoreNames.contains('vouchers')) {
        const store = db.createObjectStore('vouchers', { keyPath: 'id' });
        store.createIndex('date', 'date', { unique: false });
        store.createIndex('category', 'category', { unique: false });
        store.createIndex('project', 'project', { unique: false });
      }

      // Store 2: Cash Advances from Accounts
      if (!db.objectStoreNames.contains('cash_advances')) {
        const advStore = db.createObjectStore('cash_advances', { keyPath: 'id' });
        advStore.createIndex('date', 'date', { unique: false });
      }
    };
  });
};

// --- LocalStorage Configuration Helpers ---

export const getCategories = () => {
  const saved = localStorage.getItem('ims_categories');
  return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
};

export const saveCategories = (cats) => {
  localStorage.setItem('ims_categories', JSON.stringify(cats));
};

export const getProjects = () => {
  const saved = localStorage.getItem('ims_projects');
  return saved ? JSON.parse(saved) : DEFAULT_PROJECTS;
};

export const saveProjects = (projs) => {
  localStorage.setItem('ims_projects', JSON.stringify(projs));
};

export const getStaffList = () => {
  const saved = localStorage.getItem('ims_staff');
  return saved ? JSON.parse(saved) : DEFAULT_STAFF;
};

export const saveStaffList = (staff) => {
  localStorage.setItem('ims_staff', JSON.stringify(staff));
};

export const getTransportModes = () => {
  const saved = localStorage.getItem('ims_transport_modes');
  return saved ? JSON.parse(saved) : DEFAULT_TRANSPORT_MODES;
};

export const saveTransportModes = (modes) => {
  localStorage.setItem('ims_transport_modes', JSON.stringify(modes));
};

// Auth User Credential Helpers
export const getAuthCredentials = () => {
  const adminPass = localStorage.getItem('ims_admin_password') || 'admin123';
  const userPass = localStorage.getItem('ims_user_password') || 'user123';
  return { adminPass, userPass };
};

export const saveAuthCredentials = ({ adminPass, userPass }) => {
  if (adminPass) localStorage.setItem('ims_admin_password', adminPass);
  if (userPass) localStorage.setItem('ims_user_password', userPass);
};

export const setAdminPassword = (newPass) => {
  localStorage.setItem('ims_admin_password', newPass);
};

export const setUserPassword = (newPass) => {
  localStorage.setItem('ims_user_password', newPass);
};

// Local Preferences
export const getLocalSetting = (key, defaultVal) => {
  const val = localStorage.getItem(`ims_setting_${key}`);
  return val !== null ? JSON.parse(val) : defaultVal;
};

export const setLocalSetting = (key, val) => {
  localStorage.setItem(`ims_setting_${key}`, JSON.stringify(val));
};

// --- IndexedDB Vouchers Store CRUD ---

export const getAllVouchers = async () => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('vouchers', 'readwrite');
    const store = tx.objectStore('vouchers');
    const request = store.getAll();

    request.onsuccess = async () => {
      let list = request.result || [];
      const existingIds = new Set(list.map(v => v.id));
      
      // Auto-insert any missing initial seed vouchers
      let addedSeed = false;
      if (INITIAL_VOUCHERS && INITIAL_VOUCHERS.length > 0) {
        for (const seed of INITIAL_VOUCHERS) {
          if (!existingIds.has(seed.id)) {
            store.put(seed);
            list.push(seed);
            existingIds.add(seed.id);
            addedSeed = true;
          }
        }
      }

      // Sort newest date first
      list.sort((a, b) => new Date(b.date) - new Date(a.date));
      resolve(list);
    };

    request.onerror = () => reject(request.error);
  });
};

export const saveVoucher = async (voucher) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('vouchers', 'readwrite');
    const store = tx.objectStore('vouchers');
    const request = store.put(voucher);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const deleteVoucher = async (id) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('vouchers', 'readwrite');
    const store = tx.objectStore('vouchers');
    const request = store.delete(id);

    request.onsuccess = () => resolve(true);
    request.onerror = () => reject(request.error);
  });
};

// --- IndexedDB Cash Advances Store CRUD ---

export const getAllCashAdvances = async () => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('cash_advances', 'readwrite');
    const store = tx.objectStore('cash_advances');
    const request = store.getAll();

    request.onsuccess = async () => {
      let list = request.result || [];
      const existingIds = new Set(list.map(a => a.id));

      if (INITIAL_CASH_ADVANCES && INITIAL_CASH_ADVANCES.length > 0) {
        for (const seed of INITIAL_CASH_ADVANCES) {
          if (!existingIds.has(seed.id)) {
            store.put(seed);
            list.push(seed);
            existingIds.add(seed.id);
          }
        }
      }
      list.sort((a, b) => new Date(b.date) - new Date(a.date));
      resolve(list);
    };

    request.onerror = () => reject(request.error);
  });
};

export const saveCashAdvance = async (advance) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('cash_advances', 'readwrite');
    const store = tx.objectStore('cash_advances');
    const request = store.put(advance);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const deleteCashAdvance = async (id) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('cash_advances', 'readwrite');
    const store = tx.objectStore('cash_advances');
    const request = store.delete(id);

    request.onsuccess = () => resolve(true);
    request.onerror = () => reject(request.error);
  });
};
