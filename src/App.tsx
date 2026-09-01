import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { FamilyDatabase, KidProfile, ChoreItem, ChoreLog, RewardItem, RewardRedemption } from './types';
import { loadDatabase, saveDatabase, getTodayDateString } from './utils/storage';
import { fetchServerDatabase, pushServerDatabase, subscribeToDatabaseSync } from './utils/api';
import { sound } from './utils/sound';
import { AppThemeId, APP_THEMES, getSavedThemeId, saveThemeId } from './utils/theme';
import { Navbar } from './components/Navbar';
import { KidSelector } from './components/KidSelector';
import { KidDashboard } from './components/KidDashboard';
import { ParentDashboard } from './components/ParentDashboard';
import { ParentPinModal } from './components/ParentPinModal';
import { RewardStoreModal } from './components/RewardStoreModal';
import { PiGuideModal } from './components/PiGuideModal';
import { CalendarView } from './components/Calendar/CalendarView';
import { KioskDashboard } from './components/KioskDashboard';
import { FamilyGoalModal } from './components/FamilyGoalModal';
import { WeeklyMenuModal } from './components/WeeklyMenuModal';
import { WeeklyGroceryModal } from './components/WeeklyGroceryModal';

export default function App() {
  const [database, setDatabase] = useState<FamilyDatabase>(() => loadDatabase());
  const [activeKidId, setActiveKidId] = useState<string | null>(null);
  const [isParentMode, setIsParentMode] = useState<boolean>(false);
  const [isKioskMode, setIsKioskMode] = useState<boolean>(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState<boolean>(false);
  const [isRewardStoreOpen, setIsRewardStoreOpen] = useState<boolean>(false);
  const [isPiGuideOpen, setIsPiGuideOpen] = useState<boolean>(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState<boolean>(false);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isGroceryOpen, setIsGroceryOpen] = useState<boolean>(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState<boolean>(false);
  const [isSyncConnected, setIsSyncConnected] = useState<boolean>(true);
  const [currentTheme, setCurrentTheme] = useState<AppThemeId>(() => getSavedThemeId());

  // Synchronize theme persistence
  useEffect(() => {
    saveThemeId(currentTheme);
  }, [currentTheme]);

  const handleThemeChange = useCallback((newTheme: AppThemeId) => {
    setCurrentTheme(newTheme);
    saveThemeId(newTheme);
  }, []);

  // Synchronize sound engine setting
  useEffect(() => {
    sound.setEnabled(database.settings.soundEnabled);
  }, [database.settings.soundEnabled]);

  // Initial load from server + real-time multi-session sync subscription
  useEffect(() => {
    fetchServerDatabase().then((serverData) => {
      if (serverData) setDatabase(serverData);
    });

    const unsubscribe = subscribeToDatabaseSync(
      (freshData) => setDatabase(freshData),
      (connected) => setIsSyncConnected(connected)
    );

    return () => unsubscribe();
  }, []);

  // Gracefully handle if active kid was deleted
  useEffect(() => {
    if (activeKidId && !database.kids.some((k) => k.id === activeKidId)) {
      setActiveKidId(null);
    }
  }, [database.kids, activeKidId]);

  // Persist database updates locally and to server
  const handleUpdateDatabase = useCallback((updated: FamilyDatabase) => {
    setDatabase(updated);
    pushServerDatabase(updated);
  }, []);

  const activeKid = useMemo(
    () => database.kids.find((k) => k.id === activeKidId) || null,
    [database.kids, activeKidId]
  );
  const todayStr = useMemo(() => getTodayDateString(), []);
  const themeConfig = useMemo(
    () => APP_THEMES[currentTheme] || APP_THEMES['coastal-horizon'],
    [currentTheme]
  );

  // Complete a chore
  const handleToggleCompleteChore = useCallback((chore: ChoreItem) => {
    if (!activeKid) return;

    const existingLog = database.logs.find(
      (l) => l.choreId === chore.id && l.kidId === activeKid.id && l.date === todayStr
    );

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

    const updatedLogs = [
      ...database.logs.filter((l) => !(l.choreId === chore.id && l.kidId === activeKid.id && l.date === todayStr)),
      newLog,
    ];

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

    handleUpdateDatabase({ ...database, logs: updatedLogs, kids: updatedKids });
  }, [activeKid, database, todayStr, handleUpdateDatabase]);

  // Skip a chore with reason
  const handleSkipChoreWithReason = useCallback((
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

    handleUpdateDatabase({ ...database, logs: updatedLogs });
  }, [activeKid, database, todayStr, handleUpdateDatabase]);

  // Undo chore status
  const handleUndoChoreStatus = useCallback((choreId: string) => {
    if (!activeKid) return;

    const existingLog = database.logs.find(
      (l) => l.choreId === choreId && l.kidId === activeKid.id && l.date === todayStr
    );
    if (!existingLog) return;

    let updatedKids = database.kids;
    if (existingLog.status === 'completed' && existingLog.starsAwarded > 0) {
      updatedKids = database.kids.map((k) =>
        k.id === activeKid.id
          ? {
              ...k,
              stars: Math.max(0, k.stars - existingLog.starsAwarded),
              lifetimeStars: Math.max(0, k.lifetimeStars - existingLog.starsAwarded),
            }
          : k
      );
    }

    const updatedLogs = database.logs.filter(
      (l) => !(l.choreId === choreId && l.kidId === activeKid.id && l.date === todayStr)
    );

    handleUpdateDatabase({ ...database, logs: updatedLogs, kids: updatedKids });
  }, [activeKid, database, todayStr, handleUpdateDatabase]);

  // Redeem reward
  const handleRedeemReward = useCallback((reward: RewardItem, note?: string) => {
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

    const updatedKids = database.kids.map((k) =>
      k.id === activeKid.id ? { ...k, stars: Math.max(0, k.stars - reward.starCost) } : k
    );

    handleUpdateDatabase({
      ...database,
      kids: updatedKids,
      redemptions: [newRedemption, ...database.redemptions],
    });
  }, [activeKid, database, handleUpdateDatabase]);

  // Toggle sound
  const handleToggleSound = useCallback(() => {
    handleUpdateDatabase({
      ...database,
      settings: { ...database.settings, soundEnabled: !database.settings.soundEnabled },
    });
  }, [database, handleUpdateDatabase]);

  // If Kiosk Mode is active
  if (isKioskMode) {
    return (
      <div className={`min-h-screen ${themeConfig.kioskBg} font-sans`}>
        <KioskDashboard
          database={database}
          currentTheme={currentTheme}
          onThemeChange={handleThemeChange}
          onUpdateDatabase={handleUpdateDatabase}
          onExitKiosk={() => setIsKioskMode(false)}
          onOpenCalendar={() => setIsCalendarOpen(true)}
          onOpenMenu={() => setIsMenuOpen(true)}
        />

        {isCalendarOpen && (
          <CalendarView
            database={database}
            activeKid={activeKid}
            onUpdateDatabase={handleUpdateDatabase}
            onClose={() => setIsCalendarOpen(false)}
          />
        )}

        {isMenuOpen && (
          <WeeklyMenuModal
            isOpen={isMenuOpen}
            onClose={() => setIsMenuOpen(false)}
            database={database}
            onUpdateDatabase={handleUpdateDatabase}
            activeKid={activeKid}
            isParentMode={isParentMode}
          />
        )}
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${themeConfig.bgGradient} flex flex-col font-sans transition-colors duration-300 ${
        themeConfig.isDark
          ? 'dark text-slate-100 selection:bg-indigo-500 selection:text-white'
          : 'text-slate-800 selection:bg-sky-200 selection:text-slate-900'
      }`}
    >
      <Navbar
        settings={database.settings}
        activeKid={activeKid}
        isParentMode={isParentMode}
        events={database.events || []}
        isCalendarOpen={isCalendarOpen}
        isMenuOpen={isMenuOpen}
        isGroceryOpen={isGroceryOpen}
        currentTheme={currentTheme}
        onThemeChange={handleThemeChange}
        onOpenParentPin={() => setIsPinModalOpen(true)}
        onExitParentMode={() => {
          setIsParentMode(false);
          setIsCalendarOpen(false);
          setIsMenuOpen(false);
          setIsGroceryOpen(false);
        }}
        onSelectKid={(kid) => setActiveKidId(kid ? kid.id : null)}
        onToggleSound={handleToggleSound}
        onOpenPiGuide={() => setIsPiGuideOpen(true)}
        onOpenRewardStore={() => setIsRewardStoreOpen(true)}
        onToggleCalendar={() => setIsCalendarOpen((prev) => !prev)}
        onToggleMenu={() => setIsMenuOpen((prev) => !prev)}
        onToggleGrocery={() => setIsGroceryOpen((prev) => !prev)}
        onToggleKiosk={() => setIsKioskMode(true)}
      />

      <main className="flex-1 pb-16">
        {isParentMode ? (
          <ParentDashboard
            database={database}
            onUpdateDatabase={handleUpdateDatabase}
            onExitParentMode={() => setIsParentMode(false)}
            onOpenPiGuide={() => setIsPiGuideOpen(true)}
            onOpenCalendar={() => setIsCalendarOpen(true)}
          />
        ) : activeKid ? (
          <KidDashboard
            kid={activeKid}
            categories={database.categories}
            chores={database.chores}
            logs={database.logs}
            rewards={database.rewards}
            settings={database.settings}
            events={database.events || []}
            database={database}
            currentTheme={currentTheme}
            onToggleCompleteChore={handleToggleCompleteChore}
            onSkipChoreWithReason={handleSkipChoreWithReason}
            onUndoChoreStatus={handleUndoChoreStatus}
            onOpenRewardStore={() => setIsRewardStoreOpen(true)}
            onOpenCalendar={() => setIsCalendarOpen(true)}
            onOpenGoalManager={() => setIsGoalModalOpen(true)}
          />
        ) : (
          <KidSelector
            kids={database.kids}
            events={database.events || []}
            database={database}
            currentTheme={currentTheme}
            onSelectKid={(kid) => setActiveKidId(kid.id)}
            onOpenParentPin={() => setIsPinModalOpen(true)}
            onOpenCalendar={() => setIsCalendarOpen(true)}
            onOpenGoalManager={() => setIsGoalModalOpen(true)}
          />
        )}
      </main>

      {isCalendarOpen && (
        <CalendarView
          database={database}
          activeKid={activeKid}
          onUpdateDatabase={handleUpdateDatabase}
          onClose={() => setIsCalendarOpen(false)}
        />
      )}

      {isMenuOpen && (
        <WeeklyMenuModal
          isOpen={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
          database={database}
          onUpdateDatabase={handleUpdateDatabase}
          activeKid={activeKid}
          isParentMode={isParentMode}
          onOpenGroceryList={() => setIsGroceryOpen(true)}
        />
      )}

      {isGroceryOpen && (
        <WeeklyGroceryModal
          isOpen={isGroceryOpen}
          onClose={() => setIsGroceryOpen(false)}
          database={database}
          onUpdateDatabase={handleUpdateDatabase}
          activeKid={activeKid}
          isParentMode={isParentMode}
        />
      )}

      {isGoalModalOpen && (
        <FamilyGoalModal
          isOpen={isGoalModalOpen}
          onClose={() => setIsGoalModalOpen(false)}
          database={database}
          onUpdateDatabase={handleUpdateDatabase}
          isParentMode={isParentMode}
        />
      )}

      <footer className="bg-white p-4 px-6 sm:px-8 border-t-2 border-yellow-200/80 flex flex-col sm:flex-row justify-between items-center text-slate-500 font-bold text-xs gap-3">
        <div className="flex items-center gap-3 sm:gap-4 flex-wrap justify-center">
          <span className="flex items-center gap-1.5 text-slate-700">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isSyncConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              }`}
            />
            <span>{isSyncConnected ? 'Live Multi-Device Sync Active' : 'Offline Mode (Local Cache)'}</span>
          </span>
          <span className="opacity-40">•</span>
          <span>Shared Family Hub</span>
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

      <ParentPinModal
        isOpen={isPinModalOpen}
        correctPin={database.settings.parentPin}
        isDefaultPin={database.settings.isDefaultPin ?? (database.settings.parentPin === '1234')}
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

      <PiGuideModal isOpen={isPiGuideOpen} onClose={() => setIsPiGuideOpen(false)} />
    </div>
  );
}
