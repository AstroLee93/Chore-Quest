import React, { useState, useEffect } from 'react';
import { Hourglass, Video } from 'lucide-react';
import { WEATHER_CONDITIONS } from '../utils/calendar';
import { DayWeather } from '../types';
import { AppThemeConfig } from '../utils/theme';

interface KioskClockProps {
  theme: AppThemeConfig;
  todayWeather: DayWeather;
  tempUnit?: 'F' | 'C';
  householdExpiringChoresCount: number;
  onOpenLiveCamera?: () => void;
}

export const KioskClock: React.FC<KioskClockProps> = React.memo(({
  theme,
  todayWeather,
  tempUnit = 'F',
  householdExpiringChoresCount,
  onOpenLiveCamera,
}) => {
  const [time, setTime] = useState<Date>(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className={`flex items-center gap-3 sm:gap-5 px-4 sm:px-5 py-2.5 rounded-2xl ${theme.kioskClockBg} self-stretch sm:self-auto justify-center flex-wrap`}>
      <div className="text-left">
        <div className={`text-2xl sm:text-3xl font-black tracking-tight font-mono ${theme.kioskClockText}`}>
          {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </div>
        <div className="text-[11px] font-bold opacity-80 text-white">
          {time.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
        </div>
      </div>

      <div className="h-8 w-px bg-white/20" />

      {/* Live Weather */}
      <div className="flex items-center gap-2">
        <span className="text-2xl">{WEATHER_CONDITIONS[todayWeather.condition]?.icon || '☀️'}</span>
        <div>
          <div className="text-sm font-black text-white">
            {todayWeather.tempHigh}°{tempUnit}
          </div>
          <div className="text-[10px] font-semibold opacity-80 text-white capitalize">
            {todayWeather.condition.replace('_', ' ')}
          </div>
        </div>
      </div>

      {/* Standalone Video Camera Icon for Aqara G400 RTSP */}
      {onOpenLiveCamera && (
        <>
          <div className="h-8 w-px bg-white/20" />
          <button
            id="btn-kiosk-aqara-camera-icon"
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenLiveCamera();
            }}
            className="group relative flex items-center justify-center p-2 rounded-xl bg-white/10 hover:bg-emerald-500/25 border border-white/20 hover:border-emerald-400/60 text-white hover:text-emerald-200 transition-all cursor-pointer active:scale-95 shadow-xs"
            title="Aqara G400 Live Camera Feed (RTSP)"
            aria-label="Aqara G400 Live Camera Feed"
          >
            <Video className="w-5 h-5 text-emerald-300 group-hover:scale-110 transition-transform" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          </button>
        </>
      )}

      {/* Expiring Chores Live Household Indicator */}
      {householdExpiringChoresCount > 0 && (
        <>
          <div className="h-8 w-px bg-white/20 hidden sm:block" />
          <div
            id="kiosk-header-expiring-alert"
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/25 border border-amber-400/50 text-amber-200 text-xs font-black shadow-sm animate-pulse"
            title={`${householdExpiringChoresCount} mission${householdExpiringChoresCount > 1 ? 's are' : ' is'} nearing time window expiration!`}
          >
            <Hourglass className="w-3.5 h-3.5 text-amber-300" />
            <span>{householdExpiringChoresCount} Ending Soon!</span>
          </div>
        </>
      )}
    </div>
  );
});
