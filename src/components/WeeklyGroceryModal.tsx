import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  ShoppingCart,
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  RefreshCw,
  Sparkles,
  Search,
  Printer,
  Share2,
  AlertTriangle,
  Flame,
  UtensilsCrossed,
  Layers,
  ArrowUpDown,
  Filter,
  Check,
  Package,
  Calendar,
  ChefHat,
  Eye,
  EyeOff,
  Copy,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  FamilyDatabase,
  KidProfile,
  GroceryCategory,
  GroceryItem,
  PantryStapleItem,
  WeeklyGroceryList,
  DayOfWeekKey,
} from '../types';
import {
  GROCERY_CATEGORY_ORDER,
  GROCERY_CATEGORY_METADATA,
  DEFAULT_WEEKLY_GROCERY_LIST,
  DEFAULT_PANTRY_STAPLES,
  detectGroceryCategory,
  getPantryDepletedItems,
  importDepletedItemsToGroceryList,
  startNewWeeklyGroceryList,
  extractIngredientsFromMenu,
  groupGroceryItemsByCategory,
} from '../utils/grocery';
import { DAY_METADATA, DAYS_OF_WEEK_ORDER } from '../utils/menu';
import { getTodayDateString, formatDateDisplay } from '../utils/storage';
import { sound } from '../utils/sound';
import { EmojiPicker } from './EmojiPicker';

interface WeeklyGroceryModalProps {
  isOpen: boolean;
  onClose: () => void;
  database: FamilyDatabase;
  onUpdateDatabase: (updated: FamilyDatabase) => void;
  activeKid?: KidProfile | null;
  isParentMode?: boolean;
}

