import type { QueueResponse } from "../../types/api";

const now = Date.now();

// One person queued behind Washer One (which has ~24 mins remaining).
// estWaitMins = remaining cycle time + one full wash cycle (~45 mins).
export const mockQueue: QueueResponse = {
  college: "capt",
  house: "garuda",
  lastUpdatedMs: now,
  byMachine: {
    "Washer One": {
      queueLength: 1,
      estWaitMins: 69, // 24 min remaining + 45 min cycle
    },
    "Washer Two": {
      queueLength: 0,
      estWaitMins: 0,
    },
    "Dryer One": {
      queueLength: 0,
      estWaitMins: 0,
    },
    "Dryer Two": {
      queueLength: 0,
      estWaitMins: 0,
    },
  },
};
