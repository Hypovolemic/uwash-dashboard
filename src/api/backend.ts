import type { QueueResponse, StatusResponse } from "../types/api";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";
const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

export async function fetchStatus(house: string, college?: string | null): Promise<StatusResponse> {
  if (USE_MOCK) {
    throw new Error("Mock mode enabled - use mock data instead");
  }

  // Support both backend route shapes:
  // 1) /api/{college}/{house}/status
  // 2) /api/{house}/status (legacy)
  const urls = [
    ...(college ? [`${API_BASE_URL}/api/${college}/${house}/status`] : []),
    `${API_BASE_URL}/api/${house}/status`,
  ];

  let lastStatusText = "Unknown error";
  for (const url of urls) {
    const response = await fetch(url);
    if (response.ok) {
      return response.json();
    }
    lastStatusText = response.statusText || `HTTP ${response.status}`;
  }

  throw new Error(`Failed to fetch status: ${lastStatusText}`);
}

export async function fetchAllStatus(): Promise<Record<string, StatusResponse>> {
  if (USE_MOCK) {
    throw new Error("Mock mode enabled - use mock data instead");
  }

  const response = await fetch(`${API_BASE_URL}/api/status`);
  if (!response.ok) {
    throw new Error(`Failed to fetch status: ${response.statusText}`);
  }
  return response.json();
}

export async function fetchQueue(house: string, college?: string | null): Promise<QueueResponse> {
  if (USE_MOCK) {
    throw new Error("Mock mode enabled - use mock data instead");
  }

  const urls = [
    ...(college ? [`${API_BASE_URL}/api/${college}/${house}/queue`] : []),
    `${API_BASE_URL}/api/${house}/queue`,
    `${API_BASE_URL}/api/queue?house=${encodeURIComponent(house)}${
      college ? `&college=${encodeURIComponent(college)}` : ""
    }`,
  ];

  let lastStatusText = "Unknown error";
  for (const url of urls) {
    const response = await fetch(url);
    if (response.ok) {
      return response.json();
    }
    lastStatusText = response.statusText || `HTTP ${response.status}`;
  }

  throw new Error(`Failed to fetch queue: ${lastStatusText}`);
}

export type StartCycleInput = {
  house: string;
  machine_name: string;
  username: string;
  duration_mins: number;
};

export type StartCycleResponse = {
  status: string;
  house: string;
  machine: string;
  username: string;
  endTimeMs: number;
};

export type JoinQueueInput = {
  college?: string | null;
  house: string;
  machineId: string;
  username: string;
};

export async function joinQueue(input: JoinQueueInput): Promise<{ ok: boolean; message?: string }> {
  const endpoints = [
    `${API_BASE_URL}/api/queue/join`,
    `${API_BASE_URL}/api/join-queue`,
    `${API_BASE_URL}/api/queue`,
  ];

  const payload = {
    college: input.college,
    house: input.house,
    machine_name: input.machineId,
    machineId: input.machineId,
    username: input.username,
  };

  let lastError = "Failed to join queue";
  for (const endpoint of endpoints) {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      const data = await response.json().catch(() => ({ ok: true }));
      return { ok: true, message: data?.message };
    }

    const error = await response.json().catch(() => ({ error: response.statusText }));
    lastError = error.error || `Failed to join queue (${response.status})`;
  }

  throw new Error(lastError);
}

export async function startCycle(input: StartCycleInput): Promise<StartCycleResponse> {
  const response = await fetch(`${API_BASE_URL}/api/start-cycle`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(error.error || "Failed to start cycle");
  }

  return response.json();
}

export function isUsingMock(): boolean {
  return USE_MOCK;
}
