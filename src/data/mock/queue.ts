import type { QueueResponse } from "../../types/api";

const now = Date.now();

// 2 people queued for Washer One (24 min remaining + 45 min cycle each)
// 1 person queued for Dryer One (expires soon, transitioning to idle)
export const mockQueue: QueueResponse = {
  college: "capt",
  house: "garuda",
  lastUpdatedMs: now,
  byMachine: {
    "Washer One": {
      queueLength: 2,
      estWaitMins: 69,
      members: [
        { position: 1, username: "jun_wei" },
        { position: 2, username: "priya_s" },
      ],
    },
    "Washer Two":   { queueLength: 0, estWaitMins: 0, members: [] },
    "Washer Three": { queueLength: 0, estWaitMins: 0, members: [] },
    "Dryer One": {
      queueLength: 1,
      estWaitMins: 46,
      members: [
        { position: 1, username: "marcus_t" },
      ],
    },
    "Dryer Two":   { queueLength: 0, estWaitMins: 0, members: [] },
    "Dryer Three": { queueLength: 0, estWaitMins: 0, members: [] },
  },
};
