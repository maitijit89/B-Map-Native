---
name: flowstep-uiux
description: "Flowstep UI/UX design and mobile screen development skill. Applies modern mobile design systems, visual hierarchy, ergonomics, micro-interactions, accessibility tokens, and state flows."
---

# Flowstep Mobile UI/UX Design Skill

Use this skill when developing, refactoring, or polishing mobile screens in React Native / Expo to achieve production-grade UI/UX fidelity according to Flowstep and Material 3 standards.

## Core Capabilities
1. **Design Token Harmony**: Enforce consistent padding, border radius, elevation hierarchies, and theme tokens from `src/shared/constants/tokens.ts`.
2. **Thumb-Zone Layouts**: Structure mobile screens with sticky bottom action docks (`bottomDock`), accessible FABs, and scrollable content bodies with dynamic bottom insets.
3. **Multi-Sensory Feedback**: Integrate `haptics` (selection, light, medium, success, heavy) and vernacular speech TTS alerts.
4. **Interactive States**: Implement rich active states, pill chips, animated card transitions, and photo previews.
5. **Accessibility**: Guarantee WCAG AA compliant color contrast, scalable typography, and descriptive accessibility tags.

## Implementation Checklist
- [ ] Safe area insets handled via `useSafeAreaInsets()` (top, bottom).
- [ ] Bottom action buttons elevated to fixed bottom bar within easy thumb reach.
- [ ] Interactive touch targets $\ge 44\text{pt}$ with `hitSlop`.
- [ ] High-contrast border outlines (`colors.outlineVariant` or `colors.surfaceContainerHigh`).
- [ ] Haptic feedback hooked into every interactive touchable.
- [ ] Zero hardcoded dark text on dark surfaces.

