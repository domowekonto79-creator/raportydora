import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import {
  createAnalytics,
  readConsentCookie,
  contactUrlWithAttribution,
  type ContactSection,
  type ConsentChoices,
} from "@/lib/landing-analytics.mjs";
import { SITE } from "@/lib/site";

const LEGACY_KEY = "ss_lp_statistics_v1";
const OPEN_SETTINGS = "secureside:statistics-settings";
type AnalyticsWindow = Window & { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void };

function legacyStatistics(): boolean | null {
  try {
    const value = JSON.parse(localStorage.getItem(LEGACY_KEY) ?? "null");
    if ((value?.choice === "yes" || value?.choice === "no") && value.expires > Date.now())
      return value.choice === "yes";
  } catch {
    /* Leave consent undecided if storage is unavailable. */
  }
  return null;
}

function browserClient() {
  const target = window as AnalyticsWindow;
  target.dataLayer ??= [];
  target.gtag ??= function (..._args: unknown[]) {
    // Google's command queue expects Arguments, not a plain array.
    // eslint-disable-next-line prefer-rest-params
    target.dataLayer!.push(arguments);
  };
  let loaded = false;
  const cookieHeader = document.cookie;
  const hasV2 = cookieHeader.split(";").some((value) => value.trim().startsWith("ss_privacy_v2="));
  const saved = readConsentCookie(cookieHeader);
  const previousStatistics = hasV2 ? null : legacyStatistics();
  if (hasV2)
    try {
      localStorage.removeItem(LEGACY_KEY);
    } catch {
      /* Storage can be unavailable. */
    }
  let choices: ConsentChoices = saved ?? {
    statistics: previousStatistics === true,
    advertising: false,
  };
  let cookieSignature = JSON.stringify(saved);
  const tracker = createAnalytics({
    enabled: import.meta.env.PROD,
    hostname: location.hostname,
    href: location.href,
    referrer: document.referrer,
    send: (...args) => target.gtag?.(...args),
    load(id) {
      loaded = true;
      if (
        document.getElementById("secureside-ga4") ||
        document.getElementById("secureside-google-tag")
      )
        return;
      const script = document.createElement("script");
      script.id = "secureside-google-tag";
      script.async = true;
      script.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(id);
      document.head.appendChild(script);
    },
  });
  const decorateLinks = () => {
    const destination = contactUrlWithAttribution(SITE.contactUrl, location.href, choices);
    for (const link of document.querySelectorAll<HTMLAnchorElement>("a[href]")) {
      const url = new URL(link.href, location.href);
      if (
        url.origin === "https://secureside.pl" &&
        url.pathname === "/kontakt/" &&
        url.hash === "#wpcf7-f69-p214-o1"
      )
        link.href = destination;
    }
  };
  tracker.setConsents(choices);
  decorateLinks();
  return {
    tracker,
    saved,
    initialStatistics: saved?.statistics ?? previousStatistics,
    decorateLinks,
    syncChoice() {
      const latest = readConsentCookie(document.cookie);
      const signature = JSON.stringify(latest);
      if (signature === cookieSignature) return false;
      cookieSignature = signature;
      choices = latest ?? { statistics: false, advertising: false };
      tracker.setConsents(choices);
      decorateLinks();
      try {
        localStorage.removeItem(LEGACY_KEY);
      } catch {
        /* Keep denial even without storage. */
      }
      location.reload();
      return true;
    },
    choose(next: ConsentChoices) {
      const withdrawal =
        (choices.statistics && !next.statistics) || (choices.advertising && !next.advertising);
      choices = next;
      const sharedDomain = ["dora.secureside.pl", "pelnomocnik.secureside.pl"].includes(
        location.hostname,
      );
      document.cookie =
        `ss_privacy_v2=s${Number(next.statistics)}a${Number(next.advertising)}; Max-Age=15552000; Path=/; SameSite=Lax` +
        (sharedDomain ? "; Secure; Domain=secureside.pl" : "");
      try {
        localStorage.removeItem(LEGACY_KEY);
      } catch {
        /* Apply for this page even without persistence. */
      }
      cookieSignature = JSON.stringify(readConsentCookie(document.cookie));
      tracker.setConsents(next);
      decorateLinks();
      if (withdrawal) {
        for (const pair of document.cookie.split(";")) {
          const name = pair.split("=")[0]?.trim() ?? "";
          if (
            (!next.statistics && (name === "_ga" || name.startsWith("_ga_"))) ||
            (!next.advertising && name.startsWith("_gcl_"))
          ) {
            for (const domain of ["", location.hostname, ".secureside.pl"])
              document.cookie =
                name +
                "=; Max-Age=0; Path=/; SameSite=Lax; Secure" +
                (domain ? "; Domain=" + domain : "");
          }
        }
        if (loaded) location.reload();
      }
    },
  };
}

