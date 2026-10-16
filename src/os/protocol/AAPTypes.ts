/**
 * Android Auto Protocol (AAP / Google Automotive Link) Definitions
 * Mirroring the open automotive projection specification
 */

export enum AAPChannelId {
  CONTROL = 0,         // Protocol handshake, version, auth, ping
  AUDIO_MEDIA = 1,     // High-definition audio stream (music/radio)
  AUDIO_SPEECH = 2,    // Navigation guidance / voice cues (ducking channel)
  AUDIO_MIC = 3,       // Microphone audio input to phone
  INPUT = 4,           // Touchscreen, rotary controller, steering wheel buttons
  VIDEO = 5,           // H.264 / H.265 projected display stream
  SENSOR = 6,          // Vehicle CAN telemetry (speed, night mode, GPS)
  BLUETOOTH = 7,       // Hands-Free Profile (HFP) setup
}

export enum AAPMessageFlag {
  FIRST_FRAME = 0x01,
  LAST_FRAME = 0x02,
  CONTROL_MSG = 0x04,
  ENCRYPTED = 0x08,
}

export enum AAPMessageType {
  VERSION_REQUEST = 0x0001,
  VERSION_RESPONSE = 0x0002,
  SERVICE_DISCOVERY_REQUEST = 0x0003,
  SERVICE_DISCOVERY_RESPONSE = 0x0004,
  AUTH_COMPLETE = 0x0005,
  PING_REQUEST = 0x0006,
  PING_RESPONSE = 0x0007,
  VIDEO_FRAME = 0x0100,
  AUDIO_SAMPLE = 0x0200,
  INPUT_EVENT = 0x0300,
  SENSOR_DATA = 0x0400,
  NAVIGATION_STATUS = 0x0500,
}

export interface AAPPacket {
  channelId: AAPChannelId;
  flags: number;
  length: number;
  messageType: AAPMessageType;
  timestamp: number;
  payload: Uint8Array | Record<string, any>;
  rawHexPreview: string;
}

export enum AAPConnectionState {
  DISCONNECTED = 'DISCONNECTED',
  CONNECTING = 'CONNECTING',
  HANDSHAKE = 'HANDSHAKE',
  AUTHENTICATING = 'AUTHENTICATING',
  STREAMING = 'STREAMING',
}
