import React, { useState, useEffect } from 'react';
import {
  Wifi,
  Signal,
  Bluetooth,
  BatteryCharging,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  User,
} from 'lucide-react';
import { VHAL } from '../kernel/VHAL';
import { CarAudioManager } from '../kernel/CarAudioManager';
import { VHALState } from '../types/android';

export const CarStatusBar: React.FC = () => {
  const [time, setTime] = useState<string>('');
  const [vhalState, setVhalState] = useState<VHALState>(VHAL.getState());
  const [showVolumePopup, setShowVolumePopup] = useState<boolean>(false);
  const [audioState, setAudioState] = useState(CarAudioManager.getState());

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      );
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);

    const unsubVhal = VHAL.subscribe(setVhalState);
    const unsubAudio = CarAudioManager.subscribe(() => {
      setAudioState(CarAudioManager.getState());
    });

    return () => {
      clearInterval(timer);
      unsubVhal();
      unsubAudio();
    };
  }, []);

  return (
    <header className="h-12 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-4 flex items-center justify-between z-30 select-none">
      {/* Left: Driver Profile & Time */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 bg-slate-900/90 px-2.5 py-1 rounded-full border border-slate-700/60">
          <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white">
            <User size={12} />
          </div>
          <span className="text-xs font-medium text-slate-200">Pilot 1</span>
        </div>
        <span className="text-base font-bold text-white tracking-wide">{time}</span>
        <span className="text-xs text-slate-400 font-medium">
          {vhalState.outdoorTemp}°C Outside
        </span>
      </div>

      {/* Center: Active Vehicle Alerts / Status */}
      <div className="flex items-center space-x-3">
        {vhalState.parkingBrake && (
          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-red-950/80 text-red-400 border border-red-800/60 uppercase tracking-wider">
            PARK BRAKE
          </span>
        )}
        {vhalState.gear === 'R' && (
          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-950/80 text-amber-400 border border-amber-800/60 uppercase tracking-wider animate-pulse">
            REVERSE GEAR
          </span>
        )}
      </div>

      {/* Right: Connectivity, Volume & Theme */}
      <div className="flex items-center space-x-4">
        {/* Volume button & popup */}
        <div className="relative">
          <button
            onClick={() => setShowVolumePopup(!showVolumePopup)}
            className="flex items-center space-x-1.5 text-slate-300 hover:text-white transition px-2 py-1 rounded-lg hover:bg-slate-800"
          >
            {audioState.volume === 0 ? <VolumeX size={17} /> : <Volume2 size={17} />}
            <span className="text-xs font-semibold">{audioState.volume}%</span>
          </button>

          {showVolumePopup && (
            <div className="absolute right-0 top-10 bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-2xl flex flex-col space-y-2 w-48 z-50">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Audio Volume</span>
                <span>{audioState.volume}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={audioState.volume}
                onChange={(e) => CarAudioManager.setVolume(Number(e.target.value))}
                className="accent-blue-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
              />
            </div>
          )}
        </div>

        {/* Night / Day indicator */}
        <div className="text-slate-400">
          {vhalState.nightMode ? (
            <Moon size={16} className="text-blue-400" />
          ) : (
            <Sun size={16} className="text-amber-400" />
          )}
        </div>

        {/* Radio & Phone connectivity */}
        <div className="flex items-center space-x-2.5 text-slate-300 text-xs">
          <Bluetooth size={16} className="text-blue-400" />
          <Wifi size={16} className="text-emerald-400" />
          <div className="flex items-center space-x-1">
            <Signal size={15} className="text-blue-400" />
            <span className="font-semibold text-[11px]">5G</span>
          </div>
          <div className="flex items-center space-x-1 text-slate-300">
            <BatteryCharging size={16} className="text-emerald-400" />
            <span className="font-semibold text-[11px]">{vhalState.batteryLevel}%</span>
          </div>
        </div>
      </div>
    </header>
  );
};
