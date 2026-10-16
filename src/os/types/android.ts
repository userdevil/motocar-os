/**
 * Android Automotive OS (AAOS) & Vehicle HAL (VHAL) Types
 * Defined in accordance with android.car.hardware.property.VehiclePropertyIds
 */

export enum VehiclePropertyId {
  // Powertrain & Driving
  PERF_VEHICLE_SPEED = 0x11600207,       // float (m/s converted to km/h or mph)
  ENGINE_RPM = 0x11600305,               // float (rev/min)
  GEAR_SELECTION = 0x11400400,           // int32 (P, R, N, D)
  PARKING_BRAKE_ON = 0x11200402,         // boolean
  FUEL_LEVEL = 0x11600307,               // float (%)
  EV_BATTERY_LEVEL = 0x11600309,         // float (%)
  
  // Body & Lighting
  NIGHT_MODE = 0x11200407,               // boolean (day/night mode for UI styling)
  HEADLIGHTS_STATE = 0x11400600,         // int32 (0=Off, 1=Parking, 2=On)
  TURN_SIGNAL_STATE = 0x11400602,        // int32 (0=None, 1=Left, 2=Right, 3=Hazard)
  DOOR_OPEN_STATUS = 0x11400500,         // bitmask (doors open)
  
  // HVAC
  HVAC_POWER_ON = 0x15200501,            // boolean
  HVAC_DEFROSTER = 0x15400504,           // int32
  HVAC_TEMPERATURE_SET = 0x15600503,     // float (°C)
  HVAC_FAN_SPEED = 0x15400500,           // int32 (1-7)
  HVAC_SEAT_WARMER_DRIVER = 0x1540050b,  // int32 (0-3)
  HVAC_SEAT_WARMER_PASSENGER = 0x1540050c,// int32 (0-3)

  // Sensors & Diagnostics
  TIRE_PRESSURE_FL = 0x15600300,         // float (PSI)
  TIRE_PRESSURE_FR = 0x15600301,
  TIRE_PRESSURE_RL = 0x15600302,
  TIRE_PRESSURE_RR = 0x15600303,
  OUTDOOR_TEMPERATURE = 0x11600701,      // float (°C)
  ODOMETER = 0x11600204,                 // float (km)
}

export enum Gear {
  PARK = 'P',
  REVERSE = 'R',
  NEUTRAL = 'N',
  DRIVE = 'D',
}

export enum HeadlightState {
  OFF = 0,
  PARKING = 1,
  ON = 2,
}

export enum TurnSignalState {
  NONE = 0,
  LEFT = 1,
  RIGHT = 2,
  HAZARD = 3,
}

export enum AudioStreamType {
  STREAM_MUSIC = 'STREAM_MUSIC',
  STREAM_NAVIGATION = 'STREAM_NAVIGATION',
  STREAM_VOICE_CALL = 'STREAM_VOICE_CALL',
  STREAM_SYSTEM = 'STREAM_SYSTEM',
}

export enum AudioFocusState {
  GAIN = 'GAIN',
  LOSS = 'LOSS',
  LOSS_TRANSIENT_CAN_DUCK = 'LOSS_TRANSIENT_CAN_DUCK',
}

export type AppPackageId =
  | 'com.autodroid.dashboard'
  | 'com.autodroid.maps'
  | 'com.autodroid.media'
  | 'com.autodroid.dialer'
  | 'com.autodroid.hvac'
  | 'com.autodroid.settings'
  | 'com.autodroid.carlink'
  | 'com.autodroid.drawer';

export interface AppMetadata {
  packageId: AppPackageId;
  name: string;
  category: 'NAVIGATION' | 'MEDIA' | 'COMMUNICATION' | 'SYSTEM' | 'VEHICLE';
  icon: string;
  driverSafe: boolean;
}

export type DisplayLayoutMode =
  | 'SPLIT_DASHBOARD'
  | 'FULLSCREEN_MAP'
  | 'FULLSCREEN_MEDIA'
  | 'FULLSCREEN_DIALER'
  | 'FULLSCREEN_SETTINGS'
  | 'FULLSCREEN_HVAC'
  | 'APP_DRAWER'
  | 'REVERSE_CAMERA'
  | 'PROJECTION_MODE';

export interface VHALState {
  speed: number;             // km/h
  rpm: number;               // rev/min
  gear: Gear;
  parkingBrake: boolean;
  fuelLevel: number;         // %
  batteryLevel: number;      // %
  nightMode: boolean;        // lights on
  headlightState: HeadlightState;
  turnSignal: TurnSignalState;
  doorsOpen: {
    driver: boolean;
    passenger: boolean;
    rearLeft: boolean;
    rearRight: boolean;
    trunk: boolean;
  };
  hvac: {
    power: boolean;
    driverTemp: number;     // Celsius
    passengerTemp: number;  // Celsius
    fanSpeed: number;       // 1-7
    ac: boolean;
    auto: boolean;
    recirculation: boolean;
    frontDefrost: boolean;
    rearDefrost: boolean;
    seatWarmerDriver: number; // 0-3
    seatWarmerPassenger: number; // 0-3
  };
  tires: {
    fl: number;
    fr: number;
    rl: number;
    rr: number;
  };
  outdoorTemp: number;       // Celsius
  odometer: number;          // km
}
