import { DisplayLayoutMode, Gear } from '../types/android';
import { EventBus } from './EventBus';
import { VHAL } from './VHAL';
import { AudioSynth } from '../sounds/AudioSynth';

class DisplayManagerService {
  private currentMode: DisplayLayoutMode = 'SPLIT_DASHBOARD';
  private previousMode: DisplayLayoutMode = 'SPLIT_DASHBOARD';
  private listeners: Set<(mode: DisplayLayoutMode) => void> = new Set();
  private brightness: number = 85; // 0-100%

  constructor() {
    // Monitor VHAL gear changes to trigger reverse camera
    VHAL.subscribe((vhalState) => {
      if (vhalState.gear === Gear.REVERSE) {
        if (this.currentMode !== 'REVERSE_CAMERA') {
          this.previousMode = this.currentMode;
          this.setLayoutMode('REVERSE_CAMERA', false);
          AudioSynth.startParkingBeeps(true, 1.2);
        }
      } else {
        if (this.currentMode === 'REVERSE_CAMERA') {
          AudioSynth.startParkingBeeps(false);
          this.setLayoutMode(this.previousMode, false);
        }
      }
    });
  }

  public getLayoutMode(): DisplayLayoutMode {
    return this.currentMode;
  }

  public setLayoutMode(mode: DisplayLayoutMode, playFeedback: boolean = true) {
    if (this.currentMode === mode) return;
    this.currentMode = mode;
    if (playFeedback) {
      AudioSynth.playTouchFeedback();
    }
    this.notify();
    EventBus.emit('display:mode_change', mode);
  }

  public getBrightness(): number {
    return this.brightness;
  }

  public setBrightness(level: number) {
    this.brightness = Math.max(10, Math.min(100, level));
    this.notify();
  }

  public subscribe(cb: (mode: DisplayLayoutMode) => void): () => void {
    this.listeners.add(cb);
    cb(this.currentMode);
    return () => this.listeners.delete(cb);
  }

  private notify() {
    this.listeners.forEach((l) => l(this.currentMode));
  }
}

export const DisplayManager = new DisplayManagerService();
