import { useEffect, useState } from "react";
import { fetchQueue, isUsingMock, joinQueue } from "../api/backend";
import { mockQueue } from "../data/mock";
import type { QueueResponse } from "../types/api";

type UseQueueInput = {
  college?: string | null;
  house: string | null;
  pollIntervalMs?: number;
};

type UseQueueResult = {
  queue: QueueResponse | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  join: (machineId: string, username: string) => Promise<void>;
};

export function useQueue({ college, house, pollIntervalMs = 8000 }: UseQueueInput): UseQueueResult {
  const [queue, setQueue] = useState<QueueResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchData() {
    if (!house) {
      setQueue(null);
      setLoading(false);
      return;
    }

    if (isUsingMock()) {
      setQueue({
        ...mockQueue,
        college: college ?? mockQueue.college,
        house,
        lastUpdatedMs: Date.now(),
      });
      setLoading(false);
      setError(null);
      return;
    }

    try {
      const data = await fetchQueue(house, college);
      setQueue(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch queue");
      setQueue({
        ...mockQueue,
        college: college ?? mockQueue.college,
        house,
        lastUpdatedMs: Date.now(),
      });
    } finally {
      setLoading(false);
    }
  }

  async function join(machineId: string, username: string) {
    if (!house) return;
    await joinQueue({
      college,
      house,
      machineId,
      username,
    });
    await fetchData();
  }

  useEffect(() => {
    fetchData();

    const interval = setInterval(fetchData, pollIntervalMs);
    return () => clearInterval(interval);
  }, [college, house, pollIntervalMs]);

  return {
    queue,
    loading,
    error,
    refetch: fetchData,
    join,
  };
}
