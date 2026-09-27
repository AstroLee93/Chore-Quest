import React, { useState, useMemo } from 'react';
import {
  X,
  Shield,
  Sparkles,
  AlertTriangle,
  Plus,
  Trash2,
  Edit2,
  Check,
  ChevronDown,
  ChevronUp,
  Printer,
  Lock,
  Unlock,
  AlertCircle,
  FileText,
  RotateCcw,
  Star,
  Users,
  Search,
  Filter,
  ArrowRight,
  TrendingDown,
  BadgeAlert,
  History,
  Coins,
} from 'lucide-react';
import {
  HouseRule,
  RuleInfractionLog,
  FamilyDatabase,
  KidProfile,
  HouseRuleCategory,
} from '../types';
import { sound } from '../utils/sound';
import {
  getHouseRules,
  saveHouseRulesToStorage,
  getRuleInfractions,
  saveRuleInfractionsToStorage,
  issueRuleInfraction,
  pardonRuleInfraction,
  getLinkedStarDeduction,
  getChildRuleInfractionCount,
  getRecommendedOffenseLevel,
  deleteRuleInfraction,
  DEFAULT_HOUSE_RULES,
} from '../utils/houseRules';

interface HouseRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  database: FamilyDatabase;
  onUpdateDatabase: (updated: FamilyDatabase) => void;
  isParentMode?: boolean;
}

const CATEGORY_TAGS: Record<HouseRuleCategory, { label: string; color: string; icon: string }> = {
  respect: { label: 'Respect & Kindness', color: 'bg-rose-100 text-rose-800 border-rose-300', icon: '❤️' },
  chores: { label: 'Chores & Cleanliness', color: 'bg-amber-100 text-amber-900 border-amber-300', icon: '🧹' },
  honesty: { label: 'Honesty & Trust', color: 'bg-emerald-100 text-emerald-900 border-emerald-300', icon: '🤝' },
  screens: { label: 'Screens & Devices', color: 'bg-sky-100 text-sky-900 border-sky-300', icon: '📱' },
  bedtime: { label: 'Bedtime & Sleep', color: 'bg-indigo-100 text-indigo-900 border-indigo-300', icon: '🌙' },
  safety: { label: 'Safety & Boundaries', color: 'bg-purple-100 text-purple-900 border-purple-300', icon: '🛡️' },
  general: { label: 'General Household', color: 'bg-slate-100 text-slate-800 border-slate-300', icon: '🏡' },
};

