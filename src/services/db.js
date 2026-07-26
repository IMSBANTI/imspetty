// IndexedDB & LocalStorage Database Service for IMS Petty Cash Software

const DB_NAME = 'IMSPettyCashDB';
const DB_VERSION = 2; // Incremented version for cash advances
const STORE_VOUCHERS = 'vouchers';
const STORE_ADVANCES = 'cash_advances';

// Initialize IndexedDB for vouchers & cash advances
const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_VOUCHERS)) {
        db.createObjectStore(STORE_VOUCHERS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_ADVANCES)) {
        db.createObjectStore(STORE_ADVANCES, { keyPath: 'id' });
      }
    };
    request.onsuccess = (e) => resolve(e.target.result);
    request.onerror = (e) => reject(e.target.error);
  });
};

// Default initial config data
const DEFAULT_CATEGORIES = [
  'Conveyance',
  'Food for Guest',
  'Office Staff Food',
  'Grocery',
  'Stationery',
  'Office Others',
  'Laptop & Desktop',
  'Electric Purpose',
  'Household',
  "Director's Expenditure"
];

const DEFAULT_PROJECTS = [
  'IMS Head Office',
  'CLAN',
  'BATB CE',
  'BATB PFP',
  'BHN',
  'Nagad',
  'BPO',
  'Forecast Films'
];

const DEFAULT_STAFF = [
  'Mojnu',
  'Shohag',
  'Shathi',
  'Lipon',
  'Momin',
  'Jahangir',
  'Rakibul',
  'Asif',
  'Management'
];

const DEFAULT_TRANSPORT = [
  'Rickshaw',
  'Bike',
  'Uber',
  'CNG',
  'Bus',
  'Train',
  'Walking / N/A'
];

// Helper to load/save JSON from localStorage
export const getLocalSetting = (key, fallback) => {
  try {
    const data = localStorage.getItem(`ims_pc_${key}`);
    return data ? JSON.parse(data) : fallback;
  } catch (err) {
    console.error(err);
    return fallback;
  }
};

export const setLocalSetting = (key, value) => {
  try {
    localStorage.setItem(`ims_pc_${key}`, JSON.stringify(value));
  } catch (err) {
    console.error(err);
  }
};

// Category Management
export const getCategories = () => getLocalSetting('categories', DEFAULT_CATEGORIES);
export const saveCategories = (cats) => setLocalSetting('categories', cats);

// Project Management
export const getProjects = () => getLocalSetting('projects', DEFAULT_PROJECTS);
export const saveProjects = (projs) => setLocalSetting('projects', projs);

// Staff Management
export const getStaffList = () => getLocalSetting('staff', DEFAULT_STAFF);
export const saveStaffList = (staff) => setLocalSetting('staff', staff);

// Transport Mode Management
export const getTransportModes = () => getLocalSetting('transport', DEFAULT_TRANSPORT);
export const saveTransportModes = (transports) => setLocalSetting('transport', transports);

// Auth Credentials
export const getAuthCredentials = () => {
  return getLocalSetting('auth', {
    adminPass: 'admin123',
    userPass: 'user123'
  });
};

export const saveAuthCredentials = (creds) => {
  setLocalSetting('auth', creds);
};

// Voucher Database CRUD via IndexedDB
export const getAllVouchers = async () => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_VOUCHERS, 'readonly');
      const store = tx.objectStore(STORE_VOUCHERS);
      const req = store.getAll();
      req.onsuccess = () => {
        const items = req.result || [];
        items.sort((a, b) => new Date(b.date) - new Date(a.date));
        resolve(items);
      };
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error('IndexedDB error', err);
    return getLocalSetting('vouchers_fallback', []);
  }
};

export const saveVoucher = async (voucher) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_VOUCHERS, 'readwrite');
    const store = tx.objectStore(STORE_VOUCHERS);
    const req = store.put(voucher);
    req.onsuccess = () => resolve(voucher);
    req.onerror = () => reject(req.error);
  });
};

export const deleteVoucher = async (id) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_VOUCHERS, 'readwrite');
    const store = tx.objectStore(STORE_VOUCHERS);
    const req = store.delete(id);
    req.onsuccess = () => resolve(true);
    req.onerror = () => reject(req.error);
  });
};

// Cash Advance Database CRUD via IndexedDB
export const getAllCashAdvances = async () => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_ADVANCES, 'readonly');
      const store = tx.objectStore(STORE_ADVANCES);
      const req = store.getAll();
      req.onsuccess = () => {
        const items = req.result || [];
        items.sort((a, b) => new Date(b.date) - new Date(a.date));
        resolve(items);
      };
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error('IndexedDB error', err);
    return getLocalSetting('advances_fallback', []);
  }
};

export const saveCashAdvance = async (advance) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_ADVANCES, 'readwrite');
    const store = tx.objectStore(STORE_ADVANCES);
    const req = store.put(advance);
    req.onsuccess = () => resolve(advance);
    req.onerror = () => reject(req.error);
  });
};

export const deleteCashAdvance = async (id) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_ADVANCES, 'readwrite');
    const store = tx.objectStore(STORE_ADVANCES);
    const req = store.delete(id);
    req.onsuccess = () => resolve(true);
    req.onerror = () => reject(req.error);
  });
};

// Helper function to convert uploaded file to Base64
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (err) => reject(err);
  });
};
