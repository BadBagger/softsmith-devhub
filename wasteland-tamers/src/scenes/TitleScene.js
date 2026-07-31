import Phaser from 'phaser';

const OVERVIEW = [
  'A post-apocalyptic creature-taming RPG.',
  "In a world poisoned by collapse, you don't just catch monsters —",
  'you earn their trust, survive together, and decide the fate of what\'s left.',
];

export class TitleScene extends Phaser.Scene {
  constructor() {
    super('TitleScene');
  }

  create() {
    this.add.rectangle(480, 320, 960, 640, 0x0c0d0a, 1);

    this.add.text(480, 200, 'WASTEBOND', {
      fontFamily: 'monospace', fontSize: '64px', color: '#e0a83a', fontStyle: 'bold',
    }).setOrigin(0.5);

    this.add.text(480, 260, 'TAME.  FIGHT.  SURVIVE.', {
      fontFamily: 'monospace', fontSize: '16px', color: '#9dff5c', letterSpacing: 4,
    }).setOrigin(0.5);

    this.add.text(480, 340, OVERVIEW, {
      fontFamily: 'monospace', fontSize: '13px', color: '#c9a876', align: 'center',
    }).setOrigin(0.5);

    const prompt = this.add.text(480, 460, 'PRESS ENTER TO BEGIN', {
      fontFamily: 'monospace', fontSize: '14px', color: '#e0a83a',
    }).setOrigin(0.5);
    this.tweens.add({ targets: prompt, alpha: 0.3, duration: 700, yoyo: true, repeat: -1 });

    const start = () => this.scene.start('OverworldScene');
    this.input.keyboard.once('keydown-ENTER', start);
    this.input.keyboard.once('keydown-SPACE', start);
    this.input.once('pointerdown', start);
  }
}
