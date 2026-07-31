import Phaser from 'phaser';
import { ensureCreatureTexture } from '../gen/spriteGen.js';
import { activeCreature, scavengerFighter, addToParty } from '../state/gameState.js';

const MENU_ITEMS = ['ATTACK', 'CAPTURE', 'FLEE'];
const TERMINAL_GREEN = '#9dff5c';
const AMBER = '#e0a83a';
const PANEL_BG = 0x141712;

export class BattleScene extends Phaser.Scene {
  constructor() {
    super('BattleScene');
  }

  init(data) {
    this.wild = data.wild;
    this.wild.hp = this.wild.maxHp; // wild creatures always enter at full health
  }

  create() {
    this.fighter = activeCreature() ?? scavengerFighter();
    this.selection = 0;
    this.turnLocked = false;
    this.ended = false;

    this.buildBackdrop();
    this.buildCombatants();
    this.buildHud();
    this.buildMenu();
    this.log(`A wild ${this.wild.name} appears!`);

    this.input.keyboard.on('keydown-UP', () => this.moveSelection(-1));
    this.input.keyboard.on('keydown-DOWN', () => this.moveSelection(1));
    this.input.keyboard.on('keydown-ENTER', () => this.confirmSelection());
    this.input.keyboard.on('keydown-SPACE', () => this.confirmSelection());
  }

  buildBackdrop() {
    this.add.rectangle(480, 320, 960, 640, 0x0c0d0a, 1);
    this.add.rectangle(480, 320, 920, 600, PANEL_BG, 1).setStrokeStyle(2, 0x3a3d3c);
    this.add.text(480, 20, `SCAVCOMM MK.II — BATTLE`, {
      fontFamily: 'monospace', fontSize: '14px', color: AMBER,
    }).setOrigin(0.5, 0);
  }

  buildCombatants() {
    this.wildTextureKey = ensureCreatureTexture(this, this.wild);
    this.wildSprite = this.add.image(680, 220, this.wildTextureKey).setScale(2.4);

    const playerTexKey = this.fighter.speciesId === 'scavenger'
      ? 'player'
      : ensureCreatureTexture(this, this.fighter);
    this.playerSprite = this.add.image(260, 380, playerTexKey).setScale(this.fighter.speciesId === 'scavenger' ? 3 : 2.4);
  }

  buildHud() {
    this.playerPanel = this.buildFighterPanel(40, 60, this.fighter);
    this.wildPanel = this.buildFighterPanel(560, 60, this.wild, true);
  }

  buildFighterPanel(x, y, fighter, alignRight = false) {
    const width = 340;
    const container = this.add.container(x, y);
    const bg = this.add.rectangle(0, 0, width, 60, 0x1c2018, 0.9)
      .setOrigin(0, 0).setStrokeStyle(1, 0x3a3d3c);
    const name = this.add.text(10, 4, fighter.name.toUpperCase(), {
      fontFamily: 'monospace', fontSize: '13px', color: TERMINAL_GREEN,
    });
    const hpBarBg = this.add.rectangle(10, 28, width - 20, 12, 0x2a2d24).setOrigin(0, 0);
    const hpBar = this.add.rectangle(10, 28, width - 20, 12, 0x9dff5c).setOrigin(0, 0);
    const hpText = this.add.text(10, 42, `HP ${fighter.hp}/${fighter.maxHp}`, {
      fontFamily: 'monospace', fontSize: '11px', color: '#c9a876',
    });
    container.add([bg, name, hpBarBg, hpBar, hpText]);
    return { container, hpBar, hpText, maxWidth: width - 20 };
  }

  refreshPanel(panel, fighter) {
    const ratio = Phaser.Math.Clamp(fighter.hp / fighter.maxHp, 0, 1);
    panel.hpBar.width = panel.maxWidth * ratio;
    panel.hpBar.fillColor = ratio > 0.5 ? 0x9dff5c : ratio > 0.2 ? 0xe0a83a : 0xd94f2b;
    panel.hpText.setText(`HP ${Math.max(0, fighter.hp)}/${fighter.maxHp}`);
  }

