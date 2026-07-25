import React, { useRef, useEffect } from 'react';
import { Camera } from '../types';

interface CameraStreamCanvasProps {
  camera: Camera;
  showBoundingBoxes?: boolean;
  showOverlayStats?: boolean;
  isRecording?: boolean;
  customFilter?: string;
  className?: string;
  onClick?: () => void;
}

export const CameraStreamCanvas: React.FC<CameraStreamCanvasProps> = ({
  camera,
  showBoundingBoxes = true,
  showOverlayStats = true,
  isRecording = false,
  customFilter,
  className = '',
  onClick,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let animationFrameId: number;
    let tick = 0;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      tick++;
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // Check if camera is offline
      if (camera.status === 'offline') {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, width, height);

        // Signal loss pattern
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1;
        for (let i = 0; i < width; i += 20) {
          ctx.beginPath();
          ctx.moveTo(i, 0);
          ctx.lineTo(i, height);
          ctx.stroke();
        }

        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 18px Tajawal, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('⚠️ انقطاع الإشارة - الكاميرا غير متصلة (NO SIGNAL)', width / 2, height / 2 - 10);
        ctx.fillStyle = '#94a3b8';
        ctx.font = '13px Tajawal, sans-serif';
        ctx.fillText(`IP: ${camera.ipAddress} | Channel: ${camera.channel}`, width / 2, height / 2 + 15);
        return;
      }

      // Check Privacy Mask
      if (camera.privacyMaskEnabled) {
        ctx.fillStyle = '#020617';
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = '#64748b';
        ctx.font = 'bold 16px Tajawal, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🔒 منطقة مضللة لحماية الخصوصية (PRIVACY MASK ACTIVE)', width / 2, height / 2);
        return;
      }

      ctx.save();

      // PTZ Shift simulation
      const panOffset = (camera.ptzState?.pan || 0) * 0.8;
      const tiltOffset = (camera.ptzState?.tilt || 0) * 0.8;
      const zoomScale = Math.max(1, (camera.ptzState?.zoom || 1));

      ctx.translate(width / 2, height / 2);
      ctx.scale(zoomScale, zoomScale);
      ctx.translate(-width / 2 + panOffset, -height / 2 + tiltOffset);

      // Night Vision Theme check
      const isIR = camera.nightVisionMode === 'infrared';
      const isSpotlight = camera.nightVisionMode === 'full_color_spotlight';

      // Preset background rendering
      switch (camera.canvasPreset) {
        case 'front_gate': {
          // Sky
          const skyGrad = ctx.createLinearGradient(0, 0, 0, height * 0.5);
          if (isIR) {
            skyGrad.addColorStop(0, '#0a0a0a');
            skyGrad.addColorStop(1, '#262626');
          } else {
            skyGrad.addColorStop(0, '#0f172a');
            skyGrad.addColorStop(1, '#1e293b');
          }
          ctx.fillStyle = skyGrad;
          ctx.fillRect(0, 0, width, height * 0.55);

          // Paved Driveway & Wall
          ctx.fillStyle = isIR ? '#404040' : '#334155';
          ctx.fillRect(0, height * 0.55, width, height * 0.45);

          // Tile Lines on Ground
          ctx.strokeStyle = isIR ? '#525252' : '#475569';
          ctx.lineWidth = 1;
          for (let i = -100; i < width + 100; i += 40) {
            ctx.beginPath();
            ctx.moveTo(i, height * 0.55);
            ctx.lineTo(i * 1.2 - 50, height);
            ctx.stroke();
          }

          // Gate Pillars
          ctx.fillStyle = isIR ? '#737373' : '#64748b';
          ctx.fillRect(30, height * 0.25, 45, height * 0.35);
          ctx.fillRect(width - 75, height * 0.25, 45, height * 0.35);

          // Gate Iron Bars
          ctx.strokeStyle = isIR ? '#e5e5e5' : '#38bdf8';
          ctx.lineWidth = 3;
          for (let x = 80; x < width - 80; x += 22) {
            ctx.beginPath();
            ctx.moveTo(x, height * 0.3);
            ctx.lineTo(x, height * 0.55);
            ctx.stroke();
          }

          // Security Wall Top Lights
          ctx.fillStyle = isSpotlight ? '#fef08a' : '#f59e0b';
          ctx.beginPath();
          ctx.arc(52, height * 0.24, 6, 0, Math.PI * 2);
          ctx.arc(width - 52, height * 0.24, 6, 0, Math.PI * 2);
          ctx.fill();

          // Animated Car (Driving across)
          const carX = ((tick * 2) % (width + 250)) - 150;
          ctx.fillStyle = isIR ? '#a3a3a3' : '#ef4444'; // Red Car
          ctx.beginPath();
          ctx.roundRect(carX, height * 0.65, 120, 35, 6);
          ctx.fill();
          // Car roof
          ctx.fillStyle = isIR ? '#737373' : '#991b1b';
          ctx.beginPath();
          ctx.roundRect(carX + 25, height * 0.54, 65, 20, 4);
          ctx.fill();
          // Headlights
          ctx.fillStyle = '#fef08a';
          ctx.beginPath();
          ctx.arc(carX + 118, height * 0.72, 5, 0, Math.PI * 2);
          ctx.fill();

          // Animated Pedestrian Walking
          const pedX = width - ((tick * 0.8) % (width + 100));
          ctx.fillStyle = isIR ? '#f5f5f5' : '#38bdf8';
          ctx.beginPath();
          ctx.arc(pedX, height * 0.56, 8, 0, Math.PI * 2); // Head
          ctx.fill();
          ctx.fillRect(pedX - 5, height * 0.58, 10, 22); // Body

          // Render Bounding Boxes if enabled
          if (showBoundingBoxes) {
            // Car Box
            drawBoundingBox(ctx, carX - 5, height * 0.52, 130, 52, 'سيارة مرتبطة: SUV 96%', '#f59e0b', isIR);
            // Person Box
            drawBoundingBox(ctx, pedX - 12, height * 0.52, 24, 38, 'شخص مكتشف 98%', '#22c55e', isIR);
          }

          break;
        }

        case 'backyard_pool': {
          // Night / Day pool environment
          ctx.fillStyle = isIR ? '#171717' : '#0284c7';
          ctx.fillRect(0, 0, width, height);

          // Lawn Area
          ctx.fillStyle = isIR ? '#262626' : '#15803d';
          ctx.fillRect(0, 0, width, height * 0.45);

          // Swimming Pool Shape
          ctx.fillStyle = isIR ? '#404040' : '#0284c7';
          ctx.beginPath();
          ctx.roundRect(width * 0.2, height * 0.45, width * 0.6, height * 0.45, 20);
          ctx.fill();
          ctx.strokeStyle = isIR ? '#737373' : '#38bdf8';
          ctx.lineWidth = 4;
          ctx.stroke();

          // Water Ripples animation
          ctx.strokeStyle = isIR ? '#a3a3a3' : '#7dd3fc';
          ctx.lineWidth = 1.5;
          for (let i = 0; i < 4; i++) {
            const waveY = height * 0.52 + i * 25 + Math.sin(tick * 0.05 + i) * 5;
            ctx.beginPath();
            ctx.moveTo(width * 0.25, waveY);
            ctx.quadraticCurveTo(width * 0.5, waveY + 8, width * 0.75, waveY);
            ctx.stroke();
          }

          // Intruder / Person near pool
          const personX = width * 0.22 + Math.sin(tick * 0.03) * 30;
          const personY = height * 0.42;
          ctx.fillStyle = isIR ? '#ffffff' : '#f97316';
          ctx.beginPath();
          ctx.arc(personX, personY, 7, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillRect(personX - 4, personY + 7, 8, 20);

          if (showBoundingBoxes) {
            drawBoundingBox(ctx, personX - 12, personY - 8, 24, 38, 'تسلل حركة شخص! 99%', '#ef4444', isIR);
          }
          break;
        }

        case 'warehouse_aisle': {
          // Industrial Interior
          ctx.fillStyle = isIR ? '#171717' : '#0f172a';
          ctx.fillRect(0, 0, width, height);

          // Ceiling Racks Perspective
          ctx.fillStyle = isIR ? '#404040' : '#1e293b';
          ctx.fillRect(0, 0, width * 0.3, height);
          ctx.fillRect(width * 0.7, 0, width * 0.3, height);

          // Shelving Pallets (Yellow & Blue)
          for (let y = 30; y < height; y += 50) {
            ctx.fillStyle = isIR ? '#525252' : '#eab308';
            ctx.fillRect(10, y, width * 0.25, 20);
            ctx.fillStyle = isIR ? '#737373' : '#0284c7';
            ctx.fillRect(width * 0.72, y, width * 0.25, 20);
          }

          // Aisle Floor
          ctx.fillStyle = isIR ? '#262626' : '#334155';
          ctx.fillRect(width * 0.3, 0, width * 0.4, height);

          // Safety Yellow Center Line
          ctx.strokeStyle = isIR ? '#737373' : '#facc15';
          ctx.lineWidth = 2;
          ctx.setLineDash([15, 15]);
          ctx.beginPath();
          ctx.moveTo(width * 0.5, 0);
          ctx.lineTo(width * 0.5, height);
          ctx.stroke();
          ctx.setLineDash([]);

          // Moving Forklift
          const forkY = ((tick * 1.5) % (height + 100)) - 50;
          ctx.fillStyle = isIR ? '#a3a3a3' : '#f97316';
          ctx.fillRect(width * 0.42, forkY, 50, 40);
          // Orange Beacon Light
          if (tick % 20 < 10) {
            ctx.fillStyle = '#f59e0b';
            ctx.beginPath();
            ctx.arc(width * 0.42 + 25, forkY - 5, 6, 0, Math.PI * 2);
            ctx.fill();
          }

          if (showBoundingBoxes) {
            drawBoundingBox(ctx, width * 0.40, forkY - 10, 58, 55, 'رافع شوكية (Forklift) 95%', '#f59e0b', isIR);
          }
          break;
        }

        case 'parking_lot': {
          // Asphalt Floor
          ctx.fillStyle = isIR ? '#171717' : '#1e293b';
          ctx.fillRect(0, 0, width, height);

          // Parking Bay White Lines
          ctx.strokeStyle = isIR ? '#737373' : '#f8fafc';
          ctx.lineWidth = 3;
          for (let x = 40; x < width; x += 110) {
            ctx.strokeRect(x, 20, 90, height * 0.4);
          }

          // Parked Cars
          ctx.fillStyle = isIR ? '#525252' : '#3b82f6';
          ctx.roundRect(45, 30, 80, 70, 6);
          ctx.fill();

          // Incoming Truck / Car
          const carX = width - ((tick * 1.8) % (width + 120));
          ctx.fillStyle = isIR ? '#d4d4d4' : '#10b981';
          ctx.roundRect(carX, height * 0.55, 110, 45, 8);
          ctx.fill();

          if (showBoundingBoxes) {
            drawBoundingBox(ctx, carX - 5, height * 0.50, 120, 55, 'مركبة شحن (Plate: JED-991)', '#3b82f6', isIR);
          }
          break;
        }

        case 'office_entrance': {
          // Modern Reception Office
          ctx.fillStyle = isIR ? '#262626' : '#0f172a';
          ctx.fillRect(0, 0, width, height);

          // Reception Counter Desk
          ctx.fillStyle = isIR ? '#525252' : '#1e293b';
          ctx.roundRect(width * 0.25, height * 0.55, width * 0.5, 60, 8);
          ctx.fill();
          ctx.strokeStyle = isIR ? '#737373' : '#38bdf8';
          ctx.stroke();

          // Wall Logo text
          ctx.fillStyle = isIR ? '#a3a3a3' : '#f8fafc';
          ctx.font = 'bold 16px Tajawal, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('HARIS SECURITY - حارس الأمني', width / 2, height * 0.25);

          // Visitor walking in
          const visX = width * 0.35 + Math.sin(tick * 0.04) * 40;
          ctx.fillStyle = isIR ? '#e5e5e5' : '#a855f7';
          ctx.beginPath();
          ctx.arc(visX, height * 0.42, 8, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillRect(visX - 5, height * 0.44, 10, 22);

          if (showBoundingBoxes) {
            drawBoundingBox(ctx, visX - 12, height * 0.38, 24, 38, 'وجه معروف: المهندس خالد (Face ID)', '#a855f7', isIR);
          }
          break;
        }

        default: {
          // Living room / Generic Hall
          ctx.fillStyle = isIR ? '#171717' : '#1e1b4b';
          ctx.fillRect(0, 0, width, height);

          ctx.fillStyle = isIR ? '#404040' : '#312e81';
          ctx.roundRect(width * 0.2, height * 0.6, width * 0.6, 50, 10);
          ctx.fill();

          ctx.fillStyle = isIR ? '#f5f5f5' : '#818cf8';
          ctx.font = '14px Tajawal, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('CCTV LIVE MONITORING FEED', width / 2, height / 2);
        }
      }

      ctx.restore();

      // Apply Night Vision IR Overlay Filter effect on Canvas
      if (isIR) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.fillRect(0, 0, width, height);

        // Center Spotlight Halo
        const haloGrad = ctx.createRadialGradient(width / 2, height / 2, 50, width / 2, height / 2, width * 0.6);
        haloGrad.addColorStop(0, 'rgba(255, 255, 255, 0.15)');
        haloGrad.addColorStop(1, 'rgba(0, 0, 0, 0.6)');
        ctx.fillStyle = haloGrad;
        ctx.fillRect(0, 0, width, height);

        // IR Noise Grain
        ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
        for (let i = 0; i < 60; i++) {
          ctx.fillRect(Math.random() * width, Math.random() * height, 2, 2);
        }
      }

      // Apply Full Color Spotlight Warm Aura
      if (isSpotlight) {
        const spotGrad = ctx.createRadialGradient(width / 2, height / 2, 30, width / 2, height / 2, width * 0.5);
        spotGrad.addColorStop(0, 'rgba(254, 240, 138, 0.12)');
        spotGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = spotGrad;
        ctx.fillRect(0, 0, width, height);
      }

      // Camera HUD Overlay (Timestamp, Camera Name, Bitrate, REC Indicator)
      if (showOverlayStats) {
        // Top dark banner background
        ctx.fillStyle = 'rgba(2, 6, 23, 0.65)';
        ctx.fillRect(0, 0, width, 32);

        // Camera Title & IP
        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 12px monospace, Tajawal';
        ctx.textAlign = 'left';
        ctx.fillText(`[CAM ${camera.channel}] ${camera.name} (${camera.siteName})`, 10, 20);

        // Live Timestamp with Milliseconds
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0];
        const timeStr = now.toTimeString().split(' ')[0];
        const ms = String(now.getMilliseconds()).padStart(3, '0').substring(0, 2);
        const timestampStr = `${dateStr} ${timeStr}.${ms}`;

        ctx.textAlign = 'right';
        ctx.fillStyle = '#38bdf8';
        ctx.fillText(timestampStr, width - 10, 20);

        // Bottom Overlay Stats
        ctx.fillStyle = 'rgba(2, 6, 23, 0.65)';
        ctx.fillRect(0, height - 26, width, 26);

        ctx.font = '11px monospace';
        ctx.textAlign = 'left';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText(`FPS: ${camera.fps} | Bitrate: ${camera.bitrateKbps} Kbps | ${camera.resolution} | ${camera.brand} ONVIF`, 10, height - 9);

        // Flashing Recording Red Light
        if (isRecording || camera.status === 'recording') {
          ctx.textAlign = 'right';
          if (Math.floor(tick / 20) % 2 === 0) {
            ctx.fillStyle = '#ef4444';
            ctx.beginPath();
            ctx.arc(width - 65, height - 13, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#f8fafc';
            ctx.font = 'bold 11px sans-serif';
            ctx.fillText('● REC', width - 25, height - 9);
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [camera, showBoundingBoxes, showOverlayStats, isRecording]);

  return (
    <div
      className={`relative overflow-hidden rounded-xl bg-slate-950 border border-slate-800 shadow-xl cursor-pointer group ${className}`}
      onClick={onClick}
    >
      <canvas
        ref={canvasRef}
        width={640}
        height={360}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.01]"
      />
    </div>
  );
};

// Helper function to draw animated AI bounding box
function drawBoundingBox(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  label: string,
  color: string,
  isIR: boolean
) {
  ctx.save();
  ctx.strokeStyle = isIR ? '#ffffff' : color;
  ctx.lineWidth = 2;
  ctx.setLineDash([4, 2]);
  ctx.strokeRect(x, y, w, h);
  ctx.setLineDash([]);

  // Corner brackets
  const cornerLength = 8;
  ctx.strokeStyle = isIR ? '#22c55e' : color;
  ctx.lineWidth = 3;

  // Top-Left
  ctx.beginPath();
  ctx.moveTo(x, y + cornerLength);
  ctx.lineTo(x, y);
  ctx.lineTo(x + cornerLength, y);
  ctx.stroke();

  // Top-Right
  ctx.beginPath();
  ctx.moveTo(x + w - cornerLength, y);
  ctx.lineTo(x + w, y);
  ctx.lineTo(x + w, y + cornerLength);
  ctx.stroke();

  // Label tag
  ctx.fillStyle = isIR ? '#166534' : color;
  ctx.fillRect(x, y - 20, Math.max(80, label.length * 7), 18);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 10px Tajawal, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(label, x + 4, y - 6);

  ctx.restore();
}
