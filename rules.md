# B Map — Development Rules

> **Version:** 1.0 · **Last Updated:** 2026-10-26
> Mandatory conventions for all contributors. Violations must be resolved before merge.

---

## 1. Architecture Rules

### 1.1 Thin Route Controllers

- Every file in `src/app/` is a **route** — not a screen implementation.
- Route files **must be < 20 lines**. They import and render a feature screen, passing route params if needed.
- **No business logic, no inline styles, no state management** in route files.

```typescript
// ✅ Correct — thin route controller
import { EvStationScreen } from '@/features/ev-charging';
export default function EvStationRoute() {
  return <EvStationScreen />;
}

// ❌ Wrong — logic in route file
export default function EvStationRoute() {
  const [data, setData] = useState([]);
  useEffect(() => { fetch('/api/stations').then(r => setData(r)); }, []);
  return <View>{data.map(...)}</View>;
}
```

### 1.2 Feature Encapsulation

- Every feature owns its `components/`, `hooks/`, `screens/`, and `types/` directories.
- If a component is only used within one feature, it **must** live inside that feature's directory.
- Features expose their public API through a barrel `index.ts` file. **All external imports must go through the barrel.**

```typescript
// ✅ Import through barrel
import { MapHomeScreen, VectorMapCanvas } from '@/features/map';

// ❌ Deep import into feature internals
import { VectorMapCanvas } from '@/features/map/components/VectorMapCanvas';
```

### 1.3 Shared Layer Independence

- `src/shared/` must **never** import from `src/features/`.
- Shared modules are domain-agnostic: design tokens, generic UI primitives, cross-cutting hooks, services, and pure utility functions.
- If a "shared" module references a domain concept (e.g., `parking`, `transit`), it belongs in a feature instead.

### 1.4 Dependency Direction

```
src/app/  →  src/features/  →  src/shared/
              ↑                    ↑
              │ (never)            │ (never)
              └────────────────────┘
```

- `app/` may import from `features/` and `shared/`.
- `features/` may import from `shared/` only.
- `shared/` imports from no project code — only third-party packages.
- Cross-feature imports are **forbidden**. Extract shared logic to `src/shared/` first.

---

## 2. Naming & File Conventions

### 2.1 File Naming

| Type | Convention | Example |
|---|---|---|
| Screen component | `PascalCase` + `Screen` suffix | `MapHomeScreen.tsx` |
| Reusable component | `PascalCase` | `VectorMapCanvas.tsx` |
| Hook | `camelCase` with `use` prefix | `useLocation.ts` |
| Service | `PascalCase` + `Service` suffix | `LocationService.ts` |
| Type file | `camelCase` or `PascalCase` | `types.ts`, `MapTypes.ts` |
| Barrel export | Always `index.ts` | `index.ts` |
| Constants | `PascalCase` | `BMapTheme.ts`, `tokens.ts` |
| Route file | `kebab-case` | `ev-station.tsx`, `ai-copilot.tsx` |
| Layout file | `_layout.tsx` | `_layout.tsx` |

### 2.2 Directory Naming

- Feature directories: **`kebab-case`** (e.g., `ev-charging`, `map`, `safety`)
- Structural directories: **`lowercase`** (e.g., `components`, `hooks`, `screens`, `types`, `utils`)

### 2.3 Export Conventions

- One default export per screen component (used by route files).
- Named exports for everything else (components, hooks, types, services).
- Barrel `index.ts` files re-export only the feature's public API — not internal helpers.

---

## 3. TypeScript Rules

### 3.1 Strict Mode

- `strict: true` is enabled in `tsconfig.json`. **No `// @ts-ignore` or `// @ts-expect-error` without a JIRA ticket comment.**
- All function parameters, return types on public APIs, and shared interfaces must be explicitly typed.

### 3.2 Type Organization

- Feature-specific types live in `src/features/<feature>/types/`.
- Shared primitives (`LatLng`, `BaseEntity`, etc.) live in `src/shared/types/`.
- Avoid `any`. Use `unknown` with type guards when dealing with external data.

### 3.3 Path Aliases

Always use path aliases. **Never use relative paths that traverse above the current feature directory.**

