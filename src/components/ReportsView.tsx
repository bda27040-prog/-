import React, { useState } from 'react';
import { 
  BarChart3, 
  Printer, 
  Search, 
  Users, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle,
  ArrowUpRight,
  ArrowDownLeft,
  FileText
} from 'lucide-react';
import { CustomerSummary, Transaction, AppSettings } from '../types';
import { formatMoney, formatArabicDate } from '../utils/calculations';

interface ReportsViewProps {
  customers: CustomerSummary[];
  transactions: Transaction[];
  settings: AppSettings;
  onSelectCustomer: (customer: CustomerSummary) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  customers,
  transactions,
  settings,
  onSelectCustomer,
}) => {
  const [reportType, setReportType] = useState<'ALL' | 'DEBTORS' | 'CREDITORS' | 'TRANSACTIONS'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Calculate filtered lists
  const filteredCustomers = customers.filter((c) => {
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch = !q || c.name.toLowerCase().includes(q) || c.phone.includes(q);

    if (reportType === 'DEBTORS') {
      return matchesSearch && c.remainingBalance > 0;
    }
    if (reportType === 'CREDITORS') {
      return matchesSearch && c.remainingBalance < 0;
    }
    return matchesSearch;
  });

  // Filter transactions by date range
  const filteredTransactions = transactions.filter((tx) => {
    if (startDate && tx.date < startDate) return false;
    if (endDate && tx.date > endDate) return false;
    if (searchQuery.trim()) {
      const cust = customers.find((c) => c.id === tx.customerId);
      const q = searchQuery.trim().toLowerCase();
      const matches = tx.description.toLowerCase().includes(q) || (cust && cust.name.toLowerCase().includes(q));
      if (!matches) return false;
    }
    return true;
  });

  // Calculate overall totals
  const totalDebts = customers.reduce((sum, c) => sum + (c.remainingBalance > 0 ? c.remainingBalance : 0), 0);
  const totalCreditors = customers.reduce((sum, c) => sum + (c.remainingBalance < 0 ? Math.abs(c.remainingBalance) : 0), 0);
  const debtorsCount = customers.filter((c) => c.remainingBalance > 0).length;
  const creditorsCount = customers.filter((c) => c.remainingBalance < 0).length;
  const clearedCount = customers.filter((c) => c.remainingBalance === 0).length;

  const handlePrint = () => {
    try {
      window.print();
    } catch (err) {
      console.warn('Printing restricted in preview', err);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Report Header Bar */}
      <div className="no-print bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500 text-slate-950 p-2.5 rounded-xl font-bold">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white font-['Tajawal']">
              تقارير الحسابات والديون الشاملة
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              تحليل المبالغ المستحقة، العملاء الدائنين والمدينين والتصفية حسب التواريخ.
            </p>
          </div>
        </div>

        <button
          onClick={handlePrint}
          className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 transition shadow-sm"
        >
          <Printer className="w-4 h-4 text-emerald-400" />
          <span>طباعة / تصدير التقرير</span>
        </button>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-slate-400 font-bold block mb-1">إجمالي الديون المستحقة لنا (عليه)</span>
          <span className="text-2xl font-black text-rose-600 dark:text-rose-400 font-mono">
            {formatMoney(totalDebts, settings.currency)}
          </span>
          <span className="text-xs text-slate-500 block mt-1 font-semibold">
            عدد العملاء المدينين: {debtorsCount} عميل
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-slate-400 font-bold block mb-1">إجمالي مبالغ العملاء لدينا (له)</span>
          <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
            {formatMoney(totalCreditors, settings.currency)}
          </span>
          <span className="text-xs text-slate-500 block mt-1 font-semibold">
            عدد العملاء الدائنين: {creditorsCount} عميل
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-slate-400 font-bold block mb-1">الرصيد الصافي العام</span>
          <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">
            {formatMoney(totalDebts - totalCreditors, settings.currency)}
          </span>
          <span className="text-xs text-emerald-600 dark:text-emerald-400 block mt-1 font-semibold">
            حسابات خالصة تماماً: {clearedCount} عميل
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-slate-400 font-bold block mb-1">إجمالي العملاء المسجلين</span>
          <span className="text-2xl font-black text-blue-600 dark:text-blue-400 font-mono">
            {customers.length} <span className="text-sm font-normal text-slate-500">عميل</span>
          </span>
          <span className="text-xs text-slate-500 block mt-1 font-semibold">
            إجمالي العمليات المسجلة: {transactions.length} عملية
          </span>
        </div>
      </div>

      {/* Filter and Tab Options */}
      <div className="no-print bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        
        {/* Navigation Filters */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          <button
            onClick={() => setReportType('ALL')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              reportType === 'ALL'
                ? 'bg-slate-900 text-white dark:bg-emerald-500 dark:text-slate-950'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            تقرير جميع العملاء ({customers.length})
          </button>

          <button
            onClick={() => setReportType('DEBTORS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              reportType === 'DEBTORS'
                ? 'bg-rose-600 text-white'
                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
            }`}
          >
            العملاء الذين عليهم ديون ({debtorsCount})
          </button>

          <button
            onClick={() => setReportType('CREDITORS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              reportType === 'CREDITORS'
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
            }`}
          >
            العملاء الذين لهم رصيد لدينا ({creditorsCount})
          </button>

          <button
            onClick={() => setReportType('TRANSACTIONS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              reportType === 'TRANSACTIONS'
                ? 'bg-blue-600 text-white'
                : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
            }`}
          >
            تقرير جميع العمليات بالتاريخ ({filteredTransactions.length})
          </button>
        </div>

        {/* Date Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="relative">
            <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="البحث بالاسم أو رقم الهاتف..."
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pr-9 pl-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-[11px] text-slate-400 mb-0.5">من تاريخ:</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] text-slate-400 mb-0.5">إلى تاريخ:</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-slate-900 dark:text-white focus:outline-none"
            />
          </div>
        </div>

      </div>

      {/* Main Printable Report Table */}
      <div className="bg-white text-slate-900 rounded-2xl p-6 border border-slate-200 shadow-md space-y-4 print-card">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <h3 className="font-extrabold text-lg text-slate-900 font-['Tajawal']">
              {settings.merchantName || 'مؤسسة الجندي التجاري'} - تقرير ختامي
            </h3>
            <p className="text-xs text-slate-500">
              {reportType === 'DEBTORS' ? 'تقرير العملاء عليهم ديون (مدينين)' : reportType === 'CREDITORS' ? 'تقرير العملاء لهم رصيد (دائنين)' : reportType === 'TRANSACTIONS' ? 'تقرير الحركة المالية الحركي' : 'تقرير الحسابات العامة الشامل'}
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500">
            تاريخ اليوم: {formatArabicDate(new Date().toISOString().split('T')[0])}
          </span>
        </div>

        {reportType === 'TRANSACTIONS' ? (
          /* Transactions Report Table */
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white font-bold">
                  <th className="p-3">#</th>
                  <th className="p-3">التاريخ</th>
                  <th className="p-3">العميل</th>
                  <th className="p-3">نوع الحركة</th>
                  <th className="p-3">البيان</th>
                  <th className="p-3 text-center">المبلغ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredTransactions.map((tx, idx) => {
                  const cust = customers.find((c) => c.id === tx.customerId);
                  const isDebt = tx.type === 'DEBT';
                  return (
                    <tr key={tx.id} className="hover:bg-slate-50 transition">
                      <td className="p-3 font-mono text-slate-400">{idx + 1}</td>
                      <td className="p-3 font-mono">{formatArabicDate(tx.date)}</td>
                      <td className="p-3 font-bold text-slate-900">{cust ? cust.name : 'غير محدد'}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded font-bold ${isDebt ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'}`}>
                          {isDebt ? 'عليه (دين)' : 'له (سداد)'}
                        </span>
                      </td>
                      <td className="p-3">{tx.description}</td>
                      <td className={`p-3 text-center font-mono font-bold ${isDebt ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {formatMoney(tx.amount, settings.currency)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          /* Customers Report Table */
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white font-bold">
                  <th className="p-3">#</th>
                  <th className="p-3">اسم العميل</th>
                  <th className="p-3">رقم الهاتف</th>
                  <th className="p-3 text-center">إجمالي عليه (ديون)</th>
                  <th className="p-3 text-center">إجمالي له (مدفوعات)</th>
                  <th className="p-3 text-center">الرصيد المتبقي</th>
                  <th className="p-3 text-center">الحالة</th>
                  <th className="p-3 text-left no-print">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredCustomers.map((cust, idx) => {
                  const isDebtor = cust.remainingBalance > 0;
                  const isCreditor = cust.remainingBalance < 0;

                  return (
                    <tr key={cust.id} className="hover:bg-slate-50 transition">
                      <td className="p-3 font-mono text-slate-400">{idx + 1}</td>
                      <td className="p-3 font-extrabold text-slate-900">{cust.name}</td>
                      <td className="p-3 font-mono dir-ltr text-right">{cust.phone}</td>
                      <td className="p-3 text-center font-mono text-rose-600 font-bold">
                        {formatMoney(cust.totalDebt, settings.currency)}
                      </td>
                      <td className="p-3 text-center font-mono text-emerald-600 font-bold">
                        {formatMoney(cust.totalPaid, settings.currency)}
                      </td>
                      <td className="p-3 text-center font-mono font-black text-slate-900">
                        {formatMoney(cust.remainingBalance, settings.currency)}
                      </td>
                      <td className="p-3 text-center font-bold">
                        {isDebtor ? (
                          <span className="bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full text-[10px]">
                            عليه رصيد
                          </span>
                        ) : isCreditor ? (
                          <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-[10px]">
                            له رصيد
                          </span>
                        ) : (
                          <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full text-[10px]">
                            خالص الحساب
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-left no-print">
                        <button
                          onClick={() => onSelectCustomer(cust)}
                          className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-[11px] px-2.5 py-1 rounded-lg flex items-center gap-1 transition"
                        >
                          <FileText className="w-3.5 h-3.5 text-emerald-400" />
                          <span>كشف حساب</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
