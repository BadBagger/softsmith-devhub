# Chapter 2: Weather & Atmosphere Permits

*"The sun's paperwork lapsed"*

Build spec, same format as Chapter 1 — items, states, triggers, and full text all
live here. Cast: MARA, OFFICER DILL (new), MR. QUIRE (cameo, off-screen/note only).
Location: FLOOR 2 — WEATHER & ATMOSPHERE PERMITS, a single waiting-room-and-back-office
space. Runtime target: ~20–25 min.

---

## 0. COLD OPEN (plays once, on first load of Floor 2)

*The elevator doors open on indoor drizzle. Actual, wet, falling-from-the-ceiling-tiles
drizzle, in a room with drop ceilings and fluorescent lights that should not allow for
weather. A row of umbrella-stand puddles. A waiting area with damp chairs. A back
office, mostly obscured by a hand-lettered sign taped to the glass: "OFFICER DILL —
BACK IN 5 MIN," visibly yellowed with age.*

**MARA:** *(stepping in, immediately regretting the coat choice)* "Huh." *(beat, looking
up at the ceiling)* "That's not supposed to do that indoors." *(pulls collar up)*
"Weather and Atmosphere. Let's see whose permit died."

*(SFX: `scene_weather_ambience` bed fades in — steady indoor drizzle, distant thunder
that never resolves, held under a `scene_lobby_ambience`-style unease drone one step
drier and colder than Ch.1's version. Player gains control at the end of this beat.)*

---

## 1. PUZZLE LIST

### Puzzle 2.1 — Waking Up Officer Dill
**Goal:** Get past the "BACK IN 5 MIN" sign and actually talk to Dill.
**Setup:** Dill is visibly at his desk the whole time, through the glass, surrounded
by uncapped energy drink cans, actively hiding behind a clipboard whenever Mara looks
directly at him. The sign has clearly been up for a very long time.
**Steps:** Examine sign → knock on glass → Dill flinches, doesn't open → interact with
glass a second time → Dill opens a one-inch gap → dialogue begins (Section 3).
**Solution:** Two interacts on the glass/door, no item required — same comedic-gate
grammar as Ch.1's ticket dispenser, different flavor (anxiety instead of procedure).
**Fail state:** None. Cannot be permanently stuck.

### Puzzle 2.2 — The Pending Bin
**Goal:** Get the Solar Permit Renewal form (Form S-1) out of Dill's "Pending
Supervisor Review" bin.
**Steps:** Ask Dill for the sun's permit → he indicates the bin, but won't hand
anything from it over without supervisor sign-off → examine bin (see Item Index) →
this is where Puzzle 2.3 branches in.
**Solution:** Not solvable directly — gated by Puzzle 2.3.
**Fail state:** Asking repeatedly without the memo just cycles Dill's anxiety bank
(Section 3) — no dead end, just no progress.

### Puzzle 2.3 — The Loophole Memo
**Goal:** Find Departmental Memo 12-R and use it to unstick Dill.
**Steps:** Examine corkboard (background hotspot, easy to miss on a first pass) →
find Memo 12-R half-buried under seven expired potlucks and a birthday card →
take/read it → return to Dill, present the memo (dialogue option, not inventory-give,
see Section 3) → Dill, panicked but persuaded, self-authorizes using the "emergency
initial stamp" already on his own desk (he's had it the whole time, he was just
scared to use it) → hands over Form S-1.
**Solution:** Corkboard examined → Memo 12-R taken → presented to Dill in dialogue.
**Fail state:** None once memo found; Dill cannot refuse the memo's actual text, that's
the joke — the system's own rules defeat the system's own fear, and it still takes
Mara being kind about it, not just correct.

