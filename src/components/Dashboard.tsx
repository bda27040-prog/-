import React, { useState } from 'react';
import { Camera, Site, DeviceNVR, SecurityEvent } from '../types';
import { CameraStreamCanvas } from './CameraStreamCanvas';
import { 
  Camera as CameraIcon, ShieldCheck, HardDrive, Bell, Building2, 
  Sparkles, ShieldAlert, Maximize2, AlertTriangle, RefreshCw, 
  CheckCircle2, ArrowRight, Play, Eye
} from 'lucide-react';

interface DashboardProps {
  cameras: Camera[];
  sites: Site[];
  nvrs: DeviceNVR[];
  events: SecurityEvent[];
  onSelectCamera: (cam: Camera) => void;
  onNavigateTab: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  cameras,
  sites,
  nvrs,
  events,
  onSelectCamera,
  onNavigateTab,
}) => {
  const [aiBriefing, setAiBriefing] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const onlineCameras = cameras.filter((c) => c.status === 'online').length;
  const unreadAlerts = events.filter((e) => !e.read).length;

  const totalCapacity = nvrs.reduce((acc, n) => acc + n.hddCapacityGb, 0);
  const usedCapacity = nvrs.reduce((acc, n) => acc + n.hddUsedGb, 0);
  const storagePct = totalCapacity ? Math.round((usedCapacity / totalCapacity) * 100) : 0;

  const handleGenerateAiBriefing = async () => {
    setAiLoading(true);
    try {
      const res = await fetch('/api/ai-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          events: events,
          cameraCount: cameras.length,
          sitesCount: sites.length,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAiBriefing(data.summary);
      }
    } catch (e: any) {
      console.error(e);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Welcome & Quick Actions Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 backdrop-blur-md flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
            <h1 className="text-xl font-extrabold text-slate-100">
              مركز العمليات والمراقبة الأمني المباشر (CCTV Security Command Center)
            </h1>
          </div>
          <p className="text-xs text-slate-400">
            متابعة البث المباشر لكاميرات المراقبة، التنبيهات الفورية، وتحليلات الذكاء الاصطناعي
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleGenerateAiBriefing}
            disabled={aiLoading}
            className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs transition-all shadow-lg shadow-purple-600/20 flex items-center gap-2 disabled:opacity-50"
          >
            {aiLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-purple-200" />}
            توليد التقرير الأمني بالذكاء الاصطناعي
          </button>

          <button
            onClick={() => onNavigateTab('live')}
            className="px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl text-xs transition-all shadow-lg shadow-sky-600/20 flex items-center gap-2"
          >
            <Play className="w-4 h-4 fill-current" />
            شبكة البث المباشر (Live Grid)
          </button>
        </div>
      </div>

      {/* AI Daily Briefing Box (If generated) */}
      {aiBriefing && (
        <div className="bg-slate-900/95 border border-purple-500/40 rounded-2xl p-6 backdrop-blur-md shadow-2xl space-y-3">
          <div className="flex items-center justify-between border-b border-purple-500/20 pb-3">
            <h3 className="font-bold text-base text-purple-300 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              التقرير والتوجيه الأمني اليومي المولد بالذكاء الاصطناعي
            </h3>
            <button onClick={() => setAiBriefing(null)} className="text-xs text-slate-400 hover:text-white">
              إغلاق
            </button>
          </div>
          <div className="text-xs leading-relaxed text-slate-200 whitespace-pre-line bg-slate-950 p-4 rounded-xl border border-slate-800 font-sans">
            {aiBriefing}
          </div>
        </div>
      )}

      {/* Overview Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Cameras Stat */}
        <div
          onClick={() => onNavigateTab('live')}
          className="bg-slate-900/90 border border-slate-800 hover:border-sky-500/50 rounded-2xl p-5 shadow-xl backdrop-blur-md cursor-pointer transition-all space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">الكاميرات النشطة</span>
            <div className="p-2.5 bg-sky-950 border border-sky-800 text-sky-400 rounded-xl group-hover:scale-110 transition-transform">
              <CameraIcon className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-100 font-mono">
            {onlineCameras} <span className="text-xs font-normal text-slate-400">/ {cameras.length} كاميرا</span>
          </div>
          <div className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1 pt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            استقرار الاتصال بنسبة 100%
          </div>
        </div>

        {/* Sites Stat */}
        <div
          onClick={() => onNavigateTab('sites')}
          className="bg-slate-900/90 border border-slate-800 hover:border-sky-500/50 rounded-2xl p-5 shadow-xl backdrop-blur-md cursor-pointer transition-all space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">المواقع المراقبة</span>
            <div className="p-2.5 bg-sky-950 border border-sky-800 text-sky-400 rounded-xl group-hover:scale-110 transition-transform">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-100 font-mono">
            {sites.length} <span className="text-xs font-normal text-slate-400">مواقع رئيسية</span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono pt-1">الرياض، جدة، ودبي</div>
        </div>

        {/* HDD Storage Stat */}
        <div
          onClick={() => onNavigateTab('devices')}
          className="bg-slate-900/90 border border-slate-800 hover:border-amber-500/50 rounded-2xl p-5 shadow-xl backdrop-blur-md cursor-pointer transition-all space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">التخزين NVR / HDD</span>
            <div className="p-2.5 bg-amber-950 border border-amber-800 text-amber-400 rounded-xl group-hover:scale-110 transition-transform">
              <HardDrive className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-100 font-mono">
            {storagePct}% <span className="text-xs font-normal text-slate-400">مُستغل</span>
          </div>
          <div className="text-[11px] text-amber-400 font-mono pt-1">
            متبقي {( (totalCapacity - usedCapacity) / 1024 ).toFixed(1)} TB
          </div>
        </div>

        {/* Alerts Stat */}
        <div
          onClick={() => onNavigateTab('alerts')}
          className="bg-slate-900/90 border border-slate-800 hover:border-rose-500/50 rounded-2xl p-5 shadow-xl backdrop-blur-md cursor-pointer transition-all space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">تنبيهات اليوم</span>
            <div className="p-2.5 bg-rose-950 border border-rose-800 text-rose-400 rounded-xl group-hover:scale-110 transition-transform relative">
              <Bell className="w-5 h-5" />
              {unreadAlerts > 0 && (
                <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-rose-500 animate-ping" />
              )}
            </div>
          </div>
          <div className="text-2xl font-black text-slate-100 font-mono">
            {unreadAlerts} <span className="text-xs font-normal text-rose-400">تنبيه حرج/جديد</span>
          </div>
          <div className="text-[11px] text-slate-400 pt-1">رصد حركة وعبور الخطوط</div>
        </div>
      </div>

      {/* Live Cameras Multi-View Stream Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Eye className="w-5 h-5 text-sky-400" />
            شاشة البث الحي السريع لكاميرات الموقع
          </h2>
          <button
            onClick={() => onNavigateTab('live')}
            className="text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1"
          >
            عرض كافة الكاميرات والتحكم
            <ArrowRight className="w-4 h-4 rotate-180" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cameras.slice(0, 6).map((cam) => (
            <div
              key={cam.id}
              onClick={() => onSelectCamera(cam)}
              className="bg-slate-900/90 border border-slate-800 hover:border-sky-500/60 rounded-2xl p-4 space-y-3 shadow-xl backdrop-blur-md cursor-pointer transition-all group"
            >
              <div className="relative aspect-video rounded-xl overflow-hidden bg-black border border-slate-800">
                <CameraStreamCanvas
                  camera={cam}
                  showBoundingBoxes={true}
                  showOverlayStats={true}
                />
                <div className="absolute inset-0 bg-sky-500/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none flex items-center justify-center">
                  <span className="bg-slate-950/90 text-sky-400 text-xs font-bold px-3 py-1.5 rounded-xl border border-sky-500 shadow-xl flex items-center gap-1.5">
                    <Maximize2 className="w-3.5 h-3.5" />
                    تكبير الشاشة والتحكم PTZ
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-100">{cam.name}</div>
                  <div className="text-[11px] text-slate-400">{cam.siteName}</div>
                </div>
                <span className="text-[10px] bg-slate-950 text-sky-300 border border-slate-800 px-2 py-0.5 rounded font-mono">
                  {cam.type}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Live Security Events Ticker */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 backdrop-blur-md space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
          <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
            <Bell className="w-4 h-4 text-rose-400" />
            أحدث التنبيهات ورصد الحركة المكتشفة مؤخراً
          </h3>
          <button
            onClick={() => onNavigateTab('alerts')}
            className="text-xs text-sky-400 hover:text-sky-300 font-semibold"
          >
            سجل التنبيهات الكلي ({events.length})
          </button>
        </div>

        <div className="space-y-2">
          {events.slice(0, 3).map((evt) => (
            <div
              key={evt.id}
              onClick={() => onNavigateTab('alerts')}
              className="p-3 bg-slate-950 border border-slate-800/80 hover:border-slate-700 rounded-xl text-xs flex items-center justify-between cursor-pointer transition-all"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span className="font-bold text-slate-200">{evt.description}</span>
                <span className="text-slate-500 text-[11px] font-mono">({evt.cameraName})</span>
              </div>
              <span className="text-slate-400 font-mono text-[11px]">{evt.timeStr}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
