import { ClientOnly, createFileRoute, Link } from "@tanstack/react-router";
import { InteractiveMap } from "#/components/apps/interactive-map";
import { useDisasterStore } from "#/store/useDisasterStore";
import { Lock, ArrowRight, User } from "lucide-react";

export const Route = createFileRoute("/map")({
	component: MapPage,
	ssr: true,
});

function MapPage() {
	const { openAllocateModal, setIsReportModalOpen, setIsAddDepotModalOpen, currentUser } =
		useDisasterStore();

	const isAuthorized =
		currentUser &&
		(currentUser.role === "admin" || currentUser.role === "responder");

	if (!isAuthorized) {
		return (
			<div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
				<div className="max-w-md w-full bg-card border border-border p-8 rounded-xl shadow-2xl text-center space-y-6">
					<div className="inline-flex items-center justify-center size-16 rounded-full bg-destructive/10 text-destructive mx-auto border border-destructive/20">
						<Lock className="size-8" />
					</div>
					<div className="space-y-2">
						<h1 className="text-xl font-bold tracking-tight text-foreground">
							Safety Map Restricted
						</h1>
						<p className="text-xs text-muted-foreground">
							The live Safety Map utility requires an{" "}
							<strong>Admin</strong> or <strong>Emergency Responder</strong> profile.{" "}
							{currentUser ? (
								<>
									Your current signed-in role is{" "}
									<span className="capitalize font-bold text-foreground">
										{currentUser.role.replace("_", " ")}
									</span>{" "}
									({currentUser.name}), which is a standard citizen profile.
								</>
							) : (
								<>You are currently not signed in.</>
							)}
						</p>
					</div>
					<div className="pt-2 flex flex-col space-y-2">
						<Link
							to="/volunteers"
							className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 px-4 py-2 rounded-md inline-flex items-center justify-center space-x-2 text-sm shadow-lg transition-colors"
						>
							<User className="size-4" />
							<span>Access Your Volunteer Profile</span>
						</Link>
						<Link
							to="/signin"
							className="w-full border border-border bg-secondary hover:bg-accent text-foreground font-bold h-10 px-4 py-2 rounded-md inline-flex items-center justify-center space-x-2 text-xs transition-colors"
						>
							<span>Sign In with Responder Credentials</span>
							<ArrowRight className="size-4" />
						</Link>
						<Link
							to="/"
							className="w-full border border-border bg-background hover:bg-accent hover:text-accent-foreground font-medium h-10 px-4 py-2 rounded-md inline-flex items-center justify-center text-xs transition-colors"
						>
							Return to Incident Feed
						</Link>
					</div>
				</div>
			</div>
		);
	}

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
