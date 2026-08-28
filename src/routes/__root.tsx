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
        name: "icon",
        type: "image/svg+xml",
        href: "/favicon.svg",
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
      <body>
        <DisasterProvider>{children}</DisasterProvider>
        <Scripts />
      </body>
    </html>
  );
}
