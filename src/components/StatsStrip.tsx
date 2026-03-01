import type { StatusResponse } from "../types/api";

type Props = {
  status: StatusResponse;
};

export function StatsStrip({ status }: Props) {
  const machines = Object.values(status.machines);
  const total = machines.length;

  const availableCount = machines.filter((m) => m.status === "available").length;
  const inQueueCount = machines.reduce((sum, m) => sum + m.queueLength, 0);

  const chips = [
    {
      label: "Available",
      value: `${availableCount}/${total}`,
      color: availableCount > 0 ? "text-emerald-600" : "text-gray-400",
    },
    {
      label: "In Queue",
      value: String(inQueueCount),
      color: inQueueCount > 0 ? "text-amber-600" : "text-gray-400",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-2 mb-4">
      {chips.map((chip) => (
        <div
          key={chip.label}
          className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-100 px-3 py-2.5 flex flex-col gap-0.5"
        >
          <p className="text-xs text-gray-400 truncate">{chip.label}</p>
          <p className={`text-lg font-bold leading-tight ${chip.color}`}>{chip.value}</p>
        </div>
      ))}
    </div>
  );
}
