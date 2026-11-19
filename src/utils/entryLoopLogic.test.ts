import test from 'node:test';
import assert from 'node:assert/strict';
import {
  NAV_ICON_LOOP_CYCLE_SECONDS,
  NAV_ICON_LOOP_DURATION_MS,
  NAV_ICON_LOOP_ITERATIONS,
  getNavIconLoopDelaySec,
  getNavIconLoopTotalMs,
  shouldReplayNavIconLoopOnReturn,
} from './entryLoopLogic';

test('navigation bar icon loop runs for exactly 5 seconds across all 5 dock icons', () => {
  assert.equal(NAV_ICON_LOOP_DURATION_MS, 5000);
  assert.equal(NAV_ICON_LOOP_ITERATIONS, 2);
  assert.equal(NAV_ICON_LOOP_CYCLE_SECONDS, 2.2);

  assert.equal(getNavIconLoopDelaySec(0), 0);
  assert.equal(getNavIconLoopDelaySec(1), 0.15);
  assert.equal(getNavIconLoopDelaySec(2), 0.3);
  assert.equal(getNavIconLoopDelaySec(3), 0.45);
  assert.equal(getNavIconLoopDelaySec(4), 0.6);

  // 0.6s stagger on 5th icon + (2.2s * 2 loops) = exactly 5000ms
  assert.equal(getNavIconLoopTotalMs(5), 5000);
});

test('navigation bar icon loop replays whenever user returns to the app from background', () => {
  assert.equal(shouldReplayNavIconLoopOnReturn(null, 5000), false);
  assert.equal(shouldReplayNavIconLoopOnReturn(1000, 1500), false);
  assert.equal(shouldReplayNavIconLoopOnReturn(1000, 2500), true);
  assert.equal(shouldReplayNavIconLoopOnReturn(1000, 9000), true);
});
