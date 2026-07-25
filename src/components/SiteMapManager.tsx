import React, { useState } from 'react';
import { Camera, Site } from '../types';
import { CameraStreamCanvas } from './CameraStreamCanvas';
import { 
  Building2, MapPin, Camera as CameraIcon, ShieldCheck, 
  Eye, Navigation, Layers, ChevronRight
} from 'lucide-react';

interface SiteMapManagerProps {
  sites: Site[];
  cameras: Camera[];
  onSelectCamera: (cam: Camera) => void;
}

export const SiteMapManager: React.FC<SiteMapManagerProps> = ({
  sites,
  cameras,
  onSelectCamera,
}) => {
  const [selectedSiteId, setSelectedSiteId] = useState<string>(sites[0]?.id || 'site-1');
  const [previewCamera, setPreviewCamera] = useState<Camera | null>(null);

  const activeSite = sites.find((s) => s.id === selectedSiteId) || sites[0];
  const siteCameras = cameras.filter((c) => c.siteId === selectedSiteId);

  return (
    <div className="space-y-6">
      {/* Site Selector Tabs Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-sky-950 border border-sky-800 rounded-xl">
              <Building2 className="w-6 h-6 text-sky-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">إدارة المواقع المتعددة وخارطة توزيع الكاميرات</h2>
              <p className="text-xs text-slate-400">استعراض المخطط التفاعلي وتوزيع الكاميرات على كل موقع بضغطة زر</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {sites.map((site) => (
              <button
                key={site.id}
                onClick={() => {
                  setSelectedSiteId(site.id);
                  setPreviewCamera(null);
                }}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  selectedSiteId === site.id
                    ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/30'
                    : 'bg-slate-950 border border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <MapPin className="w-4 h-4 text-sky-400" />
                {site.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Floorplan Map & Cameras Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Floorplan Layout Canvas View (2 Columns) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 relative overflow-hidden backdrop-blur-md">
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                <Navigation className="w-4 h-4 text-sky-400" />
                مخطط الموقع التفاعلي (Interactive Floorplan Layout)
              </div>
              <span className="text-xs text-slate-400">العنوان: {activeSite.address}</span>
            </div>

            {/* Floorplan Map Graphic Board */}
            <div className="relative w-full aspect-video bg-slate-950 border border-slate-800 rounded-xl overflow-hidden p-6 flex items-center justify-center">
              {/* Floorplan Blueprint Lines */}
              <div className="absolute inset-0 border-2 border-slate-800/80 rounded-xl m-4 flex items-center justify-center pointer-events-none">
                <div className="w-full h-full border border-dashed border-slate-800 grid grid-cols-3 grid-rows-2 p-4">
                  <div className="border border-slate-800/60 p-2 text-[10px] text-slate-600">المنطقة أ - المدخل</div>
                  <div className="border border-slate-800/60 p-2 text-[10px] text-slate-600">المنطقة ب - المواقف</div>
                  <div className="border border-slate-800/60 p-2 text-[10px] text-slate-600">المنطقة جـ - الممر الرئيسي</div>
                  <div className="border border-slate-800/60 p-2 text-[10px] text-slate-600">المنطقة د - الاستقبال</div>
                  <div className="border border-slate-800/60 p-2 text-[10px] text-slate-600">المنطقة هـ - المسبح / الفناء</div>
                  <div className="border border-slate-800/60 p-2 text-[10px] text-slate-600">المنطقة و - السور الخارجي</div>
                </div>
              </div>

              {/* Interactive Camera Pins on Floorplan */}
              {siteCameras.map((cam) => {
                const isSelected = previewCamera?.id === cam.id;

                return (
                  <button
                    key={cam.id}
                    onClick={() => setPreviewCamera(cam)}
                    style={{ left: `${cam.coordinates.x}%`, top: `${cam.coordinates.y}%` }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 group transition-transform ${
                      isSelected ? 'scale-125 z-30' : 'hover:scale-110 z-20'
                    }`}
                  >
                    <div className="relative flex flex-col items-center">
                      {/* Pulse ring if online */}
                      <div className="absolute w-8 h-8 rounded-full bg-sky-500/30 animate-ping" />
                      
                      {/* Pin Icon */}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-2xl transition-colors border-2 ${
                        isSelected
                          ? 'bg-sky-500 border-white text-white'
                          : 'bg-slate-900 border-sky-400 text-sky-400 group-hover:bg-sky-600 group-hover:text-white'
                      }`}>
                        <CameraIcon className="w-4 h-4" />
                      </div>

                      {/* Tooltip Name Tag */}
                      <div className="mt-1 bg-slate-900/90 border border-slate-800 text-slate-100 text-[10px] font-bold px-2 py-0.5 rounded shadow-lg whitespace-nowrap">
                        {cam.name}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Camera Pin Inspector Preview */}
        <div className="space-y-4">
          {previewCamera ? (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4 backdrop-blur-md">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                  <Eye className="w-4 h-4 text-sky-400" />
                  معاينة الكاميرا المحددة
                </h3>
                <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded font-mono">
                  {previewCamera.resolution}
                </span>
              </div>

              <div className="rounded-xl overflow-hidden border border-slate-800">
                <CameraStreamCanvas
                  camera={previewCamera}
                  showBoundingBoxes={true}
                  showOverlayStats={true}
                  className="aspect-video w-full"
                />
              </div>

              <div className="space-y-2 text-xs">
                <div className="text-sm font-bold text-slate-100">{previewCamera.name}</div>
                <div className="text-slate-400">عنوان IP: {previewCamera.ipAddress} | العلامة: {previewCamera.brand}</div>
              </div>

              <button
                onClick={() => onSelectCamera(previewCamera)}
                className="w-full py-2.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
              >
                فتح البث المباشر للشاشة الكاملة
                <ChevronRight className="w-4 h-4 rotate-180" />
              </button>
            </div>
          ) : (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-8 text-center text-slate-400 text-xs space-y-3 backdrop-blur-md">
              <MapPin className="w-8 h-8 text-sky-400 mx-auto opacity-80" />
              <p>انقر فوق أي دبوس كاميرا على خارطة الموقع لاستعراض البث المباشر فوراً.</p>
            </div>
          )}

          {/* Site Cameras List */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3 backdrop-blur-md">
            <h3 className="font-bold text-sm text-slate-100 border-b border-slate-800 pb-2">
              كاميرات هذا الموقع ({siteCameras.length})
            </h3>
            <div className="space-y-2">
              {siteCameras.map((cam) => (
                <div
                  key={cam.id}
                  onClick={() => setPreviewCamera(cam)}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                    previewCamera?.id === cam.id
                      ? 'bg-slate-800 border-sky-500 text-slate-100'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="font-semibold">{cam.name}</div>
                  <span className="text-[10px] font-mono text-slate-400">{cam.type}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
