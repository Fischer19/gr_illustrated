import test from 'node:test';
import assert from 'node:assert/strict';
import { getBeamSearch } from '../dist/beam-search.js';
import { catalog } from '../dist/catalog.js';

test('width 3 prunes prefixes before expanding and returns the original top three', () => {
  const search = getBeamSearch(3);
  assert.deepEqual(search.rounds.map(round => [round.nodes.length, round.kept]), [[2, 2], [5, 3], [4, 3]]);
  assert.deepEqual(search.candidates.map(node => node.result), ['Trail runner', 'Light trail shoe', 'Hiking boot']);
  assert.deepEqual(search.candidates.map(node => node.score), ['.308', '.252', '.240']);
  const pruned = search.rounds[1].nodes.filter(node => node.pruneAt);
  assert.deepEqual(pruned.map(node => node.code), ['31 · 09', '31 · 18']);
  assert.ok(search.rounds[2].nodes.every(node => !pruned.some(parent => node.parent === parent.id)));
});

test('width 5 expands five live prefixes and resolves five of six IDs', () => {
  const search = getBeamSearch(5);
  assert.deepEqual(search.rounds.map(round => [round.nodes.length, round.kept]), [[2, 2], [5, 5], [6, 5]]);
  assert.deepEqual(search.candidates.map(node => node.result), ['Trail runner', 'Light trail shoe', 'Hiking boot', 'Headphones', 'Studio headphones']);
  assert.deepEqual(search.candidates.map(node => node.score), ['.308', '.252', '.240', '.120', '.050']);
  assert.equal(search.rounds[2].nodes.find(node => node.pruneAt).result, 'Gaming headset');
  assert.ok(Math.abs(search.rounds[2].nodes.reduce((sum, node) => sum + node.probability, 0) - 1) < 1e-12);
  assert.ok(search.candidates.every(node => catalog.some(item => item.id.join(' · ') === node.code)));
});

test('both widths share scores and obey their beam limits in every round', () => {
  const narrow = getBeamSearch(3);
  const wide = getBeamSearch(5);
  for (const search of [narrow, wide]) {
    assert.ok(search.rounds.every(round => round.kept <= search.width));
    assert.ok(search.candidates.every((node, index, nodes) => !index || nodes[index - 1].probability >= node.probability));
  }
  for (const node of narrow.rounds.flatMap(round => round.nodes)) {
    const counterpart = wide.rounds.flatMap(round => round.nodes).find(other => other.id === node.id);
    assert.equal(node.probability, counterpart.probability);
  }
  assert.throws(() => getBeamSearch(4), RangeError);
});
