import { useEffect, useState } from "react";

/**
 * Triggers a re-render on the calling component at the given interval.
 * Used by StatusView to keep countdown timers and progress bars live.
 */
export function useTick(intervalMs: number) {
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
}
