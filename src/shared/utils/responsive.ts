import { Dimensions, PixelRatio } from 'react-native';

// Standard design guideline dimensions (iPhone standard baseline: 375 x 812)
const GUIDELINE_BASE_WIDTH = 375;
const GUIDELINE_BASE_HEIGHT = 812;

/**
 * Gets current screen width and height dynamically.
 */
export const getScreenDimensions = () => {
  const { width, height } = Dimensions.get('window');
  return { width, height };
};

/**
 * Scales a size based on screen width relative to guideline width (375).
 */
export const scale = (size: number): number => {
  const { width } = getScreenDimensions();
  return (width / GUIDELINE_BASE_WIDTH) * size;
};

/**
 * Scales a size based on screen height relative to guideline height (812).
 */
export const verticalScale = (size: number): number => {
  const { height } = getScreenDimensions();
  return (height / GUIDELINE_BASE_HEIGHT) * size;
};

/**
 * Scales a size with moderate factor (default 0.5) to avoid over-scaling on larger screens or tablets.
 */
export const moderateScale = (size: number, factor = 0.5): number => {
  return size + (scale(size) - size) * factor;
};

/**
 * Width percentage to DP helper.
 * e.g., wp(50) returns 50% of current screen width.
 */
export const wp = (percentage: number): number => {
  const { width } = getScreenDimensions();
  return PixelRatio.roundToNearestPixel((width * percentage) / 100);
};

/**
 * Height percentage to DP helper.
 * e.g., hp(50) returns 50% of current screen height.
 */
export const hp = (percentage: number): number => {
  const { height } = getScreenDimensions();
  return PixelRatio.roundToNearestPixel((height * percentage) / 100);
};

/**
 * Calculates responsive width for items in grid layouts given column count, gap, and container padding.
 */
export const getResponsiveColumnWidth = (
  numColumns: number,
  gap: number,
  containerPadding: number = 32,
  overrideWidth?: number
): number => {
  const { width } = getScreenDimensions();
  const effectiveWidth = overrideWidth || width;
  const totalGaps = (numColumns - 1) * gap;
  const availableWidth = effectiveWidth - containerPadding - totalGaps;
  return Math.max(0, Math.floor(availableWidth / numColumns));
};

/**
 * Device size helper flags
 */
export const isSmallDevice = (width = Dimensions.get('window').width): boolean => width < 375;
export const isLargeDevice = (width = Dimensions.get('window').width): boolean => width >= 430;
export const isShortDevice = (height = Dimensions.get('window').height): boolean => height < 680;
