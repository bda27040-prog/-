import React, { useState, useEffect } from 'react';
import { X, UserPlus, Save, Check } from 'lucide-react';
import { Customer, CustomerCategory } from '../types';

interface AddCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (customerData: Partial<Customer>) => void;
  initialData?: Customer | null;
}

export const AddCustomerModal: React.FC<AddCustomerModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState<CustomerCategory>('عميل');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setPhone(initialData.phone || '');
      setCategory(initialData.category || 'عميل');
      setAddress(initialData.address || '');
      setNotes(initialData.notes || '');
    } else {
      setName('');
      setPhone('');
      setCategory('عميل');
      setAddress('');
      setNotes('');
    }
    setError('');
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('يرجى إدخال اسم العميل الكامل.');
      return;
    }
    if (!phone.trim()) {
      setError('يرجى إدخال رقم الهاتف.');
      return;
    }

    onSave({
      id: initialData?.id,
      name: name.trim(),
      phone: phone.trim(),
      category,
      address: address.trim(),
      notes: notes.trim(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-emerald-500 text-slate-950 p-2 rounded-xl font-bold">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg font-['Tajawal']">
                {initialData ? 'تعديل بيانات العميل' : 'إضافة عميل جديد'}
              </h3>
              <p className="text-xs text-slate-400">
                أدخل الاسم ورقم الهاتف والملاحظات المطلوبة
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

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs sm:text-sm">
          {error && (
            <div className="bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-400 p-3 rounded-xl font-bold">
              {error}
            </div>
          )}

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
              اسم العميل / الجهة <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: محمد عبد الله الشهري"
              className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-emerald-500"
              required
            />
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
              رقم الهاتف <span className="text-rose-500">*</span>
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="مثال: 0501234567"
              className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 font-mono dir-ltr text-right focus:outline-none focus:border-emerald-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                تصنيف الحساب
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CustomerCategory)}
                className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500"
              >
                <option value="عميل">عميل</option>
                <option value="مورد">مورد</option>
                <option value="صديق">صديق</option>
                <option value="شركة">شركة</option>
                <option value="آخر">آخر</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                العنوان / المنطقة
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="المدينة أو الحي"
                className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
              ملاحظات وتفاصيل إضافية
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="مثال: يفضل التواصل مساءً، يطلب فاتورة ضريبية..."
              className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl p-3 focus:outline-none focus:border-emerald-500 resize-none"
            />
          </div>

          {/* Footer buttons */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl font-bold transition"
            >
              إلغاء
            </button>

            <button
              type="submit"
              className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 transition shadow-md shadow-emerald-500/20"
            >
              <Save className="w-4 h-4" />
              <span>حفظ العميل</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
