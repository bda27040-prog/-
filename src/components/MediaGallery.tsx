import React, { useState } from 'react';
import { MediaSnapshot, Camera } from '../types';
import { CameraStreamCanvas } from './CameraStreamCanvas';
import { 
  Image as ImageIcon, Film, Download, Trash2, Share2, 
  Search, Eye, Clock, Camera as CameraIcon
} from 'lucide-react';

interface MediaGalleryProps {
  snapshots: MediaSnapshot[];
  cameras: Camera[];
  onDeleteSnapshot: (id: string) => void;
}

export const MediaGallery: React.FC<MediaGalleryProps> = ({
  snapshots,
  cameras,
  onDeleteSnapshot,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'photo' | 'video_clip'>('all');
  const [activePreview, setActivePreview] = useState<MediaSnapshot | null>(null);

  const filtered = snapshots.filter((s) => {
    if (filterType === 'all') return true;
    return s.type === filterType;
  });

  const handleDownload = (snap: MediaSnapshot) => {
    const element = document.createElement('a');
    const file = new Blob([`CCTV Media Snapshot - ${snap.title}\nCamera: ${snap.cameraName}\nTimestamp: ${snap.timestamp}`], {
      type: 'text/plain',
    });
    element.href = URL.createObjectURL(file);
    element.download = `${snap.title.replace(/\s+/g, '_')}.png`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-sky-950 border border-sky-800 rounded-xl">
            <ImageIcon className="w-6 h-6 text-sky-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100">المعرض واللقطات المحفوظة (Media Gallery)</h2>
            <p className="text-xs text-slate-400">اللقطات ومقاطع الفيديو التي تم حفظها يدوياً أو بواسطة إنذارات الكاميرا</p>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-2 bg-slate-950 p-1.5 border border-slate-800 rounded-xl text-xs">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              filterType === 'all' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            الكل ({snapshots.length})
          </button>
          <button
            onClick={() => setFilterType('photo')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              filterType === 'photo' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            الصور 📷
          </button>
          <button
            onClick={() => setFilterType('video_clip')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              filterType === 'video_clip' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            الفيديو 🎥
          </button>
        </div>
      </div>

      {/* Grid of Snapshots */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.length === 0 ? (
          <div className="col-span-full bg-slate-900/80 border border-slate-800 rounded-2xl p-12 text-center text-slate-500 text-xs">
            لا توجد لقطات أو مقاطع فيديو محفوظة حتى الآن.
          </div>
        ) : (
          filtered.map((snap) => {
            const matchedCam = cameras.find((c) => c.id === snap.cameraId) || cameras[0];

            return (
              <div
                key={snap.id}
                className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 space-y-3 shadow-xl backdrop-blur-md transition-all group"
              >
                {/* Snapshot Canvas Thumbnail */}
                <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-black aspect-video">
                  <CameraStreamCanvas
                    camera={matchedCam}
                    showBoundingBoxes={false}
                    showOverlayStats={false}
                  />

                  <div className="absolute top-2 right-2 bg-slate-950/80 text-sky-300 border border-slate-800 px-2.5 py-0.5 rounded-full text-[10px] font-mono">
                    {snap.type === 'photo' ? 'صورة HD' : 'مقطع فيديو'}
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-1">
                  <h4 className="font-bold text-xs text-slate-100 truncate">{snap.title}</h4>
                  <div className="text-[11px] text-slate-400 flex items-center justify-between font-mono">
                    <span>{snap.cameraName}</span>
                    <span>{snap.fileSize}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1 pt-1">
                    <Clock className="w-3 h-3 text-sky-400" />
                    {snap.timestamp}
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleDownload(snap)}
                    className="flex-1 py-1.5 bg-slate-800 hover:bg-sky-600 hover:text-white text-slate-200 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1"
                  >
                    <Download className="w-3.5 h-3.5" />
                    تنزيل
                  </button>

                  <button
                    onClick={() => onDeleteSnapshot(snap.id)}
                    className="p-1.5 bg-slate-950 hover:bg-rose-900 text-slate-400 hover:text-rose-300 rounded-lg transition-colors"
                    title="حذف المقطع"
                  >
                    <Trash2 className="w-4 h-4" />
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
