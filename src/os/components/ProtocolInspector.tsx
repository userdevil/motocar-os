import React, { useState, useEffect } from 'react';
import { Terminal, Shield, Zap, RefreshCw, Layers } from 'lucide-react';
import { AAPReceiver } from '../protocol/AAPReceiver';
import { AAPChannelId, AAPPacket } from '../protocol/AAPTypes';

export const ProtocolInspector: React.FC = () => {
  const [aapState, setAapState] = useState(AAPReceiver.getState());
  const [selectedChannel, setSelectedChannel] = useState<number | 'ALL'>('ALL');
  const [autoScroll, setAutoScroll] = useState<boolean>(true);

  useEffect(() => {
    return AAPReceiver.subscribe(() => {
      setAapState(AAPReceiver.getState());
    });
  }, []);

  const getChannelName = (id: AAPChannelId): string => {
    switch (id) {
      case AAPChannelId.CONTROL:
        return 'CH 0: Control & Handshake';
      case AAPChannelId.AUDIO_MEDIA:
        return 'CH 1: Media Audio (PCM)';
      case AAPChannelId.AUDIO_SPEECH:
        return 'CH 2: Nav Guidance Audio';
      case AAPChannelId.AUDIO_MIC:
        return 'CH 3: Microphone In';
      case AAPChannelId.INPUT:
        return 'CH 4: Touch & Key Input';
      case AAPChannelId.VIDEO:
        return 'CH 5: H.264 Video Stream';
      case AAPChannelId.SENSOR:
        return 'CH 6: CAN Bus Sensors';
      case AAPChannelId.BLUETOOTH:
        return 'CH 7: Bluetooth Pairing';
      default:
        return `CH ${id}`;
    }
  };

  const getChannelColor = (id: AAPChannelId): string => {
    switch (id) {
      case AAPChannelId.CONTROL:
        return 'text-amber-400 bg-amber-950/40 border-amber-800/60';
      case AAPChannelId.AUDIO_MEDIA:
      case AAPChannelId.AUDIO_SPEECH:
        return 'text-emerald-400 bg-emerald-950/40 border-emerald-800/60';
      case AAPChannelId.INPUT:
        return 'text-purple-400 bg-purple-950/40 border-purple-800/60';
      case AAPChannelId.VIDEO:
        return 'text-blue-400 bg-blue-950/40 border-blue-800/60';
      case AAPChannelId.SENSOR:
        return 'text-cyan-400 bg-cyan-950/40 border-cyan-800/60';
      default:
        return 'text-slate-400 bg-slate-800 border-slate-700';
    }
  };

  const filteredPackets =
    selectedChannel === 'ALL'
      ? aapState.packets
      : aapState.packets.filter((p) => p.channelId === selectedChannel);

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-3xl p-4 flex flex-col h-full shadow-2xl overflow-hidden font-mono text-xs select-none">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
        <div className="flex items-center space-x-2">
          <Terminal size={17} className="text-blue-400" />
          <span className="font-bold text-sm text-slate-100">
            REA Protocol Sniffer (AAP Link)
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-950 text-blue-300 border border-blue-800">
            {aapState.connectionState}
          </span>
        </div>

        {/* Stats */}
        <div className="flex items-center space-x-4 text-[11px] text-slate-400">
          <div>
            Pkts: <span className="text-white font-bold">{aapState.totalPackets}</span>
          </div>
          <div>
            Data: <span className="text-white font-bold">{(aapState.bytesReceived / 1024).toFixed(1)} KB</span>
          </div>
          <div>
            Stream: <span className="text-white font-bold">{aapState.fps} FPS</span>
          </div>
        </div>
      </div>

      {/* Channel Filter Chips */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-2 mb-2 text-[10px]">
        <button
          onClick={() => setSelectedChannel('ALL')}
          className={`px-2.5 py-1 rounded-lg font-bold transition ${
            selectedChannel === 'ALL'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
          }`}
        >
          ALL
        </button>
        {[
          { id: AAPChannelId.CONTROL, label: 'Ch 0: Control' },
          { id: AAPChannelId.AUDIO_MEDIA, label: 'Ch 1: Audio' },
          { id: AAPChannelId.INPUT, label: 'Ch 4: Input' },
          { id: AAPChannelId.VIDEO, label: 'Ch 5: Video' },
          { id: AAPChannelId.SENSOR, label: 'Ch 6: Sensors' },
        ].map((ch) => (
          <button
            key={ch.id}
            onClick={() => setSelectedChannel(ch.id)}
            className={`px-2 py-1 rounded-lg font-semibold transition ${
              selectedChannel === ch.id
                ? 'bg-blue-600 text-white font-bold'
                : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
            }`}
          >
            {ch.label}
          </button>
        ))}
      </div>

      {/* Packet Table Stream */}
      <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
        {filteredPackets.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 py-12">
            <Layers size={28} className="mb-2 opacity-50" />
            <span>No AAP packets on this channel.</span>
            <span className="text-[11px] text-slate-600 mt-1">
              Click &quot;Connect Phone AAP&quot; on the bottom bar to initiate protocol traffic.
            </span>
          </div>
        ) : (
          filteredPackets.map((pkt, idx) => (
            <div
              key={idx}
              className="bg-slate-900/80 hover:bg-slate-850 p-2 rounded-xl border border-slate-800/80 flex flex-col space-y-1 transition text-[11px]"
            >
              <div className="flex items-center justify-between">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getChannelColor(
                    pkt.channelId
                  )}`}
                >
                  {getChannelName(pkt.channelId)}
                </span>
                <span className="text-slate-500 text-[10px]">
                  {new Date(pkt.timestamp).toISOString().split('T')[1].slice(0, 12)}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-400 text-[10px]">
                  Header: [0x{pkt.channelId.toString(16).padStart(2, '0')}{' '}
                  0x{pkt.flags.toString(16).padStart(2, '0')} Len:{pkt.length}B]
                </span>
                <span className="font-mono text-blue-300 text-[10px]">
                  Hex: {pkt.rawHexPreview}
                </span>
              </div>
              <div className="bg-slate-950 p-1.5 rounded text-[10px] text-slate-300 overflow-x-auto">
                <span className="text-slate-500">Payload: </span>
                {JSON.stringify(pkt.payload)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
