import { Link } from "@tanstack/react-router";
import {
  AlarmClock,
  ArrowRight,
  BadgeCheck,
  Building2,
  CalendarClock,
  ClipboardCheck,
  FileCheck2,
  FileSpreadsheet,
  FolderSearch,
  Gauge,
  Landmark,
  Layers,
  ListChecks,
  MessagesSquare,
  RefreshCw,
  ShieldCheck,
  UserRoundCog,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SITE } from "@/lib/site";
import { SheetMockup } from "./SheetMockup";

function Logo({ inverted = false }: { inverted?: boolean }) {
  return (
    <span className="flex items-center gap-2">
      <span className="flex size-8 items-center justify-center rounded-md bg-accent-gradient font-mono text-xs font-bold text-ink">
        D
      </span>
      <span
        className={`font-display text-sm font-semibold tracking-tight ${
          inverted ? "text-ink-foreground" : "text-foreground"
        }`}
      >
        {SITE.brand}
      </span>
    </span>
  );
}

export function Header() {
  return (
    <header className="absolute inset-x-0 top-0 z-20">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <Logo inverted />
        <Button asChild variant="heroOutline" size="sm">
          <a href="#kontakt">Bezpłatna konsultacja</a>
        </Button>
      </div>
    </header>
  );
}

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-ink-gradient text-ink-foreground">
      <div className="pointer-events-none absolute inset-0 bg-sheet-grid" aria-hidden />
      <div className="relative mx-auto grid max-w-6xl gap-14 px-5 pb-24 pt-28 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:pb-32 lg:pt-36">
        <div className="animate-rise">
          <p className="eyebrow text-seaglass">DORA as a Service · sprawozdawczość do KNF</p>
          <h1 className="mt-5 text-4xl font-semibold leading-[1.08] sm:text-5xl lg:text-6xl">
            Raportowanie DORA do KNF —{" "}
            <span className="text-accent-gradient">bez obciążania Twojego zespołu.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-ink-muted">
            Przygotowujemy formularze SPR-PF (m.in. 18, 26, 27, 01) i realizujemy czynności
            wynikające z Twoich polityk i procedur. Ty zatwierdzasz — my wykonujemy pracę.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild variant="hero" size="xl">
              <a href="#kontakt">
                Umów bezpłatną konsultację <ArrowRight />
              </a>
            </Button>
            <Button asChild variant="heroOutline" size="xl">
              <a href="#raporty">Zobacz zakres raportów</a>
            </Button>
          </div>
          <ul className="mt-10 grid gap-3 text-sm text-ink-muted sm:grid-cols-3">
            {[
              "Formularze Excel w aktualnej wersji",
              "Kontrola i walidacja przed wysyłką",
              "Stały opiekun usługi",
            ].map((t) => (
              <li key={t} className="flex items-start gap-2">
                <BadgeCheck className="mt-0.5 size-4 shrink-0 text-seaglass" aria-hidden />
                {t}
              </li>
            ))}
          </ul>
        </div>
        <div className="animate-rise [animation-delay:150ms]">
          <SheetMockup />
        </div>
      </div>
    </section>
  );
}

const PAINS = [
  {
    icon: AlarmClock,
    title: "Terminy KNF nie czekają",
    text: "Sprawozdania kwartalne i aktualizacje rejestru wracają cyklicznie, a zespół ma też inne obowiązki.",
  },
  {
    icon: FileSpreadsheet,
    title: "Rozbudowane arkusze",
    text: "Dziesiątki zakładek, słowniki, identyfikatory i reguły walidacyjne — łatwo o błąd.",
  },
  {
    icon: RefreshCw,
    title: "Zmieniające się formularze",
    text: "KNF aktualizuje formularze i instrukcje. Trzeba to śledzić i dostosowywać dane.",
  },
  {
    icon: Users,
    title: "Brak rąk do pracy",
    text: "Zatrudnienie i wdrożenie specjalisty DORA trwa i kosztuje — a praca jest potrzebna teraz.",
  },
];

