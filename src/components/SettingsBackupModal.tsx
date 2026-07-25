import React, { useState } from 'react';
import { 
  Settings, 
  Download, 
  Upload, 
  RotateCcw, 
  Trash2, 
  Save, 
  CheckCircle2, 
  AlertCircle,
  Building2,
  Lock,
  Moon,
  Sun,
  Monitor,
  Flame,
  ShieldCheck,
  Smartphone,
  Coins
} from 'lucide-react';
import { AppSettings, Customer, Transaction, ThemeMode } from '../types';
import { exportBackupJSON, importBackupJSON } from '../utils/storage';

interface SettingsBackupModalProps {
  settings: AppSettings;
  onSaveSettings: (newSettings: AppSettings) => void;
  customers: Customer[];
  transactions: Transaction[];
  onImportBackup: (imported: { customers: Customer[]; transactions: Transaction[]; settings: AppSettings }) => void;
  onResetSampleData: () => void;
  onClearAllData: () => void;
}

export const SettingsBackupModal: React.FC<SettingsBackupModalProps> = ({
  settings,
  onSaveSettings,
  customers,
  transactions,
  onImportBackup,
  onResetSampleData,
  onClearAllData,
}) => {
  const [appName, setAppName] = useState(settings.appName || 'الجندي حاسب');
  const [slogan, setSlogan] = useState(settings.slogan || 'تطبيق إدارة الديون والحسابات السريع');
  const [currency, setCurrency] = useState(settings.currency || 'ر.س');
  const [merchantName, setMerchantName] = useState(settings.merchantName || '');
  const [merchantPhone, setMerchantPhone] = useState(settings.merchantPhone || '');
  const [merchantNotes, setMerchantNotes] = useState(settings.merchantNotes || '');
  
  // Theme & Passcode
  const [themeMode, setThemeMode] = useState<ThemeMode>(
    settings.themeMode || (settings.darkMode ? 'dark' : 'system')
  );
  const [enablePasscode, setEnablePasscode] = useState(settings.enablePasscode || false);
  const [passcode, setPasscode] = useState(settings.passcode || '1234');
  
  // Firebase Sync
  const [firebaseSyncEnabled, setFirebaseSyncEnabled] = useState(settings.firebaseSyncEnabled || false);
  const [firebaseApiKey, setFirebaseApiKey] = useState(settings.firebaseApiKey || '');
  const [firebaseProjectId, setFirebaseProjectId] = useState(settings.firebaseProjectId || '');

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings({
      ...settings,
      appName: appName.trim(),
      slogan: slogan.trim(),
      currency: currency.trim(),
      merchantName: merchantName.trim(),
      merchantPhone: merchantPhone.trim(),
      merchantNotes: merchantNotes.trim(),
      themeMode,
      darkMode: themeMode === 'dark',
      enablePasscode,
      passcode: passcode.trim(),
      firebaseSyncEnabled,
      firebaseApiKey: firebaseApiKey.trim(),
      firebaseProjectId: firebaseProjectId.trim(),
    });
    setMessage({ type: 'success', text: 'تم حفظ كافة الإعدادات والخيارات بنجاح!' });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleExportJSON = () => {
    try {
      const jsonStr = exportBackupJSON(customers, transactions, settings);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const dateStr = new Date().toISOString().split('T')[0];
      link.download = `aljundi_hasib_backup_${dateStr}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setMessage({ type: 'success', text: 'تم تنزيل النسخة الاحتياطية JSON بنجاح!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: 'حدث خطأ أثناء تصدير النسخة الاحتياطية.' });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const imported = importBackupJSON(content);
        onImportBackup(imported);
        setMessage({ type: 'success', text: 'تمت استعادة كافة البيانات والعملاء من الملف بنجاح!' });
        setTimeout(() => setMessage(null), 4000);
      } catch (err: any) {
        setMessage({ type: 'error', text: err.message || 'فشلت استعادة ملف النسخة الاحتياطية.' });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 font-['Cairo',sans-serif]">
      
      {/* Title */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500 text-slate-950 p-2.5 rounded-xl font-bold">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white font-['Tajawal']">
              الإعدادات، الحماية والنسخ الاحتياطي
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              تغيير اسم المؤسسة والعملة، كلمة المرور، مظهر التطبيق، والمزامنة مع Firebase.
            </p>
          </div>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2 ${
          message.type === 'success' 
            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
            : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Merchant & App Details */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          <h3 className="font-bold text-slate-900 dark:text-white text-base font-['Tajawal'] border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-500" />
            <span>بيانات المؤسسة والعملة</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                اسم التطبيق
              </label>
              <input
                type="text"
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-bold focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                تغيير العملة
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-bold focus:outline-none focus:border-emerald-500"
              >
                <option value="ر.س">ريال سعودي (ر.س)</option>
                <option value="ر.ي">ريال يمني (ر.ي)</option>
                <option value="$">دولار أمريكي ($)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                اسم المؤسسة / المتجر
              </label>
              <input
                type="text"
                value={merchantName}
                onChange={(e) => setMerchantName(e.target.value)}
                placeholder="اسم متجرك أو مؤسستك التجارية"
                className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                رقم هاتف التواصل
              </label>
              <input
                type="tel"
                value={merchantPhone}
                onChange={(e) => setMerchantPhone(e.target.value)}
                placeholder="0501234567"
                className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-mono focus:outline-none focus:border-emerald-500 dir-ltr text-right"
              />
            </div>
          </div>
        </div>

        {/* Protection & Appearance */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          <h3 className="font-bold text-slate-900 dark:text-white text-base font-['Tajawal'] border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
            <Lock className="w-5 h-5 text-emerald-500" />
            <span>حماية التطبيق والوضع الليلي</span>
          </h3>

          <div className="space-y-4 text-xs sm:text-sm">
            {/* Theme Mode Selector */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
              <div>
                <span className="font-bold block text-slate-900 dark:text-white text-sm">مظهر التطبيق والوضع الليلي</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">اختر بين مظهر النظام التلقائي أو الوضع الداكن/الفاتح اليدوي</span>
              </div>

              <div className="grid grid-cols-3 gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setThemeMode('system')}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition text-xs font-bold cursor-pointer ${
                    themeMode === 'system'
                      ? 'bg-emerald-500/15 border-emerald-500 text-emerald-600 dark:text-emerald-400 shadow-sm ring-1 ring-emerald-500/50'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <Monitor className="w-5 h-5 text-indigo-500" />
                  <span>تلقائي (النظام)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setThemeMode('dark')}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition text-xs font-bold cursor-pointer ${
                    themeMode === 'dark'
                      ? 'bg-emerald-500/15 border-emerald-500 text-emerald-600 dark:text-emerald-400 shadow-sm ring-1 ring-emerald-500/50'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <Moon className="w-5 h-5 text-amber-400" />
                  <span>وضع داكن</span>
                </button>

                <button
                  type="button"
                  onClick={() => setThemeMode('light')}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition text-xs font-bold cursor-pointer ${
                    themeMode === 'light'
                      ? 'bg-emerald-500/15 border-emerald-500 text-emerald-600 dark:text-emerald-400 shadow-sm ring-1 ring-emerald-500/50'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <Sun className="w-5 h-5 text-amber-500" />
                  <span>وضع فاتح</span>
                </button>
              </div>
            </div>

            {/* Passcode Protection */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-rose-500" />
                  <div>
                    <span className="font-bold block text-slate-900 dark:text-white">حماية التطبيق بكلمة مرور (PIN Code)</span>
                    <span className="text-xs text-slate-500">طلب الرمز السري المكون من 4 أرقام عند فتح التطبيق</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={enablePasscode}
                  onChange={(e) => setEnablePasscode(e.target.checked)}
                  className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
                />
              </div>

              {enablePasscode && (
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    رمز الدخول السري (PIN):
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    placeholder="1234"
                    className="w-32 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-600 rounded-xl p-2 text-center font-mono font-bold tracking-widest text-lg focus:outline-none focus:border-emerald-500"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Firebase Synchronization Settings */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          <h3 className="font-bold text-slate-900 dark:text-white text-base font-['Tajawal'] border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-500" />
            <span>المزامنة مع Firebase Cloud Firestore</span>
          </h3>

          <div className="space-y-4 text-xs sm:text-sm">
            <div className="flex items-center justify-between p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-500" />
                <div>
                  <span className="font-bold block text-slate-900 dark:text-white">تفعيل المزامنة مع سحابة Firebase</span>
                  <span className="text-xs text-slate-500">حفظ وحفظ الديون بين الهاتف والكمبيوتر فور توفر الإنترنت</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={firebaseSyncEnabled}
                onChange={(e) => setFirebaseSyncEnabled(e.target.checked)}
                className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
              />
            </div>

            {firebaseSyncEnabled && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Firebase API Key
                  </label>
                  <input
                    type="text"
                    value={firebaseApiKey}
                    onChange={(e) => setFirebaseApiKey(e.target.value)}
                    placeholder="AIzaSy..."
                    className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-mono text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Project ID
                  </label>
                  <input
                    type="text"
                    value={firebaseProjectId}
                    onChange={(e) => setFirebaseProjectId(e.target.value)}
                    placeholder="aljundi-hasib-app"
                    className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-mono text-xs focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-6 py-3 rounded-xl flex items-center gap-2 transition shadow-md shadow-emerald-500/20 text-sm"
          >
            <Save className="w-5 h-5" />
            <span>حفظ الإعدادات بالكامل</span>
          </button>
        </div>

      </form>

      {/* Backup and Import Zone */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="font-bold text-slate-900 dark:text-white text-base font-['Tajawal'] flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            <span>النسخ الاحتياطي اليدوي وتحميل قاعدة البيانات (JSON)</span>
          </h3>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg w-fit">
            <Coins className="w-4 h-4 text-emerald-500" />
            <span>إجمالي العملاء: <strong className="text-slate-900 dark:text-white">{customers.length}</strong></span>
            <span className="mx-1">•</span>
            <span>المعاملات: <strong className="text-slate-900 dark:text-white">{transactions.length}</strong></span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {/* Download JSON Card */}
          <div className="p-5 rounded-2xl border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 space-y-3 relative overflow-hidden">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                  <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>تحميل ملف النسخة الاحتياطية (JSON)</span>
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  تنزيل ملف JSON يحتوي على كامل قاعدة البيانات المحلية (بيانات العملاء، كافة سجلات الديون والسداد، والإعدادات) للاحتفاظ بنسخة آمنة أو نقلها لجهاز آخر.
                </p>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={handleExportJSON}
                className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 transition shadow-sm cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>تحميل النسخة الاحتياطية الآن (.json)</span>
              </button>
            </div>
          </div>

          {/* Restore JSON Card */}
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/40 space-y-3">
            <div className="space-y-1">
              <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                <Upload className="w-4 h-4 text-blue-500" />
                <span>استعادة البيانات من ملف JSON</span>
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                استرجاع وحفظ البيانات من ملف نسخة احتياطية سابق تم تنزيله من التطبيق.
              </p>
            </div>

            <div className="pt-2">
              <label className="cursor-pointer inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition shadow-sm">
                <Upload className="w-4 h-4" />
                <span>اختيار واستعادة ملف (.json)</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <button
            type="button"
            onClick={onResetSampleData}
            className="text-amber-600 dark:text-amber-400 hover:underline font-bold flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/20 p-2.5 rounded-xl border border-amber-200 dark:border-amber-900/40 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>إعادة تحميل البيانات التجريبية للاختبار</span>
          </button>

          <button
            type="button"
            onClick={onClearAllData}
            className="text-rose-600 hover:underline font-bold flex items-center gap-1.5 bg-rose-50 dark:bg-rose-950/20 p-2.5 rounded-xl border border-rose-200 dark:border-rose-900/40 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>مسح كافة البيانات نهائياً</span>
          </button>
        </div>

      </div>

    </div>
  );
};
