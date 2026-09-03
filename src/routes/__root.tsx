import {
	createRootRoute,
	HeadContent,
	Outlet,
	Scripts,
} from "@tanstack/react-router";
import { Header } from "#/components/apps/header";
import { GlobalModals } from "#/components/modals/global-modals";
import { useDisasterStore } from "#/store/useDisasterStore";

import appCss from "#/styles.css?url";

export const Route = createRootRoute({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: "Disaster Guard | Tactical Emergency Response Grid",
			},
			{
				name: "description",
				content:
					"Real-time multi-agency crisis coordination, situational mapping, and resource allocation platform.",
			},
		],
		links: [
			{
				rel: "stylesheet",
				href: appCss,
			},
			{
				rel: "stylesheet",
				href: "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css",
				integrity: "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=",
				crossOrigin: "",
			},
			{ rel: "icon", href: "/favicon.svg" },
		],
	}),
	component: RootComponent,
	shellComponent: RootDocument,
	ssr: true,
});

function RootComponent() {
	const { setIsReportModalOpen } = useDisasterStore();

	return (
		<div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary selection:text-primary-foreground">
			<Header onOpenReportModal={() => setIsReportModalOpen(true)} />
			<main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
				<Outlet />
			</main>
			<GlobalModals />
		</div>
	);
}

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" className="dark" suppressHydrationWarning>
			<head>
				<HeadContent />
			</head>
			<body className="min-h-screen bg-background text-foreground antialiased">
				{children}
				<Scripts />
			</body>
		</html>
	);
}
