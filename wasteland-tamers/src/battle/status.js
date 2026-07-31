// Status effect rules. Kept as pure functions (no Phaser/scene references)
// so BattleScene just calls these and reacts to the result -- easier to
// tune numbers or add a new status without touching battle flow code.
import { getFamily } from '../data/creatures.js';

export const STATUS_LABEL = { poison: 'POISONED', sleep: 'ASLEEP', confuse: 'CONFUSED' };
export const STATUS_COLOR = { poison: '#9dff5c', sleep: '#8ab4e0', confuse: '#e08ae0' };
export const STATUS_VERB = { poison: 'poisoned', sleep: 'put to sleep', confuse: 'confused' };

const POISON_TICKS = 4;
const POISON_DAMAGE_RATIO = 0.08;
const SLEEP_MAX_TURNS = 4;
const SLEEP_WAKE_CHANCE = 0.35;
const CONFUSE_TURNS = 3;
const CONFUSE_SELF_HIT_CHANCE = 0.4;

// Rolls whether attacker's family inflicts its signature status on defender.
// Never overwrites an existing status or hits an already-fainted target.
export function tryInflictStatus(attacker, defender) {
  if (defender.status || defender.hp <= 0) return null;
  const family = attacker.familyId ? getFamily(attacker.familyId) : null;
  const onHit = family?.statusOnHit;
  if (!onHit || Math.random() >= onHit.chance) return null;
  applyStatus(defender, onHit.type);
  return onHit.type;
}

export function applyStatus(target, type) {
  if (type === 'poison') target.status = { type, ticksLeft: POISON_TICKS };
  else if (type === 'sleep') target.status = { type, turnsLeft: SLEEP_MAX_TURNS };
  else if (type === 'confuse') target.status = { type, turnsLeft: CONFUSE_TURNS };
}

// Call at the start of `who`'s turn, before anything else. Poison ticks
// regardless of which action the turn owner picks.
export function resolvePoisonTick(who) {
  if (!who.status || who.status.type !== 'poison') return null;
  const dmg = Math.max(1, Math.round(who.maxHp * POISON_DAMAGE_RATIO));
  who.hp = Math.max(0, who.hp - dmg);
  who.status.ticksLeft -= 1;
  if (who.status.ticksLeft <= 0) who.status = null;
  return { dmg, fainted: who.hp <= 0 };
}

// Call right before `who` would execute an attack. skip=true means the
// turn is consumed without a normal attack (asleep, or flinched from
// hurting itself in confusion). selfHitMult scales the confusion self-hit
// chance (a loyal creature listens through the disorientation better).
export function resolvePreActionStatus(who, selfHitMult = 1) {
  if (!who.status) return { skip: false };

  if (who.status.type === 'sleep') {
    who.status.turnsLeft -= 1;
    const wake = Math.random() < SLEEP_WAKE_CHANCE || who.status.turnsLeft <= 0;
    if (wake) who.status = null;
    return { skip: true, message: wake ? `${who.name} woke up!` : `${who.name} is fast asleep.` };
  }

  if (who.status.type === 'confuse') {
    who.status.turnsLeft -= 1;
    const snapped = who.status.turnsLeft <= 0;
    if (snapped) who.status = null;
    if (Math.random() < CONFUSE_SELF_HIT_CHANCE * selfHitMult) {
      const dmg = Math.max(1, Math.round(who.atk * 0.5));
      who.hp = Math.max(0, who.hp - dmg);
      return {
        skip: true,
        dmg,
        fainted: who.hp <= 0,
        message: `${who.name} is confused! It hurt itself for ${dmg}.`,
      };
    }
    return { skip: false, message: snapped ? `${who.name} snapped out of confusion!` : null };
  }

  return { skip: false };
}
