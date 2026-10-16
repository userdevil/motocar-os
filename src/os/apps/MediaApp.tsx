import React, { useState, useEffect } from 'react';
import {
  Radio,
  Music,
  Bluetooth,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Disc,
  ListMusic,
} from 'lucide-react';
import { CarAudioManager, SAMPLE_PLAYLIST } from '../kernel/CarAudioManager';

export const MediaApp: React.FC = () => {
  const [audioState, setAudioState] = useState(CarAudioManager.getState());
  const [mode, setMode] = useState<'STREAM' | 'RADIO' | 'BT'>('STREAM');
  const [radioFreq, setRadioFreq] = useState<number>(101.5);

  useEffect(() => {
    return CarAudioManager.subscribe(() => {
      setAudioState(CarAudioManager.getState());
    });
  }, []);

  const radioPresets = [88.5, 94.7, 98.1, 101.5, 104.3, 107.9];

  return (
    <div className="w-full h-full p-6 flex flex-col justify-between bg-slate-950 overflow-hidden select-none">
      {/* Top Source Switcher Tabs */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setMode('STREAM')}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition ${
              mode === 'STREAM'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            <Music size={16} />
            <span>Kepler Music</span>
          </button>
          <button
            onClick={() => setMode('RADIO')}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition ${
              mode === 'RADIO'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            <Radio size={16} />
            <span>FM Radio</span>
          </button>
          <button
            onClick={() => setMode('BT')}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition ${
              mode === 'BT'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            <Bluetooth size={16} />
            <span>Phone Bluetooth</span>
          </button>
        </div>

        {/* Volume Slider */}
        <div className="flex items-center space-x-3 bg-slate-900 border border-slate-800 px-4 py-2 rounded-2xl">
          <Volume2 size={16} className="text-slate-400" />
          <input
            type="range"
            min="0"
            max="100"
            value={audioState.volume}
            onChange={(e) => CarAudioManager.setVolume(Number(e.target.value))}
            className="w-28 accent-blue-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
          />
          <span className="text-xs font-bold font-mono w-8 text-slate-200">
            {audioState.volume}%
          </span>
        </div>
      </div>

      {/* Main Content Area */}
      {mode === 'STREAM' ? (
        <div className="grid grid-cols-12 gap-8 my-auto items-center">
          {/* Left: Big Album Artwork & Track Info */}
          <div className="col-span-5 flex flex-col items-center text-center">
            <div className="relative group">
              <img
                src={audioState.currentTrack.coverUrl}
                alt="Album Cover"
                className="w-64 h-64 rounded-3xl object-cover shadow-2xl border border-slate-700/80"
              />
              {audioState.isPlaying && (
                <div className="absolute inset-0 rounded-3xl ring-4 ring-blue-500/40 animate-pulse pointer-events-none" />
              )}
            </div>
            <h2 className="text-2xl font-black text-white mt-4">
              {audioState.currentTrack.title}
            </h2>
            <p className="text-sm font-semibold text-slate-400">
              {audioState.currentTrack.artist} — {audioState.currentTrack.album}
            </p>
          </div>

          {/* Right: Playlist Queue */}
          <div className="col-span-7 bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-2xl flex flex-col h-72">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
                <ListMusic size={16} className="text-blue-400" />
                <span>Up Next Queue</span>
              </span>
              <span className="text-xs text-slate-500">
                {SAMPLE_PLAYLIST.length} Tracks
              </span>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {SAMPLE_PLAYLIST.map((track, i) => {
                const isCur = track.id === audioState.currentTrack.id;
                return (
                  <div
                    key={track.id}
                    onClick={() => {
                      if (!isCur) CarAudioManager.nextTrack();
                    }}
                    className={`p-3 rounded-2xl flex items-center justify-between cursor-pointer transition ${
                      isCur
                        ? 'bg-blue-600 text-white font-bold shadow-lg'
                        : 'bg-slate-950/60 hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-xs font-mono opacity-60">
                        0{i + 1}
                      </span>
                      <div>
                        <div className="text-xs">{track.title}</div>
                        <div className="text-[11px] opacity-75">{track.artist}</div>
                      </div>
                    </div>
                    <span className="text-xs font-mono opacity-75">
                      {Math.floor(track.durationSec / 60)}:
                      {(track.durationSec % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : mode === 'RADIO' ? (
        /* FM Radio Tuner Mode */
        <div className="flex flex-col items-center justify-center space-y-8 my-auto">
          {/* Big Frequency Display */}
          <div className="text-center">
            <span className="text-7xl font-black text-white tracking-tight">
              {radioFreq.toFixed(1)}
            </span>
            <span className="text-lg font-bold text-blue-400 block mt-1">
              FM MHz • Kepler HD Radio
            </span>
          </div>

          {/* Interactive Frequency Slider */}
          <div className="w-full max-w-2xl px-6">
            <input
              type="range"
              min="87.5"
              max="108.0"
              step="0.1"
              value={radioFreq}
              onChange={(e) => setRadioFreq(Number(e.target.value))}
              className="w-full accent-blue-500 cursor-pointer h-3 bg-slate-800 rounded-lg"
            />
            <div className="flex justify-between text-xs text-slate-500 font-mono mt-2">
              <span>87.5</span>
              <span>92.0</span>
              <span>98.0</span>
              <span>102.0</span>
              <span>108.0</span>
            </div>
          </div>

          {/* Station Presets */}
          <div className="flex items-center space-x-3">
            {radioPresets.map((preset) => (
              <button
                key={preset}
                onClick={() => setRadioFreq(preset)}
                className={`px-5 py-2.5 rounded-2xl font-mono text-sm font-bold border transition ${
                  radioFreq === preset
                    ? 'bg-blue-600 text-white border-blue-500 shadow-lg'
                    : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
                }`}
              >
                {preset.toFixed(1)}
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* Bluetooth Phone Audio */
        <div className="flex flex-col items-center justify-center space-y-4 my-auto text-center">
          <div className="w-20 h-20 rounded-full bg-blue-600/20 border border-blue-500 flex items-center justify-center text-blue-400 animate-pulse">
            <Bluetooth size={40} />
          </div>
          <h3 className="text-xl font-bold text-white">Pixel 9 Pro Connected</h3>
          <p className="text-xs text-slate-400 max-w-sm">
            High definition audio stream via LDAC / AAC 48kHz. Controlling audio via automotive AVRCP protocol.
          </p>
        </div>
      )}

      {/* Bottom Transport Controls Bar */}
      <div className="border-t border-slate-800 pt-4 flex flex-col space-y-2">
        {/* Progress Bar */}
        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
          <div
            className="bg-blue-500 h-full rounded-full transition-all"
            style={{
              width: `${
                (audioState.progressSec / audioState.currentTrack.durationSec) *
                100
              }%`,
            }}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="text-xs text-slate-400 font-mono">
            {Math.floor(audioState.progressSec / 60)}:
            {(audioState.progressSec % 60).toString().padStart(2, '0')} /{' '}
            {Math.floor(audioState.currentTrack.durationSec / 60)}:
            {(audioState.currentTrack.durationSec % 60).toString().padStart(2, '0')}
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => CarAudioManager.prevTrack()}
              className="w-12 h-12 rounded-full bg-slate-900 hover:bg-slate-800 flex items-center justify-center text-white transition"
            >
              <SkipBack size={20} />
            </button>
            <button
              onClick={() => CarAudioManager.togglePlayPause()}
              className="w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center text-white shadow-xl shadow-blue-600/40 transition active:scale-95"
            >
              {audioState.isPlaying ? <Pause size={24} /> : <Play size={24} className="ml-0.5" />}
            </button>
            <button
              onClick={() => CarAudioManager.nextTrack()}
              className="w-12 h-12 rounded-full bg-slate-900 hover:bg-slate-800 flex items-center justify-center text-white transition"
            >
              <SkipForward size={20} />
            </button>
          </div>

          <div className="w-20" />
        </div>
      </div>
    </div>
  );
};
