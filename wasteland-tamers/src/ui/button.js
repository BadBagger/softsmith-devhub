import { gameState } from '../state/gameState.js';

// Small reusable tappable "terminal" button for on-screen touch controls.
// Mouse/keyboard players can ignore these entirely -- they exist because
// the game otherwise has no touch input path at all. Screen-fixed and
// drawn above gameplay by default.
export function makeButton(scene, x, y, label, onDown, opts = {}) {
  const width = opts.width ?? 56;
  const height = opts.height ?? 40;
  const bg = scene.add.rectangle(x, y, width, height, 0x1c2018, 0.85)
    .setStrokeStyle(1, 0x3a3d3c)
    .setScrollFactor(0)
    .setDepth(opts.depth ?? 30)
    .setInteractive({ useHandCursor: true });
  const text = scene.add.text(x, y, label, {
    fontFamily: 'monospace', fontSize: opts.fontSize ?? '16px', color: '#c9a876',
  }).setOrigin(0.5).setScrollFactor(0).setDepth((opts.depth ?? 30) + 1);

  bg.on('pointerdown', () => {
    bg.fillColor = 0x2a2d24;
    if (!gameState.world.accessibility?.reducedMotion) {
      scene.tweens.add({ targets: [bg, text], scaleX: 0.94, scaleY: 0.94, duration: 55, yoyo: true, ease: 'Sine.Out' });
    }
    onDown();
  });
  const release = () => {
    bg.fillColor = 0x1c2018;
    opts.onUp?.();
  };
  bg.on('pointerup', release);
  bg.on('pointerout', release);
  return { bg, text };
}
