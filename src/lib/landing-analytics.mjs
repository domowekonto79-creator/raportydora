// Transport is supplied by the browser adapter. This module never reads form fields.
export function createAnalytics(env) {
  const measurementId = "G-LGMQ448HRY";
  const services = {
    "dora.secureside.pl": "dora_reporting",
    "pelnomocnik.secureside.pl": "iso_representative",
  };
  const service = services[env.hostname];
  const production = Boolean(service) && env.enabled !== false;
  const context = {
    landing_service: service || "local_preview",
    landing_variant: "approved_live_v1",
  };
  let consent = false,
    advertising = false,
    started = false,
    adsStarted = false,
    initialized = false;
  const acceptedSubmissions = new Set();
  const denied = {
    analytics_storage: "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  };
  function safeUrl(raw, campaign = false) {
    try {
      const source = new URL(raw),
        clean = new URL(source.origin + "/");
      // These landings have one public route. Do not copy arbitrary paths or fragments.
      if (campaign) {
        const allowed = {
          utm_source: ["google"],
          utm_medium: ["cpc"],
          utm_campaign: ["dora_sprawozdawczosc", "pelnomocnik_iso27001"],
          utm_content: ["tekst_1", "tekst_2", "landing_v1"],
        };
        for (const [key, values] of Object.entries(allowed))
          if (values.includes(source.searchParams.get(key)))
            clean.searchParams.set(key, source.searchParams.get(key));
        if (advertising)
          for (const key of ["gclid", "wbraid", "gbraid"]) {
            const value = source.searchParams.get(key);
            if (value && /^[A-Za-z0-9_.-]{1,300}$/.test(value)) clean.searchParams.set(key, value);
          }
      }
      return clean.href;
    } catch {
      return "";
    }
  }
  function sendEvent(name, params = {}) {
    if (!production || !consent) return;
    env.send("event", name, {
      ...context,
      ...params,
      page_location: safeUrl(env.href, true),
      page_referrer: safeUrl(env.referrer),
    });
  }
  function applyConsents() {
    if (!production) return;
    if (!initialized && !consent && !advertising) return;
    if (!initialized) {
      initialized = true;
      env.send("consent", "default", denied);
      env.send("js", new Date());
    }
    env.send("consent", "update", {
      ...denied,
      analytics_storage: consent ? "granted" : "denied",
      ad_storage: advertising ? "granted" : "denied",
      ad_user_data: advertising ? "granted" : "denied",
    });
    if (advertising && !adsStarted) {
      adsStarted = true;
      env.send("config", "AW-18576386485", {
        send_page_view: false,
        cookie_domain: "secureside.pl",
        cookie_expires: 180 * 86400,
        allow_google_signals: false,
        allow_ad_personalization_signals: false,
        page_location: safeUrl(env.href, true),
        page_referrer: safeUrl(env.referrer),
      });
      env.load("AW-18576386485");
    }
    if (!consent || started) return;
    started = true;
    env.send("config", measurementId, {
      send_page_view: false,
      cookie_domain: "secureside.pl",
      cookie_expires: 180 * 86400,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
      page_location: safeUrl(env.href, true),
      page_referrer: safeUrl(env.referrer),
    });
    sendEvent("page_view");
    env.load(measurementId);
  }
  return {
    mode: production ? "production" : "preview",
    setConsent(allowed) {
      consent = allowed === true;
      applyConsents();
    },
    setConsents(choices) {
      consent = choices.statistics === true;
      advertising = choices.advertising === true;
      applyConsents();
    },
    track(name, params = {}) {
      if (!["cta_click", "contact_click", "form_start"].includes(name)) return;
      const filtered = {};
      if (
        ["header", "hero", "scope", "process", "contact", "footer", "sticky", "related"].includes(
          params.section,
        )
      )
        filtered.section = params.section;
      if (["phone", "email", "external_form", "onsite_form"].includes(params.method))
        filtered.method = params.method;
      sendEvent(name, filtered);
    },
    // Call only from a successful server response, never from click/submit handlers alone.
    recordLeadAcknowledged({ accepted = false, demo = false, submissionId } = {}) {
      if (
        !accepted ||
        demo ||
        !submissionId ||
        !production ||
        !consent ||
        acceptedSubmissions.has(submissionId)
      )
        return;
      acceptedSubmissions.add(submissionId);
      sendEvent("generate_lead", { method: "onsite_form" });
    },
  };
}

export function readConsentCookie(cookieHeader) {
  const values = String(cookieHeader)
    .split(";")
    .map((x) => x.trim())
    .filter((x) => x.startsWith("ss_privacy_v2="));
  const match = values.length === 1 ? /^ss_privacy_v2=s([01])a([01])$/.exec(values[0]) : null;
  return match ? { statistics: match[1] === "1", advertising: match[2] === "1" } : null;
}

export function contactUrlWithAttribution(contactUrl, sourceHref, choices) {
  if (contactUrl !== "https://secureside.pl/kontakt/#wpcf7-f69-p214-o1") return contactUrl;
  if (!choices.statistics && !choices.advertising) return contactUrl;
  try {
    const source = new URL(sourceHref),
      destination = new URL(contactUrl);
    if (!["dora.secureside.pl", "pelnomocnik.secureside.pl"].includes(source.hostname))
      return contactUrl;
    const allowed = {
      utm_source: ["google"],
      utm_medium: ["cpc"],
      utm_campaign: ["dora_sprawozdawczosc", "pelnomocnik_iso27001"],
      utm_content: ["tekst_1", "tekst_2", "landing_v1"],
    };
    for (const [key, values] of Object.entries(allowed))
      if (values.includes(source.searchParams.get(key)))
        destination.searchParams.set(key, source.searchParams.get(key));
    if (choices.advertising)
      for (const key of ["gclid", "wbraid", "gbraid"]) {
        const value = source.searchParams.get(key);
        if (value && /^[A-Za-z0-9_.-]{1,300}$/.test(value))
          destination.searchParams.set(key, value);
      }
    return destination.href;
  } catch {
    return contactUrl;
  }
}
