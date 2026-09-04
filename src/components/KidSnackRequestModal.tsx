import React, { useState, useMemo } from 'react';
import {
  X,
  Sparkles,
  Check,
  AlertTriangle,
  Clock,
  Plus,
  Trash2,
  Edit2,
  Shield,
  ShoppingCart,
  ChevronRight,
  RotateCcw,
  Star,
  Search,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  FamilyDatabase,
  KidProfile,
  GroceryRequest,
  GroceryImportance,
  GroceryItem,
  WeeklyGroceryList,
} from '../types';
import {
  CURATED_SNACK_CATALOG,
  SnackCatalogItem,
  getStarCostForImportance,
  getSnackItemStarCost,
  DEFAULT_SNACK_STAR_TIERS,
} from '../utils/snackCatalog';
import { GROCERY_IMPORTANCE_METADATA } from '../utils/grocery';
import { getTodayDateString } from '../utils/storage';
import { sound } from '../utils/sound';

interface KidSnackRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  database: FamilyDatabase;
  onUpdateDatabase: (updated: FamilyDatabase) => void;
  initialKid?: KidProfile | null;
  isParentMode?: boolean;
  onPostActionComplete?: () => void;
}

export const KidSnackRequestModal: React.FC<KidSnackRequestModalProps> = ({
  isOpen,
  onClose,
  database,
  onUpdateDatabase,
  initialKid = null,
  isParentMode = false,
  onPostActionComplete,
}) => {
  // Select which kid is making the request
  const [selectedKidId, setSelectedKidId] = useState<string>(
    initialKid ? initialKid.id : database.kids[0]?.id || ''
  );

  const activeKid = useMemo(
    () => database.kids.find((k) => k.id === selectedKidId) || database.kids[0] || null,
    [database.kids, selectedKidId]
  );

  const [activeTab, setActiveTab] = useState<'catalog' | 'my_requests' | 'admin_pricing'>('catalog');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'healthy' | 'munchies' | 'treats' | 'luxury'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected item for checkout preview
  const [selectedPreset, setSelectedPreset] = useState<SnackCatalogItem | null>(null);

  // Custom request inputs
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);
  const [customName, setCustomName] = useState<string>('');
  const [customQty, setCustomQty] = useState<string>('1 box');
  const [customImportance, setCustomImportance] = useState<GroceryImportance>('treat');
  const [customNotes, setCustomNotes] = useState<string>('');

  // Admin star cost editing modal state
  const [editingRequestStarCost, setEditingRequestStarCost] = useState<GroceryRequest | null>(null);
  const [newStarCostInput, setNewStarCostInput] = useState<number>(0);

  // Admin denial state
  const [denyingRequest, setDenyingRequest] = useState<GroceryRequest | null>(null);
  const [denyReasonText, setDenyReasonText] = useState<string>('');

  // Admin pricing tier settings state
  const [pricingTiers, setPricingTiers] = useState(
    database.settings.snackStarTiers || DEFAULT_SNACK_STAR_TIERS
  );

  // Toast message
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 4000);
  };

  const groceryList: WeeklyGroceryList = database.weeklyGroceryList || { items: [], requests: [] };
  const allRequests: GroceryRequest[] = groceryList.requests || [];

  // Filter requests for the active kid
  const kidRequests = useMemo(() => {
    return allRequests.filter((r) => r.kidId === activeKid?.id);
  }, [allRequests, activeKid?.id]);

  const pendingRequestsCount = useMemo(() => {
    return allRequests.filter((r) => r.status === 'pending').length;
  }, [allRequests]);

  // Calculate current item star cost
  const currentStarCost = useMemo(() => {
    if (isCustomMode) {
      return getStarCostForImportance(customImportance, database.settings);
    }
    if (selectedPreset) {
      return getSnackItemStarCost(selectedPreset, database.settings);
    }
    return 0;
  }, [isCustomMode, customImportance, selectedPreset, database.settings]);

  // Filter catalog
  const filteredCatalog = useMemo(() => {
    return CURATED_SNACK_CATALOG.filter((item) => {
      if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return item.name.toLowerCase().includes(q) || item.description.toLowerCase().includes(q);
      }
      return true;
    });
  }, [categoryFilter, searchQuery]);

  if (!isOpen) return null;

  // 1. Submit Request with Star Payment
  const handlePayAndSubmitRequest = (
    itemName: string,
    quantity: string,
    importance: GroceryImportance,
    starCost: number,
    notes?: string
  ) => {
    if (!activeKid) {
      showToast('Please choose a child profile first.', 'error');
      return;
    }

    if (activeKid.stars < starCost) {
      showToast(`Not enough stars! ${activeKid.name} needs ${starCost - activeKid.stars} more ⭐.`, 'error');
      sound.playTap();
      return;
    }

    sound.playRewardRedeemed();

    // 1. Deduct stars from active kid
    const updatedKids = database.kids.map((k) => {
      if (k.id === activeKid.id) {
        return {
          ...k,
          stars: Math.max(0, k.stars - starCost),
        };
      }
      return k;
    });

    // 2. Create the GroceryRequest
    const newRequest: GroceryRequest = {
      id: `snack-req-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: itemName,
      quantity: quantity || '1',
      category: 'snacks',
      importance: importance,
      starCost: starCost,
      originalStarCost: starCost,
      starsDeducted: true,
      notes: notes || undefined,
      kidId: activeKid.id,
      kidName: activeKid.name,
      kidAvatar: activeKid.avatar || '⭐',
      status: 'pending',
      createdAt: getTodayDateString(),
    };

    const updatedGroceryList: WeeklyGroceryList = {
      ...groceryList,
      requests: [newRequest, ...allRequests],
      lastUpdated: new Date().toISOString(),
    };

    onUpdateDatabase({
      ...database,
      kids: updatedKids,
      weeklyGroceryList: updatedGroceryList,
    });

    confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    if (onPostActionComplete) {
      showToast(
        `🎉 Paid ${starCost} ⭐! Request for "${itemName}" sent! Returning to Kiosk...`,
        'success'
      );
      setTimeout(() => {
        onPostActionComplete();
      }, 1200);
    } else {
      showToast(
        `🎉 Paid ${starCost} ⭐! Request for "${itemName}" sent to Mom & Dad for this week's grocery trip!`,
        'success'
      );
    }

    // Reset checkout state and switch to my requests tab
    setSelectedPreset(null);
    setIsCustomMode(false);
    setCustomName('');
    setCustomNotes('');
    setActiveTab('my_requests');
  };

  // 2. Cancel Request & Refund Stars (by Kid or Parent)
  const handleCancelRequest = (req: GroceryRequest) => {
    sound.playTap();

    // Refund stars back to the kid if they were deducted
    let updatedKids = database.kids;
    if (req.starsDeducted && (req.starCost || 0) > 0) {
      updatedKids = database.kids.map((k) => {
        if (k.id === req.kidId) {
          return {
            ...k,
            stars: k.stars + (req.starCost || 0),
          };
        }
        return k;
      });
    }

    const updatedRequests = allRequests.filter((r) => r.id !== req.id);

    onUpdateDatabase({
      ...database,
      kids: updatedKids,
      weeklyGroceryList: {
        ...groceryList,
        requests: updatedRequests,
        lastUpdated: new Date().toISOString(),
      },
    });

    showToast(`Cancelled request for "${req.name}". ${req.starCost || 0} ⭐ refunded back to ${req.kidName}!`, 'info');
  };

  // 3. Admin Approve Request (Adds to weekly shopping list, stars remain spent)
  const handleAdminApprove = (req: GroceryRequest) => {
    sound.playRewardRedeemed();

    const newItem: GroceryItem = {
      id: `g-snack-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: req.name,
      category: 'snacks',
      quantity: req.quantity || '1',
      importance: req.importance || 'treat',
      acquired: false,
      addedBy: `${req.kidName} ${req.kidAvatar || '⭐'} (${req.starCost || 0}⭐ Paid)`,
      notes: req.notes,
      createdAt: getTodayDateString(),
    };

    const updatedRequests = allRequests.map((r) => {
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

    onUpdateDatabase({
      ...database,
      weeklyGroceryList: {
        ...groceryList,
        items: [newItem, ...(groceryList.items || [])],
        requests: updatedRequests,
        lastUpdated: new Date().toISOString(),
      },
    });

    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    showToast(`✅ Approved "${req.name}"! Added to weekly family grocery list.`, 'success');
  };

  // 4. Admin Deny Request (Refunds stars back to kid)
  const handleAdminConfirmDenial = () => {
    if (!denyingRequest) return;
    sound.playTap();

    const starRefund = denyingRequest.starCost || 0;

    // Refund stars back to the requesting child
    const updatedKids = database.kids.map((k) => {
      if (k.id === denyingRequest.kidId && denyingRequest.starsDeducted && starRefund > 0) {
        return {
          ...k,
          stars: k.stars + starRefund,
        };
      }
      return k;
    });

    const updatedRequests = allRequests.map((r) => {
      if (r.id === denyingRequest.id) {
        return {
          ...r,
          status: 'denied' as const,
          deniedReason: denyReasonText.trim() || 'Not on this shopping trip',
          reviewedBy: isParentMode ? 'Mom & Dad' : 'Admin',
          reviewedAt: new Date().toISOString(),
        };
      }
      return r;
    });

    onUpdateDatabase({
      ...database,
      kids: updatedKids,
      weeklyGroceryList: {
        ...groceryList,
        requests: updatedRequests,
        lastUpdated: new Date().toISOString(),
      },
    });

    showToast(
      `Denied request for "${denyingRequest.name}". ${starRefund} ⭐ refunded to ${denyingRequest.kidName}!`,
      'info'
    );
    setDenyingRequest(null);
    setDenyReasonText('');
  };

  // 5. Admin Edit Star Cost Required for a Request (adjusts kid star balance accordingly)
  const handleSaveEditedStarCost = () => {
    if (!editingRequestStarCost) return;
    const oldCost = editingRequestStarCost.starCost || 0;
    const newCost = Math.max(0, Number(newStarCostInput));
    const starDiff = newCost - oldCost; // positive = kid owes more, negative = kid gets refund

    let updatedKids = database.kids;

    // If stars were already deducted from kid, adjust their balance
    if (editingRequestStarCost.starsDeducted) {
      updatedKids = database.kids.map((k) => {
        if (k.id === editingRequestStarCost.kidId) {
          return {
            ...k,
            stars: Math.max(0, k.stars - starDiff), // if diff is -5, stars + 5 (refund)
          };
        }
        return k;
      });
    }

    const updatedRequests = allRequests.map((r) => {
      if (r.id === editingRequestStarCost.id) {
        return {
          ...r,
          starCost: newCost,
          adminEditedStars: true,
        };
      }
      return r;
    });

    onUpdateDatabase({
      ...database,
      kids: updatedKids,
      weeklyGroceryList: {
        ...groceryList,
        requests: updatedRequests,
        lastUpdated: new Date().toISOString(),
      },
    });

    showToast(
      `Updated star cost for "${editingRequestStarCost.name}" to ${newCost} ⭐! ${
        starDiff < 0
          ? `${Math.abs(starDiff)} ⭐ refunded to ${editingRequestStarCost.kidName}.`
          : starDiff > 0
          ? `${starDiff} ⭐ additional deducted from ${editingRequestStarCost.kidName}.`
          : 'No balance change.'
      }`,
      'success'
    );

    setEditingRequestStarCost(null);
  };

  // 6. Admin Save Pricing Tiers
  const handleSavePricingTiers = () => {
    onUpdateDatabase({
      ...database,
      settings: {
        ...database.settings,
        snackStarTiers: pricingTiers,
      },
    });
    showToast('Saved default snack star pricing tiers!', 'success');
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-70 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-xs animate-fade-in overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-yellow-50 dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-3 sm:p-5 max-w-4xl w-full shadow-2xl border-2 sm:border-4 border-yellow-300 dark:border-yellow-600 max-h-[96vh] flex flex-col my-auto text-slate-900 dark:text-slate-100"
      >
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-yellow-200 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3.5">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-amber-400 border-2 border-amber-300 flex items-center justify-center text-2xl shadow-inner transform -rotate-3 shrink-0">
              🍪
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-wider bg-amber-200 dark:bg-amber-950 text-amber-950 dark:text-amber-200 border border-amber-300 dark:border-amber-700">
                  Kids Grocery & Snack Request
                </span>
                {isParentMode && (
                  <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-900 border border-indigo-200">
                    <Shield className="w-2.5 h-2.5" />
                    Admin Mode Active
                  </span>
                )}
              </div>
              <h2 className="text-base sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                Spend Stars for Snacks & Treats 🛒
              </h2>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playTap();
              onClose();
            }}
            className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl bg-yellow-200/80 dark:bg-slate-800 hover:bg-yellow-300 border border-yellow-300 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 font-bold transition-all active:scale-95 cursor-pointer"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* TOAST BANNER */}
        {toast && (
          <div
            className={`mt-2 p-2.5 rounded-xl font-extrabold text-xs sm:text-sm flex items-center justify-between shadow-xs animate-bounce ${
              toast.type === 'success'
                ? 'bg-emerald-600 text-white'
                : toast.type === 'error'
                ? 'bg-rose-600 text-white'
                : 'bg-indigo-600 text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span>{toast.text}</span>
            </div>
            <button onClick={() => setToast(null)} className="cursor-pointer text-white/80 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* KID WALLET SELECTOR BAR */}
        <div className="mt-2.5 p-2 sm:p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-yellow-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-slate-500 uppercase tracking-wide">
              Requesting As:
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {database.kids.map((kid) => {
                const isSelected = kid.id === activeKid?.id;
                return (
                  <button
                    key={kid.id}
                    onClick={() => {
                      sound.playTap();
                      setSelectedKidId(kid.id);
                    }}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-black transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-amber-400 text-slate-900 border-amber-500 shadow-xs scale-105'
                        : 'bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span>{kid.avatar || '🦁'}</span>
                    <span>{kid.name}</span>
                    <span className="px-1.5 py-0.2 rounded bg-black/10 text-[10px] font-black">
                      {kid.stars}⭐
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {activeKid && (
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <div className="px-3 py-1 rounded-xl bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 flex items-center gap-1.5">
                <span className="text-sm">⭐</span>
                <span className="text-xs font-black text-amber-950 dark:text-amber-200">
                  {activeKid.name}'s Wallet: <strong>{activeKid.stars} Stars</strong>
                </span>
              </div>
            </div>
          )}
        </div>

        {/* TABS NAVIGATION */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-yellow-200/60 dark:bg-slate-800 border border-yellow-300 dark:border-slate-700 mt-2 shrink-0 overflow-x-auto">
          <button
            onClick={() => {
              sound.playTap();
              setActiveTab('catalog');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-black whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'catalog'
                ? 'bg-indigo-900 text-white shadow-xs'
                : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 hover:bg-yellow-300/60'
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Snack Menu & Order</span>
          </button>

          <button
            onClick={() => {
              sound.playTap();
              setActiveTab('my_requests');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-black whitespace-nowrap transition-all cursor-pointer relative ${
              activeTab === 'my_requests'
                ? 'bg-indigo-900 text-white shadow-xs'
                : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 hover:bg-yellow-300/60'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Requests & Status ({kidRequests.length})</span>
            {pendingRequestsCount > 0 && isParentMode && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[10px] font-black animate-pulse">
                {pendingRequestsCount} Pending
              </span>
            )}
          </button>

          {isParentMode && (
            <button
              onClick={() => {
                sound.playTap();
                setActiveTab('admin_pricing');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-black whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'admin_pricing'
                  ? 'bg-indigo-900 text-white shadow-xs'
                  : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 hover:bg-yellow-300/60'
              }`}
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Admin Star Pricing</span>
            </button>
          )}
        </div>

        {/* MODAL BODY */}
        <div className="flex-1 overflow-y-auto py-2.5 space-y-3">
          {/* TAB 1: SNACK MENU & CATALOG */}
          {activeTab === 'catalog' && (
            <div className="space-y-3 animate-fade-in">
              {/* Category Pills & Search */}
              <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center justify-between">
                <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
                  {[
                    { id: 'all', label: 'All Items' },
                    { id: 'healthy', label: `🍓 Healthy (${getStarCostForImportance('staple', database.settings)}⭐)` },
                    { id: 'munchies', label: `🍿 Munchies (${getStarCostForImportance('common', database.settings)}⭐)` },
                    { id: 'treats', label: `🍪 Treats (${getStarCostForImportance('treat', database.settings)}⭐)` },
                    { id: 'luxury', label: `👑 Luxury (${getStarCostForImportance('luxury', database.settings)}⭐)` },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        sound.playTap();
                        setCategoryFilter(cat.id as typeof categoryFilter);
                        setIsCustomMode(false);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-black whitespace-nowrap cursor-pointer transition-all border ${
                        categoryFilter === cat.id && !isCustomMode
                          ? 'bg-amber-400 text-slate-900 border-amber-500 shadow-xs'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}

                  <button
                    onClick={() => {
                      sound.playTap();
                      setIsCustomMode(true);
                      setSelectedPreset(null);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-black whitespace-nowrap cursor-pointer transition-all border flex items-center gap-1 ${
                      isCustomMode
                        ? 'bg-purple-600 text-white border-purple-700 shadow-xs'
                        : 'bg-purple-50 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300 border-purple-300 hover:bg-purple-100'
                    }`}
                  >
                    <Plus className="w-3 h-3 stroke-[3]" />
                    <span>Custom Snack</span>
                  </button>
                </div>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search snacks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full sm:w-44 pl-7 pr-3 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              {/* CUSTOM ITEM FORM IF ACTIVE */}
              {isCustomMode ? (
                <div className="p-3.5 sm:p-4 rounded-xl bg-white dark:bg-slate-800 border-2 border-purple-400 dark:border-purple-600 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs sm:text-sm font-black text-purple-900 dark:text-purple-300 flex items-center gap-1.5">
                      <span>✏️</span>
                      <span>Request a Custom Snack or Grocery Item</span>
                    </h3>
                    <button
                      onClick={() => setIsCustomMode(false)}
                      className="text-xs font-black text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      Back to Catalog
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                    <div className="sm:col-span-6">
                      <label className="block text-[10px] font-black uppercase text-slate-600 dark:text-slate-400 mb-0.5">
                        Item Name:
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Takis Fuego, Chocolate Croissants, Blueberry Bagels..."
                        value={customName}
                        onChange={(e) => setCustomName(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-xs sm:text-sm font-black text-slate-900 dark:text-white"
                        autoFocus
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block text-[10px] font-black uppercase text-slate-600 dark:text-slate-400 mb-0.5">
                        Quantity:
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 1 bag, 2 boxes"
                        value={customQty}
                        onChange={(e) => setCustomQty(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block text-[10px] font-black uppercase text-slate-600 dark:text-slate-400 mb-0.5">
                        Expense Rating / Tier:
                      </label>
                      <select
                        value={customImportance}
                        onChange={(e) => setCustomImportance(e.target.value as GroceryImportance)}
                        className="w-full px-2 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-xs font-black text-slate-900 dark:text-white"
                      >
                        <option value="staple">🍏 Healthy Snack ({getStarCostForImportance('staple', database.settings)}⭐)</option>
                        <option value="common">📦 Everyday Snack ({getStarCostForImportance('common', database.settings)}⭐)</option>
                        <option value="treat">🍪 Sweet Treat ({getStarCostForImportance('treat', database.settings)}⭐)</option>
                        <option value="luxury">👑 Luxury / Gourmet ({getStarCostForImportance('luxury', database.settings)}⭐)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-600 dark:text-slate-400 mb-0.5">
                      Why do you want it? (Optional note for Mom & Dad):
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. For Friday movie night treat, lunchbox snack..."
                      value={customNotes}
                      onChange={(e) => setCustomNotes(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200"
                    />
                  </div>
                </div>
              ) : (
                /* GRID OF PRESET SNACKS */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {filteredCatalog.map((snack) => {
                    const isSelected = selectedPreset?.id === snack.id;
                    const snackCost = getSnackItemStarCost(snack, database.settings);
                    const canAfford = activeKid ? activeKid.stars >= snackCost : false;
                    const impMeta = GROCERY_IMPORTANCE_METADATA[snack.importance];

                    return (
                      <div
                        key={snack.id}
                        onClick={() => {
                          sound.playTap();
                          setSelectedPreset(isSelected ? null : snack);
                        }}
                        className={`p-2.5 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between select-none ${
                          isSelected
                            ? 'bg-amber-100 dark:bg-amber-950/60 border-amber-500 shadow-sm scale-[1.02]'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-amber-300'
                        }`}
                      >
                        <div>
                          <div className="flex items-start justify-between gap-1.5 mb-1">
                            <div className="flex items-center gap-2">
                              <span className="text-2xl shrink-0">{snack.icon}</span>
                              <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white leading-tight">
                                {snack.name}
                              </h4>
                            </div>

                            <span
                              className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase border shrink-0 ${impMeta.badgeBg} ${impMeta.badgeText} ${impMeta.badgeBorder}`}
                            >
                              {impMeta.label}
                            </span>
                          </div>

                          <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-medium line-clamp-2">
                            {snack.description}
                          </p>
                        </div>

                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                          <span className="text-[10px] text-slate-400 font-bold">
                            {snack.defaultQuantity}
                          </span>

                          <div className="flex items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded-md bg-amber-400 text-slate-900 font-black text-xs shadow-xs">
                              ⭐ {snackCost} Stars
                            </span>

                            {isSelected && (
                              <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-black">
                                ✓
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* CHECKOUT SUMMARY BAR */}
              {(selectedPreset || (isCustomMode && customName.trim())) && (
                <div className="p-3 sm:p-4 rounded-xl bg-gradient-to-r from-amber-100 to-yellow-100 dark:from-slate-800 dark:to-slate-850 border-2 border-amber-400 dark:border-amber-600 shadow-md flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sticky bottom-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-900 flex items-center justify-center text-2xl shadow-inner shrink-0">
                      {isCustomMode ? '✏️' : selectedPreset?.icon || '🍪'}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-600 dark:text-slate-400">
                        Selected: <strong className="text-slate-900 dark:text-white">{isCustomMode ? customName : selectedPreset?.name}</strong> ({isCustomMode ? customQty : selectedPreset?.defaultQuantity})
                      </div>
                      <div className="flex items-center gap-2 text-xs mt-0.5">
                        <span className="font-black text-amber-900 dark:text-amber-300">
                          Cost: {currentStarCost} ⭐
                        </span>
                        <span className="text-slate-400">•</span>
                        <span className="font-bold text-slate-600 dark:text-slate-300">
                          {activeKid?.name}'s Balance: {activeKid?.stars || 0} ⭐
                        </span>
                        {activeKid && activeKid.stars >= currentStarCost && (
                          <>
                            <span className="text-slate-400">•</span>
                            <span className="font-bold text-emerald-700 dark:text-emerald-400">
                              Remaining: {activeKid.stars - currentStarCost} ⭐
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {activeKid && activeKid.stars >= currentStarCost ? (
                    <button
                      onClick={() => {
                        if (isCustomMode) {
                          handlePayAndSubmitRequest(
                            customName.trim(),
                            customQty.trim() || '1 box',
                            customImportance,
                            currentStarCost,
                            customNotes.trim()
                          );
                        } else if (selectedPreset) {
                          handlePayAndSubmitRequest(
                            selectedPreset.name,
                            selectedPreset.defaultQuantity,
                            selectedPreset.importance,
                            selectedPreset.defaultStarCost,
                            selectedPreset.description
                          );
                        }
                      }}
                      className="px-5 py-2.5 rounded-xl bg-indigo-900 hover:bg-indigo-800 text-white font-black text-xs sm:text-sm shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                    >
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>Pay {currentStarCost} ⭐ & Request Snack!</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="px-3 py-1.5 rounded-xl bg-rose-100 text-rose-800 border border-rose-300 text-xs font-black">
                        Needs {currentStarCost - (activeKid?.stars || 0)} more ⭐!
                      </div>
                      <button
                        disabled
                        className="px-4 py-2.5 rounded-xl bg-slate-300 text-slate-500 font-black text-xs cursor-not-allowed opacity-70"
                      >
                        Not Enough Stars
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: MY REQUESTS & STATUS */}
          {activeTab === 'my_requests' && (
            <div className="space-y-3 animate-fade-in">
              <div className="flex items-center justify-between">
                <h3 className="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-500" />
                  <span>
                    {isParentMode ? 'All Family Grocery Requests' : `${activeKid?.name}'s Grocery & Snack Requests`} (
                    {(isParentMode ? allRequests : kidRequests).length})
                  </span>
                </h3>

                <button
                  onClick={() => {
                    sound.playTap();
                    setActiveTab('catalog');
                  }}
                  className="px-3 py-1 rounded-lg bg-amber-400 hover:bg-amber-500 text-slate-900 font-black text-xs flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3 stroke-[3]" />
                  <span>Request Another Snack</span>
                </button>
              </div>

              {(isParentMode ? allRequests : kidRequests).length === 0 ? (
                <div className="p-8 text-center bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-500 text-xs sm:text-sm font-bold">
                  No requests submitted yet! Click "Snack Menu & Order" above to request your favorite treats using stars.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {(isParentMode ? allRequests : kidRequests).map((req) => {
                    const impMeta = GROCERY_IMPORTANCE_METADATA[req.importance || 'treat'];
                    const isPending = req.status === 'pending';
                    const isApproved = req.status === 'approved';
                    const isDenied = req.status === 'denied';

                    return (
                      <div
                        key={req.id}
                        className={`p-3 rounded-xl border-2 shadow-xs flex flex-col justify-between space-y-2 bg-white dark:bg-slate-800 ${
                          isPending
                            ? 'border-amber-300 dark:border-amber-700'
                            : isApproved
                            ? 'border-emerald-300 dark:border-emerald-700'
                            : 'border-slate-300 dark:border-slate-700 opacity-80'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950 flex items-center justify-center text-xl shrink-0">
                              {req.kidAvatar || '⭐'}
                            </div>
                            <div>
                              <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                                {req.name}
                              </h4>
                              <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
                                <span>{req.kidName}</span>
                                {req.quantity && <span>• {req.quantity}</span>}
                                {req.createdAt && <span>• {req.createdAt}</span>}
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-1">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase border ${impMeta.badgeBg} ${impMeta.badgeText} ${impMeta.badgeBorder}`}
                            >
                              {impMeta.label}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-amber-400 text-slate-900 font-black text-[10px]">
                              ⭐ {req.starCost || 0} Stars
                            </span>
                          </div>
                        </div>

                        {req.notes && (
                          <div className="text-[11px] text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 p-2 rounded-lg font-medium italic">
                            "{req.notes}"
                          </div>
                        )}

                        {/* STATUS BADGE & ADMIN / KID ACTIONS */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700">
                          {isPending && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                              <Clock className="w-2.5 h-2.5 animate-spin" />
                              Pending Review
                            </span>
                          )}
                          {isApproved && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
                              <Check className="w-2.5 h-2.5" />
                              Approved on Grocery List!
                            </span>
                          )}
                          {isDenied && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-100 text-rose-900 border border-rose-300">
                              <X className="w-2.5 h-2.5" />
                              Denied • Stars Refunded
                            </span>
                          )}

                          <div className="flex items-center gap-1.5">
                            {/* Kid action: Cancel pending request and refund stars */}
                            {isPending && !isParentMode && (
                              <button
                                onClick={() => handleCancelRequest(req)}
                                className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-[10px] flex items-center gap-1 cursor-pointer"
                              >
                                <RotateCcw className="w-2.5 h-2.5" />
                                <span>Cancel & Refund {req.starCost}⭐</span>
                              </button>
                            )}

                            {/* Admin actions: Edit star cost, Approve, Deny */}
                            {isParentMode && (
                              <>
                                <button
                                  onClick={() => {
                                    setEditingRequestStarCost(req);
                                    setNewStarCostInput(req.starCost || 0);
                                  }}
                                  className="px-2 py-1 rounded-lg bg-purple-100 hover:bg-purple-200 text-purple-900 font-black text-[10px] flex items-center gap-1 cursor-pointer border border-purple-300"
                                  title="Edit required stars for this request"
                                >
                                  <Edit2 className="w-2.5 h-2.5" />
                                  <span>Edit Stars</span>
                                </button>

                                {isPending && (
                                  <>
                                    <button
                                      onClick={() => handleAdminApprove(req)}
                                      className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] flex items-center gap-1 shadow-xs cursor-pointer"
                                    >
                                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                                      <span>Approve</span>
                                    </button>

                                    <button
                                      onClick={() => {
                                        setDenyingRequest(req);
                                        setDenyReasonText('');
                                      }}
                                      className="px-2 py-1 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-800 font-black text-[10px] cursor-pointer"
                                    >
                                      Deny
                                    </button>
                                  </>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ADMIN PRICING RATES CONFIGURATION */}
          {activeTab === 'admin_pricing' && isParentMode && (
            <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border-2 border-indigo-200 dark:border-indigo-800 space-y-4 animate-fade-in">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-indigo-600" />
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    Admin Snack Star Pricing Configuration
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Adjust default star requirements according to the expensive or treat nature of snacks in your household economy.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800">
                  <label className="block text-xs font-black text-blue-900 dark:text-blue-200 mb-1">
                    🍏 Healthy & Fresh Snacks (Staple Tier):
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={pricingTiers.staple}
                      onChange={(e) => setPricingTiers({ ...pricingTiers, staple: Number(e.target.value) })}
                      className="w-24 px-3 py-1.5 rounded-lg border border-blue-300 bg-white dark:bg-slate-900 font-black text-sm text-slate-900 dark:text-white"
                    />
                    <span className="text-xs font-bold text-slate-500">Stars (e.g. Berries, Carrots, Bananas)</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700">
                  <label className="block text-xs font-black text-slate-900 dark:text-slate-200 mb-1">
                    📦 Everyday Munchies (Common Tier):
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={pricingTiers.common}
                      onChange={(e) => setPricingTiers({ ...pricingTiers, common: Number(e.target.value) })}
                      className="w-24 px-3 py-1.5 rounded-lg border border-slate-300 bg-white dark:bg-slate-900 font-black text-sm text-slate-900 dark:text-white"
                    />
                    <span className="text-xs font-bold text-slate-500">Stars (e.g. Goldfish, Chips, Popcorn)</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
                  <label className="block text-xs font-black text-amber-900 dark:text-amber-200 mb-1">
                    🍪 Sweet Treats & Desserts (Treat Tier):
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={pricingTiers.treat}
                      onChange={(e) => setPricingTiers({ ...pricingTiers, treat: Number(e.target.value) })}
                      className="w-24 px-3 py-1.5 rounded-lg border border-amber-300 bg-white dark:bg-slate-900 font-black text-sm text-slate-900 dark:text-white"
                    />
                    <span className="text-xs font-bold text-slate-500">Stars (e.g. Ice Cream Tub, Cookies, Soda)</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800">
                  <label className="block text-xs font-black text-purple-900 dark:text-purple-200 mb-1">
                    👑 Luxury & Gourmet Treats (Luxury Tier):
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={pricingTiers.luxury}
                      onChange={(e) => setPricingTiers({ ...pricingTiers, luxury: Number(e.target.value) })}
                      className="w-24 px-3 py-1.5 rounded-lg border border-purple-300 bg-white dark:bg-slate-900 font-black text-sm text-slate-900 dark:text-white"
                    />
                    <span className="text-xs font-bold text-slate-500">Stars (e.g. Beef Jerky, Gelato, Frappuccino)</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleSavePricingTiers}
                  className="px-5 py-2.5 rounded-xl bg-indigo-900 hover:bg-indigo-800 text-white font-black text-xs sm:text-sm shadow-md cursor-pointer"
                >
                  Save Default Pricing Tiers
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ADMIN MODAL: EDIT STAR COST FOR INDIVIDUAL REQUEST */}
        {editingRequestStarCost && (
          <div className="fixed inset-0 z-80 flex items-center justify-center p-3 bg-slate-950/80 backdrop-blur-xs animate-fade-in">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-5 max-w-sm w-full shadow-2xl border-2 border-purple-400 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Edit2 className="w-4 h-4 text-purple-600" />
                  <span>Edit Star Requirement</span>
                </h3>
                <button
                  onClick={() => setEditingRequestStarCost(null)}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-500 font-medium">
                Adjust required stars for <strong>{editingRequestStarCost.name}</strong> requested by{' '}
                <strong>{editingRequestStarCost.kidName}</strong>.
              </p>

              <div>
                <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Required Stars:
                </label>
                <input
                  type="number"
                  min={0}
                  max={200}
                  value={newStarCostInput}
                  onChange={(e) => setNewStarCostInput(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border-2 border-purple-300 bg-white dark:bg-slate-900 font-black text-base text-slate-900 dark:text-white"
                  autoFocus
                />
                <span className="text-[10px] text-slate-400 font-bold block mt-1">
                  Kid's star balance will be automatically adjusted to match the difference.
                </span>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setEditingRequestStarCost(null)}
                  className="flex-1 py-2 rounded-xl border border-slate-300 font-black text-xs text-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEditedStarCost}
                  className="flex-1 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs shadow-xs cursor-pointer"
                >
                  Save & Adjust Stars
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ADMIN MODAL: DENY REQUEST REASON */}
        {denyingRequest && (
          <div className="fixed inset-0 z-80 flex items-center justify-center p-3 bg-slate-950/80 backdrop-blur-xs animate-fade-in">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-5 max-w-sm w-full shadow-2xl border-2 border-rose-400 space-y-3">
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                <span>Deny Request & Refund Stars</span>
              </h3>

              <p className="text-xs text-slate-500 font-medium">
                Denying <strong>{denyingRequest.name}</strong> will immediately refund{' '}
                <strong>{denyingRequest.starCost || 0} ⭐</strong> back to {denyingRequest.kidName}.
              </p>

              <div>
                <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Reason for Child:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Too much sugar this week, Out of season..."
                  value={denyReasonText}
                  onChange={(e) => setDenyReasonText(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white"
                  autoFocus
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setDenyingRequest(null)}
                  className="flex-1 py-2 rounded-xl border border-slate-300 font-black text-xs text-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAdminConfirmDenial}
                  className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-xs cursor-pointer"
                >
                  Deny & Refund Stars
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
