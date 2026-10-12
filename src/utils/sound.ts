// Web Audio API procedural sound engine - 100% self-contained & offline-ready

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isEnabled: boolean = true;

  constructor() {
    // AudioContext will be initialized on first user interaction to comply with browser autoplay policies
  }

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      return this.ctx;
    } catch {
      return null;
    }
  }

  public setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }

  public getEnabled(): boolean {
    return this.isEnabled;
  }

  // Play satisfying chime when chore is completed
  public playChoreComplete() {
    if (!this.isEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 (Major arpeggio)
    
    notes.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + index * 0.08);
      
      gain.gain.setValueAtTime(0.01, now + index * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.18, now + index * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.08 + 0.35);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(now + index * 0.08);
      osc.stop(now + index * 0.08 + 0.4);
    });
  }

  // Play star collect / sparkle sound
  public playStarEarned() {
    if (!this.isEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const freqs = [880, 1174.66, 1318.51, 1760]; // A5, D6, E6, A6
    
    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.05);
      
      gain.gain.setValueAtTime(0.01, now + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.15, now + idx * 0.05 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.05 + 0.25);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(now + idx * 0.05);
      osc.stop(now + idx * 0.05 + 0.3);
    });
  }

  // Play reward redemption fanfare
  public playRewardRedeemed() {
    if (!this.isEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // Fanfare pattern: G4, C5, E5, G5
    const notes = [
      { f: 392.00, t: 0, d: 0.12 },
      { f: 523.25, t: 0.12, d: 0.12 },
      { f: 659.25, t: 0.24, d: 0.12 },
      { f: 783.99, t: 0.36, d: 0.45 },
    ];

    notes.forEach(({ f, t, d }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, now + t);
      
      gain.gain.setValueAtTime(0.01, now + t);
      gain.gain.exponentialRampToValueAtTime(0.2, now + t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + t + d);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(now + t);
      osc.stop(now + t + d + 0.05);
    });
  }

  // Soft click / tap sound
  public playTap() {
    if (!this.isEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(150, now + 0.04);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.05);
  }

  // Gentle notification / skip note
  public playSkipNotice() {
    if (!this.isEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(350, now);
    osc.frequency.exponentialRampToValueAtTime(260, now + 0.15);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.2);
  }

  // Play unlock / parent access sound
  public playUnlock() {
    if (!this.isEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.setValueAtTime(880, now + 0.08);

    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.22);
  }

  // Play coin sound
  public playCoin() {
    if (!this.isEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(987.77, now); // B5
    osc.frequency.setValueAtTime(1318.51, now + 0.08); // E6

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.38);
  }

  // Play pop / tick sound for wheel or subtasks
  public playPop() {
    if (!this.isEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.03);

    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.04);
  }

  // Heavy rubber stamp slam with satisfying wooden impact thud
  public playStampSlam() {
    if (!this.isEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // 1. Heavy low impact thud
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    subOsc.type = 'triangle';
    subOsc.frequency.setValueAtTime(160, now);
    subOsc.frequency.exponentialRampToValueAtTime(35, now + 0.12);

    subGain.gain.setValueAtTime(0.35, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    subOsc.connect(subGain);
    subGain.connect(ctx.destination);
    subOsc.start(now);
    subOsc.stop(now + 0.2);

    // 2. High snap / slap transient
    const slapOsc = ctx.createOscillator();
    const slapGain = ctx.createGain();
    slapOsc.type = 'sawtooth';
    slapOsc.frequency.setValueAtTime(480, now);
    slapOsc.frequency.exponentialRampToValueAtTime(90, now + 0.05);

    slapGain.gain.setValueAtTime(0.18, now);
    slapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    slapOsc.connect(slapGain);
    slapGain.connect(ctx.destination);
    slapOsc.start(now);
    slapOsc.stop(now + 0.07);

    // 3. Follow-up gold coin sparkle chime
    setTimeout(() => {
      this.playCoin();
    }, 120);
  }

  // Classic wild west saloon twang arpeggio
  public playWesternTwang() {
    if (!this.isEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // Pentatonic twang: E4, G4, A4, B4, D5, E5 with slight bends
    const notes = [
      { f: 329.63, t: 0.00, d: 0.12 },
      { f: 392.00, t: 0.07, d: 0.12 },
      { f: 493.88, t: 0.14, d: 0.15 },
      { f: 659.25, t: 0.22, d: 0.35 },
    ];

    notes.forEach(({ f, t, d }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(f * 0.96, now + t);
      osc.frequency.exponentialRampToValueAtTime(f, now + t + 0.04);

      gain.gain.setValueAtTime(0.01, now + t);
      gain.gain.exponentialRampToValueAtTime(0.14, now + t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + t + d);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + t);
      osc.stop(now + t + d + 0.05);
    });
  }

  // Play fanfare triumph sound
  public playFanfare() {
    this.playRewardRedeemed();
  }

  // Play level up jingle
  public playLevelUp() {
    this.playChoreComplete();
  }

  // Generic success / complete chime
  public playComplete() {
    this.playChoreComplete();
  }

  // Error / fail tone
  public playFail() {
    this.playSkipNotice();
  }

  public playError() {
    this.playSkipNotice();
  }

  // Warning / locked tone
  public playWarning() {
    this.playSkipNotice();
  }

  // Undo / backspace subtle tone
  public playUndo() {
    this.playTap();
  }

  // Kid-Coin metallic coin clink sound
  public playCoinSound() {
    if (!this.isEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(987.77, now); // B5
    osc1.frequency.exponentialRampToValueAtTime(1318.51, now + 0.08); // E6

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(1975.53, now); // B6
    osc2.frequency.exponentialRampToValueAtTime(2637.02, now + 0.08); // E7

    gainNode.gain.setValueAtTime(0.18, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.35);
    osc2.stop(now + 0.35);
  }

  // Milestone reached celebratory fanfare
  public playMilestoneFanfare() {
    if (!this.isEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [
      { f: 523.25, t: 0.00, d: 0.12 }, // C5
      { f: 659.25, t: 0.12, d: 0.12 }, // E5
      { f: 783.99, t: 0.24, d: 0.12 }, // G5
      { f: 1046.5, t: 0.36, d: 0.40 }, // C6
    ];

    notes.forEach(({ f, t, d }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, now + t);

      gain.gain.setValueAtTime(0.01, now + t);
      gain.gain.exponentialRampToValueAtTime(0.2, now + t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + t + d);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + t);
      osc.stop(now + t + d + 0.05);
    });
  }

  // Savings Goal 100% Victorious Celebration
  public playVictorySound() {
    if (!this.isEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [
      { f: 523.25, t: 0.00, d: 0.15 }, // C5
      { f: 659.25, t: 0.15, d: 0.15 }, // E5
      { f: 783.99, t: 0.30, d: 0.15 }, // G5
      { f: 1046.5, t: 0.45, d: 0.30 }, // C6
      { f: 880.00, t: 0.75, d: 0.15 }, // A5
      { f: 1046.5, t: 0.90, d: 0.50 }, // C6
    ];

    notes.forEach(({ f, t, d }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(f, now + t);

      gain.gain.setValueAtTime(0.01, now + t);
      gain.gain.exponentialRampToValueAtTime(0.18, now + t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + t + d);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + t);
      osc.stop(now + t + d + 0.05);
    });
  }

  // Rocket Thruster Rumble & Liftoff Sound
  public playRocketLaunchSound() {
    if (!this.isEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // 1. Low frequency rumble thruster
    const rumbleOsc = ctx.createOscillator();
    const rumbleGain = ctx.createGain();
    rumbleOsc.type = 'sawtooth';
    rumbleOsc.frequency.setValueAtTime(55, now);
    rumbleOsc.frequency.exponentialRampToValueAtTime(140, now + 2.5);

    rumbleGain.gain.setValueAtTime(0.05, now);
    rumbleGain.gain.linearRampToValueAtTime(0.25, now + 0.8);
    rumbleGain.gain.exponentialRampToValueAtTime(0.001, now + 3.0);

    rumbleOsc.connect(rumbleGain);
    rumbleGain.connect(ctx.destination);
    rumbleOsc.start(now);
    rumbleOsc.stop(now + 3.0);

    // 2. Rising jet whoosh
    const whooshOsc = ctx.createOscillator();
    const whooshGain = ctx.createGain();
    whooshOsc.type = 'triangle';
    whooshOsc.frequency.setValueAtTime(220, now + 0.3);
    whooshOsc.frequency.exponentialRampToValueAtTime(1200, now + 2.5);

    whooshGain.gain.setValueAtTime(0.01, now + 0.3);
    whooshGain.gain.linearRampToValueAtTime(0.15, now + 1.2);
    whooshGain.gain.exponentialRampToValueAtTime(0.001, now + 3.0);

    whooshOsc.connect(whooshGain);
    whooshGain.connect(ctx.destination);
    whooshOsc.start(now + 0.3);
    whooshOsc.stop(now + 3.0);
  }

  // Aqara G400 Smart Doorbell Chime ("Ding-Dong!")
  public playDoorbellChime() {
    if (!this.isEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Ding (Higher pitch ~659.25Hz E5)
    const dingOsc = ctx.createOscillator();
    const dingGain = ctx.createGain();
    dingOsc.type = 'sine';
    dingOsc.frequency.setValueAtTime(659.25, now);
    dingGain.gain.setValueAtTime(0.001, now);
    dingGain.gain.linearRampToValueAtTime(0.35, now + 0.02);
    dingGain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
    dingOsc.connect(dingGain);
    dingGain.connect(ctx.destination);
    dingOsc.start(now);
    dingOsc.stop(now + 0.95);

    // Dong (Lower pitch ~523.25Hz C5, slightly delayed by 400ms)
    const dongOsc = ctx.createOscillator();
    const dongGain = ctx.createGain();
    dongOsc.type = 'sine';
    dongOsc.frequency.setValueAtTime(523.25, now + 0.4);
    dongGain.gain.setValueAtTime(0.001, now + 0.4);
    dongGain.gain.linearRampToValueAtTime(0.38, now + 0.42);
    dongGain.gain.exponentialRampToValueAtTime(0.001, now + 1.6);
    dongOsc.connect(dongGain);
    dongGain.connect(ctx.destination);
    dongOsc.start(now + 0.4);
    dongOsc.stop(now + 1.65);
  }

  // Camera Snapshot Shutter Click
  public playCameraClick() {
    if (!this.isEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const clickOsc = ctx.createOscillator();
    const clickGain = ctx.createGain();
    clickOsc.type = 'triangle';
    clickOsc.frequency.setValueAtTime(1400, now);
    clickOsc.frequency.exponentialRampToValueAtTime(300, now + 0.05);

    clickGain.gain.setValueAtTime(0.2, now);
    clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

    clickOsc.connect(clickGain);
    clickGain.connect(ctx.destination);
    clickOsc.start(now);
    clickOsc.stop(now + 0.08);
  }

  // Two-Way Radio / Intercom Mic Chirp
  public playIntercomBeep() {
    if (!this.isEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.setValueAtTime(1760, now + 0.06);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.13);
  }

  // Celebratory procedural Happy Birthday chime melody
  public playBirthdaySong() {
    if (!this.isEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // Classic Happy Birthday melody phrase
    const notes: { f: number; t: number; d: number }[] = [
      { f: 261.63, t: 0.00, d: 0.22 }, // C4
      { f: 261.63, t: 0.25, d: 0.18 }, // C4
      { f: 293.66, t: 0.45, d: 0.38 }, // D4
      { f: 261.63, t: 0.85, d: 0.38 }, // C4
      { f: 349.23, t: 1.25, d: 0.38 }, // F4
      { f: 329.63, t: 1.65, d: 0.70 }, // E4

      { f: 261.63, t: 2.45, d: 0.22 }, // C4
      { f: 261.63, t: 2.70, d: 0.18 }, // C4
      { f: 293.66, t: 2.90, d: 0.38 }, // D4
      { f: 261.63, t: 3.30, d: 0.38 }, // C4
      { f: 392.00, t: 3.70, d: 0.38 }, // G4
      { f: 349.23, t: 4.10, d: 0.70 }, // F4

      { f: 261.63, t: 4.90, d: 0.22 }, // C4
      { f: 261.63, t: 5.15, d: 0.18 }, // C4
      { f: 523.25, t: 5.35, d: 0.38 }, // C5
      { f: 440.00, t: 5.75, d: 0.38 }, // A4
      { f: 349.23, t: 6.15, d: 0.38 }, // F4
      { f: 329.63, t: 6.55, d: 0.38 }, // E4
      { f: 293.66, t: 6.95, d: 0.60 }, // D4

      { f: 466.16, t: 7.65, d: 0.22 }, // Bb4
      { f: 466.16, t: 7.90, d: 0.18 }, // Bb4
      { f: 440.00, t: 8.10, d: 0.38 }, // A4
      { f: 349.23, t: 8.50, d: 0.38 }, // F4
      { f: 392.00, t: 8.90, d: 0.38 }, // G4
      { f: 349.23, t: 9.30, d: 0.85 }, // F4
    ];

    notes.forEach(({ f, t, d }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, now + t);

      gain.gain.setValueAtTime(0.01, now + t);
      gain.gain.exponentialRampToValueAtTime(0.18, now + t + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + t + d);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + t);
      osc.stop(now + t + d + 0.05);
    });
  }

  // Puff of candle blow + sparkling wishing chime
  public playCandleBlow() {
    if (!this.isEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Breath / puff sound via filtered noise
    const bufferSize = ctx.sampleRate * 0.35;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(600, now);
    filter.frequency.exponentialRampToValueAtTime(200, now + 0.3);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.18, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(ctx.destination);

    noise.start(now);
    noise.stop(now + 0.35);

    // Magical chime burst right after candle blow
    const sparkleNotes = [1046.5, 1318.51, 1567.98, 2093.0]; // C6, E6, G6, C7
    sparkleNotes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const t = now + 0.25 + idx * 0.08;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.01, t);
      gain.gain.exponentialRampToValueAtTime(0.15, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + 0.45);
    });
  }
}

export const sound = new SoundEngine();
