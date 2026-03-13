import type { StatusResponse } from "../../types/api";

const now = Date.now();
const mins = (m: number) => m * 60_000;

// Representative mock for CAPT / Garuda.
// Covers all four machine states for UI development:
//   Washer One  — in_use, registered user, 24m left of 30m cycle (started 6m ago), 2 in queue
//   Washer Two  — available
//   Dryer One   — in_use, hardware-detected (unregistered), ~1m left, 1 in queue
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
      startTimeMs: now - mins(6),
      endTime: now + mins(24),
      hardwareDetected: false,
      queueLength: 1,
      cycleEndedAtMs: null,
    },
    "Washer Two": {
      status: "available",
      kind: "washer",
      currUser: null,
      startTimeMs: null,
      endTime: null,
      hardwareDetected: false,
      queueLength: 0,
      cycleEndedAtMs: null,
    },
    "Washer Three": {
      status: "available",
      kind: "washer",
      currUser: null,
      startTimeMs: null,
      endTime: null,
      hardwareDetected: false,
      queueLength: 0,
      cycleEndedAtMs: null,
    },
    "Dryer One": {
      status: "in_use",
      kind: "dryer",
      currUser: null,
      startTimeMs: now - mins(31),
      endTime: now + mins(1),
      hardwareDetected: true,
      queueLength: 0,
      cycleEndedAtMs: null,
    },
    "Dryer Two": {
      status: "idle",
      kind: "dryer",
      currUser: "kai_lim",
      startTimeMs: null,
      endTime: null,
      hardwareDetected: false,
      queueLength: 0,
      cycleEndedAtMs: now - mins(8),
    },
    "Dryer Three": {
      status: "idle",
      kind: "dryer",
      currUser: "kai_lim",
      startTimeMs: null,
      endTime: null,
      hardwareDetected: false,
      queueLength: 0,
      cycleEndedAtMs: now - mins(8),
    }
  },
};