function sectionFor(link: Element): ContactSection {
  if (link.closest("header")) return "header";
  if (link.closest("footer")) return "footer";
  const section = link.closest("section");
  if (section?.id === "kontakt") return "contact";
  if (["raporty", "zakres"].includes(section?.id ?? "")) return "scope";
  return "hero";
}

export function LandingAnalytics() {
  const client = useRef<ReturnType<typeof browserClient> | null>(null);
  const title = useRef<HTMLHeadingElement>(null);
  const opener = useRef<HTMLButtonElement | null>(null);
  const savedChoice = useRef<{ statistics: boolean | null; advertising: boolean | null }>({
    statistics: null,
    advertising: null,
  });
  const [showShortcut, setShowShortcut] = useState(false);
  const [open, setOpen] = useState(false);
  const [statistics, setStatistics] = useState<boolean | null>(null);
  const [advertising, setAdvertising] = useState<boolean | null>(null);
  useEffect(() => {
    client.current ??= browserClient();
    const current = client.current;
    savedChoice.current = {
      statistics: current.initialStatistics,
      advertising: current.saved?.advertising ?? null,
    };
    setShowShortcut(!current.saved);
    const reopen = (event: Event) => {
      opener.current = (event as CustomEvent<HTMLButtonElement>).detail;
      setStatistics(savedChoice.current.statistics);
      setAdvertising(savedChoice.current.advertising);
      setOpen(true);
    };
    const sync = () => {
      current.syncChoice();
    };
    const visible = () => {
      if (document.visibilityState === "visible") sync();
    };
    const cookieStore = (window as Window & { cookieStore?: EventTarget }).cookieStore;
    const click = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return;
      const link = event.target.closest("a");
      if (!link) return;
      const href = link.getAttribute("href") ?? "";
      const url = new URL(link.href, location.href);
      if (url.origin === "https://secureside.pl" && url.pathname === "/kontakt/") {
        if (current.syncChoice()) {
          event.preventDefault();
          return;
        }
        current.decorateLinks();
        current.tracker.track("contact_click", {
          section: sectionFor(link),
          method: "external_form",
        });
      } else if (href.startsWith("tel:"))
        current.tracker.track("contact_click", { section: sectionFor(link), method: "phone" });
      else if (href.startsWith("mailto:"))
        current.tracker.track("contact_click", { section: sectionFor(link), method: "email" });
    };
    window.addEventListener(OPEN_SETTINGS, reopen);
    window.addEventListener("focus", sync);
    document.addEventListener("visibilitychange", visible);
    cookieStore?.addEventListener("change", sync);
    const syncTimer = window.setInterval(sync, 1000);
    document.addEventListener("click", click);
    return () => {
      window.removeEventListener(OPEN_SETTINGS, reopen);
      window.removeEventListener("focus", sync);
      document.removeEventListener("visibilitychange", visible);
      cookieStore?.removeEventListener("change", sync);
      window.clearInterval(syncTimer);
      document.removeEventListener("click", click);
    };
  }, []);
  useEffect(() => {
    if (open) title.current?.focus({ preventScroll: true });
  }, [open]);

  function close() {
    setOpen(false);
    opener.current?.focus({ preventScroll: true });
  }

  const choiceClass =
    "rounded-md border border-input px-3 py-2 text-xs font-medium hover:bg-secondary aria-pressed:bg-secondary aria-pressed:ring-2 aria-pressed:ring-teal";
  return (
    <>
      {showShortcut && (
        <button
          type="button"
          aria-haspopup="dialog"
          aria-expanded={open}
          onClick={open ? close : openPrivacySettings}
          className="fixed bottom-3 left-3 z-50 rounded-lg border bg-card px-3 py-2 text-xs font-medium text-card-foreground shadow-float hover:bg-secondary"
        >
          Ustawienia prywatności
        </button>
      )}
      {open && (
        <section
          role="dialog"
          aria-modal="false"
          aria-labelledby="statistics-title"
          onKeyDown={(event) => {
            if (event.key === "Escape") close();
          }}
          className="fixed inset-x-3 bottom-14 z-50 max-h-[75dvh] overflow-y-auto rounded-xl border bg-card p-4 text-card-foreground shadow-float sm:left-3 sm:right-auto sm:w-96"
        >
          <div className="flex items-center justify-between gap-3">
            <h2 ref={title} id="statistics-title" tabIndex={-1} className="text-sm font-semibold">
              Ustawienia prywatności
            </h2>
            <button
              type="button"
              aria-label="Zamknij ustawienia prywatności"
              onClick={close}
              className="rounded-md p-2 hover:bg-secondary"
            >
              <X aria-hidden="true" className="size-4" />
            </button>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            Wybierz, na jakie pomiary się zgadzasz. Formularz działa także po odmowie. Wybór możesz
            zmienić w stopce.
          </p>
          <fieldset className="mt-4">
            <legend className="text-xs font-semibold">Statystyki odwiedzin</legend>
            <p className="mt-1 text-xs text-muted-foreground">
              Google Analytics pomaga nam ulepszać stronę.
            </p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <button
                type="button"
                aria-label="Zezwól na statystyki"
                aria-pressed={statistics === true}
                onClick={() => setStatistics(true)}
                className={choiceClass}
              >
                Zezwól
              </button>
              <button
                type="button"
                aria-label="Odrzuć statystyki"
                aria-pressed={statistics === false}
                onClick={() => setStatistics(false)}
                className={choiceClass}
              >
                Odrzuć
              </button>
            </div>
          </fieldset>
          <fieldset className="mt-4">
            <legend className="text-xs font-semibold">Pomiar skuteczności reklam Google Ads</legend>
            <p className="mt-1 text-xs text-muted-foreground">
              Pozwala przypisać zapytanie do reklamy. Bez personalizacji reklam i bez przesyłania
              treści formularza.
            </p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <button
                type="button"
                aria-label="Zezwól na pomiar reklam"
                aria-pressed={advertising === true}
                onClick={() => setAdvertising(true)}
                className={choiceClass}
              >
                Zezwól
              </button>
              <button
                type="button"
                aria-label="Odrzuć pomiar reklam"
                aria-pressed={advertising === false}
                onClick={() => setAdvertising(false)}
                className={choiceClass}
              >
                Odrzuć
              </button>
            </div>
          </fieldset>
          <a
            href={SITE.statisticsUrl}
            className="mt-3 inline-block text-xs text-teal underline underline-offset-2"
          >
            Informacje o prywatności
          </a>
          <p className="mt-2 text-xs text-muted-foreground">
            Wybór zapamiętujemy na 180 dni na secureside.pl i jej stronach usług.
          </p>
          <button
            type="button"
            disabled={statistics === null || advertising === null}
            onClick={() => {
              if (statistics === null || advertising === null) return;
              client.current?.choose({ statistics, advertising });
              savedChoice.current = { statistics, advertising };
              setShowShortcut(false);
              close();
            }}
            className="mt-3 w-full rounded-md border border-input px-3 py-2 text-xs font-medium hover:bg-secondary disabled:opacity-50"
          >
            Zapisz wybór
          </button>
        </section>
      )}
    </>
  );
}

function openPrivacySettings(event: React.MouseEvent<HTMLButtonElement>) {
  window.dispatchEvent(new CustomEvent(OPEN_SETTINGS, { detail: event.currentTarget }));
}

export function PrivacySettingsButton() {
  return (
    <button
      type="button"
      aria-haspopup="dialog"
      className="text-left hover:text-ink-foreground"
      onClick={openPrivacySettings}
    >
      Ustawienia prywatności
    </button>
  );
}
