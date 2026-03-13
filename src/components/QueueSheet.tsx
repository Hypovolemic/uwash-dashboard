import type { QueueResponse } from "../types/api";

type Props = {
  open: boolean;
  onClose: () => void;
  queue: QueueResponse;
};

const AVG_CYCLE_MINS = 45;

export function QueueSheet({ open, onClose, queue }: Props) {
  const machinesWithQueue = Object.entries(queue.byMachine).filter(
    ([, q]) => q.queueLength > 0
  );

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className={`fixed bottom-0 inset-x-0 z-50 bg-white rounded-t-2xl shadow-2xl transition-transform duration-300 ease-out ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <p className="text-base font-semibold text-gray-900">Queue</p>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[65vh] px-5 pb-10">
          {machinesWithQueue.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-12">
              No queues right now
            </p>
          ) : (
            machinesWithQueue.map(([machineId, queueEntry]) => (
              <div key={machineId} className="mt-5">
                {/* Machine label */}
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
                  {machineId}
                </p>

                {/* Members */}
                <div className="flex flex-col divide-y divide-gray-50">
                  {queueEntry.members.map((member) => {
                    const estWait =
                      queueEntry.estWaitMins +
                      (member.position - 1) * AVG_CYCLE_MINS;
                    return (
                      <div
                        key={member.position}
                        className="flex items-center gap-3 py-3"
                      >
                        {/* Position badge */}
                        <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 shrink-0">
                          {member.position}
                        </span>

                        {/* Name + wait */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800">
                            @{member.username}
                          </p>
                          <p className="text-xs text-gray-400">
                            ~{estWait} min estimated wait
                          </p>
                        </div>

                        {/* Next badge for position 1 */}
                        {member.position === 1 && (
                          <span className="shrink-0 text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                            Next
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
