"""
Deploy firestore.rules using the service account (no `firebase login` needed).

Run from project root:
  python scripts/deploy_rules.py
"""

import json
from pathlib import Path

from google.auth.transport.requests import AuthorizedSession
from google.oauth2 import service_account

ROOT = Path(__file__).resolve().parent.parent
KEY = ROOT / "scripts" / "serviceAccountKey.json"


def main() -> None:
    project = json.loads(KEY.read_text(encoding="utf-8"))["project_id"]
    creds = service_account.Credentials.from_service_account_file(
        str(KEY), scopes=["https://www.googleapis.com/auth/cloud-platform", "https://www.googleapis.com/auth/firebase"]
    )
    session = AuthorizedSession(creds)
    base = f"https://firebaserules.googleapis.com/v1/projects/{project}"
    source = (ROOT / "firestore.rules").read_text(encoding="utf-8")

    r = session.post(f"{base}/rulesets", json={"source": {"files": [{"name": "firestore.rules", "content": source}]}})
    r.raise_for_status()
    ruleset = r.json()["name"]

    release = f"projects/{project}/releases/cloud.firestore"
    r = session.patch(f"https://firebaserules.googleapis.com/v1/{release}", json={"release": {"name": release, "rulesetName": ruleset}})
    if r.status_code == 404:
        r = session.post(f"{base}/releases", json={"name": release, "rulesetName": ruleset})
    r.raise_for_status()
    print(f"Deployed {ruleset}")


if __name__ == "__main__":
    main()
