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
  Clock,
  Heart,
  Star,
  Sparkle,
  Tag,
  ShieldCheck,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  FlameKindling,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  FamilyDatabase,
  KidProfile,
  GroceryCategory,
  GroceryImportance,
  GroceryItem,
  PantryStapleItem,
  SpiceItem,
  GroceryRequest,
  WeeklyGroceryList,
  DayOfWeekKey,
} from '../types';
import {
  GROCERY_CATEGORY_ORDER,
  GROCERY_CATEGORY_METADATA,
  GROCERY_IMPORTANCE_METADATA,
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
  const [activeTab, setActiveTab] = useState<'list' | 'pantry' | 'spices' | 'requests' | 'menu_sync'>('list');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [pantrySearchQuery, setPantrySearchQuery] = useState<string>('');
  const [spiceSearchQuery, setSpiceSearchQuery] = useState<string>('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<GroceryCategory | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'needed' | 'acquired'>('all');
  const [groupByCategory, setGroupByCategory] = useState<boolean>(true);
  const [sortBy, setSortBy] = useState<'category' | 'name' | 'status' | 'importance'>('category');

  // Quick Add Item State (Active List)
  const [newItemName, setNewItemName] = useState<string>('');
  const [newItemQuantity, setNewItemQuantity] = useState<string>('');
  const [newItemCategory, setNewItemCategory] = useState<GroceryCategory>('produce');
  const [newItemImportance, setNewItemImportance] = useState<GroceryImportance>('common');
  const [newItemAddedBy, setNewItemAddedBy] = useState<string>(
    activeKid ? `${activeKid.name} ${activeKid.avatar}` : isParentMode ? 'Mom & Dad' : 'Family'
  );
  const [userManuallySelectedCategory, setUserManuallySelectedCategory] = useState<boolean>(false);

  // New Pantry Item State
  const [newPantryName, setNewPantryName] = useState<string>('');
  const [newPantryCategory, setNewPantryCategory] = useState<GroceryCategory>('pantry');
  const [newPantryQuantity, setNewPantryQuantity] = useState<string>('1');
  const [newPantryImportance, setNewPantryImportance] = useState<GroceryImportance>('staple');
  const [isAddingPantryOpen, setIsAddingPantryOpen] = useState<boolean>(false);

  // New Spice Item State
  const [newSpiceName, setNewSpiceName] = useState<string>('');
  const [newSpiceCategory, setNewSpiceCategory] = useState<'herb' | 'spice' | 'blend' | 'salt_pepper' | 'baking'>('spice');
  const [newSpiceNotes, setNewSpiceNotes] = useState<string>('');
  const [isAddingSpiceOpen, setIsAddingSpiceOpen] = useState<boolean>(false);

  // Kid Request Item State
  const [kidReqName, setKidReqName] = useState<string>('');
  const [kidReqQty, setKidReqQty] = useState<string>('1');
  const [kidReqImportance, setKidReqImportance] = useState<GroceryImportance>('treat');
  const [kidReqCategory, setKidReqCategory] = useState<GroceryCategory>('snacks');
  const [kidReqNotes, setKidReqNotes] = useState<string>('');
  const [isAddingKidReqOpen, setIsAddingKidReqOpen] = useState<boolean>(false);

  // Admin Request Deny State
  const [denyingRequestId, setDenyingRequestId] = useState<string | null>(null);
  const [denyReason, setDenyReason] = useState<string>('');

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
  const pantryStaples: PantryStapleItem[] = groceryList.pantryStaples || [];
  const spices: SpiceItem[] = groceryList.spices || [];
  const requests: GroceryRequest[] = groceryList.requests || [];

  const pendingRequests = useMemo(() => {
    return requests.filter((r) => r.status === 'pending');
  }, [requests]);

  // Unified Pantry Items: All household groceries (items + staples)
  const allHouseholdGroceries = useMemo(() => {
    const list: {
      id: string;
      name: string;
      category: GroceryCategory;
      quantity?: string;
      importance: GroceryImportance;
      isDepleted: boolean;
      depletedAt?: string;
      depletedBy?: string;
      notes?: string;
      isStapleOnly?: boolean;
    }[] = [];

    const seenNames = new Set<string>();

    // 1. Process active grocery items
    items.forEach((item) => {
      const key = item.name.toLowerCase().trim();
      if (!seenNames.has(key)) {
        seenNames.add(key);
        list.push({
          id: item.id,
          name: item.name,
          category: item.category,
          quantity: item.quantity,
          importance: item.importance || 'common',
          isDepleted: item.isDepleted || false,
          depletedAt: item.depletedAt,
          depletedBy: item.depletedBy,
          notes: item.notes,
          isStapleOnly: false,
        });
      }
    });

    // 2. Process pantry staples
    pantryStaples.forEach((staple) => {
      const key = staple.name.toLowerCase().trim();
      if (!seenNames.has(key)) {
        seenNames.add(key);
        list.push({
          id: staple.id,
          name: staple.name,
          category: staple.category,
          quantity: staple.defaultQuantity,
          importance: staple.importance || 'staple',
          isDepleted: staple.isDepleted || false,
          depletedAt: staple.depletedAt,
          depletedBy: staple.depletedBy,
          notes: staple.notes,
          isStapleOnly: true,
        });
      }
    });

    return list;
  }, [items, pantryStaples]);

  const depletedItems = useMemo(() => {
    return getPantryDepletedItems(groceryList);
  }, [groceryList]);

  // Filtered Pantry Items with real-time search
  const filteredPantryGroceries = useMemo(() => {
    return allHouseholdGroceries.filter((item) => {
      if (!pantrySearchQuery.trim()) return true;
      const q = pantrySearchQuery.toLowerCase();
      const matchName = item.name.toLowerCase().includes(q);
      const matchCat = (GROCERY_CATEGORY_METADATA[item.category]?.label || '').toLowerCase().includes(q);
      const matchImp = item.importance.toLowerCase().includes(q);
      return matchName || matchCat || matchImp;
    });
  }, [allHouseholdGroceries, pantrySearchQuery]);

  // Filtered Spices with real-time search
  const filteredSpices = useMemo(() => {
    return spices.filter((spice) => {
      if (!spiceSearchQuery.trim()) return true;
      const q = spiceSearchQuery.toLowerCase();
      const matchName = spice.name.toLowerCase().includes(q);
      const matchCat = (spice.category || '').toLowerCase().includes(q);
      return matchName || matchCat;
    });
  }, [spices, spiceSearchQuery]);

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

  // 2. Add New Grocery Item (Active List)
  const handleAddItem = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newItemName.trim()) return;

    sound.playChoreComplete();
    const newItem: GroceryItem = {
      id: `g-item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: newItemName.trim(),
      category: newItemCategory,
      quantity: newItemQuantity.trim() || undefined,
      importance: newItemImportance,
      acquired: false,
      isDepleted: false,
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

  // 3. Delete Grocery Item permanently
  const handleDeleteItem = (itemId: string) => {
    sound.playTap();
    const updatedList: WeeklyGroceryList = {
      ...groceryList,
      items: items.filter((i) => i.id !== itemId),
      pantryStaples: pantryStaples.filter((s) => s.id !== itemId),
      lastUpdated: new Date().toISOString(),
    };
    handleUpdateGroceryList(updatedList);
    showToast('Grocery item removed.');
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

  // 5. Toggle Household Grocery Depletion State ("Depleted / Needs Replenish")
  const handleTogglePantryDepletion = (itemId: string) => {
    sound.playTap();
    const reporterName = activeKid ? `${activeKid.name} ${activeKid.avatar}` : isParentMode ? 'Mom/Dad' : 'Family';

    let isNowDepleted = false;
    let itemName = '';

    // Check if in items
    let itemFound = false;
    const updatedItems = items.map((item) => {
      if (item.id === itemId) {
        itemFound = true;
        const nextState = !item.isDepleted;
        isNowDepleted = nextState;
        itemName = item.name;
        return {
          ...item,
          isDepleted: nextState,
          depletedAt: nextState ? getTodayDateString() : undefined,
          depletedBy: nextState ? reporterName : undefined,
        };
      }
      return item;
    });

    // Also update staples if present
    const updatedStaples = pantryStaples.map((staple) => {
      if (staple.id === itemId) {
        const nextState = !staple.isDepleted;
        isNowDepleted = nextState;
        itemName = staple.name;
        return {
          ...staple,
          isDepleted: nextState,
          depletedAt: nextState ? getTodayDateString() : undefined,
          depletedBy: nextState ? reporterName : undefined,
        };
      }
      return staple;
    });

    handleUpdateGroceryList({
      ...groceryList,
      items: itemFound ? updatedItems : items,
      pantryStaples: updatedStaples,
      lastUpdated: new Date().toISOString(),
    });

    if (isNowDepleted) {
      showToast(`Marked "${itemName}" as Depleted & Needing Replenishment! ⚠️`);
    } else {
      showToast(`Marked "${itemName}" as In Stock & Full! ✅`);
    }
  };

  // 6. Import Replenished Items into Active List
  const handleImportReplenishments = () => {
    sound.playChoreComplete();
    const { updatedList, importedCount } = importDepletedItemsToGroceryList(groceryList);
    handleUpdateGroceryList(updatedList);

    if (importedCount > 0) {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      showToast(`📥 Imported ${importedCount} depleted items into active grocery list!`);
    } else {
      showToast('All depleted items are already in your active grocery list.');
    }
  };

  // 7. Add Custom Pantry Household Grocery Item
  const handleAddCustomPantryItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPantryName.trim()) return;

    sound.playTap();
    const newGrocery: GroceryItem = {
      id: `g-pantry-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: newPantryName.trim(),
      category: newPantryCategory,
      quantity: newPantryQuantity.trim() || '1',
      importance: newPantryImportance,
      acquired: false,
      isDepleted: true, // starts depleted so user can easily replenish
      depletedAt: getTodayDateString(),
      depletedBy: activeKid ? activeKid.name : isParentMode ? 'Mom/Dad' : 'Family',
      addedBy: 'Household Pantry Catalog',
      createdAt: getTodayDateString(),
    };

    const updatedList: WeeklyGroceryList = {
      ...groceryList,
      items: [newGrocery, ...items],
      lastUpdated: new Date().toISOString(),
    };

    handleUpdateGroceryList(updatedList);
    setNewPantryName('');
    setNewPantryQuantity('1');
    setIsAddingPantryOpen(false);
    showToast(`Added "${newGrocery.name}" to household groceries!`);
  };

  // 8. Seasonings & Spices Handlers
  const handleAddSpice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSpiceName.trim()) return;

    sound.playTap();
    const newSpice: SpiceItem = {
      id: `spice-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: newSpiceName.trim(),
      category: newSpiceCategory,
      isEmpty: false,
      needsReplenish: false,
      notes: newSpiceNotes.trim() || undefined,
      addedBy: activeKid ? activeKid.name : 'Family',
      createdAt: getTodayDateString(),
    };

    const updatedList: WeeklyGroceryList = {
      ...groceryList,
      spices: [newSpice, ...spices],
      lastUpdated: new Date().toISOString(),
    };

    handleUpdateGroceryList(updatedList);
    setNewSpiceName('');
    setNewSpiceNotes('');
    setIsAddingSpiceOpen(false);
    showToast(`Added seasoning "${newSpice.name}" to spice rack! 🧂`);
  };

  const handleToggleSpiceEmpty = (spiceId: string) => {
    sound.playTap();
    let isNowEmpty = false;
    let spiceName = '';

    const updatedSpices = spices.map((s) => {
      if (s.id === spiceId) {
        const next = !s.isEmpty;
        isNowEmpty = next;
        spiceName = s.name;
        return {
          ...s,
          isEmpty: next,
          needsReplenish: next, // automatically marks as needs replenish when empty
        };
      }
      return s;
    });

    handleUpdateGroceryList({
      ...groceryList,
      spices: updatedSpices,
      lastUpdated: new Date().toISOString(),
    });

    if (isNowEmpty) {
      showToast(`Marked "${spiceName}" as Empty (Needs Replenish)! 🧂⚠️`);
    } else {
      showToast(`Restocked "${spiceName}" in spice rack! ✅`);
    }
  };

  const handleDeleteSpice = (spiceId: string) => {
    sound.playTap();
    const updatedList: WeeklyGroceryList = {
      ...groceryList,
      spices: spices.filter((s) => s.id !== spiceId),
      lastUpdated: new Date().toISOString(),
    };
    handleUpdateGroceryList(updatedList);
    showToast('Seasoning removed from catalog.');
  };

  const handleAddSpiceToGroceryList = (spice: SpiceItem) => {
    sound.playChoreComplete();
    const existing = items.some((i) => i.name.toLowerCase().trim() === `${spice.name} (Seasoning)`.toLowerCase().trim() || i.name.toLowerCase().trim() === spice.name.toLowerCase().trim());
    if (existing) {
      showToast(`"${spice.name}" is already in your grocery list!`);
      return;
    }

    const newItem: GroceryItem = {
      id: `g-spice-${Date.now()}`,
      name: `${spice.name} (Seasoning)`,
      category: 'pantry',
      quantity: '1 Container',
      importance: 'common',
      acquired: false,
      addedBy: 'Spice Rack Replenish',
      isReplenishItem: true,
      createdAt: getTodayDateString(),
    };

    handleUpdateGroceryList({
      ...groceryList,
      items: [newItem, ...items],
      lastUpdated: new Date().toISOString(),
    });

    showToast(`Added "${spice.name}" to active grocery list! 🛒`);
  };

  // 9. Kid Requests Handlers
  const handleSubmitKidRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!kidReqName.trim()) return;

    sound.playStarEarned();
    const newReq: GroceryRequest = {
      id: `req-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      kidId: activeKid?.id || 'kid-guest',
      kidName: activeKid?.name || 'Kid',
      kidAvatar: activeKid?.avatar || '🦄',
      name: kidReqName.trim(),
      category: kidReqCategory,
      quantity: kidReqQty.trim() || '1',
      importance: kidReqImportance,
      notes: kidReqNotes.trim() || undefined,
      status: 'pending',
      createdAt: getTodayDateString(),
    };

    const updatedList: WeeklyGroceryList = {
      ...groceryList,
      requests: [newReq, ...requests],
      lastUpdated: new Date().toISOString(),
    };

    handleUpdateGroceryList(updatedList);
    setKidReqName('');
    setKidReqNotes('');
    setIsAddingKidReqOpen(false);
    confetti({ particleCount: 40, spread: 50, origin: { y: 0.6 } });
    showToast(`🚀 Sent grocery request for "${newReq.name}" to Mom & Dad!`);
  };

  const handleApproveRequest = (req: GroceryRequest) => {
    sound.playRewardRedeemed();
    const newItem: GroceryItem = {
      id: `g-req-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: req.name,
      category: req.category,
      quantity: req.quantity,
      importance: req.importance,
      acquired: false,
      addedBy: `${req.kidName} ${req.kidAvatar || '⭐'} (Approved)`,
      notes: req.notes,
      createdAt: getTodayDateString(),
    };

    const updatedRequests = requests.map((r) => {
      if (r.id === req.id) {
        return {
          ...r,
          status: 'approved' as const,
          reviewedBy: isParentMode ? 'Mom & Dad' : 'Admin',
          reviewedAt: new Date().toISOString(),
        };
      }
      return r;
    });

    handleUpdateGroceryList({
      ...groceryList,
      items: [newItem, ...items],
      requests: updatedRequests,
      lastUpdated: new Date().toISOString(),
    });

    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    showToast(`✅ Approved "${req.name}" and added to grocery list!`);
  };

  const handleDenyRequest = (requestId: string) => {
    sound.playTap();
    const updatedRequests = requests.map((r) => {
      if (r.id === requestId) {
        return {
          ...r,
          status: 'denied' as const,
          reviewedBy: isParentMode ? 'Mom & Dad' : 'Admin',
          reviewedAt: new Date().toISOString(),
          denialReason: denyReason.trim() || 'Not this shopping trip',
        };
      }
      return r;
    });

    handleUpdateGroceryList({
      ...groceryList,
      requests: updatedRequests,
      lastUpdated: new Date().toISOString(),
    });

    setDenyingRequestId(null);
    setDenyReason('');
    showToast('Grocery request denied.');
  };

  // 10. Start New Weekly Grocery List Confirmation
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

  // 11. Import All Dinner Menu Ingredients
  const handleImportDinnerMenu = () => {
    sound.playChoreComplete();
    const menuItems = extractIngredientsFromMenu(database.weeklyMenu);
    if (menuItems.length === 0) {
      showToast("No dinner recipes found in this week's menu.");
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

  // 12. Copy Shareable Shopping List Text
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
          const imp = item.importance ? ` [${item.importance.toUpperCase()}]` : '';
          const tag = item.isReplenishItem ? ' *Replenish*' : '';
          lines.push(`  ${check} ${item.name}${qty}${imp}${tag}`);
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

  // Filter and Sort Active Items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase();
        const matchName = item.name.toLowerCase().includes(q);
        const matchCat = (GROCERY_CATEGORY_METADATA[item.category]?.label || '').toLowerCase().includes(q);
        const matchAddedBy = (item.addedBy || '').toLowerCase().includes(q);
        const matchImp = (item.importance || '').toLowerCase().includes(q);
        if (!matchName && !matchCat && !matchAddedBy && !matchImp) return false;
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
      return list.sort((a, b) => (a.acquired === b.acquired ? 0 : a.acquired ? 1 : -1));
    }
    if (sortBy === 'importance') {
      const impOrder: Record<GroceryImportance, number> = { staple: 1, common: 2, treat: 3, luxury: 4 };
      return list.sort((a, b) => (impOrder[a.importance || 'common'] || 2) - (impOrder[b.importance || 'common'] || 2));
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
                    Family Groceries
                  </span>
                  {depletedItems.length > 0 && (
                    <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider bg-amber-400 text-slate-950 px-2.5 sm:px-3 py-0.5 rounded-full shadow-xs animate-pulse">
                      ⚠️ {depletedItems.length} Items Need Replenish
                    </span>
                  )}
                  {pendingRequests.length > 0 && (
                    <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider bg-purple-400 text-slate-950 px-2.5 sm:px-3 py-0.5 rounded-full shadow-xs">
                      🌟 {pendingRequests.length} Kid Requests
                    </span>
                  )}
                </div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-yellow-300 italic mt-0.5 truncate">
                  Household Groceries & Pantry Tracker
                </h2>
                <p className="text-xs sm:text-sm text-emerald-100 font-bold hidden sm:block">
                  Smart checklist • Pantry depletion tracking • Spices catalogue • Kid requests
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
              {depletedItems.length > 0 && (
                <button
                  id="btn-import-replenish-header"
                  onClick={handleImportReplenishments}
                  className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer transition-all border border-amber-200"
                  title="Import items marked as depleted"
                >
                  <Package className="w-3.5 h-3.5" />
                  <span>Import Replenish ({depletedItems.length})</span>
                </button>
              )}

              {isParentMode && (
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
              )}

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
            className={`flex items-center gap-2 px-3.5 py-3 font-black text-xs sm:text-sm border-b-4 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'list'
                ? 'border-emerald-600 text-emerald-900 dark:text-emerald-300 bg-white dark:bg-slate-900 rounded-t-2xl shadow-xs'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <ShoppingCart className="w-4 h-4 text-emerald-600" />
            <span>Weekly Shopping List</span>
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
            className={`flex items-center gap-2 px-3.5 py-3 font-black text-xs sm:text-sm border-b-4 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'pantry'
                ? 'border-amber-500 text-amber-950 dark:text-amber-300 bg-white dark:bg-slate-900 rounded-t-2xl shadow-xs'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Package className="w-4 h-4 text-amber-600" />
            <span>Pantry & Replenish Tracker</span>
            {depletedItems.length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-slate-950 animate-pulse">
                {depletedItems.length} depleted
              </span>
            )}
          </button>

          <button
            id="tab-spices-catalogue"
            onClick={() => {
              sound.playTap();
              setActiveTab('spices');
            }}
            className={`flex items-center gap-2 px-3.5 py-3 font-black text-xs sm:text-sm border-b-4 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'spices'
                ? 'border-orange-500 text-orange-950 dark:text-orange-300 bg-white dark:bg-slate-900 rounded-t-2xl shadow-xs'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <FlameKindling className="w-4 h-4 text-orange-500" />
            <span>Seasonings & Spices</span>
            {spices.filter((s) => s.isEmpty).length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-orange-400 text-slate-950">
                {spices.filter((s) => s.isEmpty).length} empty
              </span>
            )}
          </button>

          <button
            id="tab-kid-requests"
            onClick={() => {
              sound.playTap();
              setActiveTab('requests');
            }}
            className={`flex items-center gap-2 px-3.5 py-3 font-black text-xs sm:text-sm border-b-4 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'requests'
                ? 'border-purple-600 text-purple-950 dark:text-purple-300 bg-white dark:bg-slate-900 rounded-t-2xl shadow-xs'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span>Kid Requests</span>
            {pendingRequests.length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-500 text-white">
                {pendingRequests.length} new
              </span>
            )}
          </button>

          <button
            id="tab-dinner-menu-sync"
            onClick={() => {
              sound.playTap();
              setActiveTab('menu_sync');
            }}
            className={`flex items-center gap-2 px-3.5 py-3 font-black text-xs sm:text-sm border-b-4 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'menu_sync'
                ? 'border-indigo-600 text-indigo-950 dark:text-indigo-300 bg-white dark:bg-slate-900 rounded-t-2xl shadow-xs'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <UtensilsCrossed className="w-4 h-4 text-indigo-600" />
            <span>Dinner Menu Sync</span>
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-4">
          {/* TAB 1: ACTIVE GROCERY TASK LIST */}
          {activeTab === 'list' && (
            <div className="space-y-4">
              {/* Quick Add Bar with Importance Selection (Parent Only) */}
              {isParentMode ? (
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-2.5">
                    <div className="md:col-span-4 relative">
                      <input
                        id="input-grocery-item-name"
                        type="text"
                        value={newItemName}
                        onChange={(e) => setNewItemName(e.target.value)}
                        placeholder="Item name (e.g. Apples, Milk, Bread, Cookies)..."
                        className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-300 bg-white font-black text-slate-900 placeholder:text-slate-400 text-xs sm:text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <input
                        id="input-grocery-item-qty"
                        type="text"
                        value={newItemQuantity}
                        onChange={(e) => setNewItemQuantity(e.target.value)}
                        placeholder="Qty (e.g. 2 bags)"
                        className="w-full px-3 py-2.5 rounded-xl border-2 border-slate-300 bg-white font-bold text-slate-900 placeholder:text-slate-400 text-xs sm:text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                      />
                    </div>

                    <div className="md:col-span-3">
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

                    <div className="md:col-span-2">
                      <select
                        id="select-grocery-importance"
                        value={newItemImportance}
                        onChange={(e) => setNewItemImportance(e.target.value as GroceryImportance)}
                        className="w-full px-3 py-2.5 rounded-xl border-2 border-slate-300 bg-white font-bold text-slate-900 text-xs sm:text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                      >
                        <option value="staple">⭐ Staple</option>
                        <option value="common">🍎 Common</option>
                        <option value="treat">🍪 Treat</option>
                        <option value="luxury">✨ Luxury</option>
                      </select>
                    </div>

                    <div className="md:col-span-1">
                      <button
                        id="btn-submit-grocery-item"
                        type="submit"
                        className="w-full h-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-1 shadow-md active:scale-95 cursor-pointer transition-all"
                      >
                        <Plus className="w-4 h-4 stroke-[3]" />
                        <span className="sm:hidden md:inline">Add</span>
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-300 dark:border-amber-700 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5 text-amber-950 dark:text-amber-200 font-bold">
                    <span className="text-xl">🔒</span>
                    <span>Direct item additions and deletions are restricted to Parents & Admins. Kids can request snacks and items in the <strong>Kid Requests</strong> tab!</span>
                  </div>
                  <button
                    onClick={() => setActiveTab('requests')}
                    className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs shrink-0 cursor-pointer shadow-xs"
                  >
                    🌟 Request an Item
                  </button>
                </div>
              )}

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
                    placeholder="Search groceries by name, category, or importance..."
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
                  {totalAcquiredCount > 0 && isParentMode && (
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
                      : 'Your grocery list is currently empty! Add items above, or 1-click import depleted pantry items.'}
                  </p>
                  <div className="flex items-center justify-center gap-2 pt-2 flex-wrap">
                    {depletedItems.length > 0 && (
                      <button
                        onClick={handleImportReplenishments}
                        className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
                      >
                        <Package className="w-4 h-4" />
                        <span>Import Depleted Items ({depletedItems.length})</span>
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
                              isParentMode={isParentMode}
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
                      isParentMode={isParentMode}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PANTRY & REPLENISH TRACKER (ALL HOUSEHOLD GROCERIES) */}
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
                      Household Pantry & Replenish Tracker
                    </h3>
                    <p className="text-xs text-amber-800 dark:text-amber-300 font-medium">
                      Catalogue of all household groceries. Toggle any item when depleted to queue it for replenishment!
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end flex-wrap">
                  {isParentMode && depletedItems.length > 0 && (
                    <button
                      onClick={handleImportReplenishments}
                      className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer"
                    >
                      <Package className="w-4 h-4" />
                      <span>Import Depleted ({depletedItems.length})</span>
                    </button>
                  )}
                  {isParentMode && (
                    <button
                      onClick={() => {
                        sound.playTap();
                        setIsAddingPantryOpen((prev) => !prev);
                      }}
                      className="px-3 py-2 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-300 dark:border-slate-600 hover:bg-slate-100 font-bold text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Item to Pantry</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Search Bar for Pantry Tracker */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="input-search-pantry"
                  type="text"
                  value={pantrySearchQuery}
                  onChange={(e) => setPantrySearchQuery(e.target.value)}
                  placeholder="Search household pantry by name, category, or importance (Staple, Common, Treat, Luxury)..."
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-2xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:border-amber-500 shadow-2xs"
                />
                {pantrySearchQuery && (
                  <button
                    onClick={() => setPantrySearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Add Custom Household Item Form (Collapsible, Parent Only) */}
              {isParentMode && isAddingPantryOpen && (
                <form
                  onSubmit={handleAddCustomPantryItem}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-800 border-2 border-dashed border-amber-400 dark:border-amber-600 space-y-3 animate-in fade-in duration-150 shadow-xs"
                >
                  <div className="font-black text-xs text-amber-900 dark:text-amber-300 uppercase tracking-wider">
                    Add Item to Household Pantry Catalogue
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                    <div className="sm:col-span-4">
                      <input
                        type="text"
                        value={newPantryName}
                        onChange={(e) => setNewPantryName(e.target.value)}
                        placeholder="Item name (e.g. Oatmeal, Olive Oil, Trash Bags)..."
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-bold text-xs text-slate-900 focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                        autoFocus
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <select
                        value={newPantryCategory}
                        onChange={(e) => setNewPantryCategory(e.target.value as GroceryCategory)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-bold text-xs text-slate-900"
                      >
                        {GROCERY_CATEGORY_ORDER.map((cat) => (
                          <option key={cat} value={cat}>
                            {GROCERY_CATEGORY_METADATA[cat].icon} {GROCERY_CATEGORY_METADATA[cat].shortLabel}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="sm:col-span-3">
                      <select
                        value={newPantryImportance}
                        onChange={(e) => setNewPantryImportance(e.target.value as GroceryImportance)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-bold text-xs text-slate-900"
                      >
                        <option value="staple">⭐ Staple</option>
                        <option value="common">🍎 Common</option>
                        <option value="treat">🍪 Treat</option>
                        <option value="luxury">✨ Luxury</option>
                      </select>
                    </div>
                    <div className="sm:col-span-2 flex gap-2">
                      <input
                        type="text"
                        value={newPantryQuantity}
                        onChange={(e) => setNewPantryQuantity(e.target.value)}
                        placeholder="Qty"
                        className="w-full px-2 py-2 rounded-xl border border-slate-300 bg-white font-bold text-xs text-slate-900"
                      />
                      <button
                        type="submit"
                        className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shrink-0 cursor-pointer shadow-xs"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* Grid of ALL Household Groceries in Pantry */}
              {filteredPantryGroceries.length === 0 ? (
                <div className="p-8 sm:p-12 text-center bg-white dark:bg-slate-800 rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-700 space-y-3">
                  <div className="text-4xl">🥫</div>
                  <h3 className="text-base font-black text-slate-800 dark:text-slate-200">
                    No household groceries found
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                    {pantrySearchQuery
                      ? `No items match "${pantrySearchQuery}". Try clearing your search.`
                      : 'Add grocery items above to build your household pantry catalog!'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filteredPantryGroceries.map((item) => {
                    const meta = GROCERY_CATEGORY_METADATA[item.category] || GROCERY_CATEGORY_METADATA.other;
                    const impMeta = GROCERY_IMPORTANCE_METADATA[item.importance || 'common'];
                    const isInActiveList = items.some(
                      (i) => i.name.toLowerCase().trim() === item.name.toLowerCase().trim() && !i.acquired
                    );

                    return (
                      <div
                        key={item.id}
                        className={`p-3.5 rounded-2xl border-2 transition-all flex flex-col justify-between gap-3 shadow-xs ${
                          item.isDepleted
                            ? 'bg-amber-50/90 dark:bg-amber-950/40 border-amber-400 dark:border-amber-600 ring-2 ring-amber-400/40'
                            : 'bg-white dark:bg-slate-800/90 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xl shrink-0 shadow-2xs">
                              {meta.icon}
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-slate-100 truncate">
                                {item.name}
                              </h4>
                              <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                <span className={`px-2 py-0.2 rounded-md text-[10px] font-extrabold border ${meta.badgeBg}`}>
                                  {meta.shortLabel}
                                </span>
                                <span className={`px-2 py-0.2 rounded-md text-[10px] font-extrabold border ${impMeta.bg} ${impMeta.color} ${impMeta.border}`}>
                                  {impMeta.icon} {impMeta.label}
                                </span>
                                {item.quantity && (
                                  <span className="text-[10px] font-bold text-slate-500">
                                    {item.quantity}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Delete Item Button (Parent Only) */}
                          {isParentMode && (
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="text-slate-400 hover:text-rose-500 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer shrink-0"
                              title="Permanently remove from list"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        {/* Depleted Reporter Note if empty */}
                        {item.isDepleted && item.depletedBy && (
                          <div className="text-[11px] font-bold text-amber-800 dark:text-amber-300 bg-amber-100/80 dark:bg-amber-900/50 px-2.5 py-1 rounded-lg border border-amber-300/60 flex items-center gap-1">
                            <span>⚠️ Reported empty by {item.depletedBy}</span>
                          </div>
                        )}

                        {/* Action Toggle Button */}
                        <div className="flex items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-700/60">
                          <button
                            onClick={() => handleTogglePantryDepletion(item.id)}
                            className={`flex-1 py-2 px-3 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs active:scale-95 ${
                              item.isDepleted
                                ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 font-black ring-1 ring-amber-300'
                                : 'bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                            }`}
                          >
                            {item.isDepleted ? (
                              <>
                                <AlertTriangle className="w-3.5 h-3.5" />
                                <span>Depleted (Needs Replenish)</span>
                              </>
                            ) : (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>In Stock & Full</span>
                              </>
                            )}
                          </button>

                          {item.isDepleted && !isInActiveList && (
                            <button
                              onClick={() => {
                                sound.playChoreComplete();
                                const { updatedList } = importDepletedItemsToGroceryList(groceryList, [
                                  {
                                    id: item.id,
                                    name: item.name,
                                    category: item.category,
                                    quantity: item.quantity,
                                    depletedBy: item.depletedBy,
                                    importance: item.importance,
                                  },
                                ]);
                                handleUpdateGroceryList(updatedList);
                                showToast(`Added "${item.name}" to active grocery list!`);
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
              )}
            </div>
          )}

          {/* TAB 3: SEASONINGS & SPICES CATALOGUE */}
          {activeTab === 'spices' && (
            <div className="space-y-4">
              {/* Header Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/20 border-2 border-orange-300 dark:border-orange-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-orange-500 text-white flex items-center justify-center text-2xl shadow-xs shrink-0">
                    🧂
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-orange-950 dark:text-orange-200">
                      Seasonings & Spices Catalogue
                    </h3>
                    <p className="text-xs text-orange-800 dark:text-orange-300 font-medium">
                      Keep inventory of your spices at home. Check any spice as Empty to trigger 1-click replenishment!
                    </p>
                  </div>
                </div>

                {isParentMode && (
                  <button
                    onClick={() => {
                      sound.playTap();
                      setIsAddingSpiceOpen((prev) => !prev);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black text-xs flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Add New Spice</span>
                  </button>
                )}
              </div>

              {/* Search Bar for Spices */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="input-search-spices"
                  type="text"
                  value={spiceSearchQuery}
                  onChange={(e) => setSpiceSearchQuery(e.target.value)}
                  placeholder="Search spices and herbs by name..."
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-2xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:border-orange-500 shadow-2xs"
                />
                {spiceSearchQuery && (
                  <button
                    onClick={() => setSpiceSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Add New Spice Form (Collapsible, Parent Only) */}
              {isParentMode && isAddingSpiceOpen && (
                <form
                  onSubmit={handleAddSpice}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-800 border-2 border-dashed border-orange-400 dark:border-orange-600 space-y-3 animate-in fade-in duration-150 shadow-xs"
                >
                  <div className="font-black text-xs text-orange-900 dark:text-orange-300 uppercase tracking-wider">
                    Add Spice / Seasoning to Inventory
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                    <div className="sm:col-span-5">
                      <input
                        type="text"
                        value={newSpiceName}
                        onChange={(e) => setNewSpiceName(e.target.value)}
                        placeholder="Spice name (e.g. Smoked Paprika, Garlic Powder, Oregano)..."
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-bold text-xs text-slate-900 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                        autoFocus
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <select
                        value={newSpiceCategory}
                        onChange={(e) => setNewSpiceCategory(e.target.value as any)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-bold text-xs text-slate-900"
                      >
                        <option value="spice">🌶️ Spice</option>
                        <option value="herb">🌿 Herb</option>
                        <option value="blend">🍛 Seasoning Blend</option>
                        <option value="salt_pepper">🧂 Salt / Pepper</option>
                        <option value="baking">🧁 Baking Extract / Spice</option>
                      </select>
                    </div>
                    <div className="sm:col-span-3">
                      <input
                        type="text"
                        value={newSpiceNotes}
                        onChange={(e) => setNewSpiceNotes(e.target.value)}
                        placeholder="Notes (e.g. in pantry top shelf)"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-bold text-xs text-slate-900"
                      />
                    </div>
                    <div className="sm:col-span-1">
                      <button
                        type="submit"
                        className="w-full py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black text-xs cursor-pointer shadow-xs"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* Spices List / Cards */}
              {filteredSpices.length === 0 ? (
                <div className="p-8 sm:p-12 text-center bg-white dark:bg-slate-800 rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-700 space-y-3">
                  <div className="text-4xl">🧂</div>
                  <h3 className="text-base font-black text-slate-800 dark:text-slate-200">
                    No spices in catalogue yet
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                    {spiceSearchQuery
                      ? `No spices match "${spiceSearchQuery}".`
                      : 'Add your pantry seasonings, herbs, and spice jars above to easily keep track of empty containers!'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filteredSpices.map((spice) => {
                    const isQueued = items.some(
                      (i) => i.name.toLowerCase().includes(spice.name.toLowerCase()) && !i.acquired
                    );

                    return (
                      <div
                        key={spice.id}
                        className={`p-3.5 rounded-2xl border-2 transition-all flex flex-col justify-between gap-3 shadow-xs ${
                          spice.isEmpty
                            ? 'bg-orange-50/90 dark:bg-orange-950/40 border-orange-400 dark:border-orange-600 ring-2 ring-orange-400/30'
                            : 'bg-white dark:bg-slate-800/90 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-950 flex items-center justify-center text-xl shrink-0">
                              🧂
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-slate-100 truncate">
                                {spice.name}
                              </h4>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="px-2 py-0.2 rounded-md text-[10px] font-extrabold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                                  {spice.category || 'Seasoning'}
                                </span>
                                {spice.notes && (
                                  <span className="text-[10px] text-slate-400 truncate">
                                    {spice.notes}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Delete Item Button (Parent Only) */}
                          {isParentMode && (
                            <button
                              onClick={() => handleDeleteSpice(spice.id)}
                              className="text-slate-400 hover:text-rose-500 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer shrink-0"
                              title="Delete spice from catalog"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        <div className="flex items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-700/60">
                          <button
                            onClick={() => handleToggleSpiceEmpty(spice.id)}
                            className={`flex-1 py-2 px-3 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs active:scale-95 ${
                              spice.isEmpty
                                ? 'bg-orange-500 hover:bg-orange-600 text-white font-black'
                                : 'bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 border border-emerald-300'
                            }`}
                          >
                            {spice.isEmpty ? (
                              <>
                                <AlertTriangle className="w-3.5 h-3.5" />
                                <span>Empty (Needs Refill)</span>
                              </>
                            ) : (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>In Stock</span>
                              </>
                            )}
                          </button>

                          {spice.isEmpty && !isQueued && (
                            <button
                              onClick={() => handleAddSpiceToGroceryList(spice)}
                              className="px-2.5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs flex items-center gap-1 shadow-2xs active:scale-95 cursor-pointer shrink-0"
                              title="Add to active grocery list"
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
              )}
            </div>
          )}

          {/* TAB 4: KID GROCERY REQUESTS & ADMIN APPROVALS */}
          {activeTab === 'requests' && (
            <div className="space-y-4">
              {/* Request Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/20 border-2 border-purple-300 dark:border-purple-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-purple-600 text-yellow-300 flex items-center justify-center text-2xl shadow-xs shrink-0">
                    🌟
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-purple-950 dark:text-purple-200">
                      Kids Grocery & Snack Requests
                    </h3>
                    <p className="text-xs text-purple-800 dark:text-purple-300 font-medium">
                      Kids can ask for their favorite snacks or treats! Parents review and approve items directly into the weekly grocery list.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    sound.playTap();
                    setIsAddingKidReqOpen((prev) => !prev);
                  }}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>+ Ask for a Grocery Item</span>
                </button>
              </div>

              {/* Submit Kid Request Form */}
              {isAddingKidReqOpen && (
                <form
                  onSubmit={handleSubmitKidRequest}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-800 border-2 border-purple-400 dark:border-purple-600 space-y-3 animate-in fade-in duration-150 shadow-md"
                >
                  <div className="font-black text-xs text-purple-900 dark:text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <span>Request a Grocery Item or Snack ({activeKid ? activeKid.name : 'Kid'})</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                    <div className="sm:col-span-5">
                      <input
                        type="text"
                        value={kidReqName}
                        onChange={(e) => setKidReqName(e.target.value)}
                        placeholder="What do you want? (e.g. Goldfish Crackers, Strawberry Ice Cream)..."
                        className="w-full px-3 py-2.5 rounded-xl border-2 border-slate-300 bg-white font-black text-xs sm:text-sm text-slate-900 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                        autoFocus
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <input
                        type="text"
                        value={kidReqQty}
                        onChange={(e) => setKidReqQty(e.target.value)}
                        placeholder="Qty (1 box)"
                        className="w-full px-3 py-2.5 rounded-xl border-2 border-slate-300 bg-white font-bold text-xs sm:text-sm text-slate-900"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <select
                        value={kidReqImportance}
                        onChange={(e) => setKidReqImportance(e.target.value as GroceryImportance)}
                        className="w-full px-3 py-2.5 rounded-xl border-2 border-slate-300 bg-white font-bold text-xs sm:text-sm text-slate-900"
                      >
                        <option value="treat">🍪 Treat / Snack</option>
                        <option value="luxury">✨ Special Luxury</option>
                        <option value="common">🍎 Regular Food</option>
                        <option value="staple">⭐ Household Staple</option>
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <button
                        type="submit"
                        className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs sm:text-sm shadow-md active:scale-95 cursor-pointer"
                      >
                        Send Request 🚀
                      </button>
                    </div>
                  </div>

                  <div>
                    <input
                      type="text"
                      value={kidReqNotes}
                      onChange={(e) => setKidReqNotes(e.target.value)}
                      placeholder="Why do you want it? (e.g. For school lunchbox, Friday movie night treat)..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-medium text-xs text-slate-800"
                    />
                  </div>
                </form>
              )}

              {/* Pending Requests Section */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Pending Requests ({pendingRequests.length})</span>
                </h4>

                {pendingRequests.length === 0 ? (
                  <div className="p-6 text-center bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-500 text-xs font-bold">
                    No pending kid requests right now. Kids can click "+ Ask for a Grocery Item" to send a request!
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {pendingRequests.map((req) => {
                      const impMeta = GROCERY_IMPORTANCE_METADATA[req.importance || 'treat'];

                      return (
                        <div
                          key={req.id}
                          className="p-4 rounded-2xl bg-white dark:bg-slate-800 border-2 border-purple-200 dark:border-purple-800 shadow-sm flex flex-col justify-between space-y-3"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2.5">
                              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950 flex items-center justify-center text-xl shrink-0">
                                {req.kidAvatar || '🦄'}
                              </div>
                              <div>
                                <h4 className="text-sm font-black text-slate-900 dark:text-slate-100">
                                  {req.name}
                                </h4>
                                <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 mt-0.5">
                                  <span>Requested by <strong>{req.kidName}</strong></span>
                                  {req.quantity && <span>• {req.quantity}</span>}
                                </div>
                              </div>
                            </div>

                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold border ${impMeta.bg} ${impMeta.color} ${impMeta.border}`}>
                              {impMeta.icon} {impMeta.label}
                            </span>
                          </div>

                          {req.notes && (
                            <div className="text-xs bg-slate-50 dark:bg-slate-900/60 p-2 rounded-xl text-slate-600 dark:text-slate-300 italic font-medium">
                              "{req.notes}"
                            </div>
                          )}

                          {/* Action Buttons: Parents Approve / Deny */}
                          <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                            {isParentMode ? (
                              <>
                                <button
                                  onClick={() => handleApproveRequest(req)}
                                  className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center justify-center gap-1 shadow-sm active:scale-95 cursor-pointer"
                                >
                                  <ThumbsUp className="w-3.5 h-3.5" />
                                  <span>Approve & Add</span>
                                </button>
                                <button
                                  onClick={() => {
                                    if (denyingRequestId === req.id) {
                                      handleDenyRequest(req.id);
                                    } else {
                                      setDenyingRequestId(req.id);
                                    }
                                  }}
                                  className="py-2 px-3 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold text-xs flex items-center justify-center gap-1 cursor-pointer"
                                >
                                  <ThumbsDown className="w-3.5 h-3.5" />
                                  <span>{denyingRequestId === req.id ? 'Confirm Deny' : 'Deny'}</span>
                                </button>
                              </>
                            ) : (
                              <div className="w-full text-center text-[11px] font-extrabold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 py-1.5 rounded-xl">
                                ⏳ Waiting for Mom & Dad to review!
                              </div>
                            )}
                          </div>

                          {denyingRequestId === req.id && (
                            <div className="pt-2 flex gap-2 animate-in fade-in">
                              <input
                                type="text"
                                value={denyReason}
                                onChange={(e) => setDenyReason(e.target.value)}
                                placeholder="Optional reason for kid (e.g. Next week)..."
                                className="w-full px-2.5 py-1 text-xs rounded-lg border border-slate-300 bg-white font-medium"
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Resolved Requests History */}
              {requests.filter((r) => r.status !== 'pending').length > 0 && (
                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                    Past Resolved Requests
                  </h4>
                  <div className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                    {requests
                      .filter((r) => r.status !== 'pending')
                      .slice(0, 5)
                      .map((req) => (
                        <div key={req.id} className="p-3 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span>{req.status === 'approved' ? '✅' : '❌'}</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">{req.name}</span>
                            <span className="text-slate-400 font-medium">({req.kidName})</span>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                              req.status === 'approved'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {req.status}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: DINNER MENU INGREDIENTS SYNC */}
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

                {isParentMode && (
                  <button
                    onClick={handleImportDinnerMenu}
                    className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs flex items-center gap-2 shadow-md active:scale-95 cursor-pointer shrink-0"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                    <span>Import All 7 Days' Ingredients</span>
                  </button>
                )}
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

                        {isParentMode && hasDish && (
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
                                    importance: 'staple',
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
                                  importance: 'staple',
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
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs cursor-pointer shadow-md active:scale-95 transition-all"
            >
              Done Shopping
            </button>
          </div>
        </div>
      </div>

      {/* Start New Week Confirmation Modal */}
      {showStartNewWeekConfirm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-2xl border-4 border-teal-400 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-500 text-white flex items-center justify-center text-2xl font-black">
                🔄
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">
                  Start Fresh Grocery Week?
                </h3>
                <p className="text-xs text-slate-500 font-semibold">
                  Archive current list and generate a new weekly checklist.
                </p>
              </div>
            </div>

            <div className="space-y-2 bg-teal-50 dark:bg-teal-950/40 p-3.5 rounded-2xl border border-teal-200 text-xs font-bold text-teal-900 dark:text-teal-200">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeDinnerMenuInNewWeek}
                  onChange={(e) => setIncludeDinnerMenuInNewWeek(e.target.checked)}
                  className="rounded text-teal-600 focus:ring-teal-500"
                />
                <span>Auto-include dinner menu recipes for the upcoming week</span>
              </label>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={() => handleConfirmStartNewWeek(true)}
                className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                <span>Start New Week (Include Depleted Pantry Items)</span>
              </button>
              <button
                onClick={() => handleConfirmStartNewWeek(false)}
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs cursor-pointer"
              >
                Start Completely Blank List
              </button>
              <button
                onClick={() => setShowStartNewWeekConfirm(false)}
                className="w-full py-2 rounded-xl text-slate-400 hover:text-slate-600 font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Print / Export Modal */}
      {showPrintModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-2xl border-4 border-slate-300 dark:border-slate-700 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center text-xl">
                  📋
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-slate-100">
                    Print or Share Shopping List
                  </h3>
                  <p className="text-xs text-slate-500 font-bold">
                    Copy text for iMessage / WhatsApp or print physical paper
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPrintModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {copyFeedback && (
              <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-900 font-black text-xs text-center">
                {copyFeedback}
              </div>
            )}

            <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 font-mono text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
              {`🛒 FAMILY GROCERY LIST (${formatDateDisplay(groceryList.weekStartDate || getTodayDateString())})\n`}
              {GROCERY_CATEGORY_ORDER.map((cat) => {
                const catItems = items.filter((i) => i.category === cat);
                if (catItems.length === 0) return null;
                const meta = GROCERY_CATEGORY_METADATA[cat];
                return `\n${meta.icon} ${meta.label.toUpperCase()}:\n` +
                  catItems.map((i) => `  ${i.acquired ? '[X]' : '[ ]'} ${i.name}${i.quantity ? ` (${i.quantity})` : ''}`).join('\n');
              }).filter(Boolean).join('\n')}
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={handleCopyShoppingList}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
              >
                <Copy className="w-4 h-4" />
                <span>Copy to Clipboard</span>
              </button>
              <button
                onClick={() => {
                  window.print();
                }}
                className="px-4 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-black text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Message */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-70 px-5 py-3 rounded-2xl bg-slate-900/95 text-white font-black text-xs sm:text-sm shadow-2xl border border-white/20 animate-in fade-in slide-in-from-bottom-4 duration-150 flex items-center gap-2">
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
  isParentMode?: boolean;
}

const GroceryItemRow: React.FC<GroceryItemRowProps> = ({
  item,
  onToggleAcquired,
  onDeleteItem,
  isParentMode = false,
}) => {
  const meta = GROCERY_CATEGORY_METADATA[item.category] || GROCERY_CATEGORY_METADATA.other;
  const impMeta = GROCERY_IMPORTANCE_METADATA[item.importance || 'common'];

  return (
    <div
      className={`p-3 sm:px-4 flex items-center justify-between gap-3 transition-colors ${
        item.acquired
          ? 'bg-slate-50/60 dark:bg-slate-800/40 opacity-75'
          : 'hover:bg-slate-50/80 dark:hover:bg-slate-750/50'
      }`}
    >
      {/* Checkbox & Item Name */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <button
          onClick={() => onToggleAcquired(item.id)}
          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer shrink-0 ${
            item.acquired
              ? 'bg-emerald-500 text-white shadow-xs'
              : 'border-2 border-slate-300 dark:border-slate-600 hover:border-emerald-500 text-transparent'
          }`}
          title={item.acquired ? 'Mark as needed' : 'Mark as acquired'}
        >
          <Check className={`w-4 h-4 stroke-[3] ${item.acquired ? 'opacity-100' : 'opacity-0'}`} />
        </button>

        <div className="min-w-0 flex-1">
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

            {/* Importance Badge */}
            <span className={`px-2 py-0.2 rounded-md text-[10px] font-extrabold border ${impMeta.bg} ${impMeta.color} ${impMeta.border}`}>
              {impMeta.icon} {impMeta.label}
            </span>

            {item.isReplenishItem && (
              <span className="px-2 py-0.2 rounded-md text-[10px] font-extrabold bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 border border-amber-300">
                ⚠️ Replenish
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-0.5 flex-wrap">
            {item.quantity && (
              <span className="text-slate-800 dark:text-slate-200 font-extrabold">
                {item.quantity}
              </span>
            )}
            {item.addedBy && (
              <span className="text-slate-400 font-medium">
                Added by {item.addedBy}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Delete Item Action */}
      <button
        onClick={() => onDeleteItem(item.id)}
        className="text-slate-300 hover:text-rose-500 dark:text-slate-600 dark:hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer shrink-0"
        title="Delete item from list"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
};
