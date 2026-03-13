import type { StatusResponse } from "../types/api";

type Props = {
  status: StatusResponse;
  onQueueTap: () => void;
};

export function StatsStrip({ status, onQueueTap }: Props) {
  const machines = Object.values(status.machines);
  const total = machines.length;

  const availableCount = machines.filter((m) => m.status === "available").length;
  const inQueueCount = machines.reduce((sum, m) => sum + m.queueLength, 0);

  return (
    <div className="grid grid-cols-2 gap-2 mb-4">

      {/* Available — static */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-100 px-3 py-2.5 flex flex-col gap-0.5">
        <p className="text-xs text-gray-400">Available</p>
        <p className={`text-lg font-bold leading-tight ${availableCount > 0 ? "text-emerald-600" : "text-gray-400"}`}>
          {availableCount}/{total}
        </p>
      </div>

      {/* In Queue — tappable */}
      <button
        onClick={onQueueTap}
        className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-100 px-3 py-2.5 flex items-center justify-between text-left"
      >
        <div className="flex flex-col gap-0.5">
          <p className="text-xs text-gray-400">In Queue</p>
          <p className={`text-lg font-bold leading-tight ${inQueueCount > 0 ? "text-amber-600" : "text-gray-400"}`}>
            {inQueueCount}
          </p>
        </div>
        <p className="text-gray-300 text-sm">›</p>
      </button>

    </div>
  );
}
