import { describe, it, expect } from 'vitest';
import {
  clampZoom,
  viewBoxOf,
  zoomAt,
  panBy,
  centerOn,
  MIN_ZOOM,
  MAX_ZOOM,
} from '../../src/lib/graph-zoom';

const WORLD = { w: 1000, h: 600 };
const IDENTITY = { x: 0, y: 0, k: 1 };

describe('graph-zoom viewport math', () => {
  it('clamps zoom to [MIN_ZOOM, MAX_ZOOM]', () => {
    expect(clampZoom(0.01)).toBe(MIN_ZOOM);
    expect(clampZoom(99)).toBe(MAX_ZOOM);
    expect(clampZoom(1)).toBe(1);
  });

  it('derives viewBox size from world and scale', () => {
    expect(viewBoxOf(IDENTITY, WORLD)).toEqual({ x: 0, y: 0, w: 1000, h: 600 });
    expect(viewBoxOf({ x: 0, y: 0, k: 2 }, WORLD)).toEqual({ x: 0, y: 0, w: 500, h: 300 });
  });

  it('zoomAt keeps the anchor world point at the same relative position', () => {
    // Anchor at (750, 450) — 75% right, 75% down of the initial viewBox.
    const vp = zoomAt(IDENTITY, { x: 750, y: 450 }, 2, WORLD);
    const vb = viewBoxOf(vp, WORLD);
    expect(vb.w).toBe(500);
    expect(vb.h).toBe(300);
    // Relative position of the anchor inside the new viewBox stays 0.75 / 0.75.
    expect((750 - vb.x) / vb.w).toBeCloseTo(0.75, 5);
    expect((450 - vb.y) / vb.h).toBeCloseTo(0.75, 5);
  });

  it('zoomAt clamps and does not lose the anchor past the bounds', () => {
    const vp = zoomAt(IDENTITY, { x: 0, y: 0 }, 100, WORLD);
    expect(vp.k).toBe(MAX_ZOOM);
  });

  it('zoom out at an anchor expands the viewBox around that point', () => {
    const vp = zoomAt(IDENTITY, { x: 500, y: 300 }, 0.5, WORLD);
    const vb = viewBoxOf(vp, WORLD);
    expect(vb.w).toBe(2000);
    expect(vb.h).toBe(1200);
    expect((500 - vb.x) / vb.w).toBeCloseTo(0.5, 5);
  });

  it('panBy translates the viewport without changing scale', () => {
    const vp = panBy({ x: 10, y: 20, k: 1.5 }, -30, 40);
    expect(vp).toEqual({ x: -20, y: 60, k: 1.5 });
  });

  it('centerOn centers the target world point', () => {
    const vp = centerOn(IDENTITY, { x: 800, y: 200 }, 2, WORLD);
    const vb = viewBoxOf(vp, WORLD);
    expect(vb.w).toBe(500);
    expect(vb.h).toBe(300);
    // The viewBox window is centered on the target.
    expect(vb.x + vb.w / 2).toBeCloseTo(800, 5);
    expect(vb.y + vb.h / 2).toBeCloseTo(200, 5);
  });
});