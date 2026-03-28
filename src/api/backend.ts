import type { QueueResponse, StatusResponse } from "../types/api";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";
const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

export async function fetchStatus(house: string): Promise<StatusResponse> {
  if (USE_MOCK) {
    throw new Error("Mock mode enabled - use mock data instead");
  }

  const response = await fetch(`${API_BASE_URL}/api/${house}/status`);
  if (!response.ok) {
    throw new Error(`Failed to fetch status: ${response.statusText}`);
  }
  return response.json();
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

async function fetchFirstAvailable(
  pathCandidates: string[],
  init?: RequestInit
): Promise<Response> {
  let lastResponse: Response | null = null;
  let lastError: unknown = null;

  for (const path of pathCandidates) {
    try {
      const response = await fetch(`${API_BASE_URL}${path}`, init);
      if (response.ok) {
        return response;
      }

      lastResponse = response;
      if (response.status !== 404) {
        return response;
      }
    } catch (error) {
      lastError = error;
    }
  }

  if (lastResponse) {
    return lastResponse;
  }

  if (lastError instanceof Error) {
    throw lastError;
  }

  throw new Error("Request failed for all endpoint candidates");
}

export async function fetchQueue(house: string, college?: string | null): Promise<QueueResponse> {
  const encodedHouse = encodeURIComponent(house);
  const encodedCollege = college ? encodeURIComponent(college) : null;
  const paths = [
    encodedCollege ? `/api/${encodedCollege}/${encodedHouse}/queue` : "",
    `/api/${encodedHouse}/queue`,
    `/api/queue?house=${encodedHouse}`,
  ].filter(Boolean);

  const response = await fetchFirstAvailable(paths);
  if (!response.ok) {
    throw new Error(`Failed to fetch queue: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

type JoinQueueInput = {
  house: string;
  machineId: string;
  username: string;
  college?: string | null;
};

export async function joinQueue(input: JoinQueueInput): Promise<void> {
  const encodedHouse = encodeURIComponent(input.house);
  const encodedCollege = input.college ? encodeURIComponent(input.college) : null;
  const payload = {
    college: input.college ?? undefined,
    house: input.house,
    machineId: input.machineId,
    machine_name: input.machineId,
    username: input.username,
  };

  const paths = [
    encodedCollege ? `/api/${encodedCollege}/${encodedHouse}/queue/join` : "",
    `/api/${encodedHouse}/queue/join`,
    `/api/queue/join`,
    `/api/join-queue`,
  ].filter(Boolean);

  const response = await fetchFirstAvailable(paths, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(error.error || `Failed to join queue: ${response.statusText}`);
  }
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
