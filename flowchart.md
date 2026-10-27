# B Map — Application Flowcharts

> **Version:** 1.0 · **Last Updated:** 2026-10-26
> Visual diagrams of the primary user flows, data flows, and system interactions.

---

## 1. Application Boot Sequence

```mermaid
flowchart TD
    A["App Launch"] --> B["SplashScreen.preventAutoHideAsync()"]
    B --> C["Load Custom Fonts<br/>(SpaceMono)"]
    C --> D{Fonts Loaded?}
    D -->|Error| E["throw error<br/>(ErrorBoundary catches)"]
    D -->|Success| F["SplashScreen.hideAsync()"]
    F --> G["GestureHandlerRootView"]
    G --> H["GlobalErrorBoundary"]
    H --> I["ThemeProvider<br/>(BMap Design Tokens)"]
    I --> J["NavThemeProvider<br/>(Light / Dark)"]
    J --> K["Stack Navigator<br/>(Root)"]
    K --> L["(tabs) → Explore Tab<br/>(MapHomeScreen)"]

    style A fill:#0061a7,color:#fff
    style L fill:#006d3b,color:#fff
    style E fill:#ba1a1a,color:#fff
```

---

## 2. Main Navigation Flow

```mermaid
flowchart TD
    subgraph TABS["Bottom Tab Navigator"]
        T1["🧭 Explore<br/>(MapHomeScreen)"]
        T2["🛣️ Routes<br/>(RoutesScreen)"]
        T3["🏪 Nearby<br/>(NearbyScreen)"]
        T4["🚗 Services<br/>(ServicesScreen)"]
        T5["👤 Mine<br/>(ProfileScreen)"]
    end

    T1 -->|"Search bar tap"| S1["🔍 Search<br/>(SearchScreen)"]
    T1 -->|"AI button tap"| S2["🤖 AI Copilot<br/>(AiCopilotScreen)"]
    T1 -->|"Compass tap"| S3["🧭 Compass HUD<br/>(CompassHudScreen)"]
    T1 -->|"Navigate to place"| S4["🗺️ Turn-by-Turn<br/>(TurnByTurnNavModal)"]

    T2 -->|"Plan route"| S4
    T2 -->|"Multi-stop optimize"| S5["📦 TSP Optimizer<br/>(TspOptimizerScreen)"]

    T3 -->|"EV station tap"| S6["⚡ EV Station<br/>(EvStationScreen)"]
    T3 -->|"Parking tap"| S7["🅿️ Indoor Parking<br/>(IndoorParkingScreen)"]

    T4 -->|"Transit planning"| S8["🚇 Transit Planner<br/>(TransitPlannerScreen)"]
    T4 -->|"Fleet management"| S9["🚛 Vehicle Fleet<br/>(VehicleFleetScreen)"]
    T4 -->|"DigiPin lookup"| S10["📍 DigiPin Explorer<br/>(DigiPinExplorerScreen)"]

    T5 -->|"Not authenticated"| S11["🔐 Auth<br/>(AuthScreen)"]

    T1 -->|"SOS button"| S12["🆘 SOS Distress<br/>(SosDistressScreen)"]
    T1 -->|"Report hazard"| S13["⚠️ Hazard Report<br/>(HazardReportScreen)"]

    style TABS fill:#f0f3ff,stroke:#0061a7
    style S12 fill:#ba1a1a,color:#fff
    style S2 fill:#8b5000,color:#fff
```

---

## 3. Location Permission & GPS Flow

```mermaid
flowchart TD
    A["Feature requests location"] --> B["locationService.requestPermissions()"]
    B --> C{Permission<br/>already cached?}
    C -->|Yes| D{Granted?}
    C -->|No| E{Pending promise<br/>in flight?}
    E -->|Yes| F["Await existing promise<br/>(deduplication)"]
    E -->|No| G["Location.requestForegroundPermissionsAsync()"]
    G --> H{User response}
    H -->|Granted| I["Cache: granted = true"]
    H -->|Denied| J["Cache: granted = false"]
    I --> D
    J --> D
    F --> D

    D -->|Yes| K["Location.getCurrentPositionAsync()<br/>(Balanced accuracy)"]
    D -->|No| L["Return DEFAULT_FALLBACK<br/>(Connaught Place, Delhi)"]

    K --> M{Success?}
    M -->|Yes| N["Update lastLocation<br/>Return coordinates"]
    M -->|No| O["Return lastLocation<br/>(graceful fallback)"]

    style A fill:#0061a7,color:#fff
    style L fill:#FF9800,color:#fff
    style O fill:#FF9800,color:#fff
    style N fill:#006d3b,color:#fff
```

