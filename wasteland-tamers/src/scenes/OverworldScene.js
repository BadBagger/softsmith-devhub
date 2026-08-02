import Phaser from 'phaser';
import { gameState, battleSquad } from '../state/gameState.js';
import { randomWildSpecies, randomStrain, spawnCreature } from '../data/creatures.js';
import { overworldPlayerFrameKeys } from '../gen/spriteGen.js';
import { SFX, BGM, playSfx, playMusic, pauseMusic } from '../audio/sound.js';
import { makeButton } from '../ui/button.js';
import { buildDpad } from '../ui/dpad.js';

const PLAYER_SCALE = 0.2; // real art frames are ~220px tall; tiles are 32px

const TILE = 32;
const MAP_W = 24;
const MAP_H = 16;
const TOP_BAR = 48;

const GROUND = 0;
const SCRUB = 1;
const RUBBLE = 2;
const TOWN = 3;

const TOWN_X = 12;
const TOWN_Y = 12;

// Visual only: these make the scrubland feel inhabited without changing the
// collision map or hiding a route to encounters/the town. Props sit behind
// the player, exactly like their town-map counterparts.
const DECORATIONS = [
  { key: 'prop-shack', x: 2, y: 7, targetW: 82 },
  { key: 'prop-tree', x: 6, y: 2, targetW: 55 },
  { key: 'prop-scrap', x: 8, y: 5, targetW: 48 },
  { key: 'prop-boulder', x: 15, y: 3, targetW: 44 },
  { key: 'prop-tower', x: 21, y: 4, targetW: 68 },
  { key: 'prop-tent', x: 18, y: 10, targetW: 60 },
  { key: 'prop-crate', x: 13, y: 13, targetW: 34 },
  { key: 'prop-barrel', x: 21, y: 12, targetW: 30 },
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

  // Scrubland encounter patches.
  const patches = [
    { x: 3, y: 2, w: 6, h: 4 },
    { x: 14, y: 3, w: 7, h: 5 },
    { x: 4, y: 9, w: 8, h: 5 },
    { x: 16, y: 10, w: 5, h: 4 },
  ];
  for (const p of patches) {
    for (let y = p.y; y < p.y + p.h; y++) {
      for (let x = p.x; x < p.x + p.w; x++) {
        if (map[y]?.[x] === GROUND) map[y][x] = SCRUB;
      }
    }
  }

  // A few rubble obstacles scattered in open ground.
  const obstacles = [
    [11, 6], [12, 6], [11, 7],
    [7, 7], [19, 7], [3, 12], [20, 4],
  ];
  for (const [x, y] of obstacles) {
    if (map[y]?.[x] !== undefined) map[y][x] = RUBBLE;
  }

  map[TOWN_Y][TOWN_X] = TOWN;

  return map;
}

export class OverworldScene extends Phaser.Scene {
  constructor() {
    super('OverworldScene');
  }

  create() {
    this.map = buildMap();
    this.moving = false;
    this.queuedDirection = null;
    this.gridX = 12;
    this.gridY = 8;

    this.drawMap();
    this.buildPlayer();
    this.buildUi();
    buildDpad(this, 895, 555);
    playMusic(this, BGM.overworld, 0.35);

    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys('W,A,S,D');
    this.input.keyboard.on('keydown-P', () => this.openParty());

    this.cameras.main.setBounds(0, TOP_BAR, MAP_W * TILE, MAP_H * TILE);
    this.cameras.main.startFollow(this.player, true, 0.15, 0.15);

    this.events.on(Phaser.Scenes.Events.WAKE, this.handleWake, this);
  }

