import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

export const haptics = {
  light: () => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {
        // Haptics unavailable
      }
    }
  },
  medium: () => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch {
        // Haptics unavailable
      }
    }
  },
  heavy: () => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      } catch {
        // Haptics unavailable
      }
    }
  },
  rigid: () => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
      } catch {
        // Haptics unavailable
      }
    }
  },
  soft: () => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
      } catch {
        // Haptics unavailable
      }
    }
  },
  selection: () => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      try {
        Haptics.selectionAsync();
      } catch {
        // Haptics unavailable
      }
    }
  },
  success: () => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {
        // Haptics unavailable
      }
    }
  },
  warning: () => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      } catch {
        // Haptics unavailable
      }
    }
  },
  error: () => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } catch {
        // Haptics unavailable
      }
    }
  },
};

export default haptics;
