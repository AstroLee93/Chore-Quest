import React, { useState, useRef, useMemo } from 'react';
import {
  X,
  Upload,
  Camera,
  Receipt,
  Sparkles,
  Check,
  CheckSquare,
  Square,
  Plus,
  Trash2,
  Package,
  ShoppingCart,
  TrendingDown,
  DollarSign,
  AlertCircle,
  RefreshCw,
  Store,
  Calendar,
} from 'lucide-react';
import {
  GroceryCategory,
  GroceryItem,
  PantryStapleItem,
  PriceHistoryEntry,
  ImportedReceiptSummary,
} from '../types';
import {
  ParsedReceiptItem,
  parseReceiptImageApi,
  normalizeItemKey,
} from '../utils/groceryPricing';
import { sound } from '../utils/sound';

interface ReceiptImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingGroceryItems?: { id?: string; name: string; category?: GroceryCategory }[];
  existingPantryStaples?: { id?: string; name: string; category?: GroceryCategory }[];
  onImportSuccess: (data: {
    importedItems: ParsedReceiptItem[];
    storeName?: string;
    receiptDate?: string;
    totalAmount?: number;
    syncToPantry: boolean;
    syncToGroceryList: boolean;
    savePriceHistory: boolean;
  }) => void;
}

interface EditableReceiptItem extends ParsedReceiptItem {
  id: string;
  selected: boolean;
  matchesExistingGroceryId?: string;
  matchesExistingGroceryName?: string;
  matchesExistingPantryId?: string;
}

const CATEGORY_LABELS: Record<GroceryCategory, { label: string; icon: string }> = {
  produce: { label: 'Produce', icon: '🥦' },
  dairy_eggs: { label: 'Dairy & Eggs', icon: '🥛' },
  meat_seafood: { label: 'Meat & Seafood', icon: '🥩' },
  bakery: { label: 'Bakery', icon: '🍞' },
  pantry: { label: 'Pantry Staples', icon: '🥫' },
  frozen: { label: 'Frozen', icon: '🧊' },
  snacks: { label: 'Snacks & Treats', icon: '🍿' },
  beverages: { label: 'Beverages', icon: '🧃' },
  household: { label: 'Household', icon: '🧼' },
  other: { label: 'Other', icon: '📦' },
};

