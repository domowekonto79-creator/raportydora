import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";

const TITLE = "Dziękujemy za zapytanie – DORA as a Service";
const DESCRIPTION = "Twoje zapytanie o obsługę raportowania DORA do KNF zostało wysłane.";

// Conversion page: ad platforms count a lead when a visitor lands here after sending the form.
export const Route = createFileRoute("/dziekujemy")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ThankYou,
});

function ThankYou() {
  return (
    <main className="relative flex min-h-screen items-center overflow-hidden bg-ink-gradient px-5 text-ink-foreground">
      <div className="pointer-events-none absolute inset-0 bg-sheet-grid" aria-hidden />
      <div className="relative mx-auto max-w-xl animate-rise text-center">
        <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-seaglass shadow-glow">
          <CheckCircle2 className="size-8 text-ink" aria-hidden />
        </span>
        <h1 className="mt-8 text-3xl font-semibold sm:text-4xl">Dziękujemy za zapytanie!</h1>
        <p className="mt-4 text-lg text-ink-muted">
          Otrzymaliśmy Twoją wiadomość. Odezwiemy się, aby ustalić termin bezpłatnej konsultacji.
        </p>
        <Button asChild variant="heroOutline" size="xl" className="mt-10">
          <Link to="/">
            <ArrowLeft /> Wróć na stronę główną
          </Link>
        </Button>
      </div>
    </main>
  );
}
