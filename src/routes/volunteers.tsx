import { createFileRoute } from "@tanstack/react-router";
import { VolunteerPortal } from "#/components/apps/volunteer-portal";

export const Route = createFileRoute("/volunteers")({
	component: VolunteersPage,
	ssr: true,
});

function VolunteersPage() {
	return <VolunteerPortal />;
}
