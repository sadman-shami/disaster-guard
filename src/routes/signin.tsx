import { createFileRoute } from "@tanstack/react-router";
import { SignInPage } from "#/components/apps/signin-page";

export const Route = createFileRoute("/signin")({
	component: SignInRoute,
	ssr: true,
});

function SignInRoute() {
	return <SignInPage />;
}
