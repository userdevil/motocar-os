import React, { useState } from 'react';
import { HeadUnitShell } from './os/HeadUnitShell';
import { Tablet, Monitor, Info, Sparkles, X } from 'lucide-react';

export const App: React.FC = () => {
  const [deviceFrame, setDeviceFrame] = useState<'HEADUNIT' | 'TABLET_MOUNT'>('HEADUNIT');
  const [showArchInfo, setShowArchInfo] = useState<boolean>(false);

  return (
    <div className="w-screen h-screen bg-black flex flex-col items-center justify-center overflow-hidden">
      {/* Top Device Form-Factor Switcher (Subtle floating pills) */}
      <div className="absolute top-2 right-4 z-50 flex items-center space-x-2 bg-slate-900/90 backdrop-blur-md px-3 py-1 rounded-full border border-slate-700/80 shadow-2xl text-xs">
        <button
          onClick={() => setShowArchInfo(true)}
          className="flex items-center space-x-1 text-blue-400 hover:text-blue-300 font-semibold px-2 py-0.5 rounded-full hover:bg-slate-800 transition"
        >
          <Info size={14} />
          <span>Android Auto Architecture</span>
        </button>

        <div className="w-px h-3 bg-slate-700" />

        <button
          onClick={() => setDeviceFrame('HEADUNIT')}
          className={`flex items-center space-x-1 px-2.5 py-0.5 rounded-full font-semibold transition ${
            deviceFrame === 'HEADUNIT'
              ? 'bg-blue-600 text-white shadow'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Monitor size={13} />
          <span>In-Dash Widescreen</span>
        </button>

        <button
          onClick={() => setDeviceFrame('TABLET_MOUNT')}
          className={`flex items-center space-x-1 px-2.5 py-0.5 rounded-full font-semibold transition ${
            deviceFrame === 'TABLET_MOUNT'
              ? 'bg-blue-600 text-white shadow'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Tablet size={13} />
          <span>Mobile Phone Mount</span>
        </button>
      </div>

      {/* Main Operating System Display */}
      {deviceFrame === 'HEADUNIT' ? (
        /* Native Widescreen Car Headunit Display */
        <div className="w-full h-full">
          <HeadUnitShell />
        </div>
      ) : (
        /* Mobile Phone / Tablet Vehicle Mount Frame */
        <div className="w-[96vw] h-[92vh] max-w-6xl max-h-[720px] rounded-[36px] bg-slate-900 p-3 shadow-[0_0_60px_rgba(30,58,138,0.35)] border-4 border-slate-700/80 relative flex flex-col">
          {/* Tablet Front Camera Notch */}
          <div className="absolute top-1 left-1/2 -translate-x-1/2 w-14 h-3 bg-slate-950 rounded-b-xl flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-slate-800 border border-slate-700" />
          </div>

          <div className="w-full h-full rounded-[26px] overflow-hidden border border-slate-800">
            <HeadUnitShell />
          </div>
        </div>
      )}

      {/* Architectural Deep-Dive Modal */}
      {showArchInfo && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-6 select-none">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-3xl w-full p-6 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center space-x-2">
                <Sparkles size={20} className="text-blue-400" />
                <h3 className="text-lg font-bold text-white">
                  How Android Auto Works: The Architecture Behind AutoDroid OS
                </h3>
              </div>
              <button
                onClick={() => setShowArchInfo(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <h4 className="font-bold text-blue-400 text-sm mb-1">
                  1. Android Auto (Projection) vs Android Automotive (AAOS)
                </h4>
                <p>
                  • <strong>Android Auto (Projection)</strong>: The phone runs the apps and acts as a broadcaster. The vehicle head unit is a dumb terminal receiving an H.264 video stream while sending back touch and sensor inputs.
                  <br />
                  • <strong>AutoDroid OS (This System)</strong>: Operates as an independent automotive OS on the mobile phone, equipped with its own Vehicle Hardware Abstraction Layer (VHAL), split-screen launcher, and an <strong>AAP Sink Receiver</strong> capable of receiving phone projections.
                </p>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <h4 className="font-bold text-emerald-400 text-sm mb-1">
                  2. Logical Channel Multiplexing (AAP Protocol)
                </h4>
                <p>
                  Android Auto multiplexes multiple real-time streams over a single TCP/TLS connection using 4-byte packet headers:
                  <br />• <strong>Channel 0 (Control)</strong>: Version handshake (1.6) and capabilities negotiation.
                  <br />• <strong>Channel 1 (Audio Stream)</strong>: High-definition 48kHz stereo media playback.
                  <br />• <strong>Channel 2 (Audio Speech)</strong>: Navigation guidance cues that automatically duck Channel 1 music.
                  <br />• <strong>Channel 4 (Input Events)</strong>: Touch coordinates and steering wheel buttons sent back to the phone.
                  <br />• <strong>Channel 5 (Video Stream)</strong>: Fragmented H.264 NAL units carrying 60fps virtual display frames.
                  <br />• <strong>Channel 6 (Sensors)</strong>: Car speedometer, GPS, and headlight day/night signals sent to the phone.
                </p>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <h4 className="font-bold text-purple-400 text-sm mb-1">
                  3. Built-in Interactive Demonstration
                </h4>
                <p>
                  • Use the <strong>Gas & Brake</strong> controls to test speedometer and RPM physics.
                  <br />• Shift to <strong>R (Reverse)</strong> to experience instant automated switching to the <strong>Reverse Camera with dynamic guide lines</strong>.
                  <br />• Toggle <strong>Lights (Night Mode)</strong> to see the entire OS UI adapt between daytime high-contrast and nighttime mode.
                  <br />• Click <strong>&quot;Connect Phone AAP&quot;</strong> and open the <strong>REA Protocol Inspector</strong> to observe real-time AAP packets!
                </p>
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setShowArchInfo(false)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2 rounded-xl text-xs transition"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
