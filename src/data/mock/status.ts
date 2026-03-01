import type { StatusResponse } from "../../types/api";

const now = Date.now();
const mins = (m: number) => m * 60_000;

// Representative mock for CAPT / Garuda.
// Covers all four machine states for UI development:
//   Washer One  — in_use, registered user, 1 in queue
//   Washer Two  — available
//   Dryer One   — in_use, hardware-detected (unregistered)
//   Dryer Two   — idle, registered user (laundry not collected)
export const mockStatus: StatusResponse = {
  college: "capt",
  house: "garuda",
  lastUpdatedMs: now,
  machines: {
    "Washer One": {
      status: "in_use",
      kind: "washer",
      currUser: "sarah_tan",
      endTime: now + mins(24),
      hardwareDetected: false,
      queueLength: 1,
      cycleEndedAtMs: null,
    },
    "Washer Two": {
      status: "available",
      kind: "washer",
      currUser: null,
      endTime: null,
      hardwareDetected: false,
      queueLength: 0,
      cycleEndedAtMs: null,
    },
    "Dryer One": {
      status: "in_use",
      kind: "dryer",
      currUser: null,
      endTime: now + mins(14),
      hardwareDetected: true,
      queueLength: 0,
      cycleEndedAtMs: null,
    },
    "Dryer Two": {
      status: "idle",
      kind: "dryer",
      currUser: "kai_lim",
      endTime: null,
      hardwareDetected: false,
      queueLength: 0,
      cycleEndedAtMs: now - mins(8),
    },
  },
};
