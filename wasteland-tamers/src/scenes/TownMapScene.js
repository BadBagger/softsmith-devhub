import Phaser from 'phaser';
import { overworldPlayerFrameKeys } from '../gen/spriteGen.js';
import { SFX, playSfx } from '../audio/sound.js';
import { buildDpad } from '../ui/dpad.js';
import { TOWN_LOCATIONS } from '../data/townLocations.js';

const PLAYER_SCALE = 0.2;
const TILE = 32;
const MAP_W = 14;
const MAP_H = 10;
const TOP_BAR = 48;

const GROUND = 0;
const ROAD = 1;
const RUBBLE = 2;
const EXIT = 3;
const BUILDING = 4;

const EXIT_X = 7;
const EXIT_Y = 9;

// Single-tile "door" anchors -- walking onto one enters that building.
// Signage is drawn larger than a tile (like the player sprite already is)
// so it actually reads as a building rather than a colored square.
const BUILDINGS = [
  { id: 'town-square', x: 7, y: 5 },
  { id: 'general-store', x: 4, y: 5 },
  { id: 'infirmary', x: 10, y: 5 },
  { id: 'forge', x: 4, y: 2 },
  { id: 'creature-market', x: 10, y: 2 },
];

// Purely visual dressing (no collision) -- bottom-anchored on their tile
// like the player sprite, drawn at a fixed target width regardless of the
// source crop's native size so scale reads consistently across props.
const DECORATIONS = [
  { key: 'prop-gate', x: 7, y: 8, targetW: 120 },
  { key: 'prop-tower', x: 5, y: 8, targetW: 75 },
  { key: 'prop-tree', x: 2, y: 3, targetW: 55 },
  { key: 'prop-scrap', x: 12, y: 3, targetW: 50 },
  { key: 'prop-boulder', x: 2, y: 7, targetW: 45 },
  { key: 'prop-tent', x: 12, y: 7, targetW: 60 },
  { key: 'prop-crate', x: 5, y: 6, targetW: 36 },
  { key: 'prop-barrel', x: 9, y: 6, targetW: 32 },
  { key: 'prop-lamp', x: 6, y: 4, targetW: 26 },
];

function buildMap() {
  const map = Array.from({ length: MAP_H }, () => Array(MAP_W).fill(GROUND));

  for (let x = 0; x < MAP_W; x++) {
    map[0][x] = RUBBLE;
    map[MAP_H - 1][x] = RUBBLE;
  }
  for (let y = 0; y < MAP_H; y++) {
    map[y][0] = RUBBLE;
    map[y][MAP_W - 1] = RUBBLE;
  }
  map[EXIT_Y][EXIT_X] = EXIT; // gap in the south wall -- the road back out

  // Simple road spine: up from the exit, then across to the flanking shops.
  for (let y = 2; y <= EXIT_Y; y++) {
    if (map[y][EXIT_X] === GROUND) map[y][EXIT_X] = ROAD;
  }
  for (let x = 4; x <= 10; x++) {
    if (map[5][x] === GROUND) map[5][x] = ROAD;
  }

  for (const b of BUILDINGS) map[b.y][b.x] = BUILDING;

  return map;
}

export class TownMapScene extends Phaser.Scene {
  constructor() {
    super('TownMapScene');
  }

  create() {
    this.map = buildMap();
    this.moving = false;
    this.gridX = EXIT_X;
    this.gridY = EXIT_Y - 1;

    this.drawMap();
    this.buildPlayer();
    this.buildUi();
    buildDpad(this, 895, 555);

    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys('W,A,S,D');

    this.cameras.main.setBounds(0, TOP_BAR, MAP_W * TILE, MAP_H * TILE);
    this.cameras.main.startFollow(this.player, true, 0.15, 0.15);

    this.events.on(Phaser.Scenes.Events.WAKE, this.handleWake, this);
  }

