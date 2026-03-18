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
  const telegramIdentity = useMemo(() => getTelegramIdentity(), []);
  const [status, setStatus] = useState<StatusResponse>(() =>
    applyHouseContextToStatus(templateStatus, collegeId, houseId)
  );
  const [alerts, setAlerts] = useState<TelebotAlert[]>([]);
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

    const nextStatus = applyHouseContextToStatus(templateStatus, collegeId, houseId);
    setStatus(nextStatus);
    const nextMachineIds = Object.keys(nextStatus.machines);
    const nextMachineId = nextMachineIds[0] ?? "";
    setSelectedMachineId(nextMachineId);
    setSelectedDurationMins(getDurationOptions(nextMachineId || "Washer One")[0]);
  }, [collegeId, houseId, templateStatus, userId]);

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
  };
}
