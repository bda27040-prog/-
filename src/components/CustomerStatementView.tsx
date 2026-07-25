import React, { useState } from 'react';
import { 
  ArrowRight, 
  Printer, 
  MessageSquare, 
  PlusCircle, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Calendar, 
  FileText, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  AlertTriangle,
  Receipt,
  Building2,
  PhoneCall,
  Scale,
  FileDown,
  Loader2
} from 'lucide-react';
import { CustomerSummary, Transaction, AppSettings } from '../types';
import { formatMoney, formatArabicDate, generateWhatsAppReminderUrl } from '../utils/calculations';
import { generateCustomerStatementPDF, printCustomerStatement } from '../utils/pdfGenerator';

interface CustomerStatementViewProps {
  customer: CustomerSummary;
  transactions: Transaction[];
  settings: AppSettings;
  onBack: () => void;
  onOpenAddTransaction: (customerId: string, defaultType?: 'DEBT' | 'PAYMENT') => void;
  onEditTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (txId: string) => void;
}

export const CustomerStatementView: React.FC<CustomerStatementViewProps> = ({
  customer,
  transactions,
  settings,
  onBack,
  onOpenAddTransaction,
  onEditTransaction,
  onDeleteTransaction,
}) => {
  const [filterType, setFilterType] = useState<'ALL' | 'DEBT' | 'PAYMENT'>('ALL');
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  if (!customer) {
    return (
      <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-4">
        <p className="text-slate-600 dark:text-slate-300 font-bold text-base">لم يتم العثور على بيانات العميل المحدد.</p>
        <button
          onClick={onBack}
          className="bg-slate-800 hover:bg-slate-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition shadow-sm"
        >
          الرجوع للعملاء
        </button>
      </div>
    );
  }

  const safeTransactions = Array.isArray(transactions) ? transactions : [];
  const safeCurrency = settings?.currency || 'ر.س';

  // Filter transactions exclusively for this customer and sort chronologically
  const customerTxs = safeTransactions
    .filter((tx) => tx && String(tx.customerId).trim() === String(customer.id).trim())
    .sort((a, b) => {
      const dateA = a?.date ? new Date(a.date).getTime() : 0;
      const dateB = b?.date ? new Date(b.date).getTime() : 0;
      return dateA - dateB;
    });

  // Calculate Running Balance line by line:
  // DEBT (+عليه): adds to debt balance
  // PAYMENT (+له): subtracts from debt balance
  let runningBalance = 0;
  const txsWithRunningBalance = customerTxs.map((tx) => {
    const amount = Number(tx.amount) || 0;
    if (tx.type === 'DEBT') {
      runningBalance += amount;
    } else {
      runningBalance -= amount;
    }
    return {
      ...tx,
      runningBalanceAfter: runningBalance,
    };
  });

  const displayTxs = txsWithRunningBalance.filter((tx) => {
    if (filterType === 'DEBT') return tx.type === 'DEBT';
    if (filterType === 'PAYMENT') return tx.type === 'PAYMENT';
    return true;
  });

  const totalDebtsForCust = customerTxs
    .filter((t) => t.type === 'DEBT')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const totalPaidForCust = customerTxs
    .filter((t) => t.type === 'PAYMENT')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const finalNetBalance = totalDebtsForCust - totalPaidForCust;

  const whatsappUrl = generateWhatsAppReminderUrl(customer, safeCurrency, settings?.merchantName);

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = async () => {
    try {
      setIsExportingPdf(true);
      await generateCustomerStatementPDF(customer, customerTxs, settings, filterType);
    } catch (err) {
      console.error('Failed to export PDF:', err);
      alert('حدث خطأ أثناء إنشاء ملف الـ PDF. يمكنك استخدام زر الطباعة وحفظ التقرير كـ PDF.');
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Navigation & Action Bar */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl transition"
            title="الرجوع للعملاء"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white font-['Tajawal']">
                كشف حساب العميل: {customer.name}
              </h2>
              {customer.category && (
                <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs px-2.5 py-0.5 rounded-full font-medium">
                  {customer.category}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              سجل تفصيلي لكافة الحركات المالية المتبادلة (له / عليه).
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportPDF}
            disabled={isExportingPdf}
            className="bg-rose-700 hover:bg-rose-800 disabled:opacity-60 text-white font-bold text-xs sm:text-sm px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 transition shadow-sm cursor-pointer"
            title="تصدير كشف حساب العميل كملف PDF"
          >
            {isExportingPdf ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>جاري إنشاء PDF...</span>
              </>
            ) : (
              <>
                <FileDown className="w-4 h-4 text-rose-200" />
                <span>تصدير PDF</span>
              </>
            )}
          </button>

          <button
            onClick={handlePrint}
            className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs sm:text-sm px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 transition shadow-sm"
          >
            <Printer className="w-4 h-4 text-emerald-400" />
            <span>طباعة</span>
          </button>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs sm:text-sm px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 transition shadow-sm"
          >
            <MessageSquare className="w-4 h-4" />
            <span>واتساب</span>
          </a>
        </div>
      </div>

      {/* Main Statement Paper Card */}
      <div className="bg-white text-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-md space-y-6 print-card">
        
        {/* Header Branding */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-6 gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-slate-900 text-emerald-400 p-3 rounded-2xl font-bold">
              <Scale className="w-7 h-7 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-['Tajawal']">
                {settings.merchantName || 'مؤسسة الجندي التجاري'}
              </h1>
              <p className="text-xs text-slate-500">
                {settings.merchantNotes || 'إدارة الديون والحسابات'} • هاتف: {settings.merchantPhone}
              </p>
            </div>
          </div>

          <div className="text-left font-mono">
            <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-bold px-3 py-1 rounded-full block text-center mb-1">
              كشف حساب تفصيلي
            </span>
            <span className="text-xs text-slate-500 block">
              تاريخ التصدير: {formatArabicDate(new Date().toISOString().split('T')[0])}
            </span>
          </div>
        </div>

        {/* Customer Information Bar */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-500 font-bold block mb-0.5">الاسم:</span>
            <span className="text-sm font-extrabold text-slate-900">{customer.name}</span>
          </div>

          <div>
            <span className="text-slate-500 font-bold block mb-0.5">رقم الهاتف:</span>
            <span className="text-sm font-bold text-slate-900 font-mono dir-ltr text-right">{customer.phone}</span>
          </div>

          <div>
            <span className="text-slate-500 font-bold block mb-0.5">العنوان:</span>
            <span className="text-slate-800 font-medium">{customer.address || 'غير محدد'}</span>
          </div>

          <div>
            <span className="text-slate-500 font-bold block mb-0.5">ملاحظات:</span>
            <span className="text-slate-700">{customer.notes || 'لا يوجد'}</span>
          </div>
        </div>

        {/* Action buttons (Hidden on Print) */}
        <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-b border-slate-100 py-3">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setFilterType('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                filterType === 'ALL' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              جميع العمليات ({customerTxs.length})
            </button>
            <button
              onClick={() => setFilterType('DEBT')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                filterType === 'DEBT' ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              عليه فقط ({customerTxs.filter(t => t.type === 'DEBT').length})
            </button>
            <button
              onClick={() => setFilterType('PAYMENT')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                filterType === 'PAYMENT' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              له فقط ({customerTxs.filter(t => t.type === 'PAYMENT').length})
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenAddTransaction(customer.id, 'DEBT')}
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition shadow-sm"
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>إضافة مبلغ عليه</span>
            </button>

            <button
              onClick={() => onOpenAddTransaction(customer.id, 'PAYMENT')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition shadow-sm"
            >
              <ArrowDownLeft className="w-4 h-4" />
              <span>إضافة مبلغ له</span>
            </button>
          </div>
        </div>

        {/* Transactions Table: Exact format: التاريخ | البيان | له | عليه | الرصيد */}
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          {displayTxs.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <FileText className="w-12 h-12 mx-auto mb-2 opacity-50 text-slate-300" />
              <p className="font-bold">لا يوجد أي عمليات مسجلة للعميل حتى الآن.</p>
            </div>
          ) : (
            <table className="w-full text-right text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white font-extrabold text-xs">
                  <th className="p-3 border-b border-slate-800">التاريخ</th>
                  <th className="p-3 border-b border-slate-800">البيان / التفاصيل</th>
                  <th className="p-3 border-b border-slate-800 text-center text-emerald-400">له (دائن)</th>
                  <th className="p-3 border-b border-slate-800 text-center text-rose-400">عليه (مدين)</th>
                  <th className="p-3 border-b border-slate-800 text-center">الرصيد</th>
                  <th className="p-3 border-b border-slate-800 text-left no-print">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {displayTxs.map((tx) => {
                  const isDebt = tx.type === 'DEBT';
                  const debtAmount = isDebt ? tx.amount : 0;
                  const paymentAmount = !isDebt ? tx.amount : 0;

                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/90 transition">
                      {/* التاريخ */}
                      <td className="p-3 font-mono text-slate-700 whitespace-nowrap">
                        {formatArabicDate(tx.date)}
                      </td>

                      {/* البيان */}
                      <td className="p-3">
                        <span className="font-bold text-slate-900 block">{tx.description}</span>
                        {tx.notes && (
                          <span className="text-[11px] text-slate-500 block mt-0.5">
                            ملاحظات: {tx.notes}
                          </span>
                        )}
                        {tx.paymentMethod && (
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            طريقة الدفع: {tx.paymentMethod} {tx.receiptNo ? `(سند: ${tx.receiptNo})` : ''}
                          </span>
                        )}
                      </td>

                      {/* له (PAYMENT) */}
                      <td className="p-3 text-center font-mono font-bold text-emerald-600 bg-emerald-50/30 whitespace-nowrap">
                        {paymentAmount > 0 ? formatMoney(paymentAmount, tx.currency || settings.currency) : '-'}
                      </td>

                      {/* عليه (DEBT) */}
                      <td className="p-3 text-center font-mono font-bold text-rose-600 bg-rose-50/30 whitespace-nowrap">
                        {debtAmount > 0 ? formatMoney(debtAmount, tx.currency || settings.currency) : '-'}
                      </td>

                      {/* الرصيد */}
                      <td className="p-3 text-center font-mono font-extrabold text-slate-900 bg-slate-50 whitespace-nowrap">
                        {formatMoney(tx.runningBalanceAfter, settings.currency)}
                      </td>

                      {/* إجراءات (No print) */}
                      <td className="p-3 text-left no-print whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onEditTransaction(tx)}
                            className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-600 transition"
                            title="تعديل العملية"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteTransaction(tx.id)}
                            className="p-1.5 hover:bg-rose-100 rounded-lg text-rose-600 transition"
                            title="حذف العملية"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Summary Footer Box: إجمالي له | إجمالي عليه | الرصيد النهائي */}
        <div className="bg-slate-900 text-white p-5 rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-4 border border-slate-800 text-center font-['Tajawal']">
          
          <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/60">
            <span className="text-xs text-emerald-400 font-bold block mb-1">إجمالي له (المدفوعات/له)</span>
            <span className="text-xl font-black text-emerald-400 font-mono">
              {formatMoney(totalPaidForCust, settings.currency)}
            </span>
          </div>

          <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/60">
            <span className="text-xs text-rose-400 font-bold block mb-1">إجمالي عليه (الديون/عليه)</span>
            <span className="text-xl font-black text-rose-400 font-mono">
              {formatMoney(totalDebtsForCust, settings.currency)}
            </span>
          </div>

          <div className="bg-slate-800/80 p-3.5 rounded-xl border border-emerald-500/40">
            <span className="text-xs text-amber-300 font-bold block mb-1">الرصيد النهائي</span>
            <span className={`text-xl font-black font-mono ${
              finalNetBalance > 0
                ? 'text-amber-400'
                : finalNetBalance < 0
                ? 'text-emerald-300'
                : 'text-slate-200'
            }`}>
              {formatMoney(finalNetBalance, settings.currency)}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              {finalNetBalance > 0 ? '(مستحق عليه لصالحنا)' : finalNetBalance < 0 ? '(مستحق له لدينا)' : '(حساب خالص ومتوازن)'}
            </span>
          </div>

        </div>

        {/* Signatures for Print */}
        <div className="pt-8 border-t border-slate-200 grid grid-cols-2 gap-8 text-xs text-slate-600">
          <div>
            <p className="font-bold mb-8">توقيع وختم المؤسسة:</p>
            <div className="w-36 h-10 border-b border-dashed border-slate-400"></div>
          </div>
          <div className="text-left">
            <p className="font-bold mb-8">توقيع العميل بالمصادقة:</p>
            <div className="w-36 h-10 border-b border-dashed border-slate-400 mr-auto"></div>
          </div>
        </div>

      </div>

      {/* Floating Action Button for Printing */}
      <button
        type="button"
        onClick={handlePrint}
        className="fixed bottom-6 left-6 z-40 no-print bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm px-5 py-3.5 rounded-full shadow-2xl border-2 border-white dark:border-slate-800 flex items-center gap-2.5 transition-all hover:scale-105 active:scale-95 cursor-pointer group"
        title="طباعة كشف الحساب"
      >
        <Printer className="w-5 h-5 text-emerald-200 group-hover:rotate-12 transition-transform" />
        <span>طباعة التقرير</span>
      </button>
    </div>
  );
};
