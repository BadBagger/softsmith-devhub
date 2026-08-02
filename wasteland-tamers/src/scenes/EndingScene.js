import Phaser from 'phaser';
import { gameState } from '../state/gameState.js';
import { makeButton } from '../ui/button.js';

export class EndingScene extends Phaser.Scene {
  constructor() { super('EndingScene'); }
  create() {
    this.add.rectangle(480, 320, 960, 640, 0x080b0b, 1);
    this.add.text(480, 170, 'THE RELAY ANSWERS', { fontFamily: 'monospace', fontSize: '32px', color: '#8ae0d9', fontStyle: 'bold' }).setOrigin(0.5);
    const lead = Object.entries(gameState.world.factionFavor).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'clinic';
    this.add.text(480, 295, `Ashvale's signal cuts through the Dead Sunbelt.\n${lead.toUpperCase()} voices answer first, then strangers from beyond the ridge.\nThe wasteland is still cruel. It is no longer silent.`, {
      fontFamily: 'monospace', fontSize: '16px', color: '#c9a876', align: 'center', lineSpacing: 10,
    }).setOrigin(0.5);
    this.add.text(480, 430, 'CHAPTER ONE COMPLETE', { fontFamily: 'monospace', fontSize: '15px', color: '#9dff5c' }).setOrigin(0.5);
    makeButton(this, 480, 520, 'RETURN TO ASHVALE', () => this.scene.start('OverworldScene'), { width: 240, height: 42 });
  }
}
