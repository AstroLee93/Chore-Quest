import React from 'react';
import { motion } from 'motion/react';
import {
  Trophy,
  Crown,
  Medal,
  Sparkles,
  Star,
  ArrowLeft,
  X,
  Brain,
  Target,
  Award,
  TrendingUp,
} from 'lucide-react';
import { KidProfile, FamilyDatabase } from '../types';
import { getGradeLevelInfo } from '../utils/brainTeasers';
import { sound } from '../utils/sound';

interface TopBrainsLeaderboardProps {
  database: FamilyDatabase;
  currentKidId?: string;
  onClose: () => void;
  rewardStars?: number;
}

interface RankedKid {
  kid: KidProfile;
  totalCorrect: number;
  totalAnswered: number;
  totalStarsEarned: number;
  accuracy: number;
  rank: number;
  isCurrentUser: boolean;
}

export const TopBrainsLeaderboard: React.FC<TopBrainsLeaderboardProps> = ({
  database,
  currentKidId,
  onClose,
  rewardStars = 10,
}) => {
  const kids = database.kids || [];

  // Rank kids by lifetime correct brain teaser answers (descending)
  const rankedKids: RankedKid[] = [...kids]
    .map((k) => {
      const history = k.brainTeaserHistory || {};
      const totalCorrect = history.totalCorrect || 0;
      const totalAnswered = history.totalAnswered || 0;
      const totalStarsEarned = history.totalStarsEarned || 0;
      const accuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;
      return {
        kid: k,
        totalCorrect,
        totalAnswered,
        totalStarsEarned,
        accuracy,
        rank: 1, // Will assign below
        isCurrentUser: k.id === currentKidId,
      };
    })
    .sort((a, b) => {
      if (b.totalCorrect !== a.totalCorrect) return b.totalCorrect - a.totalCorrect;
      if (b.accuracy !== a.accuracy) return b.accuracy - a.accuracy;
      return b.totalStarsEarned - a.totalStarsEarned;
    })
    .map((item, index, arr) => {
      // Calculate ranks with ties handled
      let rank = index + 1;
      if (index > 0 && arr[index - 1].totalCorrect === item.totalCorrect) {
        rank = arr[index - 1].rank;
      }
      return {
        ...item,
        rank,
      };
    });

  const leaderCorrect = rankedKids.length > 0 ? rankedKids[0].totalCorrect : 0;
  const currentRankedUser = rankedKids.find((rk) => rk.isCurrentUser);
  const hasAnyAnswers = rankedKids.some((rk) => rk.totalCorrect > 0);

  // Motivational caption based on current user's position
  let motivationalMessage = 'Test your brain daily to climb to the top of the podium!';
  if (currentRankedUser) {
    if (currentRankedUser.rank === 1 && currentRankedUser.totalCorrect > 0) {
      motivationalMessage = `👑 ${currentRankedUser.kid.name} is currently leading the household as Top Brain Champion!`;
    } else if (currentRankedUser.rank > 1) {
      const aheadOfKid = rankedKids.find((rk) => rk.rank === currentRankedUser.rank - 1);
      if (aheadOfKid) {
        const diff = aheadOfKid.totalCorrect - currentRankedUser.totalCorrect + 1;
        motivationalMessage = `🚀 ${currentRankedUser.kid.name} needs just ${diff} more correct answer${diff === 1 ? '' : 's'} to move up!`;
      }
    }
  }

  return (
    <div className="flex flex-col h-full max-h-[85vh] bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 overflow-hidden">
      {/* Header Banner */}
      <div className="relative bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 p-4 sm:p-5 text-white shrink-0 overflow-hidden shadow-md">
        {/* Decorative blur elements */}
        <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-white/20 blur-lg pointer-events-none" />
        <div className="absolute -left-6 -bottom-6 w-28 h-28 rounded-full bg-yellow-300/30 blur-lg pointer-events-none" />

        <div className="flex items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-3 min-w-0">
            <button
              id="btn-back-from-leaderboard"
              onClick={() => {
                sound.playTap();
                onClose();
              }}
              className="p-2 rounded-xl bg-white/15 hover:bg-white/25 active:bg-white/30 border border-white/25 text-white transition-all cursor-pointer shrink-0"
              title="Back to Brain Teaser"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-white/20 border border-white/30 backdrop-blur-sm flex items-center justify-center text-xl sm:text-2xl shadow-inner shrink-0">
              🏆
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg sm:text-xl font-black tracking-tight text-white truncate">
                  Top Brains Leaderboard
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-950/30 text-white font-extrabold text-[11px] inline-flex items-center gap-1 border border-white/20">
                  <Crown className="w-3 h-3 text-amber-300 fill-amber-300" />
                  Lifetime Champions
                </span>
              </div>
              <p className="text-xs text-amber-100 font-semibold truncate mt-0.5">
                Ranked by total lifetime correct brain teaser answers
              </p>
            </div>
          </div>

          <button
            id="btn-close-leaderboard"
            onClick={() => {
              sound.playTap();
              onClose();
            }}
            className="w-8 h-8 rounded-xl bg-white/15 hover:bg-white/25 active:bg-white/30 border border-white/20 flex items-center justify-center text-white transition-all cursor-pointer shrink-0"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Motivational pill bar */}
        <div className="mt-3 pt-2.5 border-t border-white/20 flex items-center justify-between gap-2 text-xs">
          <span className="font-bold text-amber-100 truncate flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-yellow-200 shrink-0" />
            <span className="truncate">{motivationalMessage}</span>
          </span>
          <span className="px-2 py-0.5 rounded-full bg-white/20 text-white font-black text-[10px] shrink-0 border border-white/20">
            🎯 1 Try Rule Active
          </span>
        </div>
      </div>

      {/* Main Leaderboard Body */}
      <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
        {/* Top 3 Podium Cards (if 2+ kids) */}
        {rankedKids.length >= 2 && hasAnyAnswers && (
          <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-2 pb-1 items-end">
            {/* 2nd Place */}
            {rankedKids[1] && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="flex flex-col items-center text-center p-2.5 sm:p-3 rounded-2xl bg-white dark:bg-slate-800/80 border-2 border-slate-300 dark:border-slate-700 shadow-sm relative"
              >
                <div className="absolute -top-3 w-6 h-6 rounded-full bg-slate-300 dark:bg-slate-600 text-slate-800 dark:text-slate-100 flex items-center justify-center font-black text-xs shadow-xs border border-white dark:border-slate-800">
                  🥈
                </div>
                <div
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center text-xl sm:text-2xl shadow-sm border-2 border-white dark:border-slate-700 mt-1 mb-1.5"
                  style={{ backgroundColor: rankedKids[1].kid.color || '#94a3b8' }}
                >
                  {rankedKids[1].kid.avatar}
                </div>
                <span className="font-black text-xs sm:text-sm text-slate-800 dark:text-slate-100 truncate max-w-full">
                  {rankedKids[1].kid.name}
                </span>
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                  2nd Place
                </span>
                <div className="mt-1.5 px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-700/60 font-black text-xs text-slate-800 dark:text-slate-200">
                  {rankedKids[1].totalCorrect} Correct
                </div>
              </motion.div>
            )}

            {/* 1st Place (Center, elevated) */}
            {rankedKids[0] && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="flex flex-col items-center text-center p-3 sm:p-3.5 rounded-2xl bg-gradient-to-b from-amber-50 to-yellow-100/50 dark:from-amber-950/40 dark:to-yellow-950/20 border-2 border-amber-400 dark:border-amber-500 shadow-md relative ring-2 ring-amber-400/30"
              >
                <div className="absolute -top-3.5 px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 flex items-center gap-1 font-black text-[11px] shadow-sm border border-amber-300">
                  <Crown className="w-3 h-3 text-slate-950 fill-slate-950" />
                  <span>1st</span>
                </div>
                <div
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl shadow-md border-2 border-amber-300 dark:border-amber-600 mt-2 mb-1.5 ring-2 ring-amber-400/40"
                  style={{ backgroundColor: rankedKids[0].kid.color || '#f59e0b' }}
                >
                  {rankedKids[0].kid.avatar}
                </div>
                <span className="font-black text-xs sm:text-sm text-amber-950 dark:text-amber-100 truncate max-w-full">
                  {rankedKids[0].kid.name}
                </span>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-400">
                  Leader 👑
                </span>
                <div className="mt-1.5 px-2.5 py-0.5 rounded-lg bg-amber-400 text-slate-950 font-black text-xs sm:text-sm shadow-xs">
                  {rankedKids[0].totalCorrect} Correct
                </div>
              </motion.div>
            )}

            {/* 3rd Place */}
            {rankedKids[2] ? (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex flex-col items-center text-center p-2.5 sm:p-3 rounded-2xl bg-white dark:bg-slate-800/80 border-2 border-amber-700/30 dark:border-amber-700/40 shadow-sm relative"
              >
                <div className="absolute -top-3 w-6 h-6 rounded-full bg-amber-700/20 text-amber-800 dark:text-amber-300 flex items-center justify-center font-black text-xs shadow-xs border border-white dark:border-slate-800">
                  🥉
                </div>
                <div
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center text-xl sm:text-2xl shadow-sm border-2 border-white dark:border-slate-700 mt-1 mb-1.5"
                  style={{ backgroundColor: rankedKids[2].kid.color || '#b45309' }}
                >
                  {rankedKids[2].kid.avatar}
                </div>
                <span className="font-black text-xs sm:text-sm text-slate-800 dark:text-slate-100 truncate max-w-full">
                  {rankedKids[2].kid.name}
                </span>
                <span className="text-[10px] font-bold text-amber-800/70 dark:text-amber-400/70">
                  3rd Place
                </span>
                <div className="mt-1.5 px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-700/60 font-black text-xs text-slate-800 dark:text-slate-200">
                  {rankedKids[2].totalCorrect} Correct
                </div>
              </motion.div>
            ) : (
              <div className="flex flex-col items-center justify-center p-3 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-slate-400 text-center">
                <span className="text-xl opacity-40">🥉</span>
                <span className="text-[10px] font-bold mt-1">Open Spot</span>
              </div>
            )}
          </div>
        )}

        {/* Detailed Kid Rankings List */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 px-1">
            <span>Household Brain Teaser Standings</span>
            <span>Total Correct Answers</span>
          </div>

          {rankedKids.map((item, idx) => {
            const gradeInfo = getGradeLevelInfo(item.kid.gradeLevel || '1st_grade');
            const relativePercent =
              leaderCorrect > 0 ? Math.round((item.totalCorrect / leaderCorrect) * 100) : 0;

            let rankBadgeClass =
              'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600';
            let rankIcon = `#${item.rank}`;
            if (item.rank === 1 && item.totalCorrect > 0) {
              rankBadgeClass = 'bg-amber-400 text-slate-950 border-amber-300 font-black';
              rankIcon = '🥇 1';
            } else if (item.rank === 2 && item.totalCorrect > 0) {
              rankBadgeClass = 'bg-slate-200 dark:bg-slate-600 text-slate-900 dark:text-white border-slate-300';
              rankIcon = '🥈 2';
            } else if (item.rank === 3 && item.totalCorrect > 0) {
              rankBadgeClass = 'bg-amber-100 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 border-amber-300';
              rankIcon = '🥉 3';
            }

            return (
              <motion.div
                key={item.kid.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                className={`p-3.5 sm:p-4 rounded-2xl border transition-all ${
                  item.isCurrentUser
                    ? 'bg-purple-50/80 dark:bg-purple-950/30 border-purple-400 dark:border-purple-600 ring-2 ring-purple-400/20'
                    : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Rank Badge */}
                  <span
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs shrink-0 border shadow-2xs ${rankBadgeClass}`}
                  >
                    {rankIcon}
                  </span>

                  {/* Kid Avatar */}
                  <div
                    className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center text-xl shadow-sm border border-black/10 dark:border-white/10 shrink-0 relative"
                    style={{ backgroundColor: item.kid.color || '#3b82f6' }}
                  >
                    {item.kid.avatar}
                    {item.rank === 1 && item.totalCorrect > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 text-xs">👑</span>
                    )}
                  </div>

                  {/* Kid Details */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-black text-sm sm:text-base text-slate-900 dark:text-white truncate">
                        {item.kid.name}
                      </span>
                      {item.isCurrentUser && (
                        <span className="px-2 py-0.2 rounded-full bg-purple-600 text-white text-[10px] font-black uppercase tracking-wider">
                          You
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-bold">
                        {gradeInfo.shortLabel}
                      </span>
                    </div>

                    {/* Stats pills */}
                    <div className="flex items-center gap-2 mt-1 flex-wrap text-xs text-slate-500 dark:text-slate-400 font-medium">
                      <span>{item.accuracy}% Accuracy</span>
                      <span>•</span>
                      <span>{item.totalAnswered} Questions Attempted</span>
                      {item.totalStarsEarned > 0 && (
                        <>
                          <span>•</span>
                          <span className="text-amber-600 dark:text-amber-400 font-bold flex items-center gap-0.5">
                            <Star className="w-3 h-3 fill-amber-400" />
                            +{item.totalStarsEarned} Stars
                          </span>
                        </>
                      )}
                    </div>

                    {/* Performance Bar (relative to leader) */}
                    {leaderCorrect > 0 && (
                      <div className="mt-2 w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-amber-400 to-yellow-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(relativePercent, 4)}%` }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Total Correct Big Number */}
                  <div className="text-right shrink-0 pl-2">
                    <div className="flex items-baseline justify-end gap-1">
                      <span className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400">
                        {item.totalCorrect}
                      </span>
                      <Brain className="w-4 h-4 text-amber-500 shrink-0 self-center" />
                    </div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                      Correct
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}

          {!hasAnyAnswers && (
            <div className="p-6 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border-2 border-dashed border-amber-300 dark:border-amber-800 text-center space-y-2">
              <span className="text-3xl">🚀</span>
              <h4 className="font-black text-amber-950 dark:text-amber-200 text-sm sm:text-base">
                The Leaderboard Is Ready For Its First Champion!
              </h4>
              <p className="text-xs text-amber-800/90 dark:text-amber-300/90 font-medium max-w-sm mx-auto leading-relaxed">
                No correct answers have been logged yet. Answer today's brain teaser on your first attempt to take the #1 spot on the podium!
              </p>
            </div>
          )}
        </div>

        {/* Tip / Rules Card */}
        <div className="p-3.5 rounded-xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 text-xs flex items-start gap-2.5">
          <Target className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
          <div className="text-purple-950 dark:text-purple-200">
            <span className="font-black">How rankings work: </span>
            <span className="font-medium">
              Rankings are based strictly on total lifetime correct brain teaser answers. Because of the 1-attempt rule, thoughtful answers win the crown!
            </span>
          </div>
        </div>
      </div>

      {/* Footer Return Button */}
      <div className="p-3.5 sm:p-4 bg-white dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0">
        <div className="text-xs text-slate-500 dark:text-slate-400 font-bold flex items-center gap-1.5">
          <Award className="w-4 h-4 text-amber-500" />
          <span>+{rewardStars} Stars per first-try correct answer</span>
        </div>

        <button
          id="btn-return-to-teaser-from-leaderboard"
          onClick={() => {
            sound.playTap();
            onClose();
          }}
          className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer shadow-md active:scale-95 ml-auto"
        >
          <Brain className="w-4 h-4" />
          <span>Back to Brain Teaser</span>
        </button>
      </div>
    </div>
  );
};
