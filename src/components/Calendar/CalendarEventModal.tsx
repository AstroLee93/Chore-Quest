import React, { useState, useEffect } from 'react';
import { X, Calendar as CalendarIcon, Clock, MapPin, Sparkles, CloudSun, AlertCircle } from 'lucide-react';
import { CalendarEvent, CalendarEventCategory, KidProfile, WeatherCondition } from '../../types';
import { EVENT_CATEGORIES, WEATHER_CONDITIONS } from '../../utils/calendar';
import { sound } from '../../utils/sound';

interface CalendarEventModalProps {
  isOpen: boolean;
  event: Partial<CalendarEvent> | null;
  kids: KidProfile[];
  initialDate?: string;
  onSave: (event: CalendarEvent) => void;
  onDelete?: (eventId: string) => void;
  onClose: () => void;
}

export const CalendarEventModal: React.FC<CalendarEventModalProps> = ({
  isOpen,
  event,
  kids,
  initialDate,
  onSave,
  onDelete,
  onClose,
}) => {
  const [formData, setFormData] = useState<Partial<CalendarEvent>>({
    title: '',
    description: '',
    date: initialDate || new Date().toISOString().split('T')[0],
    time: '15:30',
    endTime: '16:30',
    category: 'practice',
    assignedKidIds: ['all'],
    location: '',
    color: '#10b981',
    icon: '⚽',
    weatherNote: '',
    weatherIcon: undefined,
    isImportant: false,
  });

  const [validationError, setValidationError] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      if (event && (event.id || event.title)) {
        setFormData({
          title: event.title || '',
          description: event.description || '',
          date: event.date || initialDate || new Date().toISOString().split('T')[0],
          time: event.time || '15:30',
          endTime: event.endTime || '',
          category: event.category || 'practice',
          assignedKidIds: event.assignedKidIds && event.assignedKidIds.length > 0 ? event.assignedKidIds : ['all'],
          location: event.location || '',
          color: event.color || EVENT_CATEGORIES[event.category || 'practice']?.color || '#10b981',
          icon: event.icon || EVENT_CATEGORIES[event.category || 'practice']?.icon || '⭐',
          weatherNote: event.weatherNote || '',
          weatherIcon: event.weatherIcon,
          isImportant: event.isImportant || false,
          id: event.id,
        });
      } else {
        setFormData({
          title: '',
          description: '',
          date: event?.date || initialDate || new Date().toISOString().split('T')[0],
          time: '15:30',
          endTime: '16:30',
          category: 'practice',
          assignedKidIds: ['all'],
          location: '',
          color: EVENT_CATEGORIES.practice.color,
          icon: EVENT_CATEGORIES.practice.icon,
          weatherNote: '',
          weatherIcon: undefined,
          isImportant: false,
        });
      }
      setValidationError('');
    }
  }, [isOpen, event?.id, event?.date, initialDate]);

  if (!isOpen) return null;

  const handleCategoryChange = (cat: CalendarEventCategory) => {
    sound.playTap();
    const meta = EVENT_CATEGORIES[cat];
    setFormData((prev) => ({
      ...prev,
      category: cat,
      color: meta.color,
      icon: meta.icon,
    }));
  };

  const handleToggleKid = (kidId: string) => {
    sound.playTap();
    setFormData((prev) => {
      let current = prev.assignedKidIds || ['all'];
      if (kidId === 'all') {
        return { ...prev, assignedKidIds: ['all'] };
      }
      // If 'all' was selected, switch to just this kid
      if (current.includes('all')) {
        return { ...prev, assignedKidIds: [kidId] };
      }
      if (current.includes(kidId)) {
        const next = current.filter((id) => id !== kidId);
        return { ...prev, assignedKidIds: next.length === 0 ? ['all'] : next };
      } else {
        return { ...prev, assignedKidIds: [...current, kidId] };
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title?.trim()) {
      setValidationError('Please enter a title for the event or activity.');
      sound.playFail();
      return;
    }
    if (!formData.date) {
      setValidationError('Please select a date.');
      sound.playFail();
      return;
    }

    sound.playComplete();
    const finalEvent: CalendarEvent = {
      id: formData.id || `evt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: formData.title.trim(),
      description: formData.description?.trim() || '',
      date: formData.date,
      time: formData.time || '',
      endTime: formData.endTime || '',
      category: (formData.category as CalendarEventCategory) || 'practice',
      assignedKidIds: formData.assignedKidIds && formData.assignedKidIds.length > 0 ? formData.assignedKidIds : ['all'],
      location: formData.location?.trim() || '',
      color: formData.color || '#10b981',
      icon: formData.icon || '⭐',
      weatherNote: formData.weatherNote?.trim() || '',
      weatherIcon: formData.weatherIcon,
      isImportant: Boolean(formData.isImportant),
    };

    onSave(finalEvent);
  };

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-70 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-yellow-50 rounded-[2.5rem] p-5 sm:p-7 max-w-xl w-full shadow-2xl border-4 border-yellow-300 max-h-[92vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-yellow-200/80 mb-4">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl sm:text-3xl p-2 bg-yellow-200 rounded-2xl border border-yellow-300">
              {formData.icon || '📅'}
            </span>
            <div>
              <h3 className="font-black text-lg sm:text-xl text-slate-800 italic">
                {formData.id ? 'Edit Calendar Event' : 'Schedule Event / Important Activity'}
              </h3>
              <p className="text-xs text-slate-500 font-bold">
                Add practices, projects, field trips, & milestones
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

        {validationError && (
          <div className="mb-4 p-3 bg-red-100 border-2 border-red-300 text-red-800 rounded-2xl text-xs font-black flex items-center gap-2 animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{validationError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Category Picker */}
          <div>
            <label className="block text-xs font-black text-slate-700 uppercase tracking-wide mb-1.5">
              Event Category / Activity Type:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(Object.keys(EVENT_CATEGORIES) as CalendarEventCategory[]).map((catKey) => {
                const meta = EVENT_CATEGORIES[catKey];
                const isSelected = formData.category === catKey;
                return (
                  <button
                    key={catKey}
                    type="button"
                    onClick={() => handleCategoryChange(catKey)}
                    className={`p-2 rounded-2xl border-2 text-left flex items-center gap-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-900 text-white border-indigo-950 shadow-md scale-102'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-yellow-100/50'
                    }`}
                  >
                    <span className="text-lg shrink-0">{meta.icon}</span>
                    <span className="text-xs font-black truncate">{meta.shortLabel}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-black text-slate-700 uppercase tracking-wide mb-1">
              Event Title:
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Leo Soccer Practice vs Tigers, Science Project Due"
              value={formData.title || ''}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2.5 rounded-2xl border-2 border-slate-200 bg-white font-black text-sm text-slate-800 focus:outline-indigo-500 shadow-2xs"
            />
          </div>

          {/* Date and Times */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wide mb-1">
                Date:
              </label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={formData.date || ''}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 rounded-2xl border-2 border-slate-200 bg-white text-xs font-black text-slate-800 focus:outline-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wide mb-1">
                Start Time:
              </label>
              <div className="relative">
                <input
                  type="time"
                  value={formData.time || ''}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="w-full px-3 py-2 rounded-2xl border-2 border-slate-200 bg-white text-xs font-black text-slate-800 focus:outline-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wide mb-1">
                End Time (Opt):
              </label>
              <div className="relative">
                <input
                  type="time"
                  value={formData.endTime || ''}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="w-full px-3 py-2 rounded-2xl border-2 border-slate-200 bg-white text-xs font-black text-slate-800 focus:outline-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Assigned Kids */}
          <div>
            <label className="block text-xs font-black text-slate-700 uppercase tracking-wide mb-1.5">
              Assigned Kid(s) / Family:
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleToggleKid('all')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black border-2 cursor-pointer transition-all ${
                  formData.assignedKidIds?.includes('all')
                    ? 'bg-indigo-900 text-white border-indigo-900 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                Entire Family / All Kids
              </button>
              {kids.map((kid) => {
                const isAssigned =
                  !formData.assignedKidIds?.includes('all') &&
                  formData.assignedKidIds?.includes(kid.id);
                return (
                  <button
                    key={kid.id}
                    type="button"
                    onClick={() => handleToggleKid(kid.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-black border-2 flex items-center gap-1.5 cursor-pointer transition-all ${
                      isAssigned
                        ? 'bg-indigo-900 text-white border-indigo-900 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span>{kid.avatar}</span>
                    <span>{kid.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Location & Icon */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wide mb-1">
                Location / Venue (Optional):
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. Park Field #3, School Auditorium, Room 102"
                  value={formData.location || ''}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-2 rounded-2xl border-2 border-slate-200 bg-white text-xs font-bold text-slate-800 focus:outline-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wide mb-1">
                Custom Emoji:
              </label>
              <input
                type="text"
                maxLength={4}
                value={formData.icon || '⭐'}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                className="w-full px-3 py-2 rounded-2xl border-2 border-slate-200 bg-white text-center text-lg font-black"
              />
            </div>
          </div>

          {/* Weather Note & Tip */}
          <div className="bg-amber-100/70 p-3.5 rounded-2xl border-2 border-amber-200">
            <label className="block text-xs font-black text-amber-900 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
              <CloudSun className="w-4 h-4 text-amber-600" />
              Weather Highlight / Preparation Note:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2">
              <div>
                <select
                  value={formData.weatherIcon || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      weatherIcon: (e.target.value as WeatherCondition) || undefined,
                    })
                  }
                  className="w-full px-2.5 py-1.5 rounded-xl border border-amber-300 bg-white text-xs font-bold text-slate-800"
                >
                  <option value="">Auto-detected Season</option>
                  {(Object.keys(WEATHER_CONDITIONS) as WeatherCondition[]).map((condKey) => (
                    <option key={condKey} value={condKey}>
                      {WEATHER_CONDITIONS[condKey].icon} {WEATHER_CONDITIONS[condKey].label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <input
                  type="text"
                  placeholder="e.g. Rain expected—pack umbrella & raincoat ☔"
                  value={formData.weatherNote || ''}
                  onChange={(e) => setFormData({ ...formData, weatherNote: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-xl border border-amber-300 bg-white text-xs font-semibold text-slate-800 focus:outline-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Description & Details */}
          <div>
            <label className="block text-xs font-black text-slate-700 uppercase tracking-wide mb-1">
              Instructions / Notes & Things to Bring:
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Wear cleats, bring water bottle & shin guards. Project board due at 9 AM."
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-2xl border-2 border-slate-200 bg-white text-xs font-bold text-slate-800 focus:outline-indigo-500 resize-none shadow-2xs"
            />
          </div>

          {/* Priority Star Flag */}
          <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-yellow-200/60 border-2 border-yellow-300">
            <input
              type="checkbox"
              id="isImportant"
              checked={formData.isImportant || false}
              onChange={(e) => setFormData({ ...formData, isImportant: e.target.checked })}
              className="w-4 h-4 text-indigo-600 rounded-md focus:ring-indigo-500 cursor-pointer"
            />
            <label htmlFor="isImportant" className="text-xs font-black text-slate-800 cursor-pointer">
              ⭐ Mark as Important / Highlighted Event on Calendar
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-3">
            {formData.id && onDelete && (
              <button
                type="button"
                onClick={() => {
                  sound.playTap();
                  if (confirm('Delete this calendar event?')) {
                    onDelete(formData.id!);
                  }
                }}
                className="px-4 py-3 rounded-2xl bg-red-100 hover:bg-red-200 text-red-800 font-black text-xs border-2 border-red-300 transition-colors cursor-pointer"
              >
                Delete
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                sound.playTap();
                onClose();
              }}
              className="flex-1 py-3 rounded-2xl border-2 border-slate-200 bg-white font-black text-xs text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="flex-1 py-3 rounded-2xl bg-indigo-900 hover:bg-indigo-800 text-white font-black text-xs shadow-md active:scale-95 transition-all cursor-pointer"
            >
              {formData.id ? 'Save Changes' : 'Add to Calendar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
