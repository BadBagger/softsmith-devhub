// Creature data model for "The Dead Sunbelt".
//
// Roster is organized as FAMILIES (silhouette + behavior identity, like a
// Pokemon "type") x TIERS (power/evolution stage, small -> mid -> apex) x
// STRAINS (palette/trait variant, like a shiny). This keeps hand-authored
// content small (families x tiers) while strains multiply visual variety
// cheaply. Add a family or a tier entry and the rest of the game (battle,
// capture, sprite generation) picks it up automatically -- nothing here is
// hardcoded to a specific creature elsewhere.

export const FAMILIES = [
  {
    id: 'vermin',
    name: 'Vermin',
    silhouette: 'quadruped-small',
    baseColor: 0x8a9a5b,
    accentColor: 0x9dff5c,
    flavor: 'Radiation-drawn scavengers. Fast, nervous, everywhere.',
  },
  {
    id: 'hound',
    name: 'Hound',
    silhouette: 'quadruped-lean',
    baseColor: 0x6b4a3a,
    accentColor: 0xd94f2b,
    flavor: 'Pack hunters that run in numbers and wear their scars.',
  },
  {
    id: 'titan',
    name: 'Titan',
    silhouette: 'quadruped-armored',
    baseColor: 0x5a5f52,
    accentColor: 0xb08a4a,
    flavor: 'Slow, plated relics of the old world. Rare and unstoppable.',
  },
  {
    id: 'swarm',
    name: 'Swarm',
    silhouette: 'insectoid',
    baseColor: 0x7a6a2a,
    accentColor: 0xd9c53a,
    flavor: 'Hive mutants. Never alone, never quiet.',
  },
  {
    id: 'serpent',
    name: 'Serpent',
    silhouette: 'sinuous',
    baseColor: 0x4a6a4a,
    accentColor: 0x5be08a,
    flavor: 'Irradiated reptiles that hunt low and strike fast.',
  },
  {
    id: 'avian',
    name: 'Avian',
    silhouette: 'winged',
    baseColor: 0x8a7a6a,
    accentColor: 0xe0c08a,
    flavor: 'Scrap-feathered scavengers that nest in dead towers.',
  },
  {
    id: 'sludge',
    name: 'Sludge',
    silhouette: 'blob',
    baseColor: 0x5a7a3a,
    accentColor: 0xb8ff4a,
    flavor: 'Chemical runoff given a body. Slow, corrosive, patient.',
  },
  {
    id: 'wraith',
    name: 'Wraith',
    silhouette: 'wisp',
    baseColor: 0x4a5a5a,
    accentColor: 0x8ae0d9,
    flavor: 'Toxic gas apparitions from places the maps refuse to name.',
  },
];

export const STRAINS = [
  { id: 'baseline', name: '', tint: null, statMult: 1.0 },
  { id: 'irradiated', name: 'Irradiated', tint: 0x9dff5c, statMult: 1.05 },
  { id: 'chemical', name: 'Chemical', tint: 0xb84fe0, statMult: 1.05 },
  { id: 'ashen', name: 'Ashen', tint: 0xbfbfbf, statMult: 1.05 },
];

// tier 1 = small/common, 2 = mid, 3 = apex/rare
const TIER_STAT_BASE = {
  1: { hp: 32, atk: 9, def: 7, spd: 12, captureRate: 0.75 },
  2: { hp: 78, atk: 18, def: 15, spd: 16, captureRate: 0.4 },
  3: { hp: 168, atk: 30, def: 26, spd: 14, captureRate: 0.15 },
};

// Hand-authored species per family/tier. Names for vermin/hound/titan tier
// picks match the concept art sheet (Glowmite, Scraphowler, Ironback Titan).
const SPECIES_BY_FAMILY = {
  vermin: ['Glowmite', 'Radrat', 'Plaguefang'],
  hound: ['Snarlpup', 'Scraphowler', 'Diremaw'],
  titan: ['Rustling', 'Ironhide', 'Ironback Titan'],
  swarm: ['Buzzmite', 'Hiveborn', 'Broodqueen'],
  serpent: ['Sandviper', 'Toxicoil', 'Wyrmrot'],
  avian: ['Featherscrap', 'Rustwing', 'Skytearer'],
  sludge: ['Ooze', 'Sludgecrawler', 'Tarbehemoth'],
  wraith: ['Whisp', 'Fumewraith', 'Deathshroud'],
};

function buildSpecies() {
  const species = [];
  for (const family of FAMILIES) {
    const names = SPECIES_BY_FAMILY[family.id];
    names.forEach((name, index) => {
      const tier = index + 1;
      const base = TIER_STAT_BASE[tier];
      species.push({
        id: `${family.id}-t${tier}`,
        name,
        familyId: family.id,
        tier,
        evolvesToId: index < names.length - 1 ? `${family.id}-t${tier + 1}` : null,
        stats: { ...base },
      });
    });
  }
  return species;
}

export const SPECIES = buildSpecies();

export function getFamily(familyId) {
  return FAMILIES.find((f) => f.id === familyId);
}

export function getSpecies(speciesId) {
  return SPECIES.find((s) => s.id === speciesId);
}

// Instantiate a live creature (wild or owned) from a species id, optionally
// with a strain. This is the "hundreds of variations" surface: every
// species x strain combo is a distinct-looking, distinct-statted creature
// without needing new hand-drawn art per combo.
export function spawnCreature(speciesId, strainId = 'baseline') {
  const species = getSpecies(speciesId);
  const family = getFamily(species.familyId);
  const strain = STRAINS.find((s) => s.id === strainId) ?? STRAINS[0];
  const mult = strain.statMult;
  const displayName = strain.name ? `${strain.name} ${species.name}` : species.name;
  return {
    speciesId,
    name: displayName,
    familyId: family.id,
    silhouette: family.silhouette,
    baseColor: family.baseColor,
    accentColor: family.accentColor,
    strainTint: strain.tint,
    tier: species.tier,
    evolvesToId: species.evolvesToId,
    captureRate: species.stats.captureRate,
    maxHp: Math.round(species.stats.hp * mult),
    hp: Math.round(species.stats.hp * mult),
    atk: Math.round(species.stats.atk * mult),
    def: Math.round(species.stats.def * mult),
    spd: Math.round(species.stats.spd * mult),
  };
}

export function randomWildSpecies(maxTier = 2) {
  const pool = SPECIES.filter((s) => s.tier <= maxTier);
  return pool[Math.floor(Math.random() * pool.length)];
}

export function randomStrain() {
  // Baseline is intentionally the most common outcome.
  const roll = Math.random();
  if (roll < 0.7) return 'baseline';
  const rest = STRAINS.filter((s) => s.id !== 'baseline');
  return rest[Math.floor(Math.random() * rest.length)].id;
}
