import { createFileRoute } from "@tanstack/react-router";
import { AdminDashboard } from "#/components/apps/admin-dashboard";
import { useDisasterStore } from "#/store/useDisasterStore";

export const Route = createFileRoute("/admin")({
	component: AdminPage,
	ssr: true,
});

function AdminPage() {
	const { openAllocateModal, setIsAddDepotModalOpen } = useDisasterStore();

	return (
		<AdminDashboard
			onOpenAllocateModal={openAllocateModal}
			onOpenAddDepotModal={() => setIsAddDepotModalOpen(true)}
		/>
	);
}
