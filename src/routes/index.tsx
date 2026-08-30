import { ClientOnly, createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AdminDashboard } from "#/components/apps/admin-dashboard";
import { Header } from "#/components/apps/header";
import { IncidentFeed } from "#/components/apps/incident-feed";
import { InteractiveMap } from "#/components/apps/interactive-map";
import { ResourceManagement } from "#/components/apps/resource-management";
import { VolunteerPortal } from "#/components/apps/volunteer-portal";
import { AddDepotModal } from "#/components/modals/add-depot-modal";
import { AddResourceModal } from "#/components/modals/add-resource-modal";
import { AllocateResourceModal } from "#/components/modals/allocate-resource-modal";
import { ReportIncidentModal } from "#/components/modals/report-incident-modal";
import { useDisasterStore } from "#/store/useDisasterStore";
import type { EmergencyResource, Incident } from "#/types";
export const Route = createFileRoute("/")({ component: App, ssr: true });

function App() {
	const { activeTab } = useDisasterStore();

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
				{/* Incident feed page */}
				{activeTab === "feed" && (
					<IncidentFeed
						onOpenAllocateModal={handleOpenAllocateModal}
						onOpenReportModal={() => setIsReportModalOpen(true)}
					/>
				)}

				{/* Interactive map */}
				{activeTab === "map" && (
					<ClientOnly>
						<InteractiveMap
							onOpenAllocateModal={handleOpenAllocateModal}
							onOpenReportModal={() => setIsReportModalOpen(true)}
							onOpenAddDepotModal={() => setIsAddDepotModalOpen(true)}
						/>
					</ClientOnly>
				)}

				{/* Resource management */}
				{activeTab === "resources" && (
					<ResourceManagement
						onOpenAllocateModal={handleOpenAllocateModal}
						onOpenAddResourceModal={() => setIsAddResourceModalOpen(true)}
						onOpenAddDepotModal={() => setIsAddDepotModalOpen(true)}
					/>
				)}

				{/* Volunteer Portal */}
				{activeTab === "volunteers" && <VolunteerPortal />}

				{/* Admin Dashboard */}
				{activeTab === "admin" && (
					<AdminDashboard onOpenAllocateModal={handleOpenAllocateModal} />
				)}
			</main>

			{/* Modals */}
			<ReportIncidentModal
				open={isReportModalOpen}
				onOpenChange={setIsReportModalOpen}
			/>

			<AddResourceModal
				open={isAddResourceModalOpen}
				onOpenChange={setIsAddResourceModalOpen}
			/>

			<AllocateResourceModal
				open={isAllocateModalOpen}
				onOpenChange={setIsAllocateModalOpen}
				targetIncident={selectedIncidentForAllocation}
				preselectedResource={selectedResourceForAllocation}
			/>

			<AddDepotModal
				open={isAddDepotModalOpen}
				onOpenChange={setIsAddDepotModalOpen}
			/>
		</div>
	);
}
