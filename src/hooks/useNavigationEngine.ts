import { useEffect, useRef, useState, useCallback } from 'react';
import { RoutesAPI } from '@/api/api';
import * as T from '@/api/types';

export interface UseNavigationEngineOptions {
  route: T.RouteResponse | null;
  isNavigating: boolean;
  userLocation: T.Coordinate | null;
  mode?: T.TravelMode;
  offRouteThresholdMeters?: number;
  onStepChange?: (step: T.RouteStep, stepIndex: number) => void;
  onReroute?: (newRoute: T.RouteResponse) => void;
  onError?: (error: any) => void;
}

export function useNavigationEngine({
  route,
  isNavigating,
  userLocation,
  mode = 'driving',
  offRouteThresholdMeters = 45.0,
  onStepChange,
  onReroute,
  onError,
}: UseNavigationEngineOptions) {
  const [activeRoute, setActiveRoute] = useState<T.RouteResponse | null>(route);
  const [progress, setProgress] = useState<T.NavigationProgress | null>(null);
  const [currentStep, setCurrentStep] = useState<T.RouteStep | null>(null);
  const lastStepIndexRef = useRef<number>(-1);

  // Sync initial route
  useEffect(() => {
    setActiveRoute(route);
    setProgress(null);
    setCurrentStep(route?.steps[0] || null);
    lastStepIndexRef.current = -1;
  }, [route]);

  const evaluateProgress = useCallback(async () => {
    if (!isNavigating || !activeRoute || !userLocation) return;

    try {
      const response = await RoutesAPI.trackProgress({
        user_location: userLocation,
        route: activeRoute,
        mode,
        off_route_threshold_meters: offRouteThresholdMeters,
      });

      const { progress: currentProgress, rerouted, new_route } = response.data;
      setProgress(currentProgress);

      // 1. Maneuver Step Progression & Voice Trigger
      if (currentProgress.current_step_index !== lastStepIndexRef.current) {
        lastStepIndexRef.current = currentProgress.current_step_index;
        const targetRoute = rerouted && new_route ? new_route : activeRoute;
        const step = targetRoute.steps[currentProgress.current_step_index];
        if (step) {
          setCurrentStep(step);
          onStepChange?.(step, currentProgress.current_step_index);
        }
      }

      // 2. Auto-Reroute handling
      if (rerouted && new_route) {
        setActiveRoute(new_route);
        onReroute?.(new_route);
      }
    } catch (err) {
      onError?.(err);
    }
  }, [isNavigating, activeRoute, userLocation, mode, offRouteThresholdMeters, onStepChange, onReroute, onError]);

  // Periodic navigation loop every 2.5 seconds
  useEffect(() => {
    if (!isNavigating) return;
    evaluateProgress();
    const interval = setInterval(evaluateProgress, 2500);
    return () => clearInterval(interval);
  }, [isNavigating, evaluateProgress]);

  return {
    activeRoute,
    progress,
    currentStep,
    isOffRoute: progress?.is_off_route ?? false,
    remainingDistance: progress?.remaining_distance_meters ?? activeRoute?.distance_meters ?? 0,
    remainingDuration: progress?.remaining_duration_seconds ?? activeRoute?.duration_seconds ?? 0,
  };
}
