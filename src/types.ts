export type CameraStatus = 'online' | 'offline' | 'recording' | 'maintenance';
export type CameraType = 'PTZ' | 'Dome' | 'Bullet' | 'Fisheye' | 'Thermal';
export type CameraResolution = '1080p' | '2K' | '4K';
export type NightVisionMode = 'infrared' | 'full_color_spotlight' | 'auto' | 'off';

export interface Camera {
  id: string;
  name: string;
  siteId: string;
  siteName: string;
  ipAddress: string;
  port: number;
  rtspUrl: string;
  macAddress: string;
  serialNumber: string;
  brand: 'Hikvision' | 'Dahua' | 'Uniview' | 'Axis' | 'Ezviz' | 'Reolink' | 'Generic IP';
  channel: number;
  type: CameraType;
  status: CameraStatus;
  resolution: CameraResolution;
  fps: number;
  bitrateKbps: number;
  signalStrength: number; // percentage 0-100
  ptzCapabilities: {
    canPan: boolean;
    canTilt: boolean;
    canZoom: boolean;
    presets: string[];
  };
  nightVisionMode: NightVisionMode;
  audioEnabled: boolean;
  speakerEnabled: boolean;
  motionSensitivity: number; // 1 to 10
  aiDetection: {
    person: boolean;
    vehicle: boolean;
    package: boolean;
    face: boolean;
    licensePlate: boolean;
  };
  canvasPreset: 'front_gate' | 'backyard_pool' | 'warehouse_aisle' | 'office_entrance' | 'parking_lot' | 'living_room';
  coordinates: { x: number; y: number }; // Percentage on site map
  ptzState: {
    pan: number;  // -180 to 180
    tilt: number; // -90 to 90
    zoom: number; // 1 to 10
  };
  privacyMaskEnabled?: boolean;
}

export interface Site {
  id: string;
  name: string;
  city: string;
  address: string;
  cameraCount: number;
  nvrStatus: 'Healthy' | 'Warning' | 'Offline';
  icon: string;
  floorplanUrl?: string;
}

export interface DeviceNVR {
  id: string;
  name: string;
  model: string;
  siteId: string;
  siteName: string;
  ipAddress: string;
  macAddress: string;
  totalChannels: number;
  activeChannels: number;
  hddStatus: 'Healthy' | 'Warning' | 'Formatting';
  hddCapacityGb: number;
  hddUsedGb: number;
  firmwareVersion: string;
  uptimeDays: number;
}

export type EventSeverity = 'low' | 'medium' | 'high' | 'critical';
export type EventType = 'person_detected' | 'vehicle_detected' | 'line_crossed' | 'camera_offline' | 'tamper_alert' | 'storage_warning' | 'face_matched';

export interface SecurityEvent {
  id: string;
  timestamp: string;
  dateStr: string; // YYYY-MM-DD
  timeStr: string; // HH:MM:SS
  cameraId: string;
  cameraName: string;
  siteId: string;
  siteName: string;
  type: EventType;
  severity: EventSeverity;
  description: string;
  snapshotCanvasPreset: 'front_gate' | 'backyard_pool' | 'warehouse_aisle' | 'office_entrance' | 'parking_lot' | 'living_room';
  read: boolean;
  aiBoundingBox?: { x: number; y: number; w: number; h: number; label: string };
}

export interface PlaybackRecording {
  id: string;
  cameraId: string;
  cameraName: string;
  startTime: string; // ISO or HH:MM
  endTime: string;
  dateStr: string; // YYYY-MM-DD
  durationMinutes: number;
  triggerType: 'continuous' | 'motion' | 'ai_event' | 'manual';
  sizeMb: number;
  canvasPreset: 'front_gate' | 'backyard_pool' | 'warehouse_aisle' | 'office_entrance' | 'parking_lot' | 'living_room';
}

export interface MediaSnapshot {
  id: string;
  cameraId: string;
  cameraName: string;
  siteName: string;
  timestamp: string;
  type: 'photo' | 'video_clip';
  thumbnailPreset: 'front_gate' | 'backyard_pool' | 'warehouse_aisle' | 'office_entrance' | 'parking_lot' | 'living_room';
  title: string;
  fileSize: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'مدير أمني (Admin)' | 'مشرف موقع (Operator)' | 'مراقب (Viewer)';
  avatar: string;
  phone: string;
  mfaEnabled: boolean;
  assignedSites: string[];
}
