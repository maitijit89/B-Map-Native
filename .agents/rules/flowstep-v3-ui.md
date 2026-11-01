---
description: Flowstep v3.0 Production UI/UX Contract for B-Map Native
globs: ["app/**/*.tsx", "components/**/*.tsx", "hooks/**/*.ts", "services/**/*.ts", "src/**/*.tsx", "src/**/*.ts"]
---

# B-Map Native Flowstep v3.0 Production Rules

1. **Zero Hardcoded Offsets**: Never use static top offsets (`top: 130`) or percentage POI positions (`y: 34%`, `x: 46%`). Always bind HUD elements to `floatingTop` (`topHudHeight + 10`) and pass `mapEdgePadding` into `usePoiCollisionEngine`.
2. **Mandatory Crisp Outlines**: Every floating card, pill, FAB, and bottom sheet must specify `borderWidth: 1` using the `surfaceContainerHigh` token (`#DEE8FF` Light / `#222D40` Dark) or theme border token.
3. **Tabular Telemetry**: Every numeric counter (speed, distance, ETA, 20 Hz compass heading, NavIC SNR dB-Hz, HDOP) must declare `fontVariant: ['tabular-nums']`.
4. **Automotive Touch Envelopes**: Enforce $\ge 48\times 48\text{pt}$ touch targets on all floating controls and map pins using `hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}`.
5. **Tactile Restraint**: Restrict haptics strictly to deliberate actions (`haptics.heavy()` for SOS 112 & NavIC GPS lock; `haptics.medium()` for navigation actions; `haptics.success()` for DigiPIN copy & route calculation; `haptics.selection()` for tabs/filters).
6. **Zero-Regression Gate**: Run `tsc --noEmit`, `npx expo lint`, and `npm run test:ui` after every component refactor.
7. **Zero App Transparency (100% Solid Opaque Surfaces)**: Never make the app UI transparent or translucent (`rgba`, `BlurView`, or `opacity < 1`). Always use 100% solid, fully opaque surfaces (`#FFFFFF` in Light mode / `#0A0F1A` in Dark mode) for headers, bottom tabs, sheets, FABs, and modal dialogs to guarantee maximum contrast and eliminate map background bleed-through.

