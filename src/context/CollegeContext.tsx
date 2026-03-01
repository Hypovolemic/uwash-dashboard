import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { COLLEGES } from "../config";
import type { CollegeId, HouseId } from "../config";

const STORAGE_KEY = "uwash_selection";

type CollegeContextValue = {
  collegeId: CollegeId | null;
  houseId: HouseId | null;
  setCollege: (id: CollegeId) => void;
  setHouse: (id: HouseId) => void;
};

const CollegeContext = createContext<CollegeContextValue | null>(null);

function loadFromStorage(): {
  collegeId: CollegeId | null;
  houseId: HouseId | null;
} {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { collegeId: null, houseId: null };
    return JSON.parse(raw);
  } catch {
    return { collegeId: null, houseId: null };
  }
}

export function CollegeProvider({ children }: { children: ReactNode }) {
  const saved = loadFromStorage();
  const [collegeId, setCollegeId] = useState<CollegeId | null>(
    saved.collegeId
  );
  const [houseId, setHouseId] = useState<HouseId | null>(saved.houseId);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ collegeId, houseId }));
  }, [collegeId, houseId]);

  function setCollege(id: CollegeId) {
    const college = COLLEGES.find((c) => c.id === id);
    const firstHouse = (college?.houses[0]?.id ?? null) as HouseId | null;
    setCollegeId(id);
    setHouseId(firstHouse);
  }

  function setHouse(id: HouseId) {
    setHouseId(id);
  }

  return (
    <CollegeContext.Provider value={{ collegeId, houseId, setCollege, setHouse }}>
      {children}
    </CollegeContext.Provider>
  );
}

export function useCollege(): CollegeContextValue {
  const ctx = useContext(CollegeContext);
  if (!ctx) throw new Error("useCollege must be used inside CollegeProvider");
  return ctx;
}
