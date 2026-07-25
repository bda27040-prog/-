import React, { useState, useEffect } from 'react';
import { X, ArrowUpRight, ArrowDownLeft, Save, Calendar, DollarSign, FileText } from 'lucide-react';
import { CustomerSummary, Transaction, TransactionType } from '../types';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (txData: Partial<Transaction>) => void;
  customers: CustomerSummary[];
  preselectedCustomerId?: string;
  defaultType?: TransactionType;
  initialData?: Transaction | null;
  currency: string;
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  customers,
  preselectedCustomerId,
  defaultType = 'DEBT',
  initialData,
  currency,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  const [customerId, setCustomerId] = useState('');
  const [type, setType] = useState<TransactionType>('DEBT');
  const [amount, setAmount] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState(currency || 'ر.س');
  const [date, setDate] = useState(todayStr);
  const [dueDate, setDueDate] = useState('');
  const [description, setDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'نقداً' | 'تحويل بنكي' | 'شبكة' | 'شيك' | 'أخرى'>('نقداً');
  const [receiptNo, setReceiptNo] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setCustomerId(initialData.customerId);
      setType(initialData.type);
      setAmount(initialData.amount.toString());
      setSelectedCurrency(initialData.currency || currency || 'ر.س');
      setDate(initialData.date || todayStr);
      setDueDate(initialData.dueDate || '');
      setDescription(initialData.description || '');
      setPaymentMethod(initialData.paymentMethod || 'نقداً');
      setReceiptNo(initialData.receiptNo || '');
    } else {
      setCustomerId(preselectedCustomerId || (customers[0]?.id || ''));
      setType(defaultType);
      setAmount('');
      setSelectedCurrency(currency || 'ر.س');
      setDate(todayStr);
      setDueDate('');
      setDescription('');
      setPaymentMethod('نقداً');
      setReceiptNo('');
    }
    setError('');
  }, [initialData, preselectedCustomerId, defaultType, isOpen, customers, currency]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId) {
      setError('يرجى اختيار العميل أولاً.');
      return;
    }
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('يرجى إدخال مبلغ صحيح أكبر من الصفر.');
      return;
    }
    if (!description.trim()) {
      setError('يرجى كتابة بيان أو تفاصيل الحركة.');
      return;
    }

    onSave({
      id: initialData?.id,
      customerId,
      type,
      amount: parsedAmount,
      currency: selectedCurrency,
      date,
      dueDate: type === 'DEBT' ? (dueDate || undefined) : undefined,
      description: description.trim(),
      paymentMethod: type === 'PAYMENT' ? paymentMethod : undefined,
      receiptNo: type === 'PAYMENT' ? receiptNo.trim() : undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl font-bold ${
              type === 'DEBT' ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-slate-950'
            }`}>
              {type === 'DEBT' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownLeft className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg font-['Tajawal']">
                {initialData 
                  ? 'تعديل العملية المالية' 
                  : type === 'DEBT' ? 'تسجيل دين جديد على العميل' : 'تسجيل دفعة سداد من العميل'}
              </h3>
              <p className="text-xs text-slate-400">
                أدخل قيمة المبلغ والبيان والتفاصيل
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 text-xs sm:text-sm overflow-y-auto flex-1">
          {error && (
            <div className="bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-400 p-3 rounded-xl font-bold">
              {error}
            </div>
          )}

          {/* Type selector tabs */}
          <div className="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setType('DEBT')}
              className={`py-2 rounded-lg font-bold flex items-center justify-center gap-1.5 transition ${
                type === 'DEBT'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>دين جديد (عليـه)</span>
            </button>

            <button
              type="button"
              onClick={() => setType('PAYMENT')}
              className={`py-2 rounded-lg font-bold flex items-center justify-center gap-1.5 transition ${
                type === 'PAYMENT'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <ArrowDownLeft className="w-4 h-4" />
              <span>تسديد دفعة (لـه)</span>
            </button>
          </div>

          {/* Customer Dropdown */}
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
              اختر العميل <span className="text-rose-500">*</span>
            </label>
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 font-bold focus:outline-none focus:border-emerald-500"
              required
            >
              <option value="" disabled>-- اختر اسم العميل --</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.phone}) {c.remainingBalance > 0 ? `- المتبقي: ${c.remainingBalance} ${currency}` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Amount & Currency Selector */}
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
              المبلغ نوع العملة <span className="text-rose-500">*</span>
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="number"
                  step="any"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-base font-extrabold font-mono focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <select
                value={selectedCurrency}
                onChange={(e) => setSelectedCurrency(e.target.value)}
                className="bg-amber-500/10 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 rounded-xl px-3 py-2.5 font-extrabold focus:outline-none focus:border-amber-500 text-sm cursor-pointer"
                title="اختر عملة العملية"
              >
                <option value="ر.س" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">ريال سعودي (ر.س)</option>
                <option value="ر.ي" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">ريال يمني (ر.ي)</option>
                <option value="$" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">دولار أمريكي ($)</option>
              </select>
            </div>
          </div>

          {/* Transaction Date & Due Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                تاريخ الحركة
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 font-mono focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            {type === 'DEBT' ? (
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  تاريخ الاستحقاق (تنبيه السداد)
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>
            ) : (
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  طريقة الدفع
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500"
                >
                  <option value="نقداً">نقداً (كاش)</option>
                  <option value="تحويل بنكي">تحويل بنكي</option>
                  <option value="شبكة">شبكة مدى / بطاقة</option>
                  <option value="شيك">شيك</option>
                  <option value="أخرى">أخرى</option>
                </select>
              </div>
            )}
          </div>

          {/* Description / البيان */}
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
              البيان / تفاصيل الفاتورة أو السداد <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder={type === 'DEBT' ? 'مثال: فاتورة شراء بضائع أجهزة كهربائية...' : 'مثال: دفعة جزئية عن حساب شهر مايو...'}
              className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl p-3 focus:outline-none focus:border-emerald-500 resize-none"
              required
            />
          </div>

          {type === 'PAYMENT' && (
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                رقم السند / الإيصال (اختياري)
              </label>
              <input
                type="text"
                value={receiptNo}
                onChange={(e) => setReceiptNo(e.target.value)}
                placeholder="رقم العملية أو الإيصال البنكي"
                className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>
          )}

          {/* Footer Buttons */}
          <div className="sticky bottom-0 bg-white dark:bg-slate-900 flex items-center justify-end gap-2 pt-3 pb-1 border-t border-slate-100 dark:border-slate-800 z-10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl font-bold transition"
            >
              إلغاء
            </button>

            <button
              type="submit"
              className={`font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 transition shadow-md ${
                type === 'DEBT'
                  ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20'
                  : 'bg-emerald-500 hover:bg-emerald-600 text-slate-950 shadow-emerald-500/20'
              }`}
            >
              <Save className="w-4 h-4" />
              <span>{type === 'DEBT' ? 'حفظ الدين' : 'حفظ دفعة السداد'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
