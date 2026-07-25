import React, { useState } from 'react';
import { SecurityEvent, Camera } from '../types';
import { 
  Bell, ShieldAlert, AlertTriangle, CheckCircle, Info, 
  Sparkles, Filter, Check, Clock, Camera as CameraIcon, RefreshCw
} from 'lucide-react';

interface AlertsCenterProps {
  events: SecurityEvent[];
  cameras: Camera[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
}

export const AlertsCenter: React.FC<AlertsCenterProps> = ({
  events,
  cameras,
  onMarkRead,
  onMarkAllRead,
}) => {
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [loadingAiReport, setLoadingAiReport] = useState(false);

  const filteredEvents = events.filter((e) => {
    if (filterSeverity === 'all') return true;
    return e.severity === filterSeverity;
  });

  const unreadCount = events.filter((e) => !e.read).length;

  const handleGenerateAiDailyBriefing = async () => {
    setLoadingAiReport(true);
    try {
      const res = await fetch('/api/ai-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          events: events,
          cameraCount: cameras.length,
          sitesCount: 3,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAiReport(data.summary);
      } else {
        setAiReport(`⚠️ error: ${data.error}`);
      }
    } catch (e: any) {
      setAiReport(`❌ فشل الاتصال: ${e.message}`);
    } finally {
      setLoadingAiReport(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-rose-950 border border-rose-800 rounded-xl relative">
            <Bell className="w-6 h-6 text-rose-400" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-600 text-white font-bold text-[10px] rounded-full flex items-center justify-center animate-bounce">
                {unreadCount}
              </span>
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100">سجل التنبيهات والأحداث الأمنية المباشرة</h2>
            <p className="text-xs text-slate-400">إشعارات كشف الحركة، التسلل، والتعرف على لوحات السيارات والأشخاص</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleGenerateAiDailyBriefing}
            disabled={loadingAiReport}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg flex items-center gap-2 disabled:opacity-50"
          >
            {loadingAiReport ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-purple-200" />}
            توليد التقرير الموحد بالذكاء الاصطناعي
          </button>

          <button
            onClick={onMarkAllRead}
            className="px-3.5 py-2 bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <Check className="w-4 h-4 text-emerald-400" />
            تحديد الكل كمقروء
          </button>
        </div>
      </div>

      {/* AI Daily Security Briefing Modal Card */}
      {aiReport && (
        <div className="bg-slate-900/90 border border-purple-500/40 rounded-2xl p-6 backdrop-blur-md space-y-3 shadow-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-purple-500/20">
            <h3 className="font-bold text-base text-purple-300 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              الموجز الأمني اليومي الذكي (Executive Briefing)
            </h3>
            <button
              onClick={() => setAiReport(null)}
              className="text-slate-400 hover:text-white text-xs font-semibold"
            >
              إغلاق التقرير
            </button>
          </div>

          <div className="text-xs leading-relaxed text-slate-200 whitespace-pre-line font-sans bg-slate-950 p-4 rounded-xl border border-slate-800">
            {aiReport}
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-slate-400 font-semibold flex items-center gap-1 pl-2">
          <Filter className="w-3.5 h-3.5" />
          تصفية حسب الخطورة:
        </span>

        {['all', 'critical', 'high', 'medium', 'low'].map((sev) => (
          <button
            key={sev}
            onClick={() => setFilterSeverity(sev)}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all border ${
              filterSeverity === sev
                ? 'bg-sky-600 border-sky-500 text-white shadow-md'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
            }`}
          >
            {sev === 'all' && 'جميع الأحداث'}
            {sev === 'critical' && 'حرج جداً 🚨'}
            {sev === 'high' && 'خطورة عالية ⚠️'}
            {sev === 'medium' && 'متوسط ⚡'}
            {sev === 'low' && 'عادي / معلومات ℹ️'}
          </button>
        ))}
      </div>

      {/* Events Feed List */}
      <div className="space-y-3">
        {filteredEvents.length === 0 ? (
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-10 text-center text-slate-500 text-xs">
            لا توجد تنبيهات أمنية مطابقة للتصفية الحالية.
          </div>
        ) : (
          filteredEvents.map((event) => {
            return (
              <div
                key={event.id}
                onClick={() => onMarkRead(event.id)}
                className={`bg-slate-900/90 border rounded-2xl p-4 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:border-slate-700 ${
                  !event.read ? 'border-rose-500/40 bg-slate-900/95' : 'border-slate-800 opacity-90'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className={`p-3 rounded-xl border shrink-0 ${
                    event.severity === 'critical'
                      ? 'bg-rose-950 border-rose-800 text-rose-400 animate-pulse'
                      : event.severity === 'high'
                      ? 'bg-amber-950 border-amber-800 text-amber-400'
                      : 'bg-slate-950 border-slate-800 text-sky-400'
                  }`}>
                    {event.severity === 'critical' ? <ShieldAlert className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-slate-100">{event.description}</h4>
                      {!event.read && (
                        <span className="w-2 h-2 rounded-full bg-rose-500" title="غير مقروء" />
                      )}
                    </div>

                    <div className="text-xs text-slate-400 flex flex-wrap items-center gap-3 font-mono">
                      <span>الكاميرا: {event.cameraName}</span>
                      <span>•</span>
                      <span>الموقع: {event.siteName}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-sky-400" />
                        {event.timeStr} ({event.dateStr})
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold border ${
                    event.severity === 'critical'
                      ? 'bg-rose-950 text-rose-300 border-rose-800'
                      : event.severity === 'high'
                      ? 'bg-amber-950 text-amber-300 border-amber-800'
                      : 'bg-slate-950 text-sky-300 border-slate-800'
                  }`}>
                    {event.severity === 'critical' ? 'حرج جداً' : event.severity === 'high' ? 'عالي' : 'متوسط'}
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onMarkRead(event.id);
                    }}
                    className="p-2 bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-xl transition-colors"
                    title="تحديد كمقروء"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
