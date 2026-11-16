import test from "node:test";
import assert from "node:assert/strict";
import { createAnalytics } from "../src/lib/landing-analytics.mjs";
import * as consentHelpers from "../src/lib/landing-analytics.mjs";

function setup(host = "dora.secureside.pl", href = `https://${host}/`) {
  const calls = [],
    loads = [];
  const analytics = createAnalytics({
    hostname: host,
    href,
    referrer: "https://secureside.pl/?email=private@example.com",
    send: (...args) => calls.push(args),
    load: (id) => loads.push(id),
  });
  return { analytics, calls, loads };
}

test("blocks tags and events before consent and after essential-only choice", () => {
  const { analytics: a, calls, loads } = setup();
  a.track("cta_click", { section: "hero" });
  a.setConsent(false);
  a.track("contact_click", { method: "phone" });
  assert.equal(calls.length, 0);
  assert.equal(loads.length, 0);
});
test("production consent loads the existing GA4 once and sends one page view", () => {
  const { analytics: a, calls, loads } = setup();
  a.setConsent(true);
  a.setConsent(true);
  assert.deepEqual(loads, ["G-LGMQ448HRY"]);
  assert.equal(calls.filter((x) => x[0] === "event" && x[1] === "page_view").length, 1);
  assert.equal(calls.find((x) => x[0] === "config")[2].send_page_view, false);
  assert.equal(calls.find((x) => x[0] === "config")[2].cookie_expires, 180 * 86400);
  assert.equal(calls.find((x) => x[1] === "page_view")[2].landing_service, "dora_reporting");
});
test("localhost, previews, main site and lookalike hosts never load Google", () => {
  for (const host of [
    "localhost",
    "127.0.0.1",
    "preview.vercel.app",
    "secureside.pl",
    "dora.secureside.pl.evil.test",
  ]) {
    const { analytics: a, calls, loads } = setup(host);
    a.setConsent(true);
    a.track("cta_click", { section: "hero" });
    a.recordLeadAcknowledged({ accepted: true });
    assert.equal(loads.length, 0, host);
    assert.equal(calls.length, 0, host);
  }
});
test("URLs retain only approved campaign values and never arbitrary form data", () => {
  const { analytics: a, calls } = setup(
    "dora.secureside.pl",
    "https://dora.secureside.pl/?utm_source=google&utm_medium=cpc&utm_campaign=dora_sprawozdawczosc&email=private@example.com&utm_term=private@example.com#kontakt",
  );
  a.setConsent(true);
  a.track("cta_click", {
    section: "hero",
    email: "private@example.com",
    message: "private text",
    utm_campaign: "untrusted",
  });
  const serialized = JSON.stringify(calls);
  assert.ok(!serialized.includes("private"));
  assert.ok(!serialized.includes("untrusted"));
  assert.match(serialized, /utm_campaign=dora_sprawozdawczosc/);
  assert.equal(calls.find((x) => x[1] === "page_view")[2].page_referrer, "https://secureside.pl/");
});
test("CTA clicks and demo forms cannot masquerade as successful leads", () => {
  const { analytics: a, calls } = setup();
  a.setConsent(true);
  a.track("generate_lead", {});
  a.track("cta_click", { section: "hero" });
  a.recordLeadAcknowledged({ accepted: false });
  a.recordLeadAcknowledged({ accepted: true, demo: true });
  assert.equal(calls.filter((x) => x[1] === "generate_lead").length, 0);
  a.recordLeadAcknowledged({ accepted: true, submissionId: "test-1" });
  a.recordLeadAcknowledged({ accepted: true, submissionId: "test-1" });
  assert.equal(calls.filter((x) => x[1] === "generate_lead").length, 1);
  assert.ok(!JSON.stringify(calls).includes("test-1"));
});
test("consent withdrawal blocks subsequent tracking", () => {
  const { analytics: a, calls } = setup();
  a.setConsent(true);
  a.setConsent(false);
  const before = calls.length;
  a.track("cta_click", { section: "hero" });
  a.recordLeadAcknowledged({ accepted: true });
  assert.equal(calls.length, before);
  assert.equal(calls.at(-1)[2].analytics_storage, "denied");
});
test("ISO landing gets a separate service parameter with the same measurement ID", () => {
  const { analytics: a, calls, loads } = setup("pelnomocnik.secureside.pl");
  a.setConsent(true);
  assert.deepEqual(loads, ["G-LGMQ448HRY"]);
  assert.equal(calls.find((x) => x[1] === "page_view")[2].landing_service, "iso_representative");
});
test("visual proposal remains disabled even on a production hostname", () => {
  const calls = [];
  const a = createAnalytics({
    hostname: "dora.secureside.pl",
    enabled: false,
    send: (...args) => calls.push(args),
    load: () => calls.push("load"),
  });
  a.setConsent(true);
  a.track("cta_click", { section: "hero" });
  assert.equal(a.mode, "preview");
  assert.deepEqual(calls, []);
});
test("unapproved campaign labels and query values are removed; Ads click ID is retained", () => {
  const { analytics: a, calls } = setup(
    "dora.secureside.pl",
    "https://dora.secureside.pl/private/name?utm_campaign=private_name&utm_source=private_email&utm_content=private_company&gclid=google_click-id.123",
  );
  a.setConsents({ statistics: true, advertising: true });
  const location = calls.find((x) => x[1] === "page_view")[2].page_location;
  assert.equal(location, "https://dora.secureside.pl/?gclid=google_click-id.123");
  assert.ok(!JSON.stringify(calls).includes("private"));
});

