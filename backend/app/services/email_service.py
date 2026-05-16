import smtplib, ssl, logging, encodings.idna
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.utils import formataddr
from app.config import settings

logger = logging.getLogger(__name__)
BRAND_GOLD = "#D9A916"
SITE_NAME = "С нуля"
DISPLAY_FROM = "Лёгкая химия"
FONT_URL = "https://xn----7sbihsakfp2g2ef.xn--p1ai/fonts/SoyuzGrotesk.woff2"

def _to_ascii(addr):
    if "@" not in addr: return addr
    local, domain = addr.rsplit("@", 1)
    try:
        ad = ".".join(encodings.idna.ToASCII(p).decode("ascii") for p in domain.split("."))
        return local + "@" + ad
    except: return addr

def _smtp():
    u = _to_ascii(settings.SMTP_USER or "")
    ctx = ssl.create_default_context()
    srv = smtplib.SMTP_SSL(settings.SMTP_HOST, settings.SMTP_PORT, context=ctx)
    srv.login(u, settings.SMTP_PASS or "")
    return srv, u

def _from():
    return formataddr((DISPLAY_FROM, _to_ascii(settings.SMTP_FROM or settings.SMTP_USER or "")))

def _wrap(body):
    g = BRAND_GOLD
    s = SITE_NAME
    fu = FONT_URL
    return (
        "<!DOCTYPE html><html lang=\"ru\"><head><meta charset=\"UTF-8\">"
        "<meta name=\"viewport\" content=\"width=device-width,initial-scale=1.0\">"
        "<style>"
        f"@font-face{{font-family:'Soyuz';src:url('{fu}') format('woff2');font-weight:400 900;font-style:normal;}}"
        "body,table,td,p,h1,h2,span,a{font-family:'Soyuz',Arial,sans-serif!important;}"
        "</style>"
        "</head>"
        "<body style=\"margin:0;padding:0;background:#F0E6D3;font-family:'Soyuz',Arial,sans-serif;\">"
        "<table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" bgcolor=\"#F0E6D3\">"
        "<tr><td align=\"center\" style=\"padding:48px 16px;\">"
        "<table width=\"520\" cellpadding=\"0\" cellspacing=\"0\" style=\"background:#fff;border-radius:28px;overflow:hidden;box-shadow:0 12px 48px rgba(92,61,14,0.18);\">"
        f"<tr><td align=\"center\" style=\"background:{g};padding:40px 40px 34px;\">"
        "<div style=\"display:inline-block;background:rgba(255,255,255,0.22);border-radius:20px;padding:7px 22px;margin-bottom:16px;\">"
        "<span style=\"font-size:11px;font-weight:700;color:#fff;letter-spacing:4px;text-transform:uppercase;font-family:'Soyuz',Arial,sans-serif;\">Лёгкая химия</span>"
        "</div><br>"
        f"<span style=\"font-size:36px;font-weight:900;color:#fff;letter-spacing:-1px;font-family:'Soyuz',Arial,sans-serif;\">{s}</span>"
        "</td></tr>"
        f"<tr><td style=\"padding:44px 44px 40px;\">{body}</td></tr>"
        "<tr><td style=\"background:#FBF6EE;border-top:1px solid #EDE0CC;padding:22px 44px;text-align:center;\">"
        "<p style=\"margin:0;font-size:12px;color:#BFA882;line-height:1.7;font-family:'Soyuz',Arial,sans-serif;\">"
        "Это письмо отправлено автоматически — не отвечайте на него.<br>"
        "&copy; 2026 Лёгкая химия</p>"
        "</td></tr></table>"
        "</td></tr></table></body></html>"
    )

