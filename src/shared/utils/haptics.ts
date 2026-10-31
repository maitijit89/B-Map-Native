import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

// Global vibration toggle - explicitly disabled by default per user request: "stop app vribation"
let isVibrationEnabled = false;

export const haptics = {
  isEnabled: (): boolean => isVibrationEnabled,
  setEnabled: (enabled: boolean): void => {
    isVibrationEnabled = enabled;
  },
  light: (): void => {
    if (!isVibrationEnabled) return;
    if (Platform.OS === "ios" || Platform.OS === "android") {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {
        // Haptics unavailable
      }
    }
  },
  medium: (): void => {
    if (!isVibrationEnabled) return;
    if (Platform.OS === "ios" || Platform.OS === "android") {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch {
        // Haptics unavailable
      }
    }
  },
  heavy: (): void => {
    if (!isVibrationEnabled) return;
    if (Platform.OS === "ios" || Platform.OS === "android") {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      } catch {
        // Haptics unavailable
      }
    }
  },
  rigid: (): void => {
    if (!isVibrationEnabled) return;
    if (Platform.OS === "ios" || Platform.OS === "android") {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
      } catch {
        // Haptics unavailable
      }
    }
  },
  soft: (): void => {
    if (!isVibrationEnabled) return;
    if (Platform.OS === "ios" || Platform.OS === "android") {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
      } catch {
        // Haptics unavailable
      }
    }
  },
  selection: (): void => {
    if (!isVibrationEnabled) return;
    if (Platform.OS === "ios" || Platform.OS === "android") {
      try {
        Haptics.selectionAsync();
      } catch {
        // Haptics unavailable
      }
    }
  },
  success: (): void => {
    if (!isVibrationEnabled) return;
    if (Platform.OS === "ios" || Platform.OS === "android") {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {
        // Haptics unavailable
      }
    }
  },
  warning: (): void => {
    if (!isVibrationEnabled) return;
    if (Platform.OS === "ios" || Platform.OS === "android") {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      } catch {
        // Haptics unavailable
      }
    }
  },
  error: (): void => {
    if (!isVibrationEnabled) return;
    if (Platform.OS === "ios" || Platform.OS === "android") {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } catch {
        // Haptics unavailable
      }
    }
  },
};

export default haptics;
