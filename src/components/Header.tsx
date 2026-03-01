import { COLLEGES } from "../config";
import { useCollege } from "../context/CollegeContext";
import type { CollegeId, HouseId } from "../config";

export type Tab = "status" | "analytics";

type HeaderProps = {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
};

export function Header({ activeTab, onTabChange }: HeaderProps) {
  const { collegeId, houseId, setCollege, setHouse } = useCollege();
  const selectedCollege = COLLEGES.find((c) => c.id === collegeId);
  const houses = selectedCollege?.houses ?? [];

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/60 shadow-sm">
      <div className="max-w-5xl mx-auto">

        {/* Mobile: stacked rows. Desktop: single combined row */}
        <div className="lg:flex lg:items-center lg:gap-4 lg:px-6 lg:py-3">

          {/* Logo + live indicator (mobile) */}
          <div className="flex items-center justify-between px-5 pt-4 pb-3 lg:p-0 lg:shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shrink-0 shadow-md shadow-blue-200">
                <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5">
                  <path d="M12 2C12 2 5 9.5 5 14a7 7 0 0 0 14 0c0-4.5-7-12-7-12z" />
                </svg>
              </div>
              <div>
                <div className="font-semibold text-gray-900 leading-tight tracking-tight">
                  UWash
                </div>
                <div className="text-xs text-gray-400 tracking-wide">
                  UTown Residences
                </div>
              </div>
            </div>
            {/* Live pill — mobile only */}
            <div className="flex lg:hidden items-center gap-1.5 text-xs text-gray-400 bg-gray-50 border border-gray-200 rounded-full px-3 py-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="font-medium">Live</span>
            </div>
          </div>

          {/* Selectors — stacked on mobile, inline on desktop */}
          <div className="flex-1 px-5 pb-3 lg:p-0">
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
                  <p className="text-xs text-gray-400 lg:ml-1">
                    Select a college to see its houses
                  </p>
                )
              )}
            </div>
          </div>

          {/* Live pill — desktop only */}
          <div className="hidden lg:flex items-center gap-1.5 text-xs text-gray-400 bg-gray-50 border border-gray-200 rounded-full px-3 py-1.5 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="font-medium">Live</span>
          </div>
        </div>

        {/* Tab nav */}
        <div className="px-5 pb-4 lg:px-6 lg:pb-3">
          <div className="flex bg-gray-100/80 rounded-2xl p-1 gap-1">
            <button
              onClick={() => onTabChange("status")}
              className={`flex-1 min-h-[40px] flex items-center justify-center gap-1.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                activeTab === "status"
                  ? "bg-white text-gray-900 shadow-sm shadow-gray-200/80"
                  : "text-gray-400 hover:text-gray-600 hover:bg-white/40"
              }`}
            >
              <span>⚡</span>
              <span>Live Status</span>
            </button>
            <button
              onClick={() => onTabChange("analytics")}
              className={`flex-1 min-h-[40px] flex items-center justify-center gap-1.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                activeTab === "analytics"
                  ? "bg-white text-gray-900 shadow-sm shadow-gray-200/80"
                  : "text-gray-400 hover:text-gray-600 hover:bg-white/40"
              }`}
            >
              <span>📊</span>
              <span>Analytics</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
