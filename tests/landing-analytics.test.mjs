import test from "node:test";
import assert from "node:assert/strict";
import { createAnalytics } from "../src/lib/landing-analytics.mjs";

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
  a.setConsent(true);
  const location = calls.find((x) => x[1] === "page_view")[2].page_location;
  assert.equal(location, "https://dora.secureside.pl/?gclid=google_click-id.123");
  assert.ok(!JSON.stringify(calls).includes("private"));
});
