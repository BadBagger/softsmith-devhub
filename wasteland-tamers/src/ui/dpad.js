import { makeButton } from './button.js';

// Sets scene.touchDx/touchDy from an on-screen D-pad. The calling scene
// merges these into its normal movement-key checks (touchDx/touchDy stay
// set while a button is held, cleared on release, same shape as an
// isDown keyboard key) -- shared by OverworldScene and TownMapScene since
// both need identical grid-step movement with a touch fallback.
export function buildDpad(scene, cx, cy) {
  scene.touchDx = 0;
  scene.touchDy = 0;
  const gap = 44;
  const set = (dx, dy) => () => { scene.touchDx = dx; scene.touchDy = dy; };
  const clear = () => { scene.touchDx = 0; scene.touchDy = 0; };
  makeButton(scene, cx, cy - gap, '▲', set(0, -1), { onUp: clear });
  makeButton(scene, cx, cy + gap, '▼', set(0, 1), { onUp: clear });
  makeButton(scene, cx - gap, cy, '◀', set(-1, 0), { onUp: clear });
  makeButton(scene, cx + gap, cy, '▶', set(1, 0), { onUp: clear });
}
