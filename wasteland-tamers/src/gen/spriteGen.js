// Procedural placeholder sprites. Each FAMILY silhouette is code-drawn once
// per (species, strain) combo and cached as a Phaser texture. This exists
// to make every creature visually distinct *now*, in this palette, without
// blocking on hand-painted or AI-generated art -- swap generateTexture calls
// out for loaded spritesheets later without touching gameplay code.

const TIER_SIZE = { 1: 48, 2: 64, 3: 96 };

// Real (AI-generated, chroma-keyed, sliced by tools/process_sprites.py)
// 4-pose art, keyed by species id. Baseline strain only -- strains fall
// back to the procedural silhouette until we have art per-strain too.
const REAL_ART_FOLDERS = {
  'vermin-t1': 'glowmite',
  'vermin-t2': 'radrat',
  'hound-t1': 'snarlpup',
  'hound-t2': 'scraphowler',
  'hound-t3': 'diremaw',
  'titan-t1': 'rustling',
  'titan-t2': 'ironhide',
  'titan-t3': 'ironback_titan',
  'swarm-t1': 'buzzmite',
  'swarm-t2': 'hiveborn',
  'serpent-t1': 'sandviper',
  'serpent-t2': 'toxicoil',
  'serpent-t3': 'wyrmrot',
  'avian-t1': 'featherscrap',
  'avian-t2': 'rustwing',
  'avian-t3': 'skytearer',
  'sludge-t1': 'ooze',
  'sludge-t3': 'tarbehemoth',
  'wraith-t1': 'whisp',
  'wraith-t2': 'fumewraith',
  // Missing (still procedural fallback): vermin-t3, swarm-t3, sludge-t2, wraith-t3.
};
const REAL_ART_FRAME_COUNT = 4;

export function hasRealArt(speciesId) {
  return speciesId in REAL_ART_FOLDERS;
}

export function realArtFrameKeys(speciesId) {
  const folder = REAL_ART_FOLDERS[speciesId];
  if (!folder) return null;
  return Array.from({ length: REAL_ART_FRAME_COUNT }, (_, i) => `art-${folder}-${i}`);
}

export function playerFrameKeys() {
  return Array.from({ length: REAL_ART_FRAME_COUNT }, (_, i) => `art-scavenger-${i}`);
}

// Separate top-down/chibi angle art, used for the overworld map instead of
// the side-view battle poses above -- same character, different camera angle.
export function overworldPlayerFrameKeys() {
  return Array.from({ length: REAL_ART_FRAME_COUNT }, (_, i) => `art-scavenger-ow-${i}`);
}

export function preloadRealArt(scene) {
  for (const folder of Object.values(REAL_ART_FOLDERS)) {
    for (let i = 0; i < REAL_ART_FRAME_COUNT; i++) {
      scene.load.image(`art-${folder}-${i}`, `/sprites/${folder}/frame_${i}.png`);
    }
  }
  for (let i = 0; i < REAL_ART_FRAME_COUNT; i++) {
    scene.load.image(`art-scavenger-${i}`, `/sprites/scavenger/frame_${i}.png`);
    scene.load.image(`art-scavenger-ow-${i}`, `/sprites/scavenger_overworld/frame_${i}.png`);
  }
}

const SILHOUETTE_DRAWERS = {
  'quadruped-small': drawQuadrupedSmall,
  'quadruped-lean': drawQuadrupedLean,
  'quadruped-armored': drawQuadrupedArmored,
  insectoid: drawInsectoid,
  sinuous: drawSinuous,
  winged: drawWinged,
  blob: drawBlob,
  wisp: drawWisp,
};

export function textureKeyFor(creature) {
  const strain = creature.strainTint ? creature.strainTint.toString(16) : 'base';
  return `creature-${creature.speciesId}-${strain}`;
}

export function ensureCreatureTexture(scene, creature) {
  const key = textureKeyFor(creature);
  if (scene.textures.exists(key)) return key;

  const size = TIER_SIZE[creature.tier] ?? 64;
  const g = scene.add.graphics();
  const draw = SILHOUETTE_DRAWERS[creature.silhouette] ?? drawBlob;
  draw(g, size, creature.baseColor, creature.accentColor, creature.strainTint);
  g.generateTexture(key, size, size);
  g.destroy();
  return key;
}

