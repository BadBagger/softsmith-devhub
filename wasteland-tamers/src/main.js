import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene.js';
import { TitleScene } from './scenes/TitleScene.js';
import { OverworldScene } from './scenes/OverworldScene.js';
import { TownMapScene } from './scenes/TownMapScene.js';
import { TownScene } from './scenes/TownScene.js';
import { PartyScene } from './scenes/PartyScene.js';
import { BattleScene } from './scenes/BattleScene.js';
import { CampaignScene } from './scenes/CampaignScene.js';
import { DistrictScene } from './scenes/DistrictScene.js';
import { EndingScene } from './scenes/EndingScene.js';

const config = {
  type: Phaser.AUTO,
  parent: 'game-root',
  width: 960,
  height: 640,
  pixelArt: false,
  antialias: true,
  backgroundColor: '#0c0d0a',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  input: {
    activePointers: 2, // one for movement/menu taps, one free for a second touch
  },
  physics: {
    default: 'arcade',
    arcade: { debug: false },
  },
  scene: [BootScene, TitleScene, OverworldScene, TownMapScene, TownScene, PartyScene, BattleScene, CampaignScene, DistrictScene, EndingScene],
};

const game = new Phaser.Game(config);

// Mobile browsers can finish changing the visual viewport after Phaser has
// created its FIT canvas. Set the parent to the actual visible viewport and
// measure it before refreshing (Phaser's refresh alone scales using its last
// parent measurement). The short follow-up passes cover address-bar settling
// after a cold load, while visualViewport events cover later bar/orientation
// changes.
function installMobileViewportSync(phaserGame) {
  const root = document.getElementById('game-root');
  const viewport = window.visualViewport;
  let frameId = 0;

  const refresh = () => {
    frameId = 0;
    const height = Math.round(viewport?.height ?? window.innerHeight);
    root.style.setProperty('--game-viewport-height', `${height}px`);
    phaserGame.scale.getParentBounds();
    phaserGame.scale.refresh();
  };

  const queueRefresh = () => {
    if (frameId) cancelAnimationFrame(frameId);
    frameId = requestAnimationFrame(refresh);
  };

  queueRefresh();
  [100, 350, 1000].forEach((delay) => window.setTimeout(queueRefresh, delay));
  window.addEventListener('resize', queueRefresh, { passive: true });
  window.addEventListener('orientationchange', queueRefresh, { passive: true });
  viewport?.addEventListener('resize', queueRefresh, { passive: true });
  viewport?.addEventListener('scroll', queueRefresh, { passive: true });
}

installMobileViewportSync(game);
