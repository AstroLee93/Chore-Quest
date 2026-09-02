import React, { useState, useMemo, useEffect } from 'react';
import {
  Shield,
  CheckCircle,
  AlertTriangle,
  Clock,
  Plus,
  Edit2,
  Trash2,
  Gift,
  Users,
  Settings,
  Download,
  Upload,
  RotateCcw,
  Sparkles,
  Calendar,
  Filter,
  Check,
  X,
  Star,
  Flame,
  Award,
  ChevronDown,
  FileSpreadsheet,
  HelpCircle,
  RefreshCw,
  Search,
  Lock,
  UtensilsCrossed,
  CheckSquare,
} from 'lucide-react';
import {
  FamilyDatabase,
  KidProfile,
  ChoreCategory,
  ChoreItem,
  ChoreLog,
  RewardItem,
  RewardRedemption,
  AppSettings,
  FrequencyType,
  TimeOfDay,
  DayOfWeek,
} from '../types';
import { getTodayDateString, formatDateDisplay, getKidLevelInfo, exportDatabaseJSON, importDatabaseJSON } from '../utils/storage';
import { sound } from '../utils/sound';
import { EmojiPicker } from './EmojiPicker';
import { ActionMenu } from './ActionMenu';

import { CalendarView } from './Calendar/CalendarView';
import { FamilyGoalBanner } from './FamilyGoalBanner';
import { FamilyGoalModal } from './FamilyGoalModal';
import { WeeklyMenuModal } from './WeeklyMenuModal';

interface ParentDashboardProps {
  database: FamilyDatabase;
  onUpdateDatabase: (updated: FamilyDatabase) => void;
  onExitParentMode: () => void;
  onOpenPiGuide: () => void;
  onOpenCalendar?: () => void;
}

