import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'motion/react';
import { SavingsGoal, KidProfile } from '../../types';
import { VERIFIED_WISHLIST_ITEMS, VerifiedItem, generateDefaultMilestones } from '../../utils/kidCoin';
import { sound } from '../../utils/sound';
import { GoalIcon } from './GoalIcon';
import { X, Sparkles, CheckCircle2, Plus, ShieldCheck, Target, Rocket } from 'lucide-react';

interface NewGoalModalProps {
  isOpen: boolean;
  kid: KidProfile;
  onClose: () => void;
  onSaveGoal: (goal: SavingsGoal) => void;
}

export const NewGoalModal: React.FC<NewGoalModalProps> = ({
  isOpen,
  kid,
  onClose,
  onSaveGoal,
}) => {
  const [selectedVerified, setSelectedVerified] = useState<VerifiedItem | null>(null);
  const [customTitle, setCustomTitle] = useState('');
  const [customCost, setCustomCost] = useState('');
  const [customIcon, setCustomIcon] = useState('🎯');
  const [customCategory, setCustomCategory] = useState('Dream Reward');
  const [priority, setPriority] = useState<'primary' | 'secondary'>('primary');
  const [tab, setTab] = useState<'verified' | 'custom'>('verified');

  if (!isOpen) return null;

  const handleSelectVerified = (item: VerifiedItem) => {
    setSelectedVerified(item);
    setCustomTitle(item.name);
    setCustomCost(String(item.currentCost));
    setCustomIcon(item.icon);
    setCustomCategory(item.category);
    sound.playTap();
  };

  const handleQuickLaunch = (item: VerifiedItem) => {
    const cost = Number(item.currentCost.toFixed(2));
    const newGoal: SavingsGoal = {
      id: `goal-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title: item.name,
      category: item.category,
      targetCost: cost,
      isVerified: true,
      verifiedSource: item.verifiedDate,
      currentSaved: 0,
      priority: 'primary',
      icon: item.icon,
      createdAt: new Date().toISOString().split('T')[0],
      milestones: generateDefaultMilestones(cost, 0),
    };

    sound.playCoinSound();
    onSaveGoal(newGoal);
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cost = parseFloat(customCost);
    if (!customTitle.trim() || isNaN(cost) || cost <= 0) return;

    const newGoal: SavingsGoal = {
      id: `goal-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title: customTitle.trim(),
      category: customCategory,
      targetCost: Number(cost.toFixed(2)),
      isVerified: !!selectedVerified,
      verifiedSource: selectedVerified ? selectedVerified.verifiedDate : undefined,
      currentSaved: 0,
      priority,
      icon: customIcon,
      createdAt: new Date().toISOString().split('T')[0],
      milestones: generateDefaultMilestones(cost, 0),
    };

    sound.playCoinSound();
    onSaveGoal(newGoal);
    onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <div key="new-goal-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <motion.div
        key="new-goal-modal-card"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-2xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl my-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-xl">
                🎯
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  Set a New Savings Mission
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Target for {kid.name} • Fuel your rocket with chore coins
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mode Switcher */}
          <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800/60 rounded-xl my-4">
            <button
              type="button"
              onClick={() => {
                setTab('verified');
                sound.playTap();
              }}
              className={`flex-1 py-2 text-xs font-black rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                tab === 'verified'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Verified Catalog ({VERIFIED_WISHLIST_ITEMS.length})</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setTab('custom');
                sound.playTap();
              }}
              className={`flex-1 py-2 text-xs font-black rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                tab === 'custom'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Custom Goal</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {tab === 'verified' && (
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-700 dark:text-slate-300">
                  Select a Verified Wishlist Item with Real Retail MSRP:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-60 overflow-y-auto pr-1">
                  {VERIFIED_WISHLIST_ITEMS.map((item) => {
                    const isSelected = selectedVerified?.id === item.id;
                    return (
                      <div
                        key={item.id}
                        onClick={() => handleSelectVerified(item)}
                        className={`p-3 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between gap-2.5 ${
                          isSelected
                            ? 'border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/40 shadow-sm'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-white dark:bg-slate-900'
                        }`}
                      >
                        <div className="flex items-start gap-3 w-full">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                            <GoalIcon icon={item.icon} className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                                {item.name}
                              </span>
                              <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 shrink-0">
                                ${item.currentCost.toFixed(2)}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                              {item.retailer}
                            </p>
                            <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                              <ShieldCheck className="w-3 h-3" />
                              <span>{item.verifiedDate}</span>
                            </span>
                          </div>
                        </div>

                        {/* Direct One-Click Launch Button */}
                        <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800/80">
                          <span className="text-[10px] text-slate-400 font-medium">Click to select or:</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleQuickLaunch(item);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-[11px] font-black shadow-xs flex items-center gap-1 cursor-pointer transition-transform active:scale-95"
                          >
                            <Rocket className="w-3 h-3" />
                            <span>Select & Launch</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Always-visible sticky action bar when an item is selected */}
                {selectedVerified && (
                  <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-between gap-2.5 flex-wrap">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-base">
                        <GoalIcon icon={selectedVerified.icon} className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-black text-slate-900 dark:text-white line-clamp-1">
                          {selectedVerified.name}
                        </div>
                        <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-black">
                          ${selectedVerified.currentCost.toFixed(2)} Target
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleQuickLaunch(selectedVerified)}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs font-black shadow-md shadow-indigo-500/20 flex items-center gap-1.5 cursor-pointer transition-transform active:scale-95"
                    >
                      <Rocket className="w-3.5 h-3.5" />
                      <span>Set as Active Mission 🚀</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Custom Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1">
                  Goal Title
                </label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="e.g., Nintendo Switch OLED"
                  required
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1">
                  Target Cost ($ USD)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  value={customCost}
                  onChange={(e) => setCustomCost(e.target.value)}
                  placeholder="e.g., 349.99"
                  required
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1">
                  Icon / Emoji
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={customIcon}
                    onChange={(e) => setCustomIcon(e.target.value)}
                    maxLength={10}
                    className="w-16 text-center text-lg px-2 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                  <div className="flex gap-1.5">
                    {['🎮', '🚀', '🚲', '🎧', '🛹', '📱', '🧸'].map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setCustomIcon(emoji)}
                        className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-sm cursor-pointer"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1">
                  Goal Priority
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPriority('primary')}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl border cursor-pointer ${
                      priority === 'primary'
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    🚀 Primary Flight
                  </button>
                  <button
                    type="button"
                    onClick={() => setPriority('secondary')}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl border cursor-pointer ${
                      priority === 'secondary'
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    🌟 Secondary
                  </button>
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-black shadow-md shadow-orange-500/20 transition-transform active:scale-95 cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Launch Savings Mission</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>,
    document.body
  );
};
