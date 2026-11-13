/**
 * KioskClock — lock-screen style clock for the kiosk header:
 * big thin time, weekday/date, then small weather / camera / alert pills.
 */

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
  todayWeather,
  tempUnit = 'F',
  householdExpiringChoresCount,
  onOpenLiveCamera,
}) => {
  const [time, setTime] = useState<Date>(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center gap-4 flex-wrap">
      {/* Time */}
      <div className="text-left">
        <div className="text-[56px] font-extralight text-label tracking-[-0.04em] leading-none tabular-nums">
          {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
        <div className="text-[13px] font-medium text-label-secondary mt-1">
          {time.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
        </div>
      </div>

      {/* Divider */}
      <div className="h-9 w-px bg-separator" aria-hidden="true" />

      {/* Weather */}
      <div className="flex items-center gap-2">
        <span className="text-2xl leading-none">{WEATHER_CONDITIONS[todayWeather.condition]?.icon || '☀️'}</span>
        <div>
          <div className="text-[17px] font-semibold text-label leading-tight tabular-nums">
            {todayWeather.tempHigh}°{tempUnit}
          </div>
          <div className="text-[12px] text-label-secondary capitalize leading-tight">
            {todayWeather.condition.replace(/_/g, ' ')}
          </div>
        </div>
      </div>

      {/* Camera */}
      {onOpenLiveCamera && (
        <button
          id="btn-kiosk-aqara-camera-icon"
          type="button"
          onClick={(e) => { e.stopPropagation(); onOpenLiveCamera(); }}
          className="relative flex items-center justify-center w-11 h-11 rounded-full glass-mid transition-transform cursor-pointer active:scale-90"
          title="Live Camera Feed"
          aria-label="Live Camera Feed"
        >
          <Video className="w-[18px] h-[18px] text-label" />
          <span className="absolute top-0 right-0 live-dot" aria-hidden="true" />
        </button>
      )}

      {/* Expiring chores */}
      {householdExpiringChoresCount > 0 && (
        <div
          id="kiosk-header-expiring-alert"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-ios-orange/15 text-ios-orange text-[13px] font-semibold"
          title={`${householdExpiringChoresCount} mission${householdExpiringChoresCount > 1 ? 's are' : ' is'} nearing time window expiration!`}
        >
          <Hourglass className="w-3.5 h-3.5" />
          <span>{householdExpiringChoresCount} ending soon</span>
        </div>
      )}
    </div>
  );
});
