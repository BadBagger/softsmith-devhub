# LeadSmith

A Smithware Studios web dashboard for finding, pitching, and winning website
clients. It's growing in three phases; phases 1 and 2 are done.

1. **Lead Finder** — search local businesses by category and location,
   score them by how likely they need a new website, save the good ones.
2. **Web Builder** — turn a saved lead into a proposal site: pick a
   template, edit content with a live preview, share a public preview
   link. The same site becomes the real client site once a lead is won.
3. **Outreach** (not started) — approval-gated email campaigns to saved
   leads, with a new → contacted → replied → won/lost pipeline.

## Getting started

```bash
npm install
cp .env.example .env.local   # then add your Google Places API key
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

No API key yet? Set `LEADSMITH_MOCK_PLACES=1` in `.env.local` to exercise the
search → save → status pipeline with deterministic sample data instead of
calling Google.

## How it works

- **Search** hits `POST /api/leads/search`, which calls the Google Places
  (New) Text Search API for `<category> in <location>` and scores each
  result (`src/lib/scoring.ts`) — no website is the strongest signal, thin
  review history is a secondary nudge.
- **Save** (`POST /api/leads`) persists a candidate to a local SQLite
  database at `data/leadsmith.db` (gitignored — this stays local-first, no
  required cloud service, matching every other SoftSmith Studios app).
- **Pipeline** status (`PATCH /api/leads/:id`) moves a saved lead through
  new → contacted → replied → won → lost as you work it.
- **Build site** on a saved lead (`POST /api/sites` with `leadId`) creates a
  proposal site pre-filled from the lead's business info
  (`src/lib/sites.ts#createSiteFromLead`), then opens the editor.
- The editor (`/sites/:id`) autosaves on every change (`PATCH /api/sites/:id`,
  debounced) and shows a live preview next to the form. Two templates ship
  today — Modern and Classic (`src/components/site-templates/`) — picked by
  a plain switch so adding a third is a matter of writing the component and
  adding one case, no registry indirection.
- `/sites/:id/preview` renders the same template with no editor chrome —
  that's the link you'd actually send a prospect.

## Compliance note

Phase 3 (Outreach) will send email to these leads. Every outreach template
must ship with a physical address and a working unsubscribe link (CAN-SPAM),
and sends will be approval-gated the same way HomeMind's sender-approval
flow works — nothing goes out without an explicit human approve step. SMS
outreach is deferred; it falls under TCPA and needs prior opt-in, which lead
data sourced from Places search does not provide.
