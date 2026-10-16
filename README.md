# AutoDroid OS — Automotive Operating System for Mobile & Head Units

AutoDroid OS is a specialized Automotive Operating System designed to turn mobile phones and tablets into high-performance in-car **Head Units**—modeling how Android automotive head units (e.g. DUDUOS, Joying, Headunit Reloaded, and Android Automotive OS) operate upon Android mobile hardware.

---

## 🚗 How Android Auto Works: The Core Architecture

### 1. Android Auto (Projection) vs Android Automotive OS (AAOS)
*   **Android Auto (Projection Mode)**: The user's smartphone is the compute engine. The vehicle head unit acts as an external terminal / dumb display client. The phone allocates a virtual display (`DisplayManager.createVirtualDisplay()`), encodes the graphical surface via hardware H.264 (`MediaCodec`), and streams it over USB (AOA 2.0) or Wi-Fi to the car.
*   **Android Automotive OS (Embedded)**: Full Android operating system installed directly on the vehicle's infotainment SoC (e.g. Qualcomm Cockpit, NXP i.MX8) interfacing directly with the vehicle CAN bus via the Vehicle Hardware Abstraction Layer (VHAL).
*   **AutoDroid OS (This System)**: Delivers both capabilities simultaneously:
    1. Runs as a standalone automotive head unit OS directly on mobile hardware.
    2. Operates as an **AAP Sink Receiver** (like Headunit Reloaded / Zlink), allowing other smartphones to project Android Auto onto this device.

### 2. Protocol Framing & Logical Channels (AAP Specification)
Android Auto uses custom binary framing over TCP (default port 5277 / 5288):
*   **Packet Header (4 Bytes)**:
    *   `Byte 0`: `channel_id` (0 to 255)
    *   `Byte 1`: `flags` (`0x01` = First Frame, `0x02` = Last Frame, `0x04` = Control, `0x08` = Encrypted)
    *   `Bytes 2–3`: `payload_length` (Big-endian uint16)
*   **Logical Channels**:
    *   `CH 0 (Control)`: Handshake, protocol version negotiation (1.6), and service discovery.
    *   `CH 1 (Media Audio)`: High-fidelity stereo PCM 48kHz audio.
    *   `CH 2 (Speech/Guidance Audio)`: Navigation audio cues that duck Channel 1 media by 80%.
    *   `CH 3 (Microphone)`: Vehicle cabin microphone stream sent to Google Assistant.
    *   `CH 4 (Input Subsystem)`: Touchscreen coordinates and steering wheel buttons returned to phone.
    *   `CH 5 (Video Stream)`: H.264/H.265 video packets carrying the 60fps virtual display.
    *   `CH 6 (Sensors)`: CAN bus telemetry (vehicle speed, night mode, headlights, gear).
    *   `CH 7 (Bluetooth)`: Hands-free calling profile pairing.

---

## 📱 AutoDroid OS Architecture

```
                             +----------------------------------------+
                             |              AutoDroid OS              |
                             |  Status Bar | Persistent Car Dock      |
                             +----------------------------------------+
                                                 |
                   +-------------------+---------+-------+--------------------+
                   |                   |                 |                    |
          +-----------------+ +-----------------+ +-----------------+ +-----------------+
          |   Maps & GPS    | |  Media & Radio  | | Phone & Dialer  | |   Climate HVAC  |
          | (Turn-by-Turn)  | | (Audio Synth)   | | (Hands-Free)    | | (Dual-Zone)     |
          +-----------------+ +-----------------+ +-----------------+ +-----------------+
                   |                   |                 |                    |
                   +-------------------+---------+-------+--------------------+
                                                 |
                             +----------------------------------------+
                             |         Automotive Core Services       |
                             |  - VHAL (CAN-Bus & Powertrain State)   |
                             |  - CarAudioManager (Audio Ducking)     |
                             |  - DisplayManager (Compositor & Camera)|
                             |  - AAPReceiver (Android Auto Sink)     |
                             +----------------------------------------+
                                                 |
                             +----------------------------------------+
                             |      Vehicle Simulation Hardware       |
                             |  - Throttle & Brake Pedals             |
                             |  - Gear Shifter (P, R, N, D)           |
                             |  - Headlight Switch (Night/Day Sync)   |
                             |  - Steering Wheel Buttons              |
                             +----------------------------------------+
```

---

## ⚡ Key Features

1.  **Split-Screen Automotive Dashboard (Home)**:
    *   Left 60%: Interactive vector GPS map with animated vehicle position, speed limit sign, upcoming turn instructions, and ETA.
    *   Right Top: Media Player card with live playback, album covers, audio progress, and real-time audio ducking.
    *   Right Bottom: Digital Instrument Cluster with analog/digital speedometer, tachometer (RPM), fuel %, and gear indicator.
2.  **Emergency Reverse Camera**:
    *   Shifting gear to `R` (Reverse) immediately overrides the screen with a live backup camera feed, dynamic steering trajectory guide lines, distance radar, and ultrasonic obstacle beepers.
3.  **Headlight Day/Night Mode Sync**:
    *   Toggling vehicle headlights dynamically transitions the entire OS UI between daytime high-contrast mode and nighttime dark mode.
4.  **Audio Ducking Subsystem**:
    *   When navigation instructions play, background media volume is automatically ducked by 80%, smoothly restoring after the voice prompt ends.
5.  **Built-in REA Protocol Sniffer**:
    *   Real-time packet sniffer visualizing AAP binary frames, channel IDs, header flags, raw hex dumps, throughput (KB/s), and frame rate.
6.  **Dual Form-Factor Support**:
    *   Toggle between **In-Dash Widescreen Headunit** mode and **Mobile Phone / Tablet Car Mount** mode.

---

## 🛠️ Getting Started

### Prerequisites
*   Node.js 18+ (tested on Node.js 25)
*   npm 9+

### Installation & Launch
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run automated test suite
npm test

# Build production bundle
npm run build
```

Open your browser at `http://localhost:3000` to interact with AutoDroid OS!
