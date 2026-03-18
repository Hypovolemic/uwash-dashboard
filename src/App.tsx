import { useMemo, useState } from "react";
import { CollegeProvider, useCollege } from "./context/CollegeContext";
import { Header, type Tab } from "./components/Header";
import { MachineCard } from "./components/MachineCard";
import { QueueSheet } from "./components/QueueSheet";
import { AnalyticsSheet } from "./components/AnalyticsSheet";
import { StatsStrip } from "./components/StatsStrip";
import { IdleAlertBanner } from "./components/IdleAlertBanner";
import { TelebotControlPanel } from "./components/TelebotControlPanel";
import { mockStatus, mockQueue, mockBuddyWash, mockAnalyticsGaruda } from "./data/mock";
import { useTick } from "./hooks/useTick";
import { useTelebotCore } from "./hooks/useTelebotCore";
import { getTelegramIdentity } from "./api/telegramIdentity";

function StatusView() {
  useTick(1000);
  const { collegeId, houseId } = useCollege();
  const telegramIdentity = useMemo(() => getTelegramIdentity(), []);
  const [queueOpen, setQueueOpen] = useState(false);
  const [analyticsExpanded, setAnalyticsExpanded] = useState(false);

  const {
    status,
    username,
    setUsername,
    selectedMachineId,
    setSelectedMachineId,
    selectedDurationMins,
    setSelectedDurationMins,
    durationOptions,
    alerts,
    setTimer,
    dismissAlert,
  } = useTelebotCore({
    collegeId: collegeId ?? mockStatus.college,
    houseId: houseId ?? mockStatus.house,
    userId: telegramIdentity?.userId ?? "dashboard-user",
    templateStatus: mockStatus,
  });

  const entries = Object.entries(status.machines);
  const washers = entries.filter(([, e]) => e.kind === "washer");
  const dryers  = entries.filter(([, e]) => e.kind === "dryer");
  const userOptions = Array.from(
    new Set([
      username,
      telegramIdentity?.username ?? "",
      ...entries.map(([, e]) => e.currUser).filter((value): value is string => Boolean(value)),
      "sarah_tan",
      "kai_lim",
      "resident_user",
    ].filter((value) => Boolean(value && value.trim())))
  );

  // Calculate available count
  const availableCount = entries.filter(([, e]) => e.status === "available").length;
  const totalCount = entries.length;

  return (
    <div className="flex flex-col gap-6 pb-24">
      <TelebotControlPanel
        autoDetectedUsername={telegramIdentity?.username ?? null}
        userOptions={userOptions}
        machineIds={entries.map(([machineId]) => machineId)}
        selectedMachineId={selectedMachineId}
        onMachineChange={setSelectedMachineId}
        durationOptions={durationOptions}
        selectedDurationMins={selectedDurationMins}
        onDurationChange={setSelectedDurationMins}
        username={username}
        onUsernameChange={setUsername}
        onSetTimer={setTimer}
        alerts={alerts}
        onDismissAlert={dismissAlert}
      />

      <IdleAlertBanner status={status} />
      <StatsStrip status={status} onQueueTap={() => setQueueOpen(true)} />

      {/* Washers row */}
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Washers</p>
        <div className="grid grid-cols-3 gap-3">
          {washers.map(([machineId, entry]) => (
            <MachineCard key={machineId} machineId={machineId} entry={entry} onQueueTap={() => setQueueOpen(true)} />
          ))}
        </div>
      </div>

      {/* Dryers row */}
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Dryers</p>
        <div className="grid grid-cols-3 gap-3">
          {dryers.map(([machineId, entry]) => (
            <MachineCard key={machineId} machineId={machineId} entry={entry} onQueueTap={() => setQueueOpen(true)} />
          ))}
        </div>
      </div>

      <QueueSheet
        open={queueOpen}
        onClose={() => setQueueOpen(false)}
        queue={mockQueue}
      />

      <AnalyticsSheet
        expanded={analyticsExpanded}
        onToggle={() => setAnalyticsExpanded(!analyticsExpanded)}
        analytics={mockAnalyticsGaruda}
        buddyWashImpact={mockBuddyWash.weeklyImpact}
        houseName={houseId ?? status.house}
        availableCount={availableCount}
        totalCount={totalCount}
      />
    </div>
  );
}

function AppContent() {
  const [activeTab, setActiveTab] = useState<Tab>("status");
  const { collegeId, houseId } = useCollege();

  return (
    <div className="min-h-screen bg-gray-100">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="max-w-md mx-auto px-4 py-6 lg:max-w-5xl lg:px-6">
        {!collegeId ? (
          <EmptyState
            icon="🏠"
            title="Select your college"
            subtitle="Choose a college above to see laundry machine status"
          />
        ) : !houseId ? (
          <EmptyState
            icon="👆"
            title="Select a house"
            subtitle="Pick a house to view its machines"
          />
        ) : activeTab === "status" ? (
          <StatusView />
        ) : (
          <EmptyState
            icon="📊"
            title="Analytics"
            subtitle="Usage charts coming in D-08"
          />
        )}
      </main>
    </div>
  );
}

function EmptyState({
  icon,
  title,
  subtitle,
}: {
  icon: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
      <span className="text-4xl">{icon}</span>
      <p className="font-semibold text-gray-700">{title}</p>
      <p className="text-sm text-gray-400 max-w-xs">{subtitle}</p>
    </div>
  );
}

export default function App() {
  return (
    <CollegeProvider>
      <AppContent />
    </CollegeProvider>
  );
}
