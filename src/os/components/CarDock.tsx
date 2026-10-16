import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Navigation,
  Radio,
  Phone,
  Fan,
  Smartphone,
  Settings,
  Grid,
} from 'lucide-react';
import { DisplayManager } from '../kernel/DisplayManager';
import { DisplayLayoutMode } from '../types/android';
import { AudioSynth } from '../sounds/AudioSynth';

export const CarDock: React.FC = () => {
  const [activeMode, setActiveMode] = useState<DisplayLayoutMode>(DisplayManager.getLayoutMode());

  useEffect(() => {
    return DisplayManager.subscribe(setActiveMode);
  }, []);

  const navItems = [
    {
      id: 'SPLIT_DASHBOARD' as DisplayLayoutMode,
      icon: LayoutDashboard,
      label: 'Home',
    },
    {
      id: 'FULLSCREEN_MAP' as DisplayLayoutMode,
      icon: Navigation,
      label: 'Nav',
    },
    {
      id: 'FULLSCREEN_MEDIA' as DisplayLayoutMode,
      icon: Radio,
      label: 'Music',
    },
    {
      id: 'FULLSCREEN_DIALER' as DisplayLayoutMode,
      icon: Phone,
      label: 'Phone',
    },
    {
      id: 'FULLSCREEN_HVAC' as DisplayLayoutMode,
      icon: Fan,
      label: 'Climate',
    },
    {
      id: 'PROJECTION_MODE' as DisplayLayoutMode,
      icon: Smartphone,
      label: 'AutoLink',
    },
    {
      id: 'APP_DRAWER' as DisplayLayoutMode,
      icon: Grid,
      label: 'Apps',
    },
    {
      id: 'FULLSCREEN_SETTINGS' as DisplayLayoutMode,
      icon: Settings,
      label: 'Setup',
    },
  ];

  return (
    <aside className="w-20 bg-slate-950 border-r border-slate-800/80 flex flex-col items-center py-4 justify-between z-20 select-none shadow-xl">
      <div className="flex flex-col items-center space-y-3 w-full px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeMode === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                AudioSynth.playTouchFeedback();
                DisplayManager.setLayoutMode(item.id);
              }}
              className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center transition-all duration-150 relative group ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-bold scale-105'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900'
              }`}
              title={item.label}
            >
              {isActive && (
                <div className="absolute -left-2 w-1.5 h-7 bg-blue-400 rounded-r-full" />
              )}
              <Icon size={22} className={isActive ? 'text-white' : 'group-hover:scale-110 transition-transform'} />
              <span className="text-[10px] mt-1 font-medium tracking-tight">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Brand logo at bottom */}
      <div className="flex flex-col items-center justify-center text-center opacity-60 hover:opacity-100 transition">
        <div className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center text-blue-400 font-extrabold text-xs">
          K
        </div>
        <span className="text-[9px] text-slate-500 font-mono mt-1 font-semibold uppercase">
          AutoOS
        </span>
      </div>
    </aside>
  );
};
