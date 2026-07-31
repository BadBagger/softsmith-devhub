import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene.js';
import { TitleScene } from './scenes/TitleScene.js';
import { OverworldScene } from './scenes/OverworldScene.js';
import { TownScene } from './scenes/TownScene.js';
import { BattleScene } from './scenes/BattleScene.js';

const config = {
  type: Phaser.AUTO,
  parent: 'game-root',
  width: 960,
  height: 640,
  pixelArt: false,
  antialias: true,
  backgroundColor: '#0c0d0a',
  physics: {
    default: 'arcade',
    arcade: { debug: false },
  },
  scene: [BootScene, TitleScene, OverworldScene, TownScene, BattleScene],
};

new Phaser.Game(config);
