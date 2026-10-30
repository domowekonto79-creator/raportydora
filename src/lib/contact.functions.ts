import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/integrations/supabase/types";
import { contactSchema } from "./contact-schema";

export const submitContact = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => contactSchema.parse(input))
  .handler(async ({ data }) => {
    // Bots fill the hidden field — pretend success, store nothing.
    if (data.website) return { ok: true as const };

    const url = process.env["SUPABASE_URL"]!;
    const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
    const client = createClient<Database>(url, key, {
      auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
      global: {
        fetch: (input, init) => {
          const h = new Headers(init?.headers);
          if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) {
            h.delete("Authorization");
          }
          h.set("apikey", key);
          return fetch(input, { ...init, headers: h });
        },
      },
    });

    const a = data.attribution ?? {};
    const { error } = await client.from("contact_submissions").insert({
      full_name: data.fullName,
      company: data.company,
      email: data.email,
      phone: data.phone || null,
      entity_type: data.entityType || null,
      reports: data.reports,
      message: data.message || null,
      consent: data.consent,
      utm_source: a.utm_source || null,
      utm_medium: a.utm_medium || null,
      utm_campaign: a.utm_campaign || null,
      utm_term: a.utm_term || null,
      gclid: a.gclid || null,
      landing_path: a.landing_path || null,
    });

    if (error) {
      console.error("contact_submissions insert failed", error.message);
      return {
        ok: false as const,
        error: "Nie udało się wysłać formularza. Spróbuj ponownie za chwilę.",
      };
    }

    return { ok: true as const };
  });
