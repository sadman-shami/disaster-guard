import { createFileRoute } from "@tanstack/react-router";
import { IncidentFeed } from "#/components/apps/incident-feed";
import { useDisasterStore } from "#/store/useDisasterStore";

export const Route = createFileRoute("/")({
	component: IncidentFeedPage,
	ssr: true,
});

function IncidentFeedPage() {
	const { openAllocateModal, setIsReportModalOpen } = useDisasterStore();

	return (
		<IncidentFeed
			onOpenAllocateModal={openAllocateModal}
			onOpenReportModal={() => setIsReportModalOpen(true)}
		/>
	);
}
