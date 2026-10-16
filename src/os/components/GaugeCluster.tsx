import React, { useState, useEffect } from 'react';
import { VHAL } from '../kernel/VHAL';
import { VHALState, TurnSignalState } from '../types/android';
import { ArrowLeft, ArrowRight, Zap, Fuel, AlertTriangle } from 'lucide-react';

export const GaugeCluster: React.FC = () => {
  const [vhal, setVhal] = useState<VHALState>(VHAL.getState());
  const [blink, setBlink] = useState<boolean>(false);

  useEffect(() => {
    const unsub = VHAL.subscribe(setVhal);
    const blinkInterval = setInterval(() => {
      setBlink((prev) => !prev);
    }, 420);

    return () => {
      unsub();
      clearInterval(blinkInterval);
    };
  }, []);

  // Calculate needle angles (-120deg to +120deg)
  const speedRatio = Math.min(1, vhal.speed / 200);
  const speedAngle = -120 + speedRatio * 240;

  const rpmRatio = Math.min(1, vhal.rpm / 7000);
  const rpmAngle = -120 + rpmRatio * 240;

  const showLeftBlinker =
    (vhal.turnSignal === TurnSignalState.LEFT ||
      vhal.turnSignal === TurnSignalState.HAZARD) &&
    blink;
  const showRightBlinker =
    (vhal.turnSignal === TurnSignalState.RIGHT ||
      vhal.turnSignal === TurnSignalState.HAZARD) &&
    blink;

  return (
    <div className="bg-slate-900/95 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between shadow-2xl relative overflow-hidden select-none">
      {/* Background radial gradient */}
      <div className="absolute inset-0 bg-radial-gradient from-blue-950/20 via-transparent to-transparent pointer-events-none" />

      {/* Top Bar: Turn Signals & Gear Selector */}
      <div className="flex items-center justify-between z-10">
        <div
          className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
            showLeftBlinker
              ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/50'
              : 'text-slate-700'
          }`}
        >
          <ArrowLeft size={20} className="stroke-[3]" />
        </div>

        {/* Transmission Gears (P, R, N, D) */}
        <div className="flex items-center space-x-3 bg-slate-950/80 px-4 py-1.5 rounded-2xl border border-slate-800/80 shadow-inner">
          {(['P', 'R', 'N', 'D'] as const).map((g) => {
            const isActive = vhal.gear === g;
            return (
              <span
                key={g}
                className={`text-sm font-extrabold transition-all px-2 py-0.5 rounded-lg ${
                  isActive
                    ? g === 'R'
                      ? 'bg-amber-500 text-slate-950 scale-110 shadow'
                      : 'bg-blue-600 text-white scale-110 shadow'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {g}
              </span>
            );
          })}
        </div>

        <div
          className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
            showRightBlinker
              ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/50'
              : 'text-slate-700'
          }`}
        >
          <ArrowRight size={20} className="stroke-[3]" />
        </div>
      </div>

      {/* Gauges Center: Speedometer & Tachometer */}
      <div className="grid grid-cols-2 gap-4 my-2 z-10">
        {/* Left: Speedometer Gauge */}
        <div className="flex flex-col items-center justify-center relative">
          <svg className="w-36 h-36" viewBox="0 0 100 100">
            {/* Background Arc */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#1e293b"
              strokeWidth="7"
              strokeDasharray="188"
              strokeDashoffset="47"
              strokeLinecap="round"
              transform="rotate(135 50 50)"
            />
            {/* Active Speed Arc */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="7"
              strokeDasharray="188"
              strokeDashoffset={188 - (speedRatio * 188)}
              strokeLinecap="round"
              transform="rotate(135 50 50)"
              className="transition-all duration-100 ease-out"
            />
            {/* Needle */}
            <line
              x1="50"
              y1="50"
              x2="50"
              y2="18"
              stroke="#60a5fa"
              strokeWidth="2.5"
              strokeLinecap="round"
              transform={`rotate(${speedAngle} 50 50)`}
              className="gauge-needle"
            />
            <circle cx="50" cy="50" r="4" fill="#3b82f6" />
          </svg>
          <div className="text-center -mt-6">
            <span className="text-3xl font-black text-white tracking-tight">
              {Math.round(vhal.speed)}
            </span>
            <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">
              km/h
            </span>
          </div>
        </div>

        {/* Right: Tachometer (RPM) Gauge */}
        <div className="flex flex-col items-center justify-center relative">
          <svg className="w-36 h-36" viewBox="0 0 100 100">
            {/* Background Arc */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#1e293b"
              strokeWidth="7"
              strokeDasharray="188"
              strokeDashoffset="47"
              strokeLinecap="round"
              transform="rotate(135 50 50)"
            />
            {/* Active RPM Arc (turns crimson near redline) */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke={vhal.rpm > 5500 ? '#ef4444' : '#10b981'}
              strokeWidth="7"
              strokeDasharray="188"
              strokeDashoffset={188 - (rpmRatio * 188)}
              strokeLinecap="round"
              transform="rotate(135 50 50)"
              className="transition-all duration-100 ease-out"
            />
            {/* Needle */}
            <line
              x1="50"
              y1="50"
              x2="50"
              y2="18"
              stroke={vhal.rpm > 5500 ? '#f87171' : '#34d399'}
              strokeWidth="2.5"
              strokeLinecap="round"
              transform={`rotate(${rpmAngle} 50 50)`}
              className="gauge-needle"
            />
            <circle cx="50" cy="50" r="4" fill={vhal.rpm > 5500 ? '#ef4444' : '#10b981'} />
          </svg>
          <div className="text-center -mt-6">
            <span className="text-2xl font-black text-white tracking-tight">
              {(vhal.rpm / 1000).toFixed(1)}
            </span>
            <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">
              RPM x1000
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Bar: Battery %, Fuel %, Odometer */}
      <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80 pt-3 z-10 font-medium">
        <div className="flex items-center space-x-1.5">
          <Fuel size={14} className="text-amber-400" />
          <span>{vhal.fuelLevel}% Fuel</span>
        </div>
        <div className="font-mono text-slate-300">
          {vhal.odometer.toFixed(1)} km
        </div>
        <div className="flex items-center space-x-1.5">
          <Zap size={14} className="text-emerald-400" />
          <span>{vhal.batteryLevel}% EV</span>
        </div>
      </div>
    </div>
  );
};
