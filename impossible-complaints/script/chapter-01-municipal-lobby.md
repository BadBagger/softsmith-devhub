# Chapter 1: Municipal Lobby & Records Annex

*"Tuesday was never approved"*

This file is a build spec, not just a script — everything a puzzle/dialogue system
needs (items, states, triggers, full text) lives here. Cast: MARA, QUIRE, PIGEON.
Locations: MUNICIPAL LOBBY, RECORDS ANNEX. Runtime target: ~20–25 min.

---

## 1. PUZZLE LIST

### Puzzle 1.1 — Take a Number
**Goal:** Get a queue ticket so Quire will legally acknowledge Mara exists.
**Setup:** A ticket dispenser by Quire's desk, jammed, currently displaying `000`.
Quire will not process anything — not even a hello — from someone without a number,
despite being the only two people in the room.
**Steps:** Examine dispenser → Interact (jams, comedic struggle) → Interact again
(dispenses ticket `001`) → show/give ticket to Quire.
**Solution:** Two interactions with the dispenser, no item required. Pure comedic
gate, not a real obstacle — should take ~10 seconds, exists for the joke and to
establish house rules before the real puzzles start.
**Fail state:** None — cannot be permanently stuck. Mara will eventually comment on
skipping it if the player tries to talk to Quire first (see wrong-action bank).

### Puzzle 1.2 — The Damaged Form
**Goal:** Obtain a valid, undamaged Form 48-B from the filing drawer.
**Steps:** Open drawer (SFX `drawer_open`) → take Damaged Form 48-B (SFX
`item_pickup`) → examine reveals torn corner, "unfit for processing" per Quire →
find Departmental Tape (see Item Index, located in the Complaint Box) → combine Tape
with Damaged Form → Repaired Form 48-B → give to Quire.
**Solution:** Damaged Form 48-B + Departmental Tape → Repaired Form 48-B.
**Fail state:** Giving the damaged (untaped) form to Quire fails softly — he refuses
and explains why, doesn't dead-end the player, gives a hint ("this needs mending, not
mercy").

### Puzzle 1.3 — The Stamp
**Goal:** Get Form 48-B stamped and officially filed.
**Steps:** Give Repaired Form 48-B (with queue ticket already shown) → Quire stamps it
(SFX `clerk_stamp`) → Stamped Form 48-B added to inventory, elevator button lights up.
**Solution:** Repaired Form 48-B → Quire (requires Puzzle 1.1 done first, or Quire
redirects to the dispenser).
**Fail state:** None once prerequisites met — this is the payoff beat, not a gate.

### Puzzle 1.4 — Into the Annex
**Goal:** Reach Records Annex.
**Steps:** Elevator button lit (post-stamp) → interact → SFX `elevator_arrive` →
scene transition to Records Annex.
**Solution:** Straightforward once 1.3 is complete. No separate item required.

### Puzzle 1.5 — The Missing Day
**Goal:** Discover Tuesday was never approved, and find proof it wasn't an accident.
**Steps:** Open Civic Calendar Ledger (SFX `ledger_inspect`) → notice the gap between
Monday and Wednesday → examine gap again → SFX `clue_missing_tuesday` fires,
Missing-Tuesday Clue added to case file → **new for this pass:** open the adjacent
Sign-In Ledger (separate prop, smaller book) → cross-reference the last signature
next to Monday's entry → it's Quire's initials, dated *after* Tuesday should have
existed. This is Mara's actual evidence, not a hunch.
**Solution:** Ledger examined twice (Civic Calendar), then Sign-In Ledger examined
once. Order matters: Sign-In Ledger is inert/uninteresting until the Civic Calendar
gap has been found (keeps the "aha" beat from being spoiled early).
**Fail state:** None — purely sequential discovery, no failure path.

