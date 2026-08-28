import React, { useState, useEffect } from 'react';
import { FamilyDatabase, KidProfile, ChoreItem, ChoreLog, RewardItem, RewardRedemption } from './types';
import { loadDatabase, saveDatabase, getTodayDateString } from './utils/storage';
import { sound } from './utils/sound';
import { Navbar } from './components/Navbar';
import { KidSelector } from './components/KidSelector';
import { KidDashboard } from './components/KidDashboard';
import { ParentDashboard } from './components/ParentDashboard';
import { ParentPinModal } from './components/ParentPinModal';
import { RewardStoreModal } from './components/RewardStoreModal';
import { PiGuideModal } from './components/PiGuideModal';

export default function App() {
  const [database, setDatabase] = useState<FamilyDatabase>(() => loadDatabase());
  const [activeKidId, setActiveKidId] = useState<string | null>(null);
  const [isParentMode, setIsParentMode] = useState<boolean>(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState<boolean>(false);
  const [isRewardStoreOpen, setIsRewardStoreOpen] = useState<boolean>(false);
  const [isPiGuideOpen, setIsPiGuideOpen] = useState<boolean>(false);

  // Synchronize sound engine with database setting
  useEffect(() => {
    sound.setEnabled(database.settings.soundEnabled);
  }, [database.settings.soundEnabled]);

  // Persist database updates
  const handleUpdateDatabase = (updated: FamilyDatabase) => {
    setDatabase(updated);
    saveDatabase(updated);
  };

  const activeKid = database.kids.find((k) => k.id === activeKidId) || null;
  const todayStr = getTodayDateString();

  // --- Kid Actions ---

  // Complete a chore
  const handleToggleCompleteChore = (chore: ChoreItem) => {
    if (!activeKid) return;

    const existingLog = database.logs.find(
      (l) => l.choreId === chore.id && l.kidId === activeKid.id && l.date === todayStr
    );

    // If already completed, nothing to do (undo handles retracting)
    if (existingLog?.status === 'completed') return;

    const newLog: ChoreLog = {
      id: existingLog?.id || `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      choreId: chore.id,
      kidId: activeKid.id,
      date: todayStr,
      status: 'completed',
      completedAt: new Date().toISOString(),
      starsAwarded: chore.stars,
      verifiedByParent: false,
    };

    // Update logs
    const updatedLogs = [
      ...database.logs.filter((l) => !(l.choreId === chore.id && l.kidId === activeKid.id && l.date === todayStr)),
      newLog,
    ];

    // Update kid's stars and streak
    const updatedKids = database.kids.map((k) => {
      if (k.id === activeKid.id) {
        const isNewActiveDay = k.lastActiveDate !== todayStr;
        const newStreak = isNewActiveDay ? k.streakDays + 1 : Math.max(1, k.streakDays);
        return {
          ...k,
          stars: k.stars + chore.stars,
          lifetimeStars: k.lifetimeStars + chore.stars,
          streakDays: newStreak,
          lastActiveDate: todayStr,
        };
      }
      return k;
    });

    handleUpdateDatabase({
      ...database,
      logs: updatedLogs,
      kids: updatedKids,
    });
  };

  // Skip a chore with an honest reason
  const handleSkipChoreWithReason = (
    choreId: string,
    category: 'sick' | 'supplies' | 'time' | 'already_done' | 'need_help' | 'other',
    note: string
  ) => {
    if (!activeKid) return;

    const newLog: ChoreLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      choreId,
      kidId: activeKid.id,
      date: todayStr,
      status: 'skipped',
      skippedReasonCategory: category,
      skippedReason: note,
      starsAwarded: 0,
      completedAt: new Date().toISOString(),
    };

    const updatedLogs = [
      ...database.logs.filter((l) => !(l.choreId === choreId && l.kidId === activeKid.id && l.date === todayStr)),
      newLog,
    ];

    handleUpdateDatabase({
      ...database,
      logs: updatedLogs,
    });
  };

  // Undo chore completion / reset log
  const handleUndoChoreStatus = (choreId: string) => {
    if (!activeKid) return;

    const existingLog = database.logs.find(
      (l) => l.choreId === choreId && l.kidId === activeKid.id && l.date === todayStr
    );

    if (!existingLog) return;

    // If it was completed with stars, deduct them
    let updatedKids = database.kids;
    if (existingLog.status === 'completed' && existingLog.starsAwarded > 0) {
      updatedKids = database.kids.map((k) => {
        if (k.id === activeKid.id) {
          return {
            ...k,
            stars: Math.max(0, k.stars - existingLog.starsAwarded),
            lifetimeStars: Math.max(0, k.lifetimeStars - existingLog.starsAwarded),
          };
        }
        return k;
      });
    }

    const updatedLogs = database.logs.filter(
      (l) => !(l.choreId === choreId && l.kidId === activeKid.id && l.date === todayStr)
    );

    handleUpdateDatabase({
      ...database,
      logs: updatedLogs,
      kids: updatedKids,
    });
  };

  // Redeem a reward in the store
  const handleRedeemReward = (reward: RewardItem, note?: string) => {
    if (!activeKid || activeKid.stars < reward.starCost) return;

    const newRedemption: RewardRedemption = {
      id: `red-${Date.now()}`,
      rewardId: reward.id,
      rewardTitle: reward.title,
      rewardIcon: reward.icon,
      kidId: activeKid.id,
      starCost: reward.starCost,
      date: new Date().toISOString(),
      status: database.settings.requireParentApprovalForRewards ? 'pending' : 'fulfilled',
      notes: note || undefined,
    };

    const updatedKids = database.kids.map((k) => {
      if (k.id === activeKid.id) {
        return {
          ...k,
          stars: Math.max(0, k.stars - reward.starCost),
        };
      }
      return k;
    });

    handleUpdateDatabase({
      ...database,
      kids: updatedKids,
      redemptions: [newRedemption, ...database.redemptions],
    });
  };

  // Toggle sound
  const handleToggleSound = () => {
    const nextSound = !database.settings.soundEnabled;
    handleUpdateDatabase({
      ...database,
      settings: { ...database.settings, soundEnabled: nextSound },
    });
  };

  return (
    <div className="min-h-screen bg-yellow-50 text-slate-800 flex flex-col font-sans selection:bg-yellow-200">
      {/* Top Navigation */}
      <Navbar
        settings={database.settings}
        activeKid={activeKid}
        isParentMode={isParentMode}
        onOpenParentPin={() => setIsPinModalOpen(true)}
        onExitParentMode={() => setIsParentMode(false)}
        onSelectKid={(kid) => setActiveKidId(kid ? kid.id : null)}
        onToggleSound={handleToggleSound}
        onOpenPiGuide={() => setIsPiGuideOpen(true)}
        onOpenRewardStore={() => setIsRewardStoreOpen(true)}
      />

      {/* Main Viewport Router */}
      <main className="flex-1 pb-16">
        {isParentMode ? (
          <ParentDashboard
            database={database}
            onUpdateDatabase={handleUpdateDatabase}
            onExitParentMode={() => setIsParentMode(false)}
            onOpenPiGuide={() => setIsPiGuideOpen(true)}
          />
        ) : activeKid ? (
          <KidDashboard
            kid={activeKid}
            categories={database.categories}
            chores={database.chores}
            logs={database.logs}
            rewards={database.rewards}
            settings={database.settings}
            onToggleCompleteChore={handleToggleCompleteChore}
            onSkipChoreWithReason={handleSkipChoreWithReason}
            onUndoChoreStatus={handleUndoChoreStatus}
            onOpenRewardStore={() => setIsRewardStoreOpen(true)}
          />
        ) : (
          <KidSelector
            kids={database.kids}
            onSelectKid={(kid) => setActiveKidId(kid.id)}
            onOpenParentPin={() => setIsPinModalOpen(true)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white p-4 px-6 sm:px-8 border-t-2 border-yellow-200/80 flex flex-col sm:flex-row justify-between items-center text-slate-500 font-bold text-xs gap-3">
        <div className="flex items-center gap-3 sm:gap-4 flex-wrap justify-center">
          <span className="flex items-center gap-1.5 text-slate-700">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></span>
            <span>Raspberry Pi 5 Active</span>
          </span>
          <span className="opacity-40">•</span>
          <span>Offline Sync Ready</span>
          <span className="opacity-40">•</span>
          <button
            onClick={() => setIsPiGuideOpen(true)}
            className="text-indigo-600 hover:text-indigo-800 underline transition-colors cursor-pointer"
          >
            Pi Host Setup
          </button>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsPinModalOpen(true)}
            className="text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
          >
            🔒 Parent PIN
          </button>
          <span>&copy; {new Date().getFullYear()} ChoreQuest Home Server</span>
        </div>
      </footer>

      {/* Modals */}
      <ParentPinModal
        isOpen={isPinModalOpen}
        correctPin={database.settings.parentPin}
        onSuccess={() => {
          setIsPinModalOpen(false);
          setIsParentMode(true);
        }}
        onClose={() => setIsPinModalOpen(false)}
      />

      {activeKid && (
        <RewardStoreModal
          isOpen={isRewardStoreOpen}
          activeKid={activeKid}
          rewards={database.rewards}
          redemptions={database.redemptions}
          settings={database.settings}
          onRedeemReward={handleRedeemReward}
          onClose={() => setIsRewardStoreOpen(false)}
        />
      )}

      <PiGuideModal
        isOpen={isPiGuideOpen}
        onClose={() => setIsPiGuideOpen(false)}
      />
    </div>
  );
}
