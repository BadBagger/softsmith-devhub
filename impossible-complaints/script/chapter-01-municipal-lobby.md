# Chapter 1: Municipal Lobby & Records Annex

*"Tuesday was never approved"*

Cast: MARA (protagonist), QUIRE (paper clerk), PIGEON. Locations: MUNICIPAL LOBBY,
RECORDS ANNEX (via elevator). Runtime target: ~20 minutes.

---

## COLD OPEN

*Rain against tall windows. A lobby too big for how few people are in it: worn tile,
a bank of pigeon tubes along one wall, a filing drawer built into the wainscoting, an
elevator with a single button, and QUIRE at a desk that is mostly stamps.*

**MARA** *(to herself, entering)*
Tuesday. Complaint says "reality administratively incorrect, see attached." Attached
is blank. Great. Off to a wonderful start.

*She clocks Quire. He has not yet clocked her — he's mid-stamp on something,
completely absorbed.*

**MARA**
Morning.

**QUIRE** *(not looking up, stamp comes down — THUNK)*
One moment. This one's very satisfying. — There. *(looks up, delighted)* Good morning!
Welcome to the Department. Do you have an appointment, a form, or a very good excuse?

**MARA**
Complaint intake. Case Tuesday.

**QUIRE**
Ah. *(beat, genuine sympathy under the cheer)* Yes. We've had... questions about
Tuesday.

**MARA**
Questions like "where is it," or questions like "should there be one"?

**QUIRE**
I'm not really allowed to editorialize about ongoing filings. But between us —
*(leans in, stage-whispers)* — bring a form.

---

## HOTSPOT: FILING DRAWER (Lobby)

**Examine (before opening):**
> A filing drawer built into the wall, brass label worn smooth. It's stuck, or locked,
> or both, in the specific way old civic furniture gets when nobody's oiled a hinge
> since a prior administration.

**Interact — first attempt (locked):**
> MARA: Locked. Of course it's locked. *(SFX: `drawer_open` plays on successful open,
> not this line — this is the pre-state flavor line, no SFX)*

*Design note: the drawer opens freely on interact in the current build (no separate
key puzzle) — keep that. This line only fires if the player examines before opening.*

**Interact — opens (SFX: `drawer_open`):**
**MARA**
Locked, huh. Let's see what the city's hiding this time.

*She finds a single form, folded wrong, corner torn.*

**MARA** *(picking it up — SFX: `paper_pickup`)*
A form. Damaged, but a form's a form.

**Examine form (inventory):**
> MARA: Somebody folded this into a paper airplane and lost the war.

**Wrong action — try to use the drawer again after taking the form:**
> MARA: Already been through it. Unless the city's hiding a second, better Tuesday in
> there, I'm good.

---

## HOTSPOT: PIGEON TUBE (Lobby)

*Sparse, optional flavor content — the Pigeon should feel like set dressing that
occasionally, briefly, has opinions.*

**Interact (no item held):**
*A pigeon regards Mara through the tube glass with the specific contempt of someone
whose lunch break was interrupted.*

**PIGEON**
Not my department. *(SFX: `pigeon-coo.ogg`, then line)*

**MARA** *(dry)*
Didn't ask.

**Interact (after obtaining stamped form, optional flavor before elevator):**
**PIGEON**
Delivery.

*It does not, in fact, deliver anything. It just wanted to say that.*

**MARA**
...Thank you? I think?

*Optional alt (game may pick either at random for replay variety):*
**PIGEON (alt)**
Correspondence received.

**PIGEON (alt)**
That is above my pay grade.

---

## HOTSPOT: QUIRE'S DESK — Give Form

**Give damaged form to Quire:**
**QUIRE** *(taking it, turning it over with real concern)*
Oh my. This form has seen things.

**MARA**
It was in the drawer like that.

**QUIRE**
The drawer does that to people too, eventually. *(brightening)* Not to worry. Damage
noted is damage accounted for. This just needs...

*He produces the stamp with the reverence of a man producing a ring.*

**QUIRE**
One stamp, freshly inked, generously applied.

*(SFX: `paper-stamp.ogg`, THUNK)*

**QUIRE**
There. Officially, verifiably, stamped.

**MARA** *(taking it back — a real small smile, first one of the game)*
There it is. Official. Whatever that means today.

**QUIRE**
Everything means something today. That's rather the problem, isn't it.

*Beat. He says this lightly, but it's the first hint he knows more than he's saying.
Don't let Mara chase it yet — she's not listening for it in Chapter 1.*

**MARA**
Elevator's this way?

