"""Shared Microsoft Graph auth + HTTP helpers for the Outlook MCP server.

Personal Microsoft accounts only by default (outlook.com / hotmail.com /
live.com). Uses the OAuth device code flow against the `consumers` authority,
so no Azure AD tenant, no company admin consent, and no client secret.

Stdlib only on purpose: this has to run in a freshly cloned container with no
pip install step.
"""

import json
import os
import pathlib
import time
import urllib.error
import urllib.parse
import urllib.request

GRAPH = "https://graph.microsoft.com/v1.0"

# "consumers" = personal Microsoft accounts only. Use "common" if you ever want
# this to also accept a work/school account.
AUTHORITY = os.environ.get("MS_AUTHORITY", "consumers").strip()
CLIENT_ID = os.environ.get("MS_CLIENT_ID", "").strip()
SCOPES = os.environ.get(
    "MS_SCOPES", "offline_access User.Read Mail.Read Mail.Send"
).strip()

_DEFAULT_CACHE = pathlib.Path(__file__).resolve().parent / ".token-cache.json"
TOKEN_CACHE = pathlib.Path(os.environ.get("MS_TOKEN_CACHE", str(_DEFAULT_CACHE)))

OAUTH_BASE = "https://login.microsoftonline.com/{}/oauth2/v2.0".format(AUTHORITY)


class ConfigError(RuntimeError):
    """Raised when the connector has not been set up yet."""


class GraphError(RuntimeError):
    """Raised when Microsoft Graph returns an error response."""


def post_form(url, data):
    """POST application/x-www-form-urlencoded, return parsed JSON."""
    body = urllib.parse.urlencode(data).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=body,
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        raw = exc.read().decode("utf-8", "replace")
        try:
            return json.loads(raw)
        except ValueError:
            raise GraphError("HTTP {} from {}: {}".format(exc.code, url, raw[:400]))


def load_cache():
    if not TOKEN_CACHE.exists():
        return {}
    try:
        return json.loads(TOKEN_CACHE.read_text(encoding="utf-8"))
    except (ValueError, OSError):
        return {}


def save_cache(cache):
    """Persist tokens with owner-only permissions.

    Microsoft rotates the refresh token on every redemption, so the new one
    must be written back or the connector stops working after the first
    refresh.
    """
    try:
        TOKEN_CACHE.parent.mkdir(parents=True, exist_ok=True)
        TOKEN_CACHE.write_text(json.dumps(cache, indent=2), encoding="utf-8")
        os.chmod(TOKEN_CACHE, 0o600)
    except OSError:
        # A read-only filesystem is survivable: the in-memory token still works
        # for this process, the next start just has to refresh again.
        pass


def _refresh(refresh_token):
    payload = post_form(
        OAUTH_BASE + "/token",
        {
            "client_id": CLIENT_ID,
            "grant_type": "refresh_token",
            "refresh_token": refresh_token,
            "scope": SCOPES,
        },
    )
    if "access_token" not in payload:
        raise ConfigError(
            "Token refresh failed: {} — {}. Re-run tools/outlook-mcp/auth.py "
            "to sign in again.".format(
                payload.get("error", "unknown_error"),
                payload.get("error_description", "")[:300],
            )
        )
    return payload


def get_access_token():
    """Return a valid access token, refreshing and re-caching as needed."""
    if not CLIENT_ID:
        raise ConfigError(
            "MS_CLIENT_ID is not set. See tools/outlook-mcp/README.md — you need "
            "an Azure app registration (free, personal account, no tenant)."
        )

    cache = load_cache()
    now = time.time()

    if cache.get("access_token") and cache.get("expires_at", 0) > now + 60:
        return cache["access_token"]

    refresh_token = cache.get("refresh_token") or os.environ.get(
        "MS_REFRESH_TOKEN", ""
    ).strip()
    if not refresh_token:
        raise ConfigError(
            "No refresh token found. Run:  python3 tools/outlook-mcp/auth.py  "
            "on a machine where you can open a browser, then set MS_REFRESH_TOKEN."
        )

    payload = _refresh(refresh_token)
    cache["access_token"] = payload["access_token"]
    cache["expires_at"] = now + int(payload.get("expires_in", 3600))
    # Keep the rotated refresh token; fall back to the one we just used.
    cache["refresh_token"] = payload.get("refresh_token", refresh_token)
    save_cache(cache)
    return cache["access_token"]


def graph_request(method, path, params=None, body=None):
    """Call Microsoft Graph. `path` is either a /me/... path or a full URL."""
    url = path if path.startswith("http") else GRAPH + path
    if params:
        url += ("&" if "?" in url else "?") + urllib.parse.urlencode(params)

    data = None
    headers = {"Authorization": "Bearer " + get_access_token()}
    if body is not None:
        data = json.dumps(body).encode("utf-8")
        headers["Content-Type"] = "application/json"

    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            raw = resp.read().decode("utf-8")
            return json.loads(raw) if raw.strip() else {}
    except urllib.error.HTTPError as exc:
        raw = exc.read().decode("utf-8", "replace")
        detail = raw[:500]
        try:
            parsed = json.loads(raw)
            err = parsed.get("error", {})
            detail = "{}: {}".format(
                err.get("code", exc.code), err.get("message", "")[:400]
            )
        except ValueError:
            pass
        raise GraphError("Graph {} {} failed — {}".format(method, url, detail))
