import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Clock, 
  MessageSquare, 
  PhoneCall, 
  ArrowDownLeft, 
  FileText, 
  Calendar, 
  CheckCircle2, 
  Filter,
  UserX
} from 'lucide-react';
import { CustomerSummary, Transaction, AppSettings } from '../types';
import { formatMoney, formatArabicDate, generateWhatsAppReminderUrl } from '../utils/calculations';

interface OverdueAlertsViewProps {
  customers: CustomerSummary[];
  transactions: Transaction[];
  settings: AppSettings;
  onSelectCustomer: (customer: CustomerSummary) => void;
  onOpenAddTransaction: (customerId: string, defaultType?: 'DEBT' | 'PAYMENT') => void;
}

export const OverdueAlertsView: React.FC<OverdueAlertsViewProps> = ({
  customers,
  transactions,
  settings,
  onSelectCustomer,
  onOpenAddTransaction,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  // Get all debt transactions that have a due date
  const overdueTxs = transactions.filter((tx) => {
    if (tx.type !== 'DEBT' || !tx.dueDate) return false;
    return tx.dueDate < todayStr;
  });

  // Overdue customers
  const overdueCustomers = customers.filter((c) => c.status === 'OVERDUE' || c.overdueCount > 0);

  const totalOverdueAmount = overdueCustomers.reduce((acc, curr) => acc + Math.max(0, curr.remainingBalance), 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Alert Header Banner */}
      <div className="bg-gradient-to-r from-rose-950 via-rose-900 to-slate-900 text-white p-6 rounded-2xl border border-rose-800 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="bg-rose-600 text-white p-3 rounded-2xl shadow-lg shrink-0">
              <AlertTriangle className="w-8 h-8 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-rose-500/30 text-rose-200 text-xs px-2.5 py-0.5 rounded-full font-bold border border-rose-400/30">
                  مركز إنذارات الديون
                </span>
              </div>
              <h2 className="text-2xl font-extrabold font-['Tajawal'] text-white mt-1">
                تنبيهات الديون المتأخرة السداد
              </h2>
              <p className="text-xs text-rose-200 mt-1">
                قائمة بالعملاء والعمليات التي تجاوزت موعد الاستحقاق المكتوب بحاجة لمتابعة عاجلة.
              </p>
            </div>
          </div>

          <div className="bg-rose-900/80 border border-rose-700/60 p-4 rounded-xl text-center shrink-0 min-w-[180px]">
            <span className="text-xs text-rose-200 block font-bold">إجمالي المتأخرات المطلوبة</span>
            <span className="text-xl font-black text-rose-300 font-mono block mt-1">
              {formatMoney(totalOverdueAmount, settings.currency)}
            </span>
          </div>
        </div>
      </div>

      {/* Main List */}
      {overdueCustomers.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-800 space-y-3">
          <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto" />
          <h3 className="font-extrabold text-slate-900 dark:text-white text-lg">
            رائع جداً! لا يوجد أي ديون متأخرة حالياً
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            كافة الديون المسجلة تقع ضمن مواعيد الاستحقاق المحددة أو تم سدادها بالكامل.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-bold text-slate-900 dark:text-white text-base font-['Tajawal'] flex items-center gap-2">
              <Clock className="w-5 h-5 text-rose-500" />
              <span>قائمة العملاء المتأخرين عن السداد ({overdueCustomers.length})</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {overdueCustomers.map((customer) => {
              const customerOverdueTxs = transactions.filter(
                (tx) => tx.customerId === customer.id && tx.type === 'DEBT' && tx.dueDate && tx.dueDate < todayStr
              );

              const whatsappUrl = generateWhatsAppReminderUrl(customer, settings.currency, settings.merchantName);

              return (
                <div
                  key={customer.id}
                  className="bg-white dark:bg-slate-900 border-2 border-rose-500/40 rounded-2xl p-5 shadow-sm space-y-4 hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 bg-rose-500 text-white rounded-2xl flex items-center justify-center font-extrabold text-base shadow-sm">
                        {customer.name.substring(0, 2)}
                      </div>
                      <div>
                        <h4 
                          onClick={() => onSelectCustomer(customer)}
                          className="font-bold text-slate-900 dark:text-white text-base hover:text-emerald-500 cursor-pointer transition"
                        >
                          {customer.name}
                        </h4>
                        <p className="text-xs font-mono text-slate-500 dir-ltr text-right mt-0.5">
                          {customer.phone}
                        </p>
                      </div>
                    </div>

                    <div className="text-left font-mono">
                      <span className="text-[10px] text-slate-400 block">المبلغ المتأخر</span>
                      <span className="text-lg font-black text-rose-600 dark:text-rose-400">
                        {formatMoney(customer.remainingBalance, settings.currency)}
                      </span>
                    </div>
                  </div>

                  {/* Overdue items breakdown */}
                  <div className="bg-rose-50/50 dark:bg-rose-950/20 rounded-xl p-3 border border-rose-200/60 dark:border-rose-900/40 space-y-2 text-xs">
                    <span className="font-bold text-rose-900 dark:text-rose-200 block text-[11px]">
                      البنود والديون المتأخرة ({customerOverdueTxs.length}):
                    </span>
                    {customerOverdueTxs.map((tx) => (
                      <div key={tx.id} className="flex items-center justify-between bg-white dark:bg-slate-900 p-2 rounded-lg border border-rose-100 dark:border-rose-950">
                        <div>
                          <span className="font-bold text-slate-800 dark:text-slate-200 block">{tx.description}</span>
                          <span className="text-[10px] text-rose-600 font-bold">
                            استحق بتاريخ: {formatArabicDate(tx.dueDate || '')}
                          </span>
                        </div>
                        <span className="font-extrabold font-mono text-rose-600">
                          {formatMoney(tx.amount, settings.currency)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => onOpenAddTransaction(customer.id, 'PAYMENT')}
                      className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition shadow-sm"
                    >
                      <ArrowDownLeft className="w-4 h-4" />
                      <span>تسجيل سداد</span>
                    </button>

                    <button
                      onClick={() => onSelectCustomer(customer)}
                      className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1 transition"
                    >
                      <FileText className="w-3.5 h-3.5 text-emerald-500" />
                      <span>كشف حساب</span>
                    </button>

                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-emerald-500/15 hover:bg-emerald-500 text-emerald-600 hover:text-slate-950 p-2 rounded-xl transition border border-emerald-500/30"
                      title="إرسال تذكير عاجل عبر الواتساب"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </a>

                    <a
                      href={`tel:${customer.phone}`}
                      className="bg-slate-100 dark:bg-slate-800 p-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition"
                      title="اتصال مباشر"
                    >
                      <PhoneCall className="w-4 h-4" />
                    </a>
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
