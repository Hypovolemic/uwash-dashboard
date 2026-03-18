import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import type { AnalyticsResponse, BuddyWashWeeklyImpact } from "../types/api";
import { getCurrentPeakInfo } from "../data/mock";

type Props = {
  analytics: AnalyticsResponse;
  buddyWashImpact: BuddyWashWeeklyImpact;
  houseName: string;
};

export function InlineAnalyticsSection({ analytics, buddyWashImpact, houseName }: Props) {
  const peakInfo = getCurrentPeakInfo(analytics);

  const peakSummary = (() => {
    if (peakInfo.inPeak && peakInfo.peakEnd !== null) {
      return `Peak now until ${peakInfo.peakEnd % 12 || 12}${peakInfo.peakEnd >= 12 ? "pm" : "am"}`;
    }
    if (peakInfo.nextPeakStart !== null) {
      return `Next peak at ${peakInfo.nextPeakStart % 12 || 12}${peakInfo.nextPeakStart >= 12 ? "pm" : "am"}`;
    }
    return "No peak period today";
  })();

  return (
    <section className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
      <div className="flex items-end justify-between gap-4 mb-4">
        <div>
          <p className="text-base font-semibold text-slate-900">Analytics</p>
          <p className="text-xs text-slate-500">{houseName} · {peakSummary}</p>
        </div>
      </div>

      <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 mb-4">
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
                <Cell key={`cell-${index}`} fill={entry.usagePercent >= 60 ? "#f59e0b" : "#3b82f6"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <Metric label="Idle Time" value={`${analytics.avgIdleTimeMins}m`} />
        <Metric label="Unregistered" value={`${analytics.hardwareDetectedPercent}%`} />
        <Metric label="Shared Loads" value={String(buddyWashImpact.sharedLoads)} />
        <Metric label="Water Saved" value={`${buddyWashImpact.waterSavedL}L`} />
      </div>

      <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3">
        <p className="text-sm font-medium text-emerald-800">Buddy Wash Impact</p>
        <p className="text-xs text-emerald-700 mt-1">
          {buddyWashImpact.kwhSaved.toFixed(1)} kWh saved · {analytics.buddyWashParticipationRate}% participation rate
        </p>
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-lg font-semibold text-slate-900 mt-1">{value}</p>
    </div>
  );
}
