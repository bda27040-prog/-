import { Customer, Transaction, AppSettings } from '../types';
import { INITIAL_CUSTOMERS, INITIAL_TRANSACTIONS, DEFAULT_SETTINGS } from '../data/mockData';

const CUSTOMERS_KEY = 'aljundi_customers_v1';
const TRANSACTIONS_KEY = 'aljundi_transactions_v1';
const SETTINGS_KEY = 'aljundi_settings_v1';

export function loadCustomers(): Customer[] {
  try {
    const raw = localStorage.getItem(CUSTOMERS_KEY);
    if (!raw) {
      saveCustomers(INITIAL_CUSTOMERS);
      return INITIAL_CUSTOMERS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error loading customers from localStorage:', err);
    return INITIAL_CUSTOMERS;
  }
}

export function saveCustomers(customers: Customer[]): void {
  try {
    localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(customers));
  } catch (err) {
    console.error('Error saving customers to localStorage:', err);
  }
}

export function loadTransactions(): Transaction[] {
  try {
    const raw = localStorage.getItem(TRANSACTIONS_KEY);
    if (!raw) {
      saveTransactions(INITIAL_TRANSACTIONS);
      return INITIAL_TRANSACTIONS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error loading transactions from localStorage:', err);
    return INITIAL_TRANSACTIONS;
  }
}

export function saveTransactions(transactions: Transaction[]): void {
  try {
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
  } catch (err) {
    console.error('Error saving transactions to localStorage:', err);
  }
}

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) {
      saveSettings(DEFAULT_SETTINGS);
      return DEFAULT_SETTINGS;
    }
    const parsed = JSON.parse(raw);
    const themeMode = parsed.themeMode || (parsed.darkMode ? 'dark' : 'system');
    return { 
      ...DEFAULT_SETTINGS, 
      ...parsed,
      themeMode,
      darkMode: themeMode === 'dark',
    };
  } catch (err) {
    console.error('Error loading settings from localStorage:', err);
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error('Error saving settings to localStorage:', err);
  }
}

export function exportBackupJSON(customers: Customer[], transactions: Transaction[], settings: AppSettings): string {
  const payload = {
    appName: 'الجندي حساب',
    version: '1.0',
    exportedAt: new Date().toISOString(),
    customers,
    transactions,
    settings,
  };
  return JSON.stringify(payload, null, 2);
}

export function importBackupJSON(jsonStr: string): { customers: Customer[]; transactions: Transaction[]; settings: AppSettings } {
  const data = JSON.parse(jsonStr);
  if (!data || !Array.isArray(data.customers) || !Array.isArray(data.transactions)) {
    throw new Error('ملف النسخة الاحتياطية غير صالحة أو ينقصه هيكل البيانات المطلوبة.');
  }
  saveCustomers(data.customers);
  saveTransactions(data.transactions);
  if (data.settings) {
    saveSettings(data.settings);
  }
  return {
    customers: data.customers,
    transactions: data.transactions,
    settings: data.settings || DEFAULT_SETTINGS,
  };
}

export function resetToSampleData(): { customers: Customer[]; transactions: Transaction[]; settings: AppSettings } {
  saveCustomers(INITIAL_CUSTOMERS);
  saveTransactions(INITIAL_TRANSACTIONS);
  saveSettings(DEFAULT_SETTINGS);
  return {
    customers: INITIAL_CUSTOMERS,
    transactions: INITIAL_TRANSACTIONS,
    settings: DEFAULT_SETTINGS,
  };
}

export function clearAllData(): { customers: Customer[]; transactions: Transaction[]; settings: AppSettings } {
  saveCustomers([]);
  saveTransactions([]);
  saveSettings(DEFAULT_SETTINGS);
  return {
    customers: [],
    transactions: [],
    settings: DEFAULT_SETTINGS,
  };
}
