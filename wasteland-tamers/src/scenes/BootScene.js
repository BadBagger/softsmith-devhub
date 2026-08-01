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

    this.load.image('tile-ground', 'tiles/ground.png');
    this.load.image('tile-scrub', 'tiles/scrub.png');
    this.load.image('tile-rubble', 'tiles/rubble.png');
    this.load.image('tile-road', 'tiles/road.png');

    this.load.image('icon-status-poison', 'icons/status-poison.png');
    this.load.image('icon-status-confuse', 'icons/status-confuse.png');
    this.load.image('icon-status-sleep', 'icons/status-sleep.png');

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
