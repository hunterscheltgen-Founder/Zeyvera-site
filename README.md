# Zeyvera — deployable site foundation

A static, responsive Zeyvera website plus a Cloudflare Pages Function for diagnostic intake. The intake emails a submission to the configured contact address using Resend. No payment is collected.

## Deploy
1. Connect this repository to Cloudflare Pages.
2. Project name `zeyvera-site`, production branch `main`, framework preset `None`, build command blank, output directory `public`.
3. Configure production variables: `RESEND_API_KEY`, `CONTACT_EMAIL`, and `FROM_EMAIL`.
4. Verify the sender domain in Resend, deploy, then test `/diagnostic/` and confirm email delivery.
5. Add `zeyvera.ca` as a custom domain only if you control its DNS.

## Local preview
Use Node.js and run `npx wrangler pages dev public`. Put local-only secrets in `.dev.vars`; never commit real keys.

## Current scope and limitations
- Form submissions are emailed, not persisted in a database.
- Email intake requires a valid Resend API key and verified sender.
- Rate limiting and abuse monitoring still need production configuration.
- No authentication, customer dashboard, payment processing, AI API, or recurring billing is included.
- Review the privacy notice against actual practices and applicable law.
- A Git commit is not proof of deployment; verify Cloudflare build status and test the live URL.
