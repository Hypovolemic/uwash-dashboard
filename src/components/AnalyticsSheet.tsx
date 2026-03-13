import { useEffect, type MouseEvent } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import type { AnalyticsResponse } from "../types/api";
import { getCurrentPeakInfo } from "../data/mock";
import type { BuddyWashWeeklyImpact } from "../types/api";

interface AnalyticsSheetProps {
  expanded: boolean;
  onToggle: () => void;
  analytics: AnalyticsResponse;
  buddyWashImpact: BuddyWashWeeklyImpact;
  houseName: string;
  availableCount: number;
  totalCount: number;
}

export function AnalyticsSheet({
  expanded,
  onToggle,
  analytics,
  buddyWashImpact,
  houseName,
  availableCount,
  totalCount,
}: AnalyticsSheetProps) {
  // Lock body scroll when expanded
  useEffect(() => {
    if (expanded) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [expanded]);

  const peakInfo = getCurrentPeakInfo(analytics);

  // Format peak time display
  const formatPeakTime = (): string => {
    if (peakInfo.inPeak && peakInfo.peakStart !== null && peakInfo.peakEnd !== null) {
      return `Peak now (until ${peakInfo.peakEnd % 12 || 12}${peakInfo.peakEnd >= 12 ? "pm" : "am"})`;
    }
    if (peakInfo.nextPeakStart !== null && peakInfo.minutesUntilPeak !== null) {
      const hours = Math.floor(peakInfo.minutesUntilPeak / 60);
      if (hours === 0) {
        return `Peak in <1h`;
      }
      return `Peak: ${peakInfo.nextPeakStart % 12 || 12}${peakInfo.nextPeakStart >= 12 ? "pm" : "am"} (~${hours}h)`;
    }
    return "No peak today";
  };

  // Backdrop click handler
  const handleBackdropClick = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onToggle();
    }
  };

  return (
    <>
      {/* Backdrop - only shown when expanded */}
      {expanded && (
        <div
          className="fixed inset-0 bg-black/30 z-40 transition-opacity duration-300"
          onClick={handleBackdropClick}
          aria-hidden="true"
        />
      )}

      {/* Bottom sheet */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 ease-out ${
          expanded ? "translate-y-0" : "translate-y-[calc(100%-80px)]"
        }`}
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        {/* Glassmorphic container with progressive enhancement fallback */}
        <div
          className="bg-white/70 shadow-2xl"
          style={{
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
          }}
        >
          {/* Collapsed state - quick metrics row */}
          <button
            onClick={onToggle}
            className="w-full px-4 py-4 flex items-center justify-between gap-4 active:bg-black/5 transition-colors"
            aria-expanded={expanded}
            aria-label={expanded ? "Collapse analytics" : "Expand analytics"}
          >
            <div className="flex items-center gap-4 text-sm">
              <span className="text-green-600 font-semibold flex items-center gap-1">
                🟢 {availableCount}/{totalCount}
              </span>
              <span className="text-slate-600 font-medium">
                ⏱️ {formatPeakTime()}
              </span>
              <span className="text-blue-600 font-medium">
                💧 {buddyWashImpact.waterSavedL}L saved
              </span>
            </div>
            <svg
              className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${
                expanded ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Expanded state - full analytics content */}
          {expanded && (
            <div
              className="px-4 pb-6 max-h-[70vh] overflow-y-auto"
              style={{
                background: "linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.4) 100%)",
              }}
            >
              {/* Header with house name */}
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200/50">
                <h3 className="text-lg font-semibold text-slate-900">
                  {houseName} House
                </h3>
              </div>

              {/* Peak times chart */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-slate-700 mb-3">
                  Peak Times (Today)
                </h4>
                <div className="bg-white/50 rounded-lg p-3 backdrop-blur-sm">
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={analytics.peakHours}>
                      <XAxis
                        dataKey="hour"
                        tick={{ fontSize: 11 }}
                        tickFormatter={(h) => `${h % 12 || 12}${h >= 12 ? "p" : "a"}`}
                        interval={2}
                      />
                      <YAxis hide />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload[0]) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-slate-900 text-white px-3 py-2 rounded shadow-lg text-xs">
                                <p className="font-semibold">
                                  {data.hour % 12 || 12}:00 {data.hour >= 12 ? "PM" : "AM"}
                                </p>
                                <p>{data.usagePercent}% busy</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar dataKey="usagePercent" radius={[4, 4, 0, 0]}>
                        {analytics.peakHours.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.usagePercent >= 60 ? "#f59e0b" : "#10b981"}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  <p className="text-xs text-slate-500 mt-2 text-center">
                    🟢 Low traffic · 🟠 Peak hours (avoid if possible)
                  </p>
                </div>
              </div>

              {/* Impact metrics grid */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-white/50 backdrop-blur-sm rounded-lg p-4">
                  <p className="text-xs text-slate-500 mb-1">Avg Idle Time</p>
                  <p className="text-2xl font-bold text-slate-900">{analytics.avgIdleTimeMins}m</p>
                </div>
                <div className="bg-white/50 backdrop-blur-sm rounded-lg p-4">
                  <p className="text-xs text-slate-500 mb-1">Unregistered</p>
                  <p className="text-2xl font-bold text-slate-900">{analytics.hardwareDetectedPercent}%</p>
                </div>
              </div>

              {/* Buddy Wash impact card */}
              <div className="bg-gradient-to-br from-blue-50/80 to-green-50/80 backdrop-blur-sm rounded-lg p-4 border border-blue-200/30">
                <h4 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
                  💧 Buddy Wash Impact (This Week)
                </h4>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <p className="text-xs text-slate-600 mb-1">Shared Loads</p>
                    <p className="text-xl font-bold text-blue-600">{buddyWashImpact.sharedLoads}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600 mb-1">Water Saved</p>
                    <p className="text-xl font-bold text-green-600">{buddyWashImpact.waterSavedL}L</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600 mb-1">Energy Saved</p>
                    <p className="text-xl font-bold text-green-600">{buddyWashImpact.kwhSaved.toFixed(1)} kWh</p>
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-3 text-center">
                  {analytics.buddyWashParticipationRate}% participation rate
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
