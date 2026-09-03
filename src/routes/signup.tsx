import { createFileRoute } from "@tanstack/react-router";
import { SignUpPage } from "#/components/apps/signup-page";

export const Route = createFileRoute("/signup")({
	component: SignUpRoute,
	ssr: true,
});

function SignUpRoute() {
	return <SignUpPage />;
}
