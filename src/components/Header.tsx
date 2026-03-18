import { COLLEGES } from "../config";
import { useCollege } from "../context/CollegeContext";
import type { CollegeId, HouseId } from "../config";

export function Header() {
  const { collegeId, houseId, setCollege, setHouse } = useCollege();
  const selectedCollege = COLLEGES.find((c) => c.id === collegeId);
  const houses = selectedCollege?.houses ?? [];

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/60 shadow-sm">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-center px-5 pt-4 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shrink-0 shadow-md shadow-blue-200">
              <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5">
                <path d="M12 2C12 2 5 9.5 5 14a7 7 0 0 0 14 0c0-4.5-7-12-7-12z" />
              </svg>
            </div>
            <div className="font-semibold text-gray-900 leading-tight tracking-tight">UWash</div>
          </div>
        </div>

        <div className="px-5 pb-3 lg:px-6 lg:pb-4">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
            <select
              value={collegeId ?? ""}
              onChange={(e) => {
                if (e.target.value) setCollege(e.target.value as CollegeId);
              }}
              className="min-h-[44px] w-full lg:w-44 shrink-0 rounded-xl border border-gray-200 bg-white/60 backdrop-blur-sm px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-300 transition-all"
            >
              <option value="" disabled>
                Select your college
              </option>
              {COLLEGES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>

            {collegeId && houses.length > 0 ? (
              <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 lg:pb-0">
                {houses.map((h) => (
                  <button
                    key={h.id}
                    onClick={() => setHouse(h.id as HouseId)}
                    className={`min-h-[44px] shrink-0 px-4 rounded-full text-sm font-medium transition-all duration-200 ${
                      houseId === h.id
                        ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md shadow-blue-200"
                        : "bg-white/70 border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300"
                    }`}
                  >
                    {h.label}
                  </button>
                ))}
              </div>
            ) : (
              !collegeId && (
                <p className="text-xs text-gray-400 lg:ml-1">Select a college to see its houses</p>
              )
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
