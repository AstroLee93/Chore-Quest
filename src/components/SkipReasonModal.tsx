import React, { useState } from 'react';
import { AlertCircle, X, HelpCircle, Check, ShieldAlert, Clock, Wrench, Thermometer } from 'lucide-react';
import { ChoreItem } from '../types';
import { sound } from '../utils/sound';

interface SkipReasonModalProps {
  isOpen: boolean;
  chore: ChoreItem | null;
  onConfirmSkip: (choreId: string, category: 'sick' | 'supplies' | 'time' | 'already_done' | 'need_help' | 'other', note: string) => void;
  onClose: () => void;
}

const REASON_OPTIONS = [
  {
    id: 'supplies',
    label: 'Missing Supplies or Broken',
    icon: '🧼',
    example: 'Out of trash bags, soap, sponge, or vacuum is broken.',
  },
  {
    id: 'sick',
    label: 'Feeling Sick or Hurt',
    icon: '🤒',
    example: 'Not feeling well, headache, or resting.',
  },
  {
    id: 'need_help',
    label: 'Need Parent Help or Instructions',
    icon: '🙋',
    example: 'Do not know how or need grown-up assistance.',
  },
  {
    id: 'time',
    label: 'Ran Out of Time / Heavy Homework',
    icon: '⏰',
    example: 'Studying for big test or had late practice.',
  },
  {
    id: 'already_done',
    label: 'Already Done by Someone Else',
    icon: '✨',
    example: 'Sibling or parent already finished it earlier.',
  },
  {
    id: 'other',
    label: 'Other Reason (type below)',
    icon: '📝',
    example: 'Explain what happened in the note box.',
  },
] as const;

export const SkipReasonModal: React.FC<SkipReasonModalProps> = ({
  isOpen,
  chore,
  onConfirmSkip,
  onClose,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'sick' | 'supplies' | 'time' | 'already_done' | 'need_help' | 'other'>('supplies');
  const [customNote, setCustomNote] = useState('');

  if (!isOpen || !chore) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playSkipNotice();
    onConfirmSkip(chore.id, selectedCategory, customNote.trim());
    setCustomNote('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-fade-in">
      <div
        id="skip-reason-dialog"
        className="bg-yellow-50 w-full max-w-lg rounded-[2.5rem] p-6 sm:p-8 shadow-2xl border-4 border-yellow-300 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-700 flex items-center justify-center text-2xl font-black border-2 border-orange-200">
              {chore.icon || '📋'}
            </div>
            <div>
              <h3 className="font-black text-slate-800 text-xl leading-tight">
                Can't do this mission today?
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 font-bold">
                "{chore.title}"
              </p>
            </div>
          </div>
          <button
            id="btn-close-skip-modal"
            onClick={() => {
              sound.playTap();
              onClose();
            }}
            className="p-2.5 rounded-2xl text-slate-400 hover:text-slate-700 bg-white hover:bg-slate-100 border-2 border-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Explanation */}
        <div className="bg-yellow-100 border-2 border-yellow-300 rounded-2xl p-3.5 mb-5 flex items-start gap-2.5">
          <AlertCircle className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
          <p className="text-xs text-slate-800 leading-relaxed font-bold">
            That's okay! Letting your parents know why a task couldn't be done helps everyone stay organized. Pick a reason below:
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Options Grid */}
          <div className="space-y-2.5 mb-5">
            {REASON_OPTIONS.map((opt) => {
              const isSelected = selectedCategory === opt.id;
              return (
                <button
                  type="button"
                  key={opt.id}
                  id={`reason-opt-${opt.id}`}
                  onClick={() => {
                    sound.playTap();
                    setSelectedCategory(opt.id);
                  }}
                  className={`w-full p-3.5 rounded-2xl border-2 text-left flex items-center gap-3 transition-all cursor-pointer ${
                    isSelected
                      ? 'border-orange-500 bg-orange-50/80 shadow-xs ring-2 ring-orange-400/20'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-2xl">{opt.icon}</span>
                  <div className="flex-1">
                    <div className="text-sm font-black text-slate-800">{opt.label}</div>
                    <div className="text-xs text-slate-500 font-medium">{opt.example}</div>
                  </div>
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                      isSelected
                        ? 'border-orange-500 bg-orange-500 text-white'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Optional Note Field */}
          <div className="mb-6">
            <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
              Add details for parents (optional):
            </label>
            <textarea
              id="input-skip-note"
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              placeholder="e.g. The vacuum bag was full and I couldn't find replacements in the laundry room."
              rows={3}
              className="w-full px-4 py-3 rounded-2xl bg-white border-2 border-yellow-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none text-sm text-slate-800 font-bold placeholder:text-slate-400 resize-none transition-all"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              id="btn-cancel-skip"
              onClick={() => {
                sound.playTap();
                onClose();
              }}
              className="flex-1 py-3 px-4 rounded-2xl bg-white border-2 border-slate-200 hover:bg-slate-100 text-slate-700 font-black text-xs sm:text-sm transition-colors cursor-pointer"
            >
              Nevermind, I'll do it!
            </button>
            <button
              type="submit"
              id="btn-submit-skip-reason"
              className="flex-1 py-3 px-4 rounded-2xl bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-black text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer"
            >
              Send Reason to Parents
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
