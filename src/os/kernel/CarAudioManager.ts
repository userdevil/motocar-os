import { AudioStreamType, AudioFocusState } from '../types/android';
import { EventBus } from './EventBus';
import { AudioSynth } from '../sounds/AudioSynth';

export interface MediaTrack {
  id: string;
  title: string;
  artist: string;
  album: string;
  durationSec: number;
  coverUrl: string;
}

export const SAMPLE_PLAYLIST: MediaTrack[] = [
  {
    id: 'track-1',
    title: 'Midnight Highway',
    artist: 'Kepler Synthwave',
    album: 'Neon Horizon',
    durationSec: 218,
    coverUrl: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'track-2',
    title: 'Cosmic Cruiser',
    artist: 'Electra Drive',
    album: 'Autobahn Dreamer',
    durationSec: 194,
    coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'track-3',
    title: 'Urban Drift',
    artist: 'Starlight Runner',
    album: 'City Lights 2026',
    durationSec: 242,
    coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&auto=format&fit=crop&q=80',
  },
];

class CarAudioService {
  private activeTrackIndex: number = 0;
  private isPlaying: boolean = false;
  private currentProgressSec: number = 45;
  private volume: number = 70; // 0-100%
  private isDucked: boolean = false;
  private progressTimer: any = null;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.startProgressTracker();
  }

  public subscribe(cb: () => void): () => void {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  private notify() {
    this.listeners.forEach((l) => l());
    EventBus.emit('audio:state_change', this.getState());
  }

  public getState() {
    return {
      currentTrack: SAMPLE_PLAYLIST[this.activeTrackIndex],
      isPlaying: this.isPlaying,
      progressSec: this.currentProgressSec,
      volume: this.volume,
      isDucked: this.isDucked,
      playlist: SAMPLE_PLAYLIST,
    };
  }

  public togglePlayPause() {
    this.isPlaying = !this.isPlaying;
    AudioSynth.toggleMusic(this.isPlaying);
    this.notify();
  }

  public nextTrack() {
    this.activeTrackIndex = (this.activeTrackIndex + 1) % SAMPLE_PLAYLIST.length;
    this.currentProgressSec = 0;
    this.notify();
  }

  public prevTrack() {
    this.activeTrackIndex = (this.activeTrackIndex - 1 + SAMPLE_PLAYLIST.length) % SAMPLE_PLAYLIST.length;
    this.currentProgressSec = 0;
    this.notify();
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(100, vol));
    AudioSynth.playTouchFeedback();
    this.notify();
  }

  public triggerNavigationPrompt(guidanceText: string) {
    // Request AudioFocus for STREAM_NAVIGATION with DUCK_OTHERS
    this.isDucked = true;
    AudioSynth.duckMusic(true);
    AudioSynth.playNavChime();
    this.notify();

    EventBus.emit('audio:nav_prompt', guidanceText);

    // After 3 seconds, restore media audio focus
    setTimeout(() => {
      this.isDucked = false;
      AudioSynth.duckMusic(false);
      this.notify();
    }, 3200);
  }

  private startProgressTracker() {
    this.progressTimer = setInterval(() => {
      if (this.isPlaying) {
        const curTrack = SAMPLE_PLAYLIST[this.activeTrackIndex];
        this.currentProgressSec = (this.currentProgressSec + 1) % curTrack.durationSec;
        this.notify();
      }
    }, 1000);
  }
}

export const CarAudioManager = new CarAudioService();