function eyeColor(strainTint) {
  return strainTint ?? 0xd9ff5c;
}

function drawQuadrupedSmall(g, size, base, accent, tint) {
  const c = size / 2;
  g.fillStyle(tint ?? base, 1);
  g.fillEllipse(c, c + size * 0.08, size * 0.55, size * 0.38);
  g.fillStyle(base, 1);
  [-0.28, -0.14, 0.14, 0.28].forEach((dx) => {
    g.fillRect(c + dx * size, c + size * 0.2, size * 0.08, size * 0.22);
  });
  g.fillStyle(accent, 1);
  for (let i = -2; i <= 2; i++) {
    g.fillTriangle(
      c + i * size * 0.1, c - size * 0.18,
      c + i * size * 0.1 - size * 0.04, c - size * 0.32,
      c + i * size * 0.1 + size * 0.04, c - size * 0.32,
    );
  }
  g.fillStyle(eyeColor(tint), 1);
  g.fillCircle(c - size * 0.14, c, size * 0.05);
  g.fillCircle(c + size * 0.14, c, size * 0.05);
  g.fillStyle(tint ?? base, 1);
  g.fillEllipse(c + size * 0.4, c + size * 0.02, size * 0.32, size * 0.06);
}

function drawQuadrupedLean(g, size, base, accent, tint) {
  const c = size / 2;
  g.fillStyle(tint ?? base, 1);
  g.fillEllipse(c, c + size * 0.05, size * 0.6, size * 0.3);
  g.fillTriangle(
    c + size * 0.28, c - size * 0.05,
    c + size * 0.46, c - size * 0.02,
    c + size * 0.3, c + size * 0.16,
  );
  g.fillStyle(base, 1);
  [-0.3, -0.16, 0.1, 0.24].forEach((dx) => {
    g.fillRect(c + dx * size, c + size * 0.14, size * 0.06, size * 0.3);
  });
  g.fillStyle(accent, 1);
  for (let i = -2; i <= 1; i++) {
    g.fillTriangle(
      c + i * size * 0.12 - size * 0.1, c - size * 0.12,
      c + i * size * 0.12 - size * 0.15, c - size * 0.26,
      c + i * size * 0.12 - size * 0.05, c - size * 0.26,
    );
  }
  g.fillStyle(eyeColor(tint), 1);
  g.fillCircle(c + size * 0.33, c - size * 0.02, size * 0.045);
}

function drawQuadrupedArmored(g, size, base, accent, tint) {
  const c = size / 2;
  g.fillStyle(base, 1);
  g.fillRoundedRect(c - size * 0.32, c - size * 0.14, size * 0.64, size * 0.34, size * 0.08);
  g.fillStyle(tint ?? accent, 1);
  for (let i = -1; i <= 1; i++) {
    g.fillRoundedRect(c + i * size * 0.2 - size * 0.08, c - size * 0.24, size * 0.16, size * 0.16, size * 0.03);
  }
  g.fillStyle(base, 1);
  [-0.24, 0.18].forEach((dx) => {
    g.fillRect(c + dx * size, c + size * 0.16, size * 0.1, size * 0.18);
  });
  g.fillStyle(accent, 1);
  g.fillTriangle(
    c - size * 0.4, c - size * 0.02,
    c - size * 0.5, c - size * 0.08,
    c - size * 0.4, c + size * 0.08,
  );
  g.fillStyle(eyeColor(tint), 1);
  g.fillCircle(c - size * 0.36, c - size * 0.02, size * 0.04);
}

function drawInsectoid(g, size, base, accent, tint) {
  const c = size / 2;
  g.fillStyle(tint ?? base, 1);
  g.fillCircle(c - size * 0.18, c, size * 0.16);
  g.fillEllipse(c + size * 0.12, c, size * 0.28, size * 0.2);
  g.fillEllipse(c + size * 0.36, c, size * 0.2, size * 0.14);
  g.fillStyle(accent, 1);
  for (let i = 0; i < 3; i++) {
    const y = c - size * 0.1 + i * size * 0.1;
    g.fillTriangle(c, y, c - size * 0.3, y - size * 0.06, c - size * 0.3, y + size * 0.06);
    g.fillTriangle(c, y, c + size * 0.3, y - size * 0.06, c + size * 0.3, y + size * 0.06);
  }
  g.lineStyle(Math.max(1, size * 0.02), accent, 1);
  g.lineBetween(c - size * 0.24, c - size * 0.14, c - size * 0.36, c - size * 0.28);
  g.lineBetween(c - size * 0.18, c - size * 0.18, c - size * 0.28, c - size * 0.34);
  g.fillStyle(eyeColor(tint), 1);
  g.fillCircle(c - size * 0.22, c - size * 0.04, size * 0.04);
}

