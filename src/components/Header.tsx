import React from 'react';
import { 
  Wallet, 
  UserPlus, 
  PlusCircle, 
  Bell, 
  Settings, 
  Search, 
  CheckCircle2, 
  AlertTriangle,
  Scale,
  RotateCcw,
  BarChart3,
  Smartphone,
  Moon,
  Sun,
  Monitor,
  Coins
} from 'lucide-react';
import { AppSettings, OverallStats, ThemeMode } from '../types';

interface HeaderProps {
  settings: AppSettings;
  stats: OverallStats;
  activeTab: 'dashboard' | 'customers' | 'reports' | 'overdue' | 'flutter' | 'settings';
  setActiveTab: (tab: 'dashboard' | 'customers' | 'reports' | 'overdue' | 'flutter' | 'settings') => void;
  onOpenAddCustomer: () => void;
  onOpenAddTransaction: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onResetSampleData: () => void;
  onToggleTheme?: () => void;
  onChangeCurrency?: (currency: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  stats,
  activeTab,
  setActiveTab,
  onOpenAddCustomer,
  onOpenAddTransaction,
  searchQuery,
  setSearchQuery,
  onResetSampleData,
  onToggleTheme,
  onChangeCurrency,
}) => {
  const currentThemeMode = settings.themeMode || (settings.darkMode ? 'dark' : 'system');
  const themeLabel = currentThemeMode === 'system' ? 'تلقائي حسب النظام' : currentThemeMode === 'dark' ? 'داكن' : 'فاتح';

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md font-['Cairo',sans-serif]">
      {/* Top Banner Branding & Quick Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Logo & App Name */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
              <div className="bg-emerald-500 text-slate-950 p-2.5 rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center font-bold">
                <Scale className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-extrabold tracking-tight text-white font-['Tajawal']">
                    {settings.appName || 'الجندي حاسب'}
                  </h1>
                  <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2 py-0.5 rounded-full font-semibold border border-emerald-500/30">
                    مجاني ومحلي 100%
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-medium">
                  {settings.slogan || 'تطبيق إدارة الديون والحسابات السريع'}
                </p>
              </div>
            </div>

            {/* Mobile quick action icons */}
            <div className="flex items-center gap-2 md:hidden">
              {onChangeCurrency && (
                <div className="relative flex items-center">
                  <Coins className="w-3.5 h-3.5 text-amber-400 absolute right-2 pointer-events-none" />
                  <select
                    value={settings.currency}
                    onChange={(e) => onChangeCurrency(e.target.value)}
                    className="bg-slate-800 text-amber-300 border border-slate-700 text-xs font-bold rounded-lg pr-7 pl-2 py-1.5 focus:outline-none focus:border-amber-400 appearance-none cursor-pointer"
                    title="تغيير عملة التطبيق"
                  >
                    <option value="ر.س">ريال سعودي (ر.س)</option>
                    <option value="ر.ي">ريال يمني (ر.ي)</option>
                    <option value="$">دولار أمريكي ($)</option>
                  </select>
                </div>
              )}

              {onToggleTheme && (
                <button
                  onClick={onToggleTheme}
                  className="p-2 text-slate-300 hover:text-white bg-slate-800 rounded-lg transition border border-slate-700"
                  title={`تبديل المظهر (الحالي: ${themeLabel})`}
                >
                  {currentThemeMode === 'system' ? (
                    <Monitor className="w-4 h-4 text-indigo-400" />
                  ) : currentThemeMode === 'dark' ? (
                    <Moon className="w-4 h-4 text-amber-400" />
                  ) : (
                    <Sun className="w-4 h-4 text-amber-500" />
                  )}
                </button>
              )}

              <button
                onClick={onOpenAddTransaction}
                className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1 transition"
                title="تسجيل عملية جديدة"
              >
                <PlusCircle className="w-4 h-4" />
                <span>عملية</span>
              </button>
            </div>
          </div>

          {/* Search Input Bar */}
          <div className="flex-1 max-w-md relative">
            <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث باسم العميل، رقم الهاتف، أو الملاحظات..."
              className="w-full bg-slate-800 text-slate-100 placeholder-slate-400 text-xs sm:text-sm rounded-xl pr-9 pl-4 py-2 border border-slate-700 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
              >
                مسح
              </button>
            )}
          </div>

          {/* Action Buttons Desktop */}
          <div className="hidden md:flex items-center gap-2.5">
            <button
              onClick={onOpenAddCustomer}
              className="bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 font-bold text-xs sm:text-sm px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition shadow-sm"
            >
              <UserPlus className="w-4 h-4" />
              <span>عميل جديد</span>
            </button>

            {onChangeCurrency && (
              <div className="relative flex items-center bg-slate-800 hover:bg-slate-700/80 rounded-xl border border-amber-500/40 px-2.5 py-1.5 transition shadow-sm">
                <Coins className="w-4 h-4 text-amber-400 ml-1.5" />
                <select
                  value={settings.currency}
                  onChange={(e) => onChangeCurrency(e.target.value)}
                  className="bg-transparent text-amber-300 text-xs sm:text-sm font-bold focus:outline-none cursor-pointer pr-1"
                  title="تحديد العملة الأساسية (سعودي / يمني / دولار)"
                >
                  <option value="ر.س" className="bg-slate-900 text-white">ريال سعودي (ر.س)</option>
                  <option value="ر.ي" className="bg-slate-900 text-white">ريال يمني (ر.ي)</option>
                  <option value="$" className="bg-slate-900 text-white">دولار أمريكي ($)</option>
                </select>
              </div>
            )}

            {onToggleTheme && (
              <button
                onClick={onToggleTheme}
                className="p-2 text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-xl transition border border-slate-700 flex items-center gap-1.5 cursor-pointer"
                title={`تبديل المظهر (الحالي: ${themeLabel})`}
              >
                {currentThemeMode === 'system' ? (
                  <Monitor className="w-5 h-5 text-indigo-400" />
                ) : currentThemeMode === 'dark' ? (
                  <Moon className="w-5 h-5 text-amber-400" />
                ) : (
                  <Sun className="w-5 h-5 text-amber-500" />
                )}
              </button>
            )}

            <button
              onClick={onOpenAddTransaction}
              className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs sm:text-sm px-4 py-2 rounded-xl flex items-center gap-1.5 transition shadow-md shadow-emerald-500/20"
            >
              <PlusCircle className="w-4 h-4" />
              <span>تسجيل عملية (له/عليه)</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className="p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-xl transition border border-slate-700"
              title="الإعدادات والنسخ الاحتياطي"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Bar Tabs */}
      <div className="bg-slate-950/80 border-t border-slate-800 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between overflow-x-auto no-scrollbar py-1">
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-bold flex items-center gap-2 transition whitespace-nowrap ${
                activeTab === 'dashboard'
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Wallet className="w-4 h-4" />
              <span>الرئيسية</span>
            </button>

            <button
              onClick={() => setActiveTab('customers')}
              className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-bold flex items-center gap-2 transition whitespace-nowrap ${
                activeTab === 'customers'
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>العملاء</span>
              <span className="bg-slate-800 text-slate-300 text-xs px-2 py-0.5 rounded-full font-mono">
                {stats.totalCustomers}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('reports')}
              className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-bold flex items-center gap-2 transition whitespace-nowrap ${
                activeTab === 'reports'
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>التقارير</span>
            </button>

            <button
              onClick={() => setActiveTab('overdue')}
              className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-bold flex items-center gap-2 transition whitespace-nowrap ${
                activeTab === 'overdue'
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>الديون المتأخرة</span>
              {stats.overdueCustomersCount > 0 && (
                <span className="bg-rose-500 text-white text-xs px-2 py-0.5 rounded-full font-bold animate-pulse">
                  {stats.overdueCustomersCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('flutter')}
              className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-bold flex items-center gap-2 transition whitespace-nowrap ${
                activeTab === 'flutter'
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Smartphone className="w-4 h-4 text-blue-400" />
              <span>مشروع فلاتر Flutter</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-bold flex items-center gap-2 transition whitespace-nowrap ${
                activeTab === 'settings'
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>الإعدادات والنسخ</span>
            </button>
          </nav>

          {/* Reset sample data hint */}
          <div className="hidden lg:flex items-center gap-2 text-xs text-slate-400">
            <button
              onClick={onResetSampleData}
              className="text-slate-400 hover:text-amber-400 transition flex items-center gap-1 bg-slate-800/60 px-2.5 py-1 rounded-md border border-slate-700/50"
              title="إعادة تحميل البيانات التجريبية للاختبار"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>بيانات تجريبية</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
