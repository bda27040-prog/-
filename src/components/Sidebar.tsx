import React from 'react';
import { 
  LayoutDashboard, Video, Film, Sparkles, MapPin, 
  Server, Bell, Image as ImageIcon, Settings, ChevronLeft
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  unreadAlertsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  unreadAlertsCount,
}) => {
  const menuItems = [
    { id: 'dashboard', label: 'لوحة التحكم والمراقبة', icon: LayoutDashboard },
    { id: 'live', label: 'شاشة البث المباشر (Live Grid)', icon: Video },
    { id: 'playback', label: 'التسجيلات والإعادة (Playback)', icon: Film },
    { id: 'ai', label: 'الذكاء الاصطناعي ومناطق الحركة', icon: Sparkles, badge: 'AI' },
    { id: 'map', label: 'الخريطة والمواقع المتعددة', icon: MapPin },
    { id: 'devices', label: 'أجهزة NVR والتخزين HDD', icon: Server },
    { id: 'alerts', label: 'سجل التنبيهات والإنذارات', icon: Bell, badgeCount: unreadAlertsCount },
    { id: 'gallery', label: 'المعرض واللقطات المحفوظة', icon: ImageIcon },
    { id: 'settings', label: 'إعدادات النظام والشبكة', icon: Settings },
  ];

  return (
    <aside className="w-full lg:w-64 bg-slate-900/90 border-l border-slate-800/80 p-4 space-y-2 backdrop-blur-xl shrink-0">
      <div className="text-[11px] font-bold text-slate-500 px-3 pb-2 uppercase tracking-wider">
        القائمة الرئيسية للنظام
      </div>

      <nav className="space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full p-3 rounded-xl text-xs font-bold transition-all flex items-center justify-between group ${
                isActive
                  ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/30'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-white' : 'text-sky-400 group-hover:text-sky-300'}`} />
                <span>{item.label}</span>
              </div>

              {item.badge && (
                <span className="text-[10px] bg-purple-950 text-purple-300 border border-purple-800 px-2 py-0.5 rounded-full font-mono font-bold">
                  {item.badge}
                </span>
              )}

              {item.badgeCount !== undefined && item.badgeCount > 0 && (
                <span className="text-[10px] bg-rose-600 text-white px-2 py-0.5 rounded-full font-bold animate-pulse">
                  {item.badgeCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </aside>
  );
};
