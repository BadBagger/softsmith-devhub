import Phaser from 'phaser';
import { preloadRealArt } from '../gen/spriteGen.js';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    preloadRealArt(this);
    this.load.image('bg-ashvale-dusk', '/backgrounds/ashvale-dusk.png');

    this.load.image('tile-ground', '/tiles/ground.png');
    this.load.image('tile-scrub', '/tiles/scrub.png');
    this.load.image('tile-rubble', '/tiles/rubble.png');
    this.load.image('tile-road', '/tiles/road.png');

    this.load.image('icon-status-poison', '/icons/status-poison.png');
    this.load.image('icon-status-confuse', '/icons/status-confuse.png');
    this.load.image('icon-status-sleep', '/icons/status-sleep.png');
  }

  create() {
    this.scene.start('TitleScene');
  }
}