export const WeeklyGroceryModal: React.FC<WeeklyGroceryModalProps> = ({
  isOpen,
  onClose,
  database,
  onUpdateDatabase,
  activeKid = null,
  isParentMode = false,
}) => {
  const [activeTab, setActiveTab] = useState<'list' | 'pantry' | 'menu_sync'>('list');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<GroceryCategory | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'needed' | 'acquired'>('all');
  const [groupByCategory, setGroupByCategory] = useState<boolean>(true);
  const [sortBy, setSortBy] = useState<'category' | 'name' | 'status' | 'date'>('category');

  // Quick Add Item State
  const [newItemName, setNewItemName] = useState<string>('');
  const [newItemQuantity, setNewItemQuantity] = useState<string>('');
  const [newItemCategory, setNewItemCategory] = useState<GroceryCategory>('produce');
  const [newItemAddedBy, setNewItemAddedBy] = useState<string>(
    activeKid ? `${activeKid.name} ${activeKid.avatar}` : isParentMode ? 'Mom & Dad' : 'Family'
  );
  const [userManuallySelectedCategory, setUserManuallySelectedCategory] = useState<boolean>(false);

  // New Pantry Staple State
  const [newStapleName, setNewStapleName] = useState<string>('');
  const [newStapleCategory, setNewStapleCategory] = useState<GroceryCategory>('pantry');
  const [newStapleQuantity, setNewStapleQuantity] = useState<string>('1');
  const [newStapleIcon, setNewStapleIcon] = useState<string>('🥫');
  const [isAddingStapleOpen, setIsAddingStapleOpen] = useState<boolean>(false);

  // Start New Week Confirmation Dialog State
  const [showStartNewWeekConfirm, setShowStartNewWeekConfirm] = useState<boolean>(false);
  const [includeDinnerMenuInNewWeek, setIncludeDinnerMenuInNewWeek] = useState<boolean>(true);

  // Print / Share Dialog State
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  // Toast Feedback State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const groceryList: WeeklyGroceryList = database.weeklyGroceryList || DEFAULT_WEEKLY_GROCERY_LIST;
  const items: GroceryItem[] = groceryList.items || [];
  const pantryStaples: PantryStapleItem[] = groceryList.pantryStaples || DEFAULT_PANTRY_STAPLES;

  const depletedStaples = useMemo(() => {
    return pantryStaples.filter((s) => s.isDepleted);
  }, [pantryStaples]);

  // Lock background body scroll
  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  // Auto-detect category when typing item name unless user manually picked one
  useEffect(() => {
    if (!userManuallySelectedCategory && newItemName.trim().length > 1) {
      const guessed = detectGroceryCategory(newItemName);
      setNewItemCategory(guessed);
    }
  }, [newItemName, userManuallySelectedCategory]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3200);
  };

  const handleUpdateGroceryList = (updated: WeeklyGroceryList) => {
    onUpdateDatabase({
      ...database,
      weeklyGroceryList: updated,
    });
  };

  // 1. Toggle Item Acquired Status
  const handleToggleAcquired = (itemId: string) => {
    sound.playTap();
    const itemToToggle = items.find((i) => i.id === itemId);
    const willBeAcquired = !itemToToggle?.acquired;

    const updatedItems = items.map((item) => {
      if (item.id === itemId) {
        return {
          ...item,
          acquired: willBeAcquired,
          acquiredAt: willBeAcquired ? new Date().toISOString() : undefined,
        };
      }
      return item;
    });

    // Check if 100% acquired
    const totalCount = updatedItems.length;
    const acquiredCount = updatedItems.filter((i) => i.acquired).length;
    if (willBeAcquired && totalCount > 0 && acquiredCount === totalCount) {
      sound.playRewardRedeemed();
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
      showToast('🎉 All groceries acquired! Shopping trip complete!');
    }

    handleUpdateGroceryList({
      ...groceryList,
      items: updatedItems,
      lastUpdated: new Date().toISOString(),
    });
  };

  // 2. Add New Grocery Item
  const handleAddItem = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newItemName.trim()) return;

    sound.playChoreComplete();
    const newItem: GroceryItem = {
      id: `g-item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: newItemName.trim(),
      category: newItemCategory,
      quantity: newItemQuantity.trim() || undefined,
      acquired: false,
      addedBy: newItemAddedBy || 'Family',
      createdAt: getTodayDateString(),
    };

    const updatedList: WeeklyGroceryList = {
      ...groceryList,
      items: [newItem, ...items],
      lastUpdated: new Date().toISOString(),
    };

    handleUpdateGroceryList(updatedList);
    setNewItemName('');
    setNewItemQuantity('');
    setUserManuallySelectedCategory(false);
    showToast(`Added "${newItem.name}" to grocery list!`);
  };

  // 3. Delete Grocery Item
  const handleDeleteItem = (itemId: string) => {
    sound.playTap();
    const updatedList: WeeklyGroceryList = {
      ...groceryList,
      items: items.filter((i) => i.id !== itemId),
      lastUpdated: new Date().toISOString(),
    };
    handleUpdateGroceryList(updatedList);
  };

  // 4. Clear All Acquired Items
  const handleClearAcquired = () => {
    sound.playTap();
    const needed = items.filter((i) => !i.acquired);
    const removedCount = items.length - needed.length;
    if (removedCount === 0) return;

    const updatedList: WeeklyGroceryList = {
      ...groceryList,
      items: needed,
      lastUpdated: new Date().toISOString(),
    };
    handleUpdateGroceryList(updatedList);
    showToast(`Cleared ${removedCount} acquired items!`);
  };

  // 5. Toggle Pantry Staple Depletion State ("Used Up / Needs Replenish")
  const handleTogglePantryDepletion = (stapleId: string) => {
    sound.playTap();
    const reporterName = activeKid ? `${activeKid.name} ${activeKid.avatar}` : isParentMode ? 'Mom/Dad' : 'Family';
    
    let isNowDepleted = false;
    let stapleName = '';

    const updatedStaples = pantryStaples.map((staple) => {
      if (staple.id === stapleId) {
        const nextState = !staple.isDepleted;
        isNowDepleted = nextState;
        stapleName = staple.name;
        return {
          ...staple,
          isDepleted: nextState,
          depletedAt: nextState ? getTodayDateString() : undefined,
          depletedBy: nextState ? reporterName : undefined,
          lastRestockedAt: !nextState ? new Date().toISOString() : staple.lastRestockedAt,
        };
      }
      return staple;
    });

    handleUpdateGroceryList({
      ...groceryList,
      pantryStaples: updatedStaples,
      lastUpdated: new Date().toISOString(),
    });

    if (isNowDepleted) {
      showToast(`Marked "${stapleName}" as Used Up & needing replenish! ⚠️`);
    } else {
      showToast(`Restocked "${stapleName}" in pantry! ✅`);
    }
  };

  // 6. Import Replenished Items into Active List
  const handleImportReplenishments = () => {
    sound.playChoreComplete();
    const { updatedList, importedCount } = importDepletedItemsToGroceryList(groceryList);
    handleUpdateGroceryList(updatedList);

    if (importedCount > 0) {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      showToast(`📥 Imported ${importedCount} depleted pantry items into active grocery list!`);
    } else {
      showToast('All depleted items are already in your active grocery list.');
    }
  };

  // 7. Start New Weekly Grocery List Confirmation Execution
  const handleConfirmStartNewWeek = (includeReplenish: boolean) => {
    sound.playStarEarned();
    setShowStartNewWeekConfirm(false);

    const newList = startNewWeeklyGroceryList(
      groceryList,
      includeReplenish,
      includeDinnerMenuInNewWeek,
      database.weeklyMenu
    );

    handleUpdateGroceryList(newList);

    const count = newList.items.length;
    confetti({ particleCount: 60, spread: 60, origin: { y: 0.5 } });
    showToast(
      includeReplenish
        ? `🛒 Started new week with ${count} items (replenishments & dinner menu included)!`
        : `🛒 Started a clean fresh weekly grocery list!`
    );
  };

  // 8. Add Custom Pantry Staple
  const handleAddCustomStaple = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStapleName.trim()) return;

    sound.playTap();
    const newStaple: PantryStapleItem = {
      id: `staple-custom-${Date.now()}`,
      name: newStapleName.trim(),
      category: newStapleCategory,
      defaultQuantity: newStapleQuantity.trim() || '1',
      icon: newStapleIcon || '🥫',
      isDepleted: true, // starts depleted so user can immediately buy it
      depletedAt: getTodayDateString(),
      depletedBy: activeKid ? activeKid.name : 'Family',
    };

    const updatedList: WeeklyGroceryList = {
      ...groceryList,
      pantryStaples: [...pantryStaples, newStaple],
      lastUpdated: new Date().toISOString(),
    };

    handleUpdateGroceryList(updatedList);
    setNewStapleName('');
    setNewStapleQuantity('1');
    setIsAddingStapleOpen(false);
    showToast(`Added custom staple "${newStaple.name}"!`);
  };

  // 9. Import All Dinner Menu Ingredients
  const handleImportDinnerMenu = () => {
    sound.playChoreComplete();
    const menuItems = extractIngredientsFromMenu(database.weeklyMenu);
    if (menuItems.length === 0) {
      showToast('No dinner recipes found in this week\'s menu.');
      return;
    }

    const existingNames = new Set(items.map((i) => i.name.toLowerCase().trim()));
    const toAdd: GroceryItem[] = [];

    menuItems.forEach((m) => {
      if (!existingNames.has(m.name.toLowerCase().trim())) {
        toAdd.push(m);
        existingNames.add(m.name.toLowerCase().trim());
      }
    });

    const updatedList: WeeklyGroceryList = {
      ...groceryList,
      items: [...items, ...toAdd],
      lastUpdated: new Date().toISOString(),
    };

    handleUpdateGroceryList(updatedList);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    showToast(`🍽️ Added ${toAdd.length} ingredients from this week's dinner menu!`);
  };

  // 10. Copy Shareable Shopping List Text
  const handleCopyShoppingList = () => {
    const lines: string[] = [];
    lines.push(`🛒 FAMILY GROCERY LIST - Week of ${formatDateDisplay(groceryList.weekStartDate || getTodayDateString())}`);
    lines.push(`Total Items: ${items.length} (${items.filter((i) => i.acquired).length} acquired)\n`);

    GROCERY_CATEGORY_ORDER.forEach((cat) => {
      const catItems = items.filter((i) => i.category === cat);
      if (catItems.length > 0) {
        const meta = GROCERY_CATEGORY_METADATA[cat];
        lines.push(`${meta.icon} ${meta.label.toUpperCase()}:`);
        catItems.forEach((item) => {
          const check = item.acquired ? '[X]' : '[ ]';
          const qty = item.quantity ? ` (${item.quantity})` : '';
          const tag = item.isReplenishItem ? ' *Replenish*' : '';
          lines.push(`  ${check} ${item.name}${qty}${tag}`);
        });
        lines.push('');
      }
    });

    const fullText = lines.join('\n');
    navigator.clipboard.writeText(fullText);
    setCopyFeedback('Copied formatted shopping list to clipboard! 📋');
    sound.playChoreComplete();
    setTimeout(() => setCopyFeedback(null), 3000);
  };

  // Filter and Sort Items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase();
        const matchName = item.name.toLowerCase().includes(q);
        const matchCat = (GROCERY_CATEGORY_METADATA[item.category]?.label || '').toLowerCase().includes(q);
        const matchAddedBy = (item.addedBy || '').toLowerCase().includes(q);
        if (!matchName && !matchCat && !matchAddedBy) return false;
      }

      if (selectedCategoryFilter !== 'all' && item.category !== selectedCategoryFilter) {
        return false;
      }

      if (statusFilter === 'needed' && item.acquired) return false;
      if (statusFilter === 'acquired' && !item.acquired) return false;

      return true;
    });
  }, [items, searchQuery, selectedCategoryFilter, statusFilter]);

  const sortedItems = useMemo(() => {
    const list = [...filteredItems];
    if (sortBy === 'name') {
      return list.sort((a, b) => a.name.localeCompare(b.name));
    }
    if (sortBy === 'status') {
      // Unacquired first
      return list.sort((a, b) => (a.acquired === b.acquired ? 0 : a.acquired ? 1 : -1));
    }
    if (sortBy === 'date') {
      return list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    }
    // Default category aisle order
    return list.sort((a, b) => {
      const idxA = GROCERY_CATEGORY_ORDER.indexOf(a.category);
      const idxB = GROCERY_CATEGORY_ORDER.indexOf(b.category);
      if (idxA !== idxB) return idxA - idxB;
      return a.name.localeCompare(b.name);
    });
  }, [filteredItems, sortBy]);

  const groupedCategoryItems = useMemo(() => {
    return groupGroceryItemsByCategory(sortedItems);
  }, [sortedItems]);

  const totalAcquiredCount = items.filter((i) => i.acquired).length;
  const totalNeededCount = items.filter((i) => !i.acquired).length;
  const progressPercent = items.length > 0 ? Math.round((totalAcquiredCount / items.length) * 100) : 0;

  if (!isOpen) return null;

  return (
    <div
      id="weekly-grocery-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/80 backdrop-blur-md transition-opacity duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          sound.playTap();
          onClose();
        }
      }}
    >
      <div
        id="weekly-grocery-modal"
        className="w-full max-w-5xl bg-slate-50 dark:bg-slate-900 rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl border-4 border-emerald-300 dark:border-emerald-700 flex flex-col max-h-[95vh] sm:max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-98 duration-200"
      >
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-indigo-900 text-white p-4 sm:p-6 border-b-4 border-emerald-400 shrink-0">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-emerald-400 text-slate-950 flex items-center justify-center text-2xl sm:text-3xl font-black shadow-lg transform -rotate-3 border-2 border-emerald-200 shrink-0">
                🛒
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider bg-emerald-500/80 text-white px-2.5 sm:px-3 py-0.5 rounded-full border border-emerald-300">
                    Automated Task List
                  </span>
                  {depletedStaples.length > 0 && (
                    <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider bg-amber-400 text-slate-950 px-2.5 sm:px-3 py-0.5 rounded-full shadow-xs animate-pulse">
                      ⚠️ {depletedStaples.length} Staples Need Replenish
                    </span>
                  )}
                </div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-yellow-300 italic mt-0.5 truncate">
                  Weekly Family Grocery List
                </h2>
                <p className="text-xs sm:text-sm text-emerald-100 font-bold hidden sm:block">
                  Smart checklist • Pantry replenishment tracking • Dinner menu ingredient sync
                </p>
              </div>
            </div>

            <button
              id="btn-close-grocery-modal"
              onClick={() => {
                sound.playTap();
                onClose();
              }}
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-all cursor-pointer active:scale-95 border border-white/30 shrink-0"
              title="Close Grocery List"
            >
              <X className="w-6 h-6 stroke-[3]" />
            </button>
          </div>

          {/* Progress Bar & Acquired Stats */}
          <div className="mt-4 bg-emerald-950/60 p-3 sm:p-3.5 rounded-2xl border border-emerald-500/40 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="w-full sm:w-1/2">
              <div className="flex justify-between items-center text-xs font-black mb-1.5">
                <span className="text-emerald-200">
                  Acquired: <strong className="text-white">{totalAcquiredCount}</strong> / {items.length} items
                </span>
                <span className="text-yellow-300 font-extrabold">{progressPercent}% complete</span>
              </div>
              <div className="w-full h-2.5 bg-emerald-900/80 rounded-full overflow-hidden border border-emerald-600/50">
                <div
                  className="h-full bg-gradient-to-r from-yellow-300 to-emerald-400 transition-all duration-300 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Quick Actions in Header */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
              {depletedStaples.length > 0 && (
                <button
                  id="btn-import-replenish-header"
                  onClick={handleImportReplenishments}
                  className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer transition-all border border-amber-200"
                  title="Import items marked as used up"
                >
                  <Package className="w-3.5 h-3.5" />
                  <span>Import Replenish ({depletedStaples.length})</span>
                </button>
              )}

              <button
                id="btn-start-new-week-grocery"
                onClick={() => {
                  sound.playTap();
                  setShowStartNewWeekConfirm(true);
                }}
                className="px-3 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-white font-black text-xs flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer transition-all border border-teal-300"
                title="Start a new weekly grocery list"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Start New Week</span>
              </button>

              <button
                id="btn-print-grocery"
                onClick={() => {
                  sound.playTap();
                  setShowPrintModal(true);
                }}
                className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs flex items-center gap-1 cursor-pointer transition-all border border-white/20"
                title="Print or Export Checklist"
              >
                <Printer className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Print / Share</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation Navigation */}
        <div className="flex border-b-2 border-emerald-200 dark:border-slate-800 bg-emerald-50/80 dark:bg-slate-850 px-3 sm:px-6 pt-2 gap-2 overflow-x-auto scrollbar-none shrink-0">
          <button
            id="tab-grocery-list"
            onClick={() => {
              sound.playTap();
              setActiveTab('list');
            }}
            className={`flex items-center gap-2 px-4 py-3 font-black text-xs sm:text-sm border-b-4 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'list'
                ? 'border-emerald-600 text-emerald-900 dark:text-emerald-300 bg-white dark:bg-slate-900 rounded-t-2xl shadow-xs'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <ShoppingCart className="w-4 h-4 text-emerald-600" />
            <span>Active Grocery List</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-200 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300">
              {totalNeededCount} needed
            </span>
          </button>

          <button
            id="tab-pantry-staples"
            onClick={() => {
              sound.playTap();
              setActiveTab('pantry');
            }}
            className={`flex items-center gap-2 px-4 py-3 font-black text-xs sm:text-sm border-b-4 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'pantry'
                ? 'border-amber-500 text-amber-950 dark:text-amber-300 bg-white dark:bg-slate-900 rounded-t-2xl shadow-xs'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Package className="w-4 h-4 text-amber-600" />
            <span>Pantry & Replenish Tracker</span>
            {depletedStaples.length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-slate-950 animate-pulse">
                {depletedStaples.length} depleted
              </span>
            )}
          </button>

          <button
            id="tab-dinner-menu-sync"
            onClick={() => {
              sound.playTap();
              setActiveTab('menu_sync');
            }}
            className={`flex items-center gap-2 px-4 py-3 font-black text-xs sm:text-sm border-b-4 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'menu_sync'
                ? 'border-indigo-600 text-indigo-950 dark:text-indigo-300 bg-white dark:bg-slate-900 rounded-t-2xl shadow-xs'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <UtensilsCrossed className="w-4 h-4 text-indigo-600" />
            <span>Dinner Menu Ingredients</span>
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-4">
          {/* TAB 1: ACTIVE GROCERY TASK LIST */}
          {activeTab === 'list' && (
            <div className="space-y-4">
              {/* Quick Add Bar with Smart Auto-Categorization */}
              <form
                onSubmit={handleAddItem}
                className="p-3 sm:p-4 rounded-2xl bg-white dark:bg-slate-800 border-2 border-emerald-300 dark:border-slate-700 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="text-xs font-black text-emerald-800 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Plus className="w-4 h-4" />
                    <span>Quick Add Grocery Item (Auto-Categorized)</span>
                  </div>
                  <div className="text-[11px] font-bold text-slate-500">
                    Adding as: <strong className="text-slate-900 dark:text-slate-200">{newItemAddedBy}</strong>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-2.5">
                  <div className="flex-1 relative">
                    <input
                      id="input-grocery-item-name"
                      type="text"
                      value={newItemName}
                      onChange={(e) => setNewItemName(e.target.value)}
                      placeholder="e.g. Honeycrisp Apples, Milk, Ground Turkey, Sourdough Bread..."
                      className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-300 bg-white font-black text-slate-900 placeholder:text-slate-400 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                    />
                  </div>

                  <div className="w-full md:w-36">
                    <input
                      id="input-grocery-item-qty"
                      type="text"
                      value={newItemQuantity}
                      onChange={(e) => setNewItemQuantity(e.target.value)}
                      placeholder="Qty: e.g. 2 bags, 1 lb"
                      className="w-full px-3 py-2.5 rounded-xl border-2 border-slate-300 bg-white font-bold text-slate-900 placeholder:text-slate-400 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                    />
                  </div>

                  <div className="w-full md:w-48">
                    <select
                      id="select-grocery-category"
                      value={newItemCategory}
                      onChange={(e) => {
                        setNewItemCategory(e.target.value as GroceryCategory);
                        setUserManuallySelectedCategory(true);
                      }}
                      className="w-full px-3 py-2.5 rounded-xl border-2 border-slate-300 bg-white font-bold text-slate-900 text-xs sm:text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                    >
                      {GROCERY_CATEGORY_ORDER.map((cat) => (
                        <option key={cat} value={cat}>
                          {GROCERY_CATEGORY_METADATA[cat].icon} {GROCERY_CATEGORY_METADATA[cat].shortLabel}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    id="btn-submit-grocery-item"
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm flex items-center justify-center gap-1.5 shadow-md active:scale-95 cursor-pointer transition-all shrink-0"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                    <span>Add Item</span>
                  </button>
                </div>
              </form>

              {/* Filters, Grouping, & Search Controls */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                {/* Search Bar */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="input-search-groceries"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search grocery items..."
                    className="w-full pl-9 pr-3.5 py-1.5 rounded-xl border border-slate-300 bg-white font-bold text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-emerald-500"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Status & Sorting Controls */}
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Status Filter */}
                  <div className="flex rounded-xl bg-slate-200 dark:bg-slate-700 p-0.5 text-xs font-bold">
                    <button
                      onClick={() => setStatusFilter('all')}
                      className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                        statusFilter === 'all' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs font-black' : 'text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      All ({items.length})
                    </button>
                    <button
                      onClick={() => setStatusFilter('needed')}
                      className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                        statusFilter === 'needed' ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-2xs font-black' : 'text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      Needed ({totalNeededCount})
                    </button>
                    <button
                      onClick={() => setStatusFilter('acquired')}
                      className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                        statusFilter === 'acquired' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs font-black' : 'text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      Acquired ({totalAcquiredCount})
                    </button>
                  </div>

                  {/* Group By Aisle Toggle */}
                  <button
                    onClick={() => {
                      sound.playTap();
                      setGroupByCategory((prev) => !prev);
                    }}
                    className={`px-2.5 py-1.5 rounded-xl border text-xs font-black flex items-center gap-1 cursor-pointer transition-all ${
                      groupByCategory
                        ? 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-300'
                    }`}
                    title="Group items by grocery department/aisle"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>{groupByCategory ? 'By Aisle' : 'Flat List'}</span>
                  </button>

                  {/* Clear Acquired */}
                  {totalAcquiredCount > 0 && (
                    <button
                      onClick={handleClearAcquired}
                      className="px-2.5 py-1.5 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-900 border border-rose-300 text-xs font-bold flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                      title="Remove acquired items from list"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Clear Acquired ({totalAcquiredCount})</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Department / Category Quick Filter Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                <button
                  onClick={() => setSelectedCategoryFilter('all')}
                  className={`px-3 py-1 rounded-xl text-xs font-black whitespace-nowrap cursor-pointer transition-all border ${
                    selectedCategoryFilter === 'all'
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                  }`}
                >
                  All Aisles
                </button>
                {GROCERY_CATEGORY_ORDER.map((cat) => {
                  const meta = GROCERY_CATEGORY_METADATA[cat];
                  const count = items.filter((i) => i.category === cat).length;
                  if (count === 0 && selectedCategoryFilter !== cat) return null;
                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategoryFilter(cat)}
                      className={`px-2.5 py-1 rounded-xl text-xs font-black whitespace-nowrap cursor-pointer transition-all border flex items-center gap-1 ${
                        selectedCategoryFilter === cat
                          ? `${meta.badgeBg} font-black shadow-xs`
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span>{meta.icon}</span>
                      <span>{meta.shortLabel}</span>
                      {count > 0 && <span className="opacity-70 text-[10px]">({count})</span>}
                    </button>
                  );
                })}
              </div>

              {/* Grocery Items List */}
              {filteredItems.length === 0 ? (
                <div className="p-8 sm:p-12 text-center bg-white dark:bg-slate-800 rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-700 space-y-3">
                  <div className="text-4xl">🛒</div>
                  <h3 className="text-base font-black text-slate-800 dark:text-slate-200">
                    No grocery items found
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                    {searchQuery
                      ? `No items match "${searchQuery}". Clear your search query to see all items.`
                      : 'Your grocery list is currently empty! Add items above, or 1-click import depleted pantry items and dinner recipes.'}
                  </p>
                  <div className="flex items-center justify-center gap-2 pt-2 flex-wrap">
                    {depletedStaples.length > 0 && (
                      <button
                        onClick={handleImportReplenishments}
                        className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
                      >
                        <Package className="w-4 h-4" />
                        <span>Import Depleted Pantry Items ({depletedStaples.length})</span>
                      </button>
                    )}
                    <button
                      onClick={handleImportDinnerMenu}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
                    >
                      <UtensilsCrossed className="w-4 h-4" />
                      <span>Import from Dinner Menu</span>
                    </button>
                  </div>
                </div>
              ) : groupByCategory ? (
                /* Grouped by Category View */
                <div className="space-y-4">
                  {GROCERY_CATEGORY_ORDER.map((cat) => {
                    const catItems = groupedCategoryItems[cat] || [];
                    if (catItems.length === 0) return null;
                    const meta = GROCERY_CATEGORY_METADATA[cat];
                    const catNeeded = catItems.filter((i) => !i.acquired).length;

                    return (
                      <div
                        key={cat}
                        className="rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 shadow-xs overflow-hidden"
                      >
                        {/* Category Aisle Header */}
                        <div className="p-3 px-4 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{meta.icon}</span>
                            <span className="font-black text-slate-900 dark:text-slate-100 text-xs sm:text-sm">
                              {meta.label}
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                              {catNeeded > 0 ? `${catNeeded} needed` : 'All acquired!'}
                            </span>
                          </div>
                        </div>

                        {/* Category Items Table */}
                        <div className="divide-y divide-slate-100 dark:divide-slate-700/60">
                          {catItems.map((item) => (
                            <GroceryItemRow
                              key={item.id}
                              item={item}
                              onToggleAcquired={handleToggleAcquired}
                              onDeleteItem={handleDeleteItem}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Flat List View */
                <div className="rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 shadow-xs divide-y divide-slate-100 dark:divide-slate-700/60 overflow-hidden">
                  {sortedItems.map((item) => (
                    <GroceryItemRow
                      key={item.id}
                      item={item}
                      onToggleAcquired={handleToggleAcquired}
                      onDeleteItem={handleDeleteItem}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PANTRY & REPLENISH TRACKER */}
          {activeTab === 'pantry' && (
            <div className="space-y-4">
              {/* Replenish Explanation Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20 border-2 border-amber-300 dark:border-amber-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center text-2xl shadow-xs shrink-0">
                    ⚠️
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-amber-950 dark:text-amber-200">
                      Pantry Depletion & Replenish Tracker
                    </h3>
                    <p className="text-xs text-amber-800 dark:text-amber-300 font-medium">
                      Mark household staples as "Used Up" when you finish them. They automatically queue to be imported into your weekly shopping trip!
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
                  {depletedStaples.length > 0 && (
                    <button
                      onClick={handleImportReplenishments}
                      className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer"
                    >
                      <Package className="w-4 h-4" />
                      <span>Import Depleted Items ({depletedStaples.length})</span>
                    </button>
                  )}
                  <button
                    onClick={() => {
                      sound.playTap();
                      setIsAddingStapleOpen((prev) => !prev);
                    }}
                    className="px-3 py-2 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-300 dark:border-slate-600 hover:bg-slate-100 font-bold text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Custom Staple</span>
                  </button>
                </div>
              </div>

              {/* Add Custom Staple Form (Collapsible) */}
              {isAddingStapleOpen && (
                <form
                  onSubmit={handleAddCustomStaple}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-800 border-2 border-dashed border-amber-400 dark:border-amber-600 space-y-3 animate-in fade-in duration-150"
                >
                  <div className="font-black text-xs text-amber-900 dark:text-amber-300 uppercase tracking-wider">
                    Add New Household Staple to Track
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                    <div className="sm:col-span-2">
                      <input
                        type="text"
                        value={newStapleName}
                        onChange={(e) => setNewStapleName(e.target.value)}
                        placeholder="Staple name (e.g. Greek Yogurt, Coffee Pods, Paper Napkins)..."
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-bold text-xs text-slate-900 focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                        autoFocus
                      />
                    </div>
                    <div>
                      <select
                        value={newStapleCategory}
                        onChange={(e) => setNewStapleCategory(e.target.value as GroceryCategory)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-bold text-xs text-slate-900"
                      >
                        {GROCERY_CATEGORY_ORDER.map((cat) => (
                          <option key={cat} value={cat}>
                            {GROCERY_CATEGORY_METADATA[cat].icon} {GROCERY_CATEGORY_METADATA[cat].shortLabel}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newStapleQuantity}
                        onChange={(e) => setNewStapleQuantity(e.target.value)}
                        placeholder="Default Qty"
                        className="w-full px-2.5 py-2 rounded-xl border border-slate-300 bg-white font-bold text-xs text-slate-900"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shrink-0 cursor-pointer shadow-xs"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* Grid of Pantry Staples */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {pantryStaples.map((staple) => {
                  const meta = GROCERY_CATEGORY_METADATA[staple.category] || GROCERY_CATEGORY_METADATA.other;
                  const isInActiveList = items.some(
                    (i) => i.name.toLowerCase().trim() === staple.name.toLowerCase().trim()
                  );

                  return (
                    <div
                      key={staple.id}
                      className={`p-3.5 rounded-2xl border-2 transition-all flex flex-col justify-between gap-3 shadow-xs ${
                        staple.isDepleted
                          ? 'bg-amber-50/90 dark:bg-amber-950/40 border-amber-400 dark:border-amber-600 ring-2 ring-amber-400/40'
                          : 'bg-white dark:bg-slate-800/90 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xl shrink-0 shadow-2xs">
                            {staple.icon || meta.icon}
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-slate-100 truncate">
                              {staple.name}
                            </h4>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className={`px-2 py-0.2 rounded-md text-[10px] font-extrabold border ${meta.badgeBg}`}>
                                {meta.shortLabel}
                              </span>
                              {staple.defaultQuantity && (
                                <span className="text-[10px] font-bold text-slate-500">
                                  {staple.defaultQuantity}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {staple.id.startsWith('staple-custom-') && (
                          <button
                            onClick={() => {
                              sound.playTap();
                              handleUpdateGroceryList({
                                ...groceryList,
                                pantryStaples: pantryStaples.filter((s) => s.id !== staple.id),
                              });
                            }}
                            className="text-slate-400 hover:text-rose-500 p-1"
                            title="Delete custom staple"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Depleted Reporter Note if empty */}
                      {staple.isDepleted && staple.depletedBy && (
                        <div className="text-[11px] font-bold text-amber-800 dark:text-amber-300 bg-amber-100/80 dark:bg-amber-900/50 px-2.5 py-1 rounded-lg border border-amber-300/60 flex items-center gap-1">
                          <span>⚠️ Reported by {staple.depletedBy}</span>
                          {staple.notes && <span className="opacity-80 truncate">({staple.notes})</span>}
                        </div>
                      )}

                      {/* Action Toggle Button */}
                      <div className="flex items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-700/60">
                        <button
                          onClick={() => handleTogglePantryDepletion(staple.id)}
                          className={`flex-1 py-2 px-3 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs active:scale-95 ${
                            staple.isDepleted
                              ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 font-black ring-1 ring-amber-300'
                              : 'bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                          }`}
                        >
                          {staple.isDepleted ? (
                            <>
                              <AlertTriangle className="w-3.5 h-3.5" />
                              <span>Used Up (Needs Replenish)</span>
                            </>
                          ) : (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>In Stock & Full</span>
                            </>
                          )}
                        </button>

                        {staple.isDepleted && !isInActiveList && (
                          <button
                            onClick={() => {
                              sound.playChoreComplete();
                              const { updatedList } = importDepletedItemsToGroceryList(groceryList, [staple]);
                              handleUpdateGroceryList(updatedList);
                              showToast(`Added "${staple.name}" to active grocery list!`);
                            }}
                            className="px-2.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shadow-2xs active:scale-95 cursor-pointer shrink-0"
                            title="Add directly to this week's grocery list"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: DINNER MENU INGREDIENTS SYNC */}
          {activeTab === 'menu_sync' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border-2 border-indigo-200 dark:border-indigo-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-yellow-300 flex items-center justify-center text-2xl shadow-xs shrink-0">
                    🍽️
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-indigo-950 dark:text-indigo-200">
                      Sync from Weekly Dinner Menu
                    </h3>
                    <p className="text-xs text-indigo-800 dark:text-indigo-300 font-medium">
                      One-click scan and import recipes and ingredients planned for this week's dinners into your grocery checklist.
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleImportDinnerMenu}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs flex items-center gap-2 shadow-md active:scale-95 cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>Import All 7 Days' Ingredients</span>
                </button>
              </div>

              {/* Days of Week Recipes Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {DAYS_OF_WEEK_ORDER.map((dayKey) => {
                  const meta = DAY_METADATA[dayKey];
                  const plan = database.weeklyMenu?.days?.[dayKey];
                  const hasDish = plan && plan.mainDish && plan.mainDish.trim().length > 0;
                  const recipe = plan?.recipe;

                  return (
                    <div
                      key={dayKey}
                      className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col justify-between space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{meta.emoji}</span>
                          <div>
                            <div className="text-xs font-black uppercase text-indigo-600 dark:text-indigo-400">
                              {meta.label}
                            </div>
                            <div className="text-sm font-black text-slate-900 dark:text-slate-100">
                              {hasDish ? plan.mainDish : 'No meal planned yet'}
                            </div>
                          </div>
                        </div>

                        {hasDish && (
                          <button
                            onClick={() => {
                              sound.playChoreComplete();
                              const newItems: GroceryItem[] = [];
                              if (recipe && recipe.ingredients && recipe.ingredients.length > 0) {
                                recipe.ingredients.forEach((raw) => {
                                  newItems.push({
                                    id: `g-menu-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                                    name: raw.replace(/^[-•*]\s*/, ''),
                                    category: detectGroceryCategory(raw),
                                    acquired: false,
                                    addedBy: `${meta.label}: ${plan.mainDish}`,
                                    sourceMealDay: dayKey,
                                    createdAt: getTodayDateString(),
                                  });
                                });
                              } else {
                                newItems.push({
                                  id: `g-menu-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                                  name: plan.mainDish,
                                  category: detectGroceryCategory(plan.mainDish),
                                  acquired: false,
                                  addedBy: `${meta.label} Dinner`,
                                  sourceMealDay: dayKey,
                                  createdAt: getTodayDateString(),
                                });
                              }

                              const updated = {
                                ...groceryList,
                                items: [...items, ...newItems],
                                lastUpdated: new Date().toISOString(),
                              };
                              handleUpdateGroceryList(updated);
                              showToast(`Added ingredients for ${meta.label} (${plan.mainDish})!`);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-950 text-indigo-900 dark:text-indigo-200 border border-indigo-300 dark:border-indigo-800 text-xs font-black flex items-center gap-1 cursor-pointer active:scale-95 transition-all shrink-0"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add Meal</span>
                          </button>
                        )}
                      </div>

                      {/* Ingredients List */}
                      {recipe && recipe.ingredients && recipe.ingredients.length > 0 ? (
                        <div className="bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700/60 text-xs text-slate-700 dark:text-slate-300 space-y-1">
                          <div className="font-extrabold text-[11px] text-slate-500 uppercase">
                            Recipe Ingredients ({recipe.ingredients.length}):
                          </div>
                          <ul className="list-disc list-inside space-y-0.5 font-medium">
                            {recipe.ingredients.slice(0, 4).map((ing, idx) => (
                              <li key={idx} className="truncate">
                                {ing}
                              </li>
                            ))}
                            {recipe.ingredients.length > 4 && (
                              <li className="text-slate-400 font-bold">
                                + {recipe.ingredients.length - 4} more ingredients
                              </li>
                            )}
                          </ul>
                        </div>
                      ) : (
                        <div className="text-[11px] text-slate-400 italic">
                          {hasDish ? 'Main dish item only (no custom recipe attached)' : 'Configure dinner in Weekly Dinner Menu'}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 bg-white dark:bg-slate-900 border-t-2 border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="text-xs font-bold text-slate-500">
            <span>List contains <strong>{items.length} items</strong></span>
            <span className="opacity-40 mx-2">•</span>
            <span>{totalNeededCount} remaining</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                sound.playTap();
                onClose();
              }}
              className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs sm:text-sm cursor-pointer shadow-sm active:scale-95"
            >
              Done / Close
            </button>
          </div>
        </div>
      </div>

      {/* START NEW WEEK CONFIRMATION DIALOG (Per User Requirement) */}
      {showStartNewWeekConfirm && (
        <div
          id="modal-start-new-week-confirm"
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150"
        >
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-2xl border-4 border-teal-400 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 flex items-center justify-center text-2xl font-black shrink-0">
                🔄
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-100">
                  Start New Weekly Grocery List?
                </h3>
                <p className="text-xs text-slate-500 font-bold">
                  Reset your grocery task list for the upcoming week.
                </p>
              </div>
            </div>

            {/* Replenishment Prompt Box */}
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-300 dark:border-amber-800 space-y-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <h4 className="text-xs sm:text-sm font-black text-amber-950 dark:text-amber-200">
                  Import Depleted Pantry Items?
                </h4>
              </div>

              {depletedStaples.length > 0 ? (
                <div>
                  <p className="text-xs text-amber-900 dark:text-amber-300 font-medium mb-2">
                    The following <strong>{depletedStaples.length} items</strong> were marked as used up in your pantry:
                  </p>
                  <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                    {depletedStaples.map((s) => (
                      <span
                        key={s.id}
                        className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-amber-300 dark:border-amber-700 text-xs font-bold flex items-center gap-1 shadow-2xs"
                      >
                        <span>{s.icon || '🥫'}</span>
                        <span>{s.name}</span>
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-amber-900 dark:text-amber-300 font-medium">
                  No pantry items are currently marked as depleted.
                </p>
              )}

              {/* Dinner Menu Auto-Import Checkbox */}
              <label className="flex items-center gap-2 pt-2 border-t border-amber-200 dark:border-amber-800/60 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeDinnerMenuInNewWeek}
                  onChange={(e) => setIncludeDinnerMenuInNewWeek(e.target.checked)}
                  className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500"
                />
                <span className="text-xs font-black text-amber-950 dark:text-amber-100">
                  Also auto-import ingredients from this week's Dinner Menu (7 meals)
                </span>
              </label>
            </div>

            {/* Action Response Buttons */}
            <div className="space-y-2 pt-2">
              <button
                id="btn-confirm-start-with-replenish"
                onClick={() => handleConfirmStartNewWeek(true)}
                className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm flex items-center justify-center gap-2 shadow-md active:scale-95 cursor-pointer transition-all"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Yes, Include Replenished Items & Start</span>
              </button>

              <button
                id="btn-confirm-start-blank"
                onClick={() => handleConfirmStartNewWeek(false)}
                className="w-full py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <span>No, Start With a Blank List</span>
              </button>

              <button
                onClick={() => setShowStartNewWeekConfirm(false)}
                className="w-full py-2 text-center text-xs font-bold text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRINT / SHARE MODAL */}
      {showPrintModal && (
        <div
          id="modal-print-grocery"
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150"
        >
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-2xl border-2 border-slate-300 dark:border-slate-700 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-emerald-600" />
                <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">
                  Print or Share Grocery Checklist
                </h3>
              </div>
              <button
                onClick={() => setShowPrintModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-850 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 font-mono text-xs text-slate-800 dark:text-slate-200 space-y-3 whitespace-pre-wrap select-all">
              {`🛒 FAMILY GROCERY LIST (${items.length} items)\n\n` +
                GROCERY_CATEGORY_ORDER.map((cat) => {
                  const catItems = items.filter((i) => i.category === cat);
                  if (catItems.length === 0) return '';
                  const meta = GROCERY_CATEGORY_METADATA[cat];
                  return (
                    `=== ${meta.icon} ${meta.label.toUpperCase()} ===\n` +
                    catItems
                      .map((i) => `[${i.acquired ? 'X' : ' '}] ${i.name}${i.quantity ? ` (${i.quantity})` : ''}`)
                      .join('\n') +
                    '\n\n'
                  );
                })
                  .filter(Boolean)
                  .join('')}
            </div>

            {copyFeedback && (
              <div className="text-xs font-black text-emerald-700 bg-emerald-100 p-2 rounded-xl text-center">
                {copyFeedback}
              </div>
            )}

            <div className="flex items-center gap-2 pt-2 shrink-0">
              <button
                onClick={handleCopyShoppingList}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-95"
              >
                <Copy className="w-4 h-4" />
                <span>Copy Checklist to Clipboard</span>
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center gap-1 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Instant Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-70 px-5 py-3 rounded-2xl bg-slate-900 text-white font-black text-xs sm:text-sm shadow-2xl border-2 border-emerald-400 flex items-center gap-2 animate-in slide-in-from-bottom-4 fade-in duration-200">
          <span>✨</span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

interface GroceryItemRowProps {
  item: GroceryItem;
  onToggleAcquired: (id: string) => void;
  onDeleteItem: (id: string) => void;
}

const GroceryItemRow: React.FC<GroceryItemRowProps> = ({
  item,
  onToggleAcquired,
  onDeleteItem,
}) => {
  const meta = GROCERY_CATEGORY_METADATA[item.category] || GROCERY_CATEGORY_METADATA.other;

  return (
    <div
      className={`p-3 sm:px-4 flex items-center justify-between gap-3 transition-colors ${
        item.acquired
          ? 'bg-slate-50/70 dark:bg-slate-900/40 opacity-60'
          : 'hover:bg-slate-50/90 dark:hover:bg-slate-750'
      }`}
    >
      {/* Checkbox & Name */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <button
          onClick={() => onToggleAcquired(item.id)}
          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl border-2 flex items-center justify-center transition-all cursor-pointer shrink-0 active:scale-90 ${
            item.acquired
              ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
              : 'border-slate-300 dark:border-slate-600 hover:border-emerald-500 bg-white dark:bg-slate-800'
          }`}
          title={item.acquired ? 'Mark as needed' : 'Mark as acquired'}
        >
          {item.acquired ? <Check className="w-4 h-4 stroke-[3]" /> : null}
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`text-xs sm:text-sm font-black transition-all ${
                item.acquired
                  ? 'line-through text-slate-400 dark:text-slate-500'
                  : 'text-slate-900 dark:text-slate-100'
              }`}
            >
              {item.name}
            </span>

            {item.quantity && (
              <span className="px-2 py-0.2 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-extrabold text-[11px]">
                {item.quantity}
              </span>
            )}

            {item.isReplenishItem && (
              <span className="px-2 py-0.2 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-black">
                ⚠️ Replenish
              </span>
            )}
          </div>

          {/* Subtext info */}
          <div className="flex items-center gap-2 text-[10px] text-slate-400 font-semibold mt-0.5">
            <span className={`font-bold ${meta.badgeText}`}>{meta.shortLabel}</span>
            {item.addedBy && (
              <>
                <span>•</span>
                <span className="truncate">Added by {item.addedBy}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Delete Item Action */}
      <button
        onClick={() => onDeleteItem(item.id)}
        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors cursor-pointer shrink-0"
        title="Delete item"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
};
