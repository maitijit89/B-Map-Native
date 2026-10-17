# B-Map Production Architecture Guide

This project follows a **Feature-Sliced / Domain-Driven Vertical Slice** architecture optimized for **Expo Router (SDK 57+)** and **React Native**.

---

## 1. Directory Tree & Separation of Concerns

```text
src/
├── app/                  # Expo Router file-system routing ONLY (thin route controllers)
│   ├── (tabs)/           # Tab navigator group
│   │   ├── _layout.tsx   # Tab bar navigation configuration & icons
│   │   ├── index.tsx     # Route: / -> <MapHomeScreen />
│   │   ├── routes.tsx    # Route: /routes -> <RoutesScreen />
│   │   ├── nearby.tsx    # Route: /nearby -> <NearbyScreen />
│   │   ├── services.tsx  # Route: /services -> <ServicesScreen />
│   │   └── mine.tsx      # Route: /mine -> <ProfileScreen />
│   ├── _layout.tsx       # Root layout: ThemeProvider, font loaders, global Modals
│   ├── +html.tsx         # Web head/document template
│   ├── +not-found.tsx    # 404 screen
│   ├── [route].tsx       # Pure route entries delegating to features/
│   └── ...
│
├── features/             # Vertical Domain Slices (Feature Modules)
│   ├── [feature-name]/
│   │   ├── components/   # Feature-specific UI components (not reused outside)
│   │   ├── hooks/        # Feature-specific hooks & state management
│   │   ├── screens/      # Full-page feature screen implementations
│   │   ├── types/        # Feature domain types & contracts
│   │   └── index.ts      # Public API barrel for the feature
│   │
│   ├── auth/             # User authentication, biometrics, OTP
│   ├── copilot/          # AI Voice navigation copilot & voice agent
│   ├── ev-charging/      # EV charging stations, connector status & booking
│   ├── fleet/            # Fleet telematics & TSP multi-stop route optimization
│   ├── map/              # Core vector map engine, layers & HUD
│   ├── navigation/       # Turn-by-turn guidance, HUD & route alternatives
│   ├── parking/          # Multi-level indoor parking & slot reservation
│   ├── places/           # Nearby POIs, business listings & categories
│   ├── profile/          # User profile, saved places, offline maps
│   ├── safety/           # SOS distress broadcast & road hazard reporting
│   ├── search/           # Universal search & DigiPin geocoding
│   ├── services/         # Smart city services catalog
│   └── transit/          # Public transit planning, metro lines & schedules
│
└── shared/               # Reusable Primitives & Cross-Cutting Infrastructure
    ├── components/       # Core UI primitives (Themed, ExternalLink, MonoText, etc.)
    ├── constants/        # Design system tokens, color palettes (BMapColors, Colors)
    ├── hooks/            # Cross-cutting hooks (useColorScheme, useClientOnlyValue)
    ├── services/         # API clients, local storage, location service
    ├── types/            # Shared primitives (LatLng, BaseEntity, etc.)
    ├── utils/            # Pure utility functions (formatting, geo math)
    └── index.ts          # Public API barrel for shared modules
```

---

## 2. Core Rules & Conventions

### Rule 1: Thin Routes in `src/app/`
- Every file in `src/app/` corresponds to a URL / route.
- Route files **must remain thin** (typically < 20 lines).
- Route files should never define massive inline styles or complex business logic. They simply mount the feature screen from `@/features/*` and pass route parameters if needed.

### Rule 2: High Cohesion within Features
- Everything needed for a feature lives inside its feature folder (`screens`, `components`, `hooks`, `types`).
- If a component is only used by the `parking` feature, it lives in `src/features/parking/components/`, **not** in `shared/components/`.

### Rule 3: Public API Barrels
- Always expose public exports via each feature's `index.ts`.
- External modules or routes import through the feature barrel:
  ```typescript
  import { MapHomeScreen, VectorMapCanvas } from '@/features/map';
  ```

### Rule 4: Shared Layer is Domain-Agnostic
- Code in `src/shared/` must never import from `src/features/`.
- `shared/` contains only design tokens, generic UI primitives, cross-cutting hooks, and pure utilities.

---

## 3. Path Aliases

Configured in `tsconfig.json`:
- `@/*` -> `./src/*`
- `@/features` & `@/features/*` -> `./src/features/*`
- `@/shared` & `@/shared/*` -> `./src/shared/*`
- `@/app/*` -> `./src/app/*`
