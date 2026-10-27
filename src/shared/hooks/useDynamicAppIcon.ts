import { useState, useEffect, useCallback } from 'react';
import {
  dynamicAppIconService,
  getCardinalIconForHeading,
  COMPASS_ICON_OPTIONS,
  type AppIconKey,
  type CompassIconKey,
} from '../services/DynamicAppIconService';
import { compassService } from '../services/CompassService';
import { haptics } from '../utils/haptics';

export function useDynamicAppIcon() {
  const [activeIcon, setActiveIcon] = useState<AppIconKey>(() =>
    dynamicAppIconService.getCurrentIcon()
  );
  const [isAutoSync, setIsAutoSync] = useState<boolean>(() =>
    dynamicAppIconService.isAutoSyncEnabled()
  );
  const [isChanging, setIsChanging] = useState<boolean>(false);
  const [currentHeading, setCurrentHeading] = useState<number>(
    () => compassService.getCurrentData().heading
  );

  useEffect(() => {
    const unsubIcon = dynamicAppIconService.subscribe((icon, autoSync) => {
      setActiveIcon(icon);
      setIsAutoSync(autoSync);
    });

    const unsubCompass = compassService.subscribe((compassData) => {
      setCurrentHeading(compassData.heading);
    });

    return () => {
      unsubIcon();
      unsubCompass();
    };
  }, []);

  const changeIcon = useCallback(async (key: AppIconKey) => {
    setIsChanging(true);
    haptics.selection();
    try {
      const ok = await dynamicAppIconService.setAppIcon(key);
      if (ok) {
        haptics.success();
      }
      return ok;
    } finally {
      setIsChanging(false);
    }
  }, []);

  const toggleAutoSync = useCallback(async (enabled: boolean) => {
    setIsChanging(true);
    haptics.selection();
    try {
      await dynamicAppIconService.setAutoSync(enabled);
      haptics.success();
    } finally {
      setIsChanging(false);
    }
  }, []);

  const suggestedIcon: CompassIconKey = getCardinalIconForHeading(currentHeading);

  return {
    activeIcon,
    isAutoSync,
    isChanging,
    changeIcon,
    toggleAutoSync,
    currentHeading,
    suggestedIcon,
    iconOptions: COMPASS_ICON_OPTIONS,
  };
}