### Puzzle 1.6 — Locked Archive Cage (optional detour, rewards exploration)
**Goal:** Peek into the restricted archive cage in the Annex for a piece of optional
flavor/lore (not required for the main path — a "completionist" beat).
**Steps:** Examine cage (locked) → return to Quire, ask for Records Access Chit →
Quire initially refuses ("that requires *its own* form") → show Stamped Form 48-B
(already used once, still in inventory) → Quire, delighted someone's engaging with
the bit, issues a Records Access Chit on the spot → return to Annex, use Chit on
cage → unlocks, contains one optional item (see Item Index: Petra's Old Nameplate)
that seeds Ch.5 without explaining itself yet.
**Solution:** Optional. Chit obtained by presenting an already-used stamped form to
Quire a second time.
**Fail state:** Entirely skippable; does not block Puzzle 1.5 or the chapter ending.

### Puzzle 1.7 — The Confrontation
**Goal:** Get Quire to admit what he knows.
**Steps:** Return to Lobby with Missing-Tuesday Clue in case file → talk to Quire →
dialogue tree (below) → present Sign-In Ledger evidence (if not shown, Quire deflects
longer before cracking; showing the evidence shortcuts the tree) → Quire gives up the
lead on Weather & Atmosphere Permits.
**Solution:** Conversation-gated, not item-gated — the "puzzle" is asking the right
follow-up, which the game should make easy to stumble into (limited topic list).
**Fail state:** None; Quire cannot be permanently stonewalled, this is the chapter's
guaranteed exit beat.

---

## 2. ITEM INDEX

### Complaint Slip *(starting inventory)*
- **Examine:** "Case Tuesday. Reality administratively incorrect, see attached.
  Attached is blank. Somebody's saving themselves paperwork by making it mine."
- **Use on anything:** "It's a complaint slip, not a multitool."

### Take-a-Number Dispenser *(Lobby, fixed prop)*
- **Examine:** "A ticket dispenser. For a queue of exactly one person, in a room
  with exactly one desk. This building doesn't do irony on purpose, which somehow
  makes it funnier."
- **Interact (1st time):** "Jammed." *(comedic struggle animation — Mara yanks the
  lever, it does not yield, she says something under her breath the mic doesn't quite
  catch)*
- **Interact (2nd time):** "There." *(ticket `001` drops — SFX: soft mechanical
  chunk, reuse `ui_select` or a dedicated `dispenser_ticket` cue)* "Number one. I'm
  also, presumably, number last."
- **Interact (after ticket obtained):** "Got my number. Don't need another."

### Damaged Form 48-B *(from Filing Drawer)*
- **Examine:** "Somebody folded this into a paper airplane and lost the war."
- **Use on Quire (before repair):** *(Quire line, see NPC section — soft fail,
  redirects to Complaint Box)*
- **Combine with Departmental Tape:** → becomes **Repaired Form 48-B**. "Ugly. Legal.
  I'll take it."

### Departmental Tape *(found in Complaint Box, see below)*
- **Examine:** "A roll of tape with 'PROPERTY OF FILING — DO NOT REMOVE' printed on
  every single inch of it, including the parts you can't see until you've already
  used them. Somebody in Supply has a sense of humor and a grudge."
- **Use on Damaged Form 48-B:** triggers Puzzle 1.2 combine.
- **Use on anything else:** "Tempting, but no. I only get away with stealing office
  supplies once a case."

### Repaired Form 48-B
- **Examine:** "Held together with departmental tape and the specific willpower of
  someone who is not doing this again today."
- **Give to Quire (with ticket shown):** triggers Puzzle 1.3.
- **Give to Quire (no ticket shown):** Quire redirects to dispenser (see NPC).

### Stamped Form 48-B
- **Examine:** "Officially, verifiably, stamped. It did something to me, seeing that
  stamp come down. I refuse to examine what."
- **Give to Quire (2nd time, for Records Access Chit — Puzzle 1.6):** triggers chit.

### Complaint Box *(Lobby, fixed prop, overflowing suggestion box)*
- **Examine (1st time):** "A complaint box. Overflowing. Let's see what passes for a
  crisis around here." *(reveals: Departmental Tape wedged in the slot, visible)*
- **Examine (2nd+ time, flavor only — rotate 2–3 of these):**
  - "Top complaint today: 'the sky is too blue, it's unprofessional.' Filed, apparently,
    in good faith."
  - "Someone's filed a complaint about the complaint box. That one's mine to admire,
    honestly."
  - "'Whoever keeps stamping things needs a hobby.' No note on who. I have a guess."
- **Take (Departmental Tape):** SFX `item_pickup`. "Taking city property. Again."

### World's Okayest Caseworker Mug *(Lobby, on a side counter, flavor-only prop)*
- **Examine:** "A gift. From someone who is no longer speaking to me. Still my
  favorite mug." *(beat)* "It's fine. I'm fine. It's a mug."
- **Interact/Take:** "No. That's — no. Leave it. It's load-bearing, somehow."

### Civic Calendar Ledger *(Records Annex, fixed prop)*
- **Examine (1st time):** "Every day the city's ever had, filed somewhere in here.
  In theory."
- **Interact (1st time):** SFX `ledger_inspect`. "The civic calendar. Every day
  accounted for. Allegedly." *(pages through)*
- **Interact (2nd time):** SFX `clue_missing_tuesday`. "Wait. There's no Tuesday.
  Not skipped — never approved." *(beat)* "That's not a filing error. Filing errors
  look apologetic. This looks like nobody ever filled out the form." *(Missing-Tuesday
  Clue added to case file; Sign-In Ledger becomes interactive)*

