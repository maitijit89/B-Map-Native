import { useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getResponsiveColumnWidth } from '../utils/responsive';

export const useResponsive = () => {
  const { width, height, fontScale, scale: pixelScale } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const isSmall = width < 375;
  const isLarge = width >= 430;
  const isShort = height < 680;
  const isTablet = width >= 600;

  const scaleFont = (size: number, factor = 0.5) => {
    return Math.round(size + ((width / 375) * size - size) * factor);
  };

  const scaleSize = (size: number) => {
    return Math.round((width / 375) * size);
  };

  const getColumnWidth = (numColumns: number, gap: number, padding = 32) => {
    return getResponsiveColumnWidth(numColumns, gap, padding, width);
  };

  return {
    width,
    height,
    fontScale,
    pixelScale,
    insets,
    isSmallDevice: isSmall,
    isLargeDevice: isLarge,
    isShortDevice: isShort,
    isTablet,
    scaleFont,
    scaleSize,
    getColumnWidth,
  };
};

export default useResponsive;
