import Phaser from 'phaser';
import { gameState } from '../state/gameState.js';
import { hasBond, bondTier } from '../state/bond.js';
import { portraitTextureKey } from '../gen/spriteGen.js';
import { makeButton } from '../ui/button.js';
import { saveGame } from '../state/save.js';

const TERMINAL_GREEN = '#9dff5c';
const AMBER = '#e0a83a';

export class PartyScene extends Phaser.Scene {
  constructor() {
    super('PartyScene');
  }

  create() {
    this.pairIndex = 0;

    this.add.rectangle(480, 320, 960, 640, 0x0c0d0a, 1);
    this.add.text(480, 26, 'PARTY MANAGEMENT', {
      fontFamily: 'monospace', fontSize: '20px', color: AMBER, fontStyle: 'bold',
    }).setOrigin(0.5);
    this.add.text(480, 54, 'Slots 1–3 are your active battle squad. Slot 1 leads.', {
      fontFamily: 'monospace', fontSize: '12px', color: '#c9a876',
    }).setOrigin(0.5);

    this.frame = this.add.image(480, 340, 'ui-swap-frame');
    this.frame.setScale(880 / this.frame.width);

    this.leftPortrait = this.add.image(212, 220, '__DEFAULT').setScale(0.5).setVisible(false);
    this.rightPortrait = this.add.image(747, 220, '__DEFAULT').setScale(0.5).setVisible(false);

    this.leftText = this.add.text(212, 320, '', {
      fontFamily: 'monospace', fontSize: '13px', color: '#2a2410', align: 'center', wordWrap: { width: 280 },
    }).setOrigin(0.5);
    this.rightText = this.add.text(747, 320, '', {
      fontFamily: 'monospace', fontSize: '13px', color: '#2a2410', align: 'center', wordWrap: { width: 280 },
    }).setOrigin(0.5);

    this.pageText = this.add.text(480, 470, '', {
      fontFamily: 'monospace', fontSize: '12px', color: '#c9a876',
    }).setOrigin(0.5);

    makeButton(this, 90, 610, '◀ PAIR', () => this.cyclePair(-1), { width: 100, height: 34 });
    this.swapBtn = makeButton(this, 480, 300, 'SWAP', () => this.swapPair(), { width: 100, height: 44, fontSize: '13px' });
    makeButton(this, 870, 610, 'PAIR ▶', () => this.cyclePair(1), { width: 100, height: 34 });
    makeButton(this, 480, 610, 'LEAVE', () => this.leaveParty(), { width: 100, height: 34 });

    this.render();

    this.input.keyboard.on('keydown-LEFT', () => this.cyclePair(-1));
    this.input.keyboard.on('keydown-RIGHT', () => this.cyclePair(1));
    this.input.keyboard.on('keydown-ENTER', () => this.swapPair());
    this.input.keyboard.on('keydown-SPACE', () => this.swapPair());
    this.input.keyboard.on('keydown-ESC', () => this.leaveParty());
  }

  maxPairIndex() {
    return Math.max(0, Math.ceil(gameState.party.length / 2) - 1);
  }

  cyclePair(delta) {
    const max = this.maxPairIndex();
    this.pairIndex = Phaser.Math.Clamp(this.pairIndex + delta, 0, max);
    this.render();
  }

  describe(creature, slotIndex) {
    if (!creature) return 'EMPTY SLOT';
    const lines = [creature.name.toUpperCase(), `HP ${creature.hp}/${creature.maxHp}`];
    if (hasBond(creature)) lines.push(`BOND: ${bondTier(creature.bond).name.toUpperCase()}`);
    if (slotIndex === 0) lines.push('-- LEADS BATTLES --');
    else if (slotIndex < 3) lines.push('-- ACTIVE SQUAD --');
    return lines.join('\n');
  }

  render() {
    const leftIdx = this.pairIndex * 2;
    const rightIdx = leftIdx + 1;
    const left = gameState.party[leftIdx] ?? null;
    const right = gameState.party[rightIdx] ?? null;

    this.leftText.setText(this.describe(left, leftIdx));
    this.rightText.setText(this.describe(right, rightIdx));

    this.leftPortrait.setVisible(!!left);
    if (left) this.leftPortrait.setTexture(portraitTextureKey(this, left));
    this.rightPortrait.setVisible(!!right);
    if (right) this.rightPortrait.setTexture(portraitTextureKey(this, right));

    const max = this.maxPairIndex();
    this.pageText.setText(gameState.party.length === 0
      ? 'No creatures captured yet.'
      : `Pair ${this.pairIndex + 1}/${max + 1}   Party ${gameState.party.length}/${gameState.maxPartySize}`);

    this.swapBtn.bg.setVisible(!!left && !!right);
    this.swapBtn.text.setVisible(!!left && !!right);
  }

  swapPair() {
    const leftIdx = this.pairIndex * 2;
    const rightIdx = leftIdx + 1;
    if (!gameState.party[leftIdx] || !gameState.party[rightIdx]) return;
    [gameState.party[leftIdx], gameState.party[rightIdx]] = [gameState.party[rightIdx], gameState.party[leftIdx]];
    saveGame('party-reorder');
    this.render();
  }

  leaveParty() {
    this.scene.stop();
    this.scene.wake('OverworldScene');
  }
}
