import React, { useState, useRef } from 'react';
import { Camera } from '../types';
import { CameraStreamCanvas } from './CameraStreamCanvas';
import { 
  Sparkles, ShieldCheck, UserCheck, Car, Package, ScanFace, 
  Sliders, PenTool, RotateCcw, Save, CheckCircle, RefreshCw, Send, AlertTriangle
} from 'lucide-react';

interface AIDetectionManagerProps {
  cameras: Camera[];
  onUpdateCamera: (updatedCamera: Camera) => void;
}

export const AIDetectionManager: React.FC<AIDetectionManagerProps> = ({
  cameras,
  onUpdateCamera,
}) => {
  const [selectedCameraId, setSelectedCameraId] = useState<string>(cameras[0]?.id || 'cam-1');
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<string | null>(null);
  const [zonePoints, setZonePoints] = useState<{ x: number; y: number }[]>([
    { x: 100, y: 80 },
    { x: 400, y: 80 },
    { x: 450, y: 280 },
    { x: 50, y: 280 },
  ]);
  const [isDrawing, setIsDrawing] = useState(false);

  const activeCamera = cameras.find((c) => c.id === selectedCameraId) || cameras[0];

  const handleToggleAiFeature = (feature: keyof Camera['aiDetection']) => {
    onUpdateCamera({
      ...activeCamera,
      aiDetection: {
        ...activeCamera.aiDetection,
        [feature]: !activeCamera.aiDetection[feature],
      },
    });
  };

  const handleSensitivityChange = (value: number) => {
    onUpdateCamera({
      ...activeCamera,
      motionSensitivity: value,
    });
  };

  const handleRunAiInspection = async () => {
    setAiLoading(true);
    setAiAnalysisResult(null);
    try {
      const res = await fetch('/api/ai-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cameraName: activeCamera.name,
          location: activeCamera.siteName,
          prompt: aiQuestion || 'حلل خوارزميات كشف الأشخاص والمركبات ولوحات السيارات لهذه الكاميرا وتقديم تقرير أمني.',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAiAnalysisResult(data.analysis);
      } else {
        setAiAnalysisResult(`⚠️ error: ${data.error}`);
      }
    } catch (e: any) {
      setAiAnalysisResult(`❌ فشل الاتصال: ${e.message}`);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900/90 border border-purple-500/30 rounded-2xl p-5 backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-950/80 border border-purple-800/80 rounded-xl">
              <Sparkles className="w-6 h-6 text-purple-400 animate-spin-slow" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                نظام كشف الأجسام واختراق المناطق بالذكاء الاصطناعي (AI Vision)
              </h2>
              <p className="text-xs text-slate-400">
                تحديد قواعد كشف الأشخاص، السيارات، وجوه الزوار، ورسم مناطق الأمان المحظورة over-stream
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs">
            <span className="text-slate-400">اختر الكاميرا:</span>
            <select
              value={selectedCameraId}
              onChange={(e) => setSelectedCameraId(e.target.value)}
              className="bg-transparent text-slate-100 font-semibold focus:outline-none"
            >
              {cameras.map((c) => (
                <option key={c.id} value={c.id} className="bg-slate-900">
                  {c.name} ({c.siteName})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid: Intrusion Drawing Canvas & Detection Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Live Camera Stream with Polygon Overlay Zone */}
        <div className="lg:col-span-2 space-y-4">
          <div className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-black">
            <CameraStreamCanvas
              camera={activeCamera}
              showBoundingBoxes={true}
              showOverlayStats={true}
              className="aspect-video w-full"
            />

            {/* Interactive SVG Intrusion Zone Overlay */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {/* Intrusion Zone Polygon */}
              <polygon
                points={zonePoints.map((p) => `${p.x},${p.y}`).join(' ')}
                fill="rgba(239, 68, 68, 0.2)"
                stroke="#ef4444"
                strokeWidth="2.5"
                strokeDasharray="6 4"
              />
              {/* Handle Points */}
              {zonePoints.map((p, idx) => (
                <circle
                  key={idx}
                  cx={p.x}
                  cy={p.y}
                  r="6"
                  fill="#ef4444"
                  stroke="#ffffff"
                  strokeWidth="2"
                />
              ))}
            </svg>

            <div className="absolute bottom-4 right-4 bg-slate-950/90 border border-rose-800 text-rose-300 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              منطقة الحماية الخطرة المحظورة (Intrusion Zone Active)
            </div>
          </div>

          {/* Zone Control Bar */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setZonePoints([
                  { x: 80, y: 60 },
                  { x: 380, y: 60 },
                  { x: 420, y: 260 },
                  { x: 40, y: 260 },
                ])}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                إعادة رسم منطقة الأمان
              </button>
            </div>

            <div className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4" />
              تم حفظ خطوط الأمان تلقائياً
            </div>
          </div>
        </div>

        {/* Right Column: AI Toggles & Sensitivity */}
        <div className="space-y-6">
          {/* AI Features Toggles */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-3">
              <Sliders className="w-4 h-4 text-purple-400" />
              قواعد الاكتشاف والذكاء الاصطناعي
            </h3>

            <div className="space-y-2.5">
              {/* Person Detection */}
              <button
                onClick={() => handleToggleAiFeature('person')}
                className={`w-full p-3 rounded-xl border text-xs font-bold text-right flex items-center justify-between transition-all ${
                  activeCamera.aiDetection.person
                    ? 'bg-purple-950/60 border-purple-500 text-purple-200'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <UserCheck className="w-4 h-4 text-purple-400" />
                  <span>كشف حركة الأشخاص (Person)</span>
                </div>
                <div className={`w-8 h-4 rounded-full transition-colors relative ${activeCamera.aiDetection.person ? 'bg-purple-600' : 'bg-slate-800'}`}>
                  <div className={`w-3 h-3 bg-white rounded-full absolute top-0.5 transition-all ${activeCamera.aiDetection.person ? 'right-4' : 'right-0.5'}`} />
                </div>
              </button>

              {/* Vehicle & Plate Detection */}
              <button
                onClick={() => handleToggleAiFeature('vehicle')}
                className={`w-full p-3 rounded-xl border text-xs font-bold text-right flex items-center justify-between transition-all ${
                  activeCamera.aiDetection.vehicle
                    ? 'bg-purple-950/60 border-purple-500 text-purple-200'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Car className="w-4 h-4 text-amber-400" />
                  <span>كشف لوحات وركن السيارات (Vehicle/ANPR)</span>
                </div>
                <div className={`w-8 h-4 rounded-full transition-colors relative ${activeCamera.aiDetection.vehicle ? 'bg-purple-600' : 'bg-slate-800'}`}>
                  <div className={`w-3 h-3 bg-white rounded-full absolute top-0.5 transition-all ${activeCamera.aiDetection.vehicle ? 'right-4' : 'right-0.5'}`} />
                </div>
              </button>

              {/* Face Recognition */}
              <button
                onClick={() => handleToggleAiFeature('face')}
                className={`w-full p-3 rounded-xl border text-xs font-bold text-right flex items-center justify-between transition-all ${
                  activeCamera.aiDetection.face
                    ? 'bg-purple-950/60 border-purple-500 text-purple-200'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <ScanFace className="w-4 h-4 text-sky-400" />
                  <span>التعرف على الوجوه (Face ID Match)</span>
                </div>
                <div className={`w-8 h-4 rounded-full transition-colors relative ${activeCamera.aiDetection.face ? 'bg-purple-600' : 'bg-slate-800'}`}>
                  <div className={`w-3 h-3 bg-white rounded-full absolute top-0.5 transition-all ${activeCamera.aiDetection.face ? 'right-4' : 'right-0.5'}`} />
                </div>
              </button>

              {/* Package Detection */}
              <button
                onClick={() => handleToggleAiFeature('package')}
                className={`w-full p-3 rounded-xl border text-xs font-bold text-right flex items-center justify-between transition-all ${
                  activeCamera.aiDetection.package
                    ? 'bg-purple-950/60 border-purple-500 text-purple-200'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Package className="w-4 h-4 text-emerald-400" />
                  <span>رصد الشحنات والطرود (Package Alert)</span>
                </div>
                <div className={`w-8 h-4 rounded-full transition-colors relative ${activeCamera.aiDetection.package ? 'bg-purple-600' : 'bg-slate-800'}`}>
                  <div className={`w-3 h-3 bg-white rounded-full absolute top-0.5 transition-all ${activeCamera.aiDetection.package ? 'right-4' : 'right-0.5'}`} />
                </div>
              </button>
            </div>

            {/* Sensitivity Slider */}
            <div className="pt-3 border-t border-slate-800 space-y-2">
              <div className="flex justify-between text-xs text-slate-300 font-semibold">
                <span>حساسية الكشف (Sensitivity Level)</span>
                <span className="font-mono text-purple-400">{activeCamera.motionSensitivity} / 10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={activeCamera.motionSensitivity}
                onChange={(e) => handleSensitivityChange(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
            </div>
          </div>

          {/* Gemini AI Inspector Prompt Box */}
          <div className="bg-slate-900/90 border border-purple-500/30 rounded-2xl p-5 space-y-3">
            <h3 className="font-bold text-sm text-purple-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              مساعد التحقيق بالذكاء الاصطناعي
            </h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={aiQuestion}
                onChange={(e) => setAiQuestion(e.target.value)}
                placeholder="اسأل Gemini عن أي تفاصيل بهذه الكاميرا..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-purple-500"
              />
              <button
                onClick={handleRunAiInspection}
                disabled={aiLoading}
                className="bg-purple-600 hover:bg-purple-500 text-white px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 disabled:opacity-50"
              >
                {aiLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              </button>
            </div>

            {aiAnalysisResult && (
              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 leading-relaxed whitespace-pre-line">
                {aiAnalysisResult}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
