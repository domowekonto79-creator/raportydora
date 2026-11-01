<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Project rules

- Landing page sections live in `src/components/landing/`; the index route only composes them — keeps the ad landing page easy to clone into keyword-specific variants.
- Company contact details live only in `src/lib/site.ts`; empty values are hidden in the UI — so the owner can fill them in one place.
- Enquiries go to the external Secureside contact page (`SITE.contactUrl` in `src/lib/site.ts`); its form already emails the owner and cannot be embedded (iframe blocked, Cloudflare Turnstile) — keep every CTA pointing at that one value.
- The original on-page form (`ContactForm`, `contact.functions.ts`, `contact-schema.ts`, `/dziekujemy`, `attribution.ts`) is parked, not rendered — kept so it can be re-enabled without rebuilding the lead table flow.
- The Secureside logo asset is the light version (white lettering) — place it only on dark backgrounds.
- Images the site shows are bundled files in `src/assets/` (imported via Vite), not Lovable CDN `.asset.json` pointers — the site is also deployed to Vercel, where `/__l5e/assets-v1/` URLs do not exist.
