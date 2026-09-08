import { createFileRoute, Link } from "@tanstack/react-router";
import { VolunteerPortal } from "#/components/apps/volunteer-portal";
import { useDisasterStore } from "#/store/useDisasterStore";
import { Lock, ArrowRight, UserCheck } from "lucide-react";

export const Route = createFileRoute("/volunteers")({
	component: VolunteersPage,
	ssr: true,
});

function VolunteersPage() {
	const { currentUser } = useDisasterStore();

	if (!currentUser) {
		return (
			<div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
				<div className="max-w-md w-full bg-card border border-border p-8 rounded-xl shadow-2xl text-center space-y-6">
					<div className="inline-flex items-center justify-center size-16 rounded-full bg-primary/10 text-primary mx-auto border border-primary/20">
						<Lock className="size-8" />
					</div>
					<div className="space-y-2">
						<h1 className="text-xl font-bold tracking-tight text-foreground">
							Volunteer Portal Authentication Required
						</h1>
						<p className="text-xs text-muted-foreground">
							Only logged-in users can access the Volunteer Portal, join response teams, and participate in mission assignments. Please sign in or create an account.
						</p>
					</div>
					<div className="pt-2 flex flex-col space-y-2">
						<Link
							to="/signin"
							className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 px-4 py-2 rounded-md inline-flex items-center justify-center space-x-2 text-sm shadow-lg transition-colors"
						>
							<span>Sign In to Access Volunteer Portal</span>
							<ArrowRight className="size-4" />
						</Link>
						<Link
							to="/signup"
							className="w-full border border-border bg-secondary hover:bg-accent text-foreground font-bold h-10 px-4 py-2 rounded-md inline-flex items-center justify-center space-x-2 text-xs transition-colors"
						>
							<UserCheck className="size-4" />
							<span>Create New Account</span>
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

	return <VolunteerPortal />;
}

