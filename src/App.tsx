import React, { useState, useEffect } from 'react';
import { Customer, Transaction, AppSettings, FilterOptions, CustomerSummary, ThemeMode } from './types';
import { 
  loadCustomers, 
  saveCustomers, 
  loadTransactions, 
  saveTransactions, 
  loadSettings, 
  saveSettings, 
  resetToSampleData, 
  clearAllData 
} from './utils/storage';
import { computeCustomerSummaries, calculateOverallStats } from './utils/calculations';

import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { CustomerList } from './components/CustomerList';
import { CustomerStatementView } from './components/CustomerStatementView';
import { OverdueAlertsView } from './components/OverdueAlertsView';
import { ReportsView } from './components/ReportsView';
import { FlutterCodeViewer } from './components/FlutterCodeViewer';
import { SettingsBackupModal } from './components/SettingsBackupModal';
import { AddCustomerModal } from './components/AddCustomerModal';
import { AddTransactionModal } from './components/AddTransactionModal';
import { ConfirmModal } from './components/ConfirmModal';
import { PasscodeLockModal } from './components/PasscodeLockModal';

export default function App() {
  const [customers, setCustomers] = useState<Customer[]>(() => loadCustomers());
  const [transactions, setTransactions] = useState<Transaction[]>(() => loadTransactions());
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());

  // Passcode Lock State
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => !settings.enablePasscode);

  // Active Tab View
  const [activeTab, setActiveTab] = useState<'dashboard' | 'customers' | 'reports' | 'overdue' | 'flutter' | 'settings'>('dashboard');

  // Currently opened customer for statement view
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  // Search and Filters
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    searchQuery: '',
    statusFilter: 'ALL',
    categoryFilter: 'ALL',
    sortBy: 'NEWEST',
  });

  // Modals state
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [customerToEdit, setCustomerToEdit] = useState<Customer | null>(null);

  const [isAddTxOpen, setIsAddTxOpen] = useState(false);
  const [txToEdit, setTxToEdit] = useState<Transaction | null>(null);
  const [preselectedCustomerId, setPreselectedCustomerId] = useState<string | undefined>(undefined);
  const [defaultTxType, setDefaultTxType] = useState<'DEBT' | 'PAYMENT'>('DEBT');

  // Confirmation Modal State
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info';
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // System Theme / Dark Mode HTML class sync
  useEffect(() => {
    const mode = settings.themeMode || (settings.darkMode ? 'dark' : 'system');
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const updateTheme = () => {
      let isDark = false;
      if (mode === 'dark') {
        isDark = true;
      } else if (mode === 'light') {
        isDark = false;
      } else {
        // 'system'
        isDark = mediaQuery.matches;
      }

      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    updateTheme();

    const handleSystemChange = () => {
      if ((settings.themeMode || 'system') === 'system') {
        updateTheme();
      }
    };

    mediaQuery.addEventListener('change', handleSystemChange);
    return () => mediaQuery.removeEventListener('change', handleSystemChange);
  }, [settings.themeMode, settings.darkMode]);

  // Sync state to local storage
  useEffect(() => {
    saveCustomers(customers);
  }, [customers]);

  useEffect(() => {
    saveTransactions(transactions);
  }, [transactions]);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  // Derived summaries & overall stats
  const customerSummaries = computeCustomerSummaries(customers, transactions);
  const stats = calculateOverallStats(customerSummaries);

  const activeCustomerSummary = selectedCustomerId 
    ? customerSummaries.find((c) => String(c.id).trim() === String(selectedCustomerId).trim()) || null 
    : null;

  // Handlers for Customer
  const handleSaveCustomer = (customerData: Partial<Customer>) => {
    const nowStr = new Date().toISOString();
    if (customerData.id) {
      // Edit
      setCustomers((prev) =>
        prev.map((c) =>
          c.id === customerData.id
            ? { ...c, ...customerData, updatedAt: nowStr } as Customer
            : c
        )
      );
    } else {
      // Add
      const newCust: Customer = {
        id: `cust-${Date.now()}`,
        name: customerData.name || '',
        phone: customerData.phone || '',
        category: customerData.category || 'عميل',
        notes: customerData.notes || '',
        address: customerData.address || '',
        createdAt: nowStr,
        updatedAt: nowStr,
      };
      setCustomers((prev) => [newCust, ...prev]);
    }
  };

  const handleDeleteCustomer = (id: string, name: string) => {
    setConfirmConfig({
      isOpen: true,
      title: 'حذف حساب العميل',
      message: `هل أنت متأكد من حذف العميل "${name}"؟ سيتم حذف كافة السجلات والديون والسدادات المرتبطة به.`,
      confirmText: 'نعم، حذف العميل',
      cancelText: 'إلغاء',
      variant: 'danger',
      onConfirm: () => {
        setCustomers((prev) => prev.filter((c) => c.id !== id));
        setTransactions((prev) => prev.filter((t) => t.customerId !== id));
        if (selectedCustomerId === id) {
          setSelectedCustomerId(null);
        }
        setConfirmConfig((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  // Handlers for Transactions
  const handleSaveTransaction = (txData: Partial<Transaction>) => {
    const nowStr = new Date().toISOString();

    if (txData.id) {
      // Edit transaction
      setTransactions((prev) =>
        prev.map((t) =>
          t.id === txData.id ? ({ ...t, ...txData } as Transaction) : t
        )
      );
    } else {
      // Create transaction
      const newTx: Transaction = {
        id: `tx-${Date.now()}`,
        customerId: txData.customerId || '',
        type: txData.type || 'DEBT',
        amount: Number(txData.amount) || 0,
        date: txData.date || new Date().toISOString().split('T')[0],
        dueDate: txData.dueDate,
        description: txData.description || '',
        paymentMethod: txData.paymentMethod,
        receiptNo: txData.receiptNo,
        notes: txData.notes,
        createdAt: nowStr,
      };
      setTransactions((prev) => [newTx, ...prev]);
    }
  };

  const handleDeleteTransaction = (txId: string) => {
    setConfirmConfig({
      isOpen: true,
      title: 'حذف الحركة المالية',
      message: 'هل أنت متأكد من حذف هذه الحركة المالية من كشف الحساب؟',
      confirmText: 'نعم، حذف الحركة',
      cancelText: 'إلغاء',
      variant: 'danger',
      onConfirm: () => {
        setTransactions((prev) => prev.filter((t) => t.id !== txId));
        setConfirmConfig((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  // Trigger Open Transaction Modal
  const handleOpenAddTxModal = (cust?: string, type: 'DEBT' | 'PAYMENT' = 'DEBT') => {
    setTxToEdit(null);
    setPreselectedCustomerId(cust);
    setDefaultTxType(type);
    setIsAddTxOpen(true);
  };

  const handleEditTxModal = (tx: Transaction) => {
    setTxToEdit(tx);
    setPreselectedCustomerId(tx.customerId);
    setDefaultTxType(tx.type);
    setIsAddTxOpen(true);
  };

  // Reset sample data
  const handleResetSampleData = () => {
    setConfirmConfig({
      isOpen: true,
      title: 'استعادة البيانات التجريبية',
      message: 'هل ترغب في استعادة البيانات التجريبية للاختبار والتجربة؟',
      confirmText: 'نعم، استعادة',
      cancelText: 'إلغاء',
      variant: 'info',
      onConfirm: () => {
        const sample = resetToSampleData();
        setCustomers(sample.customers);
        setTransactions(sample.transactions);
        setSettings(sample.settings);
        setSelectedCustomerId(null);
        setConfirmConfig((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  // Clear all data
  const handleClearAllData = () => {
    setConfirmConfig({
      isOpen: true,
      title: 'مسح كافة البيانات نهائياً',
      message: 'هل أنت متأكد من مسح كافة بيانات العملاء والديون نهائياً؟ لا يمكن التراجع بعد هذه الخطوة.',
      confirmText: 'نعم، مسح البيانات',
      cancelText: 'إلغاء',
      variant: 'danger',
      onConfirm: () => {
        const cleared = clearAllData();
        setCustomers(cleared.customers);
        setTransactions(cleared.transactions);
        setSettings(cleared.settings);
        setSelectedCustomerId(null);
        setConfirmConfig((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  // Import JSON backup
  const handleImportBackup = (imported: { customers: Customer[]; transactions: Transaction[]; settings: AppSettings }) => {
    setCustomers(imported.customers);
    setTransactions(imported.transactions);
    setSettings(imported.settings);
    setSelectedCustomerId(null);
  };

  // Toggle theme mode (System -> Dark -> Light -> System)
  const handleToggleTheme = () => {
    const currentMode = settings.themeMode || (settings.darkMode ? 'dark' : 'system');
    const nextMode: ThemeMode = currentMode === 'system' ? 'dark' : currentMode === 'dark' ? 'light' : 'system';
    setSettings((prev) => ({
      ...prev,
      themeMode: nextMode,
      darkMode: nextMode === 'dark',
    }));
  };

  // If passcode enabled and locked, display security lock modal
  if (settings.enablePasscode && !isUnlocked) {
    return (
      <PasscodeLockModal
        correctPasscode={settings.passcode || '1234'}
        onSuccess={() => setIsUnlocked(true)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-['Cairo',sans-serif] selection:bg-emerald-500 selection:text-white">
      {/* Header Bar */}
      <Header
        settings={settings}
        stats={stats}
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setSelectedCustomerId(null); // Return to standard view
        }}
        onOpenAddCustomer={() => {
          setCustomerToEdit(null);
          setIsAddCustomerOpen(true);
        }}
        onOpenAddTransaction={(cust, type) => handleOpenAddTxModal(cust, type)}
        searchQuery={filterOptions.searchQuery}
        setSearchQuery={(q) => {
          setFilterOptions((prev) => ({ ...prev, searchQuery: q }));
          if (q.trim()) {
            setActiveTab('customers');
          }
        }}
        onResetSampleData={handleResetSampleData}
        onToggleTheme={handleToggleTheme}
        onChangeCurrency={(currency) => setSettings((prev) => ({ ...prev, currency }))}
      />

      {/* Main Workspace Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        {activeCustomerSummary ? (
          /* Statement View for Selected Customer */
          <CustomerStatementView
            customer={activeCustomerSummary}
            transactions={transactions.filter((tx) => String(tx.customerId).trim() === String(selectedCustomerId).trim())}
            settings={settings}
            onBack={() => setSelectedCustomerId(null)}
            onOpenAddTransaction={(cust, type) => handleOpenAddTxModal(cust, type)}
            onEditTransaction={handleEditTxModal}
            onDeleteTransaction={handleDeleteTransaction}
          />
        ) : selectedCustomerId ? (
          <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-4">
            <p className="text-slate-700 dark:text-slate-200 font-bold text-base">
              لم يتم العثور على بيانات العميل المحدد.
            </p>
            <button
              onClick={() => setSelectedCustomerId(null)}
              className="bg-slate-800 hover:bg-slate-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition shadow-sm cursor-pointer"
            >
              الرجوع للعملاء
            </button>
          </div>
        ) : (
          /* Normal Tab Workspace */
          <>
            {activeTab === 'dashboard' && (
              <Dashboard
                stats={stats}
                customerSummaries={customerSummaries}
                recentTransactions={transactions}
                settings={settings}
                onOpenAddCustomer={() => {
                  setCustomerToEdit(null);
                  setIsAddCustomerOpen(true);
                }}
                onOpenAddTransaction={(cust, type) => handleOpenAddTxModal(cust, type)}
                onSelectCustomer={(cust) => setSelectedCustomerId(cust.id)}
                onGoToOverdue={() => setActiveTab('overdue')}
                onGoToCustomers={() => setActiveTab('customers')}
              />
            )}

            {activeTab === 'customers' && (
              <CustomerList
                customers={customerSummaries}
                settings={settings}
                filterOptions={filterOptions}
                setFilterOptions={setFilterOptions}
                onOpenAddCustomer={() => {
                  setCustomerToEdit(null);
                  setIsAddCustomerOpen(true);
                }}
                onOpenEditCustomer={(cust) => {
                  setCustomerToEdit(cust);
                  setIsAddCustomerOpen(true);
                }}
                onDeleteCustomer={handleDeleteCustomer}
                onOpenAddTransaction={(cust, type) => handleOpenAddTxModal(cust, type)}
                onSelectCustomer={(cust) => setSelectedCustomerId(cust.id)}
              />
            )}

            {activeTab === 'reports' && (
              <ReportsView
                customers={customerSummaries}
                transactions={transactions}
                settings={settings}
                onSelectCustomer={(cust) => setSelectedCustomerId(cust.id)}
              />
            )}

            {activeTab === 'overdue' && (
              <OverdueAlertsView
                customers={customerSummaries}
                transactions={transactions}
                settings={settings}
                onSelectCustomer={(cust) => setSelectedCustomerId(cust.id)}
                onOpenAddTransaction={(cust, type) => handleOpenAddTxModal(cust, type)}
              />
            )}

            {activeTab === 'flutter' && (
              <FlutterCodeViewer />
            )}

            {activeTab === 'settings' && (
              <SettingsBackupModal
                settings={settings}
                onSaveSettings={setSettings}
                customers={customers}
                transactions={transactions}
                onImportBackup={handleImportBackup}
                onResetSampleData={handleResetSampleData}
                onClearAllData={handleClearAllData}
              />
            )}
          </>
        )}
      </main>

      {/* Add / Edit Customer Modal */}
      <AddCustomerModal
        isOpen={isAddCustomerOpen}
        onClose={() => {
          setIsAddCustomerOpen(false);
          setCustomerToEdit(null);
        }}
        onSave={handleSaveCustomer}
        initialData={customerToEdit}
      />

      {/* Add / Edit Transaction Modal */}
      <AddTransactionModal
        isOpen={isAddTxOpen}
        onClose={() => {
          setIsAddTxOpen(false);
          setTxToEdit(null);
        }}
        onSave={handleSaveTransaction}
        customers={customerSummaries}
        preselectedCustomerId={preselectedCustomerId}
        defaultType={defaultTxType}
        initialData={txToEdit}
        currency={settings.currency}
      />

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        confirmText={confirmConfig.confirmText}
        cancelText={confirmConfig.cancelText}
        variant={confirmConfig.variant}
        onConfirm={confirmConfig.onConfirm}
        onCancel={() => setConfirmConfig((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
