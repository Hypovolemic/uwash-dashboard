import type { MachineStatusEntry } from "../types/api";

type Props = {
  machineId: string;
  entry: MachineStatusEntry;
};

type Variant = "available" | "registered" | "unregistered" | "idle";

function getVariant(entry: MachineStatusEntry): Variant {
  if (entry.status === "available") return "available";
  if (entry.status === "idle") return "idle";
  if (entry.hardwareDetected) return "unregistered";
  return "registered";
}

function formatTimeRemaining(endTime: number | null): string {
  if (!endTime) return "";
  const ms = endTime - Date.now();
  if (ms <= 0) return "Finishing soon";
  const m = Math.floor(ms / 60_000);
  const s = Math.floor((ms % 60_000) / 1000);
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function formatIdleDuration(cycleEndedAtMs: number | null): string {
  if (!cycleEndedAtMs) return "";
  const mins = Math.floor((Date.now() - cycleEndedAtMs) / 60_000);
  return mins < 1 ? "just now" : `${mins} min ago`;
}

const variantConfig: Record<
  Variant,
  { strip: string; dot: string; label: string; labelColor: string }
> = {
  available: {
    strip: "bg-emerald-400",
    dot: "bg-emerald-400",
    label: "Free",
    labelColor: "text-emerald-600",
  },
  registered: {
    strip: "bg-amber-400",
    dot: "bg-amber-400",
    label: "In use",
    labelColor: "text-amber-600",
  },
  unregistered: {
    strip: "bg-red-400",
    dot: "bg-red-400",
    label: "Unregistered",
    labelColor: "text-red-500",
  },
  idle: {
    strip: "bg-orange-400",
    dot: "bg-orange-400",
    label: "Idle",
    labelColor: "text-orange-500",
  },
};

export function MachineCard({ machineId, entry }: Props) {
  const variant = getVariant(entry);
  const config = variantConfig[variant];

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_6px_rgba(0,0,0,0.05)] flex flex-col overflow-hidden">

      {/* Thin state strip at top */}
      <div className={`h-[3px] ${config.strip}`} />

      <div className="px-4 pt-3 pb-4 flex flex-col gap-3 flex-1">

        {/* Header: machine name + status dot */}
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-800">{machineId}</p>
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full shrink-0 ${config.dot}`} />
            <span className={`text-xs font-medium ${config.labelColor}`}>
              {config.label}
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1">
          {variant === "available" && (
            <p className="text-xs text-gray-400 capitalize">{entry.kind} · ready to use</p>
          )}

          {(variant === "registered" || variant === "unregistered") && (
            <div className="flex flex-col gap-1">
              <p className={`text-xs ${variant === "unregistered" ? "text-gray-400 italic" : "text-gray-500"}`}>
                {variant === "registered" ? `@${entry.currUser}` : "Unknown user"}
              </p>
              <p className="text-xl font-semibold text-gray-900 tracking-tight">
                {formatTimeRemaining(entry.endTime)}
              </p>
              <p className="text-xs text-gray-400">remaining</p>
            </div>
          )}

          {variant === "idle" && (
            <div className="flex flex-col gap-1">
              <p className="text-xs text-orange-500 font-medium">Laundry not collected</p>
              <p className="text-xs text-gray-500">
                {entry.currUser ? `@${entry.currUser}` : "Unknown user"}
                {entry.cycleEndedAtMs && (
                  <span className="text-gray-400"> · {formatIdleDuration(entry.cycleEndedAtMs)}</span>
                )}
              </p>
            </div>
          )}
        </div>

        {/* Footer: queue count only */}
        <p className="text-xs text-gray-400">
          {entry.queueLength > 0 ? `${entry.queueLength} waiting` : "No queue"}
        </p>
      </div>
    </div>
  );
}
