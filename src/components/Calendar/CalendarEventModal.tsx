import React, { useState, useEffect } from 'react';
import { X, Calendar as CalendarIcon, Clock, MapPin, Sparkles, CloudSun, AlertCircle, Smile, Palette, Trash2, Check } from 'lucide-react';
import { CalendarEvent, CalendarEventCategory, CustomCalendarCategory, KidProfile, WeatherCondition } from '../../types';
import {
  EVENT_CATEGORIES,
  CUSTOM_CATEGORY_COLORS,
  POPULAR_CUSTOM_CATEGORY_SUGGESTIONS,
  PopularCustomCategorySuggestion,
  WEATHER_CONDITIONS,
} from '../../utils/calendar';
import { sound } from '../../utils/sound';
import { EmojiPicker } from '../EmojiPicker';

interface CalendarEventModalProps {
  isOpen: boolean;
  event: Partial<CalendarEvent> | null;
  kids: KidProfile[];
  customCategories?: CustomCalendarCategory[];
  initialDate?: string;
  onSave: (event: CalendarEvent, saveAsCustomCategory?: boolean) => void;
  onDelete?: (eventId: string) => void;
  onDeleteCustomCategory?: (categoryId: string) => void;
  onClose: () => void;
}

export const CalendarEventModal: React.FC<CalendarEventModalProps> = ({
  isOpen,
  event,
  kids,
  customCategories = [],
  initialDate,
  onSave,
  onDelete,
  onDeleteCustomCategory,
  onClose,
}) => {
  const [formData, setFormData] = useState<Partial<CalendarEvent>>({
    title: '',
    description: '',
    date: initialDate || new Date().toISOString().split('T')[0],
    time: '15:30',
    endTime: '16:30',
    category: 'practice',
    customCategoryName: '',
    customCategoryIcon: '✨',
    customCategoryDescription: '',
    customCategoryColor: '#8b5cf6',
    assignedKidIds: ['all'],
    location: '',
    color: '#10b981',
    icon: '⚽',
    weatherNote: '',
    weatherIcon: undefined,
    isImportant: false,
  });

  const [saveCategoryForFuture, setSaveCategoryForFuture] = useState<boolean>(true);
  const [validationError, setValidationError] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      if (event && (event.id || event.title)) {
        const isCustom = event.category === 'custom' || Boolean(event.customCategoryName);
        const presetMeta = event.category && event.category !== 'custom' ? EVENT_CATEGORIES[event.category] : null;

        setFormData({
          title: event.title || '',
          description: event.description || '',
          date: event.date || initialDate || new Date().toISOString().split('T')[0],
          time: event.time || '15:30',
          endTime: event.endTime || '',
          category: isCustom ? 'custom' : (event.category || 'practice'),
          customCategoryName: event.customCategoryName || (isCustom ? event.title : ''),
          customCategoryIcon: event.customCategoryIcon || event.icon || '✨',
          customCategoryDescription: event.customCategoryDescription || '',
          customCategoryColor: event.customCategoryColor || event.color || '#8b5cf6',
          assignedKidIds: event.assignedKidIds && event.assignedKidIds.length > 0 ? event.assignedKidIds : ['all'],
          location: event.location || '',
          color: event.color || (isCustom ? (event.customCategoryColor || '#8b5cf6') : (presetMeta?.color || '#10b981')),
          icon: event.icon || (isCustom ? (event.customCategoryIcon || '✨') : (presetMeta?.icon || '⭐')),
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
          customCategoryName: '',
          customCategoryIcon: '🥋',
          customCategoryDescription: '',
          customCategoryColor: '#8b5cf6',
          assignedKidIds: ['all'],
          location: '',
          color: EVENT_CATEGORIES.practice.color,
          icon: EVENT_CATEGORIES.practice.icon,
          weatherNote: '',
          weatherIcon: undefined,
          isImportant: false,
        });
      }
      setSaveCategoryForFuture(true);
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

  const handleSelectCustomCategory = (savedCat: CustomCalendarCategory) => {
    sound.playTap();
    setFormData((prev) => ({
      ...prev,
      category: 'custom',
      customCategoryName: savedCat.name,
      customCategoryIcon: savedCat.icon,
      customCategoryDescription: savedCat.description || '',
      customCategoryColor: savedCat.color || '#8b5cf6',
      icon: savedCat.icon || prev.icon || '✨',
      color: savedCat.color || prev.color || '#8b5cf6',
    }));
  };

  const handleStartNewCustomCategory = () => {
    sound.playTap();
    setFormData((prev) => ({
      ...prev,
      category: 'custom',
      customCategoryName: prev.customCategoryName || '',
      customCategoryIcon: prev.customCategoryIcon || '✨',
      customCategoryDescription: prev.customCategoryDescription || '',
      customCategoryColor: prev.customCategoryColor || '#8b5cf6',
      icon: prev.customCategoryIcon || prev.icon || '✨',
      color: prev.customCategoryColor || '#8b5cf6',
    }));
  };

  const handleApplySuggestion = (sug: PopularCustomCategorySuggestion) => {
    sound.playPop();
    setFormData((prev) => ({
      ...prev,
      category: 'custom',
      customCategoryName: sug.name,
      customCategoryIcon: sug.icon,
      customCategoryDescription: sug.description,
      customCategoryColor: sug.color,
      icon: sug.icon,
      color: sug.color,
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

    const isCustomCat = formData.category === 'custom';
    if (isCustomCat && !formData.customCategoryName?.trim()) {
      setValidationError('Please enter a name for your Custom Event Category / Activity Type (e.g. Martial Arts, Piano Lessons), or choose a preset.');
      sound.playFail();
      return;
    }

    sound.playComplete();

    const customName = formData.customCategoryName?.trim();
    const customIcon = formData.customCategoryIcon || formData.icon || '✨';
    const customDesc = formData.customCategoryDescription?.trim();
    const customColor = formData.customCategoryColor || formData.color || '#8b5cf6';

    const finalEvent: CalendarEvent = {
      id: formData.id || `evt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: formData.title.trim(),
      description: formData.description?.trim() || '',
      date: formData.date,
      time: formData.time || '',
      endTime: formData.endTime || '',
      category: isCustomCat ? 'custom' : (formData.category as CalendarEventCategory) || 'practice',
      customCategoryName: isCustomCat ? customName : undefined,
      customCategoryIcon: isCustomCat ? customIcon : undefined,
      customCategoryDescription: isCustomCat ? customDesc : undefined,
      customCategoryColor: isCustomCat ? customColor : undefined,
      assignedKidIds: formData.assignedKidIds && formData.assignedKidIds.length > 0 ? formData.assignedKidIds : ['all'],
      location: formData.location?.trim() || '',
      color: isCustomCat ? customColor : (formData.color || '#10b981'),
      icon: isCustomCat ? (formData.icon || customIcon) : (formData.icon || '⭐'),
      weatherNote: formData.weatherNote?.trim() || '',
      weatherIcon: formData.weatherIcon,
      isImportant: Boolean(formData.isImportant),
    };

    onSave(finalEvent, isCustomCat && saveCategoryForFuture);
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
        className="bg-yellow-50 rounded-[2.5rem] p-5 sm:p-7 max-w-2xl w-full shadow-2xl border-4 border-yellow-300 max-h-[92vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-yellow-200/80 mb-4">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl sm:text-3xl p-2 bg-yellow-200 rounded-2xl border border-yellow-300">
              {formData.icon || (formData.category === 'custom' ? (formData.customCategoryIcon || '✨') : '📅')}
            </span>
            <div>
              <h3 className="font-black text-lg sm:text-xl text-slate-800 italic">
                {formData.id ? 'Edit Calendar Event' : 'Schedule Event / Important Activity'}
              </h3>
              <p className="text-xs text-slate-500 font-bold">
                Add practices, projects, field trips, custom lessons, & milestones
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
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wide">
                Event Category / Activity Type:
              </label>
              {formData.category === 'custom' && (
                <span className="text-[11px] font-black text-purple-800 bg-purple-100 px-2.5 py-0.5 rounded-full border border-purple-300 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-purple-600" />
                  <span>Custom Activity Mode</span>
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(Object.keys(EVENT_CATEGORIES) as CalendarEventCategory[])
                .filter((catKey) => catKey !== 'custom')
                .map((catKey) => {
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

              {/* Saved Custom Categories from Family */}
              {customCategories?.map((savedCat) => {
                const isSelected =
                  formData.category === 'custom' &&
                  formData.customCategoryName?.toLowerCase() === savedCat.name.toLowerCase();
                return (
                  <div key={savedCat.id} className="relative group">
                    <button
                      type="button"
                      onClick={() => handleSelectCustomCategory(savedCat)}
                      className={`w-full p-2 rounded-2xl border-2 text-left flex items-center gap-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-purple-900 text-white border-purple-950 shadow-md scale-102'
                          : 'bg-purple-50 text-purple-900 border-purple-200 hover:bg-purple-100'
                      }`}
                      title={savedCat.description || savedCat.name}
                    >
                      <span className="text-lg shrink-0">{savedCat.icon || '✨'}</span>
                      <span className="text-xs font-black truncate">{savedCat.name}</span>
                    </button>
                    {onDeleteCustomCategory && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Remove saved category "${savedCat.name}"?`)) {
                            onDeleteCustomCategory(savedCat.id);
                          }
                        }}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[10px] shadow-xs cursor-pointer"
                        title="Delete saved category"
                      >
                        ×
                      </button>
                    )}
                  </div>
                );
              })}

              {/* New Custom Category / Activity Button */}
              <button
                type="button"
                onClick={handleStartNewCustomCategory}
                className={`p-2 rounded-2xl border-2 text-left flex items-center gap-2 transition-all cursor-pointer ${
                  formData.category === 'custom' &&
                  !customCategories?.some(
                    (c) => c.name.toLowerCase() === formData.customCategoryName?.toLowerCase()
                  )
                    ? 'bg-purple-900 text-white border-purple-950 shadow-md scale-102'
                    : 'bg-purple-100/70 text-purple-900 border-dashed border-purple-300 hover:bg-purple-200/70'
                }`}
              >
                <span className="text-lg shrink-0">✨</span>
                <span className="text-xs font-black truncate">+ Custom Activity</span>
              </button>
            </div>
          </div>

          {/* Custom Category Details Panel: Icon, Description, Color, Name */}
          {formData.category === 'custom' && (
            <div className="p-4 rounded-3xl bg-purple-50/90 border-2 border-purple-300/80 space-y-3.5 animate-fade-in shadow-sm">
              <div className="flex items-center justify-between pb-2 border-b border-purple-200">
                <div className="flex items-center gap-2">
                  <span className="text-xl p-1 bg-purple-200/80 rounded-xl">
                    {formData.customCategoryIcon || '✨'}
                  </span>
                  <div>
                    <h4 className="text-xs font-black text-purple-950 uppercase tracking-wide flex items-center gap-1.5">
                      <span>Custom Activity Type & Category Setup</span>
                    </h4>
                    <p className="text-[11px] text-purple-700 font-semibold">
                      For activities not represented in standard presets (e.g. martial arts, music lessons, scouts, dance)
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Inspiration Chips */}
              <div>
                <div className="text-[11px] font-black text-purple-950 mb-1.5 flex items-center justify-between">
                  <span>Popular Non-Preset Activities:</span>
                  <span className="text-[10px] text-purple-600 font-bold italic">Click any to auto-fill icon & details</span>
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                  {POPULAR_CUSTOM_CATEGORY_SUGGESTIONS.map((sug) => (
                    <button
                      key={sug.name}
                      type="button"
                      onClick={() => handleApplySuggestion(sug)}
                      className="px-2.5 py-1 rounded-xl bg-white border border-purple-200 hover:border-purple-400 hover:bg-purple-100 text-slate-800 text-[11px] font-black flex items-center gap-1.5 cursor-pointer transition-all shadow-2xs active:scale-95"
                    >
                      <span>{sug.icon}</span>
                      <span>{sug.name.split('&')[0].trim()}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Category Name & Activity Type Icon */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-black text-purple-950 uppercase mb-1">
                    Custom Category / Activity Name: <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required={formData.category === 'custom'}
                    placeholder="e.g. Martial Arts / Karate, Piano Lessons, Swim Meet"
                    value={formData.customCategoryName || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData((prev) => ({
                        ...prev,
                        customCategoryName: val,
                      }));
                    }}
                    className="w-full px-3.5 py-2 rounded-2xl border-2 border-purple-300 bg-white text-xs font-black text-slate-800 focus:outline-purple-600 shadow-2xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black text-purple-950 uppercase mb-1">
                    Activity Type Icon:
                  </label>
                  <div className="flex items-center gap-2">
                    <EmojiPicker
                      value={formData.customCategoryIcon || formData.icon || '🥋'}
                      onChange={(emoji) => {
                        setFormData((prev) => ({
                          ...prev,
                          customCategoryIcon: emoji,
                          icon: emoji,
                        }));
                      }}
                      title="Custom Activity Icon"
                      categoryFilter="all"
                    />
                  </div>
                </div>
              </div>

              {/* Custom Category Description */}
              <div>
                <label className="block text-[11px] font-black text-purple-950 uppercase mb-1 flex items-center justify-between">
                  <span>Custom Activity Type Description & Guidelines:</span>
                  <span className="text-[10px] text-purple-600 font-bold">Explains what this activity represents</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dojo sparring, belt test preparation, kata forms. Bring clean uniform, mouthguard & water."
                  value={formData.customCategoryDescription || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      customCategoryDescription: e.target.value,
                    }))
                  }
                  className="w-full px-3.5 py-2 rounded-2xl border-2 border-purple-300 bg-white text-xs font-semibold text-slate-800 focus:outline-purple-600 shadow-2xs"
                />
              </div>

              {/* Color Accent & Live Badge Preview */}
              <div className="pt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <label className="block text-[10px] font-black text-purple-950 uppercase mb-1">
                    Badge Color Accent:
                  </label>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {CUSTOM_CATEGORY_COLORS.map((col) => {
                      const isSelected =
                        (formData.customCategoryColor || '#8b5cf6') === col.color ||
                        formData.customCategoryColor === col.id;
                      return (
                        <button
                          key={col.id}
                          type="button"
                          onClick={() => {
                            sound.playTap();
                            setFormData((prev) => ({
                              ...prev,
                              customCategoryColor: col.color,
                              color: col.color,
                            }));
                          }}
                          className={`w-6 h-6 rounded-full border-2 transition-all cursor-pointer ${
                            isSelected
                              ? 'ring-2 ring-purple-600 ring-offset-1 scale-115 border-white shadow-xs'
                              : 'border-transparent opacity-80 hover:opacity-100'
                          }`}
                          style={{ backgroundColor: col.color }}
                          title={col.name}
                        />
                      );
                    })}
                  </div>
                </div>

                {/* Live Badge Preview */}
                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-2xl border border-purple-200 self-start sm:self-auto shadow-2xs">
                  <span className="text-[10px] font-black text-slate-500 uppercase">Preview:</span>
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-black border flex items-center gap-1.5 ${
                      (
                        CUSTOM_CATEGORY_COLORS.find(
                          (c) =>
                            c.color === (formData.customCategoryColor || '#8b5cf6') ||
                            c.id === formData.customCategoryColor
                        ) || CUSTOM_CATEGORY_COLORS[0]
                      ).badgeBg
                    }`}
                  >
                    <span>{formData.customCategoryIcon || formData.icon || '✨'}</span>
                    <span>{formData.customCategoryName?.trim() || 'Custom Activity'}</span>
                  </span>
                </div>
              </div>

              {/* Save for future toggle */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="saveCategoryForFuture"
                  checked={saveCategoryForFuture}
                  onChange={(e) => setSaveCategoryForFuture(e.target.checked)}
                  className="w-4 h-4 text-purple-600 rounded-md focus:ring-purple-500 cursor-pointer"
                />
                <label htmlFor="saveCategoryForFuture" className="text-purple-950 font-black text-[11px] cursor-pointer">
                  Save this custom activity type to Family Categories (available with 1-click for future calendar entries)
                </label>
              </div>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-black text-slate-700 uppercase tracking-wide mb-1">
              Event Title:
            </label>
            <input
              type="text"
              required
              placeholder={
                formData.category === 'custom'
                  ? 'e.g. Leo Orange Belt Test vs Tigers, Saturday Piano Recital'
                  : 'e.g. Leo Soccer Practice vs Tigers, Science Project Due'
              }
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
                  placeholder="e.g. Park Field #3, School Auditorium, Dojo Studio B"
                  value={formData.location || ''}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-2 rounded-2xl border-2 border-slate-200 bg-white text-xs font-bold text-slate-800 focus:outline-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wide mb-1">
                Event Icon (Emoji):
              </label>
              <EmojiPicker
                value={formData.icon || (formData.category === 'custom' ? (formData.customCategoryIcon || '✨') : '⚽')}
                onChange={(emoji) => setFormData({ ...formData, icon: emoji })}
                title="Event Emoji"
                categoryFilter="all"
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
              Event Notes, Schedule & Things to Bring:
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Arrive 15 minutes early. Leo is testing for orange belt. Bring water bottle, gear bag & camera."
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

