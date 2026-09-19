#!/usr/bin/env python3
"""Outlook MCP connector for personal Microsoft accounts.

A stdio MCP server exposing mail search/read/send over Microsoft Graph.
Speaks JSON-RPC 2.0 on stdin/stdout; all logging goes to stderr so the
protocol framing on stdout stays clean.

Stdlib only — no pip install required.
"""

import html
import json
import re
import sys

import graph

PROTOCOL_VERSION = "2025-06-18"
SUPPORTED_PROTOCOLS = {"2025-06-18", "2025-03-26", "2024-11-05"}

PREVIEW_CHARS = 180
BODY_CHARS = 6000

MESSAGE_FIELDS = (
    "id,receivedDateTime,subject,bodyPreview,isRead,hasAttachments,"
    "from,toRecipients,webLink"
)


def log(message):
    print("[outlook-mcp] " + message, file=sys.stderr, flush=True)


def strip_html(raw):
    """Crude HTML -> text. Good enough for reading an email in a terminal."""
    text = re.sub(r"(?is)<(script|style).*?</\1>", " ", raw)
    text = re.sub(r"(?i)<br\s*/?>", "\n", text)
    text = re.sub(r"(?i)</p\s*>", "\n\n", text)
    text = re.sub(r"(?s)<[^>]+>", " ", text)
    text = html.unescape(text)
    text = re.sub(r"[ \t\r\f\v]+", " ", text)
    return re.sub(r"\n{3,}", "\n\n", text).strip()


def addr_of(entry):
    box = (entry or {}).get("emailAddress", {})
    name, addr = box.get("name", ""), box.get("address", "")
    if name and addr and name != addr:
        return "{} <{}>".format(name, addr)
    return addr or name or "?"


def recipients(value):
    if isinstance(value, str):
        parts = [p.strip() for p in re.split(r"[,;]", value)]
    elif isinstance(value, list):
        parts = [str(p).strip() for p in value]
    else:
        parts = []
    return [{"emailAddress": {"address": p}} for p in parts if p]


def format_message_line(msg):
    preview = (msg.get("bodyPreview") or "").replace("\n", " ").strip()
    if len(preview) > PREVIEW_CHARS:
        preview = preview[:PREVIEW_CHARS] + "..."
    flags = []
    if not msg.get("isRead", True):
        flags.append("UNREAD")
    if msg.get("hasAttachments"):
        flags.append("ATTACH")
    return "\n".join(
        [
            "- {}  {}".format(
                (msg.get("receivedDateTime") or "")[:16].replace("T", " "),
                " ".join("[" + f + "]" for f in flags),
            ).rstrip(),
            "  from: {}".format(addr_of(msg.get("from"))),
            "  subj: {}".format(msg.get("subject") or "(no subject)"),
            "  prev: {}".format(preview or "(empty)"),
            "  id:   {}".format(msg.get("id", "")),
        ]
    )


# --- tool implementations ------------------------------------------------


def tool_whoami(_args):
    me = graph.graph_request(
        "GET", "/me", params={"$select": "displayName,userPrincipalName,mail"}
    )
    return "Signed in as {} <{}>".format(
        me.get("displayName", "?"),
        me.get("mail") or me.get("userPrincipalName", "?"),
    )


def tool_list_folders(_args):
    data = graph.graph_request(
        "GET",
        "/me/mailFolders",
        params={"$top": 100, "$select": "id,displayName,totalItemCount,unreadItemCount"},
    )
    rows = data.get("value", [])
    if not rows:
        return "No mail folders returned."
    return "\n".join(
        "- {} ({} items, {} unread)\n  id: {}".format(
            f.get("displayName", "?"),
            f.get("totalItemCount", "?"),
            f.get("unreadItemCount", "?"),
            f.get("id", ""),
        )
        for f in rows
    )


def tool_search_messages(args):
    query = (args.get("query") or "").strip()
    if not query:
        return "Provide a `query`, e.g. 'from:billing@example.com' or 'receipt'."
    limit = max(1, min(int(args.get("limit", 20)), 50))

    # Graph forbids combining $search with $orderby/$filter on messages.
    data = graph.graph_request(
        "GET",
        "/me/messages",
        params={"$search": '"{}"'.format(query), "$top": limit, "$select": MESSAGE_FIELDS},
    )
    rows = data.get("value", [])
    if not rows:
        return "No messages matched: {}".format(query)
    header = "{} message(s) matching {!r}:\n".format(len(rows), query)
    return header + "\n\n".join(format_message_line(m) for m in rows)


