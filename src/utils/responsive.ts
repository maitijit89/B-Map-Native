import { Dimensions, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Standard mobile baseline dimensions (iPhone 11 / modern Android baseline: 375 x 812)
const GUIDELINE_BASE_WIDTH = 375;
const GUIDELINE_BASE_HEIGHT = 812;

/**
 * Scales a dimension linearly based on the current screen width.
 */
export const scale = (size: number): number => {
  return (SCREEN_WIDTH / GUIDELINE_BASE_WIDTH) * size;
};

/**
 * Scales a dimension linearly based on the current screen height.
 */
export const verticalScale = (size: number): number => {
  return (SCREEN_HEIGHT / GUIDELINE_BASE_HEIGHT) * size;
};

/**
 * Moderately scales a dimension. Factor controls how aggressively the size adapts.
 * Default factor = 0.5 (halfway between fixed size and fully scaled).
 * Perfect for font sizes, icon sizes, and paddings.
 */
export const moderateScale = (size: number, factor: number = 0.5): number => {
  return size + (scale(size) - size) * factor;
};

/**
 * Width percentage to DP
 */
export const wp = (percentage: number): number => {
  return (percentage * SCREEN_WIDTH) / 100;
};

/**
 * Height percentage to DP
 */
export const hp = (percentage: number): number => {
  return (percentage * SCREEN_HEIGHT) / 100;
};

/**
 * Dynamic font sizing that respects font scaling limits
 */
export const responsiveFontSize = (size: number): number => {
  const newSize = moderateScale(size, 0.4);
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

/**
 * Flag indicating small phone screens (< 360dp width, e.g. 5" 720p older Android devices)
 */
export const isSmallDevice = SCREEN_WIDTH < 360;

/**
 * Flag indicating standard phone screens (360dp - 400dp width)
 */
export const isMediumDevice = SCREEN_WIDTH >= 360 && SCREEN_WIDTH < 410;

/**
 * Flag indicating large devices / phablets (>= 410dp width)
 */
export const isLargeDevice = SCREEN_WIDTH >= 410;

/**
 * Aspect ratio flag for short/compact displays (16:9 ratio, height/width < 1.8)
 */
export const isShortDevice = SCREEN_HEIGHT / SCREEN_WIDTH < 1.8;

export { SCREEN_WIDTH, SCREEN_HEIGHT };
