// Machine IDs match the bot's HOUSE_MACHINES naming exactly.
// These are the default 2W + 2D config used by CAPT (and likely other RCs).
// Each RC's actual machine list is populated via HOUSE_MACHINES in the bot constants.py.
export const DEFAULT_MACHINES = [
  { id: "Washer One", kind: "washer" as const },
  { id: "Washer Two", kind: "washer" as const },
  { id: "Dryer One", kind: "dryer" as const },
  { id: "Dryer Two", kind: "dryer" as const },
] as const;

export type MachineKind = "washer" | "dryer";
export type DefaultMachineId = (typeof DEFAULT_MACHINES)[number]["id"];