### Sign-In Ledger *(Records Annex, fixed prop, only interactive post-clue)*
- **Examine (before Civic Calendar clue found):** "A staff sign-in book. Not what I'm
  here for." *(intentionally inert to avoid spoiling the order of discovery)*
- **Examine (after clue found):** "Whoever last touched Monday's filing signed out
  right here." *(beat)* "...That's Quire's initials. Dated after Tuesday should've
  existed." *(Sign-In Evidence added to case file — separate from the clue itself,
  used to shortcut the Ch.1 confrontation dialogue tree)*

### Locked Archive Cage *(Records Annex, fixed prop, optional)*
- **Examine (locked):** "Restricted access. Of course it is."
- **Use Records Access Chit:** unlocks. "Look at that. Bureaucracy giveth."
- **Examine (unlocked, empty but for one item):** contains Petra's Old Nameplate.

### Petra's Old Nameplate *(optional, from Archive Cage)*
- **Examine:** "A desk nameplate. 'P. VANE — ARCHIVES.' Tarnished. Someone kept this
  instead of throwing it out, which is either sentimental or a filing error. With this
  building, could genuinely be either." *(No further payoff yet — pure Ch.5 seed;
  flag clearly in code as a foreshadowing item with no mechanical use until Ch.5.)*

---

## 3. NPC DIALOGUE — QUIRE (Lobby)

### Greeting (first approach, no ticket shown)
**QUIRE:** "Welcome to the Department. Do you have an appointment, a form, or a very
good excuse?"
**MARA:** "Complaint intake. Case Tuesday."
**QUIRE:** "Ah." *(genuine sympathy under the cheer)* "Yes. We've had... questions
about Tuesday."
**MARA:** "Questions like 'where is it,' or questions like 'should there be one'?"
**QUIRE:** "I'm not really allowed to editorialize about ongoing filings. But between
us —" *(stage-whisper)* "— bring a form. And a number. I don't make the rules, I just
enforce them with unreasonable enthusiasm."

### Redirect to dispenser (any attempt to transact without a ticket)
**QUIRE:** "I'm going to need a number first."
**MARA:** "There's nobody else here."
**QUIRE:** "The system doesn't know that."

### Give Damaged (unrepaired) Form 48-B
**QUIRE:** "Oh — no. No, this needs mending, not mercy. I can't stamp a form that's
actively falling apart, that's not procedure, that's a *crime scene*."

### Give Repaired Form 48-B (with ticket shown) — Puzzle 1.3 payoff
**QUIRE:** *(taking it, real satisfaction)* "Ugly, but held. I respect a repair job
more than I respect most of the original filings that come through here." *(produces
stamp)* "One stamp, freshly inked, generously applied."
*(SFX `clerk_stamp`, THUNK)*
**QUIRE:** "There. Officially, verifiably, stamped."
**MARA:** *(small real smile — first one of the game)* "There it is. Official.
Whatever that means today."
**QUIRE:** "Everything means something today. That's rather the problem, isn't it."
*(Beat — he says this lightly, but it's the first hint he knows more than he's
saying. Mara doesn't chase it yet; she's not listening for it in Ch.1.)*
**MARA:** "Elevator's this way?"
**QUIRE:** "It is now." *(gestures — elevator button lights up)*

### Give Stamped Form 48-B again (Puzzle 1.6, Records Access Chit)
**QUIRE:** "You want *in* the cage? That requires its own form." *(pause, visibly
pleased someone's bothering)* "...You know what. You've already got one good stamp in
you today. Here." *(hands over Records Access Chit)* "Don't tell Supply I skipped a
step. Tell them I *invented* a step. Sounds better in the write-up."

### Wrong-action bank (rotate; fires on nonsense actions at Quire's desk)
**QUIRE:** "That is not procedure. I love procedure. Please stop."
**QUIRE (alt):** "I admire the confidence. I do not admire the method."
**QUIRE (alt):** "Sir. Ma'am. Entity. Please use the form."
**QUIRE (alt, new):** "You can't file a complaint about the complaint process using
the complaint process. It's a paradox. I've seen it happen. It's not pretty."

### Try to take the stamp
**QUIRE:** *(both hands closing around it, dead serious for one beat)* "No."
*(cheerful again, instantly)* "Everyone asks. Nobody gets to. It's not that kind of
story."

### The Confrontation (after Missing-Tuesday Clue obtained, back in Lobby)

**MARA:** "I have a question, and I promise it's shaped like a form."
**QUIRE:** "My favorite shape."
**MARA:** "Tuesday was never approved. Whose desk did that die on?"
**QUIRE:** *(cheer flickers — first real crack)* "Tuesday? I'm sure Tuesday is fine.
Tuesday is always fine."
**MARA:** "Quire."
**QUIRE:** *(smaller)* "...It may be sitting in a drawer. A metaphorical drawer.
Possibly a real one."

**[Branch — IF Sign-In Evidence obtained]**
**MARA:** *(sliding the Sign-In Ledger across)* "That's your handwriting next to
Monday's last entry. Dated after Tuesday should've existed."
**QUIRE:** *(long pause — the bit drops entirely for the first time in the game)*
"...I process paper. I don't ask why the paper's strange. I should have. I didn't. I
signed it because it was in the pile and the pile doesn't stop, and — " *(catches
himself, rebuilds the cheer, badly)* "— that's not an excuse, is it."
**MARA:** *(gently — dry warmth, not an interrogation)* "No. But it's a start."

