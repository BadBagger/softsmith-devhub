// Thin helpers over Phaser's sound manager. `scene.sound` is actually the
// game-wide SoundManager (shared across every scene in this Phaser.Game
// instance), so a track started in one scene can be found and controlled
// from another via `sound.get(key)` -- that's what lets the overworld
// theme pause for battle and resume afterward instead of restarting.

export const SFX = {
  footstep: 'sfx-footstep',
  battleStart: 'sfx-battle-start',
  attackHit: 'sfx-attack-hit',
  captureSuccess: 'sfx-capture-success',
  captureFail: 'sfx-capture-fail',
  fleeWhoosh: 'sfx-flee-whoosh',
  bigSplash: 'sfx-big-splash',
  floorCollapse: 'sfx-floor-collapse',
};

export const BGM = {
  overworld: 'bgm-overworld',
  battle: 'bgm-battle',
};

export function playSfx(scene, key, volume = 0.6) {
  scene.sound.play(key, { volume });
}

export function playMusic(scene, key, volume) {
  const existing = scene.sound.get(key);
  if (existing) {
    if (!existing.isPlaying) existing.resume ? existing.resume() : existing.play();
    return existing;
  }
  return scene.sound.play(key, { loop: true, volume });
}

export function pauseMusic(scene, key) {
  const existing = scene.sound.get(key);
  if (existing?.isPlaying) existing.pause();
}

export function stopMusic(scene, key) {
  scene.sound.get(key)?.stop();
}