// Realistic sample receipts for immediate testing without taking photos
const SAMPLE_RECEIPTS = [
  {
    title: "Trader Joe's Pantry Run",
    storeName: "Trader Joe's",
    receiptDate: new Date().toISOString().split('T')[0],
    subtotal: 21.44,
    tax: 0.85,
    total: 22.29,
    items: [
      { name: 'Organic Whole Milk', price: 3.99, quantity: '1 gal', category: 'dairy_eggs' as GroceryCategory, notes: 'Pasture raised' },
      { name: 'Cage Free Large Brown Eggs', price: 3.49, quantity: '1 dozen', category: 'dairy_eggs' as GroceryCategory, notes: 'Grade A' },
      { name: 'Organic Bananas', price: 1.49, quantity: '2 lbs', category: 'produce' as GroceryCategory, notes: 'Yellow fresh' },
      { name: 'Sourdough Sandwich Bread', price: 3.69, quantity: '1 loaf', category: 'bakery' as GroceryCategory, notes: 'Sliced loaf' },
      { name: 'Extra Virgin Olive Oil', price: 6.49, quantity: '500 ml', category: 'pantry' as GroceryCategory, notes: 'Cold pressed' },
      { name: 'Ground Cinnamon', price: 2.29, quantity: '1 jar', category: 'pantry' as GroceryCategory, notes: 'Organic spice' },
    ],
  },
  {
    title: 'Walmart Weekly Restock',
    storeName: 'Walmart Supercenter',
    receiptDate: new Date().toISOString().split('T')[0],
    subtotal: 27.85,
    tax: 1.40,
    total: 29.25,
    items: [
      { name: 'Boneless Skinless Chicken Breasts', price: 8.98, quantity: '2.5 lbs', category: 'meat_seafood' as GroceryCategory, notes: 'Family pack' },
      { name: 'Gala Apples', price: 3.28, quantity: '3 lbs bag', category: 'produce' as GroceryCategory, notes: 'Crisp' },
      { name: 'Cheddar Cheese Block', price: 2.74, quantity: '8 oz', category: 'dairy_eggs' as GroceryCategory, notes: 'Sharp' },
      { name: 'Peanut Butter Creamy', price: 2.38, quantity: '16 oz', category: 'pantry' as GroceryCategory, notes: 'No stir' },
      { name: 'Paper Towels 6-Pack', price: 7.48, quantity: '6 rolls', category: 'household' as GroceryCategory, notes: 'Select-a-size' },
      { name: 'Sparkling Water 12-Pack', price: 2.99, quantity: '12 cans', category: 'beverages' as GroceryCategory, notes: 'Lime flavor' },
    ],
  },
  {
    title: 'Kroger Produce & Snacks',
    storeName: 'Kroger',
    receiptDate: new Date().toISOString().split('T')[0],
    subtotal: 18.60,
    tax: 0.90,
    total: 19.50,
    items: [
      { name: 'Fresh Strawberries', price: 3.99, quantity: '1 lb', category: 'produce' as GroceryCategory, notes: 'Sweet berries' },
      { name: 'Whole Baby Carrots', price: 1.49, quantity: '1 lb bag', category: 'produce' as GroceryCategory, notes: 'Snack size' },
      { name: 'Tortilla Chips', price: 2.99, quantity: '13 oz bag', category: 'snacks' as GroceryCategory, notes: 'Restaurant style' },
      { name: 'Mild Chunky Salsa', price: 2.49, quantity: '16 oz jar', category: 'pantry' as GroceryCategory, notes: 'Medium' },
      { name: 'Greek Yogurt Plain', price: 4.69, quantity: '32 oz tub', category: 'dairy_eggs' as GroceryCategory, notes: 'Whole milk' },
      { name: 'Organic Black Beans', price: 2.95, quantity: '2 cans', category: 'pantry' as GroceryCategory, notes: 'Low sodium' },
    ],
  },
];

