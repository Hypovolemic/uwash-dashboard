import type { MachineKind } from "../config/machines";

// --- Shared ---

export type { MachineKind };

// Machine status values:
//   "available"    — free to use
//   "in_use"       — currently running (check hardwareDetected + currUser for display variant)
//   "idle"         — cycle finished, laundry not yet collected (Smart Nudge window)
export type MachineStatus = "available" | "in_use" | "idle";

// --- GET /api/{college}/{house}/status (B-06) ---

export type MachineStatusEntry = {
  status: MachineStatus;
  kind: MachineKind;
  currUser: string | null;        // null for hardware-detected (unregistered) sessions
  startTimeMs: number | null;     // unix ms; set on vibration_start or /start, null when available
  endTime: number | null;         // unix ms; null when available
  hardwareDetected: boolean;      // true = vibration sensor triggered, no registered user
  queueLength: number;
  cycleEndedAtMs: number | null;  // set when status = idle, null otherwise
};

// keyed by machine_id e.g. "Washer One"
export type StatusResponse = {
  college: string;
  house: string;
  lastUpdatedMs: number;
  machines: Record<string, MachineStatusEntry>;
};

// --- GET /api/{college}/{house}/queue (B-09) ---

export type QueueMember = {
  username: string;
  position: number; // 1-indexed
};

export type QueueEntry = {
  queueLength: number;
  estWaitMins: number;
  members: QueueMember[];
};

// keyed by machine_id
export type QueueResponse = {
  college: string;
  house: string;
  lastUpdatedMs: number;
  byMachine: Record<string, QueueEntry>;
};

// --- GET /api/{college}/{house}/buddywash (B-12) ---

export type BuddyWashOffer = {
  machineId: string;
  createdBy: string;
  startTimeMs: number;
  slotsFilled: number;
  slotsTotal: number;
};

export type BuddyWashWeeklyImpact = {
  sharedLoads: number;
  waterSavedL: number;   // 50L baseline × shared sessions × 0.4 saving factor (B-12)
  kwhSaved: number;
};

export type BuddyWashResponse = {
  college: string;
  house: string;
  lastUpdatedMs: number;
  offers: BuddyWashOffer[];
  weeklyImpact: BuddyWashWeeklyImpact;
};

// --- GET /api/{college}/{house}/analytics (D-08) ---

export type HourlyUsageEntry = {
  hour: number;        // 0-23
  usagePercent: number; // 0-100
};

export type AnalyticsResponse = {
  college: string;
  house: string;
  lastUpdatedMs: number;
  peakHours: HourlyUsageEntry[];       // 24 entries, one per hour
  currentPeakStart: number | null;      // hour (0-23), null if not in peak period
  currentPeakEnd: number | null;        // hour (0-23), null if not in peak period
  nextPeakStart: number | null;         // hour (0-23), null if no upcoming peak today
  avgIdleTimeMins: number;              // average time laundry sits idle post-cycle
  hardwareDetectedPercent: number;      // % of sessions that were unregistered
  buddyWashParticipationRate: number;   // % of users who've joined at least one buddy wash
};
