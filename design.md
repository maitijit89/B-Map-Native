---
version: "1.0"
name: "B-Map Sovereign Mobile Design System"
description: "Flowstep UI/UX guidelines and design tokens for B-Map Sovereign Indian Navigation."
colors:
  primary: "#0096FF"
  primaryContainer: "#E8F4FF"
  backgroundDark: "#0B132B"
  backgroundLight: "#F8FAFC"
  surfaceDark: "#1C2541"
  surfaceLight: "#FFFFFF"
  navicGreen: "#00C06D"
  warningOrange: "#FF9800"
  dangerRed: "#F44336"
  textPrimaryDark: "#F8FAFC"
  textPrimaryLight: "#0F172A"
  textSecondaryDark: "#94A3B8"
  textSecondaryLight: "#64748B"
typography:
  fontFamily: "System"
  scale:
    headlineLarge: "28px / 34px Bold"
    headlineMedium: "22px / 28px SemiBold"
    titleLarge: "18px / 24px SemiBold"
    titleMedium: "16px / 22px Medium"
    bodyLarge: "15px / 22px Regular"
    bodyMedium: "13px / 18px Regular"
    labelSmall: "11px / 14px SemiBold"
rounded:
  chip: "10px"
  card: "16px"
  modal: "24px"
  button: "12px"
  pill: "999px"
spacing:
  baseUnit: "4px"
  screenPadding: "16px"
  cardPadding: "14px"
  itemGap: "10px"
components:
  button: "Minimum touch target 48px height, medium haptics on press, fluid feedback"
  card: "Surface-based elevation with 1px border outline for high contrast in dark/light modes"
  bottomDock: "Fixed bottom ergonomic thumb-zone action bar with safe area inset accounting"
---

# B-Map Mobile UI/UX Design Guidelines (Flowstep Standard)

## 1. Visual Hierarchy & Surface Tokens
- **Color Elevation**: Surfaces elevate from dark navy (`#0B132B`) $\to$ elevated container (`#1C2541`) $\to$ active interactive card (`#25324D`).
- **Brand Colors**: Indian sovereign navigation blue (`#0096FF`), ISRO NavIC satellite emerald green (`#00C06D`), FASTag orange (`#FF9800`), and SOS emergency red (`#F44336`).
- **Borders & Separation**: Never use invisible dividers; use 1px border lines with subtle opacity (`rgba(255,255,255,0.08)` or theme tokens) for crisp visual distinction.

## 2. Thumb-Zone Ergonomics & Mobile Navigation
- **Primary Actions in Thumb Zone**: Primary actions (e.g. "Start Navigation", "Broadcast Hazard", "Book Metro Pass") must reside in docked bottom containers (`bottomDock`) with `useSafeAreaInsets().bottom` protection.
- **Top Bar Simplicity**: Restrict the top header to non-destructive back navigation, context titles, and quick-status pills (e.g. NavIC L5+S satellite lock).
- **Minimum Tap Targets**: All buttons, chips, and icons must meet or exceed $44 \times 44\text{pt}$ (recommended $48\text{pt}$) to prevent mis-taps while driving or on the move.

## 3. Micro-Interactions & Multi-Sensory Feedback
- **Tactile Feedback**:
  - `haptics.selection()` for tab switching, segment clicks, and filter selection.
  - `haptics.medium()` for launching modals and action sheets.
  - `haptics.success()` on verified submission (e.g. Hazard Report, FASTag Recharge).
  - `haptics.heavy()` on SOS distress trigger.
- **Vernacular Audio Prompts**: Pair visual alerts with spoken voice advisories in English, Bengali, and Hindi via `speechService`.

## 4. State Management & Feedback
- **Active Selection**: Selected cards or chips should exhibit a distinct accent outline, 15% tinted background fill, and a visible checkmark or icon badge.
- **Empty & Error States**: Include informative descriptions, recovery actions, and illustrative icons rather than empty white space.
- **Live Counters**: Use countdown badges for expiring reservations (e.g. 15-minute parking bay hold, Metro QR ticket validity).

## 5. Accessibility & Contrast (WCAG AA Compliance)
- Maintain contrast ratios $> 4.5:1$ for normal text and $> 3:1$ for large text/icons across both light and dark themes.
- Ensure all touchable elements provide accessible labels (`accessibilityRole="button"`, `accessibilityLabel="Description"`).
