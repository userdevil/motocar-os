import React from 'react';
import {
  LayoutDashboard,
  Navigation,
  Radio,
  Phone,
  Fan,
  Smartphone,
  Settings,
  Terminal,
} from 'lucide-react';
import { AppManager } from '../kernel/AppManager';
import { AppPackageId } from '../types/android';
import { AudioSynth } from '../sounds/AudioSynth';

export const AppDrawerApp: React.FC = () => {
  const apps = [
    {
      id: 'com.autodroid.dashboard' as AppPackageId,
      name: 'Dashboard Home',
      desc: 'Split-screen navigation & gauges',
      icon: LayoutDashboard,
      color: 'bg-blue-600',
    },
    {
      id: 'com.autodroid.maps' as AppPackageId,
      name: 'Kepler Navigation',
      desc: 'GPS routing and turn-by-turn guidance',
      icon: Navigation,
      color: 'bg-emerald-600',
    },
    {
      id: 'com.autodroid.media' as AppPackageId,
      name: 'Media & FM Radio',
      desc: 'High-definition music and radio tuner',
      icon: Radio,
      color: 'bg-purple-600',
    },
    {
      id: 'com.autodroid.dialer' as AppPackageId,
      name: 'Phone & Contacts',
      desc: 'Driving-safe hands-free dialpad',
      icon: Phone,
      color: 'bg-green-600',
    },
    {
      id: 'com.autodroid.hvac' as AppPackageId,
      name: 'Climate Controls',
      desc: 'Dual-zone HVAC and seat heating',
      icon: Fan,
      color: 'bg-cyan-600',
    },
    {
      id: 'com.autodroid.carlink' as AppPackageId,
      name: 'Android Auto Link',
      desc: 'Phone screen projection receiver',
      icon: Smartphone,
      color: 'bg-indigo-600',
    },
    {
      id: 'com.autodroid.settings' as AppPackageId,
      name: 'Vehicle Settings',
      desc: 'TPMS, display and audio options',
      icon: Settings,
      color: 'bg-slate-700',
    },
  ];

  return (
    <div className="w-full h-full p-8 bg-slate-950 flex flex-col justify-between overflow-y-auto select-none">
      <div className="border-b border-slate-800 pb-4 mb-6">
        <h2 className="text-2xl font-black text-white">
          Installed Automotive Applications
        </h2>
        <p className="text-xs text-slate-400">
          Android Automotive OS Application Registry (Sandboxed Activities)
        </p>
      </div>

      <div className="grid grid-cols-4 gap-6 my-auto">
        {apps.map((app) => {
          const Icon = app.icon;
          return (
            <button
              key={app.id}
              onClick={() => {
                AudioSynth.playTouchFeedback();
                AppManager.launchApp(app.id);
              }}
              className="bg-slate-900/80 hover:bg-slate-800 border border-slate-800/80 p-5 rounded-3xl flex flex-col items-center text-center transition-all duration-150 active:scale-95 shadow-xl group"
            >
              <div
                className={`w-16 h-16 rounded-2xl ${app.color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform mb-3`}
              >
                <Icon size={30} />
              </div>
              <h3 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                {app.name}
              </h3>
              <p className="text-[11px] text-slate-400 mt-1 leading-tight line-clamp-2">
                {app.desc}
              </p>
            </button>
          );
        })}
      </div>

      <div className="border-t border-slate-800/80 pt-4 text-center text-xs text-slate-500">
        Google Play Services for Automotive • Certified Driver Distraction Compliant
      </div>
    </div>
  );
};
