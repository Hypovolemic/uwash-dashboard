import { useEffect, useMemo, useState } from "react";
import type { StatusResponse } from "../types/api";
import { getTelegramIdentity } from "../api/telegramIdentity";
import {
  applyHouseContextToStatus,
  drainDueAlarms,
  getDurationOptions,
  getHouseSelection,
  setHouseSelection,
  startMachineTimer,
  sweepMachineState,
} from "../api/telebot";
import { markCollected as markCollectedApi } from "../api/backend";

export type TelebotAlert = {
  id: string;
  text: string;
};

type UseTelebotCoreInput = {
  collegeId: string;
  houseId: string;
  userId: string;
  templateStatus: StatusResponse;
};

export function useTelebotCore({
  collegeId,
  houseId,
  userId,
  templateStatus,
}: UseTelebotCoreInput) {
  const houseScopeKey = `${collegeId}:${houseId}`;
  const telegramIdentity = useMemo(() => getTelegramIdentity(), []);
  const [status, setStatus] = useState<StatusResponse>(() =>
    applyHouseContextToStatus(templateStatus, collegeId, houseId)
  );
  const [alerts, setAlerts] = useState<TelebotAlert[]>([]);
  const [collectedOverrides, setCollectedOverrides] = useState<Record<string, true>>({});
  const [username, setUsername] = useState(() => telegramIdentity?.username ?? "resident_user");

  const machineIds = useMemo(() => Object.keys(status.machines), [status.machines]);
  const [selectedMachineId, setSelectedMachineId] = useState<string>(machineIds[0] ?? "");
  const [selectedDurationMins, setSelectedDurationMins] = useState<number>(
    getDurationOptions(machineIds[0] ?? "Washer One")[0]
  );

  const durationOptions = useMemo(
    () => getDurationOptions(selectedMachineId || "Washer One"),
    [selectedMachineId]
  );

  useEffect(() => {
    const saved = getHouseSelection(userId);
    if (!saved || saved.collegeId !== collegeId || saved.houseId !== houseId) {
      setHouseSelection(userId, collegeId, houseId);
    }
  }, [collegeId, houseId, userId]);

  useEffect(() => {
    setCollectedOverrides({});
  }, [houseScopeKey]);

  useEffect(() => {
    const nextStatus = applyHouseContextToStatus(templateStatus, collegeId, houseId);
    for (const [machineId, machine] of Object.entries(nextStatus.machines)) {
      if (collectedOverrides[machineId] && machine.status === "idle") {
        machine.status = "available";
        machine.currUser = null;
        machine.startTimeMs = null;
        machine.endTime = null;
        machine.cycleEndedAtMs = null;
        machine.hardwareDetected = false;
      }
    }
    setStatus(nextStatus);
    const nextMachineIds = Object.keys(nextStatus.machines);

    setCollectedOverrides((prev) => {
      let changed = false;
      const next = { ...prev };
      for (const [machineId, machine] of Object.entries(nextStatus.machines)) {
        if (next[machineId] && machine.status !== "idle") {
          delete next[machineId];
          changed = true;
        }
      }
      return changed ? next : prev;
    });

    setSelectedMachineId((prevMachineId) => {
      if (prevMachineId && nextMachineIds.includes(prevMachineId)) {
        return prevMachineId;
      }

      return nextMachineIds[0] ?? "";
    });
  }, [collegeId, houseId, collectedOverrides, templateStatus]);

  useEffect(() => {
    if (!selectedMachineId) return;
    const options = getDurationOptions(selectedMachineId);
    if (!options.includes(selectedDurationMins)) {
      setSelectedDurationMins(options[0]);
    }
  }, [selectedDurationMins, selectedMachineId]);

  useEffect(() => {
    if (!telegramIdentity?.username) return;
    setUsername((prev) => (prev === "resident_user" ? telegramIdentity.username : prev));
  }, [telegramIdentity]);

  useEffect(() => {
    const id = window.setInterval(() => {
      setStatus((prev) => sweepMachineState(prev));
      const due = drainDueAlarms();
      if (!due.length) return;

      setAlerts((prev) => {
        const incoming = due.map((alarm) => ({
          id: `${alarm.machineHouseName}-${alarm.dueAtMs}`,
          text: alarm.message,
        }));
        return [...incoming, ...prev].slice(0, 5);
      });
    }, 5000);

    return () => window.clearInterval(id);
  }, []);

  function setTimer() {
    if (!selectedMachineId || !username.trim()) {
      return { ok: false, reason: "Please choose a machine and username first." };
    }

    const result = startMachineTimer({
      status,
      collegeId,
      houseId,
      machineId: selectedMachineId,
      username: username.trim(),
      durationMins: selectedDurationMins,
    });

    if (result.ok) {
      setStatus(result.updatedStatus);
    }

    return { ok: result.ok, reason: result.reason };
  }

  function dismissAlert(id: string) {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  }

  // Updated markCollected to call backend
  async function markCollected(machineId: string) {
    // Find house and telegram_id (username)
    const telegram_id = telegramIdentity?.userId || username || "dashboard-user";
    // Use houseId from hook scope
    const input = { house: houseId, machine_name: machineId, telegram_id };
    const result = await markCollectedApi(input);
    if (result.ok) {
      setStatus((prev) => {
        const machine = prev.machines[machineId];
        if (!machine) return prev;
        const next: StatusResponse = {
          ...prev,
          lastUpdatedMs: Date.now(),
          machines: {
            ...prev.machines,
            [machineId]: {
              ...machine,
              status: "available",
              currUser: null,
              startTimeMs: null,
              endTime: null,
              cycleEndedAtMs: null,
              hardwareDetected: false,
            },
          },
        };
        return next;
      });
      setCollectedOverrides((prev) => {
        if (prev[machineId]) return prev;
        return {
          ...prev,
          [machineId]: true,
        };
      });
    }
    // Optionally: handle error UI here
    return result;
  }

  return {
    status,
    username,
    setUsername,
    selectedMachineId,
    setSelectedMachineId,
    selectedDurationMins,
    setSelectedDurationMins,
    durationOptions,
    telegramIdentity,
    alerts,
    setTimer,
    dismissAlert,
    markCollected,
  };
}
