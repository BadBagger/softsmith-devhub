# Outlook MCP Connector (personal Microsoft accounts)

A custom MCP connector that gives Claude read/search/send access to a
**personal** Outlook mailbox — outlook.com, hotmail.com, live.com, msn.com.

No company tenant. No Microsoft 365 business subscription. No IT admin
consent. No client secret. You register a free app under your own Microsoft
account and approve it yourself.

Stdlib Python only — nothing to `pip install`.

## Why this exists

Most Outlook/Graph integrations assume a work account, where an administrator
grants application permissions across a tenant. A personal Microsoft account
has no tenant and no admin, so that path is unavailable. This connector uses
the **OAuth 2.0 device code flow** against the `consumers` authority instead:
you approve your own mailbox, in a browser, once.

## Setup

### 1. Register the app (one time, ~3 minutes, free)

1. Go to <https://entra.microsoft.com> and sign in with your **personal**
   Microsoft account.
2. **Applications → App registrations → New registration**.
3. Name it anything (e.g. `outlook-mcp`).
4. Supported account types: **Personal Microsoft accounts only**.
5. Leave Redirect URI blank. Register.
6. Copy the **Application (client) ID** from the overview page.
7. **Authentication → Advanced settings →** set
   **Allow public client flows** to **Yes**, then Save.
   Device code flow will not work without this.
8. **API permissions → Add a permission → Microsoft Graph →
   Delegated permissions** → add `Mail.Read`, `Mail.Send`, `User.Read`,
   `offline_access`. These are all user-consent scopes; no admin approval is
   involved.

There is no step where you create a client secret. A public client must not
hold one.

### 2. Sign in

Run this where you can open a browser (your Windows box is ideal):

```powershell
$env:MS_CLIENT_ID = "<Application (client) ID>"
python3 tools/outlook-mcp/auth.py
```

It prints a short code. Open <https://microsoft.com/devicelogin>, enter the
code, approve. The script confirms the account and writes
`tools/outlook-mcp/.token-cache.json` (gitignored), then prints an
`MS_REFRESH_TOKEN=...` line.

### 3. Point Claude at it

`.mcp.json` in the repo root already wires the server up. It reads two
environment variables:

| Variable | Value |
| --- | --- |
| `MS_CLIENT_ID` | Application (client) ID from step 1 |
| `MS_REFRESH_TOKEN` | the value printed by `auth.py` |

**Local (Claude Code CLI / desktop):** set them in your shell profile, or rely
on the cached token file, which `auth.py` already wrote.

**Cloud sessions (claude.ai/code):** the container is wiped between sessions,
so the token file does not survive. Add both variables as environment
variables in your Claude Code **environment settings**, and the connector comes
up automatically on every future session in this repo.

Verify with: *"use outlook_whoami"*.

## Tools

| Tool | Purpose |
| --- | --- |
| `outlook_whoami` | Confirm which mailbox is connected |
| `outlook_list_folders` | Folders with item/unread counts |
| `outlook_search_messages` | Full-text search (`from:`, `subject:`, keywords) |
| `outlook_list_messages` | Recent messages by folder, with `since` / `unread_only` |
| `outlook_get_message` | Full message body, HTML converted to text |
| `outlook_send_mail` | Send mail as the signed-in account |

## Security notes

- The refresh token is a **live credential for your mailbox**. Treat it like a
  password. It is gitignored and never committed; do not paste it into chat,
  commit messages, or issues.
- Microsoft **rotates** the refresh token on every redemption. The server
  writes the new one back to the token cache. If you rely solely on
  `MS_REFRESH_TOKEN` in a read-only or ephemeral environment, expect to re-run
  `auth.py` when the original expires (personal-account refresh tokens are
  valid ~90 days, and are invalidated by a password change).
- Drop `Mail.Send` from `MS_SCOPES` if you want a strictly read-only connector.
- Revoke access any time at
  <https://account.live.com/consent/Manage>.

## Troubleshooting

| Symptom | Cause |
| --- | --- |
| `AADSTS7000218` / client assertion required | "Allow public client flows" is still **No** |
| `AADSTS50194` / app is not configured as multi-tenant | Account type is wrong, or `MS_AUTHORITY` should be `consumers` |
| `invalid_grant` on startup | Refresh token expired or revoked — re-run `auth.py` |
| Tools reply "Not set up yet" | `MS_CLIENT_ID` is not reaching the server process |
| Search returns nothing but mail exists | `$search` ignores `$orderby`; try plain keywords before `from:` syntax |
