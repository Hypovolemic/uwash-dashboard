import type { StatusResponse } from "../types/api";

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