export function Problems() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-20 lg:py-28">
      <div className="max-w-2xl">
        <p className="eyebrow text-teal">Znasz to?</p>
        <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">
          DORA to nie jednorazowy projekt, tylko stały obowiązek.
        </h2>
      </div>
      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {PAINS.map(({ icon: Icon, title, text }) => (
          <div key={title} className="rounded-xl border bg-card p-6 shadow-soft">
            <Icon className="size-6 text-teal" aria-hidden />
            <h3 className="mt-4 text-base font-semibold">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

const REPORTS = [
  {
    code: "SPR-PF-18",
    title: "Pełny rejestr informacji",
    tag: "Rejestr umów ICT",
    text: "Rejestr ustaleń umownych dotyczących korzystania z usług ICT świadczonych przez zewnętrznych dostawców.",
    tasks: [
      "Inwentaryzacja umów i dostawców ICT",
      "Uzupełnienie arkuszy rejestru",
      "Weryfikacja identyfikatorów (np. LEI)",
      "Aktualizacja po zmianach w umowach",
    ],
  },
  {
    code: "SPR-PF-26",
    title: "Kwartalny raport mierników ryzyka",
    tag: "KRI · kwartalnie",
    text: "Cykliczne raportowanie mierników ryzyka (KRI) w obszarze ICT.",
    tasks: [
      "Zbieranie danych od właścicieli procesów",
      "Wyliczenie mierników",
      "Kontrola spójności z poprzednimi okresami",
      "Przygotowanie formularza do wysyłki",
    ],
  },
  {
    code: "SPR-PF-27",
    title: "Mierniki ryzyka",
    tag: "KRI",
    text: "Formularz mierników ryzyka przygotowany zgodnie z aktualną wersją formularza i instrukcji KNF.",
    tasks: [
      "Mapowanie źródeł danych",
      "Uzupełnienie i opis mierników",
      "Walidacja przed przekazaniem",
      "Archiwum wersji i założeń",
    ],
  },
  {
    code: "SPR-PF-01",
    title: "Regulacje wewnętrzne i ramy ryzyka ICT",
    tag: "Polityki i procedury",
    text: "Wykaz obowiązujących regulacji wewnętrznych i dokumentacji składającej się na ramy zarządzania ryzykiem ICT.",
    tasks: [
      "Inwentaryzacja polityk i procedur",
      "Przypisanie do obszarów ram ryzyka ICT",
      "Uzupełnienie arkuszy formularza",
      "Aktualizacja po zmianach dokumentów",
    ],
  },
];

export function Reports() {
  return (
    <section id="raporty" className="border-y bg-secondary/60">
      <div className="mx-auto max-w-6xl px-5 py-20 lg:py-28">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <p className="eyebrow text-teal">Sprawozdawczość DORA</p>
            <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">
              Formularze SPR-PF, którymi się zajmujemy
            </h2>
            <p className="mt-4 text-muted-foreground">
              Pracujemy na plikach Excel w wersji wymaganej przez KNF. Dostajesz kompletny,
              sprawdzony formularz gotowy do przekazania.
            </p>
          </div>
          <Button asChild variant="brand" size="lg" className="self-start lg:self-auto">
            <a href="#kontakt">Zapytaj o swój zakres</a>
          </Button>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {REPORTS.map((r) => (
            <article
              key={r.code}
              className="group flex flex-col rounded-2xl border bg-card p-6 shadow-soft transition-shadow hover:shadow-float sm:p-8"
            >
              <div className="flex items-start justify-between gap-4">
                <span className="font-mono text-2xl font-semibold text-primary sm:text-3xl">
                  {r.code}
                </span>
                <span className="rounded-full bg-seaglass-soft px-3 py-1 font-mono text-[11px] text-steel">
                  {r.tag}
                </span>
              </div>
              <h3 className="mt-4 text-lg font-semibold">{r.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{r.text}</p>
              <ul className="mt-6 grid gap-2 border-t pt-5 text-sm">
                {r.tasks.map((t) => (
                  <li key={t} className="flex items-start gap-2">
                    <ClipboardCheck className="mt-0.5 size-4 shrink-0 text-teal" aria-hidden />
                    {t}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          Potrzebujesz innych formularzy SPR-PF?{" "}
          <a href="#kontakt" className="font-medium text-teal underline-offset-4 hover:underline">
            Zapytaj o pełny zakres
          </a>
          .
        </p>
      </div>
    </section>
  );
}

const PROCEDURES = [
  { icon: FolderSearch, title: "Przeglądy polityk i procedur", text: "Okresowe przeglądy dokumentów ICT i przygotowanie aktualizacji." },
  { icon: Layers, title: "Aktualizacja rejestrów", text: "Inwentaryzacje aktywów, dostawców i umów zgodnie z Twoimi procedurami." },
  { icon: ShieldCheck, title: "Dokumentowanie incydentów", text: "Ewidencja i klasyfikacja zdarzeń ICT według przyjętych zasad." },
  { icon: CalendarClock, title: "Harmonogramy i testy", text: "Pilnowanie terminów cyklicznych zadań i dokumentacji testów." },
  { icon: Gauge, title: "Zestawienia dla zarządu", text: "Czytelne podsumowania stanu zgodności i mierników." },
  { icon: FileCheck2, title: "Dowody na audyt i kontrolę", text: "Uporządkowana dokumentacja wykonanych czynności." },
];

export function Procedures() {
  return (
    <section className="relative overflow-hidden bg-ink-gradient text-ink-foreground">
      <div className="pointer-events-none absolute inset-0 bg-sheet-grid" aria-hidden />
      <div className="relative mx-auto max-w-6xl px-5 py-20 lg:py-28">
        <div className="max-w-2xl">
          <p className="eyebrow text-seaglass">Więcej niż raporty</p>
          <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">
            Czynności wynikające z Twoich polityk i procedur
          </h2>
          <p className="mt-4 text-ink-muted">
            Realizujemy cykliczne zadania zapisane w Twojej dokumentacji DORA — w Twoim rytmie i
            według Twoich zasad. Przykładowy zakres:
          </p>
        </div>
        <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-ink-border bg-ink-border sm:grid-cols-2 lg:grid-cols-3">
          {PROCEDURES.map(({ icon: Icon, title, text }) => (
            <div key={title} className="bg-ink p-6 sm:p-7">
              <Icon className="size-6 text-seaglass" aria-hidden />
              <h3 className="mt-4 text-base font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const STEPS = [
  { icon: MessagesSquare, title: "Bezpłatna konsultacja", text: "Poznajemy Twoją instytucję, obowiązki sprawozdawcze i obecny sposób pracy." },
  { icon: ListChecks, title: "Zakres i harmonogram", text: "Ustalamy listę raportów, czynności, źródła danych i terminy." },
  { icon: FileSpreadsheet, title: "Przygotowanie i walidacja", text: "Zbieramy dane, uzupełniamy formularze i sprawdzamy je przed wysyłką." },
  { icon: UserRoundCog, title: "Zatwierdzenie i utrzymanie", text: "Przekazujesz gotowe pliki, a my pilnujemy kolejnych okresów." },
];

export function Process() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-20 lg:py-28">
      <div className="max-w-2xl">
        <p className="eyebrow text-teal">Jak to działa</p>
        <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">Cztery kroki do spokojnej sprawozdawczości</h2>
      </div>
      <ol className="mt-12 grid gap-8 md:grid-cols-4">
        {STEPS.map(({ icon: Icon, title, text }, i) => (
          <li key={title} className="relative">
            <div className="flex items-center gap-3">
              <span className="flex size-11 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Icon className="size-5" aria-hidden />
              </span>
              <span className="font-mono text-xs text-muted-foreground">0{i + 1}</span>
            </div>
            <h3 className="mt-5 text-base font-semibold">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

const AUDIENCE = [
  { icon: Landmark, label: "Banki i banki spółdzielcze" },
  { icon: Gauge, label: "Firmy inwestycyjne i domy maklerskie" },
  { icon: Building2, label: "TFI i zarządzający funduszami" },
  { icon: ShieldCheck, label: "Zakłady ubezpieczeń i pośrednicy" },
  { icon: Layers, label: "Instytucje płatnicze i pieniądza elektronicznego" },
  { icon: Users, label: "Inne podmioty finansowe objęte DORA" },
];

export function Audience() {
  return (
    <section className="border-y bg-secondary/60">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-20 lg:grid-cols-[1fr_1.4fr] lg:items-center lg:py-24">
        <div>
          <p className="eyebrow text-teal">Dla kogo</p>
          <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">
            Dla podmiotów finansowych nadzorowanych przez KNF
          </h2>
          <p className="mt-4 text-muted-foreground">
            Szczególnie tam, gdzie zespół compliance lub IT jest mały, a obowiązki DORA spadają na
            kilka osób.
          </p>
        </div>
        <ul className="grid gap-3 sm:grid-cols-2">
          {AUDIENCE.map(({ icon: Icon, label }) => (
            <li key={label} className="flex items-center gap-3 rounded-xl border bg-card px-4 py-4 shadow-soft">
              <Icon className="size-5 shrink-0 text-teal" aria-hidden />
              <span className="text-sm font-medium">{label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

const FAQ = [
  {
    q: "Czym jest DORA as a Service?",
    a: "To stała obsługa obowiązków wynikających z rozporządzenia DORA przez zewnętrzny zespół: przygotowanie sprawozdań do KNF oraz realizacja cyklicznych czynności zapisanych w Twoich politykach i procedurach. Nie musisz zatrudniać i szkolić dodatkowej osoby.",
  },
  {
    q: "Jakie raporty obejmuje usługa?",
    a: "Najczęściej SPR-PF-18 (pełny rejestr informacji), SPR-PF-26 i SPR-PF-27 (mierniki ryzyka) oraz SPR-PF-01 (regulacje wewnętrzne i ramy zarządzania ryzykiem ICT). Zakres dopasowujemy do Twojej instytucji — zapytaj o inne formularze.",
  },
  {
    q: "Kto przekazuje sprawozdanie do KNF?",
    a: "Ustalamy to indywidualnie. Przygotowujemy kompletne i sprawdzone pliki, a ich przekazanie odbywa się zgodnie z zasadami i uprawnieniami obowiązującymi w Twojej instytucji.",
  },
  {
    q: "Czy usługa to tylko raportowanie?",
    a: "Nie. Realizujemy też czynności wynikające z Twoich polityk i procedur, np. przeglądy dokumentów, aktualizacje rejestrów, dokumentowanie zdarzeń czy przygotowanie zestawień dla zarządu.",
  },
  {
    q: "Jak wygląda wycena?",
    a: "Zależy od liczby raportów i zakresu czynności. Po krótkiej, bezpłatnej rozmowie przygotowujemy ofertę dopasowaną do Twoich potrzeb.",
  },
];

export function Faq() {
  return (
    <section className="mx-auto max-w-3xl px-5 py-20 lg:py-28">
      <p className="eyebrow text-center text-teal">Najczęstsze pytania</p>
      <h2 className="mt-3 text-center text-3xl font-semibold sm:text-4xl">Masz pytania?</h2>
      <Accordion type="single" collapsible className="mt-10">
        {FAQ.map((f, i) => (
          <AccordionItem key={f.q} value={`q${i}`}>
            <AccordionTrigger className="py-5 text-base font-semibold hover:no-underline">
              {f.q}
            </AccordionTrigger>
            <AccordionContent className="text-base leading-relaxed text-muted-foreground">
              {f.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}

export function Footer() {
  const details = [SITE.companyName, SITE.companyAddress, SITE.email, SITE.phone].filter(Boolean);
  return (
    <footer className="bg-ink text-ink-muted">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-10 text-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Logo inverted />
          {details.length > 0 && <p>{details.join(" · ")}</p>}
        </div>
        <div className="flex gap-6">
          <Link to="/polityka-prywatnosci" className="hover:text-ink-foreground">
            Polityka prywatności
          </Link>
          <span>© {new Date().getFullYear()}</span>
        </div>
      </div>
    </footer>
  );
}
