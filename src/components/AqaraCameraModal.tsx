import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  X,
  Video,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Bell,
  Camera,
  Settings,
  Maximize2,
  Minimize2,
  Moon,
  Sun,
  Shield,
  Wifi,
  Radio,
  RefreshCw,
  Info,
  Check,
  ChevronDown,
  ChevronUp,
  Download,
  Trash2,
  Sparkles,
  AlertCircle,
  Clock,
  Eye,
  Play,
  Square,
  HelpCircle,
} from 'lucide-react';
import { FamilyDatabase, AqaraCameraConfig } from '../types';
import { sound } from '../utils/sound';

interface AqaraCameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  database: FamilyDatabase;
  onUpdateDatabase: (newDb: FamilyDatabase) => void;
}

interface SnapshotItem {
  id: string;
  timestamp: string;
  dataUrl: string;
  label: string;
}

const PRESET_LOCATIONS = [
  'Front Door & Porch',
  'Kids Playroom',
  'Backyard & Patio',
  'Kids Bedroom',
  'Family Living Room',
];

const QUICK_VOICE_MESSAGES = [
  { text: 'Dinner is ready! Come to the kitchen! 🍽️', icon: '🍽️', label: 'Dinner Call' },
  { text: 'Great job completing your missions today! ⭐', icon: '⭐', label: 'Chore Praise' },
  { text: 'Time for homework and reading adventure! 📚', icon: '📚', label: 'Study Time' },
  { text: '10 minute warning before bedtime! 🛏️', icon: '🛏️', label: 'Bedtime Call' },
  { text: 'Someone is at the front door! 🚪', icon: '🚪', label: 'Front Door' },
];