---

## 4. Live GPS Tracking Flow

```mermaid
flowchart TD
    A["Component mounts"] --> B["locationService.startLocationUpdates(callback)"]
    B --> C["Add callback to subscribers Set"]
    C --> D["Send cached lastLocation<br/>immediately (no UI stutter)"]
    D --> E{Permission<br/>granted?}
    E -->|No| F["Return false"]
    E -->|Yes| G{First subscriber?<br/>(subscribers.size === 1)}
    G -->|Yes| H["Location.watchPositionAsync()<br/>accuracy: High<br/>distance: 5m<br/>interval: 2500ms"]
    G -->|No| I["Reuse existing watcher"]

    H --> J["On new position"]
    I --> J
    J --> K["Update lastLocation"]
    K --> L["Notify all subscribers"]
    L --> J

    M["Component unmounts"] --> N["locationService.stopLocationUpdates(callback)"]
    N --> O["Remove callback from Set"]
    O --> P{Set empty?}
    P -->|Yes| Q["subscription.remove()<br/>Stop GPS watcher"]
    P -->|No| R["Keep watcher running<br/>for remaining subscribers"]

    style A fill:#0061a7,color:#fff
    style Q fill:#ba1a1a,color:#fff
    style H fill:#006d3b,color:#fff
```

---

## 5. Turn-by-Turn Navigation Flow

```mermaid
flowchart TD
    A["User sets destination"] --> B["RoutesScreen:<br/>Calculate route alternatives"]
    B --> C["Display route options<br/>(fastest, shortest, scenic)"]
    C --> D["User selects route"]
    D --> E["Open TurnByTurnNavModal"]

    E --> F["Start live GPS tracking"]
    F --> G["Start compass heading updates"]
    G --> H["Begin voice guidance<br/>(SpeechService)"]

    H --> I{"Next maneuver<br/>approaching?"}
    I -->|"≤ 200m"| J["Voice prompt:<br/>'In 200 meters, turn right'"]
    I -->|"≤ 50m"| K["Voice prompt:<br/>'Turn right now'"]
    I -->|"On course"| L["Update HUD distance<br/>& ETA"]

    J --> I
    K --> M["Advance to next step"]
    M --> I
    L --> I

    I -->|"Deviation detected"| N["Recalculate route"]
    N --> I

    I -->|"Arrived"| O["Voice: 'You have arrived'"]
    O --> P["Stop GPS, compass, speech"]
    P --> Q["Dismiss modal"]

    style A fill:#0061a7,color:#fff
    style O fill:#006d3b,color:#fff
    style N fill:#FF9800,color:#fff
```

---

## 6. Search & DigiPin Flow

```mermaid
flowchart TD
    A["User taps search bar"] --> B["Open SearchScreen<br/>(fade_from_bottom)"]
    B --> C["Load search history<br/>(StorageService)"]
    C --> D["Display recent searches"]

    D --> E["User types query"]
    E --> F{Query type?}

    F -->|"Text query"| G["Fuzzy search POIs<br/>& addresses"]
    F -->|"DigiPin code"| H["DigiPin geocode<br/>→ lat/lng resolution"]
    F -->|"Coordinates"| I["Direct coordinate<br/>lookup"]

    G --> J["Display results list"]
    H --> J
    I --> J

    J --> K["User taps result"]
    K --> L["Save to search history<br/>(max 15, deduplicated)"]
    L --> M["Navigate to location<br/>on map"]

    D --> N["User taps 'DigiPin Explorer'"]
    N --> O["Open DigiPinExplorerScreen"]
    O --> P["Enter/scan DigiPin"]
    P --> Q["Resolve to coordinates"]
    Q --> M

    style A fill:#0061a7,color:#fff
    style M fill:#006d3b,color:#fff
```

