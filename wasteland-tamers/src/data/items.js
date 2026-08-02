// Consumable items. Small hand-authored set -- add an entry here and it
// shows up automatically in the General Store's scavenge pool and the
// battle Item menu, no other code changes needed. Effects are applied by
// BattleScene.doUseItem(); this file only describes what each item is.
export const ITEMS = {
  stim: {
    id: 'stim',
    name: 'Scrap Stim',
    description: "Restores half the active fighter's max HP.",
  },
  antidote: {
    id: 'antidote',
    name: 'Antidote Vial',
    description: 'Cures poison, sleep, or confusion on the active fighter.',
  },
  lure: {
    id: 'lure',
    name: 'Scavenger Lure',
    description: 'Boosts capture odds against the current target this battle.',
  },
};

export const ITEM_IDS = Object.keys(ITEMS);

export function randomItemId() {
  return ITEM_IDS[Math.floor(Math.random() * ITEM_IDS.length)];
}
