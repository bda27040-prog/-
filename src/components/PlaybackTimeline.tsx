import React, { useState } from 'react';
import { Camera, PlaybackRecording } from '../types';
import { CameraStreamCanvas } from './CameraStreamCanvas';
import { 
  Play, Pause, FastForward, Rewind, Calendar, Clock, 
  Download, Filter, Film, Search, HardDrive, ShieldAlert, Sparkles
} from 'lucide-react';

interface PlaybackTimelineProps {
  cameras: Camera[];
  recordings: PlaybackRecording[];
  onAddSnapshot: (title: string, camera: Camera) => void;
}

export const PlaybackTimeline: React.FC<PlaybackTimelineProps> = ({
  cameras,
  recordings,
  onAddSnapshot,
}) => {
  const [selectedCameraId, setSelectedCameraId] = useState<string>(cameras[0]?.id || 'cam-1');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [filterType, setFilterType] = useState<string>('all');
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [scrubPositionTime, setScrubPositionTime] = useState<string>('17:15:00');

  const activeCamera = cameras.find((c) => c.id === selectedCameraId) || cameras[0];

  // Filter recordings
  const filteredRecordings = recordings.filter((r) => {
    const matchCam = r.cameraId === selectedCameraId;
    const matchType = filterType === 'all' || r.triggerType === filterType;
    return matchCam && matchType;
  });

  const handleSpeedCycle = () => {
    const speeds = [1, 2, 4, 8, 16];
    const nextIndex = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
    setPlaybackSpeed(speeds[nextIndex]);
  };

  const handleDownloadClip = (rec: PlaybackRecording) => {
    const element = document.createElement('a');
    const file = new Blob([`CCTV Recording Clip Backup File\nCamera: ${rec.cameraName}\nTime: ${rec.startTime} - ${rec.endTime}\nDate: ${rec.dateStr}`], {
      type: 'text/plain',
    });
    element.href = URL.createObjectURL(file);
    element.download = `cctv_recording_${rec.cameraId}_${rec.dateStr}.mp4`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-6">
      {/* Top Filter Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Film className="w-5 h-5 text-sky-400" />
            <h2 className="text-lg font-bold text-slate-100">مشاهدة التسجيلات السابقة والبحث (Playback)</h2>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            {/* Camera Select */}
            <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2">
              <span className="text-slate-400">الكاميرا:</span>
              <select
                value={selectedCameraId}
                onChange={(e) => setSelectedCameraId(e.target.value)}
                className="bg-transparent text-slate-100 font-semibold focus:outline-none"
              >
                {cameras.map((c) => (
                  <option key={c.id} value={c.id} className="bg-slate-900 text-slate-100">
                    {c.name} ({c.siteName})
                  </option>
                ))}
              </select>
            </div>

            {/* Date Picker */}
            <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2">
              <Calendar className="w-4 h-4 text-sky-400" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-slate-100 focus:outline-none"
              />
            </div>

            {/* Filter Trigger Type */}
            <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2">
              <Filter className="w-4 h-4 text-amber-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-transparent text-slate-100 focus:outline-none"
              >
                <option value="all" className="bg-slate-900">جميع التسجيلات</option>
                <option value="continuous" className="bg-slate-900">تسجيل مستمر</option>
                <option value="motion" className="bg-slate-900">كشف حركة</option>
                <option value="ai_event" className="bg-slate-900">أحداث الذكاء الاصطناعي</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Playback Player Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Video Player & Timeline Scrubber */}
        <div className="lg:col-span-2 space-y-4">
          {/* Canvas Stream Simulation */}
          <div className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-black">
            <CameraStreamCanvas
              camera={activeCamera}
              showBoundingBoxes={true}
              showOverlayStats={true}
              isRecording={false}
              className="aspect-video w-full"
            />

            {/* Playback Overlay Status Badge */}
            <div className="absolute top-4 left-4 bg-slate-950/80 border border-slate-800 backdrop-blur-md px-3 py-1.5 rounded-xl text-xs font-mono text-sky-300 flex items-center gap-2">
              <Clock className="w-4 h-4 text-sky-400" />
              <span>إعادة التشغيل: {scrubPositionTime} | السرعة: {playbackSpeed}x</span>
            </div>
          </div>

          {/* Player Control Bar */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex items-center justify-between backdrop-blur-md">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`p-3 rounded-xl font-bold transition-all ${
                  isPlaying ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20' : 'bg-sky-600 hover:bg-sky-500 text-white'
                }`}
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
              </button>

              <button
                onClick={handleSpeedCycle}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-2 rounded-xl text-xs font-mono font-bold"
              >
                السرعة: {playbackSpeed}x
              </button>
            </div>

            <div className="text-xs font-mono text-slate-400">
              التاريخ المحدد: {selectedDate}
            </div>

            <button
              onClick={() => onAddSnapshot(`لقطة من إعادة التشغيل - ${activeCamera.name}`, activeCamera)}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              حفظ صورة من التسجيل
            </button>
          </div>

          {/* Interactive 24-Hour Time Scrubber Bar */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-300 font-semibold">
              <span>شريط الوقت 24 ساعة (Scrubber Timeline)</span>
              <span className="text-slate-400 font-mono">00:00 - 23:59</span>
            </div>

            {/* Timeline Visual Track */}
            <div className="relative h-12 bg-slate-950 rounded-xl border border-slate-800 overflow-hidden flex items-center px-2">
              {/* Event Marker Spans */}
              <div className="absolute left-[20%] w-[15%] h-full bg-blue-500/30 border-x border-blue-500" title="تسجيل مستمر" />
              <div className="absolute left-[65%] w-[8%] h-full bg-amber-500/40 border-x border-amber-500" title="كشف حركة" />
              <div className="absolute left-[78%] w-[5%] h-full bg-purple-500/50 border-x border-purple-500" title="حدث ذكاء اصطناعي" />

              {/* Ticks */}
              <div className="w-full flex justify-between text-[10px] text-slate-600 font-mono select-none">
                <span>00:00</span>
                <span>04:00</span>
                <span>08:00</span>
                <span>12:00</span>
                <span>16:00</span>
                <span>20:00</span>
                <span>23:59</span>
              </div>

              {/* Scrubber Needle */}
              <input
                type="range"
                min="0"
                max="1440"
                defaultValue="1035" // ~17:15
                onChange={(e) => {
                  const totalMins = parseInt(e.target.value);
                  const hrs = String(Math.floor(totalMins / 60)).padStart(2, '0');
                  const mins = String(totalMins % 60).padStart(2, '0');
                  setScrubPositionTime(`${hrs}:${mins}:00`);
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 text-[11px] text-slate-400 pt-1">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-blue-500/40 border border-blue-500" />
                تسجيل مستمر
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-amber-500/40 border border-amber-500" />
                كشف حركة
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-purple-500/40 border border-purple-500" />
                ذكاء اصطناعي AI
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: List of Recording Files */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h3 className="font-bold text-sm text-slate-100 flex items-center justify-between border-b border-slate-800 pb-3">
            <span>مقاطع الفيديو المتاحة للتنزيل</span>
            <span className="text-xs bg-slate-800 text-sky-400 px-2 py-0.5 rounded-full font-mono">
              {filteredRecordings.length} مقطع
            </span>
          </h3>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {filteredRecordings.length === 0 ? (
              <div className="text-center py-10 text-slate-500 text-xs">
                لا توجد مقاطع مسجلة مطابقة للفلاتر المختارة.
              </div>
            ) : (
              filteredRecordings.map((rec) => (
                <div
                  key={rec.id}
                  className="bg-slate-950 border border-slate-800/80 hover:border-slate-700 p-3.5 rounded-xl transition-all space-y-2 group"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-slate-200">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-sky-400" />
                      {rec.startTime} - {rec.endTime}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                      rec.triggerType === 'ai_event'
                        ? 'bg-purple-950 text-purple-300 border border-purple-800'
                        : rec.triggerType === 'motion'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : 'bg-blue-950 text-blue-300 border border-blue-800'
                    }`}>
                      {rec.triggerType === 'ai_event' ? 'ذكاء اصطناعي' : rec.triggerType === 'motion' ? 'حركة' : 'مستمر'}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-400 flex items-center justify-between font-mono">
                    <span>المدة: {rec.durationMinutes} دقيقة</span>
                    <span>الحجم: {rec.sizeMb} MB</span>
                  </div>

                  <button
                    onClick={() => handleDownloadClip(rec)}
                    className="w-full py-2 bg-slate-900 hover:bg-sky-600 hover:text-white text-slate-300 text-xs rounded-lg font-semibold transition-colors flex items-center justify-center gap-1.5 border border-slate-800"
                  >
                    <Download className="w-3.5 h-3.5" />
                    تنزيل هذا المقطع MP4
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
