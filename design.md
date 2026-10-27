# B Map — Design Document

> **Version:** 1.0 · **Last Updated:** 2026-10-26
> **Platform:** Expo SDK 57 · React Native 0.86 · TypeScript 6

---

## 1. Product Vision

**B Map** is a next-generation, India-first navigation and mobility super-app that unifies driving navigation, public transit planning, EV infrastructure, fleet logistics, smart parking, and citizen safety into a single experience — built natively for iOS and Android with Expo.

### 1.1 Core Pillars

| Pillar | Description |
|---|---|
| **Navigation First** | Turn-by-turn guidance with real-time voice prompts, compass HUD, and alternative route suggestions |
| **Mobility Convergence** | Drive, transit, EV charging, parking, and fleet management in one app |
| **India-Centric** | DigiPin geocoding, Indian road context, smart city services integration |
| **AI-Augmented** | Voice-activated AI Copilot for hands-free navigation commands and contextual assistance |
| **Safety** | SOS distress broadcasting and community-driven hazard reporting |

---

## 2. System Architecture

### 2.1 Architecture Style

The project follows a **Feature-Sliced / Domain-Driven Vertical Slice** architecture. Each domain (map, navigation, parking, etc.) is fully self-contained with its own screens, components, hooks, and types.

```
src/
├── app/              ← Expo Router file-system routing (thin controllers)
├── features/         ← Vertical domain slices (business logic lives here)
└── shared/           ← Domain-agnostic primitives & cross-cutting infrastructure
```

### 2.2 Layer Responsibilities

| Layer | Directory | Responsibility | Rules |
|---|---|---|---|
| **Routing** | `src/app/` | URL → Screen mapping via Expo Router | < 20 lines per file; zero business logic |
| **Features** | `src/features/<domain>/` | All domain logic, UI, hooks, and types | High cohesion; import only from own feature or `shared/` |
| **Shared** | `src/shared/` | Design tokens, generic UI, cross-cutting hooks, services, utils | **Must never** import from `features/` |

### 2.3 Navigation Graph

