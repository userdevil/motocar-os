/**
 * REA MCP Reverse Engineering & Static Analysis Bridge
 * Exposes internal interfaces, symbols, and channel graphs for inspection
 * via REA MCP's analyze_javascript_application and trace_application_feature.
 */

import { VHAL } from '../os/kernel/VHAL';
import { AAPReceiver } from '../os/protocol/AAPReceiver';
import { CarAudioManager } from '../os/kernel/CarAudioManager';
import { DisplayManager } from '../os/kernel/DisplayManager';
import { EventBus } from '../os/kernel/EventBus';
import { AAPChannelId, AAPMessageType } from '../os/protocol/AAPTypes';

export const REA_ARCHITECTURAL_MANIFEST = {
  system: 'AutoDroid OS',
  target: 'Android Automotive & Mobile Head Unit',
  version: '1.0.0',
  subsystems: [
    {
      name: 'VHAL (Vehicle Hardware Abstraction Layer)',
      authority: 'local-kernel',
      entrypoint: 'src/os/kernel/VHAL.ts',
      properties: [
        'PERF_VEHICLE_SPEED',
        'ENGINE_RPM',
        'GEAR_SELECTION',
        'NIGHT_MODE',
        'HVAC_TEMPERATURE_SET',
      ],
    },
    {
      name: 'Android Auto Protocol (AAP) Sink Receiver',
      authority: 'projection-engine',
      entrypoint: 'src/os/protocol/AAPReceiver.ts',
      channels: [
        { id: AAPChannelId.CONTROL, name: 'Control & Handshake' },
        { id: AAPChannelId.AUDIO_MEDIA, name: 'PCM 48kHz Stereo Media Sink' },
        { id: AAPChannelId.AUDIO_SPEECH, name: 'PCM 16kHz Guidance Sink with Ducking' },
        { id: AAPChannelId.INPUT, name: 'Touch & Key Input Source' },
        { id: AAPChannelId.VIDEO, name: 'H.264 1080p60 Video Sink' },
        { id: AAPChannelId.SENSOR, name: 'CAN Bus Telemetry Source' },
      ],
    },
    {
      name: 'CarAudioManager',
      authority: 'audio-subsystem',
      entrypoint: 'src/os/kernel/CarAudioManager.ts',
      features: ['Multi-zone audio routing', 'Automatic 80% navigation ducking', 'Web Audio API synthesis'],
    },
    {
      name: 'DisplayCompositor',
      authority: 'window-manager',
      entrypoint: 'src/os/kernel/DisplayManager.ts',
      features: ['Split-screen dashboard', 'Reverse camera emergency interrupt', 'Dynamic brightness'],
    },
  ],
};

// Global inspection hook for browser devtools and REA MCP
if (typeof window !== 'undefined') {
  (window as any).__AUTODROID_REA_BRIDGE__ = {
    manifest: REA_ARCHITECTURAL_MANIFEST,
    getVhalState: () => VHAL.getState(),
    getAapState: () => AAPReceiver.getState(),
    getAudioState: () => CarAudioManager.getState(),
    getDisplayState: () => DisplayManager.getLayoutMode(),
  };
}
