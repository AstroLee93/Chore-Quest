import React, { useState, useMemo } from 'react';
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
  const handleSaveKid = (kid: Partial<KidProfile>) => {
    sound.playTap();
    if (!kid.name?.trim()) return;

    let updatedKids: KidProfile[];
    if (kid.id) {
      updatedKids = database.kids.map((k) => (k.id === kid.id ? (kid as KidProfile) : k));
    } else {
      const newKid: KidProfile = {
        id: `kid-${Date.now()}`,
        name: kid.name.trim(),
        avatar: kid.avatar || '⭐',
        color: kid.color || '#3b82f6',
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Parent Header Banner */}
      <div className="bg-indigo-900 rounded-[2.5rem] p-6 sm:p-8 text-white shadow-xl border-4 border-yellow-300 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-yellow-400 text-slate-900 flex items-center justify-center text-3xl font-black shadow-lg transform -rotate-3 border-2 border-yellow-200">
            🛡️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider bg-pink-500/80 text-white px-3 py-0.5 rounded-full border border-pink-300">
                Parent Admin Hub
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-1 text-yellow-300 italic">
              Family Chore Management
            </h1>
            <p className="text-xs sm:text-sm text-indigo-100 font-bold mt-0.5">
              Review completed & skipped tasks, configure chore schedules, manage reward store & kids.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            id="btn-parent-exit-top"
            onClick={() => {
              sound.playTap();
              onExitParentMode();
            }}
            className="px-5 py-3 rounded-2xl bg-pink-500 hover:bg-pink-600 border-2 border-pink-300 text-xs sm:text-sm font-black text-white transition-all shadow-md active:scale-95 cursor-pointer"
          >
            ← Return to Kid View
          </button>
        </div>
      </div>

      {/* Shared Family Goal Banner */}
      <FamilyGoalBanner
        database={database}
        isParentMode={true}
        onEditGoal={() => {
          sound.playTap();
          setIsGoalModalOpen(true);
        }}
      />

      {/* Navigation Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 p-1.5 rounded-2xl bg-yellow-200/70 border-2 border-yellow-300 shadow-2xs">
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
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-indigo-900 text-white shadow-sm'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-yellow-300/60'
              }`}
            >
              <Icon className="w-4 h-4 stroke-[2.5]" />
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full font-black ${
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
        <div className="space-y-6 animate-fade-in">
          {/* Filter Bar */}
          <div className="bg-white p-5 rounded-3xl border-b-6 border-r-4 border-indigo-400 border-t-2 border-l-2 border-t-slate-100 border-l-slate-100 shadow-2xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="font-black text-slate-800 text-base flex items-center gap-2">
                  <Clock className="w-5 h-5 text-indigo-600" />
                  Chore Verification & Incomplete Reasons
                </h3>
                <p className="text-xs text-slate-500 font-bold">
                  Inspect task completions and reasons submitted by your kids when tasks couldn't be done.
                </p>
              </div>

              {/* Date selector quick buttons */}
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={activityDateFilter}
                  onChange={(e) => setActivityDateFilter(e.target.value)}
                  className="px-3 py-2 rounded-2xl border-2 border-yellow-300 text-xs font-black text-slate-700 focus:outline-indigo-500 bg-yellow-50"
                />
                <button
                  onClick={() => setActivityDateFilter(todayStr)}
                  className={`px-3 py-2 rounded-2xl text-xs font-black border-2 transition-colors cursor-pointer ${
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
            <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100 text-xs">
              <span className="text-slate-400 font-black uppercase tracking-wider">Filter Kid:</span>
              <button
                onClick={() => setActivityKidFilter('all')}
                className={`px-3 py-1.5 rounded-xl font-black transition-colors cursor-pointer ${
                  activityKidFilter === 'all' ? 'bg-indigo-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                All Kids
              </button>
              {database.kids.map((k) => (
                <button
                  key={k.id}
                  onClick={() => setActivityKidFilter(k.id)}
                  className={`px-3 py-1.5 rounded-xl font-black flex items-center gap-1.5 transition-colors cursor-pointer ${
                    activityKidFilter === k.id ? 'bg-indigo-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <span>{k.avatar}</span>
                  <span>{k.name}</span>
                </button>
              ))}

              <span className="text-slate-400 font-black uppercase tracking-wider ml-auto">Status:</span>
              {(['all', 'completed', 'skipped'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setActivityStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-xl font-black capitalize transition-colors cursor-pointer ${
                    activityStatusFilter === st ? 'bg-indigo-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Activity Logs Feed */}
          <div className="space-y-3">
            {filteredLogs.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-slate-200">
                <div className="text-4xl mb-2">📋</div>
                <h4 className="font-black text-slate-800 text-base">No activity logged for this date</h4>
                <p className="text-xs text-slate-500 font-bold mt-1 max-w-sm mx-auto">
                  When your kids check off completed chores or submit reasons for skipped tasks, they will appear here for verification.
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
                    className={`p-4 sm:p-5 rounded-3xl border-b-6 border-r-4 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      isCompleted
                        ? 'bg-white border-emerald-400 border-t-2 border-l-2 border-t-emerald-100 border-l-emerald-100'
                        : isSkipped
                        ? 'bg-orange-50/70 border-orange-400 border-t-2 border-l-2 border-t-orange-100 border-l-orange-100'
                        : 'bg-white border-slate-300 border-t-2 border-l-2 border-t-slate-100 border-l-slate-100'
                    }`}
                  >
                    {/* Left: Kid & Chore details */}
                    <div className="flex items-start gap-3 flex-1">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 shadow-2xs border-2 border-white"
                        style={{ backgroundColor: `${kid?.color || '#f59e0b'}30` }}
                      >
                        {kid?.avatar || '⭐'}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-black text-slate-800 text-sm">
                            {kid?.name || 'Child'}
                          </span>
                          <span className="text-slate-400 text-xs">•</span>
                          <span className="text-xs font-bold text-slate-600">
                            {chore?.title || 'Chore'}
                          </span>

                          {/* Status Badge */}
                          {isCompleted && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                              Completed (+{log.starsAwarded} ⭐)
                            </span>
                          )}

                          {isSkipped && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-900 border border-orange-300">
                              <AlertTriangle className="w-3.5 h-3.5 text-orange-600" />
                              Skipped
                            </span>
                          )}
                        </div>

                        {/* Skipped Reason Box */}
                        {isSkipped && (
                          <div className="mt-2 p-3 rounded-2xl bg-orange-100/70 border border-orange-200 text-xs text-orange-900">
                            <div className="font-black flex items-center gap-1.5">
                              <span>Reason:</span>
                              <span className="uppercase text-[10px] font-black bg-orange-200 px-2 py-0.5 rounded-full">
                                {log.skippedReasonCategory?.replace('_', ' ')}
                              </span>
                            </div>
                            {log.skippedReason && (
                              <p className="mt-1 text-orange-950 font-bold italic">
                                "{log.skippedReason}"
                              </p>
                            )}
                          </div>
                        )}

                        {/* Timestamp */}
                        {log.completedAt && (
                          <p className="text-[11px] text-slate-400 font-bold mt-1">
                            Logged at{' '}
                            {new Date(log.completedAt).toLocaleTimeString(undefined, {
                              hour: 'numeric',
                              minute: '2-digit',
                            })}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right: Parent Verification & Action buttons */}
                    <div className="flex items-center gap-2 shrink-0 justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      {isCompleted && (
                        <button
                          onClick={() => handleToggleParentVerification(log.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-black border-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
                            log.verifiedByParent
                              ? 'bg-emerald-600 text-white border-emerald-600'
                              : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          <span>{log.verifiedByParent ? 'Verified by Parent' : 'Mark Verified'}</span>
                        </button>
                      )}

                      {/* Give Bonus Stars button */}
                      {kid && (
                        <button
                          onClick={() => {
                            setBonusStarModalKid(kid);
                            setBonusStarsAmount(5);
                            setBonusStarReason(`Great job on ${chore?.title || 'chores'}!`);
                          }}
                          className="px-3 py-1.5 rounded-xl text-xs font-black bg-yellow-100 hover:bg-yellow-200 text-slate-800 border-2 border-yellow-300 flex items-center gap-1 transition-colors cursor-pointer"
                          title="Award Bonus Stars"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                          <span>+Bonus ⭐</span>
                        </button>
                      )}

                      {/* Re-open / Undo */}
                      <button
                        onClick={() => handleReopenTask(log.id)}
                        className="px-3 py-1.5 rounded-xl text-xs font-black text-slate-500 hover:text-rose-600 hover:bg-rose-50 border-2 border-slate-200 transition-colors cursor-pointer"
                        title="Reopen or clear this task entry"
                      >
                        Reset
                      </button>
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
        <div className="space-y-6 animate-fade-in">
          {/* Categories Management Section */}
          <div className="bg-white p-6 rounded-3xl border-b-6 border-r-4 border-yellow-400 border-t-2 border-l-2 border-t-slate-100 border-l-slate-100 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-black text-slate-800 text-base">
                  Chore Categories ({database.categories.length})
                </h3>
                <p className="text-xs text-slate-500 font-bold">
                  Organize daily missions by room, routine, or time of day.
                </p>
              </div>
              <button
                id="btn-add-category"
                onClick={() => {
                  sound.playTap();
                  setEditingCategory({});
                }}
                className="px-4 py-2.5 rounded-2xl bg-indigo-900 hover:bg-indigo-800 text-white font-black text-xs flex items-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Add Category</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {database.categories.map((cat) => (
                <div
                  key={cat.id}
                  className="p-3.5 rounded-2xl border-2 border-slate-200 flex items-center justify-between gap-2 hover:border-yellow-400 transition-colors bg-white shadow-2xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0 border-2 border-white shadow-2xs"
                      style={{ backgroundColor: `${cat.color}30` }}
                    >
                      {cat.color === '#f59e0b' ? '🌅' : cat.color === '#8b5cf6' ? '🛏️' : cat.color === '#3b82f6' ? '📚' : '🏠'}
                    </div>
                    <div className="min-w-0">
                      <div className="font-black text-sm text-slate-800 truncate">
                        {cat.name}
                      </div>
                      <div className="text-[11px] text-slate-400 font-bold truncate">
                        {database.chores.filter((c) => c.categoryId === cat.id).length} chores
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditingCategory(cat)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-700 hover:bg-indigo-50 cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(cat.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chores Management Section */}
          <div className="bg-white p-6 rounded-3xl border-b-6 border-r-4 border-indigo-400 border-t-2 border-l-2 border-t-slate-100 border-l-slate-100 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-black text-slate-800 text-base">
                  Tasks & Chores List ({database.chores.length})
                </h3>
                <p className="text-xs text-slate-500 font-bold">
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
                className="px-4 py-2.5 rounded-2xl bg-indigo-900 hover:bg-indigo-800 text-white font-black text-xs sm:text-sm flex items-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Create New Chore</span>
              </button>
            </div>

            {/* Chore List Table / Cards */}
            <div className="space-y-2.5">
              {database.chores.map((chore) => {
                const category = database.categories.find((c) => c.id === chore.categoryId);
                return (
                  <div
                    key={chore.id}
                    className={`p-4 rounded-2xl border-2 transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                      chore.isActive
                        ? 'bg-white border-slate-200 hover:border-yellow-400 shadow-2xs'
                        : 'bg-slate-50 border-slate-200 opacity-60'
                    }`}
                  >
                    <div className="flex items-start gap-3 flex-1">
                      <span className="text-2xl p-2 rounded-2xl bg-yellow-100 border-2 border-yellow-300 shadow-2xs">
                        {chore.icon || '⭐'}
                      </span>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-black text-slate-800 text-sm sm:text-base">
                            {chore.title}
                          </span>
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-yellow-400 text-slate-900 border border-yellow-300">
                            ⭐ {chore.stars} Stars
                          </span>
                          <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700">
                            {category?.name || 'Uncategorized'}
                          </span>
                          <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 capitalize">
                            {chore.frequency}
                          </span>
                          <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-pink-50 text-pink-700 capitalize">
                            {chore.timeOfDay}
                          </span>
                        </div>
                        {chore.description && (
                          <p className="text-xs text-slate-500 font-bold mt-1">{chore.description}</p>
                        )}
                        <div className="text-[11px] text-slate-400 font-bold mt-1">
                          Assigned to:{' '}
                          {chore.assignedKidIds?.includes('all')
                            ? 'All Kids'
                            : chore.assignedKidIds
                                ?.map((kidId) => database.kids.find((k) => k.id === kidId)?.name)
                                .filter(Boolean)
                                .join(', ') || 'All Kids'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 justify-end">
                      <button
                        onClick={() => handleToggleChoreActive(chore.id)}
                        className={`px-3 py-1 rounded-xl text-xs font-black cursor-pointer ${
                          chore.isActive ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {chore.isActive ? 'Active' : 'Paused'}
                      </button>
                      <button
                        onClick={() => setEditingChore(chore)}
                        className="p-2 rounded-xl text-slate-500 hover:text-indigo-700 hover:bg-indigo-50 border-2 border-slate-200 cursor-pointer"
                        title="Edit Chore"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteChore(chore.id)}
                        className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 border-2 border-slate-200 cursor-pointer"
                        title="Delete Chore"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
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
        <div className="space-y-6 animate-fade-in">
          {/* Pending Kid Claims Queue */}
          <div className="bg-white p-6 rounded-3xl border-b-6 border-r-4 border-pink-400 border-t-2 border-l-2 border-t-slate-100 border-l-slate-100 shadow-2xs space-y-4">
            <div>
              <h3 className="font-black text-slate-800 text-base flex items-center gap-2">
                <Gift className="w-5 h-5 text-pink-500" />
                Kid Reward Claims Queue ({database.redemptions.length})
              </h3>
              <p className="text-xs text-slate-500 font-bold">
                Approve, mark fulfilled, or refund star purchases from the Reward Store.
              </p>
            </div>

            {database.redemptions.length === 0 ? (
              <div className="text-center py-8 text-slate-400 bg-yellow-50/50 rounded-2xl border-2 border-dashed border-yellow-200">
                <Gift className="w-8 h-8 mx-auto mb-1 opacity-40 text-pink-500" />
                <p className="text-xs font-bold text-slate-600">No reward claims submitted yet.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {database.redemptions.map((redemption) => {
                  const kid = database.kids.find((k) => k.id === redemption.kidId);
                  return (
                    <div
                      key={redemption.id}
                      className="p-4 rounded-2xl border-2 border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white shadow-2xs"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl p-2 rounded-2xl bg-yellow-100 border-2 border-yellow-300">
                          {redemption.rewardIcon || '🎁'}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-sm text-slate-800">
                              {redemption.rewardTitle}
                            </span>
                            <span className="text-xs font-black text-slate-900 bg-yellow-400 px-2.5 py-0.5 rounded-full border border-yellow-300">
                              {redemption.starCost} ⭐
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 font-bold">
                            Claimed by <strong>{kid?.name}</strong> •{' '}
                            {new Date(redemption.date).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </div>
                          {redemption.notes && (
                            <div className="text-xs text-pink-700 font-bold italic mt-0.5">
                              "{redemption.notes}"
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 justify-end">
                        {redemption.status === 'pending' ? (
                          <>
                            <button
                              onClick={() => handleUpdateRedemptionStatus(redemption.id, 'fulfilled')}
                              className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-black hover:bg-emerald-700 shadow-xs cursor-pointer"
                            >
                              Approve & Mark Fulfilled
                            </button>
                            <button
                              onClick={() => handleUpdateRedemptionStatus(redemption.id, 'rejected')}
                              className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 text-xs font-black hover:bg-rose-100 border border-rose-200 cursor-pointer"
                            >
                              Refund Stars
                            </button>
                          </>
                        ) : (
                          <span
                            className={`px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider ${
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
          <div className="bg-white p-6 rounded-3xl border-b-6 border-r-4 border-yellow-400 border-t-2 border-l-2 border-t-slate-100 border-l-slate-100 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-black text-slate-800 text-base">
                  Reward Catalog Items ({database.rewards.length})
                </h3>
                <p className="text-xs text-slate-500 font-bold">
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
                className="px-4 py-2.5 rounded-2xl bg-indigo-900 hover:bg-indigo-800 text-white font-black text-xs flex items-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Add Reward Item</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {database.rewards.map((reward) => (
                <div
                  key={reward.id}
                  className="p-4 rounded-3xl border-2 border-slate-200 flex flex-col justify-between hover:border-yellow-400 transition-all bg-white shadow-2xs"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-3xl p-2 rounded-2xl bg-yellow-100 border-2 border-yellow-300 shadow-2xs">
                        {reward.icon || '🎁'}
                      </span>
                      <span className="font-black text-slate-900 bg-yellow-400 px-3 py-1 rounded-full text-xs border border-yellow-300">
                        ⭐ {reward.starCost}
                      </span>
                    </div>
                    <h4 className="font-black text-slate-800 text-sm mb-1">{reward.title}</h4>
                    <p className="text-xs text-slate-500 font-bold mb-3">{reward.description}</p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <span className="text-[11px] text-slate-400 capitalize font-bold">
                      {reward.category.replace('_', ' ')}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditingReward(reward)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-700 hover:bg-indigo-50 cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteReward(reward.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
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
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white p-6 rounded-3xl border-b-6 border-r-4 border-indigo-400 border-t-2 border-l-2 border-t-slate-100 border-l-slate-100 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-black text-slate-800 text-base">
                  Children Profiles ({database.kids.length})
                </h3>
                <p className="text-xs text-slate-500 font-bold">
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
                className="px-4 py-2.5 rounded-2xl bg-indigo-900 hover:bg-indigo-800 text-white font-black text-xs flex items-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Add Child</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {database.kids.map((kid) => {
                const levelInfo = getKidLevelInfo(kid.lifetimeStars);
                return (
                  <div
                    key={kid.id}
                    className="p-5 rounded-3xl border-2 border-slate-200 bg-white flex flex-col justify-between gap-4 hover:border-yellow-400 transition-all shadow-2xs"
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0 shadow-2xs border-2 border-white"
                        style={{ backgroundColor: `${kid.color}30` }}
                      >
                        {kid.avatar || '⭐'}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-black text-lg text-slate-800">{kid.name}</h4>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setEditingKid(kid)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-700 hover:bg-indigo-50 cursor-pointer"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteKid(kid.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
                            {levelInfo.icon} Level {levelInfo.level}: {levelInfo.title}
                          </span>
                          <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800 flex items-center gap-1 border border-orange-200">
                            <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
                            {kid.streakDays}d streak
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Star Balance & Quick Adjuster */}
                    <div className="p-3.5 rounded-2xl bg-yellow-50/70 border-2 border-yellow-200 flex items-center justify-between">
                      <div>
                        <div className="text-[11px] text-slate-500 font-black uppercase">Current Star Bank</div>
                        <div className="text-xl font-black text-slate-900 flex items-center gap-1">
                          <span>⭐</span>
                          <span>{kid.stars}</span>
                          <span className="text-xs font-bold text-slate-400 ml-1">
                            ({kid.lifetimeStars} lifetime)
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleAdjustKidStars(kid.id, -5)}
                          className="px-2.5 py-1.5 rounded-xl bg-white border-2 border-slate-200 text-xs font-black text-slate-700 hover:bg-slate-100 cursor-pointer"
                          title="Subtract 5 stars"
                        >
                          -5
                        </button>
                        <button
                          onClick={() => handleAdjustKidStars(kid.id, 5)}
                          className="px-3 py-1.5 rounded-xl bg-yellow-400 text-slate-900 text-xs font-black hover:bg-yellow-500 shadow-2xs border border-yellow-300 cursor-pointer"
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
        <div className="space-y-6 animate-fade-in">
          {/* General App Settings */}
          <form onSubmit={handleSaveSettings} className="bg-white p-6 sm:p-8 rounded-3xl border-b-6 border-r-4 border-indigo-400 border-t-2 border-l-2 border-t-slate-100 border-l-slate-100 shadow-2xs space-y-6">
            <div>
              <h3 className="font-black text-slate-800 text-lg">System & Security Settings</h3>
              <p className="text-xs text-slate-500 font-bold">Configure parent passcodes, family title, and reward policies.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                  Parent 4-Digit Security PIN:
                </label>
                <input
                  type="password"
                  maxLength={4}
                  value={settingsForm.parentPin}
                  onChange={(e) => setSettingsForm({ ...settingsForm, parentPin: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl border-2 border-slate-200 font-mono text-base font-black text-slate-800 focus:outline-indigo-500 bg-yellow-50/50"
                  required
                />
                <p className="text-[11px] text-slate-400 font-bold mt-1">Used to access this parent portal</p>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                  Family Hub Name:
                </label>
                <input
                  type="text"
                  value={settingsForm.familyName}
                  onChange={(e) => setSettingsForm({ ...settingsForm, familyName: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl border-2 border-slate-200 text-sm font-black text-slate-800 focus:outline-indigo-500 bg-yellow-50/50"
                />
                <p className="text-[11px] text-slate-400 font-bold mt-1">Shown in the header across mobile and desktop</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              {settingsSaved ? (
                <span className="text-xs font-black text-emerald-600 flex items-center gap-1">
                  <Check className="w-4 h-4 stroke-[3]" /> Settings updated successfully!
                </span>
              ) : (
                <span />
              )}
              <button
                type="submit"
                id="btn-save-settings"
                className="px-6 py-3 rounded-2xl bg-indigo-900 hover:bg-indigo-800 text-white font-black text-sm shadow-md transition-all active:scale-95 cursor-pointer"
              >
                Save Settings
              </button>
            </div>
          </form>

          {/* Weekly Family Teamwork Goal Management Card */}
          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 p-6 rounded-3xl border-b-6 border-r-4 border-amber-400 border-t-2 border-l-2 border-t-amber-100 border-l-amber-100 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h4 className="font-black text-amber-950 text-base flex items-center gap-2">
                🏆 Weekly Family Teamwork Goal & Alternative Options
              </h4>
              <p className="text-xs text-amber-900 font-bold mt-1 max-w-xl">
                Choose or create custom family rewards (e.g. Pizza & Movie Night, Ice Cream Sundae Party, Laser Tag), adjust target chores, or add custom presets for kids and parents to select on the kiosk.
              </p>
              <div className="mt-2 flex items-center gap-2 text-xs font-black text-slate-700 flex-wrap">
                <span className="bg-amber-200 text-amber-950 px-2.5 py-0.5 rounded-full border border-amber-300">
                  Current: {database.familyGoal?.title || 'Pizza & Movie Night'}
                </span>
                <span className="text-pink-600 font-extrabold">
                  🎁 {database.familyGoal?.reward || 'Family Movie & Pizza Night'}
                </span>
                <span className="text-slate-500">
                  🎯 Target: {database.familyGoal?.targetChores || 30} chores
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
              className="px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shrink-0 shadow-md active:scale-95 cursor-pointer border border-amber-400"
            >
              Configure Goal & Presets ⚙️
            </button>
          </div>

          {/* Backup & Restore Section */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border-b-6 border-r-4 border-yellow-400 border-t-2 border-l-2 border-t-slate-100 border-l-slate-100 shadow-2xs space-y-4">
            <div>
              <h3 className="font-black text-slate-800 text-lg flex items-center gap-2">
                <Download className="w-5 h-5 text-indigo-600" />
                Data Backup & Migration (JSON)
              </h3>
              <p className="text-xs text-slate-500 font-bold">
                Keep offline JSON backups of your chores, reward store, logs, and kid balances.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                id="btn-export-backup"
                onClick={handleExportJSON}
                className="flex-1 py-3 px-4 rounded-2xl bg-yellow-100 hover:bg-yellow-200 border-2 border-yellow-300 text-slate-900 font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4 stroke-[3]" />
                <span>Export Backup File (.json)</span>
              </button>

              <label className="flex-1 py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 border-2 border-slate-200 text-slate-800 font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer">
                <Upload className="w-4 h-4 stroke-[3]" />
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
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-black flex items-center gap-1.5">
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Database restored successfully from backup!</span>
              </div>
            )}

            {importError && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-300 text-rose-800 text-xs font-black flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                <span>{importError}</span>
              </div>
            )}
          </div>

          {/* Raspberry Pi Hosting Help Card */}
          <div className="bg-orange-50 border-b-6 border-r-4 border-orange-400 border-t-2 border-l-2 border-t-orange-100 border-l-orange-100 p-6 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h4 className="font-black text-orange-950 text-base flex items-center gap-2">
                🍓 Raspberry Pi 5 Local Hosting Guide
              </h4>
              <p className="text-xs text-orange-900 font-bold mt-1">
                View instructions for setting up 24/7 background running, home network Wi-Fi shortcuts, and mobile PWA install.
              </p>
            </div>
            <button
              onClick={() => {
                sound.playTap();
                onOpenPiGuide();
              }}
              className="px-5 py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-black text-xs shrink-0 shadow-md active:scale-95 cursor-pointer"
            >
              Open Pi Guide
            </button>
          </div>
        </div>
      )}

      {/* --- MODALS --- */}

      {/* Chore Edit Modal */}
      {editingChore && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-yellow-50 rounded-[2.5rem] p-6 max-w-lg w-full shadow-2xl border-4 border-yellow-300 max-h-[90vh] overflow-y-auto">
            <h3 className="font-black text-xl text-slate-800 mb-4 italic">
              {editingChore.id ? 'Edit Chore Task' : 'Create New Chore Mission'}
            </h3>

            <div className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase mb-1">
                  Chore Title:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Empty Dishwasher & Put Away Cups"
                  value={editingChore.title || ''}
                  onChange={(e) => setEditingChore({ ...editingChore, title: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl border-2 border-slate-200 bg-white focus:outline-indigo-500 font-black text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase mb-1">
                    Category:
                  </label>
                  <select
                    value={editingChore.categoryId || database.categories[0]?.id}
                    onChange={(e) => setEditingChore({ ...editingChore, categoryId: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-2xl border-2 border-slate-200 bg-white text-xs font-black text-slate-800"
                  >
                    {database.categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase mb-1">
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

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase mb-1">
                    Star Reward:
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={editingChore.stars || 3}
                    onChange={(e) => setEditingChore({ ...editingChore, stars: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-2xl border-2 border-slate-200 bg-white font-black text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase mb-1">
                    Frequency:
                  </label>
                  <select
                    value={editingChore.frequency || 'daily'}
                    onChange={(e) => setEditingChore({ ...editingChore, frequency: e.target.value as FrequencyType })}
                    className="w-full px-2 py-2 rounded-2xl border-2 border-slate-200 bg-white text-xs font-black text-slate-800"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekdays">Weekdays</option>
                    <option value="weekends">Weekends</option>
                    <option value="as_needed">As Needed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase mb-1">
                    Time of Day:
                  </label>
                  <select
                    value={editingChore.timeOfDay || 'anytime'}
                    onChange={(e) => setEditingChore({ ...editingChore, timeOfDay: e.target.value as TimeOfDay })}
                    className="w-full px-2 py-2 rounded-2xl border-2 border-slate-200 bg-white text-xs font-black text-slate-800"
                  >
                    <option value="morning">Morning</option>
                    <option value="afternoon">Afternoon</option>
                    <option value="evening">Bedtime</option>
                    <option value="anytime">Anytime</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 uppercase mb-1">
                  Assign To Kids:
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingChore({ ...editingChore, assignedKidIds: ['all'] })}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-black border-2 cursor-pointer ${
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
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-black border-2 flex items-center gap-1 cursor-pointer ${
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
                <label className="block text-xs font-black text-slate-700 uppercase mb-1">
                  Helpful Description / Instructions:
                </label>
                <textarea
                  rows={2}
                  value={editingChore.description || ''}
                  onChange={(e) => setEditingChore({ ...editingChore, description: e.target.value })}
                  placeholder="e.g. Rinse plates, scrape food, and place utensils in the cutlery basket."
                  className="w-full px-3.5 py-2.5 rounded-2xl border-2 border-slate-200 bg-white text-xs font-bold text-slate-800 focus:outline-indigo-500 resize-none"
                />
              </div>

              {/* Subtask Checklists */}
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase mb-1">
                  Step-by-Step Checklist (One step per line):
                </label>
                <textarea
                  rows={3}
                  value={editingChore.subtasks ? editingChore.subtasks.join('\n') : ''}
                  onChange={(e) => {
                    const lines = e.target.value.split('\n');
                    setEditingChore({
                      ...editingChore,
                      subtasks: lines.filter((l) => l.trim().length > 0),
                    });
                  }}
                  placeholder="1. Pick up stuffed animals&#10;2. Fold clean blankets&#10;3. Put dirty clothes in the laundry hamper"
                  className="w-full px-3.5 py-2.5 rounded-2xl border-2 border-slate-200 bg-white text-xs font-bold text-slate-800 focus:outline-indigo-500 resize-none"
                />
              </div>

              {/* Focus Timer & Bounty Extras */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="p-3 bg-white rounded-2xl border-2 border-slate-200">
                  <label className="block text-xs font-black text-slate-700 uppercase mb-1">
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
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-black text-slate-900 bg-slate-50"
                  />
                  <span className="text-[10px] text-slate-400 font-bold block mt-1">
                    Shows countdown & speed bonus
                  </span>
                </div>

                <div className="p-3 bg-white rounded-2xl border-2 border-slate-200 flex flex-col justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
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
                    <div className="mt-2">
                      <label className="text-[10px] font-black uppercase text-amber-800 block mb-0.5">
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
                  <span className="text-[10px] text-slate-400 font-bold block mt-1">
                    Appears on the Bounty Board
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => setEditingChore(null)}
                className="flex-1 py-3 rounded-2xl border-2 border-slate-200 bg-white font-black text-xs text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSaveChore(editingChore)}
                className="flex-1 py-3 rounded-2xl bg-indigo-900 hover:bg-indigo-800 text-white font-black text-xs shadow-md active:scale-95 cursor-pointer"
              >
                Save Chore
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category Edit Modal */}
      {editingCategory && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-yellow-50 rounded-[2.5rem] p-6 max-w-md w-full shadow-2xl border-4 border-yellow-300">
            <h3 className="font-black text-xl text-slate-800 mb-4 italic">
              {editingCategory.id ? 'Edit Category' : 'New Category'}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase mb-1">
                  Category Name:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Garden & Yard"
                  value={editingCategory.name || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl border-2 border-slate-200 bg-white font-black text-sm text-slate-800 focus:outline-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 uppercase mb-1">
                  Accent Color:
                </label>
                <div className="flex gap-2">
                  {['#f59e0b', '#ec4899', '#3b82f6', '#10b981', '#8b5cf6', '#6366f1', '#f43f5e'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setEditingCategory({ ...editingCategory, color: c })}
                      className={`w-9 h-9 rounded-full border-2 transition-transform cursor-pointer ${
                        editingCategory.color === c ? 'scale-125 border-slate-900 ring-2 ring-yellow-400 shadow-md' : 'border-white'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => setEditingCategory(null)}
                className="flex-1 py-3 rounded-2xl border-2 border-slate-200 bg-white font-black text-xs text-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSaveCategory(editingCategory)}
                className="flex-1 py-3 rounded-2xl bg-indigo-900 hover:bg-indigo-800 text-white font-black text-xs shadow-md active:scale-95 cursor-pointer"
              >
                Save Category
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reward Edit Modal */}
      {editingReward && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-yellow-50 rounded-[2.5rem] p-6 max-w-md w-full shadow-2xl border-4 border-yellow-300">
            <h3 className="font-black text-xl text-slate-800 mb-4 italic">
              {editingReward.id ? 'Edit Reward Item' : 'New Reward Item'}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase mb-1">
                  Reward Title:
                </label>
                <input
                  type="text"
                  placeholder="e.g. 45 Mins Roblox or Fortnite"
                  value={editingReward.title || ''}
                  onChange={(e) => setEditingReward({ ...editingReward, title: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl border-2 border-slate-200 bg-white font-black text-sm text-slate-800 focus:outline-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase mb-1">
                    Star Cost:
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={editingReward.starCost || 20}
                    onChange={(e) => setEditingReward({ ...editingReward, starCost: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-2xl border-2 border-slate-200 bg-white font-black text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase mb-1">
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
                <label className="block text-xs font-black text-slate-700 uppercase mb-1">
                  Description:
                </label>
                <textarea
                  rows={2}
                  value={editingReward.description || ''}
                  onChange={(e) => setEditingReward({ ...editingReward, description: e.target.value })}
                  placeholder="How does this reward work?"
                  className="w-full px-3.5 py-2 rounded-2xl border-2 border-slate-200 bg-white text-xs font-bold text-slate-800 resize-none focus:outline-indigo-500"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => setEditingReward(null)}
                className="flex-1 py-3 rounded-2xl border-2 border-slate-200 bg-white font-black text-xs text-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSaveReward(editingReward)}
                className="flex-1 py-3 rounded-2xl bg-indigo-900 hover:bg-indigo-800 text-white font-black text-xs shadow-md active:scale-95 cursor-pointer"
              >
                Save Reward
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Kid Edit Modal */}
      {editingKid && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-yellow-50 rounded-[2.5rem] p-6 max-w-md w-full shadow-2xl border-4 border-yellow-300">
            <h3 className="font-black text-xl text-slate-800 mb-4 italic">
              {editingKid.id ? 'Edit Child Profile' : 'Add Child'}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase mb-1">
                  Child's Name:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Leo"
                  value={editingKid.name || ''}
                  onChange={(e) => setEditingKid({ ...editingKid, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl border-2 border-slate-200 bg-white font-black text-sm text-slate-800 focus:outline-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 uppercase mb-1">
                  Choose Fun Character Avatar:
                </label>
                <EmojiPicker
                  value={editingKid.avatar || '🦁'}
                  onChange={(emoji) => setEditingKid({ ...editingKid, avatar: emoji })}
                  title="Choose Kid Character"
                  categoryFilter="characters"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 uppercase mb-1">
                  Profile Color:
                </label>
                <div className="flex gap-2">
                  {['#f59e0b', '#ec4899', '#3b82f6', '#10b981', '#8b5cf6', '#06b6d4'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setEditingKid({ ...editingKid, color: c })}
                      className={`w-9 h-9 rounded-full border-2 cursor-pointer ${
                        editingKid.color === c ? 'scale-125 border-slate-900 ring-2 ring-yellow-400 shadow-md' : 'border-white'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => setEditingKid(null)}
                className="flex-1 py-3 rounded-2xl border-2 border-slate-200 bg-white font-black text-xs text-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSaveKid(editingKid)}
                className="flex-1 py-3 rounded-2xl bg-indigo-900 hover:bg-indigo-800 text-white font-black text-xs shadow-md active:scale-95 cursor-pointer"
              >
                Save Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bonus Star Award Modal */}
      {bonusStarModalKid && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-yellow-50 rounded-[2.5rem] p-6 max-w-sm w-full shadow-2xl border-4 border-yellow-300 text-center">
            <div className="text-4xl mb-2">⭐</div>
            <h3 className="font-black text-xl text-slate-800 mb-1 italic">
              Award Bonus Stars to {bonusStarModalKid.name}!
            </h3>
            <p className="text-xs text-slate-500 font-bold mb-4">
              Reward extra effort, good behavior, or helping without being asked.
            </p>

            <div className="flex justify-center gap-2 mb-4">
              {[2, 5, 10, 15].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setBonusStarsAmount(amt)}
                  className={`px-3 py-1.5 rounded-xl font-black text-sm border-2 cursor-pointer transition-all ${
                    bonusStarsAmount === amt
                      ? 'bg-yellow-400 text-slate-900 border-yellow-500 shadow-sm scale-105'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  +{amt} ⭐
                </button>
              ))}
            </div>

            <div className="text-left mb-5">
              <label className="block text-xs font-black text-slate-700 uppercase mb-1">
                Reason / Compliment:
              </label>
              <input
                type="text"
                value={bonusStarReason}
                onChange={(e) => setBonusStarReason(e.target.value)}
                className="w-full px-4 py-2 rounded-2xl border-2 border-slate-200 bg-white text-xs font-bold text-slate-800 focus:outline-indigo-500"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setBonusStarModalKid(null)}
                className="flex-1 py-3 rounded-2xl border-2 border-slate-200 bg-white font-black text-xs text-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAwardBonusStars}
                className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-yellow-400 to-orange-500 text-slate-900 font-black text-xs shadow-md active:scale-95 cursor-pointer border border-yellow-300"
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
