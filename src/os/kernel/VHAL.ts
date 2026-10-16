import { VHALState, Gear, HeadlightState, TurnSignalState, VehiclePropertyId } from '../types/android';
import { EventBus } from './EventBus';
import { AudioSynth } from '../sounds/AudioSynth';

/**
 * Vehicle Hardware Abstraction Layer (VHAL)
 * Coordinates with CAN-Bus and OBD-II telemetry
 */
class VehicleHALService {
  private state: VHALState = {
    speed: 0,
    rpm: 800, // Idle RPM
    gear: Gear.PARK,
    parkingBrake: true,
    fuelLevel: 78,
    batteryLevel: 92,
    nightMode: true,
    headlightState: HeadlightState.ON,
    turnSignal: TurnSignalState.NONE,
    doorsOpen: {
      driver: false,
      passenger: false,
      rearLeft: false,
      rearRight: false,
      trunk: false,
    },
    hvac: {
      power: true,
      driverTemp: 21.5,
      passengerTemp: 22.0,
      fanSpeed: 3,
      ac: true,
      auto: true,
      recirculation: false,
      frontDefrost: false,
      rearDefrost: false,
      seatWarmerDriver: 0,
      seatWarmerPassenger: 0,
    },
    tires: {
      fl: 33.2,
      fr: 33.5,
      rl: 32.8,
      rr: 33.0,
    },
    outdoorTemp: 19.0,
    odometer: 14250.8,
  };

  private listeners: Set<(state: VHALState) => void> = new Set();
  private physicsInterval: any = null;
  private targetSpeed: number = 0;
  private isBraking: boolean = false;

  constructor() {
    this.startVehiclePhysicsLoop();
  }

  public getState(): VHALState {
    return { ...this.state };
  }

  public subscribe(listener: (state: VHALState) => void): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    const s = this.getState();
    this.listeners.forEach((l) => l(s));
    EventBus.emit('vhal:state_change', s);
  }

  // --- Controls & Actuators ---

  public setGear(gear: Gear) {
    if (this.state.gear === gear) return;
    this.state.gear = gear;

    if (gear === Gear.PARK) {
      this.state.parkingBrake = true;
      this.targetSpeed = 0;
      this.state.speed = 0;
      this.state.rpm = 800;
    } else {
      this.state.parkingBrake = false;
    }

    AudioSynth.playTouchFeedback();
    this.notify();
    EventBus.emit('vhal:gear_change', gear);
  }

  public setThrottle(percent: number) {
    // 0 to 100%
    if (this.state.gear === Gear.PARK || this.state.gear === Gear.NEUTRAL) {
      // Free revving
      this.state.rpm = Math.min(6500, 800 + (percent / 100) * 5000);
      this.targetSpeed = 0;
    } else if (this.state.gear === Gear.DRIVE) {
      this.targetSpeed = (percent / 100) * 160; // Max 160 km/h
    } else if (this.state.gear === Gear.REVERSE) {
      this.targetSpeed = (percent / 100) * 25; // Max 25 km/h reverse
    }
    this.notify();
  }

  public setBraking(isBraking: boolean) {
    this.isBraking = isBraking;
    if (isBraking) {
      this.targetSpeed = Math.max(0, this.targetSpeed - 20);
    }
  }

  public setHeadlights(mode: HeadlightState) {
    this.state.headlightState = mode;
    this.state.nightMode = mode !== HeadlightState.OFF;
    AudioSynth.playTouchFeedback();
    this.notify();
    EventBus.emit('vhal:night_mode', this.state.nightMode);
  }

  public setTurnSignal(signal: TurnSignalState) {
    if (this.state.turnSignal === signal) {
      this.state.turnSignal = TurnSignalState.NONE;
    } else {
      this.state.turnSignal = signal;
    }
    AudioSynth.startTurnSignal(this.state.turnSignal !== TurnSignalState.NONE);
    this.notify();
  }

  public setHvacDriverTemp(delta: number) {
    const newTemp = Math.round((this.state.hvac.driverTemp + delta) * 2) / 2;
    if (newTemp >= 16 && newTemp <= 30) {
      this.state.hvac.driverTemp = newTemp;
      AudioSynth.playTouchFeedback();
      this.notify();
    }
  }

  public setHvacPassengerTemp(delta: number) {
    const newTemp = Math.round((this.state.hvac.passengerTemp + delta) * 2) / 2;
    if (newTemp >= 16 && newTemp <= 30) {
      this.state.hvac.passengerTemp = newTemp;
      AudioSynth.playTouchFeedback();
      this.notify();
    }
  }

  public setHvacFanSpeed(speed: number) {
    if (speed >= 1 && speed <= 7) {
      this.state.hvac.fanSpeed = speed;
      AudioSynth.playTouchFeedback();
      this.notify();
    }
  }

  public toggleHvacPower() {
    this.state.hvac.power = !this.state.hvac.power;
    AudioSynth.playTouchFeedback();
    this.notify();
  }

  public toggleHvacAc() {
    this.state.hvac.ac = !this.state.hvac.ac;
    AudioSynth.playTouchFeedback();
    this.notify();
  }

  public cycleSeatWarmer(driver: boolean) {
    if (driver) {
      this.state.hvac.seatWarmerDriver = (this.state.hvac.seatWarmerDriver + 1) % 4;
    } else {
      this.state.hvac.seatWarmerPassenger = (this.state.hvac.seatWarmerPassenger + 1) % 4;
    }
    AudioSynth.playTouchFeedback();
    this.notify();
  }

  // Realistic vehicle drivetrain simulation loop
  private startVehiclePhysicsLoop() {
    this.physicsInterval = setInterval(() => {
      let stateChanged = false;

      // Accelerate or decelerate towards target speed
      if (this.state.gear === Gear.DRIVE || this.state.gear === Gear.REVERSE) {
        const rate = this.isBraking ? 4.5 : 1.8;
        if (this.state.speed < this.targetSpeed) {
          this.state.speed = Math.min(this.targetSpeed, this.state.speed + rate);
          stateChanged = true;
        } else if (this.state.speed > this.targetSpeed) {
          this.state.speed = Math.max(this.targetSpeed, this.state.speed - rate * 1.5);
          stateChanged = true;
        }

        // Calculate realistic RPM according to speed & transmission gearing
        if (this.state.speed > 0) {
          const gearRatioMultiplier = (this.state.speed % 35) / 35;
          this.state.rpm = Math.min(5800, 1200 + gearRatioMultiplier * 2800 + (this.state.speed * 18));
          stateChanged = true;
        } else if (!this.isBraking && this.targetSpeed === 0) {
          this.state.rpm = Math.max(800, this.state.rpm - 150);
          stateChanged = true;
        }
      } else {
        // In Park or Neutral, coast to 0
        if (this.state.speed > 0) {
          this.state.speed = Math.max(0, this.state.speed - 2.5);
          stateChanged = true;
        }
        if (this.targetSpeed === 0 && this.state.rpm > 800) {
          this.state.rpm = Math.max(800, this.state.rpm - 150);
          stateChanged = true;
        }
      }

      // Increment odometer
      if (this.state.speed > 0) {
        this.state.odometer += (this.state.speed / 3600) * 0.05;
      }

      if (stateChanged) {
        this.notify();
      }
    }, 50);
  }
}

export const VHAL = new VehicleHALService();
