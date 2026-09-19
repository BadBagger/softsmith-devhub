#!/usr/bin/env python3
"""One-time sign-in for the Outlook MCP connector (personal accounts).

Runs the OAuth 2.0 device code flow: it prints a short code, you enter it at
https://microsoft.com/devicelogin in any browser (phone is fine), and the
resulting refresh token is cached locally.

    export MS_CLIENT_ID=<your Application (client) ID>
    python3 tools/outlook-mcp/auth.py

Nothing here needs a client secret, an Azure tenant, or an admin.
"""

import sys
import time

import graph


def main():
    if not graph.CLIENT_ID:
        print(
            "MS_CLIENT_ID is not set.\n"
            "Register a free app first — see tools/outlook-mcp/README.md.",
            file=sys.stderr,
        )
        return 2

    start = graph.post_form(
        graph.OAUTH_BASE + "/devicecode",
        {"client_id": graph.CLIENT_ID, "scope": graph.SCOPES},
    )
    if "device_code" not in start:
        print(
            "Could not start device login: {} — {}".format(
                start.get("error", "unknown_error"),
                start.get("error_description", ""),
            ),
            file=sys.stderr,
        )
        return 1

    print("\n" + "=" * 62)
    print(start.get("message", "Open https://microsoft.com/devicelogin"))
    print("=" * 62 + "\n")
    print("Waiting for you to approve in the browser...", flush=True)

    interval = int(start.get("interval", 5))
    deadline = time.time() + int(start.get("expires_in", 900))

    while time.time() < deadline:
        time.sleep(interval)
        payload = graph.post_form(
            graph.OAUTH_BASE + "/token",
            {
                "client_id": graph.CLIENT_ID,
                "grant_type": "urn:ietf:params:oauth:grant-type:device_code",
                "device_code": start["device_code"],
            },
        )
        error = payload.get("error")

        if error == "authorization_pending":
            continue
        if error == "slow_down":
            interval += 5
            continue
        if error:
            print(
                "Sign-in failed: {} — {}".format(
                    error, payload.get("error_description", "")[:400]
                ),
                file=sys.stderr,
            )
            return 1

        refresh_token = payload.get("refresh_token", "")
        graph.save_cache(
            {
                "access_token": payload.get("access_token", ""),
                "refresh_token": refresh_token,
                "expires_at": time.time() + int(payload.get("expires_in", 3600)),
            }
        )

        who = graph.graph_request("GET", "/me", params={"$select": "displayName,userPrincipalName"})
        print("\nSigned in as {} <{}>".format(
            who.get("displayName", "?"), who.get("userPrincipalName", "?")
        ))
        print("Token cached at: {}".format(graph.TOKEN_CACHE))
        print("\nTo use this from a cloud session, set this environment variable")
        print("in your Claude Code environment settings (treat it like a password):\n")
        print("MS_REFRESH_TOKEN={}\n".format(refresh_token))
        return 0

    print("Device code expired before approval. Run it again.", file=sys.stderr)
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