**[Branch — IF Sign-In Evidence NOT obtained]**
**MARA:** "Which floor."
**QUIRE:** "I really am not supposed to —"
**MARA:** "I know. I'm asking anyway."
*(Beat. He looks at her — really looks, like he's deciding something.)*

**[Branches converge]**
**QUIRE:** "Weather and Atmosphere have been filing very strange sun permits all
week. I only process paper. I don't ask why the paper's strange. But you might."
*(SFX cue: `case_closed` bank — thunk/chime plus music stinger layered over the
lobby ambience bed)*
**MARA:** *(already moving toward the elevator)* "Say that again. Slowly. For the
complaint file."
**QUIRE:** "So somewhere, an entire Tuesday is still in committee."

---

## 4. NPC DIALOGUE — PIGEON (Lobby, sparse/flavor only)

### Interact (no item held)
*A pigeon regards Mara through the tube glass with the specific contempt of someone
whose lunch break was interrupted.*
**PIGEON:** "Not my department." *(SFX `pigeon_interact`)*
**MARA:** *(dry)* "Didn't ask."

### Interact (post-stamp, optional flavor before elevator — pick one at random)
**PIGEON:** "Delivery." *(delivers nothing. Just wanted to say that.)*
**MARA:** "...Thank you? I think?"

**PIGEON (alt):** "Correspondence received."
**PIGEON (alt):** "That is above my pay grade."
**PIGEON (alt, new):** "I don't do Tuesdays. Never have. Ask literally anyone else."
*(Mara stops. Looks at the pigeon. Decides not to open that particular door today.)*

---

## 5. SCENE FLOW SUMMARY (for implementation)

```
LOBBY (start)
 ├─ [optional/any order] Take-a-Number Dispenser ×2 → Ticket
 ├─ [optional/any order] Complaint Box → Departmental Tape
 ├─ Filing Drawer → Damaged Form 48-B
 ├─ Damaged Form 48-B + Departmental Tape → Repaired Form 48-B
 ├─ Repaired Form 48-B + Ticket → Quire → Stamped Form 48-B [gate: elevator unlocks]
 ├─ [optional] Stamped Form 48-B → Quire (2nd ask) → Records Access Chit
 └─ Elevator → RECORDS ANNEX

RECORDS ANNEX
 ├─ Civic Calendar Ledger ×2 → Missing-Tuesday Clue
 ├─ Sign-In Ledger (unlocked by clue) → Sign-In Evidence
 ├─ [optional] Records Access Chit → Archive Cage → Petra's Old Nameplate (Ch.5 seed)
 └─ Elevator → LOBBY

LOBBY (return)
 └─ Talk to Quire → Confrontation (branches on Sign-In Evidence) → CH.2 UNLOCKED
```

---

## 6. Trigger-ID cross-reference (AUDIO_MANIFEST.json)

Existing cues used: `drawer_open`, `item_pickup`, `clerk_stamp`, `elevator_unlock`,
`elevator_arrive`, `scene_records_enter`, `ledger_inspect`, `clue_missing_tuesday`,
`conversation_topic`, `case_closed`, `pigeon_interact`, `ui_hover`/`ui_select`/
`ui_cancel`, `walk_tile`.

**New cues needed for this pass** (not yet in the audio pack — flag for next voice/SFX
batch): a `dispenser_ticket` SFX (soft mechanical chunk, distinct from `ui_select`);
voice lines for the Take-a-Number bit, the Complaint Box flavor rotation, the mug
beat, the Sign-In Ledger discovery line, Quire's confrontation-branch "I should have.
I didn't." monologue, and the new pigeon alt line. All should be written as separate
optional/required entries in a future AUDIO_MANIFEST.json update rather than reusing
existing files — the emotional register on a few of these (Quire's crack, specifically)
is different enough from his existing lines that reusing old audio would undersell it.
