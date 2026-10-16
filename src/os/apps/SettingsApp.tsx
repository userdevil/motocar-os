import React, { useState, useEffect } from 'react';
import {
  Settings,
  Sliders,
  Sun,
  Volume2,
  Shield,
  Info,
  Car,
  Wifi,
  Gauge,
} from 'lucide-react';
import { VHAL } from '../kernel/VHAL';
import { VHALState } from '../types/android';
import { DisplayManager } from '../kernel/DisplayManager';

export const SettingsApp: React.FC = () => {
  const [vhal, setVhal] = useState<VHALState>(VHAL.getState());
  const [brightness, setBrightness] = useState<number>(DisplayManager.getBrightness());
  const [bass, setBass] = useState<number>(4);
  const [mid, setMid] = useState<number>(1);
  const [treble, setTreble] = useState<number>(3);

  useEffect(() => {
    return VHAL.subscribe(setVhal);
  }, []);

  return (
    <div className="w-full h-full p-6 bg-slate-950 flex flex-col justify-between overflow-y-auto select-none">
      {/* Top Header */}
      <div className="border-b border-slate-800 pb-4 mb-4">
        <h2 className="text-xl font-black text-white flex items-center space-x-2">
          <Settings size={22} className="text-blue-500" />
          <span>Vehicle & AutoDroid System Settings</span>
        </h2>
        <p className="text-xs text-slate-400">
          Hardware Abstraction Layer (VHAL), Display Compositor, and Automotive Diagnostics
        </p>
      </div>

      <div className="grid grid-cols-12 gap-6 my-auto">
        {/* 1. Tire Pressure Monitoring System (TPMS) */}
        <div className="col-span-6 bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-2xl">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-3 mb-4">
            <Gauge size={18} className="text-blue-400" />
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Tire Pressure (TPMS)
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-center">
              <span className="text-[10px] text-slate-500 font-bold block uppercase">
                Front Left
              </span>
              <span className="text-2xl font-black text-white font-mono">
                {vhal.tires.fl.toFixed(1)}
              </span>
              <span className="text-[10px] text-emerald-400 font-bold block">
                PSI • Normal
              </span>
            </div>
            <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-center">
              <span className="text-[10px] text-slate-500 font-bold block uppercase">
                Front Right
              </span>
              <span className="text-2xl font-black text-white font-mono">
                {vhal.tires.fr.toFixed(1)}
              </span>
              <span className="text-[10px] text-emerald-400 font-bold block">
                PSI • Normal
              </span>
            </div>
            <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-center">
              <span className="text-[10px] text-slate-500 font-bold block uppercase">
                Rear Left
              </span>
              <span className="text-2xl font-black text-white font-mono">
                {vhal.tires.rl.toFixed(1)}
              </span>
              <span className="text-[10px] text-emerald-400 font-bold block">
                PSI • Normal
              </span>
            </div>
            <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-center">
              <span className="text-[10px] text-slate-500 font-bold block uppercase">
                Rear Right
              </span>
              <span className="text-2xl font-black text-white font-mono">
                {vhal.tires.rr.toFixed(1)}
              </span>
              <span className="text-[10px] text-emerald-400 font-bold block">
                PSI • Normal
              </span>
            </div>
          </div>
        </div>

        {/* 2. Display & Night Mode Settings */}
        <div className="col-span-6 bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-2xl flex flex-col justify-between">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-3 mb-4">
            <Sun size={18} className="text-amber-400" />
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Display & Illumination
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs text-slate-300 font-semibold mb-1">
                <span>Screen Brightness</span>
                <span>{brightness}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={brightness}
                onChange={(e) => {
                  const b = Number(e.target.value);
                  setBrightness(b);
                  DisplayManager.setBrightness(b);
                }}
                className="w-full accent-blue-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-950 rounded-2xl border border-slate-800">
              <div>
                <div className="text-xs font-bold text-white">
                  Headlight Sync Night Mode
                </div>
                <div className="text-[10px] text-slate-400">
                  Switches map and OS themes automatically with CAN headlights
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-400">ENABLED</span>
            </div>
          </div>

          {/* About Android Automotive OS Build */}
          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <span>OS: Android Automotive 14 (Kepler-Auto)</span>
            <span>Kernel: Linux 6.1.0-aaos-arm64</span>
          </div>
        </div>
      </div>
    </div>
  );
};
