import test from 'node:test';
import assert from 'node:assert/strict';
import { gameState, resetGameState, addScrap, recordDistrictVictory, repairRelay, gainExperience } from '../src/state/gameState.js';
import { spawnCreature } from '../src/data/creatures.js';

test('relay repair consumes a recovered component and its scrap cost', () => {
  resetGameState();
  gameState.scrap = 30;
  assert.equal(recordDistrictVictory('chemical-wash', 0), true);
  assert.equal(repairRelay('chemical-wash', 25), true);
  assert.equal(gameState.world.repaired, 1);
  assert.equal(gameState.scrap, 5);
  assert.equal(gameState.world.components.length, 0);
});

test('the same district cannot award a component twice', () => {
  resetGameState();
  addScrap(10);
  assert.equal(recordDistrictVictory('chemical-wash', 15), true);
  assert.equal(recordDistrictVictory('chemical-wash', 15), false);
  assert.equal(gameState.scrap, 43);
});

test('captured creatures gain levels and durable combat stats', () => {
  const creature = spawnCreature('hound-t1');
  const beforeHp = creature.maxHp;
  const result = gainExperience(creature, 100);
  assert.equal(result.leveled, true);
  assert.ok(creature.level > 1);
  assert.ok(creature.maxHp > beforeHp);
  assert.ok(creature.cooldowns);
});
