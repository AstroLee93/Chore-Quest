import React, { useState, useEffect } from 'react';
import {
  X,
  UtensilsCrossed,
  Sparkles,
  Vote,
  ChefHat,
  Calendar,
  Clock,
  CheckCircle2,
  Trophy,
  Plus,
  Trash2,
  Edit3,
  Flame,
  ThumbsUp,
  RotateCcw,
  BookOpen,
  Lock,
  Unlock,
  Check,
  ChevronLeft,
  ChevronRight,
  Share2,
  Printer,
  Search,
  AlertTriangle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  FamilyDatabase,
  KidProfile,
  DayOfWeekKey,
  DailyDinnerPlan,
  MealVotingOption,
  MealSuggestion,
  WeeklyDinnerMenu,
} from '../types';
import {
  DAYS_OF_WEEK_ORDER,
  DAY_METADATA,
  DEFAULT_WEEKLY_MENU,
  getCurrentDayOfWeekKey,
  getMealPresets,
  searchRecipeForDish,
} from '../utils/menu';
import { getTodayDateString, formatDateDisplay } from '../utils/storage';
import { sound } from '../utils/sound';
import { EmojiPicker } from './EmojiPicker';
import { MealRecipeModal } from './MealRecipeModal';
import { MealRecipe } from '../types';

interface WeeklyMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  database: FamilyDatabase;
  onUpdateDatabase: (updated: FamilyDatabase) => void;
  activeKid?: KidProfile | null;
  isParentMode?: boolean;
  onOpenGroceryList?: () => void;
}

