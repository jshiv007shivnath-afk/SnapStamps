import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { StatusBar, Style } from '@capacitor/status-bar';

let initialized = false;

export function isNativeMobile(): boolean {
  try {
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
}

export async function initCapacitorMobile(): Promise<void> {
  if (initialized) return;
  initialized = true;

  if (!isNativeMobile()) {
    return;
  }

  try {
    await StatusBar.setStyle({ style: Style.Light });
    await StatusBar.setOverlaysWebView({ overlay: true });
  } catch {
    // Web or unsupported platform fallback
  }
}

export async function triggerHapticImpact(
  intensity: 'light' | 'medium' | 'heavy' = 'light'
): Promise<void> {
  if (!isNativeMobile()) {
    return;
  }

  const styleMap = {
    light: ImpactStyle.Light,
    medium: ImpactStyle.Medium,
    heavy: ImpactStyle.Heavy,
  };

  try {
    await Haptics.impact({ style: styleMap[intensity] });
  } catch {
    // Ignore haptic unavailability
  }
}
