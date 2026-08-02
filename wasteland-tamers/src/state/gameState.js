// Single shared game-state singleton. This is a small standalone prototype
// so a module-level object is enough; save.js snapshots it to localStorage
// between sessions without needing Phaser registry ceremony.

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
  inventory: {}, // itemId -> count
  scrap: 18,
  world: {
    activeDistrict: 'ashvale',
    repaired: 0,
    components: [],
    completedDistricts: [],
    factionFavor: { clinic: 0, forge: 0, market: 0 },
    currentSupport: null,
    relayRestored: false,
  },
};

const DEFAULT_STATE = () => ({
  party: [], maxPartySize: 6, difficulty: 'normal', inventory: {}, scrap: 18,
  world: { activeDistrict: 'ashvale', repaired: 0, components: [], completedDistricts: [], factionFavor: { clinic: 0, forge: 0, market: 0 }, currentSupport: null, relayRestored: false },
});

export function resetGameState(snapshot = null) {
  const next = snapshot ? structuredClone(snapshot) : DEFAULT_STATE();
  Object.assign(gameState, DEFAULT_STATE(), next);
  gameState.world = { ...DEFAULT_STATE().world, ...(next.world ?? {}) };
  gameState.world.factionFavor = { ...DEFAULT_STATE().world.factionFavor, ...(next.world?.factionFavor ?? {}) };
}

export function addItem(itemId, count = 1) {
  gameState.inventory[itemId] = (gameState.inventory[itemId] ?? 0) + count;
}

export function addScrap(amount) {
  gameState.scrap = Math.max(0, (gameState.scrap ?? 0) + amount);
}

export function spendScrap(amount) {
  if ((gameState.scrap ?? 0) < amount) return false;
  gameState.scrap -= amount;
  return true;
}

export function recordDistrictVictory(districtId, scrapReward) {
  if (gameState.world.completedDistricts.includes(districtId)) return false;
  gameState.world.completedDistricts.push(districtId);
  gameState.world.components.push(districtId);
  addScrap(scrapReward);
  return true;
}

export function repairRelay(districtId, cost) {
  if (!gameState.world.components.includes(districtId) || !spendScrap(cost)) return false;
  gameState.world.components = gameState.world.components.filter((id) => id !== districtId);
  gameState.world.repaired += 1;
  if (districtId === 'dead-towers') gameState.world.relayRestored = true;
  return true;
}

export function chooseSupport(factionId) {
  gameState.world.currentSupport = factionId;
  gameState.world.factionFavor[factionId] = (gameState.world.factionFavor[factionId] ?? 0) + 1;
}

// Returns true if an item was actually removed (i.e. you had one).
export function removeItem(itemId, count = 1) {
  if (!gameState.inventory[itemId]) return false;
  gameState.inventory[itemId] -= count;
  if (gameState.inventory[itemId] <= 0) delete gameState.inventory[itemId];
  return true;
}

export function itemCount(itemId) {
  return gameState.inventory[itemId] ?? 0;
}

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
  ensureCreatureProgress(creature);
  gameState.party.push(creature);
  return true;
}

export function ensureCreatureProgress(creature) {
  if (!creature) return creature;
  creature.level ??= Math.max(1, creature.tier ?? 1);
  creature.xp ??= 0;
  creature.cooldowns ??= {};
  return creature;
}

export function gainExperience(creature, amount) {
  if (!creature?.speciesId || creature.speciesId === 'scavenger') return { leveled: false, evolved: false };
  ensureCreatureProgress(creature);
  creature.xp += amount;
  let leveled = false;
  while (creature.level < 20 && creature.xp >= creature.level * 18) {
    creature.xp -= creature.level * 18;
    creature.level += 1;
    creature.maxHp += 4;
    creature.hp = Math.min(creature.maxHp, creature.hp + 6);
    creature.atk += 2;
    creature.def += 1;
    leveled = true;
  }
  return { leveled, evolved: false };
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
