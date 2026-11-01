import { useMemo } from 'react';

export type PoiCategory = 'SOS' | 'HAZARD' | 'EV' | 'METRO' | 'PARKING' | 'COMMERCIAL';

export interface RawMapPoi {
  id: string;
  title: string;
  category: PoiCategory;
  lat: number;
  lng: number;
  priority: number; // Higher renders first (e.g. HAZARD = 100, COMMERCIAL = 50)
  subtitle?: string;
  rating?: number;
  freeCount?: number;
  badgeCount?: number;
}

export interface MapEdgePadding {
  top: number; // Dynamically driven by topHudHeight + 10pt
  bottom: number; // Dynamically driven by BottomSheet height + SafeArea
  left: number; // 164pt when IMD Weather/Radar pills are active, else 20pt
  right: number; // 76pt clearance for Right FAB stack
}

export interface ResolvedMapPoi extends RawMapPoi {
  screenX: number;
  screenY: number;
  labelAnchor: 'RIGHT' | 'LEFT' | 'TOP';
  visible: boolean;
}

interface BoundingBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export interface CollisionEngineParams {
  pois: RawMapPoi[];
  viewportWidth: number;
  viewportHeight: number;
  edgePadding: MapEdgePadding;
  centerLat?: number;
  centerLng?: number;
  zoomLevel?: number;
}

const PIN_RADIUS = 22; // 44pt+ physical touch target envelope
const CHAR_WIDTH_PX = 7.2;
const LABEL_HEIGHT_PX = 28;

function boxesOverlap(a: BoundingBox, b: BoundingBox): boolean {
  return !(a.maxX < b.minX || a.minX > b.maxX || a.maxY < b.minY || a.minY > b.maxY);
}

function isOutOfBounds(box: BoundingBox, width: number, height: number, pad: MapEdgePadding): boolean {
  return (
    box.minX < pad.left ||
    box.maxX > width - pad.right ||
    box.minY < pad.top ||
    box.maxY > height - pad.bottom
  );
}

export function usePoiCollisionEngine({
  pois,
  viewportWidth,
  viewportHeight,
  edgePadding,
  centerLat = 28.5870,
  centerLng = 77.1720,
  zoomLevel = 14,
}: CollisionEngineParams): ResolvedMapPoi[] {
  return useMemo(() => {
    if (!viewportWidth || !viewportHeight || pois.length === 0) {
      return [];
    }

    // Geographic to Screen Space projection (Mercator-like flat projection centered on viewport)
    // At zoomLevel ~ 14, span is approx 0.024 deg longitude
    const baseSpanLng = 0.024 * Math.pow(2, 14 - zoomLevel);
    const baseSpanLat = baseSpanLng * (viewportHeight / Math.max(1, viewportWidth));

    // Sort by priority descending (critical safety hazards render first)
    const sorted = [...pois].sort((a, b) => b.priority - a.priority);

    const placedBoxes: BoundingBox[] = [];
    const resolved: ResolvedMapPoi[] = [];

    for (const poi of sorted) {
      // Calculate screen projection
      const relLng = (poi.lng - centerLng) / baseSpanLng;
      const relLat = (poi.lat - centerLat) / baseSpanLat;

      const screenX = viewportWidth / 2 + relLng * viewportWidth;
      const screenY = viewportHeight / 2 - relLat * viewportHeight; // Invert latitude for screen Y

      const labelWidth = Math.max(64, poi.title.length * CHAR_WIDTH_PX + 28);

      // Attempt 1: Anchor RIGHT (label extends to right of pin)
      const rightBox: BoundingBox = {
        minX: screenX - PIN_RADIUS,
        maxX: screenX + PIN_RADIUS + labelWidth + 8,
        minY: screenY - Math.max(PIN_RADIUS, LABEL_HEIGHT_PX / 2),
        maxY: screenY + Math.max(PIN_RADIUS, LABEL_HEIGHT_PX / 2),
      };

      const rightCollides =
        isOutOfBounds(rightBox, viewportWidth, viewportHeight, edgePadding) ||
        placedBoxes.some((b) => boxesOverlap(rightBox, b));

      if (!rightCollides) {
        placedBoxes.push(rightBox);
        resolved.push({
          ...poi,
          screenX,
          screenY,
          labelAnchor: 'RIGHT',
          visible: true,
        });
        continue;
      }

      // Attempt 2: Anchor LEFT (label flips to left of pin, e.g. near right FAB stack)
      const leftBox: BoundingBox = {
        minX: screenX - PIN_RADIUS - labelWidth - 8,
        maxX: screenX + PIN_RADIUS,
        minY: screenY - Math.max(PIN_RADIUS, LABEL_HEIGHT_PX / 2),
        maxY: screenY + Math.max(PIN_RADIUS, LABEL_HEIGHT_PX / 2),
      };

      const leftCollides =
        isOutOfBounds(leftBox, viewportWidth, viewportHeight, edgePadding) ||
        placedBoxes.some((b) => boxesOverlap(leftBox, b));

      if (!leftCollides) {
        placedBoxes.push(leftBox);
        resolved.push({
          ...poi,
          screenX,
          screenY,
          labelAnchor: 'LEFT',
          visible: true,
        });
        continue;
      }

      // Attempt 3: Anchor TOP (label sits directly above pin)
      const topBox: BoundingBox = {
        minX: screenX - labelWidth / 2,
        maxX: screenX + labelWidth / 2,
        minY: screenY - PIN_RADIUS - LABEL_HEIGHT_PX - 4,
        maxY: screenY + PIN_RADIUS,
      };

      const topCollides =
        isOutOfBounds(topBox, viewportWidth, viewportHeight, edgePadding) ||
        placedBoxes.some((b) => boxesOverlap(topBox, b));

      if (!topCollides) {
        placedBoxes.push(topBox);
        resolved.push({
          ...poi,
          screenX,
          screenY,
          labelAnchor: 'TOP',
          visible: true,
        });
        continue;
      }

      // Fallback: If in visible bounds, show pin icon without label or hide low priority POI
      const pinOnlyBox: BoundingBox = {
        minX: screenX - PIN_RADIUS,
        maxX: screenX + PIN_RADIUS,
        minY: screenY - PIN_RADIUS,
        maxY: screenY + PIN_RADIUS,
      };

      if (
        !isOutOfBounds(pinOnlyBox, viewportWidth, viewportHeight, edgePadding) &&
        !placedBoxes.some((b) => boxesOverlap(pinOnlyBox, b))
      ) {
        placedBoxes.push(pinOnlyBox);
        resolved.push({
          ...poi,
          screenX,
          screenY,
          labelAnchor: 'RIGHT',
          visible: true,
        });
      } else {
        // Celled out to avoid collision
        resolved.push({
          ...poi,
          screenX,
          screenY,
          labelAnchor: 'RIGHT',
          visible: false,
        });
      }
    }

    return resolved;
  }, [pois, viewportWidth, viewportHeight, edgePadding, centerLat, centerLng, zoomLevel]);
}

