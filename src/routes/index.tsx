import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { Header } from "#/components/apps/header";
import { IncidentFeed } from "#/components/apps/incident-feed";
import { useDisaster } from "#/components/provider/DisasterProvider";
import type { EmergencyResource, Incident } from "#/types";
export const Route = createFileRoute("/")({ component: App });

function App() {
  const { activeTab } = useDisaster();

  // Modal States
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [isAllocateModalOpen, setIsAllocateModalOpen] =
    useState<boolean>(false);
  const [isAddResourceModalOpen, setIsAddResourceModalOpen] =
    useState<boolean>(false);
  const [isAddDepotModalOpen, setIsAddDepotModalOpen] =
    useState<boolean>(false);

  const [selectedIncidentForAllocation, setSelectedIncidentForAllocation] =
    useState<Incident | undefined>();
  const [selectedResourceForAllocation, setSelectedResourceForAllocation] =
    useState<EmergencyResource | undefined>();

  const handleOpenAllocateModal = (
    incident?: Incident,
    resource?: EmergencyResource,
  ) => {
    setSelectedIncidentForAllocation(incident);
    setSelectedResourceForAllocation(resource);
    setIsAllocateModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary selection:text-primary-foreground">
      {/* Header with OPCON status strip, tab switcher & predefined user roles */}
      <Header onOpenReportModal={() => setIsReportModalOpen(true)} />
      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === "feed" && (
          <IncidentFeed
            onOpenAllocateModal={handleOpenAllocateModal}
            onOpenReportModal={() => setIsReportModalOpen(true)}
          />
        )}
      </main>
    </div>
  );
}