  drawMap() {
    const keyFor = (tile) => (tile === SCRUB ? 'tile-scrub' : tile === RUBBLE ? 'tile-rubble' : 'tile-ground');
    for (let y = 0; y < MAP_H; y++) {
      for (let x = 0; x < MAP_W; x++) {
        this.add.image(x * TILE + TILE / 2, TOP_BAR + y * TILE + TILE / 2, keyFor(this.map[y][x]));
      }
    }

    for (const d of DECORATIONS) {
      const dx = d.x * TILE + TILE / 2;
      const dy = TOP_BAR + d.y * TILE + TILE;
      const img = this.add.image(dx, dy, d.key).setOrigin(0.5, 1).setDepth(5);
      img.setScale(d.targetW / img.width);
    }

    // Town tile has no dedicated ground art yet -- an overlay marker is
    // enough to read as "a place", distinct from plain scrub/rubble tiles.
    const tx = TOWN_X * TILE + TILE / 2;
    const ty = TOP_BAR + TOWN_Y * TILE + TILE / 2;
    this.add.rectangle(tx, ty, TILE - 4, TILE - 4, 0xe0a83a, 0.25).setStrokeStyle(1, 0xe0a83a).setDepth(6);
    this.add.text(tx, ty - TILE, 'TOWN', {
      fontFamily: 'monospace', fontSize: '10px', color: '#e0a83a',
    }).setOrigin(0.5).setDepth(6);
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
    this.facingLeft = false; // only left/right art exists -- flip covers both
  }

  buildUi() {
    this.add.rectangle(0, 0, MAP_W * TILE, TOP_BAR, 0x0c0d0a, 1)
      .setOrigin(0, 0).setScrollFactor(0).setDepth(20);
    this.add.text(10, 6, 'ASHVALE OUTSKIRTS — THE DEAD SUNBELT', {
      fontFamily: 'monospace', fontSize: '14px', color: '#9dff5c',
    }).setScrollFactor(0).setDepth(21);
    this.hint = this.add.text(10, 26, this.controlsHint(), {
      fontFamily: 'monospace', fontSize: '11px', color: '#c9a876',
    }).setScrollFactor(0).setDepth(21);
    makeButton(this, 905, 24, 'PARTY', () => this.openParty(), { width: 90, height: 32, depth: 21, fontSize: '12px' });
    makeButton(this, 800, 24, 'RELAY', () => this.openCampaign(), { width: 90, height: 32, depth: 21, fontSize: '11px' });
  }

  controlsHint() {
    return `Arrows/WASD/D-pad to move • Squad ${battleSquad().length}/3 • P for party • scrub holds Ferals • TOWN restores • RELAY tracks your next signal.`;
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
    const { dx, dy } = next;

    const nx = this.gridX + dx;
    const ny = this.gridY + dy;
    if (this.map[ny]?.[nx] === undefined || this.map[ny][nx] === RUBBLE) return;

    this.moving = true;
    const landedTile = this.map[ny][nx];
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
      ease: 'Sine.Out',
      onComplete: () => {
        this.moving = false;
        if (landedTile === SCRUB && Math.random() < 0.14) {
          this.triggerEncounter();
        } else if (landedTile === TOWN) {
          this.enterTown();
        }
      },
    });
  }

  triggerEncounter() {
    const species = randomWildSpecies(2); // wild encounters cap at mid-tier
    const strain = randomStrain();
    const wild = spawnCreature(species.id, strain);
    pauseMusic(this, BGM.overworld);
    this.scene.launch('BattleScene', { wild });
    this.scene.sleep();
  }

  enterTown() {
    this.scene.launch('TownMapScene');
    this.scene.sleep();
  }

  openParty() {
    if (this.moving) return;
    this.scene.launch('PartyScene');
    this.scene.sleep();
  }

  openCampaign() {
    if (this.moving) return;
    this.scene.launch('CampaignScene', { returnScene: 'OverworldScene' });
    this.scene.sleep();
  }

  handleWake() {
    this.moving = false;
    this.queuedDirection = null;
    this.hint.setText(this.controlsHint());
    playMusic(this, BGM.overworld, 0.35);
  }
}
