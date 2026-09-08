import React, { useState, useMemo, useEffect } from 'react';
import { X, Star, Check, Award, RotateCcw, Volume2, Shield, Sparkles, Clock, Target, CheckCircle2, KeyRound, Lock, Unlock } from 'lucide-react';
import { FamilyDatabase, ChoreItem, ChoreLog, KidProfile } from '../types';
import { sound } from '../utils/sound';
import { fireConfetti } from '../utils/confetti';
import { getTodayDateString, isChoreAssignedToKid } from '../utils/storage';

interface BountyBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
  database: FamilyDatabase;
  onUpdateDatabase: (updated: FamilyDatabase) => void;
  currentKid?: KidProfile | null;
  onStartTimer?: (chore: ChoreItem) => void;
  isParentMode?: boolean;
}

export const BountyBoardModal: React.FC<BountyBoardModalProps> = ({
  isOpen,
  onClose,
  database,
  onUpdateDatabase,
  currentKid,
  onStartTimer,
  isParentMode = false,
}) => {
  const todayStr = getTodayDateString();
  const [filter, setFilter] = useState<'all' | 'open' | 'claimed'>('all');
  const [activeClaimChoreId, setActiveClaimChoreId] = useState<string | null>(null);
  const [justClaimedLogId, setJustClaimedLogId] = useState<string | null>(null);
  const [justVerifiedLogId, setJustVerifiedLogId] = useState<string | null>(null);
  const [isBoardShaking, setIsBoardShaking] = useState(false);
  const [isSheriffUnlocked, setIsSheriffUnlocked] = useState<boolean>(!!isParentMode);
  const [showPinModal, setShowPinModal] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<string>('');
  const [pendingVerifyLogId, setPendingVerifyLogId] = useState<string | null>(null);

  // Unclaim PIN verification state (Kid PIN required to release bounty)
  const [showUnclaimModal, setShowUnclaimModal] = useState<boolean>(false);
  const [pendingUnclaimLogId, setPendingUnclaimLogId] = useState<string | null>(null);
  const [unclaimPinInput, setUnclaimPinInput] = useState<string>('');
  const [unclaimPinError, setUnclaimPinError] = useState<string>('');
  const [unclaimBannerMessage, setUnclaimBannerMessage] = useState<string | null>(null);

  // Play western twang upon opening
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        sound.playWesternTwang();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Active bounty chores
  const bountyChores = useMemo(() => {
    return (database.chores || []).filter((c) => c.isActive && c.isBounty);
  }, [database.chores]);

  // Today's logs for bounty chores
  const bountyLogsToday = useMemo(() => {
    const bountyIds = new Set(bountyChores.map((c) => c.id));
    return (database.logs || []).filter(
      (l) => l.date === todayStr && bountyIds.has(l.choreId) && l.status === 'completed'
    );
  }, [database.logs, bountyChores, todayStr]);

  // Map of choreId -> ChoreLog if claimed today
  const claimedMap = useMemo(() => {
    const map = new Map<string, ChoreLog>();
    bountyLogsToday.forEach((log) => {
      // If multiple kids did it, keep the most recent
      map.set(log.choreId, log);
    });
    return map;
  }, [bountyLogsToday]);

  // Count of claimed bounties that are verified by parent
  const verifiedCount = useMemo(() => {
    let count = 0;
    claimedMap.forEach((log) => {
      if (log.verifiedByParent) count++;
    });
    return count;
  }, [claimedMap]);

  // Total bounty pool
  const totalBountyPoolStars = useMemo(() => {
    return bountyChores.reduce((sum, c) => sum + (c.stars + (c.bountyBonusStars || 0)), 0);
  }, [bountyChores]);

  // Filtered bounty list
  const displayedChores = useMemo(() => {
    return bountyChores.filter((c) => {
      const isClaimed = claimedMap.has(c.id);
      if (filter === 'open') return !isClaimed;
      if (filter === 'claimed') return isClaimed;
      return true;
    });
  }, [bountyChores, claimedMap, filter]);

  // Target unclaim metadata
  const pendingUnclaimLog = useMemo(() => {
    if (!pendingUnclaimLogId) return null;
    return (database.logs || []).find((l) => l.id === pendingUnclaimLogId) || null;
  }, [pendingUnclaimLogId, database.logs]);

  const pendingUnclaimKid = useMemo(() => {
    if (!pendingUnclaimLog) return null;
    return (database.kids || []).find((k) => k.id === pendingUnclaimLog.kidId) || null;
  }, [pendingUnclaimLog, database.kids]);

  const pendingUnclaimChore = useMemo(() => {
    if (!pendingUnclaimLog) return null;
    return (database.chores || []).find((c) => c.id === pendingUnclaimLog.choreId) || null;
  }, [pendingUnclaimLog, database.chores]);

  if (!isOpen) return null;

  // Handle claiming a bounty for a chosen kid
  const handleClaimBounty = (chore: ChoreItem, kid: KidProfile) => {
    // Exclusivity Check: Once a kid claims a bounty, it is unable to be claimed by another kid
    const isAlreadyClaimedToday = (database.logs || []).some(
      (l) => l.choreId === chore.id && l.date === todayStr && l.status === 'completed'
    );
    if (isAlreadyClaimedToday) {
      sound.playWarning();
      return;
    }

    // 1. Play heavy wooden stamp slam + coin sparkle
    sound.playStampSlam();

    // 2. Shake the board
    setIsBoardShaking(true);
    setTimeout(() => setIsBoardShaking(false), 450);

    // 3. Fire Western celebratory gold confetti
    fireConfetti({
      mode: 'celebration',
      colors: ['#f59e0b', '#dc2626', '#d97706', '#fbbf24', '#b45309'],
      origin: { y: 0.5 },
    });

    const starsEarned = chore.stars + (chore.bountyBonusStars || 0);

    // Update log
    const existingLogIndex = (database.logs || []).findIndex(
      (l) => l.choreId === chore.id && l.kidId === kid.id && l.date === todayStr
    );

    const logId = existingLogIndex >= 0
      ? database.logs[existingLogIndex].id
      : `log-bounty-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;

    let updatedLogs: ChoreLog[];
    if (existingLogIndex >= 0) {
      updatedLogs = [...database.logs];
      updatedLogs[existingLogIndex] = {
        ...updatedLogs[existingLogIndex],
        status: 'completed',
        completedAt: new Date().toISOString(),
        starsAwarded: starsEarned,
        verifiedByParent: false,
      };
    } else {
      const newLog: ChoreLog = {
        id: logId,
        choreId: chore.id,
        kidId: kid.id,
        date: todayStr,
        status: 'completed',
        completedAt: new Date().toISOString(),
        starsAwarded: starsEarned,
        verifiedByParent: false,
      };
      updatedLogs = [...(database.logs || []), newLog];
    }

    // Award stars & update streak
    const updatedKids = database.kids.map((k) => {
      if (k.id === kid.id) {
        const isNewActiveDay = k.lastActiveDate !== todayStr;
        const newStreak = isNewActiveDay ? k.streakDays + 1 : Math.max(1, k.streakDays);
        return {
          ...k,
          stars: k.stars + starsEarned,
          lifetimeStars: k.lifetimeStars + starsEarned,
          streakDays: newStreak,
          lastActiveDate: todayStr,
        };
      }
      return k;
    });

    setJustClaimedLogId(logId);
    setActiveClaimChoreId(null);
    onUpdateDatabase({ ...database, kids: updatedKids, logs: updatedLogs });
  };

  // Handle parent verification (turns the stamp green!)
  const handleToggleParentVerification = (logId: string) => {
    const targetLog = database.logs.find((l) => l.id === logId);
    if (!targetLog) return;

    const willBeVerified = !targetLog.verifiedByParent;
    if (willBeVerified) {
      sound.playStampSlam();
      setJustVerifiedLogId(logId);
      setTimeout(() => setJustVerifiedLogId(null), 1200);
      fireConfetti({
        mode: 'celebration',
        colors: ['#10b981', '#059669', '#34d399', '#f59e0b', '#fbbf24'],
        origin: { y: 0.5 },
      });
    } else {
      sound.playUndo();
    }

    const updatedLogs = database.logs.map((l) =>
      l.id === logId ? { ...l, verifiedByParent: willBeVerified } : l
    );

    onUpdateDatabase({ ...database, logs: updatedLogs });
  };

  const handlePromptVerify = (logId: string) => {
    if (isParentMode || isSheriffUnlocked) {
      handleToggleParentVerification(logId);
    } else {
      setPendingVerifyLogId(logId);
      setPinInput('');
      setPinError('');
      setShowPinModal(true);
    }
  };

  const handleConfirmPin = () => {
    const correctPin = database.settings.parentPin || '1234';
    if (pinInput === correctPin) {
      sound.playUnlock();
      setIsSheriffUnlocked(true);
      setShowPinModal(false);
      setPinError('');
      if (pendingVerifyLogId) {
        handleToggleParentVerification(pendingVerifyLogId);
        setPendingVerifyLogId(null);
      }
    } else {
      sound.playSkipNotice();
      setPinError('Incorrect Sheriff PIN. Try again.');
      setPinInput('');
    }
  };

  // Prompt unclaim with password verification
  const handlePromptUnclaim = (logId: string) => {
    sound.playTap();
    setPendingUnclaimLogId(logId);
    setUnclaimPinInput('');
    setUnclaimPinError('');
    setShowUnclaimModal(true);
  };

  const handleConfirmUnclaim = () => {
    if (!pendingUnclaimLogId || !pendingUnclaimLog) return;
    const kidPin = pendingUnclaimKid?.pin || '1234';
    const parentPin = database.settings.parentPin || '1234';
    const entered = unclaimPinInput.trim();

    if (entered === kidPin || entered === parentPin) {
      const kidName = pendingUnclaimKid?.name || 'Deputy';
      const choreTitle = pendingUnclaimChore?.title || 'Contract';
      handleUndoClaim(pendingUnclaimLogId);
      setShowUnclaimModal(false);
      setPendingUnclaimLogId(null);
      setUnclaimPinInput('');
      setUnclaimPinError('');
      setUnclaimBannerMessage(
        `★ Contract Released! "${choreTitle}" was unclaimed by Deputy ${kidName} and is now open for ANY deputy to claim! ★`
      );
      setTimeout(() => setUnclaimBannerMessage(null), 5000);
    } else {
      sound.playSkipNotice();
      setUnclaimPinError(
        `Incorrect PIN! Enter ${pendingUnclaimKid?.name || 'Deputy'}'s password/PIN (or Sheriff PIN) to release this contract.`
      );
      setUnclaimPinInput('');
    }
  };

  // Handle undoing a claimed bounty
  const handleUndoClaim = (logId: string) => {
    sound.playUndo();
    const targetLog = database.logs.find((l) => l.id === logId);
    if (!targetLog) return;

    const starsToDeduct = targetLog.starsAwarded || 0;
    const updatedKids = database.kids.map((k) =>
      k.id === targetLog.kidId
        ? {
            ...k,
            stars: Math.max(0, k.stars - starsToDeduct),
            lifetimeStars: Math.max(0, k.lifetimeStars - starsToDeduct),
          }
        : k
    );

    const updatedLogs = database.logs.filter((l) => l.id !== logId);
    if (justClaimedLogId === logId) setJustClaimedLogId(null);
    if (justVerifiedLogId === logId) setJustVerifiedLogId(null);
    if (pendingUnclaimLogId === logId) setPendingUnclaimLogId(null);
    onUpdateDatabase({ ...database, kids: updatedKids, logs: updatedLogs });
  };

  // Fun Western flavor subtitles for chores
  const getWesternFlavor = (index: number) => {
    const flavors = [
      '★ WANTED FOR CRIMES AGAINST TIDINESS ★',
      '★ NOTORIOUS ALLY OF MESS & DUST ★',
      '★ HIGH-PRIORITY FAMILY CONTRACT ★',
      '★ DARING DEPUTY EXTRA CREDIT MISSION ★',
      '★ URGENT CHOREVILLE PEACE RESTORATION ★',
    ];
    return flavors[index % flavors.length];
  };

  return (
    <div
      id="modal-western-bounty-board"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/80 backdrop-blur-xs overflow-y-auto animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Outer Wooden Board Frame */}
      <div
        className={`relative w-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl border-4 sm:border-8 border-[#3b2210] flex flex-col max-h-[92vh] transition-transform ${
          isBoardShaking ? 'animate-board-shake' : ''
        }`}
        style={{
          background: 'linear-gradient(180deg, #2b170a 0%, #3e2210 50%, #201007 100%)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.9), inset 0 0 40px rgba(0, 0, 0, 0.8)',
        }}
      >
        {/* Brass corner brackets/rivets */}
        <div className="absolute top-2 left-2 w-4 h-4 rounded-full bg-gradient-to-br from-amber-200 to-amber-600 border border-amber-800 shadow-sm pointer-events-none" />
        <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-gradient-to-br from-amber-200 to-amber-600 border border-amber-800 shadow-sm pointer-events-none" />
        <div className="absolute bottom-2 left-2 w-4 h-4 rounded-full bg-gradient-to-br from-amber-200 to-amber-600 border border-amber-800 shadow-sm pointer-events-none" />
        <div className="absolute bottom-2 right-2 w-4 h-4 rounded-full bg-gradient-to-br from-amber-200 to-amber-600 border border-amber-800 shadow-sm pointer-events-none" />

        {/* TOP BAR / CARVED WOODEN SIGN */}
        <div className="relative px-4 py-3 sm:py-4 bg-[#231206] border-b-4 border-[#4d2d14] flex flex-col sm:flex-row items-center justify-between gap-3 text-white">
          {/* Western Sign Banner */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-800 border-2 border-amber-300 flex items-center justify-center text-2xl shadow-lg shrink-0">
              🤠
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded-full border border-amber-600/60">
                  ★ SHERIFF'S HEADQUARTERS ★
                </span>
                <span className="text-xs text-amber-200/80 hidden md:inline">
                  ChoreVille Gazette
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-amber-100 tracking-wider uppercase font-serif drop-shadow-md">
                The Bounty Board
              </h2>
            </div>
          </div>

          {/* Western Stats Badges & Actions */}
          <div className="flex items-center gap-2 flex-wrap justify-end w-full sm:w-auto">
            <div className="bg-[#381f0d] border border-amber-600/50 px-3 py-1.5 rounded-xl flex items-center gap-2 shadow-inner">
              <span className="text-amber-400 font-bold text-xs">Total Bounty:</span>
              <span className="text-amber-300 font-black text-sm flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                {totalBountyPoolStars} ⭐
              </span>
            </div>

            {/* Saloon Twang Sound Trigger */}
            <button
              onClick={() => sound.playWesternTwang()}
              className="p-2 rounded-xl bg-amber-900/60 hover:bg-amber-800/80 border border-amber-500/40 text-amber-200 transition-all cursor-pointer shadow-xs active:scale-95"
              title="Play Western Saloon Twang"
            >
              <Volume2 className="w-4 h-4" />
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-red-900 hover:bg-red-800 text-white font-bold text-xs flex items-center gap-1 transition-all cursor-pointer shadow-md active:scale-95 border border-red-600"
              title="Close Bounty Board"
            >
              <X className="w-4 h-4 stroke-[3]" />
              <span className="hidden sm:inline">Close</span>
            </button>
          </div>
        </div>

        {/* SUB-HEADER: Rustic Notice & Filter Tabs */}
        <div className="px-4 py-2 sm:py-3 bg-[#1d0e04]/90 border-b-2 border-[#4d2d14] flex flex-wrap items-center justify-between gap-2 text-xs">
          <p className="text-amber-200/90 font-medium italic flex items-center gap-1.5 text-[11px] sm:text-xs">
            <span>📜</span>
            <span>Extra credit contracts! Any daring deputy can complete these missions to claim gold stars.</span>
          </p>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 bg-[#2e1909] p-1 rounded-xl border border-amber-900/60">
            <button
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-black transition-all cursor-pointer text-[11px] ${
                filter === 'all'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-amber-200/80 hover:text-white'
              }`}
            >
              All ({bountyChores.length})
            </button>
            <button
              onClick={() => setFilter('open')}
              className={`px-2.5 py-1 rounded-lg font-black transition-all cursor-pointer text-[11px] flex items-center gap-1 ${
                filter === 'open'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-amber-200/80 hover:text-white'
              }`}
            >
              <span>Wanted</span>
              <span className="px-1.5 py-0.2 rounded-full bg-amber-950/80 text-amber-300 text-[9px] font-black">
                {bountyChores.length - claimedMap.size}
              </span>
            </button>
            <button
              onClick={() => setFilter('claimed')}
              className={`px-2.5 py-1 rounded-lg font-black transition-all cursor-pointer text-[11px] flex items-center gap-1 ${
                filter === 'claimed'
                  ? 'bg-red-700 text-white shadow-xs'
                  : 'text-amber-200/80 hover:text-white'
              }`}
            >
              <span>Claimed</span>
              <span className="px-1.5 py-0.2 rounded-full bg-amber-950/80 text-amber-300 text-[9px] font-black">
                {claimedMap.size}
              </span>
              {verifiedCount > 0 && (
                <span
                  className="px-1.5 py-0.2 rounded-full bg-emerald-600 text-white text-[9px] font-black"
                  title={`${verifiedCount} confirmed by parent`}
                >
                  {verifiedCount} ✓
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Unclaim Release Success Notice */}
        {unclaimBannerMessage && (
          <div className="mx-4 sm:mx-6 mt-3 p-3 rounded-2xl bg-emerald-700 text-amber-100 font-serif font-black text-xs sm:text-sm text-center shadow-md animate-fade-in border-2 border-emerald-400 flex items-center justify-center gap-2">
            <span className="text-base">🔓</span>
            <span>{unclaimBannerMessage}</span>
          </div>
        )}

        {/* MAIN BODY: THE PADDED WOODEN BULLETIN BOARD */}
        <div
          className="flex-1 p-3 sm:p-6 overflow-y-auto"
          style={{
            backgroundImage: `
              repeating-linear-gradient(
                0deg,
                rgba(0, 0, 0, 0.25) 0px,
                rgba(0, 0, 0, 0.25) 2px,
                transparent 2px,
                transparent 48px
              ),
              radial-gradient(ellipse at center, #42240f 0%, #201107 100%)
            `,
          }}
        >
          {displayedChores.length === 0 ? (
            /* Empty State Poster */
            <div className="max-w-md mx-auto my-8 p-6 sm:p-8 bg-[#fdf6e2] rounded-2xl border-4 border-[#8c592b] shadow-2xl text-center space-y-3 relative text-slate-900">
              <div className="w-4 h-4 rounded-full bg-amber-600 border border-amber-900 mx-auto -mt-10 mb-2 shadow-md" />
              <div className="text-4xl">🌵</div>
              <h3 className="text-lg sm:text-xl font-black uppercase tracking-wider font-serif text-[#663d14]">
                ★ The Town is Peaceful ★
              </h3>
              <p className="text-xs sm:text-sm font-medium text-[#7a4c1c]">
                {filter === 'claimed'
                  ? 'No bounties have been settled today yet. Grab a contract and claim your reward!'
                  : 'No active bounty missions found matching this view. Check with the Sheriff (Mom & Lex) to post high-value contracts!'}
              </p>
              {filter !== 'all' && (
                <button
                  onClick={() => setFilter('all')}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-black text-xs transition-all shadow-md cursor-pointer"
                >
                  View All Notices
                </button>
              )}
            </div>
          ) : (
            /* WANTED POSTERS GRID */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {displayedChores.map((chore, index) => {
                const isClaimedToday = claimedMap.has(chore.id);
                const claimLog = claimedMap.get(chore.id);
                const isParentVerified = claimLog ? !!claimLog.verifiedByParent : false;
                const claimingKid = claimLog
                  ? database.kids.find((k) => k.id === claimLog.kidId)
                  : null;

                const isJustClaimed = claimLog && justClaimedLogId === claimLog.id;
                const isJustVerified = claimLog && justVerifiedLogId === claimLog.id;
                const totalReward = chore.stars + (chore.bountyBonusStars || 0);
                const category = database.categories.find((c) => c.id === chore.categoryId);

                // Subtle organic tilt for notice board effect
                const tilts = ['rotate-[-1.5deg]', 'rotate-[1.2deg]', 'rotate-[-0.8deg]', 'rotate-[1.5deg]'];
                const cardTilt = tilts[index % tilts.length];

                return (
                  <div
                    key={chore.id}
                    className={`relative bg-[#fdf8e6] rounded-xl border-4 ${
                      isParentVerified
                        ? 'border-emerald-700 shadow-emerald-950/20'
                        : isClaimedToday
                        ? 'border-red-800 shadow-red-950/20'
                        : 'border-[#845326]'
                    } shadow-xl p-4 sm:p-5 flex flex-col justify-between transition-all duration-200 hover:shadow-2xl hover:scale-[1.01] ${cardTilt} hover:rotate-0`}
                    style={{
                      backgroundImage: `
                        radial-gradient(circle at 50% 0%, rgba(217, 119, 6, 0.08) 0%, transparent 60%),
                        linear-gradient(to bottom, #fffdf2 0%, #f7edd3 100%)
                      `,
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.45), 0 0 10px rgba(115, 65, 20, 0.3)',
                    }}
                  >
                    {/* Top Brass Thumbtack / Nail */}
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-gradient-to-br from-amber-300 via-amber-500 to-amber-800 border border-amber-900 shadow-md flex items-center justify-center z-10">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-100" />
                    </div>

                    {/* TOP: Classic Wanted Banner */}
                    <div className="text-center space-y-1 pb-2 border-b-2 border-dashed border-[#a3703e]">
                      <div className="text-[10px] font-black uppercase tracking-widest text-[#8c592b]">
                        {getWesternFlavor(index)}
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-[0.2em] font-serif text-[#4a2608] drop-shadow-xs">
                        WANTED
                      </h3>
                      {category && (
                        <div className="inline-block px-2 py-0.5 rounded-md bg-[#ebdcbf] text-[#6b3c10] text-[10px] font-black uppercase tracking-wider border border-[#bfa27d]">
                          {category.name}
                        </div>
                      )}
                    </div>

                    {/* CENTER: Wanted Subject (Chore Icon & Title) */}
                    <div className="py-3 sm:py-4 flex flex-col items-center text-center space-y-2.5">
                      {/* Woodcut Oval Portrait Frame */}
                      <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-[#f0e2c8] border-3 border-[#734217] flex items-center justify-center text-4xl sm:text-5xl shadow-inner">
                        <div className="absolute inset-1 rounded-xl border border-dashed border-[#9c6a38] pointer-events-none" />
                        <span>{chore.icon || '⭐'}</span>
                      </div>

                      {/* Chore Name */}
                      <h4 className="text-base sm:text-lg font-black text-[#2e1503] leading-tight font-serif">
                        {chore.title}
                      </h4>

                      {/* Subtasks or Instructions if any */}
                      {chore.subtasks && chore.subtasks.length > 0 && (
                        <div className="w-full bg-[#f4e8d3] p-2 rounded-lg border border-[#c4a984] text-left">
                          <span className="text-[10px] font-black uppercase tracking-wider text-[#734217] block mb-1">
                            Contract Requirements:
                          </span>
                          <ul className="text-[11px] font-medium text-[#4a2608] space-y-0.5 list-disc list-inside">
                            {chore.subtasks.slice(0, 3).map((sub, idx) => (
                              <li key={idx} className="truncate">{sub}</li>
                            ))}
                            {chore.subtasks.length > 3 && (
                              <li className="text-[10px] italic text-[#734217]">
                                +{chore.subtasks.length - 3} more checklist steps...
                              </li>
                            )}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* REWARD SLATE */}
                    <div className="bg-gradient-to-r from-[#edd9b6] via-[#f7e8ce] to-[#edd9b6] p-3 rounded-xl border-2 border-[#8c592b] text-center shadow-inner my-2">
                      <div className="text-[10px] font-black uppercase tracking-widest text-[#7a4c1c] flex items-center justify-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-600" />
                        <span>★ BOUNTY REWARD ★</span>
                        <Sparkles className="w-3 h-3 text-amber-600" />
                      </div>
                      <div className="text-xl sm:text-2xl font-black text-[#8c4600] flex items-center justify-center gap-1 mt-0.5 font-serif">
                        <Star className="w-5 h-5 fill-amber-500 text-amber-600" />
                        <span>+{totalReward} GOLD STARS</span>
                      </div>
                      <div className="text-[10px] font-extrabold text-[#7a4c1c]/80 mt-0.5">
                        ({chore.stars} base stars + {chore.bountyBonusStars || 0} bounty bonus!)
                      </div>
                    </div>

                    {/* BOTTOM ACTIONS / CLAIM STAMP AREA */}
                    <div className="pt-2">
                      {isClaimedToday ? (
                        /* ALREADY CLAIMED STAMP INFO BOX */
                        <div className="space-y-2">
                          {isParentVerified ? (
                            /* VERIFIED BY PARENT (GREEN) */
                            <div
                              className={`p-2.5 rounded-xl border-3 border-emerald-600 bg-emerald-50 text-center relative overflow-hidden shadow-md ${
                                isJustVerified ? 'animate-stamp-slam' : 'rotate-[-1deg]'
                              }`}
                            >
                              <div className="text-xs font-black uppercase tracking-widest text-emerald-800 flex items-center justify-center gap-1.5 font-serif">
                                <CheckCircle2 className="w-4 h-4 stroke-[3] text-emerald-600" />
                                <span>★ CLAIMED & VERIFIED BY PARENT ★</span>
                              </div>
                              <div className="text-[11px] font-extrabold text-emerald-950 mt-0.5 flex items-center justify-center gap-1.5 flex-wrap">
                                <span>Settled by Deputy <strong>{claimingKid?.name || 'Child'}</strong></span>
                                <span>•</span>
                                <span className="font-black text-emerald-700">+{claimLog?.starsAwarded || totalReward} ⭐ Confirmed</span>
                              </div>
                              {claimLog?.completedAt && (
                                <div className="text-[9px] font-semibold text-emerald-700/80 mt-0.5">
                                  Confirmed at {new Date(claimLog.completedAt).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
                                </div>
                              )}
                            </div>
                          ) : (
                            /* PENDING PARENT VERIFICATION (RED) */
                            <div
                              className={`p-2.5 rounded-xl border-3 border-red-700 bg-red-50 text-center relative overflow-hidden shadow-md ${
                                isJustClaimed ? 'animate-stamp-slam' : 'rotate-[-2deg]'
                              }`}
                            >
                              <div className="text-xs font-black uppercase tracking-widest text-red-800 flex items-center justify-center gap-1 font-serif">
                                <Check className="w-4 h-4 stroke-[3]" />
                                <span>★ BOUNTY CLAIMED ★</span>
                              </div>
                              <div className="text-[11px] font-extrabold text-red-900 mt-0.5 flex items-center justify-center gap-1.5 flex-wrap">
                                <span>Settled by Deputy <strong>{claimingKid?.name || 'Child'}</strong></span>
                                <span>•</span>
                                <span className="font-bold">+{claimLog?.starsAwarded || totalReward} ⭐</span>
                              </div>
                              <div className="text-[10px] font-bold text-amber-800 mt-0.5 flex items-center justify-center gap-1">
                                <Clock className="w-3 h-3 text-amber-600" />
                                <span>Awaiting Parent Confirmation</span>
                              </div>
                            </div>
                          )}

                          {/* Verification and Reopen Action Bar */}
                          {claimLog && (
                            <div className="flex items-center justify-between gap-1.5 pt-0.5">
                              {isParentVerified ? (
                                <button
                                  onClick={() => handleToggleParentVerification(claimLog.id)}
                                  className="text-[10px] font-bold text-emerald-800 hover:text-emerald-950 bg-emerald-100/90 hover:bg-emerald-200 px-2 py-0.5 rounded-md transition-colors flex items-center gap-1 cursor-pointer border border-emerald-300"
                                  title="Click to toggle parent verification status"
                                >
                                  <Shield className="w-3 h-3 text-emerald-600" />
                                  <span>Verified ✓ (Unmark)</span>
                                </button>
                              ) : (
                                <button
                                  id={`btn-verify-bounty-${claimLog.id}`}
                                  onClick={() => handlePromptVerify(claimLog.id)}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-black text-[11px] flex items-center gap-1 transition-all shadow-xs cursor-pointer font-serif"
                                  title="Confirm and verify this bounty completion"
                                >
                                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                                  <span>Parent Confirm ✓</span>
                                </button>
                              )}

                              <button
                                id={`btn-unclaim-bounty-${claimLog.id}`}
                                onClick={() => handlePromptUnclaim(claimLog.id)}
                                className="text-[11px] font-black text-[#734217] hover:text-red-700 transition-colors flex items-center gap-1.5 cursor-pointer ml-auto px-2.5 py-1 rounded-lg bg-[#edd9b6] border border-[#c49a6c] hover:bg-red-50 hover:border-red-300 font-serif active:scale-95 shadow-2xs"
                                title={`Unclaim this bounty contract (requires Deputy ${claimingKid?.name || 'claimer'}'s PIN)`}
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>Unclaim Contract 🔓</span>
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        /* OPEN WANTED CONTRACT: CLAIM OR TIME */
                        <div className="space-y-2">
                          {activeClaimChoreId === chore.id ? (
                            /* Kid Selector for Claiming */
                            <div className="bg-[#edd9b6] p-2.5 rounded-xl border-2 border-[#8c592b] space-y-2 animate-scale-up">
                              <div className="flex items-center justify-between">
                                <span className="text-[11px] font-black uppercase tracking-wider text-[#4a2608]">
                                  Select Claiming Deputy:
                                </span>
                                <button
                                  onClick={() => setActiveClaimChoreId(null)}
                                  className="text-xs font-bold text-[#734217] hover:text-red-700 cursor-pointer"
                                >
                                  Cancel
                                </button>
                              </div>

                              <div className="grid grid-cols-2 gap-1.5">
                                {database.kids.map((k) => (
                                  <button
                                    key={k.id}
                                    onClick={() => handleClaimBounty(chore, k)}
                                    className="p-2 rounded-lg bg-[#fff9ee] hover:bg-amber-100 border border-[#b88c58] flex items-center gap-2 text-left cursor-pointer transition-all active:scale-95 shadow-xs"
                                  >
                                    <span className="text-lg">{k.avatar}</span>
                                    <div className="min-w-0">
                                      <div className="text-xs font-black text-[#2e1503] truncate">
                                        {k.name}
                                      </div>
                                      <div className="text-[10px] font-bold text-amber-700">
                                        {k.stars} ⭐
                                      </div>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            </div>
                          ) : (
                            /* Primary Claim Button & Mission Timer */
                            <div className="flex items-center gap-2">
                              <button
                                id={`btn-claim-bounty-${chore.id}`}
                                onClick={() => {
                                  // If there's an active kid session, claim directly for them
                                  if (currentKid) {
                                    handleClaimBounty(chore, currentKid);
                                  } else if (database.kids.length === 1) {
                                    handleClaimBounty(chore, database.kids[0]);
                                  } else {
                                    sound.playTap();
                                    setActiveClaimChoreId(chore.id);
                                  }
                                }}
                                className="flex-1 min-h-[46px] py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 active:scale-95 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider shadow-md border-2 border-amber-400 flex items-center justify-center gap-1.5 transition-all cursor-pointer font-serif"
                                title="Claim this bounty contract"
                              >
                                <Award className="w-4 h-4 stroke-[2.5]" />
                                <span>Claim Bounty (+{totalReward}⭐)</span>
                              </button>

                              {onStartTimer && (
                                <button
                                  onClick={() => {
                                    sound.playTap();
                                    onStartTimer(chore);
                                  }}
                                  className="p-2.5 rounded-xl bg-[#edd9b6] hover:bg-[#e4cbb0] text-[#4a2608] border border-[#a3703e] font-bold text-xs transition-all cursor-pointer shadow-xs active:scale-95 shrink-0"
                                  title="Start Focus Timer for this mission"
                                >
                                  <Clock className="w-4 h-4 text-[#734217]" />
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* MASSIVE DISTRESSED RUBBER STAMP (Over Entire Poster when Claimed) */}
                    {/* TURNS GREEN UPON PARENT CONFIRMATION FOR VISUAL COMPLETION! */}
                    {isClaimedToday && (
                      <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-4">
                        {isParentVerified ? (
                          /* GREEN STAMP: PARENT VERIFIED / SETTLED */
                          <div
                            className={`border-4 sm:border-6 border-emerald-600 text-emerald-700 rounded-2xl px-4 py-3 text-center uppercase font-serif font-black tracking-[0.22em] shadow-2xl bg-emerald-100/40 backdrop-blur-[0.5px] transition-all duration-300 ${
                              isJustVerified ? 'animate-stamp-slam' : 'rotate-[-14deg]'
                            }`}
                            style={{
                              boxShadow: '0 0 0 2px rgba(16, 185, 129, 0.5), inset 0 0 16px rgba(16, 185, 129, 0.25)',
                              transform: isJustVerified ? undefined : 'rotate(-14deg) scale(0.95)',
                            }}
                          >
                            <div className="text-xl sm:text-2xl md:text-3xl leading-none flex items-center justify-center gap-1.5 drop-shadow-xs">
                              <span>★</span>
                              <span>CLAIMED</span>
                              <span>★</span>
                            </div>
                            <div className="text-[10px] sm:text-xs font-black tracking-widest mt-1 text-emerald-800 flex items-center justify-center gap-1">
                              <Check className="w-3.5 h-3.5 stroke-[3] text-emerald-600 inline" />
                              <span>CONFIRMED BY PARENT</span>
                              <span>•</span>
                              <span>{claimingKid?.name || 'DEPUTY'}</span>
                            </div>
                          </div>
                        ) : (
                          /* RED STAMP: CLAIMED, PENDING PARENT CONFIRMATION */
                          <div
                            className={`border-4 sm:border-6 border-red-600/90 text-red-600/90 rounded-2xl px-4 py-3 text-center uppercase font-serif font-black tracking-[0.25em] shadow-xl bg-red-100/30 backdrop-blur-[0.5px] ${
                              isJustClaimed ? 'animate-stamp-slam' : 'rotate-[-14deg]'
                            }`}
                            style={{
                              boxShadow: '0 0 0 2px rgba(220, 38, 38, 0.4), inset 0 0 15px rgba(220, 38, 38, 0.2)',
                              transform: isJustClaimed ? undefined : 'rotate(-14deg) scale(0.95)',
                            }}
                          >
                            <div className="text-xl sm:text-2xl md:text-3xl leading-none">
                              ★ CLAIMED ★
                            </div>
                            <div className="text-[10px] sm:text-xs font-bold tracking-widest mt-1 text-red-800">
                              AWAITING PARENT CONFIRMATION • {claimingKid?.name || 'DEPUTY'}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* BOTTOM WOODEN FOOTER BAR */}
        <div className="px-4 py-3 bg-[#231206] border-t-4 border-[#4d2d14] flex flex-col sm:flex-row items-center justify-between gap-2 text-white">
          <div className="flex items-center gap-2 text-xs text-amber-200/80">
            <Shield className="w-4 h-4 text-amber-400" />
            <span>After parent confirmation, the Claimed stamp turns green as official completion seal.</span>
          </div>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer font-serif"
          >
            Back to Dashboard 🏠
          </button>
        </div>
      </div>

      {/* SHERIFF / PARENT PIN PROMPT MODAL */}
      {showPinModal && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowPinModal(false);
              setPendingVerifyLogId(null);
            }
          }}
        >
          <div className="w-full max-w-sm bg-[#fdf8e6] rounded-3xl border-4 border-[#7a4c1c] shadow-2xl p-6 text-slate-900 space-y-4 font-serif">
            <div className="flex items-center justify-between pb-3 border-b-2 border-dashed border-[#b88c58]">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🤠</span>
                <div>
                  <h4 className="font-black text-base text-[#4a2608] uppercase tracking-wider">
                    Sheriff Confirmation
                  </h4>
                  <p className="text-[11px] text-[#7a4c1c] font-sans font-bold">
                    Parent Verification Stamp
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowPinModal(false);
                  setPendingVerifyLogId(null);
                }}
                className="w-8 h-8 rounded-full bg-[#ecdab8] hover:bg-[#dfc8a0] text-slate-700 flex items-center justify-center font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#5c3311] font-sans leading-relaxed">
              Confirm this bonus bounty mission. The rubber stamp will turn <strong>emerald green</strong> as official visual verification!
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleConfirmPin();
              }}
              className="space-y-3 font-sans"
            >
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-[#4a2608] mb-1">
                  Enter Parent PIN:
                </label>
                <div className="relative">
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={6}
                    autoFocus
                    value={pinInput}
                    onChange={(e) => {
                      setPinInput(e.target.value);
                      setPinError('');
                    }}
                    placeholder="PIN (Default: 1234)"
                    className="w-full text-center text-2xl font-mono tracking-widest px-4 py-2.5 rounded-xl border-2 border-[#8c592b] bg-[#fffdf5] focus:outline-none focus:ring-2 focus:ring-amber-500 font-bold text-slate-900"
                  />
                  <KeyRound className="w-5 h-5 text-amber-700 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                {pinError && (
                  <p className="text-xs text-red-600 font-bold text-center mt-1.5">
                    {pinError}
                  </p>
                )}
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setShowPinModal(false);
                    setPendingVerifyLogId(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-[#ecdab8] hover:bg-[#dfc8a0] text-[#4a2608] font-bold text-xs cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md cursor-pointer transition-transform active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Verify Stamp ✓</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Unclaim Security PIN Modal (Requires Kid's PIN to release bounty) */}
      {showUnclaimModal && pendingUnclaimLog && (
        <div
          id="modal-unclaim-pin"
          className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              sound.playTap();
              setShowUnclaimModal(false);
              setPendingUnclaimLogId(null);
            }
          }}
        >
          <div className="bg-[#fbf4e6] border-4 border-[#5c3311] rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl space-y-4 text-left relative">
            <div className="flex items-center justify-between border-b-2 border-[#d2b48c] pb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 text-white flex items-center justify-center text-lg font-black shadow-xs border border-amber-400">
                  🔓
                </span>
                <div>
                  <h3 className="text-base font-black text-[#3b1d04] font-serif uppercase tracking-wider">
                    Release Bounty Contract
                  </h3>
                  <p className="text-[11px] text-[#734217] font-semibold">
                    Deputy {pendingUnclaimKid?.name || 'Claimer'}'s Password Required
                  </p>
                </div>
              </div>
              <button
                id="btn-close-unclaim-modal"
                onClick={() => {
                  sound.playTap();
                  setShowUnclaimModal(false);
                  setPendingUnclaimLogId(null);
                }}
                className="w-8 h-8 rounded-full bg-[#ecdab8] hover:bg-[#dfc8a0] text-slate-700 flex items-center justify-center font-bold text-sm cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Target Contract Preview */}
            <div className="p-3 rounded-2xl bg-[#edd9b6]/70 border-2 border-[#b88c58] flex items-center justify-between gap-3 shadow-inner">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-2xl shrink-0">{pendingUnclaimChore?.icon || '⭐'}</span>
                <div className="min-w-0">
                  <div className="text-xs font-black text-[#3b1d04] truncate font-serif">
                    {pendingUnclaimChore?.title}
                  </div>
                  <div className="text-[10px] text-[#6b3a0f] font-bold">
                    Claimed by: {pendingUnclaimKid?.avatar} <strong>{pendingUnclaimKid?.name}</strong>
                  </div>
                </div>
              </div>
              <div className="px-2.5 py-1 rounded-xl bg-amber-700 text-white font-black text-xs shrink-0 font-serif">
                +{pendingUnclaimLog.starsAwarded} ⭐
              </div>
            </div>

            <p className="text-xs text-[#5c3311] font-sans leading-relaxed">
              Once a deputy claims a bounty, it is locked and unable to be claimed by anyone else. 
              To unclaim this mission, deduct the earned stars, and <strong>reopen it so ANY kid can claim it</strong>, enter <strong>{pendingUnclaimKid?.name}</strong>'s password / PIN:
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleConfirmUnclaim();
              }}
              className="space-y-3 font-sans"
            >
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-[#4a2608] mb-1">
                  Enter {pendingUnclaimKid?.name}'s PIN:
                </label>
                <div className="relative">
                  <input
                    id="input-unclaim-pin"
                    type="password"
                    inputMode="numeric"
                    maxLength={6}
                    autoFocus
                    value={unclaimPinInput}
                    onChange={(e) => {
                      setUnclaimPinInput(e.target.value);
                      setUnclaimPinError('');
                    }}
                    placeholder={`PIN (Default: ${pendingUnclaimKid?.pin || '1234'})`}
                    className="w-full text-center text-2xl font-mono tracking-widest px-4 py-2.5 rounded-xl border-2 border-[#8c592b] bg-[#fffdf5] focus:outline-none focus:ring-2 focus:ring-amber-500 font-bold text-slate-900 min-h-[48px]"
                  />
                  <KeyRound className="w-5 h-5 text-amber-700 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                {unclaimPinError && (
                  <p className="text-xs text-red-600 font-bold text-center mt-1.5 bg-red-50 p-2 rounded-xl border border-red-200">
                    {unclaimPinError}
                  </p>
                )}
              </div>

              {/* On-Screen Touch Keypad */}
              <div className="grid grid-cols-3 gap-1.5 pt-1 max-w-[280px] mx-auto">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => {
                      sound.playTap();
                      if (unclaimPinInput.length < 6) {
                        setUnclaimPinInput((prev) => prev + num.toString());
                        setUnclaimPinError('');
                      }
                    }}
                    className="py-2.5 rounded-xl bg-white hover:bg-amber-100 active:bg-amber-200 border border-[#b88c58] text-base font-black text-[#3b1d04] font-mono shadow-2xs transition-all active:scale-95 cursor-pointer min-h-[44px]"
                  >
                    {num}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    sound.playTap();
                    setUnclaimPinInput('');
                    setUnclaimPinError('');
                  }}
                  className="py-2.5 rounded-xl bg-[#ecdab8] hover:bg-amber-200 border border-[#b88c58] text-xs font-black text-[#5c3311] shadow-2xs transition-all active:scale-95 cursor-pointer min-h-[44px]"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={() => {
                    sound.playTap();
                    if (unclaimPinInput.length < 6) {
                      setUnclaimPinInput((prev) => prev + '0');
                      setUnclaimPinError('');
                    }
                  }}
                  className="py-2.5 rounded-xl bg-white hover:bg-amber-100 active:bg-amber-200 border border-[#b88c58] text-base font-black text-[#3b1d04] font-mono shadow-2xs transition-all active:scale-95 cursor-pointer min-h-[44px]"
                >
                  0
                </button>
                <button
                  type="button"
                  onClick={() => {
                    sound.playTap();
                    setUnclaimPinInput((prev) => prev.slice(0, -1));
                    setUnclaimPinError('');
                  }}
                  className="py-2.5 rounded-xl bg-[#ecdab8] hover:bg-amber-200 border border-[#b88c58] text-xs font-black text-[#5c3311] shadow-2xs transition-all active:scale-95 cursor-pointer min-h-[44px]"
                >
                  ⌫
                </button>
              </div>

              <div className="text-[10px] text-center text-[#734217] italic">
                (Sheriff / Parent PIN is also accepted to release this contract)
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    sound.playTap();
                    setShowUnclaimModal(false);
                    setPendingUnclaimLogId(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-[#ecdab8] hover:bg-[#dfc8a0] text-[#4a2608] font-bold text-xs cursor-pointer transition-colors min-h-[44px]"
                >
                  Keep Claimed
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-black text-xs shadow-md cursor-pointer transition-transform active:scale-95 flex items-center justify-center gap-1.5 min-h-[44px] font-serif"
                >
                  <Unlock className="w-4 h-4" />
                  <span>Release Contract 🔓</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
