const FAMILY_MOVES = {
  vermin: ['SCRAP BITE', 'RADIANT DART', 'SCOUR', 'PACK FRENZY'],
  hound: ['RIP', 'HOWL', 'HAMSTRING', 'BONE RUSH'],
  titan: ['RAM', 'PLATE UP', 'GROUND SHOCK', 'KILN BREAKER'],
  swarm: ['STING', 'BUZZ SCREEN', 'DISORIENT', 'HIVE CRASH'],
  serpent: ['FANG', 'ACID SPIT', 'COIL', 'WASTE WAVE'],
  avian: ['TALON', 'DIVE', 'DUST CLOUD', 'SKYFALL'],
  sludge: ['SLAM', 'CORRODE', 'OIL SLICK', 'SEPTIC TIDE'],
  wraith: ['CHILL', 'STATIC PULSE', 'DROWSING FOG', 'BLACKOUT'],
};

const EFFECT_BY_FAMILY = {
  vermin: 'poison', swarm: 'confuse', serpent: 'poison', sludge: 'poison', wraith: 'sleep',
};

export function movesForCreature(creature) {
  const names = FAMILY_MOVES[creature.familyId] ?? FAMILY_MOVES.vermin;
  const effect = EFFECT_BY_FAMILY[creature.familyId] ?? null;
  return [
    { id: `${creature.familyId}-basic`, name: names[0], power: 1.0, accuracy: 1, cooldown: 0, unlockLevel: 1 },
    { id: `${creature.familyId}-tech`, name: names[1], power: 1.35, accuracy: 0.92, cooldown: 1, unlockLevel: 4 },
    { id: `${creature.familyId}-control`, name: names[2], power: 0.75, accuracy: 0.88, cooldown: 2, unlockLevel: 8, status: effect ?? 'confuse' },
    { id: `${creature.familyId}-capstone`, name: names[3], power: 2.0, accuracy: 0.78, cooldown: 3, unlockLevel: 14 },
  ];
}

export function knownMovesFor(creature) {
  const level = creature.level ?? 1;
  return movesForCreature(creature).filter((move) => move.unlockLevel <= level);
}
