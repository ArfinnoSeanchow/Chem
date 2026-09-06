/**
 * Background Sound Manager for Chemly
 * Supports loading /backsound.mp3 or generating a relaxing ambient Web Audio synth pad.
 */

class BackgroundSoundManager {
  private audioEl: HTMLAudioElement | null = null;
  private audioCtx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private isMuted: boolean = false;
  private volume: number = 0.35;
  private synthGainNode: GainNode | null = null;
  private synthInterval: number | null = null;
  private listeners: Set<() => void> = new Set();
  private usingFileAudio: boolean = false;

  constructor() {
    if (typeof window !== "undefined") {
      const savedMuted = localStorage.getItem("chemly_bgm_muted");
      if (savedMuted !== null) {
        this.isMuted = savedMuted === "true";
      }
      const savedVol = localStorage.getItem("chemly_bgm_volume");
      if (savedVol !== null) {
        this.volume = Math.max(0, Math.min(1, parseFloat(savedVol)));
      }
    }
  }

  public subscribe(cb: () => void): () => void {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  private notify() {
    this.listeners.forEach((cb) => cb());
  }

  public getState() {
    return {
      isPlaying: this.isPlaying,
      isMuted: this.isMuted,
      volume: this.volume,
      usingFileAudio: this.usingFileAudio,
    };
  }

  public setVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val));
    if (typeof window !== "undefined") {
      localStorage.setItem("chemly_bgm_volume", this.volume.toString());
    }
    if (this.audioEl) {
      this.audioEl.volume = this.isMuted ? 0 : this.volume;
    }
    if (this.synthGainNode && this.audioCtx) {
      this.synthGainNode.gain.setTargetAtTime(
        this.isMuted ? 0 : this.volume * 0.18,
        this.audioCtx.currentTime,
        0.05
      );
    }
    this.notify();
  }

  public toggleMute() {
    this.isMuted = !this.isMuted;
    if (typeof window !== "undefined") {
      localStorage.setItem("chemly_bgm_muted", this.isMuted.toString());
    }
    if (this.audioEl) {
      this.audioEl.muted = this.isMuted;
      this.audioEl.volume = this.isMuted ? 0 : this.volume;
    }
    if (this.synthGainNode && this.audioCtx) {
      this.synthGainNode.gain.setTargetAtTime(
        this.isMuted ? 0 : this.volume * 0.18,
        this.audioCtx.currentTime,
        0.05
      );
    }
    if (!this.isPlaying && !this.isMuted) {
      this.play();
    }
    this.notify();
  }

  public async play(): Promise<void> {
    if (this.isPlaying) return;

    // Try playing /backsound.mp3 first
    try {
      if (!this.audioEl && typeof window !== "undefined") {
        const audio = new Audio("/backsound.mp3");
        audio.loop = true;
        audio.volume = this.isMuted ? 0 : this.volume;
        this.audioEl = audio;
      }

      if (this.audioEl) {
        await this.audioEl.play();
        this.usingFileAudio = true;
        this.isPlaying = true;
        this.notify();
        return;
      }
    } catch {
      // /backsound.mp3 was not found or failed, fallback gracefully to soothing ambient synth
      this.usingFileAudio = false;
      this.startAmbientSynth();
      this.isPlaying = true;
      this.notify();
    }
  }

  public pause(): void {
    if (this.audioEl) {
      this.audioEl.pause();
    }
    this.stopAmbientSynth();
    this.isPlaying = false;
    this.notify();
  }

  public toggle(): void {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  /**
   * Soothing Web Audio Synthesizer:
   * Generates a warm, relaxing ambient drone pad with gentle pentatonic notes
   * (432Hz based tuning, soft lowpass filter, gentle attack & decay)
   */
  private startAmbientSynth() {
    if (typeof window === "undefined") return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!this.audioCtx) {
        this.audioCtx = new AudioCtx();
      }
      if (this.audioCtx.state === "suspended") {
        this.audioCtx.resume();
      }

      // Master Synth Gain
      const masterGain = this.audioCtx.createGain();
      masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume * 0.18, this.audioCtx.currentTime);
      masterGain.connect(this.audioCtx.destination);
      this.synthGainNode = masterGain;

      // Warm Lowpass Filter
      const filter = this.audioCtx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(650, this.audioCtx.currentTime);
      filter.Q.setValueAtTime(1.5, this.audioCtx.currentTime);
      filter.connect(masterGain);

      // Pentatonic Ambient Frequencies (F3, A3, C4, E4, G4, A4)
      const chordTones = [174.61, 220.0, 261.63, 329.63, 392.0, 440.0, 523.25];

      const playChime = () => {
        if (!this.audioCtx || !this.isPlaying) return;
        const now = this.audioCtx.currentTime;
        const freq = chordTones[Math.floor(Math.random() * chordTones.length)];

        // Sine oscillator for pure warm tone
        const osc = this.audioCtx.createOscillator();
        const noteGain = this.audioCtx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now);

        // Soft slow attack, gentle long decay
        noteGain.gain.setValueAtTime(0, now);
        noteGain.gain.linearRampToValueAtTime(0.08, now + 1.2);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, now + 4.5);

        osc.connect(noteGain);
        noteGain.connect(filter);

        osc.start(now);
        osc.stop(now + 4.6);
      };

      // Play initial chord
      playChime();
      setTimeout(playChime, 800);
      setTimeout(playChime, 1600);

      // Recurring ambient generator every ~2.8 seconds
      this.synthInterval = window.setInterval(playChime, 2800);
    } catch {
      // AudioContext not supported
    }
  }

  private stopAmbientSynth() {
    if (this.synthInterval) {
      clearInterval(this.synthInterval);
      this.synthInterval = null;
    }
    if (this.synthGainNode && this.audioCtx) {
      try {
        this.synthGainNode.gain.setValueAtTime(0, this.audioCtx.currentTime);
      } catch {
        // ignore
      }
    }
  }
}

export const backgroundSound = new BackgroundSoundManager();
