import { useMemo, useRef, useState } from "react";
import { CollegeProvider, useCollege } from "./context/CollegeContext";
import { Header } from "./components/Header";
import { MachineCard } from "./components/MachineCard";
import { QueueSheet } from "./components/QueueSheet";
import { StatsStrip } from "./components/StatsStrip";
import { IdleAlertBanner } from "./components/IdleAlertBanner";
import { TelebotControlPanel } from "./components/TelebotControlPanel";
import { InlineAnalyticsSection } from "./components/InlineAnalyticsSection";
import { SectionSwitchBar } from "./components/SectionSwitchBar";
import { mockStatus, mockQueue, mockBuddyWash, mockAnalyticsGaruda } from "./data/mock";
import { useTick } from "./hooks/useTick";
import { useStatus } from "./hooks/useStatus";
import { useTelebotCore } from "./hooks/useTelebotCore";
import { getTelegramIdentity } from "./api/telegramIdentity";

type SectionKey = "washer" | "dryer" | "analytics";

function StatusView() {
  useTick(1000);
  const { collegeId, houseId } = useCollege();
  const telegramIdentity = useMemo(() => getTelegramIdentity(), []);
  const [queueOpen, setQueueOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<SectionKey>("washer");
  const washerSectionRef = useRef<HTMLDivElement | null>(null);
  const dryerSectionRef = useRef<HTMLDivElement | null>(null);
  const analyticsSectionRef = useRef<HTMLDivElement | null>(null);

  // Fetch status from backend (falls back to mock if VITE_USE_MOCK=true)
  const { status: backendStatus, loading, error } = useStatus({ house: houseId });

  // Use backend status as template, fallback to mockStatus
  const templateStatus = backendStatus ?? mockStatus;

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
    templateStatus,
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

  function scrollToSection(section: SectionKey) {
    setActiveSection(section);
    const sectionNode: HTMLDivElement | null = {
      washer: washerSectionRef.current,
      dryer: dryerSectionRef.current,
      analytics: analyticsSectionRef.current,
    }[section];

    if (!sectionNode) return;

    // Offset accounts for sticky header and gives breathing room for section labels.
    const topOffsetPx = 170;
    const targetTop =
      sectionNode.getBoundingClientRect().top + window.scrollY - topOffsetPx;

    window.scrollTo({ top: Math.max(0, targetTop), behavior: "smooth" });
  }

  // Show loading state
  if (loading && !backendStatus) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-gray-500">Loading machines...</p>
      </div>
    );
  }

  // Show error state (but still render if we have cached data)
  if (error && !backendStatus) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <p className="text-red-500">Failed to load: {error}</p>
        <p className="text-sm text-gray-400">Using mock data as fallback</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-28">
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
      <div ref={washerSectionRef} className="flex flex-col gap-2 scroll-mt-44">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Washers</p>
        <div className="grid grid-cols-3 gap-3">
          {washers.map(([machineId, entry]) => (
            <MachineCard key={machineId} machineId={machineId} entry={entry} onQueueTap={() => setQueueOpen(true)} />
          ))}
        </div>
      </div>

      {/* Dryers row */}
      <div ref={dryerSectionRef} className="flex flex-col gap-2 scroll-mt-44">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Dryers</p>
        <div className="grid grid-cols-3 gap-3">
          {dryers.map(([machineId, entry]) => (
            <MachineCard key={machineId} machineId={machineId} entry={entry} onQueueTap={() => setQueueOpen(true)} />
          ))}
        </div>
      </div>

      {/* Inline analytics section (end of one-page flow) */}
      <div ref={analyticsSectionRef} className="scroll-mt-44">
        <InlineAnalyticsSection
          analytics={mockAnalyticsGaruda}
          buddyWashImpact={mockBuddyWash.weeklyImpact}
          houseName={houseId ?? status.house}
        />
      </div>

      <SectionSwitchBar activeSection={activeSection} onChange={scrollToSection} />

      <QueueSheet
        open={queueOpen}
        onClose={() => setQueueOpen(false)}
        queue={mockQueue}
      />
    </div>
  );
}

function AppContent() {
  const { collegeId, houseId } = useCollege();

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
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
        ) : (
          <StatusView />
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
