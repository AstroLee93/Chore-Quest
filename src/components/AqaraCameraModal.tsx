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
  RefreshCw,
  Info,
  Check,
  Download,
  Trash2,
  AlertCircle,
  ExternalLink,
  Tv,
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

const DEFAULT_AQARA_CONFIG: AqaraCameraConfig = {
  enabled: true,
  cameraName: 'Aqara G400 Smart Cam',
  location: 'Front Door',
  rtspUrl: 'rtsp://192.168.1.150:554/live/ch0',
  proxyUrl: '',
  snapshotUrl: '',
  motionAlertsEnabled: true,
  chimeSoundEnabled: true,
  nightVisionMode: 'auto',
  streamQuality: '1080p',
};

const QUICK_VOICE_MESSAGES = [
  { text: 'Someone is at the front door! 🚪', icon: '🚪', label: 'Front Door' },
  { text: 'Dinner is ready! Come to the kitchen! 🍽️', icon: '🍽️', label: 'Dinner Call' },
  { text: 'Great job completing your missions today! ⭐', icon: '⭐', label: 'Chore Praise' },
  { text: 'Time for homework and reading adventure! 📚', icon: '📚', label: 'Study Time' },
  { text: '10 minute warning before bedtime! 🛏️', icon: '🛏️', label: 'Bedtime Call' },
];

