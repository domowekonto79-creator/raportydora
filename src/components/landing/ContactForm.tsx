import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ArrowRight, Loader2, Lock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { readAttribution } from "@/lib/attribution";
import { ENTITY_TYPES, REPORT_OPTIONS, contactSchema, type ContactInput } from "@/lib/contact-schema";
import { submitContact } from "@/lib/contact.functions";

type Errors = Partial<Record<keyof ContactInput, string>>;

const EMPTY: ContactInput = {
  fullName: "",
  company: "",
  email: "",
  phone: "",
  entityType: "",
  reports: [],
  message: "",
  consent: false,
  website: "",
};

export function ContactForm() {
  const [values, setValues] = useState<ContactInput>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const send = useServerFn(submitContact);
  const navigate = useNavigate();

  const set = <K extends keyof ContactInput>(key: K, value: ContactInput[K]) =>
    setValues((v) => ({ ...v, [key]: value }));

  const toggleReport = (id: (typeof REPORT_OPTIONS)[number]["id"]) =>
    setValues((v) => {
      const list = v.reports ?? [];
      return { ...v, reports: list.includes(id) ? list.filter((r) => r !== id) : [...list, id] };
    });

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setServerError(null);
    const payload = { ...values, attribution: readAttribution() };
    const parsed = contactSchema.safeParse(payload);
    if (!parsed.success) {
      const next: Errors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof ContactInput;
        if (!next[key]) next[key] = issue.message;
      }
      setErrors(next);
      return;
    }
    setErrors({});
    setSending(true);
    try {
      const res = await send({ data: payload });
      if (res.ok) {
        navigate({ to: "/dziekujemy" });
      } else {
        setServerError(res.error);
      }
    } catch {
      setServerError("Nie udało się wysłać formularza. Spróbuj ponownie za chwilę.");
    } finally {
      setSending(false);
    }
  }

  return (
    <section id="kontakt" className="relative overflow-hidden bg-ink-gradient">
      <div className="pointer-events-none absolute inset-0 bg-sheet-grid" aria-hidden />
      <div className="relative mx-auto grid max-w-6xl gap-12 px-5 py-20 lg:grid-cols-[1fr_1.2fr] lg:py-28">
        <div className="text-ink-foreground">
          <p className="eyebrow text-seaglass">Bezpłatna konsultacja</p>
          <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">
            Porozmawiajmy o Twoich obowiązkach DORA
          </h2>
          <p className="mt-4 text-ink-muted">
            Zostaw kontakt i zaznacz, które raporty Cię dotyczą. Odezwiemy się, żeby ustalić termin
            krótkiej rozmowy i przygotować ofertę.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-ink-muted">
            {["Bez zobowiązań", "Wycena dopasowana do zakresu", "Raporty i czynności w jednym miejscu"].map(
              (t) => (
                <li key={t} className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-seaglass" /> {t}
                </li>
              ),
            )}
          </ul>
        </div>

        <form
          onSubmit={onSubmit}
          noValidate
          className="rounded-2xl bg-card p-6 text-card-foreground shadow-float sm:p-8"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Imię i nazwisko" error={errors.fullName} htmlFor="fullName">
              <input
                id="fullName"
                className="field"
                autoComplete="name"
                value={values.fullName}
                onChange={(e) => set("fullName", e.target.value)}
                maxLength={120}
              />
            </Field>
            <Field label="Instytucja" error={errors.company} htmlFor="company">
              <input
                id="company"
                className="field"
                autoComplete="organization"
                value={values.company}
                onChange={(e) => set("company", e.target.value)}
                maxLength={160}
              />
            </Field>
            <Field label="E-mail służbowy" error={errors.email} htmlFor="email">
              <input
                id="email"
                type="email"
                className="field"
                autoComplete="email"
                value={values.email}
                onChange={(e) => set("email", e.target.value)}
                maxLength={255}
              />
            </Field>
            <Field label="Telefon (opcjonalnie)" error={errors.phone} htmlFor="phone">
              <input
                id="phone"
                type="tel"
                className="field"
                autoComplete="tel"
                value={values.phone}
                onChange={(e) => set("phone", e.target.value)}
                maxLength={40}
              />
            </Field>
            <Field label="Rodzaj podmiotu" htmlFor="entityType" className="sm:col-span-2">
              <select
                id="entityType"
                className="field"
                value={values.entityType}
                onChange={(e) => set("entityType", e.target.value)}
              >
                <option value="">Wybierz…</option>
                {ENTITY_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <fieldset className="mt-6">
            <legend className="text-sm font-medium">Co Cię interesuje?</legend>
            <div className="mt-3 flex flex-wrap gap-2">
              {REPORT_OPTIONS.map((r) => {
                const active = values.reports?.includes(r.id);
                return (
                  <button
                    key={r.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => toggleReport(r.id)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors sm:text-sm ${
                      active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-input bg-card text-foreground hover:border-teal"
                    }`}
                  >
                    {r.label}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <Field label="Wiadomość (opcjonalnie)" htmlFor="message" className="mt-6" error={errors.message}>
            <textarea
              id="message"
              rows={4}
              className="field resize-y"
              placeholder="Np. terminy, obecny sposób raportowania, liczba dostawców ICT…"
              value={values.message}
              onChange={(e) => set("message", e.target.value)}
              maxLength={2000}
            />
          </Field>

          {/* Honeypot */}
          <div className="hidden" aria-hidden>
            <label>
              Strona www
              <input
                tabIndex={-1}
                autoComplete="off"
                value={values.website}
                onChange={(e) => set("website", e.target.value)}
              />
            </label>
          </div>

          <label className="mt-6 flex items-start gap-3 text-sm text-muted-foreground">
            <input
              type="checkbox"
              className="mt-1 size-4 shrink-0 accent-primary"
              checked={values.consent}
              onChange={(e) => set("consent", e.target.checked)}
            />
            <span>
              Wyrażam zgodę na przetwarzanie moich danych w celu odpowiedzi na zapytanie. Szczegóły w{" "}
              <Link to="/polityka-prywatnosci" className="text-teal underline underline-offset-2">
                polityce prywatności
              </Link>
              .
            </span>
          </label>
          {errors.consent && <p className="mt-2 text-sm text-destructive">{errors.consent}</p>}

          {serverError && (
            <p role="alert" className="mt-4 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {serverError}
            </p>
          )}

          <Button type="submit" variant="brand" size="xl" className="mt-6 w-full" disabled={sending}>
            {sending ? (
              <>
                <Loader2 className="animate-spin" /> Wysyłanie…
              </>
            ) : (
              <>
                Wyślij zapytanie <ArrowRight />
              </>
            )}
          </Button>
          <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <Lock className="size-3" aria-hidden /> Twoje dane służą wyłącznie do kontaktu w tej sprawie.
          </p>
        </form>
      </div>
    </section>
  );
}

function Field({
  label,
  htmlFor,
  error,
  className = "",
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium">
        {label}
      </label>
      {children}
      {error && <p className="mt-1.5 text-sm text-destructive">{error}</p>}
    </div>
  );
}
