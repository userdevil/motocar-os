import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Cast,
  CheckCircle2,
  RefreshCw,
  Power,
  Layers,
  Activity,
  Maximize2,
} from 'lucide-react';
import { AAPReceiver } from '../protocol/AAPReceiver';
import { AAPConnectionState } from '../protocol/AAPTypes';
import { ProtocolInspector } from '../components/ProtocolInspector';

export const CarLinkApp: React.FC = () => {
  const [aapState, setAapState] = useState(AAPReceiver.getState());
  const [activeTab, setActiveTab] = useState<'PROJECTED_SCREEN' | 'INSPECTOR'>('PROJECTED_SCREEN');

  useEffect(() => {
    return AAPReceiver.subscribe(() => {
      setAapState(AAPReceiver.getState());
    });
  }, []);

  const handleScreenTouch = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 1920);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 1080);
    AAPReceiver.sendInputEvent(x, y, 'DOWN');
  };

  return (
    <div className="w-full h-full p-6 bg-slate-950 flex flex-col justify-between overflow-hidden select-none">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-600/20 border border-blue-500 flex items-center justify-center text-blue-400">
            <Cast size={20} />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <span>Android Auto Link (AAP Receiver)</span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                  aapState.connectionState === AAPConnectionState.STREAMING
                    ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                    : 'bg-amber-950 text-amber-400 border-amber-800'
                }`}
              >
                {aapState.connectionState}
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Sink Protocol: H.264 1920x1080@60fps • 48kHz Stereo Audio • Touch Digitizer Return
            </p>
          </div>
        </div>

        {/* View Toggle (Screen vs Protocol Inspector) */}
        <div className="flex items-center space-x-3">
          <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-2xl">
            <button
              onClick={() => setActiveTab('PROJECTED_SCREEN')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'PROJECTED_SCREEN'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Projected Display
            </button>
            <button
              onClick={() => setActiveTab('INSPECTOR')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'INSPECTOR'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              REA Protocol Inspector
            </button>
          </div>

          <button
            onClick={() => {
              if (aapState.connectionState === AAPConnectionState.DISCONNECTED) {
                AAPReceiver.connect();
              } else {
                AAPReceiver.disconnect();
              }
            }}
            className={`px-4 py-2 rounded-2xl text-xs font-bold flex items-center space-x-1.5 transition ${
              aapState.connectionState === AAPConnectionState.STREAMING
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            <Power size={14} />
            <span>
              {aapState.connectionState === AAPConnectionState.STREAMING
                ? 'Disconnect'
                : 'Start AutoLink'}
            </span>
          </button>
        </div>
      </div>

      {/* Main Area */}
      <div className="flex-1 my-4 overflow-hidden">
        {activeTab === 'INSPECTOR' ? (
          <ProtocolInspector />
        ) : (
          /* Projected Screen View */
          <div className="w-full h-full flex flex-col items-center justify-center">
            {aapState.connectionState === AAPConnectionState.STREAMING ? (
              <div
                onClick={handleScreenTouch}
                className="w-full h-full max-w-4xl bg-slate-900 border-2 border-blue-500/80 rounded-3xl overflow-hidden relative shadow-2xl cursor-crosshair group flex flex-col justify-between p-6"
              >
                {/* Simulated Android Auto Projection Interface */}
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
                      AA
                    </div>
                    <span className="text-sm font-bold text-white">
                      Google Android Auto
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 text-xs font-mono text-slate-400">
                    <span>Codec: H.264 NAL</span>
                    <span>FPS: {aapState.fps}</span>
                    <span>Frames: {aapState.frameCount}</span>
                  </div>
                </div>

                {/* Simulated Projected App (Google Maps on Android Auto) */}
                <div className="flex-1 my-4 bg-slate-950/80 rounded-2xl border border-slate-800 p-6 flex flex-col justify-between relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <div className="bg-blue-600/20 border border-blue-500/60 text-blue-300 px-4 py-2 rounded-2xl text-xs font-bold flex items-center space-x-2">
                      <Cast size={15} />
                      <span>STREAMING FROM PIXEL 9 PRO</span>
                    </div>
                    <span className="text-xs text-emerald-400 font-mono font-bold">
                      Latency: 12ms (Wi-Fi 5GHz)
                    </span>
                  </div>

                  <div className="text-center my-auto space-y-2">
                    <h3 className="text-2xl font-black text-white">
                      Android Auto Active Projection
                    </h3>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                      Touch anywhere inside this surface to transmit touch digitizer events
                      (Channel 4) back to the smartphone over the AAP protocol.
                    </p>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-800/80 pt-3 text-xs text-slate-400 font-mono">
                    <span>Virtual Display: 1920x1080 @ 160 DPI</span>
                    <span>Buffer: {(aapState.bytesReceived / 1024).toFixed(1)} KB</span>
                  </div>
                </div>

                {/* Bottom Auto Navigation Dock */}
                <div className="flex items-center justify-center space-x-8 pt-1 text-slate-400 text-xs">
                  <span className="hover:text-white cursor-pointer">Maps</span>
                  <span className="hover:text-white cursor-pointer">Spotify</span>
                  <span className="hover:text-white cursor-pointer">Phone</span>
                  <span className="hover:text-white cursor-pointer">Assistant</span>
                </div>
              </div>
            ) : (
              /* Disconnected Placeholder */
              <div className="flex flex-col items-center justify-center text-center space-y-4 max-w-md">
                <div className="w-20 h-20 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
                  <Smartphone size={36} />
                </div>
                <h3 className="text-xl font-bold text-white">
                  Waiting for Android Auto Connection
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Connect an Android smartphone via USB or Wi-Fi Direct. The head unit
                  will negotiate AAP protocol version 1.6 on TCP port 5277, negotiate SSL/TLS
                  encryption, and begin receiving the H.264 virtual display stream.
                </p>
                <button
                  onClick={() => AAPReceiver.connect()}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-6 py-3 rounded-2xl shadow-xl shadow-blue-600/30 transition active:scale-95"
                >
                  Simulate Phone Plug-In (USB AOA 2.0)
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
