import { useEffect, useState } from "react";
import type { StatusResponse } from "../types/api";
import { fetchStatus, isUsingMock } from "../api/backend";
import { mockStatus } from "../data/mock";

type UseStatusInput = {
  college?: string | null;
  house: string | null;
  pollIntervalMs?: number;
};

type UseStatusResult = {
  status: StatusResponse | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
};

export function useStatus({ college, house, pollIntervalMs = 5000 }: UseStatusInput): UseStatusResult {
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchData() {
    if (!house) {
      setStatus(null);
      setLoading(false);
      return;
    }

    // Use mock data if configured
    if (isUsingMock()) {
      setStatus({
        ...mockStatus,
        house,
        lastUpdatedMs: Date.now(),
      });
      setLoading(false);
      setError(null);
      return;
    }

    try {
      const data = await fetchStatus(house, college);
      setStatus(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch status");
      setStatus({
        ...mockStatus,
        house,
        college: college ?? mockStatus.college,
        lastUpdatedMs: Date.now(),
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();

    // Poll for updates
    const interval = setInterval(fetchData, pollIntervalMs);

    // Also refetch on window focus
    function handleFocus() {
      fetchData();
    }
    window.addEventListener("focus", handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
    };
  }, [college, house, pollIntervalMs]);

  return {
    status,
    loading,
    error,
    refetch: fetchData,
  };
}
