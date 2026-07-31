import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene.js';
import { OverworldScene } from './scenes/OverworldScene.js';
import { BattleScene } from './scenes/BattleScene.js';

const config = {
  type: Phaser.AUTO,
  parent: 'game-root',
  width: 960,
  height: 640,
  pixelArt: true,
  backgroundColor: '#0c0d0a',
  physics: {
    default: 'arcade',
    arcade: { debug: false },
  },
  scene: [BootScene, OverworldScene, BattleScene],
};

new Phaser.Game(config);