### Puzzle 2.4 — The Broken Umbrella
**Goal:** Cross the worst patch of indoor drizzle (in front of the Weather Control
Panel) without the Complaint Slip / Form S-1 turning to pulp.
**Steps:** Approach the flooded hallway → notified it's too wet to cross safely with
paper in hand → find broken Departmental Umbrella (inside-out, one spoke snapped) on
the waiting-room coat rack → combine with Departmental Tape (**callback item — if the
player still has Ch.1 leftover tape, reuse it**; if not, a second roll is findable in
the same Complaint Box gag relocated to this floor's front desk) → Repaired Umbrella →
use on flooded hallway → cross safely.
**Solution:** Broken Umbrella + Departmental Tape → Repaired Umbrella → use on hallway.
**Fail state:** Trying to cross without the umbrella soft-fails with a flavor line
(Section 2) and no item loss — Mara just gets wet and turns back.

### Puzzle 2.5 — The Weather Control Panel / Pattern Discovery
**Goal:** Discover this isn't just the sun — find evidence of a pattern.
**Steps:** Reach the Weather Control Panel (via 2.4) → examine → it's flickering
between "AUTUMN," "AUTUMN," and a third, blank, unlabeled setting that shouldn't exist
→ examine again → open the panel's access flap → find a second Pending bin, this one
Dill has never opened, containing a small stack of *other* lapsed permits, none of
them the sun's problem: a Cloud Formation license, a Wind Direction consistency
filing, a Barometric Pressure renewal — all initialed by the same hand as Ch.1's
Sign-In Ledger evidence, all dated in the same window.
**Solution:** Sequential examine chain, same grammar as Ch.1's ledger discovery.
**Fail state:** None — sequential, no failure path.

### Puzzle 2.6 — Quire's Note (optional, ally-arc beat)
**Goal:** Optional flavor beat establishing Quire's shift toward being an active ally.
**Steps:** At any point after Puzzle 2.3 is complete, a pigeon arrives via a small
tube inset in the Floor 2 waiting room wall (**first indication tube routing isn't
lobby-only**) and drops a folded note → take/read note → Quire has retroactively
countersigned something Mara didn't ask him to, a small, real act of initiative that
directly contradicts his Ch.1 "I only handle paper" line.
**Solution:** Fully optional; no mechanical gate, pure characterization payoff.
**Fail state:** Skippable. If missed, it can be picked up on a return visit to Floor 2
later in the game without penalty (flag persists).

### Puzzle 2.7 — Talking Dill Into Stamping It
**Goal:** Get Dill to actually stamp Form S-1 and send the renewal through, closing
the chapter.
**Steps:** Return to Dill with Form S-1 in hand (post-2.3) and, ideally, the Pattern
Discovery from 2.5 → dialogue tree (Section 3) → Dill, now visibly more rattled by the
pattern than by his own fear of the supervisor, stamps the form anyway → SFX
`clerk_stamp` (shared cue, different physical prop — a shakier, more hesitant stamp
sound is acceptable reuse) → drizzle audibly eases → elevator gains Floor 3.
**Solution:** Conversation-gated. Showing the Pattern Discovery isn't required to
finish the chapter but changes Dill's closing lines (see branches, Section 3).
**Fail state:** None; guaranteed exit beat, same as Ch.1's confrontation.

---

## 2. ITEM INDEX

### "BACK IN 5 MIN" Sign *(fixed prop, Floor 2 entry)*
- **Examine:** "Hand-lettered. Taped up with the specific yellowing of a sign that has
  never once been accurate."
- **Interact (1st time):** "Knock, knock." *(no answer — Dill visibly flinches through
  the glass and does not open the door)*
- **Interact (2nd time):** triggers Puzzle 2.1 resolution — dialogue begins.

### Corkboard *(background prop, becomes examinable Item after entering)*
- **Examine (1st time):** "A corkboard. Seven expired potluck sign-up sheets, one
  birthday card for someone named Carol, and — there — a memo, half buried."
- **Take (Memo 12-R):** SFX `item_pickup`. "Taking it. Carol's card stays, obviously.
  I have some standards."

### Memo 12-R *(carried item)*
- **Examine:** "'Emergency Self-Authorization Protocol: if supervisory sign-off is
  unavailable for a period exceeding twenty minutes, authorized staff may
  self-authorize using the department-issued initial stamp.' Somebody wrote this
  specifically so nobody would ever have to be scared of a form again. Somebody has
  never met Dill."
- **Show to Dill:** triggers Puzzle 2.3 resolution.

### Pending Supervisor Review Bin *(fixed prop, Dill's desk)*
- **Examine (before memo shown):** "A bin. Full. Everything in it is waiting on a
  signature that, statistically, might never come."
- **Examine (after Form S-1 obtained):** "Emptier by one. Small victories."

### Form S-1: Continuance of Solar Licensure
- **Examine:** "The sun's paperwork. Somehow smaller than I expected something this
  important to be. About the size of a parking permit."
- **Use on Weather Control Panel:** soft-fail flavor — "Not yet. Panel first needs the
  actual stamped version, not me waving this around like a warrant."
- **After stamped (Ch.2 payoff):** see Chapter End State (Section 10).

### Broken Departmental Umbrella *(waiting-room coat rack)*
- **Examine:** "Inside-out, one spoke snapped clean. Somebody lost a fight with the
  weather in here and left the evidence."
- **Combine with Departmental Tape:** → **Repaired Umbrella**. "It'll hold. Probably."
- **Use on flooded hallway (before repair):** "This is not going to survive that, and
  neither, frankly, is the paperwork in my other hand."

### Repaired Umbrella
- **Examine:** "Structurally a crime. Functionally, fine."
- **Use on flooded hallway:** triggers Puzzle 2.4 crossing. "Here goes nothing
  water-resistant."

### Departmental Tape *(2nd roll, front desk — only spawns if Ch.1's roll wasn't
carried forward or was fully used; if the player still has it from Ch.1, this entry
is simply not placed)*
- **Examine:** "Another roll. 'PROPERTY OF FILING.' Filing has a lot of tape for a
  department that mostly does not, on paper, exist."
