import Phaser from 'phaser';
import { ensureCreatureTexture, hasRealArt, realArtFrameKeys, playerFrameKeys } from '../gen/spriteGen.js';
import {
  activeCreature, scavengerFighter, addToParty, removeFromParty, gameState,
  itemCount, removeItem,
} from '../state/gameState.js';
import {
  resolvePoisonTick, resolvePreActionStatus, tryInflictStatus,
  STATUS_LABEL, STATUS_COLOR, STATUS_VERB,
} from '../battle/status.js';
import { BASE_BOND, hasBond, bondTier, adjustBond, bondDamageMult, bondConfuseResistMult } from '../state/bond.js';
import { SFX, BGM, playSfx, playMusic, stopMusic } from '../audio/sound.js';
import { ITEMS, ITEM_IDS } from '../data/items.js';
import { makeButton } from '../ui/button.js';

function combatantFrames(fighterLike) {
  if (fighterLike.speciesId === 'scavenger') return playerFrameKeys();
  if (!fighterLike.strainTint && hasRealArt(fighterLike.speciesId)) return realArtFrameKeys(fighterLike.speciesId);
  return null;
}

const MENU_ITEMS = ['ATTACK', 'CAPTURE', 'FLEE', 'ITEM'];
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
    this.captureBoost = null;

    this.buildBackdrop();
    this.buildCombatants();
    this.buildHud();
    this.buildMenu();
    this.buildItemPicker();
    this.syncPanel(this.fighter);
    this.syncPanel(this.wild);
    this.log(`A wild ${this.wild.name} appears!`);
    playSfx(this, SFX.battleStart, 0.7);
    playMusic(this, BGM.battle, 0.3);

    this.input.keyboard.on('keydown-UP', () => (this.itemPickerOpen ? this.moveItemSelection(-1) : this.moveSelection(-1)));
    this.input.keyboard.on('keydown-DOWN', () => (this.itemPickerOpen ? this.moveItemSelection(1) : this.moveSelection(1)));
    this.input.keyboard.on('keydown-ENTER', () => (this.itemPickerOpen ? this.confirmItemSelection() : this.confirmSelection()));
    this.input.keyboard.on('keydown-SPACE', () => (this.itemPickerOpen ? this.confirmItemSelection() : this.confirmSelection()));
    this.input.keyboard.on('keydown-ESC', () => { if (this.itemPickerOpen) this.closeItemPicker(); });
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
    const statusIcon = this.add.image(width - 20, 15, 'icon-status-poison')
      .setDisplaySize(22, 22).setVisible(false);
    const statusLabel = this.add.text(width - 34, 4, '', {
      fontFamily: 'monospace', fontSize: '11px', color: STATUS_COLOR.poison,
    }).setOrigin(1, 0);
    const hpBarBg = this.add.rectangle(10, 28, width - 20, 12, 0x2a2d24).setOrigin(0, 0);
    const hpBar = this.add.rectangle(10, 28, width - 20, 12, 0x9dff5c).setOrigin(0, 0);
    const hpText = this.add.text(10, 42, `HP ${fighter.hp}/${fighter.maxHp}`, {
      fontFamily: 'monospace', fontSize: '11px', color: '#c9a876',
    });
    const bondLabel = this.add.text(width - 10, 42, '', {
      fontFamily: 'monospace', fontSize: '10px', color: AMBER,
    }).setOrigin(1, 0);
    container.add([bg, name, statusIcon, statusLabel, hpBarBg, hpBar, hpText, bondLabel]);
    return { container, hpBar, hpText, statusLabel, statusIcon, bondLabel, maxWidth: width - 20 };
  }

  refreshPanel(panel, fighter) {
    const ratio = Phaser.Math.Clamp(fighter.hp / fighter.maxHp, 0, 1);
    panel.hpBar.width = panel.maxWidth * ratio;
    panel.hpBar.fillColor = ratio > 0.5 ? 0x9dff5c : ratio > 0.2 ? 0xe0a83a : 0xd94f2b;
    panel.hpText.setText(`HP ${Math.max(0, fighter.hp)}/${fighter.maxHp}`);
  }

  updateStatusLabel(panel, fighter) {
    if (fighter.status) {
      const type = fighter.status.type;
      panel.statusLabel.setText(STATUS_LABEL[type]);
      panel.statusLabel.setColor(STATUS_COLOR[type]);
      panel.statusIcon.setTexture(`icon-status-${type}`).setVisible(true);
    } else {
      panel.statusLabel.setText('');
      panel.statusIcon.setVisible(false);
    }
  }

  updateBondLabel(panel, fighter) {
    if (hasBond(fighter)) {
      panel.bondLabel.setText(`BOND: ${bondTier(fighter.bond).name.toUpperCase()} (${fighter.bond})`);
    } else {
      panel.bondLabel.setText('');
    }
  }

  // Refreshes the HP bar, status badge, and bond badge for whichever
  // combatant this is (identity check picks the matching panel).
  syncPanel(who) {
    const panel = who === this.fighter ? this.playerPanel : this.wildPanel;
    this.refreshPanel(panel, who);
    this.updateStatusLabel(panel, who);
    this.updateBondLabel(panel, who);
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
      // Touch has no hover state, so pointerdown must set the selection
      // itself rather than relying on pointerover having already fired --
      // otherwise a tap could confirm whatever was last selected instead
      // of the item actually tapped.
      t.on('pointerdown', () => {
        this.selection = i;
        this.renderMenu();
        this.confirmSelection();
      });
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

  buildItemPicker() {
    this.itemPickerOpen = false;
    this.itemSelection = 0;

    this.itemOverlay = this.add.rectangle(480, 320, 960, 640, 0x0c0d0a, 0.8)
      .setDepth(50).setInteractive().on('pointerdown', () => this.closeItemPicker());
    this.itemFrame = this.add.image(480, 320, 'ui-inventory-frame').setDepth(51);
    this.itemFrame.setScale(620 / this.itemFrame.width);
    this.itemTitleText = this.add.text(480, 130, 'USE WHICH ITEM?', {
      fontFamily: 'monospace', fontSize: '16px', color: AMBER, fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(52);
    this.itemRowTexts = ITEM_IDS.map((id, i) => this.add.text(480, 190 + i * 26, '', {
      fontFamily: 'monospace', fontSize: '14px', color: '#2a2410',
    }).setOrigin(0.5).setDepth(52).setInteractive({ useHandCursor: true }));
    this.itemDescText = this.add.text(480, 300, '', {
      fontFamily: 'monospace', fontSize: '11px', color: '#4a3f28', align: 'center', wordWrap: { width: 460 },
    }).setOrigin(0.5).setDepth(52);
    this.itemEmptyText = this.add.text(480, 220, 'No items to use.', {
      fontFamily: 'monospace', fontSize: '14px', color: '#4a3f28',
    }).setOrigin(0.5).setDepth(52);
    this.itemCancelBtn = makeButton(this, 480, 400, 'CANCEL', () => this.closeItemPicker(), { width: 120, height: 34, depth: 52 });

    this.itemRowTexts.forEach((t, i) => {
      t.on('pointerover', () => { this.itemSelection = i; this.renderItemPicker(); });
      t.on('pointerdown', () => { this.itemSelection = i; this.renderItemPicker(); this.confirmItemSelection(); });
    });

    this.setItemPickerVisible(false);
  }

  setItemPickerVisible(visible) {
    this.itemPickerOpen = visible;
    this.itemOverlay.setVisible(visible);
    this.itemFrame.setVisible(visible);
    this.itemTitleText.setVisible(visible);
    this.itemDescText.setVisible(visible);
    this.itemCancelBtn.bg.setVisible(visible);
    this.itemCancelBtn.text.setVisible(visible);
    if (!visible) {
      this.itemRowTexts.forEach((t) => t.setVisible(false));
      this.itemEmptyText.setVisible(false);
    }
  }

  ownedItemIds() {
    return ITEM_IDS.filter((id) => itemCount(id) > 0);
  }

  openItemPicker() {
    this.itemSelection = 0;
    this.setItemPickerVisible(true);
    this.renderItemPicker();
  }

  closeItemPicker() {
    this.setItemPickerVisible(false);
  }

  renderItemPicker() {
    const owned = this.ownedItemIds();
    this.itemEmptyText.setVisible(owned.length === 0);
    this.itemDescText.setText(owned.length === 0 ? '' : ITEMS[owned[this.itemSelection]].description);

    this.itemRowTexts.forEach((t, i) => {
      const id = owned[i];
      if (!id) return t.setVisible(false);
      const active = i === this.itemSelection;
      t.setVisible(true);
      t.setColor(active ? AMBER : '#2a2410');
      t.setText(`${active ? '>' : ' '} ${ITEMS[id].name} x${itemCount(id)}`);
    });
  }

  moveItemSelection(delta) {
    const owned = this.ownedItemIds();
    if (owned.length === 0) return;
    this.itemSelection = (this.itemSelection + delta + owned.length) % owned.length;
    this.renderItemPicker();
  }

  confirmItemSelection() {
    const owned = this.ownedItemIds();
    const itemId = owned[this.itemSelection];
    if (!itemId) return;
    this.closeItemPicker();
    this.beginTurn(() => this.doUseItem(itemId));
  }

  doUseItem(itemId) {
    removeItem(itemId);
    if (itemId === 'stim') {
      const healed = Math.round(this.fighter.maxHp * 0.5);
      this.fighter.hp = Math.min(this.fighter.maxHp, this.fighter.hp + healed);
      this.syncPanel(this.fighter);
      this.log(`${this.fighter.name} uses ${ITEMS.stim.name} and recovers ${healed} HP.`);
    } else if (itemId === 'antidote') {
      const cured = !!this.fighter.status;
      this.fighter.status = null;
      this.syncPanel(this.fighter);
      this.log(cured
        ? `${this.fighter.name} uses ${ITEMS.antidote.name} and clears up.`
        : `${this.fighter.name} uses ${ITEMS.antidote.name}, but nothing was wrong.`);
    } else if (itemId === 'lure') {
      this.captureBoost = 1.25;
      this.log(`You toss out ${ITEMS.lure.name} -- ${this.wild.name} seems more approachable.`);
    }
    this.time.delayedCall(700, () => this.wildTurn());
  }

  confirmSelection() {
    if (this.turnLocked || this.ended) return;
    if (MENU_ITEMS[this.selection] === 'ITEM') return this.openItemPicker();
    this.beginTurn(() => this.dispatchPlayerAction());
  }

  // Shared "start of the player's turn" sequence -- poison tick, then the
  // sleep/confuse pre-action check -- shared by both picking a battle menu
  // action directly and committing to an item from the Item picker. Opening
  // the picker itself (see openItemPicker) happens *before* this, so
  // backing out of it costs nothing; only actually using an item does.
  beginTurn(afterStatusChecks) {
    this.turnLocked = true;

    const poisoned = resolvePoisonTick(this.fighter);
    if (poisoned) {
      this.log(`${this.fighter.name} takes ${poisoned.dmg} poison damage.`);
      this.syncPanel(this.fighter);
      this.time.delayedCall(700, () => {
        if (poisoned.fainted) return this.playerFaints();
        this.resolvePlayerAction(afterStatusChecks);
      });
      return;
    }
    this.resolvePlayerAction(afterStatusChecks);
  }

  resolvePlayerAction(afterStatusChecks) {
    const pre = resolvePreActionStatus(this.fighter, bondConfuseResistMult(this.fighter));
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
      this.time.delayedCall(500, () => afterStatusChecks());
      return;
    }
    afterStatusChecks();
  }

  dispatchPlayerAction() {
    const action = MENU_ITEMS[this.selection];
    if (action === 'ATTACK') this.doAttack();
    else if (action === 'CAPTURE') this.doCapture();
    else if (action === 'FLEE') this.doFlee();
  }

  playerFaints() {
    // Difficulty only puts a captured creature's fate at stake -- the bare-
    // handed scavenger fallback always just retreats and patches up, since
    // there's no creature there to wound or lose.
    const isPartyCreature = hasBond(this.fighter);
    const difficulty = gameState.difficulty;

    if (isPartyCreature && difficulty === 'iron') {
      this.log(`${this.fighter.name} goes down and doesn't get back up. It's gone.`);
      removeFromParty(this.fighter);
      return this.endBattle();
    }

    if (isPartyCreature && difficulty === 'survival') {
      this.log(`${this.fighter.name} is down! You retreat to patch up — it won't be back to full strength for a while.`);
      adjustBond(this.fighter, -10);
      this.fighter.hp = Math.max(1, Math.round(this.fighter.maxHp * 0.5));
      this.fighter.status = null;
      this.syncPanel(this.fighter);
      return this.endBattle();
    }

    this.log(`${this.fighter.name} is down! You retreat to patch up.`);
    adjustBond(this.fighter, -6);
    this.fighter.hp = this.fighter.maxHp;
    this.fighter.status = null;
    this.syncPanel(this.fighter);
    this.endBattle();
  }

  wildFainted(message) {
    this.log(message);
    adjustBond(this.fighter, 8);
    this.syncPanel(this.fighter);
    this.endBattle();
  }

  doAttack() {
    this.playFlourish(this.playerSprite, this.playerFrames);
    playSfx(this, SFX.attackHit);
    const rawDmg = Math.max(1, Math.round(this.fighter.atk - this.wild.def * 0.4 + Phaser.Math.Between(-2, 3)));
    const dmg = Math.max(1, Math.round(rawDmg * bondDamageMult(this.fighter)));
    this.wild.hp = Math.max(0, this.wild.hp - dmg);
    this.refreshPanel(this.wildPanel, this.wild);
    this.log(`${this.fighter.name} hits ${this.wild.name} for ${dmg}.`);

    this.time.delayedCall(700, () => {
      if (this.wild.hp <= 0) {
        return this.wildFainted(`${this.wild.name} is downed! It fled into the ruins.`);
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
    if (this.captureBoost) chance *= this.captureBoost;
    this.captureBoost = null; // one shot -- spent whether or not the capture lands
    chance = Phaser.Math.Clamp(chance, 0.05, 0.97);
    const success = Math.random() < chance;
    this.log(`Deploying CCD on ${this.wild.name}... (${Math.round(chance * 100)}% odds)`);

    this.time.delayedCall(800, () => {
      if (success) {
        const caught = { ...this.wild, status: null, bond: BASE_BOND };
        const added = addToParty(caught);
        adjustBond(this.fighter, 3);
        this.syncPanel(this.fighter);
        playSfx(this, SFX.captureSuccess, 0.7);
        this.log(added
          ? `${this.wild.name} was captured and joins your party!`
          : `${this.wild.name} was captured, but your party is full — it was released nearby.`);
        return this.endBattle();
      }
      playSfx(this, SFX.captureFail, 0.7);
      this.log(`${this.wild.name} broke free of the CCD!`);
      this.wildTurn();
    });
  }

  doFlee() {
    const chance = 0.5 + (this.fighter.spd - this.wild.spd) * 0.02;
    const success = Math.random() < Phaser.Math.Clamp(chance, 0.15, 0.95);
    this.time.delayedCall(400, () => {
      if (success) {
        adjustBond(this.fighter, 2);
        this.syncPanel(this.fighter);
        playSfx(this, SFX.fleeWhoosh, 0.6);
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
        if (poisoned.fainted) return this.wildFainted(`${this.wild.name} succumbed to the poison!`);
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
        if (pre.fainted) return this.wildFainted(`${this.wild.name} succumbed to its wounds!`);
        this.turnLocked = false;
      });
      return;
    }
    if (pre.message) this.log(pre.message);

    this.playFlourish(this.wildSprite, this.wildFrames);
    playSfx(this, SFX.attackHit);
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
      stopMusic(this, BGM.battle);
      this.scene.stop();
      this.scene.wake('OverworldScene');
    });
  }
}
