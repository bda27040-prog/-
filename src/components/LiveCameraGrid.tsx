import React, { useState } from 'react';
import { Camera, Site } from '../types';
import { CameraStreamCanvas } from './CameraStreamCanvas';
import { 
  Square, Grid2x2, Grid3x3, Maximize2, Camera as CameraIcon, 
  Volume2, VolumeX, Search, Sliders, Play, RefreshCw, Eye
} from 'lucide-react';

interface LiveCameraGridProps {
  cameras: Camera[];
  sites: Site[];
  onSelectCamera: (cam: Camera) => void;
  onAddSnapshot: (title: string, camera: Camera) => void;
}

export const LiveCameraGrid: React.FC<LiveCameraGridProps> = ({
  cameras,
  sites,
  onSelectCamera,
  onAddSnapshot,
}) => {
  const [gridLayout, setGridLayout] = useState<'1x1' | '2x2' | '3x3'>('2x2');
  const [selectedSiteFilter, setSelectedSiteFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCameras = cameras.filter((cam) => {
    const matchSite = selectedSiteFilter === 'all' || cam.siteId === selectedSiteFilter;
    const matchQuery = cam.name.toLowerCase().includes(searchQuery.toLowerCase()) || cam.ipAddress.includes(searchQuery);
    return matchSite && matchQuery;
  });

  const getGridClass = () => {
    switch (gridLayout) {
      case '1x1':
        return 'grid-cols-1';
      case '2x2':
        return 'grid-cols-1 md:grid-cols-2';
      case '3x3':
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
      default:
        return 'grid-cols-1 md:grid-cols-2';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Filter & Layout Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
        {/* Search & Site Filter */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="البحث برقم IP أو اسم الكاميرا..."
              className="bg-slate-950 border border-slate-800 rounded-xl pr-9 pl-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-sky-500 w-60"
            />
          </div>

          <select
            value={selectedSiteFilter}
            onChange={(e) => setSelectedSiteFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-sky-500"
          >
            <option value="all">جميع المواقع ({sites.length})</option>
            {sites.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Layout Selector (1x1, 2x2, 3x3) */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 border border-slate-800 rounded-xl">
          <button
            onClick={() => setGridLayout('1x1')}
            className={`p-2 rounded-lg transition-all ${
              gridLayout === '1x1' ? 'bg-sky-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="عرض كامل 1x1"
          >
            <Square className="w-4 h-4" />
          </button>

          <button
            onClick={() => setGridLayout('2x2')}
            className={`p-2 rounded-lg transition-all ${
              gridLayout === '2x2' ? 'bg-sky-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="عرض شبكي 2x2"
          >
            <Grid2x2 className="w-4 h-4" />
          </button>

          <button
            onClick={() => setGridLayout('3x3')}
            className={`p-2 rounded-lg transition-all ${
              gridLayout === '3x3' ? 'bg-sky-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="عرض مكثف 3x3"
          >
            <Grid3x3 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Camera Streams Grid */}
      <div className={`grid gap-6 ${getGridClass()}`}>
        {filteredCameras.length === 0 ? (
          <div className="col-span-full bg-slate-900/80 border border-slate-800 rounded-2xl p-12 text-center text-slate-500 text-xs">
            لا توجد كاميرات مطابقة للبحث أو التصفية الحالية.
          </div>
        ) : (
          filteredCameras.map((cam) => (
            <div
              key={cam.id}
              className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 space-y-3 shadow-xl backdrop-blur-md transition-all group relative"
            >
              <div className="relative rounded-xl overflow-hidden bg-black aspect-video border border-slate-800">
                <CameraStreamCanvas
                  camera={cam}
                  showBoundingBoxes={true}
                  showOverlayStats={true}
                />

                {/* Hover Quick Toolbar */}
                <div className="absolute bottom-3 inset-x-3 bg-slate-950/90 border border-slate-800 rounded-xl p-2 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-md shadow-2xl">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-100 truncate pl-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="truncate">{cam.name}</span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => onAddSnapshot(`لقطة سريعة - ${cam.name}`, cam)}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-sky-400 rounded-lg transition-colors"
                      title="التقاط صورة"
                    >
                      <CameraIcon className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => onSelectCamera(cam)}
                      className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 shadow-md"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                      تكبير الشاشة والتحكم
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
