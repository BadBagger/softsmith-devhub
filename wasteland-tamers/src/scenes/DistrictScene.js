import Phaser from 'phaser';
import { getDistrict } from '../data/campaign.js';
import {
  gameState, addScrap, battleSquad, districtProgress, activateLandmark, claimDistrictQuest,
} from '../state/gameState.js';
import { randomWildSpecies, randomStrain, spawnCreature } from '../data/creatures.js';
import { overworldPlayerFrameKeys } from '../gen/spriteGen.js';
import { buildDpad } from '../ui/dpad.js';
import { makeButton } from '../ui/button.js';
import { saveGame } from '../state/save.js';
import { SFX, playSfx } from '../audio/sound.js';

const TILE = 32;
const TOP = 48;
const W = 24;
const H = 16;

export class DistrictScene extends Phaser.Scene {
  constructor() { super('DistrictScene'); }

  init(data) { this.district = getDistrict(data.districtId); }

  create() {
    this.gridX = 2; this.gridY = 14; this.moving = false; this.collected = new Set(); this.queuedDirection = null;
    this.bossTile = { x: 20, y: 2 };
    this.eliteTile = { x: 3, y: 3 };
    this.pickups = [{ x: 5, y: 4 }, { x: 10, y: 10 }, { x: 17, y: 7 }, { x: 21, y: 13 }];
    this.landmarks = [{ id: 'north', x: 7, y: 3 }, { id: 'center', x: 12, y: 8 }, { id: 'south', x: 18, y: 12 }];
    this.progress = districtProgress(this.district.id);
    this.drawWorld(); this.buildPlayer(); this.buildUi(); buildDpad(this, 895, 555);
    this.cursors = this.input.keyboard.createCursorKeys(); this.wasd = this.input.keyboard.addKeys('W,A,S,D');
    this.input.keyboard.on('keydown-ESC', () => this.leave());
    this.events.on(Phaser.Scenes.Events.WAKE, this.onWake, this);
  }

  drawWorld() {
    const bg = this.add.image(480, 320, this.district.backgroundKey).setAlpha(0.58);
    bg.setScale(Math.max(960 / bg.width, 640 / bg.height));
    for (let y = 0; y < H; y += 1) for (let x = 0; x < W; x += 1) {
      const blocked = x === 0 || y === 0 || x === W - 1 || y === H - 1 || (x * 7 + y * 3) % 17 === 0;
      const color = blocked ? 0x242520 : this.district.accent;
      this.add.rectangle(x * TILE + 16, TOP + y * TILE + 16, TILE - 1, TILE - 1, color, blocked ? 0.8 : 0.18)
        .setStrokeStyle(1, 0x0c0d0a, 0.45);
    }
    this.add.rectangle(this.bossTile.x * TILE + 16, TOP + this.bossTile.y * TILE + 16, 28, 28, this.district.accent, 0.7).setStrokeStyle(2, 0xffffff, 0.7);
    this.add.text(this.bossTile.x * TILE + 16, TOP + this.bossTile.y * TILE - 6, 'RELAY CORE', { fontFamily: 'monospace', fontSize: '9px', color: '#ffffff' }).setOrigin(0.5);
    if (!this.progress.minibossDefeated) {
      this.add.rectangle(this.eliteTile.x * TILE + 16, TOP + this.eliteTile.y * TILE + 16, 24, 24, 0xd94f2b, 0.75).setStrokeStyle(2, 0xffffff).setDepth(7);
      this.add.text(this.eliteTile.x * TILE + 16, TOP + this.eliteTile.y * TILE - 16, 'ELITE', { fontFamily: 'monospace', fontSize: '8px', color: '#ffffff' }).setOrigin(0.5).setDepth(8);
    }
    this.pickups.forEach((pickup) => this.add.rectangle(pickup.x * TILE + 16, TOP + pickup.y * TILE + 16, 12, 12, 0xe0a83a, 1).setStrokeStyle(1, 0xffffff));
    this.landmarks.forEach((landmark) => {
      const active = this.progress.landmarks.includes(landmark.id);
      const beacon = this.add.rectangle(landmark.x * TILE + 16, TOP + landmark.y * TILE + 16, 18, 24, active ? 0x9dff5c : this.district.accent, active ? 0.9 : 0.44)
        .setStrokeStyle(2, active ? 0xffffff : 0x0c0d0a).setDepth(7);
      this.add.text(landmark.x * TILE + 16, TOP + landmark.y * TILE - 16, active ? 'ONLINE' : 'TUNE', { fontFamily: 'monospace', fontSize: '8px', color: active ? '#9dff5c' : '#ffffff' }).setOrigin(0.5).setDepth(8);
      if (!active) this.tweens.add({ targets: beacon, alpha: 0.9, duration: 650, yoyo: true, repeat: -1 });
    });
    for (let i = 0; i < 16; i += 1) {
      const mote = this.add.circle(40 + (i * 59) % 880, 90 + (i * 83) % 470, 1 + (i % 2), this.district.accent, 0.3).setDepth(4);
      this.tweens.add({ targets: mote, y: mote.y - 22, alpha: 0.05, duration: 1400 + i * 55, yoyo: true, repeat: -1, delay: i * 60 });
    }
  }

