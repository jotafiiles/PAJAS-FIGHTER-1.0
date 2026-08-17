class SoundSystem {
  private ctx: AudioContext | null = null;
  private sfxVolume: number = 0.85;
  private musicVolume: number = 0.7;
  private isMuted: boolean = false;
  private musicInterval: number | null = null;
  private currentTrack: 'MENU' | 'FIGHT' | null = null;
  private step: number = 0;

  constructor() {
    // Lazy initialize on first interaction to comply with browser autoplay policies
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolumes(sfx: number, music: number) {
    this.sfxVolume = Math.max(0, Math.min(1, sfx));
    this.musicVolume = Math.max(0, Math.min(1, music));
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopMusic();
    } else if (this.currentTrack) {
      this.startMusic(this.currentTrack);
    }
    return this.isMuted;
  }

  // --- SOUND EFFECTS SYNTHESIZERS ---

  public playMenuMove() {
    if (this.isMuted || this.sfxVolume <= 0) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(440, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.12 * this.sfxVolume, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.06);
    } catch {
      // Audio fallback tolerance
    }
  }

  public playMenuSelect() {
    if (this.isMuted || this.sfxVolume <= 0) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, this.ctx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, this.ctx.currentTime + 0.06); // E5
      osc.frequency.setValueAtTime(783.99, this.ctx.currentTime + 0.12); // G5
      osc.frequency.setValueAtTime(1046.50, this.ctx.currentTime + 0.18); // C6

      gain.gain.setValueAtTime(0.2 * this.sfxVolume, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.36);
    } catch {
      // Audio tolerance
    }
  }

  public playMenuCancel() {
    if (this.isMuted || this.sfxVolume <= 0) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(400, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, this.ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.15 * this.sfxVolume, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.16);
    } catch {
      // Audio tolerance
    }
  }

  public playWhoosh() {
    if (this.isMuted || this.sfxVolume <= 0) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      // White noise buffer for crisp whoosh
      const bufferSize = this.ctx.sampleRate * 0.12;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(400, this.ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 0.06);
      filter.frequency.exponentialRampToValueAtTime(200, this.ctx.currentTime + 0.12);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.25 * this.sfxVolume, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start();
    } catch {
      // ignore
    }
  }

  public playLightHit() {
    if (this.isMuted || this.sfxVolume <= 0) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(280, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.09);

      gain.gain.setValueAtTime(0.4 * this.sfxVolume, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.1);
    } catch {
      // ignore
    }
  }

  public playHeavyHit() {
    if (this.isMuted || this.sfxVolume <= 0) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(180, this.ctx.currentTime);
      osc1.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 0.22);

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(120, this.ctx.currentTime);
      osc2.frequency.exponentialRampToValueAtTime(20, this.ctx.currentTime + 0.25);

      gain.gain.setValueAtTime(0.6 * this.sfxVolume, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(this.ctx.currentTime + 0.25);
      osc2.stop(this.ctx.currentTime + 0.25);
    } catch {
      // ignore
    }
  }

  public playBlock() {
    if (this.isMuted || this.sfxVolume <= 0) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(900, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.25 * this.sfxVolume, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    } catch {
      // ignore
    }
  }

  public playJump() {
    if (this.isMuted || this.sfxVolume <= 0) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(160, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(360, this.ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.2 * this.sfxVolume, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.13);
    } catch {
      // ignore
    }
  }

  public playSpecialLaunch() {
    if (this.isMuted || this.sfxVolume <= 0) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, this.ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(880, this.ctx.currentTime + 0.2);

      gain.gain.setValueAtTime(0.35 * this.sfxVolume, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.28);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.28);
    } catch {
      // ignore
    }
  }

  public playFightBell() {
    if (this.isMuted || this.sfxVolume <= 0) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(987.77, this.ctx.currentTime); // B5

      gain.gain.setValueAtTime(0.5 * this.sfxVolume, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.8);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.85);
    } catch {
      // ignore
    }
  }

  public playKO() {
    if (this.isMuted || this.sfxVolume <= 0) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(240, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(25, this.ctx.currentTime + 1.2);

      gain.gain.setValueAtTime(0.7 * this.sfxVolume, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 1.3);
    } catch {
      // ignore
    }
  }

  public playVictoryFanfare() {
    if (this.isMuted || this.sfxVolume <= 0) return;
    this.initContext();
    if (!this.ctx) return;

    const notes = [
      { f: 523.25, t: 0, d: 0.15 },
      { f: 523.25, t: 0.16, d: 0.15 },
      { f: 523.25, t: 0.32, d: 0.15 },
      { f: 659.25, t: 0.48, d: 0.3 },
      { f: 587.33, t: 0.8, d: 0.2 },
      { f: 783.99, t: 1.02, d: 0.6 },
    ];

    try {
      notes.forEach(n => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(n.f, this.ctx.currentTime + n.t);

        gain.gain.setValueAtTime(0.3 * this.sfxVolume, this.ctx.currentTime + n.t);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + n.t + n.d);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(this.ctx.currentTime + n.t);
        osc.stop(this.ctx.currentTime + n.t + n.d + 0.05);
      });
    } catch {
      // ignore
    }
  }

  // --- DYNAMIC BACKGROUND SYNTH MUSIC ---

  public startMusic(track: 'MENU' | 'FIGHT') {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    if (this.currentTrack === track && this.musicInterval !== null) {
      return;
    }

    this.stopMusic();
    this.currentTrack = track;
    this.step = 0;

    const tempo = track === 'FIGHT' ? 132 : 110;
    const intervalMs = (60 / tempo / 4) * 1000; // 16th note subdivisions

    this.musicInterval = window.setInterval(() => {
      this.playMusicStep(track);
      this.step = (this.step + 1) % 32;
    }, intervalMs);
  }

  public stopMusic() {
    if (this.musicInterval !== null) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }

  private playMusicStep(track: 'MENU' | 'FIGHT') {
    if (!this.ctx || this.isMuted || this.musicVolume <= 0) return;

    const now = this.ctx.currentTime;

    try {
      // Bass line notes in Hz
      const bassFightScale = [55, 55, 65.41, 73.42, 55, 82.41, 73.42, 65.41]; // A1, C2, D2, E2...
      const bassMenuScale = [43.65, 43.65, 51.91, 58.27, 43.65, 65.41, 58.27, 48.99]; // F1, G#1...

      // 1. Kick on beats 0, 8, 16, 24
      if (this.step % 8 === 0 || (track === 'FIGHT' && this.step % 16 === 10)) {
        const kickOsc = this.ctx.createOscillator();
        const kickGain = this.ctx.createGain();
        kickOsc.type = 'sine';
        kickOsc.frequency.setValueAtTime(140, now);
        kickOsc.frequency.exponentialRampToValueAtTime(35, now + 0.12);

        kickGain.gain.setValueAtTime(0.4 * this.musicVolume, now);
        kickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

        kickOsc.connect(kickGain);
        kickGain.connect(this.ctx.destination);
        kickOsc.start(now);
        kickOsc.stop(now + 0.15);
      }

      // 2. Snare / Clack on beats 4, 12, 20, 28
      if (this.step % 8 === 4) {
        const snareOsc = this.ctx.createOscillator();
        const snareGain = this.ctx.createGain();
        snareOsc.type = 'triangle';
        snareOsc.frequency.setValueAtTime(220, now);
        snareOsc.frequency.exponentialRampToValueAtTime(80, now + 0.08);

        snareGain.gain.setValueAtTime(0.2 * this.musicVolume, now);
        snareGain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

        snareOsc.connect(snareGain);
        snareGain.connect(this.ctx.destination);
        snareOsc.start(now);
        snareOsc.stop(now + 0.1);
      }

      // 3. Bass synth
      if (this.step % 2 === 0) {
        const scale = track === 'FIGHT' ? bassFightScale : bassMenuScale;
        const noteIndex = Math.floor(this.step / 4) % scale.length;
        const freq = scale[noteIndex];

        const bassOsc = this.ctx.createOscillator();
        const bassGain = this.ctx.createGain();
        bassOsc.type = 'sawtooth';
        bassOsc.frequency.setValueAtTime(freq, now);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(track === 'FIGHT' ? 450 : 300, now);

        bassGain.gain.setValueAtTime(0.18 * this.musicVolume, now);
        bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

        bassOsc.connect(filter);
        filter.connect(bassGain);
        bassGain.connect(this.ctx.destination);
        bassOsc.start(now);
        bassOsc.stop(now + 0.2);
      }

      // 4. Synth Arp / Melody (light embellishment)
      if (track === 'FIGHT' && (this.step % 4 === 1 || this.step % 4 === 3)) {
        const leadNotes = [220, 261.63, 293.66, 329.63, 392, 440];
        const leadFreq = leadNotes[(this.step * 3) % leadNotes.length];

        const leadOsc = this.ctx.createOscillator();
        const leadGain = this.ctx.createGain();
        leadOsc.type = 'square';
        leadOsc.frequency.setValueAtTime(leadFreq, now);

        leadGain.gain.setValueAtTime(0.05 * this.musicVolume, now);
        leadGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

        leadOsc.connect(leadGain);
        leadGain.connect(this.ctx.destination);
        leadOsc.start(now);
        leadOsc.stop(now + 0.09);
      }
    } catch {
      // Audio tolerance
    }
  }
}

export const soundSystem = new SoundSystem();
