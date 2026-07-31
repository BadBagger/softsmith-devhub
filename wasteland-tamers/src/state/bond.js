// Bond/loyalty rules for captured creatures. Pure functions, no Phaser
// references -- BattleScene calls these and applies the results.

export const BASE_BOND = 20; // a freshly tamed creature starts Uneasy, not at zero trust

const TIERS = [
  { min: 0, name: 'Wary' },
  { min: 20, name: 'Uneasy' },
  { min: 40, name: 'Familiar' },
  { min: 60, name: 'Trusting' },
  { min: 80, name: 'Bonded' },
];

// Only creatures pulled from the party carry a `bond` field. The player's
// bare-handed scavenger fallback fighter doesn't -- treat that as "no bond
// concept applies here" rather than tier 0, so callers should guard on
// `typeof fighter.bond === 'number'` before showing bond UI.
export function hasBond(fighter) {
  return typeof fighter.bond === 'number';
}

export function bondTier(bond) {
  let tier = TIERS[0];
  for (const t of TIERS) {
    if (bond >= t.min) tier = t;
  }
  return { name: tier.name, index: TIERS.indexOf(tier) };
}

export function adjustBond(fighter, delta) {
  if (!hasBond(fighter)) return;
  fighter.bond = Math.max(0, Math.min(100, fighter.bond + delta));
}

// A more loyal creature fights harder for you.
export function bondDamageMult(fighter) {
  if (!hasBond(fighter)) return 1;
  return 1 + bondTier(fighter.bond).index * 0.03; // up to +12% at Bonded
}

// A more loyal creature is less likely to hurt itself when confused --
// it listens through the disorientation instead of panicking.
export function bondConfuseResistMult(fighter) {
  if (!hasBond(fighter)) return 1;
  return bondTier(fighter.bond).index >= 3 ? 0.6 : 1; // Trusting+
}
