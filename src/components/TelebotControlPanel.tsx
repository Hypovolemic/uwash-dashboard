import { useState } from "react";
import type { TelebotAlert } from "../hooks/useTelebotCore";

type Props = {
  autoDetectedUsername: string | null;
  userOptions: string[];
  machineIds: string[];
  selectedMachineId: string;
  onMachineChange: (machineId: string) => void;
  durationOptions: number[];
  selectedDurationMins: number;
  onDurationChange: (durationMins: number) => void;
  username: string;
  onUsernameChange: (username: string) => void;
  onSetTimer: () => { ok: boolean; reason?: string };
  alerts: TelebotAlert[];
  onDismissAlert: (id: string) => void;
};

export function TelebotControlPanel({
  autoDetectedUsername,
  userOptions,
  machineIds,
  selectedMachineId,
  onMachineChange,
  durationOptions,
  selectedDurationMins,
  onDurationChange,
  username,
  onUsernameChange,
  onSetTimer,
  alerts,
  onDismissAlert,
}: Props) {
  const [feedback, setFeedback] = useState<string | null>(null);
  const hasTelegramIdentity = Boolean(autoDetectedUsername);

  return (
    <section className="rounded-2xl border border-blue-100 bg-white p-5 flex flex-col gap-4 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-base font-semibold text-slate-900">Start a Wash Cycle</p>
        {autoDetectedUsername && (
          <span className="text-xs font-medium text-blue-700 bg-blue-50 border border-blue-100 rounded-full px-2.5 py-1">
            @{autoDetectedUsername}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <p className="text-sm font-medium text-slate-700">Who is using this?</p>
          <select
            value={username}
            onChange={(e) => onUsernameChange(e.target.value)}
            disabled={hasTelegramIdentity}
            className="min-h-[42px] rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed"
          >
            {hasTelegramIdentity && autoDetectedUsername ? (
              <option value={autoDetectedUsername}>@{autoDetectedUsername}</option>
            ) : (
              userOptions.map((option) => (
                <option key={option} value={option}>
                  @{option}
                </option>
              ))
            )}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <p className="text-sm font-medium text-slate-700">Machine</p>
          <select
            value={selectedMachineId}
            onChange={(e) => onMachineChange(e.target.value)}
            className="min-h-[42px] rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            {machineIds.map((machineId) => (
              <option key={machineId} value={machineId}>
                {machineId}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-slate-700">Duration</p>
        <div className="grid grid-cols-3 gap-3 w-full">
          {durationOptions.map((mins) => {
            const active = mins === selectedDurationMins;
            return (
              <button
                key={mins}
                type="button"
                onClick={() => onDurationChange(mins)}
                className={`w-full min-h-[44px] rounded-xl px-2 text-sm font-semibold text-center transition-all ${
                  active
                    ? "bg-blue-600 text-white shadow-md shadow-blue-100"
                    : "bg-white text-slate-700 border border-blue-100 hover:bg-blue-50"
                }`}
              >
                {mins} min
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-center gap-3 pt-1">
        <button
          type="button"
          onClick={() => {
            const result = onSetTimer();
            setFeedback(
              result.ok
                ? `Timer set for ${selectedDurationMins} mins on ${selectedMachineId}.`
                : result.reason ?? "Unable to set timer right now."
            );
            setTimeout(() => setFeedback(null), 2000); // Clear feedback after 2s
          }}
          className="min-h-[46px] rounded-xl bg-blue-600 text-white px-8 text-sm font-semibold tracking-wide shadow-sm shadow-blue-200 hover:bg-blue-700 transition-all"
        >
          Start Wash
        </button>

        {feedback && <p className="text-xs text-slate-600">{feedback}</p>}
      </div>

      {alerts.length > 0 && (
        <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="flex items-start justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2"
            >
              <p className="text-xs text-amber-900">{alert.text}</p>
              <button
                onClick={() => onDismissAlert(alert.id)}
                className="text-xs text-amber-700 hover:text-amber-900"
              >
                Dismiss
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
