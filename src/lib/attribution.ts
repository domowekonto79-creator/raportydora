// Remembers where the visitor came from (ad campaign parameters) for the visit,
// so each enquiry shows which ad brought it.
const KEY = "dora_attribution";
const PARAMS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "gclid"] as const;

export type Attribution = Partial<Record<(typeof PARAMS)[number] | "landing_path", string>>;

export function captureAttribution() {
  if (typeof window === "undefined") return;
  try {
    const search = new URLSearchParams(window.location.search);
    const found: Attribution = {};
    for (const p of PARAMS) {
      const v = search.get(p);
      if (v) found[p] = v.slice(0, p === "gclid" ? 300 : 200);
    }
    const existing = window.sessionStorage.getItem(KEY);
    if (Object.keys(found).length > 0 || !existing) {
      found.landing_path = window.location.pathname.slice(0, 500);
      window.sessionStorage.setItem(KEY, JSON.stringify(found));
    }
  } catch {
    // storage unavailable — ignore
  }
}

export function readAttribution(): Attribution {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.sessionStorage.getItem(KEY) ?? "{}") as Attribution;
  } catch {
    return {};
  }
}
