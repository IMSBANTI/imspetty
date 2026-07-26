import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import CashAdvanceManager from './components/CashAdvanceManager';
import VoucherForm from './components/VoucherForm';
import VoucherList from './components/VoucherList';
import ExpenditureAnalytics from './components/ExpenditureAnalytics';
import ReportGenerator from './components/ReportGenerator';
import CloudSyncManager from './components/CloudSyncManager';
import AdminPanel from './components/AdminPanel';
import PasswordManager from './components/PasswordManager';
import LoginModal from './components/LoginModal';

import {
  getCategories, saveCategories,
  getProjects, saveProjects,
  getStaffList, saveStaffList,
  getTransportModes, saveTransportModes,
  getAllVouchers, saveVoucher, deleteVoucher,
  getAllCashAdvances, saveCashAdvance, deleteCashAdvance,
  getLocalSetting, setLocalSetting
} from './services/db';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null); // { role: 'admin' | 'user' }
  const [activeTab, setActiveTab] = useState('dashboard');
  const [theme, setTheme] = useState(() => getLocalSetting('theme', 'dark')); // 'dark' or 'light'

  const [categories, setCategories] = useState([]);
  const [projects, setProjects] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [transportModes, setTransportModes] = useState([]);
  const [vouchers, setVouchers] = useState([]);
  const [cashAdvances, setCashAdvances] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sync theme with body class and localStorage
  useEffect(() => {
    document.body.classList.remove('dark-mode', 'light-mode');
    document.body.classList.add(theme === 'dark' ? 'dark-mode' : 'light-mode');
    
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    setLocalSetting('theme', theme);
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Load configuration & data on mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const cats = getCategories();
        const projs = getProjects();
        const staff = getStaffList();
        const transport = getTransportModes();
        const vList = await getAllVouchers();
        const advList = await getAllCashAdvances();

        setCategories(cats);
        setProjects(projs);
        setStaffList(staff);
        setTransportModes(transport);
        setVouchers(vList);
        setCashAdvances(advList);
      } catch (err) {
        console.error('Data load error', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Voucher CRUD handlers
  const handleSaveVoucher = async (voucherData) => {
    await saveVoucher(voucherData);
    const updatedList = await getAllVouchers();
    setVouchers(updatedList);
  };

  const handleDeleteVoucher = async (id) => {
    await deleteVoucher(id);
    const updatedList = await getAllVouchers();
    setVouchers(updatedList);
  };

  // Cash Advance CRUD handlers
  const handleSaveCashAdvance = async (advanceData) => {
    await saveCashAdvance(advanceData);
    const updatedList = await getAllCashAdvances();
    setCashAdvances(updatedList);
  };

  const handleDeleteCashAdvance = async (id) => {
    await deleteCashAdvance(id);
    const updatedList = await getAllCashAdvances();
    setCashAdvances(updatedList);
  };

  // Cloud Import Restore Handler
  const handleCloudImport = async (data) => {
    if (data.vouchers && Array.isArray(data.vouchers)) {
      for (const v of data.vouchers) {
        await saveVoucher(v);
      }
    }
    if (data.cashAdvances && Array.isArray(data.cashAdvances)) {
      for (const a of data.cashAdvances) {
        await saveCashAdvance(a);
      }
    }
    if (data.categories && Array.isArray(data.categories)) {
      setCategories(data.categories);
      saveCategories(data.categories);
    }
    if (data.projects && Array.isArray(data.projects)) {
      setProjects(data.projects);
      saveProjects(data.projects);
    }

    const updatedV = await getAllVouchers();
    const updatedA = await getAllCashAdvances();
    setVouchers(updatedV);
    setCashAdvances(updatedA);
  };

  // Category CRUD
  const handleUpdateCategories = (newCats) => {
    setCategories(newCats);
    saveCategories(newCats);
  };

  // Project CRUD
  const handleUpdateProjects = (newProjs) => {
    setProjects(newProjs);
    saveProjects(newProjs);
  };

  // Staff CRUD
  const handleUpdateStaff = (newStaff) => {
    setStaffList(newStaff);
    saveStaffList(newStaff);
  };

  // Transport CRUD
  const handleUpdateTransport = (newTrans) => {
    setTransportModes(newTrans);
    saveTransportModes(newTrans);
  };

  // Show Login screen if not authenticated
  if (!currentUser) {
    return <LoginModal onLoginSuccess={(user) => setCurrentUser(user)} />;
  }

  return (
    <div className="min-h-screen transition-colors duration-200 flex flex-col font-sans">
      {/* Top Header */}
      <Header 
        currentUser={currentUser} 
        onLogout={() => setCurrentUser(null)} 
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* Navbar Tabs */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isAdmin={currentUser.role === 'admin'} 
      />

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-slate-400">
            <span>Loading system data...</span>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <Dashboard 
                vouchers={vouchers} 
                cashAdvances={cashAdvances}
                onNavigateAdd={() => setActiveTab('addVoucher')} 
                onNavigateCashIn={() => setActiveTab('cashIn')}
              />
            )}

            {activeTab === 'cashIn' && (
              <CashAdvanceManager 
                cashAdvances={cashAdvances}
                vouchers={vouchers}
                onSaveAdvance={handleSaveCashAdvance}
                onDeleteAdvance={handleDeleteCashAdvance}
                isAdmin={currentUser.role === 'admin'}
              />
            )}

            {activeTab === 'addVoucher' && (
              <VoucherForm 
                categories={categories}
                projects={projects}
                staffList={staffList}
                transportModes={transportModes}
                onSaveVoucher={handleSaveVoucher}
              />
            )}

            {activeTab === 'records' && (
              <VoucherList 
                vouchers={vouchers}
                categories={categories}
                projects={projects}
                onDeleteVoucher={handleDeleteVoucher}
                isAdmin={currentUser.role === 'admin'}
              />
            )}

            {activeTab === 'analytics' && (
              <ExpenditureAnalytics 
                vouchers={vouchers}
                categories={categories}
                projects={projects}
              />
            )}

            {activeTab === 'reports' && (
              <ReportGenerator 
                vouchers={vouchers}
                categories={categories}
                projects={projects}
                staffList={staffList}
              />
            )}

            {activeTab === 'cloud' && (
              <CloudSyncManager 
                vouchers={vouchers}
                cashAdvances={cashAdvances}
                categories={categories}
                projects={projects}
                staffList={staffList}
                transportModes={transportModes}
                onImportData={handleCloudImport}
              />
            )}

            {activeTab === 'admin' && currentUser.role === 'admin' && (
              <AdminPanel 
                categories={categories}
                onSaveCategories={handleUpdateCategories}
                projects={projects}
                onSaveProjects={handleUpdateProjects}
                staffList={staffList}
                onSaveStaffList={handleUpdateStaff}
                transportModes={transportModes}
                onSaveTransportModes={handleUpdateTransport}
              />
            )}

            {activeTab === 'passwords' && (
              <PasswordManager currentUser={currentUser} />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800/80 py-4 text-center text-xs text-slate-500">
        <p>© {new Date().getFullYear()} IMS Group (Integrated Marketing Service Ltd.). All rights reserved.</p>
      </footer>
    </div>
  );
}
