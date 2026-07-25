import React, { useState } from 'react';
import { Camera, CameraType, CameraResolution, Site } from '../types';
import { 
  X, Camera as CameraIcon, QrCode, Wifi, Server, CheckCircle2, 
  Loader2, ArrowRight, ShieldCheck, Cpu
} from 'lucide-react';

interface AddCameraModalProps {
  sites: Site[];
  onClose: () => void;
  onAddCamera: (newCam: Camera) => void;
}

export const AddCameraModal: React.FC<AddCameraModalProps> = ({
  sites,
  onClose,
  onAddCamera,
}) => {
  const [activeTab, setActiveTab] = useState<'scan' | 'manual' | 'qr'>('scan');
  const [isScanning, setIsScanning] = useState(false);
  const [discoveredDevices, setDiscoveredDevices] = useState<{ ip: string; brand: string; type: string }[]>([]);

  // Form State
  const [name, setName] = useState('');
  const [siteId, setSiteId] = useState(sites[0]?.id || 'site-1');
  const [ipAddress, setIpAddress] = useState('192.168.1.108');
  const [port, setPort] = useState(554);
  const [brand, setBrand] = useState<Camera['brand']>('Hikvision');
  const [type, setType] = useState<CameraType>('PTZ');
  const [resolution, setResolution] = useState<CameraResolution>('4K');
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('••••••••');
  const [canvasPreset, setCanvasPreset] = useState<Camera['canvasPreset']>('front_gate');

  const handleStartScan = () => {
    setIsScanning(true);
    setDiscoveredDevices([]);
    setTimeout(() => {
      setDiscoveredDevices([
        { ip: '192.168.1.108', brand: 'Hikvision', type: 'PTZ 4K' },
        { ip: '192.168.1.112', brand: 'Dahua', type: 'Dome 2K' },
        { ip: '192.168.1.115', brand: 'Uniview', type: 'Bullet 4K' },
      ]);
      setIsScanning(false);
    }, 2000);
  };

  const handleSelectDiscovered = (device: { ip: string; brand: string; type: string }) => {
    setIpAddress(device.ip);
    setName(`كاميرا مكتشفة (${device.brand})`);
    setActiveTab('manual');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const siteObj = sites.find((s) => s.id === siteId) || sites[0];

    const newCam: Camera = {
      id: `cam-${Date.now()}`,
      name: name || `كاميرا جديدة (${ipAddress})`,
      siteId: siteObj.id,
      siteName: siteObj.name,
      ipAddress: ipAddress,
      port: Number(port),
      rtspUrl: `rtsp://${username}:${password}@${ipAddress}:${port}/h264/ch1/main`,
      macAddress: `BC:A4:${Math.floor(Math.random() * 89 + 10)}:${Math.floor(Math.random() * 89 + 10)}:${Math.floor(Math.random() * 89 + 10)}:01`,
      serialNumber: `SN-${Date.now().toString().slice(-6)}`,
      brand: brand,
      channel: Math.floor(Math.random() * 8) + 1,
      type: type,
      status: 'online',
      resolution: resolution,
      fps: 30,
      bitrateKbps: resolution === '4K' ? 6144 : 4096,
      signalStrength: 95,
      ptzCapabilities: {
        canPan: type === 'PTZ' || type === 'Dome' || type === 'Fisheye',
        canTilt: type === 'PTZ' || type === 'Fisheye',
        canZoom: true,
        presets: ['المدخل الرئيسية', 'الممر الأوسط'],
      },
      nightVisionMode: 'full_color_spotlight',
      audioEnabled: true,
      speakerEnabled: true,
      motionSensitivity: 8,
      aiDetection: {
        person: true,
        vehicle: true,
        package: false,
        face: true,
        licensePlate: true,
      },
      canvasPreset: canvasPreset,
      coordinates: { x: 50, y: 50 },
      ptzState: { pan: 0, tilt: 0, zoom: 1 },
      privacyMaskEnabled: false,
    };

    onAddCamera(newCam);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 text-slate-100">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-sky-950 border border-sky-800 rounded-xl">
              <CameraIcon className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">إضافة كاميرا مراقبة جديدة (Add IP Camera)</h2>
              <p className="text-xs text-slate-400">ربط كاميرات IP, ONVIF, RTSP أو مسح رمز QR</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Method Switcher Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 p-2 gap-2">
          <button
            onClick={() => setActiveTab('scan')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'scan' ? 'bg-sky-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            <Wifi className="w-4 h-4" />
            فحص تلقائي للشبكة (Auto Scan)
          </button>

          <button
            onClick={() => setActiveTab('manual')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'manual' ? 'bg-sky-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            <Server className="w-4 h-4" />
            إدخال يدوي RTSP / IP
          </button>

          <button
            onClick={() => setActiveTab('qr')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'qr' ? 'bg-sky-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            <QrCode className="w-4 h-4" />
            مسح QR Code
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {activeTab === 'scan' && (
            <div className="space-y-4 text-center py-4">
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
                <Wifi className="w-10 h-10 text-sky-400 mx-auto animate-pulse" />
                <h3 className="font-bold text-sm text-slate-200">البحث التلقائي عن أجهزة IP & ONVIF في الشبكة المحليّة</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  سيتم فحص نطاق العناوين (192.168.1.1 - 192.168.1.254) لاكتشاف كاميرات Hikvision, Dahua, Uniview وأي جهاز متوافق تلقائياً.
                </p>

                <button
                  onClick={handleStartScan}
                  disabled={isScanning}
                  className="bg-sky-600 hover:bg-sky-500 text-white px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg flex items-center gap-2 mx-auto disabled:opacity-50"
                >
                  {isScanning ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      جاري فحص الشبكة...
                    </>
                  ) : (
                    'بدء فحص الشبكة الآن'
                  )}
                </button>
              </div>

              {/* Scan Results */}
              {discoveredDevices.length > 0 && (
                <div className="space-y-2 text-right">
                  <h4 className="text-xs font-bold text-slate-300">الكاميرات المكتشفة بالشبكة:</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {discoveredDevices.map((dev, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-950 border border-slate-800 p-3 rounded-xl flex items-center justify-between hover:border-sky-500/50 transition-all"
                      >
                        <div>
                          <div className="text-xs font-bold text-slate-100">{dev.brand} - {dev.type}</div>
                          <div className="text-[11px] font-mono text-slate-400">IP: {dev.ip} (RTSP 554)</div>
                        </div>
                        <button
                          onClick={() => handleSelectDiscovered(dev)}
                          className="bg-sky-600 hover:bg-sky-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1"
                        >
                          اختيار هذه الكاميرا
                          <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'manual' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">اسم الكاميرا *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="مثال: مدخل الفيلا الرئيسي"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
                  />
                </div>

                {/* Site */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">تحديد الموقع (Site) *</label>
                  <select
                    value={siteId}
                    onChange={(e) => setSiteId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
                  >
                    {sites.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.city})
                      </option>
                    ))}
                  </select>
                </div>

                {/* IP & Port */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">عنوان IP Address *</label>
                  <input
                    type="text"
                    required
                    value={ipAddress}
                    onChange={(e) => setIpAddress(e.target.value)}
                    placeholder="192.168.1.108"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">منفذ البث RTSP Port</label>
                  <input
                    type="number"
                    value={port}
                    onChange={(e) => setPort(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-sky-500"
                  />
                </div>

                {/* Brand & Type */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">العلامة التجارية المصنعة</label>
                  <select
                    value={brand}
                    onChange={(e) => setBrand(e.target.value as Camera['brand'])}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
                  >
                    <option value="Hikvision">Hikvision</option>
                    <option value="Dahua">Dahua</option>
                    <option value="Uniview">Uniview</option>
                    <option value="Axis">Axis</option>
                    <option value="Ezviz">Ezviz</option>
                    <option value="Reolink">Reolink</option>
                    <option value="Generic IP">Generic ONVIF IP</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">نوع الهيكل والأداء</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as CameraType)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
                  >
                    <option value="PTZ">متحركة PTZ (Pan/Tilt/Zoom)</option>
                    <option value="Dome">قبة Dome</option>
                    <option value="Bullet">أنبوبية Bullet</option>
                    <option value="Fisheye">عين السمكة 360 Fisheye</option>
                  </select>
                </div>

                {/* Stream Simulation Preset */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">منظر البث الحي</label>
                  <select
                    value={canvasPreset}
                    onChange={(e) => setCanvasPreset(e.target.value as Camera['canvasPreset'])}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
                  >
                    <option value="front_gate">البوابة والمدخل الرئيسي</option>
                    <option value="backyard_pool">الحديقة والمسبح</option>
                    <option value="warehouse_aisle">ممر المستودع</option>
                    <option value="parking_lot">موقف السيارات والشحن</option>
                    <option value="office_entrance">مكتب الاستقبال</option>
                    <option value="living_room">صالة الاجتماعات والمعيشة</option>
                  </select>
                </div>

                {/* Resolution */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">دقة البث المباشر</label>
                  <select
                    value={resolution}
                    onChange={(e) => setResolution(e.target.value as CameraResolution)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
                  >
                    <option value="4K">4K UHD Ultra HD (3840x2160)</option>
                    <option value="2K">2K Quad HD (2560x1440)</option>
                    <option value="1080p">1080p Full HD (1920x1080)</option>
                  </select>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  اختبار الاتصال وإضافة الكاميرا
                </button>
              </div>
            </form>
          )}

          {activeTab === 'qr' && (
            <div className="text-center py-8 space-y-4">
              <div className="w-44 h-44 mx-auto bg-slate-950 border-2 border-dashed border-sky-500/60 rounded-2xl flex flex-col items-center justify-center p-4 relative overflow-hidden group">
                <QrCode className="w-16 h-16 text-sky-400 group-hover:scale-110 transition-transform" />
                <div className="absolute inset-x-0 h-0.5 bg-sky-400 shadow-lg shadow-sky-400 animate-pulse top-1/2" />
              </div>
              <p className="text-xs text-slate-300 max-w-sm mx-auto">
                وجه كاميرا الهاتف نحو ملصق QR Code الموجود خلف هيكل الكاميرا أو صندوق المنتجات.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
