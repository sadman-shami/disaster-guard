import { createFileRoute } from "@tanstack/react-router";
import { AdminLoginPage } from "#/components/apps/admin-login-page";

export const Route = createFileRoute("/admin/login")({
	component: AdminLoginRoute,
	ssr: true,
});

function AdminLoginRoute() {
	return <AdminLoginPage />;
}
