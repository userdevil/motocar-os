import { AAPPacket, AAPChannelId, AAPMessageFlag, AAPMessageType } from './AAPTypes';

/**
 * Android Auto Binary Framing Engine
 * Standard AAP frames use a 4-byte header:
 * [0]: Channel ID (1 byte)
 * [1]: Flags (1 byte: FIRST_FRAME=0x01, LAST_FRAME=0x02, CONTROL=0x04, ENCRYPTED=0x08)
 * [2..3]: Payload length (uint16 big-endian)
 */
export class AAPFraming {
  public static encodeFrame(
    channelId: AAPChannelId,
    messageType: AAPMessageType,
    payloadData: Record<string, any> | Uint8Array,
    flags: number = AAPMessageFlag.FIRST_FRAME | AAPMessageFlag.LAST_FRAME
  ): { packet: AAPPacket; rawBuffer: Uint8Array } {
    let payloadBytes: Uint8Array;

    if (payloadData instanceof Uint8Array) {
      payloadBytes = payloadData;
    } else {
      const jsonStr = JSON.stringify(payloadData);
      const encoder = new TextEncoder();
      const encodedBody = encoder.encode(jsonStr);
      payloadBytes = new Uint8Array(2 + encodedBody.length);
      // First 2 bytes: MessageType (Big Endian)
      payloadBytes[0] = (messageType >> 8) & 0xff;
      payloadBytes[1] = messageType & 0xff;
      payloadBytes.set(encodedBody, 2);
    }

    const payloadLength = payloadBytes.length;
    const header = new Uint8Array(4);
    header[0] = channelId;
    header[1] = flags;
    header[2] = (payloadLength >> 8) & 0xff;
    header[3] = payloadLength & 0xff;

    const fullBuffer = new Uint8Array(4 + payloadLength);
    fullBuffer.set(header, 0);
    fullBuffer.set(payloadBytes, 4);

    const rawHex = Array.from(fullBuffer.slice(0, 16))
      .map((b) => b.toString(16).padStart(2, '0').toUpperCase())
      .join(' ');

    const packet: AAPPacket = {
      channelId,
      flags,
      length: payloadLength,
      messageType,
      timestamp: Date.now(),
      payload: payloadData,
      rawHexPreview: rawHex + (fullBuffer.length > 16 ? ' ...' : ''),
    };

    return { packet, rawBuffer: fullBuffer };
  }

  public static decodeHeader(bytes: Uint8Array): {
    channelId: AAPChannelId;
    flags: number;
    length: number;
  } | null {
    if (bytes.length < 4) return null;
    const channelId = bytes[0] as AAPChannelId;
    const flags = bytes[1];
    const length = (bytes[2] << 8) | bytes[3];
    return { channelId, flags, length };
  }
}
