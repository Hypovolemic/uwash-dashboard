import { useState } from "react";
import { CollegeProvider, useCollege } from "./context/CollegeContext";
import { Header, type Tab } from "./components/Header";

function AppContent() {
  const [activeTab, setActiveTab] = useState<Tab>("status");
  const { collegeId, houseId } = useCollege();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/40 to-gray-50">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="max-w-md mx-auto px-4 py-6">
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
          <div className="space-y-4">
            {/* D-04: Machine status cards go here */}
            <EmptyState
              icon="🌀"
              title="Machine status"
              subtitle="Cards will appear here in the next build"
            />
          </div>
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
