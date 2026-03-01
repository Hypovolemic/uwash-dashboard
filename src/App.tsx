import { useState } from "react";
import { CollegeProvider, useCollege } from "./context/CollegeContext";
import { Header, type Tab } from "./components/Header";
import { MachineCard } from "./components/MachineCard";
import { StatsStrip } from "./components/StatsStrip";
import { IdleAlertBanner } from "./components/IdleAlertBanner";
import { mockStatus } from "./data/mock";

function StatusView() {
  return (
    <div>
      <IdleAlertBanner status={mockStatus} />
      <StatsStrip status={mockStatus} />
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
        Machines
      </p>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Object.entries(mockStatus.machines).map(([machineId, entry]) => (
          <MachineCard key={machineId} machineId={machineId} entry={entry} />
        ))}
      </div>
    </div>
  );
}

function AppContent() {
  const [activeTab, setActiveTab] = useState<Tab>("status");
  const { collegeId, houseId } = useCollege();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/40 to-gray-50">
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
