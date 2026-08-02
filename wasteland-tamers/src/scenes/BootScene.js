import Phaser from 'phaser';
import { preloadRealArt } from '../gen/spriteGen.js';
import { SFX, BGM } from '../audio/sound.js';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    // BASE_URL is '/' in dev but a subpath (e.g. '/softsmith-devhub/') on
    // GitHub Pages -- every asset path below is relative to it so builds
    // work from either root.
    this.load.setBaseURL(import.meta.env.BASE_URL);

    preloadRealArt(this);
    this.load.image('bg-ashvale-dusk', 'backgrounds/ashvale-dusk.png');
    this.load.image('bg-town-infirmary', 'backgrounds/infirmary.png');
    this.load.image('bg-town-creature-market', 'backgrounds/creature-market.png');
    this.load.image('bg-town-town-square', 'backgrounds/town-square.png');
    this.load.image('bg-town-forge', 'backgrounds/forge.png');
    this.load.image('bg-town-general-store', 'backgrounds/general-store.png');
    this.load.image('bg-chemical-wash', 'backgrounds/chemical-wash.png');
    this.load.image('bg-furnace-mile', 'backgrounds/furnace-mile.png');
    this.load.image('bg-dead-towers', 'backgrounds/dead-towers.png');

    this.load.image('tile-ground', 'tiles/ground.png');
    this.load.image('tile-scrub', 'tiles/scrub.png');
    this.load.image('tile-rubble', 'tiles/rubble.png');
    this.load.image('tile-road', 'tiles/road.png');

    this.load.image('icon-status-poison', 'icons/status-poison.png');
    this.load.image('icon-status-confuse', 'icons/status-confuse.png');
    this.load.image('icon-status-sleep', 'icons/status-sleep.png');

    this.load.image('ui-notice-frame', 'ui/notice-frame.png');
    this.load.image('ui-swap-frame', 'ui/swap-frame.png');
    this.load.image('ui-inventory-frame', 'ui/inventory-frame.png');

    this.load.image('icon-item-lure', 'props/icon-lure.png');
    this.load.image('icon-item-stim', 'props/icon-stim.png');
    this.load.image('icon-item-antidote', 'props/icon-antidote.png');

    this.load.image('prop-shack', 'props/prop-shack.png');
    this.load.image('prop-tent', 'props/prop-tent2.png');
    this.load.image('prop-crate', 'props/prop-crate.png');
    this.load.image('prop-barrel', 'props/prop-barrel.png');
    this.load.image('prop-tree', 'props/prop-tree.png');
    this.load.image('prop-scrap', 'props/prop-scrap.png');
    this.load.image('prop-boulder', 'props/prop-boulder.png');
    this.load.image('prop-tower', 'props/prop-tower.png');
    this.load.image('prop-gate', 'props/prop-gate.png');
    this.load.image('prop-sign', 'props/prop-sign.png');
    this.load.image('prop-lamp', 'props/prop-lamp.png');

    this.load.audio(SFX.footstep, 'audio/sfx/footstep.mp3');
    this.load.audio(SFX.battleStart, 'audio/sfx/battle-start.mp3');
    this.load.audio(SFX.attackHit, 'audio/sfx/attack-hit.mp3');
    this.load.audio(SFX.captureSuccess, 'audio/sfx/capture-success.mp3');
    this.load.audio(SFX.captureFail, 'audio/sfx/capture-fail.mp3');
    this.load.audio(SFX.fleeWhoosh, 'audio/sfx/flee-whoosh.mp3');
    this.load.audio(BGM.overworld, 'audio/music/overworld-ambient.mp3');
    this.load.audio(BGM.battle, 'audio/music/battle-theme.mp3');
  }

  create() {
    this.scene.start('TitleScene');
  }
}
