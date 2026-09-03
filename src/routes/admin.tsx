import { createFileRoute, Link } from "@tanstack/react-router";
import { AdminDashboard } from "#/components/apps/admin-dashboard";
import { useDisasterStore } from "#/store/useDisasterStore";
import { Lock, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/admin")({
	component: AdminPage,
	ssr: true,
});

function AdminPage() {
	const { openAllocateModal, setIsAddDepotModalOpen, currentUser } =
		useDisasterStore();

	if (currentUser.role !== "admin") {
		return (
			<div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
				<div className="max-w-md w-full bg-card border border-border p-8 rounded-xl shadow-2xl text-center space-y-6">
					<div className="inline-flex items-center justify-center size-16 rounded-full bg-destructive/10 text-destructive mx-auto border border-destructive/20">
						<Lock className="size-8" />
					</div>
					<div className="space-y-2">
						<h1 className="text-xl font-bold tracking-tight text-foreground">
							Admin Command Restricted
						</h1>
						<p className="text-xs text-muted-foreground">
							This operational sector requires authorized{" "}
							<strong>Operations Admin</strong> credentials. Your current
							signed-in role is{" "}
							<span className="capitalize font-bold text-foreground">
								{currentUser.role.replace("_", " ")}
							</span>{" "}
							({currentUser.name}).
						</p>
					</div>
					<div className="pt-2 flex flex-col space-y-2">
						<Link
							to="/signin"
							className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 px-4 py-2 rounded-md inline-flex items-center justify-center space-x-2 text-sm shadow-lg transition-colors"
						>
							<span>Sign In with Admin Credentials</span>
							<ArrowRight className="size-4" />
						</Link>
						<Link
							to="/"
							className="w-full border border-border bg-background hover:bg-accent hover:text-accent-foreground font-medium h-10 px-4 py-2 rounded-md inline-flex items-center justify-center text-xs transition-colors"
						>
							Return to Live Crisis Grid
						</Link>
					</div>
				</div>
			</div>
		);
	}

	return (
		<AdminDashboard
			onOpenAllocateModal={openAllocateModal}
			onOpenAddDepotModal={() => setIsAddDepotModalOpen(true)}
		/>
	);
}