test("advertising and statistics consent remain independent, including withdrawal", () => {
  const { analytics: a, calls, loads } = setup();
  assert.equal(typeof a.setConsents, "function");
  a.setConsents({ statistics: false, advertising: true });
  assert.deepEqual(loads, ["AW-18576386485"]);
  assert.equal(calls.filter((x) => x[1] === "page_view").length, 0);
  assert.equal(
    calls.find((x) => x[0] === "consent" && x[1] === "update")[2].ad_personalization,
    "denied",
  );
  a.setConsent(true);
  assert.equal(calls.filter((x) => x[1] === "page_view").length, 1);
  assert.equal(calls.filter((x) => x[0] === "consent").at(-1)[2].ad_storage, "granted");
  a.setConsents({ statistics: true, advertising: false });
  assert.equal(calls.filter((x) => x[0] === "consent").at(-1)[2].ad_storage, "denied");
  assert.equal(calls.filter((x) => x[0] === "consent").at(-1)[2].analytics_storage, "granted");
});

test("statistics-only telemetry does not contain advertising click identifiers", () => {
  const { analytics: a, calls } = setup(
    "dora.secureside.pl",
    "https://dora.secureside.pl/?gclid=ADCLICK&wbraid=BRAID&gbraid=GBRAID&utm_source=google",
  );
  a.setConsents({ statistics: true, advertising: false });
  a.track("contact_click", { method: "external_form" });
  assert.ok(!JSON.stringify(calls).includes("ADCLICK"));
  assert.ok(!JSON.stringify(calls).includes("BRAID"));
});

test("shared consent cookie accepts only explicit versioned choices", () => {
  assert.equal(typeof consentHelpers.readConsentCookie, "function");
  assert.deepEqual(consentHelpers.readConsentCookie("other=value; ss_privacy_v2=s1a0"), {
    statistics: true,
    advertising: false,
  });
  assert.deepEqual(consentHelpers.readConsentCookie("ss_privacy_v2=s0a1"), {
    statistics: false,
    advertising: true,
  });
  for (const value of [
    "",
    "ss_privacy_v2=yes",
    "ss_privacy_v2=s1a1junk",
    "other_ss_privacy_v2=s1a1",
    "ss_privacy_v2=s1a1; ss_privacy_v2=s0a0",
  ])
    assert.equal(consentHelpers.readConsentCookie(value), null);
});

test("only approved attribution parameters reach the fixed contact page after consent", () => {
  assert.equal(typeof consentHelpers.contactUrlWithAttribution, "function");
  const base = "https://secureside.pl/kontakt/#wpcf7-f69-p214-o1";
  const source =
    "https://dora.secureside.pl/?utm_source=google&utm_medium=cpc&utm_campaign=dora_sprawozdawczosc&utm_content=tekst_1&gclid=sample_123&email=PRIVATE&utm_term=PRIVATE";
  assert.equal(
    consentHelpers.contactUrlWithAttribution(base, source, {
      statistics: false,
      advertising: false,
    }),
    base,
  );
  const url = new URL(
    consentHelpers.contactUrlWithAttribution(base, source, {
      statistics: false,
      advertising: true,
    }),
  );
  assert.equal(url.origin + url.pathname + url.hash, base);
  assert.equal(url.searchParams.get("gclid"), "sample_123");
  assert.equal(url.searchParams.get("utm_campaign"), "dora_sprawozdawczosc");
  assert.ok(!url.href.includes("PRIVATE"));
  const statsOnly = new URL(
    consentHelpers.contactUrlWithAttribution(base, source, {
      statistics: true,
      advertising: false,
    }),
  );
  assert.equal(statsOnly.searchParams.has("gclid"), false);
  assert.equal(
    consentHelpers.contactUrlWithAttribution("https://elsewhere.example/contact", source, {
      statistics: true,
      advertising: true,
    }),
    "https://elsewhere.example/contact",
  );
});
