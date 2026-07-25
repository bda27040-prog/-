import React, { useState } from 'react';
import { DeviceNVR, Site } from '../types';
import { 
  Server, HardDrive, Cpu, Activity, RefreshCw, CheckCircle2, 
  AlertTriangle, Wrench, ShieldCheck, Database, Layers
} from 'lucide-react';

interface DeviceManagerProps {
  nvrs: DeviceNVR[];
  sites: Site[];
}

export const DeviceManager: React.FC<DeviceManagerProps> = ({ nvrs, sites }) => {
  const [rebootingId, setRebootingId] = useState<string | null>(null);
  const [formattingId, setFormattingId] = useState<string | null>(null);

  const handleReboot = (id: string) => {
    setRebootingId(id);
    setTimeout(() => {
      setRebootingId(null);
    }, 2500);
  };

  const handleFormatHdd = (id: string) => {
    setFormattingId(id);
    setTimeout(() => {
      setFormattingId(null);
    }, 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-sky-950 border border-sky-800 rounded-xl">
            <Server className="w-6 h-6 text-sky-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100">إدارة أجهزة التسجيل NVR / DVR وأقراص التخزين</h2>
            <p className="text-xs text-slate-400">مراقبة حالة الأقراص الصلبة HDD، القنوات النشطة، وإصدارات النظام</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs bg-slate-950 border border-slate-800 text-slate-300 px-3 py-1.5 rounded-xl font-mono">
            إجمالي أجهزة المسجل: {nvrs.length} NVR
          </span>
        </div>
      </div>

      {/* Grid of NVR Devices */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {nvrs.map((nvr) => {
          const usedPct = Math.round((nvr.hddUsedGb / nvr.hddCapacityGb) * 100);
          const isRebooting = rebootingId === nvr.id;
          const isFormatting = formattingId === nvr.id;

          return (
            <div
              key={nvr.id}
              className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 space-y-4 shadow-xl backdrop-blur-md transition-all relative overflow-hidden"
            >
              {/* Device Header */}
              <div className="flex items-start justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                    {nvr.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">{nvr.siteName} • {nvr.model}</p>
                </div>
                <span className="text-[10px] bg-emerald-950 border border-emerald-800 text-emerald-400 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  {nvr.hddStatus}
                </span>
              </div>

              {/* HDD Storage Gauge Bar */}
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                    <HardDrive className="w-4 h-4 text-amber-400" />
                    استهلاك قرص التخزين HDD:
                  </span>
                  <span className="font-mono text-amber-400 font-bold">{usedPct}%</span>
                </div>

                <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      usedPct > 85 ? 'bg-rose-500' : usedPct > 60 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${usedPct}%` }}
                  />
                </div>

                <div className="flex justify-between text-[11px] font-mono text-slate-400 pt-1">
                  <span>المستخدم: {(nvr.hddUsedGb / 1024).toFixed(1)} TB</span>
                  <span>الإجمالي: {(nvr.hddCapacityGb / 1024).toFixed(1)} TB</span>
                </div>
              </div>

              {/* Network & Specs List */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-800/60 text-slate-300">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-sky-400" />
                    القنوات المستخدمة:
                  </span>
                  <span className="font-mono font-bold">{nvr.activeChannels} / {nvr.totalChannels} Channel</span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-800/60 text-slate-300">
                  <span className="text-slate-400">عنوان IP:</span>
                  <span className="font-mono">{nvr.ipAddress}</span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-800/60 text-slate-300">
                  <span className="text-slate-400">ساعات التشغيل المستمر:</span>
                  <span className="font-mono">{nvr.uptimeDays} يوم</span>
                </div>

                <div className="flex justify-between py-1 text-slate-300">
                  <span className="text-slate-400">إصدار النظام (Firmware):</span>
                  <span className="font-mono text-slate-400">{nvr.firmwareVersion}</span>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-2 border-t border-slate-800 flex items-center gap-2">
                <button
                  onClick={() => handleReboot(nvr.id)}
                  disabled={isRebooting}
                  className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRebooting ? 'animate-spin text-sky-400' : ''}`} />
                  {isRebooting ? 'جاري إعادة التشغيل...' : 'إعادة التشغيل'}
                </button>

                <button
                  onClick={() => handleFormatHdd(nvr.id)}
                  disabled={isFormatting}
                  className="py-2 px-3 bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-300 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1 disabled:opacity-50"
                  title="تهيأة القرص الصلب"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  {isFormatting ? 'جاري التهيأة...' : 'تهيئة القرص'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
