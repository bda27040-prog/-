export type TransactionType = 'DEBT' | 'PAYMENT'; // 'DEBT' = عليه, 'PAYMENT' = له

export type CustomerCategory = 'عميل' | 'مورد' | 'صديق' | 'شركة' | 'آخر';

export interface Transaction {
  id: string;
  customerId: string;
  type: TransactionType; // 'DEBT' (عليه) or 'PAYMENT' (له)
  amount: number;
  currency?: string; // 'ر.س' | 'ر.ي' | '$'
  date: string; // YYYY-MM-DD
  dueDate?: string; // YYYY-MM-DD for DEBT
  description: string;
  paymentMethod?: 'نقداً' | 'تحويل بنكي' | 'شبكة' | 'شيك' | 'أخرى';
  receiptNo?: string;
  notes?: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address?: string;
  notes?: string;
  category?: CustomerCategory;
  createdAt: string;
  updatedAt: string;
}

export type CustomerStatus = 'CLEARED' | 'DEBTOR' | 'CREDITOR' | 'OVERDUE';

export interface CustomerSummary extends Customer {
  totalDebt: number; // إجمالي عليه (DEBT)
  totalPaid: number; // إجمالي له (PAYMENT)
  remainingBalance: number; // الرصيد النهائي: >0 (عليه / مدين), <0 (له / دائن)
  status: CustomerStatus;
  overdueCount: number;
  lastTransactionDate?: string;
  nextDueDate?: string;
}

export interface FilterOptions {
  searchQuery: string;
  statusFilter: 'ALL' | 'DEBTOR' | 'CREDITOR' | 'CLEARED' | 'OVERDUE';
  categoryFilter: string;
  sortBy: 'BALANCE_DESC' | 'BALANCE_ASC' | 'NAME' | 'NEWEST' | 'OVERDUE';
  startDate?: string;
  endDate?: string;
}

export type ThemeMode = 'system' | 'dark' | 'light';

export interface AppSettings {
  appName: string;
  slogan: string;
  currency: string;
  merchantName: string;
  merchantPhone: string;
  merchantNotes: string;
  overdueAlertDays: number;
  enableAutoBackupReminder: boolean;
  themeMode: ThemeMode;
  darkMode: boolean;
  enablePasscode: boolean;
  passcode: string;
  firebaseSyncEnabled: boolean;
  firebaseApiKey?: string;
  firebaseProjectId?: string;
}

export interface OverallStats {
  totalCustomers: number;
  totalDebts: number; // إجمالي عليه
  totalPaid: number;  // إجمالي له
  netRemaining: number; // الرصيد الصافي
  overdueCustomersCount: number;
  overdueAmount: number;
  clearedCustomersCount: number;
  creditorsCount: number; // العملاء الذين لهم رصيد لدينا
  totalCreditorsAmount: number;
}
