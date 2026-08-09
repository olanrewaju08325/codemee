import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
import logging

logger = logging.getLogger(__name__)

SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USERNAME", "")
SMTP_PASS = os.getenv("SMTP_PASSWORD", "")

def send_email(to_email: str, subject: str, body: str, is_html: bool = False):
    """
    Sends an email using the configured SMTP server.
    """
    if not SMTP_USER or not SMTP_PASS:
        logger.warning("SMTP credentials not configured. Skipping email send.")
        return False
        
    msg = MIMEMultipart()
    msg['From'] = f"CodeMe Academy <{SMTP_USER}>"
    msg['To'] = to_email
    msg['Subject'] = subject

    if is_html:
        msg.attach(MIMEText(body, 'html'))
    else:
        msg.attach(MIMEText(body, 'plain'))

    try:
        if SMTP_PORT == 465:
            server = smtplib.SMTP_SSL(SMTP_HOST, SMTP_PORT, timeout=20)
        else:
            server = smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=20)
            server.ehlo()
            server.starttls()
            server.ehlo()
        server.login(SMTP_USER, SMTP_PASS)
        server.send_message(msg)
        server.quit()
        logger.info(f"Email sent to {to_email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {e}")
        return False


async def send_email_tracked(
    db,
    to_email: str,
    subject: str,
    body: str,
    is_html: bool = False,
    category: str = "general",
) -> bool:
    """Send an email and record the attempt in email_events for the admin panel.

    The actual send is delegated to the synchronous send_email so its behaviour
    is unchanged. Recording is best-effort: a logging failure here must never
    stop a welcome email or a payment notice from going out.
    """
    error: str | None = None
    try:
        delivered = send_email(to_email, subject, body, is_html=is_html)
    except Exception as exc:  # send_email already guards, but be defensive
        delivered = False
        error = str(exc)
    if not delivered and error is None:
        error = "SMTP not configured or delivery rejected"

    try:
        from app.models.system import EmailEvent
        db.add(
            EmailEvent(
                to_email=to_email,
                subject=subject,
                category=category,
                success=delivered,
                error=error,
            )
        )
        await db.flush()
    except Exception as exc:
        logger.warning(f"Could not record email event for {to_email}: {exc}")

    return delivered
