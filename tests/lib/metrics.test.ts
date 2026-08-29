import { describe, it, expect } from 'vitest';
import { METRICS } from '../../src/lib/metrics';

// Regression guard for the "single source of truth" claim in src/lib/metrics.ts.
// The homepage (HeroMetrics, HomeBoard, CapabilitiesGrid, CareerSnapshot) reads
// these numbers; if one drifts here, the value is no longer CV-authoritative.
describe('METRICS (CV-authoritative)', () => {
  it('matches the rendercv YAML figures', () => {
    expect(METRICS.abKyc).toEqual({ deltaPp: 6.24, annualEurK: 716 });
    expect(METRICS.retention).toEqual({ deltaPp: 9.2, ltvEurK: 227 });
    expect(METRICS.rfm).toEqual({ revenueBeforePct: 12, revenueAfterPct: 41 });
    expect(METRICS.bot).toEqual({ hoursBefore: 2, minutesAfter: 5 });
    expect(METRICS.portfolio).toEqual({ projects: 14, sqlCases: 10 });
  });
});
