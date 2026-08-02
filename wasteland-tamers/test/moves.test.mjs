import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnCreature } from '../src/data/creatures.js';
import { knownMovesFor, movesForCreature } from '../src/data/moves.js';

test('each family exposes a four-move tactical set', () => {
  const creature = spawnCreature('wraith-t1');
  assert.equal(movesForCreature(creature).length, 4);
  assert.equal(knownMovesFor(creature).length, 1);
  creature.level = 20;
  assert.equal(knownMovesFor(creature).length, 4);
});
