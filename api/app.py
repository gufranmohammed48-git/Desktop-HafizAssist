"""
Tiny FastAPI service that accepts support form submissions and forwards
them as emails to 104tutorials104@gmail.com via Resend.

Deployed to Render free tier. Cold-starts after 15min idle (~10-30s).
"""
import os
import datetime
import resend
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["POST", "OPTIONS"],
    allow_headers=["*"],
)

resend.api_key = os.environ.get("RESEND_API_KEY", "")
TO_EMAIL = "104tutorials104@gmail.com"

CATEGORY_LABELS = {
    "bug": "Bug Report",
    "feature": "Feature Request",
    "feedback": "Feedback",
    "contact": "Contact",
}
FIELD_LABELS = {
    "bug_what": "What were you doing when the bug happened?",
    "bug_expected": "What did you expect to happen?",
    "bug_actual": "What actually happened?",
    "feature_idea": "What feature would you like?",
    "feature_why": "Why would this be useful?",
    "feedback_liked": "What do you like?",
    "feedback_improve": "What could be better?",
    "contact_message": "Your message",
}
SKIP_KEYS = {
    "category", "name", "email", "botcheck",
    "access_key", "from_name", "subject",
}


@app.get("/healthz")
async def healthz():
    return {"ok": True, "to": TO_EMAIL, "resend_configured": bool(resend.api_key)}


@app.post("/submit")
async def submit(request: Request):
    form = await request.form()
    data = dict(form)

    # Honeypot: bots fill it, humans don't
    if data.get("botcheck"):
        return {"success": True}

    category = data.get("category", "feedback")
    category_label = CATEGORY_LABELS.get(category, category)
    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip()

    sections = []
    for key, value in data.items():
        if not value or key in SKIP_KEYS:
            continue
        label = FIELD_LABELS.get(key, key)
        sections.append(f"{label}\n{value}")

    lines = [
        f"HifzAssist Support — {category_label}",
        f"Submitted: {datetime.datetime.utcnow().isoformat()}Z",
        "",
        "\n\n".join(sections),
    ]
    if name or email:
        lines.append("")
        lines.append("--- Reply to ---")
        if name:
            lines.append(f"Name: {name}")
        if email:
            lines.append(f"Email: {email}")
    body = "\n".join(lines)
    subject = f"HifzAssist: {category_label}"

    if not resend.api_key:
        return {"success": False, "error": "RESEND_API_KEY not set on server"}

    params = {
        "from": os.environ.get("RESEND_FROM", "onboarding@resend.dev"),
        "to": [TO_EMAIL],
        "subject": subject,
        "text": body,
    }
    if email:
        params["reply_to"] = email

    try:
        r = resend.Emails.send(params)
        email_id = r.get("id") if isinstance(r, dict) else getattr(r, "id", None)
        return {"success": True, "id": email_id}
    except Exception as e:
        return {"success": False, "error": str(e)}
