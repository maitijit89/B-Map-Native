import {
  Easing,
  FadeIn,
  FadeInDown,
  FadeInUp,
  FadeInLeft,
  FadeInRight,
  FadeOut,
  FadeOutDown,
  Layout,
  LinearTransition,
} from 'react-native-reanimated';

/**
 * Fluid Smooth Animation Engine
 *
 * Core Principles:
 * 1. Fluid Momentum Deceleration:
 *    Uses Apple/Material 3 asymmetric cubic-bezier curves (0.16, 1, 0.3, 1).
 *    Launches immediately with high initial velocity and gracefully glides
 *    into rest with an infinite-smooth tail.
 * 2. Zero Bounce Physics:
 *    Zero spring oscillation (.springify removed) to ensure maximum 60/120fps
 *    throughput on low-end and high-end Android/iOS devices without JS bridge lag.
 * 3. Tactile Micro-Interactions:
 *    Fluid 110ms press compression and 180ms ease-out release.
 * 4. Silky Layout Transitions:
 *    Seamless element insertion, reordering, and removal.
 */

export const FluidCurves = {
  /** Signature iOS / Material 3 fluid momentum curve (fast start, silky deceleration) */
  momentum: Easing.bezier(0.16, 1, 0.3, 1),
  /** Standard balanced ease-in-out curve for symmetrical movements */
  standard: Easing.bezier(0.25, 0.1, 0.25, 1),
  /** Gentle cubic deceleration for pure fades and reveals */
  decelerate: Easing.out(Easing.cubic),
  /** Sharp acceleration for rapid exits without lingering */
  accelerate: Easing.bezier(0.4, 0, 1, 1),
  /** Instant press response curve */
  pressIn: Easing.bezier(0.25, 0.1, 0.25, 1),
  /** Smooth tactile rebound curve */
  pressOut: Easing.bezier(0.16, 1, 0.3, 1),
} as const;

export const FluidDuration = {
  instant: 90,
  pressIn: 110,
  pressOut: 180,
  fast: 180,
  normal: 220,
  smooth: 260,
  modal: 280,
} as const;

export const FluidAnimation = {
  duration: FluidDuration,
  curves: FluidCurves,
  scale: {
    button: 0.975,
    card: 0.985,
    chip: 0.96,
    iconButton: 0.94,
    tabActive: 1.02,
  },
  offset: {
    micro: 4,
    subtle: 8,
    normal: 12,
  },
} as const;

/**
 * Fluid Entering Transition
 * Vertical glide with fluid momentum curve.
 */
export const fluidEntering = (delay = 0, duration = FluidDuration.normal) => {
  let anim = FadeInDown.duration(duration).easing(FluidCurves.momentum);
  if (delay > 0) {
    anim = anim.delay(delay);
  }
  return anim;
};

/**
 * Fluid Entering Upward Transition (from bottom up with fluid momentum)
 */
export const fluidEnteringUp = (delay = 0, duration = FluidDuration.normal) => {
  let anim = FadeInUp.duration(duration).easing(FluidCurves.momentum);
  if (delay > 0) {
    anim = anim.delay(delay);
  }
  return anim;
};

/**
 * Fluid Entering Left Transition (from left with fluid momentum)
 */
export const fluidEnteringLeft = (delay = 0, duration = FluidDuration.normal) => {
  let anim = FadeInLeft.duration(duration).easing(FluidCurves.momentum);
  if (delay > 0) {
    anim = anim.delay(delay);
  }
  return anim;
};

/**
 * Fluid Entering Right Transition (from right with fluid momentum)
 */
export const fluidEnteringRight = (delay = 0, duration = FluidDuration.normal) => {
  let anim = FadeInRight.duration(duration).easing(FluidCurves.momentum);
  if (delay > 0) {
    anim = anim.delay(delay);
  }
  return anim;
};

/**
 * Fluid Fade In (opacity only with gentle deceleration)
 */
export const fluidFadeIn = (duration = FluidDuration.fast) =>
  FadeIn.duration(duration).easing(FluidCurves.decelerate);

/**
 * Fluid Fade Out
 */
export const fluidFadeOut = (duration = 160) =>
  FadeOut.duration(duration).easing(FluidCurves.accelerate);

/**
 * Fluid Exiting Transition
 */
export const fluidExiting = (duration = 160) =>
  FadeOutDown.duration(duration).easing(FluidCurves.accelerate);

/**
 * Fluid Smooth Layout Transition (linear glide with momentum curve)
 */
export const fluidLayout = Layout.duration(FluidDuration.normal).easing(FluidCurves.momentum);

// --- Backwards Compatibility with Minimal Animation API ---
export const MinimalAnimation = FluidAnimation;
export const minimalEntering = fluidEntering;
export const minimalFadeIn = fluidFadeIn;
export const minimalFadeOut = fluidFadeOut;
export const minimalExiting = fluidExiting;
export const minimalLayout = fluidLayout;

export {
  FadeIn,
  FadeInDown,
  FadeInUp,
  FadeInLeft,
  FadeInRight,
  FadeOut,
  FadeOutDown,
  Layout,
  LinearTransition,
  Easing,
};

export default FluidAnimation;
