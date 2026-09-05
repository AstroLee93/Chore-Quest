import confetti from 'canvas-confetti';

export interface ConfettiBurstOptions extends confetti.Options {
  mode?: 'snappy' | 'celebration' | 'mini';
}

/**
 * Optimized, fast-clearing confetti animation.
 * 
 * Specifically optimized for responsive dashboard usability:
 * - Gravity tuned to 1.55 (vs default 1.0) so particles fall briskly and don't float slowly.
 * - Ticks reduced to 75-90 (vs default 200) so particles complete in ~1.3s and clear the screen quickly.
 * - Crisp particle count (25-50) so celebrations feel punchy without cluttering text or action buttons.
 * - Scalar tuned to 0.85 for neat, non-obtrusive particles.
 */
export function fireConfetti(options?: ConfettiBurstOptions) {
  const mode = options?.mode || 'snappy';

  const defaultParticleCount =
    mode === 'mini' ? 25 : mode === 'celebration' ? 50 : 35;

  const defaultSpread = mode === 'celebration' ? 70 : 55;

  const config: confetti.Options = {
    particleCount: defaultParticleCount,
    spread: defaultSpread,
    startVelocity: 36,
    gravity: 1.55, // Falls briskly and crisply, no slow drifting
    ticks: 85, // Clears in ~1.3s instead of lingering for 3.5s+
    decay: 0.92,
    scalar: 0.85, // Slightly smaller, crisper particles that don't obscure UI
    origin: { y: 0.6 },
    colors: ['#3b82f6', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6'],
    disableForReducedMotion: true,
    ...options,
  };

  try {
    return confetti(config);
  } catch {
    // Gracefully handle any canvas context issue
  }
}

/**
 * Clear any active confetti immediately.
 */
export function clearConfetti() {
  try {
    confetti.reset();
  } catch {
    // Ignore
  }
}

export default fireConfetti;