The root layout ([`_layout.tsx`](file:///D:/b_map_native/src/app/_layout.tsx)) defines a `Stack` navigator wrapping:

- **`(tabs)`** — Bottom tab navigator with 5 primary tabs
- **Modal stack** — Full-screen and sheet modals for feature screens

```
RootStack
├── (tabs)                   [Tab Navigator]
│   ├── index      → Explore (MapHomeScreen)
│   ├── routes     → Routes  (RoutesScreen)
│   ├── nearby     → Nearby  (NearbyScreen)
│   ├── services   → Services (ServicesScreen)
│   └── mine       → Mine    (ProfileScreen)
│
├── search              [modal: fade_from_bottom]
├── ai-copilot          [modal: slide_from_bottom]
├── compass-hud         [fullScreenModal: fade]
├── auth                [modal: slide_from_bottom]
├── sos-distress        [fullScreenModal: fade]
├── hazard-report       [modal: slide_from_bottom]
├── indoor-parking      [modal: slide_from_bottom]
├── ev-station          [modal: slide_from_bottom]
├── transit-planner     [modal: slide_from_bottom]
├── digipin-explorer    [modal: slide_from_bottom]
├── tsp-optimizer       [modal: slide_from_bottom]
└── vehicle-fleet       [modal: slide_from_bottom]
```

### 2.4 Provider Hierarchy

```
GestureHandlerRootView
  └── GlobalErrorBoundary
        └── ThemeProvider (BMap design tokens)
              └── NavThemeProvider (Expo Router light/dark)
                    └── Stack Navigator
```

---

## 3. Design System

### 3.1 Color System

Material 3–inspired dual-palette system defined in [`BMapTheme.ts`](file:///D:/b_map_native/src/shared/constants/BMapTheme.ts):

| Role | Light | Dark |
|---|---|---|
| **Primary** | `#0061a7` | `#a1c9ff` |
| **Secondary** | `#006d3b` | `#44e189` |
| **Tertiary** | `#8b5000` | `#ffb870` |
| **Surface** | `#f9f9ff` | `#0f1624` |
| **Error** | `#ba1a1a` | `#ffb4ab` |
| **Traffic Green** | `#00C06D` | `#00E47F` |
| **Traffic Orange** | `#FF9800` | `#FFB347` |
| **Traffic Red** | `#F44336` | `#FF6B6B` |

Runtime selection: `getThemeColors(scheme)` helper returns the correct palette.

### 3.2 Design Tokens ([`tokens.ts`](file:///D:/b_map_native/src/shared/constants/tokens.ts))

| Token | Scale |
|---|---|
| **Spacing** | `0 → 2 → 4 → 8 → 12 → 16 → 20 → 24 → 32 → 40 → 48` |
| **Radius** | `0 → 6 → 10 → 14 → 18 → 24 → 32 → 9999` |
| **Shadows** | `none → xs → sm → md → lg → xl → glow` (plus a primary `glow` shadow) |
| **Typography** | `display · headline · titleLarge/Medium/Small · bodyLarge/Medium/Small · labelLarge/Medium/Small` |
| **Transitions** | Fast `150ms` · Normal `250ms` · Slow `400ms` · Spring `friction: 7, tension: 40` |

### 3.3 Styling Approach

- **NativeWind (TailwindCSS 3.4)** for utility-first styling via [`tailwind.config.js`](file:///D:/b_map_native/tailwind.config.js)
- **React Native `StyleSheet`** for performance-critical components
- **Reanimated 4.x** for 60fps gesture-driven animations
- Theme-aware components via `useTheme()` hook → automatic light/dark switching

---

## 4. Feature Modules

### 4.1 Feature Catalog

Each feature lives in `src/features/<name>/` and follows a uniform internal structure:

```
<feature>/
├── components/    # Feature-scoped UI components
├── hooks/         # Feature-specific state & logic hooks
├── screens/       # Full-page screen implementations
├── types/         # Domain types & contracts
└── index.ts       # Public API barrel
```

| Feature | Domain | Key Screens | Description |
|---|---|---|---|
| **`map`** | Core | `MapHomeScreen` | Vector map engine, layer management, HUD overlay |
| **`navigation`** | Core | `RoutesScreen`, `TurnByTurnNavModal` | Route planning, turn-by-turn guidance, voice prompts |
| **`compass`** | Core | `CompassHudScreen` | Real-time compass heading with accelerometer/magnetometer fusion |
| **`search`** | Discovery | `SearchScreen`, `DigiPinExplorerScreen` | Universal search + India's DigiPin geocoding system |
| **`places`** | Discovery | `NearbyScreen` | POI discovery, business listings, category filtering |
| **`copilot`** | AI | `AiCopilotScreen` | Voice-activated AI navigation assistant |
| **`ev-charging`** | Mobility | `EvStationScreen` | EV charging station finder, connector status, booking |
| **`parking`** | Mobility | `IndoorParkingScreen` | Multi-level indoor parking visualization & slot reservation |
| **`transit`** | Mobility | `TransitPlannerScreen` | Public transit route planning, metro lines & schedules |
| **`fleet`** | Logistics | `VehicleFleetScreen`, `TspOptimizerScreen` | Fleet telematics, multi-stop TSP route optimization |
| **`safety`** | Safety | `SosDistressScreen`, `HazardReportScreen` | Emergency SOS broadcast, crowd-sourced hazard alerts |
| **`auth`** | Identity | `AuthScreen` | User authentication & session management |
| **`profile`** | Identity | `ProfileScreen` | User profile, saved places, offline maps management |
| **`services`** | Civic | `ServicesScreen` | Smart city services catalog |

### 4.2 Feature Dependency Graph

```
features/map ←──── features/navigation
     ↑                    ↑
     │                    │
features/search    features/copilot (AI voice → navigation commands)
     ↑
     │
features/places

features/safety  (independent — SOS + Hazard)
features/parking (independent — indoor parking engine)
features/ev-charging (independent — EV station finder)
features/transit (independent — transit planner)
features/fleet   (independent — fleet management + TSP)

All features ──→ shared/ (design tokens, location, storage, speech)
```

---

## 5. Data & Services Layer

### 5.1 Shared Services ([`src/shared/services/`](file:///D:/b_map_native/src/shared/services))

| Service | Pattern | Responsibility |
|---|---|---|
| [`LocationService`](file:///D:/b_map_native/src/shared/services/LocationService.ts) | Singleton + Pub/Sub | Permission handling, single-shot positioning, live GPS tracking with reference-counted subscribers |
| [`StorageService`](file:///D:/b_map_native/src/shared/services/StorageService.ts) | Singleton + Memory Cache | Preferences, saved places, search history, EV profile — in-memory cache with async disk persistence |
| [`SpeechService`](file:///D:/b_map_native/src/shared/services/SpeechService.ts) | Singleton | Text-to-speech for turn-by-turn voice guidance with mute toggle |
| [`CompassService`](file:///D:/b_map_native/src/shared/services/CompassService.ts) | Singleton + Pub/Sub | Magnetometer + accelerometer sensor fusion for heading data |

### 5.2 Storage Schema

| Key | Type | Purpose |
|---|---|---|
| `@bmap/user_preferences` | `UserPreferences` | Theme, voice settings, units, traffic overlay, EV connector types |
| `@bmap/saved_places` | `SavedPlaceItem[]` | User-bookmarked locations with coordinates & categories |
| `@bmap/search_history` | `string[]` | Last 15 search queries (LIFO, deduplicated) |
| `@bmap/ev_profile` | `EvVehicleProfile` | User's EV brand, model, battery capacity, connector type |
| `@bmap/offline_regions` | — | Downloaded map region metadata |
| `@bmap/reservations` | — | Parking slot / EV charging reservations |

### 5.3 Location Strategy

```
Permission Request (deduplicated)
        ↓
getCurrentLocation()  ← Balanced accuracy, fast fallback to last known
        ↓
startLocationUpdates() ← High accuracy, 5m distance interval, 2.5s time interval
        ↓
Reference-counted subscribers → auto-stop when last subscriber unsubscribes
        ↓
Fallback: Connaught Place, New Delhi (28.6315°N, 77.2167°E)
```

---

## 6. Cross-Cutting Concerns

### 6.1 Error Handling

- **`GlobalErrorBoundary`** ([`ErrorBoundary.tsx`](file:///D:/b_map_native/src/shared/components/ErrorBoundary.tsx)) wraps the entire app
- Expo Router's built-in `ErrorBoundary` export for route-level errors
- Service-level `try/catch` with `console.warn` fallback (no crash on sensor/storage failures)

### 6.2 Theming

- **Automatic** `light`/`dark` support via `userInterfaceStyle: "automatic"` in [`app.json`](file:///D:/b_map_native/app.json)
- `useColorScheme()` hook with platform-specific implementations (`.ts` / `.web.ts`)
- `ThemeProvider` context distributes `BMapPalette` tokens to all feature components

### 6.3 Animations

- **React Native Reanimated 4.x** for gesture-driven 60fps animations
- **React Native Gesture Handler** for touch gestures (swipe, pinch, pan)
- `useSpringPress` hook for micro-interaction spring-press feedback
- Custom `AnimatedTabBar` component for the bottom navigation

### 6.4 Platform Support

| Platform | Status | Notes |
|---|---|---|
| **Android** | Primary | Full native permissions, adaptive icon, predictive back disabled |
| **iOS** | Supported | `supportsTablet: true`, location permission plist configured |
| **Web** | Experimental | Metro bundler, static output, web-specific hook implementations |

### 6.5 Path Aliases

Configured in [`tsconfig.json`](file:///D:/b_map_native/tsconfig.json):

| Alias | Target |
|---|---|
| `@/*` | `./src/*` |
| `@/features` | `./src/features/index.ts` |
| `@/features/*` | `./src/features/*` |
| `@/shared` | `./src/shared/index.ts` |
| `@/shared/*` | `./src/shared/*` |
| `@/app/*` | `./src/app/*` |

---

## 7. Technology Stack

| Category | Technology | Version |
|---|---|---|
| Framework | Expo | SDK 57 |
| Runtime | React Native | 0.86.3 |
| Language | TypeScript | 6.0.3 |
| Navigation | Expo Router | 57.x |
| Styling | NativeWind + TailwindCSS | 4.2.7 / 3.4.19 |
| Maps | react-native-maps | 1.27.2 |
| Animation | Reanimated + Gesture Handler | 4.5.1 / 2.32.0 |
| Icons | lucide-react-native | 1.55.0 |
| Persistence | AsyncStorage | 2.2.0 |
| Location | expo-location | 57.x |
| Speech | expo-speech | 57.x |
| Sensors | expo-sensors | 57.x |
| Haptics | expo-haptics | 57.x |
| Linting | ESLint + eslint-config-expo | 9.x / 57.x |

---

## 8. Build & Deployment

- **Development:** `npx expo start` → Expo Go or development builds
- **Native Builds:** `npx expo run:android` / `npx expo run:ios`
- **Cloud Builds:** EAS Build (`bunx eas-cli build`)
- **OTA Updates:** EAS Update (`bunx eas-cli update`)
- **CNG (Continuous Native Generation):** No committed `ios/` directory; `android/` generated at build time
- **URL Scheme:** `bmapnative://` for deep linking
- **Typed Routes:** Enabled via `experiments.typedRoutes: true`

---

## 9. Dynamic App Icon & Compass Rotation Architecture

### 9.1 Overview & Dual Implementation

B Map provides a dual-layer dynamic compass icon experience:

1. **In-App Micro-Compass (`DynamicCompassIcon`):**
   - High-performance Reanimated SVG component rendering at 60/120fps.
   - Rotates smoothly to device heading and tilts physically in 3D perspective with pitch and roll sensors.
   - Used in the Navigation Tab Bar, Map HUD, Compass HUD modal, and Profile settings.

2. **OS Launcher Dynamic App Icon (`DynamicAppIconService`):**
   - Dynamic alternate app icon switching natively on iOS and Android via `@howincodes/expo-dynamic-app-icon`.
   - **Compass Auto-Sync Mode:** When user exits the app or navigates, the home screen launcher icon rotates to the cardinal direction (North, East, South, West) matching device orientation.

### 9.2 OS Optimization & Platform Specifications

| Platform | Mechanism | Technical Implementation | User Experience |
|---|---|---|---|
| **iOS** | `CFBundleAlternateIcons` | Configured in `Info.plist` with `@1x`, `@2x`, `@3x` asset catalogs | Silent background update (`isInBackground: true`) without jarring system alerts |
| **Android** | `<activity-alias>` | Enabled/disabled aliases target `.MainActivity` with adaptive mipmaps | Instant refresh without app restarts or process termination |
| **Web / Sim** | Graceful fallback | In-memory & `AsyncStorage` persistence | Real-time simulator preview without runtime crashes |

### 9.3 Cardinal Directions & Icon Variants

| Icon Key | Target Heading | Image Asset | Color Token |
|---|---|---|---|
| `DEFAULT` | N/A | `assets/images/icon.png` | `#3865F3` |
| `compassNorth` | 315° – 45° (North) | `assets/images/icon-compass-north.png` | `#3865F3` |
| `compassEast` | 45° – 135° (East) | `assets/images/icon-compass-east.png` | `#3865F3` |
| `compassSouth` | 135° – 225° (South) | `assets/images/icon-compass-south.png` | `#3865F3` |
| `compassWest` | 225° – 315° (West) | `assets/images/icon-compass-west.png` | `#3865F3` |