```typescript
// ✅ Correct
import { Spacing, Radius } from '@/shared/constants';

// ❌ Wrong
import { Spacing } from '../../../shared/constants/tokens';
```

---

## 4. Component Rules

### 4.1 Component Design

- Components should be **functional** (no class components).
- Use `React.memo()` for components that receive stable props and render often (e.g., map markers, list items).
- Avoid inline object/array/function creation in JSX props — extract to `useMemo`/`useCallback` when it causes re-renders.

### 4.2 Styling Hierarchy

1. **NativeWind / TailwindCSS** — preferred for layout, spacing, and common patterns.
2. **`StyleSheet.create()`** — for performance-critical styles or complex computed styles.
3. **Inline styles** — only for truly dynamic values (e.g., `{ opacity: animatedValue }`).
4. **Never mix** `className` and `style` on the same component for the same property.

### 4.3 Design Token Usage

- **Always** use tokens from [`tokens.ts`](file:///D:/b_map_native/src/shared/constants/tokens.ts) for spacing, radius, shadows, and typography.
- **Always** use colors from [`BMapTheme.ts`](file:///D:/b_map_native/src/shared/constants/BMapTheme.ts) via `getThemeColors()` or `useTheme()`.
- **Never** hardcode hex colors, pixel values for spacing, or font sizes.

```typescript
// ✅ Correct
const styles = StyleSheet.create({
  container: { padding: Spacing.lg, borderRadius: Radius.md },
});

// ❌ Wrong
const styles = StyleSheet.create({
  container: { padding: 16, borderRadius: 14 },
});
```

---

## 5. State Management Rules

### 5.1 State Hierarchy

| Scope | Solution | Example |
|---|---|---|
| Component-local | `useState`, `useReducer` | Form inputs, toggle visibility |
| Feature-wide | Custom hooks in `features/<name>/hooks/` | `useNavigation`, `useMapLayers` |
| Cross-cutting | Shared hooks in `shared/hooks/` | `useLocation`, `useColorScheme`, `useCompass` |
| Persistent | `StorageService` (AsyncStorage + in-memory cache) | Preferences, saved places |

### 5.2 Service Singletons

- All shared services (`locationService`, `storageService`, `speechService`, `compassService`) are **module-level singletons**.
- **Never** instantiate a new service instance. Import the singleton export.
- Services use **pub/sub with reference counting** — always unsubscribe in cleanup effects.

```typescript
// ✅ Correct cleanup pattern
useEffect(() => {
  const callback = (loc: LocationCoordinates) => setLocation(loc);
  locationService.startLocationUpdates(callback);
  return () => locationService.stopLocationUpdates(callback);
}, []);
```

---

## 6. Navigation Rules

### 6.1 Expo Router

- All navigation uses **Expo Router** file-system routing.
- Import `Link`, `router`, `useLocalSearchParams` from `expo-router`.
- Route params must be typed. Use `useLocalSearchParams<{ id: string }>()`.

### 6.2 Modal Presentation

- Feature screens that overlay the map use **modal** or **fullScreenModal** presentation.
- Safety-critical screens (`sos-distress`, `compass-hud`) use `fullScreenModal` with `fade` animation.
- All other feature modals use `slide_from_bottom` animation.
- Default page transitions use `slide_from_right` at 250ms.

### 6.3 Tab Bar

- The tab bar uses a custom [`AnimatedTabBar`](file:///D:/b_map_native/src/shared/components/navigation/AnimatedTabBar.tsx) component.
- Tab icons from `lucide-react-native` with `strokeWidth` toggle: `2.5` when focused, `1.8` when unfocused.
- The Explore tab uses a custom `DynamicCompassIcon` instead of a lucide icon.

---

## 7. Performance Rules

### 7.1 General

- **No synchronous blocking** on the JS thread for sensor data, storage, or network calls.
- Location updates use `distanceInterval: 5m` and `timeInterval: 2500ms` — do not decrease without profiling.
- Use `Reanimated` worklets for animation logic — keep animations off the JS thread.

### 7.2 Lists

- Prefer `FlatList` or `SectionList` over `.map()` for any list > 10 items.
- Always provide `keyExtractor` and `getItemLayout` where possible.
- Use `React.memo()` on list item components.

### 7.3 Images & Assets

- Use appropriately sized images. No 4K images for thumbnail slots.
- Adaptive icons configured in [`app.json`](file:///D:/b_map_native/app.json) with separate foreground, background, and monochrome layers.

---

## 8. Error Handling Rules

### 8.1 Strategy

- **Services:** `try/catch` with `console.warn` + graceful fallback (never crash on sensor/storage failures).
- **Components:** Wrap risky component trees in error boundaries.
- **Global:** `GlobalErrorBoundary` at root catches unhandled component errors.

### 8.2 Location Fallback

- If permission is denied or location fails, **always** fall back to `DEFAULT_FALLBACK_LOCATION` (Connaught Place, New Delhi).
- Never show an empty map or crash on location failure.

### 8.3 Storage Fallback

- If `AsyncStorage` read fails, return `DEFAULT_PREFERENCES` or empty arrays.
- The in-memory cache layer ensures subsequent reads succeed even if disk is temporarily unavailable.

---

## 9. Package Management Rules

- **Always** use `npx expo install <package>` to add dependencies — it resolves SDK-compatible versions.
- **Never** use `npm install`, `yarn add`, or `bun add` for packages that touch native code.
- Run `npx expo-doctor` after adding dependencies to detect incompatibilities.
- Run `npx expo install --fix` to auto-resolve version mismatches.

---

## 10. Quality Gates

### 10.1 Pre-Commit Checklist

- [ ] `npx expo lint` — zero warnings, zero errors
- [ ] `npx tsc --noEmit` — successful type check
- [ ] Route files remain < 20 lines
- [ ] No cross-feature imports
- [ ] No hardcoded colors, spacing, or font sizes
- [ ] All new shared hooks/services tested with cleanup effects
- [ ] `shared/` has zero imports from `features/`

### 10.2 PR Review Criteria

- Architecture rules (§1) violations are **blockers** — always reject.
- Naming convention (§2) violations require correction.
- Missing design tokens (§4.3) require correction.
- Missing cleanup in `useEffect` for subscriptions is a **blocker**.

---

## 11. Platform-Specific Rules

### 11.1 Expo & CNG

- `ios/` does **not** exist in the repo — it is generated by Continuous Native Generation.
- `android/` may be committed for custom native configuration but should be minimally edited.
- All native configuration goes in `app.json` and Expo config plugins.
- After adding a library with native code, a **development build** is required (not Expo Go).

### 11.2 Web Compatibility

- Platform-specific files use the `.web.ts` / `.web.tsx` extension convention.
- Hooks like `useColorScheme` and `useClientOnlyValue` have platform-split implementations.
- Web support is **experimental** — Android and iOS are the primary targets.

---

## 12. Security Rules

- **No API keys** or secrets in source code. Use Expo's `expo-constants` or EAS secrets.
- Location data must only be collected when the user has **actively granted foreground permission**.
- The SOS distress feature must **never** auto-trigger — it requires explicit user activation.
- Search history is stored **only locally** on-device via AsyncStorage. No server telemetry.

---

## 13. Dynamic App Icon & Sensor Rules

### 13.1 Dynamic App Icon Asset Requirements

- All dynamic launcher icon assets must be valid PNG files located in `./assets/images/` and declared in `app.json` under `@howincodes/expo-dynamic-app-icon`.
- Android icons must supply both `foregroundImage` and `backgroundColor` (e.g. `#3865F3`) to support adaptive icons across all Android launcher themes (circular, squircle, teardrop).
- iOS icons must provide 1024x1024 square PNG assets without alpha transparency in accordance with Apple Human Interface Guidelines.

### 13.2 Non-Disruptive Dynamic Switching

- Launcher icon updates triggered automatically by compass heading synchronization must set `isInBackground: true` so the iOS operating system updates the icon silently without displaying a modal alert dialog.
- Sensor streaming must never trigger virtual DOM re-renders for compass animations. Components must use Reanimated shared values (`useSharedValue`, `useAnimatedStyle`) directly.
- All hardware sensor subscriptions (Magnetometer, Gyroscope, Location heading) must pause when `AppState` becomes `background` or `inactive` to preserve device battery life.
