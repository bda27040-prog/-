import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  UserPlus, 
  PlusCircle, 
  ArrowDownLeft, 
  ArrowUpRight, 
  FileText, 
  MessageSquare, 
  Phone, 
  Edit3, 
  Trash2, 
  AlertTriangle, 
  CheckCircle2, 
  Filter, 
  ArrowUpDown,
  PhoneCall
} from 'lucide-react';
import { CustomerSummary, FilterOptions, AppSettings } from '../types';
import { formatMoney, generateWhatsAppReminderUrl, cleanPhoneForWhatsApp } from '../utils/calculations';

interface CustomerListProps {
  customers: CustomerSummary[];
  settings: AppSettings;
  filterOptions: FilterOptions;
  setFilterOptions: React.Dispatch<React.SetStateAction<FilterOptions>>;
  onOpenAddCustomer: () => void;
  onOpenEditCustomer: (customer: CustomerSummary) => void;
  onDeleteCustomer: (id: string, name: string) => void;
  onOpenAddTransaction: (customerId?: string, defaultType?: 'DEBT' | 'PAYMENT') => void;
  onSelectCustomer: (customer: CustomerSummary) => void;
}

export const CustomerList: React.FC<CustomerListProps> = ({
  customers,
  settings,
  filterOptions,
  setFilterOptions,
  onOpenAddCustomer,
  onOpenEditCustomer,
  onDeleteCustomer,
  onOpenAddTransaction,
  onSelectCustomer,
}) => {
  // Apply Search, Status Filter, Category Filter, and Sorting
  const filteredCustomers = customers.filter((customer) => {
    // Search query match
    const q = filterOptions.searchQuery.trim().toLowerCase();
    const matchesSearch = !q || 
      customer.name.toLowerCase().includes(q) ||
      customer.phone.includes(q) ||
      (customer.notes && customer.notes.toLowerCase().includes(q)) ||
      (customer.address && customer.address.toLowerCase().includes(q));

    // Status filter match
    let matchesStatus = true;
    if (filterOptions.statusFilter === 'DEBTOR') {
      matchesStatus = customer.remainingBalance > 0 && customer.status !== 'OVERDUE';
    } else if (filterOptions.statusFilter === 'CREDITOR') {
      matchesStatus = customer.remainingBalance < 0;
    } else if (filterOptions.statusFilter === 'CLEARED') {
      matchesStatus = customer.remainingBalance === 0;
    } else if (filterOptions.statusFilter === 'OVERDUE') {
      matchesStatus = customer.status === 'OVERDUE';
    }

    // Category filter
    let matchesCategory = true;
    if (filterOptions.categoryFilter && filterOptions.categoryFilter !== 'ALL') {
      matchesCategory = customer.category === filterOptions.categoryFilter;
    }

    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Sort
  filteredCustomers.sort((a, b) => {
    switch (filterOptions.sortBy) {
      case 'BALANCE_DESC':
        return b.remainingBalance - a.remainingBalance;
      case 'BALANCE_ASC':
        return a.remainingBalance - b.remainingBalance;
      case 'NAME':
        return a.name.localeCompare(b.name, 'ar');
      case 'OVERDUE':
        return b.overdueCount - a.overdueCount;
      case 'NEWEST':
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white font-['Tajawal'] flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-500" />
            <span>سجل العملاء والديون</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            عرض كافة العملاء، تسجيل المبالغ المستحقة والسدادات، وإدارة كشوفات الحسابات.
          </p>
        </div>

        <button
          onClick={onOpenAddCustomer}
          className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-md shadow-emerald-500/20"
        >
          <UserPlus className="w-4 h-4" />
          <span>إضافة عميل جديد</span>
        </button>
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        
        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          <button
            onClick={() => setFilterOptions({ ...filterOptions, statusFilter: 'ALL' })}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              filterOptions.statusFilter === 'ALL'
                ? 'bg-slate-900 text-white dark:bg-emerald-500 dark:text-slate-950'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            جميع الحسابات ({customers.length})
          </button>

          <button
            onClick={() => setFilterOptions({ ...filterOptions, statusFilter: 'OVERDUE' })}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1 ${
              filterOptions.statusFilter === 'OVERDUE'
                ? 'bg-rose-600 text-white'
                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>الديون المتأخرة ({customers.filter(c => c.status === 'OVERDUE').length})</span>
          </button>

          <button
            onClick={() => setFilterOptions({ ...filterOptions, statusFilter: 'DEBTOR' })}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              filterOptions.statusFilter === 'DEBTOR'
                ? 'bg-amber-600 text-white'
                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20'
            }`}
          >
            عليها ديون قائم ({customers.filter(c => c.remainingBalance > 0 && c.status !== 'OVERDUE').length})
          </button>

          <button
            onClick={() => setFilterOptions({ ...filterOptions, statusFilter: 'CLEARED' })}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              filterOptions.statusFilter === 'CLEARED'
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20'
            }`}
          >
            خالص الحساب ({customers.filter(c => c.remainingBalance === 0).length})
          </button>
        </div>

        {/* Category & Sorting Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-slate-400 font-bold flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              <span>التصنيف:</span>
            </span>
            <select
              value={filterOptions.categoryFilter}
              onChange={(e) => setFilterOptions({ ...filterOptions, categoryFilter: e.target.value })}
              className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs rounded-xl px-3 py-1.5 border border-slate-200 dark:border-slate-700 focus:outline-none"
            >
              <option value="ALL">جميع التصنيفات</option>
              <option value="عميل">عميل</option>
              <option value="مورد">مورد</option>
              <option value="صديق">صديق</option>
              <option value="شركة">شركة</option>
              <option value="آخر">آخر</option>
            </select>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-slate-400 font-bold flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>ترتيب حسب:</span>
            </span>
            <select
              value={filterOptions.sortBy}
              onChange={(e) => setFilterOptions({ ...filterOptions, sortBy: e.target.value as any })}
              className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs rounded-xl px-3 py-1.5 border border-slate-200 dark:border-slate-700 focus:outline-none"
            >
              <option value="BALANCE_DESC">الأعلى ديناً أولاً</option>
              <option value="BALANCE_ASC">الأقل ديناً أولاً</option>
              <option value="NAME">أبجدي (حسب الاسم)</option>
              <option value="NEWEST">الأحدث إضافتاً</option>
              <option value="OVERDUE">الأكثر تأخيراً</option>
            </select>
          </div>

        </div>

      </div>

      {/* Customer Cards Grid */}
      {filteredCustomers.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-800 space-y-3">
          <Users className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
          <h3 className="font-bold text-slate-700 dark:text-slate-300">لم يتم العثور على أي نتائج مطابقة</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            جرب مسح أو تغيير كلمة البحث أو فلاتر التصفية لمشاهدة كافة العملاء المسجلين.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCustomers.map((customer) => {
            const isOverdue = customer.status === 'OVERDUE';
            const isCleared = customer.remainingBalance === 0;
            const whatsappUrl = generateWhatsAppReminderUrl(customer, settings.currency, settings.merchantName);

            return (
              <div
                key={customer.id}
                className={`bg-white dark:bg-slate-900 rounded-2xl border p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4 relative overflow-hidden ${
                  isOverdue
                    ? 'border-rose-500/40 bg-rose-50/20 dark:bg-rose-950/10'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                {/* Header info */}
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-extrabold text-base shrink-0 shadow-sm ${
                        isOverdue
                          ? 'bg-rose-500 text-white'
                          : isCleared
                          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                      }`}>
                        {customer.name.substring(0, 2)}
                      </div>

                      <div>
                        <h3 
                          onClick={() => onSelectCustomer(customer)}
                          className="font-bold text-slate-900 dark:text-white text-base hover:text-emerald-500 cursor-pointer transition line-clamp-1"
                        >
                          {customer.name}
                        </h3>
                        <a 
                          href={`tel:${customer.phone}`}
                          className="text-xs font-mono text-slate-500 dark:text-slate-400 hover:text-emerald-500 transition flex items-center gap-1 mt-0.5"
                        >
                          <Phone className="w-3 h-3" />
                          <span>{customer.phone}</span>
                        </a>
                      </div>
                    </div>

                    {/* Category or Status Badge */}
                    <div className="flex flex-col items-end gap-1">
                      {isOverdue && (
                        <span className="bg-rose-500/15 text-rose-600 dark:text-rose-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-rose-500/30 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          <span>متأخر</span>
                        </span>
                      )}
                      {isCleared && (
                        <span className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>خالص الحساب</span>
                        </span>
                      )}
                      {customer.category && (
                        <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] px-2 py-0.5 rounded-md">
                          {customer.category}
                        </span>
                      )}
                    </div>
                  </div>

                  {customer.notes && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80 mt-3 line-clamp-2">
                      {customer.notes}
                    </p>
                  )}
                </div>

                {/* Financial Summary Box */}
                <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 grid grid-cols-3 gap-2 text-center">
                  <div>
                    <span className="text-[10px] text-slate-400 block">إجمالي الديون</span>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200 font-mono">
                      {formatMoney(customer.totalDebt, settings.currency)}
                    </span>
                  </div>

                  <div className="border-r border-l border-slate-200 dark:border-slate-700 px-1">
                    <span className="text-[10px] text-slate-400 block">المبلغ المدفوع</span>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                      {formatMoney(customer.totalPaid, settings.currency)}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block">المتبقي المطلوب</span>
                    <span className={`text-xs font-extrabold font-mono ${
                      customer.remainingBalance > 0
                        ? isOverdue ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400'
                        : 'text-emerald-600 dark:text-emerald-400'
                    }`}>
                      {formatMoney(customer.remainingBalance, settings.currency)}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => onOpenAddTransaction(customer.id, 'DEBT')}
                      className="bg-slate-100 hover:bg-rose-50 dark:bg-slate-800 dark:hover:bg-rose-950/30 text-rose-600 dark:text-rose-400 border border-slate-200 dark:border-slate-700 text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1 transition"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      <span>إضافة دين</span>
                    </button>

                    <button
                      onClick={() => onOpenAddTransaction(customer.id, 'PAYMENT')}
                      className="bg-emerald-500/10 hover:bg-emerald-500 hover:text-slate-950 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1 transition"
                    >
                      <ArrowDownLeft className="w-3.5 h-3.5" />
                      <span>تسجيل سداد</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <button
                      onClick={() => onSelectCustomer(customer)}
                      className="flex-1 bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1.5 transition"
                    >
                      <FileText className="w-3.5 h-3.5 text-emerald-400" />
                      <span>كشف الحساب</span>
                    </button>

                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 p-2 rounded-xl transition shadow-sm"
                      title="إرسال تذكير بالحساب عبر الواتساب"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </a>

                    <a
                      href={`tel:${customer.phone}`}
                      className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 p-2 rounded-xl transition"
                      title="اتصال تلفوني"
                    >
                      <PhoneCall className="w-4 h-4" />
                    </a>

                    <button
                      onClick={() => onOpenEditCustomer(customer)}
                      className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 p-2 rounded-xl transition"
                      title="تعديل بيانات العميل"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => onDeleteCustomer(customer.id, customer.name)}
                      className="bg-slate-100 dark:bg-slate-800 hover:bg-rose-100 text-slate-400 hover:text-rose-600 p-2 rounded-xl transition"
                      title="حذف العميل"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