export const HouseRulesModal: React.FC<HouseRulesModalProps> = ({
  isOpen,
  onClose,
  database,
  onUpdateDatabase,
  isParentMode = false,
}) => {
  // Rules and infractions state
  const rules = useMemo(() => getHouseRules(database), [database]);
  const infractions = useMemo(() => getRuleInfractions(database), [database]);

  // Tab & Filter states
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'notebook' | 'admin-ledger'>('notebook');

  // Admin / Edit mode states
  const [isAdminUnlocked, setIsAdminUnlocked] = useState<boolean>(isParentMode);
  const [isPinPromptOpen, setIsPinPromptOpen] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<string | null>(null);

  // Edit / Add Rule Modal state
  const [editingRule, setEditingRule] = useState<HouseRule | null>(null);
  const [isAddRuleOpen, setIsAddRuleOpen] = useState<boolean>(false);

  // Form fields for Rule Add/Edit
  const [formTitle, setFormTitle] = useState<string>('');
  const [formDescription, setFormDescription] = useState<string>('');
  const [formCategory, setFormCategory] = useState<HouseRuleCategory>('respect');
  const [formIcon, setFormIcon] = useState<string>('📜');
  const [formFirstOffense, setFormFirstOffense] = useState<string>('Verbal Reminder & Sincere Apology');
  const [formFirstOffenseStars, setFormFirstOffenseStars] = useState<number>(0);
  const [formSecondOffense, setFormSecondOffense] = useState<string>('10-Minute Quiet Reflection Time');
  const [formSecondOffenseStars, setFormSecondOffenseStars] = useState<number>(2);
  const [formThirdOffense, setFormThirdOffense] = useState<string>('Star Removal (-5 Stars) & Loss of Privilege');
  const [formThirdOffenseStars, setFormThirdOffenseStars] = useState<number>(5);
  const [formStarPenalty, setFormStarPenalty] = useState<number>(5);
  const [formAutoDeductEnabled, setFormAutoDeductEnabled] = useState<boolean>(true);

  // Issue Infraction Tool state
  const [isIssueInfractionOpen, setIsIssueInfractionOpen] = useState<boolean>(false);
  const [selectedKidId, setSelectedKidId] = useState<string>(database.kids[0]?.id || '');
  const [selectedRuleId, setSelectedRuleId] = useState<string>(rules[0]?.id || '');
  const [infractionOffenseLevel, setInfractionOffenseLevel] = useState<1 | 2 | 3>(1);
  const [infractionDeductStars, setInfractionDeductStars] = useState<boolean>(false);
  const [infractionStarsAmount, setInfractionStarsAmount] = useState<number>(0);
  const [infractionNotes, setInfractionNotes] = useState<string>('');
  const [infractionDate, setInfractionDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [actionSuccessToast, setActionSuccessToast] = useState<string | null>(null);

  // Admin Infractions Filter states
  const [historyKidFilter, setHistoryKidFilter] = useState<string>('all');
  const [historyRuleFilter, setHistoryRuleFilter] = useState<string>('all');
  const [historySeverityFilter, setHistorySeverityFilter] = useState<string>('all');
  const [historySearchQuery, setHistorySearchQuery] = useState<string>('');

  if (!isOpen) return null;

  // Selected kid and rule objects for logging infractions
  const activeKidObject = database.kids.find((k) => k.id === selectedKidId) || database.kids[0];
  const activeRuleObject = rules.find((r) => r.id === selectedRuleId) || rules[0];

  // Prior active strikes count & recommended offense level for currently selected kid on current rule
  const priorStrikesCount = useMemo(() => {
    return getChildRuleInfractionCount(infractions, selectedKidId, selectedRuleId);
  }, [infractions, selectedKidId, selectedRuleId]);

  const recommendedOffenseLevel = useMemo(() => {
    return getRecommendedOffenseLevel(infractions, selectedKidId, selectedRuleId);
  }, [infractions, selectedKidId, selectedRuleId]);

  // Visible rules for notebook view
  const visibleRules = rules.filter((r) => {
    if (!r.isActive && !isAdminUnlocked) return false;
    if (selectedCategory === 'all') return true;
    return r.category === selectedCategory;
  });

  // Filtered infractions for Admin Historical View
  const filteredInfractions = infractions.filter((inf) => {
    if (historyKidFilter !== 'all' && inf.kidId !== historyKidFilter) return false;
    if (historyRuleFilter !== 'all' && inf.ruleId !== historyRuleFilter) return false;
    if (historySeverityFilter === 'penalties' && inf.starsDeducted <= 0) return false;
    if (historySeverityFilter === 'warnings' && inf.starsDeducted > 0) return false;
    if (historySearchQuery.trim()) {
      const q = historySearchQuery.toLowerCase();
      const matchTitle = inf.ruleTitle.toLowerCase().includes(q);
      const matchKid = inf.kidName.toLowerCase().includes(q);
      const matchNotes = (inf.notes || '').toLowerCase().includes(q);
      const matchAction = inf.actionTaken.toLowerCase().includes(q);
      if (!matchTitle && !matchKid && !matchNotes && !matchAction) return false;
    }
    return true;
  });

  // Historical Infractions summary statistics
  const totalStarsDeducted = infractions.reduce((acc, inf) => acc + (inf.isPardoned ? 0 : inf.starsDeducted || 0), 0);
  const totalViolationsCount = infractions.length;
  const activePenaltiesCount = infractions.filter((i) => i.starsDeducted > 0 && !i.isPardoned).length;

  // Most common broken rule
  const mostCommonRule = useMemo(() => {
    if (infractions.length === 0) return null;
    const counts: Record<string, number> = {};
    infractions.forEach((inf) => {
      counts[inf.ruleTitle] = (counts[inf.ruleTitle] || 0) + 1;
    });
    let topRule = '';
    let maxCount = 0;
    Object.entries(counts).forEach(([title, count]) => {
      if (count > maxCount) {
        maxCount = count;
        topRule = title;
      }
    });
    return { title: topRule, count: maxCount };
  }, [infractions]);

  // Handle Admin PIN verification
  const handleVerifyPin = () => {
    const parentPin = database.settings.parentPin || '1234';
    if (pinInput === parentPin) {
      sound.playTap();
      setIsAdminUnlocked(true);
      setIsPinPromptOpen(false);
      setPinInput('');
      setPinError(null);
    } else {
      sound.playWarning();
      setPinError('Incorrect PIN. Please try again.');
      setPinInput('');
    }
  };

  // Open Edit Form for Rule
  const handleOpenEditRule = (rule: HouseRule) => {
    setEditingRule(rule);
    setFormTitle(rule.title);
    setFormDescription(rule.description);
    setFormCategory(rule.category);
    setFormIcon(rule.icon || '📜');
    setFormFirstOffense(rule.consequences.firstOffense);
    setFormFirstOffenseStars(rule.consequences.firstOffenseStars ?? 0);
    setFormSecondOffense(rule.consequences.secondOffense);
    setFormSecondOffenseStars(rule.consequences.secondOffenseStars ?? 2);
    setFormThirdOffense(rule.consequences.thirdOffense);
    setFormThirdOffenseStars(rule.consequences.thirdOffenseStars ?? rule.consequences.starPenalty ?? 5);
    setFormStarPenalty(rule.consequences.starPenalty ?? 5);
    setFormAutoDeductEnabled(rule.consequences.autoDeductEnabled ?? true);
    setIsAddRuleOpen(true);
  };

  // Open New Rule Form
  const handleOpenNewRule = () => {
    setEditingRule(null);
    setFormTitle('');
    setFormDescription('');
    setFormCategory('respect');
    setFormIcon('📜');
    setFormFirstOffense('Verbal Reminder & Sincere Apology');
    setFormFirstOffenseStars(0);
    setFormSecondOffense('10-Minute Quiet Reflection Time');
    setFormSecondOffenseStars(2);
    setFormThirdOffense('Star Removal (-5 Stars) & Privilege Suspension');
    setFormThirdOffenseStars(5);
    setFormStarPenalty(5);
    setFormAutoDeductEnabled(true);
    setIsAddRuleOpen(true);
  };

  // Open Infraction Tool with automatic star deduction pre-filled from linked rule
  const handleOpenIssueInfraction = (ruleToPreselect?: HouseRule, kidToPreselectId?: string) => {
    const kidId = kidToPreselectId || selectedKidId || database.kids[0]?.id || '';
    const rule = ruleToPreselect || activeRuleObject || rules[0];
    if (rule) {
      setSelectedKidId(kidId);
      setSelectedRuleId(rule.id);
      const recLevel = getRecommendedOffenseLevel(infractions, kidId, rule.id);
      setInfractionOffenseLevel(recLevel);
      const linkedStars = getLinkedStarDeduction(rule, recLevel);
      setInfractionStarsAmount(linkedStars);
      setInfractionDeductStars(linkedStars > 0);
    }
    setInfractionDate(new Date().toISOString().split('T')[0]);
    setInfractionNotes('');
    setIsIssueInfractionOpen(true);
  };

  // Change selected kid inside infraction tool & update recommended strike level
  const handleSelectKidInInfractionModal = (newKidId: string) => {
    setSelectedKidId(newKidId);
    const rule = rules.find((r) => r.id === selectedRuleId) || activeRuleObject;
    if (rule) {
      const recLevel = getRecommendedOffenseLevel(infractions, newKidId, rule.id);
      setInfractionOffenseLevel(recLevel);
      const linkedStars = getLinkedStarDeduction(rule, recLevel);
      setInfractionStarsAmount(linkedStars);
      setInfractionDeductStars(linkedStars > 0);
    }
  };

  // Change selected rule inside infraction tool & update recommended strike level
  const handleSelectRuleInInfractionModal = (newRuleId: string) => {
    setSelectedRuleId(newRuleId);
    const rule = rules.find((r) => r.id === newRuleId);
    if (rule) {
      const recLevel = getRecommendedOffenseLevel(infractions, selectedKidId, rule.id);
      setInfractionOffenseLevel(recLevel);
      const linkedStars = getLinkedStarDeduction(rule, recLevel);
      setInfractionStarsAmount(linkedStars);
      setInfractionDeductStars(linkedStars > 0);
    }
  };

  // When changing rule or offense level in the infraction tool, automatically link and update the star deduction amount
  const handleUpdateInfractionLevel = (newLevel: 1 | 2 | 3, targetRule?: HouseRule) => {
    setInfractionOffenseLevel(newLevel);
    const rule = targetRule || activeRuleObject;
    if (rule) {
      const linkedStars = getLinkedStarDeduction(rule, newLevel);
      setInfractionStarsAmount(linkedStars);
      setInfractionDeductStars(linkedStars > 0);
    }
  };

  // Save Rule (New or Existing)
  const handleSaveRule = () => {
    if (!formTitle.trim()) return;

    sound.playTap();
    let updatedRules: HouseRule[];

    const finalConsequences = {
      firstOffense: formFirstOffense.trim(),
      firstOffenseStars: Math.max(0, Number(formFirstOffenseStars) || 0),
      secondOffense: formSecondOffense.trim(),
      secondOffenseStars: Math.max(0, Number(formSecondOffenseStars) || 0),
      thirdOffense: formThirdOffense.trim(),
      thirdOffenseStars: Math.max(0, Number(formThirdOffenseStars) || 0),
      starPenalty: Math.max(0, Number(formThirdOffenseStars) || Number(formStarPenalty) || 5),
      autoDeductEnabled: formAutoDeductEnabled,
    };

    if (editingRule) {
      updatedRules = rules.map((r) =>
        r.id === editingRule.id
          ? {
              ...r,
              title: formTitle.trim(),
              description: formDescription.trim(),
              category: formCategory,
              icon: formIcon,
              consequences: finalConsequences,
              updatedAt: new Date().toISOString(),
            }
          : r
      );
    } else {
      const newRule: HouseRule = {
        id: `rule-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        ruleNumber: rules.length + 1,
        title: formTitle.trim(),
        description: formDescription.trim(),
        category: formCategory,
        icon: formIcon,
        consequences: finalConsequences,
        isActive: true,
        createdAt: new Date().toISOString(),
      };
      updatedRules = [...rules, newRule];
    }

    saveHouseRulesToStorage(updatedRules);
    onUpdateDatabase({
      ...database,
      houseRules: updatedRules,
    });

    setIsAddRuleOpen(false);
    setEditingRule(null);
    showToast(editingRule ? 'Rule & automatic deductions updated!' : 'New House Rule added!');
  };

  // Delete Rule
  const handleDeleteRule = (ruleId: string) => {
    if (!window.confirm('Are you sure you want to delete this house rule?')) return;
    sound.playTap();

    const updatedRules = rules
      .filter((r) => r.id !== ruleId)
      .map((r, idx) => ({ ...r, ruleNumber: idx + 1 }));

    saveHouseRulesToStorage(updatedRules);
    onUpdateDatabase({
      ...database,
      houseRules: updatedRules,
    });
    showToast('Rule removed from notebook.');
  };

  // Reset to Defaults
  const handleResetDefaults = () => {
    if (!window.confirm('Reset all house rules to the recommended family defaults?')) return;
    sound.playTap();
    saveHouseRulesToStorage(DEFAULT_HOUSE_RULES);
    onUpdateDatabase({
      ...database,
      houseRules: DEFAULT_HOUSE_RULES,
    });
    showToast('House rules reset to family defaults!');
  };

  // Move Rule Up / Down
  const handleMoveRule = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= rules.length) return;

    sound.playTap();
    const updated = [...rules];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    const renumbered = updated.map((r, idx) => ({ ...r, ruleNumber: idx + 1 }));
    saveHouseRulesToStorage(renumbered);
    onUpdateDatabase({
      ...database,
      houseRules: renumbered,
    });
  };

  // Handle Log/Issue Infraction
  const handleConfirmInfraction = () => {
    const kid = database.kids.find((k) => k.id === selectedKidId);
    const rule = rules.find((r) => r.id === selectedRuleId);
    if (!kid || !rule) return;

    sound.playWarning();
    const { updatedDatabase, infraction } = issueRuleInfraction(database, {
      rule,
      kid,
      offenseLevel: infractionOffenseLevel,
      deductStars: infractionDeductStars,
      starsToDeduct: infractionStarsAmount,
      notes: infractionNotes,
      incidentDate: infractionDate,
      loggedBy: 'Parent Admin',
    });

    onUpdateDatabase(updatedDatabase);
    setIsIssueInfractionOpen(false);
    setInfractionNotes('');

    const toastMsg =
      infraction.starsDeducted > 0
        ? `⚠️ Penalty recorded: -${infraction.starsDeducted} Stars automatically deducted from ${kid.name}`
        : `⚠️ Warning recorded for ${kid.name}`;
    showToast(toastMsg);
  };

  // Handle Pardon / Refund Infraction
  const handlePardonInfraction = (infractionId: string) => {
    if (!window.confirm('Pardon this infraction and refund any deducted stars back to the child?')) return;
    sound.playTap();

    const result = pardonRuleInfraction(database, infractionId);
    if (result) {
      onUpdateDatabase(result.updatedDatabase);
      showToast(`Pardoned! +${result.refundedStars} Stars refunded to ${result.kidName}`);
    }
  };

  // Handle Delete Infraction Record
  const handleDeleteInfraction = (infractionId: string) => {
    if (!window.confirm('Delete this historical infraction log from the ledger? Note: this cleans the audit record without altering current star balances.')) return;
    sound.playTap();
    const updatedDb = deleteRuleInfraction(database, infractionId);
    onUpdateDatabase(updatedDb);
    showToast('Infraction record deleted from ledger.');
  };

  const showToast = (msg: string) => {
    setActionSuccessToast(msg);
    setTimeout(() => setActionSuccessToast(null), 3500);
  };

  const handlePrint = () => {
    sound.playTap();
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in select-none">
      {/* Toast Notification */}
      {actionSuccessToast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-60 bg-amber-500 text-slate-950 font-black px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2 text-xs sm:text-sm animate-bounce border-2 border-slate-900">
          <AlertCircle className="w-4 h-4 fill-current shrink-0" />
          <span>{actionSuccessToast}</span>
        </div>
      )}

      {/* Main Container */}
      <div className="relative w-full max-w-4xl bg-slate-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[96vh] border-2 border-slate-800">
        {/* Top Metallic / Leather Header Bar */}
        <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-xl shadow-inner shrink-0">
              📜
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                  ChoreQuest Family House Rules
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-slate-950 shadow-xs">
                  Official Code of Conduct
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-semibold hidden sm:block">
                Clear family expectations with automatic star accountability
              </p>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Print Button */}
            <button
              onClick={handlePrint}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
              title="Print House Rules for the Refrigerator"
            >
              <Printer className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden md:inline">Print / Fridge</span>
            </button>

            {/* Issue Infraction Button (Admin) */}
            <button
              onClick={() => {
                sound.playTap();
                if (!isAdminUnlocked) {
                  setIsPinPromptOpen(true);
                } else {
                  handleOpenIssueInfraction();
                }
              }}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-700/80 text-rose-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
              title="Issue Infraction & Automatic Star Deduction"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden sm:inline">Log Infraction</span>
            </button>

            {/* Admin Edit Mode Toggle */}
            <button
              onClick={() => {
                sound.playTap();
                if (isAdminUnlocked) {
                  setIsAdminUnlocked(false);
                  setActiveTab('notebook');
                } else {
                  setIsPinPromptOpen(true);
                }
              }}
              className={`p-2 sm:px-3 sm:py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
                isAdminUnlocked
                  ? 'bg-amber-500 border-amber-400 text-slate-950 font-black shadow-md'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
              }`}
              title={isAdminUnlocked ? 'Admin Mode Active' : 'Parent Admin Login'}
            >
              {isAdminUnlocked ? <Unlock className="w-3.5 h-3.5 text-slate-950" /> : <Lock className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{isAdminUnlocked ? 'Admin Active' : 'Admin Login'}</span>
            </button>

            {/* Close Button */}
            <button
              onClick={() => {
                sound.playTap();
                onClose();
              }}
              className="p-2 rounded-xl bg-slate-800 hover:bg-rose-600 text-slate-400 hover:text-white border border-slate-700 transition-colors cursor-pointer"
              aria-label="Close Rules"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Subheader */}
        <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 flex items-center justify-between gap-2 overflow-x-auto scrollbar-none shrink-0">
          <div className="flex items-center gap-1.5">
            {/* 1. Public Notebook Rules Tab */}
            <button
              onClick={() => {
                sound.playTap();
                setActiveTab('notebook');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer transition-all ${
                activeTab === 'notebook'
                  ? 'bg-amber-400 text-slate-950 shadow-xs'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <span>📋</span>
              <span>Notebook Rules</span>
              <span className="px-1.5 py-0.2 rounded-full bg-slate-950/20 text-[10px]">
                {rules.length}
              </span>
            </button>

            {/* 2. ADMIN-ONLY Disciplinary Infractions Ledger */}
            {isAdminUnlocked && (
              <button
                onClick={() => {
                  sound.playTap();
                  setActiveTab('admin-ledger');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer transition-all ${
                  activeTab === 'admin-ledger'
                    ? 'bg-rose-500 text-white shadow-xs'
                    : 'bg-slate-800 text-rose-300 hover:bg-slate-700 border border-rose-900/60'
                }`}
              >
                <Shield className="w-3 h-3 text-rose-300 fill-current" />
                <span>Admin Infractions Ledger</span>
                {infractions.length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-slate-950 text-white text-[10px] font-mono">
                    {infractions.length}
                  </span>
                )}
              </button>
            )}
          </div>

          {/* Notebook Category Filter (when on notebook tab) */}
          {activeTab === 'notebook' && (
            <div className="flex items-center gap-1 overflow-x-auto">
              <span className="text-[10px] font-bold text-slate-400 mr-1 hidden sm:inline">Category:</span>
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-2 py-1 rounded-lg text-[10px] font-black cursor-pointer transition-all ${
                  selectedCategory === 'all'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All
              </button>
              {Object.keys(CATEGORY_TAGS).map((catKey) => {
                const tag = CATEGORY_TAGS[catKey as HouseRuleCategory];
                return (
                  <button
                    key={catKey}
                    onClick={() => setSelectedCategory(catKey)}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-all whitespace-nowrap ${
                      selectedCategory === catKey
                        ? 'bg-amber-400 text-slate-950 font-black'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>{tag.icon}</span>
                    <span className="ml-1 hidden md:inline">{tag.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Admin Rule Add Controls */}
          {isAdminUnlocked && activeTab === 'notebook' && (
            <div className="flex items-center gap-1.5 ml-auto">
              <button
                onClick={handleOpenNewRule}
                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-black flex items-center gap-1 cursor-pointer transition-all active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Rule</span>
              </button>
              <button
                onClick={handleResetDefaults}
                className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-[10px] cursor-pointer"
                title="Reset to Family Defaults"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {/* Scrollable Main Area */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 bg-slate-950 flex flex-col items-center">
          {activeTab === 'notebook' ? (
            /* =========================================================================
               PHYSICAL NOTEBOOK PAD CANVAS (KID & FAMILY FRIENDLY)
               ========================================================================= */
            <div
              id="printable-house-rules"
              className="w-full max-w-3xl bg-[#fefcf3] text-slate-800 rounded-2xl sm:rounded-3xl shadow-2xl border-4 border-amber-900/40 relative overflow-hidden flex flex-col"
              style={{
                backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, rgba(148, 163, 184, 0.25) 31px, rgba(148, 163, 184, 0.25) 32px)',
              }}
            >
              {/* Spiral Wire Binding Rings across the top */}
              <div className="h-7 bg-amber-950 border-b-2 border-amber-900/80 flex items-center justify-around px-4 select-none shrink-0 relative">
                <div className="absolute inset-0 bg-linear-to-r from-amber-950 via-amber-900 to-amber-950 opacity-90" />
                {Array.from({ length: 18 }).map((_, i) => (
                  <div key={i} className="relative z-10 flex flex-col items-center">
                    <div className="w-2.5 h-4.5 rounded-full bg-linear-to-b from-slate-200 via-white to-slate-400 border border-slate-500 shadow-sm" />
                    <div className="w-2 h-1.5 rounded-full bg-amber-950 mt-0.5" />
                  </div>
                ))}
              </div>

              {/* Notebook Header Stamp */}
              <div className="pt-5 pb-3 px-6 sm:px-10 border-b border-amber-200/80 flex items-center justify-between gap-3 relative">
                {/* Red Left Margin Line */}
                <div className="absolute left-6 sm:left-10 top-0 bottom-0 w-0.5 bg-rose-400/80" />

                <div className="pl-6 sm:pl-8">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🏡</span>
                    <h3 className="text-xl sm:text-2xl font-black text-amber-950 tracking-tight font-serif italic">
                      Family House Rules & Code
                    </h3>
                  </div>
                  <p className="text-xs text-amber-900/80 font-bold mt-0.5">
                    "In this house, we listen, we respect each other, and we work together as a team."
                  </p>
                </div>

                <div className="hidden sm:flex flex-col items-end">
                  <div className="border-2 border-dashed border-amber-600/70 rounded-xl px-2.5 py-1 rotate-2 bg-amber-100/60 text-amber-900 text-[10px] font-black uppercase tracking-wider">
                    ⭐ Household Standard
                  </div>
                </div>
              </div>

              {/* Rules List on Lined Paper */}
              <div className="p-4 sm:p-8 space-y-4 relative">
                {/* Vertical Red Margin Line */}
                <div className="absolute left-6 sm:left-10 top-0 bottom-0 w-0.5 bg-rose-400/80" />

                {visibleRules.length === 0 ? (
                  <div className="pl-8 sm:pl-10 py-12 text-center text-slate-500">
                    <p className="text-sm font-bold">No rules found for this category.</p>
                  </div>
                ) : (
                  visibleRules.map((rule, idx) => {
                    const tag = CATEGORY_TAGS[rule.category] || CATEGORY_TAGS.general;
                    const autoPenaltyLinked = rule.consequences.autoDeductEnabled ?? true;

                    return (
                      <div key={rule.id} className="pl-6 sm:pl-8 relative group">
                        <div className="bg-white/95 rounded-2xl p-4 sm:p-5 border-2 border-amber-200/90 shadow-sm hover:shadow-md transition-shadow relative">
                          {/* Rule Header */}
                          <div className="flex items-start justify-between gap-2 mb-2 flex-wrap">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="w-7 h-7 rounded-xl bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center shadow-xs">
                                #{rule.ruleNumber}
                              </span>
                              <h4 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
                                {rule.title}
                              </h4>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 ${tag.color}`}
                              >
                                <span>{tag.icon}</span>
                                <span>{tag.label}</span>
                              </span>
                              {autoPenaltyLinked && (
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-rose-50 text-rose-700 border border-rose-300 flex items-center gap-1">
                                  <span>⚡ Auto-Deduct Linked</span>
                                </span>
                              )}
                            </div>

                            {/* Admin Controls */}
                            {isAdminUnlocked && (
                              <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => handleOpenIssueInfraction(rule)}
                                  className="px-2 py-1 rounded bg-rose-100 hover:bg-rose-200 text-rose-800 text-[11px] font-black flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                                  title="Log Infraction for this Rule"
                                >
                                  <AlertTriangle className="w-3 h-3 text-rose-600" />
                                  <span>Apply Strike</span>
                                </button>
                                <button
                                  onClick={() => handleMoveRule(idx, 'up')}
                                  disabled={idx === 0}
                                  className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 disabled:opacity-30 cursor-pointer"
                                  title="Move Up"
                                >
                                  <ChevronUp className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleMoveRule(idx, 'down')}
                                  disabled={idx === rules.length - 1}
                                  className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 disabled:opacity-30 cursor-pointer"
                                  title="Move Down"
                                >
                                  <ChevronDown className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleOpenEditRule(rule)}
                                  className="p-1 rounded bg-amber-100 hover:bg-amber-200 text-amber-900 cursor-pointer ml-1"
                                  title="Edit Rule & Deductions"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteRule(rule.id)}
                                  className="p-1 rounded bg-rose-100 hover:bg-rose-200 text-rose-800 cursor-pointer"
                                  title="Delete Rule"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Rule Description */}
                          <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed mb-3">
                            {rule.description}
                          </p>

                          {/* Consequence Progression (Infractions Ladder) */}
                          <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3">
                            <span className="text-[10px] font-black uppercase text-amber-900 tracking-wider block mb-2">
                              Infraction Progression & Automatic Star Penalties:
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                              {/* Level 1: Warning */}
                              <div className="p-2.5 rounded-lg bg-white border border-amber-200 flex flex-col justify-between">
                                <div>
                                  <div className="flex items-center justify-between gap-1 text-[11px] font-black text-amber-800 mb-1">
                                    <span>🟡 1st Offense</span>
                                    {(rule.consequences.firstOffenseStars || 0) > 0 && (
                                      <span className="px-1.5 py-0.2 rounded-md bg-amber-100 text-amber-900 text-[10px] font-black border border-amber-300">
                                        -{rule.consequences.firstOffenseStars} ⭐
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[11px] text-slate-600 font-medium leading-tight">
                                    {rule.consequences.firstOffense}
                                  </p>
                                </div>
                                <span className="text-[9px] font-bold text-amber-800 mt-2">
                                  {(rule.consequences.firstOffenseStars || 0) > 0 ? `Auto: -${rule.consequences.firstOffenseStars} Stars` : 'Verbal Warning (0 Stars)'}
                                </span>
                              </div>

                              {/* Level 2: Reflection / Extra Chore */}
                              <div className="p-2.5 rounded-lg bg-white border border-orange-200 flex flex-col justify-between">
                                <div>
                                  <div className="flex items-center justify-between gap-1 text-[11px] font-black text-orange-800 mb-1">
                                    <span>🟠 2nd Offense</span>
                                    {(rule.consequences.secondOffenseStars || 0) > 0 && (
                                      <span className="px-1.5 py-0.2 rounded-md bg-orange-100 text-orange-900 text-[10px] font-black border border-orange-300">
                                        -{rule.consequences.secondOffenseStars} ⭐
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[11px] text-slate-600 font-medium leading-tight">
                                    {rule.consequences.secondOffense}
                                  </p>
                                </div>
                                <span className="text-[9px] font-bold text-orange-800 mt-2">
                                  {(rule.consequences.secondOffenseStars || 0) > 0 ? `Auto: -${rule.consequences.secondOffenseStars} Stars` : 'Helper Duty / Reflection'}
                                </span>
                              </div>

                              {/* Level 3: Star Penalty / Loss of Privilege */}
                              <div className="p-2.5 rounded-lg bg-white border border-rose-300 flex flex-col justify-between">
                                <div>
                                  <div className="flex items-center justify-between gap-1 text-[11px] font-black text-rose-700 mb-1">
                                    <span>🔴 3rd Offense</span>
                                    <span className="px-1.5 py-0.2 rounded-md bg-rose-100 text-rose-800 text-[10px] font-black border border-rose-300">
                                      -{rule.consequences.thirdOffenseStars ?? rule.consequences.starPenalty ?? 5} ⭐
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-slate-600 font-medium leading-tight">
                                    {rule.consequences.thirdOffense}
                                  </p>
                                </div>
                                <span className="text-[9px] font-black text-rose-800 mt-2">
                                  Auto: -{rule.consequences.thirdOffenseStars ?? rule.consequences.starPenalty ?? 5} Stars Deducted
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Notebook Footer Sign-off */}
              <div className="p-4 sm:p-6 border-t border-amber-200/80 bg-amber-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-amber-900 font-bold shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-base">🤝</span>
                  <span>"We agree to encourage each other and keep our home a happy place!"</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-amber-800">
                  <Shield className="w-3.5 h-3.5 text-amber-700" />
                  <span>ChoreQuest Household Governance</span>
                </div>
              </div>
            </div>
          ) : (
            /* =========================================================================
               ADMIN-ONLY HISTORICAL INFRACTIONS LEDGER
               Tracks date, specific rule broken, star penalty applied & audit trail
               ========================================================================= */
            <div className="w-full max-w-4xl space-y-4">
              {/* Ledger Summary Analytics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center text-xl shrink-0 font-black">
                    📉
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Stars Deducted</div>
                    <div className="text-xl sm:text-2xl font-black text-rose-400 tracking-tight">
                      -{totalStarsDeducted} ⭐
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-xl shrink-0 font-black">
                    ⚖️
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Recorded Strikes</div>
                    <div className="text-xl sm:text-2xl font-black text-white tracking-tight">
                      {totalViolationsCount} <span className="text-xs font-normal text-slate-400">incidents</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xl shrink-0 font-black">
                    🎯
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Most Common Issue</div>
                    <div className="text-xs sm:text-sm font-black text-slate-200 truncate max-w-[160px]" title={mostCommonRule?.title || 'None'}>
                      {mostCommonRule ? mostCommonRule.title : 'None recorded'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Toolbar & Filters */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Child Filter */}
                  <select
                    value={historyKidFilter}
                    onChange={(e) => setHistoryKidFilter(e.target.value)}
                    className="px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-bold text-slate-200 focus:outline-hidden focus:border-amber-500"
                  >
                    <option value="all">All Children</option>
                    {database.kids.map((kid) => (
                      <option key={kid.id} value={kid.id}>
                        {kid.name}
                      </option>
                    ))}
                  </select>

                  {/* Rule Filter */}
                  <select
                    value={historyRuleFilter}
                    onChange={(e) => setHistoryRuleFilter(e.target.value)}
                    className="px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-bold text-slate-200 focus:outline-hidden focus:border-amber-500"
                  >
                    <option value="all">All Rules</option>
                    {rules.map((r) => (
                      <option key={r.id} value={r.id}>
                        Rule #{r.ruleNumber}: {r.title}
                      </option>
                    ))}
                  </select>

                  {/* Severity Filter */}
                  <select
                    value={historySeverityFilter}
                    onChange={(e) => setHistorySeverityFilter(e.target.value)}
                    className="px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-bold text-slate-200 focus:outline-hidden focus:border-amber-500"
                  >
                    <option value="all">All Incidents</option>
                    <option value="penalties">Star Penalties Only (-⭐)</option>
                    <option value="warnings">Warnings / Verbal Only</option>
                  </select>

                  {/* Search box */}
                  <div className="relative">
                    <input
                      type="text"
                      value={historySearchQuery}
                      onChange={(e) => setHistorySearchQuery(e.target.value)}
                      placeholder="Search notes or rules..."
                      className="px-3 py-1.5 pl-8 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-hidden focus:border-amber-500"
                    />
                    <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-auto">
                  <button
                    onClick={() => {
                      sound.playTap();
                      window.print();
                    }}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
                    title="Print / Export Disciplinary Audit Trail"
                  >
                    <Printer className="w-3.5 h-3.5 text-amber-400" />
                    <span className="hidden sm:inline">Print Ledger</span>
                  </button>

                  <button
                    onClick={() => handleOpenIssueInfraction()}
                    className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-md active:scale-95 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Issue Strike / Penalty</span>
                  </button>
                </div>
              </div>

              {/* Infractions Table / Cards */}
              {filteredInfractions.length === 0 ? (
                <div className="p-12 text-center bg-slate-900/60 rounded-3xl border border-slate-800">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xl mx-auto mb-3">
                    🌟
                  </div>
                  <h4 className="text-sm font-black text-white mb-1">No Infractions Found</h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    {infractions.length === 0
                      ? 'The disciplinary record is completely clean! No rule violations have been recorded.'
                      : 'No incidents match your current filter selections.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {filteredInfractions.map((entry) => (
                    <div
                      key={entry.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        entry.isPardoned
                          ? 'bg-slate-900/40 border-slate-800/80 opacity-75'
                          : entry.starsDeducted > 0
                          ? 'bg-slate-900 border-rose-900/50 shadow-sm'
                          : 'bg-slate-900 border-slate-800'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className="w-11 h-11 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xl shrink-0 shadow-inner">
                            {entry.kidAvatar || '👦'}
                          </div>
                          <div>
                            {/* Line 1: Child + Rule Broken + Badges */}
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-black text-white text-sm">
                                {entry.kidName}
                              </span>
                              <span className="text-slate-500">•</span>
                              <span className="text-xs font-bold text-amber-300">
                                {entry.ruleNumber ? `Rule #${entry.ruleNumber}: ` : ''}
                                {entry.ruleTitle}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                                  entry.offenseLevel === 1
                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                    : entry.offenseLevel === 2
                                    ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                }`}
                              >
                                Offense #{entry.offenseLevel}
                              </span>
                              {entry.isPardoned && (
                                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-black">
                                  Pardoned & Refunded
                                </span>
                              )}
                            </div>

                            {/* Line 2: Penalty / Action Taken */}
                            <p className="text-xs text-slate-300 mt-1 font-medium">
                              {entry.actionTaken}
                            </p>

                            {/* Line 3: Incident Note */}
                            {entry.notes && (
                              <p className="text-[11px] text-slate-400 mt-1 italic bg-slate-950/60 px-2.5 py-1 rounded-lg border border-slate-800 inline-block">
                                "{entry.notes}"
                              </p>
                            )}

                            {/* Line 4: Date, Time & Balance Audit */}
                            <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-500 font-medium flex-wrap">
                              <span>
                                📅 {entry.date}
                                {entry.timestamp ? ` at ${new Date(entry.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}` : ''}
                              </span>
                              {entry.previousBalance !== undefined && entry.newBalance !== undefined && entry.starsDeducted > 0 && (
                                <>
                                  <span>•</span>
                                  <span className="text-rose-400 font-bold">
                                    Balance Audit: {entry.previousBalance} ⭐ ➔ {entry.newBalance} ⭐ (-{entry.starsDeducted})
                                  </span>
                                </>
                              )}
                              <span>•</span>
                              <span>Logged by: {entry.loggedBy}</span>
                            </div>
                          </div>
                        </div>

                        {/* Right Side: Star Penalty Badge & Action Buttons */}
                        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0">
                          {entry.starsDeducted > 0 ? (
                            <div className="px-3 py-1.5 rounded-xl bg-rose-950/80 border border-rose-600/80 text-rose-300 text-xs font-black flex items-center gap-1 shadow-inner">
                              <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
                              <span>-{entry.starsDeducted} Stars</span>
                            </div>
                          ) : (
                            <div className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 text-xs font-bold">
                              Verbal Warning
                            </div>
                          )}

                          <div className="flex items-center gap-1.5">
                            {/* Pardon / Refund Button */}
                            {entry.starsDeducted > 0 && !entry.isPardoned && (
                              <button
                                onClick={() => handlePardonInfraction(entry.id)}
                                className="px-2.5 py-1 rounded-lg bg-emerald-950 hover:bg-emerald-900 border border-emerald-600/60 text-emerald-300 text-[10px] font-black flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                                title="Pardon violation and refund stars to child"
                              >
                                <RotateCcw className="w-3 h-3" />
                                <span>Pardon & Refund</span>
                              </button>
                            )}

                            {/* Delete Log Button */}
                            <button
                              onClick={() => handleDeleteInfraction(entry.id)}
                              className="p-1 rounded-lg bg-slate-800 hover:bg-rose-900/60 text-slate-400 hover:text-rose-300 border border-slate-700 hover:border-rose-700/60 transition cursor-pointer"
                              title="Delete record from ledger"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* =========================================================================
         PARENT PIN PROMPT MODAL
         ========================================================================= */}
      {isPinPromptOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-xs bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl text-center">
            <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-2 text-lg">
              <Lock className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-black text-white mb-1">Parent PIN Required</h4>
            <p className="text-xs text-slate-400 mb-4">
              Enter your 4-digit Parent PIN to access the Admin Infractions Ledger or edit rules.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleVerifyPin();
              }}
            >
              <input
                type="password"
                maxLength={6}
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  setPinError(null);
                }}
                placeholder="PIN (Default: 1234)"
                autoFocus
                className="w-full px-3 py-2 text-center text-lg font-mono font-black tracking-widest bg-slate-950 border border-slate-700 rounded-xl text-white placeholder:text-slate-600 focus:outline-hidden focus:border-amber-500 mb-2"
              />

              {pinError && (
                <div className="text-[11px] text-rose-400 font-bold mb-3">{pinError}</div>
              )}

              <div className="flex gap-2 justify-end mt-2">
                <button
                  type="button"
                  onClick={() => setIsPinPromptOpen(false)}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition cursor-pointer flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs transition cursor-pointer flex-1"
                >
                  Unlock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
         ISSUE INFRACTION / AUTOMATIC STAR DEDUCTION TOOL MODAL
         ========================================================================= */}
      {isIssueInfractionOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-black text-white">Log Rule Infraction / Penalty</h4>
              </div>
              <button
                onClick={() => setIsIssueInfractionOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400 mb-3">
              Select child and offense level. Automatic star deduction is calculated directly from the linked house rule.
            </p>

            {/* Smart Strike Recommendation Banner */}
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs mb-3.5">
              <div className="flex items-center gap-2">
                <span className="text-amber-400">⚡</span>
                <span className="text-slate-300 font-bold">
                  {priorStrikesCount === 0
                    ? `${activeKidObject?.name} has 0 prior strikes on this rule.`
                    : `${activeKidObject?.name} has ${priorStrikesCount} prior strike${priorStrikesCount > 1 ? 's' : ''} on this rule.`}
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-lg bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-black">
                Recommended: Level {recommendedOffenseLevel}
              </span>
            </div>

            <div className="space-y-3.5 text-left">
              {/* Select Kid */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Select Child</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {database.kids.map((kid) => (
                    <button
                      key={kid.id}
                      type="button"
                      onClick={() => handleSelectKidInInfractionModal(kid.id)}
                      className={`p-2 rounded-xl border flex items-center gap-2 text-xs font-bold cursor-pointer transition-all ${
                        selectedKidId === kid.id
                          ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-xs'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <span>{kid.avatar || '👦'}</span>
                      <div className="truncate text-left">
                        <div className="truncate">{kid.name}</div>
                        <div className="text-[10px] text-amber-400 font-mono">{kid.stars} ⭐</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Select Rule */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Broken House Rule</label>
                <select
                  value={selectedRuleId}
                  onChange={(e) => handleSelectRuleInInfractionModal(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl text-xs text-white focus:outline-hidden"
                >
                  {rules.map((r) => (
                    <option key={r.id} value={r.id}>
                      #{r.ruleNumber}: {r.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Incident Date */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Incident Date</label>
                <input
                  type="date"
                  value={infractionDate}
                  onChange={(e) => setInfractionDate(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl text-xs text-white focus:outline-hidden"
                />
              </div>

              {/* Offense Level with Automatic Linked Star Values */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Offense Level & Linked Action</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleUpdateInfractionLevel(1)}
                    className={`p-2.5 rounded-xl border text-xs font-bold cursor-pointer text-center transition-all ${
                      infractionOffenseLevel === 1
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-xs'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div>🟡 Level 1</div>
                    <div className="text-[10px] font-normal text-slate-400 mt-0.5">Warning / Apology</div>
                    <div className="text-[10px] font-mono font-bold text-amber-400 mt-1">
                      {getLinkedStarDeduction(activeRuleObject, 1) > 0 ? `-${getLinkedStarDeduction(activeRuleObject, 1)} ⭐` : '0 ⭐'}
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleUpdateInfractionLevel(2)}
                    className={`p-2.5 rounded-xl border text-xs font-bold cursor-pointer text-center transition-all ${
                      infractionOffenseLevel === 2
                        ? 'bg-orange-500/20 border-orange-400 text-orange-300 shadow-xs'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div>🟠 Level 2</div>
                    <div className="text-[10px] font-normal text-slate-400 mt-0.5">Reflection / Chore</div>
                    <div className="text-[10px] font-mono font-bold text-orange-400 mt-1">
                      {getLinkedStarDeduction(activeRuleObject, 2) > 0 ? `-${getLinkedStarDeduction(activeRuleObject, 2)} ⭐` : '0 ⭐'}
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleUpdateInfractionLevel(3)}
                    className={`p-2.5 rounded-xl border text-xs font-bold cursor-pointer text-center transition-all ${
                      infractionOffenseLevel === 3
                        ? 'bg-rose-500/20 border-rose-400 text-rose-300 shadow-xs'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div>🔴 Level 3</div>
                    <div className="text-[10px] font-normal text-slate-400 mt-0.5">Star Removal</div>
                    <div className="text-[10px] font-mono font-bold text-rose-400 mt-1">
                      -{getLinkedStarDeduction(activeRuleObject, 3)} ⭐
                    </div>
                  </button>
                </div>
              </div>

              {/* Automatic Star Deduction & Live Balance Impact */}
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="chk-deduct-stars"
                      checked={infractionDeductStars}
                      onChange={(e) => setInfractionDeductStars(e.target.checked)}
                      className="rounded accent-rose-500"
                    />
                    <label htmlFor="chk-deduct-stars" className="text-xs font-bold text-white cursor-pointer">
                      Deduct Stars from {activeKidObject?.name}'s Total Balance
                    </label>
                  </div>
                  {infractionDeductStars && (
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-rose-400 font-bold">-</span>
                      <input
                        type="number"
                        min={1}
                        max={50}
                        value={infractionStarsAmount}
                        onChange={(e) => setInfractionStarsAmount(Math.max(1, Number(e.target.value)))}
                        className="w-14 px-2 py-1 bg-slate-900 border border-rose-500/40 rounded-lg text-xs font-bold text-white text-center focus:outline-hidden"
                      />
                      <span className="text-xs text-slate-300 font-bold">Stars</span>
                    </div>
                  )}
                </div>

                {/* Live Balance Impact Preview */}
                {infractionDeductStars && activeKidObject && (
                  <div className="bg-slate-900/90 rounded-lg p-2 border border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Current Balance:</span>
                    <div className="flex items-center gap-2 font-mono font-black">
                      <span className="text-slate-300">{activeKidObject.stars} ⭐</span>
                      <ArrowRight className="w-3.5 h-3.5 text-rose-400" />
                      <span className="text-rose-400">
                        {Math.max(0, activeKidObject.stars - infractionStarsAmount)} ⭐
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Optional Incident Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Incident Explanation / Notes (Optional)
                </label>
                <input
                  type="text"
                  value={infractionNotes}
                  onChange={(e) => setInfractionNotes(e.target.value)}
                  placeholder="e.g. Disregarded screen cutoff time after homework"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end mt-4">
              <button
                type="button"
                onClick={() => setIsIssueInfractionOpen(false)}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmInfraction}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-xl text-xs transition cursor-pointer shadow-md active:scale-95"
              >
                Confirm & Apply Deduction
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
         ADD / EDIT RULE FORM MODAL WITH AUTOMATIC STAR DEDUCTION CONFIGURATION
         ========================================================================= */}
      {isAddRuleOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Edit2 className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-black text-white">
                  {editingRule ? `Edit Rule #${editingRule.ruleNumber}` : 'Add New House Rule'}
                </h4>
              </div>
              <button
                onClick={() => {
                  setIsAddRuleOpen(false);
                  setEditingRule(null);
                }}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3.5 text-left">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Rule Title</label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Respect & Words"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Category</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as HouseRuleCategory)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl text-xs text-white focus:outline-hidden"
                >
                  <option value="respect">Respect & Kindness</option>
                  <option value="chores">Chores & Cleanliness</option>
                  <option value="honesty">Honesty & Trust</option>
                  <option value="screens">Screens & Devices</option>
                  <option value="bedtime">Bedtime & Sleep</option>
                  <option value="safety">Safety & Boundaries</option>
                  <option value="general">General Household</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Rule Description</label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Explain what is expected of kids in clear, positive words..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-hidden"
                />
              </div>

              {/* Automatic Star Deduction Linking Configuration */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div>
                    <span className="text-xs font-black uppercase text-amber-400 tracking-wider block">
                      Automatic Star Deduction Progression:
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Link specific penalties to automatic balance deduction
                    </span>
                  </div>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formAutoDeductEnabled}
                      onChange={(e) => setFormAutoDeductEnabled(e.target.checked)}
                      className="rounded accent-amber-500"
                    />
                    <span className="text-[11px] font-bold text-white">Auto-Deduct Active</span>
                  </label>
                </div>

                {/* Level 1 Consequence + Deduction */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold text-amber-300">
                      🟡 1st Offense Consequence (Warning)
                    </label>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-slate-400">Deduct:</span>
                      <div className="flex items-center gap-1">
                        {[0, 1, 2].map((pts) => (
                          <button
                            key={pts}
                            type="button"
                            onClick={() => setFormFirstOffenseStars(pts)}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold cursor-pointer transition ${
                              formFirstOffenseStars === pts
                                ? 'bg-amber-400 text-slate-950 font-black'
                                : 'bg-slate-900 text-slate-400 hover:text-white'
                            }`}
                          >
                            {pts === 0 ? '0 ⭐' : `-${pts}`}
                          </button>
                        ))}
                      </div>
                      <input
                        type="number"
                        min={0}
                        max={50}
                        value={formFirstOffenseStars}
                        onChange={(e) => setFormFirstOffenseStars(Math.max(0, Number(e.target.value)))}
                        className="w-12 px-1.5 py-0.5 bg-slate-900 border border-slate-700 rounded text-center text-xs text-white"
                      />
                      <span className="text-[10px] text-slate-400">⭐</span>
                    </div>
                  </div>
                  <input
                    type="text"
                    value={formFirstOffense}
                    onChange={(e) => setFormFirstOffense(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-hidden"
                  />
                </div>

                {/* Level 2 Consequence + Deduction */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold text-orange-300">
                      🟠 2nd Offense Consequence (Reflection / Chore)
                    </label>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-slate-400">Deduct:</span>
                      <div className="flex items-center gap-1">
                        {[0, 2, 3, 5].map((pts) => (
                          <button
                            key={pts}
                            type="button"
                            onClick={() => setFormSecondOffenseStars(pts)}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold cursor-pointer transition ${
                              formSecondOffenseStars === pts
                                ? 'bg-orange-400 text-slate-950 font-black'
                                : 'bg-slate-900 text-slate-400 hover:text-white'
                            }`}
                          >
                            {pts === 0 ? '0' : `-${pts}`}
                          </button>
                        ))}
                      </div>
                      <input
                        type="number"
                        min={0}
                        max={50}
                        value={formSecondOffenseStars}
                        onChange={(e) => setFormSecondOffenseStars(Math.max(0, Number(e.target.value)))}
                        className="w-12 px-1.5 py-0.5 bg-slate-900 border border-slate-700 rounded text-center text-xs text-white"
                      />
                      <span className="text-[10px] text-slate-400">⭐</span>
                    </div>
                  </div>
                  <input
                    type="text"
                    value={formSecondOffense}
                    onChange={(e) => setFormSecondOffense(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-hidden"
                  />
                </div>

                {/* Level 3 Consequence + Deduction */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold text-rose-300">
                      🔴 3rd Offense Consequence (Major Infraction)
                    </label>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-slate-400">Deduct:</span>
                      <div className="flex items-center gap-1">
                        {[3, 5, 10, 15].map((pts) => (
                          <button
                            key={pts}
                            type="button"
                            onClick={() => {
                              setFormThirdOffenseStars(pts);
                              setFormStarPenalty(pts);
                            }}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold cursor-pointer transition ${
                              formThirdOffenseStars === pts
                                ? 'bg-rose-500 text-white font-black'
                                : 'bg-slate-900 text-slate-400 hover:text-white'
                            }`}
                          >
                            -{pts}
                          </button>
                        ))}
                      </div>
                      <input
                        type="number"
                        min={0}
                        max={50}
                        value={formThirdOffenseStars}
                        onChange={(e) => {
                          const val = Math.max(0, Number(e.target.value));
                          setFormThirdOffenseStars(val);
                          setFormStarPenalty(val);
                        }}
                        className="w-12 px-1.5 py-0.5 bg-slate-900 border border-rose-500/50 rounded text-center text-xs text-white font-bold"
                      />
                      <span className="text-[10px] text-rose-400 font-bold">⭐</span>
                    </div>
                  </div>
                  <input
                    type="text"
                    value={formThirdOffense}
                    onChange={(e) => setFormThirdOffense(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-hidden"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 justify-end mt-4">
              <button
                type="button"
                onClick={() => {
                  setIsAddRuleOpen(false);
                  setEditingRule(null);
                }}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveRule}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs transition cursor-pointer shadow-md active:scale-95"
              >
                Save Rule & Deductions
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
