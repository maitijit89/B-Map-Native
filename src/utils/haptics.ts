import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/**
 * Safe haptic feedback utility.
 * Works seamlessly on iOS and Android, and safely no-ops on Web.
 */
export const triggerHaptic = {
  /** Light impact for minor UI button presses, tabs, category selection */
  light: () => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {
        // Fallback for devices without haptic engines
      }
    }
  },

  /** Medium impact for action confirmations, modal triggers, navigation start */
  medium: () => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch {
        // Fallback
      }
    }
  },

  /** Heavy impact for toggling modes or major state changes */
  heavy: () => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      } catch {
        // Fallback
      }
    }
  },

  /** Selection changed tick (subtle tick when cycling through lists/layers) */
  selection: () => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.selectionAsync();
      } catch {
        // Fallback
      }
    }
  },

  /** Notification success (e.g. location locked, route calculated) */
  success: () => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {
        // Fallback
      }
    }
  },
};
