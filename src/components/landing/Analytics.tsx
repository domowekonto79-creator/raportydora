import { useEffect, useRef, useState } from "react";
import { createAnalytics, type ContactSection } from "@/lib/landing-analytics.mjs";
import { SITE } from "@/lib/site";

const KEY = "ss_lp_statistics_v1";
const OPEN_SETTINGS = "secureside:statistics-settings";
type Choice = "yes" | "no";
type AnalyticsWindow = Window & {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
  "ga-disable-G-LGMQ448HRY"?: boolean;
};

function readChoice(): Choice | null {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(KEY) ?? "null");
    if (!value || typeof value !== "object") return null;
    const saved = value as { choice?: unknown; expires?: unknown };
    if (
      (saved.choice === "yes" || saved.choice === "no") &&
      typeof saved.expires === "number" &&
      saved.expires > Date.now()
    )
      return saved.choice;
  } catch {
    /* Storage can be blocked; keep statistics disabled. */
  }
  return null;
}

function browserClient() {
  const analyticsWindow = window as AnalyticsWindow;
  const layer = analyticsWindow.dataLayer ?? [];
  analyticsWindow.dataLayer = layer;
  analyticsWindow.gtag ??= function (..._args: unknown[]) {
    // Google's tag queue uses an Arguments object for each command.
    // eslint-disable-next-line prefer-rest-params
    layer.push(arguments);
  };
  let loaded = false;
  const tracker = createAnalytics({
    enabled: import.meta.env.PROD,
    hostname: window.location.hostname,
    href: window.location.href,
    referrer: document.referrer,
    send(...args) {
      analyticsWindow.gtag?.(...args);
    },
    load(id) {
      if (document.getElementById("secureside-ga4")) return;
      loaded = true;
      const script = document.createElement("script");
      script.id = "secureside-ga4";
      script.async = true;
      script.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(id);
      document.head.appendChild(script);
    },
  });
  const saved = readChoice();
  if (saved) tracker.setConsent(saved === "yes");
  return {
    tracker,
    saved,
    choose(choice: Choice) {
      try {
        localStorage.setItem(KEY, JSON.stringify({ choice, expires: Date.now() + 180 * 86400000 }));
      } catch {
        /* Apply the choice for this page even without storage. */
      }
      tracker.setConsent(choice === "yes");
      if (choice === "no" && loaded) {
        analyticsWindow["ga-disable-G-LGMQ448HRY"] = true;
        for (const name of ["_ga", "_ga_LGMQ448HRY"]) {
          for (const domain of ["", window.location.hostname, ".secureside.pl"]) {
            document.cookie =
              name +
              "=; Max-Age=0; Path=/" +
              (domain ? "; Domain=" + domain : "") +
              "; SameSite=Lax; Secure";
          }
        }
        // Remove the loaded tag and its automatic measurements by reopening without it.
        window.location.reload();
      }
    },
  };
}

function sectionFor(link: Element): ContactSection {
  if (link.closest("header")) return "header";
  if (link.closest("footer")) return "footer";
  const section = link.closest("section");
  if (section?.id === "kontakt") return "contact";
  if (section?.id === "raporty") return "scope";
  return "hero";
}

export function LandingAnalytics() {
  const client = useRef<ReturnType<typeof browserClient> | null>(null);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    client.current ??= browserClient();
    setOpen(!client.current.saved);
    const reopen = () => setOpen(true);
    const click = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return;
      const link = event.target.closest("a");
      if (!link) return;
      const href = link.getAttribute("href") ?? "";
      if (href === SITE.contactUrl)
        client.current?.tracker.track("contact_click", {
          section: sectionFor(link),
          method: "external_form",
        });
      else if (href.startsWith("tel:"))
        client.current?.tracker.track("contact_click", {
          section: sectionFor(link),
          method: "phone",
        });
      else if (href.startsWith("mailto:"))
        client.current?.tracker.track("contact_click", {
          section: sectionFor(link),
          method: "email",
        });
    };
    window.addEventListener(OPEN_SETTINGS, reopen);
    document.addEventListener("click", click);
    return () => {
      window.removeEventListener(OPEN_SETTINGS, reopen);
      document.removeEventListener("click", click);
    };
  }, []);
  const choose = (value: Choice) => {
    client.current?.choose(value);
    setOpen(false);
  };
  if (!open) return null;
  return (
    <section
      role="dialog"
      aria-modal="false"
      aria-labelledby="statistics-title"
      className="fixed inset-x-4 bottom-4 z-50 rounded-xl border bg-card p-4 text-card-foreground shadow-float sm:left-auto sm:right-5 sm:w-80"
    >
      <h2 id="statistics-title" className="text-sm font-semibold">
        Statystyki
      </h2>
      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
        Czy możemy mierzyć odwiedziny, aby ulepszać stronę? Wybór możesz zmienić w stopce.
      </p>
      <a
        href={SITE.statisticsUrl}
        className="mt-2 inline-block text-xs text-teal underline underline-offset-2"
      >
        Informacje o prywatności
      </a>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => choose("yes")}
          className="rounded-md border border-input px-3 py-2 text-xs font-medium hover:bg-secondary"
        >
          Zezwól
        </button>
        <button
          type="button"
          onClick={() => choose("no")}
          className="rounded-md border border-input px-3 py-2 text-xs font-medium hover:bg-secondary"
        >
          Odrzuć
        </button>
      </div>
    </section>
  );
}

export function PrivacySettingsButton() {
  return (
    <button
      type="button"
      className="text-left hover:text-ink-foreground"
      onClick={() => window.dispatchEvent(new Event(OPEN_SETTINGS))}
    >
      Ustawienia statystyk
    </button>
  );
}