**QUIRE**
It is now. *(gestures — the single elevator button, previously unlit, is lit)*

---

### Wrong-action bank (Quire's desk, usable throughout Ch.1)

*Fire one of these when the player tries an out-of-order or nonsensical action on
Quire — examine, use wrong item, try to take the stamp, etc. Rotate; mark the two
starred lines as the "optional alternate quip" set already recorded in the audio pack.*

**QUIRE**
That is not procedure. I love procedure. Please stop.

**QUIRE (alt)** *
I admire the confidence. I do not admire the method.

**QUIRE (alt)** *
Sir. Ma'am. Entity. Please use the form.

**Try to take the stamp:**
**QUIRE** *(both hands closing around it, entirely serious for one second)*
No.

*(beat, cheerful again)*

**QUIRE**
Everyone asks. Nobody gets to. It's not that kind of story.

---

## HOTSPOT: ELEVATOR (Lobby → Records Annex)

**Interact (button, SFX: `elevator-button.ogg`):**
**MARA**
Let's see which floor keeps the truth.

**(SFX: `elevator-arrive.ogg`, transition)**

**MARA** *(arriving — scene transition line, SFX bed crossfades lobby→annex)*
Records Annex. Smells like dust with a grudge.

---

## SCENE: RECORDS ANNEX

*Drier, quieter, colder light. Rows of ledgers. A single reading desk. The rhythm
here is a distant, steady ticking — clerks somewhere counting something.*

**Examine room (first entry):**
> MARA: Every day the city's ever had, filed somewhere in here. In theory.

## HOTSPOT: CIVIC CALENDAR LEDGER

**Interact (SFX: `ledger-open.ogg`):**
**MARA**
The civic calendar. Every day accounted for. Allegedly.

*She pages through. Monday. Wednesday. The gap between them is not subtle once you're
looking directly at it.*

**Discover missing Tuesday (SFX: `clue-discovered.ogg`):**
**MARA** *(the game's real first "click")*
Wait. There's no Tuesday. Not skipped — never approved.

*Beat.*

**MARA**
That's not a filing error. Filing errors look apologetic. This looks like nobody ever
filled out the form.

**Examine ledger again (post-discovery):**
> MARA: No Tuesday. No draft of a Tuesday. No "Tuesday, pending." Just — a stitch
> pulled clean out of the week.

---

## RETURN TO LOBBY — Confrontation

*Design note: player takes elevator back down; Quire is at his desk as before.*

**MARA**
I have a question, and I promise it's shaped like a form.

**QUIRE**
My favorite shape.

**MARA**
Tuesday was never approved? Whose desk did that die on?

**QUIRE** *(the cheer flickers, just slightly — first real crack in his composure)*
Tuesday? I'm sure Tuesday is fine. Tuesday is always fine.

**MARA** *(gently, not letting it go — this is the dry warmth, not an interrogation)*
Quire.

**QUIRE** *(smaller)*
...It may be sitting in a drawer. A metaphorical drawer. Possibly a real one.

**MARA**
Which floor.

**QUIRE**
I really am not supposed to —

**MARA**
I know. I'm asking anyway.

*Beat. He looks at her — really looks, like he's deciding something.*

**QUIRE**
Weather and Atmosphere have been filing very strange sun permits all week. I only
process paper. I don't ask why the paper's strange. But you might.

*(SFX cue: `case_closed` bank fires here — thunk/chime SFX plus the music stinger
layered over the lobby ambience bed, per AUDIO_MANIFEST.json)*

**MARA** *(to herself, already moving toward the elevator)*
Say that again. Slowly. For the complaint file.

**QUIRE**
So somewhere, an entire Tuesday is still in committee.

**— END CHAPTER 1 —**

*Transition: elevator button now shows a second, previously-absent floor. Cut to
black on the sound of rain and one more distant stamp.*

---

## Trigger-ID cross-reference (existing AUDIO_MANIFEST.json cues used this chapter)

`drawer_open`, `item_pickup`, `clerk_stamp`, `elevator_unlock`, `elevator_arrive`,
`scene_records_enter`, `ledger_inspect`, `clue_missing_tuesday`, `conversation_topic`,
`case_closed`, `pigeon_interact`, `ui_hover`/`ui_select`/`ui_cancel`, `walk_tile`.

All lines above match (or lightly extend, in the case of new banter) the voice files
already recorded in `public/audio/voice/`. New lines introduced this pass — Quire's
"whose desk did that die on" response, the pigeon delivery flavor lines, the
wrong-action stamp-grab bit — aren't recorded yet; flag for the next voice pass.
