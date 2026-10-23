import React, { useEffect, useId, useRef } from 'react';
import { StyleSheet, type ViewStyle } from 'react-native';
import Svg, {
  Defs,
  LinearGradient,
  RadialGradient,
  Stop,
  Rect,
  Path,
  Circle,
  G,
  Line,
} from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

import { useCompass } from '../../hooks/useCompass';

export interface DynamicCompassIconProps {
  /** Overall size of the icon (width & height in points). Default: 48 */
  size?: number;
  /** If true, the arrow rotates dynamically with the device compass/magnetometer. Default: true */
  dynamic?: boolean;
  /**
   * Rotation mode:
   * - 'north': Arrow points to magnetic North (standard navigation compass)
   * - 'heading': Arrow points in the direction the device is facing
   * Default: 'north'
   */
  mode?: 'north' | 'heading';
  /** If true, the squircle icon physically tilts in 3D perspective with device pitch & roll */
  tilt3D?: boolean;
  /** Corner radius for the blue squircle background (default: 25% of size) */
  borderRadius?: number;
  /** Fixed heading in degrees (0 = North, 90 = East, 180 = South, 270 = West) if overriding sensor */
  heading?: number;
  /** Optional container style */
  style?: ViewStyle;
}

/**
 * A photorealistic, high-performance dynamic compass icon matching the B-Map
 * design language (vibrant royal blue squircle with a white navigation arrow
 * and forward-illuminating radar/light beam).
 *
 * When `dynamic` is true, the arrow & beam smoothly rotate in real-time
 * using the device's hardware magnetometer via react-native-reanimated.
 */