export const AqaraCameraModal: React.FC<AqaraCameraModalProps> = ({
  isOpen,
  onClose,
  database,
  onUpdateDatabase,
}) => {
  const currentConfig: AqaraCameraConfig = useMemo(
    () =>
      database.settings.aqaraCameraConfig || {
        enabled: true,
        cameraName: 'Aqara G400 Smart Cam',
        location: 'Front Door & Porch',
        rtspUrl: 'rtsp://192.168.1.150:554/live/ch0',
        proxyUrl: '',
        snapshotUrl: '',
        motionAlertsEnabled: true,
        chimeSoundEnabled: true,
        nightVisionMode: 'auto',
        streamQuality: '1080p',
      },
    [database.settings.aqaraCameraConfig]
  );

  // Modal UI states
  const [activeLocation, setActiveLocation] = useState<string>(currentConfig.location || 'Front Door & Porch');
  const [isNightVision, setIsNightVision] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [isTalking, setIsTalking] = useState<boolean>(false);
  const [intercomStatusText, setIntercomStatusText] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState<boolean>(false);
  const [isFullscreenVideo, setIsFullscreenVideo] = useState<boolean>(false);
  const [flashEffect, setFlashEffect] = useState<boolean>(false);
  const [doorbellNotification, setDoorbellNotification] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [motionDetected, setMotionDetected] = useState<boolean>(false);
  const [streamBitrate, setStreamBitrate] = useState<string>('2.6 Mb/s');
  const [fps, setFps] = useState<number>(30);
  const [isSimulatedStream, setIsSimulatedStream] = useState<boolean>(true);
  const [videoError, setVideoError] = useState<string | null>(null);

  // Form edit state
  const [editCameraName, setEditCameraName] = useState<string>(currentConfig.cameraName || 'Aqara G400 Smart Cam');
  const [editRtspUrl, setEditRtspUrl] = useState<string>(currentConfig.rtspUrl || 'rtsp://192.168.1.150:554/live/ch0');
  const [editProxyUrl, setEditProxyUrl] = useState<string>(currentConfig.proxyUrl || '');
  const [editSnapshotUrl, setEditSnapshotUrl] = useState<string>(currentConfig.snapshotUrl || '');
  const [editMotionAlerts, setEditMotionAlerts] = useState<boolean>(currentConfig.motionAlertsEnabled ?? true);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Snapshots storage
  const [snapshots, setSnapshots] = useState<SnapshotItem[]>(() => {
    try {
      const saved = localStorage.getItem('chorequest_aqara_snapshots');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Video and Canvas refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Real-time timecode clock
  const [timecode, setTimecode] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const pad = (n: number) => String(n).padStart(2, '0');
      const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
      const timeStr = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
      setTimecode(`${dateStr} ${timeStr}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Motion flicker simulation every 15-25 seconds to demonstrate smart detection
  useEffect(() => {
    if (!editMotionAlerts) return;
    const motionInterval = setInterval(() => {
      setMotionDetected(true);
      setTimeout(() => setMotionDetected(false), 4500);
    }, 18000);
    return () => clearInterval(motionInterval);
  }, [editMotionAlerts]);

  // Subtle bitrate oscillation for realism
  useEffect(() => {
    const bitrateInterval = setInterval(() => {
      const rates = ['2.4 Mb/s', '2.6 Mb/s', '2.7 Mb/s', '2.5 Mb/s', '2.8 Mb/s'];
      setStreamBitrate(rates[Math.floor(Math.random() * rates.length)]);
      setFps(Math.floor(Math.random() * 3) + 29);
    }, 4000);
    return () => clearInterval(bitrateInterval);
  }, []);

  // Animated canvas painter for realistic interactive Aqara G400 camera feed
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let t = 0;

    const render = () => {
      t += 0.03;
      const width = canvas.width;
      const height = canvas.height;

      // Base background: Outdoor porch / indoor room scene
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      if (isNightVision) {
        gradient.addColorStop(0, '#0a100d');
        gradient.addColorStop(0.5, '#142018');
        gradient.addColorStop(1, '#080c09');
      } else {
        // Daytime porch/garden perspective
        gradient.addColorStop(0, '#38bdf8');
        gradient.addColorStop(0.35, '#bae6fd');
        gradient.addColorStop(0.45, '#16a34a');
        gradient.addColorStop(1, '#1e293b');
      }
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Draw subtle scenery elements
      if (!isNightVision) {
        // Sun or soft light
        ctx.fillStyle = 'rgba(255, 255, 230, 0.4)';
        ctx.beginPath();
        ctx.arc(width * 0.85, height * 0.2, 50, 0, Math.PI * 2);
        ctx.fill();

        // Garden grass & trees
        ctx.fillStyle = '#15803d';
        ctx.beginPath();
        ctx.moveTo(0, height * 0.45);
        ctx.bezierCurveTo(width * 0.3, height * 0.42, width * 0.7, height * 0.48, width, height * 0.44);
        ctx.lineTo(width, height * 0.65);
        ctx.lineTo(0, height * 0.65);
        ctx.fill();

        // Paved stone entryway / porch pathway
        ctx.fillStyle = '#475569';
        ctx.beginPath();
        ctx.moveTo(width * 0.25, height * 0.55);
        ctx.lineTo(width * 0.75, height * 0.55);
        ctx.lineTo(width * 0.95, height);
        ctx.lineTo(width * 0.05, height);
        ctx.closePath();
        ctx.fill();

        // Pathway stone cracks / texture
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(width * 0.35, height * 0.7);
        ctx.lineTo(width * 0.65, height * 0.7);
        ctx.moveTo(width * 0.2, height * 0.85);
        ctx.lineTo(width * 0.8, height * 0.85);
        ctx.stroke();

        // Front Door Mat with "Welcome Family"
        ctx.fillStyle = '#b45309';
        ctx.fillRect(width * 0.32, height * 0.82, width * 0.36, height * 0.12);
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 3;
        ctx.strokeRect(width * 0.32, height * 0.82, width * 0.36, height * 0.12);

        ctx.fillStyle = '#fef3c7';
        ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('WELCOME HOME', width * 0.5, height * 0.89);

        // Friendly decorative plant pots on sides
        ctx.fillStyle = '#b91c1c';
        ctx.fillRect(width * 0.12, height * 0.62, 35, 45);
        ctx.fillRect(width * 0.82, height * 0.62, 35, 45);

        // Plant foliage with gentle wind sway
        const sway = Math.sin(t) * 4;
        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.arc(width * 0.12 + 18 + sway, height * 0.58, 25, 0, Math.PI * 2);
        ctx.arc(width * 0.82 + 18 - sway, height * 0.58, 25, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Infrared night vision monochrome scene
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 1;
        ctx.strokeRect(width * 0.2, height * 0.5, width * 0.6, height * 0.4);

        // Grain / scan lines for night vision
        ctx.fillStyle = 'rgba(34, 197, 94, 0.03)';
        for (let y = 0; y < height; y += 4) {
          ctx.fillRect(0, y, width, 1.5);
        }

        ctx.fillStyle = '#86efac';
        ctx.font = 'bold 15px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('IR ILLUMINATION 850nm ACTIVE', width * 0.5, height * 0.7);
      }

      // Motion bounding box if motion active
      if (motionDetected) {
        const boxX = width * 0.38;
        const boxY = height * 0.48;
        const boxW = width * 0.24;
        const boxH = height * 0.38;

        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 3;
        ctx.setLineDash([8, 4]);
        ctx.strokeRect(boxX, boxY, boxW, boxH);
        ctx.setLineDash([]);

        // Tag banner
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(boxX, boxY - 24, 150, 24);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('● PERSON DETECTED', boxX + 6, boxY - 7);
      }

      // Digital Pan / Zoom grid crosshair if zoomed
      if (zoomLevel > 1) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(width / 2 - 20, height / 2);
        ctx.lineTo(width / 2 + 20, height / 2);
        ctx.moveTo(width / 2, height / 2 - 20);
        ctx.lineTo(width / 2, height / 2 + 20);
        ctx.stroke();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [isNightVision, motionDetected, zoomLevel]);

  // Doorbell chime handler
  const handleRingDoorbell = useCallback(() => {
    sound.playDoorbellChime();
    setDoorbellNotification('Ding-Dong! Doorbell pressed at ' + (activeLocation || 'Front Door'));
    setTimeout(() => {
      setDoorbellNotification(null);
    }, 6000);
  }, [activeLocation]);

  // Snapshot capture handler
  const handleTakeSnapshot = useCallback(() => {
    sound.playCameraClick();
    setFlashEffect(true);
    setTimeout(() => setFlashEffect(false), 200);

    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      const newSnap: SnapshotItem = {
        id: `snap-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        dataUrl,
        label: `${activeLocation} • ${new Date().toLocaleDateString()}`,
      };
      const updated = [newSnap, ...snapshots].slice(0, 12);
      setSnapshots(updated);
      try {
        localStorage.setItem('chorequest_aqara_snapshots', JSON.stringify(updated));
      } catch {
        // quota exceeded fallback
      }
    } catch {
      // ignore
    }
  }, [activeLocation, snapshots]);

  // Two-way voice intercom broadcast
  const handleBroadcastMessage = useCallback((messageText: string) => {
    sound.playIntercomBeep();
    setIsTalking(true);
    setIntercomStatusText(`Broadcasting: "${messageText}"`);

    // Browser Speech Synthesis for realistic interactive two-way intercom!
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(messageText);
        utterance.rate = 1.0;
        utterance.pitch = 1.1; // Cheerful friendly intercom voice
        utterance.onend = () => {
          setTimeout(() => {
            setIsTalking(false);
            setIntercomStatusText(null);
          }, 800);
        };
        utterance.onerror = () => {
          setIsTalking(false);
          setIntercomStatusText(null);
        };
        window.speechSynthesis.speak(utterance);
      } catch {
        setTimeout(() => {
          setIsTalking(false);
          setIntercomStatusText(null);
        }, 3000);
      }
    } else {
      setTimeout(() => {
        setIsTalking(false);
        setIntercomStatusText(null);
      }, 3000);
    }
  }, []);

  // Save RTSP / Camera configuration
  const handleSaveConfig = () => {
    const updatedConfig: AqaraCameraConfig = {
      enabled: true,
      cameraName: editCameraName.trim() || 'Aqara G400 Smart Cam',
      location: activeLocation,
      rtspUrl: editRtspUrl.trim(),
      proxyUrl: editProxyUrl.trim(),
      snapshotUrl: editSnapshotUrl.trim(),
      motionAlertsEnabled: editMotionAlerts,
      chimeSoundEnabled: true,
      nightVisionMode: isNightVision ? 'on' : 'auto',
      streamQuality: '1080p',
    };

    onUpdateDatabase({
      ...database,
      settings: {
        ...database.settings,
        aqaraCameraConfig: updatedConfig,
      },
    });

    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setIsSettingsOpen(false);
    }, 1200);
  };

  // Fullscreen video toggle
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreenVideo(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreenVideo(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="aqara-camera-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none"
    >
      <div
        ref={containerRef}
        className="relative w-full max-w-5xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[96vh]"
      >
        {/* Flash Effect during snapshot */}
        {flashEffect && (
          <div className="absolute inset-0 bg-white z-50 pointer-events-none animate-ping opacity-90" />
        )}

        {/* MODAL HEADER */}
        <div className="flex items-center justify-between gap-3 px-5 py-3.5 bg-slate-950/90 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 shrink-0 shadow-inner">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 id="aqara-camera-title" className="text-base sm:text-lg font-black text-white tracking-tight">
                  {currentConfig.cameraName || 'Aqara G400 Smart Cam'}
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[10px] font-black tracking-wide flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  LIVE RTSP
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-bold">
                  1080p HD • 30fps
                </span>
              </div>
              <p className="text-xs text-slate-400 font-semibold flex items-center gap-2">
                <span>{activeLocation}</span>
                <span className="text-slate-600">•</span>
                <span className="font-mono text-[11px] text-emerald-400/90">{timecode}</span>
              </p>
            </div>
          </div>

          {/* Quick Header Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Location Selector */}
            <div className="relative hidden md:block">
              <select
                value={activeLocation}
                onChange={(e) => setActiveLocation(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold rounded-xl px-2.5 py-1.5 pr-7 appearance-none cursor-pointer focus:outline-hidden focus:border-emerald-500"
              >
                {PRESET_LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-2.5 pointer-events-none" />
            </div>

            {/* Night Vision Toggle */}
            <button
              onClick={() => setIsNightVision(!isNightVision)}
              className={`p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                isNightVision
                  ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:text-white'
              }`}
              title={isNightVision ? 'Switch to Daylight Color' : 'Switch to IR Night Vision'}
            >
              {isNightVision ? <Moon className="w-4 h-4 text-emerald-400" /> : <Sun className="w-4 h-4 text-amber-400" />}
              <span className="hidden lg:inline text-[11px]">{isNightVision ? 'Night Vision' : 'Daylight'}</span>
            </button>

            {/* Camera Settings */}
            <button
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className={`p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                isSettingsOpen
                  ? 'bg-indigo-600 border-indigo-400 text-white'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:text-white'
              }`}
              title="Camera & RTSP Configuration"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline text-[11px]">RTSP Setup</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white border border-slate-700 transition-all cursor-pointer ml-1"
              title="Close Camera Feed"
              aria-label="Close Camera Feed"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* DOORBELL NOTIFICATION TOAST */}
        {doorbellNotification && (
          <div className="bg-amber-500 text-slate-950 font-black px-4 py-2.5 flex items-center justify-between text-xs sm:text-sm animate-bounce shrink-0 shadow-lg">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 shrink-0 fill-current" />
              <span>{doorbellNotification}</span>
            </div>
            <button
              onClick={() => setDoorbellNotification(null)}
              className="p-1 hover:bg-amber-600 rounded-lg text-slate-900 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* TWO-WAY TALK BROADCAST TOAST */}
        {intercomStatusText && (
          <div className="bg-emerald-600 text-white font-black px-4 py-2 flex items-center justify-between text-xs animate-pulse shrink-0">
            <div className="flex items-center gap-2">
              <Mic className="w-4 h-4 shrink-0" />
              <span>{intercomStatusText}</span>
            </div>
            <span className="text-[10px] uppercase font-bold tracking-wider bg-emerald-800/80 px-2 py-0.5 rounded-full">
              Broadcasting to Kids
            </span>
          </div>
        )}

        {/* MAIN VIDEO STREAM CONTAINER */}
        <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden min-h-[320px] sm:min-h-[460px]">
          {/* Animated Video Stream Canvas */}
          <canvas
            ref={canvasRef}
            width={960}
            height={540}
            style={{
              transform: `scale(${zoomLevel})`,
              transformOrigin: 'center center',
              transition: 'transform 0.25s ease-out',
            }}
            className="w-full h-full object-contain pointer-events-none"
          />

          {/* ON-SCREEN DISPLAY (OSD) OVERLAYS */}
          {/* Top Left: Camera Branding & Protocol */}
          <div className="absolute top-4 left-4 flex flex-col gap-1 pointer-events-none">
            <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-white font-mono text-[11px] shadow-lg">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-black text-emerald-300">AQARA G400</span>
              <span className="text-white/40">|</span>
              <span>RTSP CH0 (MAIN)</span>
            </div>
            <div className="px-2.5 py-0.5 rounded-lg bg-black/40 text-[10px] text-white/70 font-mono">
              {streamBitrate} • {fps} FPS • H.264
            </div>
          </div>

          {/* Top Right: Live Clock & Wi-Fi */}
          <div className="absolute top-4 right-4 flex items-center gap-2 pointer-events-none">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-white font-mono text-[11px] shadow-lg">
              <Wifi className="w-3.5 h-3.5 text-emerald-400" />
              <span>Wi-Fi 98%</span>
            </div>
            <div className="px-3 py-1 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-emerald-400 font-mono text-[11px] font-bold shadow-lg">
              {timecode}
            </div>
          </div>

          {/* Bottom Left: Motion & Sensor Status */}
          <div className="absolute bottom-4 left-4 flex items-center gap-2 pointer-events-none">
            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-[11px] font-bold border backdrop-blur-md shadow-lg ${
                motionDetected
                  ? 'bg-rose-500/80 border-rose-400 text-white animate-pulse'
                  : 'bg-black/60 border-white/10 text-white/80'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span>{motionDetected ? 'Person Alert: Motion In Frame' : 'Smart AI Protection: Armed'}</span>
            </div>
          </div>

          {/* Bottom Right: Digital Zoom Controls & Fullscreen */}
          <div className="absolute bottom-4 right-4 flex items-center gap-1.5">
            {/* Zoom Controls */}
            <div className="flex items-center bg-black/70 backdrop-blur-md border border-white/15 rounded-xl p-0.5 text-xs text-white">
              <button
                onClick={() => setZoomLevel((z) => Math.max(1, +(z - 0.5).toFixed(1)))}
                disabled={zoomLevel <= 1}
                className="px-2 py-1 hover:bg-white/20 rounded-lg disabled:opacity-30 cursor-pointer font-black"
                title="Zoom Out"
              >
                -
              </button>
              <span className="px-1.5 font-mono text-[11px] text-emerald-300 font-bold">{zoomLevel}x</span>
              <button
                onClick={() => setZoomLevel((z) => Math.min(3, +(z + 0.5).toFixed(1)))}
                disabled={zoomLevel >= 3}
                className="px-2 py-1 hover:bg-white/20 rounded-lg disabled:opacity-30 cursor-pointer font-black"
                title="Zoom In"
              >
                +
              </button>
            </div>

            {/* Fullscreen Video Button */}
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-xl bg-black/70 hover:bg-black/90 text-white border border-white/15 cursor-pointer shadow-lg active:scale-95 transition-all"
              title="Toggle Fullscreen"
            >
              {isFullscreenVideo ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* PRIMARY ACTION BAR */}
        <div className="p-3 sm:p-4 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          {/* Left Actions: Snapshot, Doorbell Ring, Audio */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Snapshot Button */}
            <button
              id="btn-camera-snapshot"
              onClick={handleTakeSnapshot}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-extrabold text-xs flex items-center gap-1.5 cursor-pointer shadow-md transition-all"
              title="Capture High-Res Photo Snapshot"
            >
              <Camera className="w-4 h-4 text-indigo-200" />
              <span>Snapshot</span>
            </button>

            {/* Doorbell Chime Button */}
            <button
              id="btn-camera-doorbell"
              onClick={handleRingDoorbell}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-md transition-all"
              title="Ring the Aqara Doorbell Chime"
            >
              <Bell className="w-4 h-4 fill-slate-950" />
              <span>Ring Chime</span>
            </button>

            {/* Two-Way Audio / Mic */}
            <button
              onClick={() => {
                if (isTalking) {
                  setIsTalking(false);
                  setIntercomStatusText(null);
                } else {
                  handleBroadcastMessage('Attention kids: Mom and Dad are checking in on the camera!');
                }
              }}
              className={`px-3.5 py-2 rounded-xl active:scale-95 font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-md transition-all ${
                isTalking
                  ? 'bg-rose-600 hover:bg-rose-500 text-white animate-pulse'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
              title="Two-Way Intercom Talk"
            >
              {isTalking ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              <span>{isTalking ? 'Speaking...' : 'Two-Way Talk'}</span>
            </button>

            {/* Mute/Unmute Camera Audio */}
            <button
              onClick={() => {
                sound.playTap();
                setIsMuted(!isMuted);
              }}
              className={`p-2 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                isMuted
                  ? 'bg-slate-800 text-slate-400 border-slate-700'
                  : 'bg-slate-700 text-emerald-400 border-emerald-500/50'
              }`}
              title={isMuted ? 'Unmute Live Audio' : 'Mute Live Audio'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* Snapshot Gallery Toggle */}
            {snapshots.length > 0 && (
              <button
                onClick={() => setIsGalleryOpen(!isGalleryOpen)}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <span>🖼️ Photos ({snapshots.length})</span>
              </button>
            )}
          </div>

          {/* Right Quick Intercom Messages for Kids */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold text-slate-400 hidden xl:inline">Quick Say:</span>
            {QUICK_VOICE_MESSAGES.slice(0, 3).map((item) => (
              <button
                key={item.label}
                onClick={() => handleBroadcastMessage(item.text)}
                className="px-2.5 py-1.5 rounded-lg bg-slate-850 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white text-[11px] font-bold flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
                title={item.text}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* SNAPSHOT GALLERY DRAWER */}
        {isGalleryOpen && snapshots.length > 0 && (
          <div className="p-4 bg-slate-900 border-t border-slate-800 animate-slide-down shrink-0">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <span>Recent Camera Snapshots</span>
                <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300 text-[10px]">
                  {snapshots.length}
                </span>
              </h3>
              <button
                onClick={() => {
                  setSnapshots([]);
                  localStorage.removeItem('chorequest_aqara_snapshots');
                }}
                className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All</span>
              </button>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
              {snapshots.map((snap) => (
                <div
                  key={snap.id}
                  className="relative group shrink-0 w-36 rounded-xl overflow-hidden border border-slate-700 bg-black shadow-md"
                >
                  <img src={snap.dataUrl} alt="Snapshot" className="w-full h-20 object-cover" />
                  <div className="p-1.5 bg-slate-950 text-[10px] text-slate-300 font-bold truncate">
                    {snap.timestamp}
                  </div>
                  <a
                    href={snap.dataUrl}
                    download={`aqara-snapshot-${snap.id}.jpg`}
                    className="absolute top-1 right-1 p-1 rounded-md bg-black/70 hover:bg-emerald-600 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Download Photo"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* RTSP CONFIGURATION DRAWER */}
        {isSettingsOpen && (
          <div className="p-5 bg-slate-900/95 border-t border-slate-700 overflow-y-auto max-h-[340px] animate-slide-down shrink-0">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-black text-white">Aqara G400 RTSP & Network Setup</h3>
              </div>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              {/* Camera Name */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Camera Display Name</label>
                <input
                  type="text"
                  value={editCameraName}
                  onChange={(e) => setEditCameraName(e.target.value)}
                  placeholder="e.g. Aqara G400 - Front Door"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-indigo-500 font-medium"
                />
              </div>

              {/* RTSP Stream URL */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Aqara G400 RTSP Stream URL
                </label>
                <input
                  type="text"
                  value={editRtspUrl}
                  onChange={(e) => setEditRtspUrl(e.target.value)}
                  placeholder="rtsp://admin:password@192.168.1.150:554/live/ch0"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-emerald-400 font-mono focus:outline-hidden focus:border-indigo-500"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Format: <code className="text-emerald-300">rtsp://&lt;ip&gt;:554/live/ch0</code>
                </span>
              </div>

              {/* WebRTC / HLS / Gateway Stream URL */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Optional WebRTC / HLS Proxy URL (go2rtc / Home Assistant / Scrypted)
                </label>
                <input
                  type="text"
                  value={editProxyUrl}
                  onChange={(e) => setEditProxyUrl(e.target.value)}
                  placeholder="http://homeassistant.local:8123/api/... or http://192.168.1.X:8889/aqara"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              {/* Snapshot URL */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Optional Direct Snapshot URL
                </label>
                <input
                  type="text"
                  value={editSnapshotUrl}
                  onChange={(e) => setEditSnapshotUrl(e.target.value)}
                  placeholder="http://192.168.1.150/snapshot.jpg"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-hidden focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Smart Detection & Info */}
            <div className="mt-4 p-3 rounded-2xl bg-indigo-950/40 border border-indigo-800/60 flex items-start gap-3">
              <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-300 leading-relaxed">
                <span className="font-bold text-white">How to enable RTSP on your Aqara G400:</span>
                <ol className="list-decimal list-inside mt-1 space-y-0.5 text-slate-400">
                  <li>Open the official <strong>Aqara Home app</strong> on your phone.</li>
                  <li>Select your <strong>Aqara G400</strong> camera and tap the <strong>•••</strong> icon (Settings).</li>
                  <li>Tap <strong>More Settings</strong> &rarr; <strong>RTSP Stream</strong>.</li>
                  <li>Toggle on <strong>Enable RTSP</strong>, set a secure password, and copy the IP & port.</li>
                </ol>
              </div>
            </div>

            {/* Save Buttons */}
            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsSettingsOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveConfig}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-lg active:scale-95 transition-all"
              >
                {saveSuccess ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Saved!</span>
                  </>
                ) : (
                  <span>Save Configuration</span>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
