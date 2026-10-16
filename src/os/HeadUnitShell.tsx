import React, { useState, useEffect } from 'react';
import { CarStatusBar } from './components/CarStatusBar';
import { CarDock } from './components/CarDock';
import { VehicleHardwareBar } from './components/VehicleHardwareBar';
import { DisplayManager } from './kernel/DisplayManager';
import { DisplayLayoutMode, VHALState } from './types/android';
import { VHAL } from './kernel/VHAL';

// Applications
import { DashboardApp } from './apps/DashboardApp';
import { MapsApp } from './apps/MapsApp';
import { MediaApp } from './apps/MediaApp';
import { DialerApp } from './apps/DialerApp';
import { ClimateApp } from './apps/ClimateApp';
import { SettingsApp } from './apps/SettingsApp';
import { CarLinkApp } from './apps/CarLinkApp';
import { AppDrawerApp } from './apps/AppDrawerApp';
import { ReverseCamera } from './components/ReverseCamera';

export const HeadUnitShell: React.FC = () => {
  const [layoutMode, setLayoutMode] = useState<DisplayLayoutMode>(DisplayManager.getLayoutMode());
  const [vhal, setVhal] = useState<VHALState>(VHAL.getState());
  const [brightness, setBrightness] = useState<number>(DisplayManager.getBrightness());

  useEffect(() => {
    const unsubDisplay = DisplayManager.subscribe((mode) => {
      setLayoutMode(mode);
      setBrightness(DisplayManager.getBrightness());
    });
    const unsubVhal = VHAL.subscribe(setVhal);

    return () => {
      unsubDisplay();
      unsubVhal();
    };
  }, []);

  const renderActiveApp = () => {
    switch (layoutMode) {
      case 'SPLIT_DASHBOARD':
        return <DashboardApp />;
      case 'FULLSCREEN_MAP':
        return <MapsApp />;
      case 'FULLSCREEN_MEDIA':
        return <MediaApp />;
      case 'FULLSCREEN_DIALER':
        return <DialerApp />;
      case 'FULLSCREEN_HVAC':
        return <ClimateApp />;
      case 'FULLSCREEN_SETTINGS':
        return <SettingsApp />;
      case 'PROJECTION_MODE':
        return <CarLinkApp />;
      case 'APP_DRAWER':
        return <AppDrawerApp />;
      case 'REVERSE_CAMERA':
        return <ReverseCamera />;
      default:
        return <DashboardApp />;
    }
  };

  return (
    <div
      className={`w-full h-screen flex flex-col justify-between overflow-hidden transition-all duration-300 ${
        vhal.nightMode ? 'bg-[#080b12]' : 'bg-slate-900'
      }`}
      style={{
        filter: `brightness(${brightness}%)`,
      }}
    >
      {/* 1. Android Automotive Status Bar */}
      <CarStatusBar />

      {/* 2. Main Work Area: Left Automotive Dock + Center Viewport */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Persistent Dock */}
        <CarDock />

        {/* Center Application Viewport */}
        <main className="flex-1 h-full overflow-hidden relative bg-slate-950">
          {renderActiveApp()}
        </main>
      </div>

      {/* 3. Bottom Vehicle Hardware Bar (CAN-Bus, Shifter, Throttle, Steering, AAP cable) */}
      <VehicleHardwareBar />
    </div>
  );
};