def tool_list_messages(args):
    folder = (args.get("folder") or "inbox").strip()
    limit = max(1, min(int(args.get("limit", 20)), 50))

    filters = []
    if args.get("unread_only"):
        filters.append("isRead eq false")
    since = (args.get("since") or "").strip()
    if since:
        stamp = since if "T" in since else since + "T00:00:00Z"
        filters.append("receivedDateTime ge {}".format(stamp))

    params = {
        "$top": limit,
        "$select": MESSAGE_FIELDS,
        "$orderby": "receivedDateTime desc",
    }
    if filters:
        params["$filter"] = " and ".join(filters)

    data = graph.graph_request(
        "GET", "/me/mailFolders/{}/messages".format(folder), params=params
    )
    rows = data.get("value", [])
    if not rows:
        return "No messages in {} matching those constraints.".format(folder)
    header = "{} message(s) in {}:\n".format(len(rows), folder)
    return header + "\n\n".join(format_message_line(m) for m in rows)


def tool_get_message(args):
    message_id = (args.get("message_id") or "").strip()
    if not message_id:
        return "Provide a `message_id` (from a search or list result)."

    msg = graph.graph_request(
        "GET",
        "/me/messages/{}".format(message_id),
        params={"$select": MESSAGE_FIELDS + ",body,ccRecipients"},
    )
    body = msg.get("body", {}) or {}
    content = body.get("content", "") or ""
    if body.get("contentType", "").lower() == "html" and not args.get("include_html"):
        content = strip_html(content)
    truncated = len(content) > BODY_CHARS
    if truncated:
        content = content[:BODY_CHARS]

    lines = [
        "Date:    {}".format(msg.get("receivedDateTime", "?")),
        "From:    {}".format(addr_of(msg.get("from"))),
        "To:      {}".format(
            ", ".join(addr_of(r) for r in msg.get("toRecipients", [])) or "(none)"
        ),
    ]
    if msg.get("ccRecipients"):
        lines.append(
            "Cc:      {}".format(", ".join(addr_of(r) for r in msg["ccRecipients"]))
        )
    lines += [
        "Subject: {}".format(msg.get("subject") or "(no subject)"),
        "Attach:  {}".format("yes" if msg.get("hasAttachments") else "no"),
        "",
        content or "(empty body)",
    ]
    if truncated:
        lines.append("\n[truncated at {} characters]".format(BODY_CHARS))
    return "\n".join(lines)


def tool_send_mail(args):
    to = recipients(args.get("to"))
    subject = (args.get("subject") or "").strip()
    body = args.get("body") or ""
    if not to:
        return "Provide at least one recipient in `to`."
    if not subject:
        return "Provide a `subject`."

    message = {
        "subject": subject,
        "body": {
            "contentType": "HTML" if args.get("html") else "Text",
            "content": body,
        },
        "toRecipients": to,
    }
    for field, key in (("cc", "ccRecipients"), ("bcc", "bccRecipients")):
        entries = recipients(args.get(field))
        if entries:
            message[key] = entries

    graph.graph_request(
        "POST", "/me/sendMail", body={"message": message, "saveToSentItems": True}
    )
    return "Sent {!r} to {}.".format(
        subject, ", ".join(r["emailAddress"]["address"] for r in to)
    )


