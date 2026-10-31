import { useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";

import { ContactForm } from "@/components/landing/ContactForm";
import {
  Audience,
  Faq,
  Footer,
  Header,
  Hero,
  Problems,
  Procedures,
  Process,
  Reports,
} from "@/components/landing/Sections";
import { captureAttribution } from "@/lib/attribution";

const TITLE = "DORA as a Service – sprawozdania do KNF (SPR-PF-26, 27, 18, 01)";
const DESCRIPTION =
  "Outsourcing obowiązków DORA: ankiety KRI, rejestr informacji i inne formularze SPR-PF do KNF oraz czynności z polityk i procedur. Umów bezpłatną konsultację.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  useEffect(() => {
    captureAttribution();
  }, []);

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <Problems />
        <Reports />
        <Procedures />
        <Process />
        <Audience />
        <Faq />
        <ContactForm />
      </main>
      <Footer />
    </div>
  );
}
