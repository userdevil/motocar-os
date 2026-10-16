import React, { useState } from 'react';
import {
  Navigation,
  Search,
  Compass,
  Layers,
  Volume2,
  VolumeX,
  MapPin,
  Clock,
  ArrowRight,
  Route,
} from 'lucide-react';
import { CarAudioManager } from '../kernel/CarAudioManager';
import { VHAL } from '../kernel/VHAL';

export const MapsApp: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [is3D, setIs3D] = useState(true);
  const [voiceMuted, setVoiceMuted] = useState(false);

  const sampleDestinations = [
    { name: 'Supercharger Hub & Lounge', distance: '3.4 km', time: '6 min' },
    { name: 'Kepler Tech Headquarters', distance: '12.8 km', time: '17 min' },
    { name: 'Apex Mountain Lookout', distance: '28.1 km', time: '34 min' },
  ];

  return (
    <div className="w-full h-full relative bg-slate-950 overflow-hidden select-none">
      {/* Fullscreen Map Canvas Simulation */}
      <svg className="w-full h-full" viewBox="0 0 1000 600" preserveAspectRatio="none">
        {/* Background land and grid */}
        <rect width="1000" height="600" fill="#0b1120" />
        <path
          d="M 0 150 Q 300 120, 600 200 T 1000 160 L 1000 350 L 0 350 Z"
          fill="#131c31"
        />
        {/* Major Interstate Highway Route */}
        <path
          d="M 100 600 C 300 450, 400 300, 500 200 S 800 100, 900 0"
          stroke="#1e3a8a"
          strokeWidth="32"
          fill="none"
        />
        <path
          d="M 100 600 C 300 450, 400 300, 500 200 S 800 100, 900 0"
          stroke="#3b82f6"
          strokeWidth="16"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M 100 600 C 300 450, 400 300, 500 200 S 800 100, 900 0"
          stroke="#93c5fd"
          strokeWidth="4"
          strokeDasharray="12 12"
          fill="none"
        />
        {/* Secondary street grid */}
        <path
          d="M 0 450 L 1000 450 M 0 250 L 1000 250 M 350 0 L 350 600 M 750 0 L 750 600"
          stroke="#1e293b"
          strokeWidth="8"
          fill="none"
        />
        {/* Vehicle Location Icon */}
        <g transform="translate(420, 280)">
          <circle r="28" fill="rgba(59, 130, 246, 0.25)" className="animate-ping" />
          <circle r="18" fill="#3b82f6" stroke="#ffffff" strokeWidth="3" />
          <polygon points="0,-10 7,7 -7,7" fill="#ffffff" />
        </g>
        {/* Destination Flag */}
        <g transform="translate(850, 50)">
          <circle r="12" fill="#ef4444" />
          <circle r="4" fill="#ffffff" />
        </g>
      </svg>

      {/* Top Search Bar & Controls */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20">
        <div className="flex items-center space-x-3 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 px-4 py-2.5 rounded-2xl w-96 shadow-2xl">
          <Search size={18} className="text-slate-400" />
          <input
            type="text"
            placeholder="Search destination, charging or address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-white text-xs placeholder-slate-500 focus:outline-none w-full"
          />
        </div>

        {/* Map View Controls (3D, Layers, Voice) */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIs3D(!is3D)}
            className={`px-3 py-2 rounded-xl text-xs font-bold border transition ${
              is3D
                ? 'bg-blue-600 text-white border-blue-500 shadow-lg'
                : 'bg-slate-900/90 text-slate-300 border-slate-700'
            }`}
          >
            {is3D ? '3D View' : '2D North'}
          </button>
          <button
            onClick={() => {
              setVoiceMuted(!voiceMuted);
              if (voiceMuted) {
                CarAudioManager.triggerNavigationPrompt(
                  'Navigation voice guidance enabled. In 200 meters, keep left.'
                );
              }
            }}
            className={`p-2.5 rounded-xl border transition ${
              !voiceMuted
                ? 'bg-blue-600 text-white border-blue-500'
                : 'bg-slate-900/90 text-slate-400 border-slate-700'
            }`}
            title="Toggle Voice Prompts"
          >
            {voiceMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
        </div>
      </div>

      {/* Floating Turn Instruction Card (Top Left) */}
      <div className="absolute top-20 left-4 bg-slate-950/90 backdrop-blur-md border border-slate-700/80 p-4 rounded-3xl shadow-2xl flex items-center space-x-4 max-w-sm z-20">
        <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/40">
          <Navigation size={32} className="rotate-45" />
        </div>
        <div>
          <div className="text-xs text-blue-400 font-bold uppercase tracking-wider">
            In 450 meters
          </div>
          <div className="text-base font-bold text-white">
            Turn Right on Kepler Pkwy
          </div>
          <div className="text-xs text-slate-400">
            Follow signs for Interstate 101 North
          </div>
        </div>
      </div>

      {/* Bottom Floating Destinations & Trip Bar */}
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between z-20">
        {/* Quick Destination Chips */}
        <div className="flex items-center space-x-2">
          {sampleDestinations.map((dest, i) => (
            <button
              key={i}
              onClick={() => {
                CarAudioManager.triggerNavigationPrompt(
                  `Rerouting to ${dest.name}. Route distance ${dest.distance}.`
                );
              }}
              className="bg-slate-900/90 backdrop-blur-md hover:bg-slate-800 border border-slate-700/80 px-4 py-2 rounded-2xl text-left shadow-xl transition"
            >
              <div className="text-xs font-bold text-white">{dest.name}</div>
              <div className="text-[11px] text-slate-400">
                {dest.distance} • {dest.time}
              </div>
            </button>
          ))}
        </div>

        {/* Trip Overview Pill */}
        <div className="bg-slate-950/90 backdrop-blur-md border border-slate-700/80 px-5 py-2.5 rounded-2xl flex items-center space-x-4 shadow-xl">
          <div className="text-emerald-400 font-bold text-sm">18 min</div>
          <div className="text-slate-300 font-medium text-xs">14.2 km</div>
          <div className="text-slate-400 text-xs">ETA 09:42 PM</div>
          <button
            onClick={() =>
              CarAudioManager.triggerNavigationPrompt(
                'Continue on Kepler Freeway for 12 kilometers.'
              )
            }
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow transition"
          >
            Voice Test
          </button>
        </div>
      </div>
    </div>
  );
};