TOOLS = [
    {
        "name": "outlook_whoami",
        "description": "Confirm which Outlook/Microsoft account this connector is signed in as.",
        "inputSchema": {"type": "object", "properties": {}},
        "handler": tool_whoami,
    },
    {
        "name": "outlook_list_folders",
        "description": "List mail folders with item and unread counts.",
        "inputSchema": {"type": "object", "properties": {}},
        "handler": tool_list_folders,
    },
    {
        "name": "outlook_search_messages",
        "description": (
            "Full-text search across the mailbox. Supports KQL-ish terms such as "
            "'from:billing@example.com', 'subject:receipt', or plain keywords. "
            "Returns compact summaries including the message id."
        ),
        "inputSchema": {
            "type": "object",
            "properties": {
                "query": {"type": "string", "description": "Search terms."},
                "limit": {
                    "type": "integer",
                    "description": "Max results, 1-50 (default 20).",
                },
            },
            "required": ["query"],
        },
        "handler": tool_search_messages,
    },
    {
        "name": "outlook_list_messages",
        "description": (
            "List recent messages in a folder, newest first. Folder accepts a "
            "well-known name (inbox, sentitems, drafts, archive, junkemail, "
            "deleteditems) or a folder id."
        ),
        "inputSchema": {
            "type": "object",
            "properties": {
                "folder": {"type": "string", "description": "Default 'inbox'."},
                "limit": {"type": "integer", "description": "Max results, 1-50."},
                "unread_only": {"type": "boolean"},
                "since": {
                    "type": "string",
                    "description": "Only messages on/after this date (YYYY-MM-DD).",
                },
            },
        },
        "handler": tool_list_messages,
    },
    {
        "name": "outlook_get_message",
        "description": "Read one message in full by id, with HTML converted to text.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "message_id": {"type": "string"},
                "include_html": {
                    "type": "boolean",
                    "description": "Return raw HTML instead of converted text.",
                },
            },
            "required": ["message_id"],
        },
        "handler": tool_get_message,
    },
    {
        "name": "outlook_send_mail",
        "description": (
            "Send an email from the signed-in account. Recipients may be a "
            "comma-separated string or a list. Requires the Mail.Send scope."
        ),
        "inputSchema": {
            "type": "object",
            "properties": {
                "to": {"type": "string", "description": "Comma-separated recipients."},
                "subject": {"type": "string"},
                "body": {"type": "string"},
                "cc": {"type": "string"},
                "bcc": {"type": "string"},
                "html": {
                    "type": "boolean",
                    "description": "Treat body as HTML (default plain text).",
                },
            },
            "required": ["to", "subject", "body"],
        },
        "handler": tool_send_mail,
    },
]

BY_NAME = {t["name"]: t for t in TOOLS}


# --- JSON-RPC plumbing ---------------------------------------------------


def respond(request_id, result=None, error=None):
    payload = {"jsonrpc": "2.0", "id": request_id}
    if error is not None:
        payload["error"] = error
    else:
        payload["result"] = result
    sys.stdout.write(json.dumps(payload) + "\n")
    sys.stdout.flush()


def handle_call(params):
    name = params.get("name", "")
    tool = BY_NAME.get(name)
    if tool is None:
        return {
            "content": [{"type": "text", "text": "Unknown tool: " + name}],
            "isError": True,
        }
    try:
        text = tool["handler"](params.get("arguments") or {})
        return {"content": [{"type": "text", "text": text}]}
    except graph.ConfigError as exc:
        return {
            "content": [{"type": "text", "text": "Not set up yet — {}".format(exc)}],
            "isError": True,
        }
    except graph.GraphError as exc:
        return {"content": [{"type": "text", "text": str(exc)}], "isError": True}
    except Exception as exc:  # noqa: BLE001 - never kill the server on one bad call
        log("unhandled error in {}: {!r}".format(name, exc))
        return {
            "content": [{"type": "text", "text": "{}: {}".format(type(exc).__name__, exc)}],
            "isError": True,
        }


def main():
    log("ready (authority={}, client_id={})".format(
        graph.AUTHORITY, "set" if graph.CLIENT_ID else "MISSING"
    ))

    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue
        try:
            request = json.loads(line)
        except ValueError:
            continue

        method = request.get("method", "")
        request_id = request.get("id")

        # Notifications carry no id and take no response.
        if request_id is None:
            continue

        if method == "initialize":
            asked = (request.get("params") or {}).get("protocolVersion")
            version = asked if asked in SUPPORTED_PROTOCOLS else PROTOCOL_VERSION
            respond(request_id, {
                "protocolVersion": version,
                "capabilities": {"tools": {}},
                "serverInfo": {"name": "outlook-personal", "version": "1.0.0"},
            })
        elif method == "tools/list":
            respond(request_id, {
                "tools": [
                    {k: t[k] for k in ("name", "description", "inputSchema")}
                    for t in TOOLS
                ]
            })
        elif method == "tools/call":
            respond(request_id, handle_call(request.get("params") or {}))
        elif method == "ping":
            respond(request_id, {})
        else:
            respond(request_id, error={
                "code": -32601,
                "message": "Method not found: " + method,
            })


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        pass
