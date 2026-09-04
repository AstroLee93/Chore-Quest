import React, { useState } from 'react';
import { Star, X, Gift, Check, Clock, Sparkles, Award, ShoppingBag, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { KidProfile, RewardItem, RewardRedemption, AppSettings } from '../types';
import { sound } from '../utils/sound';

interface RewardStoreModalProps {
  isOpen: boolean;
  activeKid: KidProfile;
  rewards: RewardItem[];
  redemptions: RewardRedemption[];
  settings: AppSettings;
  onRedeemReward: (reward: RewardItem, note?: string) => void;
  onClose: () => void;
  onPostActionComplete?: () => void;
}

export const RewardStoreModal: React.FC<RewardStoreModalProps> = ({
  isOpen,
  activeKid,
  rewards,
  redemptions,
  settings,
  onRedeemReward,
  onClose,
  onPostActionComplete,
}) => {
  const [activeTab, setActiveTab] = useState<'catalog' | 'history'>('catalog');
  const [redeemingReward, setRedeemingReward] = useState<RewardItem | null>(null);
  const [customNote, setCustomNote] = useState('');
  const [redeemSuccessBanner, setRedeemSuccessBanner] = useState<string | null>(null);

  if (!isOpen) return null;

  const kidRedemptions = redemptions.filter((r) => r.kidId === activeKid.id);

  const handleConfirmRedeem = (reward: RewardItem) => {
    if (activeKid.stars < reward.starCost) return;

    confetti({
      particleCount: 70,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#3b82f6', '#ec4899', '#f59e0b', '#10b981'],
    });

    sound.playRewardRedeemed();
    onRedeemReward(reward, customNote);
    setRedeemingReward(null);
    setCustomNote('');

    if (onPostActionComplete) {
      setRedeemSuccessBanner(`🎉 ${reward.title} claimed! Returning to Kiosk...`);
      setTimeout(() => {
        onPostActionComplete();
      }, 1200);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-fade-in">
      <div
        id="reward-store-dialog"
        className="bg-yellow-50 w-full max-w-2xl rounded-[2.5rem] p-6 sm:p-8 shadow-2xl border-4 border-yellow-300 max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b-2 border-yellow-200">
          <div className="flex items-center gap-3.5">
            <div className="w-13 h-13 rounded-2xl bg-indigo-500 text-white flex items-center justify-center text-3xl font-black shadow-lg transform -rotate-3">
              🎁
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-indigo-900 italic tracking-tight">
                Star Reward Store
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-slate-600 font-bold">
                  {activeKid.name}'s Balance:
                </span>
                <span className="inline-flex items-center gap-1 font-black text-pink-600 text-xs sm:text-sm bg-pink-100 px-2.5 py-0.5 rounded-full border border-pink-300">
                  ⭐ {activeKid.stars} Points
                </span>
              </div>
            </div>
          </div>
          <button
            id="btn-close-rewards"
            onClick={() => {
              sound.playTap();
              onClose();
            }}
            className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-2xl text-slate-500 hover:text-slate-800 bg-white hover:bg-slate-100 border-2 border-slate-200 transition-colors cursor-pointer active:scale-95"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {redeemSuccessBanner && (
          <div className="mt-3 p-3 bg-emerald-600 text-white rounded-2xl font-black text-center text-xs sm:text-sm animate-pulse shadow-md">
            {redeemSuccessBanner}
          </div>
        )}

        {/* Tab Switcher */}
        <div className="flex gap-2 my-4 p-1.5 rounded-2xl bg-yellow-200/70 border-2 border-yellow-300">
          <button
            id="tab-reward-catalog"
            onClick={() => {
              sound.playTap();
              setActiveTab('catalog');
            }}
            className={`flex-1 min-h-[44px] py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
              activeTab === 'catalog'
                ? 'bg-indigo-900 text-white shadow-sm'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            Available Rewards ({rewards.filter((r) => r.isActive).length})
          </button>
          <button
            id="tab-reward-history"
            onClick={() => {
              sound.playTap();
              setActiveTab('history');
            }}
            className={`flex-1 min-h-[44px] py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
              activeTab === 'history'
                ? 'bg-indigo-900 text-white shadow-sm'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            Claimed History ({kidRedemptions.length})
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto pr-1 py-2">
          {activeTab === 'catalog' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {rewards
                .filter((r) => r.isActive)
                .map((reward, i) => {
                  const canAfford = activeKid.stars >= reward.starCost;
                  const starsShort = reward.starCost - activeKid.stars;
                  const borderClasses = ['border-pink-500', 'border-indigo-500', 'border-emerald-500', 'border-orange-400'];
                  const borderClass = borderClasses[i % borderClasses.length];

                  return (
                    <div
                      key={reward.id}
                      id={`reward-card-${reward.id}`}
                      className={`p-5 rounded-3xl bg-white border-b-8 border-r-4 ${borderClass} border-t-2 border-l-2 border-t-slate-100 border-l-slate-100 flex flex-col justify-between transition-all ${
                        canAfford
                          ? 'hover:shadow-md'
                          : 'opacity-70'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-3xl sm:text-4xl p-2 rounded-2xl bg-yellow-50 shadow-2xs border-2 border-yellow-200">
                            {reward.icon || '🎁'}
                          </span>
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-pink-100 text-pink-700 border border-pink-300">
                            ⭐ {reward.starCost} Points
                          </span>
                        </div>

                        <h4 className="font-black text-slate-800 text-base mb-1">
                          {reward.title}
                        </h4>
                        <p className="text-xs text-slate-500 leading-relaxed mb-4 font-bold">
                          {reward.description}
                        </p>
                      </div>

                      <div>
                        {canAfford ? (
                          <button
                            id={`btn-claim-reward-${reward.id}`}
                            onClick={() => {
                              sound.playTap();
                              setRedeemingReward(reward);
                            }}
                            className="w-full py-2.5 px-4 rounded-2xl bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-300 hover:to-orange-400 text-slate-900 font-black text-sm shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                          >
                            <Sparkles className="w-4 h-4 text-slate-900" />
                            <span>Claim Reward</span>
                          </button>
                        ) : (
                          <div className="w-full py-2.5 px-3 rounded-2xl bg-slate-100 text-slate-500 text-xs font-black text-center border-2 border-slate-200">
                            Need {starsShort} more ⭐ points
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : (
            <div className="space-y-3">
              {kidRedemptions.length === 0 ? (
                <div className="text-center py-12 text-slate-400 bg-white rounded-3xl border-2 border-dashed border-slate-200">
                  <ShoppingBag className="w-12 h-12 mx-auto mb-2 opacity-40 text-indigo-400" />
                  <p className="font-black text-slate-700 text-sm">No rewards claimed yet!</p>
                  <p className="text-xs text-slate-500 font-bold mt-0.5">Complete missions to earn stars and redeem fun prizes.</p>
                </div>
              ) : (
                kidRedemptions.map((redemption) => (
                  <div
                    key={redemption.id}
                    className="p-4 rounded-3xl border-b-4 border-r-2 border-slate-200 border-t-2 border-l-2 border-t-slate-100 border-l-slate-100 bg-white flex items-center justify-between gap-3 shadow-2xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl p-2 rounded-2xl bg-yellow-100 border border-yellow-200">
                        {redemption.rewardIcon || '🎁'}
                      </span>
                      <div>
                        <div className="font-black text-sm text-slate-800">
                          {redemption.rewardTitle}
                        </div>
                        <div className="text-xs text-slate-400 font-bold">
                          {new Date(redemption.date).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-black text-pink-600">
                        -{redemption.starCost} ⭐
                      </div>
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          redemption.status === 'fulfilled' || redemption.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : redemption.status === 'pending'
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : 'bg-rose-100 text-rose-800 border border-rose-300'
                        }`}
                      >
                        {redemption.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Confirmation Modal Overlay */}
        {redeemingReward && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs animate-fade-in">
            <div className="bg-yellow-50 rounded-[2.5rem] p-6 sm:p-8 max-w-sm w-full shadow-2xl border-4 border-yellow-300 text-center">
              <div className="text-5xl mb-3">{redeemingReward.icon}</div>
              <h3 className="font-black text-xl text-slate-900 mb-1">
                Redeem "{redeemingReward.title}"?
              </h3>
              <p className="text-xs text-slate-600 font-bold mb-4">
                This will spend <strong className="text-pink-600 font-black">{redeemingReward.starCost} points</strong> from your current balance of {activeKid.stars} points.
              </p>

              <div className="mb-4 text-left">
                <label className="block text-xs font-black text-slate-700 uppercase mb-1">
                  When or how would you like to use this?
                </label>
                <input
                  type="text"
                  placeholder="e.g. This Saturday afternoon"
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-white border-2 border-yellow-300 text-sm font-bold focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
                />
              </div>

              <div className="flex gap-2">
                <button
                  id="btn-cancel-claim-confirm"
                  onClick={() => setRedeemingReward(null)}
                  className="flex-1 py-3 px-4 rounded-2xl border-2 border-slate-200 bg-white text-slate-700 font-black text-xs sm:text-sm hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  id="btn-confirm-redeem-action"
                  onClick={() => handleConfirmRedeem(redeemingReward)}
                  className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-300 hover:to-orange-400 text-slate-900 font-black text-xs sm:text-sm shadow-md transition-all cursor-pointer"
                >
                  Spend Points ⭐
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