  buildPlayer() {
    this.frames = overworldPlayerFrameKeys(); this.frame = 0;
    this.player = this.add.image(this.gridX * TILE + 16, TOP + this.gridY * TILE + 16, this.frames[0]).setScale(0.2).setDepth(10);
  }

  buildUi() {
    this.add.rectangle(0, 0, 960, TOP, 0x0c0d0a, 0.94).setOrigin(0, 0).setDepth(20);
    this.add.text(10, 6, this.district.title, { fontFamily: 'monospace', fontSize: '15px', color: '#e0a83a' }).setDepth(21);
    this.hint = this.add.text(10, 26, '', { fontFamily: 'monospace', fontSize: '10px', color: '#c9a876' }).setDepth(21);
    this.squadText = this.add.text(715, 6, '', { fontFamily: 'monospace', fontSize: '9px', color: '#9dff5c', align: 'right' }).setOrigin(1, 0).setDepth(21);
    makeButton(this, 900, 24, 'RETREAT', () => this.leave(), { width: 92, height: 32, depth: 22, fontSize: '11px' });
    this.renderStatus();
  }

  renderStatus(note = null) {
    const objective = this.progress.questClaimed ? 'QUEST REWARD CLAIMED' : `${this.district.landmarkLabel} ${this.progress.landmarks.length}/3`;
    this.hint.setText(note ?? `${objective} â€¢ ${this.district.hazard} â€¢ SCRAP ${gameState.scrap}`);
    const squad = battleSquad().map((creature) => `${creature.name.split(' ').at(-1)} ${Math.max(0, creature.hp)}/${creature.maxHp}`).join(' | ');
    this.squadText.setText(squad || 'SCAVENGER SOLO');
  }

  readDirection() {
    if (this.cursors.left.isDown || this.wasd.A.isDown || this.touchDx < 0) return { dx: -1, dy: 0 };
    if (this.cursors.right.isDown || this.wasd.D.isDown || this.touchDx > 0) return { dx: 1, dy: 0 };
    if (this.cursors.up.isDown || this.wasd.W.isDown || this.touchDy < 0) return { dx: 0, dy: -1 };
    if (this.cursors.down.isDown || this.wasd.S.isDown || this.touchDy > 0) return { dx: 0, dy: 1 };
    return null;
  }

  update() {
    const direction = this.readDirection();
    if (this.moving) { if (direction) this.queuedDirection = direction; return; }
    const next = direction ?? this.queuedDirection;
    this.queuedDirection = null;
    if (!next) return;
    const nx = this.gridX + next.dx; const ny = this.gridY + next.dy;
    if (nx < 1 || ny < 1 || nx >= W - 1 || ny >= H - 1) return;
    this.moving = true; this.gridX = nx; this.gridY = ny; this.frame = (this.frame + 1) % this.frames.length;
    this.player.setTexture(this.frames[this.frame]).setFlipX(next.dx < 0);
    this.tweens.add({ targets: this.player, x: nx * TILE + 16, y: TOP + ny * TILE + 16, duration: 120, ease: 'Sine.Out', onComplete: () => this.land() });
  }

