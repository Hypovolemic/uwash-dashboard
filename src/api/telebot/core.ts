import type { MachineStatusEntry, StatusResponse } from "../../types/api";
import type {
  AlarmRecord,
  DueAlarm,
  HouseSelection,
  LaundryTimerRecord,
  StartTimerInput,
  StartTimerResult,
} from "./types";
import { startCycle, isUsingMock } from "../backend";

const HOUSE_SELECTIONS_KEY = "uwash_bot_house_selections";
const TIMERS_KEY = "uwash_bot_timers";
const ALARMS_KEY = "uwash_bot_alarms";

const WASHER_TIMER_DURATION_MINUTES = [30, 32, 34] as const;
const DRYER_TIMER_DURATION_MINUTES = [30, 45, 60] as const;

function readJson<T>(storageKey: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(storageKey: string, value: T) {
  localStorage.setItem(storageKey, JSON.stringify(value));
}

function buildMachineKey(collegeId: string, houseId: string, machineId: string) {
  return `${collegeId}:${houseId}:${machineId}`;
}

function copyStatus(status: StatusResponse): StatusResponse {
  return {
    ...status,
    machines: Object.fromEntries(
      Object.entries(status.machines).map(([machineId, entry]) => [
        machineId,
        { ...entry },
      ])
    ),
  };
}

function isEntryAvailable(entry: MachineStatusEntry, nowMs: number): boolean {
  if (entry.status === "available") return true;
  if (entry.status === "in_use" && entry.endTime !== null && entry.endTime <= nowMs) {
    return true;
  }
  return false;
}

export function getDurationOptions(machineId: string): number[] {
  return machineId.toLowerCase().includes("washer")
    ? [...WASHER_TIMER_DURATION_MINUTES]
    : [...DRYER_TIMER_DURATION_MINUTES];
}

export function getHouseSelection(userId: string): HouseSelection | null {
  const byUser = readJson<Record<string, HouseSelection>>(HOUSE_SELECTIONS_KEY, {});
  return byUser[userId] ?? null;
}

export function setHouseSelection(userId: string, collegeId: string, houseId: string) {
  const byUser = readJson<Record<string, HouseSelection>>(HOUSE_SELECTIONS_KEY, {});
  byUser[userId] = { collegeId, houseId };
  writeJson(HOUSE_SELECTIONS_KEY, byUser);
}

export function hydrateStatusFromTimers(
  status: StatusResponse,
  collegeId: string,
  houseId: string,
  nowMs = Date.now()
): StatusResponse {
  const timers = readJson<Record<string, LaundryTimerRecord>>(TIMERS_KEY, {});
  const next = copyStatus(status);

  for (const [machineId, entry] of Object.entries(next.machines)) {
    const key = buildMachineKey(collegeId, houseId, machineId);
    const timer = timers[key];

    if (!timer) {
      if (entry.status === "in_use" && entry.endTime !== null && entry.endTime <= nowMs) {
        entry.status = "idle";
        entry.cycleEndedAtMs = entry.endTime;
        entry.startTimeMs = null;
        entry.endTime = null;
      }
      continue;
    }

    if (timer.endTimeMs <= nowMs) {
      entry.status = "idle";
      entry.currUser = timer.currUser;
      entry.hardwareDetected = false;
      entry.startTimeMs = null;
      entry.endTime = null;
      entry.cycleEndedAtMs = timer.endTimeMs;
      delete timers[key];
      continue;
    }

    entry.status = "in_use";
    entry.currUser = timer.currUser;
    entry.hardwareDetected = false;
    entry.startTimeMs = timer.startTimeMs;
    entry.endTime = timer.endTimeMs;
    entry.cycleEndedAtMs = null;
  }

  writeJson(TIMERS_KEY, timers);
  return next;
}

export function startMachineTimer(input: StartTimerInput, nowMs = Date.now()): StartTimerResult {
  const next = copyStatus(input.status);
  const machine = next.machines[input.machineId];

  if (!machine) {
    return { ok: false, reason: `Unknown machine ${input.machineId}`, updatedStatus: input.status };
  }

  if (!isEntryAvailable(machine, nowMs)) {
    return {
      ok: false,
      reason: `${input.machineId} is currently in use. Please come back again later.`,
      updatedStatus: input.status,
    };
  }

  const durationMs = input.durationMins * 60_000;
  const endTimeMs = nowMs + durationMs;
  const timerKey = buildMachineKey(input.collegeId, input.houseId, input.machineId);

  const timers = readJson<Record<string, LaundryTimerRecord>>(TIMERS_KEY, {});
  timers[timerKey] = {
    key: timerKey,
    collegeId: input.collegeId,
    houseId: input.houseId,
    machineId: input.machineId,
    currUser: input.username,
    startTimeMs: nowMs,
    endTimeMs,
  };
  writeJson(TIMERS_KEY, timers);

  const alarms = readJson<AlarmRecord[]>(ALARMS_KEY, []);
  alarms.push({
    key: timerKey,
    username: input.username,
    machineHouseName: `${input.houseId} ${input.machineId}`,
    dueAtMs: endTimeMs,
    createdAtMs: nowMs,
  });
  writeJson(ALARMS_KEY, alarms);

  machine.status = "in_use";
  machine.currUser = input.username;
  machine.hardwareDetected = false;
  machine.startTimeMs = nowMs;
  machine.endTime = endTimeMs;
  machine.cycleEndedAtMs = null;

  // Also notify backend (fire-and-forget for now)
  if (!isUsingMock()) {
    startCycle({
      house: input.houseId,
      machine_name: input.machineId,
      username: input.username,
      duration_mins: input.durationMins,
    }).catch((err) => {
      console.error("Failed to notify backend of cycle start:", err);
    });
  }

  return { ok: true, updatedStatus: next };
}

export function sweepMachineState(status: StatusResponse, nowMs = Date.now()): StatusResponse {
  const next = copyStatus(status);

  for (const entry of Object.values(next.machines)) {
    if (entry.status !== "in_use") continue;
    if (entry.endTime === null || entry.endTime > nowMs) continue;

    entry.status = "idle";
    entry.startTimeMs = null;
    entry.cycleEndedAtMs = entry.endTime;
    entry.endTime = null;
  }

  return next;
}

export function drainDueAlarms(nowMs = Date.now()): DueAlarm[] {
  const alarms = readJson<AlarmRecord[]>(ALARMS_KEY, []);
  const due: DueAlarm[] = [];
  const remaining: AlarmRecord[] = [];

  for (const alarm of alarms) {
    if (alarm.dueAtMs <= nowMs) {
      due.push({
        username: alarm.username,
        machineHouseName: alarm.machineHouseName,
        dueAtMs: alarm.dueAtMs,
        message: `@${alarm.username} your clothes from ${alarm.machineHouseName} are ready for collection!`,
      });
      continue;
    }

    remaining.push(alarm);
  }

  writeJson(ALARMS_KEY, remaining);
  return due;
}

export function applyHouseContextToStatus(
  template: StatusResponse,
  collegeId: string,
  houseId: string
): StatusResponse {
  const status = copyStatus(template);
  status.college = collegeId;
  status.house = houseId;
  status.lastUpdatedMs = Date.now();
  return hydrateStatusFromTimers(status, collegeId, houseId);
}
