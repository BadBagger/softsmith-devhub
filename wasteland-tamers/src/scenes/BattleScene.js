import Phaser from 'phaser';
import { ensureCreatureTexture, hasRealArt, realArtFrameKeys, playerFrameKeys } from '../gen/spriteGen.js';
import {
  activeCreature, scavengerFighter, addToParty, removeFromParty, gameState,
  itemCount, removeItem, ensureCreatureProgress, gainExperience, recordDistrictVictory,
  battleSquad, nextBattleCreature, setActiveCreature, hasModule, recordMinibossVictory,
} from '../state/gameState.js';
import {
  resolvePoisonTick, resolvePreActionStatus, tryInflictStatus, applyStatus,
  STATUS_LABEL, STATUS_COLOR, STATUS_VERB,
} from '../battle/status.js';
import { BASE_BOND, hasBond, bondTier, adjustBond, bondDamageMult, bondConfuseResistMult } from '../state/bond.js';
import { SFX, BGM, playSfx, playMusic, stopMusic } from '../audio/sound.js';
import { ITEMS, ITEM_IDS } from '../data/items.js';
import { knownMovesFor } from '../data/moves.js';
import { spawnCreature } from '../data/creatures.js';
import { saveGame } from '../state/save.js';
import { makeButton } from '../ui/button.js';

