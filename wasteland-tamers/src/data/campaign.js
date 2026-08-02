export const DISTRICTS = [
  {
    id: 'chemical-wash', title: 'CHEMICAL WASH', subtitle: 'Flooded runoff channels and ruptured coolant lines.',
    backgroundKey: 'bg-chemical-wash', accent: 0x9dff5c, bossSpeciesId: 'serpent-t3', bossName: 'Wyrmrot, the Wash King',
    requiredRepairs: 0, repairCost: 25, scrapReward: 35, faction: 'clinic', hazard: 'TOXIC WATER',
  },
  {
    id: 'furnace-mile', title: 'FURNACE MILE', subtitle: 'A dead industrial belt still hot beneath the ash.',
    backgroundKey: 'bg-furnace-mile', accent: 0xe07a3a, bossSpeciesId: 'titan-t3', bossName: 'Ironback, the Kiln Guard',
    requiredRepairs: 1, repairCost: 45, scrapReward: 55, faction: 'forge', hazard: 'SLAG VENTS',
  },
  {
    id: 'dead-towers', title: 'DEAD TOWERS', subtitle: 'The relay ridge. Every signal here comes with teeth.',
    backgroundKey: 'bg-dead-towers', accent: 0x8ae0d9, bossSpeciesId: 'wraith-t3', bossName: 'Deathshroud, the Signal Eater',
    requiredRepairs: 2, repairCost: 70, scrapReward: 80, faction: 'market', hazard: 'STATIC STORM',
  },
];

export const FACTIONS = {
  clinic: { name: 'ASHVALE CLINIC', reward: 'Field medkit', itemId: 'stim', description: 'Starts the next run with a medkit and reduces status trouble.' },
  forge: { name: 'FORGE CREW', reward: 'Tempered lure', itemId: 'lure', description: 'Starts the next run with a stronger capture setup.' },
  market: { name: 'PEN RUNNERS', reward: 'Antidote cache', itemId: 'antidote', description: 'Starts the next run with a cure and extra scavenging intel.' },
};

export function getDistrict(id) {
  return DISTRICTS.find((district) => district.id === id);
}
