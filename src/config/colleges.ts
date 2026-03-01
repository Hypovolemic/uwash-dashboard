export const COLLEGES = [
  {
    id: "capt",
    label: "CAPT",
    houses: [
      { id: "roc", label: "ROC" },
      { id: "dragon", label: "Dragon" },
      { id: "garuda", label: "Garuda" },
      { id: "phoenix", label: "Phoenix" },
      { id: "tulpar", label: "Tulpar" },
    ],
  },
  {
    id: "tembusu",
    label: "Tembusu",
    houses: [
      { id: "shan", label: "Shan" },
      { id: "ora", label: "Ora" },
      { id: "gaja", label: "Gaja" },
      { id: "tembra", label: "Tembra" },
    ],
  },
  {
    id: "rc4",
    label: "RC4",
    houses: [
      { id: "tectona", label: "Tectona" },
      { id: "cengal", label: "Cengal" },
      { id: "saga", label: "Saga" },
      { id: "angsana", label: "Angsana" },
    ],
  },
  {
    id: "rvrc",
    label: "RVRC",
    houses: [
      { id: "sector-a", label: "Sector A" },
      { id: "sector-b", label: "Sector B" },
      { id: "sector-c", label: "Sector C" },
      { id: "sector-d", label: "Sector D" },
    ],
  },
  {
    id: "nusc",
    label: "NUS College",
    houses: [
      { id: "house-1", label: "House 1" },
      { id: "house-2", label: "House 2" },
      { id: "house-3", label: "House 3" },
      { id: "house-4", label: "House 4" },
    ],
  },
] as const;

export type CollegeId = (typeof COLLEGES)[number]["id"];
export type College = (typeof COLLEGES)[number];
export type House = College["houses"][number];
export type HouseId = House["id"];
