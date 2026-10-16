/**
 * Web Audio API Engine for AutoDroid OS
 * Generates interactive automotive audio:
 * - Engine RPM rev sound
 * - Turn signal relays
 * - Reverse parking sensor proximity beeps
 * - Navigation chime
 * - Simulated music playback with dynamic ducking
 */

class AudioSynthEngine {
  private ctx: AudioContext | null = null;
  private musicGainNode: GainNode | null = null;
  private sfxGainNode: GainNode | null = null;
  private musicOsc: OscillatorNode | null = null;
  private isMusicPlaying = false;
  private musicInterval: any = null;
  private turnSignalInterval: any = null;
  private parkingBeepInterval: any = null;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.musicGainNode = this.ctx.createGain();
        this.sfxGainNode = this.ctx.createGain();
        this.musicGainNode.gain.setValueAtTime(0.3, this.ctx.currentTime);
        this.sfxGainNode.gain.setValueAtTime(0.5, this.ctx.currentTime);
        this.musicGainNode.connect(this.ctx.destination);
        this.sfxGainNode.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public playTouchFeedback() {
    try {
      this.initContext();
      if (!this.ctx || !this.sfxGainNode) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(this.sfxGainNode);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.04);
    } catch (e) {
      // Audio might be blocked until user gesture
    }
  }

  public playTurnSignalClick(isHigh: boolean = true) {
    try {
      this.initContext();
      if (!this.ctx || !this.sfxGainNode) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(isHigh ? 920 : 640, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.03);
      osc.connect(gain);
      gain.connect(this.sfxGainNode);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.03);
    } catch (e) {}
  }

  public startTurnSignal(enable: boolean) {
    if (!enable) {
      if (this.turnSignalInterval) {
        clearInterval(this.turnSignalInterval);
        this.turnSignalInterval = null;
      }
      return;
    }
    if (this.turnSignalInterval) return;

    let tick = true;
    this.turnSignalInterval = setInterval(() => {
      this.playTurnSignalClick(tick);
      tick = !tick;
    }, 420);
  }

  public playNavChime() {
    try {
      this.initContext();
      if (!this.ctx || !this.sfxGainNode) return;
      const now = this.ctx.currentTime;
      [523.25, 659.25, 783.99].forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);
        gain.gain.setValueAtTime(0.25, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.08 + 0.2);
        osc.connect(gain);
        gain.connect(this.sfxGainNode!);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.22);
      });
    } catch (e) {}
  }

  public startParkingBeeps(enable: boolean, distanceMeters: number = 1.0) {
    if (!enable) {
      if (this.parkingBeepInterval) {
        clearInterval(this.parkingBeepInterval);
        this.parkingBeepInterval = null;
      }
      return;
    }
    if (this.parkingBeepInterval) {
      clearInterval(this.parkingBeepInterval);
    }

    const intervalMs = Math.max(120, Math.min(800, distanceMeters * 350));
    this.parkingBeepInterval = setInterval(() => {
      try {
        this.initContext();
        if (!this.ctx || !this.sfxGainNode) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1400, this.ctx.currentTime);
        gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.06);
        osc.connect(gain);
        gain.connect(this.sfxGainNode);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.06);
      } catch (e) {}
    }, intervalMs);
  }

  // Synthesized Automotive Music Channel
  public toggleMusic(play?: boolean): boolean {
    this.initContext();
    const shouldPlay = play !== undefined ? play : !this.isMusicPlaying;

    if (!shouldPlay) {
      if (this.musicInterval) {
        clearInterval(this.musicInterval);
        this.musicInterval = null;
      }
      this.isMusicPlaying = false;
      return false;
    }

    if (this.isMusicPlaying) return true;
    this.isMusicPlaying = true;

    // Harmonious chord notes for background driving soundtrack
    const chords = [
      [220, 261.63, 329.63], // Am
      [174.61, 220, 261.63], // F
      [130.81, 164.81, 196],  // C
      [196, 246.94, 293.66], // G
    ];

    let chordIdx = 0;
    this.musicInterval = setInterval(() => {
      if (!this.ctx || !this.musicGainNode || !this.isMusicPlaying) return;
      const currentChord = chords[chordIdx % chords.length];
      chordIdx++;

      currentChord.forEach((freq) => {
        try {
          const osc = this.ctx!.createOscillator();
          const gain = this.ctx!.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, this.ctx!.currentTime);
          gain.gain.setValueAtTime(0.05, this.ctx!.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + 0.9);
          osc.connect(gain);
          gain.connect(this.musicGainNode!);
          osc.start();
          osc.stop(this.ctx!.currentTime + 0.95);
        } catch (e) {}
      });
    }, 1000);

    return true;
  }

  public getMusicStatus() {
    return this.isMusicPlaying;
  }

  // Audio Ducking Implementation: Temporarily lowers music volume to 15%
  public duckMusic(duck: boolean) {
    if (!this.ctx || !this.musicGainNode) return;
    const targetGain = duck ? 0.05 : 0.3;
    this.musicGainNode.gain.cancelScheduledValues(this.ctx.currentTime);
    this.musicGainNode.gain.linearRampToValueAtTime(targetGain, this.ctx.currentTime + 0.2);
  }
}

export const AudioSynth = new AudioSynthEngine();
