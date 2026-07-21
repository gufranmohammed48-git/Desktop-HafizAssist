# Hifzapp Support API

Tiny FastAPI service that handles support form submissions from
the Hifzapp `support.html` page.

## What it does

1. Receives POST requests at `/submit` with form data
2. Validates the honeypot (anti-spam)
3. Builds a pretty-formatted email body
4. Sends it to 104tutorials104@gmail.com via Resend

## Deployment

Deployed to Render free tier from this repo. The `render.yaml` in
this directory configures the service:
- Python runtime
- Free plan
- Health check at `/healthz`
- Env vars: `RESEND_API_KEY` (synced from Render dashboard),
  `RESEND_FROM` (default `onboarding@resend.dev`)

## Endpoints

- `GET /healthz` — health check, returns Resend config status
- `POST /submit` — receives form data, sends email

## Cold starts

Render free tier spins down after 15min of inactivity. First
request after a quiet period takes 10-30s. Subsequent requests
are fast.
