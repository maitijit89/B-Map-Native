import {
  FadeIn,
  FadeInDown,
  FadeOut,
  Layout,
  WithSpringConfig,
} from 'react-native-reanimated';

/**
 * Minimal Animation System
 *
 * Design Principles:
 * 1. Zero Over-Shoot: Higher damping (22-28) ensures elements snap into place cleanly without oscillation.
 * 2. Low Travel Distance: Entrances glide 8-14dp rather than huge 40-60dp displacements.
 * 3. Immediate Micro-Interaction: Button & card taps respond in <180ms with subtle scale (0.975x).
 * 4. Ultra-smooth Layout Transitions: Lists, badges, and counters transition seamlessly without jump cuts.
 */
export const MinimalAnimation = {
  duration: {
    instant: 100,
    fast: 180,
    normal: 220,
    slow: 300,
  },
  spring: {
    // Standard subtle spring for general transitions
    standard: {
      damping: 24,
      stiffness: 320,
      mass: 0.5,
    } as WithSpringConfig,
    // Snappy tactile spring for button/chip/icon presses
    press: {
      damping: 26,
      stiffness: 380,
      mass: 0.4,
    } as WithSpringConfig,
    // Smooth layout reordering for lists & grid items
    layout: {
      damping: 22,
      stiffness: 300,
      mass: 0.5,
    } as WithSpringConfig,
    // BottomSheet & modal presentation
    sheet: {
      damping: 28,
      stiffness: 320,
      mass: 0.6,
    } as WithSpringConfig,
    // Soft gentle entrance
    gentle: {
      damping: 20,
      stiffness: 260,
      mass: 0.6,
    } as WithSpringConfig,
  },
  scale: {
    button: 0.975,
    card: 0.985,
    chip: 0.96,
    iconButton: 0.94,
    tabActive: 1.02,
  },
  offset: {
    micro: 6,
    subtle: 10,
    normal: 16,
  },
} as const;

/**
 * Minimal Entering Animation
 * Subtle vertical slide (10dp) + fade in, fast and damped.
 */
export const minimalEntering = (delay = 0, duration = 180) =>
  FadeInDown.duration(duration)
    .delay(delay)
    .springify()
    .damping(24)
    .stiffness(320)
    .mass(0.5);

/**
 * Minimal Fade In (opacity only)
 */
export const minimalFadeIn = (duration = 180) =>
  FadeIn.duration(duration);

/**
 * Minimal Fade Out
 */
export const minimalFadeOut = (duration = 150) =>
  FadeOut.duration(duration);

/**
 * Minimal Exiting Animation
 */
export const minimalExiting = (duration = 150) =>
  FadeOut.duration(duration);

/**
 * Minimal Layout Transition
 * For lists and elements that reorder, resize, or shift smoothly.
 */
export const minimalLayout = Layout.springify()
  .damping(22)
  .stiffness(300)
  .mass(0.5);

export default MinimalAnimation;