def _code_body(title, subtitle, code, footer):
    g = BRAND_GOLD
    return (
        f"<h1 style=\"margin:0 0 10px;font-size:24px;font-weight:900;color:#2D1A00;letter-spacing:-0.5px;font-family:'Soyuz',Arial,sans-serif;\">{title}</h1>"
        f"<p style=\"margin:0 0 30px;font-size:15px;color:#8A6A44;line-height:1.6;font-family:'Soyuz',Arial,sans-serif;\">{subtitle}</p>"
        "<table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"margin-bottom:20px;\">"
        f"<tr><td align=\"center\" style=\"background:#FFFBF0;border:2px solid {g};border-radius:18px;padding:32px 20px;\">"
        f"<span style=\"font-family:'Soyuz',Arial,sans-serif;font-size:52px;font-weight:900;letter-spacing:16px;color:{g};\">{code}</span>"
        "</td></tr></table>"
        "<table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\"><tr>"
        "<td style=\"background:#FBF6EE;border-radius:12px;padding:13px 20px;text-align:center;\">"
        f"<span style=\"font-size:13px;color:#BFA882;font-family:'Soyuz',Arial,sans-serif;\">&#9200; {footer}</span>"
        "</td></tr></table>"
    )

def _send(to_email, subject, title, subtitle, code, footer):
    if not settings.SMTP_USER or not settings.SMTP_PASS: return False
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = _from()
        msg["To"] = to_email
        msg.attach(MIMEText(_wrap(_code_body(title, subtitle, code, footer)), "html", "utf-8"))
        srv, u = _smtp()
        with srv: srv.sendmail(u, to_email, msg.as_string())
        logger.info(f"{subject} -> {to_email}")
        return True
    except Exception as e:
        logger.warning(f"email error: {e}")
        return False

def send_verification_code(to_email: str, code: str) -> bool:
    return _send(to_email,
        "Код подтверждения — " + SITE_NAME,
        "Подтверждение email",
        "Введите этот код на сайте для подтверждения регистрации:",
        code, "Код действителен 15 минут.")

def send_reset_code(to_email: str, code: str) -> bool:
    return _send(to_email,
        "Сброс пароля — " + SITE_NAME,
        "Сброс пароля",
        "Вы запросили сброс пароля. Введите этот код на сайте:",
        code, "Код действителен 15 минут. Если не вы — игнорируйте.")

def send_welcome_email(to_email: str) -> bool:
    if not settings.SMTP_USER or not settings.SMTP_PASS: return False
    try:
        g = BRAND_GOLD
        url = settings.APP_URL
        body = (
            "<h1 style=\"margin:0 0 10px;font-size:26px;font-weight:900;color:#2D1A00;letter-spacing:-0.5px;font-family:'Soyuz',Arial,sans-serif;\">Добро пожаловать! &#127881;</h1>"
            "<p style=\"margin:0 0 26px;font-size:15px;color:#8A6A44;line-height:1.7;font-family:'Soyuz',Arial,sans-serif;\">Ваш аккаунт подтверждён. Теперь доступны все курсы по химии — ОГЭ, ЕГЭ и подготовка к сессии.</p>"
            "<table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"margin-bottom:28px;\"><tr>"
            f"<td style=\"background:#FFFBF0;border-radius:14px;padding:18px 22px;border-left:4px solid {g};\">"
            "<p style=\"margin:0;font-size:14px;color:#5C3D0E;line-height:1.9;font-family:'Soyuz',Arial,sans-serif;\">"
            "&#127891;&nbsp; Видеоуроки с объяснениями с нуля<br>"
            "&#9989;&nbsp; Тесты для закрепления материала<br>"
            "&#128218;&nbsp; Конспекты по всем темам"
            "</p></td></tr></table>"
            "<table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\"><tr><td align=\"center\">"
            f"<a href=\"{url}\" style=\"display:inline-block;background:{g};color:#fff;"
            "font-weight:900;font-size:17px;text-decoration:none;padding:18px 52px;border-radius:16px;"
            "font-family:'Soyuz',Arial,sans-serif;letter-spacing:0.3px;\">Начать учиться &rarr;</a>"
            "</td></tr></table>"
        )
        msg = MIMEMultipart("alternative")
        msg["Subject"] = "Добро пожаловать в " + SITE_NAME + "!"
        msg["From"] = _from()
        msg["To"] = to_email
        msg.attach(MIMEText(_wrap(body), "html", "utf-8"))
        srv, u = _smtp()
        with srv: srv.sendmail(u, to_email, msg.as_string())
        return True
    except Exception as e:
        logger.warning(f"welcome email error: {e}")
        return False
