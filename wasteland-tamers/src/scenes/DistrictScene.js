import Phaser from 'phaser';
import { getDistrict } from '../data/campaign.js';
import { gameState, addScrap } from '../state/gameState.js';
import { randomWildSpecies, randomStrain, spawnCreature } from '../data/creatures.js';
import { overworldPlayerFrameKeys } from '../gen/spriteGen.js';
import { buildDpad } from '../ui/dpad.js';
import { makeButton } from '../ui/button.js';
import { saveGame } from '../state/save.js';

const TILE = 32;
const TOP = 48;
const W = 24;
const H = 16;

export class DistrictScene extends Phaser.Scene {
  constructor() { super('DistrictScene'); }

  init(data) { this.district = getDistrict(data.districtId); }

  create() {
    this.gridX = 2; this.gridY = 14; this.moving = false; this.collected = new Set();
    this.bossTile = { x: 20, y: 2 };
    this.pickups = [{ x: 5, y: 4 }, { x: 10, y: 10 }, { x: 17, y: 7 }, { x: 21, y: 13 }];
    this.drawWorld(); this.buildPlayer(); this.buildUi(); buildDpad(this, 895, 555);
    this.cursors = this.input.keyboard.createCursorKeys(); this.wasd = this.input.keyboard.addKeys('W,A,S,D');
    this.input.keyboard.on('keydown-ESC', () => this.leave());
    this.events.on(Phaser.Scenes.Events.WAKE, this.onWake, this);
  }

  drawWorld() {
    const bg = this.add.image(480, 320, this.district.backgroundKey).setAlpha(0.56);
    bg.setScale(Math.max(960 / bg.width, 640 / bg.height));
    for (let y = 0; y < H; y += 1) for (let x = 0; x < W; x += 1) {
      const blocked = (x === 0 || y === 0 || x === W - 1 || y === H - 1 || (x * 7 + y * 3) % 17 === 0);
      const color = blocked ? 0x242520 : this.district.accent;
      this.add.rectangle(x * TILE + 16, TOP + y * TILE + 16, TILE - 1, TILE - 1, color, blocked ? 0.8 : 0.18)
        .setStrokeStyle(1, 0x0c0d0a, 0.45);
    }
    this.add.rectangle(this.bossTile.x * TILE + 16, TOP + this.bossTile.y * TILE + 16, 28, 28, this.district.accent, 0.7).setStrokeStyle(2, 0xffffff, 0.7);
    this.add.text(this.bossTile.x * TILE + 16, TOP + this.bossTile.y * TILE - 6, 'RELAY CORE', { fontFamily: 'monospace', fontSize: '9px', color: '#ffffff' }).setOrigin(0.5);
    this.pickups.forEach((pickup) => this.add.rectangle(pickup.x * TILE + 16, TOP + pickup.y * TILE + 16, 12, 12, 0xe0a83a, 1).setStrokeStyle(1, 0xffffff));
  }

  buildPlayer() {
    this.frames = overworldPlayerFrameKeys(); this.frame = 0;
    this.player = this.add.image(this.gridX * TILE + 16, TOP + this.gridY * TILE + 16, this.frames[0]).setScale(0.2).setDepth(10);
  }

  buildUi() {
    this.add.rectangle(0, 0, 960, TOP, 0x0c0d0a, 0.94).setOrigin(0, 0).setDepth(20);
    this.add.text(10, 6, this.district.title, { fontFamily: 'monospace', fontSize: '15px', color: '#e0a83a' }).setDepth(21);
    this.hint = this.add.text(10, 26, `RECOVER THE COMPONENT • ${this.district.hazard} • SCRAP ${gameState.scrap}`, { fontFamily: 'monospace', fontSize: '10px', color: '#c9a876' }).setDepth(21);
    makeButton(this, 900, 24, 'RETREAT', () => this.leave(), { width: 92, height: 32, depth: 22, fontSize: '11px' });
  }

  update() {
    if (this.moving) return;
    let dx = 0; let dy = 0;
    if (this.cursors.left.isDown || this.wasd.A.isDown || this.touchDx < 0) dx = -1;
    else if (this.cursors.right.isDown || this.wasd.D.isDown || this.touchDx > 0) dx = 1;
    else if (this.cursors.up.isDown || this.wasd.W.isDown || this.touchDy < 0) dy = -1;
    else if (this.cursors.down.isDown || this.wasd.S.isDown || this.touchDy > 0) dy = 1;
    if (!dx && !dy) return;
    const nx = this.gridX + dx; const ny = this.gridY + dy;
    if (nx < 1 || ny < 1 || nx >= W - 1 || ny >= H - 1) return;
    this.moving = true; this.gridX = nx; this.gridY = ny; this.frame = (this.frame + 1) % this.frames.length;
    this.player.setTexture(this.frames[this.frame]).setFlipX(dx < 0);
    this.tweens.add({ targets: this.player, x: nx * TILE + 16, y: TOP + ny * TILE + 16, duration: 120, onComplete: () => this.land() });
  }

  land() {
    this.moving = false;
    const key = `${this.gridX},${this.gridY}`;
    if (this.pickups.some((p) => p.x === this.gridX && p.y === this.gridY) && !this.collected.has(key)) {
      this.collected.add(key); addScrap(8); saveGame('scrap-cache'); this.hint.setText(`SCRAP CACHE SECURED +8 • SCRAP ${gameState.scrap}`); return;
    }
    if (this.gridX === this.bossTile.x && this.gridY === this.bossTile.y) return this.startBoss();
    if ((this.gridX * 5 + this.gridY * 3) % 9 === 0 && Math.random() < 0.17) this.startEncounter();
  }

  startEncounter() {
    const maxTier = Math.min(3, gameState.world.repaired + 1);
    const wild = spawnCreature(randomWildSpecies(maxTier).id, randomStrain());
    this.scene.launch('BattleScene', { wild, returnScene: 'DistrictScene' }); this.scene.sleep();
  }

  startBoss() {
    if (gameState.world.completedDistricts.includes(this.district.id)) { this.hint.setText('COMPONENT ALREADY SECURED. RETURN TO ASHVALE AND FUND THE REPAIR.'); return; }
    const wild = spawnCreature(this.district.bossSpeciesId, 'irradiated'); wild.name = this.district.bossName; wild.maxHp = Math.round(wild.maxHp * 1.35); wild.hp = wild.maxHp;
    this.scene.launch('BattleScene', { wild, returnScene: 'DistrictScene', bossDistrict: this.district.id, bossScrapReward: this.district.scrapReward }); this.scene.sleep();
  }

  onWake() { this.hint.setText(gameState.world.completedDistricts.includes(this.district.id) ? 'COMPONENT SECURED. RETREAT TO ASHVALE AND FUND THE RELAY REPAIR.' : `RECOVER THE COMPONENT • SCRAP ${gameState.scrap}`); }

  leave() { saveGame('district-retreat'); this.scene.stop(); this.scene.wake('CampaignScene'); }
}
