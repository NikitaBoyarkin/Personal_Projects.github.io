// Zoom / pan viewport math for the knowledge graph. Pure functions so the
// behavior is unit-testable without a DOM.

export interface Viewport {
  x: number; // top-left viewBox x
  y: number; // top-left viewBox y
  k: number; // zoom scale (1 = world fits viewBox)
}

export interface WorldSize {
  w: number;
  h: number;
}

export const MIN_ZOOM = 0.3;
export const MAX_ZOOM = 4;

export function clampZoom(k: number): number {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, k));
}

export function viewBoxOf(vp: Viewport, world: WorldSize): { x: number; y: number; w: number; h: number } {
  return {
    x: vp.x,
    y: vp.y,
    w: world.w / vp.k,
    h: world.h / vp.k,
  };
}

/** Zoom `vp` by `factor`, keeping the world point `anchor` (in viewBox
 *  coordinates) fixed on screen. */
export function zoomAt(vp: Viewport, anchor: { x: number; y: number }, factor: number, world: WorldSize): Viewport {
  const k = clampZoom(vp.k * factor);
  const vb = viewBoxOf(vp, world);
  // anchor stays at the same *relative* position inside the viewBox window.
  const relX = (anchor.x - vb.x) / vb.w;
  const relY = (anchor.y - vb.y) / vb.h;
  const w = world.w / k;
  const h = world.h / k;
  return {
    x: anchor.x - relX * w,
    y: anchor.y - relY * h,
    k,
  };
}

/** Pan the viewport by `dx`/`dy` world (viewBox) units. */
export function panBy(vp: Viewport, dx: number, dy: number): Viewport {
  return { x: vp.x + dx, y: vp.y + dy, k: vp.k };
}

/** Center the viewport on the given world point at a given zoom. */
export function centerOn(
  _vp: Viewport,
  target: { x: number; y: number },
  k: number,
  world: WorldSize,
): Viewport {
  const clamped = clampZoom(k);
  const w = world.w / clamped;
  const h = world.h / clamped;
  return { x: target.x - w / 2, y: target.y - h / 2, k: clamped };
}