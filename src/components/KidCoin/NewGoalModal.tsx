import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { SavingsGoal, KidProfile } from '../../types';
import { POPULAR_RETAIL_DATABASE, RetailProduct } from '../../lib/retailCatalog';
import { generateDefaultMilestones } from '../../utils/kidCoin';
import { sound } from '../../utils/sound';
import { GoalIcon } from './GoalIcon';
import {
  X,
  Sparkles,
  CheckCircle2,
  Plus,
  ShieldCheck,
  Target,
  Rocket,
  Search,
  Barcode,
  Camera,
  Store,
  ExternalLink,
  Tag,
  Loader2,
  AlertCircle,
  ShoppingBag,
  Info,
  Check,
} from 'lucide-react';

interface NewGoalModalProps {
  isOpen: boolean;
  kid: KidProfile;
  onClose: () => void;
  onSaveGoal: (goal: SavingsGoal) => void;
}

const RETAILER_PRESETS = [
  { id: 'all', label: 'All Stores', icon: '🏪', color: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200' },
  { id: 'amazon', label: 'Amazon (ASIN)', icon: '📦', color: 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300' },
  { id: 'bestbuy', label: 'Best Buy (SKU)', icon: '🏷️', color: 'bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-300' },
  { id: 'target', label: 'Target (DPCI)', icon: '🎯', color: 'bg-red-100 text-red-900 dark:bg-red-950 dark:text-red-300' },
  { id: 'walmart', label: 'Walmart (Item#)', icon: '🏬', color: 'bg-sky-100 text-sky-900 dark:bg-sky-950 dark:text-sky-300' },
  { id: 'microcenter', label: 'Micro Center (SKU)', icon: '💻', color: 'bg-purple-100 text-purple-900 dark:bg-purple-950 dark:text-purple-300' },
  { id: 'apple', label: 'Apple', icon: '🍎', color: 'bg-slate-200 text-slate-900 dark:bg-slate-700 dark:text-white' },
];

const SAMPLE_BARCODES = [
  { label: 'PS5 Slim (Best Buy SKU)', code: '6522854', store: 'Best Buy' },
  { label: 'Switch OLED (Target DPCI)', code: '057-00-0089', store: 'Target' },
  { label: 'LEGO Falcon (Amazon ASIN)', code: 'B07NDXZV2B', store: 'Amazon' },
  { label: 'AirPods 4 (Apple Part)', code: 'MXP63AM/A', store: 'Apple' },
  { label: 'RTX 4060 PC (Micro Center)', code: '654321', store: 'Micro Center' },
  { label: 'Segway E8 (Walmart UPC)', code: '850024823019', store: 'Walmart' },
];

export const NewGoalModal: React.FC<NewGoalModalProps> = ({
  isOpen,
  kid,
  onClose,
  onSaveGoal,
}) => {
  // Navigation tabs: 'ai-retail' | 'catalog' | 'custom'
  const [tab, setTab] = useState<'ai-retail' | 'catalog' | 'custom'>('ai-retail');

  // AI Retail Lookup state
  const [selectedRetailer, setSelectedRetailer] = useState('all');
  const [lookupQuery, setLookupQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<any | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchSource, setSearchSource] = useState<'gemini-ai' | 'local-database' | null>(null);

  // Barcode Scanner Simulator / Live Camera State
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [scannerCameraActive, setScannerCameraActive] = useState(false);
  const [scannerError, setScannerError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Catalog tab filtering
  const [catalogFilter, setCatalogFilter] = useState('all');
  const [selectedCatalogItem, setSelectedCatalogItem] = useState<RetailProduct | null>(null);

  // Custom goal fields
  const [customTitle, setCustomTitle] = useState('');
  const [customCost, setCustomCost] = useState('');
  const [customIcon, setCustomIcon] = useState('🎯');
  const [customCategory, setCustomCategory] = useState('Dream Reward');

  // Accumulated funds ready to reallocate from the kid's active goals / vault
  const accumulatedFunds = kid
    ? (kid.totalSaved && kid.totalSaved > 0
        ? kid.totalSaved
        : (kid.goals?.find((g) => g.priority === 'primary')?.currentSaved || kid.goals?.[0]?.currentSaved || 0))
    : 0;

  useEffect(() => {
    if (!isOpen) {
      setSearchResult(null);
      setSearchError(null);
      setLookupQuery('');
      setShowScannerModal(false);
      stopCamera();
    }
  }, [isOpen]);

  // Clean up camera on unmount or modal close
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setScannerCameraActive(false);
  };

  const startCamera = async () => {
    setScannerError(null);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
        setScannerCameraActive(true);
      } else {
        setScannerError('Camera access is not supported by your browser in this mode.');
      }
    } catch (err: any) {
      setScannerError('Camera permission was declined or device camera is unavailable.');
    }
  };

  if (!isOpen) return null;

  // Perform AI & Retail Database Lookup
  const handlePerformLookup = async (queryText?: string, retailerFilter?: string) => {
    const q = (queryText !== undefined ? queryText : lookupQuery).trim();
    const r = retailerFilter !== undefined ? retailerFilter : selectedRetailer;

    if (!q) {
      setSearchError('Please enter a SKU, Barcode UPC, Store Item#, or product name.');
      return;
    }

    setIsSearching(true);
    setSearchError(null);
    setSearchResult(null);

    try {
      const resp = await fetch('/api/retail-lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q, retailer: r }),
      });
      const data = await resp.json();

      if (resp.ok && data.success && data.product) {
        setSearchResult(data.product);
        setSearchSource(data.source || 'gemini-ai');
        sound.playCoinSound();
      } else {
        setSearchError(data.message || `No product found matching "${q}". Try checking the code digits.`);
      }
    } catch (err: any) {
      setSearchError(`Lookup service connection error: ${err.message || 'Please try again'}`);
    } finally {
      setIsSearching(false);
    }
  };

  // Launch a product directly as Goal
  const handleLaunchProductAsGoal = (product: any) => {
    const rawCost =
      typeof product.targetCost === 'number'
        ? product.targetCost
        : parseFloat(product.targetCost || product.currentCost || 0);
    const cost = Number((isNaN(rawCost) ? 29.99 : rawCost).toFixed(2));
    const reallocated = Math.min(cost, accumulatedFunds);

    const newGoal: SavingsGoal = {
      id: `goal-${product.sku || product.id || Date.now()}`,
      title: product.name || product.title,
      category: product.category || 'Dream Reward',
      targetCost: cost,
      isVerified: true,
      verifiedSource: `${product.retailer || 'Retail Store'} (SKU: ${product.sku || product.itemNumber || 'Verified'})`,
      currentSaved: reallocated,
      priority: 'primary',
      icon: product.icon || 'Gamepad2',
      createdAt: new Date().toISOString().split('T')[0],
      retailer: product.retailer,
      sku: product.sku,
      barcode: product.barcode,
      itemNumber: product.itemNumber,
      modelNumber: product.modelNumber,
      specs: product.specs,
      description: product.description,
      whyKidsLoveIt: product.whyKidsLoveIt,
      productUrl: product.productUrl,
      confidence: product.confidence || 'verified',
      milestones: generateDefaultMilestones(cost, reallocated),
    };

    sound.playCoinSound();
    onSaveGoal(newGoal);
    onClose();
  };

  const handleCreateCustomGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const cost = parseFloat(customCost);
    if (!customTitle.trim() || isNaN(cost) || cost <= 0) return;

    const reallocated = Math.min(cost, accumulatedFunds);

    const newGoal: SavingsGoal = {
      id: `goal-custom-${Date.now()}`,
      title: customTitle.trim(),
      category: customCategory,
      targetCost: Number(cost.toFixed(2)),
      isVerified: false,
      currentSaved: reallocated,
      priority: 'primary',
      icon: customIcon,
      createdAt: new Date().toISOString().split('T')[0],
      milestones: generateDefaultMilestones(cost, reallocated),
    };

    sound.playCoinSound();
    onSaveGoal(newGoal);
    onClose();
  };

  const getRetailerColor = (retailer?: string) => {
    const r = (retailer || '').toLowerCase();
    if (r.includes('amazon')) return 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-700';
    if (r.includes('best buy')) return 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-700';
    if (r.includes('target')) return 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-300 dark:border-red-700';
    if (r.includes('walmart')) return 'bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-300 dark:border-sky-700';
    if (r.includes('micro center')) return 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-300 dark:border-purple-700';
    if (r.includes('apple')) return 'bg-slate-500/10 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700';
    return 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-300 dark:border-indigo-700';
  };

  const filteredCatalog = POPULAR_RETAIL_DATABASE.filter((item) => {
    if (catalogFilter === 'all') return true;
    return item.retailer.toLowerCase().includes(catalogFilter);
  });

  return createPortal(
    <div
      key="new-goal-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto"
    >
      <motion.div
        key="new-goal-modal-card"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-2xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-2xl my-6 max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-xl text-white shadow-md shadow-orange-500/20 font-black">
              🎯
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <span>Set a Savings Mission</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-black border border-indigo-200 dark:border-indigo-800">
                  KidCoin v2.1 Retail AI
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Target for {kid.name} • Live retail database & AI product scanner
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Vault Reallocation Banner if kid has savings */}
        {accumulatedFunds > 0 && (
          <div className="mt-3 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-lg">🛡️</span>
              <div className="text-xs font-bold text-emerald-900 dark:text-emerald-300">
                You have <strong className="font-black text-emerald-700 dark:text-emerald-200">${accumulatedFunds.toFixed(2)}</strong> banked in your vault!
                <span className="block text-[10px] text-emerald-700 dark:text-emerald-400 font-normal">
                  Your funds automatically transfer over to jumpstart whichever new goal you choose!
                </span>
              </div>
            </div>
            <span className="text-[11px] font-black px-2 py-1 rounded-lg bg-emerald-200/80 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 shrink-0">
              Auto-Transfer Ready
            </span>
          </div>
        )}

        {/* Mode Switcher Tabs */}
        <div className="flex gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/60 rounded-2xl my-3 shrink-0">
          <button
            type="button"
            onClick={() => {
              setTab('ai-retail');
              sound.playTap();
            }}
            className={`flex-1 py-2 text-xs font-black rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              tab === 'ai-retail'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>AI & Barcode Lookup</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('catalog');
              sound.playTap();
            }}
            className={`flex-1 py-2 text-xs font-black rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              tab === 'catalog'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Verified Wishlist ({POPULAR_RETAIL_DATABASE.length})</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('custom');
              sound.playTap();
            }}
            className={`flex-1 py-2 text-xs font-black rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              tab === 'custom'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Target className="w-4 h-4 text-indigo-500" />
            <span>Custom Goal</span>
          </button>
        </div>

        {/* Tab Content Body (Scrollable) */}
        <div className="overflow-y-auto pr-1 flex-1 space-y-4">
          {/* TAB 1: AI & Barcode Scanner / SKU Lookup */}
          {tab === 'ai-retail' && (
            <div className="space-y-4">
              {/* Retailer Selector */}
              <div>
                <label className="text-xs font-black text-slate-700 dark:text-slate-300 block mb-1.5">
                  Select Store Format (Optional):
                </label>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {RETAILER_PRESETS.map((store) => (
                    <button
                      key={store.id}
                      type="button"
                      onClick={() => {
                        setSelectedRetailer(store.id);
                        sound.playTap();
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                        selectedRetailer === store.id
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span>{store.icon}</span>
                      <span>{store.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Search Bar with Camera Barcode Scanner trigger */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-700 dark:text-slate-300 block">
                  Scan Barcode UPC, Enter SKU, DPCI, ASIN, or Item Name:
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={lookupQuery}
                      onChange={(e) => setLookupQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handlePerformLookup();
                        }
                      }}
                      placeholder="e.g. 6522854 (Best Buy), 207-00-0199 (Target), 711719570530 (UPC)"
                      className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-mono"
                    />
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      sound.playTap();
                      setShowScannerModal(true);
                      startCamera();
                    }}
                    className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                    title="Scan real barcode with camera"
                  >
                    <Barcode className="w-4 h-4 text-indigo-500" />
                    <span className="hidden sm:inline">Camera Scanner</span>
                  </button>

                  <button
                    type="button"
                    disabled={isSearching}
                    onClick={() => handlePerformLookup()}
                    className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-500/20 cursor-pointer disabled:opacity-50 transition-transform active:scale-95 shrink-0"
                  >
                    {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-amber-300" />}
                    <span>{isSearching ? 'Looking up...' : 'Lookup SKU / AI'}</span>
                  </button>
                </div>
              </div>

              {/* Sample Code Pills for Fast Instant Testing */}
              <div>
                <span className="text-[11px] font-bold text-slate-400 block mb-1">
                  ⚡ Quick Test Codes (Click to auto-fill & lookup):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {SAMPLE_BARCODES.map((sample) => (
                    <button
                      key={sample.code}
                      type="button"
                      onClick={() => {
                        setLookupQuery(sample.code);
                        handlePerformLookup(sample.code);
                        sound.playTap();
                      }}
                      className="px-2.5 py-1 text-[11px] font-mono bg-slate-100 hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-indigo-950 text-slate-700 dark:text-slate-300 hover:text-indigo-600 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <Tag className="w-3 h-3 text-slate-400" />
                      <span>{sample.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Error Callout */}
              {searchError && (
                <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold">Lookup Unsuccessful</div>
                    <p className="mt-0.5 text-rose-700 dark:text-rose-400 text-[11px]">{searchError}</p>
                  </div>
                </div>
              )}

              {/* Enriched Search Result Card */}
              {searchResult && (
                <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50/70 via-white to-purple-50/50 dark:from-slate-800/80 dark:via-slate-800/40 dark:to-indigo-950/30 border-2 border-indigo-300 dark:border-indigo-700 shadow-md space-y-3">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-2xl text-indigo-600 shadow-sm shrink-0">
                        <GoalIcon icon={searchResult.icon || 'Gamepad2'} className="w-7 h-7" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${getRetailerColor(searchResult.retailer)}`}>
                            {searchResult.retailer || 'Verified Retail'}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Verified Retail MSRP</span>
                          </span>
                          {searchSource === 'gemini-ai' && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700 flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-amber-500" />
                              <span>Gemini AI Enriched</span>
                            </span>
                          )}
                        </div>
                        <h4 className="font-black text-base text-slate-900 dark:text-white mt-1">
                          {searchResult.title || searchResult.name}
                        </h4>
                        <div className="text-xs font-mono text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5 flex-wrap">
                          {searchResult.sku && <span>SKU: {searchResult.sku}</span>}
                          {searchResult.barcode && <span>• UPC: {searchResult.barcode}</span>}
                          {searchResult.itemNumber && <span>• Item: {searchResult.itemNumber}</span>}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                        ${(searchResult.targetCost || searchResult.currentCost || 0).toFixed(2)}
                      </div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Target MSRP</span>
                    </div>
                  </div>

                  {/* Description & Why Kids Love It */}
                  {searchResult.description && (
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {searchResult.description}
                    </p>
                  )}

                  {searchResult.whyKidsLoveIt && (
                    <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-300/60 dark:border-amber-700/60 text-amber-900 dark:text-amber-200 text-xs">
                      <span className="font-bold flex items-center gap-1 mb-0.5">
                        <span>🌟 Why Kids Love This:</span>
                      </span>
                      <p className="text-[11px] leading-relaxed">{searchResult.whyKidsLoveIt}</p>
                    </div>
                  )}

                  {/* Specs Tags */}
                  {Array.isArray(searchResult.specs) && searchResult.specs.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {searchResult.specs.map((spec: string, idx: number) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 text-[10px] font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-md"
                        >
                          ✓ {spec}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Launch Action */}
                  <div className="pt-2 border-t border-indigo-100 dark:border-slate-700/80 flex items-center justify-between gap-2 flex-wrap">
                    <div className="text-xs font-bold text-slate-500 dark:text-slate-400">
                      {accumulatedFunds > 0 ? (
                        <span>
                          Reallocates <strong>${accumulatedFunds.toFixed(2)}</strong> from your vault!
                        </span>
                      ) : (
                        <span>Start fresh from $0.00 with daily chores!</span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleLaunchProductAsGoal(searchResult)}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs shadow-md shadow-emerald-500/25 flex items-center gap-2 cursor-pointer transition-transform active:scale-95"
                    >
                      <Rocket className="w-4 h-4" />
                      <span>Launch This Savings Mission 🚀</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Verified Store Catalog */}
          {tab === 'catalog' && (
            <div className="space-y-3">
              {/* Retailer Filter */}
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <label className="text-xs font-black text-slate-700 dark:text-slate-300">
                  Filter Catalog by Retailer:
                </label>
                <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
                  {['all', 'target', 'best buy', 'amazon', 'walmart', 'micro center', 'apple'].map((store) => (
                    <button
                      key={store}
                      type="button"
                      onClick={() => setCatalogFilter(store)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold capitalize transition-colors cursor-pointer ${
                        catalogFilter === store
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      {store}
                    </button>
                  ))}
                </div>
              </div>

              {/* Items Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-72 overflow-y-auto pr-1">
                {filteredCatalog.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-2xl border-2 border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 bg-white dark:bg-slate-900 transition-all flex flex-col justify-between gap-2 shadow-xs"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                        <GoalIcon icon={item.icon} className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                            {item.name}
                          </span>
                          <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 shrink-0">
                            ${item.currentCost.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${getRetailerColor(item.retailer)}`}>
                            {item.retailer}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            SKU: {item.sku}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-1">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-[9px] text-slate-400 font-mono">UPC {item.barcode}</span>
                      <button
                        type="button"
                        onClick={() => handleLaunchProductAsGoal(item)}
                        className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-[11px] font-black shadow-xs flex items-center gap-1 cursor-pointer transition-transform active:scale-95"
                      >
                        <Rocket className="w-3 h-3" />
                        <span>Select & Launch</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: Custom Goal */}
          {tab === 'custom' && (
            <form onSubmit={handleCreateCustomGoal} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1">
                    Goal Title
                  </label>
                  <input
                    type="text"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    placeholder="e.g., Mountain Bike, Robux, Camping Gear"
                    required
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1">
                    Target Cost ($ USD)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    value={customCost}
                    onChange={(e) => setCustomCost(e.target.value)}
                    placeholder="0.00"
                    required
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Gaming">Gaming</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Toys & LEGO">Toys & LEGO</option>
                    <option value="Tech & PC">Tech & PC</option>
                    <option value="Sports & Outdoors">Sports & Outdoors</option>
                    <option value="Books & Creative">Books & Creative</option>
                    <option value="Dream Reward">Dream Reward</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1">
                    Icon Emoji
                  </label>
                  <div className="flex gap-2">
                    {['🎯', '🎮', '🚀', '🚲', '🎧', '💻', '⭐'].map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setCustomIcon(emoji)}
                        className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center cursor-pointer transition-transform ${
                          customIcon === emoji
                            ? 'bg-indigo-600 text-white scale-110 shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-xs shadow-md shadow-orange-500/25 flex items-center gap-1.5 cursor-pointer transition-transform active:scale-95"
                >
                  <Rocket className="w-4 h-4" />
                  <span>Launch Custom Mission 🚀</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Live Camera Scanner Simulator Sub-Modal */}
        {showScannerModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-5 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 text-center">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Barcode className="w-5 h-5 text-indigo-500" />
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                    Live Barcode Scanner
                  </h4>
                </div>
                <button
                  onClick={() => {
                    setShowScannerModal(false);
                    stopCamera();
                  }}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Viewport View / Camera Stream */}
              <div className="relative aspect-video rounded-2xl bg-black overflow-hidden flex items-center justify-center border-2 border-dashed border-indigo-500/60">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${scannerCameraActive ? 'block' : 'hidden'}`}
                />

                {/* Laser Scanning Aiming Reticle */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <div className="w-48 h-24 border-2 border-indigo-400 rounded-xl relative overflow-hidden shadow-lg shadow-indigo-500/20">
                    {/* Animated Laser Bar */}
                    <div className="w-full h-0.5 bg-rose-500 shadow-lg shadow-rose-500 animate-pulse absolute top-1/2 -translate-y-1/2" />
                    <div className="absolute top-1 left-1 text-[8px] font-mono text-indigo-300 uppercase tracking-wider">
                      UPC-A / EAN-13
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-white/80 mt-2 bg-black/60 px-2.5 py-0.5 rounded-full">
                    Position retail barcode inside box
                  </span>
                </div>
              </div>

              {scannerError && (
                <div className="text-[11px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 p-2 rounded-xl border border-amber-200 dark:border-amber-800">
                  {scannerError}
                </div>
              )}

              {/* Quick Scan Simulation Barcodes */}
              <div>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1.5">
                  Or tap a real retail barcode to simulate scan:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {SAMPLE_BARCODES.slice(0, 4).map((sample) => (
                    <button
                      key={sample.code}
                      type="button"
                      onClick={() => {
                        setShowScannerModal(false);
                        stopCamera();
                        setLookupQuery(sample.code);
                        handlePerformLookup(sample.code);
                        sound.playCoinSound();
                      }}
                      className="p-2 text-left text-xs rounded-xl bg-slate-100 hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-indigo-950/60 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                    >
                      <div className="font-bold text-slate-800 dark:text-slate-200 truncate">
                        {sample.label}
                      </div>
                      <div className="font-mono text-[10px] text-indigo-600 dark:text-indigo-400">
                        {sample.code}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowScannerModal(false);
                    stopCamera();
                  }}
                  className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 cursor-pointer"
                >
                  Done Scanning
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>,
    document.body
  );
};
