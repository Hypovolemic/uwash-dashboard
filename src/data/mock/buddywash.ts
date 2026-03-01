import type { BuddyWashResponse } from "../../types/api";

const now = Date.now();
const mins = (m: number) => m * 60_000;

// waterSavedL = 50L baseline × sharedLoads × 0.4 saving factor (per B-12 spec)
// kwhSaved    = 0.5 kWh per shared load (approximate)
export const mockBuddyWash: BuddyWashResponse = {
  college: "capt",
  house: "garuda",
  lastUpdatedMs: now,
  offers: [
    {
      machineId: "Washer Two",
      createdBy: "kai_lim",
      startTimeMs: now + mins(8),
      slotsFilled: 1,
      slotsTotal: 2,
    },
  ],
  weeklyImpact: {
    sharedLoads: 7,
    waterSavedL: 140, // 50 × 7 × 0.4
    kwhSaved: 3.5,    // 0.5 × 7
  },
};
