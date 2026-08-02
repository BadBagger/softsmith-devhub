// Shared per-building data. TownMapScene uses title/key for building
// signage on the walkable map; TownScene (the building interior) uses
// flavor/action for the screen you see once you walk inside. Keyed by id
// rather than array index since TownMapScene places buildings by id too.
export const TOWN_LOCATIONS = {
  'town-square': {
    id: 'town-square',
    key: 'bg-town-town-square',
    title: 'TOWN SQUARE',
    flavor: 'The notice board is thick with bounty scraps and warnings about the scrub patches to the east.',
    action: 'read',
  },
  'general-store': {
    id: 'general-store',
    key: 'bg-town-general-store',
    title: 'GENERAL STORE',
    flavor: "Shelves picked half-clean, but the trader still swears every bottle is \"probably fine.\"",
    action: 'trade',
  },
  'infirmary': {
    id: 'infirmary',
    key: 'bg-town-infirmary',
    title: 'INFIRMARY',
    flavor: 'A medic tent lit by lantern-glow. Tired work, but the beds are clean.',
    action: 'rest',
  },
  'forge': {
    id: 'forge',
    key: 'bg-town-forge',
    title: 'THE FORGE',
    flavor: "Sparks and hammer-fall. Somewhere under that scaffolding a titan is getting new plating.",
    action: 'tune',
  },
  'creature-market': {
    id: 'creature-market',
    key: 'bg-town-creature-market',
    title: 'CREATURE PENS',
    flavor: "Tamers haggling over stock. A broker will trade field supplies for clean scrap.",
    action: 'scavenge',
  },
};

export const NOTICES = [
  'BOUNTY: Diremaw pack denning near the eastern rubble. Multiple confirmed. Approach with backup.',
  'WARNING: Toxicoil sightings up in the southern scrub. Carry antidote scrap if you have it.',
  "WANTED: A live Broodqueen specimen for the forge crew. Pay is good if you can keep it sedated.",
  'NOTICE: Infirmary lantern oil running low. Scrap collectors passing through, the medic is buying.',
  "RUMOR: Something apex-tier dens past the dead towers. Nobody who's gone looking has confirmed it.",
];