  buildMenu() {
    this.logText = this.add.text(40, 460, '', {
      fontFamily: 'monospace', fontSize: '13px', color: TERMINAL_GREEN,
      wordWrap: { width: 880 },
    });

    this.menuTexts = MENU_ITEMS.map((label, i) => {
      const t = this.add.text(60, 540 + i * 24, label, {
        fontFamily: 'monospace', fontSize: '15px', color: '#c9a876',
      }).setInteractive({ useHandCursor: true });
      t.on('pointerover', () => { this.selection = i; this.renderMenu(); });
      t.on('pointerdown', () => this.confirmSelection());
      return t;
    });
    this.renderMenu();
  }

  renderMenu() {
    this.menuTexts.forEach((t, i) => {
      const active = i === this.selection;
      t.setColor(active ? AMBER : '#c9a876');
      t.setText(`${active ? '>' : ' '} ${MENU_ITEMS[i]}`);
    });
  }

  moveSelection(delta) {
    if (this.turnLocked || this.ended) return;
    this.selection = (this.selection + delta + MENU_ITEMS.length) % MENU_ITEMS.length;
    this.renderMenu();
  }

  log(msg) {
    this.logText.setText(msg);
  }

  confirmSelection() {
    if (this.turnLocked || this.ended) return;
    const action = MENU_ITEMS[this.selection];
    if (action === 'ATTACK') this.doAttack();
    else if (action === 'CAPTURE') this.doCapture();
    else if (action === 'FLEE') this.doFlee();
  }

  doAttack() {
    this.turnLocked = true;
    const dmg = Math.max(1, Math.round(this.fighter.atk - this.wild.def * 0.4 + Phaser.Math.Between(-2, 3)));
    this.wild.hp = Math.max(0, this.wild.hp - dmg);
    this.refreshPanel(this.wildPanel, this.wild);
    this.log(`${this.fighter.name} hits ${this.wild.name} for ${dmg}.`);

    this.time.delayedCall(700, () => {
      if (this.wild.hp <= 0) {
        this.log(`${this.wild.name} is downed! It fled into the ruins.`);
        return this.endBattle();
      }
      this.wildTurn();
    });
  }

  doCapture() {
    this.turnLocked = true;
    const missingHpRatio = 1 - this.wild.hp / this.wild.maxHp;
    const chance = Phaser.Math.Clamp(this.wild.captureRate * (0.4 + missingHpRatio), 0.05, 0.95);
    const success = Math.random() < chance;
    this.log(`Deploying CCD on ${this.wild.name}... (${Math.round(chance * 100)}% odds)`);

    this.time.delayedCall(800, () => {
      if (success) {
        const caught = { ...this.wild };
        const added = addToParty(caught);
        this.log(added
          ? `${this.wild.name} was captured and joins your party!`
          : `${this.wild.name} was captured, but your party is full — it was released nearby.`);
        return this.endBattle();
      }
      this.log(`${this.wild.name} broke free of the CCD!`);
      this.wildTurn();
    });
  }

  doFlee() {
    this.turnLocked = true;
    const chance = 0.5 + (this.fighter.spd - this.wild.spd) * 0.02;
    const success = Math.random() < Phaser.Math.Clamp(chance, 0.15, 0.95);
    this.time.delayedCall(400, () => {
      if (success) {
        this.log('You slip back into the ruins.');
        return this.endBattle();
      }
      this.log('Could not get away!');
      this.wildTurn();
    });
  }

  wildTurn() {
    const dmg = Math.max(1, Math.round(this.wild.atk - this.fighter.def * 0.4 + Phaser.Math.Between(-2, 3)));
    this.fighter.hp = Math.max(0, this.fighter.hp - dmg);
    this.refreshPanel(this.playerPanel, this.fighter);
    this.log(`${this.wild.name} strikes ${this.fighter.name} for ${dmg}.`);

    this.time.delayedCall(700, () => {
      if (this.fighter.hp <= 0) {
        this.log(`${this.fighter.name} is down! You retreat to patch up.`);
        this.fighter.hp = this.fighter.maxHp; // no permadeath in this prototype
        return this.endBattle();
      }
      this.turnLocked = false;
    });
  }

  endBattle() {
    this.ended = true;
    this.time.delayedCall(1400, () => {
      this.scene.stop();
      this.scene.wake('OverworldScene');
    });
  }
}
