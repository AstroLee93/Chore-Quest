import React, { useState } from 'react';
import { X, CloudSun, Sparkles, Thermometer } from 'lucide-react';
import { DayWeather, WeatherCondition } from '../../types';
import { WEATHER_CONDITIONS } from '../../utils/calendar';
import { formatDateDisplay } from '../../utils/storage';
import { sound } from '../../utils/sound';

interface WeatherModalProps {
  isOpen: boolean;
  dateStr: string;
  initialWeather: DayWeather;
  tempUnit?: 'F' | 'C';
  onSave: (dateStr: string, weather: DayWeather) => void;
  onReset: (dateStr: string) => void;
  onClose: () => void;
}

export const WeatherModal: React.FC<WeatherModalProps> = ({
  isOpen,
  dateStr,
  initialWeather,
  tempUnit = 'F',
  onSave,
  onReset,
  onClose,
}) => {
  const [condition, setCondition] = useState<WeatherCondition>(initialWeather.condition || 'sunny');
  const [tempHigh, setTempHigh] = useState<number>(initialWeather.tempHigh || 75);
  const [tempLow, setTempLow] = useState<number>(initialWeather.tempLow || 58);
  const [note, setNote] = useState<string>(initialWeather.note || '');

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playComplete();
    onSave(dateStr, {
      condition,
      tempHigh: Number(tempHigh),
      tempLow: Number(tempLow),
      note: note.trim() || undefined,
      source: 'custom',
    });
  };

  const selectedMeta = WEATHER_CONDITIONS[condition];

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-yellow-50 rounded-[2.5rem] p-5 sm:p-7 max-w-md w-full shadow-2xl border-4 border-yellow-300">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-yellow-200/80 mb-4">
          <div className="flex items-center gap-2.5">
            <span className="text-3xl p-2 bg-yellow-200 rounded-2xl border border-yellow-300">
              {selectedMeta?.icon || '⛅'}
            </span>
            <div>
              <h3 className="font-black text-lg sm:text-xl text-slate-800 italic">
                Daily Weather Forecast
              </h3>
              <p className="text-xs text-slate-600 font-bold">
                {dateStr}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playTap();
              onClose();
            }}
            className="w-9 h-9 rounded-xl bg-white border-2 border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          {/* Weather Condition Select */}
          <div>
            <label className="block text-xs font-black text-slate-700 uppercase tracking-wide mb-1.5">
              Select Sky Condition:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(WEATHER_CONDITIONS) as WeatherCondition[]).map((condKey) => {
                const meta = WEATHER_CONDITIONS[condKey];
                const isSelected = condition === condKey;
                return (
                  <button
                    key={condKey}
                    type="button"
                    onClick={() => {
                      sound.playTap();
                      setCondition(condKey);
                    }}
                    className={`p-2.5 rounded-2xl border-2 text-left flex items-center gap-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-900 text-white border-indigo-950 shadow-md scale-102'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-yellow-100/50'
                    }`}
                  >
                    <span className="text-xl shrink-0">{meta.icon}</span>
                    <span className="text-xs font-black truncate">{meta.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* High / Low Temperature */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wide mb-1">
                High Temp (°{tempUnit}):
              </label>
              <input
                type="number"
                value={tempHigh}
                onChange={(e) => setTempHigh(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-2xl border-2 border-slate-200 bg-white font-black text-sm text-slate-800 text-center"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wide mb-1">
                Low Temp (°{tempUnit}):
              </label>
              <input
                type="number"
                value={tempLow}
                onChange={(e) => setTempLow(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-2xl border-2 border-slate-200 bg-white font-black text-sm text-slate-800 text-center"
              />
            </div>
          </div>

          {/* Special Advice / Notes */}
          <div>
            <label className="block text-xs font-black text-slate-700 uppercase tracking-wide mb-1">
              Custom Weather Note / Reminder:
            </label>
            <input
              type="text"
              placeholder={selectedMeta?.tip || 'e.g. Rain expected in afternoon, pack umbrella'}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl border-2 border-slate-200 bg-white font-semibold text-xs text-slate-800 focus:outline-indigo-500"
            />
          </div>

          {/* Quick Tip Pill */}
          {selectedMeta && (
            <div className={`p-3 rounded-2xl border-2 ${selectedMeta.bgClass}`}>
              <p className={`text-xs font-bold ${selectedMeta.textClass}`}>
                💡 <strong>Suggested Tip:</strong> {selectedMeta.tip}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                sound.playTap();
                onReset(dateStr);
              }}
              className="px-3 py-2.5 rounded-2xl border-2 border-slate-200 bg-white font-bold text-xs text-slate-600 hover:bg-slate-50 cursor-pointer"
              title="Reset to seasonal average"
            >
              Reset Auto
            </button>

            <button
              type="button"
              onClick={() => {
                sound.playTap();
                onClose();
              }}
              className="flex-1 py-2.5 rounded-2xl border-2 border-slate-200 bg-white font-black text-xs text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="flex-1 py-2.5 rounded-2xl bg-indigo-900 hover:bg-indigo-800 text-white font-black text-xs shadow-md active:scale-95 cursor-pointer"
            >
              Save Forecast
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
