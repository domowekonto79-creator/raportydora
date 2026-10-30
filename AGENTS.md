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
- Contact form validation is one shared zod schema (`src/lib/contact-schema.ts`) used by both the browser and the server function — rules cannot drift.
- Enquiries are inserted by a server function with the publishable key under an anon INSERT-only RLS policy; anon has no SELECT — visitors can never read leads.
- After a successful enquiry the visitor is sent to `/dziekujemy` — this page is the ad-conversion signal, keep it noindex.
- Ad attribution (UTM, gclid) is captured into sessionStorage on landing and saved with each enquiry — shows which ad produced each lead.
