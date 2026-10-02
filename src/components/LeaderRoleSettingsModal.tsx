import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Shield,
  Award,
  Sparkles,
  Users,
  CheckCircle2,
  Plus,
  Trash2,
  Edit2,
  FileText,
  ClipboardList,
  ArrowRight,
  Info,
  Check,
} from 'lucide-react';
import { FamilyDatabase, LeaderRoleConfig, KidProfile } from '../types';
import { getLeaderConfig, updateLeaderRoleConfig, PRESET_LEADER_DUTIES } from '../utils/leaderRole';
import { sound } from '../utils/sound';

interface LeaderRoleSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  database: FamilyDatabase;
  onUpdateDatabase: (updated: FamilyDatabase) => void;
  onOpenClipboardPreview?: () => void;
}

const BADGE_ICONS = ['🎖️', '⭐', '👑', '📋', '🛡️', '⚡', '🏆', '🦁', '🌟'];

export const LeaderRoleSettingsModal: React.FC<LeaderRoleSettingsModalProps> = ({
  isOpen,
  onClose,
  database,
  onUpdateDatabase,
  onOpenClipboardPreview,
}) => {
  const currentConfig = getLeaderConfig(database);

  const [enabled, setEnabled] = useState<boolean>(currentConfig.enabled ?? true);
  const [selectedLeaderKidId, setSelectedLeaderKidId] = useState<string>(currentConfig.leaderKidId || '');
  const [title, setTitle] = useState<string>(currentConfig.title || 'Chore Quest Leader');
  const [badgeIcon, setBadgeIcon] = useState<string>(currentConfig.badgeIcon || '🎖️');
  const [description, setDescription] = useState<string>(currentConfig.description || '');
  const [checklistGuidelines, setChecklistGuidelines] = useState<string[]>(
    currentConfig.checklistGuidelines || []
  );
  const [newGuidelineInput, setNewGuidelineInput] = useState<string>('');
  const [canSignOffChores, setCanSignOffChores] = useState<boolean>(currentConfig.canSignOffChores ?? true);
  const [canAssignChores, setCanAssignChores] = useState<boolean>(currentConfig.canAssignChores ?? true);
  const [bonusLeaderStars, setBonusLeaderStars] = useState<number>(currentConfig.bonusLeaderStars ?? 5);

  const [savedToast, setSavedToast] = useState<boolean>(false);

  const handleAddGuideline = (textToAdd?: string) => {
    const text = (textToAdd || newGuidelineInput).trim();
    if (!text) return;
    sound.playTap();
    if (!checklistGuidelines.includes(text)) {
      setChecklistGuidelines([...checklistGuidelines, text]);
    }
    setNewGuidelineInput('');
  };

  const handleRemoveGuideline = (index: number) => {
    sound.playTap();
    setChecklistGuidelines(checklistGuidelines.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    sound.playRewardRedeemed();

    const updatedConfig: Partial<LeaderRoleConfig> = {
      enabled,
      leaderKidId: selectedLeaderKidId || undefined,
      title: title.trim() || 'Chore Quest Leader',
      badgeIcon,
      description: description.trim(),
      checklistGuidelines: checklistGuidelines.length > 0 ? checklistGuidelines : currentConfig.checklistGuidelines,
      canSignOffChores,
      canAssignChores,
      bonusLeaderStars: Number(bonusLeaderStars) || 0,
      assignedDate: new Date().toISOString().split('T')[0],
    };

    const updatedDb = updateLeaderRoleConfig(database, updatedConfig);
    onUpdateDatabase(updatedDb);

    setSavedToast(true);
    setTimeout(() => {
      setSavedToast(false);
      onClose();
    }, 900);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 16 }}
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col my-auto max-h-[92vh]"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-700 via-amber-600 to-amber-800 p-4 sm:p-5 text-white flex items-center justify-between shadow-md shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 text-white flex items-center justify-center text-2xl shadow-inner border border-white/30 shrink-0">
              {badgeIcon}
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-200 bg-black/20 px-2 py-0.5 rounded-md border border-white/20">
                Admin Leadership Configuration
              </span>
              <h2 className="text-lg sm:text-xl font-black">
                Family Leader & Chore Manager Role
              </h2>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playTap();
              onClose();
            }}
            className="p-2 rounded-xl bg-white/15 hover:bg-white/25 active:bg-white/30 text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {/* Main Description Notice */}
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-950 dark:text-amber-200 leading-relaxed space-y-1.5">
            <div className="flex items-center gap-2 font-black text-sm text-amber-900 dark:text-amber-100">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Fostering Responsibility, Leadership & Teamwork</span>
            </div>
            <p>
              Appointing one of the children as the <strong>Leader / Manager</strong> gives them sole responsibility to inspect and verify chores on their detailed Clipboard, assign team missions to siblings, and keep the team motivated with high-fives and praise.
            </p>
          </div>

          {/* Section 1: Role Activation & Child Appointment */}
          <div className="space-y-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-purple-600" />
              <span>1. Appoint Family Leader</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block mb-1">
                  Designated Child:
                </label>
                <select
                  value={selectedLeaderKidId}
                  onChange={(e) => setSelectedLeaderKidId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-bold text-xs"
                >
                  <option value="">-- No Leader Assigned (Role Paused) --</option>
                  {database.kids.map((kid) => (
                    <option key={kid.id} value={kid.id}>
                      {kid.avatar} {kid.name} (Grade: {kid.gradeLevel || '1st Grade'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block mb-1">
                  Leader Title:
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Chore Quest Leader"
                  className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                />
              </div>
            </div>

            {/* Badge Icon Selection */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block mb-1.5">
                Leader Badge Icon:
              </label>
              <div className="flex items-center gap-2 flex-wrap">
                {BADGE_ICONS.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => {
                      sound.playTap();
                      setBadgeIcon(icon);
                    }}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-all cursor-pointer ${
                      badgeIcon === icon
                        ? 'bg-amber-500 text-white ring-2 ring-amber-400 scale-110 shadow-xs'
                        : 'bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 2: Description of Responsibilities for Full Clarity */}
          <div className="space-y-2 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-amber-600" />
                <span>2. Description of Responsibilities</span>
              </label>
              <span className="text-[10px] font-bold text-slate-400">
                Shown clearly on the child's Clipboard
              </span>
            </div>

            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Give a clear description of what the Leader needs to do (e.g. check on siblings, inspect rooms before dinner, verify pet food, give high-fives and encouragement)..."
              className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-xs leading-relaxed font-medium"
            />
          </div>

          {/* Section 3: Daily Manager Checklist Guidelines */}
          <div className="space-y-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <ClipboardList className="w-4 h-4 text-emerald-600" />
                <span>3. Daily Checklist Duties on Clipboard</span>
              </h4>
              <span className="text-[10px] font-bold text-slate-400">
                {checklistGuidelines.length} Duties configured
              </span>
            </div>

            {/* List of active guidelines */}
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {checklistGuidelines.map((guideline, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2 shadow-2xs"
                >
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">
                    {idx + 1}. {guideline}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveGuideline(idx)}
                    className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer shrink-0"
                    title="Remove duty"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Input to add custom duty */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newGuidelineInput}
                onChange={(e) => setNewGuidelineInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddGuideline();
                  }
                }}
                placeholder="Add custom duty (e.g. Inspect bedrooms before 5 PM)..."
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-medium"
              />
              <button
                type="button"
                onClick={() => handleAddGuideline()}
                disabled={!newGuidelineInput.trim()}
                className="px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-black text-xs transition-all cursor-pointer flex items-center gap-1 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>

            {/* Quick Inspiration Presets */}
            <div className="pt-1">
              <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">
                Quick Preset Ideas:
              </span>
              <div className="flex flex-wrap gap-1">
                {PRESET_LEADER_DUTIES.filter((p) => !checklistGuidelines.includes(p)).slice(0, 4).map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleAddGuideline(preset)}
                    className="px-2 py-0.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 text-[10px] font-bold text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-800 transition-all cursor-pointer truncate max-w-xs"
                    title={preset}
                  >
                    + {preset}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 4: Permissions & Incentives */}
          <div className="space-y-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-indigo-600" />
              <span>4. Leader Permissions & Incentive</span>
            </h4>

            <div className="space-y-2">
              <label className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-white dark:hover:bg-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={canSignOffChores}
                  onChange={(e) => setCanSignOffChores(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
                />
                <div className="text-xs">
                  <span className="font-black text-slate-800 dark:text-white block">
                    Allow Leader to Sign Off Chores on Clipboard
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                    The Leader can inspect and stamp approval on chores on behalf of siblings to award stars.
                  </span>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-white dark:hover:bg-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={canAssignChores}
                  onChange={(e) => setCanAssignChores(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
                />
                <div className="text-xs">
                  <span className="font-black text-slate-800 dark:text-white block">
                    Allow Leader to Delegate & Reassign Chores
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                    The Leader can distribute missions across the team to balance daily workload.
                  </span>
                </div>
              </label>
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3">
              <div>
                <label className="text-xs font-black text-slate-800 dark:text-white block">
                  Leadership Bonus Points:
                </label>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Daily bonus stars for carrying out manager duties
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min={0}
                  max={50}
                  value={bonusLeaderStars}
                  onChange={(e) => setBonusLeaderStars(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-16 px-2 py-1 text-xs font-black text-center rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                />
                <span className="text-xs font-bold text-amber-600">Stars</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-100 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0 flex-wrap">
          {onOpenClipboardPreview && (
            <button
              type="button"
              onClick={() => {
                sound.playTap();
                onOpenClipboardPreview();
              }}
              className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 font-bold text-xs border border-slate-300 dark:border-slate-600 transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
            >
              <span>📋 Preview Leader Clipboard</span>
            </button>
          )}

          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={() => {
                sound.playTap();
                onClose();
              }}
              className="px-4 py-2.5 rounded-xl font-bold text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-black text-xs sm:text-sm shadow-md active:scale-95 cursor-pointer flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Save Leadership Settings</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