---

## 7. EV Charging Station Flow

```mermaid
flowchart TD
    A["User opens EV Station"] --> B["Load EV profile<br/>(StorageService)"]
    B --> C{Profile exists?}
    C -->|No| D["Prompt: Set up EV vehicle<br/>(brand, model, battery, connector)"]
    D --> E["Save EV profile"]
    C -->|Yes| F["Get current location"]
    E --> F

    F --> G["Search nearby stations<br/>filtered by connector type"]
    G --> H["Display station list<br/>with distance & status"]

    H --> I["User taps station"]
    I --> J["Show station details<br/>(connectors, availability,<br/>pricing, amenities)"]

    J --> K{Action?}
    K -->|"Navigate"| L["Route to station"]
    K -->|"Book slot"| M["Reserve connector<br/>(save to reservations)"]
    K -->|"View reviews"| N["Show ratings &<br/>user reviews"]

    style A fill:#0061a7,color:#fff
    style L fill:#006d3b,color:#fff
    style M fill:#8b5000,color:#fff
```

---

## 8. SOS Distress Emergency Flow

```mermaid
flowchart TD
    A["User triggers SOS<br/>(explicit action required)"] --> B["Open SosDistressScreen<br/>(fullScreenModal + fade)"]
    B --> C["Confirm SOS activation<br/>(prevent accidental trigger)"]

    C --> D{Confirmed?}
    D -->|No| E["Dismiss modal"]
    D -->|Yes| F["Get high-accuracy location"]

    F --> G["Broadcast distress signal<br/>with coordinates"]
    G --> H["Start continuous<br/>location tracking"]
    H --> I["Display countdown<br/>& distress status"]

    I --> J["Contact emergency services"]
    I --> K["Alert emergency contacts"]
    I --> L["Share live location"]

    I --> M{User cancels?}
    M -->|Yes| N["Confirm cancellation"]
    N --> O["Stop broadcast"]
    M -->|No| P["Continue broadcasting<br/>until help arrives"]

    style A fill:#ba1a1a,color:#fff
    style B fill:#ba1a1a,color:#fff
    style G fill:#ba1a1a,color:#fff
    style J fill:#ba1a1a,color:#fff
```

---

## 9. Storage & Caching Strategy Flow

```mermaid
flowchart TD
    A["Component reads data"] --> B["StorageService.get*()"]
    B --> C{In-memory<br/>cache hit?}
    C -->|Yes| D["Return cached value<br/>(synchronous speed)"]
    C -->|No| E["AsyncStorage.getItem()"]
    E --> F{Disk read<br/>success?}
    F -->|Yes| G["Parse JSON"]
    G --> H["Populate cache"]
    H --> I["Return data"]
    F -->|No| J["Return default value<br/>(graceful fallback)"]
    J --> K["Cache default value"]

    L["Component writes data"] --> M["StorageService.save*()"]
    M --> N["Update in-memory cache<br/>(instant)"]
    N --> O["AsyncStorage.setItem()<br/>(async, non-blocking)"]
    O --> P{Disk write<br/>success?}
    P -->|Yes| Q["Done"]
    P -->|No| R["console.warn<br/>(cache still valid)"]

    style D fill:#006d3b,color:#fff
    style J fill:#FF9800,color:#fff
    style R fill:#FF9800,color:#fff
```

---

## 10. Theme Switching Flow

```mermaid
flowchart TD
    A["App starts"] --> B["Read system color scheme"]
    B --> C["useColorScheme() hook"]
    C --> D{Platform?}

    D -->|"Native"| E["useColorScheme.ts<br/>(Appearance API)"]
    D -->|"Web"| F["useColorScheme.web.ts<br/>(media query listener)"]

    E --> G{Scheme}
    F --> G

    G -->|"light"| H["BMapColors<br/>(Light palette)"]
    G -->|"dark"| I["BMapColorsDark<br/>(Dark palette)"]

    H --> J["ThemeProvider distributes<br/>palette to component tree"]
    I --> J

    J --> K["NavThemeProvider applies<br/>Expo Router theme"]
    K --> L["Components read tokens<br/>via useTheme() hook"]

    style H fill:#f9f9ff,stroke:#0061a7,color:#111
    style I fill:#0f1624,stroke:#a1c9ff,color:#e0e4ef
```

