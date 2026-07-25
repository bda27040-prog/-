import React from 'react';
import { 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Users, 
  AlertTriangle, 
  PlusCircle, 
  UserPlus, 
  FileText, 
  CheckCircle2, 
  Clock, 
  MessageSquare, 
  ExternalLink,
  ChevronLeft,
  Calendar,
  Wallet
} from 'lucide-react';
import { CustomerSummary, Transaction, OverallStats, AppSettings } from '../types';
import { formatMoney, formatArabicDate, generateWhatsAppReminderUrl } from '../utils/calculations';

interface DashboardProps {
  stats: OverallStats;
  customerSummaries: CustomerSummary[];
  recentTransactions: Transaction[];
  settings: AppSettings;
  onOpenAddCustomer: () => void;
  onOpenAddTransaction: (customerId?: string, type?: 'DEBT' | 'PAYMENT') => void;
  onSelectCustomer: (customer: CustomerSummary) => void;
  onGoToOverdue: () => void;
  onGoToCustomers: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  stats,
  customerSummaries,
  recentTransactions,
  settings,
  onOpenAddCustomer,
  onOpenAddTransaction,
  onSelectCustomer,
  onGoToOverdue,
  onGoToCustomers,
}) => {
  // Top Debtors (Customers who owe the most)
  const topDebtors = [...customerSummaries]
    .filter((c) => c.remainingBalance > 0)
    .sort((a, b) => b.remainingBalance - a.remainingBalance)
    .slice(0, 5);

  // Overdue customers
  const overdueCustomers = customerSummaries.filter((c) => c.status === 'OVERDUE');

  return (
    <div className="space-y-6 pb-12">
      {/* Welcome & Slogan Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl p-6 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2.5 py-0.5 rounded-full font-bold border border-emerald-500/30">
                لوحة التحكم المالية
              </span>
              <span className="text-slate-400 text-xs font-medium">
                تحديث تلقائي لحظي
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-['Tajawal'] text-white">
              أهلاً بك في {settings.appName || 'الجندي حساب'}
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm mt-1">
              نظامك البسيط لإدارة الديون والعملاء، متابعة المبالغ المستحقة والتنبيه بالمتأخرات بذكاء.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onOpenAddTransaction(undefined, 'DEBT')}
              className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm flex items-center gap-1.5 transition shadow-lg shadow-emerald-500/20"
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>تسجيل دين جديد</span>
            </button>

            <button
              onClick={() => onOpenAddTransaction(undefined, 'PAYMENT')}
              className="bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/40 font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm flex items-center gap-1.5 transition"
            >
              <ArrowDownLeft className="w-4 h-4" />
              <span>تسجيل دفعة سداد</span>
            </button>
          </div>
        </div>
      </div>

      {/* Overdue Alert Callout if any */}
      {stats.overdueCustomersCount > 0 && (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-start sm:items-center gap-3">
            <div className="bg-rose-500 text-white p-2.5 rounded-xl shadow-md shrink-0">
              <AlertTriangle className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-rose-900 dark:text-rose-200 text-sm sm:text-base">
                  تنبيه: يوجد {stats.overdueCustomersCount} عميل لديهم ديون متأخرة عن الموعد!
                </h3>
              </div>
              <p className="text-xs text-rose-700 dark:text-rose-300 mt-0.5">
                إجمالي المبالغ المتأخرة السداد: <strong className="font-mono text-sm">{formatMoney(stats.overdueAmount, settings.currency)}</strong>. يُنصح بإرسال تذكيرات سريعة.
              </p>
            </div>
          </div>

          <button
            onClick={onGoToOverdue}
            className="bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-bold px-4 py-2 rounded-xl flex items-center justify-center gap-1.5 transition shadow-sm shrink-0"
          >
            <span>متابعة الديون المتأخرة</span>
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Outstanding Balance */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-emerald-500/40 transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">إجمالي الديون المستحقة لنا</span>
            <div className="bg-amber-500/10 text-amber-600 dark:text-amber-400 p-2 rounded-xl">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono tracking-tight">
            {formatMoney(stats.netRemaining, settings.currency)}
          </div>
          <p className="text-xs text-slate-500 mt-2 flex items-center justify-between">
            <span>إجمالي الديون المسجلة: {formatMoney(stats.totalDebts, settings.currency)}</span>
          </p>
        </div>

        {/* Total Paid / Collected */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-emerald-500/40 transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">إجمالي المبالغ المسددة</span>
            <div className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 p-2 rounded-xl">
              <ArrowDownLeft className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono tracking-tight">
            {formatMoney(stats.totalPaid, settings.currency)}
          </div>
          <p className="text-xs text-slate-500 mt-2">
            مقبوضة ومسجلة في الحسابات
          </p>
        </div>

        {/* Total Customers */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-emerald-500/40 transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">إجمالي العملاء المسجلين</span>
            <div className="bg-blue-500/10 text-blue-600 dark:text-blue-400 p-2 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono tracking-tight">
            {stats.totalCustomers} <span className="text-sm font-normal text-slate-500">عميل</span>
          </div>
          <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>منهم {stats.clearedCustomersCount} حساب خالص بالكامل</span>
          </p>
        </div>

        {/* Overdue Dues */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-rose-500/40 transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">الديون المتأخرة عن الموعد</span>
            <div className="bg-rose-500/10 text-rose-600 dark:text-rose-400 p-2 rounded-xl">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 font-mono tracking-tight">
            {formatMoney(stats.overdueAmount, settings.currency)}
          </div>
          <p className="text-xs text-rose-600 dark:text-rose-400 mt-2 font-semibold">
            عدد الحسابات المتأخرة: {stats.overdueCustomersCount} عميل
          </p>
        </div>

      </div>

      {/* Two Column Layout: Top Debtors + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Top Debtors Section (2 Cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base font-['Tajawal'] flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-amber-500" />
                <span>أعلى العملاء ديناً (المستحقات)</span>
              </h3>
              <p className="text-xs text-slate-500">العملاء الذين لديهم أكبر مبالغ متبقية بحاجة لمتابعة</p>
            </div>

            <button
              onClick={onGoToCustomers}
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              <span>عرض كافة العملاء ({customerSummaries.length})</span>
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

          {topDebtors.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-500 mb-2 opacity-80" />
              <p className="font-bold text-slate-700 dark:text-slate-300">ممتاز! لا يوجد أي عميل عليه ديون حالياً.</p>
              <p className="text-xs text-slate-500 mt-1">كافة الحسابات متوازنة وخالصة بالكامل.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {topDebtors.map((customer) => {
                const isOverdue = customer.status === 'OVERDUE';
                const whatsappUrl = generateWhatsAppReminderUrl(customer, settings.currency, settings.merchantName);

                return (
                  <div
                    key={customer.id}
                    className="p-3.5 sm:p-4 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/30 hover:border-emerald-500/40 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                        isOverdue 
                          ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30' 
                          : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                      }`}>
                        {customer.name.substring(0, 2)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 
                            onClick={() => onSelectCustomer(customer)}
                            className="font-bold text-slate-900 dark:text-white text-sm hover:text-emerald-500 cursor-pointer transition"
                          >
                            {customer.name}
                          </h4>
                          {isOverdue && (
                            <span className="bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[10px] px-2 py-0.5 rounded-md font-bold border border-rose-500/20">
                              متأخر
                            </span>
                          )}
                          {customer.category && (
                            <span className="bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] px-2 py-0.5 rounded-md">
                              {customer.category}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 font-mono dir-ltr text-right">
                          {customer.phone}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 border-slate-200 dark:border-slate-800 pt-2 sm:pt-0">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block">المبلغ المتبقي</span>
                        <span className="font-extrabold text-sm sm:text-base text-rose-600 dark:text-rose-400 font-mono">
                          {formatMoney(customer.remainingBalance, settings.currency)}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => onSelectCustomer(customer)}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition"
                          title="عرض كشف الحساب الكامل"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>كشف الحساب</span>
                        </button>

                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-emerald-500/15 hover:bg-emerald-500 text-emerald-600 hover:text-slate-950 text-xs p-1.5 rounded-lg transition border border-emerald-500/30"
                          title="تذكير عبر واتساب"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Activity Feed (1 Col) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="font-bold text-slate-900 dark:text-white text-base font-['Tajawal'] flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-500" />
              <span>أحدث العمليات</span>
            </h3>
            <span className="text-xs text-slate-400">سجل حركي</span>
          </div>

          {recentTransactions.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-8">لا يوجد أي عمليات مسجلة بعد.</p>
          ) : (
            <div className="space-y-3">
              {recentTransactions.slice(0, 6).map((tx) => {
                const isDebt = tx.type === 'DEBT';
                const customer = customerSummaries.find((c) => c.id === tx.customerId);

                return (
                  <div
                    key={tx.id}
                    className="p-3 rounded-xl border border-slate-100 dark:border-slate-800/60 bg-slate-50/60 dark:bg-slate-800/40 flex items-start justify-between gap-2 text-xs"
                  >
                    <div className="flex items-start gap-2.5">
                      <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                        isDebt ? 'bg-rose-500/15 text-rose-600' : 'bg-emerald-500/15 text-emerald-600'
                      }`}>
                        {isDebt ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-slate-100">
                          {customer ? customer.name : 'عميل غير معروف'}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                          {tx.description || (isDebt ? 'سحب دين جديد' : 'تسديد دفعة مالية')}
                        </p>
                        <span className="text-[10px] text-slate-400 mt-1 block">
                          {formatArabicDate(tx.date)}
                        </span>
                      </div>
                    </div>

                    <div className="text-left font-mono shrink-0">
                      <span className={`font-extrabold text-xs block ${
                        isDebt ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                      }`}>
                        {isDebt ? '+' : '-'}{formatMoney(tx.amount, settings.currency)}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {isDebt ? 'دين' : 'سداد'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
