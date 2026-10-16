import React, { useState, useEffect } from 'react';
import {
  Navigation,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  Compass,
  MapPin,
  Clock,
  Radio,
} from 'lucide-react';
import { GaugeCluster } from '../components/GaugeCluster';
import { CarAudioManager } from '../kernel/CarAudioManager';
import { DisplayManager } from '../kernel/DisplayManager';
import { VHAL } from '../kernel/VHAL';
import { AudioSynth } from '../sounds/AudioSynth';

export const DashboardApp: React.FC = () => {
  const [audioState, setAudioState] = useState(CarAudioManager.getState());
  const [vhalState, setVhalState] = useState(VHAL.getState());
  const [carMapX, setCarMapX] = useState(160);
  const [carMapY, setCarMapY] = useState(200);

  useEffect(() => {
    const unsubAudio = CarAudioManager.subscribe(() => {
      setAudioState(CarAudioManager.getState());
    });
    const unsubVhal = VHAL.subscribe(setVhalState);

    // Animate map vehicle movement along the road
    const mapAnim = setInterval(() => {
      setCarMapX((prev) => 160 + Math.sin(Date.now() / 2500) * 40);
      setCarMapY((prev) => 200 + Math.cos(Date.now() / 3000) * 20);
    }, 50);

    return () => {
      unsubAudio();
      unsubVhal();
      clearInterval(mapAnim);
    };
  }, []);

  return (
    <div className="w-full h-full p-4 grid grid-cols-12 gap-4 overflow-hidden select-none">
      {/* LEFT PANEL (7 Cols): Live Interactive GPS Navigation Map */}
      <div className="col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-4 flex flex-col justify-between relative overflow-hidden shadow-2xl">
        {/* Map Vector Graphic (Simulated Map Canvas) */}
        <div className="absolute inset-0 bg-[#0f172a] opacity-90 overflow-hidden">
          <svg className="w-full h-full" viewBox="0 0 500 400">
            {/* Water body */}
            <path
              d="M 0 320 Q 150 280, 250 350 T 500 300 L 500 400 L 0 400 Z"
              fill="#1e293b"
            />
            {/* Secondary roads */}
            <path
              d="M 50 0 L 220 400 M 350 0 L 100 400 M 0 180 L 500 220"
              stroke="#334155"
              strokeWidth="12"
              fill="none"
            />
            {/* Main Highway Route (Kepler Freeway) */}
            <path
              d="M 120 400 Q 180 250, 160 150 T 260 0"
              stroke="#2563eb"
              strokeWidth="16"
              fill="none"
              strokeLinecap="round"
            />
            {/* Route guideline centerline */}
            <path
              d="M 120 400 Q 180 250, 160 150 T 260 0"
              stroke="#93c5fd"
              strokeWidth="4"
              strokeDasharray="10 10"
              fill="none"
            />
            {/* Animated Car Icon Marker on Map */}
            <g transform={`translate(${carMapX}, ${carMapY})`}>
              <circle r="18" fill="rgba(59, 130, 246, 0.3)" className="animate-ping" />
              <circle r="12" fill="#2563eb" stroke="#ffffff" strokeWidth="2.5" />
              <polygon points="0,-7 5,5 -5,5" fill="#ffffff" />
            </g>
            {/* Destination Pin */}
            <g transform="translate(260, 25)">
              <circle r="8" fill="#ef4444" />
              <circle r="3" fill="#ffffff" />
            </g>
          </svg>
        </div>

        {/* Top: Next Turn Card & Speed Limit Sign */}
        <div className="relative z-10 flex items-start justify-between">
          <div className="bg-slate-950/90 backdrop-blur-md border border-slate-700/80 p-3.5 rounded-2xl flex items-center space-x-3.5 shadow-xl">
            <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md">
              <Navigation size={26} className="rotate-45" />
            </div>
            <div>
              <div className="text-xs text-blue-400 font-bold uppercase tracking-wider">
                In 450 meters
              </div>
              <div className="text-sm font-bold text-white">
                Turn Right on Kepler Pkwy
              </div>
              <div className="text-[11px] text-slate-400">
                Then merge onto Freeway 101 North
              </div>
            </div>
          </div>

          {/* Speed Limit Sign */}
          <div className="w-12 h-14 bg-white rounded-xl border-4 border-red-600 flex flex-col items-center justify-center shadow-xl">
            <span className="text-[8px] font-black text-slate-900 uppercase">
              LIMIT
            </span>
            <span className="text-lg font-black text-slate-900 leading-none">
              80
            </span>
          </div>
        </div>

        {/* Bottom Bar: Trip ETA & Fullscreen Button */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="bg-slate-950/90 backdrop-blur-md border border-slate-700/80 px-4 py-2 rounded-2xl flex items-center space-x-4 shadow-xl">
            <div className="flex items-center space-x-1.5 text-xs text-emerald-400 font-bold">
              <Clock size={15} />
              <span>18 min</span>
            </div>
            <div className="text-xs text-slate-300 font-semibold">14.2 km</div>
            <div className="text-xs text-slate-400">ETA 09:42 PM</div>
          </div>

          <button
            onClick={() => DisplayManager.setLayoutMode('FULLSCREEN_MAP')}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-2xl shadow-lg transition active:scale-95"
          >
            Expand Map
          </button>
        </div>
      </div>

      {/* RIGHT PANEL (5 Cols): Media Card & Gauge Cluster */}
      <div className="col-span-5 flex flex-col space-y-4">
        {/* Top: Media Player Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 flex flex-col justify-between shadow-2xl relative overflow-hidden flex-1">
          {/* Audio Waveform Visualizer & Track Info */}
          <div className="flex items-center space-x-4">
            <img
              src={audioState.currentTrack.coverUrl}
              alt="Album Artwork"
              className="w-20 h-20 rounded-2xl object-cover shadow-lg border border-slate-700/60"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-950 text-blue-400 border border-blue-800">
                  KEPLER STEREO
                </span>
                {audioState.isDucked && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-400 animate-pulse">
                    DUCKED FOR NAV
                  </span>
                )}
              </div>
              <h3 className="text-base font-bold text-white truncate mt-1">
                {audioState.currentTrack.title}
              </h3>
              <p className="text-xs text-slate-400 truncate">
                {audioState.currentTrack.artist} — {audioState.currentTrack.album}
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="my-2">
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-blue-500 h-full rounded-full transition-all duration-300"
                style={{
                  width: `${
                    (audioState.progressSec /
                      audioState.currentTrack.durationSec) *
                    100
                  }%`,
                }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
              <span>
                {Math.floor(audioState.progressSec / 60)}:
                {(audioState.progressSec % 60).toString().padStart(2, '0')}
              </span>
              <span>
                {Math.floor(audioState.currentTrack.durationSec / 60)}:
                {(audioState.currentTrack.durationSec % 60)
                  .toString()
                  .padStart(2, '0')}
              </span>
            </div>
          </div>

          {/* Playback Controls */}
          <div className="flex items-center justify-between pt-1">
            <button
              onClick={() => DisplayManager.setLayoutMode('FULLSCREEN_MEDIA')}
              className="text-xs text-slate-400 hover:text-white flex items-center space-x-1"
            >
              <Radio size={15} />
              <span>Radio</span>
            </button>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => CarAudioManager.prevTrack()}
                className="w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-200 transition"
              >
                <SkipBack size={18} />
              </button>
              <button
                onClick={() => CarAudioManager.togglePlayPause()}
                className="w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center text-white shadow-lg shadow-blue-600/40 transition active:scale-95"
              >
                {audioState.isPlaying ? <Pause size={22} /> : <Play size={22} className="ml-0.5" />}
              </button>
              <button
                onClick={() => CarAudioManager.nextTrack()}
                className="w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-200 transition"
              >
                <SkipForward size={18} />
              </button>
            </div>

            <div className="w-16" />
          </div>
        </div>

        {/* Bottom: Digital Gauge Cluster */}
        <div className="flex-1">
          <GaugeCluster />
        </div>
      </div>
    </div>
  );
};
