import React, { useState, useEffect } from 'react';
import { AlertTriangle, Video, Eye, X } from 'lucide-react';
import { VHAL } from '../kernel/VHAL';
import { Gear } from '../types/android';
import { DisplayManager } from '../kernel/DisplayManager';

export const ReverseCamera: React.FC = () => {
  const [steeringAngle, setSteeringAngle] = useState<number>(0);
  const [distanceMeters, setDistanceMeters] = useState<number>(1.2);

  useEffect(() => {
    // Simulate gentle steering and distance decrease while reversing
    const interval = setInterval(() => {
      setSteeringAngle((prev) => Math.sin(Date.now() / 1500) * 18);
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-full bg-slate-950 flex flex-col justify-between overflow-hidden select-none">
      {/* Background Simulated Camera Feed (Rear bumper perspective) */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-950 opacity-90">
        {/* Subtle camera scanline & noise effect */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-black/60 pointer-events-none" />
        {/* Simulated pavement texture lines */}
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-slate-950 to-transparent border-t border-slate-700/30" />
      </div>

      {/* Top Warning Banner */}
      <div className="relative z-20 bg-red-600/90 text-white font-bold py-2 px-6 flex items-center justify-between text-xs tracking-wider uppercase shadow-lg">
        <div className="flex items-center space-x-2">
          <AlertTriangle size={18} className="animate-pulse" />
          <span>CHECK SURROUNDINGS FOR SAFETY</span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="bg-black/40 px-2.5 py-0.5 rounded text-[11px] font-mono">
            REAR-CAM: 1080p 60FPS
          </span>
          <button
            onClick={() => VHAL.setGear(Gear.PARK)}
            className="hover:bg-red-700 px-2 py-0.5 rounded flex items-center space-x-1"
          >
            <X size={14} />
            <span>Shift P</span>
          </button>
        </div>
      </div>

      {/* Dynamic Parking Trajectory Guide Lines Overlay */}
      <div className="relative z-10 flex-1 flex items-center justify-center">
        <svg
          className="w-full h-full max-w-2xl"
          viewBox="0 0 400 300"
          preserveAspectRatio="none"
        >
          {/* Static distance line: Green (3 meters) */}
          <line
            x1="80"
            y1="160"
            x2="320"
            y2="160"
            stroke="#10b981"
            strokeWidth="3"
            strokeDasharray="6 4"
          />
          <text x="330" y="164" fill="#10b981" fontSize="10" fontWeight="bold">
            3.0m
          </text>

          {/* Static distance line: Yellow (1.5 meters) */}
          <line
            x1="60"
            y1="220"
            x2="340"
            y2="220"
            stroke="#f59e0b"
            strokeWidth="3.5"
            strokeDasharray="8 4"
          />
          <text x="350" y="224" fill="#f59e0b" fontSize="10" fontWeight="bold">
            1.5m
          </text>

          {/* Critical distance line: Red (0.5 meter) */}
          <line
            x1="40"
            y1="270"
            x2="360"
            y2="270"
            stroke="#ef4444"
            strokeWidth="4"
          />
          <text x="365" y="274" fill="#ef4444" fontSize="10" fontWeight="bold">
            0.5m
          </text>

          {/* Dynamic Curvature Trajectory Guideline (Left Track) */}
          <path
            d={`M 110 290 Q ${130 + steeringAngle * 1.5} 200, ${150 + steeringAngle * 2.2} 120`}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Dynamic Curvature Trajectory Guideline (Right Track) */}
          <path
            d={`M 290 290 Q ${270 + steeringAngle * 1.5} 200, ${250 + steeringAngle * 2.2} 120`}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>

        {/* Ultrasonic Parking Sensor Radar Graphic (Top Right) */}
        <div className="absolute right-6 top-6 bg-slate-900/90 border border-slate-700/80 p-3 rounded-2xl flex flex-col items-center space-y-2 shadow-2xl">
          <span className="text-[10px] text-slate-400 font-bold uppercase">
            Ultrasonic Radar
          </span>
          <div className="w-16 h-20 bg-slate-950 border border-slate-800 rounded-lg relative flex items-center justify-center">
            {/* Vehicle silhouette */}
            <div className="w-8 h-12 bg-slate-800 rounded-md border border-slate-600 flex items-center justify-center text-[9px] font-bold text-slate-300">
              CAR
            </div>
            {/* Rear Radar Arcs */}
            <div className="absolute -bottom-2 w-12 h-3 rounded-full border-t-2 border-emerald-400 animate-ping opacity-75" />
            <div className="absolute -bottom-1 w-8 h-2 rounded-full border-t-2 border-amber-400" />
          </div>
          <span className="text-xs font-mono font-bold text-amber-400">
            {distanceMeters.toFixed(1)} m
          </span>
        </div>
      </div>

      {/* Bottom Camera Settings Bar */}
      <div className="relative z-20 bg-slate-950/90 border-t border-slate-800 px-6 py-2.5 flex items-center justify-between text-xs text-slate-300">
        <div className="flex items-center space-x-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold">ULTRAWIDE 180° REAR VIEW</span>
        </div>
        <div className="flex items-center space-x-4">
          <button className="bg-slate-800 hover:bg-slate-700 px-3 py-1 rounded-lg text-xs font-semibold">
            Trajectory: ON
          </button>
          <button className="bg-slate-800 hover:bg-slate-700 px-3 py-1 rounded-lg text-xs font-semibold">
            Night Vision: AUTO
          </button>
        </div>
      </div>
    </div>
  );
};