function drawSinuous(g, size, base, accent, tint) {
  const c = size / 2;
  g.fillStyle(tint ?? base, 1);
  const points = [
    [c - size * 0.36, c + size * 0.1],
    [c - size * 0.16, c - size * 0.14],
    [c + size * 0.08, c + size * 0.12],
    [c + size * 0.3, c - size * 0.08],
  ];
  for (const [x, y] of points) g.fillCircle(x, y, size * 0.11);
  g.fillStyle(accent, 1);
  g.fillTriangle(
    c + size * 0.3, c - size * 0.08,
    c + size * 0.42, c - size * 0.14,
    c + size * 0.4, c - size * 0.02,
  );
  g.fillStyle(eyeColor(tint), 1);
  g.fillCircle(c + size * 0.32, c - size * 0.11, size * 0.035);
}

function drawWinged(g, size, base, accent, tint) {
  const c = size / 2;
  g.fillStyle(tint ?? base, 1);
  g.fillEllipse(c, c + size * 0.06, size * 0.3, size * 0.34);
  g.fillCircle(c, c - size * 0.2, size * 0.14);
  g.fillStyle(accent, 1);
  g.fillTriangle(
    c - size * 0.12, c,
    c - size * 0.46, c - size * 0.18,
    c - size * 0.1, c + size * 0.14,
  );
  g.fillTriangle(
    c + size * 0.12, c,
    c + size * 0.46, c - size * 0.18,
    c + size * 0.1, c + size * 0.14,
  );
  g.fillStyle(0xd9902b, 1);
  g.fillTriangle(
    c, c - size * 0.2,
    c - size * 0.06, c - size * 0.1,
    c + size * 0.06, c - size * 0.1,
  );
  g.fillStyle(eyeColor(tint), 1);
  g.fillCircle(c - size * 0.03, c - size * 0.22, size * 0.03);
}

function drawBlob(g, size, base, accent, tint) {
  const c = size / 2;
  g.fillStyle(tint ?? base, 0.92);
  g.fillCircle(c, c + size * 0.1, size * 0.34);
  g.fillCircle(c - size * 0.16, c - size * 0.02, size * 0.18);
  g.fillCircle(c + size * 0.18, c - size * 0.04, size * 0.2);
  g.fillStyle(accent, 0.85);
  g.fillCircle(c - size * 0.08, c + size * 0.14, size * 0.06);
  g.fillCircle(c + size * 0.14, c + size * 0.2, size * 0.05);
  g.fillStyle(eyeColor(tint), 1);
  g.fillCircle(c - size * 0.06, c - size * 0.02, size * 0.045);
  g.fillCircle(c + size * 0.1, c - size * 0.02, size * 0.045);
}

function drawWisp(g, size, base, accent, tint) {
  const c = size / 2;
  g.fillStyle(tint ?? base, 0.55);
  g.fillCircle(c, c, size * 0.32);
  g.fillStyle(accent, 0.45);
  g.fillCircle(c - size * 0.12, c - size * 0.1, size * 0.16);
  g.fillCircle(c + size * 0.14, c + size * 0.08, size * 0.14);
  g.lineStyle(Math.max(1, size * 0.025), tint ?? accent, 0.6);
  g.beginPath();
  g.moveTo(c - size * 0.1, c + size * 0.3);
  g.lineTo(c - size * 0.02, c + size * 0.44);
  g.moveTo(c + size * 0.1, c + size * 0.28);
  g.lineTo(c + size * 0.18, c + size * 0.44);
  g.strokePath();
  g.fillStyle(eyeColor(tint) ?? 0xffffff, 0.95);
  g.fillCircle(c - size * 0.06, c - size * 0.02, size * 0.04);
  g.fillCircle(c + size * 0.08, c - size * 0.02, size * 0.04);
}