export const ReceiptImportModal: React.FC<ReceiptImportModalProps> = ({
  isOpen,
  onClose,
  existingGroceryItems = [],
  existingPantryStaples = [],
  onImportSuccess,
}) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [lastRawImage, setLastRawImage] = useState<string | null>(null);
  const [lastRawMime, setLastRawMime] = useState<string>('image/jpeg');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [isOptimizing, setIsOptimizing] = useState<boolean>(false);
  const [scanError, setScanError] = useState<string | null>(null);

  // Extracted data
  const [storeName, setStoreName] = useState<string>('');
  const [receiptDate, setReceiptDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [receiptTotal, setReceiptTotal] = useState<number | null>(null);
  const [items, setItems] = useState<EditableReceiptItem[]>([]);
  const [isParsed, setIsParsed] = useState<boolean>(false);

  // Sync settings
  const [syncToPantry, setSyncToPantry] = useState<boolean>(true);
  const [syncToGroceryList, setSyncToGroceryList] = useState<boolean>(true);
  const [savePriceHistory, setSavePriceHistory] = useState<boolean>(true);

  // Filter & item management
  const [searchQuery, setSearchQuery] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const matchItem = (name: string) => {
    const norm = normalizeItemKey(name);
    const matchedGrocery = existingGroceryItems.find((it) => {
      const gNorm = normalizeItemKey(it.name);
      return gNorm === norm || norm.includes(gNorm) || gNorm.includes(norm);
    });

    const matchedPantry = existingPantryStaples.find((it) => {
      const pNorm = normalizeItemKey(it.name);
      return pNorm === norm || norm.includes(pNorm) || pNorm.includes(norm);
    });

    return {
      grocery: matchedGrocery,
      pantry: matchedPantry,
    };
  };

  const optimizeImageForOcr = async (file: File): Promise<{ base64: string; mime: string }> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        const rawData = reader.result as string;
        const img = new Image();
        img.onload = () => {
          // Constrain large camera resolutions to 1600px max dimension
          const MAX_DIM = 1600;
          let { width, height } = img;
          if (width > MAX_DIM || height > MAX_DIM) {
            if (width > height) {
              height = Math.round((height * MAX_DIM) / width);
              width = MAX_DIM;
            } else {
              width = Math.round((width * MAX_DIM) / height);
              height = MAX_DIM;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const optimizedBase64 = canvas.toDataURL('image/jpeg', 0.85);
            resolve({ base64: optimizedBase64, mime: 'image/jpeg' });
            return;
          }
          resolve({ base64: rawData, mime: file.type || 'image/jpeg' });
        };
        img.onerror = () => {
          resolve({ base64: rawData, mime: file.type || 'image/jpeg' });
        };
        img.src = rawData;
      };
      reader.onerror = () => {
        resolve({ base64: '', mime: file.type || 'image/jpeg' });
      };
      reader.readAsDataURL(file);
    });
  };

  const handleProcessImage = async (base64Image: string, mime = 'image/jpeg') => {
    setIsScanning(true);
    setScanError(null);
    setLastRawImage(base64Image);
    setLastRawMime(mime);
    sound.playTap();

    try {
      const res = await parseReceiptImageApi(base64Image, mime);
      if (!res.success && !res.items?.length) {
        throw new Error(res.error || 'Failed to extract items from receipt image.');
      }

      setStoreName(res.storeName || 'Grocery Store');
      if (res.receiptDate) {
        setReceiptDate(res.receiptDate);
      }
      setReceiptTotal(res.total || null);

      const mapped: EditableReceiptItem[] = (res.items || []).map((it, idx) => {
        const matches = matchItem(it.name);
        return {
          ...it,
          id: `receipt-item-${Date.now()}-${idx}`,
          selected: true,
          matchesExistingGroceryId: matches.grocery?.id,
          matchesExistingGroceryName: matches.grocery?.name,
          matchesExistingPantryId: matches.pantry?.id,
        };
      });

      setItems(mapped);
      setIsParsed(true);
      sound.playChoreComplete();
    } catch (err: any) {
      console.error('Receipt parse error:', err);
      setScanError(err.message || 'Could not parse receipt image. Please try again or load a sample receipt.');
      sound.playSkipNotice();
    } finally {
      setIsScanning(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsOptimizing(true);
    try {
      const { base64, mime } = await optimizeImageForOcr(file);
      setImagePreview(base64);
      await handleProcessImage(base64, mime);
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setIsOptimizing(true);
      try {
        const { base64, mime } = await optimizeImageForOcr(file);
        setImagePreview(base64);
        await handleProcessImage(base64, mime);
      } finally {
        setIsOptimizing(false);
      }
    }
  };

  const loadSampleReceipt = (sampleIndex: number) => {
    const sample = SAMPLE_RECEIPTS[sampleIndex];
    setImagePreview(null);
    setStoreName(sample.storeName);
    setReceiptDate(sample.receiptDate);
    setReceiptTotal(sample.total);

    const mapped: EditableReceiptItem[] = sample.items.map((it, idx) => {
      const matches = matchItem(it.name);
      return {
        ...it,
        id: `sample-receipt-item-${Date.now()}-${idx}`,
        selected: true,
        matchesExistingGroceryId: matches.grocery?.id,
        matchesExistingGroceryName: matches.grocery?.name,
        matchesExistingPantryId: matches.pantry?.id,
      };
    });

    setItems(mapped);
    setIsParsed(true);
    setScanError(null);
    sound.playRewardRedeemed();
  };

  const toggleItemSelection = (id: string) => {
    sound.playTap();
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, selected: !it.selected } : it))
    );
  };

  const toggleSelectAll = () => {
    sound.playTap();
    const allSelected = items.every((it) => it.selected);
    setItems((prev) => prev.map((it) => ({ ...it, selected: !allSelected })));
  };

  const updateItemField = (id: string, field: keyof ParsedReceiptItem, value: any) => {
    setItems((prev) =>
      prev.map((it) => {
        if (it.id === id) {
          const updated = { ...it, [field]: value };
          if (field === 'name') {
            const matches = matchItem(String(value));
            updated.matchesExistingGroceryId = matches.grocery?.id;
            updated.matchesExistingGroceryName = matches.grocery?.name;
            updated.matchesExistingPantryId = matches.pantry?.id;
          }
          return updated;
        }
        return it;
      })
    );
  };

  const removeItem = (id: string) => {
    sound.playTap();
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  const addItemManually = () => {
    sound.playTap();
    const newItem: EditableReceiptItem = {
      id: `manual-item-${Date.now()}`,
      name: 'New Grocery Item',
      price: 2.99,
      quantity: '1',
      category: 'pantry',
      selected: true,
    };
    setItems((prev) => [newItem, ...prev]);
  };

  // Calculations
  const selectedItems = useMemo(() => items.filter((it) => it.selected), [items]);
  const selectedSum = useMemo(
    () => selectedItems.reduce((acc, it) => acc + (it.price || 0), 0),
    [selectedItems]
  );

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const q = searchQuery.toLowerCase();
    return items.filter(
      (it) =>
        it.name.toLowerCase().includes(q) ||
        it.category.toLowerCase().includes(q) ||
        (it.notes && it.notes.toLowerCase().includes(q))
    );
  }, [items, searchQuery]);

  const handleConfirmImport = () => {
    if (selectedItems.length === 0) return;
    sound.playRewardRedeemed();

    onImportSuccess({
      importedItems: selectedItems.map((it) => ({
        name: it.name.trim(),
        price: Number(it.price.toFixed(2)),
        quantity: it.quantity || '1',
        category: it.category,
        notes: it.notes || '',
      })),
      storeName: storeName.trim() || undefined,
      receiptDate: receiptDate || undefined,
      totalAmount: Number(selectedSum.toFixed(2)),
      syncToPantry,
      syncToGroceryList,
      savePriceHistory,
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      id="modal-receipt-import-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200"
    >
      <div
        id="modal-receipt-import-card"
        className="w-full max-w-4xl bg-white dark:bg-slate-900 border-2 border-amber-300 dark:border-amber-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] my-auto"
      >
        {/* MODAL HEADER */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-slate-950 flex items-center justify-between shadow-md shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/30 backdrop-blur-xs flex items-center justify-center text-2xl shadow-xs shrink-0">
              🧾
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black tracking-tight text-slate-950">
                  Import Store Receipt
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-slate-950 text-amber-300 font-black text-[10px] uppercase tracking-wider">
                  AI Powered
                </span>
              </div>
              <p className="text-xs text-slate-900 font-semibold opacity-90">
                OCR receipt scanner: restocks pantry, tracks actual item costs, & refines budget estimates.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playTap();
              onClose();
            }}
            className="w-9 h-9 rounded-xl bg-black/10 hover:bg-black/20 flex items-center justify-center text-slate-950 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MODAL CONTENT BODY */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1 text-slate-800 dark:text-slate-100">
          {/* STEP 1: UPLOAD & SAMPLE SECTION (Always available or collapsible when parsed) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs sm:text-sm font-black text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <span>📸 Step 1: Upload Receipt Photo or Try Sample</span>
              </label>
              {isParsed && (
                <button
                  onClick={() => {
                    setIsParsed(false);
                    setImagePreview(null);
                    setItems([]);
                    setScanError(null);
                  }}
                  className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Scan Different Receipt</span>
                </button>
              )}
            </div>

            {!isParsed ? (
              <div className="space-y-3">
                {/* Drag & Drop Box */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer ${
                    isDragging
                      ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/20 scale-[1.01]'
                      : 'border-slate-300 dark:border-slate-700 hover:border-amber-400 bg-slate-50 dark:bg-slate-800/50'
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {isScanning || isOptimizing ? (
                    <div className="py-6 flex flex-col items-center justify-center space-y-3 animate-pulse">
                      <div className="w-14 h-14 rounded-full bg-amber-400/20 text-amber-500 flex items-center justify-center text-2xl animate-spin">
                        <Sparkles className="w-7 h-7" />
                      </div>
                      <p className="font-black text-sm text-amber-900 dark:text-amber-300">
                        {isOptimizing
                          ? 'Optimizing receipt photo for fast AI scanning...'
                          : 'Analyzing receipt with Gemini AI...'}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm text-center">
                        {isOptimizing
                          ? 'Resizing and preparing high-resolution image...'
                          : 'Extracting store name, purchase date, line items, and unit prices with resilient model fallback...'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center">
                        <Upload className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-black text-sm text-slate-900 dark:text-slate-100">
                          Drop your receipt photo here, or browse files
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          Supports PNG, JPG, JPEG, WEBP photos of grocery store register receipts
                        </p>
                      </div>

                      <div className="flex items-center justify-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            fileInputRef.current?.click();
                          }}
                          className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-sm hover:opacity-90 cursor-pointer"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Choose Photo</span>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            cameraInputRef.current?.click();
                          }}
                          className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-sm hover:bg-amber-600 cursor-pointer"
                        >
                          <Camera className="w-3.5 h-3.5" />
                          <span>Take Photo</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Error Banner with Retry */}
                {scanError && (
                  <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border-2 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200 text-xs font-semibold flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs animate-in fade-in">
                    <div className="flex items-start sm:items-center gap-2.5">
                      <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5 sm:mt-0" />
                      <span>{scanError}</span>
                    </div>
                    {lastRawImage && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleProcessImage(lastRawImage, lastRawMime);
                        }}
                        disabled={isScanning}
                        className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shrink-0 cursor-pointer shadow-xs transition-all flex items-center justify-center gap-1.5 self-end sm:self-center"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
                        <span>Retry Scan</span>
                      </button>
                    )}
                  </div>
                )}

                {/* Quick Samples Section */}
                <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-950 dark:text-amber-200 mb-2">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>No receipt photo handy? Test with realistic family grocery samples:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {SAMPLE_RECEIPTS.map((s, idx) => (
                      <button
                        key={s.title}
                        type="button"
                        onClick={() => loadSampleReceipt(idx)}
                        className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-700/60 hover:border-amber-500 text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5 shadow-2xs hover:bg-amber-100/50 dark:hover:bg-amber-900/30 transition-all cursor-pointer"
                      >
                        <span>🛒</span>
                        <span>{s.title}</span>
                        <span className="text-[10px] px-1.5 py-0.2 bg-amber-200 dark:bg-amber-900/60 rounded-md font-mono">
                          ${s.total.toFixed(2)}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* Compact view of image when already parsed */
              <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Receipt preview"
                      className="w-12 h-12 object-cover rounded-xl border border-slate-300 dark:border-slate-600"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-amber-200 dark:bg-amber-900 flex items-center justify-center text-xl">
                      🧾
                    </div>
                  )}
                  <div>
                    <p className="font-bold text-xs text-slate-900 dark:text-slate-100">
                      Receipt Scanned: {storeName || 'Store'}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {items.length} items detected • {selectedItems.length} selected for import
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">
                    Total Charged
                  </span>
                  <span className="text-base font-black text-emerald-600 dark:text-emerald-400 font-mono">
                    ${(receiptTotal ?? selectedSum).toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* STEP 2: METADATA & SYNC OPTIONS (Shown once parsed) */}
          {isParsed && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Receipt Metadata Header (Store & Date) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1 mb-1">
                    <Store className="w-3.5 h-3.5 text-amber-500" />
                    <span>Store / Merchant Name</span>
                  </label>
                  <input
                    type="text"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    placeholder="e.g. Trader Joe's, Walmart, Kroger"
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1 mb-1">
                    <Calendar className="w-3.5 h-3.5 text-amber-500" />
                    <span>Purchase Date</span>
                  </label>
                  <input
                    type="date"
                    value={receiptDate}
                    onChange={(e) => setReceiptDate(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-amber-500"
                  />
                </div>
              </div>

              {/* THREE SYNC DESTINATION CHECKBOXES */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-amber-50 dark:from-emerald-950/20 dark:via-teal-950/20 dark:to-amber-950/20 border border-emerald-300 dark:border-emerald-800/60 space-y-2.5">
                <div className="flex items-center gap-1.5 text-xs font-black text-emerald-950 dark:text-emerald-200">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Choose Where Receipt Data Syncs:</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {/* Option 1: Pantry Replenish Tracker */}
                  <label className="flex items-start gap-2 p-2.5 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-emerald-200 dark:border-emerald-800/50 cursor-pointer hover:bg-white dark:hover:bg-slate-800 transition-colors">
                    <input
                      type="checkbox"
                      checked={syncToPantry}
                      onChange={(e) => setSyncToPantry(e.target.checked)}
                      className="mt-0.5 rounded-sm text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                    <div>
                      <span className="font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center gap-1">
                        <Package className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Restock Pantry</span>
                      </span>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Marks items as In-Stock & stores unit cost in pantry catalogue
                      </p>
                    </div>
                  </label>

                  {/* Option 2: Weekly Grocery & Estimates List */}
                  <label className="flex items-start gap-2 p-2.5 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-teal-200 dark:border-teal-800/50 cursor-pointer hover:bg-white dark:hover:bg-slate-800 transition-colors">
                    <input
                      type="checkbox"
                      checked={syncToGroceryList}
                      onChange={(e) => setSyncToGroceryList(e.target.checked)}
                      className="mt-0.5 rounded-sm text-teal-600 focus:ring-teal-500 cursor-pointer"
                    />
                    <div>
                      <span className="font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center gap-1">
                        <ShoppingCart className="w-3.5 h-3.5 text-teal-600" />
                        <span>Weekly Grocery Trip</span>
                      </span>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Checks off matching grocery items and logs real actualCost
                      </p>
                    </div>
                  </label>

                  {/* Option 3: Price Memory & Budget History */}
                  <label className="flex items-start gap-2 p-2.5 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-amber-200 dark:border-amber-800/50 cursor-pointer hover:bg-white dark:hover:bg-slate-800 transition-colors">
                    <input
                      type="checkbox"
                      checked={savePriceHistory}
                      onChange={(e) => setSavePriceHistory(e.target.checked)}
                      className="mt-0.5 rounded-sm text-amber-600 focus:ring-amber-500 cursor-pointer"
                    />
                    <div>
                      <span className="font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center gap-1">
                        <DollarSign className="w-3.5 h-3.5 text-amber-600" />
                        <span>Price Memory</span>
                      </span>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Uses receipt prices for future automatic grocery budget estimates
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* STEP 3: EXTRACTED ITEMS REVIEW TABLE */}
              <div className="space-y-2.5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-slate-100">
                      🛒 Scanned Items ({filteredItems.length})
                    </span>
                    <button
                      type="button"
                      onClick={toggleSelectAll}
                      className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      {items.every((it) => it.selected) ? (
                        <>
                          <CheckSquare className="w-3.5 h-3.5" />
                          <span>Deselect All</span>
                        </>
                      ) : (
                        <>
                          <Square className="w-3.5 h-3.5" />
                          <span>Select All</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Filter items..."
                      className="px-2.5 py-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-slate-100 w-full sm:w-44 focus:outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={addItemManually}
                      className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1 shrink-0 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Item</span>
                    </button>
                  </div>
                </div>

                {/* Items List */}
                <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                  {filteredItems.map((item) => (
                    <div
                      key={item.id}
                      className={`p-3 rounded-2xl border transition-all ${
                        item.selected
                          ? 'bg-white dark:bg-slate-800/90 border-slate-300 dark:border-slate-600 shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-60'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
                        {/* Checkbox & Name Input */}
                        <div className="flex items-center gap-2.5 flex-1 min-w-0 w-full sm:w-auto">
                          <button
                            type="button"
                            onClick={() => toggleItemSelection(item.id)}
                            className="text-slate-400 hover:text-amber-500 transition-colors shrink-0 cursor-pointer"
                          >
                            {item.selected ? (
                              <CheckSquare className="w-5 h-5 text-amber-500" />
                            ) : (
                              <Square className="w-5 h-5" />
                            )}
                          </button>

                          <div className="flex-1 min-w-0">
                            <input
                              type="text"
                              value={item.name}
                              onChange={(e) => updateItemField(item.id, 'name', e.target.value)}
                              className="w-full font-black text-xs sm:text-sm text-slate-900 dark:text-slate-100 bg-transparent border-b border-transparent hover:border-slate-300 dark:hover:border-slate-600 focus:border-amber-500 focus:outline-hidden py-0.5"
                            />
                            {/* Match badges */}
                            <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                              {item.matchesExistingGroceryName && (
                                <span className="px-1.5 py-0.2 rounded-md bg-teal-100 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 text-[10px] font-bold flex items-center gap-1">
                                  <ShoppingCart className="w-2.5 h-2.5" />
                                  <span>Matches grocery: "{item.matchesExistingGroceryName}"</span>
                                </span>
                              )}
                              {item.matchesExistingPantryId && (
                                <span className="px-1.5 py-0.2 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold flex items-center gap-1">
                                  <Package className="w-2.5 h-2.5" />
                                  <span>In Pantry Catalog</span>
                                </span>
                              )}
                              {!item.matchesExistingPantryId && (
                                <span className="px-1.5 py-0.2 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[10px] font-bold">
                                  + New Pantry Item
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Category, Quantity, Price, and Delete */}
                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto w-full sm:w-auto justify-end">
                          {/* Category select */}
                          <select
                            value={item.category}
                            onChange={(e) =>
                              updateItemField(item.id, 'category', e.target.value as GroceryCategory)
                            }
                            className="px-2 py-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-hidden focus:border-amber-500"
                          >
                            {Object.entries(CATEGORY_LABELS).map(([catKey, { label, icon }]) => (
                              <option key={catKey} value={catKey}>
                                {icon} {label}
                              </option>
                            ))}
                          </select>

                          {/* Quantity */}
                          <input
                            type="text"
                            value={item.quantity}
                            onChange={(e) => updateItemField(item.id, 'quantity', e.target.value)}
                            placeholder="Qty"
                            className="w-16 px-2 py-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold text-center text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-amber-500"
                          />

                          {/* Price input */}
                          <div className="relative">
                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                              $
                            </span>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={item.price}
                              onChange={(e) =>
                                updateItemField(item.id, 'price', parseFloat(e.target.value) || 0)
                              }
                              className="w-20 pl-5 pr-2 py-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-black text-right text-emerald-600 dark:text-emerald-400 font-mono focus:outline-hidden focus:border-emerald-500"
                            />
                          </div>

                          {/* Delete Item */}
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                            title="Remove line item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {filteredItems.length === 0 && (
                    <div className="p-8 text-center text-slate-400 text-xs font-bold border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                      No items match your search.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
            <button
              type="button"
              onClick={() => {
                sound.playTap();
                onClose();
              }}
              className="px-4 py-2.5 rounded-2xl border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs cursor-pointer transition-colors"
            >
              Cancel
            </button>

            {isParsed && (
              <div className="text-xs">
                <span className="text-slate-500 dark:text-slate-400 font-semibold">
                  Selected Items ({selectedItems.length}):{' '}
                </span>
                <span className="font-black text-emerald-600 dark:text-emerald-400 font-mono text-sm">
                  ${selectedSum.toFixed(2)}
                </span>
                {receiptTotal && Math.abs(receiptTotal - selectedSum) > 0.05 && (
                  <span className="text-[10px] text-slate-400 block font-normal">
                    (Receipt total: ${receiptTotal.toFixed(2)})
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="w-full sm:w-auto">
            {isParsed ? (
              <button
                type="button"
                onClick={handleConfirmImport}
                disabled={selectedItems.length === 0}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer transition-all"
              >
                <Check className="w-4 h-4" />
                <span>
                  Import {selectedItems.length} Items to Pantry & Budget (${selectedSum.toFixed(2)})
                </span>
              </button>
            ) : (
              <p className="text-xs text-slate-400 text-center sm:text-right">
                Upload or choose a sample receipt above to begin
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