function combatantFrames(fighterLike) {
  if (fighterLike.speciesId === 'scavenger') return playerFrameKeys();
  if (!fighterLike.strainTint && hasRealArt(fighterLike.speciesId)) return realArtFrameKeys(fighterLike.speciesId);
  return null;
}

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
    this.returnScene = data.returnScene ?? 'OverworldScene';
    this.bossDistrict = data.bossDistrict ?? null;
    this.bossScrapReward = data.bossScrapReward ?? 0;
    this.bossPhaseName = data.bossPhase ?? null;
    this.hazard = data.hazard ?? null;
    this.eliteDistrict = data.eliteDistrict ?? null;
    this.eliteReward = data.eliteReward ?? 0;
    this.victory = false;
  }

  create() {
    this.fighter = activeCreature() ?? scavengerFighter();
    ensureCreatureProgress(this.fighter);
    this.fighter.status = null; // statuses don't carry over between battles
    this.selection = 0;
    this.turnLocked = false;
    this.ended = false;
    this.captureBoost = null;
    this.bossEnraged = false;

    this.buildBackdrop();
    this.buildCombatants();
    this.buildHud();
    this.buildMenu();
    this.buildItemPicker();
    this.syncPanel(this.fighter);
    this.syncPanel(this.wild);
    this.log(this.bossDistrict ? `${this.wild.name} blocks the relay core!` : this.eliteDistrict ? `${this.wild.name} guards a hidden cache!` : `A wild ${this.wild.name} appears!`);
    playSfx(this, SFX.battleStart, 0.7);
    playMusic(this, BGM.battle, 0.3);

    this.input.keyboard.on('keydown-UP', () => (this.itemPickerOpen ? this.moveItemSelection(-1) : this.moveSelection(-1)));
    this.input.keyboard.on('keydown-DOWN', () => (this.itemPickerOpen ? this.moveItemSelection(1) : this.moveSelection(1)));
    this.input.keyboard.on('keydown-ENTER', () => (this.itemPickerOpen ? this.confirmItemSelection() : this.confirmSelection()));
    this.input.keyboard.on('keydown-SPACE', () => (this.itemPickerOpen ? this.confirmItemSelection() : this.confirmSelection()));
    this.input.keyboard.on('keydown-ESC', () => { if (this.itemPickerOpen) this.closeItemPicker(); });
  }

  buildBackdrop() {
    const bg = this.add.image(480, 320, 'bg-sunbelt-battle').setAlpha(0.96);
    bg.setScale(Math.max(960 / bg.width, 640 / bg.height));
    this.add.rectangle(480, 320, 960, 640, 0x080a08, 0.12);
    this.add.rectangle(480, 28, 960, 56, 0x090b09, 0.82).setStrokeStyle(1, 0x715a32, 0.8);
    this.add.rectangle(480, 545, 920, 172, 0x080a08, 0.84).setStrokeStyle(2, 0x715a32, 0.85);
    this.add.text(480, 20, `SCAVCOMM MK.II — BATTLE`, {
      fontFamily: 'monospace', fontSize: '14px', color: AMBER,
    }).setOrigin(0.5, 0);
  }

  buildCombatants() {
    this.wildFrames = combatantFrames(this.wild);
    const wildTexKey = this.wildFrames ? this.wildFrames[0] : ensureCreatureTexture(this, this.wild);
    this.add.ellipse(700, 394, 205, 38, 0x0b0c09, 0.58).setDepth(1);
    this.wildSprite = this.add.image(700, 310, wildTexKey).setScale(this.wildFrames ? 1.55 : 2.75).setDepth(3);

    this.playerFrames = combatantFrames(this.fighter);
    const playerTexKey = this.playerFrames
      ? this.playerFrames[0]
      : (this.fighter.speciesId === 'scavenger' ? 'player' : ensureCreatureTexture(this, this.fighter));
    const fallbackScale = this.fighter.speciesId === 'scavenger' ? 3.35 : 2.75;
    this.add.ellipse(260, 478, 220, 42, 0x0b0c09, 0.58).setDepth(1);
    this.playerSprite = this.add.image(260, 394, playerTexKey).setScale(this.playerFrames ? 1.5 : fallbackScale).setDepth(3);
    if (!gameState.world.accessibility?.reducedMotion) {
      this.tweens.add({ targets: [this.playerSprite, this.wildSprite], y: '-=7', duration: 1200, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    }
  }

  playFlourish(sprite, frames) {
    if (!frames) return;
    const sequence = [frames[1], frames[2], frames[3], frames[0]];
    sequence.forEach((tex, i) => {
      this.time.delayedCall(90 * (i + 1), () => sprite.setTexture(tex));
    });
  }

  buildHud() {
    this.playerPanel = this.buildFighterPanel(32, 68, this.fighter);
    this.wildPanel = this.buildFighterPanel(588, 68, this.wild, true);
    this.squadHud = this.add.text(32, 136, '', { fontFamily: 'monospace', fontSize: '10px', color: '#ffe2a0' }).setDepth(5);
    this.renderSquadHud();
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
    const level = this.add.text(width - 10, 4, fighter.level ? `LV ${fighter.level}` : '', { fontFamily: 'monospace', fontSize: '10px', color: AMBER }).setOrigin(1, 0);
    container.add([bg, name, level, statusIcon, statusLabel, hpBarBg, hpBar, hpText, bondLabel]);
    return { container, name, level, hpBar, hpText, statusLabel, statusIcon, bondLabel, maxWidth: width - 20 };
  }

  refreshPanel(panel, fighter) {
    const ratio = Phaser.Math.Clamp(fighter.hp / fighter.maxHp, 0, 1);
    panel.hpBar.width = panel.maxWidth * ratio;
    panel.hpBar.fillColor = ratio > 0.5 ? 0x9dff5c : ratio > 0.2 ? 0xe0a83a : 0xd94f2b;
    panel.hpText.setText(`HP ${Math.max(0, fighter.hp)}/${fighter.maxHp}`);
    panel.name.setText(fighter.name.toUpperCase());
    panel.level.setText(fighter.level ? `LV ${fighter.level}` : '');
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
    if (!this.logText) {
      this.logText = this.add.text(54, 464, '', {
        fontFamily: 'monospace', fontSize: '14px', color: '#f3dda1', fontStyle: 'bold',
        wordWrap: { width: 880 },
      });
    }
    this.menuControls?.forEach(({ bg, text }) => { bg.destroy(); text.destroy(); });

    this.menuEntries = [
      ...knownMovesFor(this.fighter).map((move) => ({ kind: 'move', move, label: move.name })),
      { kind: 'capture', label: 'CAPTURE' }, { kind: 'swap', label: 'SWAP' }, { kind: 'flee', label: 'FLEE' }, { kind: 'item', label: 'ITEM' },
    ];
    this.selection = Math.min(this.selection ?? 0, this.menuEntries.length - 1);
    this.menuControls = this.menuEntries.map((entry, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = 270 + col * 255;
      const y = 502 + row * 34;
      const bg = this.add.rectangle(x, y, 238, 28, 0x191d17, 0.94).setStrokeStyle(1, 0x5d563b, 0.9).setInteractive({ useHandCursor: true });
      const text = this.add.text(x, y, entry.label, {
        fontFamily: 'monospace', fontSize: '12px', color: '#c9a876', fontStyle: 'bold',
      }).setOrigin(0.5);
      bg.on('pointerover', () => { this.selection = i; this.renderMenu(); });
      bg.on('pointerdown', () => {
        this.selection = i;
        this.renderMenu();
        this.confirmSelection();
      });
      return { bg, text };
    });
    this.renderMenu();
  }

  renderMenu() {
    this.menuControls.forEach(({ bg, text }, i) => {
      const active = i === this.selection;
      const entry = this.menuEntries[i];
      const cooldown = entry.move ? (this.fighter.cooldowns?.[entry.move.id] ?? 0) : 0;
      bg.setFillStyle(active ? 0x4a4328 : 0x191d17, active ? 1 : 0.94);
      bg.setStrokeStyle(active ? 2 : 1, cooldown ? 0x4d4f49 : active ? 0xe0a83a : 0x5d563b, 0.95);
      text.setColor(cooldown ? '#6d7066' : (active ? '#ffe2a0' : '#c9a876'));
      text.setText(`${entry.label}${entry.move ? `  ${entry.move.kind}` : ''}${cooldown ? `  CD ${cooldown}` : ''}`);
    });
  }

  moveSelection(delta) {
    if (this.turnLocked || this.ended) return;
    this.selection = (this.selection + delta + this.menuEntries.length) % this.menuEntries.length;
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
    this.itemRowIcons = ITEM_IDS.map((id, i) => this.add.image(300, 190 + i * 26, `icon-item-${id}`)
      .setDisplaySize(24, 24).setDepth(52));
    this.itemRowTexts = ITEM_IDS.map((id, i) => this.add.text(322, 190 + i * 26, '', {
      fontFamily: 'monospace', fontSize: '14px', color: '#2a2410',
    }).setOrigin(0, 0.5).setDepth(52).setInteractive({ useHandCursor: true }));
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
      this.itemRowIcons.forEach((icon) => icon.setVisible(false));
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
      const icon = this.itemRowIcons[i];
      if (!id) {
        t.setVisible(false);
        icon.setVisible(false);
        return;
      }
      const active = i === this.itemSelection;
      t.setVisible(true);
      icon.setVisible(true);
      icon.setTexture(`icon-item-${id}`);
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
    const entry = this.menuEntries[this.selection];
    if (entry.kind === 'item') return this.openItemPicker();
    if (entry.kind === 'move' && (this.fighter.cooldowns?.[entry.move.id] ?? 0) > 0) return this.log(`${entry.move.name} is still cooling down.`);
    this.beginTurn(() => this.dispatchPlayerAction());
  }

  // Shared "start of the player's turn" sequence -- poison tick, then the
  // sleep/confuse pre-action check -- shared by both picking a battle menu
  // action directly and committing to an item from the Item picker. Opening
  // the picker itself (see openItemPicker) happens *before* this, so
  // backing out of it costs nothing; only actually using an item does.
  beginTurn(afterStatusChecks) {
    this.turnLocked = true;
    Object.keys(this.fighter.cooldowns ?? {}).forEach((id) => {
      this.fighter.cooldowns[id] = Math.max(0, this.fighter.cooldowns[id] - 1);
    });
    this.renderMenu();

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
    const entry = this.menuEntries[this.selection];
    if (entry.kind === 'move') this.doAttack(entry.move);
    else if (entry.kind === 'capture') this.doCapture();
    else if (entry.kind === 'swap') this.doSwap();
    else if (entry.kind === 'flee') this.doFlee();
  }

  renderSquadHud() {
    const squad = battleSquad();
    if (!squad.length) return this.squadHud.setText('SQUAD: SCAVENGER SOLO');
    this.squadHud.setText(`SQUAD ${squad.map((member) => `${member === this.fighter ? '>' : ' '} ${member.name.split(' ').at(-1)} ${Math.max(0, member.hp)}/${member.maxHp}`).join('  |  ')}`);
  }

  doSwap() {
    const next = nextBattleCreature(this.fighter);
    if (!next) {
      this.log('No healthy squadmate is ready to rotate in.');
      return this.time.delayedCall(450, () => this.wildTurn());
    }
    this.switchFighter(next);
    this.log(`${next.name} takes the field!`);
    this.time.delayedCall(650, () => this.wildTurn());
  }

  switchFighter(next) {
    this.fighter = next;
    setActiveCreature(next);
    ensureCreatureProgress(this.fighter);
    this.playerFrames = combatantFrames(this.fighter);
    const texture = this.playerFrames ? this.playerFrames[0] : ensureCreatureTexture(this, this.fighter);
    this.playerSprite.setTexture(texture).setScale(this.playerFrames ? 1.5 : (this.fighter.speciesId === 'scavenger' ? 3.35 : 2.75));
    this.syncPanel(this.fighter);
    this.renderSquadHud();
    this.buildMenu();
  }

  playerFaints() {
    // Difficulty only puts a captured creature's fate at stake -- the bare-
    // handed scavenger fallback always just retreats and patches up, since
    // there's no creature there to wound or lose.
    const replacement = nextBattleCreature(this.fighter);
    if (replacement) {
      this.log(`${this.fighter.name} is down! ${replacement.name} rushes in.`);
      this.time.delayedCall(650, () => { this.switchFighter(replacement); this.turnLocked = false; });
      return;
    }
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
    this.victory = true;
    this.awardExperience(this.bossDistrict ? 70 : 18);
    this.log(message);
    adjustBond(this.fighter, 8);
    this.syncPanel(this.fighter);
    this.endBattle();
  }

  doAttack(move) {
    this.playFlourish(this.playerSprite, this.playerFrames);
    playSfx(this, SFX.attackHit);
    if (Math.random() > move.accuracy) {
      this.log(`${this.fighter.name}'s ${move.name} misses!`);
      return this.time.delayedCall(500, () => this.wildTurn());
    }
    this.fighter.cooldowns[move.id] = move.cooldown + 1;
    const rawDmg = Math.max(1, Math.round(this.fighter.atk * move.power - this.wild.def * 0.4 + Phaser.Math.Between(-2, 3)));
    const moduleMult = hasModule('tempered-coil') ? 1.1 : 1;
    const dmg = Math.max(1, Math.round(rawDmg * bondDamageMult(this.fighter) * moduleMult));
    this.wild.hp = Math.max(0, this.wild.hp - dmg);
    this.refreshPanel(this.wildPanel, this.wild);
    this.showDamage(this.wildSprite, dmg, '#e0a83a');
    this.log(`${this.fighter.name} uses ${move.name} for ${dmg}.`);

    this.time.delayedCall(700, () => {
      if (this.wild.hp <= 0) {
        return this.wildFainted(`${this.wild.name} is downed! It fled into the ruins.`);
      }
      if (this.bossDistrict && !this.bossEnraged && this.wild.hp <= this.wild.maxHp * 0.5) {
        return this.triggerBossPhase();
      }
      let inflicted = null;
      if (move.status && !this.wild.status && Math.random() < 0.65) {
        applyStatus(this.wild, move.status);
        inflicted = move.status;
      } else {
        inflicted = tryInflictStatus(this.fighter, this.wild);
      }
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
    let chance = this.wild.captureRate * (0.4 + missingHpRatio) + (hasModule('signal-lens') ? 0.08 : 0);
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
        this.victory = true;
        const caught = { ...this.wild, status: null, bond: BASE_BOND };
        const added = addToParty(caught);
        this.awardExperience(this.bossDistrict ? 70 : 12);
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
    this.showDamage(this.playerSprite, dmg, '#d94f2b');
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
    if (this.victory && this.bossDistrict) recordDistrictVictory(this.bossDistrict, this.bossScrapReward);
    if (this.victory && this.eliteDistrict) recordMinibossVictory(this.eliteDistrict, this.eliteReward);
    saveGame(this.victory ? 'battle-victory' : 'battle-return');
    this.time.delayedCall(1400, () => {
      stopMusic(this, BGM.battle);
      this.scene.stop();
      this.scene.wake(this.returnScene);
    });
  }

  triggerBossPhase() {
    this.bossEnraged = true;
    this.wild.atk = Math.round(this.wild.atk * 1.2);
    this.wild.def = Math.round(this.wild.def * 1.1);
    if (!gameState.world.accessibility?.reducedMotion) {
      this.cameras.main.flash(180, 224, 168, 58);
      this.cameras.main.shake(130, 0.006);
    }
    this.log(`${this.bossPhaseName ?? 'OVERDRIVE'}! ${this.wild.name} turns the ${this.hazard ?? 'RUINS'} against your squad.`);
    this.time.delayedCall(900, () => this.wildTurn());
  }

  showDamage(sprite, amount, color) {
    if (gameState.world.accessibility?.reducedMotion) return;
    const text = this.add.text(sprite.x, sprite.y - 48, `-${amount}`, { fontFamily: 'monospace', fontSize: '18px', color, fontStyle: 'bold' }).setOrigin(0.5).setDepth(40);
    this.tweens.add({ targets: text, y: text.y - 28, alpha: 0, duration: 520, onComplete: () => text.destroy() });
  }

  awardExperience(amount) {
    const result = gainExperience(this.fighter, amount);
    if (!result.leveled) return;
    let note = `${this.fighter.name} reaches level ${this.fighter.level}!`;
    const threshold = this.fighter.tier === 1 ? 8 : 16;
    const neededBond = this.fighter.tier === 1 ? 40 : 60;
    if (this.fighter.evolvesToId && this.fighter.level >= threshold && (this.fighter.bond ?? 0) >= neededBond) {
      const evolved = spawnCreature(this.fighter.evolvesToId);
      Object.assign(this.fighter, evolved, { level: this.fighter.level, xp: this.fighter.xp, bond: this.fighter.bond, cooldowns: {}, hp: evolved.maxHp });
      note += ` It evolves into ${this.fighter.name}!`;
    }
    this.log(note);
  }
}
