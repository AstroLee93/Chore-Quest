import React, { useState, useMemo } from 'react';
import {
  Gift,
  Star,
  Plus,
  Minus,
  Check,
  RotateCcw,
  Edit2,
  Trash2,
  PauseCircle,
  PlayCircle,
  Search,
  Filter,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  X,
  Sliders,
  Eye,
  Award,
  Clock,
  ChevronDown,
  Info,
} from 'lucide-react';
import { AppDatabase, RewardItem, RewardRedemption, KidProfile } from '../types';
import { EmojiPicker } from './EmojiPicker';
import { StarValueInput } from './StarValueInput';
import { sound } from '../utils/sound';
import { fireConfetti } from '../utils/confetti';

interface RewardsManagementSectionProps {
  database: AppDatabase;
  onUpdateDatabase: (updated: AppDatabase) => void;
  onPreviewStoreAsKid?: (kid: KidProfile) => void;
}

export const RewardsManagementSection: React.FC<RewardsManagementSectionProps> = ({
  database,
  onUpdateDatabase,
  onPreviewStoreAsKid,
}) => {
  // Claims Queue state
  const [claimSearch, setClaimSearch] = useState<string>('');
  const [claimStatusFilter, setClaimStatusFilter] = useState<'all' | 'pending' | 'fulfilled' | 'rejected'>('pending');
  const [claimKidFilter, setClaimKidFilter] = useState<string>('all');

  // Catalog state
  const [catalogSearch, setCatalogSearch] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'cost_asc' | 'cost_desc' | 'name' | 'category'>('cost_asc');

  // Editing reward modal state
  const [editingReward, setEditingReward] = useState<Partial<RewardItem> | null>(null);

  // Quick star cost tuner state (for quick-adjusting a reward's cost directly from card)
  const [quickTuningReward, setQuickTuningReward] = useState<RewardItem | null>(null);

  // Pause reason modal / inline state
  const [isEditingPauseReason, setIsEditingPauseReason] = useState<boolean>(false);
  const [pauseReasonInput, setPauseReasonInput] = useState<string>(database.settings.pauseRewardStoreReason || '');

  // Calculate average chore stars in household for calibration
  const averageChoreStars = useMemo(() => {
    const chores = database.chores || [];
    if (chores.length === 0) return 5;
    const total = chores.reduce((sum, c) => sum + (c.stars || 0), 0);
    return Math.max(1, Math.round(total / chores.length));
  }, [database.chores]);

  // Analytics
  const stats = useMemo(() => {
    const rewards = database.rewards || [];
    const redemptions = database.redemptions || [];
    const activeRewards = rewards.filter((r) => r.isActive).length;
    const pendingClaims = redemptions.filter((r) => r.status === 'pending').length;
    const fulfilledClaims = redemptions.filter((r) => r.status === 'fulfilled').length;
    const totalStarsRedeemed = redemptions
      .filter((r) => r.status === 'fulfilled' || r.status === 'approved')
      .reduce((sum, r) => sum + (r.starCost || 0), 0);

    return {
      activeRewards,
      totalRewards: rewards.length,
      pendingClaims,
      fulfilledClaims,
      totalStarsRedeemed,
    };
  }, [database.rewards, database.redemptions]);

  // Filtered claims
  const filteredClaims = useMemo(() => {
    let list = database.redemptions || [];

    if (claimStatusFilter !== 'all') {
      list = list.filter((r) => r.status === claimStatusFilter);
    }

    if (claimKidFilter !== 'all') {
      list = list.filter((r) => r.kidId === claimKidFilter);
    }

    if (claimSearch.trim()) {
      const q = claimSearch.toLowerCase().trim();
      list = list.filter((r) => {
        const kid = database.kids.find((k) => k.id === r.kidId);
        return (
          r.rewardTitle.toLowerCase().includes(q) ||
          (kid && kid.name.toLowerCase().includes(q)) ||
          (r.notes && r.notes.toLowerCase().includes(q))
        );
      });
    }

    // Sort newest first
    return [...list].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [database.redemptions, claimStatusFilter, claimKidFilter, claimSearch, database.kids]);

  // Filtered & sorted catalog
  const filteredCatalog = useMemo(() => {
    let list = database.rewards || [];

    if (categoryFilter !== 'all') {
      list = list.filter((r) => r.category === categoryFilter);
    }

    if (catalogSearch.trim()) {
      const q = catalogSearch.toLowerCase().trim();
      list = list.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          (r.description && r.description.toLowerCase().includes(q))
      );
    }

    return [...list].sort((a, b) => {
      if (sortBy === 'cost_asc') return a.starCost - b.starCost;
      if (sortBy === 'cost_desc') return b.starCost - a.starCost;
      if (sortBy === 'name') return a.title.localeCompare(b.title);
      if (sortBy === 'category') return a.category.localeCompare(b.category);
      return 0;
    });
  }, [database.rewards, categoryFilter, catalogSearch, sortBy]);

  // Toggle store pause
  const handleToggleStorePause = () => {
    sound.playTap();
    const newPaused = !database.settings.pauseRewardStore;
    onUpdateDatabase({
      ...database,
      settings: {
        ...database.settings,
        pauseRewardStore: newPaused,
        pauseRewardStoreReason: pauseReasonInput.trim() || undefined,
      },
    });
  };

  const handleSavePauseReason = () => {
    sound.playTap();
    onUpdateDatabase({
      ...database,
      settings: {
        ...database.settings,
        pauseRewardStoreReason: pauseReasonInput.trim() || undefined,
      },
    });
    setIsEditingPauseReason(false);
  };

  // Quick adjust star cost directly from catalog card
  const handleQuickAdjustStarCost = (rewardId: string, delta: number) => {
    sound.playTap();
    const updatedRewards = (database.rewards || []).map((r) => {
      if (r.id === rewardId) {
        const newCost = Math.max(1, Math.min(500, r.starCost + delta));
        return { ...r, starCost: newCost };
      }
      return r;
    });
    onUpdateDatabase({ ...database, rewards: updatedRewards });
  };

  // Toggle reward active state
  const handleToggleRewardActive = (rewardId: string) => {
    sound.playTap();
    const updatedRewards = (database.rewards || []).map((r) => {
      if (r.id === rewardId) {
        return { ...r, isActive: !r.isActive };
      }
      return r;
    });
    onUpdateDatabase({ ...database, rewards: updatedRewards });
  };

  // Save / Add reward
  const handleSaveReward = (reward: Partial<RewardItem>) => {
    sound.playTap();
    if (!reward.title?.trim() || !reward.starCost) return;

    let updatedRewards: RewardItem[];
    if (reward.id) {
      updatedRewards = (database.rewards || []).map((r) =>
        r.id === reward.id ? (reward as RewardItem) : r
      );
    } else {
      const newReward: RewardItem = {
        id: `rew-${Date.now()}`,
        title: reward.title.trim(),
        description: reward.description?.trim() || '',
        icon: reward.icon || '🎁',
        starCost: Math.max(1, Number(reward.starCost) || 20),
        category: reward.category || 'treat',
        maxPerWeek: reward.maxPerWeek || 1,
        isActive: reward.isActive ?? true,
      };
      updatedRewards = [...(database.rewards || []), newReward];
    }

    onUpdateDatabase({ ...database, rewards: updatedRewards });
    setEditingReward(null);
  };

  // Delete reward
  const handleDeleteReward = (rewardId: string) => {
    sound.playTap();
    if (confirm('Delete this reward from the store?')) {
      const updatedRewards = (database.rewards || []).filter((r) => r.id !== rewardId);
      onUpdateDatabase({ ...database, rewards: updatedRewards });
    }
  };

  // Update claim status (approve / fulfill / refund)
  const handleUpdateClaimStatus = (
    redemptionId: string,
    newStatus: 'approved' | 'fulfilled' | 'rejected'
  ) => {
    sound.playTap();
    const targetRedemption = (database.redemptions || []).find((r) => r.id === redemptionId);
    if (!targetRedemption) return;

    let updatedKids = database.kids;
    // If rejecting/refunding a claim, return the stars back to the child's bank account
    if (newStatus === 'rejected' && targetRedemption.status !== 'rejected') {
      updatedKids = database.kids.map((k) => {
        if (k.id === targetRedemption.kidId) {
          return { ...k, stars: k.stars + targetRedemption.starCost };
        }
        return k;
      });
      sound.playUnlock();
    } else if (newStatus === 'fulfilled' || newStatus === 'approved') {
      sound.playChoreComplete();
      fireConfetti({ origin: { y: 0.7 }, mode: 'snappy' });
    }

    const updatedRedemptions = (database.redemptions || []).map((r) => {
      if (r.id === redemptionId) {
        return { ...r, status: newStatus };
      }
      return r;
    });

    onUpdateDatabase({ ...database, redemptions: updatedRedemptions, kids: updatedKids });
  };

  // Bulk approve all pending claims
  const handleApproveAllPending = () => {
    sound.playChoreComplete();
    fireConfetti({ origin: { y: 0.6 }, mode: 'celebration' });
    const updatedRedemptions = (database.redemptions || []).map((r) =>
      r.status === 'pending' ? { ...r, status: 'fulfilled' as const } : r
    );
    onUpdateDatabase({ ...database, redemptions: updatedRedemptions });
  };

  const categories = [
    { id: 'all', label: 'All Categories', icon: '🌟' },
    { id: 'screen_time', label: 'Screen Time', icon: '📱' },
    { id: 'treat', label: 'Treats & Snacks', icon: '🍪' },
    { id: 'activity', label: 'Activities & Fun', icon: '🎮' },
    { id: 'privilege', label: 'Privileges', icon: '👑' },
    { id: 'allowance', label: 'Allowance & Cash', icon: '💵' },
    { id: 'other', label: 'Other Rewards', icon: '🎁' },
  ];

  return (
    <div id="rewards-claim-revamp-section" className="space-y-4 sm:space-y-6">
      {/* SECTION 1: HEADER & KEY ANALYTICS BANNER */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-pink-500 rounded-2xl sm:rounded-3xl p-4 sm:p-6 text-white shadow-md relative overflow-hidden">
        <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-xs text-[11px] font-black uppercase tracking-wider">
                Family Star Economy
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider flex items-center gap-1 ${
                  database.settings.pauseRewardStore
                    ? 'bg-amber-900 text-amber-100 border border-amber-400'
                    : 'bg-emerald-900/80 text-emerald-100 border border-emerald-400'
                }`}
              >
                {database.settings.pauseRewardStore ? (
                  <>
                    <PauseCircle className="w-3.5 h-3.5" />
                    <span>Store Paused for Kids</span>
                  </>
                ) : (
                  <>
                    <PlayCircle className="w-3.5 h-3.5" />
                    <span>Store Open & Active</span>
                  </>
                )}
              </span>
            </div>
            <h2 className="text-xl sm:text-3xl font-black italic tracking-tight flex items-center gap-2">
              <span>Rewards & Claim Center</span>
              <Gift className="w-6 h-6 sm:w-7 sm:h-7 text-amber-200" />
            </h2>
            <p className="text-xs sm:text-sm font-semibold text-white/90 max-w-xl">
              Calibrate star values, approve kid reward claims, or pause the store during homework hours.
            </p>
          </div>

          {/* Quick Action Controls */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <button
              type="button"
              id="btn-toggle-pause-reward-store"
              onClick={handleToggleStorePause}
              className={`min-h-[44px] px-4 py-2 rounded-xl font-black text-xs sm:text-sm transition-all active:scale-95 shadow-md flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                database.settings.pauseRewardStore
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  : 'bg-white text-slate-900 hover:bg-yellow-100'
              }`}
            >
              {database.settings.pauseRewardStore ? (
                <>
                  <PlayCircle className="w-4 h-4 text-white" />
                  <span>Resume / Open Store</span>
                </>
              ) : (
                <>
                  <PauseCircle className="w-4 h-4 text-amber-600" />
                  <span>Pause Store for Kids</span>
                </>
              )}
            </button>

            <button
              type="button"
              id="btn-add-reward-primary"
              onClick={() => {
                sound.playTap();
                setEditingReward({
                  starCost: 20,
                  category: 'treat',
                  maxPerWeek: 2,
                  isActive: true,
                });
              }}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-slate-950 hover:bg-slate-900 text-amber-300 font-black text-xs sm:text-sm transition-all active:scale-95 shadow-md flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Add New Reward</span>
            </button>
          </div>
        </div>

        {/* Store Pause Custom Reason Bar */}
        {database.settings.pauseRewardStore && (
          <div className="mt-4 pt-3 border-t border-white/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs bg-black/20 p-3 rounded-xl">
            <div className="flex items-center gap-2 flex-1">
              <Info className="w-4 h-4 text-amber-200 shrink-0" />
              {isEditingPauseReason ? (
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="text"
                    value={pauseReasonInput}
                    onChange={(e) => setPauseReasonInput(e.target.value)}
                    placeholder="e.g. Taking a quick break while finishing homework!"
                    className="flex-1 px-3 py-1.5 rounded-lg bg-white text-slate-900 font-bold text-xs focus:outline-amber-400"
                  />
                  <button
                    type="button"
                    onClick={handleSavePauseReason}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 font-black text-xs cursor-pointer"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingPauseReason(false)}
                    className="px-2 py-1.5 text-white/80 hover:text-white font-bold text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <span>
                  Kids see message:{' '}
                  <strong>
                    "{database.settings.pauseRewardStoreReason || 'Store paused by parents. Keep up the good work!'}"
                  </strong>
                </span>
              )}
            </div>
            {!isEditingPauseReason && (
              <button
                type="button"
                onClick={() => setIsEditingPauseReason(true)}
                className="text-amber-200 hover:text-white font-black underline text-xs cursor-pointer whitespace-nowrap"
              >
                Change Message
              </button>
            )}
          </div>
        )}

        {/* Analytics Highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mt-4 pt-4 border-t border-white/20">
          <div className="bg-white/10 backdrop-blur-xs p-2.5 sm:p-3 rounded-xl border border-white/15">
            <div className="text-[10px] font-black uppercase tracking-wider text-amber-200">
              Active Catalog Items
            </div>
            <div className="text-xl sm:text-2xl font-black mt-0.5">
              {stats.activeRewards}{' '}
              <span className="text-xs font-bold text-white/70">/ {stats.totalRewards} total</span>
            </div>
          </div>

          <div
            className={`p-2.5 sm:p-3 rounded-xl border transition-all ${
              stats.pendingClaims > 0
                ? 'bg-amber-400 text-slate-950 border-amber-300 font-black animate-pulse'
                : 'bg-white/10 backdrop-blur-xs border-white/15 text-white'
            }`}
          >
            <div className="text-[10px] font-black uppercase tracking-wider opacity-90 flex items-center justify-between">
              <span>Pending Claims</span>
              {stats.pendingClaims > 0 && <span>⚠️ Needs Action</span>}
            </div>
            <div className="text-xl sm:text-2xl font-black mt-0.5">
              {stats.pendingClaims} {stats.pendingClaims === 1 ? 'claim' : 'claims'}
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xs p-2.5 sm:p-3 rounded-xl border border-white/15">
            <div className="text-[10px] font-black uppercase tracking-wider text-amber-200">
              Fulfilled to Date
            </div>
            <div className="text-xl sm:text-2xl font-black mt-0.5">
              {stats.fulfilledClaims} claimed
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xs p-2.5 sm:p-3 rounded-xl border border-white/15">
            <div className="text-[10px] font-black uppercase tracking-wider text-amber-200">
              Total Stars Redeemed
            </div>
            <div className="text-xl sm:text-2xl font-black mt-0.5 flex items-center gap-1">
              <span>⭐ {stats.totalStarsRedeemed}</span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: REVAMPED KID REWARD CLAIMS QUEUE */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border-2 border-pink-400 p-4 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-pink-100">
          <div>
            <h3 className="font-black text-slate-800 text-base sm:text-lg flex items-center gap-2">
              <Gift className="w-5 h-5 text-pink-500" />
              <span>Kid Reward Claims Queue</span>
              {stats.pendingClaims > 0 && (
                <span className="px-2.5 py-0.5 rounded-full bg-pink-500 text-white font-black text-xs animate-bounce">
                  {stats.pendingClaims} Pending
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-500 font-bold">
              Review and approve rewards requested by kids. Approved rewards mark fulfilled; rejected claims automatically refund the stars!
            </p>
          </div>

          {stats.pendingClaims > 1 && (
            <button
              type="button"
              id="btn-approve-all-pending"
              onClick={handleApproveAllPending}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-sm flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer self-start sm:self-auto"
            >
              <Check className="w-4 h-4" />
              <span>Approve All ({stats.pendingClaims})</span>
            </button>
          )}
        </div>

        {/* Claim Queue Filters & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          {/* Status Tabs */}
          <div className="flex gap-1 bg-slate-100 p-1 rounded-xl overflow-x-auto text-xs font-black">
            <button
              type="button"
              onClick={() => setClaimStatusFilter('pending')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                claimStatusFilter === 'pending'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Pending</span>
              {stats.pendingClaims > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-pink-500 text-white text-[10px]">
                  {stats.pendingClaims}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setClaimStatusFilter('fulfilled')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                claimStatusFilter === 'fulfilled'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Fulfilled ({database.redemptions.filter((r) => r.status === 'fulfilled').length})
            </button>
            <button
              type="button"
              onClick={() => setClaimStatusFilter('rejected')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                claimStatusFilter === 'rejected'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Refunded
            </button>
            <button
              type="button"
              onClick={() => setClaimStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                claimStatusFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({database.redemptions.length})
            </button>
          </div>

          {/* Kid Filter & Search */}
          <div className="flex items-center gap-2">
            <select
              value={claimKidFilter}
              onChange={(e) => setClaimKidFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 cursor-pointer focus:outline-pink-500"
            >
              <option value="all">All Kids</option>
              {database.kids.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.avatar} {k.name}
                </option>
              ))}
            </select>

            <div className="relative flex-1 sm:w-44">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search claims..."
                value={claimSearch}
                onChange={(e) => setClaimSearch(e.target.value)}
                className="w-full pl-8 pr-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-pink-500"
              />
            </div>
          </div>
        </div>

        {/* Claims List */}
        {filteredClaims.length === 0 ? (
          <div className="text-center py-8 text-slate-400 bg-pink-50/40 rounded-2xl border-2 border-dashed border-pink-200 space-y-1">
            <Gift className="w-8 h-8 mx-auto text-pink-400 opacity-60" />
            <p className="font-black text-slate-700 text-sm">
              {claimStatusFilter === 'pending'
                ? 'All caught up! No pending reward claims.'
                : 'No reward claims match this filter.'}
            </p>
            <p className="text-xs text-slate-500 font-bold">
              When kids redeem items in the Star Store, their requests appear here for parent approval.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredClaims.map((claim) => {
              const kid = database.kids.find((k) => k.id === claim.kidId);
              const formattedDate = new Date(claim.date).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
              });

              return (
                <div
                  key={claim.id}
                  id={`claim-row-${claim.id}`}
                  className={`p-3 sm:p-4 rounded-2xl border-2 transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                    claim.status === 'pending'
                      ? 'bg-amber-50/40 border-amber-300 shadow-xs'
                      : claim.status === 'fulfilled'
                      ? 'bg-white border-slate-200'
                      : 'bg-rose-50/40 border-rose-200'
                  }`}
                >
                  <div className="flex items-start sm:items-center gap-3">
                    <span className="text-3xl p-2 rounded-2xl bg-yellow-100 border-2 border-yellow-300 shrink-0 shadow-2xs">
                      {claim.rewardIcon || '🎁'}
                    </span>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-black text-slate-900 text-sm sm:text-base">
                          {claim.rewardTitle}
                        </h4>
                        <span className="inline-flex items-center gap-1 font-black text-slate-950 bg-amber-400 px-2.5 py-0.5 rounded-full text-xs border border-amber-500 shadow-2xs">
                          ⭐ {claim.starCost} Points
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                            claim.status === 'pending'
                              ? 'bg-amber-200 text-amber-950 border-amber-300'
                              : claim.status === 'fulfilled'
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                              : 'bg-rose-100 text-rose-800 border-rose-300'
                          }`}
                        >
                          {claim.status === 'pending' ? 'Pending Parent Review' : claim.status}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-500 font-bold mt-1 flex-wrap">
                        <span className="flex items-center gap-1 text-slate-800">
                          <span>{kid?.avatar || '🦁'}</span>
                          <strong>{kid?.name || 'Kid'}</strong>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{formattedDate}</span>
                        </span>
                      </div>

                      {claim.notes && (
                        <div className="text-xs text-pink-700 font-bold italic mt-1 bg-pink-50 px-2.5 py-1 rounded-lg border border-pink-200 inline-block">
                          Note: "{claim.notes}"
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Claim Action Buttons */}
                  <div className="flex items-center gap-2 justify-end shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                    {claim.status === 'pending' ? (
                      <>
                        <button
                          type="button"
                          id={`btn-approve-claim-${claim.id}`}
                          onClick={() => handleUpdateClaimStatus(claim.id, 'fulfilled')}
                          className="min-h-[40px] px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center gap-1.5 shadow-xs transition-all active:scale-95 cursor-pointer"
                        >
                          <Check className="w-4 h-4 stroke-[3]" />
                          <span>Approve & Fulfill</span>
                        </button>
                        <button
                          type="button"
                          id={`btn-refund-claim-${claim.id}`}
                          onClick={() => {
                            if (confirm(`Refund ${claim.starCost} ⭐ back to ${kid?.name || 'child'}?`)) {
                              handleUpdateClaimStatus(claim.id, 'rejected');
                            }
                          }}
                          className="min-h-[40px] px-3 py-2 rounded-xl bg-white hover:bg-rose-50 text-rose-700 border border-rose-300 font-black text-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Refund Stars</span>
                        </button>
                      </>
                    ) : claim.status === 'fulfilled' ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Fulfilled</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Refund ${claim.starCost} ⭐ back to ${kid?.name || 'child'}?`)) {
                              handleUpdateClaimStatus(claim.id, 'rejected');
                            }
                          }}
                          title="Undo fulfillment and refund stars"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs font-black text-rose-700 flex items-center gap-1">
                        <RotateCcw className="w-4 h-4 text-rose-600" />
                        <span>Stars Refunded</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SECTION 3: REVAMPED REWARD CATALOG MANAGEMENT */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border-2 border-yellow-400 p-4 sm:p-6 shadow-xs space-y-4">
        {/* Catalog Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-yellow-100">
          <div>
            <h3 className="font-black text-slate-800 text-base sm:text-lg flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              <span>Reward Catalog Items ({database.rewards.length})</span>
            </h3>
            <p className="text-xs text-slate-500 font-bold">
              Adjust star prices directly on the cards using <strong className="text-amber-800">[-] and [+]</strong>, or click Edit for advanced settings.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              id="btn-add-reward-secondary"
              onClick={() => {
                sound.playTap();
                setEditingReward({
                  starCost: 20,
                  category: 'treat',
                  maxPerWeek: 2,
                  isActive: true,
                });
              }}
              className="px-3.5 py-2 rounded-xl bg-indigo-950 hover:bg-indigo-900 text-white font-black text-xs flex items-center gap-1.5 shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Add Reward</span>
            </button>
          </div>
        </div>

        {/* Filter / Sort / Search Toolbar */}
        <div className="space-y-2.5">
          {/* Category Pills */}
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  sound.playTap();
                  setCategoryFilter(cat.id);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 border ${
                  categoryFilter === cat.id
                    ? 'bg-amber-400 text-slate-950 border-amber-500 shadow-xs ring-2 ring-amber-200'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>

          {/* Search & Sort Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search rewards by name or description..."
                value={catalogSearch}
                onChange={(e) => setCatalogSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-yellow-500 bg-yellow-50/30"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black uppercase text-slate-400">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 cursor-pointer focus:outline-yellow-500"
              >
                <option value="cost_asc">⭐ Star Cost: Low to High</option>
                <option value="cost_desc">⭐ Star Cost: High to Low</option>
                <option value="name">Alphabetical (A-Z)</option>
                <option value="category">Category</option>
              </select>
            </div>
          </div>
        </div>

        {/* Catalog Grid */}
        {filteredCatalog.length === 0 ? (
          <div className="text-center py-10 text-slate-400 bg-yellow-50/50 rounded-2xl border-2 border-dashed border-yellow-200 space-y-2">
            <Award className="w-8 h-8 mx-auto text-yellow-500 opacity-50" />
            <p className="font-black text-slate-700 text-sm">No reward items found</p>
            <p className="text-xs text-slate-500 font-bold">
              Try adjusting your category filter or search terms, or add a brand new reward!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {filteredCatalog.map((reward) => {
              const isRewardActive = reward.isActive ?? true;

              return (
                <div
                  key={reward.id}
                  id={`reward-catalog-card-${reward.id}`}
                  className={`p-4 rounded-2xl border-2 transition-all flex flex-col justify-between ${
                    isRewardActive
                      ? 'bg-white border-slate-200 hover:border-amber-400 hover:shadow-md'
                      : 'bg-slate-50 border-slate-200 opacity-60'
                  }`}
                >
                  <div>
                    {/* Card Top: Icon, Active Badge & Options */}
                    <div className="flex items-start justify-between gap-2 mb-2.5">
                      <div className="flex items-center gap-2.5">
                        <span className="text-3xl p-2 rounded-2xl bg-yellow-100 border-2 border-yellow-300 shadow-2xs shrink-0">
                          {reward.icon || '🎁'}
                        </span>
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                            {reward.category.replace('_', ' ')}
                          </span>
                          <h4 className="font-black text-slate-900 text-sm sm:text-base leading-tight">
                            {reward.title}
                          </h4>
                        </div>
                      </div>

                      {/* Active Toggle Switch */}
                      <button
                        type="button"
                        onClick={() => handleToggleRewardActive(reward.id)}
                        title={isRewardActive ? 'Reward is active (click to pause)' : 'Reward is paused (click to activate)'}
                        className={`text-[10px] font-black px-2 py-0.5 rounded-full border cursor-pointer transition-all ${
                          isRewardActive
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : 'bg-slate-200 text-slate-600 border-slate-300'
                        }`}
                      >
                        {isRewardActive ? 'Active' : 'Paused'}
                      </button>
                    </div>

                    <p className="text-xs text-slate-600 font-bold mb-3 line-clamp-2 leading-relaxed">
                      {reward.description || 'No description provided.'}
                    </p>
                  </div>

                  {/* REVAMPED STAR VALUE ADJUSTMENT BAR ON CARD */}
                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    <div className="flex items-center justify-between gap-2 bg-amber-50/80 p-2 rounded-xl border border-amber-200">
                      <span className="text-[11px] font-black uppercase text-amber-900 tracking-wide">
                        Star Cost:
                      </span>

                      {/* Quick Stepper Controls */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleQuickAdjustStarCost(reward.id, -5)}
                          title="Decrease by 5 stars"
                          disabled={reward.starCost <= 5}
                          className="w-7 h-7 rounded-lg bg-white hover:bg-amber-100 text-slate-700 font-black text-[11px] border border-amber-200 flex items-center justify-center transition-transform active:scale-95 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                        >
                          -5
                        </button>
                        <button
                          type="button"
                          onClick={() => handleQuickAdjustStarCost(reward.id, -1)}
                          title="Decrease by 1 star"
                          disabled={reward.starCost <= 1}
                          className="w-7 h-7 rounded-lg bg-white hover:bg-amber-100 text-slate-800 font-black text-xs border border-amber-200 flex items-center justify-center transition-transform active:scale-95 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>

                        {/* Interactive Star Cost Badge */}
                        <button
                          type="button"
                          onClick={() => setQuickTuningReward(reward)}
                          title="Click for advanced star tuner"
                          className="px-2.5 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs border border-amber-500 shadow-2xs flex items-center gap-1 transition-all cursor-pointer active:scale-95"
                        >
                          <span>⭐</span>
                          <span className="text-sm">{reward.starCost}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleQuickAdjustStarCost(reward.id, 1)}
                          title="Increase by 1 star"
                          disabled={reward.starCost >= 500}
                          className="w-7 h-7 rounded-lg bg-white hover:bg-amber-100 text-slate-800 font-black text-xs border border-amber-200 flex items-center justify-center transition-transform active:scale-95 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleQuickAdjustStarCost(reward.id, 5)}
                          title="Increase by 5 stars"
                          disabled={reward.starCost >= 495}
                          className="w-7 h-7 rounded-lg bg-white hover:bg-amber-100 text-slate-700 font-black text-[11px] border border-amber-200 flex items-center justify-center transition-transform active:scale-95 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                        >
                          +5
                        </button>
                      </div>
                    </div>

                    {/* Card Footer: Weekly Limit & Edit/Delete actions */}
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 pt-1">
                      <span>Max {reward.maxPerWeek || 1}/wk</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          id={`btn-edit-reward-${reward.id}`}
                          onClick={() => {
                            sound.playTap();
                            setEditingReward(reward);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          id={`btn-delete-reward-${reward.id}`}
                          onClick={() => handleDeleteReward(reward.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* QUICK STAR TUNER MODAL (When clicking directly on a reward's star badge) */}
      {quickTuningReward && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl border-4 border-amber-400 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-2xl p-1.5 rounded-xl bg-yellow-100 border border-yellow-300">
                  {quickTuningReward.icon || '🎁'}
                </span>
                <div>
                  <h3 className="font-black text-slate-900 dark:text-white text-base">
                    Quick Calibrate Star Cost
                  </h3>
                  <p className="text-xs font-bold text-slate-500">
                    {quickTuningReward.title}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setQuickTuningReward(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <StarValueInput
              value={quickTuningReward.starCost}
              onChange={(newVal) =>
                setQuickTuningReward({ ...quickTuningReward, starCost: newVal })
              }
              label="Reward Star Value"
              averageChoreStars={averageChoreStars}
              showPresets={true}
              showSlider={true}
              showEffortGuide={true}
            />

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setQuickTuningReward(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 bg-white font-black text-xs text-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  sound.playTap();
                  const updatedRewards = (database.rewards || []).map((r) =>
                    r.id === quickTuningReward.id
                      ? { ...r, starCost: quickTuningReward.starCost }
                      : r
                  );
                  onUpdateDatabase({ ...database, rewards: updatedRewards });
                  setQuickTuningReward(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md active:scale-95 cursor-pointer"
              >
                Save Star Cost ⭐
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FULL REWARD EDIT / CREATE MODAL */}
      {editingReward && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="bg-yellow-50 dark:bg-slate-900 rounded-3xl p-5 sm:p-7 max-w-lg w-full shadow-2xl border-4 border-yellow-400 dark:border-slate-700 my-8 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-yellow-200 dark:border-slate-700">
              <h3 className="font-black text-lg sm:text-xl text-slate-900 dark:text-white italic flex items-center gap-2">
                <span>{editingReward.id ? 'Edit Reward Item' : 'Create New Reward Item'}</span>
                <span>🎁</span>
              </h3>
              <button
                type="button"
                onClick={() => setEditingReward(null)}
                className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 hover:bg-yellow-100 flex items-center justify-center text-slate-600 dark:text-slate-300 cursor-pointer border border-yellow-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Title & Icon */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-black text-slate-700 dark:text-slate-200 uppercase mb-1">
                    Reward Title:
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 45 Mins Roblox or Fortnite"
                    value={editingReward.title || ''}
                    onChange={(e) => setEditingReward({ ...editingReward, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-black text-sm text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-yellow-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 dark:text-slate-200 uppercase mb-1">
                    Emoji Icon:
                  </label>
                  <EmojiPicker
                    value={editingReward.icon || '🎁'}
                    onChange={(emoji) => setEditingReward({ ...editingReward, icon: emoji })}
                    title="Choose Reward Icon"
                    categoryFilter="rewards"
                  />
                </div>
              </div>

              {/* Category & Max Per Week */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-slate-700 dark:text-slate-200 uppercase mb-1">
                    Reward Category:
                  </label>
                  <select
                    value={editingReward.category || 'treat'}
                    onChange={(e) =>
                      setEditingReward({ ...editingReward, category: e.target.value as any })
                    }
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-xs sm:text-sm text-slate-800 dark:text-white focus:outline-yellow-500 cursor-pointer"
                  >
                    <option value="screen_time">📱 Screen Time</option>
                    <option value="treat">🍪 Treats & Snacks</option>
                    <option value="activity">🎮 Activities & Fun</option>
                    <option value="privilege">👑 Privileges</option>
                    <option value="allowance">💵 Allowance & Cash</option>
                    <option value="other">🎁 Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 dark:text-slate-200 uppercase mb-1">
                    Max Redemptions Per Week:
                  </label>
                  <select
                    value={editingReward.maxPerWeek || 1}
                    onChange={(e) =>
                      setEditingReward({ ...editingReward, maxPerWeek: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-xs sm:text-sm text-slate-800 dark:text-white focus:outline-yellow-500 cursor-pointer"
                  >
                    <option value={1}>1 time per week</option>
                    <option value={2}>2 times per week</option>
                    <option value={3}>3 times per week</option>
                    <option value={5}>5 times per week</option>
                    <option value={7}>Daily (7 times per week)</option>
                    <option value={99}>Unlimited</option>
                  </select>
                </div>
              </div>

              {/* REVAMPED STAR VALUE INPUT IN FULL MODAL */}
              <div>
                <StarValueInput
                  value={editingReward.starCost || 20}
                  onChange={(newCost) =>
                    setEditingReward({ ...editingReward, starCost: newCost })
                  }
                  label="Star Cost (Required Points)"
                  sublabel="Use the steppers, slider, or tap recommended tiers to set the price."
                  averageChoreStars={averageChoreStars}
                  showPresets={true}
                  showSlider={true}
                  showEffortGuide={true}
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-black text-slate-700 dark:text-slate-200 uppercase mb-1">
                  How does this reward work? (Notes for kids):
                </label>
                <textarea
                  rows={2}
                  value={editingReward.description || ''}
                  onChange={(e) =>
                    setEditingReward({ ...editingReward, description: e.target.value })
                  }
                  placeholder="e.g. Can be redeemed after 4 PM on weekdays once homework is complete!"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-white placeholder:text-slate-400 resize-none focus:outline-yellow-500"
                />
              </div>

              {/* Active Switch */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <div>
                  <div className="text-xs font-black text-slate-800 dark:text-white">
                    Publish in Kid Store
                  </div>
                  <div className="text-[10px] text-slate-500 font-bold">
                    When active, kids can see and redeem this reward.
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingReward.isActive ?? true}
                    onChange={(e) =>
                      setEditingReward({ ...editingReward, isActive: e.target.checked })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 sm:gap-3 pt-2">
              <button
                type="button"
                onClick={() => setEditingReward(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-black text-xs text-slate-700 dark:text-slate-200 cursor-pointer hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSaveReward(editingReward)}
                disabled={!editingReward.title?.trim() || !editingReward.starCost}
                className="flex-1 py-2.5 rounded-xl bg-indigo-950 hover:bg-indigo-900 text-white font-black text-xs shadow-md active:scale-95 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
              >
                Save Reward Item ⭐
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RewardsManagementSection;