---

## 11. Feature Module Architecture Pattern

```mermaid
flowchart LR
    subgraph ROUTE["src/app/"]
        R1["ev-station.tsx<br/>(thin controller)"]
    end

    subgraph FEATURE["src/features/ev-charging/"]
        direction TB
        SC["screens/<br/>EvStationScreen.tsx"]
        CO["components/<br/>StationCard.tsx<br/>ConnectorBadge.tsx"]
        HK["hooks/<br/>useStationSearch.ts"]
        TY["types/<br/>EVTypes.ts"]
        IX["index.ts<br/>(barrel export)"]

        SC --> CO
        SC --> HK
        SC --> TY
        CO --> TY
        HK --> TY
        IX --> SC
    end

    subgraph SHARED["src/shared/"]
        direction TB
        SVC["services/<br/>LocationService<br/>StorageService"]
        TOK["constants/<br/>BMapTheme<br/>tokens"]
        UTL["hooks/<br/>useTheme<br/>useLocation"]
    end

    R1 -->|"imports"| IX
    SC -->|"imports"| SVC
    SC -->|"imports"| TOK
    SC -->|"imports"| UTL

    style ROUTE fill:#e7eeff,stroke:#0061a7
    style FEATURE fill:#f0fff5,stroke:#006d3b
    style SHARED fill:#fff8f0,stroke:#8b5000
```

---

## 12. Fleet & TSP Optimization Flow

```mermaid
flowchart TD
    A["Fleet Manager opens app"] --> B["VehicleFleetScreen"]
    B --> C["View vehicle fleet<br/>(telematics dashboard)"]
    C --> D["Select vehicles<br/>for delivery run"]

    D --> E["Add delivery stops<br/>(addresses / DigiPins)"]
    E --> F["Open TspOptimizerScreen"]

    F --> G["TSP Algorithm:<br/>Optimize stop order"]
    G --> H["Calculate optimal route<br/>(minimize total distance)"]

    H --> I["Display optimized route<br/>on map with stop numbers"]
    I --> J{Approve route?}

    J -->|"Adjust"| K["Reorder / add / remove stops"]
    K --> G
    J -->|"Accept"| L["Start navigation<br/>(TurnByTurnNavModal)"]

    L --> M["Track delivery progress"]
    M --> N["Mark stops as completed"]
    N --> O{All stops done?}
    O -->|No| M
    O -->|Yes| P["Route completed<br/>Show summary"]

    style A fill:#0061a7,color:#fff
    style P fill:#006d3b,color:#fff
    style G fill:#8b5000,color:#fff
```

---

## 13. Indoor Parking Flow

```mermaid
flowchart TD
    A["User opens Indoor Parking"] --> B["Get current location"]
    B --> C["Search nearby parking<br/>facilities"]
    C --> D["Display parking list<br/>(availability, pricing, distance)"]

    D --> E["User selects facility"]
    E --> F["Show multi-level<br/>floor plan view"]

    F --> G["Browse floors<br/>(swipe between levels)"]
    G --> H["View slot availability<br/>(real-time occupancy)"]

    H --> I{Action?}
    I -->|"Navigate"| J["Route to parking<br/>entrance"]
    I -->|"Reserve"| K["Select floor & slot"]
    K --> L["Confirm reservation<br/>(time + duration)"]
    L --> M["Save to reservations<br/>(StorageService)"]
    M --> N["Navigate to parking"]

    style A fill:#0061a7,color:#fff
    style M fill:#006d3b,color:#fff
```

---

## 14. Public Transit Planning Flow

