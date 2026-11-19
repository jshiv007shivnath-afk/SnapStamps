export const NAV_ICON_LOOP_DURATION_MS = 5000;
export const NAV_ICON_LOOP_CYCLE_SECONDS = 2.2;
export const NAV_ICON_LOOP_ITERATIONS = 2;
export const NAV_ICON_LOOP_STAGGER_SECONDS = 0.15;
export const REENTRY_MIN_HIDDEN_MS = 1500;

export function getNavIconLoopDelaySec(iconIndex: number): number {
  const safeIndex = Math.max(0, iconIndex);
  return Number((safeIndex * NAV_ICON_LOOP_STAGGER_SECONDS).toFixed(2));
}

export function getNavIconLoopTotalMs(iconCount: number): number {
  const lastDelaySec = getNavIconLoopDelaySec(Math.max(0, iconCount - 1));
  const totalSec = lastDelaySec + NAV_ICON_LOOP_CYCLE_SECONDS * NAV_ICON_LOOP_ITERATIONS;
  return Math.round(totalSec * 1000);
}

export function shouldReplayNavIconLoopOnReturn(
  hiddenAtMs: number | null,
  returnedAtMs: number,
  minHiddenMs: number = REENTRY_MIN_HIDDEN_MS
): boolean {
  if (hiddenAtMs === null) return false;
  return returnedAtMs - hiddenAtMs >= minHiddenMs;
}