export const ParentDashboard: React.FC<ParentDashboardProps> = ({
  database,
  onUpdateDatabase,
  onExitParentMode,
  onOpenPiGuide,
  onOpenCalendar,
}) => {
  const [activeTab, setActiveTab] = useState<'activity' | 'calendar' | 'menu' | 'chores' | 'rewards' | 'kids' | 'settings'>('activity');
  const [isGoalModalOpen, setIsGoalModalOpen] = useState<boolean>(false);
  const todayStr = getTodayDateString();

  // 2-Minute Inactivity Auto-Lock Timeout
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        onExitParentMode();
      }, 2 * 60 * 1000); // 2 minutes
    };

    const activityEvents = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
    activityEvents.forEach((event) => {
      window.addEventListener(event, resetTimer, { passive: true });
    });

    resetTimer();

    return () => {
      clearTimeout(timeoutId);
      activityEvents.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [onExitParentMode]);

  // Filter states for Activity Log
  const [activityDateFilter, setActivityDateFilter] = useState<string>(todayStr);
  const [activityKidFilter, setActivityKidFilter] = useState<string>('all');
  const [activityStatusFilter, setActivityStatusFilter] = useState<'all' | 'completed' | 'skipped' | 'pending'>('all');

  // Modals for Editing/Creating
  const [editingChore, setEditingChore] = useState<Partial<ChoreItem> | null>(null);
  const [editingCategory, setEditingCategory] = useState<Partial<ChoreCategory> | null>(null);
  const [editingReward, setEditingReward] = useState<Partial<RewardItem> | null>(null);
  const [editingKid, setEditingKid] = useState<Partial<KidProfile> | null>(null);
  const [bonusStarModalKid, setBonusStarModalKid] = useState<KidProfile | null>(null);
  const [bonusStarsAmount, setBonusStarsAmount] = useState<number>(5);
  const [bonusStarReason, setBonusStarReason] = useState<string>('Great attitude and helpfulness!');

  // Settings form state
  const [settingsForm, setSettingsForm] = useState<AppSettings>(database.settings);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<boolean>(false);
  const [settingsSaved, setSettingsSaved] = useState<boolean>(false);

  // --- Handlers for Activity Log ---
  const handleToggleParentVerification = (logId: string) => {
    sound.playTap();
    const updatedLogs = database.logs.map((l) => {
      if (l.id === logId) {
        return { ...l, verifiedByParent: !l.verifiedByParent };
      }
      return l;
    });
    onUpdateDatabase({ ...database, logs: updatedLogs });
  };

  const handleReopenTask = (logId: string) => {
    sound.playTap();
    const targetLog = database.logs.find((l) => l.id === logId);
    if (!targetLog) return;

    // Refund awarded stars if removing completed status
    let updatedKids = database.kids;
    if (targetLog.status === 'completed' && targetLog.starsAwarded > 0) {
      updatedKids = database.kids.map((k) => {
        if (k.id === targetLog.kidId) {
          return {
            ...k,
            stars: Math.max(0, k.stars - targetLog.starsAwarded),
            lifetimeStars: Math.max(0, k.lifetimeStars - targetLog.starsAwarded),
          };
        }
        return k;
      });
    }

    const updatedLogs = database.logs.filter((l) => l.id !== logId);
    onUpdateDatabase({ ...database, logs: updatedLogs, kids: updatedKids });
  };

  const handleAwardBonusStars = () => {
    if (!bonusStarModalKid) return;
    sound.playStarEarned();

    const updatedKids = database.kids.map((k) => {
      if (k.id === bonusStarModalKid.id) {
        return {
          ...k,
          stars: k.stars + bonusStarsAmount,
          lifetimeStars: k.lifetimeStars + bonusStarsAmount,
        };
      }
      return k;
    });

    onUpdateDatabase({ ...database, kids: updatedKids });
    setBonusStarModalKid(null);
  };

  // --- Handlers for Chores ---
  const handleSaveChore = (chore: Partial<ChoreItem>) => {
    sound.playTap();
    if (!chore.title?.trim() || !chore.categoryId) return;

    let updatedChores: ChoreItem[];
    if (chore.id) {
      // Edit existing
      updatedChores = database.chores.map((c) => (c.id === chore.id ? (chore as ChoreItem) : c));
    } else {
      // New chore
      const newChore: ChoreItem = {
        id: `chore-${Date.now()}`,
        categoryId: chore.categoryId,
        title: chore.title.trim(),
        description: chore.description?.trim() || '',
        icon: chore.icon || '⭐',
        stars: chore.stars || 3,
        assignedKidIds: chore.assignedKidIds && chore.assignedKidIds.length > 0 ? chore.assignedKidIds : ['all'],
        frequency: chore.frequency || 'daily',
        specificDays: chore.specificDays || [1, 2, 3, 4, 5],
        timeOfDay: chore.timeOfDay || 'anytime',
        isActive: chore.isActive ?? true,
        order: database.chores.length + 1,
      };
      updatedChores = [...database.chores, newChore];
    }

    onUpdateDatabase({ ...database, chores: updatedChores });
    setEditingChore(null);
  };

  const handleDeleteChore = (choreId: string) => {
    sound.playTap();
    if (confirm('Are you sure you want to delete this chore?')) {
      const updatedChores = database.chores.filter((c) => c.id !== choreId);
      onUpdateDatabase({ ...database, chores: updatedChores });
    }
  };

  const handleToggleChoreActive = (choreId: string) => {
    sound.playTap();
    const updatedChores = database.chores.map((c) => {
      if (c.id === choreId) {
        return { ...c, isActive: !c.isActive };
      }
      return c;
    });
    onUpdateDatabase({ ...database, chores: updatedChores });
  };

  // --- Handlers for Categories ---
  const handleSaveCategory = (cat: Partial<ChoreCategory>) => {
    sound.playTap();
    if (!cat.name?.trim()) return;

    let updatedCategories: ChoreCategory[];
    if (cat.id) {
      updatedCategories = database.categories.map((c) => (c.id === cat.id ? (cat as ChoreCategory) : c));
    } else {
      const newCat: ChoreCategory = {
        id: `cat-${Date.now()}`,
        name: cat.name.trim(),
        icon: cat.icon || 'Sun',
        color: cat.color || '#f59e0b',
        description: cat.description?.trim() || '',
        order: database.categories.length + 1,
      };
      updatedCategories = [...database.categories, newCat];
    }
    onUpdateDatabase({ ...database, categories: updatedCategories });
    setEditingCategory(null);
  };

  const handleDeleteCategory = (catId: string) => {
    sound.playTap();
    if (confirm('Deleting this category will also affect chores in this category. Continue?')) {
      const updatedCategories = database.categories.filter((c) => c.id !== catId);
      const updatedChores = database.chores.filter((c) => c.categoryId !== catId);
      onUpdateDatabase({ ...database, categories: updatedCategories, chores: updatedChores });
    }
  };

  // --- Handlers for Rewards & Claims ---
  const handleSaveReward = (reward: Partial<RewardItem>) => {
    sound.playTap();
    if (!reward.title?.trim() || !reward.starCost) return;

    let updatedRewards: RewardItem[];
    if (reward.id) {
      updatedRewards = database.rewards.map((r) => (r.id === reward.id ? (reward as RewardItem) : r));
    } else {
      const newReward: RewardItem = {
        id: `rew-${Date.now()}`,
        title: reward.title.trim(),
        description: reward.description?.trim() || '',
        icon: reward.icon || '🎁',
        starCost: Number(reward.starCost) || 20,
        category: reward.category || 'treat',
        maxPerWeek: reward.maxPerWeek || 1,
        isActive: reward.isActive ?? true,
      };
      updatedRewards = [...database.rewards, newReward];
    }
    onUpdateDatabase({ ...database, rewards: updatedRewards });
    setEditingReward(null);
  };

  const handleDeleteReward = (rewardId: string) => {
    sound.playTap();
    if (confirm('Delete this reward from the store?')) {
      const updatedRewards = database.rewards.filter((r) => r.id !== rewardId);
      onUpdateDatabase({ ...database, rewards: updatedRewards });
    }
  };

  const handleUpdateRedemptionStatus = (redemptionId: string, newStatus: 'approved' | 'fulfilled' | 'rejected') => {
    sound.playTap();
    const targetRedemption = database.redemptions.find((r) => r.id === redemptionId);
    if (!targetRedemption) return;

    let updatedKids = database.kids;
    // If rejecting a claim, refund stars to child
    if (newStatus === 'rejected' && targetRedemption.status !== 'rejected') {
      updatedKids = database.kids.map((k) => {
        if (k.id === targetRedemption.kidId) {
          return { ...k, stars: k.stars + targetRedemption.starCost };
        }
        return k;
      });
    }

    const updatedRedemptions = database.redemptions.map((r) => {
      if (r.id === redemptionId) {
        return { ...r, status: newStatus };
      }
      return r;
    });

    onUpdateDatabase({ ...database, redemptions: updatedRedemptions, kids: updatedKids });
  };

  // --- Handlers for Kids ---
  const handleResetKidPin = (kidId: string, newPin: string) => {
    sound.playTap();
    const sanitized = newPin.replace(/\D/g, '').slice(0, 4) || '1234';
    const updatedKids = database.kids.map((k) =>
      k.id === kidId ? { ...k, pin: sanitized } : k
    );
    onUpdateDatabase({ ...database, kids: updatedKids });
  };

  const handleSaveKid = (kid: Partial<KidProfile>) => {
    sound.playTap();
    if (!kid.name?.trim()) return;

    const sanitizedPin = kid.pin ? kid.pin.replace(/\D/g, '').slice(0, 4) : '1234';

    let updatedKids: KidProfile[];
    if (kid.id) {
      updatedKids = database.kids.map((k) =>
        k.id === kid.id
          ? ({
              ...k,
              ...kid,
              pin: sanitizedPin || k.pin || '1234',
            } as KidProfile)
          : k
      );
    } else {
      const newKid: KidProfile = {
        id: `kid-${Date.now()}`,
        name: kid.name.trim(),
        avatar: kid.avatar || '⭐',
        color: kid.color || '#3b82f6',
        pin: sanitizedPin || '1234',
        stars: Number(kid.stars) || 0,
        lifetimeStars: Number(kid.stars) || 0,
        streakDays: 0,
        lastActiveDate: todayStr,
      };
      updatedKids = [...database.kids, newKid];
    }
    onUpdateDatabase({ ...database, kids: updatedKids });
    setEditingKid(null);
  };

  const handleDeleteKid = (kidId: string) => {
    sound.playTap();
    if (confirm('Are you sure you want to remove this child profile?')) {
      const updatedKids = database.kids.filter((k) => k.id !== kidId);
      onUpdateDatabase({ ...database, kids: updatedKids });
    }
  };

  const handleAdjustKidStars = (kidId: string, amount: number) => {
    sound.playTap();
    const updatedKids = database.kids.map((k) => {
      if (k.id === kidId) {
        const newStars = Math.max(0, k.stars + amount);
        const newLifetime = amount > 0 ? k.lifetimeStars + amount : k.lifetimeStars;
        return { ...k, stars: newStars, lifetimeStars: newLifetime };
      }
      return k;
    });
    onUpdateDatabase({ ...database, kids: updatedKids });
  };

  // --- Handlers for Settings & Backup ---
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playTap();
    const updatedSettings = {
      ...settingsForm,
      isDefaultPin: settingsForm.parentPin === '1234' ? (database.settings.isDefaultPin ?? false) : false,
    };
    onUpdateDatabase({ ...database, settings: updatedSettings });
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2500);
  };

  const handleExportJSON = () => {
    sound.playTap();
    const jsonStr = exportDatabaseJSON(database);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chorequest-backup-${todayStr}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportError(null);
    setImportSuccess(false);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const importedDB = importDatabaseJSON(content);
        onUpdateDatabase(importedDB);
        setSettingsForm(importedDB.settings);
        setImportSuccess(true);
        sound.playUnlock();
        setTimeout(() => setImportSuccess(false), 3000);
      } catch (err) {
        console.error('Import failed:', err);
        setImportError('Invalid backup file. Please select a valid ChoreQuest JSON file.');
      }
    };
    reader.readAsText(file);
  };

  // Computed: Filtered Activity Logs
  const filteredLogs = useMemo(() => {
    return database.logs
      .filter((l) => {
        if (activityDateFilter && l.date !== activityDateFilter) return false;
        if (activityKidFilter !== 'all' && l.kidId !== activityKidFilter) return false;
        if (activityStatusFilter !== 'all' && l.status !== activityStatusFilter) return false;
        return true;
      })
      .sort((a, b) => (b.completedAt || '').localeCompare(a.completedAt || ''));
  }, [database.logs, activityDateFilter, activityKidFilter, activityStatusFilter]);

  return (
    <div className="w-full max-w-6xl mx-auto p-0 sm:px-4 sm:py-4 space-y-1 sm:space-y-4">
      {/* Parent Header Banner - Sleek, zero-padding edge-to-edge on mobile */}
      <div className="bg-indigo-900 rounded-none sm:rounded-2xl p-2.5 sm:p-5 text-white shadow-none sm:shadow-lg border-x-0 border-t-0 sm:border-2 border-yellow-300 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 sm:gap-3.5 min-w-0">
          <div className="w-9 h-9 sm:w-14 sm:h-14 rounded-xl bg-yellow-400 text-slate-900 flex items-center justify-center text-xl sm:text-3xl font-black shadow-sm transform -rotate-2 border-2 border-yellow-200 shrink-0">
            🛡️
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] sm:text-xs font-black uppercase tracking-wider bg-pink-500/90 text-white px-2 sm:px-2.5 py-0.2 sm:py-0.5 rounded-full border border-pink-300">
                Parent Admin Hub
              </span>
            </div>
            <h1 className="text-sm sm:text-2xl font-black tracking-tight mt-0.5 text-yellow-300 italic truncate">
              Family Chore Management
            </h1>
            <p className="hidden sm:block text-xs sm:text-sm text-indigo-100 font-bold mt-0.5">
              Review completed & skipped tasks, configure chore schedules, manage reward store & kids.
            </p>
          </div>
        </div>

        <button
          id="btn-parent-exit-top"
          onClick={() => {
            sound.playTap();
            onExitParentMode();
          }}
          className="px-2.5 py-1.5 sm:px-4 sm:py-2.5 rounded-xl bg-pink-500 hover:bg-pink-600 border border-pink-300 text-xs sm:text-sm font-black text-white transition-transform active:scale-95 cursor-pointer shrink-0 whitespace-nowrap shadow-xs"
        >
          ← Return to Kid View
        </button>
      </div>

      {/* Shared Family Goal Banner */}
      <FamilyGoalBanner
        database={database}
        isParentMode={true}
        className="rounded-none sm:rounded-2xl border-x-0 sm:border-2 shadow-none sm:shadow-xs p-2 sm:p-3"
        onEditGoal={() => {
          sound.playTap();
          setIsGoalModalOpen(true);
        }}
      />

      {/* Navigation Tabs - Edge-to-edge compact mobile strip */}
      <div className="flex gap-1 sm:gap-1.5 overflow-x-auto p-1 sm:p-1.5 rounded-none sm:rounded-xl bg-yellow-200/80 border-x-0 border-y sm:border-2 border-yellow-300 shadow-none sm:shadow-2xs scrollbar-none">
        {[
          { id: 'activity', label: 'Daily Review & Audit', icon: CheckCircle, badge: database.logs.filter((l) => l.date === todayStr).length },
          { id: 'menu', label: 'Dinner Menu', icon: UtensilsCrossed },
          { id: 'calendar', label: 'Yearly Calendar', icon: Calendar, badge: (database.events || []).length },
          { id: 'chores', label: 'Chores & Categories', icon: FileSpreadsheet, badge: database.chores.length },
          { id: 'rewards', label: 'Rewards & Claims', icon: Gift, badge: database.redemptions.filter((r) => r.status === 'pending').length || undefined },
          { id: 'kids', label: 'Kids Profiles', icon: Users, badge: database.kids.length },
          { id: 'settings', label: 'Settings & Pi Backup', icon: Settings },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`tab-parent-${tab.id}`}
              onClick={() => {
                sound.playTap();
                setActiveTab(tab.id as typeof activeTab);
              }}
              className={`flex items-center gap-1 sm:gap-1.5 px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-black whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-indigo-900 text-white shadow-xs'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-yellow-300/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={`text-[10px] sm:text-[11px] px-1.5 sm:px-2 py-0.2 sm:py-0.5 rounded-full font-black ${
                    isActive ? 'bg-pink-500 text-white' : 'bg-white text-slate-800 border border-yellow-300'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: DAILY REVIEW & AUDIT LOG */}
      {activeTab === 'activity' && (
        <div className="space-y-1 sm:space-y-4 animate-fade-in">
          {/* Filter Bar */}
          <div className="bg-white p-2 sm:p-4 rounded-none sm:rounded-2xl border-x-0 border-y sm:border-2 border-indigo-300 sm:border-indigo-400 shadow-none sm:shadow-2xs space-y-1.5 sm:space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-3">
              <div>
                <h3 className="font-black text-slate-800 text-xs sm:text-base flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-indigo-600" />
                  Chore Verification & Incomplete Reasons
                </h3>
                <p className="hidden sm:block text-xs text-slate-500 font-bold">
                  Inspect task completions and reasons submitted by your kids when tasks couldn't be done.
                </p>
              </div>

              {/* Date selector quick buttons */}
              <div className="flex items-center gap-1.5">
                <input
                  type="date"
                  value={activityDateFilter}
                  onChange={(e) => setActivityDateFilter(e.target.value)}
                  className="px-2 py-1 rounded-lg border border-yellow-300 text-xs font-black text-slate-700 focus:outline-indigo-500 bg-yellow-50"
                />
                <button
                  onClick={() => setActivityDateFilter(todayStr)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-black border transition-colors cursor-pointer ${
                    activityDateFilter === todayStr
                      ? 'bg-indigo-900 text-white border-indigo-900'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  Today
                </button>
              </div>
            </div>

            {/* Sub-Filters */}
            <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 pt-1.5 border-t border-slate-100 text-[11px] sm:text-xs">
              <span className="text-slate-400 font-black uppercase tracking-wider text-[10px] sm:text-xs">Kid:</span>
              <button
                onClick={() => setActivityKidFilter('all')}
                className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg font-black transition-colors cursor-pointer ${
                  activityKidFilter === 'all' ? 'bg-indigo-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                All Kids
              </button>
              {database.kids.map((k) => (
                <button
                  key={k.id}
                  onClick={() => setActivityKidFilter(k.id)}
                  className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg font-black flex items-center gap-1 transition-colors cursor-pointer ${
                    activityKidFilter === k.id ? 'bg-indigo-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <span>{k.avatar}</span>
                  <span>{k.name}</span>
                </button>
              ))}

              <span className="text-slate-400 font-black uppercase tracking-wider text-[10px] sm:text-xs ml-auto">Status:</span>
              {(['all', 'completed', 'skipped'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setActivityStatusFilter(st)}
                  className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg font-black capitalize transition-colors cursor-pointer ${
                    activityStatusFilter === st ? 'bg-indigo-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Activity Logs Feed */}
          <div className="space-y-1 sm:space-y-2">
            {filteredLogs.length === 0 ? (
              <div className="bg-white rounded-none sm:rounded-2xl p-6 sm:p-10 text-center border-x-0 border-y sm:border-2 border-dashed border-slate-200">
                <div className="text-3xl mb-1">📋</div>
                <h4 className="font-black text-slate-800 text-sm sm:text-base">No activity logged for this date</h4>
                <p className="text-[11px] sm:text-xs text-slate-500 font-bold mt-0.5 max-w-sm mx-auto">
                  When your kids check off completed chores or submit reasons for skipped tasks, they will appear here.
                </p>
              </div>
            ) : (
              filteredLogs.map((log) => {
                const chore = database.chores.find((c) => c.id === log.choreId);
                const kid = database.kids.find((k) => k.id === log.kidId);
                const isCompleted = log.status === 'completed';
                const isSkipped = log.status === 'skipped';

                return (
                  <div
                    key={log.id}
                    className={`p-2 sm:p-3.5 rounded-none sm:rounded-xl border-x-0 border-y sm:border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-3 ${
                      isCompleted
                        ? 'bg-white border-emerald-400 sm:border-t-2 sm:border-l-2 sm:border-t-emerald-100 sm:border-l-emerald-100'
                        : isSkipped
                        ? 'bg-orange-50/70 border-orange-400 sm:border-t-2 sm:border-l-2 sm:border-t-orange-100 sm:border-l-orange-100'
                        : 'bg-white border-slate-300 sm:border-t-2 sm:border-l-2 sm:border-t-slate-100 sm:border-l-slate-100'
                    }`}
                  >
                    {/* Left: Kid & Chore details */}
                    <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                      <div
                        className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center text-lg sm:text-2xl shrink-0 shadow-2xs border border-white"
                        style={{ backgroundColor: `${kid?.color || '#f59e0b'}30` }}
                      >
                        {kid?.avatar || '⭐'}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-black text-slate-800 text-xs sm:text-sm">
                            {kid?.name || 'Child'}
                          </span>
                          <span className="text-slate-400 text-xs">•</span>
                          <span className="text-xs font-bold text-slate-700 truncate max-w-[140px] sm:max-w-none">
                            {chore?.title || 'Chore'}
                          </span>

                          {/* Status Badge */}
                          {isCompleted && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] sm:text-[11px] font-black px-2 py-0.2 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                              <Check className="w-3 h-3 stroke-[3]" />
                              +{log.starsAwarded} ⭐
                            </span>
                          )}

                          {isSkipped && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] sm:text-[11px] font-black px-2 py-0.2 rounded-full bg-orange-100 text-orange-900 border border-orange-300">
                              <AlertTriangle className="w-3 h-3 text-orange-600" />
                              Skipped
                            </span>
                          )}
                        </div>

                        {/* Skipped Reason Box */}
                        {isSkipped && (
                          <div className="mt-1 p-1.5 sm:p-2 rounded-lg bg-orange-100/70 border border-orange-200 text-[11px] text-orange-900">
                            <div className="font-black flex items-center gap-1">
                              <span>Reason:</span>
                              <span className="uppercase text-[9px] font-black bg-orange-200 px-1.5 py-0.2 rounded-full">
                                {log.skippedReasonCategory?.replace('_', ' ')}
                              </span>
                            </div>
                            {log.skippedReason && (
                              <p className="mt-0.5 text-orange-950 font-bold italic">
                                "{log.skippedReason}"
                              </p>
                            )}
                          </div>
                        )}

                        {/* Timestamp */}
                        {log.completedAt && (
                          <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                            {new Date(log.completedAt).toLocaleTimeString(undefined, {
                              hour: 'numeric',
                              minute: '2-digit',
                            })}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right: Parent Verification & Action buttons */}
                    <div className="flex items-center gap-1.5 shrink-0 justify-end pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      {isCompleted && (
                        <span
                          className={`px-2 py-0.5 rounded-lg text-[10px] sm:text-[11px] font-black border flex items-center gap-0.5 ${
                            log.verifiedByParent
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          <Check className="w-3 h-3 stroke-[3]" />
                          <span>{log.verifiedByParent ? 'Verified' : 'Unverified'}</span>
                        </span>
                      )}

                      <ActionMenu
                        id={`menu-log-${log.id}`}
                        label="Menu"
                        items={[
                          ...(isCompleted
                            ? [
                                {
                                  id: 'verify',
                                  label: log.verifiedByParent ? 'Unmark Verified' : 'Mark Verified',
                                  icon: <Check className="w-3.5 h-3.5" />,
                                  variant: (log.verifiedByParent ? 'default' : 'success') as 'default' | 'success',
                                  onClick: () => handleToggleParentVerification(log.id),
                                },
                              ]
                            : []),
                          ...(kid
                            ? [
                                {
                                  id: 'bonus',
                                  label: 'Award Bonus Stars',
                                  icon: <Sparkles className="w-3.5 h-3.5" />,
                                  variant: 'warning' as const,
                                  onClick: () => {
                                    setBonusStarModalKid(kid);
                                    setBonusStarsAmount(5);
                                    setBonusStarReason(`Great job on ${chore?.title || 'chores'}!`);
                                  },
                                },
                              ]
                            : []),
                          {
                            id: 'reset',
                            label: 'Reset / Reopen Task',
                            icon: <RotateCcw className="w-3.5 h-3.5" />,
                            variant: 'danger' as const,
                            onClick: () => handleReopenTask(log.id),
                          },
                        ]}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB: YEARLY ACTIVITY & WEATHER CALENDAR */}
      {activeTab === 'calendar' && (
        <CalendarView
          database={database}
          activeKid={null}
          onUpdateDatabase={onUpdateDatabase}
          onClose={() => setActiveTab('activity')}
        />
      )}

      {/* TAB: WEEKLY DINNER MENU & MEAL VOTING PLANNER */}
      {activeTab === 'menu' && (
        <WeeklyMenuModal
          isOpen={true}
          onClose={() => setActiveTab('activity')}
          database={database}
          onUpdateDatabase={onUpdateDatabase}
          isParentMode={true}
        />
      )}

      {/* TAB 2: CHORES & CATEGORIES MANAGER */}
      {activeTab === 'chores' && (
        <div className="space-y-1 sm:space-y-4 animate-fade-in">
          {/* Categories Management Section */}
          <div className="bg-white p-2 sm:p-5 rounded-none sm:rounded-2xl border-x-0 border-y sm:border-2 border-yellow-400 shadow-none sm:shadow-2xs space-y-1.5 sm:space-y-3">
            <div className="flex items-center justify-between gap-1.5">
              <div>
                <h3 className="font-black text-slate-800 text-xs sm:text-base">
                  Chore Categories ({database.categories.length})
                </h3>
                <p className="hidden sm:block text-xs text-slate-500 font-bold">
                  Organize daily missions by room, routine, or time of day.
                </p>
              </div>
              <button
                id="btn-add-category"
                onClick={() => {
                  sound.playTap();
                  setEditingCategory({});
                }}
                className="px-2.5 py-1 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl bg-indigo-900 hover:bg-indigo-800 text-white font-black text-xs flex items-center gap-1 transition-all shadow-xs active:scale-95 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>Add Category</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1 sm:gap-2.5">
              {database.categories.map((cat) => (
                <div
                  key={cat.id}
                  className="p-2 sm:p-3 rounded-lg sm:rounded-xl border border-slate-200 flex items-center justify-between gap-2 hover:border-yellow-400 transition-colors bg-white shadow-none sm:shadow-2xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center text-sm sm:text-base shrink-0 border border-white shadow-2xs"
                      style={{ backgroundColor: `${cat.color}30` }}
                    >
                      {cat.color === '#f59e0b' ? '🌅' : cat.color === '#8b5cf6' ? '🛏️' : cat.color === '#3b82f6' ? '📚' : '🏠'}
                    </div>
                    <div className="min-w-0">
                      <div className="font-black text-xs sm:text-sm text-slate-800 truncate">
                        {cat.name}
                      </div>
                      <div className="text-[10px] sm:text-[11px] text-slate-400 font-bold truncate">
                        {database.chores.filter((c) => c.categoryId === cat.id).length} chores
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <ActionMenu
                      id={`menu-cat-${cat.id}`}
                      label="Menu"
                      items={[
                        {
                          id: 'edit',
                          label: 'Edit Category',
                          icon: <Edit2 className="w-3.5 h-3.5" />,
                          onClick: () => setEditingCategory(cat),
                        },
                        {
                          id: 'delete',
                          label: 'Delete Category',
                          icon: <Trash2 className="w-3.5 h-3.5" />,
                          variant: 'danger',
                          onClick: () => handleDeleteCategory(cat.id),
                        },
                      ]}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chores Management Section */}
          <div className="bg-white p-2 sm:p-5 rounded-none sm:rounded-2xl border-x-0 border-y sm:border-2 border-indigo-400 shadow-none sm:shadow-2xs space-y-1.5 sm:space-y-3">
            <div className="flex items-center justify-between gap-1.5">
              <div>
                <h3 className="font-black text-slate-800 text-xs sm:text-base">
                  Tasks & Chores List ({database.chores.length})
                </h3>
                <p className="hidden sm:block text-xs text-slate-500 font-bold">
                  Assign chore frequencies, star point values, and assign to specific kids.
                </p>
              </div>
              <button
                id="btn-add-chore"
                onClick={() => {
                  sound.playTap();
                  setEditingChore({
                    categoryId: database.categories[0]?.id || '',
                    stars: 3,
                    frequency: 'daily',
                    timeOfDay: 'morning',
                    assignedKidIds: ['all'],
                    isActive: true,
                  });
                }}
                className="px-2.5 py-1 sm:px-4 sm:py-2.5 rounded-lg sm:rounded-xl bg-indigo-900 hover:bg-indigo-800 text-white font-black text-xs sm:text-sm flex items-center gap-1 transition-all shadow-xs active:scale-95 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>Create Chore</span>
              </button>
            </div>

            {/* Chore List Cards */}
            <div className="space-y-1 sm:space-y-2">
              {database.chores.map((chore) => {
                const category = database.categories.find((c) => c.id === chore.categoryId);
                return (
                  <div
                    key={chore.id}
                    className={`p-2 sm:p-3 rounded-none sm:rounded-xl border-x-0 border-y sm:border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2.5 ${
                      chore.isActive
                        ? 'bg-white border-slate-200 hover:border-yellow-400 shadow-none sm:shadow-2xs'
                        : 'bg-slate-50 border-slate-200 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                      <span className="text-lg sm:text-2xl p-1 sm:p-1.5 rounded-xl bg-yellow-100 border border-yellow-300 shadow-2xs shrink-0">
                        {chore.icon || '⭐'}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-black text-slate-800 text-xs sm:text-sm truncate max-w-[180px] sm:max-w-none">
                            {chore.title}
                          </span>
                          <span className="inline-flex items-center gap-0.5 px-2 py-0.2 rounded-full text-[10px] sm:text-xs font-black bg-yellow-400 text-slate-900 border border-yellow-300">
                            ⭐ {chore.stars}
                          </span>
                          <span className="text-[10px] sm:text-xs font-bold px-1.5 py-0.2 rounded-md bg-slate-100 text-slate-700">
                            {category?.name || 'Uncategorized'}
                          </span>
                          <span className="text-[10px] sm:text-xs font-bold px-1.5 py-0.2 rounded-md bg-indigo-50 text-indigo-700 capitalize">
                            {chore.frequency}
                          </span>
                          <span className="text-[10px] sm:text-xs font-bold px-1.5 py-0.2 rounded-md bg-pink-50 text-pink-700 capitalize">
                            {chore.timeOfDay}
                          </span>
                        </div>
                        {chore.description && (
                          <p className="text-[11px] text-slate-500 font-bold mt-0.5 truncate">{chore.description}</p>
                        )}
                        <div className="text-[10px] text-slate-400 font-bold mt-0.5 truncate">
                          Assigned:{' '}
                          {chore.assignedKidIds?.includes('all')
                            ? 'All Kids'
                            : chore.assignedKidIds
                                ?.map((kidId) => database.kids.find((k) => k.id === kidId)?.name)
                                .filter(Boolean)
                                .join(', ') || 'All Kids'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 justify-end shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      <span
                        className={`px-2 py-0.5 rounded-lg text-[10px] sm:text-xs font-black ${
                          chore.isActive
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {chore.isActive ? 'Active' : 'Paused'}
                      </span>

                      <ActionMenu
                        id={`menu-chore-${chore.id}`}
                        label="Menu"
                        items={[
                          {
                            id: 'toggle-active',
                            label: chore.isActive ? 'Pause Chore' : 'Activate Chore',
                            icon: chore.isActive ? <X className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />,
                            variant: chore.isActive ? 'warning' : 'success',
                            onClick: () => handleToggleChoreActive(chore.id),
                          },
                          {
                            id: 'edit',
                            label: 'Edit Chore',
                            icon: <Edit2 className="w-3.5 h-3.5" />,
                            onClick: () => setEditingChore(chore),
                          },
                          {
                            id: 'delete',
                            label: 'Delete Chore',
                            icon: <Trash2 className="w-3.5 h-3.5" />,
                            variant: 'danger',
                            onClick: () => handleDeleteChore(chore.id),
                          },
                        ]}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: REWARDS & CLAIMS */}
      {activeTab === 'rewards' && (
        <div className="space-y-1 sm:space-y-4 animate-fade-in">
          {/* Pending Kid Claims Queue */}
          <div className="bg-white p-2 sm:p-5 rounded-none sm:rounded-2xl border-x-0 border-y sm:border-2 border-pink-400 shadow-none sm:shadow-2xs space-y-1.5 sm:space-y-3">
            <div>
              <h3 className="font-black text-slate-800 text-xs sm:text-base flex items-center gap-1.5">
                <Gift className="w-4 h-4 text-pink-500" />
                Kid Reward Claims Queue ({database.redemptions.length})
              </h3>
              <p className="hidden sm:block text-xs text-slate-500 font-bold">
                Approve, mark fulfilled, or refund star purchases from the Reward Store.
              </p>
            </div>

            {database.redemptions.length === 0 ? (
              <div className="text-center py-4 sm:py-6 text-slate-400 bg-yellow-50/50 rounded-lg sm:rounded-xl border border-dashed border-yellow-200">
                <Gift className="w-6 h-6 mx-auto mb-1 opacity-40 text-pink-500" />
                <p className="text-xs font-bold text-slate-600">No reward claims submitted yet.</p>
              </div>
            ) : (
              <div className="space-y-1 sm:space-y-2">
                {database.redemptions.map((redemption) => {
                  const kid = database.kids.find((k) => k.id === redemption.kidId);
                  return (
                    <div
                      key={redemption.id}
                      className="p-2 sm:p-3 rounded-none sm:rounded-xl border-x-0 border-y sm:border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-3 bg-white shadow-none sm:shadow-2xs"
                    >
                      <div className="flex items-center gap-2 sm:gap-3">
                        <span className="text-xl sm:text-2xl p-1 sm:p-1.5 rounded-xl bg-yellow-100 border border-yellow-300 shrink-0">
                          {redemption.rewardIcon || '🎁'}
                        </span>
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-black text-xs sm:text-sm text-slate-800">
                              {redemption.rewardTitle}
                            </span>
                            <span className="text-[10px] sm:text-xs font-black text-slate-900 bg-yellow-400 px-2 py-0.2 rounded-full border border-yellow-300">
                              {redemption.starCost} ⭐
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 font-bold">
                            Claimed by <strong>{kid?.name}</strong> •{' '}
                            {new Date(redemption.date).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </div>
                          {redemption.notes && (
                            <div className="text-[11px] text-pink-700 font-bold italic mt-0.5">
                              "{redemption.notes}"
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 justify-end shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                        {redemption.status === 'pending' ? (
                          <ActionMenu
                            id={`menu-redemption-${redemption.id}`}
                            label="Review"
                            buttonClassName="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-xs font-black hover:bg-emerald-700 shadow-xs cursor-pointer inline-flex items-center gap-1"
                            items={[
                              {
                                id: 'fulfill',
                                label: 'Approve & Mark Fulfilled',
                                icon: <Check className="w-3.5 h-3.5" />,
                                variant: 'success',
                                onClick: () => handleUpdateRedemptionStatus(redemption.id, 'fulfilled'),
                              },
                              {
                                id: 'refund',
                                label: 'Refund Stars',
                                icon: <RotateCcw className="w-3.5 h-3.5" />,
                                variant: 'danger',
                                onClick: () => handleUpdateRedemptionStatus(redemption.id, 'rejected'),
                              },
                            ]}
                          />
                        ) : (
                          <span
                            className={`px-2 py-0.5 rounded-lg text-[10px] sm:text-xs font-black uppercase tracking-wider ${
                              redemption.status === 'fulfilled'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : 'bg-rose-100 text-rose-800 border border-rose-300'
                            }`}
                          >
                            {redemption.status}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Reward Catalog Management */}
          <div className="bg-white p-2 sm:p-5 rounded-none sm:rounded-2xl border-x-0 border-y sm:border-2 border-yellow-400 shadow-none sm:shadow-2xs space-y-1.5 sm:space-y-3">
            <div className="flex items-center justify-between gap-1.5">
              <div>
                <h3 className="font-black text-slate-800 text-xs sm:text-base">
                  Reward Catalog Items ({database.rewards.length})
                </h3>
                <p className="hidden sm:block text-xs text-slate-500 font-bold">
                  Set up motivating rewards, treats, screen time passes, or allowance bonuses.
                </p>
              </div>
              <button
                id="btn-add-reward"
                onClick={() => {
                  sound.playTap();
                  setEditingReward({
                    starCost: 25,
                    category: 'treat',
                    maxPerWeek: 2,
                    isActive: true,
                  });
                }}
                className="px-2.5 py-1 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl bg-indigo-900 hover:bg-indigo-800 text-white font-black text-xs flex items-center gap-1 transition-all shadow-xs active:scale-95 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>Add Item</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5 sm:gap-3">
              {database.rewards.map((reward) => (
                <div
                  key={reward.id}
                  className="p-2.5 sm:p-3.5 rounded-lg sm:rounded-xl border border-slate-200 flex flex-col justify-between hover:border-yellow-400 transition-all bg-white shadow-none sm:shadow-2xs"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-2xl p-1.5 rounded-xl bg-yellow-100 border border-yellow-300 shadow-2xs">
                        {reward.icon || '🎁'}
                      </span>
                      <span className="font-black text-slate-900 bg-yellow-400 px-2.5 py-0.5 rounded-full text-xs border border-yellow-300">
                        ⭐ {reward.starCost}
                      </span>
                    </div>
                    <h4 className="font-black text-slate-800 text-xs sm:text-sm mb-0.5">{reward.title}</h4>
                    <p className="text-[11px] text-slate-500 font-bold mb-2 line-clamp-2">{reward.description}</p>
                  </div>

                  <div className="flex items-center justify-between pt-1.5 border-t border-slate-100">
                    <span className="text-[10px] text-slate-400 capitalize font-bold">
                      {reward.category.replace('_', ' ')}
                    </span>
                    <div className="flex items-center gap-1">
                      <ActionMenu
                        id={`menu-reward-${reward.id}`}
                        label="Menu"
                        items={[
                          {
                            id: 'edit',
                            label: 'Edit Reward',
                            icon: <Edit2 className="w-3.5 h-3.5" />,
                            onClick: () => setEditingReward(reward),
                          },
                          {
                            id: 'delete',
                            label: 'Delete Reward',
                            icon: <Trash2 className="w-3.5 h-3.5" />,
                            variant: 'danger',
                            onClick: () => handleDeleteReward(reward.id),
                          },
                        ]}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: KIDS PROFILES */}
      {activeTab === 'kids' && (
        <div className="space-y-1 sm:space-y-4 animate-fade-in">
          <div className="bg-white p-2 sm:p-5 rounded-none sm:rounded-2xl border-x-0 border-y sm:border-2 border-indigo-400 shadow-none sm:shadow-2xs space-y-1.5 sm:space-y-3">
            <div className="flex items-center justify-between gap-1.5">
              <div>
                <h3 className="font-black text-slate-800 text-xs sm:text-base">
                  Children Profiles ({database.kids.length})
                </h3>
                <p className="hidden sm:block text-xs text-slate-500 font-bold">
                  Manage avatars, star banks, streak records, and level progression.
                </p>
              </div>
              <button
                id="btn-add-kid"
                onClick={() => {
                  sound.playTap();
                  setEditingKid({
                    avatar: '🦁',
                    color: '#f59e0b',
                    stars: 0,
                  });
                }}
                className="px-2.5 py-1 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl bg-indigo-900 hover:bg-indigo-800 text-white font-black text-xs flex items-center gap-1 transition-all shadow-xs active:scale-95 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>Add Child</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 sm:gap-3">
              {database.kids.map((kid) => {
                const levelInfo = getKidLevelInfo(kid.lifetimeStars);
                return (
                  <div
                    key={kid.id}
                    className="p-2.5 sm:p-4 rounded-lg sm:rounded-2xl border border-slate-200 bg-white flex flex-col justify-between gap-2 sm:gap-3 hover:border-yellow-400 transition-all shadow-none sm:shadow-2xs"
                  >
                    <div className="flex items-start gap-2.5">
                      <div
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-xl sm:text-2xl shrink-0 shadow-2xs border border-white"
                        style={{ backgroundColor: `${kid.color}30` }}
                      >
                        {kid.avatar || '⭐'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-black text-sm sm:text-base text-slate-800 truncate">{kid.name}</h4>
                          <div className="flex items-center gap-1">
                            <ActionMenu
                              id={`menu-kid-${kid.id}`}
                              label="Menu"
                              items={[
                                {
                                  id: 'edit',
                                  label: 'Edit Profile',
                                  icon: <Edit2 className="w-3.5 h-3.5" />,
                                  onClick: () => setEditingKid(kid),
                                },
                                {
                                  id: 'reset-pin',
                                  label: 'Reset PIN',
                                  icon: <Lock className="w-3.5 h-3.5 text-indigo-600" />,
                                  onClick: () => {
                                    const entered = prompt(`Enter new 4-digit PIN for ${kid.name}:`, kid.pin || '1234');
                                    if (entered !== null) {
                                      const sanitized = entered.replace(/\D/g, '').slice(0, 4);
                                      if (sanitized.length === 4) {
                                        handleResetKidPin(kid.id, sanitized);
                                      } else {
                                        alert('PIN must be exactly 4 digits.');
                                      }
                                    }
                                  },
                                },
                                {
                                  id: 'add-stars',
                                  label: 'Award +5 Stars',
                                  icon: <Sparkles className="w-3.5 h-3.5 text-amber-500" />,
                                  variant: 'warning',
                                  onClick: () => handleAdjustKidStars(kid.id, 5),
                                },
                                {
                                  id: 'deduct-stars',
                                  label: 'Subtract -5 Stars',
                                  icon: <Star className="w-3.5 h-3.5" />,
                                  onClick: () => handleAdjustKidStars(kid.id, -5),
                                },
                                {
                                  id: 'delete',
                                  label: 'Delete Profile',
                                  icon: <Trash2 className="w-3.5 h-3.5" />,
                                  variant: 'danger',
                                  onClick: () => handleDeleteKid(kid.id),
                                },
                              ]}
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                          <span className="text-[10px] sm:text-xs font-black px-2 py-0.2 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
                            {levelInfo.icon} Lvl {levelInfo.level}: {levelInfo.title}
                          </span>
                          <span className="text-[10px] sm:text-xs font-black px-2 py-0.2 rounded-full bg-orange-100 text-orange-800 flex items-center gap-0.5 border border-orange-200">
                            <Flame className="w-3 h-3 text-orange-500 fill-orange-500" />
                            {kid.streakDays}d streak
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* PIN Protection & Reset Row */}
                    <div className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className="w-6 h-6 rounded-md bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs">
                          <Lock className="w-3 h-3" />
                        </div>
                        <div>
                          <div className="text-[9px] sm:text-[10px] font-black uppercase text-slate-400">Child Security PIN</div>
                          <div className="text-xs font-black font-mono text-slate-800 tracking-wider">
                            {kid.pin || '1234'}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          const entered = prompt(`Set 4-digit PIN for ${kid.name}:`, kid.pin || '1234');
                          if (entered !== null) {
                            const sanitized = entered.replace(/\D/g, '').slice(0, 4);
                            if (sanitized.length === 4) {
                              handleResetKidPin(kid.id, sanitized);
                            } else {
                              alert('PIN must be exactly 4 digits.');
                            }
                          }
                        }}
                        className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 text-xs font-black cursor-pointer transition-colors"
                      >
                        Reset PIN
                      </button>
                    </div>

                    {/* Star Balance & Quick Adjuster */}
                    <div className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-yellow-50/70 border border-yellow-200 flex items-center justify-between">
                      <div>
                        <div className="text-[10px] sm:text-[11px] text-slate-500 font-black uppercase">Current Star Bank</div>
                        <div className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-1">
                          <span>⭐</span>
                          <span>{kid.stars}</span>
                          <span className="text-[10px] sm:text-xs font-bold text-slate-400 ml-0.5">
                            ({kid.lifetimeStars} life)
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleAdjustKidStars(kid.id, -5)}
                          className="px-2 py-1 rounded-lg bg-white border border-slate-200 text-xs font-black text-slate-700 hover:bg-slate-100 cursor-pointer"
                          title="Subtract 5 stars"
                        >
                          -5
                        </button>
                        <button
                          onClick={() => handleAdjustKidStars(kid.id, 5)}
                          className="px-2.5 py-1 rounded-lg bg-yellow-400 text-slate-900 text-xs font-black hover:bg-yellow-500 shadow-2xs border border-yellow-300 cursor-pointer"
                          title="Add 5 stars"
                        >
                          +5 ⭐
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: SETTINGS & PI HOST GUIDE */}
      {activeTab === 'settings' && (
        <div className="space-y-1 sm:space-y-4 animate-fade-in">
          {/* General App Settings */}
          <form onSubmit={handleSaveSettings} className="bg-white p-2.5 sm:p-6 rounded-none sm:rounded-2xl border-x-0 border-y sm:border-2 border-indigo-400 shadow-none sm:shadow-2xs space-y-2.5 sm:space-y-4">
            <div>
              <h3 className="font-black text-slate-800 text-xs sm:text-base">System & Security Settings</h3>
              <p className="hidden sm:block text-xs text-slate-500 font-bold">Configure parent passcodes, family title, and reward policies.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
              <div>
                <label className="block text-[11px] sm:text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                  Parent 4-Digit Security PIN:
                </label>
                <input
                  type="password"
                  maxLength={4}
                  value={settingsForm.parentPin}
                  onChange={(e) => setSettingsForm({ ...settingsForm, parentPin: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg sm:rounded-xl border border-slate-200 font-mono text-sm font-black text-slate-800 focus:outline-indigo-500 bg-yellow-50/50"
                  required
                />
                <p className="text-[10px] text-slate-400 font-bold mt-0.5">Used to access this parent portal</p>
              </div>

              <div>
                <label className="block text-[11px] sm:text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                  Family Hub Name:
                </label>
                <input
                  type="text"
                  value={settingsForm.familyName}
                  onChange={(e) => setSettingsForm({ ...settingsForm, familyName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg sm:rounded-xl border border-slate-200 text-xs sm:text-sm font-black text-slate-800 focus:outline-indigo-500 bg-yellow-50/50"
                />
                <p className="text-[10px] text-slate-400 font-bold mt-0.5">Shown in the header across mobile and desktop</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              {settingsSaved ? (
                <span className="text-[11px] sm:text-xs font-black text-emerald-600 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 stroke-[3]" /> Saved!
                </span>
              ) : (
                <span />
              )}
              <button
                type="submit"
                id="btn-save-settings"
                className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg sm:rounded-xl bg-indigo-900 hover:bg-indigo-800 text-white font-black text-xs sm:text-sm shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                Save Settings
              </button>
            </div>
          </form>

          {/* Weekly Family Teamwork Goal Management Card */}
          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 p-2.5 sm:p-5 rounded-none sm:rounded-2xl border-x-0 border-y sm:border-2 border-amber-400 shadow-none sm:shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
            <div>
              <h4 className="font-black text-amber-950 text-xs sm:text-base flex items-center gap-1.5">
                🏆 Weekly Family Teamwork Goal & Options
              </h4>
              <p className="text-[11px] sm:text-xs text-amber-900 font-bold mt-0.5 max-w-xl">
                Choose or create custom family rewards, adjust target chores, or add custom presets.
              </p>
              <div className="mt-1.5 flex items-center gap-1.5 text-[11px] sm:text-xs font-black text-slate-700 flex-wrap">
                <span className="bg-amber-200 text-amber-950 px-2 py-0.2 rounded-full border border-amber-300">
                  {database.familyGoal?.title || 'Pizza & Movie Night'}
                </span>
                <span className="text-pink-600 font-extrabold">
                  🎁 {database.familyGoal?.reward || 'Family Movie & Pizza Night'}
                </span>
                <span className="text-slate-500">
                  🎯 {database.familyGoal?.targetChores || 30} chores
                </span>
              </div>
            </div>
            <button
              type="button"
              id="btn-manage-family-goal-settings"
              onClick={() => {
                sound.playTap();
                setIsGoalModalOpen(true);
              }}
              className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shrink-0 shadow-xs active:scale-95 cursor-pointer border border-amber-400"
            >
              Configure Goal & Presets ⚙️
            </button>
          </div>

          {/* Backup & Restore Section */}
          <div className="bg-white p-2.5 sm:p-5 rounded-none sm:rounded-2xl border-x-0 border-y sm:border-2 border-yellow-400 shadow-none sm:shadow-2xs space-y-2 sm:space-y-3">
            <div>
              <h3 className="font-black text-slate-800 text-xs sm:text-base flex items-center gap-1.5">
                <Download className="w-4 h-4 text-indigo-600" />
                Data Backup & Migration (JSON)
              </h3>
              <p className="hidden sm:block text-xs text-slate-500 font-bold">
                Keep offline JSON backups of your chores, reward store, logs, and kid balances.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <button
                type="button"
                id="btn-export-backup"
                onClick={handleExportJSON}
                className="flex-1 py-2 px-3 sm:py-2.5 sm:px-4 rounded-lg sm:rounded-xl bg-yellow-100 hover:bg-yellow-200 border border-yellow-300 text-slate-900 font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 stroke-[3]" />
                <span>Export Backup (.json)</span>
              </button>

              <label className="flex-1 py-2 px-3 sm:py-2.5 sm:px-4 rounded-lg sm:rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer">
                <Upload className="w-3.5 h-3.5 stroke-[3]" />
                <span>Import Backup (.json)</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportJSON}
                  className="hidden"
                />
              </label>
            </div>

            {importSuccess && (
              <div className="p-2 sm:p-2.5 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-black flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>Database restored successfully from backup!</span>
              </div>
            )}

            {importError && (
              <div className="p-2 sm:p-2.5 rounded-lg bg-rose-50 border border-rose-300 text-rose-800 text-xs font-black flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{importError}</span>
              </div>
            )}
          </div>

          {/* Raspberry Pi Hosting Help Card */}
          <div className="bg-orange-50 border-x-0 border-y sm:border-2 border-orange-400 p-2.5 sm:p-5 rounded-none sm:rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
            <div>
              <h4 className="font-black text-orange-950 text-xs sm:text-base flex items-center gap-1.5">
                🍓 Raspberry Pi Local Hosting Guide
              </h4>
              <p className="text-[11px] sm:text-xs text-orange-900 font-bold mt-0.5">
                View instructions for setting up 24/7 background running, home network Wi-Fi shortcuts, and mobile PWA install.
              </p>
            </div>
            <button
              onClick={() => {
                sound.playTap();
                onOpenPiGuide();
              }}
              className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black text-xs shrink-0 shadow-xs active:scale-95 cursor-pointer"
            >
              Open Pi Guide
            </button>
          </div>
        </div>
      )}

      {/* --- MODALS --- */}

      {/* Chore Edit Modal */}
      {editingChore && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-yellow-50 rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 max-w-lg w-full shadow-2xl border-2 sm:border-4 border-yellow-300 max-h-[92vh] overflow-y-auto">
            <h3 className="font-black text-base sm:text-xl text-slate-800 mb-2.5 sm:mb-4 italic">
              {editingChore.id ? 'Edit Chore Task' : 'Create New Chore Mission'}
            </h3>

            <div className="space-y-2.5 sm:space-y-4 text-sm">
              <div>
                <label className="block text-[11px] sm:text-xs font-black text-slate-700 uppercase mb-0.5">
                  Chore Title:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Empty Dishwasher & Put Away Cups"
                  value={editingChore.title || ''}
                  onChange={(e) => setEditingChore({ ...editingChore, title: e.target.value })}
                  className="w-full px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl sm:rounded-2xl border border-slate-200 bg-white focus:outline-indigo-500 font-black text-xs sm:text-sm text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <div>
                  <label className="block text-[11px] sm:text-xs font-black text-slate-700 uppercase mb-0.5">
                    Category:
                  </label>
                  <select
                    value={editingChore.categoryId || database.categories[0]?.id}
                    onChange={(e) => setEditingChore({ ...editingChore, categoryId: e.target.value })}
                    className="w-full px-2.5 py-2 sm:px-3 sm:py-2.5 rounded-xl sm:rounded-2xl border border-slate-200 bg-white text-xs font-black text-slate-800"
                  >
                    {database.categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] sm:text-xs font-black text-slate-700 uppercase mb-0.5">
                    Chore Icon (Emoji):
                  </label>
                  <EmojiPicker
                    value={editingChore.icon || '⭐'}
                    onChange={(emoji) => setEditingChore({ ...editingChore, icon: emoji })}
                    title="Choose Chore Icon"
                    categoryFilter="chores"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-1.5 sm:gap-3">
                <div>
                  <label className="block text-[10px] sm:text-xs font-black text-slate-700 uppercase mb-0.5">
                    Star Reward:
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={editingChore.stars || 3}
                    onChange={(e) => setEditingChore({ ...editingChore, stars: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl sm:rounded-2xl border border-slate-200 bg-white font-black text-xs sm:text-sm text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-[10px] sm:text-xs font-black text-slate-700 uppercase mb-0.5">
                    Frequency:
                  </label>
                  <select
                    value={editingChore.frequency || 'daily'}
                    onChange={(e) => setEditingChore({ ...editingChore, frequency: e.target.value as FrequencyType })}
                    className="w-full px-1.5 py-1.5 sm:px-2 sm:py-2 rounded-xl sm:rounded-2xl border border-slate-200 bg-white text-[11px] sm:text-xs font-black text-slate-800"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekdays">Weekdays</option>
                    <option value="weekends">Weekends</option>
                    <option value="as_needed">As Needed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] sm:text-xs font-black text-slate-700 uppercase mb-0.5">
                    Time of Day:
                  </label>
                  <select
                    value={editingChore.timeOfDay || 'anytime'}
                    onChange={(e) => setEditingChore({ ...editingChore, timeOfDay: e.target.value as TimeOfDay })}
                    className="w-full px-1.5 py-1.5 sm:px-2 sm:py-2 rounded-xl sm:rounded-2xl border border-slate-200 bg-white text-[11px] sm:text-xs font-black text-slate-800"
                  >
                    <option value="morning">Morning</option>
                    <option value="afternoon">Afternoon</option>
                    <option value="evening">Bedtime</option>
                    <option value="anytime">Anytime</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] sm:text-xs font-black text-slate-700 uppercase mb-0.5">
                  Assign To Kids:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => setEditingChore({ ...editingChore, assignedKidIds: ['all'] })}
                    className={`px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-lg sm:rounded-xl text-xs font-black border cursor-pointer ${
                      editingChore.assignedKidIds?.includes('all')
                        ? 'bg-indigo-900 text-white border-indigo-900 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    All Kids
                  </button>
                  {database.kids.map((kid) => {
                    const isAssigned =
                      !editingChore.assignedKidIds?.includes('all') &&
                      editingChore.assignedKidIds?.includes(kid.id);
                    return (
                      <button
                        type="button"
                        key={kid.id}
                        onClick={() => {
                          let cur = editingChore.assignedKidIds || [];
                          if (cur.includes('all')) cur = [];
                          const next = cur.includes(kid.id)
                            ? cur.filter((id) => id !== kid.id)
                            : [...cur, kid.id];
                          setEditingChore({
                            ...editingChore,
                            assignedKidIds: next.length === 0 ? ['all'] : next,
                          });
                        }}
                        className={`px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-lg sm:rounded-xl text-xs font-black border flex items-center gap-1 cursor-pointer ${
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

              <div>
                <label className="block text-[11px] sm:text-xs font-black text-slate-700 uppercase mb-0.5">
                  Helpful Description / Instructions:
                </label>
                <textarea
                  rows={2}
                  value={editingChore.description || ''}
                  onChange={(e) => setEditingChore({ ...editingChore, description: e.target.value })}
                  placeholder="e.g. Rinse plates, scrape food, and place utensils in the cutlery basket."
                  className="w-full px-3 py-2 rounded-xl sm:rounded-2xl border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:outline-indigo-500 resize-none"
                />
              </div>

              {/* Subtask Checklists */}
              <div>
                <label className="block text-[11px] sm:text-xs font-black text-slate-700 uppercase mb-0.5">
                  Step-by-Step Checklist (One step per line):
                </label>
                <textarea
                  rows={2}
                  value={editingChore.subtasks ? editingChore.subtasks.join('\n') : ''}
                  onChange={(e) => {
                    const lines = e.target.value.split('\n');
                    setEditingChore({
                      ...editingChore,
                      subtasks: lines.filter((l) => l.trim().length > 0),
                    });
                  }}
                  placeholder="1. Pick up stuffed animals&#10;2. Fold clean blankets&#10;3. Put dirty clothes in the laundry hamper"
                  className="w-full px-3 py-2 rounded-xl sm:rounded-2xl border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:outline-indigo-500 resize-none"
                />
              </div>

              {/* Focus Timer & Bounty Extras */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
                <div className="p-2 sm:p-2.5 bg-white rounded-xl border border-slate-200">
                  <label className="block text-[10px] sm:text-xs font-black text-slate-700 uppercase mb-0.5">
                    ⏱️ Focus Timer (Minutes)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={120}
                    value={editingChore.timerMinutes || ''}
                    onChange={(e) =>
                      setEditingChore({
                        ...editingChore,
                        timerMinutes: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                    placeholder="e.g. 5 or 10 min"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-black text-slate-900 bg-slate-50"
                  />
                  <span className="text-[9px] sm:text-[10px] text-slate-400 font-bold block mt-0.5">
                    Shows countdown & speed bonus
                  </span>
                </div>

                <div className="p-2 sm:p-2.5 bg-white rounded-xl border border-slate-200 flex flex-col justify-between">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!editingChore.isBounty}
                      onChange={(e) =>
                        setEditingChore({
                          ...editingChore,
                          isBounty: e.target.checked,
                          bountyBonusStars: e.target.checked ? (editingChore.bountyBonusStars || 5) : 0,
                        })
                      }
                      className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400"
                    />
                    <span className="text-xs font-black text-amber-950">
                      🎯 Extra Credit Bounty
                    </span>
                  </label>
                  {editingChore.isBounty && (
                    <div className="mt-1">
                      <label className="text-[9px] font-black uppercase text-amber-800 block mb-0.5">
                        Bonus Stars (+⭐):
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={50}
                        value={editingChore.bountyBonusStars || 5}
                        onChange={(e) =>
                          setEditingChore({
                            ...editingChore,
                            bountyBonusStars: Number(e.target.value),
                          })
                        }
                        className="w-full px-2 py-1 rounded-lg border border-amber-300 text-xs font-black text-slate-900 bg-amber-50"
                      />
                    </div>
                  )}
                  <span className="text-[9px] sm:text-[10px] text-slate-400 font-bold block mt-0.5">
                    Appears on the Bounty Board
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-2 sm:gap-3 mt-4 sm:mt-6">
              <button
                type="button"
                onClick={() => setEditingChore(null)}
                className="flex-1 py-2 sm:py-2.5 rounded-xl border border-slate-200 bg-white font-black text-xs text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSaveChore(editingChore)}
                className="flex-1 py-2 sm:py-2.5 rounded-xl bg-indigo-900 hover:bg-indigo-800 text-white font-black text-xs shadow-xs active:scale-95 cursor-pointer"
              >
                Save Chore
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category Edit Modal */}
      {editingCategory && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-yellow-50 rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 max-w-md w-full shadow-2xl border-2 sm:border-4 border-yellow-300">
            <h3 className="font-black text-base sm:text-xl text-slate-800 mb-3 italic">
              {editingCategory.id ? 'Edit Category' : 'New Category'}
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] sm:text-xs font-black text-slate-700 uppercase mb-1">
                  Category Name:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Garden & Yard"
                  value={editingCategory.name || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-black text-xs sm:text-sm text-slate-800 focus:outline-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] sm:text-xs font-black text-slate-700 uppercase mb-1">
                  Accent Color:
                </label>
                <div className="flex gap-2">
                  {['#f59e0b', '#ec4899', '#3b82f6', '#10b981', '#8b5cf6', '#6366f1', '#f43f5e'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setEditingCategory({ ...editingCategory, color: c })}
                      className={`w-8 h-8 rounded-full border-2 transition-transform cursor-pointer ${
                        editingCategory.color === c ? 'scale-110 border-slate-900 ring-2 ring-yellow-400 shadow-xs' : 'border-white'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2 sm:gap-3 mt-5">
              <button
                type="button"
                onClick={() => setEditingCategory(null)}
                className="flex-1 py-2 sm:py-2.5 rounded-xl border border-slate-200 bg-white font-black text-xs text-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSaveCategory(editingCategory)}
                className="flex-1 py-2 sm:py-2.5 rounded-xl bg-indigo-900 hover:bg-indigo-800 text-white font-black text-xs shadow-xs active:scale-95 cursor-pointer"
              >
                Save Category
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reward Edit Modal */}
      {editingReward && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-yellow-50 rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 max-w-md w-full shadow-2xl border-2 sm:border-4 border-yellow-300">
            <h3 className="font-black text-base sm:text-xl text-slate-800 mb-3 italic">
              {editingReward.id ? 'Edit Reward Item' : 'New Reward Item'}
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] sm:text-xs font-black text-slate-700 uppercase mb-1">
                  Reward Title:
                </label>
                <input
                  type="text"
                  placeholder="e.g. 45 Mins Roblox or Fortnite"
                  value={editingReward.title || ''}
                  onChange={(e) => setEditingReward({ ...editingReward, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-black text-xs sm:text-sm text-slate-800 focus:outline-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <div>
                  <label className="block text-[11px] sm:text-xs font-black text-slate-700 uppercase mb-1">
                    Star Cost:
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={editingReward.starCost || 20}
                    onChange={(e) => setEditingReward({ ...editingReward, starCost: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white font-black text-xs sm:text-sm text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] sm:text-xs font-black text-slate-700 uppercase mb-1">
                    Reward Icon (Emoji):
                  </label>
                  <EmojiPicker
                    value={editingReward.icon || '🎁'}
                    onChange={(emoji) => setEditingReward({ ...editingReward, icon: emoji })}
                    title="Choose Reward Icon"
                    categoryFilter="rewards"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] sm:text-xs font-black text-slate-700 uppercase mb-1">
                  Description:
                </label>
                <textarea
                  rows={2}
                  value={editingReward.description || ''}
                  onChange={(e) => setEditingReward({ ...editingReward, description: e.target.value })}
                  placeholder="How does this reward work?"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 resize-none focus:outline-indigo-500"
                />
              </div>
            </div>

            <div className="flex gap-2 sm:gap-3 mt-5">
              <button
                type="button"
                onClick={() => setEditingReward(null)}
                className="flex-1 py-2 sm:py-2.5 rounded-xl border border-slate-200 bg-white font-black text-xs text-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSaveReward(editingReward)}
                className="flex-1 py-2 sm:py-2.5 rounded-xl bg-indigo-900 hover:bg-indigo-800 text-white font-black text-xs shadow-xs active:scale-95 cursor-pointer"
              >
                Save Reward
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Kid Edit Modal */}
      {editingKid && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-yellow-50 rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 max-w-md w-full shadow-2xl border-2 sm:border-4 border-yellow-300">
            <h3 className="font-black text-base sm:text-xl text-slate-800 mb-3 italic">
              {editingKid.id ? 'Edit Child Profile' : 'Add Child'}
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] sm:text-xs font-black text-slate-700 uppercase mb-1">
                  Child's Name:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Leo"
                  value={editingKid.name || ''}
                  onChange={(e) => setEditingKid({ ...editingKid, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-black text-xs sm:text-sm text-slate-800 focus:outline-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] sm:text-xs font-black text-slate-700 uppercase mb-1">
                  Avatar Character:
                </label>
                <EmojiPicker
                  value={editingKid.avatar || '🦁'}
                  onChange={(emoji) => setEditingKid({ ...editingKid, avatar: emoji })}
                  title="Choose Kid Character"
                  categoryFilter="characters"
                />
              </div>

              <div>
                <label className="block text-[11px] sm:text-xs font-black text-slate-700 uppercase mb-1">
                  Profile Color:
                </label>
                <div className="flex gap-2">
                  {['#f59e0b', '#ec4899', '#3b82f6', '#10b981', '#8b5cf6', '#06b6d4'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setEditingKid({ ...editingKid, color: c })}
                      className={`w-8 h-8 rounded-full border-2 cursor-pointer ${
                        editingKid.color === c ? 'scale-110 border-slate-900 ring-2 ring-yellow-400 shadow-xs' : 'border-white'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-0.5">
                  <label className="block text-[11px] sm:text-xs font-black text-slate-700 uppercase">
                    Child 4-Digit Security PIN:
                  </label>
                  <button
                    type="button"
                    onClick={() => setEditingKid({ ...editingKid, pin: '1234' })}
                    className="text-[10px] sm:text-[11px] font-black text-indigo-600 hover:text-indigo-800 cursor-pointer underline"
                  >
                    Reset to 1234
                  </button>
                </div>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={4}
                  placeholder="1234"
                  value={editingKid.pin ?? '1234'}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                    setEditingKid({ ...editingKid, pin: val });
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-mono font-black text-sm text-slate-800 focus:outline-indigo-500 tracking-widest"
                />
                <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                  Used by {editingKid.name || 'this child'} to unlock missions and rewards.
                </p>
              </div>
            </div>

            <div className="flex gap-2 sm:gap-3 mt-5">
              <button
                type="button"
                onClick={() => setEditingKid(null)}
                className="flex-1 py-2 sm:py-2.5 rounded-xl border border-slate-200 bg-white font-black text-xs text-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSaveKid(editingKid)}
                className="flex-1 py-2 sm:py-2.5 rounded-xl bg-indigo-900 hover:bg-indigo-800 text-white font-black text-xs shadow-xs active:scale-95 cursor-pointer"
              >
                Save Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bonus Star Award Modal */}
      {bonusStarModalKid && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-yellow-50 rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 max-w-sm w-full shadow-2xl border-2 sm:border-4 border-yellow-300 text-center">
            <div className="text-3xl mb-1">⭐</div>
            <h3 className="font-black text-base sm:text-xl text-slate-800 mb-0.5 italic">
              Award Bonus Stars to {bonusStarModalKid.name}!
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-500 font-bold mb-3">
              Reward extra effort, good behavior, or helping without being asked.
            </p>

            <div className="flex justify-center gap-1.5 mb-3">
              {[2, 5, 10, 15].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setBonusStarsAmount(amt)}
                  className={`px-2.5 py-1 rounded-lg font-black text-xs sm:text-sm border cursor-pointer transition-all ${
                    bonusStarsAmount === amt
                      ? 'bg-yellow-400 text-slate-900 border-yellow-500 shadow-xs scale-105'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  +{amt} ⭐
                </button>
              ))}
            </div>

            <div className="text-left mb-4">
              <label className="block text-[11px] sm:text-xs font-black text-slate-700 uppercase mb-0.5">
                Reason / Compliment:
              </label>
              <input
                type="text"
                value={bonusStarReason}
                onChange={(e) => setBonusStarReason(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:outline-indigo-500"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setBonusStarModalKid(null)}
                className="flex-1 py-2 sm:py-2.5 rounded-xl border border-slate-200 bg-white font-black text-xs text-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAwardBonusStars}
                className="flex-1 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-yellow-400 to-orange-500 text-slate-900 font-black text-xs shadow-xs active:scale-95 cursor-pointer border border-yellow-300"
              >
                Award +{bonusStarsAmount} Stars!
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Family Goal Manager Modal */}
      {isGoalModalOpen && (
        <FamilyGoalModal
          isOpen={isGoalModalOpen}
          onClose={() => setIsGoalModalOpen(false)}
          database={database}
          onUpdateDatabase={onUpdateDatabase}
          isParentMode={true}
        />
      )}
    </div>
  );
};
