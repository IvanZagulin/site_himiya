import json
import os
import urllib.request
from pathlib import Path


APP_DIR = Path(os.environ.get("APP_DIR", "/home/ivanzagulin/legkaya-himiya"))
API_BASE = os.environ.get("API_BASE", "http://127.0.0.1:8010/api")


def load_env(path: Path) -> dict[str, str]:
    values = {}
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        values[key] = value.strip().strip('"').strip("'")
    return values


def request(path: str, method: str = "GET", body=None, token: str | None = None):
    data = None if body is None else json.dumps(body).encode("utf-8")
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = "Bearer " + token
    req = urllib.request.Request(API_BASE + path, data=data, headers=headers, method=method)
    with urllib.request.urlopen(req, timeout=15) as response:
        raw = response.read().decode("utf-8")
        return response.status, json.loads(raw) if raw else None


def main() -> None:
    if not (APP_DIR / ".env").exists():
        raise SystemExit(f"Missing production env file: {APP_DIR / '.env'}")
    env = load_env(APP_DIR / ".env")
    _, login = request(
        "/auth/login",
        "POST",
        {"email": env["ADMIN_EMAIL"], "password": env["ADMIN_PASSWORD"]},
    )
    token = login["access_token"]
    topic_id = None

    try:
        _, topic = request(
            "/admin/topics",
            "POST",
            {"course": "oge", "title": "Codex проверка переноса"},
            token,
        )
        topic_id = topic["id"]

        _, moved = request(f"/admin/topics/{topic_id}", "PATCH", {"course": "ege"}, token)
        assert moved["course"] == "ege", moved

        _, moved = request(f"/admin/topics/{topic_id}", "PATCH", {"course": "ses"}, token)
        assert moved["course"] == "ses", moved

        _, topics = request("/admin/topics?course=ses", token=token)
        assert any(item["id"] == topic_id for item in topics), "moved topic is not visible in target course"
        print("topic-transfer-ok")
    finally:
        if topic_id:
            request(f"/admin/topics/{topic_id}", "DELETE", token=token)


if __name__ == "__main__":
    main()