export const WeeklyMenuModal: React.FC<WeeklyMenuModalProps> = ({
  isOpen,
  onClose,
  database,
  onUpdateDatabase,
  activeKid = null,
  isParentMode = false,
  onOpenGroceryList,
}) => {
  const todayKey = getCurrentDayOfWeekKey();
  const [selectedDay, setSelectedDay] = useState<DayOfWeekKey>(todayKey);
  const [viewMode, setViewMode] = useState<'day' | 'grid'>('day');
  const [selectedKidForVote, setSelectedKidForVote] = useState<string | null>(
    activeKid ? activeKid.id : database.kids.length > 0 ? database.kids[0].id : null
  );

  // Parent Edit States
  const [isEditingCurrentDay, setIsEditingCurrentDay] = useState<boolean>(false);
  const [parentEditForm, setParentEditForm] = useState<DailyDinnerPlan | null>(null);
  const [showPresetMenuModal, setShowPresetMenuModal] = useState<boolean>(false);
  const [newOptionTitle, setNewOptionTitle] = useState<string>('');
  const [newOptionIcon, setNewOptionIcon] = useState<string>('🍕');
  const [newOptionDesc, setNewOptionDesc] = useState<string>('');

  // Kid Suggestion State
  const [isSuggestingOpen, setIsSuggestingOpen] = useState<boolean>(false);
  const [suggestionDish, setSuggestionDish] = useState<string>('');
  const [suggestionIcon, setSuggestionIcon] = useState<string>('🍲');

  // Recipe Modal State & Search Feedback
  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState<boolean>(false);
  const [importRecipeFeedback, setImportRecipeFeedback] = useState<string | null>(null);

  // Delete / Clear Confirmation States
  const [deleteConfirmDay, setDeleteConfirmDay] = useState<DayOfWeekKey | null>(null);
  const [showDeleteWeekConfirm, setShowDeleteWeekConfirm] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const menu: WeeklyDinnerMenu = database.weeklyMenu || DEFAULT_WEEKLY_MENU;
  const currentPlan: DailyDinnerPlan =
    menu.days[selectedDay] || DEFAULT_WEEKLY_MENU.days[selectedDay];

  // Close on ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showPresetMenuModal) {
          setShowPresetMenuModal(false);
        } else if (isEditingCurrentDay) {
          setIsEditingCurrentDay(false);
        } else if (isSuggestingOpen) {
          setIsSuggestingOpen(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showPresetMenuModal, isEditingCurrentDay, isSuggestingOpen, onClose]);

  // Keep selected kid in sync if activeKid changes
  useEffect(() => {
    if (activeKid) {
      setSelectedKidForVote(activeKid.id);
    }
  }, [activeKid]);

  if (!isOpen) return null;

  // --- Voting Handler ---
  const handleVoteForOption = (optionId: string) => {
    if (!selectedKidForVote) return;
    sound.playStarEarned();

    confetti({
      particleCount: 45,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#f59e0b', '#ec4899', '#3b82f6', '#10b981'],
    });

    const updatedOptions = (currentPlan.votingOptions || []).map((opt) => {
      const hasVoted = opt.voterKidIds.includes(selectedKidForVote);
      if (opt.id === optionId) {
        // Toggle vote: if already voted, remove; else add
        return {
          ...opt,
          voterKidIds: hasVoted
            ? opt.voterKidIds.filter((id) => id !== selectedKidForVote)
            : [...opt.voterKidIds, selectedKidForVote],
        };
      } else {
        // Enforce 1 vote per kid across options for this day
        return {
          ...opt,
          voterKidIds: opt.voterKidIds.filter((id) => id !== selectedKidForVote),
        };
      }
    });

    const updatedDays = {
      ...menu.days,
      [selectedDay]: {
        ...currentPlan,
        votingOptions: updatedOptions,
      },
    };

    onUpdateDatabase({
      ...database,
      weeklyMenu: {
        ...menu,
        days: updatedDays,
        lastUpdated: new Date().toISOString(),
      },
    });
  };

  // --- Suggestion Upvote Handler ---
  const handleToggleSuggestionVote = (suggestionId: string) => {
    if (!selectedKidForVote) return;
    sound.playTap();

    const updatedSuggestions = (currentPlan.suggestions || []).map((sug) => {
      if (sug.id === suggestionId) {
        const hasVoted = sug.voterKidIds.includes(selectedKidForVote);
        return {
          ...sug,
          voterKidIds: hasVoted
            ? sug.voterKidIds.filter((id) => id !== selectedKidForVote)
            : [...sug.voterKidIds, selectedKidForVote],
        };
      }
      return sug;
    });

    const updatedDays = {
      ...menu.days,
      [selectedDay]: {
        ...currentPlan,
        suggestions: updatedSuggestions,
      },
    };

    onUpdateDatabase({
      ...database,
      weeklyMenu: {
        ...menu,
        days: updatedDays,
        lastUpdated: new Date().toISOString(),
      },
    });
  };

  // --- Submit Kid Meal Suggestion ---
  const handleSubmitSuggestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!suggestionDish.trim() || !selectedKidForVote) return;

    sound.playChoreComplete();
    confetti({
      particleCount: 30,
      spread: 50,
      origin: { y: 0.6 },
    });

    const newSuggestion: MealSuggestion = {
      id: `sug-${Date.now()}`,
      dish: suggestionDish.trim(),
      icon: suggestionIcon || '🍲',
      kidId: selectedKidForVote,
      voterKidIds: [selectedKidForVote],
      createdAt: new Date().toISOString(),
    };

    const updatedDays = {
      ...menu.days,
      [selectedDay]: {
        ...currentPlan,
        suggestions: [...(currentPlan.suggestions || []), newSuggestion],
      },
    };

    onUpdateDatabase({
      ...database,
      weeklyMenu: {
        ...menu,
        days: updatedDays,
        lastUpdated: new Date().toISOString(),
      },
    });

    setSuggestionDish('');
    setIsSuggestingOpen(false);
  };

  // --- Parent: Declare Winner & Finalize Meal ---
  const handleDeclareWinningMeal = (option: MealVotingOption) => {
    sound.playStarEarned();
    confetti({
      particleCount: 80,
      spread: 90,
      origin: { y: 0.5 },
      colors: ['#fbbf24', '#f59e0b', '#ec4899', '#3b82f6', '#10b981'],
    });

    const updatedDays = {
      ...menu.days,
      [selectedDay]: {
        ...currentPlan,
        mainDish: option.title,
        icon: option.icon || currentPlan.icon || '🍽️',
        winningOptionId: option.id,
        lockedByParent: true,
        notes: `Selected as the family favorite! (${option.voterKidIds.length} votes)`,
      },
    };

    onUpdateDatabase({
      ...database,
      weeklyMenu: {
        ...menu,
        days: updatedDays,
        lastUpdated: new Date().toISOString(),
      },
    });
  };

  // --- Parent: Save Day Plan Edit ---
  const handleSaveDayEdit = () => {
    if (!parentEditForm) return;
    sound.playTap();

    const updatedDays = {
      ...menu.days,
      [selectedDay]: {
        ...parentEditForm,
      },
    };

    onUpdateDatabase({
      ...database,
      weeklyMenu: {
        ...menu,
        days: updatedDays,
        lastUpdated: new Date().toISOString(),
      },
    });

    setIsEditingCurrentDay(false);
    setParentEditForm(null);
  };

  // --- Parent: Add Voting Option to Form ---
  const handleAddVotingOption = () => {
    if (!newOptionTitle.trim()) return;
    const newOpt: MealVotingOption = {
      id: `opt-${Date.now()}`,
      title: newOptionTitle.trim(),
      icon: newOptionIcon || '🍽️',
      description: newOptionDesc.trim() || undefined,
      voterKidIds: [],
    };

    if (parentEditForm) {
      setParentEditForm({
        ...parentEditForm,
        votingOptions: [...(parentEditForm.votingOptions || []), newOpt],
      });
    }
    setNewOptionTitle('');
    setNewOptionDesc('');
    setNewOptionIcon('🍕');
  };

  // --- Save Recipe for Selected Day ---
  const handleSaveRecipe = (updatedRecipe: MealRecipe) => {
    const updatedDays = {
      ...menu.days,
      [selectedDay]: {
        ...currentPlan,
        recipe: updatedRecipe,
      },
    };

    onUpdateDatabase({
      ...database,
      weeklyMenu: {
        ...menu,
        days: updatedDays,
        lastUpdated: new Date().toISOString(),
      },
    });
  };

  // --- Delete / Clear Specific Day Menu ---
  const handleDeleteDay = (dayKey: DayOfWeekKey) => {
    sound.playTap();
    const emptyDay: DailyDinnerPlan = {
      dayOfWeek: dayKey,
      theme: 'Unplanned / Open Night 🍽️',
      mainDish: 'Unplanned / Open Night',
      sideDishes: '',
      dessert: '',
      preparedBy: 'Family Kitchen',
      icon: '🍽️',
      notes: '',
      votingEnabled: false,
      votingOptions: [],
      suggestions: [],
      recipe: undefined,
      lockedByParent: false,
    };

    const updatedDays = {
      ...menu.days,
      [dayKey]: emptyDay,
    };

    onUpdateDatabase({
      ...database,
      weeklyMenu: {
        ...menu,
        days: updatedDays,
        lastUpdated: new Date().toISOString(),
      },
    });

    if (isEditingCurrentDay && selectedDay === dayKey) {
      setParentEditForm(emptyDay);
    }
    setDeleteConfirmDay(null);
    setToastMessage(`Cleared ${DAY_METADATA[dayKey].label}'s dinner menu 🗑️`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // --- Delete / Clear Full Week Menu ---
  const handleClearFullWeek = () => {
    sound.playTap();
    const clearedDays = {} as Record<DayOfWeekKey, DailyDinnerPlan>;

    DAYS_OF_WEEK_ORDER.forEach((dayKey) => {
      clearedDays[dayKey] = {
        dayOfWeek: dayKey,
        theme: 'Unplanned / Open Night 🍽️',
        mainDish: 'Unplanned / Open Night',
        sideDishes: '',
        dessert: '',
        preparedBy: 'Family Kitchen',
        icon: '🍽️',
        notes: '',
        votingEnabled: false,
        votingOptions: [],
        suggestions: [],
        recipe: undefined,
        lockedByParent: false,
      };
    });

    onUpdateDatabase({
      ...database,
      weeklyMenu: {
        ...menu,
        days: clearedDays,
        title: 'Family Dinner Menu',
        lastUpdated: new Date().toISOString(),
      },
    });

    if (isEditingCurrentDay) {
      setParentEditForm(clearedDays[selectedDay]);
    }

    setShowDeleteWeekConfirm(false);
    setToastMessage('Cleared full week dinner menu 🗑️');
    setTimeout(() => setToastMessage(null), 3000);
  };

  // --- Import Recipe from Dish Title Search ---
  const handleImportRecipeFromDishTitle = () => {
    if (!parentEditForm || !parentEditForm.mainDish.trim()) return;

    sound.playStarEarned();
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#f59e0b', '#fbbf24', '#10b981', '#3b82f6'],
    });

    const searchResult = searchRecipeForDish(parentEditForm.mainDish, parentEditForm.theme);

    const updatedForm: DailyDinnerPlan = {
      ...parentEditForm,
      recipe: searchResult.recipe,
      sideDishes:
        !parentEditForm.sideDishes || parentEditForm.sideDishes.trim() === ''
          ? searchResult.suggestedSides || parentEditForm.sideDishes
          : parentEditForm.sideDishes,
      dessert:
        !parentEditForm.dessert || parentEditForm.dessert.trim() === ''
          ? searchResult.suggestedDessert || parentEditForm.dessert
          : parentEditForm.dessert,
      theme:
        !parentEditForm.theme ||
        parentEditForm.theme.includes('Unplanned') ||
        parentEditForm.theme === DAY_METADATA[selectedDay].defaultTheme
          ? searchResult.suggestedTheme || parentEditForm.theme
          : parentEditForm.theme,
      icon:
        !parentEditForm.icon || parentEditForm.icon === '🍽️'
          ? searchResult.suggestedIcon || parentEditForm.icon
          : parentEditForm.icon,
    };

    setParentEditForm(updatedForm);
    setImportRecipeFeedback(
      `Recipe imported for "${searchResult.matchedTitle}"! (${searchResult.recipe.prepTime} prep, ${searchResult.recipe.ingredients.length} ingredients)`
    );
  };

  // --- Parent: Load Preset Menu ---
  const handleApplyPreset = (preset: ReturnType<typeof getMealPresets>[0]) => {
    sound.playChoreComplete();
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.5 },
    });

    const newDays: Record<DayOfWeekKey, DailyDinnerPlan> = { ...menu.days };

    DAYS_OF_WEEK_ORDER.forEach((dayKey) => {
      const presetDay = preset.menu[dayKey];
      if (presetDay) {
        newDays[dayKey] = {
          ...newDays[dayKey],
          mainDish: presetDay.main,
          sideDishes: presetDay.side,
          icon: presetDay.icon,
          recipe: presetDay.recipe || newDays[dayKey]?.recipe,
        };
      }
    });

    onUpdateDatabase({
      ...database,
      weeklyMenu: {
        ...menu,
        days: newDays,
        title: preset.name,
        lastUpdated: new Date().toISOString(),
      },
    });

    setShowPresetMenuModal(false);
  };

  // Calculate voting stats for current day
  const totalVotesOnCurrentDay = (currentPlan.votingOptions || []).reduce(
    (acc, opt) => acc + opt.voterKidIds.length,
    0
  );

  return (
    <div
      id="weekly-menu-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-fade-in overflow-y-auto"
    >
      <div
        id="weekly-menu-modal-container"
        className="bg-white border-4 border-amber-300 rounded-3xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden relative"
      >
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 p-4 sm:p-5 flex items-center justify-between shadow-md shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-950 text-yellow-400 border-2 border-yellow-300 flex items-center justify-center text-2xl shadow-inner shrink-0">
              🍽️
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full bg-slate-950 text-yellow-300 font-black text-[11px] uppercase tracking-wider">
                  Weekly Dinner Menu
                </span>
                <span className="text-xs font-black text-amber-950">
                  {menu.title || "Family Dinner Schedule & Voting"}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-950 flex items-center gap-2">
                <span>What's For Dinner This Week?</span>
                <span className="text-base sm:text-lg">🥘</span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Switcher: Day vs Grid */}
            <div className="hidden sm:flex items-center bg-amber-600/30 p-1 rounded-2xl border border-amber-600/40 text-xs font-black">
              <button
                onClick={() => {
                  sound.playTap();
                  setViewMode('day');
                }}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  viewMode === 'day'
                    ? 'bg-slate-950 text-yellow-300 shadow-xs'
                    : 'text-amber-950 hover:text-black'
                }`}
              >
                Day by Day
              </button>
              <button
                onClick={() => {
                  sound.playTap();
                  setViewMode('grid');
                }}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-slate-950 text-yellow-300 shadow-xs'
                    : 'text-amber-950 hover:text-black'
                }`}
              >
                Full Week 7-Day
              </button>
            </div>

            {/* Presets Button */}
            <button
              id="btn-menu-presets"
              onClick={() => {
                sound.playTap();
                setShowPresetMenuModal(true);
              }}
              className="px-3 py-2 rounded-2xl bg-white hover:bg-yellow-50 text-slate-900 border-2 border-amber-600/40 text-xs font-black flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
              title="Browse Meal Plan Presets"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden md:inline">Presets</span>
            </button>

            {/* Grocery List Shortcut */}
            {onOpenGroceryList && (
              <button
                id="btn-menu-to-grocery"
                onClick={() => {
                  sound.playTap();
                  onClose();
                  onOpenGroceryList();
                }}
                className="px-3 py-2 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 border-2 border-emerald-300 text-xs font-black flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
                title="Open Automated Grocery List"
              >
                <span>🛒</span>
                <span className="hidden md:inline">Grocery List</span>
              </button>
            )}

            {/* Boxed in Red X - Clear/Delete Entire Week Dinner Menu */}
            <button
              id="btn-delete-full-week-menu"
              onClick={() => {
                sound.playTap();
                setShowDeleteWeekConfirm(true);
              }}
              className="px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 border-2 border-rose-400 hover:border-rose-600 text-xs font-black flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
              title="Delete / Clear entire week's dinner menu"
            >
              <div className="w-5 h-5 rounded-md border border-rose-600 bg-rose-600 text-white flex items-center justify-center shadow-xs">
                <X className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <span className="hidden lg:inline">Clear Week</span>
            </button>

            {/* Close Button */}
            <button
              id="btn-close-weekly-menu"
              onClick={() => {
                sound.playTap();
                onClose();
              }}
              className="w-10 h-10 rounded-2xl bg-slate-950 hover:bg-slate-800 text-white flex items-center justify-center transition-transform active:scale-90 cursor-pointer shadow-md"
              title="Close Menu (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Days of Week Tab Bar */}
        <div className="bg-amber-50/80 border-b-2 border-amber-200 p-2 sm:p-3 overflow-x-auto flex items-center gap-2 shrink-0">
          {DAYS_OF_WEEK_ORDER.map((dayKey) => {
            const meta = DAY_METADATA[dayKey];
            const isToday = dayKey === todayKey;
            const isSelected = dayKey === selectedDay;
            const plan = menu.days[dayKey] || DEFAULT_WEEKLY_MENU.days[dayKey];
            const hasVoting = plan.votingEnabled;

            return (
              <button
                key={dayKey}
                id={`btn-day-tab-${dayKey}`}
                onClick={() => {
                  sound.playTap();
                  setSelectedDay(dayKey);
                  setViewMode('day');
                  setIsEditingCurrentDay(false);
                }}
                className={`flex-1 min-w-[100px] sm:min-w-[120px] p-2 sm:p-2.5 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer relative ${
                  isSelected
                    ? 'bg-slate-950 text-white border-slate-950 shadow-md ring-2 ring-amber-400 scale-[1.02]'
                    : isToday
                      ? 'bg-yellow-200/80 hover:bg-yellow-200 text-slate-900 border-amber-400 font-extrabold'
                      : 'bg-white hover:bg-amber-100/60 text-slate-700 border-amber-200'
                }`}
              >
                {/* Badges */}
                {isToday && (
                  <span
                    className={`absolute -top-2 px-2 py-0.2 rounded-full text-[9px] font-black uppercase tracking-wider ${
                      isSelected
                        ? 'bg-amber-400 text-slate-950 font-black'
                        : 'bg-amber-500 text-slate-950 font-black'
                    }`}
                  >
                    Today
                  </span>
                )}

                <div className="flex items-center gap-1.5">
                  <span className="text-lg">{plan.icon || meta.emoji}</span>
                  <span className="text-xs sm:text-sm font-black">{meta.shortLabel}</span>
                </div>

                <div className="flex items-center gap-1">
                  {hasVoting && (
                    <span
                      className={`text-[10px] font-black px-1.5 py-0.2 rounded-md ${
                        isSelected ? 'bg-amber-400 text-slate-950' : 'bg-pink-100 text-pink-700'
                      }`}
                    >
                      🗳️ Vote
                    </span>
                  )}
                  {plan.lockedByParent && (
                    <span className="text-[10px]" title="Menu finalized">
                      🔒
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Modal Main Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50">
          {viewMode === 'grid' ? (
            /* 7-DAY FULL WEEK GRID VIEW */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-slate-900">
                    7-Day Family Meal Planner
                  </h2>
                  <p className="text-xs text-slate-500 font-bold">
                    Overview of the entire week's dinners, themes, and open voting days
                  </p>
                </div>
                <button
                  onClick={() => {
                    sound.playTap();
                    window.print();
                  }}
                  className="px-3.5 py-2 rounded-2xl bg-white border-2 border-slate-300 hover:border-slate-400 text-slate-700 text-xs font-black flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Menu</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {DAYS_OF_WEEK_ORDER.map((dayKey) => {
                  const meta = DAY_METADATA[dayKey];
                  const plan = menu.days[dayKey] || DEFAULT_WEEKLY_MENU.days[dayKey];
                  const isToday = dayKey === todayKey;

                  return (
                    <div
                      key={dayKey}
                      onClick={() => {
                        sound.playTap();
                        setSelectedDay(dayKey);
                        setViewMode('day');
                      }}
                      className={`p-4 rounded-3xl border-2 transition-all cursor-pointer flex flex-col justify-between relative hover:scale-[1.02] shadow-sm ${
                        isToday
                          ? 'border-amber-400 bg-amber-50/60 ring-2 ring-amber-300'
                          : 'border-slate-200 bg-white hover:border-amber-300'
                      }`}
                    >
                      {isToday && (
                        <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] uppercase">
                          Tonight
                        </div>
                      )}

                      {/* Boxed in Red X delete button for this day */}
                      <button
                        type="button"
                        id={`btn-delete-grid-day-${dayKey}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          sound.playTap();
                          setDeleteConfirmDay(dayKey);
                        }}
                        title={`Delete / Clear ${meta.label}'s dinner menu`}
                        className={`absolute ${isToday ? 'top-3 right-20' : 'top-3 right-3'} w-7 h-7 rounded-lg border-2 border-rose-500 bg-rose-50 hover:bg-rose-500 hover:text-white text-rose-600 flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-90 z-10 group`}
                      >
                        <X className="w-4 h-4 stroke-[3] group-hover:scale-110 transition-transform" />
                      </button>

                      <div>
                        <div className="flex items-center gap-2 pb-2 border-b border-slate-100 pr-8">
                          <span className="text-2xl">{plan.icon || meta.emoji}</span>
                          <div>
                            <h3 className="font-black text-sm text-slate-900">{meta.label}</h3>
                            <span className="text-[11px] font-bold text-amber-700">
                              {plan.theme || meta.defaultTheme}
                            </span>
                          </div>
                        </div>

                        <div className="mt-3">
                          <div className="text-xs font-black text-slate-800 line-clamp-2">
                            {plan.mainDish}
                          </div>
                          {plan.sideDishes && (
                            <div className="text-[11px] text-slate-500 font-semibold mt-1 line-clamp-1">
                              🥗 {plan.sideDishes}
                            </div>
                          )}
                          {plan.dessert && (
                            <div className="text-[11px] text-pink-600 font-semibold mt-0.5 line-clamp-1">
                              🍨 {plan.dessert}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                        <span className="font-bold text-slate-600">
                          👨‍🍳 {plan.preparedBy || 'Family'}
                        </span>
                        {plan.votingEnabled ? (
                          <span className="px-2 py-0.5 rounded-md bg-pink-100 text-pink-700 font-black text-[10px]">
                            🗳️ Voting Open
                          </span>
                        ) : (
                          <span className="text-slate-400 font-bold">Planned</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* SINGLE DAY DETAIL VIEW WITH VOTING & CUSTOMIZATION */
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Day Header & Parent Edit Controls */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-3xl border-2 border-amber-200 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-amber-100 border-2 border-amber-300 flex items-center justify-center text-3xl shadow-inner shrink-0">
                    {currentPlan.icon || DAY_METADATA[selectedDay].emoji}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                        {DAY_METADATA[selectedDay].label}'s Dinner
                      </h2>
                      {selectedDay === todayKey && (
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-xs uppercase animate-pulse">
                          ⭐ Tonight's Feast ⭐
                        </span>
                      )}
                      {currentPlan.votingEnabled && (
                        <span className="px-2.5 py-0.5 rounded-full bg-pink-100 text-pink-700 font-black text-xs border border-pink-300">
                          🗳️ Kids' Choice Voting Active
                        </span>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm font-extrabold text-amber-800">
                      {currentPlan.theme || DAY_METADATA[selectedDay].defaultTheme}
                    </p>
                  </div>
                </div>

                {/* Recipe Button, Edit Button & Boxed in Red X Delete Button */}
                <div className="flex items-center gap-2 self-end sm:self-center flex-wrap">
                  {/* View & Edit Recipe Button */}
                  <button
                    id="btn-view-recipe-day"
                    onClick={() => {
                      sound.playTap();
                      setIsRecipeModalOpen(true);
                    }}
                    className="px-3.5 py-2 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 border-2 border-amber-600/50 text-xs font-black flex items-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95 ring-1 ring-amber-300"
                    title="View & Edit Comprehensible Recipe and Substitutions"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-amber-950" />
                    <span>View & Edit Recipe</span>
                  </button>

                  {!isEditingCurrentDay ? (
                    <button
                      id="btn-edit-dinner-plan"
                      onClick={() => {
                        sound.playTap();
                        setParentEditForm({ ...currentPlan });
                        setIsEditingCurrentDay(true);
                      }}
                      className="px-3.5 py-2 rounded-2xl bg-amber-100 hover:bg-amber-200 text-amber-950 border-2 border-amber-300 text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Customize Day</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          sound.playTap();
                          setIsEditingCurrentDay(false);
                          setParentEditForm(null);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-black cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveDayEdit}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-1 shadow-md cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Save Changes</span>
                      </button>
                    </div>
                  )}

                  {/* Boxed in Red X Delete Button for Selected Day */}
                  <button
                    id="btn-delete-current-day-menu"
                    onClick={() => {
                      sound.playTap();
                      setDeleteConfirmDay(selectedDay);
                    }}
                    className="p-2 sm:px-3 sm:py-2 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 border-2 border-rose-400 hover:border-rose-600 text-xs font-black flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
                    title={`Delete / Clear ${DAY_METADATA[selectedDay].label}'s dinner menu`}
                  >
                    <div className="w-5 h-5 rounded-md border border-rose-600 bg-rose-600 text-white flex items-center justify-center shadow-xs">
                      <X className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span className="hidden sm:inline">Delete Day</span>
                  </button>
                </div>
              </div>

              {/* PARENT EDIT FORM DRAWER */}
              {isEditingCurrentDay && parentEditForm && (
                <div className="bg-amber-50/90 border-2 border-amber-300 rounded-3xl p-5 shadow-md space-y-4 animate-fade-in">
                  <div className="flex items-center justify-between pb-2 border-b border-amber-200">
                    <h3 className="text-sm font-black text-amber-950 flex items-center gap-2">
                      <ChefHat className="w-4 h-4 text-amber-700" />
                      <span>Customize {DAY_METADATA[selectedDay].label}'s Dinner Details</span>
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Main Dish with Import Recipe Button */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between flex-wrap gap-1">
                        <label className="block text-xs font-black text-slate-700 uppercase">
                          Main Dish Title:
                        </label>
                        {parentEditForm.mainDish && parentEditForm.mainDish.trim().length > 0 && (
                          <button
                            type="button"
                            id="btn-import-recipe-from-dish"
                            onClick={handleImportRecipeFromDishTitle}
                            className="px-2.5 py-0.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 border border-amber-600/40 text-[11px] font-black flex items-center gap-1 shadow-xs transition-all active:scale-95 cursor-pointer"
                            title={`Search and import recipe for "${parentEditForm.mainDish}"`}
                          >
                            <Sparkles className="w-3 h-3 text-amber-950 animate-pulse" />
                            <span>Import Recipe</span>
                          </button>
                        )}
                      </div>
                      <div className="relative flex items-center">
                        <input
                          type="text"
                          value={parentEditForm.mainDish}
                          onChange={(e) => {
                            setParentEditForm({ ...parentEditForm, mainDish: e.target.value });
                            if (importRecipeFeedback) setImportRecipeFeedback(null);
                          }}
                          className="w-full px-3.5 py-2.5 rounded-2xl border-2 border-slate-300 bg-white font-black text-slate-900 placeholder:text-slate-400 text-sm pr-32 focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                          placeholder="e.g. Grilled Cheese, Tacos, Chicken Alfredo..."
                        />
                        {parentEditForm.mainDish && parentEditForm.mainDish.trim().length > 0 && (
                          <button
                            type="button"
                            id="btn-inline-import-recipe"
                            onClick={handleImportRecipeFromDishTitle}
                            className="absolute right-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-300 hover:from-amber-300 hover:to-yellow-200 text-slate-950 font-black text-xs flex items-center gap-1 shadow-sm cursor-pointer active:scale-95 border border-amber-600/30"
                            title="Click to search and auto-populate recipe, sides & details"
                          >
                            <Search className="w-3.5 h-3.5 text-slate-950" />
                            <span>Import Recipe</span>
                          </button>
                        )}
                      </div>
                      {importRecipeFeedback && (
                        <div className="mt-1.5 text-xs font-black text-emerald-800 bg-emerald-50 border border-emerald-300 rounded-xl p-2.5 flex items-center justify-between gap-2 animate-fade-in shadow-xs">
                          <span className="flex items-center gap-1.5">
                            <span>✅</span>
                            <span>{importRecipeFeedback}</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => setIsRecipeModalOpen(true)}
                            className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-black cursor-pointer shrink-0 transition-colors shadow-2xs"
                          >
                            View Recipe Card →
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Meal Icon Emoji */}
                    <div>
                      <label className="block text-xs font-black text-slate-700 uppercase mb-1">
                        Meal Icon Emoji:
                      </label>
                      <EmojiPicker
                        value={parentEditForm.icon || '🍽️'}
                        onChange={(emoji) => setParentEditForm({ ...parentEditForm, icon: emoji })}
                        title="Choose Dinner Icon"
                        categoryFilter="food"
                      />
                    </div>

                    {/* Theme / Category */}
                    <div>
                      <label className="block text-xs font-black text-slate-700 uppercase mb-1">
                        Theme / Occasion:
                      </label>
                      <input
                        type="text"
                        value={parentEditForm.theme || ''}
                        onChange={(e) =>
                          setParentEditForm({ ...parentEditForm, theme: e.target.value })
                        }
                        className="w-full px-3.5 py-2.5 rounded-2xl border-2 border-slate-300 bg-white font-black text-slate-900 placeholder:text-slate-400 text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                        placeholder="e.g. Taco Tuesday Fiesta! 🌮"
                      />
                    </div>

                    {/* Prepared By / Chef */}
                    <div>
                      <label className="block text-xs font-black text-slate-700 uppercase mb-1">
                        Head Chef / Prepared By:
                      </label>
                      <input
                        type="text"
                        value={parentEditForm.preparedBy || ''}
                        onChange={(e) =>
                          setParentEditForm({ ...parentEditForm, preparedBy: e.target.value })
                        }
                        className="w-full px-3.5 py-2.5 rounded-2xl border-2 border-slate-300 bg-white font-black text-slate-900 placeholder:text-slate-400 text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                        placeholder="e.g. Dad & Maya 🦄"
                      />
                    </div>

                    {/* Side Dishes */}
                    <div>
                      <label className="block text-xs font-black text-slate-700 uppercase mb-1">
                        Side Dishes:
                      </label>
                      <input
                        type="text"
                        value={parentEditForm.sideDishes || ''}
                        onChange={(e) =>
                          setParentEditForm({ ...parentEditForm, sideDishes: e.target.value })
                        }
                        className="w-full px-3.5 py-2.5 rounded-2xl border-2 border-slate-300 bg-white font-black text-slate-900 placeholder:text-slate-400 text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                        placeholder="e.g. Cilantro Lime Rice, Black Beans & Fresh Guacamole"
                      />
                    </div>

                    {/* Dessert / Treat */}
                    <div>
                      <label className="block text-xs font-black text-slate-700 uppercase mb-1">
                        Dessert / Sweet Treat:
                      </label>
                      <input
                        type="text"
                        value={parentEditForm.dessert || ''}
                        onChange={(e) =>
                          setParentEditForm({ ...parentEditForm, dessert: e.target.value })
                        }
                        className="w-full px-3.5 py-2.5 rounded-2xl border-2 border-slate-300 bg-white font-black text-slate-900 placeholder:text-slate-400 text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                        placeholder="e.g. Warm Cinnamon Sugar Churro Bites"
                      />
                    </div>

                    {/* Timing & Preparation Notes */}
                    <div className="md:col-span-2">
                      <label className="block text-xs font-black text-slate-700 uppercase mb-1">
                        Timing, Notes & Schedule:
                      </label>
                      <input
                        type="text"
                        value={parentEditForm.notes || ''}
                        onChange={(e) =>
                          setParentEditForm({ ...parentEditForm, notes: e.target.value })
                        }
                        className="w-full px-3.5 py-2.5 rounded-2xl border-2 border-slate-300 bg-white font-black text-slate-900 placeholder:text-slate-400 text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                        placeholder="e.g. Early dinner at 5:30 PM before soccer game ⚽"
                      />
                    </div>
                  </div>

                  {/* Voting Toggle & Options Manager */}
                  <div className="pt-3 border-t border-amber-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={parentEditForm.votingEnabled ?? false}
                          onChange={(e) =>
                            setParentEditForm({
                              ...parentEditForm,
                              votingEnabled: e.target.checked,
                            })
                          }
                          className="w-5 h-5 rounded-lg text-amber-600 focus:ring-amber-500 accent-amber-600 cursor-pointer"
                        />
                        <span className="text-sm font-black text-slate-800">
                          Enable Kids' Choice Voting for {DAY_METADATA[selectedDay].label}
                        </span>
                      </label>
                    </div>

                    {parentEditForm.votingEnabled && (
                      <div className="space-y-3 bg-white p-4 rounded-2xl border-2 border-amber-200">
                        <div>
                          <label className="block text-xs font-black text-slate-700 uppercase mb-1">
                            Voting Question / Prompt:
                          </label>
                          <input
                            type="text"
                            value={parentEditForm.votingQuestion || ''}
                            onChange={(e) =>
                              setParentEditForm({
                                ...parentEditForm,
                                votingQuestion: e.target.value,
                              })
                            }
                            className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white font-black text-slate-900 placeholder:text-slate-400 text-xs focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                            placeholder="e.g. Kids Vote: What should we cook for Friday Movie Night?"
                          />
                        </div>

                        {/* List Existing Voting Options */}
                        <div className="space-y-2">
                          <label className="block text-xs font-black text-slate-700 uppercase">
                            Voting Choices ({parentEditForm.votingOptions?.length || 0}):
                          </label>

                          {(parentEditForm.votingOptions || []).map((opt, idx) => (
                            <div
                              key={opt.id}
                              className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 text-xs"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="text-xl">{opt.icon || '🍽️'}</span>
                                <div className="min-w-0">
                                  <div className="font-black text-slate-800 truncate">
                                    {opt.title}
                                  </div>
                                  {opt.description && (
                                    <div className="text-[10px] text-slate-500 truncate">
                                      {opt.description}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setParentEditForm({
                                    ...parentEditForm,
                                    votingOptions: (parentEditForm.votingOptions || []).filter(
                                      (o) => o.id !== opt.id
                                    ),
                                  });
                                }}
                                className="p-1.5 text-rose-500 hover:text-rose-700 rounded-lg hover:bg-rose-50 cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>

                        {/* Add New Option */}
                        <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-2 items-end">
                          <div className="sm:col-span-2">
                            <label className="block text-[11px] font-black text-slate-600 mb-1">
                              Add New Meal Option:
                            </label>
                            <input
                              type="text"
                              value={newOptionTitle}
                              onChange={(e) => setNewOptionTitle(e.target.value)}
                              placeholder="e.g. Homemade Brick Oven Pizza 🍕"
                              className="w-full px-3 py-1.5 rounded-xl border border-slate-300 bg-white font-black text-slate-900 placeholder:text-slate-400 text-xs focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                            />
                          </div>
                          <div>
                            <button
                              type="button"
                              onClick={handleAddVotingOption}
                              disabled={!newOptionTitle.trim()}
                              className="w-full py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-black text-xs rounded-xl shadow-xs cursor-pointer flex items-center justify-center gap-1"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Add Option</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      onClick={() => {
                        sound.playTap();
                        setIsEditingCurrentDay(false);
                        setParentEditForm(null);
                      }}
                      className="px-4 py-2 rounded-2xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-black cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveDayEdit}
                      className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Save & Apply</span>
                    </button>
                  </div>
                </div>
              )}

              {/* MAIN DISH SHOWCASE CARD */}
              <div className="bg-white rounded-3xl border-2 border-slate-200 p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
                {/* Background decorative glow */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-amber-200/30 rounded-full blur-3xl pointer-events-none" />

                <div className="flex items-start gap-4 z-10 flex-1">
                  <div className="w-20 h-20 rounded-3xl bg-amber-100 border-2 border-amber-300 flex items-center justify-center text-4xl shadow-md shrink-0">
                    {currentPlan.icon || '🍽️'}
                  </div>

                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                        👨‍🍳 Chef: {currentPlan.preparedBy || 'Family Kitchen'}
                      </span>
                      {currentPlan.notes && (
                        <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          <span>{currentPlan.notes}</span>
                        </span>
                      )}
                    </div>

                    <h3 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">
                      {currentPlan.mainDish}
                    </h3>

                    {/* Sides and Dessert */}
                    <div className="pt-2 flex flex-wrap gap-4 text-xs font-bold">
                      {currentPlan.sideDishes && (
                        <div className="flex items-center gap-1.5 text-slate-700 bg-slate-100 px-3 py-1.5 rounded-xl">
                          <span>🥗</span>
                          <span>
                            <strong className="text-slate-900">Sides:</strong>{' '}
                            {currentPlan.sideDishes}
                          </span>
                        </div>
                      )}
                      {currentPlan.dessert && (
                        <div className="flex items-center gap-1.5 text-pink-700 bg-pink-50 px-3 py-1.5 rounded-xl border border-pink-200">
                          <span>🍨</span>
                          <span>
                            <strong className="text-pink-900">Dessert:</strong>{' '}
                            {currentPlan.dessert}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* KIDS' CHOICE MEAL VOTING HUB */}
              {currentPlan.votingEnabled && (
                <div
                  id="kids-voting-section"
                  className="bg-gradient-to-br from-pink-50 via-purple-50 to-amber-50 rounded-3xl border-2 border-pink-300 p-5 sm:p-6 shadow-md space-y-5"
                >
                  {/* Voting Header */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-pink-200">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-pink-500 text-white flex items-center justify-center text-2xl shadow-md">
                        🗳️
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black uppercase tracking-wider text-pink-700 bg-pink-200/70 px-2.5 py-0.5 rounded-full">
                            Kids' Choice Vote
                          </span>
                          <span className="text-xs font-bold text-slate-500">
                            {totalVotesOnCurrentDay} Votes Cast
                          </span>
                        </div>
                        <h4 className="text-base sm:text-lg font-black text-slate-900 mt-0.5">
                          {currentPlan.votingQuestion || 'Vote for your favorite meal option!'}
                        </h4>
                      </div>
                    </div>

                    {/* Kid Switcher for Voting */}
                    <div className="flex items-center gap-2 bg-white/90 p-1.5 rounded-2xl border border-pink-200 shadow-xs">
                      <span className="text-xs font-black text-slate-600 pl-2">I am:</span>
                      <div className="flex items-center gap-1">
                        {database.kids.map((k) => (
                          <button
                            key={k.id}
                            id={`btn-select-voter-${k.id}`}
                            onClick={() => {
                              sound.playTap();
                              setSelectedKidForVote(k.id);
                            }}
                            className={`px-2.5 py-1 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                              selectedKidForVote === k.id
                                ? 'bg-pink-600 text-white shadow-sm scale-105 ring-2 ring-pink-300'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                            }`}
                          >
                            <span>{k.avatar}</span>
                            <span>{k.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Options Voting Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(currentPlan.votingOptions || []).map((option) => {
                      const isVotedBySelectedKid =
                        selectedKidForVote && option.voterKidIds.includes(selectedKidForVote);
                      const voteCount = option.voterKidIds.length;
                      const percentage =
                        totalVotesOnCurrentDay > 0
                          ? Math.round((voteCount / totalVotesOnCurrentDay) * 100)
                          : 0;
                      const isWinning =
                        voteCount > 0 &&
                        voteCount ===
                          Math.max(
                            ...(currentPlan.votingOptions || []).map((o) => o.voterKidIds.length)
                          );

                      return (
                        <div
                          key={option.id}
                          className={`rounded-3xl border-2 p-4 flex flex-col justify-between transition-all relative overflow-hidden ${
                            isVotedBySelectedKid
                              ? 'border-pink-500 bg-white ring-4 ring-pink-400/30 shadow-lg'
                              : isWinning
                                ? 'border-amber-400 bg-amber-50/80 shadow-md'
                                : 'border-slate-200 bg-white hover:border-pink-300'
                          }`}
                        >
                          {/* Top Winner ribbon if highest votes */}
                          {isWinning && voteCount > 0 && (
                            <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] uppercase flex items-center gap-1 shadow-xs">
                              <Trophy className="w-3 h-3 text-slate-950 fill-slate-950" />
                              <span>Leading</span>
                            </div>
                          )}

                          <div>
                            <div className="flex items-center gap-3 pb-2.5 border-b border-slate-100">
                              <span className="text-3xl">{option.icon || '🍽️'}</span>
                              <div className="min-w-0 flex-1">
                                <h5 className="font-black text-sm text-slate-900 truncate">
                                  {option.title}
                                </h5>
                                {option.description && (
                                  <p className="text-xs text-slate-500 font-semibold line-clamp-2 mt-0.5">
                                    {option.description}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Votes Progress Bar & Voter Kid Avatars */}
                            <div className="my-3 space-y-1.5">
                              <div className="flex items-center justify-between text-xs font-black text-slate-700">
                                <span>{voteCount} Votes</span>
                                <span>{percentage}%</span>
                              </div>
                              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5">
                                <div
                                  className={`h-full rounded-full transition-all duration-500 ${
                                    isWinning
                                      ? 'bg-gradient-to-r from-amber-400 to-pink-500'
                                      : 'bg-slate-400'
                                  }`}
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>

                              {/* Avatars of kids who voted for this */}
                              <div className="flex items-center gap-1 min-h-[24px]">
                                {option.voterKidIds.length === 0 ? (
                                  <span className="text-[10px] text-slate-400 font-semibold italic">
                                    No votes yet
                                  </span>
                                ) : (
                                  option.voterKidIds.map((kId) => {
                                    const kid = database.kids.find((k) => k.id === kId);
                                    if (!kid) return null;
                                    return (
                                      <div
                                        key={kId}
                                        style={{ backgroundColor: kid.color }}
                                        className="w-6 h-6 rounded-full border border-white flex items-center justify-center text-xs shadow-xs"
                                        title={`${kid.name} voted for this!`}
                                      >
                                        {kid.avatar}
                                      </div>
                                    );
                                  })
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons: Vote Button & Declare Winner (Parent) */}
                          <div className="pt-2 border-t border-slate-100 space-y-2">
                            <button
                              id={`btn-vote-option-${option.id}`}
                              onClick={() => handleVoteForOption(option.id)}
                              className={`w-full py-2.5 rounded-2xl font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 shadow-sm ${
                                isVotedBySelectedKid
                                  ? 'bg-pink-600 hover:bg-pink-700 text-white ring-2 ring-pink-300'
                                  : 'bg-pink-100 hover:bg-pink-200 text-pink-800 border border-pink-300'
                              }`}
                            >
                              <Vote className="w-4 h-4" />
                              <span>
                                {isVotedBySelectedKid ? 'Voted! Tap to Remove' : 'Vote for This Meal!'}
                              </span>
                            </button>

                            {/* Parent Declare Winner Button */}
                            <button
                              onClick={() => handleDeclareWinningMeal(option)}
                              className="w-full py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 font-black text-[11px] flex items-center justify-center gap-1 cursor-pointer transition-colors"
                              title="Set as the official dinner for this day"
                            >
                              <Trophy className="w-3 h-3 text-amber-700" />
                              <span>Set as Official Dinner 🏆</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* SIBLINGS MEAL SUGGESTIONS DRAWER */}
                  <div className="bg-white/80 rounded-2xl p-4 border border-pink-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">💡</span>
                        <h5 className="text-xs font-black text-slate-800 uppercase tracking-wide">
                          Kids' Custom Meal Suggestions
                        </h5>
                      </div>

                      {!isSuggestingOpen && (
                        <button
                          onClick={() => {
                            sound.playTap();
                            setIsSuggestingOpen(true);
                          }}
                          className="px-3 py-1 rounded-xl bg-pink-100 hover:bg-pink-200 text-pink-800 font-black text-xs flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Suggest a Dish</span>
                        </button>
                      )}
                    </div>

                    {isSuggestingOpen && (
                      <form
                        onSubmit={handleSubmitSuggestion}
                        className="bg-pink-50 p-3.5 rounded-2xl border border-pink-300 space-y-3 animate-fade-in"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-700">
                            Suggesting as:
                          </span>
                          <strong className="text-xs text-pink-800">
                            {database.kids.find((k) => k.id === selectedKidForVote)?.name ||
                              'Kid'}
                          </strong>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
                          <div className="sm:col-span-2">
                            <input
                              type="text"
                              value={suggestionDish}
                              onChange={(e) => setSuggestionDish(e.target.value)}
                              placeholder="e.g. Cheesy Baked Macaroni with Bacon 🧀"
                              className="w-full px-3 py-2 rounded-xl border border-pink-300 bg-white font-black text-slate-900 placeholder:text-slate-400 text-xs focus:ring-2 focus:ring-pink-300 focus:outline-hidden"
                              autoFocus
                            />
                          </div>
                          <div>
                            <EmojiPicker
                              value={suggestionIcon}
                              onChange={(emoji) => setSuggestionIcon(emoji)}
                              title="Dish Emoji"
                              categoryFilter="food"
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setIsSuggestingOpen(false)}
                            className="px-3 py-1.5 rounded-xl bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={!suggestionDish.trim()}
                            className="px-4 py-1.5 rounded-xl bg-pink-600 hover:bg-pink-500 disabled:opacity-50 text-white text-xs font-black shadow-sm cursor-pointer"
                          >
                            Submit Suggestion 🚀
                          </button>
                        </div>
                      </form>
                    )}

                    {/* Suggestions List */}
                    <div className="space-y-2">
                      {(!currentPlan.suggestions || currentPlan.suggestions.length === 0) ? (
                        <div className="text-center py-3 text-slate-400 text-xs font-bold italic">
                          No custom suggestions yet. Tap "Suggest a Dish" to propose your dream dinner!
                        </div>
                      ) : (
                        currentPlan.suggestions.map((sug) => {
                          const author = database.kids.find((k) => k.id === sug.kidId);
                          const hasVoted =
                            selectedKidForVote &&
                            sug.voterKidIds.includes(selectedKidForVote);

                          return (
                            <div
                              key={sug.id}
                              className="p-2.5 rounded-xl bg-white border border-pink-200 flex items-center justify-between gap-3 text-xs"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <span className="text-xl">{sug.icon || '🍲'}</span>
                                <div className="min-w-0">
                                  <div className="font-black text-slate-900 truncate">
                                    {sug.dish}
                                  </div>
                                  <div className="text-[10px] text-slate-500 font-bold">
                                    Suggested by {author?.name || 'Kid'} {author?.avatar}
                                  </div>
                                </div>
                              </div>

                              <button
                                onClick={() => handleToggleSuggestionVote(sug.id)}
                                className={`px-3 py-1.5 rounded-xl font-black text-xs flex items-center gap-1.5 cursor-pointer transition-all ${
                                  hasVoted
                                    ? 'bg-pink-600 text-white shadow-xs'
                                    : 'bg-pink-100 hover:bg-pink-200 text-pink-800'
                                }`}
                              >
                                <ThumbsUp className="w-3.5 h-3.5" />
                                <span>{sug.voterKidIds.length}</span>
                              </button>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom Footer Info Bar */}
        <div className="bg-amber-100/80 border-t-2 border-amber-300 px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-bold text-slate-700 shrink-0">
          <div className="flex items-center gap-2">
            <span>💡</span>
            <span>
              Dinner time is a great opportunity to celebrate today's chore completions and star milestones!
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-slate-500 font-medium">
              Last Updated: {formatDateDisplay(getTodayDateString())}
            </span>
          </div>
        </div>
      </div>

      {/* PRESET INSPIRATION MODAL */}
      {showPresetMenuModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl border-4 border-amber-400 p-6 max-w-xl w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-2xl">✨</span>
                <h3 className="text-lg font-black text-slate-900">
                  Curated Family Meal Themes
                </h3>
              </div>
              <button
                onClick={() => setShowPresetMenuModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 font-bold">
              Select any pre-designed weekly meal plan to instantly load a full 7-day menu for your family:
            </p>

            <div className="space-y-3">
              {getMealPresets().map((preset) => (
                <div
                  key={preset.name}
                  className="p-4 rounded-2xl border-2 border-slate-200 hover:border-amber-400 bg-slate-50 hover:bg-amber-50/50 transition-all flex items-center justify-between gap-4"
                >
                  <div>
                    <h4 className="font-black text-sm text-slate-900">{preset.name}</h4>
                    <p className="text-xs text-slate-500 font-semibold">{preset.description}</p>
                    <div className="flex items-center gap-2 mt-2 text-xs">
                      {DAYS_OF_WEEK_ORDER.map((d) => (
                        <span key={d} title={preset.menu[d]?.main}>
                          {preset.menu[d]?.icon}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => handleApplyPreset(preset)}
                    className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs shadow-sm shrink-0 active:scale-95 transition-transform cursor-pointer"
                  >
                    Apply Menu
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowPresetMenuModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-200 text-slate-700 text-xs font-black cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP-BY-STEP RECIPE & SUBSTITUTIONS MODAL */}
      <MealRecipeModal
        isOpen={isRecipeModalOpen}
        onClose={() => setIsRecipeModalOpen(false)}
        plan={currentPlan}
        dayLabel={DAY_METADATA[selectedDay].label}
        onSaveRecipe={handleSaveRecipe}
        isParentMode={isParentMode}
      />

      {/* CONFIRMATION MODAL: DELETE SPECIFIC DAY */}
      {deleteConfirmDay && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl border-4 border-rose-400 p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  Clear {DAY_METADATA[deleteConfirmDay].label}'s Dinner?
                </h3>
                <p className="text-xs font-bold text-slate-500">
                  This will reset {DAY_METADATA[deleteConfirmDay].label}'s meal to an open unplanned night.
                </p>
              </div>
            </div>

            <div className="p-3 bg-rose-50 rounded-2xl border border-rose-200 text-xs font-semibold text-rose-900">
              Current meal planned: <strong className="font-black text-rose-950">"{menu.days[deleteConfirmDay]?.mainDish || 'Dinner'}"</strong>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmDay(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-black cursor-pointer"
              >
                Keep Meal
              </button>
              <button
                type="button"
                id="btn-confirm-delete-day"
                onClick={() => handleDeleteDay(deleteConfirmDay)}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear This Day</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL: DELETE FULL WEEK */}
      {showDeleteWeekConfirm && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl border-4 border-rose-500 p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  Clear Full Week Menu?
                </h3>
                <p className="text-xs font-bold text-slate-500">
                  This will reset all 7 days of the dinner menu to open / unplanned nights.
                </p>
              </div>
            </div>

            <div className="p-3 bg-rose-50 rounded-2xl border border-rose-200 text-xs font-bold text-rose-900 space-y-1">
              <p>⚠️ All planned dishes, sides, notes, and recipes for Monday through Sunday will be cleared.</p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteWeekConfirm(false)}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-black cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                id="btn-confirm-delete-full-week"
                onClick={handleClearFullWeek}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Yes, Clear Full Week</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST FEEDBACK BANNER */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-80 px-5 py-3 rounded-2xl bg-slate-950 text-white border-2 border-amber-400 font-black text-xs shadow-2xl flex items-center gap-2 animate-bounce">
          <span>✨</span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
