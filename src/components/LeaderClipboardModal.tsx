import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  CheckCircle2,
  Sparkles,
  ClipboardList,
  CheckSquare,
  Square,
  Users,
  Award,
  ChevronRight,
  Shield,
  Clock,
  Star,
  MessageSquare,
  ArrowRight,
  RotateCcw,
  AlertCircle,
  ThumbsUp,
  Heart,
  Smile,
  Flame,
  UserCheck,
  Send,
} from 'lucide-react';
import { FamilyDatabase, KidProfile, ChoreItem, LeaderRoleConfig } from '../types';
import {
  getLeaderConfig,
  getLeaderKid,
  getHouseholdChoresForLeader,
  signOffChoreAsLeader,
  reassignChoreAsLeader,
  LeaderChoreInspectionItem,
} from '../utils/leaderRole';
import { getTodayDateString } from '../utils/storage';
import { sound } from '../utils/sound';
import { fireConfetti } from '../utils/confetti';

interface LeaderClipboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  database: FamilyDatabase;
  onUpdateDatabase: (updated: FamilyDatabase) => void;
  actingKid?: KidProfile | null; // The kid opening the clipboard (typically the Leader, or admin preview)
  isAdminPreview?: boolean;
}

type ClipboardTab = 'signoff' | 'responsibilities' | 'delegation' | 'log';

const PRAISE_PRESETS = [
  'Spotless inspection! 🌟',
  'Super thorough job! 🧼',
  'Great teamwork today! 🤝',
  'Exceeded expectations! 🚀',
  'Fast and focused! ⚡',
  'Proud of your effort! ❤️',
];

const STAMP_PRESETS = [
  { id: 'leader_verified', label: 'Official Leader Approval', icon: '🎖️', border: 'border-amber-500 text-amber-900 bg-amber-50 dark:bg-amber-950/40' },
  { id: 'gold_standard', label: 'Gold Star Standard', icon: '⭐', border: 'border-yellow-500 text-yellow-900 bg-yellow-50 dark:bg-yellow-950/40' },
  { id: 'masterpiece', label: 'Mission Accomplished', icon: '🚀', border: 'border-indigo-500 text-indigo-900 bg-indigo-50 dark:bg-indigo-950/40' },
  { id: 'team_player', label: 'Super Teamwork', icon: '🤝', border: 'border-emerald-500 text-emerald-900 bg-emerald-50 dark:bg-emerald-950/40' },
];

