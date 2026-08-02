import Phaser from 'phaser';
import { gameState, addItem } from '../state/gameState.js';
import { ITEMS, randomItemId } from '../data/items.js';
import { TOWN_LOCATIONS, NOTICES } from '../data/townLocations.js';
import { makeButton } from '../ui/button.js';

const ACTION_LABEL = { rest: 'REST', read: 'READ', scavenge: 'BROWSE' };

// The interior view for a single building -- which one is decided by
// TownMapScene.enterBuilding() via the locationId passed in scene data.
export class TownScene extends Phaser.Scene {
  constructor() {
    super('TownScene');
  }

  init(data) {
    this.location = TOWN_LOCATIONS[data.locationId];
  }

  create() {
    this.backdrop = this.add.image(480, 320, this.location.key);
    this.fitBackdrop();

    this.add.rectangle(0, 0, 960, 48, 0x0c0d0a, 0.85)
      .setOrigin(0, 0).setDepth(10);
    this.titleText = this.add.text(10, 6, this.location.title, {
      fontFamily: 'monospace', fontSize: '18px', color: '#e0a83a', fontStyle: 'bold',
    }).setDepth(11);
    this.pageText = this.add.text(950, 6, 'ESC to step outside', {
      fontFamily: 'monospace', fontSize: '12px', color: '#c9a876',
    }).setOrigin(1, 0).setDepth(11);

    this.add.rectangle(0, 564, 960, 76, 0x0c0d0a, 0.85)
      .setOrigin(0, 0).setDepth(10);
    this.flavorText = this.add.text(10, 572, '', {
      fontFamily: 'monospace', fontSize: '12px', color: '#9dff5c', wordWrap: { width: 940 },
    }).setDepth(11);
    this.actionHint = this.add.text(950, 594, '', {
      fontFamily: 'monospace', fontSize: '11px', color: '#e0a83a',
    }).setOrigin(1, 0).setDepth(11);

    this.actionBtn = makeButton(this, 480, 610, '', () => this.runAction(), { width: 220, height: 34, depth: 12 });
    makeButton(this, 900, 610, 'LEAVE', () => this.leaveBuilding(), { width: 90, height: 34, depth: 12 });

    this.buildNoticeModal();
    this.renderLocation();

    this.input.keyboard.on('keydown-ENTER', () => (this.noticeOpen ? this.closeNotice() : this.runAction()));
    this.input.keyboard.on('keydown-SPACE', () => (this.noticeOpen ? this.closeNotice() : this.runAction()));
    this.input.keyboard.on('keydown-ESC', () => (this.noticeOpen ? this.closeNotice() : this.leaveBuilding()));
  }

  buildNoticeModal() {
    this.noticeOpen = false;
    this.noticeOverlay = this.add.rectangle(480, 320, 960, 640, 0x0c0d0a, 0.75)
      .setDepth(40).setInteractive().on('pointerdown', () => this.closeNotice());
    this.noticeFrame = this.add.image(480, 300, 'ui-notice-frame').setDepth(41);
    this.noticeFrame.setScale(700 / this.noticeFrame.width);
    this.noticeText = this.add.text(480, 290, '', {
      fontFamily: 'monospace', fontSize: '14px', color: '#2a2410',
      align: 'center', wordWrap: { width: 520 },
    }).setOrigin(0.5).setDepth(42);
    this.noticeCloseHint = this.add.text(480, 470, 'TAP, ENTER, OR ESC TO CLOSE', {
      fontFamily: 'monospace', fontSize: '11px', color: '#e0a83a',
    }).setOrigin(0.5).setDepth(42);
    this.setNoticeVisible(false);
  }

  setNoticeVisible(visible) {
    this.noticeOpen = visible;
    this.noticeOverlay.setVisible(visible);
    this.noticeFrame.setVisible(visible);
    this.noticeText.setVisible(visible);
    this.noticeCloseHint.setVisible(visible);
  }

  closeNotice() {
    this.setNoticeVisible(false);
  }

  fitBackdrop() {
    const scale = Math.max(960 / this.backdrop.width, 640 / this.backdrop.height);
    this.backdrop.setScale(scale);
  }

  renderLocation() {
    const loc = this.location;
    const label = ACTION_LABEL[loc.action];
    this.flavorText.setText(loc.flavor);
    this.actionHint.setText(label ? `ENTER or tap ${label}` : '');
    this.actionBtn.text.setText(label ?? '');
    this.actionBtn.bg.setVisible(!!label);
  }

  runAction() {
    const loc = this.location;
    if (loc.action === 'rest') return this.runRest();
    if (loc.action === 'read') return this.runRead();
    if (loc.action === 'scavenge') return this.runScavenge();
  }

  runRest() {
    let healed = 0;
    for (const creature of gameState.party) {
      if (creature.hp < creature.maxHp || creature.status) healed += 1;
      creature.hp = creature.maxHp;
      creature.status = null;
    }
    this.flavorText.setText(
      healed > 0
        ? `The medic patches up the party. ${healed} creature(s) fully rested.`
        : 'The party is already in fighting shape.',
    );
  }

  runRead() {
    const notice = NOTICES[Math.floor(Math.random() * NOTICES.length)];
    this.noticeText.setText(notice);
    this.setNoticeVisible(true);
  }

  runScavenge() {
    const itemId = randomItemId();
    addItem(itemId);
    this.flavorText.setText(`You dig through the shelves and find: ${ITEMS[itemId].name}.`);
  }

  leaveBuilding() {
    this.scene.stop();
    this.scene.wake('TownMapScene');
  }
}
