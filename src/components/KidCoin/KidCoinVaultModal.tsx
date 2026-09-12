import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'motion/react';
import { KidProfile, SavingsGoal, KidCoinTransaction, FamilyDatabase } from '../../types';
import { sound } from '../../utils/sound';
import { generateDefaultMilestones } from '../../utils/kidCoin';
import { RocketGoalTrack } from './RocketGoalTrack';
import { RocketTakeoffModal } from './RocketTakeoffModal';
import { CoachTips } from './CoachTips';
import { NewGoalModal } from './NewGoalModal';
import { GoalIcon } from './GoalIcon';
import {
  Coins,
  X,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  PiggyBank,
  Sparkles,
  TrendingUp,
  History,
  ShieldCheck,
  Flame,
  Award,
  ChevronRight,
  Compass,
} from 'lucide-react';

interface KidCoinVaultModalProps {
  isOpen: boolean;
  kid: KidProfile;
  database: FamilyDatabase;
  onClose: () => void;
  onUpdateKid: (updatedKid: KidProfile) => void;
}

export const KidCoinVaultModal: React.FC<KidCoinVaultModalProps> = ({
  isOpen,
  kid,
  database,
  onClose,
  onUpdateKid,
}) => {
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [showTakeoffModal, setShowTakeoffModal] = useState<boolean>(false);
  const [showNewGoalModal, setShowNewGoalModal] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'goals' | 'coach' | 'ledger'>('goals');
  const [depositAmount, setDepositAmount] = useState<string>('5.00');
  const [depositNote, setDepositNote] = useState<string>('Chore quest bounty contribution');

  if (!isOpen) return null;

  const goals = kid.goals || [];
  const primaryGoal = goals.find((g) => g.id === selectedGoalId) ||
    goals.find((g) => g.priority === 'primary') ||
    goals[0];

  const totalSaved = goals.reduce((acc, g) => acc + g.currentSaved, 0);
  const transactions = kid.transactions || [];
  const interestRate = database.settings.bankInterestRateMonthlyPercent ?? 5;

  const handleDepositToGoal = (amountNum: number, note: string) => {
    if (!primaryGoal || amountNum <= 0) return;

    const newSaved = Number((primaryGoal.currentSaved + amountNum).toFixed(2));
    const wasUnder100 = primaryGoal.currentSaved < primaryGoal.targetCost;
    const isNow100 = newSaved >= primaryGoal.targetCost;

    // Check if new milestone reached
    const prevPercent = (primaryGoal.currentSaved / primaryGoal.targetCost) * 100;
    const newPercent = (newSaved / primaryGoal.targetCost) * 100;

    const updatedGoals = goals.map((g) => {
      if (g.id === primaryGoal.id) {
        return {
          ...g,
          currentSaved: newSaved,
          milestones: generateDefaultMilestones(g.targetCost, newSaved),
        };
      }
      return g;
    });

    const newTx: KidCoinTransaction = {
      id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      kidId: kid.id,
      type: 'deposit',
      amount: amountNum,
      category: 'chore',
      description: note || `Deposit towards ${primaryGoal.title}`,
      date: new Date().toISOString().split('T')[0],
      goalContribution: primaryGoal.id,
    };

    const updatedKid: KidProfile = {
      ...kid,
      totalSaved: updatedGoals.reduce((acc, g) => acc + g.currentSaved, 0),
      goals: updatedGoals,
      transactions: [newTx, ...transactions],
    };

    sound.playCoinSound();

    if (wasUnder100 && isNow100) {
      setTimeout(() => {
        sound.playVictorySound();
        setShowTakeoffModal(true);
      }, 300);
    } else if (
      (prevPercent < 25 && newPercent >= 25) ||
      (prevPercent < 50 && newPercent >= 50) ||
      (prevPercent < 75 && newPercent >= 75)
    ) {
      setTimeout(() => {
        sound.playMilestoneFanfare();
      }, 300);
    }

    onUpdateKid(updatedKid);
  };

  const handleAddGoal = (newGoal: SavingsGoal) => {
    let updatedGoals = [...goals];
    // Set all previous goals to secondary, and the new goal as primary
    updatedGoals = updatedGoals.map((g) => ({ ...g, priority: 'secondary' as const }));
    const primaryNewGoal: SavingsGoal = { ...newGoal, priority: 'primary' as const };
    updatedGoals.unshift(primaryNewGoal);

    const updatedKid: KidProfile = {
      ...kid,
      goals: updatedGoals,
    };

    onUpdateKid(updatedKid);
    setSelectedGoalId(newGoal.id);
  };

  const handleSelectGoal = (goalId: string) => {
    setSelectedGoalId(goalId);
    const updatedGoals = goals.map((g) => ({
      ...g,
      priority: (g.id === goalId ? 'primary' : 'secondary') as 'primary' | 'secondary',
    }));
    onUpdateKid({
      ...kid,
      goals: updatedGoals,
    });
    sound.playTap();
  };

  if (!isOpen) return null;

  return createPortal(
    <>
      <div key="vault-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md overflow-y-auto">
        <motion.div
          key="vault-modal-card"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-4xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl my-6 flex flex-col max-h-[92vh] overflow-hidden text-slate-900 dark:text-white"
        >
          {/* Header Bar */}
          <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4 bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-transparent">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-400 flex items-center justify-center text-white shadow-md shadow-orange-500/30 text-2xl font-black">
                🪙
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                    {kid.name}'s Kid-Coin Savings Vault
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 text-[10px] font-black uppercase tracking-wider border border-amber-300 dark:border-amber-700">
                    Active
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Fuel your rocket missions with chores • Bank of Mom & Dad {interestRate}% Monthly Interest
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

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200/80 dark:border-slate-800">
            <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <span className="text-[10px] uppercase font-black tracking-wider text-slate-400">Total Saved</span>
              <div className="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-0.5">
                <PiggyBank className="w-4 h-4" />
                <span>${totalSaved.toFixed(2)}</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <span className="text-[10px] uppercase font-black tracking-wider text-slate-400">Pocket Balance</span>
              <div className="text-base sm:text-lg font-black text-amber-500 flex items-center gap-1 mt-0.5">
                <Coins className="w-4 h-4" />
                <span>${(kid.kidCoinBalance || 0).toFixed(2)}</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <span className="text-[10px] uppercase font-black tracking-wider text-slate-400">Weekly Allowance</span>
              <div className="text-base sm:text-lg font-black text-indigo-500 flex items-center gap-1 mt-0.5">
                <TrendingUp className="w-4 h-4" />
                <span>${(kid.weeklyAllowance || 5).toFixed(2)}/wk</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <span className="text-[10px] uppercase font-black tracking-wider text-slate-400">Parent Match</span>
              <div className="text-base sm:text-lg font-black text-purple-500 flex items-center gap-1 mt-0.5">
                <ShieldCheck className="w-4 h-4" />
                <span>+{interestRate}% / mo</span>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2 px-4 pt-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <button
              onClick={() => {
                setActiveTab('goals');
                sound.playTap();
              }}
              className={`pb-2.5 px-3 text-xs font-black transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'goals'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Rocket Missions ({goals.length})</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('coach');
                sound.playTap();
              }}
              className={`pb-2.5 px-3 text-xs font-black transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'coach'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Captain Penny Coach</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('ledger');
                sound.playTap();
              }}
              className={`pb-2.5 px-3 text-xs font-black transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'ledger'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Transaction Ledger ({transactions.length})</span>
            </button>
          </div>

          {/* Modal Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            {activeTab === 'goals' && (
              <>
                {/* Goal Selector Pills */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
                    {goals.map((g) => {
                      const isSelected = (primaryGoal?.id === g.id);
                      const pct = Math.min(100, Math.round((g.currentSaved / g.targetCost) * 100));
                      return (
                        <button
                          key={g.id}
                          onClick={() => handleSelectGoal(g.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
                            isSelected
                              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                          }`}
                        >
                          <GoalIcon icon={g.icon} className="w-3.5 h-3.5" />
                          <span>{g.title}</span>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                            isSelected ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                          }`}>
                            {pct}%
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => {
                      sound.playTap();
                      setShowNewGoalModal(true);
                    }}
                    className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-bold rounded-xl shadow-xs transition-transform active:scale-95 cursor-pointer flex items-center gap-1.5 shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>New Goal</span>
                  </button>
                </div>

                {/* Primary Rocket Goal Track */}
                {primaryGoal ? (
                  <div className="space-y-4">
                    <RocketGoalTrack
                      goal={primaryGoal}
                      kid={kid}
                      onLaunchRocket={() => setShowTakeoffModal(true)}
                    />

                    {/* Quick Deposit Console */}
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
                      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                        <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                          <Coins className="w-4 h-4 text-amber-500" />
                          <span>Quick Fuel Deposit to {primaryGoal.title}</span>
                        </span>
                        <span className="text-xs font-bold text-slate-500">
                          Current: <strong>${primaryGoal.currentSaved.toFixed(2)}</strong> / ${primaryGoal.targetCost.toFixed(2)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        {[1, 2, 5, 10, 20].map((amt) => (
                          <button
                            key={amt}
                            onClick={() => handleDepositToGoal(amt, `Added $${amt} from chore quest`)}
                            className="px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-amber-400 text-slate-800 dark:text-slate-100 text-xs font-black shadow-xs transition-transform active:scale-95 cursor-pointer"
                          >
                            +${amt}
                          </button>
                        ))}

                        <div className="flex-1 min-w-[160px] flex items-center gap-2">
                          <input
                            type="number"
                            min="0.50"
                            step="0.50"
                            value={depositAmount}
                            onChange={(e) => setDepositAmount(e.target.value)}
                            placeholder="Amount"
                            className="w-24 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                          />
                          <button
                            onClick={() => {
                              const amt = parseFloat(depositAmount);
                              if (!isNaN(amt) && amt > 0) {
                                handleDepositToGoal(amt, depositNote);
                              }
                            }}
                            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black shadow-xs cursor-pointer flex items-center gap-1"
                          >
                            <ArrowUpRight className="w-3.5 h-3.5" />
                            <span>Deposit</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Milestones Card Grid */}
                    <div className="space-y-2">
                      <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                        Cosmic Milestones & XP Bonuses
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        {(primaryGoal.milestones || generateDefaultMilestones(primaryGoal.targetCost, primaryGoal.currentSaved)).map((m) => (
                          <div
                            key={m.percent}
                            className={`p-3 rounded-2xl border transition-all ${
                              m.reached
                                ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800'
                                : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-70'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className={`text-xs font-black ${m.reached ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-500'}`}>
                                {m.percent}% Checkpoint
                              </span>
                              {m.reached ? (
                                <span className="text-emerald-500 text-sm">✅</span>
                              ) : (
                                <span className="text-slate-400 text-xs">🔒</span>
                              )}
                            </div>
                            <p className="text-[10px] text-slate-600 dark:text-slate-300 mt-1 line-clamp-1 font-medium">
                              {m.label}
                            </p>
                            <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400 mt-1 block">
                              +{m.rewardXP} Bonus Stars
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-10 space-y-3">
                    <p className="text-sm text-slate-500">No savings mission active yet.</p>
                    <button
                      onClick={() => setShowNewGoalModal(true)}
                      className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl"
                    >
                      + Create First Dream Mission
                    </button>
                  </div>
                )}
              </>
            )}

            {activeTab === 'coach' && primaryGoal && (
              <CoachTips kid={kid} goal={primaryGoal} />
            )}

            {activeTab === 'ledger' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                    Kid-Coin Vault Activity History
                  </span>
                  <span className="text-xs font-bold text-slate-400">
                    {transactions.length} record{transactions.length === 1 ? '' : 's'}
                  </span>
                </div>

                {transactions.length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-400">
                    No transactions yet. Complete chores to earn your first coins!
                  </div>
                ) : (
                  <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
                    {transactions.map((tx) => (
                      <div key={tx.id} className="p-3 flex items-center justify-between text-xs hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm ${
                            tx.type === 'deposit'
                              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600'
                              : 'bg-rose-100 dark:bg-rose-950/60 text-rose-600'
                          }`}>
                            {tx.type === 'deposit' ? '+' : '-'}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white block">
                              {tx.description}
                            </span>
                            <div className="flex items-center gap-2 text-[10px] text-slate-400">
                              <span>{tx.date}</span>
                              <span>•</span>
                              <span className="capitalize">{tx.category}</span>
                            </div>
                          </div>
                        </div>

                        <span className={`font-black text-xs ${
                          tx.type === 'deposit'
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-rose-600 dark:text-rose-400'
                        }`}>
                          {tx.type === 'deposit' ? '+' : '-'}${tx.amount.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer Bar */}
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30 text-xs">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Offline-first local ledger • Docker & Raspberry Pi sync ready</span>
            </div>

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer"
            >
              Close Vault
            </button>
          </div>
        </motion.div>
      </div>

      {/* Sub-modals outside of main modal backdrop */}
      {showTakeoffModal && primaryGoal && (
        <RocketTakeoffModal
          key="sub-takeoff-modal"
          isOpen={showTakeoffModal}
          goal={primaryGoal}
          kid={kid}
          onClose={() => setShowTakeoffModal(false)}
        />
      )}

      {showNewGoalModal && (
        <NewGoalModal
          key="sub-new-goal-modal"
          isOpen={showNewGoalModal}
          kid={kid}
          onClose={() => setShowNewGoalModal(false)}
          onSaveGoal={handleAddGoal}
        />
      )}
    </>,
    document.body
  );
};
