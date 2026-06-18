export type TimeOfDay = 'dawn' | 'day' | 'dusk' | 'night';

export interface ThemeColors {
  bg: string;
  fog1: string;
  fog2: string;
  fog3: string;
  grid: string;
  textPrimary: string;
  textSecondary: string;
  particle: string;
}

export const TIME_THEMES: Record<TimeOfDay, ThemeColors> = {
  dawn: {
    bg: '#f8f6f1',
    fog1: '#dce8f0',
    fog2: '#e8e0d8',
    fog3: '#e0e8f4',
    grid: '#64748b',
    textPrimary: '#1e293b',
    textSecondary: '#64748b',
    particle: '#94a3b8',
  },
  day: {
    bg: '#f4f7f9',
    fog1: '#dbe8e9',
    fog2: '#eaf0f6',
    fog3: '#e0eaee',
    grid: '#64748b',
    textPrimary: '#1e293b',
    textSecondary: '#64748b',
    particle: '#94a3b8',
  },
  dusk: {
    bg: '#f0ebe4',
    fog1: '#d4b896',
    fog2: '#c4a0b4',
    fog3: '#e0d0c0',
    grid: '#8b7e74',
    textPrimary: '#3d3530',
    textSecondary: '#8b7e74',
    particle: '#b8a090',
  },
  night: {
    bg: '#1a1f2e',
    fog1: '#2a3550',
    fog2: '#1f2840',
    fog3: '#252f48',
    grid: '#3a4560',
    textPrimary: '#e2e8f0',
    textSecondary: '#94a3b8',
    particle: '#64748b',
  },
} as const;

export function getTimeOfDay(hour: number): TimeOfDay {
  if (hour >= 5 && hour < 11) return 'dawn';
  if (hour >= 11 && hour < 17) return 'day';
  if (hour >= 17 && hour < 20) return 'dusk';
  return 'night';
}

export function getHourInTimezone(timeZone: string): number {
  try {
    return parseInt(
      new Date().toLocaleString('en-US', {
        timeZone,
        hour: 'numeric',
        hour12: false,
      }),
      10,
    );
  } catch {
    return new Date().getHours();
  }
}