- **Use on Broken Umbrella:** triggers repair.

### Weather Control Panel
- **Examine (1st time):** "A panel. Currently flickering between 'AUTUMN,' 'AUTUMN,'
  and — that's not a season. That's not anything. That's a blank."
- **Examine (2nd time — opens access flap):** SFX `clue_pattern_discovered` *(new cue,
  see Section 6)*. "There's a second bin in here. Dill's never opened this one. I don't
  think he knows it exists." *(Pattern Discovery added to case file)*
- **Examine (3rd+ time, post-discovery):** "Cloud Formation. Wind Direction. Barometric
  Pressure. All signed off by the same hand as Monday's ledger entry back at the Lobby.
  This isn't a sun problem. This was never a sun problem."

### Quire's Note *(optional, delivered via wall pigeon tube)*
- **Examine/read:** "'Went back through Monday's stack after you left. Found three
  more filings that shouldn't have gone through on my initials. Forwarded them to
  Supervisor Review myself. Didn't ask permission. Felt strange not to ask. Doing it
  anyway. — Q.'" *(beat)* "...Well. Look at that."
- **No further mechanical use** — pure characterization. Adding it to the case file is
  optional/cosmetic if the implementation has a "case file" scrapbook view.

---

## 3. NPC DIALOGUE — OFFICER DILL

Voice note: fast, over-caffeinated, catastrophizing under a thin layer of trying to
sound professional. Never played as incompetent or pathetic — he is good at the actual
job when he's not paralyzed by the idea of being seen doing it wrong.

