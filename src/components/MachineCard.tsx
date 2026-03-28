import type { MachineStatusEntry } from "../types/api";

type Props = {
  machineId: string;
  entry: MachineStatusEntry;
  onJoinQueue: (machineId: string) => void;
  onMarkCollected: (machineId: string) => void;
  joiningQueue?: boolean;
  markingCollected?: boolean;
};

type Variant = "available" | "registered" | "unregistered" | "finishing" | "idle";

function getVariant(entry: MachineStatusEntry): Variant {
  if (entry.status === "available") return "available";
  if (entry.status === "idle") return "idle";
  // in_use — simulate idle once endTime expires (mirrors vibration_end → idle in prod)
  if (entry.endTime !== null && entry.endTime - Date.now() <= 0) return "idle";
  if (entry.endTime !== null && entry.endTime - Date.now() <= 60_000) return "finishing";
  if (entry.hardwareDetected) return "unregistered";
  return "registered";
}

function formatTimeRemaining(endTime: number | null): string {
  if (!endTime) return "—";
  const ms = endTime - Date.now();
  if (ms <= 0) return "—";
  const m = Math.floor(ms / 60_000);
  return `${m} min`;
}

function formatIdleElapsed(cycleEndedAtMs: number | null): string {
  if (!cycleEndedAtMs) return "—";
  const mins = Math.floor((Date.now() - cycleEndedAtMs) / 60_000);
  return mins < 1 ? "just now" : `${mins} min`;
}

function getProgress(startTimeMs: number | null, endTime: number | null): number {
  if (!startTimeMs || !endTime) return 0;
  const total = endTime - startTimeMs;
  const elapsed = Date.now() - startTimeMs;
  return Math.min(100, Math.max(0, (elapsed / total) * 100));
}

function WasherIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3" y="3" width="42" height="42" rx="5" />
      <line x1="3" y1="13" x2="45" y2="13" />
      <rect x="6" y="6" width="9" height="4" rx="1" />
      <circle cx="37" cy="8" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="42" cy="8" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="24" cy="29" r="12" />
      <circle cx="24" cy="29" r="8" />
      <path d="M16 29 Q18.5 26 21 29 Q23.5 32 26 29 Q28.5 26 31 29" />
    </svg>
  );
}

function DryerIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3" y="3" width="42" height="42" rx="5" />
      <line x1="3" y1="13" x2="45" y2="13" />
      <rect x="6" y="6" width="9" height="4" rx="1" />
      <circle cx="37" cy="8" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="42" cy="8" r="1.5" fill="currentColor" stroke="none" />
      <rect x="11" y="18" width="26" height="22" rx="3" />
      <rect x="15" y="22" width="18" height="14" rx="2" />
      <line x1="19" y1="37" x2="29" y2="37" />
    </svg>
  );
}

const progressFill: Record<"registered" | "unregistered" | "finishing", string> = {
  registered:   "bg-slate-400",
  unregistered: "bg-red-400",
  finishing:    "bg-gray-200",
};

export function MachineCard({
  machineId,
  entry,
  onJoinQueue,
  onMarkCollected,
  joiningQueue = false,
  markingCollected = false,
}: Props) {
  const variant = getVariant(entry);
  const Icon = entry.kind === "washer" ? WasherIcon : DryerIcon;
  const kindLabel = entry.kind === "washer" ? "Washer" : "Dryer";
  const isQueueFull = entry.queueLength >= 3;
  const canJoinQueue = entry.status === "in_use" && !isQueueFull;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-[0_2px_8px_rgba(0,0,0,0.08)] flex flex-col overflow-hidden">

      {/* Icon header — same slate theme regardless of state */}
      <div className="bg-slate-50 flex flex-col items-center pt-5">
        <Icon className="w-14 h-14 text-slate-500" />
        <div className="w-full mt-4 py-2 px-4 bg-slate-800">
          <p className="text-sm font-semibold text-white text-center">{machineId}</p>
        </div>
      </div>

      {/* Status body */}
      <div className="px-4 pt-4 pb-5 flex flex-col gap-2 flex-1">

        {/* Available */}
        {variant === "available" && (
          <div className="flex-1 flex flex-col justify-center gap-1">
            <p className="text-xs font-semibold text-gray-500">{kindLabel}: Available</p>
            <p className="text-xs text-gray-400">Free to use</p>
          </div>
        )}

        {/* In use — registered */}
        {variant === "registered" && (
          <>
            <div className="flex-1 flex flex-col justify-center gap-1">
              <p className="text-xs font-semibold text-slate-800">{kindLabel}: Machine in use</p>
              <p className="text-xs text-gray-400">Time left: {formatTimeRemaining(entry.endTime)}</p>
              <p className="text-xs text-gray-400">@{entry.currUser ?? "—"}</p>
            </div>
            <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${progressFill.registered}`}
                style={{ width: `${getProgress(entry.startTimeMs, entry.endTime)}%` }} />
            </div>
          </>
        )}

        {/* In use — unregistered */}
        {variant === "unregistered" && (
          <>
            <div className="flex-1 flex flex-col justify-center gap-1">
              <p className="text-xs font-semibold text-slate-800">{kindLabel}: Machine in use</p>
              <p className="text-xs text-gray-400">Time left: {formatTimeRemaining(entry.endTime)}</p>
              <p className="text-xs font-medium text-red-400">⚠ No user registered</p>
            </div>
            <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${progressFill.unregistered}`}
                style={{ width: `${getProgress(entry.startTimeMs, entry.endTime)}%` }} />
            </div>
          </>
        )}

        {/* Finishing — ≤60s remaining */}
        {variant === "finishing" && (
          <>
            <div className="flex-1 flex flex-col justify-center gap-1">
              <p className="text-xs font-semibold text-slate-400">{kindLabel}: Almost done</p>
              <p className="text-xs text-gray-400">Time left: {formatTimeRemaining(entry.endTime)}</p>
              <p className="text-xs text-gray-400">{entry.currUser ? `@${entry.currUser}` : "—"}</p>
            </div>
            <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
              <div className={`h-full w-full rounded-full ${progressFill.finishing}`} />
            </div>
          </>
        )}

        {/* Idle */}
        {variant === "idle" && (
          <div className="flex-1 flex flex-col justify-center gap-2">
            <div className="flex flex-col gap-1">
              <p className="text-xs font-semibold text-amber-500">{kindLabel}: Done</p>
              <p className="text-xs text-amber-400">Done for {formatIdleElapsed(entry.cycleEndedAtMs ?? entry.endTime)}</p>
              <p className="text-xs text-gray-400">
                Please collect{entry.currUser ? ` · @${entry.currUser}` : ""}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onMarkCollected(machineId)}
              disabled={markingCollected}
              className="w-full min-h-[30px] rounded-md text-xs font-semibold border border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {markingCollected ? "Updating..." : "Done"}
            </button>
          </div>
        )}

        {/* Queue action */}
        {(canJoinQueue || isQueueFull || entry.queueLength > 0) && (
          <div className="pt-2 border-t border-gray-100">
            {canJoinQueue ? (
              <button
                onClick={() => onJoinQueue(machineId)}
                disabled={joiningQueue}
                className="w-full min-h-[30px] rounded-md text-xs font-semibold bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {joiningQueue ? "Joining..." : `Join queue${entry.queueLength > 0 ? ` (${entry.queueLength})` : ""}`}
              </button>
            ) : (
              <p className="text-xs text-gray-400">
                {isQueueFull ? `Queue full (${entry.queueLength}/3)` : `Queue: ${entry.queueLength}`}
              </p>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
