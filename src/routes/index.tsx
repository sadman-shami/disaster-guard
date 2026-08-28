import { createFileRoute } from "@tanstack/react-router";
import React, { useState } from "react";
import { Header } from "#/components/apps/header";
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
    <React.Fragment>
      <Header onOpenReportModal={() => setIsReportModalOpen(true)} />
      <main>
        <h1 className="font-heading text-xl">Home</h1>
      </main>
    </React.Fragment>
  );
}
