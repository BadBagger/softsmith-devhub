// Single shared game-state singleton. This is a small standalone prototype
// (one browser tab, one save-less session) so a module-level object is
// enough -- no need for Phaser registry ceremony or a save system yet.

export const DIFFICULTIES = {
  normal: { id: 'normal', name: 'Normal', tagline: 'Creatures faint and recover.' },
  survival: { id: 'survival', name: 'Survival', tagline: 'Wounds linger after defeat.' },
  iron: { id: 'iron', name: 'Iron Tamer', tagline: 'Defeat is permanent.' },
};
const DIFFICULTY_ORDER = ['normal', 'survival', 'iron'];

export const gameState = {
  party: [],
  maxPartySize: 6,
  difficulty: 'normal',
};

export function cycleDifficulty(delta) {
  const idx = DIFFICULTY_ORDER.indexOf(gameState.difficulty);
  const next = (idx + delta + DIFFICULTY_ORDER.length) % DIFFICULTY_ORDER.length;
  gameState.difficulty = DIFFICULTY_ORDER[next];
  return DIFFICULTIES[gameState.difficulty];
}

export function currentDifficulty() {
  return DIFFICULTIES[gameState.difficulty];
}

export function addToParty(creature) {
  if (gameState.party.length >= gameState.maxPartySize) return false;
  gameState.party.push(creature);
  return true;
}

export function removeFromParty(creature) {
  const idx = gameState.party.indexOf(creature);
  if (idx !== -1) gameState.party.splice(idx, 1);
}

export function activeCreature() {
  return gameState.party[0] ?? null;
}

// Fallback combatant when the player has no captured creatures yet --
// matches the "Survives by wit, not weight" scavenger flavor from the
// concept art rather than blocking the player from fighting at all.
export function scavengerFighter() {
  return {
    speciesId: 'scavenger',
    name: 'Scavenger (you)',
    maxHp: 50,
    hp: 50,
    atk: 10,
    def: 8,
    spd: 10,
  };
}
