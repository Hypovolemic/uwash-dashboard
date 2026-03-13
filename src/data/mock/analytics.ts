import type { AnalyticsResponse } from "../../types/api";

// Mock analytics data showing peak usage patterns
// Based on typical student laundry behavior: mornings before class, evenings after dinner

export const mockAnalyticsGaruda: AnalyticsResponse = {
  college: "CAPT",
  house: "Garuda",
  lastUpdatedMs: Date.now(),
  // Hourly usage pattern (0 = midnight, 23 = 11pm)
  peakHours: [
    { hour: 0, usagePercent: 8 },
    { hour: 1, usagePercent: 5 },
    { hour: 2, usagePercent: 3 },
    { hour: 3, usagePercent: 2 },
    { hour: 4, usagePercent: 2 },
    { hour: 5, usagePercent: 5 },
    { hour: 6, usagePercent: 15 },
    { hour: 7, usagePercent: 35 },
    { hour: 8, usagePercent: 68 },   // Morning peak starts
    { hour: 9, usagePercent: 92 },   // Peak
    { hour: 10, usagePercent: 75 },
    { hour: 11, usagePercent: 48 },
    { hour: 12, usagePercent: 35 },  // Lunch dip
    { hour: 13, usagePercent: 28 },
    { hour: 14, usagePercent: 25 },
    { hour: 15, usagePercent: 30 },
    { hour: 16, usagePercent: 42 },
    { hour: 17, usagePercent: 58 },
    { hour: 18, usagePercent: 85 },  // Evening peak starts
    { hour: 19, usagePercent: 88 },
    { hour: 20, usagePercent: 78 },  // Peak ends
    { hour: 21, usagePercent: 52 },
    { hour: 22, usagePercent: 35 },
    { hour: 23, usagePercent: 18 },
  ],
  currentPeakStart: null,   // Set dynamically based on current time
  currentPeakEnd: null,
  nextPeakStart: 18,        // Next peak at 6pm
  avgIdleTimeMins: 12,      // Average 12 minutes idle after cycle ends
  hardwareDetectedPercent: 18, // 18% of sessions are unregistered
  buddyWashParticipationRate: 34, // 34% have tried buddy wash
};

export const mockAnalyticsROC: AnalyticsResponse = {
  college: "CAPT",
  house: "ROC",
  lastUpdatedMs: Date.now(),
  peakHours: [
    { hour: 0, usagePercent: 12 },
    { hour: 1, usagePercent: 8 },
    { hour: 2, usagePercent: 5 },
    { hour: 3, usagePercent: 3 },
    { hour: 4, usagePercent: 3 },
    { hour: 5, usagePercent: 8 },
    { hour: 6, usagePercent: 22 },
    { hour: 7, usagePercent: 45 },
    { hour: 8, usagePercent: 72 },
    { hour: 9, usagePercent: 85 },
    { hour: 10, usagePercent: 68 },
    { hour: 11, usagePercent: 42 },
    { hour: 12, usagePercent: 38 },
    { hour: 13, usagePercent: 32 },
    { hour: 14, usagePercent: 28 },
    { hour: 15, usagePercent: 35 },
    { hour: 16, usagePercent: 48 },
    { hour: 17, usagePercent: 62 },
    { hour: 18, usagePercent: 78 },
    { hour: 19, usagePercent: 82 },
    { hour: 20, usagePercent: 72 },
    { hour: 21, usagePercent: 55 },
    { hour: 22, usagePercent: 38 },
    { hour: 23, usagePercent: 22 },
  ],
  currentPeakStart: null,
  currentPeakEnd: null,
  nextPeakStart: 18,
  avgIdleTimeMins: 15,
  hardwareDetectedPercent: 22,
  buddyWashParticipationRate: 28,
};

// Helper to determine current peak based on time of day
export function getCurrentPeakInfo(analytics: AnalyticsResponse): {
  inPeak: boolean;
  peakStart: number | null;
  peakEnd: number | null;
  nextPeakStart: number | null;
  minutesUntilPeak: number | null;
} {
  const now = new Date();
  const currentHour = now.getHours();
  
  // Peak = any hour with >60% usage
  const peakThreshold = 60;
  const peakHours = analytics.peakHours
    .filter(h => h.usagePercent >= peakThreshold)
    .map(h => h.hour);
  
  if (peakHours.length === 0) {
    return { inPeak: false, peakStart: null, peakEnd: null, nextPeakStart: null, minutesUntilPeak: null };
  }
  
  // Check if currently in peak
  const inPeak = peakHours.includes(currentHour);
  
  if (inPeak) {
    // Find start and end of current peak window
    let start = currentHour;
    let end = currentHour;
    
    while (start > 0 && peakHours.includes(start - 1)) start--;
    while (end < 23 && peakHours.includes(end + 1)) end++;
    
    return { inPeak: true, peakStart: start, peakEnd: end, nextPeakStart: null, minutesUntilPeak: null };
  }
  
  // Find next peak
  const nextPeak = peakHours.find(h => h > currentHour) ?? peakHours[0]; // Wrap to tomorrow
  const hoursUntil = nextPeak > currentHour ? nextPeak - currentHour : (24 - currentHour) + nextPeak;
  const minutesUntilPeak = hoursUntil * 60 - now.getMinutes();
  
  return { 
    inPeak: false, 
    peakStart: null, 
    peakEnd: null, 
    nextPeakStart: nextPeak,
    minutesUntilPeak 
  };
}