### First contact (after Puzzle 2.1)
**DILL:** *(door opens one inch)* "We're— I'm— it's a bad time. It's actually always
kind of a bad time. What do you need."
**MARA:** "Sun's permit. It's expired. It's raining inside your office."
**DILL:** "I'm *aware*. I've filed the paperwork. Twice. It's in the bin. It just
needs—" *(voice drops)* "—my supervisor's initials, and she's been 'in a meeting'
since March, and I'm not about to be the guy who —" *(catches himself)* "— you know
what, never mind. It's fine. It's contained. Mostly to this floor."

### Ask for the permit / examine bin (loop before memo found)
**DILL:** "It's *right there*. I can see it too. I can't just hand out a pending
filing without sign-off, that's — do you know what happens to a permit office that
skips sign-off? Chaos. Actual, procedural chaos."
**MARA:** *(dry)* "More chaos than the indoor weather?"
**DILL:** "...Different kind."

### Show Memo 12-R (Puzzle 2.3 resolution)
**DILL:** *(reads it three times)* "This is — this has been real, this whole time?
Twenty minutes, and I can just—" *(looks at the emergency stamp on his own desk like
he's never seen it before)* "—I've had this since I started. I've never used it. I
kept thinking someone would notice and I'd get in trouble for using it wrong."
**MARA:** *(gently)* "Or you use it right, and the sun comes back."
**DILL:** *(a long beat — then he actually reaches for it)* "...Yeah. Okay. Yeah."
*(SFX `clerk_stamp` — smaller, shakier stamp sound than Quire's)*
**DILL:** "There. Form S-1, self-authorized, Officer Dill, badge 4471. That's — I did
that. That's a thing I did."
**MARA:** *(small, real)* "Congratulations. You bureaucrated."
**DILL:** *(the first genuine laugh in the chapter)* "That's not a word."
**MARA:** "It is now. I'm filing it."

### Try to cross flooded hallway without umbrella
**DILL:** *(through the glass, unhelpfully cheerful about it)* "You'll want the
umbrella! I keep meaning to fix it!"
**MARA:** *(already soaked)* "Noted. Late."

### Wrong-action bank (rotate; nonsense actions at Dill's desk)
**DILL:** "That's not — I don't think that's a permit-related action."
**DILL (alt):** "I'm going to pretend I didn't see that, and we're both going to feel
better about it."
**DILL (alt):** "Please don't touch the bin. I know where everything in the bin is.
It's the only thing in this office I'm sure of."

### The Confrontation / Chapter close (return with Form S-1, dialogue-gated)

**MARA:** "Form's ready. Whenever you are."
**DILL:** *(taking it, hands actually steady for once)* "Whenever I am. Huh. Okay."

**[Branch — IF Pattern Discovery obtained]**
**MARA:** "Before you stamp it — the Weather Control Panel. Second bin. You didn't
know it was there, did you."
**DILL:** *(genuinely thrown)* "...No. What second bin."
**MARA:** "Cloud Formation. Wind Direction. Barometric Pressure. Same handwriting as a
filing I found downstairs. This isn't just your desk."
**DILL:** *(quiet, scared in a different way now — not for himself)* "That's — okay.
That's not me being bad at my job. That's someone doing this on purpose. That's
worse and also, weirdly, better?"
**MARA:** "Welcome to my week."
**DILL:** *(steadying himself, stamping Form S-1 anyway — SFX `clerk_stamp`)* "Well.
At least I can fix *my* piece of it. Go. Floor three, probably — Emotional Zoning's
been filing complaints about their own complaints department, which is either
recursive or a cry for help."

**[Branch — IF Pattern Discovery NOT obtained]**
**DILL:** *(stamping Form S-1 — SFX `clerk_stamp`)* "There. Sun's back on the books.
Should clear up in a few minutes." *(beat)* "...You should talk to Emotional Zoning
while you're up there, by the way. Floor three. They've been weird lately too. Weirder
than us, and we have *weather indoors*."

**[Branches converge]**
*(SFX: `scene_weather_ambience` drizzle audibly thins over ~4s; a shaft of real light
crosses the waiting room for the first time.)*
**MARA:** *(looking up, almost startled by it)* "...Oh. Hey. Look at that."
**DILL:** "Yeah." *(quiet pride)* "Yeah, look at that."

---

## 4. QUIRE CAMEO (optional, via Puzzle 2.6)

*No new dialogue tree — see Item Index, "Quire's Note," for full text. Delivered by a
generic unnamed pigeon via the Floor 2 wall tube; the Ground Floor Pigeon character
does not need to physically travel between floors, keep this as an
implementation-simple "note appears in tube" event rather than an animated courier
trip.*

---

## 5. SCENE FLOW SUMMARY (for implementation)

```
FLOOR 2 — WEATHER & ATMOSPHERE PERMITS (start)
 ├─ "BACK IN 5 MIN" Sign ×2 → Dill opens door → First Contact dialogue
 ├─ Corkboard → Memo 12-R
 ├─ Memo 12-R → Dill (show) → Form S-1 obtained [Pending Bin emptied by one]
 ├─ [optional/any order, may already be satisfied from Ch.1] Departmental Tape
 ├─ Broken Umbrella + Departmental Tape → Repaired Umbrella
 ├─ Repaired Umbrella → cross flooded hallway → Weather Control Panel
 ├─ Weather Control Panel ×2 → Pattern Discovery [second Pending Bin]
 ├─ [optional] Pigeon tube → Quire's Note
 └─ Form S-1 → Dill → Confrontation (branches on Pattern Discovery) → CH.2 COMPLETE
```

---

## 6. Trigger-ID cross-reference

Existing cues reused: `item_pickup`, `clerk_stamp`, `conversation_topic`, `walk_tile`,
`ui_hover`/`ui_select`/`ui_cancel`.

**Status: fully built.**
- `scene_weather_ambience` — built (`music/weather-ambience-loop.ogg`, 64s exact
  loop). Freesound-sourced (CC0 indoor-rain + ominous-drone layers, mixed and
  loop-engineered rather than used verbatim) — see `AUDIO_CREDITS.md`. Shares the
  low sustained-unease register with `scene_lobby_ambience` per the brief, via the
  drone layer sitting underneath the rain.
- `clue_pattern_discovered` — built (`sfx/clue-pattern-discovered.ogg`),
  Freesound-sourced (CC0 triangle hit, trimmed) — distinct timbre from
  `clue_missing_tuesday`'s handbell-based arpeggio (`sfx/clue-discovered.ogg`, also
  Freesound-sourced, different source recording) while still reading as "the same
  kind of discovery."