export const LeaderClipboardModal: React.FC<LeaderClipboardModalProps> = ({
  isOpen,
  onClose,
  database,
  onUpdateDatabase,
  actingKid,
  isAdminPreview = false,
}) => {
  const config = useMemo(() => getLeaderConfig(database), [database]);
  const leaderKid = useMemo(() => getLeaderKid(database) || actingKid || database.kids[0] || null, [database, actingKid]);
  const todayStr = useMemo(() => getTodayDateString(), []);

  const [activeTab, setActiveTab] = useState<ClipboardTab>('signoff');
  const [selectedKidFilter, setSelectedKidFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'needs_signoff' | 'signed_off' | 'pending'>('all');

  // Interactive Checklist Tracking (stored in component state for active session)
  const [checkedDuties, setCheckedDuties] = useState<Record<number, boolean>>({});

  // Active Sign-Off Dialog State
  const [activeInspectionItem, setActiveInspectionItem] = useState<LeaderChoreInspectionItem | null>(null);
  const [selectedPraise, setSelectedPraise] = useState<string>(PRAISE_PRESETS[0]);
  const [customPraiseNote, setCustomPraiseNote] = useState<string>('');
  const [selectedStamp, setSelectedStamp] = useState<string>(STAMP_PRESETS[0].id);

  // Delegation Modal State
  const [delegatingChore, setDelegatingChore] = useState<ChoreItem | null>(null);
  const [delegationSelectedKids, setDelegationSelectedKids] = useState<string[]>([]);

  // Toast / Feedback banner
  const [feedbackToast, setFeedbackToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setFeedbackToast({ message, type });
    setTimeout(() => setFeedbackToast(null), 3500);
  };

  // Aggregated household chores for today
  const householdItems = useMemo(() => {
    return getHouseholdChoresForLeader(database, todayStr);
  }, [database, todayStr]);

  // Filtered chore items
  const filteredItems = useMemo(() => {
    return householdItems.filter((item) => {
      if (selectedKidFilter !== 'all' && item.targetKid.id !== selectedKidFilter) {
        return false;
      }
      if (statusFilter === 'needs_signoff') {
        return item.isCompleted && !item.isVerifiedByLeader;
      }
      if (statusFilter === 'signed_off') {
        return item.isVerifiedByLeader;
      }
      if (statusFilter === 'pending') {
        return !item.isCompleted;
      }
      return true;
    });
  }, [householdItems, selectedKidFilter, statusFilter]);

  // Metrics
  const totalChoresCount = householdItems.length;
  const needsSignOffCount = householdItems.filter((i) => i.isCompleted && !i.isVerifiedByLeader).length;
  const verifiedCount = householdItems.filter((i) => i.isVerifiedByLeader).length;
  const completedCount = householdItems.filter((i) => i.isCompleted).length;
  const overallProgressPercent = totalChoresCount > 0 ? Math.round((verifiedCount / totalChoresCount) * 100) : 0;

  // Handlers
  const handleToggleDuty = (index: number) => {
    sound.playTap();
    setCheckedDuties((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleOpenSignOff = (item: LeaderChoreInspectionItem) => {
    sound.playTap();
    setActiveInspectionItem(item);
    setSelectedPraise(PRAISE_PRESETS[0]);
    setCustomPraiseNote('');
    setSelectedStamp(STAMP_PRESETS[0].id);
  };

  const handleConfirmSignOff = () => {
    if (!activeInspectionItem || !leaderKid) return;

    sound.playRewardRedeemed();
    fireConfetti({ mode: 'snappy' });

    const finalNote = customPraiseNote.trim() || selectedPraise;
    const { updatedDatabase, starsAwarded } = signOffChoreAsLeader({
      database,
      chore: activeInspectionItem.chore,
      targetKidId: activeInspectionItem.targetKid.id,
      leaderKidId: leaderKid.id,
      notes: `${finalNote}`,
      dateStr: todayStr,
    });

    onUpdateDatabase(updatedDatabase);
    const displayStars = starsAwarded !== undefined ? starsAwarded : activeInspectionItem.chore.stars;
    showToast(
      `Signed off ${activeInspectionItem.chore.title} for ${activeInspectionItem.targetKid.name}! (${displayStars > 0 ? `+${displayStars} Stars` : '0 Stars - Routine'} 🎖️)`
    );
    setActiveInspectionItem(null);
  };

  const handleOpenDelegation = (chore: ChoreItem) => {
    sound.playTap();
    setDelegatingChore(chore);
    setDelegationSelectedKids(chore.assignedKidIds || []);
  };

  const handleToggleDelegationKid = (kidId: string) => {
    sound.playTap();
    setDelegationSelectedKids((prev) => {
      if (prev.includes(kidId)) {
        return prev.filter((id) => id !== kidId);
      } else {
        return [...prev, kidId];
      }
    });
  };

  const handleSaveDelegation = () => {
    if (!delegatingChore || !leaderKid) return;
    if (delegationSelectedKids.length === 0) {
      sound.playWarning();
      return;
    }

    sound.playTap();
    const updated = reassignChoreAsLeader({
      database,
      choreId: delegatingChore.id,
      newKidIds: delegationSelectedKids,
      leaderKidId: leaderKid.id,
    });

    onUpdateDatabase(updated);
    showToast(`Updated team assignments for "${delegatingChore.title}"! 📋`);
    setDelegatingChore(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 16 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative w-full max-w-4xl bg-amber-50/40 dark:bg-slate-900 rounded-3xl shadow-2xl border-4 border-amber-800/80 dark:border-amber-900/60 overflow-hidden flex flex-col my-auto max-h-[94vh]"
      >
        {/* Realistic Metallic / Brass Clipboard Clamp Header */}
        <div className="relative bg-gradient-to-r from-amber-800 via-amber-700 to-amber-900 text-amber-100 p-3 sm:p-4 shadow-md flex items-center justify-between border-b-2 border-amber-950 shrink-0">
          {/* Faux Metallic Brass Spring Clip Visual */}
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-32 sm:w-44 h-5 sm:h-6 bg-gradient-to-b from-amber-300 via-amber-500 to-amber-700 rounded-b-xl shadow-lg border border-amber-200/50 flex items-center justify-center">
            <div className="w-16 sm:w-24 h-1.5 bg-amber-900/60 rounded-full" />
            <div className="absolute -bottom-1 w-2.5 h-2.5 rounded-full bg-amber-900 border border-amber-400" />
          </div>

          <div className="flex items-center gap-3 pt-1">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-950 dark:text-amber-100 flex items-center justify-center text-xl sm:text-2xl shadow-inner border border-amber-300/40 shrink-0">
              {config.badgeIcon || '🎖️'}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-amber-200/90 bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-600/40 flex items-center gap-1">
                  <span>OFFICIAL CLIPBOARD</span>
                  {isAdminPreview && <span className="text-amber-300">• ADMIN PREVIEW</span>}
                </span>
                <span className="text-[10px] font-bold text-amber-200/80">
                  {todayStr}
                </span>
              </div>
              <h2 className="text-base sm:text-xl font-black text-white flex items-center gap-2">
                <span>{config.title || 'Chore Quest Leader'}</span>
                <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-amber-500/30 text-amber-200 border border-amber-400/40 hidden sm:inline-flex">
                  Manager on Duty: {leaderKid?.name || 'Assigned Leader'}
                </span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                sound.playTap();
                onClose();
              }}
              className="p-2 sm:p-2.5 rounded-xl bg-amber-900/60 hover:bg-amber-900 active:bg-amber-950 text-amber-200 hover:text-white transition-all cursor-pointer border border-amber-700/60 shadow-xs"
              title="Close Clipboard"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Executive Sub-Header: Leader Identity & Daily Household Progress Bar */}
        <div className="bg-amber-100/80 dark:bg-slate-800/90 border-b border-amber-200 dark:border-slate-700/80 px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3 flex-wrap shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-xl sm:text-2xl">{leaderKid?.avatar || '🦁'}</span>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-black text-xs sm:text-sm text-slate-800 dark:text-white truncate">
                  {leaderKid?.name}'s Manager Clipboard
                </span>
                <span className="text-[10px] font-extrabold px-2 py-0.2 rounded-md bg-amber-200 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700">
                  LEADER
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 truncate">
                Sole Manager for Chore Assignments & Verifications
              </p>
            </div>
          </div>

          {/* Quick Metrics Capsule */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-auto">
            {needsSignOffCount > 0 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-rose-500 text-white font-black text-xs shadow-xs animate-pulse">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{needsSignOffCount} Needs Sign-Off!</span>
              </span>
            )}

            <div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-3 py-1 rounded-xl border border-amber-200 dark:border-slate-700 shadow-2xs">
              <div className="text-right">
                <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Team Missions</div>
                <div className="text-xs font-black text-slate-800 dark:text-white">
                  {verifiedCount} / {totalChoresCount} Verified
                </div>
              </div>
              <div className="w-12 sm:w-16 bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 transition-all duration-300 rounded-full"
                  style={{ width: `${overallProgressPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation Navigation */}
        <div className="bg-white/80 dark:bg-slate-900/90 border-b border-amber-200/80 dark:border-slate-800 px-4 sm:px-6 py-2 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar shrink-0">
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={() => {
                sound.playTap();
                setActiveTab('signoff');
              }}
              className={`px-3 py-1.5 rounded-xl font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'signoff'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-amber-100/60 dark:hover:bg-slate-800'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Duty Roster & Sign-Off</span>
              {needsSignOffCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center">
                  {needsSignOffCount}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                sound.playTap();
                setActiveTab('responsibilities');
              }}
              className={`px-3 py-1.5 rounded-xl font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'responsibilities'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-amber-100/60 dark:hover:bg-slate-800'
              }`}
            >
              <ClipboardList className="w-3.5 h-3.5" />
              <span>Role Briefing & Duties</span>
            </button>

            {config.canAssignChores && (
              <button
                onClick={() => {
                  sound.playTap();
                  setActiveTab('delegation');
                }}
                className={`px-3 py-1.5 rounded-xl font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'delegation'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-amber-100/60 dark:hover:bg-slate-800'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Team Delegation</span>
              </button>
            )}

            <button
              onClick={() => {
                sound.playTap();
                setActiveTab('log');
              }}
              className={`px-3 py-1.5 rounded-xl font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'log'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-amber-100/60 dark:hover:bg-slate-800'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Leader History & Praise</span>
            </button>
          </div>

          <div className="text-[11px] font-bold text-amber-800 dark:text-amber-300 hidden md:flex items-center gap-1 shrink-0">
            <span>⭐ Bonus Allowance:</span>
            <span className="font-black text-slate-900 dark:text-white">+{config.bonusLeaderStars || 5} Stars</span>
          </div>
        </div>

        {/* Feedback Banner */}
        <AnimatePresence>
          {feedbackToast && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-emerald-600 text-white px-4 py-2 font-bold text-xs flex items-center justify-between shadow-xs shrink-0"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-200 shrink-0" />
                <span>{feedbackToast.message}</span>
              </div>
              <button onClick={() => setFeedbackToast(null)} className="cursor-pointer text-white/80 hover:text-white">
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Body with Paper Ledger Aesthetic */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-4 bg-amber-50/20 dark:bg-slate-950/40">
          {/* TAB 1: DUTY ROSTER & SIGN-OFF */}
          {activeTab === 'signoff' && (
            <div className="space-y-4">
              {/* Filter Controls Bar */}
              <div className="flex items-center justify-between gap-2 flex-wrap bg-white dark:bg-slate-800/90 p-2.5 sm:p-3 rounded-2xl border border-amber-200/80 dark:border-slate-700 shadow-2xs">
                {/* Sibling Filter */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                  <span className="text-[11px] font-black uppercase text-slate-500 dark:text-slate-400 mr-1">
                    Sibling:
                  </span>
                  <button
                    onClick={() => {
                      sound.playTap();
                      setSelectedKidFilter('all');
                    }}
                    className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                      selectedKidFilter === 'all'
                        ? 'bg-amber-600 text-white shadow-2xs font-black'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    All Siblings ({householdItems.length})
                  </button>
                  {database.kids.map((kid) => {
                    const kidCount = householdItems.filter((i) => i.targetKid.id === kid.id).length;
                    return (
                      <button
                        key={kid.id}
                        onClick={() => {
                          sound.playTap();
                          setSelectedKidFilter(kid.id);
                        }}
                        className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1 ${
                          selectedKidFilter === kid.id
                            ? 'bg-amber-600 text-white shadow-2xs font-black'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                        }`}
                      >
                        <span>{kid.avatar}</span>
                        <span>{kid.name}</span>
                        <span className="opacity-75">({kidCount})</span>
                      </button>
                    );
                  })}
                </div>

                {/* Status Filter */}
                <div className="flex items-center gap-1 shrink-0 ml-auto">
                  <button
                    onClick={() => {
                      sound.playTap();
                      setStatusFilter('all');
                    }}
                    className={`px-2 py-0.5 rounded-lg text-xs font-bold cursor-pointer ${
                      statusFilter === 'all' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'text-slate-500'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => {
                      sound.playTap();
                      setStatusFilter('needs_signoff');
                    }}
                    className={`px-2 py-0.5 rounded-lg text-xs font-bold cursor-pointer flex items-center gap-1 ${
                      statusFilter === 'needs_signoff' ? 'bg-rose-600 text-white' : 'text-rose-600 hover:bg-rose-50'
                    }`}
                  >
                    <span>Needs Sign-Off</span>
                    {needsSignOffCount > 0 && <span className="font-black">({needsSignOffCount})</span>}
                  </button>
                  <button
                    onClick={() => {
                      sound.playTap();
                      setStatusFilter('signed_off');
                    }}
                    className={`px-2 py-0.5 rounded-lg text-xs font-bold cursor-pointer ${
                      statusFilter === 'signed_off' ? 'bg-emerald-600 text-white' : 'text-emerald-600 hover:bg-emerald-50'
                    }`}
                  >
                    Verified ({verifiedCount})
                  </button>
                  <button
                    onClick={() => {
                      sound.playTap();
                      setStatusFilter('pending');
                    }}
                    className={`px-2 py-0.5 rounded-lg text-xs font-bold cursor-pointer ${
                      statusFilter === 'pending' ? 'bg-indigo-600 text-white' : 'text-indigo-600 hover:bg-indigo-50'
                    }`}
                  >
                    Pending
                  </button>
                </div>
              </div>

              {/* Inspection Cards Grid */}
              {filteredItems.length === 0 ? (
                <div className="py-12 text-center bg-white dark:bg-slate-800/60 rounded-3xl border border-dashed border-amber-300 dark:border-slate-700 p-6 space-y-2">
                  <div className="text-3xl">📋</div>
                  <h4 className="text-base font-black text-slate-800 dark:text-white">
                    No Missions Found in this View
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Switch the filter above to inspect all chores or select another sibling.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filteredItems.map((item) => {
                    const isNeedsSignOff = item.isCompleted && !item.isVerifiedByLeader;
                    const isSignedOff = item.isVerifiedByLeader;

                    return (
                      <div
                        key={item.id}
                        className={`p-3.5 sm:p-4 rounded-2xl border transition-all shadow-xs flex flex-col justify-between gap-3 ${
                          isSignedOff
                            ? 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/60'
                            : isNeedsSignOff
                            ? 'bg-amber-50/90 dark:bg-amber-950/30 border-amber-400 dark:border-amber-700 ring-2 ring-amber-400/30'
                            : 'bg-white dark:bg-slate-800/90 border-slate-200 dark:border-slate-700/80'
                        }`}
                      >
                        <div className="space-y-2">
                          {/* Sibling Badge & Verification Pill */}
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <div className="flex items-center gap-1.5">
                              <span
                                className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black shrink-0 border border-black/10"
                                style={{ backgroundColor: `${item.targetKid.color}35` }}
                              >
                                {item.targetKid.avatar}
                              </span>
                              <span className="font-extrabold text-xs text-slate-800 dark:text-white">
                                {item.targetKid.name}
                              </span>
                              {item.category && (
                                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold hidden sm:inline">
                                  • {item.category.name}
                                </span>
                              )}
                            </div>

                            {/* Status Indicator */}
                            {isSignedOff ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-black text-[11px] border border-emerald-300 dark:border-emerald-700 shadow-2xs">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>Leader Verified 🎖️</span>
                              </span>
                            ) : isNeedsSignOff ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[11px] shadow-xs animate-bounce">
                                <Sparkles className="w-3 h-3 fill-slate-950 text-slate-950" />
                                <span>Ready for Inspection!</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold text-[10px]">
                                <Clock className="w-3 h-3 text-slate-400" />
                                <span>In Progress</span>
                              </span>
                            )}
                          </div>

                          {/* Chore Details */}
                          <div className="flex items-start gap-2.5">
                            <span className="text-2xl shrink-0 mt-0.5">{item.chore.icon || '⭐'}</span>
                            <div className="min-w-0 flex-1">
                              <h4 className="font-black text-sm text-slate-900 dark:text-white leading-snug">
                                {item.chore.title}
                              </h4>
                              {item.chore.description && (
                                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                                  {item.chore.description}
                                </p>
                              )}
                              <div className="flex items-center gap-2 mt-1 text-[11px] font-bold text-slate-500 dark:text-slate-400">
                                <span className="text-amber-600 dark:text-amber-400 font-black flex items-center gap-0.5">
                                  <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                                  {item.chore.stars > 0 ? `+${item.chore.stars} Stars` : '0 Stars (Routine)'}
                                </span>
                                {item.totalSubtasksCount > 0 && (
                                  <span>
                                    • {item.completedSubtasksCount}/{item.totalSubtasksCount} Steps Checked
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Leader Note if already signed off */}
                          {item.leaderNotes && (
                            <div className="p-2 rounded-xl bg-white/80 dark:bg-slate-900/60 border border-emerald-200 dark:border-emerald-800/40 text-xs text-emerald-900 dark:text-emerald-200 flex items-start gap-1.5">
                              <MessageSquare className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                              <span className="italic font-medium">"{item.leaderNotes}"</span>
                            </div>
                          )}
                        </div>

                        {/* Inspection / Sign-Off Actions */}
                        <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between gap-2">
                          <div className="text-[10px] text-slate-400 dark:text-slate-500">
                            {isSignedOff && item.leaderSignedAt ? (
                              <span>Signed at {new Date(item.leaderSignedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            ) : (
                              <span>Physical check required</span>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5">
                            {config.canSignOffChores && (
                              <button
                                onClick={() => handleOpenSignOff(item)}
                                className={`px-3 py-1.5 rounded-xl font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95 ${
                                  isSignedOff
                                    ? 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200'
                                    : 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white shadow-amber-600/30'
                                }`}
                              >
                                <span>✍️</span>
                                <span>{isSignedOff ? 'Update Sign-Off' : 'Inspect & Sign Off'}</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: RESPONSIBILITIES & GUIDELINES */}
          {activeTab === 'responsibilities' && (
            <div className="space-y-4">
              {/* Executive Mission Statement Card */}
              <div className="p-4 sm:p-6 rounded-3xl bg-gradient-to-br from-amber-100/90 via-amber-50 to-orange-50 dark:from-slate-800/90 dark:to-amber-950/40 border-2 border-amber-300 dark:border-amber-800/70 shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200">
                  <Shield className="w-5 h-5 text-amber-600" />
                  <h3 className="text-base sm:text-lg font-black">
                    Official Description of Responsibilities
                  </h3>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200 border border-amber-400 ml-auto">
                    Admin Approved
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-white/90 dark:bg-slate-900/80 border border-amber-200 dark:border-amber-900/50 shadow-inner">
                  <p className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-line">
                    {config.description}
                  </p>
                </div>
              </div>

              {/* Actionable Managerial Duties Checklist */}
              <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-amber-600" />
                    <h4 className="text-sm font-black text-slate-800 dark:text-white">
                      Daily Manager Checklist Guidelines
                    </h4>
                  </div>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    Tap to mark steps as you complete them
                  </span>
                </div>

                <div className="space-y-2">
                  {config.checklistGuidelines.map((guideline, idx) => {
                    const isChecked = !!checkedDuties[idx];
                    return (
                      <button
                        key={idx}
                        onClick={() => handleToggleDuty(idx)}
                        className={`w-full p-3 rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                          isChecked
                            ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-100'
                            : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-amber-400'
                        }`}
                      >
                        <span className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400">
                          {isChecked ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                          ) : (
                            <Square className="w-5 h-5 text-slate-400" />
                          )}
                        </span>
                        <span className={`text-xs sm:text-sm font-bold flex-1 ${isChecked ? 'line-through opacity-80' : ''}`}>
                          {guideline}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Leadership Guiding Principles */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 text-center space-y-1">
                  <div className="text-2xl">🤝</div>
                  <h5 className="font-black text-xs text-amber-950 dark:text-amber-200">Lead with Kindness</h5>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300">
                    Encourage your siblings with high-fives and praise their effort.
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800/40 text-center space-y-1">
                  <div className="text-2xl">🔍</div>
                  <h5 className="font-black text-xs text-indigo-950 dark:text-indigo-200">Be Thorough</h5>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300">
                    Physically inspect tasks in person before putting your stamp of approval.
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 text-center space-y-1">
                  <div className="text-2xl">⭐</div>
                  <h5 className="font-black text-xs text-emerald-950 dark:text-emerald-200">Lead by Example</h5>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300">
                    Complete your own chores with excellence to inspire the team!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TEAM DELEGATION & ASSIGNMENT */}
          {activeTab === 'delegation' && config.canAssignChores && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/60 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <div>
                    <h4 className="font-black text-xs sm:text-sm text-indigo-950 dark:text-indigo-100">
                      Chore Delegation & Team Balancing
                    </h4>
                    <p className="text-[11px] text-indigo-800/80 dark:text-indigo-300">
                      As Leader, you have permission to assign chores to ensure fairness across the team.
                    </p>
                  </div>
                </div>
              </div>

              {/* Sibling Workload Balancing Card */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {database.kids.map((kid) => {
                  const kidAssignedChores = (database.chores || []).filter(
                    (c) => c.isActive && c.assignedKidIds?.includes(kid.id)
                  );
                  return (
                    <div
                      key={kid.id}
                      className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center space-y-1 shadow-2xs"
                    >
                      <div className="text-xl">{kid.avatar}</div>
                      <div className="font-black text-xs text-slate-800 dark:text-white">{kid.name}</div>
                      <div className="text-[10px] font-extrabold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 py-0.5 rounded-lg border border-amber-200 dark:border-amber-800">
                        {kidAssignedChores.length} Chores Assigned
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Chores Table for Delegation */}
              <div className="space-y-2">
                {(database.chores || []).filter((c) => c && c.isActive).map((chore) => {
                  const assignedKidNames = (database.kids || [])
                    .filter((k) => chore.assignedKidIds?.includes(k.id) || chore.assignedKidIds?.includes('all'))
                    .map((k) => k.name);

                  return (
                    <div
                      key={chore.id}
                      className="p-3 sm:p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 shadow-2xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-xl shrink-0">{chore.icon || '⭐'}</span>
                        <div className="min-w-0">
                          <h5 className="font-black text-xs sm:text-sm text-slate-800 dark:text-white truncate">
                            {chore.title}
                          </h5>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                            <span>Assigned to:</span>
                            <span className="font-extrabold text-purple-700 dark:text-purple-300">
                              {assignedKidNames.length > 0 ? assignedKidNames.join(', ') : 'Unassigned'}
                            </span>
                            {chore.assignedByLeaderKidId && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-bold">
                                Delegated by Leader
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleOpenDelegation(chore)}
                        className="px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 dark:hover:bg-purple-900/60 text-purple-900 dark:text-purple-200 border border-purple-200 dark:border-purple-800 font-black text-xs transition-all cursor-pointer shrink-0"
                      >
                        Reassign Team
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: LEADER LOG & PRAISE FEED */}
          {activeTab === 'log' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 flex items-center justify-between">
                <div>
                  <h4 className="font-black text-sm text-amber-950 dark:text-amber-100">
                    Leader Sign-Off Activity & Praise Feed
                  </h4>
                  <p className="text-xs text-amber-800/80 dark:text-amber-300">
                    A record of all chores signed off by the Leader today.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Today's Sign-Offs</span>
                  <div className="text-lg font-black text-slate-800 dark:text-white">
                    {verifiedCount}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                {householdItems.filter((i) => i.isVerifiedByLeader).length === 0 ? (
                  <div className="py-12 text-center bg-white dark:bg-slate-800/60 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 space-y-2">
                    <div className="text-3xl">🎖️</div>
                    <h5 className="font-black text-sm text-slate-800 dark:text-white">
                      No Sign-Offs Yet Today
                    </h5>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Head to the Duty Roster tab to inspect and sign off completed tasks!
                    </p>
                  </div>
                ) : (
                  householdItems.filter((i) => i.isVerifiedByLeader).map((item) => (
                    <div
                      key={item.id}
                      className="p-3 sm:p-4 rounded-2xl bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between gap-3 shadow-2xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 flex items-center justify-center font-black text-base shrink-0">
                          🎖️
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-black text-xs sm:text-sm text-slate-900 dark:text-white">
                              {item.chore.title}
                            </span>
                            <span className="text-[11px] font-bold text-slate-400">
                              for {item.targetKid.name}
                            </span>
                          </div>
                          {item.leaderNotes && (
                            <p className="text-xs text-emerald-800 dark:text-emerald-300 font-semibold italic">
                              "{item.leaderNotes}"
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[10px] text-slate-400 block">
                          {item.leaderSignedAt
                            ? new Date(item.leaderSignedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            : 'Today'}
                        </span>
                        <span className="text-xs font-black text-amber-500">
                          {item.chore.stars > 0 ? `+${item.chore.stars} Stars` : '0 Stars'}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* BOTTOM ACTION / FOOTER */}
        <div className="p-3 sm:p-4 bg-white/90 dark:bg-slate-900 border-t border-amber-200 dark:border-slate-800 flex items-center justify-between gap-2 shrink-0 flex-wrap">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
            <span className="text-base">{config.badgeIcon || '🎖️'}</span>
            <span>
              Leader Role: <strong className="text-slate-900 dark:text-white">{leaderKid?.name || 'Unassigned'}</strong>
            </span>
            <span className="text-slate-400 hidden sm:inline">•</span>
            <span className="text-amber-700 dark:text-amber-400 hidden sm:inline font-black">
              +{config.bonusLeaderStars || 5} Stars Leadership Bonus
            </span>
          </div>

          <button
            onClick={() => {
              sound.playTap();
              onClose();
            }}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-700 to-amber-800 hover:from-amber-800 hover:to-amber-900 text-white font-black text-xs sm:text-sm transition-all shadow-md active:scale-95 cursor-pointer ml-auto"
          >
            Close Clipboard 📋
          </button>
        </div>
      </motion.div>

      {/* POPUP 1: INSPECTION & OFFICIAL SIGN-OFF DIALOG */}
      <AnimatePresence>
        {activeInspectionItem && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 15 }}
              className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border-2 border-amber-400 dark:border-amber-600 shadow-2xl p-5 sm:p-6 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🎖️</span>
                  <div>
                    <h3 className="font-black text-base text-slate-900 dark:text-white">
                      Leader Inspection Sign-Off
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Sign off on behalf of {activeInspectionItem.targetKid.name}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveInspectionItem(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Task Summary Banner */}
              <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 flex items-center gap-3">
                <span className="text-2xl">{activeInspectionItem.chore.icon || '⭐'}</span>
                <div className="min-w-0 flex-1">
                  <h4 className="font-black text-sm text-slate-900 dark:text-white truncate">
                    {activeInspectionItem.chore.title}
                  </h4>
                  <div className="text-xs text-slate-600 dark:text-slate-300 font-bold flex items-center gap-2">
                    <span>Sibling: {activeInspectionItem.targetKid.name}</span>
                    <span>•</span>
                    <span className="text-amber-600 font-black">
                      {activeInspectionItem.chore.stars > 0 ? `+${activeInspectionItem.chore.stars} Stars` : '0 Stars (Routine)'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Choose Praise Stamp Preset */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700 dark:text-slate-200 block">
                  Select Official Approval Stamp:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {STAMP_PRESETS.map((stamp) => {
                    const isSelected = selectedStamp === stamp.id;
                    return (
                      <button
                        key={stamp.id}
                        type="button"
                        onClick={() => {
                          sound.playTap();
                          setSelectedStamp(stamp.id);
                        }}
                        className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                          isSelected
                            ? `${stamp.border} ring-2 ring-amber-400/50 font-black shadow-xs`
                            : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <span className="text-lg">{stamp.icon}</span>
                        <span className="text-xs leading-tight">{stamp.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quick Praise Comment Preset */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700 dark:text-slate-200 block">
                  Encouraging Feedback Note:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {PRAISE_PRESETS.map((praise, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        sound.playTap();
                        setSelectedPraise(praise);
                        setCustomPraiseNote('');
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        selectedPraise === praise && !customPraiseNote
                          ? 'bg-amber-600 text-white font-black shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-amber-50'
                      }`}
                    >
                      {praise}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Or write custom feedback note..."
                  value={customPraiseNote}
                  onChange={(e) => setCustomPraiseNote(e.target.value)}
                  className="w-full mt-2 px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                />
              </div>

              {/* Stamp Sign-Off Button */}
              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveInspectionItem(null)}
                  className="flex-1 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSignOff}
                  className="flex-2 py-3 rounded-2xl bg-gradient-to-r from-amber-600 to-emerald-600 hover:from-amber-700 hover:to-emerald-700 text-white font-black text-xs sm:text-sm shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>🎖️ Stamp & Sign Off</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* POPUP 2: CHORE DELEGATION / REASSIGNMENT DIALOG */}
      <AnimatePresence>
        {delegatingChore && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 15 }}
              className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border-2 border-purple-400 dark:border-purple-600 shadow-2xl p-5 sm:p-6 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">👥</span>
                  <div>
                    <h3 className="font-black text-base text-slate-900 dark:text-white">
                      Delegate Chore Mission
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Assign to one or more siblings
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setDelegatingChore(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 flex items-center gap-3">
                <span className="text-2xl">{delegatingChore.icon || '⭐'}</span>
                <div className="min-w-0">
                  <h4 className="font-black text-sm text-slate-900 dark:text-white">
                    {delegatingChore.title}
                  </h4>
                  <span className="text-xs text-purple-700 dark:text-purple-300 font-bold">
                    +{delegatingChore.stars} Stars Reward
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-700 dark:text-slate-300 block">
                  Select Assignees:
                </label>
                <div className="space-y-2">
                  {database.kids.map((kid) => {
                    const isChecked = delegationSelectedKids.includes(kid.id);
                    return (
                      <button
                        key={kid.id}
                        type="button"
                        onClick={() => handleToggleDelegationKid(kid.id)}
                        className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                          isChecked
                            ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-400 text-purple-950 dark:text-purple-100 font-black shadow-xs'
                            : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{kid.avatar}</span>
                          <span className="text-sm font-bold">{kid.name}</span>
                        </div>
                        {isChecked ? (
                          <CheckCircle2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        ) : (
                          <Square className="w-5 h-5 text-slate-400" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setDelegatingChore(null)}
                  className="flex-1 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveDelegation}
                  disabled={delegationSelectedKids.length === 0}
                  className="flex-2 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-black text-xs sm:text-sm shadow-md cursor-pointer"
                >
                  Save Team Assignment
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
