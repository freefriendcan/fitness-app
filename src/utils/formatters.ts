/**
 * Data formatting utilities
 */

export const formatWeight = (
  weight: number,
  unit: 'metric' | 'imperial' = 'metric'
): string => {
  if (unit === 'imperial') {
    // Convert kg to lbs
    const lbs = Math.round(weight * 2.20462);
    return `${lbs} lbs`;
  }
  return `${weight} kg`;
};

export const formatDistance = (
  km: number,
  unit: 'metric' | 'imperial' = 'metric'
): string => {
  if (unit === 'imperial') {
    // Convert km to miles
    const miles = (km * 0.621371).toFixed(2);
    return `${miles} mi`;
  }
  return `${km} km`;
};

export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

export const formatDurationMinutes = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
};

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-US').format(num);
};

export const formatDecimal = (num: number, decimals: number = 1): string => {
  return num.toFixed(decimals);
};

export const formatPercentage = (value: number, total: number): string => {
  const percentage = total > 0 ? (value / total) * 100 : 0;
  return `${percentage.toFixed(1)}%`;
};

export const formatVolume = (volume: number): string => {
  if (volume >= 1000000) {
    return `${(volume / 1000000).toFixed(1)}M`;
  }
  if (volume >= 1000) {
    return `${(volume / 1000).toFixed(1)}K`;
  }
  return formatNumber(volume);
};
