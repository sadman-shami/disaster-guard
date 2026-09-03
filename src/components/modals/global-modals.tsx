import { AddDepotModal } from "#/components/modals/add-depot-modal";
import { AddResourceModal } from "#/components/modals/add-resource-modal";
import { AllocateResourceModal } from "#/components/modals/allocate-resource-modal";
import { ReportIncidentModal } from "#/components/modals/report-incident-modal";
import { useDisasterStore } from "#/store/useDisasterStore";

export function GlobalModals() {
	const {
		isReportModalOpen,
		setIsReportModalOpen,
		isAllocateModalOpen,
		setIsAllocateModalOpen,
		isAddResourceModalOpen,
		setIsAddResourceModalOpen,
		isAddDepotModalOpen,
		setIsAddDepotModalOpen,
		selectedIncidentForAllocation,
		selectedResourceForAllocation,
	} = useDisasterStore();

	return (
		<>
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
		</>
	);
}
