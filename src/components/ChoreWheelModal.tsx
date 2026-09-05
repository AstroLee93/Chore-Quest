import React, { useState, useRef, useEffect } from 'react';
import { X, Sparkles, Trophy, RotateCw, Play, Check } from 'lucide-react';
import { fireConfetti } from '../utils/confetti';
import { ChoreItem, KidProfile } from '../types';
import { sound } from '../utils/sound';

interface ChoreWheelModalProps {
  isOpen: boolean;
  chores: ChoreItem[];
  activeKid?: KidProfile | null;
  onClose: () => void;
  onSelectChore?: (chore: ChoreItem) => void;
  onStartTimer?: (chore: ChoreItem) => void;
}

const SLICE_COLORS = [
  '#f59e0b', // amber
  '#ec4899', // pink
  '#3b82f6', // blue
  '#10b981', // emerald
  '#8b5cf6', // purple
  '#f97316', // orange
  '#06b6d4', // cyan
  '#ef4444', // red
];

export const ChoreWheelModal: React.FC<ChoreWheelModalProps> = ({
  isOpen,
  chores,
  activeKid,
  onClose,
  onSelectChore,
  onStartTimer,
}) => {
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [rotation, setRotation] = useState<number>(0);
  const [selectedChore, setSelectedChore] = useState<ChoreItem | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Available candidate chores (active chores)
  const candidateChores = chores.filter((c) => c.isActive).slice(0, 8);

  // Draw wheel on canvas
  useEffect(() => {
    if (!isOpen || candidateChores.length === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = canvas.width;
    const center = size / 2;
    const radius = center - 10;
    const numSlices = candidateChores.length;
    const arc = (2 * Math.PI) / numSlices;

    ctx.clearRect(0, 0, size, size);

    // Draw slices
    candidateChores.forEach((chore, i) => {
      const angle = i * arc;
      ctx.beginPath();
      ctx.fillStyle = SLICE_COLORS[i % SLICE_COLORS.length];
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, angle, angle + arc);
      ctx.lineTo(center, center);
      ctx.fill();

      // Outer border on slice
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Draw text/icon
      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(angle + arc / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 15px system-ui, sans-serif';
      ctx.shadowColor = 'rgba(0,0,0,0.4)';
      ctx.shadowBlur = 4;
      
      const icon = chore.icon || '⭐';
      const label = chore.title.length > 16 ? chore.title.substring(0, 15) + '…' : chore.title;
      ctx.fillText(`${icon} ${label}`, radius - 20, 5);
      ctx.restore();
    });

    // Center peg
    ctx.beginPath();
    ctx.arc(center, center, 24, 0, 2 * Math.PI);
    ctx.fillStyle = '#1e1b4b'; // indigo 950
    ctx.fill();
    ctx.strokeStyle = '#fde047'; // yellow 300
    ctx.lineWidth = 4;
    ctx.stroke();

    // Center star icon
    ctx.fillStyle = '#fde047';
    ctx.font = '16px system-ui';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('✨', center, center);
  }, [isOpen, candidateChores]);

  if (!isOpen) return null;

  const handleSpin = () => {
    if (isSpinning || candidateChores.length === 0) return;
    sound.playTap();
    setIsSpinning(true);
    setSelectedChore(null);

    // Calculate random rotations: 4 to 8 full spins + random offset
    const numSlices = candidateChores.length;
    const sliceAngle = 360 / numSlices;
    const winningIndex = Math.floor(Math.random() * numSlices);
    
    // Top pointer is at 270 degrees (or -90 deg from 0)
    // Formula to align winning slice with top pointer
    const fullSpins = (4 + Math.floor(Math.random() * 4)) * 360;
    const targetOffset = 270 - (winningIndex * sliceAngle + sliceAngle / 2);
    const targetRotation = rotation + fullSpins + ((targetOffset - (rotation % 360) + 360) % 360);

    setRotation(targetRotation);

    // Play periodic tick sounds
    let tickCount = 0;
    const tickInterval = setInterval(() => {
      sound.playPop();
      tickCount++;
      if (tickCount >= 18) clearInterval(tickInterval);
    }, 160);

    // Finish spin after 3.5s transition
    setTimeout(() => {
      clearInterval(tickInterval);
      const chosen = candidateChores[winningIndex];
      setSelectedChore(chosen);
      setIsSpinning(false);
      sound.playFanfare();

      fireConfetti({
        origin: { y: 0.6 },
        mode: 'celebration',
      });
    }, 3600);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border-4 border-yellow-300 relative text-slate-800 text-center overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={() => {
            sound.playTap();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Header */}
        <div className="mb-4">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-yellow-100 text-yellow-950 font-black text-xs mb-2 border border-yellow-300">
            <span>🎡</span> CHORE ROULETTE
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            {activeKid ? `${activeKid.name}'s Mystery Mission!` : 'Spin for a Mystery Chore!'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Let the wheel choose your next quest & earn instant points!
          </p>
        </div>

        {/* Wheel Container with Pointer */}
        <div className="relative w-72 h-72 sm:w-80 sm:h-80 mx-auto my-3 flex items-center justify-center">
          {/* Pointer indicator at top */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 w-8 h-8 flex items-center justify-center filter drop-shadow-md">
            <div className="w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[22px] border-t-yellow-400" />
          </div>

          {/* Canvas Wheel */}
          <div
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: isSpinning ? 'transform 3.5s cubic-bezier(0.15, 0.9, 0.2, 1)' : 'none',
            }}
            className="w-full h-full rounded-full shadow-inner flex items-center justify-center"
          >
            <canvas
              ref={canvasRef}
              width={320}
              height={320}
              className="w-full h-full rounded-full shadow-xl"
            />
          </div>
        </div>

        {/* Selected Result Box */}
        {selectedChore && !isSpinning ? (
          <div className="my-4 p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 animate-scale-in">
            <div className="text-xs font-black uppercase tracking-wider text-amber-700">
              🎉 The Wheel Has Spoken!
            </div>
            <div className="flex items-center justify-center gap-3 mt-2">
              <span className="text-3xl">{selectedChore.icon || '⭐'}</span>
              <div className="text-left">
                <h3 className="text-lg font-black text-slate-900 leading-tight">
                  {selectedChore.title}
                </h3>
                <span className="inline-block text-xs font-bold text-pink-600">
                  +{selectedChore.stars} Points Reward
                </span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 mt-4">
              <button
                onClick={() => {
                  sound.playTap();
                  if (onStartTimer) {
                    onStartTimer(selectedChore);
                    onClose();
                  } else if (onSelectChore) {
                    onSelectChore(selectedChore);
                    onClose();
                  } else {
                    onClose();
                  }
                }}
                className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs sm:text-sm shadow-md transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Start Mission Now</span>
              </button>
              <button
                onClick={handleSpin}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm border border-slate-200 transition-all cursor-pointer flex items-center gap-1"
              >
                <RotateCw className="w-4 h-4" />
                <span>Spin Again</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-4">
            <button
              onClick={handleSpin}
              disabled={isSpinning}
              className={`w-full py-4 rounded-2xl font-black text-lg text-white shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer ${
                isSpinning
                  ? 'bg-slate-400 cursor-not-allowed opacity-80'
                  : 'bg-gradient-to-r from-amber-500 to-pink-500 hover:from-amber-600 hover:to-pink-600 shadow-amber-500/25'
              }`}
            >
              <Sparkles className="w-6 h-6 animate-spin" />
              <span>{isSpinning ? 'Spinning the Wheel...' : 'SPIN THE WHEEL! 🎡'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
