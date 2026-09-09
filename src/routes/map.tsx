import { ClientOnly, createFileRoute } from "@tanstack/react-router";
import { InteractiveMap } from "#/components/apps/interactive-map";
import { useDisasterStore } from "#/store/useDisasterStore";

export const Route = createFileRoute("/map")({
	component: MapPage,
	ssr: true,
});

function MapPage() {
	const { openAllocateModal, setIsReportModalOpen, setIsAddDepotModalOpen } =
		useDisasterStore();

	return (
		<ClientOnly>
			<InteractiveMap
				onOpenAllocateModal={openAllocateModal}
				onOpenReportModal={() => setIsReportModalOpen(true)}
				onOpenAddDepotModal={() => setIsAddDepotModalOpen(true)}
			/>
		</ClientOnly>
	);
}
