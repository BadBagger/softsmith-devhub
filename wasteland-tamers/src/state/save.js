import { gameState, resetGameState } from './gameState.js';

const SAVE_KEY = 'wastebond-save-v1';
const SAVE_VERSION = 2;

// Version one only knew the relay counters. Keep old browser saves useful
// rather than making the player restart when richer district state arrives.
export function migrateSave(saved) {
  if (!saved?.state || !Array.isArray(saved.state.party)) return null;
  const state = structuredClone(saved.state);
  state.activePartyIndex ??= 0;
  state.world ??= {};
  state.world.districtProgress ??= {};
  state.world.modules ??= [];
  state.world.accessibility ??= { reducedMotion: false };
  return state;
}

export function saveGame(reason = 'checkpoint') {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({ version: SAVE_VERSION, reason, savedAt: Date.now(), state: gameState }));
    return true;
  } catch {
    return false;
  }
}

export function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return false;
    const saved = JSON.parse(raw);
    if (!saved || saved.version > SAVE_VERSION) return false;
    const migrated = migrateSave(saved);
    if (!migrated) return false;
    resetGameState(migrated);
    return true;
  } catch {
    return false;
  }
}

export function hasSave() {
  try { return !!localStorage.getItem(SAVE_KEY); } catch { return false; }
}

export function clearSave() {
  try { localStorage.removeItem(SAVE_KEY); } catch { /* unavailable storage is non-fatal */ }
}
