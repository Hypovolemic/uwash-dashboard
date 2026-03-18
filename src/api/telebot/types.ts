import type { StatusResponse } from "../../types/api";

export type HouseSelection = {
  collegeId: string;
  houseId: string;
};

export type LaundryTimerRecord = {
  key: string;
  collegeId: string;
  houseId: string;
  machineId: string;
  currUser: string;
  startTimeMs: number;
  endTimeMs: number;
};

export type AlarmRecord = {
  key: string;
  username: string;
  machineHouseName: string;
  dueAtMs: number;
  createdAtMs: number;
};

export type StartTimerInput = {
  status: StatusResponse;
  collegeId: string;
  houseId: string;
  machineId: string;
  username: string;
  durationMins: number;
};

export type StartTimerResult = {
  ok: boolean;
  reason?: string;
  updatedStatus: StatusResponse;
};

export type DueAlarm = {
  username: string;
  machineHouseName: string;
  dueAtMs: number;
  message: string;
};
