import React, { useState } from 'react';
import { FamilyDatabase, KidProfile, SavingsGoal, KidCoinTransaction } from '../../types';
import { applyMonthlyInterest, VERIFIED_WISHLIST_ITEMS, generateDefaultMilestones } from '../../utils/kidCoin';
import { sound } from '../../utils/sound';
import { KidCoinVaultModal } from '../KidCoin/KidCoinVaultModal';
import { RocketGoalTrack } from '../KidCoin/RocketGoalTrack';
import { GoalIcon } from '../KidCoin/GoalIcon';
import {
  Coins,
  ShieldCheck,
  TrendingUp,
  Percent,
  PiggyBank,
  Plus,
  ArrowUpRight,
  Sparkles,
  Rocket,
  CheckCircle2,
  RefreshCw,
  Gift,
  Flame,
} from 'lucide-react';

interface ParentSavingsManagementProps {
  database: FamilyDatabase;
  onUpdateDatabase: (updated: FamilyDatabase) => void;
}

export const ParentSavingsManagement: React.FC<ParentSavingsManagementProps> = ({
  database,
  onUpdateDatabase,
}) => {
  const [selectedKidForVault, setSelectedKidForVault] = useState<KidProfile | null>(null);
  const [interestSuccessMessage, setInterestSuccessMessage] = useState<string | null>(null);
  const [bonusKidId, setBonusKidId] = useState<string>(database.kids[0]?.id || '');
  const [bonusAmount, setBonusAmount] = useState<string>('5.00');
  const [bonusNote, setBonusNote] = useState<string>('Parent Savings Match Booster');

  const settings = database.settings;
  const isEnabled = settings.kidCoinEnabled !== false;
  const ratio = settings.kidCoinRatio ?? 0.10;
  const interestRate = settings.bankInterestRateMonthlyPercent ?? 5;
  const autoDeposit = settings.autoDepositChoresToGoal !== false;

  const totalFamilySaved = database.kids.reduce((acc, k) => {
    const goalsTotal = (k.goals || []).reduce((gAcc, g) => gAcc + g.currentSaved, 0);
    return acc + goalsTotal + (k.kidCoinBalance || 0);
  }, 0);

  const handleToggleKidCoin = () => {
    sound.playTap();
    onUpdateDatabase({
      ...database,
      settings: {
        ...settings,
        kidCoinEnabled: !isEnabled,
      },
    });
  };

  const handleRatioChange = (newRatio: number) => {
    sound.playTap();
    onUpdateDatabase({
      ...database,
      settings: {
        ...settings,
        kidCoinRatio: newRatio,
      },
    });
  };

  const handleInterestRateChange = (newRate: number) => {
    sound.playTap();
    onUpdateDatabase({
      ...database,
      settings: {
        ...settings,
        bankInterestRateMonthlyPercent: newRate,
      },
    });
  };

  const handleToggleAutoDeposit = () => {
    sound.playTap();
    onUpdateDatabase({
      ...database,
      settings: {
        ...settings,
        autoDepositChoresToGoal: !autoDeposit,
      },
    });
  };

  const handleApplyMonthlyInterest = () => {
    const { updatedDb, totalInterestPaid } = applyMonthlyInterest(database);
    onUpdateDatabase(updatedDb);
    sound.playVictorySound();
    setInterestSuccessMessage(`🎉 Successfully credited $${totalInterestPaid.toFixed(2)} in Bank of Mom & Dad matching interest!`);
    setTimeout(() => setInterestSuccessMessage(null), 5000);
  };

  const handleGrantBonus = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(bonusAmount);
    if (!bonusKidId || isNaN(amt) || amt <= 0) return;

    const todayStr = new Date().toISOString().split('T')[0];
    const updatedKids = database.kids.map((k) => {
      if (k.id === bonusKidId) {
        const goals = k.goals || [];
        const primaryGoal = goals.find((g) => g.priority === 'primary') || goals[0];

        let updatedGoals = goals;
        let newBalance = k.kidCoinBalance || 0;

        if (primaryGoal) {
          updatedGoals = goals.map((g) => {
            if (g.id === primaryGoal.id) {
              const newSaved = Number((g.currentSaved + amt).toFixed(2));
              return {
                ...g,
                currentSaved: newSaved,
                milestones: generateDefaultMilestones(g.targetCost, newSaved),
              };
            }
            return g;
          });
        } else {
          newBalance = Number((newBalance + amt).toFixed(2));
        }

        const tx: KidCoinTransaction = {
          id: `tx-bonus-${Date.now()}`,
          kidId: k.id,
          type: 'deposit',
          amount: amt,
          category: 'gift',
          description: bonusNote || 'Parent Bonus Match',
          date: todayStr,
          goalContribution: primaryGoal?.id,
        };

        return {
          ...k,
          kidCoinBalance: newBalance,
          totalSaved: updatedGoals.reduce((acc, g) => acc + g.currentSaved, 0),
          goals: updatedGoals,
          transactions: [tx, ...(k.transactions || [])],
        };
      }
      return k;
    });

    onUpdateDatabase({ ...database, kids: updatedKids });
    sound.playCoinSound();
    setBonusAmount('5.00');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-amber-500/15 via-indigo-500/10 to-transparent border border-amber-300 dark:border-amber-800 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 flex items-center justify-center text-white shadow-md shadow-amber-500/30 text-2xl font-black">
            🪙
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Kid-Coin Financial Engine & Savings Goals
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-black uppercase">
                AstroLee93 Core
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
              Empower children with real-world savings habits • Chores earn coin fuel towards wishlist goals
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Total Family Vault</span>
            <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
              ${totalFamilySaved.toFixed(2)}
            </span>
          </div>

          <button
            onClick={handleToggleKidCoin}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer shadow-xs ${
              isEnabled
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            {isEnabled ? 'System Active ✅' : 'System Disabled ⏸️'}
          </button>
        </div>
      </div>

      {interestSuccessMessage && (
        <div className="p-4 rounded-2xl bg-emerald-100 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs font-bold flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>{interestSuccessMessage}</span>
        </div>
      )}

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Star Conversion Rate */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-xs font-black text-slate-800 dark:text-slate-200">
            <Coins className="w-4 h-4 text-amber-500" />
            <span>Chore Star-to-Coin Value</span>
          </div>
          <p className="text-[11px] text-slate-500">
            How much real money or coin fuel is earned for each completed chore star point.
          </p>
          <div className="flex gap-1.5 pt-1">
            {[0.05, 0.10, 0.25, 0.50].map((val) => (
              <button
                key={val}
                onClick={() => handleRatioChange(val)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-black border transition-all cursor-pointer ${
                  ratio === val
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                ${val.toFixed(2)}
              </button>
            ))}
          </div>
        </div>

        {/* Bank of Mom & Dad Monthly Interest */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-black text-slate-800 dark:text-slate-200">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <span>Parent Monthly Match</span>
            </div>
            <span className="text-xs font-black text-purple-600">{interestRate}% / mo</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Simulates compound interest to encourage kids to keep money saved in their vault!
          </p>
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleApplyMonthlyInterest}
              className="w-full py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-black shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Credit Interest Now</span>
            </button>
          </div>
        </div>

        {/* Auto-deposit chores to goal */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-xs font-black text-slate-800 dark:text-slate-200">
            <Rocket className="w-4 h-4 text-rose-500" />
            <span>Chore Rocket Auto-Fuel</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Automatically deposit chore earnings straight into the child's primary rocket goal.
          </p>
          <div className="pt-1">
            <button
              onClick={handleToggleAutoDeposit}
              className={`w-full py-2 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                autoDeposit
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950 text-emerald-600'
                  : 'border-slate-300 text-slate-500'
              }`}
            >
              {autoDeposit ? 'Auto-Deposit Active 🚀' : 'Deposit to Cash Balance'}
            </button>
          </div>
        </div>
      </div>

      {/* Parent Bonus Booster Tool */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
        <form onSubmit={handleGrantBonus} className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-xs font-black text-slate-800 dark:text-slate-200">
            <Gift className="w-4 h-4 text-amber-500" />
            <span>Grant Bonus Match or Gift:</span>
          </div>

          <select
            value={bonusKidId}
            onChange={(e) => setBonusKidId(e.target.value)}
            className="px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
          >
            {database.kids.map((k) => (
              <option key={k.id} value={k.id}>
                {k.name}
              </option>
            ))}
          </select>

          <input
            type="number"
            min="0.50"
            step="0.50"
            value={bonusAmount}
            onChange={(e) => setBonusAmount(e.target.value)}
            placeholder="Amount"
            className="w-24 px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
          />

          <input
            type="text"
            value={bonusNote}
            onChange={(e) => setBonusNote(e.target.value)}
            placeholder="Note (e.g., Straight A's Reward)"
            className="flex-1 min-w-[160px] px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
          />

          <button
            type="submit"
            className="px-4 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-black rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Award Bonus</span>
          </button>
        </form>
      </div>

      {/* Children Savings Status Cards */}
      <div className="space-y-3">
        <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">
          Children Rocket Missions & Vault Telemetry
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {database.kids.map((kid) => {
            const goals = kid.goals || [];
            const primaryGoal = goals.find((g) => g.priority === 'primary') || goals[0];
            const percent = primaryGoal
              ? Math.min(100, Math.round((primaryGoal.currentSaved / Math.max(1, primaryGoal.targetCost)) * 100))
              : 0;
            const totalKidSaved = goals.reduce((acc, g) => acc + g.currentSaved, 0);

            return (
              <div
                key={kid.id}
                className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
              >
                {/* Kid Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-sm shadow-xs"
                      style={{ backgroundColor: kid.color || '#3b82f6' }}
                    >
                      {kid.avatar}
                    </div>
                    <div>
                      <h5 className="font-extrabold text-sm text-slate-900 dark:text-white">
                        {kid.name}
                      </h5>
                      <span className="text-[10px] text-slate-400">
                        Allowance: ${(kid.weeklyAllowance || 5).toFixed(2)}/wk
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      sound.playTap();
                      setSelectedKidForVault(kid);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-600 dark:text-indigo-400 text-[11px] font-black border border-indigo-200 dark:border-indigo-800 cursor-pointer flex items-center gap-1"
                  >
                    <span>Manage Vault</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </button>
                </div>

                {/* Primary Mission Info */}
                {primaryGoal ? (
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <GoalIcon icon={primaryGoal.icon} className="w-4 h-4 text-amber-500" />
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                          {primaryGoal.title}
                        </span>
                      </div>
                      <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">
                        {percent}%
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-400 via-indigo-500 to-amber-500 rounded-full"
                        style={{ width: `${percent}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                      <span>Saved: ${primaryGoal.currentSaved.toFixed(2)}</span>
                      <span>Target: ${primaryGoal.targetCost.toFixed(2)}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 text-xs text-slate-400">
                    No active dream goal set yet.
                  </div>
                )}

                {/* Vault Totals */}
                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Total Vault:</span>
                  <span className="font-black text-emerald-600 dark:text-emerald-400">
                    ${(totalKidSaved + (kid.kidCoinBalance || 0)).toFixed(2)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Verified Wishlist MSRP Catalog Preview */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Verified Retail MSRP Catalog ({VERIFIED_WISHLIST_ITEMS.length} items)
            </h4>
          </div>
          <span className="text-[11px] text-slate-400">Real-world prices checked & verified</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {VERIFIED_WISHLIST_ITEMS.map((item) => (
            <div
              key={item.id}
              className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-indigo-600">
                  <GoalIcon icon={item.icon} className="w-4 h-4" />
                </div>
                <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                  ${item.currentCost.toFixed(2)}
                </span>
              </div>
              <h6 className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1">
                {item.name}
              </h6>
              <p className="text-[10px] text-slate-400 line-clamp-1">
                {item.retailer}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Vault modal when parent clicks Manage Vault */}
      {selectedKidForVault && (
        <KidCoinVaultModal
          isOpen={!!selectedKidForVault}
          kid={selectedKidForVault}
          database={database}
          onClose={() => setSelectedKidForVault(null)}
          onUpdateKid={(updatedKid) => {
            const updatedKids = database.kids.map((k) => (k.id === updatedKid.id ? updatedKid : k));
            onUpdateDatabase({ ...database, kids: updatedKids });
            setSelectedKidForVault(updatedKid);
          }}
        />
      )}
    </div>
  );
};
