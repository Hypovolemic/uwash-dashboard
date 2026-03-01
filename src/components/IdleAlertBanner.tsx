import type { StatusResponse } from "../types/api";

type Props = {
  status: StatusResponse;
};

function formatIdleDuration(cycleEndedAtMs: number | null): string {
  if (!cycleEndedAtMs) return "";
  const mins = Math.floor((Date.now() - cycleEndedAtMs) / 60_000);
  return mins < 1 ? "just now" : `${mins} min ago`;
}

export function IdleAlertBanner({ status }: Props) {
  const idleMachines = Object.entries(status.machines).filter(
    ([, entry]) => entry.status === "idle"
  );

  if (idleMachines.length === 0) return null;

  return (
    <div className="mb-4 flex flex-col gap-2">
      {idleMachines.map(([machineId, entry]) => (
        <div
          key={machineId}
          className="flex items-center gap-3 bg-orange-50/90 backdrop-blur-sm border border-orange-200 rounded-xl px-4 py-3"
        >
          <span className="text-lg shrink-0">⏰</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-orange-800 leading-tight">
              {machineId} — laundry not collected
            </p>
            <p className="text-xs text-orange-600 mt-0.5">
              {entry.currUser ? `@${entry.currUser}` : "Unknown user"}
              {entry.cycleEndedAtMs && (
                <span className="text-orange-400"> · {formatIdleDuration(entry.cycleEndedAtMs)}</span>
              )}
            </p>
          </div>
          <span className="text-xs text-orange-400 shrink-0 font-medium">
            Public
          </span>
        </div>
      ))}
    </div>
  );
}
