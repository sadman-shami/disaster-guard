import { createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";

import { DisasterProvider } from "#/components/provider/DisasterProvider";
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
  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <DisasterProvider>{children}</DisasterProvider>
        <Scripts />
      </body>
    </html>
  );
}
