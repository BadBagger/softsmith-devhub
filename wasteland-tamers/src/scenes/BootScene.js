import Phaser from 'phaser';
import { preloadRealArt } from '../gen/spriteGen.js';

const PALETTE = {
  dustySand: 0xc9a876,
  burntOrange: 0xc0632f,
  rustRed: 0x9a3b2b,
  brownEarth: 0x4a3624,
  fadedOlive: 0x5c5e3a,
  ashGray: 0x9a9a92,
  gunmetal: 0x3a3d3c,
  toxicGreen: 0x9dff5c,
};

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    preloadRealArt(this);
    this.load.image('bg-ashvale-dusk', '/backgrounds/ashvale-dusk.png');
  }

  create() {
    this.buildTileTextures();
    this.scene.start('TitleScene');
  }

  buildTileTextures() {
    const s = 32;
    const ground = this.add.graphics();
    ground.fillStyle(PALETTE.dustySand, 1);
    ground.fillRect(0, 0, s, s);
    ground.fillStyle(PALETTE.brownEarth, 0.25);
    ground.fillRect(2, 6, 6, 2);
    ground.fillRect(20, 18, 8, 2);
    ground.generateTexture('tile-ground', s, s);
    ground.destroy();

    const scrub = this.add.graphics();
    scrub.fillStyle(PALETTE.fadedOlive, 1);
    scrub.fillRect(0, 0, s, s);
    scrub.fillStyle(PALETTE.toxicGreen, 0.5);
    for (let i = 0; i < 6; i++) {
      const x = Phaser.Math.Between(2, s - 4);
      const y = Phaser.Math.Between(2, s - 4);
      scrub.fillRect(x, y, 2, 6);
    }
    scrub.generateTexture('tile-scrub', s, s);
    scrub.destroy();

    const rubble = this.add.graphics();
    rubble.fillStyle(PALETTE.gunmetal, 1);
    rubble.fillRect(0, 0, s, s);
    rubble.fillStyle(PALETTE.ashGray, 0.6);
    rubble.fillRect(4, 4, 10, 8);
    rubble.fillRect(18, 14, 10, 10);
    rubble.generateTexture('tile-rubble', s, s);
    rubble.destroy();
  }
}

export { PALETTE };