export const AqaraCameraModal: React.FC<AqaraCameraModalProps> = ({
  isOpen,
  onClose,
  database,
  onUpdateDatabase,
}) => {
  // Load initial config from localStorage or database
  const [config, setConfig] = useState<AqaraCameraConfig>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('chorequest_aqara_camera_config');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && typeof parsed === 'object') {
            return { ...DEFAULT_AQARA_CONFIG, ...parsed };
          }
        }
      } catch {
        // ignore
      }
    }
    return database.settings.aqaraCameraConfig || DEFAULT_AQARA_CONFIG;
  });

  // Modal UI states
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

  // Live Stream vs Demo Canvas management
  const [streamKey, setStreamKey] = useState<number>(0);
  const [isStreamLoading, setIsStreamLoading] = useState<boolean>(false);
  const [streamError, setStreamError] = useState<string | null>(null);
  const [isDemoModeActive, setIsDemoModeActive] = useState<boolean>(false);

  // Form edit state in setup drawer
  const [editCameraName, setEditCameraName] = useState<string>(config.cameraName || 'Aqara G400 Smart Cam');
  const [editRtspUrl, setEditRtspUrl] = useState<string>(config.rtspUrl || '');
  const [editProxyUrl, setEditProxyUrl] = useState<string>(config.proxyUrl || '');
  const [editSnapshotUrl, setEditSnapshotUrl] = useState<string>(config.snapshotUrl || '');
  const [editMotionAlerts, setEditMotionAlerts] = useState<boolean>(config.motionAlertsEnabled ?? true);
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
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  // Real-time timecode clock
  const [timecode, setTimecode] = useState<string>('');

  // Keep state synced with props when modal opens
  useEffect(() => {
    if (isOpen) {
      const dbConfig = database.settings.aqaraCameraConfig;
      let effective = config;
      if (typeof window !== 'undefined') {
        try {
          const saved = localStorage.getItem('chorequest_aqara_camera_config');
          if (saved) {
            const parsed = JSON.parse(saved);
            effective = { ...DEFAULT_AQARA_CONFIG, ...parsed, ...(dbConfig || {}) };
          } else if (dbConfig) {
            effective = { ...DEFAULT_AQARA_CONFIG, ...dbConfig };
          }
        } catch {
          if (dbConfig) effective = { ...DEFAULT_AQARA_CONFIG, ...dbConfig };
        }
      }
      setConfig(effective);
      setEditCameraName(effective.cameraName || 'Aqara G400 Smart Cam');
      setEditRtspUrl(effective.rtspUrl || '');
      setEditProxyUrl(effective.proxyUrl || '');
      setEditSnapshotUrl(effective.snapshotUrl || '');
      setEditMotionAlerts(effective.motionAlertsEnabled ?? true);
      setStreamError(null);
      setIsStreamLoading(Boolean(effective.proxyUrl || (effective.rtspUrl && effective.rtspUrl.startsWith('http'))));
      // By default, if a proxy or web stream is configured, disable demo mode!
      setIsDemoModeActive(false);
    }
  }, [isOpen, database.settings.aqaraCameraConfig]);

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

  // Motion flicker simulation
  useEffect(() => {
    if (!editMotionAlerts) return;
    const motionInterval = setInterval(() => {
      setMotionDetected(true);
      setTimeout(() => setMotionDetected(false), 4500);
    }, 22000);
    return () => clearInterval(motionInterval);
  }, [editMotionAlerts]);

  // Bitrate oscillation for realism
  useEffect(() => {
    const bitrateInterval = setInterval(() => {
      const rates = ['2.4 Mb/s', '2.6 Mb/s', '2.7 Mb/s', '2.5 Mb/s', '2.8 Mb/s'];
      setStreamBitrate(rates[Math.floor(Math.random() * rates.length)]);
      setFps(Math.floor(Math.random() * 3) + 29);
    }, 4000);
    return () => clearInterval(bitrateInterval);
  }, []);

  // Determine effective stream URL & stream type
  const effectiveStreamUrl = useMemo(() => {
    const proxy = (config.proxyUrl || '').trim();
    if (proxy) return proxy;
    const rtsp = (config.rtspUrl || '').trim();
    if (rtsp.startsWith('http://') || rtsp.startsWith('https://')) {
      return rtsp;
    }
    return '';
  }, [config.proxyUrl, config.rtspUrl]);

  const streamType = useMemo<'iframe' | 'video' | 'image' | 'raw_rtsp' | 'none'>(() => {
    if (!effectiveStreamUrl) {
      const rawRtsp = (config.rtspUrl || '').trim();
      if (rawRtsp.startsWith('rtsp://') || rawRtsp.startsWith('rtsps://')) {
        return 'raw_rtsp';
      }
      return 'none';
    }

    const lower = effectiveStreamUrl.toLowerCase();
    // Video tag candidate: MP4, HLS/m3u8, MSE
    if (
      lower.includes('.mp4') ||
      lower.includes('stream.mp4') ||
      lower.includes('.m3u8') ||
      lower.includes('hls') ||
      lower.includes('mse')
    ) {
      return 'video';
    }

    // Image candidate: MJPEG
    if (lower.includes('.mjpeg') || lower.includes('.mjpg') || lower.includes('stream.mjpeg')) {
      return 'image';
    }

    // WebRTC / go2rtc HTML / web player -> IFrame
    return 'iframe';
  }, [effectiveStreamUrl, config.rtspUrl]);

  // Determine if simulated demo canvas should actually render
  const shouldRenderDemoCanvas = isDemoModeActive || (streamType === 'none' && !effectiveStreamUrl);

  // Animated canvas painter for realistic interactive fallback / demo feed
  useEffect(() => {
    if (!shouldRenderDemoCanvas) return;
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

      // Base background: Outdoor front porch
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      if (isNightVision) {
        gradient.addColorStop(0, '#0a100d');
        gradient.addColorStop(0.5, '#142018');
        gradient.addColorStop(1, '#080c09');
      } else {
        gradient.addColorStop(0, '#38bdf8');
        gradient.addColorStop(0.35, '#bae6fd');
        gradient.addColorStop(0.45, '#16a34a');
        gradient.addColorStop(1, '#1e293b');
      }
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Scenery
      if (!isNightVision) {
        // Soft sun
        ctx.fillStyle = 'rgba(255, 255, 230, 0.4)';
        ctx.beginPath();
        ctx.arc(width * 0.85, height * 0.2, 50, 0, Math.PI * 2);
        ctx.fill();

        // Garden grass
        ctx.fillStyle = '#15803d';
        ctx.beginPath();
        ctx.moveTo(0, height * 0.45);
        ctx.bezierCurveTo(width * 0.3, height * 0.42, width * 0.7, height * 0.48, width, height * 0.44);
        ctx.lineTo(width, height * 0.65);
        ctx.lineTo(0, height * 0.65);
        ctx.fill();

        // Paved entryway pathway
        ctx.fillStyle = '#475569';
        ctx.beginPath();
        ctx.moveTo(width * 0.25, height * 0.55);
        ctx.lineTo(width * 0.75, height * 0.55);
        ctx.lineTo(width * 0.95, height);
        ctx.lineTo(width * 0.05, height);
        ctx.closePath();
        ctx.fill();

        // Pathway stone cracks
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(width * 0.35, height * 0.7);
        ctx.lineTo(width * 0.65, height * 0.7);
        ctx.moveTo(width * 0.2, height * 0.85);
        ctx.lineTo(width * 0.8, height * 0.85);
        ctx.stroke();

        // Front Door Mat
        ctx.fillStyle = '#b45309';
        ctx.fillRect(width * 0.32, height * 0.82, width * 0.36, height * 0.12);
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 3;
        ctx.strokeRect(width * 0.32, height * 0.82, width * 0.36, height * 0.12);

        ctx.fillStyle = '#fef3c7';
        ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('WELCOME HOME', width * 0.5, height * 0.89);

        // Friendly plant pots
        ctx.fillStyle = '#b91c1c';
        ctx.fillRect(width * 0.12, height * 0.62, 35, 45);
        ctx.fillRect(width * 0.82, height * 0.62, 35, 45);

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

        ctx.fillStyle = 'rgba(34, 197, 94, 0.03)';
        for (let y = 0; y < height; y += 4) {
          ctx.fillRect(0, y, width, 1.5);
        }

        ctx.fillStyle = '#86efac';
        ctx.font = 'bold 15px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('IR ILLUMINATION 850nm ACTIVE', width * 0.5, height * 0.7);
      }

      // Motion bounding box
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

        ctx.fillStyle = '#ef4444';
        ctx.fillRect(boxX, boxY - 24, 150, 24);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('● PERSON DETECTED', boxX + 6, boxY - 7);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [shouldRenderDemoCanvas, isNightVision, motionDetected]);

  // Doorbell chime handler
  const handleRingDoorbell = useCallback(() => {
    sound.playDoorbellChime();
    setDoorbellNotification('Ding-Dong! Doorbell chime rung at Front Door');
    setTimeout(() => {
      setDoorbellNotification(null);
    }, 6000);
  }, []);

  // Snapshot capture handler
  const handleTakeSnapshot = useCallback(() => {
    sound.playCameraClick();
    setFlashEffect(true);
    setTimeout(() => setFlashEffect(false), 200);

    let dataUrl = '';

    // If HTML5 video is rendering, extract exact frame
    if (videoRef.current && videoRef.current.readyState >= 2) {
      try {
        const offscreen = document.createElement('canvas');
        offscreen.width = videoRef.current.videoWidth || 960;
        offscreen.height = videoRef.current.videoHeight || 540;
        const ctx = offscreen.getContext('2d');
        if (ctx) {
          ctx.drawImage(videoRef.current, 0, 0, offscreen.width, offscreen.height);
          dataUrl = offscreen.toDataURL('image/jpeg', 0.9);
        }
      } catch {
        // CORS or offscreen limitation fallback
      }
    }

    // Fallback to canvas ref if simulated or offscreen failed
    if (!dataUrl && canvasRef.current) {
      try {
        dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.9);
      } catch {
        // ignore
      }
    }

    if (!dataUrl) {
      // Direct snapshot URL fallback if configured
      if (config.snapshotUrl) {
        dataUrl = config.snapshotUrl;
      } else {
        return;
      }
    }

    const newSnap: SnapshotItem = {
      id: `snap-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      dataUrl,
      label: `Front Door • ${new Date().toLocaleDateString()}`,
    };
    const updated = [newSnap, ...snapshots].slice(0, 12);
    setSnapshots(updated);
    try {
      localStorage.setItem('chorequest_aqara_snapshots', JSON.stringify(updated));
    } catch {
      // quota exceeded fallback
    }
  }, [snapshots, config.snapshotUrl]);

  // Two-way voice intercom broadcast
  const handleBroadcastMessage = useCallback((messageText: string) => {
    sound.playIntercomBeep();
    setIsTalking(true);
    setIntercomStatusText(`Broadcasting: "${messageText}"`);

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(messageText);
        utterance.rate = 1.0;
        utterance.pitch = 1.1;
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

  // Save RTSP / Proxy camera configuration
  const handleSaveConfig = () => {
    const trimmedRtsp = editRtspUrl.trim();
    let trimmedProxy = editProxyUrl.trim();
    const trimmedSnapshot = editSnapshotUrl.trim();

    // Auto-normalize go2rtc WebRTC stream URL to append &muted=1 for Safari / iPadOS autoplay
    if (trimmedProxy.includes('stream.html') && trimmedProxy.includes('mode=webrtc') && !trimmedProxy.includes('muted=')) {
      const sep = trimmedProxy.includes('?') ? '&' : '?';
      trimmedProxy = `${trimmedProxy}${sep}muted=1`;
    }

    const updatedConfig: AqaraCameraConfig = {
      enabled: true,
      cameraName: editCameraName.trim() || 'Aqara G400 Smart Cam',
      location: 'Front Door',
      rtspUrl: trimmedRtsp,
      proxyUrl: trimmedProxy,
      snapshotUrl: trimmedSnapshot,
      motionAlertsEnabled: editMotionAlerts,
      chimeSoundEnabled: true,
      nightVisionMode: isNightVision ? 'on' : 'auto',
      streamQuality: '1080p',
    };

    // 1. Immediately persist to localStorage (both primary and legacy keys)
    try {
      const payload = JSON.stringify(updatedConfig);
      localStorage.setItem('chorequest_aqara_camera_config', payload);
      localStorage.setItem('kidcoin_aqara_camera_config_v1', payload);
    } catch (err) {
      console.warn('Failed to save to localStorage:', err);
    }

    // 2. Update local state in modal immediately
    setConfig(updatedConfig);
    setEditProxyUrl(trimmedProxy);
    setIsDemoModeActive(false); // When saved, always prioritize the user's real stream
    setStreamError(null);
    setIsStreamLoading(Boolean(trimmedProxy || (trimmedRtsp && trimmedRtsp.startsWith('http'))));
    setStreamKey((prev) => prev + 1);

    // 3. Persist to parent database and server
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
    }, 1000);
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
                  {config.cameraName || 'Aqara G400 Smart Cam'}
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[10px] font-black tracking-wide flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {shouldRenderDemoCanvas ? 'SIMULATED DEMO' : 'LIVE FEED'}
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-bold">
                  1080p HD • 30fps
                </span>
              </div>
              <p className="text-xs text-slate-400 font-semibold flex items-center gap-2">
                <span className="text-slate-300">Front Door</span>
                <span className="text-slate-600">•</span>
                <span className="font-mono text-[11px] text-emerald-400/90">{timecode}</span>
              </p>
            </div>
          </div>

          {/* Quick Header Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Front Door Badge (No dropdown needed - Front door only) */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/90 border border-slate-700/80 text-slate-200 text-xs font-bold shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>Front Door</span>
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

            {/* Reconnect / Reload Stream */}
            {effectiveStreamUrl && !shouldRenderDemoCanvas && (
              <button
                onClick={() => {
                  sound.playTap();
                  setStreamError(null);
                  setIsStreamLoading(true);
                  setStreamKey((k) => k + 1);
                }}
                className="p-2 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
                title="Reconnect / Reload Stream"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}

            {/* Camera Settings / Setup */}
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
        <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden min-h-[340px] sm:min-h-[480px]">
          {/* 1. ACTUAL LIVE STREAM RENDERING */}
          {!shouldRenderDemoCanvas && effectiveStreamUrl && (
            <div
              className="w-full h-full relative flex items-center justify-center overflow-hidden bg-black"
              style={{
                transform: `scale(${zoomLevel})`,
                transformOrigin: 'center center',
                transition: 'transform 0.25s ease-out',
              }}
            >
              {/* IFRAME Stream for go2rtc / WebRTC stream.html */}
              {streamType === 'iframe' && (
                <iframe
                  ref={iframeRef}
                  key={`stream-iframe-${streamKey}`}
                  src={effectiveStreamUrl}
                  title="Aqara G400 Live Stream"
                  className="w-full h-full min-h-[340px] sm:min-h-[480px] border-0"
                  allow="autoplay; camera; microphone; fullscreen; picture-in-picture"
                  sandbox="allow-same-origin allow-scripts allow-forms allow-presentation allow-popups"
                  onLoad={() => {
                    setIsStreamLoading(false);
                    setStreamError(null);
                  }}
                  onError={() => {
                    setIsStreamLoading(false);
                    setStreamError('Unable to load go2rtc WebRTC stream frame. Check network connection.');
                  }}
                />
              )}

              {/* VIDEO Stream for MP4, MSE, HLS */}
              {streamType === 'video' && (
                <video
                  ref={videoRef}
                  key={`stream-video-${streamKey}`}
                  src={effectiveStreamUrl}
                  autoPlay
                  playsInline
                  muted={isMuted}
                  controls={false}
                  className="w-full h-full object-contain pointer-events-auto"
                  onLoadedData={() => {
                    setIsStreamLoading(false);
                    setStreamError(null);
                  }}
                  onError={() => {
                    setIsStreamLoading(false);
                    setStreamError(`Video stream connection failed for ${effectiveStreamUrl}`);
                  }}
                />
              )}

              {/* IMAGE Stream for MJPEG */}
              {streamType === 'image' && (
                <img
                  key={`stream-img-${streamKey}`}
                  src={effectiveStreamUrl}
                  alt="Aqara Live Stream Feed"
                  className="w-full h-full object-contain"
                  onLoad={() => {
                    setIsStreamLoading(false);
                    setStreamError(null);
                  }}
                  onError={() => {
                    setIsStreamLoading(false);
                    setStreamError('MJPEG stream connection failed.');
                  }}
                />
              )}

              {/* Stream Loading Spinner */}
              {isStreamLoading && !streamError && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center gap-3 z-10 pointer-events-none">
                  <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-400 rounded-full animate-spin" />
                  <p className="text-xs font-bold text-slate-200">Connecting to Aqara G400 Stream...</p>
                </div>
              )}
            </div>
          )}

          {/* 2. DIRECT RTSP NOTICE (When only raw rtsp:// is provided without proxy) */}
          {!shouldRenderDemoCanvas && !effectiveStreamUrl && streamType === 'raw_rtsp' && (
            <div className="max-w-lg p-6 rounded-3xl bg-slate-900/90 border border-slate-700 text-center flex flex-col items-center gap-4 m-4 z-20">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <AlertCircle className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">Browser Proxy Required for RTSP</h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Direct <code className="text-emerald-400 font-mono">rtsp://</code> streams cannot be rendered natively inside HTML browsers without a stream bridge.
                </p>
                <div className="mt-3 p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-left font-mono text-[11px] text-slate-300 break-all">
                  Configured: {config.rtspUrl}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap justify-center">
                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black cursor-pointer shadow-md"
                >
                  Add go2rtc Proxy URL
                </button>
                <button
                  onClick={() => setIsDemoModeActive(true)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold cursor-pointer"
                >
                  View Simulated Demo
                </button>
              </div>
            </div>
          )}

          {/* 3. STREAM UNAVAILABLE ERROR OVERLAY */}
          {streamError && !shouldRenderDemoCanvas && (
            <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-30 animate-fade-in">
              <div className="w-14 h-14 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 mb-3">
                <AlertCircle className="w-7 h-7" />
              </div>
              <h3 className="text-base font-black text-white">Stream Unavailable</h3>
              <p className="text-xs text-slate-300 max-w-md mt-1 mb-2">
                Could not establish a connection to your camera stream gateway.
              </p>
              <div className="p-2.5 rounded-xl bg-black/70 border border-rose-500/30 text-emerald-400 font-mono text-xs max-w-lg truncate mb-4 select-text">
                {effectiveStreamUrl}
              </div>

              <div className="flex items-center gap-2 flex-wrap justify-center">
                <button
                  onClick={() => {
                    setStreamError(null);
                    setIsStreamLoading(true);
                    setStreamKey((k) => k + 1);
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-lg active:scale-95"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retry Connection</span>
                </button>

                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-lg active:scale-95"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Configure Settings</span>
                </button>

                {effectiveStreamUrl && (
                  <a
                    href={effectiveStreamUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open in New Tab</span>
                  </a>
                )}

                <button
                  onClick={() => setIsDemoModeActive(true)}
                  className="px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
                >
                  Switch to Demo Feed
                </button>
              </div>

              <div className="mt-4 text-[11px] text-slate-400 max-w-md text-left bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                <span className="font-bold text-slate-200">Troubleshooting Tips:</span>
                <ul className="list-disc list-inside mt-1 space-y-0.5">
                  <li>Verify go2rtc is active on your local network (e.g. <code>http://192.168.50.X:1984</code>).</li>
                  <li>If accessing via HTTPS, browser security blocks HTTP (Mixed Content). Use HTTP or an SSL proxy for go2rtc.</li>
                  <li>Click &quot;Open in New Tab&quot; above to verify the go2rtc web player directly.</li>
                </ul>
              </div>
            </div>
          )}

          {/* 4. SIMULATED DEMO CANVAS (Only rendered when demo mode is active or no URL configured) */}
          {shouldRenderDemoCanvas && (
            <div className="relative w-full h-full flex items-center justify-center">
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

              {/* Demo Mode Notice Badge */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-500/50 text-indigo-200 text-xs font-bold shadow-lg">
                <Tv className="w-3.5 h-3.5 text-indigo-400" />
                <span>Simulated Front Door Preview</span>
                {effectiveStreamUrl && (
                  <button
                    onClick={() => {
                      setIsDemoModeActive(false);
                      setStreamError(null);
                      setStreamKey((k) => k + 1);
                    }}
                    className="ml-2 px-2 py-0.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black cursor-pointer"
                  >
                    Switch to Live Stream
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ON-SCREEN DISPLAY (OSD) OVERLAYS */}
          {/* Top Left: Camera Branding & Protocol */}
          <div className="absolute top-4 left-4 flex flex-col gap-1 pointer-events-none z-20">
            <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-white font-mono text-[11px] shadow-lg">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-black text-emerald-300">AQARA G400</span>
              <span className="text-white/40">|</span>
              <span>FRONT DOOR</span>
            </div>
            <div className="px-2.5 py-0.5 rounded-lg bg-black/40 text-[10px] text-white/70 font-mono">
              {!shouldRenderDemoCanvas && streamType === 'iframe'
                ? 'WebRTC Stream • 1080p'
                : !shouldRenderDemoCanvas && streamType === 'video'
                ? 'MSE / MP4 Stream • 1080p'
                : `${streamBitrate} • ${fps} FPS • H.264`}
            </div>
          </div>

          {/* Top Right: Live Clock & Wi-Fi */}
          <div className="absolute top-4 right-4 flex items-center gap-2 pointer-events-none z-20">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-white font-mono text-[11px] shadow-lg">
              <Wifi className="w-3.5 h-3.5 text-emerald-400" />
              <span>Wi-Fi 98%</span>
            </div>
            <div className="px-3 py-1 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-emerald-400 font-mono text-[11px] font-bold shadow-lg">
              {timecode}
            </div>
          </div>

          {/* Bottom Left: Motion & Sensor Status */}
          <div className="absolute bottom-4 left-4 flex items-center gap-2 pointer-events-none z-20">
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
          <div className="absolute bottom-4 right-4 flex items-center gap-1.5 z-20">
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
              title="Capture Photo Snapshot"
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
                  handleBroadcastMessage('Attention: Checking in on the front door camera!');
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

          {/* Right Quick Intercom Messages */}
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
          <div className="p-5 bg-slate-900/95 border-t border-slate-700 overflow-y-auto max-h-[380px] animate-slide-down shrink-0">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-black text-white">Aqara G400 RTSP & Stream Proxy Setup</h3>
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
                  style={{ backgroundColor: '#1e293b', color: '#ffffff', WebkitTextFillColor: '#ffffff' }}
                  className="w-full !bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs !text-white placeholder:text-slate-500 focus:outline-hidden focus:border-indigo-500 font-medium transition-colors shadow-inner"
                />
              </div>

              {/* WebRTC / MSE / go2rtc Stream URL (PRIMARY RECOMMENDED FOR BROWSER) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-emerald-400">
                    go2rtc WebRTC / Stream Proxy URL (Recommended)
                  </label>
                  <span className="text-[10px] text-emerald-300 bg-emerald-950/80 border border-emerald-500/40 px-1.5 py-0.2 rounded-md">
                    Web Player
                  </span>
                </div>
                <input
                  type="text"
                  value={editProxyUrl}
                  onChange={(e) => setEditProxyUrl(e.target.value)}
                  placeholder="http://192.168.50.X:1984/stream.html?src=aqara&mode=webrtc&muted=1"
                  style={{ backgroundColor: '#1e293b', color: '#6ee7b7', WebkitTextFillColor: '#6ee7b7' }}
                  className="w-full !bg-slate-800 border border-emerald-500/60 rounded-xl px-3.5 py-2.5 text-xs !text-emerald-300 font-mono placeholder:text-slate-500 focus:outline-hidden focus:border-emerald-400 transition-colors shadow-inner"
                />
                <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                  <span className="text-[10px] font-semibold text-slate-400">Presets:</span>
                  <button
                    type="button"
                    onClick={() => {
                      const hostMatch = editProxyUrl.match(/https?:\/\/[^/]+/);
                      const base = hostMatch ? hostMatch[0] : 'http://192.168.50.X:1984';
                      setEditProxyUrl(`${base}/stream.html?src=aqara&mode=webrtc&muted=1`);
                    }}
                    className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-200 px-2 py-0.5 rounded-md border border-slate-700 cursor-pointer font-medium active:scale-95 transition-all"
                  >
                    stream.html (WebRTC)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const hostMatch = editProxyUrl.match(/https?:\/\/[^/]+/);
                      const base = hostMatch ? hostMatch[0] : 'http://192.168.50.X:1984';
                      setEditProxyUrl(`${base}/api/stream.mjpeg?src=aqara`);
                    }}
                    className="text-[10px] bg-slate-800 hover:bg-slate-700 text-amber-300 px-2 py-0.5 rounded-md border border-amber-500/40 cursor-pointer font-medium active:scale-95 transition-all"
                  >
                    stream.mjpeg (MJPEG)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const hostMatch = editProxyUrl.match(/https?:\/\/[^/]+/);
                      const base = hostMatch ? hostMatch[0] : 'http://192.168.50.X:1984';
                      setEditProxyUrl(`${base}/api/stream.mp4?src=aqara`);
                    }}
                    className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-200 px-2 py-0.5 rounded-md border border-slate-700 cursor-pointer font-medium active:scale-95 transition-all"
                  >
                    api/stream.mp4 (MSE)
                  </button>
                </div>
              </div>

              {/* Direct RTSP Stream URL */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Direct Aqara G400 RTSP URL
                </label>
                <input
                  type="text"
                  value={editRtspUrl}
                  onChange={(e) => setEditRtspUrl(e.target.value)}
                  placeholder="rtsp://admin:password@192.168.50.X:554/live/ch0"
                  style={{ backgroundColor: '#1e293b', color: '#ffffff', WebkitTextFillColor: '#ffffff' }}
                  className="w-full !bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs !text-white font-mono placeholder:text-slate-500 focus:outline-hidden focus:border-indigo-500 transition-colors shadow-inner"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Accepts <code className="text-emerald-300">rtsp://</code>, <code className="text-emerald-300">rtsps://</code>, <code className="text-emerald-300">ws://</code>, <code className="text-emerald-300">http://</code>, or local IPs.
                </span>
              </div>

              {/* Direct Snapshot URL */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Optional Direct Snapshot URL
                </label>
                <input
                  type="text"
                  value={editSnapshotUrl}
                  onChange={(e) => setEditSnapshotUrl(e.target.value)}
                  placeholder="http://192.168.50.X:1984/api/frame.jpeg?src=aqara"
                  style={{ backgroundColor: '#1e293b', color: '#ffffff', WebkitTextFillColor: '#ffffff' }}
                  className="w-full !bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs !text-white font-mono placeholder:text-slate-500 focus:outline-hidden focus:border-indigo-500 transition-colors shadow-inner"
                />
              </div>
            </div>

            {/* Smart Detection & Info */}
            <div className="mt-4 p-3 rounded-2xl bg-indigo-950/40 border border-indigo-800/60 flex items-start gap-3">
              <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-300 leading-relaxed">
                <span className="font-bold text-white">Aqara G400 + go2rtc Quick Setup:</span>
                <ol className="list-decimal list-inside mt-1 space-y-0.5 text-slate-400">
                  <li>In the <strong>Aqara Home app</strong> &rarr; camera settings &rarr; enable <strong>RTSP Stream</strong> and set a password.</li>
                  <li>In your local <strong>go2rtc</strong> server, add stream: <code className="text-emerald-300 font-mono text-[11px]">aqara: rtsp://user:pass@192.168.X.X:554/live/ch0</code></li>
                  <li>Paste your go2rtc stream URL above (e.g. <code className="text-emerald-300 font-mono text-[11px]">http://192.168.50.X:1984/stream.html?src=aqara&amp;mode=webrtc</code>) and tap Save.</li>
                </ol>
              </div>
            </div>

            {/* Save Buttons */}
            <div className="mt-4 flex items-center justify-between">
              <div>
                {effectiveStreamUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsDemoModeActive(!isDemoModeActive);
                      setIsSettingsOpen(false);
                    }}
                    className="text-xs text-indigo-300 hover:text-white underline cursor-pointer"
                  >
                    {isDemoModeActive ? '← Return to Live Stream' : 'Switch to Demo Canvas View'}
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
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
          </div>
        )}
      </div>
    </div>
  );
};
