import React from 'react';
import { UserProfile, Site } from '../types';
import { 
  ShieldCheck, Bell, Building2, User, Wifi, Sparkles, Plus, Radio
} from 'lucide-react';

interface HeaderProps {
  user: UserProfile;
  sites: Site[];
  unreadAlertsCount: number;
  selectedSiteId: string;
  onSelectSite: (siteId: string) => void;
  onOpenAuthModal: () => void;
  onOpenAddCameraModal: () => void;
  onNavigateTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  sites,
  unreadAlertsCount,
  selectedSiteId,
  onSelectSite,
  onOpenAuthModal,
  onOpenAddCameraModal,
  onNavigateTab,
}) => {
  return (
    <header className="bg-slate-900/90 border-b border-slate-800/80 sticky top-0 z-40 backdrop-blur-xl px-4 md:px-8 py-3 flex items-center justify-between text-slate-100 shadow-2xl">
      {/* Right Side (RTL Start): Logo & System Identity */}
      <div className="flex items-center gap-4">
        <div
          onClick={() => onNavigateTab('dashboard')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-600 to-blue-500 border border-sky-400/50 flex items-center justify-center shadow-lg shadow-sky-600/30 group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black tracking-wide text-slate-100">حــارس</h1>
              <span className="text-[10px] bg-sky-950 text-sky-400 border border-sky-800/80 px-2 py-0.5 rounded-full font-mono font-bold">
                CCTV OS v4.2
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-sans">نظام المراقبة وإدارة أجهزة CCTV و IP Cameras</p>
          </div>
        </div>

        {/* Site Switcher Pill */}
        <div className="hidden lg:flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs">
          <Building2 className="w-4 h-4 text-sky-400" />
          <span className="text-slate-400">الموقع الحالي:</span>
          <select
            value={selectedSiteId}
            onChange={(e) => onSelectSite(e.target.value)}
            className="bg-transparent text-slate-100 font-bold focus:outline-none cursor-pointer"
          >
            <option value="all" className="bg-slate-900">جميع المواقع ({sites.length})</option>
            {sites.map((s) => (
              <option key={s.id} value={s.id} className="bg-slate-900">
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Left Side (RTL End): Actions, Alerts, User Profile */}
      <div className="flex items-center gap-3">
        {/* Network & Live Latency Indicator */}
        <div className="hidden sm:flex items-center gap-2 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl text-xs font-mono text-emerald-400">
          <Radio className="w-3.5 h-3.5 animate-pulse" />
          <span>RTSP LIVE (12ms)</span>
        </div>

        {/* Add Camera Action Button */}
        <button
          onClick={onOpenAddCameraModal}
          className="px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-sky-600/25 flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">إضافة كاميرا IP</span>
        </button>

        {/* Notifications Bell Button */}
        <button
          onClick={() => onNavigateTab('alerts')}
          className="p-2.5 bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-300 rounded-xl transition-colors relative"
          title="سجل التنبيهات والأحداث"
        >
          <Bell className="w-4 h-4 text-slate-300" />
          {unreadAlertsCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce">
              {unreadAlertsCount}
            </span>
          )}
        </button>

        {/* User Profile Button */}
        <div
          onClick={onOpenAuthModal}
          className="flex items-center gap-2.5 bg-slate-950 border border-slate-800 hover:border-slate-700 p-1.5 pl-3 rounded-xl cursor-pointer transition-all"
        >
          <img src={user.avatar} alt={user.name} className="w-7 h-7 rounded-lg object-cover border border-slate-700" />
          <div className="hidden md:block text-right">
            <div className="text-xs font-bold text-slate-200">{user.name}</div>
            <div className="text-[10px] text-sky-400 font-semibold">{user.role}</div>
          </div>
        </div>
      </div>
    </header>
  );
};
