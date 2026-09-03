import { createFileRoute } from "@tanstack/react-router";
import { ResourceManagement } from "#/components/apps/resource-management";
import { useDisasterStore } from "#/store/useDisasterStore";

export const Route = createFileRoute("/resources")({
	component: ResourcesPage,
	ssr: true,
});

function ResourcesPage() {
	const {
		openAllocateModal,
		setIsAddResourceModalOpen,
		setIsAddDepotModalOpen,
	} = useDisasterStore();

	return (
		<ResourceManagement
			onOpenAllocateModal={openAllocateModal}
			onOpenAddResourceModal={() => setIsAddResourceModalOpen(true)}
			onOpenAddDepotModal={() => setIsAddDepotModalOpen(true)}
		/>
	);
}