export const DynamicCompassIcon: React.FC<DynamicCompassIconProps> = ({
  size = 48,
  dynamic = true,
  mode = 'north',
  tilt3D = false,
  borderRadius,
  heading: overrideHeading,
  style,
}) => {
  const rawId = useId();
  const id = rawId.replace(/[:]/g, '_');

  const { heading: liveHeading, pitch, roll } = useCompass(dynamic ? 60 : 300, 0.25);
  const rotation = useSharedValue(0);
  const currentTargetRef = useRef(0);
  const pitchAnim = useSharedValue(0);
  const rollAnim = useSharedValue(0);

  const currentHeading = overrideHeading ?? (dynamic ? liveHeading : 0);

  useEffect(() => {
    // In 'north' mode, rotate by -heading so arrow points North.
    // In 'heading' mode, rotate by +heading to match direction of travel.
    const targetRotation = mode === 'north' ? -currentHeading : currentHeading;

    // Shortest-arc angular distance to prevent wild spins across 0°/360°
    const diff = (((targetRotation - currentTargetRef.current) % 360) + 540) % 360 - 180;
    const nextTarget = currentTargetRef.current + diff;
    currentTargetRef.current = nextTarget;

    rotation.value = withSpring(nextTarget, {
      damping: 22,
      stiffness: 150,
      mass: 0.7,
    });
  }, [currentHeading, mode, rotation]);

  useEffect(() => {
    if (tilt3D) {
      pitchAnim.value = withSpring(-pitch * 0.45, { damping: 16, stiffness: 130 });
      rollAnim.value = withSpring(roll * 0.45, { damping: 16, stiffness: 130 });
    }
  }, [tilt3D, pitch, roll, pitchAnim, rollAnim]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const containerTiltStyle = useAnimatedStyle(() => {
    if (!tilt3D) return {};
    return {
      transform: [
        { perspective: 750 },
        { rotateX: `${pitchAnim.value}deg` },
        { rotateY: `${rollAnim.value}deg` },
      ],
    };
  });

  const computedRadius = borderRadius ?? Math.round(size * 0.25);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: computedRadius,
        },
        containerTiltStyle,
        style,
      ]}
    >
      {/* 1. Static Squircle Background with Beveled Lighting */}
      <Svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        style={StyleSheet.absoluteFill}
      >
        <Defs>
          <LinearGradient id={`${id}_bgGrad`} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#4872F8" />
            <Stop offset="100%" stopColor="#325CE5" />
          </LinearGradient>
          <LinearGradient id={`${id}_topGleam`} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.22" />
            <Stop offset="50%" stopColor="#FFFFFF" stopOpacity="0" />
          </LinearGradient>
        </Defs>

        {/* Main Squircle */}
        <Rect
          x={0}
          y={0}
          width={100}
          height={100}
          rx={25}
          ry={25}
          fill={`url(#${id}_bgGrad)`}
        />

        {/* Subtle Top-Edge Bevel / Gleam */}
        <Rect
          x={0}
          y={0}
          width={100}
          height={40}
          rx={25}
          ry={25}
          fill={`url(#${id}_topGleam)`}
        />
      </Svg>

      {/* 2. Rotating Layer: Compass Arrow + Forward Light Beam + Glowing Tip */}
      <Animated.View style={[styles.rotatingLayer, animatedStyle]}>
        <Svg
          width={size}
          height={size}
          viewBox="0 0 100 100"
          style={StyleSheet.absoluteFill}
        >
          <Defs>
            {/* Outer Soft Light Beam Gradient */}
            <LinearGradient id={`${id}_beamOuter`} x1="0.5" y1="0.32" x2="0.5" y2="0">
              <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.45" />
              <Stop offset="40%" stopColor="#FFFFFF" stopOpacity="0.22" />
              <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </LinearGradient>

            {/* Inner Concentrated Beam Gradient */}
            <LinearGradient id={`${id}_beamInner`} x1="0.5" y1="0.30" x2="0.5" y2="0">
              <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.55" />
              <Stop offset="60%" stopColor="#FFFFFF" stopOpacity="0.20" />
              <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </LinearGradient>

            {/* Radiant Hotspot Glow at Arrow Tip */}
            <RadialGradient
              id={`${id}_tipGlow`}
              cx="50%"
              cy="28%"
              r="20%"
              fx="50%"
              fy="28%"
            >
              <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.75" />
              <Stop offset="45%" stopColor="#FFFFFF" stopOpacity="0.35" />
              <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </RadialGradient>
          </Defs>

          {/* Forward Radiating Light Cone */}
          <G>
            {/* Outer Fan Beam */}
            <Path
              d="M 50 32 L 8 -12 L 92 -12 Z"
              fill={`url(#${id}_beamOuter)`}
            />

            {/* Inner Core Beam */}
            <Path
              d="M 50 30 L 26 -12 L 74 -12 Z"
              fill={`url(#${id}_beamInner)`}
            />

            {/* Subtle Radiant Rays */}
            <Line
              x1="50"
              y1="30"
              x2="50"
              y2="-10"
              stroke="#FFFFFF"
              strokeWidth="2"
              strokeOpacity="0.3"
            />
            <Line
              x1="50"
              y1="30"
              x2="36"
              y2="-10"
              stroke="#FFFFFF"
              strokeWidth="1.5"
              strokeOpacity="0.2"
            />
            <Line
              x1="50"
              y1="30"
              x2="64"
              y2="-10"
              stroke="#FFFFFF"
              strokeWidth="1.5"
              strokeOpacity="0.2"
            />

            {/* Hotspot Halo around Arrow Apex */}
            <Circle cx="50" cy="28" r="15" fill={`url(#${id}_tipGlow)`} />
          </G>

          {/* White Navigation Arrow with Smoothly Rounded Vertices */}
          <Path
            d="M 48.2 27.2
               C 49.2 25.5 50.8 25.5 51.8 27.2
               L 69.4 65.5
               C 70.5 67.8 69.1 69.8 66.8 68.9
               L 51.2 62.5
               C 50.4 62.2 49.6 62.2 48.8 62.5
               L 33.2 68.9
               C 30.9 69.8 29.5 67.8 30.6 65.5
               Z"
            fill="#FFFFFF"
          />
        </Svg>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  rotatingLayer: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default DynamicCompassIcon;
