import React, { useState, useEffect } from 'react';
import {
  Car,
  Disc,
  Lightbulb,
  Mic,
  Volume2,
  Volume1,
  SkipForward,
  SkipBack,
  PhoneCall,
  Power,
  Flame,
} from 'lucide-react';
import { VHAL } from '../kernel/VHAL';
import { Gear, HeadlightState, TurnSignalState, VHALState } from '../types/android';
import { CarAudioManager } from '../kernel/CarAudioManager';
import { AAPReceiver } from '../protocol/AAPReceiver';
import { AAPConnectionState } from '../protocol/AAPTypes';

export const VehicleHardwareBar: React.FC = () => {
  const [vhal, setVhal] = useState<VHALState>(VHAL.getState());
  const [throttle, setThrottle] = useState<number>(0);
  const [aapState, setAapState] = useState(AAPReceiver.getState());

  useEffect(() => {
    const unsubVhal = VHAL.subscribe(setVhal);
    const unsubAap = AAPReceiver.subscribe(() => {
      setAapState(AAPReceiver.getState());
    });
    return () => {
      unsubVhal();
      unsubAap();
    };
  }, []);

  const handleThrottleChange = (val: number) => {
    setThrottle(val);
    VHAL.setThrottle(val);
  };

  return (
    <div className="bg-slate-950 border-t border-slate-800/80 px-4 py-2.5 flex items-center justify-between text-xs z-30 select-none shadow-2xl">
      {/* 1. Vehicle Powertrain Controls (Gas, Brake, Shifter) */}
      <div className="flex items-center space-x-4">
        {/* Gear Shifter Buttons */}
        <div className="flex items-center space-x-1 bg-slate-900 border border-slate-700/80 p-1 rounded-xl">
          {(['P', 'R', 'N', 'D'] as const).map((g) => (
            <button
              key={g}
              onClick={() => VHAL.setGear(g as Gear)}
              className={`w-8 h-8 rounded-lg font-bold text-xs transition-all ${
                vhal.gear === g
                  ? g === 'R'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {g}
            </button>
          ))}
        </div>

        {/* Throttle Accelerator Slider */}
        <div className="flex items-center space-x-2 bg-slate-900 border border-slate-700/80 px-3 py-1.5 rounded-xl">
          <Flame size={15} className={throttle > 0 ? 'text-amber-500' : 'text-slate-500'} />
          <span className="text-[11px] font-semibold text-slate-300 w-16">
            Gas: {throttle}%
          </span>
          <input
            type="range"
            min="0"
            max="100"
            value={throttle}
            onChange={(e) => handleThrottleChange(Number(e.target.value))}
            className="w-24 accent-amber-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
          />
        </div>

        {/* Brake Pedal Button */}
        <button
          onMouseDown={() => {
            VHAL.setBraking(true);
            handleThrottleChange(0);
          }}
          onMouseUp={() => VHAL.setBraking(false)}
          className="bg-red-950/80 hover:bg-red-900 border border-red-700/80 text-red-300 font-bold px-3 py-1.5 rounded-xl text-xs active:scale-95 transition"
        >
          BRAKE
        </button>
      </div>

      {/* 2. Headlights & Turn Signal Relays */}
      <div className="flex items-center space-x-3">
        {/* Headlights toggle */}
        <button
          onClick={() => {
            const nextMode =
              vhal.headlightState === HeadlightState.OFF
                ? HeadlightState.ON
                : HeadlightState.OFF;
            VHAL.setHeadlights(nextMode);
          }}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition ${
            vhal.headlightState === HeadlightState.ON
              ? 'bg-blue-600/30 border-blue-500 text-blue-300'
              : 'bg-slate-900 border-slate-700 text-slate-400'
          }`}
        >
          <Lightbulb size={14} />
          <span>Lights: {vhal.headlightState === HeadlightState.ON ? 'ON (Night)' : 'OFF (Day)'}</span>
        </button>

        {/* Turn Signal Buttons */}
        <div className="flex items-center space-x-1 bg-slate-900 border border-slate-700/80 p-1 rounded-xl">
          <button
            onClick={() => VHAL.setTurnSignal(TurnSignalState.LEFT)}
            className={`px-2 py-1 rounded text-xs font-bold ${
              vhal.turnSignal === TurnSignalState.LEFT
                ? 'bg-emerald-600 text-white'
                : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            ◀ Left
          </button>
          <button
            onClick={() => VHAL.setTurnSignal(TurnSignalState.HAZARD)}
            className={`px-2 py-1 rounded text-xs font-bold ${
              vhal.turnSignal === TurnSignalState.HAZARD
                ? 'bg-amber-600 text-white animate-pulse'
                : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            Hazard
          </button>
          <button
            onClick={() => VHAL.setTurnSignal(TurnSignalState.RIGHT)}
            className={`px-2 py-1 rounded text-xs font-bold ${
              vhal.turnSignal === TurnSignalState.RIGHT
                ? 'bg-emerald-600 text-white'
                : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            Right ▶
          </button>
        </div>
      </div>

      {/* 3. Steering Wheel Controls */}
      <div className="flex items-center space-x-2 bg-slate-900 border border-slate-700/80 px-2 py-1 rounded-xl">
        <span className="text-[10px] text-slate-400 font-bold uppercase mr-1">
          Steering:
        </span>
        <button
          onClick={() => CarAudioManager.setVolume(CarAudioManager.getState().volume + 5)}
          className="p-1.5 hover:bg-slate-800 rounded text-slate-300"
          title="Volume Up"
        >
          <Volume2 size={14} />
        </button>
        <button
          onClick={() => CarAudioManager.setVolume(CarAudioManager.getState().volume - 5)}
          className="p-1.5 hover:bg-slate-800 rounded text-slate-300"
          title="Volume Down"
        >
          <Volume1 size={14} />
        </button>
        <button
          onClick={() => CarAudioManager.prevTrack()}
          className="p-1.5 hover:bg-slate-800 rounded text-slate-300"
          title="Previous Track"
        >
          <SkipBack size={14} />
        </button>
        <button
          onClick={() => CarAudioManager.nextTrack()}
          className="p-1.5 hover:bg-slate-800 rounded text-slate-300"
          title="Next Track"
        >
          <SkipForward size={14} />
        </button>
        <button
          onClick={() =>
            CarAudioManager.triggerNavigationPrompt(
              'In 300 meters, take exit 42 onto Kepler Freeway.'
            )
          }
          className="px-2 py-1 bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/60 rounded text-[11px] font-semibold text-blue-300 flex items-center space-x-1"
          title="Voice Command & Audio Ducking Test"
        >
          <Mic size={12} />
          <span>Nav Voice</span>
        </button>
      </div>

      {/* 4. Android Auto Link Cable / Wireless Toggle */}
      <div className="flex items-center space-x-2">
        <button
          onClick={() => {
            if (aapState.connectionState === AAPConnectionState.DISCONNECTED) {
              AAPReceiver.connect();
            } else {
              AAPReceiver.disconnect();
            }
          }}
          className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center space-x-1.5 transition ${
            aapState.connectionState === AAPConnectionState.STREAMING
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md'
              : aapState.connectionState === AAPConnectionState.CONNECTING ||
                aapState.connectionState === AAPConnectionState.HANDSHAKE ||
                aapState.connectionState === AAPConnectionState.AUTHENTICATING
              ? 'bg-amber-600 text-white animate-pulse'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
          }`}
        >
          <Power size={13} />
          <span>
            {aapState.connectionState === AAPConnectionState.STREAMING
              ? 'AutoLink: LIVE'
              : aapState.connectionState === AAPConnectionState.DISCONNECTED
              ? 'Connect Phone AAP'
              : 'Connecting AAP...'}
          </span>
        </button>
      </div>
    </div>
  );
};