```mermaid
flowchart TD
    A["User opens Transit Planner"] --> B["Set origin<br/>(current location or manual)"]
    B --> C["Set destination"]
    C --> D["Select travel time<br/>(depart now / arrive by)"]

    D --> E["Query transit routes"]
    E --> F["Display route options"]

    F --> G["Show for each option:<br/>• Mode icons (🚇🚌🚶)<br/>• Duration & transfers<br/>• Fare estimate<br/>• Walking segments"]

    G --> H["User selects route"]
    H --> I["Detailed step-by-step<br/>transit directions"]

    I --> J["Show metro line<br/>& station sequence"]
    I --> K["Show bus routes<br/>& stop locations"]
    I --> L["Show walking segments<br/>with distance"]

    J --> M["Start navigation"]
    K --> M
    L --> M

    style A fill:#0061a7,color:#fff
    style M fill:#006d3b,color:#fff
```

---

## 15. AI Copilot Voice Interaction Flow

```mermaid
flowchart TD
    A["User activates AI Copilot"] --> B["Open AiCopilotScreen<br/>(modal: slide_from_bottom)"]
    B --> C["Listening for<br/>voice command"]

    C --> D["Speech-to-text<br/>processing"]
    D --> E{Intent classification}

    E -->|"Navigate to..."| F["Extract destination<br/>→ Search & route"]
    E -->|"Find nearby..."| G["Extract POI category<br/>→ Places search"]
    E -->|"EV station"| H["Find charging stations<br/>→ EvStationScreen"]
    E -->|"Traffic ahead"| I["Check traffic on<br/>current route"]
    E -->|"Change route"| J["Recalculate<br/>alternative routes"]
    E -->|"Unknown"| K["Ask for clarification<br/>(voice response)"]

    F --> L["Voice confirmation<br/>(SpeechService)"]
    G --> L
    H --> L
    I --> L
    J --> L
    K --> C

    L --> M["Execute action<br/>& return to map"]

    style A fill:#8b5000,color:#fff
    style C fill:#0061a7,color:#fff
    style L fill:#006d3b,color:#fff
```

---

## 16. Dynamic App Icon & Compass Heading Synchronization Flow

```mermaid
flowchart TD
    subgraph SENSORS["Hardware Sensors & Calibration"]
        S1["Device Motion<br/>(Gyroscope alpha/pitch/roll)"]
        S2["Magnetometer<br/>(x, y Magnetic Flux)"]
        S3["Location Fused<br/>(CoreLocation / FusedLocation)"]
    end

    SENSORS --> CS["CompassService<br/>(Deadband filter & EMA smoothing)"]
    
    CS -->|"Live Stream (100ms)"| INAPP["DynamicCompassIcon<br/>(In-App Reanimated SVG)"]
    INAPP -->|"Rotation & 3D Tilt"| UI["Explore Tab & Map HUD UI"]

    CS -->|"Heading State"| DIS["DynamicAppIconService"]

    subgraph TRIGGER["Trigger Conditions"]
        T1["User Manual Icon Selection<br/>(Profile Settings)"]
        T2["AppState change to 'background'<br/>(Auto-Sync Enabled)"]
    end

    T1 --> DIS
    T2 --> DIS

    DIS --> CALC["Resolve Cardinal Icon Key<br/>• 315°–45° → compassNorth<br/>• 45°–135° → compassEast<br/>• 135°–225° → compassSouth<br/>• 225°–315° → compassWest"]

    CALC --> NAT["@howincodes/expo-dynamic-app-icon<br/>setAppIcon(key, inBackground)"]

    subgraph PLATFORM["OS Native Execution"]
        P1["iOS<br/>UIApplication.setAlternateIconName<br/>(Silent background update)"]
        P2["Android<br/>PackageManager.setComponentEnabledSetting<br/>(Activity-Alias toggle)"]
        P3["Web / Dev Fallback<br/>(Persist preference in AsyncStorage)"]
    end

    NAT -->|iOS| P1
    NAT -->|Android| P2
    NAT -->|Web / Expo Go| P3

    P1 --> HOME["Device Home Screen<br/>Icon Aligned with Heading"]
    P2 --> HOME
    P3 --> HOME

    style CS fill:#0061a7,color:#fff
    style DIS fill:#006d3b,color:#fff
    style HOME fill:#3865F3,color:#fff
```
