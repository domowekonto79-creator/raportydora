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
    started = false;
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
  return {
    mode: production ? "production" : "preview",
    setConsent(allowed) {
      consent = allowed === true;
      if (!production) return;
      if (!consent) {
        if (started) env.send("consent", "update", denied);
        return;
      }
      if (started) {
        env.send("consent", "update", { ...denied, analytics_storage: "granted" });
        return;
      }
      started = true;
      env.send("consent", "default", denied);
      env.send("consent", "update", { ...denied, analytics_storage: "granted" });
      env.send("js", new Date());
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
