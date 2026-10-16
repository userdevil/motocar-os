import { AppMetadata, AppPackageId } from '../types/android';
import { DisplayManager } from './DisplayManager';
import { EventBus } from './EventBus';

export const SYSTEM_APPS: AppMetadata[] = [
  {
    packageId: 'com.autodroid.dashboard',
    name: 'Dashboard Home',
    category: 'SYSTEM',
    icon: 'LayoutDashboard',
    driverSafe: true,
  },
  {
    packageId: 'com.autodroid.maps',
    name: 'Kepler Navigation',
    category: 'NAVIGATION',
    icon: 'Navigation',
    driverSafe: true,
  },
  {
    packageId: 'com.autodroid.media',
    name: 'Media & Radio',
    category: 'MEDIA',
    icon: 'Radio',
    driverSafe: true,
  },
  {
    packageId: 'com.autodroid.dialer',
    name: 'Phone & Contacts',
    category: 'COMMUNICATION',
    icon: 'Phone',
    driverSafe: true,
  },
  {
    packageId: 'com.autodroid.hvac',
    name: 'Climate Controls',
    category: 'VEHICLE',
    icon: 'Fan',
    driverSafe: true,
  },
  {
    packageId: 'com.autodroid.carlink',
    name: 'Android Auto Link',
    category: 'COMMUNICATION',
    icon: 'Smartphone',
    driverSafe: true,
  },
  {
    packageId: 'com.autodroid.settings',
    name: 'Vehicle Settings',
    category: 'SYSTEM',
    icon: 'Settings',
    driverSafe: false,
  },
];

class AppManagerService {
  public getInstalledApps(): AppMetadata[] {
    return [...SYSTEM_APPS];
  }

  public launchApp(packageId: AppPackageId) {
    switch (packageId) {
      case 'com.autodroid.dashboard':
        DisplayManager.setLayoutMode('SPLIT_DASHBOARD');
        break;
      case 'com.autodroid.maps':
        DisplayManager.setLayoutMode('FULLSCREEN_MAP');
        break;
      case 'com.autodroid.media':
        DisplayManager.setLayoutMode('FULLSCREEN_MEDIA');
        break;
      case 'com.autodroid.dialer':
        DisplayManager.setLayoutMode('FULLSCREEN_DIALER');
        break;
      case 'com.autodroid.hvac':
        DisplayManager.setLayoutMode('FULLSCREEN_HVAC');
        break;
      case 'com.autodroid.settings':
        DisplayManager.setLayoutMode('FULLSCREEN_SETTINGS');
        break;
      case 'com.autodroid.carlink':
        DisplayManager.setLayoutMode('PROJECTION_MODE');
        break;
      case 'com.autodroid.drawer':
        DisplayManager.setLayoutMode('APP_DRAWER');
        break;
    }
    EventBus.emit('app:launched', packageId);
  }
}

export const AppManager = new AppManagerService();
