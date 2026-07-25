import React, { useState } from 'react';
import { 
  Settings, Wifi, ShieldCheck, Video, Volume2, Lock, 
  Save, CheckCircle2, Server, Globe, Key, Bell
} from 'lucide-react';

export const SettingsPanel: React.FC = () => {
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [codec, setCodec] = useState('H.265');
  const [bitrateMode, setBitrateMode] = useState('CBR');
  const [ipMode, setIpMode] = useState('dhcp');
  const [p2pCloudEnabled, setP2pCloudEnabled] = useState(true);
  const [twoFactorAuth, setTwoFactorAuth] = useState(true);
  const [audioGain, setAudioGain] = useState(75);
  const [sirenVol, setSirenVol] = useState(90);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
    }, 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-sky-950 border border-sky-800 rounded-xl">
            <Settings className="w-6 h-6 text-sky-400 animate-spin-slow" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100">إعدادات النظام والشبكة والصوت (CCTV OS Settings)</h2>
            <p className="text-xs text-slate-400">ترميز الفيديو، أمان الشبكة والربط السحابي P2P، وإعدادات الإنذار</p>
          </div>
        </div>

        {savedSuccess && (
          <div className="bg-emerald-950 border border-emerald-800 text-emerald-300 text-xs px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 animate-pulse">
            <CheckCircle2 className="w-4 h-4" />
            تم حفظ جميع الإعدادات بنجاح
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Video Encoding Settings */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4 backdrop-blur-md">
          <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-3">
            <Video className="w-4 h-4 text-sky-400" />
            إعدادات ترميز ودقة الفيديو (Video Encoding & Codec)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">خوارزمية الضغط (Codec)</label>
              <select
                value={codec}
                onChange={(e) => setCodec(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-sky-500"
              >
                <option value="H.265">H.265+ (أعلى كفاءة وتوفير مساحة HDD)</option>
                <option value="H.264">H.264 High Profile (توافق معالجات أقدم)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">نمط تدفق البتات (Bitrate Control)</label>
              <select
                value={bitrateMode}
                onChange={(e) => setBitrateMode(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-sky-500"
              >
                <option value="CBR">CBR (معدل بت ثابت لاستقرار الشبكة)</option>
                <option value="VBR">VBR (معدل بت متغير لجودة جبارة عند الحركة)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Network & P2P Cloud Settings */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4 backdrop-blur-md">
          <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-3">
            <Globe className="w-4 h-4 text-emerald-400" />
            إعدادات الشبكة والوصول السحابي (P2P Cloud & RTSP Ports)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">تعيين عنوان IP</label>
              <select
                value={ipMode}
                onChange={(e) => setIpMode(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-sky-500"
              >
                <option value="dhcp">تلقائي DHCP (توليد تلقائي من الراوتر)</option>
                <option value="static">عنوان ثابت Static IP (مستقر للسيرفرات)</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-slate-950 border border-slate-800 rounded-xl">
              <div>
                <div className="font-bold text-slate-200">الربط السحابي P2P Cloud ID</div>
                <div className="text-[11px] text-slate-400">البث المباشر عن بعد بدون الحاجة لـ Public IP</div>
              </div>
              <button
                type="button"
                onClick={() => setP2pCloudEnabled(!p2pCloudEnabled)}
                className={`w-10 h-5 rounded-full transition-colors relative ${p2pCloudEnabled ? 'bg-emerald-600' : 'bg-slate-800'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all ${p2pCloudEnabled ? 'right-5' : 'right-0.5'}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Audio & Alarm Settings */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4 backdrop-blur-md">
          <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-3">
            <Volume2 className="w-4 h-4 text-amber-400" />
            إعدادات الميكروفون والسارينة الصوتيّة
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="space-y-2">
              <div className="flex justify-between font-semibold text-slate-300">
                <span>حساسية الميكروفون ثنائي الاتجاه (Mic Gain):</span>
                <span className="font-mono text-amber-400">{audioGain}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={audioGain}
                onChange={(e) => setAudioGain(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between font-semibold text-slate-300">
                <span>مستوى صوت السارينة والإنذار (Siren Volume):</span>
                <span className="font-mono text-rose-400">{sirenVol}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={sirenVol}
                onChange={(e) => setSirenVol(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-rose-500"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-8 py-3 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl text-xs transition-all shadow-xl shadow-sky-600/20 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            حفظ إعدادات النظام الحالية
          </button>
        </div>
      </form>
    </div>
  );
};
