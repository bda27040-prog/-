import React, { useState } from 'react';
import { Camera, NightVisionMode } from '../types';
import { CameraStreamCanvas } from './CameraStreamCanvas';
import { PTZControlPanel } from './PTZControlPanel';
import { 
  X, Mic, MicOff, Volume2, VolumeX, ShieldAlert, Sparkles, 
  Camera as CameraIcon, Video, Moon, Sun, Maximize2, RefreshCw, 
  EyeOff, Sliders, AlertTriangle, CheckCircle, Send, Radio
} from 'lucide-react';

interface SingleCameraViewProps {
  camera: Camera;
  onClose: () => void;
  onUpdateCamera: (updatedCamera: Camera) => void;
  onAddSnapshot: (snapshotTitle: string, camera: Camera) => void;
  onUpdatePTZ: (cameraId: string, pan: number, tilt: number, zoom: number) => void;
}

export const SingleCameraView: React.FC<SingleCameraViewProps> = ({
  camera,
  onClose,
  onUpdateCamera,
  onAddSnapshot,
  onUpdatePTZ,
}) => {
  const [isMicActive, setIsMicActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSirenActive, setIsSirenActive] = useState(false);
  const [showPTZPanel, setShowPTZPanel] = useState(camera.ptzCapabilities.canPan || camera.ptzCapabilities.canTilt);
  const [showAIInspector, setShowAIInspector] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);

  // Handle Night Vision Switch
  const handleNightVisionChange = (mode: NightVisionMode) => {
    onUpdateCamera({
      ...camera,
      nightVisionMode: mode,
    });
  };

  // Toggle Privacy Mask
  const togglePrivacyMask = () => {
    onUpdateCamera({
      ...camera,
      privacyMaskEnabled: !camera.privacyMaskEnabled,
    });
  };

  // Take Snapshot
  const handleTakeSnapshot = () => {
    onAddSnapshot(`لقطة مباشرة - ${camera.name}`, camera);
  };

  // Trigger Emergency Siren
  const toggleSiren = () => {
    setIsSirenActive(!isSirenActive);
  };

  // Trigger Gemini AI Analysis for current camera frame
  const handleAnalyzeWithAI = async (customQuestion?: string) => {
    setAiLoading(true);
    setAiResponse(null);
    try {
      const res = await fetch('/api/ai-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cameraName: camera.name,
          location: camera.siteName,
          prompt: customQuestion || aiPrompt || 'قم بتحليل الكاميرا فوراً واذكر حالة الأمان والأشخاص والمخاطر والتوصية المباشرة.',
        }),
      });

      const data = await res.json();
      if (data.success) {
        setAiResponse(data.analysis);
      } else {
        setAiResponse(`⚠️ خطأ: ${data.error}`);
      }
    } catch (err: any) {
      setAiResponse(`❌ فشل الاتصال بخدمة الذكاء الاصطناعي: ${err.message}`);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xl flex flex-col overflow-y-auto p-3 md:p-6 text-slate-100">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
          <div>
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              {camera.name}
              <span className="text-xs bg-slate-800 text-sky-400 font-mono px-2.5 py-0.5 rounded-full border border-slate-700">
                {camera.resolution} • {camera.fps} FPS
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              الموقع: {camera.siteName} | عنوان IP: {camera.ipAddress} | العلامة: {camera.brand}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Gemini AI Inspector Button */}
          <button
            onClick={() => {
              setShowAIInspector(!showAIInspector);
              if (!showAIInspector && !aiResponse) handleAnalyzeWithAI();
            }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              showAIInspector
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                : 'bg-slate-800 hover:bg-slate-700 text-purple-300 border border-purple-500/30'
            }`}
          >
            <Sparkles className="w-4 h-4 text-purple-300 animate-spin-slow" />
            فحص بالذكاء الاصطناعي Gemini
          </button>

          <button
            onClick={onClose}
            className="p-2 bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        {/* Left 2 Columns: Big Camera Stream Player & Control Strip */}
        <div className="lg:col-col-span-2 lg:col-span-2 flex flex-col gap-4">
          {/* Canvas Stream */}
          <div className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-black">
            {/* Siren Alert Flash Banner */}
            {isSirenActive && (
              <div className="absolute top-0 inset-x-0 z-20 bg-rose-600/90 text-white py-2 px-4 flex items-center justify-between font-bold text-sm animate-pulse shadow-lg">
                <span className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  تم تفعيل إنذار السارينة والضوء الأمني فوراً لهذه الكاميرا!
                </span>
                <button
                  onClick={toggleSiren}
                  className="bg-white text-rose-700 px-3 py-0.5 rounded-lg text-xs"
                >
                  إلغاء الإنذار
                </button>
              </div>
            )}

            <CameraStreamCanvas
              camera={camera}
              showBoundingBoxes={true}
              showOverlayStats={true}
              isRecording={isRecording}
              className="aspect-video w-full"
            />
          </div>

          {/* Quick Interactive Control Bar */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 backdrop-blur-md">
            {/* Audio Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMicActive(!isMicActive)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  isMicActive
                    ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30 animate-pulse'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                }`}
              >
                {isMicActive ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                {isMicActive ? 'تحدث الآن (ميكروفون نشط)' : 'التحدث ثنائي الاتجاه'}
              </button>

              <button
                onClick={() => setIsMuted(!isMuted)}
                className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors"
                title={isMuted ? 'تشغيل الصوت' : 'كتم الصوت'}
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
              </button>
            </div>

            {/* Media Capture Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleTakeSnapshot}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-colors"
              >
                <CameraIcon className="w-4 h-4 text-sky-400" />
                التقاط لقطة
              </button>

              <button
                onClick={() => setIsRecording(!isRecording)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isRecording
                    ? 'bg-rose-600 text-white shadow-lg animate-pulse'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                }`}
              >
                <Video className="w-4 h-4" />
                {isRecording ? 'إيقاف التسجيل' : 'تسجيل مقطع'}
              </button>

              <button
                onClick={toggleSiren}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  isSirenActive
                    ? 'bg-rose-600 text-white animate-bounce'
                    : 'bg-rose-950/60 hover:bg-rose-900 border border-rose-800/80 text-rose-300'
                }`}
              >
                <ShieldAlert className="w-4 h-4" />
                إنذار السارينة
              </button>
            </div>

            {/* View Toggles */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowPTZPanel(!showPTZPanel)}
                className={`p-2.5 rounded-xl transition-colors ${
                  showPTZPanel ? 'bg-sky-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
                title="تأطير تحكم PTZ"
              >
                <Sliders className="w-4 h-4" />
              </button>

              <button
                onClick={togglePrivacyMask}
                className={`p-2.5 rounded-xl transition-colors ${
                  camera.privacyMaskEnabled ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
                title="تظليل الخصوصية"
              >
                <EyeOff className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* PTZ Panel (If toggled) */}
          {showPTZPanel && (
            <PTZControlPanel camera={camera} onUpdatePTZ={onUpdatePTZ} />
          )}
        </div>

        {/* Right Column: Settings & Night Vision & Gemini AI Inspector Panel */}
        <div className="flex flex-col gap-4">
          {/* Gemini AI Inspector Box */}
          {showAIInspector && (
            <div className="bg-slate-900/90 border border-purple-500/40 rounded-2xl p-5 text-slate-100 shadow-2xl backdrop-blur-md">
              <div className="flex items-center justify-between pb-3 border-b border-purple-500/20 mb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
                  <h3 className="font-bold text-base text-purple-200">فحص اللقطة بالذكاء الاصطناعي</h3>
                </div>
                <span className="text-[10px] bg-purple-950 text-purple-300 border border-purple-800 px-2 py-0.5 rounded-full font-mono">
                  Gemini 3.6 Flash
                </span>
              </div>

              <div className="mb-4">
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  اطرح سؤالاً محدداً عن الكاميرا الحالية:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="مثال: هل يوجد أي شخص مشبوه أو سيارة غريبة؟"
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-purple-500"
                  />
                  <button
                    onClick={() => handleAnalyzeWithAI()}
                    disabled={aiLoading}
                    className="bg-purple-600 hover:bg-purple-500 text-white px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 disabled:opacity-50"
                  >
                    {aiLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* AI Response Display */}
              <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-4 min-h-[160px] text-xs leading-relaxed text-slate-200 whitespace-pre-line font-sans">
                {aiLoading ? (
                  <div className="flex flex-col items-center justify-center h-32 text-purple-300 gap-2">
                    <RefreshCw className="w-6 h-6 animate-spin text-purple-400" />
                    <span>جاري تحليل الكاميرا بالذكاء الاصطناعي...</span>
                  </div>
                ) : aiResponse ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs pb-2 border-b border-slate-800">
                      <CheckCircle className="w-4 h-4" />
                      نتيجة التقرير الأمني المباشر:
                    </div>
                    {aiResponse}
                  </div>
                ) : (
                  <div className="text-slate-500 text-center py-8">
                    اضغط زر التحليل للبدء في قراءة اللقطة واكتشاف الحركة والأجسام.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Night Vision & Image Controls Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 text-slate-100 backdrop-blur-md">
            <h3 className="font-bold text-sm text-slate-200 mb-3 flex items-center gap-2">
              <Moon className="w-4 h-4 text-sky-400" />
              وضع الرؤية الليلية والإضاءة (Night Vision)
            </h3>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => handleNightVisionChange('infrared')}
                className={`p-3 rounded-xl border text-xs font-bold text-right transition-all flex flex-col gap-1 ${
                  camera.nightVisionMode === 'infrared'
                    ? 'bg-slate-800 border-sky-500 text-sky-400 shadow-md'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800/60'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Moon className="w-3.5 h-3.5" />
                  أشعة تحت الحمراء IR
                </span>
                <span className="text-[10px] font-normal text-slate-500">أبيض وأسود مع توضيح الظلام</span>
              </button>

              <button
                onClick={() => handleNightVisionChange('full_color_spotlight')}
                className={`p-3 rounded-xl border text-xs font-bold text-right transition-all flex flex-col gap-1 ${
                  camera.nightVisionMode === 'full_color_spotlight'
                    ? 'bg-slate-800 border-amber-500 text-amber-400 shadow-md'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800/60'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Sun className="w-3.5 h-3.5" />
                  كشاف بالألوان الكاملة
                </span>
                <span className="text-[10px] font-normal text-slate-500">تفعيل الضوء الكشافWarm Light</span>
              </button>
            </div>
          </div>

          {/* Camera Info Specs Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 text-slate-100 backdrop-blur-md">
            <h3 className="font-bold text-sm text-slate-200 mb-3">مواصفات وإعدادات الكاميرا</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400">حالة الاتصال:</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  متصل برابط RTSP
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400">قوة الإشارة:</span>
                <span className="font-mono text-slate-200">{camera.signalStrength}% Wi-Fi/LAN</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400">العنوان الفيزيائي MAC:</span>
                <span className="font-mono text-slate-300">{camera.macAddress}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-400">الرقم التسلسلي SN:</span>
                <span className="font-mono text-slate-300">{camera.serialNumber}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
