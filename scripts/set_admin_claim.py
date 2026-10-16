"""
Grant (or revoke) the `admin` custom claim that the CMS requires for login and all writes.

Setup: place your Firebase service account key at scripts/serviceAccountKey.json

Run from project root:
  python scripts/set_admin_claim.py admin@example.com           # grant
  python scripts/set_admin_claim.py admin@example.com --revoke  # revoke
"""

import argparse

import firebase_admin
from firebase_admin import auth, credentials

SERVICE_ACCOUNT_PATH = "scripts/serviceAccountKey.json"


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("email")
    parser.add_argument("--revoke", action="store_true")
    args = parser.parse_args()

    firebase_admin.initialize_app(credentials.Certificate(SERVICE_ACCOUNT_PATH))
    user = auth.get_user_by_email(args.email)

    claims = dict(user.custom_claims or {})
    if args.revoke:
        claims.pop("admin", None)
    else:
        claims["admin"] = True
    auth.set_custom_user_claims(user.uid, claims)
    # Force existing sessions to re-authenticate so the change applies immediately.
    auth.revoke_refresh_tokens(user.uid)

    print(f"{'Revoked' if args.revoke else 'Granted'} admin for {user.email} (uid {user.uid})")


if __name__ == "__main__":
    main()