  land() {
    this.moving = false;
    const key = `${this.gridX},${this.gridY}`;
    if (this.pickups.some((p) => p.x === this.gridX && p.y === this.gridY) && !this.collected.has(key)) {
      this.collected.add(key); addScrap(8); saveGame('scrap-cache'); this.renderStatus(`SCRAP CACHE SECURED +8 â€¢ SCRAP ${gameState.scrap}`); return;
    }
    const landmark = this.landmarks.find((entry) => entry.x === this.gridX && entry.y === this.gridY);
    if (landmark && activateLandmark(this.district.id, landmark.id)) {
      addScrap(6);
      const claimed = claimDistrictQuest(this.district.id, this.district.questReward);
      playSfx(this, this.district.id === 'chemical-wash' ? SFX.bigSplash : SFX.floorCollapse, 0.34);
      saveGame('landmark-tuned');
      this.renderStatus(claimed
        ? `${this.district.landmarkLabel} ONLINE. MODULE ${this.district.questReward.module.toUpperCase()} SECURED +${this.district.questReward.scrap} SCRAP!`
        : `${this.district.landmarkLabel} ONLINE +6 SCRAP. ${this.progress.landmarks.length}/3 TUNED.`);
      return;
    }
    if (this.gridX === this.eliteTile.x && this.gridY === this.eliteTile.y && !this.progress.minibossDefeated) return this.startElite();
    if (this.gridX === this.bossTile.x && this.gridY === this.bossTile.y) return this.startBoss();
    if ((this.gridX * 5 + this.gridY * 3) % 9 === 0 && Math.random() < 0.17) this.startEncounter();
  }

  startEncounter() {
    const maxTier = Math.min(3, gameState.world.repaired + 1);
    const wild = spawnCreature(randomWildSpecies(maxTier).id, randomStrain());
    this.scene.launch('BattleScene', { wild, returnScene: 'DistrictScene' }); this.scene.sleep();
  }

  startBoss() {
    if (gameState.world.completedDistricts.includes(this.district.id)) { this.renderStatus('COMPONENT ALREADY SECURED. RETURN TO ASHVALE AND FUND THE REPAIR.'); return; }
    if (this.progress.landmarks.length < 3) { this.renderStatus(`RELAY CORE SHIELDED — TUNE ALL 3 ${this.district.landmarkLabel}S FIRST.`); return; }
    const wild = spawnCreature(this.district.bossSpeciesId, 'irradiated'); wild.name = this.district.bossName; wild.maxHp = Math.round(wild.maxHp * 1.35); wild.hp = wild.maxHp;
    this.scene.launch('BattleScene', { wild, returnScene: 'DistrictScene', bossDistrict: this.district.id, bossScrapReward: this.district.scrapReward, bossPhase: this.district.bossPhase, hazard: this.district.hazard }); this.scene.sleep();
  }

  startElite() {
    const wild = spawnCreature(randomWildSpecies(Math.min(2, gameState.world.repaired + 1)).id, 'ashen');
    wild.name = `ELITE ${wild.name}`;
    wild.maxHp = Math.round(wild.maxHp * 1.2); wild.hp = wild.maxHp;
    this.scene.launch('BattleScene', { wild, returnScene: 'DistrictScene', eliteDistrict: this.district.id, eliteReward: 18 }); this.scene.sleep();
  }

  onWake() { this.renderStatus(gameState.world.completedDistricts.includes(this.district.id) ? 'COMPONENT SECURED. RETREAT TO ASHVALE AND FUND THE RELAY REPAIR.' : null); }

  leave() { saveGame('district-retreat'); this.scene.stop(); this.scene.wake('CampaignScene'); }
}
