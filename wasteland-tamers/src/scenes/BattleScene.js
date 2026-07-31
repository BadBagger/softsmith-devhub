import Phaser from 'phaser';
import { ensureCreatureTexture, hasRealArt, realArtFrameKeys, playerFrameKeys } from '../gen/spriteGen.js';
import { activeCreature, scavengerFighter, addToParty } from '../state/gameState.js';
import {
  resolvePoisonTick, resolvePreActionStatus, tryInflictStatus,
  STATUS_LABEL, STATUS_COLOR, STATUS_VERB,
} from '../battle/status.js';

function combatantFrames(fighterLike) {
  if (fighterLike.speciesId === 'scavenger') return playerFrameKeys();
  if (!fighterLike.strainTint && hasRealArt(fighterLike.speciesId)) return realArtFrameKeys(fighterLike.speciesId);
  return null;
}

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
    this.wild.status = null;
  }

  create() {
    this.fighter = activeCreature() ?? scavengerFighter();
    this.fighter.status = null; // statuses don't carry over between battles
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
    this.wildFrames = combatantFrames(this.wild);
    const wildTexKey = this.wildFrames ? this.wildFrames[0] : ensureCreatureTexture(this, this.wild);
    this.wildSprite = this.add.image(680, 260, wildTexKey).setScale(this.wildFrames ? 1 : 2.4);

    this.playerFrames = combatantFrames(this.fighter);
    const playerTexKey = this.playerFrames
      ? this.playerFrames[0]
      : (this.fighter.speciesId === 'scavenger' ? 'player' : ensureCreatureTexture(this, this.fighter));
    const fallbackScale = this.fighter.speciesId === 'scavenger' ? 3 : 2.4;
    this.playerSprite = this.add.image(260, 380, playerTexKey).setScale(this.playerFrames ? 1 : fallbackScale);
  }

  playFlourish(sprite, frames) {
    if (!frames) return;
    const sequence = [frames[1], frames[2], frames[3], frames[0]];
    sequence.forEach((tex, i) => {
      this.time.delayedCall(90 * (i + 1), () => sprite.setTexture(tex));
    });
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
    const statusLabel = this.add.text(width - 10, 4, '', {
      fontFamily: 'monospace', fontSize: '11px', color: STATUS_COLOR.poison,
    }).setOrigin(1, 0);
    const hpBarBg = this.add.rectangle(10, 28, width - 20, 12, 0x2a2d24).setOrigin(0, 0);
    const hpBar = this.add.rectangle(10, 28, width - 20, 12, 0x9dff5c).setOrigin(0, 0);
    const hpText = this.add.text(10, 42, `HP ${fighter.hp}/${fighter.maxHp}`, {
      fontFamily: 'monospace', fontSize: '11px', color: '#c9a876',
    });
    container.add([bg, name, statusLabel, hpBarBg, hpBar, hpText]);
    return { container, hpBar, hpText, statusLabel, maxWidth: width - 20 };
  }

  refreshPanel(panel, fighter) {
    const ratio = Phaser.Math.Clamp(fighter.hp / fighter.maxHp, 0, 1);
    panel.hpBar.width = panel.maxWidth * ratio;
    panel.hpBar.fillColor = ratio > 0.5 ? 0x9dff5c : ratio > 0.2 ? 0xe0a83a : 0xd94f2b;
    panel.hpText.setText(`HP ${Math.max(0, fighter.hp)}/${fighter.maxHp}`);
  }

  updateStatusLabel(panel, fighter) {
    if (fighter.status) {
      panel.statusLabel.setText(STATUS_LABEL[fighter.status.type]);
      panel.statusLabel.setColor(STATUS_COLOR[fighter.status.type]);
    } else {
      panel.statusLabel.setText('');
    }
  }

  // Refreshes both the HP bar and status badge for whichever combatant
  // this is (identity check picks the matching panel).
  syncPanel(who) {
    const panel = who === this.fighter ? this.playerPanel : this.wildPanel;
    this.refreshPanel(panel, who);
    this.updateStatusLabel(panel, who);
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
    this.turnLocked = true;

    const poisoned = resolvePoisonTick(this.fighter);
    if (poisoned) {
      this.log(`${this.fighter.name} takes ${poisoned.dmg} poison damage.`);
      this.syncPanel(this.fighter);
      this.time.delayedCall(700, () => {
        if (poisoned.fainted) return this.playerFaints();
        this.resolvePlayerAction();
      });
      return;
    }
    this.resolvePlayerAction();
  }

  resolvePlayerAction() {
    const pre = resolvePreActionStatus(this.fighter);
    this.syncPanel(this.fighter);
    if (pre.skip) {
      this.log(pre.message);
      this.time.delayedCall(700, () => {
        if (pre.fainted) return this.playerFaints();
        this.wildTurn();
      });
      return;
    }
    if (pre.message) {
      this.log(pre.message);
      this.time.delayedCall(500, () => this.dispatchPlayerAction());
      return;
    }
    this.dispatchPlayerAction();
  }

  dispatchPlayerAction() {
    const action = MENU_ITEMS[this.selection];
    if (action === 'ATTACK') this.doAttack();
    else if (action === 'CAPTURE') this.doCapture();
    else if (action === 'FLEE') this.doFlee();
  }

  playerFaints() {
    this.log(`${this.fighter.name} is down! You retreat to patch up.`);
    this.fighter.hp = this.fighter.maxHp;
    this.fighter.status = null;
    this.endBattle();
  }

  doAttack() {
    this.playFlourish(this.playerSprite, this.playerFrames);
    const dmg = Math.max(1, Math.round(this.fighter.atk - this.wild.def * 0.4 + Phaser.Math.Between(-2, 3)));
    this.wild.hp = Math.max(0, this.wild.hp - dmg);
    this.refreshPanel(this.wildPanel, this.wild);
    this.log(`${this.fighter.name} hits ${this.wild.name} for ${dmg}.`);

    this.time.delayedCall(700, () => {
      if (this.wild.hp <= 0) {
        this.log(`${this.wild.name} is downed! It fled into the ruins.`);
        return this.endBattle();
      }
      const inflicted = tryInflictStatus(this.fighter, this.wild);
      if (inflicted) {
        this.syncPanel(this.wild);
        this.log(`${this.wild.name} was ${STATUS_VERB[inflicted]}!`);
        return this.time.delayedCall(700, () => this.wildTurn());
      }
      this.wildTurn();
    });
  }

  doCapture() {
    const missingHpRatio = 1 - this.wild.hp / this.wild.maxHp;
    let chance = this.wild.captureRate * (0.4 + missingHpRatio);
    // A sedated or disoriented target is much easier to secure -- makes
    // Sleep/Confuse genuinely useful, not just annoying.
    if (this.wild.status?.type === 'sleep') chance *= 1.6;
    else if (this.wild.status) chance *= 1.2;
    chance = Phaser.Math.Clamp(chance, 0.05, 0.97);
    const success = Math.random() < chance;
    this.log(`Deploying CCD on ${this.wild.name}... (${Math.round(chance * 100)}% odds)`);

    this.time.delayedCall(800, () => {
      if (success) {
        const caught = { ...this.wild, status: null };
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
    const poisoned = resolvePoisonTick(this.wild);
    if (poisoned) {
      this.log(`${this.wild.name} takes ${poisoned.dmg} poison damage.`);
      this.syncPanel(this.wild);
      this.time.delayedCall(700, () => {
        if (poisoned.fainted) {
          this.log(`${this.wild.name} succumbed to the poison!`);
          return this.endBattle();
        }
        this.resolveWildAction();
      });
      return;
    }
    this.resolveWildAction();
  }

  resolveWildAction() {
    const pre = resolvePreActionStatus(this.wild);
    this.syncPanel(this.wild);
    if (pre.skip) {
      this.log(pre.message);
      this.time.delayedCall(700, () => {
        if (pre.fainted) {
          this.log(`${this.wild.name} succumbed to its wounds!`);
          return this.endBattle();
        }
        this.turnLocked = false;
      });
      return;
    }
    if (pre.message) this.log(pre.message);

    this.playFlourish(this.wildSprite, this.wildFrames);
    const dmg = Math.max(1, Math.round(this.wild.atk - this.fighter.def * 0.4 + Phaser.Math.Between(-2, 3)));
    this.fighter.hp = Math.max(0, this.fighter.hp - dmg);
    this.refreshPanel(this.playerPanel, this.fighter);
    this.log(`${this.wild.name} strikes ${this.fighter.name} for ${dmg}.`);

    this.time.delayedCall(700, () => {
      if (this.fighter.hp <= 0) return this.playerFaints();
      const inflicted = tryInflictStatus(this.wild, this.fighter);
      if (inflicted) {
        this.syncPanel(this.fighter);
        this.log(`${this.fighter.name} was ${STATUS_VERB[inflicted]}!`);
        return this.time.delayedCall(700, () => { this.turnLocked = false; });
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
