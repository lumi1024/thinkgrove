'use client';

import { useEffect, useState, useCallback } from 'react';
import { getHourInTimezone, getTimeOfDay, TIME_THEMES, type ThemeColors, type TimeOfDay } from '@/lib/theme';

const STORAGE_KEY = 'kf.theme.override';

function readOverride(): TimeOfDay | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw && (raw === 'dawn' || raw === 'day' || raw === 'dusk' || raw === 'night')) return raw as TimeOfDay;
  } catch {}
  return null;
}

function writeOverride(tod: TimeOfDay | null): void {
  if (typeof window === 'undefined') return;
  if (tod) window.localStorage.setItem(STORAGE_KEY, tod);
  else window.localStorage.removeItem(STORAGE_KEY);
}

export function useTimeTheme(): ThemeColors & { override: TimeOfDay | null; setOverride: (tod: TimeOfDay | null) => void } {
  const [override, setOverrideState] = useState<TimeOfDay | null>(readOverride);

  const applyTheme = useCallback((tod: TimeOfDay) => {
    const colors = TIME_THEMES[tod];
    const root = document.documentElement;
    root.style.setProperty('--theme-bg', colors.bg);
    root.style.setProperty('--theme-fog-1', colors.fog1);
    root.style.setProperty('--theme-fog-2', colors.fog2);
    root.style.setProperty('--theme-fog-3', colors.fog3);
    root.style.setProperty('--theme-grid', colors.grid);
    root.style.setProperty('--theme-text-primary', colors.textPrimary);
    root.style.setProperty('--theme-text-secondary', colors.textSecondary);
    root.style.setProperty('--theme-particle', colors.particle);
  }, []);

  useEffect(() => {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const hour = getHourInTimezone(timeZone);
    const autoTod = getTimeOfDay(hour);
    const activeTod = override || autoTod;
    applyTheme(activeTod);
  }, [override, applyTheme]);

  const setOverride = useCallback((tod: TimeOfDay | null) => {
    setOverrideState(tod);
    writeOverride(tod);
  }, []);

  return { ...TIME_THEMES[override || getTimeOfDay(new Date().getHours())], override, setOverride };
}
