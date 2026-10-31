import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SITE } from "@/lib/site";

export function ContactCta() {
  return (
    <section id="kontakt" className="relative overflow-hidden bg-ink-gradient">
      <div className="pointer-events-none absolute inset-0 bg-sheet-grid" aria-hidden />
      <div className="relative mx-auto max-w-3xl px-5 py-20 text-center text-ink-foreground lg:py-28">
        <p className="eyebrow text-seaglass">Bezpłatna konsultacja</p>
        <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">
          Porozmawiajmy o Twoich obowiązkach DORA
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-ink-muted">
          Napisz do nas przez formularz kontaktowy Secureside i wspomnij, które raporty Cię dotyczą.
          Odezwiemy się, żeby ustalić termin krótkiej rozmowy i przygotować ofertę.
        </p>
        <ul className="mx-auto mt-8 flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm text-ink-muted">
          {["Bez zobowiązań", "Wycena dopasowana do zakresu", "Raporty i czynności w jednym miejscu"].map(
            (t) => (
              <li key={t} className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-seaglass" /> {t}
              </li>
            ),
          )}
        </ul>
        <Button asChild variant="hero" size="xl" className="mt-10">
          <a href={SITE.contactUrl}>
            Przejdź do formularza kontaktowego <ArrowRight />
          </a>
        </Button>
      </div>
    </section>
  );
}
