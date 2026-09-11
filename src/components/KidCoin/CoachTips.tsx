import React, { useState, useEffect } from 'react';
import { KidProfile, CoachAdvice, SavingsGoal } from '../../types';
import { Sparkles, Lightbulb, Zap, RefreshCw, Calculator, TrendingUp, Target, Rocket } from 'lucide-react';
import { sound } from '../../utils/sound';

interface CoachTipsProps {
  kid: KidProfile;
  goal?: SavingsGoal;
}

export const CoachTips: React.FC<CoachTipsProps> = ({ kid, goal }) => {
  const [advice, setAdvice] = useState<CoachAdvice | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [extraWeeklySlider, setExtraWeeklySlider] = useState<number>(5);

  const activeGoal = goal || (kid.goals && (kid.goals.find((g) => g.priority === 'primary') || kid.goals[0]));

  const fetchTips = async () => {
    if (!activeGoal) return;
    setLoading(true);
    try {
      const res = await fetch('/api/tips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kidName: kid.name,
          age: 9,
          goalName: activeGoal.title,
          targetCost: activeGoal.targetCost,
          currentSaved: activeGoal.currentSaved,
          weeklyAllowance: kid.weeklyAllowance || 5,
          recentChores: ['Morning routine', 'Bedroom tidy', 'Homework check'],
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.advice) {
          setAdvice(data.advice);
          return;
        }
      }

      // Algorithmic offline fallback
      generateFallbackAdvice();
    } catch (err) {
      console.warn('Tips fetch offline fallback:', err);
      generateFallbackAdvice();
    } finally {
      setLoading(false);
    }
  };

  const generateFallbackAdvice = () => {
    if (!activeGoal) return;
    const remaining = Math.max(0, activeGoal.targetCost - activeGoal.currentSaved);
    const progressPercent = Math.min(100, Math.round((activeGoal.currentSaved / activeGoal.targetCost) * 100));

    setAdvice({
      headline: progressPercent >= 100
        ? `Mission accomplished! Your ${activeGoal.title} rocket has touched down! 🚀🎉`
        : `Thrusters firing, ${kid.name}! You're ${progressPercent}% of the way to ${activeGoal.title}! 🚀`,
      milestoneTip: progressPercent >= 50
        ? `You've broken through low orbit! Keep up your streak to reach deep space (75%)!`
        : `Power up your savings! Only $${(activeGoal.targetCost * 0.25).toFixed(2)} needed to breach the Troposphere!`,
      fastTrackIdeas: [
        'Complete 1 extra bounty chore on the Chore Board this weekend for bonus coins.',
        'Deposit 100% of your weekly allowance directly into your locked savings vault.',
        'Help mom & dad with a garage, garden, or car-washing mission for a special booster.',
      ],
      spendingTradeoff: `Skipping one $3.50 treat or snack purchase keeps your savings intact and shaves half a week off your wait!`,
      estimatedPace: `At your steady rate, you are on track to touch down in just a few short weeks!`,
    });
  };

  useEffect(() => {
    fetchTips();
  }, [kid.id, activeGoal?.id, activeGoal?.currentSaved]);

  if (!activeGoal) return null;

  const remaining = Math.max(0, activeGoal.targetCost - activeGoal.currentSaved);
  const baseRate = Math.max(2, (kid.weeklyAllowance || 5) + 3); // allowance + typical chore earnings
  const normalWeeks = Math.max(1, Math.ceil(remaining / baseRate));
  const acceleratedRate = baseRate + extraWeeklySlider;
  const acceleratedWeeks = Math.max(1, Math.ceil(remaining / acceleratedRate));
  const weeksShaved = Math.max(0, normalWeeks - acceleratedWeeks);

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 shadow-sm space-y-4">
      {/* Header with Captain Penny Badge */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-xl">
            🧭
          </div>
          <div>
            <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
              <span>Captain Penny's Savings Telemetry</span>
              <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                AI Coach
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Smart flight paths to accelerate your {activeGoal.title} liftoff
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            sound.playTap();
            fetchTips();
          }}
          disabled={loading}
          className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title="Refresh coaching advice"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-600' : ''}`} />
        </button>
      </div>

      {/* Motivational Headline Banner */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/30 border border-indigo-100 dark:border-indigo-900/50 text-indigo-950 dark:text-indigo-200 text-xs sm:text-sm font-semibold flex items-start gap-2.5">
        <Sparkles className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
        <span>{advice?.headline || `Keep fueling your rocket! Every coin brings ${activeGoal.title} closer.`}</span>
      </div>

      {/* Strategy Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {/* Next Milestone Flight Plan */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-xs font-black text-slate-800 dark:text-slate-200">
            <Target className="w-4 h-4 text-amber-500" />
            <span>Next Target Checkpoint</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
            {advice?.milestoneTip || `Keep saving steadily to reach the next cosmic altitude marker!`}
          </p>
          <div className="text-[11px] font-bold text-amber-600 dark:text-amber-400">
            Remaining to Goal: ${remaining.toFixed(2)}
          </div>
        </div>

        {/* Smart Tradeoff */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-xs font-black text-slate-800 dark:text-slate-200">
            <Lightbulb className="w-4 h-4 text-emerald-500" />
            <span>Smart Spending Tradeoff</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
            {advice?.spendingTradeoff ||
              'Skipping 1 small snack or treat keeps extra dollars safe inside your rocket fuel tank!'}
          </p>
          <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
            {advice?.estimatedPace || `Liftoff projected in ~${normalWeeks} weeks!`}
          </div>
        </div>
      </div>

      {/* Fast-Track Chore Missions */}
      {advice?.fastTrackIdeas && advice.fastTrackIdeas.length > 0 && (
        <div className="p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40">
          <div className="flex items-center gap-2 text-xs font-black text-amber-900 dark:text-amber-300 mb-2">
            <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>Fast-Track Chore Missions (Boost Your Fuel)</span>
          </div>
          <ul className="space-y-1.5 text-xs text-amber-950 dark:text-amber-200">
            {advice.fastTrackIdeas.map((idea, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-amber-500 font-black">•</span>
                <span>{idea}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Interactive Savings Accelerator Calculator Slider */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-900 to-slate-900 text-white border border-indigo-500/30">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Calculator className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-black uppercase tracking-wider text-amber-300">
              Savings Accelerator Calculator
            </span>
          </div>
          <span className="text-xs font-bold text-indigo-200">
            Extra chore earnings: <strong className="text-amber-400">+${extraWeeklySlider}/wk</strong>
          </span>
        </div>

        {/* Range Slider */}
        <input
          type="range"
          min="0"
          max="25"
          step="1"
          value={extraWeeklySlider}
          onChange={(e) => setExtraWeeklySlider(Number(e.target.value))}
          className="w-full accent-amber-400 cursor-pointer h-2 bg-slate-700 rounded-lg"
        />

        {/* Calculation Result */}
        <div className="flex items-center justify-between mt-3 text-xs pt-2 border-t border-indigo-800/60">
          <span className="text-slate-300">
            Pace: <strong>~{normalWeeks} weeks</strong> → <strong>~{acceleratedWeeks} weeks</strong>
          </span>
          {weeksShaved > 0 ? (
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-black text-[11px] flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>Shaves {weeksShaved} {weeksShaved === 1 ? 'week' : 'weeks'} off!</span>
            </span>
          ) : (
            <span className="text-slate-400 text-[11px]">Slide to accelerate</span>
          )}
        </div>
      </div>
    </div>
  );
};
