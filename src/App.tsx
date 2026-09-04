import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { FamilyDatabase, KidProfile, ChoreItem, ChoreLog, RewardItem, RewardRedemption } from './types';
import { loadDatabase, saveDatabase, getTodayDateString } from './utils/storage';
import { fetchServerDatabase, pushServerDatabase, subscribeToDatabaseSync } from './utils/api';
import { sound } from './utils/sound';
import { checkCategoryTimeWindow } from './utils/timeWindow';
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
import { KidSnackRequestModal } from './components/KidSnackRequestModal';
import { Home } from 'lucide-react';

export default function App() {
  const [database, setDatabase] = useState<FamilyDatabase>(() => loadDatabase());
  const [activeKidId, setActiveKidId] = useState<string | null>(null);
  const [isParentMode, setIsParentMode] = useState<boolean>(false);
  const [isKioskMode, setIsKioskMode] = useState<boolean>(false);
  const [isKioskKidSession, setIsKioskKidSession] = useState<boolean>(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState<boolean>(false);
  const [isRewardStoreOpen, setIsRewardStoreOpen] = useState<boolean>(false);
  const [isPiGuideOpen, setIsPiGuideOpen] = useState<boolean>(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState<boolean>(false);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isGroceryOpen, setIsGroceryOpen] = useState<boolean>(false);
  const [isSnackRequestOpen, setIsSnackRequestOpen] = useState<boolean>(false);
  const [snackRequestKid, setSnackRequestKid] = useState<KidProfile | null>(null);
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

  // Inactivity Auto-Timeout (2 minutes / 120s)
  // Automatically logs out active kid / closes overlays to revert to secure Kiosk Kid Selector
  useEffect(() => {
    const isAtSubScreen =
      activeKidId !== null ||
      isParentMode ||
      isKioskKidSession ||
      isRewardStoreOpen ||
      isCalendarOpen ||
      isMenuOpen ||
      isGroceryOpen ||
      isSnackRequestOpen ||
      isGoalModalOpen;

    if (!isAtSubScreen) return;

    const INACTIVITY_LIMIT_MS = 120000; // 2 minutes
    let timeoutId: ReturnType<typeof setTimeout>;
    let lastActivityTime = 0;

    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        // Auto return to home/kiosk selector
        setActiveKidId(null);
        setIsKioskKidSession(false);
        setIsKioskMode(true);
        setIsParentMode(false);
        setIsRewardStoreOpen(false);
        setIsCalendarOpen(false);
        setIsMenuOpen(false);
        setIsGroceryOpen(false);
        setIsSnackRequestOpen(false);
        setSnackRequestKid(null);
        setIsGoalModalOpen(false);
        setIsPiGuideOpen(false);
        setIsPinModalOpen(false);
      }, INACTIVITY_LIMIT_MS);
    };

    resetTimer();

    // High performance throttled listener for activity detection
    const handleActivity = () => {
      const now = Date.now();
      if (now - lastActivityTime > 5000) {
        lastActivityTime = now;
        resetTimer();
      }
    };

    const activityEvents = ['pointerdown', 'touchstart', 'keydown', 'click'];
    activityEvents.forEach((evt) => window.addEventListener(evt, handleActivity, { passive: true }));

    return () => {
      clearTimeout(timeoutId);
      activityEvents.forEach((evt) => window.removeEventListener(evt, handleActivity));
    };
  }, [
    activeKidId,
    isParentMode,
    isKioskKidSession,
    isRewardStoreOpen,
    isCalendarOpen,
    isMenuOpen,
    isGroceryOpen,
    isSnackRequestOpen,
    isGoalModalOpen,
  ]);

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

    // Check category time window restriction
    const category = database.categories.find((c) => c.id === chore.categoryId);
    const timeStatus = checkCategoryTimeWindow(category);
    if (!timeStatus.isAllowed) {
      sound.playWarning();
      return;
    }

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

  // Strict Kiosk Navigation: Return directly back to Kiosk Selection Screen
  const handleReturnToKiosk = useCallback(() => {
    sound.playTap();
    setActiveKidId(null);
    setIsKioskKidSession(false);
    setIsKioskMode(true);
    setIsRewardStoreOpen(false);
    setIsSnackRequestOpen(false);
    setSnackRequestKid(null);
    setIsGoalModalOpen(false);
    setIsCalendarOpen(false);
    setIsMenuOpen(false);
    setIsGroceryOpen(false);
  }, []);

  // If Kiosk Mode is active
  if (isKioskMode) {
    if (isKioskKidSession && activeKid) {
      return (
        <div
          className={`min-h-[100dvh] ${themeConfig.bgGradient} flex flex-col font-sans transition-colors duration-300 ${
            themeConfig.isDark
              ? 'dark text-slate-100 selection:bg-indigo-500 selection:text-white'
              : 'text-slate-800 selection:bg-sky-200 selection:text-slate-900'
          }`}
        >
          {/* STRICT KIOSK KID SESSION HEADER: ONLY Return to Kiosk button, NO adult links */}
          <header
            className={`sticky top-0 z-40 px-4 sm:px-6 py-3.5 backdrop-blur-md border-b flex items-center justify-between gap-3 shadow-md ${
              themeConfig.isDark
                ? 'bg-slate-900/90 border-slate-700 text-white'
                : 'bg-white/95 border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                style={{
                  backgroundColor: `${activeKid.color || '#3b82f6'}30`,
                  borderColor: activeKid.color || '#3b82f6',
                }}
                className="w-12 h-12 rounded-2xl border-2 flex items-center justify-center text-2xl shadow-inner shrink-0"
              >
                {activeKid.avatar}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg sm:text-xl font-black tracking-tight">{activeKid.name}'s Missions</h1>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-xs shadow-xs">
                    ⭐ {activeKid.stars} Stars
                  </span>
                </div>
                <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                  🔥 {activeKid.streakDays} Day Streak • Kiosk Mode Active
                </p>
              </div>
            </div>

            {/* Strict Kiosk Routing: The ONLY navigation exit path available */}
            <button
              id="btn-kiosk-kid-exit"
              onClick={handleReturnToKiosk}
              className="min-h-[48px] px-5 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 font-black text-sm sm:text-base shadow-lg border-2 border-amber-300 flex items-center gap-2 cursor-pointer transition-all"
              title="Return directly back to Family Kiosk display"
            >
              <Home className="w-5 h-5 text-slate-950" />
              <span>Done / Return to Kiosk 🏠</span>
            </button>
          </header>

          <main className="flex-1 p-3 sm:p-6 flex flex-col max-w-7xl mx-auto w-full">
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
              isKioskKidSession={true}
              onReturnToKiosk={handleReturnToKiosk}
              onToggleCompleteChore={(chore) => {
                handleToggleCompleteChore(chore);
                setTimeout(handleReturnToKiosk, 1200);
              }}
              onSkipChoreWithReason={(choreId, cat, note) => {
                handleSkipChoreWithReason(choreId, cat, note);
                setTimeout(handleReturnToKiosk, 1200);
              }}
              onUndoChoreStatus={handleUndoChoreStatus}
              onOpenRewardStore={() => setIsRewardStoreOpen(true)}
              onOpenCalendar={() => setIsCalendarOpen(true)}
              onOpenGoalManager={() => setIsGoalModalOpen(true)}
              onOpenSnackRequest={(k) => {
                setSnackRequestKid(k);
                setIsSnackRequestOpen(true);
              }}
            />
          </main>

          {isSnackRequestOpen && (
            <KidSnackRequestModal
              isOpen={isSnackRequestOpen}
              onClose={() => {
                setIsSnackRequestOpen(false);
                setSnackRequestKid(null);
                handleReturnToKiosk();
              }}
              database={database}
              onUpdateDatabase={handleUpdateDatabase}
              initialKid={activeKid}
              isParentMode={false}
              onPostActionComplete={handleReturnToKiosk}
            />
          )}

          {isRewardStoreOpen && (
            <RewardStoreModal
              isOpen={isRewardStoreOpen}
              activeKid={activeKid}
              rewards={database.rewards || []}
              redemptions={database.redemptions || []}
              settings={database.settings}
              onRedeemReward={handleRedeemReward}
              onPostActionComplete={handleReturnToKiosk}
              onClose={() => {
                setIsRewardStoreOpen(false);
                handleReturnToKiosk();
              }}
            />
          )}

          {isCalendarOpen && (
            <CalendarView
              database={database}
              activeKid={activeKid}
              onUpdateDatabase={handleUpdateDatabase}
              onClose={() => setIsCalendarOpen(false)}
            />
          )}

          {isGoalModalOpen && (
            <FamilyGoalModal
              isOpen={isGoalModalOpen}
              database={database}
              onClose={() => setIsGoalModalOpen(false)}
              onUpdateDatabase={handleUpdateDatabase}
            />
          )}
        </div>
      );
    }

    return (
      <div className={`min-h-screen ${themeConfig.kioskBg} font-sans`}>
        <KioskDashboard
          database={database}
          currentTheme={currentTheme}
          onThemeChange={handleThemeChange}
          onUpdateDatabase={handleUpdateDatabase}
          onExitKiosk={() => setIsKioskMode(false)}
          onSelectKid={(kid) => {
            setActiveKidId(kid.id);
            setIsKioskKidSession(true);
          }}
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
      className={`min-h-[100dvh] ${themeConfig.bgGradient} flex flex-col font-sans transition-colors duration-300 ${
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
        onOpenGoalManager={() => setIsGoalModalOpen(true)}
      />

      <main className="flex-1 p-0 sm:pb-6 flex flex-col">
        {isParentMode ? (
          <ParentDashboard
            database={database}
            onUpdateDatabase={handleUpdateDatabase}
            onExitParentMode={() => setIsParentMode(false)}
            onOpenPiGuide={() => setIsPiGuideOpen(true)}
            onOpenCalendar={() => setIsCalendarOpen(true)}
            onOpenSnackRequest={(kid) => {
              if (kid) setSnackRequestKid(kid);
              setIsSnackRequestOpen(true);
            }}
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
            onOpenSnackRequest={(k) => {
              setSnackRequestKid(k);
              setIsSnackRequestOpen(true);
            }}
          />
        ) : (
          <KidSelector
            kids={database.kids}
            events={database.events || []}
            database={database}
            currentTheme={currentTheme}
            onSelectKid={(kid) => setActiveKidId(kid.id)}
            onOpenParentPin={() => setIsPinModalOpen(true)}
            onOpenGoalManager={() => setIsGoalModalOpen(true)}
            onOpenRewardStore={() => setIsRewardStoreOpen(true)}
            onOpenSnackRequest={(kid) => {
              setSnackRequestKid(kid);
              setIsSnackRequestOpen(true);
            }}
            onUpdateDatabase={handleUpdateDatabase}
          />
        )}
      </main>

      {isSnackRequestOpen && (
        <KidSnackRequestModal
          isOpen={isSnackRequestOpen}
          onClose={() => {
            setIsSnackRequestOpen(false);
            setSnackRequestKid(null);
          }}
          database={database}
          onUpdateDatabase={handleUpdateDatabase}
          initialKid={snackRequestKid || activeKid}
          isParentMode={isParentMode}
        />
      )}

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

      <footer className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-2 sm:p-3 px-3 sm:px-6 border-t border-black/10 dark:border-white/10 flex flex-col sm:flex-row justify-between items-center text-slate-500 font-bold text-[11px] sm:text-xs gap-1 sm:gap-3">
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
            Parent PIN
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
