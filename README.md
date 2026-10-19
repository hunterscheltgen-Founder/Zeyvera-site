# Zeyvera — deployable site foundation

A static, responsive Zeyvera website plus a Worker API endpoint for diagnostic intake. The intake emails a submission to the configured contact address using Resend. No payment is collected.

## Cloudflare deployment

This repository is configured for a **Cloudflare Worker with Static Assets**, matching the dashboard's `npx wrangler deploy` command.

1. In Cloudflare, open the existing Worker service named `zeyvera-site` and connect it to this GitHub repository's `main` branch.
2. Use `npx wrangler deploy` as the deploy command. The repository's `wrangler.toml` specifies `src/index.js` as the Worker entry point and `public` as the static asset directory.
3. Add these as Worker production secrets/variables in Cloudflare:
   - `RESEND_API_KEY` — secret API key from Resend.
   - `CONTACT_EMAIL` — inbox that should receive submissions.
   - `FROM_EMAIL` — sender address verified in Resend, such as `Zeyvera Intake <intake@send.example.com>` (replace with your verified sender).
4. Verify the sender domain in Resend, deploy, then test `/diagnostic/` and confirm email delivery.
5. Add a custom domain only if you control its DNS.

For local development, run `npm install` and `npm run dev`. Put local-only secrets in `.dev.vars`; never commit real keys.

## Current scope and limitations

- Form submissions are emailed, not persisted in a database.
- Email intake requires a valid Resend API key and verified sender.
- Rate limiting and abuse monitoring still need production configuration.
- No authentication, customer dashboard, payment processing, AI API, or recurring billing is included.
- Review the privacy notice against actual practices and applicable law.
- A Git commit is not proof of deployment; verify Cloudflare's deployment status and test the live URL.
