import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({ component: App });

function App() {
  return (
    <main>
      <h1 className="font-heading text-xl">Home</h1>
    </main>
  );
}
