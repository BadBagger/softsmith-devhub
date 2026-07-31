import Phaser from 'phaser';
import { cycleDifficulty, currentDifficulty } from '../state/gameState.js';

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
    this.buildBackdrop();

    this.add.text(480, 160, 'WASTEBOND', {
      fontFamily: 'monospace', fontSize: '64px', color: '#e0a83a', fontStyle: 'bold',
    }).setOrigin(0.5);

    this.add.text(480, 220, 'TAME.  FIGHT.  SURVIVE.', {
      fontFamily: 'monospace', fontSize: '16px', color: '#9dff5c', letterSpacing: 4,
    }).setOrigin(0.5);

    this.add.text(480, 300, OVERVIEW, {
      fontFamily: 'monospace', fontSize: '13px', color: '#c9a876', align: 'center',
    }).setOrigin(0.5);

    this.buildDifficultySelector();

    const prompt = this.add.text(480, 520, 'PRESS ENTER TO BEGIN', {
      fontFamily: 'monospace', fontSize: '14px', color: '#e0a83a',
    }).setOrigin(0.5);
    this.tweens.add({ targets: prompt, alpha: 0.3, duration: 700, yoyo: true, repeat: -1 });

    const start = () => this.scene.start('OverworldScene');
    this.input.keyboard.once('keydown-ENTER', start);
    this.input.keyboard.once('keydown-SPACE', start);
  }

  buildBackdrop() {
    const bg = this.add.image(480, 320, 'bg-ashvale-dusk');
    const scale = Math.max(960 / bg.width, 640 / bg.height);
    bg.setScale(scale);
    // Dark gradient-ish overlay so the title/menu text stays readable
    // over the painted scene rather than fighting it for contrast.
    this.add.rectangle(480, 320, 960, 640, 0x0c0d0a, 0.55);
  }

  buildDifficultySelector() {
    this.add.text(480, 400, 'DIFFICULTY', {
      fontFamily: 'monospace', fontSize: '12px', color: '#c9a876',
    }).setOrigin(0.5);

    this.diffLabel = this.add.text(480, 424, '', {
      fontFamily: 'monospace', fontSize: '18px', color: '#e0a83a',
    }).setOrigin(0.5);

    this.diffTagline = this.add.text(480, 452, '', {
      fontFamily: 'monospace', fontSize: '12px', color: '#9dff5c',
    }).setOrigin(0.5);

    this.renderDifficulty(currentDifficulty());

    this.input.keyboard.on('keydown-LEFT', () => this.renderDifficulty(cycleDifficulty(-1)));
    this.input.keyboard.on('keydown-RIGHT', () => this.renderDifficulty(cycleDifficulty(1)));
  }

  renderDifficulty(diff) {
    this.diffLabel.setText(`<  ${diff.name.toUpperCase()}  >`);
    this.diffTagline.setText(diff.tagline);
  }
}
