import React, { useState } from 'react';
import { KidProfile, SavingsGoal, FamilyDatabase } from '../../types';
import { RocketGoalTrack } from './RocketGoalTrack';
import { RocketTakeoffModal } from './RocketTakeoffModal';
import { KidCoinVaultModal } from './KidCoinVaultModal';
import { NewGoalModal } from './NewGoalModal';
import { GoalIcon } from './GoalIcon';
import { sound } from '../../utils/sound';
import {
  Rocket,
  Coins,
  Sparkles,
  Flame,
  Plus,
  ArrowUpRight,
  ShieldCheck,
  ChevronRight,
  PiggyBank,
  Check,
} from 'lucide-react';

interface GoalTrackerProps {
  kid: KidProfile;
  database: FamilyDatabase;
  onUpdateKid: (updatedKid: KidProfile) => void;
  compact?: boolean;
}

export const GoalTracker: React.FC<GoalTrackerProps> = ({
  kid,
  database,
  onUpdateKid,
  compact = false,
}) => {
  const [showVaultModal, setShowVaultModal] = useState(false);
  const [showTakeoffModal, setShowTakeoffModal] = useState(false);
  const [showNewGoalModal, setShowNewGoalModal] = useState(false);

  const goals = kid.goals || [];
  const primaryGoal = goals.find((g) => g.priority === 'primary') || goals[0];

  const handleSaveNewGoal = (newGoal: SavingsGoal) => {
    // When adding a new goal, prioritize it as the primary active rocket mission
    const otherGoals = goals.map((g) => ({
      ...g,
      priority: 'secondary' as const,
    }));
    const primaryNewGoal: SavingsGoal = {
      ...newGoal,
      priority: 'primary' as const,
    };
    const updated: KidProfile = {
      ...kid,
      goals: [primaryNewGoal, ...otherGoals],
    };
    onUpdateKid(updated);
    sound.playCoinSound();
  };

  const handleSelectGoal = (goalId: string) => {
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

  if (!primaryGoal) {
    return (
      <div className="w-full bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-transparent border border-dashed border-amber-300 dark:border-amber-700/60 rounded-3xl p-5 text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/70 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-2xl mx-auto shadow-sm">
          🎯
        </div>
        <div>
          <h3 className="text-base font-black text-slate-900 dark:text-white">
            Set Your First Kid-Coin Dream Mission!
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
            Pick a real prize (PlayStation 5, Nintendo Switch OLED, LEGO set, Robux) and watch your chores fuel the rocket!
          </p>
        </div>
        <button
          onClick={() => {
            sound.playTap();
            setShowNewGoalModal(true);
          }}
          className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-black rounded-xl shadow-md shadow-orange-500/20 transition-transform active:scale-95 cursor-pointer inline-flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Launch Dream Goal</span>
        </button>

        <NewGoalModal
          isOpen={showNewGoalModal}
          kid={kid}
          onClose={() => setShowNewGoalModal(false)}
          onSaveGoal={handleSaveNewGoal}
        />
      </div>
    );
  }

  const percent = Math.min(100, Math.round((primaryGoal.currentSaved / Math.max(1, primaryGoal.targetCost)) * 100));
  const remaining = Math.max(0, primaryGoal.targetCost - primaryGoal.currentSaved);

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 shadow-sm space-y-4">
      {/* Top Banner with Quick Summary */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-400 flex items-center justify-center text-white shadow-md shadow-orange-500/20 text-xl font-black shrink-0">
            <GoalIcon icon={primaryGoal.icon} className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                {primaryGoal.title}
              </h3>
              {primaryGoal.isVerified && (
                <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Verified MSRP</span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Saved: <strong className="text-emerald-600 dark:text-emerald-400">${primaryGoal.currentSaved.toFixed(2)}</strong> of ${primaryGoal.targetCost.toFixed(2)} (${remaining.toFixed(2)} to liftoff)
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              sound.playTap();
              setShowNewGoalModal(true);
            }}
            className="px-3 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-black rounded-xl transition-transform active:scale-95 cursor-pointer flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Goal</span>
          </button>

          <button
            onClick={() => {
              sound.playTap();
              setShowVaultModal(true);
            }}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-black rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
          >
            <PiggyBank className="w-4 h-4 text-amber-500" />
            <span>Open Vault</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Goal Switcher Pills if Kid has multiple missions */}
      {goals.length > 1 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-0.5">
          <span className="text-[10px] font-black uppercase text-slate-400 shrink-0">Active Missions:</span>
          {goals.map((g) => {
            const isCurrent = g.id === primaryGoal.id;
            const pct = Math.min(100, Math.round((g.currentSaved / Math.max(1, g.targetCost)) * 100));
            return (
              <button
                key={g.id}
                type="button"
                onClick={() => handleSelectGoal(g.id)}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  isCurrent
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30 ring-1 ring-indigo-400'
                    : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <GoalIcon icon={g.icon} className="w-3.5 h-3.5" />
                <span className="truncate max-w-[130px]">{g.title}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                    isCurrent ? 'bg-indigo-700 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                  }`}
                >
                  {pct}%
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Cosmic Rocket Trajectory */}
      <RocketGoalTrack
        goal={primaryGoal}
        kid={kid}
        compact={compact}
        onLaunchRocket={() => setShowTakeoffModal(true)}
      />

      {/* Subtle Financial Education & Auto-Deposit Note */}
      <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800/80 flex-wrap gap-2">
        <span className="flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Every completed chore automatically deposits fuel coins!</span>
        </span>
        <button
          onClick={() => setShowVaultModal(true)}
          className="text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer flex items-center gap-1"
        >
          <span>Captain Penny Tips & Ledger</span>
          <ArrowUpRight className="w-3 h-3" />
        </button>
      </div>

      {/* Full Vault Modal */}
      <KidCoinVaultModal
        isOpen={showVaultModal}
        kid={kid}
        database={database}
        onClose={() => setShowVaultModal(false)}
        onUpdateKid={onUpdateKid}
      />

      {/* New Goal Modal (accessible directly from tracker) */}
      <NewGoalModal
        isOpen={showNewGoalModal}
        kid={kid}
        onClose={() => setShowNewGoalModal(false)}
        onSaveGoal={handleSaveNewGoal}
      />

      {/* Takeoff Celebration Modal */}
      <RocketTakeoffModal
        isOpen={showTakeoffModal}
        goal={primaryGoal}
        kid={kid}
        onClose={() => setShowTakeoffModal(false)}
      />
    </div>
  );
};
