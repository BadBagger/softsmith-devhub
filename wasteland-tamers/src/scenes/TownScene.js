import Phaser from 'phaser';
import { gameState } from '../state/gameState.js';
import { makeButton } from '../ui/button.js';

// Order chosen so INFIRMARY (the only location with a real action right
// now) isn't the first thing the player sees -- makes the town feel like
// a place rather than a single-purpose menu.
const LOCATIONS = [
  {
    key: 'bg-town-town-square',
    title: 'TOWN SQUARE',
    flavor: 'The notice board is thick with bounty scraps and warnings about the scrub patches to the east.',
  },
  {
    key: 'bg-town-general-store',
    title: 'GENERAL STORE',
    flavor: "Shelves picked half-clean, but the trader still swears every bottle is \"probably fine.\"",
  },
  {
    key: 'bg-town-infirmary',
    title: 'INFIRMARY',
    flavor: 'A medic tent lit by lantern-glow. Tired work, but the beds are clean.',
    action: 'rest',
  },
  {
    key: 'bg-town-forge',
    title: 'THE FORGE',
    flavor: "Sparks and hammer-fall. Somewhere under that scaffolding a titan is getting new plating.",
  },
  {
    key: 'bg-town-creature-market',
    title: 'CREATURE PENS',
    flavor: "Tamers haggling over stock. None of it's for sale to you -- yet.",
  },
];

export class TownScene extends Phaser.Scene {
  constructor() {
    super('TownScene');
  }

  create() {
    this.locIndex = 0;

    this.backdrop = this.add.image(480, 320, LOCATIONS[0].key);
    this.fitBackdrop();

    this.add.rectangle(480, 320, 960, 640, 0x0c0d0a, 0).setDepth(0);

    this.add.rectangle(0, 0, 960, 48, 0x0c0d0a, 0.85)
      .setOrigin(0, 0).setDepth(10);
    this.titleText = this.add.text(10, 6, '', {
      fontFamily: 'monospace', fontSize: '18px', color: '#e0a83a', fontStyle: 'bold',
    }).setDepth(11);
    this.pageText = this.add.text(950, 6, '', {
      fontFamily: 'monospace', fontSize: '12px', color: '#c9a876',
    }).setOrigin(1, 0).setDepth(11);

    this.add.rectangle(0, 564, 960, 76, 0x0c0d0a, 0.85)
      .setOrigin(0, 0).setDepth(10);
    this.flavorText = this.add.text(10, 572, '', {
      fontFamily: 'monospace', fontSize: '12px', color: '#9dff5c', wordWrap: { width: 940 },
    }).setDepth(11);
    this.actionHint = this.add.text(950, 594, '', {
      fontFamily: 'monospace', fontSize: '11px', color: '#e0a83a',
    }).setOrigin(1, 0).setDepth(11);

    makeButton(this, 35, 610, '◀', () => this.cycle(-1), { width: 40, height: 34, depth: 12 });
    makeButton(this, 85, 610, '▶', () => this.cycle(1), { width: 40, height: 34, depth: 12 });
    this.actionBtn = makeButton(this, 480, 610, '', () => this.runAction(), { width: 220, height: 34, depth: 12 });
    makeButton(this, 900, 610, 'LEAVE', () => this.leaveTown(), { width: 90, height: 34, depth: 12 });

    this.renderLocation();

    this.input.keyboard.on('keydown-LEFT', () => this.cycle(-1));
    this.input.keyboard.on('keydown-RIGHT', () => this.cycle(1));
    this.input.keyboard.on('keydown-ENTER', () => this.runAction());
    this.input.keyboard.on('keydown-SPACE', () => this.runAction());
    this.input.keyboard.on('keydown-ESC', () => this.leaveTown());
  }

  fitBackdrop() {
    const scale = Math.max(960 / this.backdrop.width, 640 / this.backdrop.height);
    this.backdrop.setScale(scale);
  }

  cycle(delta) {
    this.locIndex = (this.locIndex + delta + LOCATIONS.length) % LOCATIONS.length;
    this.backdrop.setTexture(LOCATIONS[this.locIndex].key);
    this.fitBackdrop();
    this.renderLocation();
  }

  renderLocation() {
    const loc = LOCATIONS[this.locIndex];
    this.titleText.setText(loc.title);
    this.pageText.setText(`< ${this.locIndex + 1}/${LOCATIONS.length} >   ESC to leave town`);
    this.flavorText.setText(loc.flavor);

    const hasAction = loc.action === 'rest';
    this.actionHint.setText(hasAction ? 'ENTER or tap REST to rest the party' : '');
    this.actionBtn.text.setText(hasAction ? 'REST' : '');
    this.actionBtn.bg.setVisible(hasAction);
  }

  runAction() {
    const loc = LOCATIONS[this.locIndex];
    if (loc.action !== 'rest') return;

    let healed = 0;
    for (const creature of gameState.party) {
      if (creature.hp < creature.maxHp || creature.status) healed += 1;
      creature.hp = creature.maxHp;
      creature.status = null;
    }
    this.flavorText.setText(
      healed > 0
        ? `The medic patches up the party. ${healed} creature(s) fully rested.`
        : 'The party is already in fighting shape.',
    );
  }

  leaveTown() {
    this.scene.stop();
    this.scene.wake('OverworldScene');
  }
}
