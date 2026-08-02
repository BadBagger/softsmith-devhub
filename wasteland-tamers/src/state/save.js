import { gameState, resetGameState } from './gameState.js';

const SAVE_KEY = 'wastebond-save-v1';
const SAVE_VERSION = 1;

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
    if (saved?.version !== SAVE_VERSION || !saved.state || !Array.isArray(saved.state.party)) return false;
    resetGameState(saved.state);
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
