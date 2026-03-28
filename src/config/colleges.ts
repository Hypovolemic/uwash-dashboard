export const COLLEGES = [
   {
    id: "acacia",
    label: "Acacia",
    houses: [
      { id: "aeon", label: "Aeon" },
      { id: "nous", label: "Nous" },
      { id: "zenith", label: "Zenith" },
    ],
  },
  {
    id: "capt",
    label: "CAPT",
    houses: [
      { id: "roc", label: "Roc" },
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
      { id: "tancho", label: "Tancho" },
      { id: "ponya", label: "Ponya" }
    ],
  },
  {
    id: "rc4",
    label: "RC4",
    houses: [//Aquila, Noctua, Ursa, Leo, and Draco.
      { id: "acquila", label: "Acquila" },
      { id: "noctua", label: "Noctua" },
      { id: "ursa", label: "Ursa" },
      { id: "leo", label: "Leo" },
      { id: "draco", label: "Draco" }
    ],
  },
  {
    id: "rvrc",
    label: "RVRC",
    houses: [
      { id: "aonyx", label: "Aonyx" },
      { id: "chelonia", label: "Chelonia" },
      { id: "manis", label: "Manis" },
      { id: "orcaella", label: "Orcaella" },
      { id: "panthera", label: "Panthera" },
      { id: "rusa", label: "Rusa" },
      { id: "strix", label: "Strix" },
    ],
  },
  {
    id: "nusc",
    label: "NUS College",
    houses: [
      { id: "kairos", label: "Kairos" },
      { id: "levios", label: "Levios" },
      { id: "idalia", label: "Idalia" },
      { id: "osceanna", label: "Osceanna" },
      { id: "corvex", label: "Corvex" },
      { id: "perseus", label: "Perseus" },
    ],
  },
] as const;

export type CollegeId = (typeof COLLEGES)[number]["id"];
export type College = (typeof COLLEGES)[number];
export type House = College["houses"][number];
export type HouseId = House["id"];
