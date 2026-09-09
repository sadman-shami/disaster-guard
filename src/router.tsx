import { createRouter as createTanStackRouter, Link } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export function getRouter() {
	const router = createTanStackRouter({
		routeTree,
		scrollRestoration: true,
		defaultPreload: "intent",
		defaultPreloadStaleTime: 0,
		defaultNotFoundComponent: () => (
			<div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
				<div className="size-16 rounded-full bg-destructive/10 text-destructive flex items-center justify-center text-2xl font-bold">
					404
				</div>
				<h1 className="text-2xl font-bold text-foreground">Page Not Found</h1>
				<p className="text-sm text-muted-foreground max-w-md">
					The requested operational view or URL does not exist or has been restricted.
				</p>
				<Link
					to="/"
					className="px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-lg shadow hover:bg-primary/90 transition-colors"
				>
					Return to Live Crisis Grid
				</Link>
			</div>
		),
	});

	return router;
}

declare module "@tanstack/react-router" {
	interface Register {
		router: ReturnType<typeof getRouter>;
	}
}
