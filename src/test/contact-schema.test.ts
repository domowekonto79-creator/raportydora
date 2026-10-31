import { describe, expect, it } from "vitest";

import { contactSchema } from "@/lib/contact-schema";

const valid = {
  fullName: "Anna Kowalska",
  company: "Bank Spółdzielczy",
  email: "anna@bank.pl",
  consent: true,
};

describe("contact form rules", () => {
  it("accepts a complete enquiry with consent", () => {
    expect(contactSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects an enquiry without consent to process data", () => {
    expect(contactSchema.safeParse({ ...valid, consent: false }).success).toBe(false);
  });

  it("rejects an invalid e-mail address", () => {
    expect(contactSchema.safeParse({ ...valid, email: "anna@" }).success).toBe(false);
  });

  it("rejects an unknown report choice", () => {
    expect(contactSchema.safeParse({ ...valid, reports: ["spr-pf-99"] }).success).toBe(false);
  });

  it("accepts SPR-PF-30 (KRI for simplified ICT framework) as a report choice", () => {
    expect(contactSchema.safeParse({ ...valid, reports: ["spr-pf-30"] }).success).toBe(true);
  });
});
