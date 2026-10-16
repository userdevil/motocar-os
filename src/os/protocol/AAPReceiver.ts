import {
  AAPChannelId,
  AAPConnectionState,
  AAPMessageType,
  AAPPacket,
} from './AAPTypes';
import { AAPFraming } from './AAPFraming';
import { EventBus } from '../kernel/EventBus';
import { VHAL } from '../kernel/VHAL';

class AAPReceiverService {
  private state: AAPConnectionState = AAPConnectionState.DISCONNECTED;
  private packets: AAPPacket[] = [];
  private frameCount: number = 0;
  private bytesReceived: number = 0;
  private fps: number = 60;
  private streamingInterval: any = null;
  private listeners: Set<() => void> = new Set();

  public getState() {
    return {
      connectionState: this.state,
      packets: this.packets.slice(-25), // latest 25 packets for inspector
      frameCount: this.frameCount,
      bytesReceived: this.bytesReceived,
      fps: this.fps,
      totalPackets: this.packets.length,
    };
  }

  public subscribe(cb: () => void): () => void {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  private recordPacket(packet: AAPPacket) {
    this.packets.push(packet);
    this.bytesReceived += packet.length + 4;
    EventBus.emit('aap:packet', packet);
    this.notify();
  }

  public connect() {
    if (this.state !== AAPConnectionState.DISCONNECTED) return;
    this.state = AAPConnectionState.CONNECTING;
    this.notify();

    // Step 1: Version Negotiation (Channel 0)
    setTimeout(() => {
      this.state = AAPConnectionState.HANDSHAKE;
      const { packet: req } = AAPFraming.encodeFrame(
        AAPChannelId.CONTROL,
        AAPMessageType.VERSION_REQUEST,
        { clientVersion: '1.6', os: 'Android 14' }
      );
      this.recordPacket(req);

      setTimeout(() => {
        const { packet: res } = AAPFraming.encodeFrame(
          AAPChannelId.CONTROL,
          AAPMessageType.VERSION_RESPONSE,
          { status: 0, serverVersion: '1.6', headunit: 'AutoDroid-IVI' }
        );
        this.recordPacket(res);

        // Step 2: Service Discovery (Channel 0)
        setTimeout(() => {
          this.state = AAPConnectionState.AUTHENTICATING;
          const { packet: discReq } = AAPFraming.encodeFrame(
            AAPChannelId.CONTROL,
            AAPMessageType.SERVICE_DISCOVERY_REQUEST,
            {}
          );
          this.recordPacket(discReq);

          setTimeout(() => {
            const { packet: discRes } = AAPFraming.encodeFrame(
              AAPChannelId.CONTROL,
              AAPMessageType.SERVICE_DISCOVERY_RESPONSE,
              {
                channels: [
                  { id: AAPChannelId.AUDIO_MEDIA, type: 'PCM_48000_STEREO' },
                  { id: AAPChannelId.AUDIO_SPEECH, type: 'PCM_16000_MONO' },
                  { id: AAPChannelId.INPUT, type: 'TOUCH_AND_ROTARY' },
                  { id: AAPChannelId.VIDEO, resolution: '1920x1080', codec: 'H264' },
                  { id: AAPChannelId.SENSOR, sensors: ['GPS', 'SPEED', 'NIGHT_MODE'] },
                ],
              }
            );
            this.recordPacket(discRes);

            // Step 3: Auth Complete & Begin Streaming
            setTimeout(() => {
              this.state = AAPConnectionState.STREAMING;
              const { packet: auth } = AAPFraming.encodeFrame(
                AAPChannelId.CONTROL,
                AAPMessageType.AUTH_COMPLETE,
                { token: 'valid-tls-cert-kepler-auto' }
              );
              this.recordPacket(auth);
              this.startActiveStreaming();
            }, 300);
          }, 350);
        }, 350);
      }, 350);
    }, 400);
  }

  public disconnect() {
    if (this.streamingInterval) {
      clearInterval(this.streamingInterval);
      this.streamingInterval = null;
    }
    this.state = AAPConnectionState.DISCONNECTED;
    this.notify();
  }

  public sendInputEvent(x: number, y: number, action: 'DOWN' | 'MOVE' | 'UP') {
    if (this.state !== AAPConnectionState.STREAMING) return;
    const { packet } = AAPFraming.encodeFrame(
      AAPChannelId.INPUT,
      AAPMessageType.INPUT_EVENT,
      { x, y, action, timestamp: Date.now() }
    );
    this.recordPacket(packet);
  }

  public sendSteeringWheelKey(key: string) {
    if (this.state !== AAPConnectionState.STREAMING) return;
    const { packet } = AAPFraming.encodeFrame(
      AAPChannelId.INPUT,
      AAPMessageType.INPUT_EVENT,
      { key, action: 'KEY_PRESS', timestamp: Date.now() }
    );
    this.recordPacket(packet);
  }

  private startActiveStreaming() {
    this.streamingInterval = setInterval(() => {
      if (this.state !== AAPConnectionState.STREAMING) return;

      // Frame 1: Video Packet (H.264 frame slice on Channel 5)
      this.frameCount++;
      const { packet: videoPacket } = AAPFraming.encodeFrame(
        AAPChannelId.VIDEO,
        AAPMessageType.VIDEO_FRAME,
        {
          frameId: this.frameCount,
          isKeyframe: this.frameCount % 30 === 0,
          sliceSize: 1420,
        }
      );
      this.recordPacket(videoPacket);

      // Periodically transmit vehicle sensor telemetry (Channel 6)
      if (this.frameCount % 10 === 0) {
        const vState = VHAL.getState();
        const { packet: sensorPacket } = AAPFraming.encodeFrame(
          AAPChannelId.SENSOR,
          AAPMessageType.SENSOR_DATA,
          {
            speedKmh: Math.round(vState.speed),
            nightMode: vState.nightMode,
            gear: vState.gear,
          }
        );
        this.recordPacket(sensorPacket);
      }
    }, 250); // Generates live protocol traffic
  }
}

export const AAPReceiver = new AAPReceiverService();
