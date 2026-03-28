import { useMemo, useState } from "react";
import type { MachineStatusEntry, QueueResponse } from "../types/api";

type Props = {
  open: boolean;
  onClose: () => void;
  queue: QueueResponse;
  machineIds: string[];
  machineStatusById: Record<string, MachineStatusEntry>;
  username: string;
  onJoinQueue: (machineId: string, username: string) => Promise<void>;
};

const AVG_CYCLE_MINS = 45;
const MAX_QUEUE_PER_MACHINE = 3;

export function QueueSheet({
  open,
  onClose,
  queue,
  machineIds,
  machineStatusById,
  username,
  onJoinQueue,
}: Props) {
  const [joiningMachineId, setJoiningMachineId] = useState<string | null>(null);
  const [joinMessage, setJoinMessage] = useState<string | null>(null);

  const allMachineIds = useMemo(
    () => Array.from(new Set([...machineIds, ...Object.keys(queue.byMachine)])),
    [machineIds, queue.byMachine]
  );

  async function handleJoin(machineId: string) {
    setJoinMessage(null);
    setJoiningMachineId(machineId);
    try {
      await onJoinQueue(machineId, username);
      setJoinMessage(`Joined queue for ${machineId}`);
    } catch (err) {
      setJoinMessage(err instanceof Error ? err.message : "Failed to join queue");
    } finally {
      setJoiningMachineId(null);
    }
  }

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
          <div>
            <p className="text-base font-semibold text-gray-900">Queue</p>
            <p className="text-xs text-gray-400">All washers and dryers</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[65vh] px-5 pb-10">
          {joinMessage && (
            <p className="text-xs text-blue-700 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 mt-4">
              {joinMessage}
            </p>
          )}

          {allMachineIds.map((machineId) => {
            const queueEntry = queue.byMachine[machineId] ?? {
              queueLength: 0,
              estWaitMins: 0,
              members: [],
            };

            const isUserInQueue = queueEntry.members.some((m) => m.username === username);
            const isFull = queueEntry.queueLength >= MAX_QUEUE_PER_MACHINE;
            const isJoining = joiningMachineId === machineId;
            const machineState = machineStatusById[machineId]?.status;
            const canJoin = machineState === "in_use";

            return (
              <div key={machineId} className="mt-5">
                {/* Machine label */}
                <div className="flex items-center justify-between gap-3 mb-3">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                    {machineId}
                  </p>
                  {canJoin && (
                    <button
                      onClick={() => handleJoin(machineId)}
                      disabled={isFull || isUserInQueue || isJoining}
                      className="text-xs font-semibold px-2.5 py-1 rounded-full border border-blue-200 text-blue-700 bg-blue-50 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {isJoining ? "Joining..." : isUserInQueue ? "Joined" : isFull ? "Full" : "Join"}
                    </button>
                  )}
                </div>

                {/* Members */}
                <div className="flex flex-col divide-y divide-gray-50 rounded-lg border border-gray-100 px-3">
                  {queueEntry.members.length === 0 && (
                    <p className="text-xs text-gray-400 py-3">No one in queue</p>
                  )}

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
            );
          })}
        </div>
      </div>
    </>
  );
}
