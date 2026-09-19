// Shared SVG geometry helpers for the hand-built chart components.

export function round(x: number): number {
  return Math.round(x * 100) / 100;
}

export function fmt(v: number): string {
  return Number.isInteger(v) ? String(v) : String(Math.round(v * 100) / 100);
}

export function niceMax(v: number): number {
  if (v <= 0) return 1;
  const exp = Math.floor(Math.log10(v));
  const base = Math.pow(10, exp);
  const f = v / base;
  const nice = f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10;
  return nice * base;
}

// Returns tick values 0 → max (inclusive), at a "nice" step.
export function ticksFor(max: number, count = 4): number[] {
  const raw = max / Math.max(1, count);
  const exp = Math.floor(Math.log10(Math.max(raw, 1e-9)));
  const base = Math.pow(10, exp);
  const f = raw / base;
  const step = (f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10) * base;
  const out: number[] = [];
  for (let t = 0; t <= max + 1e-9; t += step) out.push(round(t));
  return out;
}

// Ticks plus an axis top that is always >= maxValue. The last "nice" tick can
// fall below the data (e.g. 331 → …,300), which would render bars/points above
// the axis; when that happens, extend the axis by one step so nothing overflows.
export function axisTicks(maxValue: number, count = 4): { ticks: number[]; top: number } {
  const ticks = ticksFor(maxValue, count);
  let top = ticks[ticks.length - 1] || 1;
  if (maxValue > top) {
    const step = ticks.length > 1 ? ticks[1] - ticks[0] : top;
    top = round(Math.ceil(maxValue / step) * step);
    ticks.push(top);
  }
  return { ticks, top };
}

// Compact coordinate helper so components don't repeat the margin/scale math.
export interface ChartArea {
  w: number;
  h: number;
  ml: number;
  mr: number;
  mt: number;
  mb: number;
  pw: number;
  ph: number;
}

export function area(w: number, h: number, ml: number, mr: number, mt: number, mb: number): ChartArea {
  return { w, h, ml, mr, mt, mb, pw: w - ml - mr, ph: h - mt - mb };
}

export function linearScale(domainMin: number, domainMax: number, pxMin: number, pxMax: number) {
  const span = domainMax - domainMin || 1;
  return (v: number) => pxMin + ((v - domainMin) / span) * (pxMax - pxMin);
}