  drawMap() {
    const keyFor = (tile) => (tile === ROAD || tile === EXIT ? 'tile-road' : tile === RUBBLE ? 'tile-rubble' : 'tile-ground');
    for (let y = 0; y < MAP_H; y++) {
      for (let x = 0; x < MAP_W; x++) {
        const tile = this.map[y][x];
        this.add.image(x * TILE + TILE / 2, TOP_BAR + y * TILE + TILE / 2, keyFor(tile === BUILDING ? GROUND : tile));
      }
    }

    const ex = EXIT_X * TILE + TILE / 2;
    const ey = TOP_BAR + EXIT_Y * TILE + TILE / 2;
    const sign = this.add.image(ex + 26, ey - 6, 'prop-sign').setOrigin(0.5, 1).setDepth(6);
    sign.setScale(34 / sign.width);

    for (const b of BUILDINGS) {
      const loc = TOWN_LOCATIONS[b.id];
      const bx = b.x * TILE + TILE / 2;
      const by = TOP_BAR + b.y * TILE + TILE / 2;
      this.add.rectangle(bx, by, TILE, TILE, 0xe0a83a, 0.15).setStrokeStyle(1, 0xe0a83a, 0.6).setDepth(4);
      const thumb = this.add.image(bx, by - 18, loc.key).setDepth(5);
      thumb.setScale(60 / thumb.width);
      this.add.text(bx, by + 22, loc.title, {
        fontFamily: 'monospace', fontSize: '8px', color: '#e0a83a', align: 'center', wordWrap: { width: 70 },
      }).setOrigin(0.5).setDepth(6);
    }

    for (const d of DECORATIONS) {
      const dx = d.x * TILE + TILE / 2;
      const dy = TOP_BAR + d.y * TILE + TILE;
      const img = this.add.image(dx, dy, d.key).setOrigin(0.5, 1).setDepth(5);
      img.setScale(d.targetW / img.width);
    }
  }

  buildPlayer() {
    this.playerFrames = overworldPlayerFrameKeys();
    this.player = this.add.image(
      this.gridX * TILE + TILE / 2,
      TOP_BAR + this.gridY * TILE + TILE / 2,
      this.playerFrames[0],
    );
    this.player.setScale(PLAYER_SCALE);
    this.player.setDepth(10);
    this.walkFrame = 0;
    this.facingLeft = false;
  }

  buildUi() {
    this.add.rectangle(0, 0, MAP_W * TILE, TOP_BAR, 0x0c0d0a, 1)
      .setOrigin(0, 0).setScrollFactor(0).setDepth(20);
    this.add.text(10, 6, 'ASHVALE — TOWN LIMITS', {
      fontFamily: 'monospace', fontSize: '14px', color: '#9dff5c',
    }).setScrollFactor(0).setDepth(21);
    this.hint = this.add.text(10, 26, 'Arrows/WASD/D-pad to move. Walk into a building to enter. Head south to leave town.', {
      fontFamily: 'monospace', fontSize: '11px', color: '#c9a876',
    }).setScrollFactor(0).setDepth(21);
    makeButton(this, 900, 24, 'RELAY', () => this.openCampaign(), { width: 90, height: 32, depth: 21, fontSize: '11px' });
  }

  update() {
    if (this.moving) return;

    let dx = 0;
    let dy = 0;
    if (this.cursors.left.isDown || this.wasd.A.isDown || this.touchDx < 0) dx = -1;
    else if (this.cursors.right.isDown || this.wasd.D.isDown || this.touchDx > 0) dx = 1;
    else if (this.cursors.up.isDown || this.wasd.W.isDown || this.touchDy < 0) dy = -1;
    else if (this.cursors.down.isDown || this.wasd.S.isDown || this.touchDy > 0) dy = 1;

    if (dx === 0 && dy === 0) return;

    const nx = this.gridX + dx;
    const ny = this.gridY + dy;
    const target = this.map[ny]?.[nx];
    if (target === undefined || target === RUBBLE) return;

    this.moving = true;
    this.gridX = nx;
    this.gridY = ny;

    if (dx !== 0) this.facingLeft = dx < 0;
    this.player.setFlipX(this.facingLeft);

    this.walkFrame = (this.walkFrame + 1) % this.playerFrames.length;
    this.player.setTexture(this.playerFrames[this.walkFrame]);
    playSfx(this, SFX.footstep, 0.35);

    this.tweens.add({
      targets: this.player,
      x: nx * TILE + TILE / 2,
      y: TOP_BAR + ny * TILE + TILE / 2,
      duration: 140,
      onComplete: () => {
        this.moving = false;
        if (target === EXIT) this.leaveTown();
        else if (target === BUILDING) this.enterBuilding(nx, ny);
      },
    });
  }

  enterBuilding(x, y) {
    const building = BUILDINGS.find((b) => b.x === x && b.y === y);
    this.scene.launch('TownScene', { locationId: building.id });
    this.scene.sleep();
  }

  leaveTown() {
    this.scene.stop();
    this.scene.wake('OverworldScene');
  }

  openCampaign() {
    if (this.moving) return;
    this.scene.launch('CampaignScene', { returnScene: 'TownMapScene' });
    this.scene.sleep();
  }

  handleWake() {
    this.moving = false;
  }
}