- `dill_stamp` — built (`sfx/dill-stamp.ogg`), Freesound-sourced (CC0 office-stamp
  recording, two takes spliced into a deliberate hesitant double-tap rather than a
  single clean hit) — audibly distinct from Quire's `clerk_stamp`.
- Full voice line set for Dill and the Ch.2-specific Mara/Quire lines — see
  `script/CHAPTER_02_DIALOGUE.json` (68 entries, same
  line_id/speaker/text/audio_filename/duration_s/timestamp-placeholder schema as
  Chapter 1's manifest).

---

## 7. GAME STATE & FLAGS

| Flag | Set by | Gates |
|---|---|---|
| `dill_door_open` | "BACK IN 5 MIN" sign, 2nd interact | Enables First Contact dialogue |
| `inv_memo12r` | Take Memo 12-R from corkboard | Enables showing memo to Dill |
| `inv_form_s1` | Show Memo 12-R to Dill (requires `dill_door_open`) | Enables umbrella-crossing gate to matter (form must be protected); enables final give-to-Dill |
| `has_tape_ch2` | Take tape (only if not already carried from Ch.1 as `has_tape`) | Enables umbrella repair; implementation should check `has_tape OR has_tape_ch2` |
| `inv_umbrella_repaired` | Combine Broken Umbrella + tape | Enables crossing flooded hallway |
| `weather_panel_reached` | Use Repaired Umbrella on flooded hallway | Enables Weather Control Panel interactions |
| `clue_pattern_discovered` | Weather Control Panel, 2nd interact (requires `weather_panel_reached`) | Enables Pattern Discovery branch in Ch.2 confrontation; adds case file entry |
| `has_quire_note` | Pigeon tube (any time after `inv_form_s1`) | Cosmetic/case-file only — no gate |
| `ch2_confrontation_done` | Give stamped Form S-1 sequence resolves | Sets `ch2_complete = true` |
| `ch2_complete` | see above | Elevator gains Floor 3; see Chapter End State |

Notes:
- `inv_form_s1` is obtained via dialogue (showing the memo), not a drag-and-drop
  item combine — consistent with how Ch.1 handled the Records Access Chit (dialogue
  can grant items, not just puzzles).
- Puzzle 2.6 (Quire's Note) never gates `ch2_complete` — matches Ch.1's rule that
  optional/characterization content never blocks the critical path.
- Carry-forward check: if `has_tape` is already `true` from Chapter 1 and the item
  wasn't consumed, do not spawn a second roll on Floor 2 — the Item Index entry for
  the second roll explicitly only appears if needed.

---

## 8. BACKGROUND SCENERY & FALLBACK LINES

### Background hotspots (Floor 2)
- **Ceiling drip (general room examine):** "The ceiling tiles are doing something
  ceiling tiles should not be able to do. I'm choosing not to look up more than
  necessary."
- **Waiting room chairs:** "Damp. All of them. There's a specific municipal
  unpleasantness to a wet waiting-room chair that no other kind of unpleasantness
  quite matches."
- **Energy drink cans (Dill's desk, examine only):** "Six. No, seven. There's one
  hiding behind the stapler."
- **Elevator (before unlocked):** "One working floor so far. Patience, again, as a
  form of paperwork."

### Generic fallback lines (rotate)
- **Examine self:** "Wetter than an hour ago. Otherwise unchanged."
- **Use random item on scenery:** "That's not going to do what I want it to do."
- **Use random item on Dill:** "He's stressed enough without me improvising."
- **Try to leave before `ch2_complete`:** "Not done here. Also, still raining. Also,
  it's raining *indoors*, which is a new personal low for weather."

---

## 9. IDLE / REVISIT DIALOGUE

- **Talk to Dill, post-Form-S-1, pre-confrontation:** **MARA:** "Anything else before
  I head out?" / **DILL:** "Just— don't tell my supervisor about the stamp thing.
  Actually — do. Tell her. I stamped a thing. I'd like that on the record."
- **Talk to Dill, post-`ch2_complete` (loitering):** **DILL:** "Floor three's that
  way. Or — it's the elevator. You know where the elevator is." *(smaller)* "Thanks
  for the memo thing. Genuinely."
- **Re-examine Weather Control Panel (post-discovery):** "Same three permits. Still
  don't like what they add up to."
- **Re-examine Pending Bin (post-Form S-1):** "Emptier by one. Still stuffed with
  everyone else's twenty-minute waits."

---

## 10. CHAPTER END STATE

On `ch2_complete = true`:
- Drizzle SFX/ambience fades to a light, ordinary rain-on-windows texture over ~4s
  (do not cut to silence — this floor should never feel fully "solved," just improved,
  matching the game's theme that fixing paperwork helps but doesn't erase the larger
  problem).
- Elevator gains a third floor option (Bureau of Emotional Zoning).
- Case file UI, if implemented, gains: Pattern Discovery (if obtained) and Quire's
  Note (if obtained), both read-only.
- No hard cut to black this time — let the light-shaft beat (end of Section 3) be the
  visual button, then allow free movement back to the elevator. Chapter 2 ends on a
  small, unforced grace note rather than a stinger, intentionally different rhythm
  from Chapter 1's harder button ending.
