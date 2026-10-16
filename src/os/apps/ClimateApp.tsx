import React, { useState, useEffect } from 'react';
import {
  Fan,
  Power,
  Flame,
  Wind,
  ShieldAlert,
  Snowflake,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { VHAL } from '../kernel/VHAL';
import { VHALState } from '../types/android';

export const ClimateApp: React.FC = () => {
  const [vhal, setVhal] = useState<VHALState>(VHAL.getState());

  useEffect(() => {
    return VHAL.subscribe(setVhal);
  }, []);

  const { hvac } = vhal;

  return (
    <div className="w-full h-full p-6 bg-slate-950 flex flex-col justify-between overflow-hidden select-none">
      {/* Top Controls Bar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => VHAL.toggleHvacPower()}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition ${
              hvac.power
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'bg-slate-900 text-slate-400'
            }`}
          >
            <Power size={16} />
            <span>Climate: {hvac.power ? 'ON' : 'OFF'}</span>
          </button>

          <button
            onClick={() => VHAL.toggleHvacAc()}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition ${
              hvac.ac
                ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30'
                : 'bg-slate-900 text-slate-400'
            }`}
          >
            <Snowflake size={16} />
            <span>A/C Compressor</span>
          </button>
        </div>

        <div className="text-xs text-slate-400">
          Cabin Air Quality: <span className="text-emerald-400 font-bold">EXCELLENT (AQI 12)</span>
        </div>
      </div>

      {/* Main Temperature Section (Dual Zone: Driver & Passenger) */}
      <div className="grid grid-cols-12 gap-8 my-auto items-center">
        {/* Driver Zone */}
        <div className="col-span-5 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 flex flex-col items-center justify-between shadow-2xl">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Driver Zone
          </span>

          <div className="flex items-center space-x-6 my-4">
            <button
              onClick={() => VHAL.setHvacDriverTemp(-0.5)}
              className="w-14 h-14 rounded-2xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-blue-400 font-bold active:scale-95 transition"
            >
              <ChevronDown size={28} />
            </button>
            <div className="text-center">
              <span className="text-6xl font-black text-white tracking-tight">
                {hvac.driverTemp.toFixed(1)}
              </span>
              <span className="text-lg font-bold text-slate-400 block -mt-1">
                °C
              </span>
            </div>
            <button
              onClick={() => VHAL.setHvacDriverTemp(0.5)}
              className="w-14 h-14 rounded-2xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-red-400 font-bold active:scale-95 transition"
            >
              <ChevronUp size={28} />
            </button>
          </div>

          <button
            onClick={() => VHAL.cycleSeatWarmer(true)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold border transition ${
              hvac.seatWarmerDriver > 0
                ? 'bg-amber-600/30 border-amber-500 text-amber-300'
                : 'bg-slate-950 border-slate-800 text-slate-400'
            }`}
          >
            <Flame size={15} />
            <span>Seat Warmer: Level {hvac.seatWarmerDriver}</span>
          </button>
        </div>

        {/* Center Fan Speed Controller */}
        <div className="col-span-2 flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-blue-600/20 border border-blue-500 flex items-center justify-center text-blue-400 shadow-xl">
            <Fan size={32} className={hvac.power ? 'animate-spin' : ''} />
          </div>
          <span className="text-xs font-bold text-slate-300 uppercase">
            Fan Speed: {hvac.fanSpeed}
          </span>
          <div className="flex flex-col space-y-1 w-full px-2">
            {[7, 6, 5, 4, 3, 2, 1].map((lvl) => (
              <button
                key={lvl}
                onClick={() => VHAL.setHvacFanSpeed(lvl)}
                className={`h-3 rounded-full transition-all ${
                  hvac.fanSpeed >= lvl
                    ? 'bg-blue-500 shadow-sm shadow-blue-500/50'
                    : 'bg-slate-800 hover:bg-slate-700'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Passenger Zone */}
        <div className="col-span-5 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 flex flex-col items-center justify-between shadow-2xl">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Passenger Zone
          </span>

          <div className="flex items-center space-x-6 my-4">
            <button
              onClick={() => VHAL.setHvacPassengerTemp(-0.5)}
              className="w-14 h-14 rounded-2xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-blue-400 font-bold active:scale-95 transition"
            >
              <ChevronDown size={28} />
            </button>
            <div className="text-center">
              <span className="text-6xl font-black text-white tracking-tight">
                {hvac.passengerTemp.toFixed(1)}
              </span>
              <span className="text-lg font-bold text-slate-400 block -mt-1">
                °C
              </span>
            </div>
            <button
              onClick={() => VHAL.setHvacPassengerTemp(0.5)}
              className="w-14 h-14 rounded-2xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-red-400 font-bold active:scale-95 transition"
            >
              <ChevronUp size={28} />
            </button>
          </div>

          <button
            onClick={() => VHAL.cycleSeatWarmer(false)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold border transition ${
              hvac.seatWarmerPassenger > 0
                ? 'bg-amber-600/30 border-amber-500 text-amber-300'
                : 'bg-slate-950 border-slate-800 text-slate-400'
            }`}
          >
            <Flame size={15} />
            <span>Seat Warmer: Level {hvac.seatWarmerPassenger}</span>
          </button>
        </div>
      </div>

      {/* Bottom Mode Presets */}
      <div className="border-t border-slate-800 pt-4 flex items-center justify-center space-x-4">
        <button className="bg-slate-900 hover:bg-slate-800 border border-slate-800 px-6 py-2.5 rounded-2xl text-xs font-bold text-slate-200 transition">
          Windshield Defrost
        </button>
        <button className="bg-slate-900 hover:bg-slate-800 border border-slate-800 px-6 py-2.5 rounded-2xl text-xs font-bold text-slate-200 transition">
          Rear Window Defrost
        </button>
        <button className="bg-blue-600 text-white px-6 py-2.5 rounded-2xl text-xs font-bold shadow-lg transition">
          Auto Recirculation
        </button>
      </div>
    </div>
  );
};
