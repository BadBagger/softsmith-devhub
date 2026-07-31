// Single shared game-state singleton. This is a small standalone prototype
// (one browser tab, one save-less session) so a module-level object is
// enough -- no need for Phaser registry ceremony or a save system yet.

export const gameState = {
  party: [],
  maxPartySize: 6,
};

export function addToParty(creature) {
  if (gameState.party.length >= gameState.maxPartySize) return false;
  gameState.party.push(creature);
  return true;
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
