import test from 'node:test';
import assert from 'node:assert/strict';
import {
  gameState, resetGameState, addScrap, recordDistrictVictory, repairRelay, gainExperience,
  addToParty, battleSquad, nextBattleCreature, activateLandmark, claimDistrictQuest, hasModule,
} from '../src/state/gameState.js';
import { spawnCreature } from '../src/data/creatures.js';
import { migrateSave } from '../src/state/save.js';

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

test('district landmarks gate and award a module exactly once', () => {
  resetGameState();
  assert.equal(activateLandmark('chemical-wash', 'north'), true);
  assert.equal(activateLandmark('chemical-wash', 'north'), false);
  activateLandmark('chemical-wash', 'center');
  assert.equal(claimDistrictQuest('chemical-wash', { module: 'field-filter', scrap: 18 }), false);
  activateLandmark('chemical-wash', 'south');
  assert.equal(claimDistrictQuest('chemical-wash', { module: 'field-filter', scrap: 18 }), true);
  assert.equal(hasModule('field-filter'), true);
  assert.equal(claimDistrictQuest('chemical-wash', { module: 'field-filter', scrap: 18 }), false);
});

test('battle squad is the first three healthy creatures and rotates past a fainted lead', () => {
  resetGameState();
  const first = spawnCreature('hound-t1');
  const second = spawnCreature('serpent-t1');
  const third = spawnCreature('wraith-t1');
  const reserve = spawnCreature('titan-t1');
  [first, second, third, reserve].forEach(addToParty);
  first.hp = 0;
  assert.equal(battleSquad().length, 3);
  assert.equal(nextBattleCreature(first), second);
});

test('version-one saves gain district and accessibility defaults', () => {
  const migrated = migrateSave({ version: 1, state: { party: [], world: { repaired: 1 } } });
  assert.deepEqual(migrated.world.districtProgress, {});
  assert.deepEqual(migrated.world.modules, []);
  assert.equal(migrated.world.accessibility.reducedMotion, false);
});
