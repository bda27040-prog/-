import React, { useState } from 'react';
import { Camera } from '../types';
import { 
  ArrowUp, ArrowDown, ArrowLeft, ArrowRight, 
  ZoomIn, ZoomOut, Compass, RotateCw, Play, Square,
  Focus, Sliders, ShieldCheck
} from 'lucide-react';

interface PTZControlPanelProps {
  camera: Camera;
  onUpdatePTZ: (cameraId: string, pan: number, tilt: number, zoom: number) => void;
}

export const PTZControlPanel: React.FC<PTZControlPanelProps> = ({ camera, onUpdatePTZ }) => {
  const [isAutoCruising, setIsAutoCruising] = useState(false);
  const [cruiseSpeed, setCruiseSpeed] = useState(5);

  const currentPan = camera.ptzState?.pan || 0;
  const currentTilt = camera.ptzState?.tilt || 0;
  const currentZoom = camera.ptzState?.zoom || 1;

  const handlePanTilt = (deltaPan: number, deltaTilt: number) => {
    const newPan = Math.max(-180, Math.min(180, currentPan + deltaPan));
    const newTilt = Math.max(-90, Math.min(90, currentTilt + deltaTilt));
    onUpdatePTZ(camera.id, newPan, newTilt, currentZoom);
  };

  const handleZoom = (deltaZoom: number) => {
    const newZoom = Math.max(1, Math.min(10, currentZoom + deltaZoom));
    onUpdatePTZ(camera.id, currentPan, currentTilt, newZoom);
  };

  const handlePresetSelect = (presetName: string, index: number) => {
    // Preset pan/tilt configurations
    const presetPositions = [
      { pan: -45, tilt: 15, zoom: 2 },
      { pan: 60, tilt: -10, zoom: 3 },
      { pan: 0, tilt: 0, zoom: 1 },
      { pan: -90, tilt: 25, zoom: 4 },
    ];
    const pos = presetPositions[index % presetPositions.length];
    onUpdatePTZ(camera.id, pos.pan, pos.tilt, pos.zoom);
  };

  const handleReset = () => {
    onUpdatePTZ(camera.id, 0, 0, 1);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 text-slate-100 backdrop-blur-md shadow-2xl">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
        <div className="flex items-center gap-2">
          <Compass className="w-5 h-5 text-sky-400 animate-spin-slow" />
          <h3 className="font-bold text-base text-slate-100">تحكم حركة الكاميرا PTZ</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-1 rounded-full font-mono border border-slate-700">
            Pan: {currentPan}° | Tilt: {currentTilt}° | Zoom: {currentZoom}x
          </span>
          <button
            onClick={handleReset}
            className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 p-1.5 rounded-lg transition-colors"
            title="إعادة ضبط الموضع للركيزة 0°"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Directional Pad / Joystick */}
        <div className="flex flex-col items-center justify-center bg-slate-950/80 p-6 rounded-2xl border border-slate-800/80 relative">
          <div className="text-xs font-semibold text-slate-400 mb-3 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-sky-400" />
            لوحة التوجيه والتحريك الدقيق
          </div>

          <div className="relative w-44 h-44 rounded-full bg-slate-900 border-2 border-slate-700/60 shadow-inner flex items-center justify-center">
            {/* Inner Ring */}
            <div className="absolute w-24 h-24 rounded-full border border-slate-800 bg-slate-950/50" />

            {/* UP */}
            <button
              onClick={() => handlePanTilt(0, 15)}
              className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-10 bg-slate-800 hover:bg-sky-600 text-slate-200 hover:text-white rounded-full flex items-center justify-center transition-all shadow-md active:scale-90"
              title="إمالة لأعلى (Tilt Up)"
            >
              <ArrowUp className="w-5 h-5" />
            </button>

            {/* DOWN */}
            <button
              onClick={() => handlePanTilt(0, -15)}
              className="absolute bottom-2 left-1/2 -translate-x-1/2 w-10 h-10 bg-slate-800 hover:bg-sky-600 text-slate-200 hover:text-white rounded-full flex items-center justify-center transition-all shadow-md active:scale-90"
              title="إمالة لأسفل (Tilt Down)"
            >
              <ArrowDown className="w-5 h-5" />
            </button>

            {/* LEFT */}
            <button
              onClick={() => handlePanTilt(-15, 0)}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-slate-800 hover:bg-sky-600 text-slate-200 hover:text-white rounded-full flex items-center justify-center transition-all shadow-md active:scale-90"
              title="تدوير لليسار (Pan Left)"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            {/* RIGHT */}
            <button
              onClick={() => handlePanTilt(15, 0)}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-slate-800 hover:bg-sky-600 text-slate-200 hover:text-white rounded-full flex items-center justify-center transition-all shadow-md active:scale-90"
              title="تدوير لليمين (Pan Right)"
            >
              <ArrowRight className="w-5 h-5" />
            </button>

            {/* CENTER BUTTON - HOME */}
            <button
              onClick={handleReset}
              className="z-10 w-12 h-12 bg-sky-600 hover:bg-sky-500 text-white rounded-full flex items-center justify-center font-bold text-xs shadow-lg transition-transform active:scale-95 border-2 border-sky-400/50"
            >
              الأصل
            </button>
          </div>
        </div>

        {/* Zoom & Presets & Cruise */}
        <div className="flex flex-col justify-between gap-4">
          {/* Zoom Slider */}
          <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-300 font-semibold mb-2">
              <span className="flex items-center gap-1.5">
                <ZoomIn className="w-4 h-4 text-emerald-400" />
                التقريب والتبعيد البصري (Zoom)
              </span>
              <span className="font-mono text-emerald-400 font-bold">{currentZoom}x</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleZoom(-1)}
                disabled={currentZoom <= 1}
                className="p-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 rounded-lg transition-colors"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={currentZoom}
                onChange={(e) => onUpdatePTZ(camera.id, currentPan, currentTilt, parseInt(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <button
                onClick={() => handleZoom(1)}
                disabled={currentZoom >= 10}
                className="p-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 rounded-lg transition-colors"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Patrol Presets */}
          <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800">
            <div className="text-xs font-semibold text-slate-300 mb-2.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                المشاهد المحفوظة والافتراضية (Presets)
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {(camera.ptzCapabilities.presets.length > 0
                ? camera.ptzCapabilities.presets
                : ['البوابة', 'الموقف', 'السور', 'المدخل']
              ).map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handlePresetSelect(preset, idx)}
                  className="text-xs bg-slate-900 hover:bg-slate-800 hover:border-amber-500/50 border border-slate-800 text-slate-200 py-2 px-3 rounded-lg text-right truncate transition-all flex items-center justify-between"
                >
                  <span className="truncate">{preset}</span>
                  <span className="text-[10px] font-mono text-slate-500 bg-slate-950 px-1.5 py-0.5 rounded">P{idx + 1}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Auto Patrol Cruise Switch */}
          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsAutoCruising(!isAutoCruising)}
                className={`p-2 rounded-lg flex items-center gap-2 text-xs font-bold transition-all ${
                  isAutoCruising
                    ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                }`}
              >
                {isAutoCruising ? <Square className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                {isAutoCruising ? 'إيقاف الدوريات الآلية' : 'بدء المسح والتجوال الآلي'}
              </button>
            </div>
            {isAutoCruising && (
              <span className="text-xs text-amber-400 animate-pulse flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                مسح مستمر نشط
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
