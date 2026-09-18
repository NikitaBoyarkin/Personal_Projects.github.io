import { describe, it, expect } from 'bun:test';
import {
  scrollDepthPct,
  reachedCaseStudyRead,
  caseStudySlug,
  CASE_STUDY_READ_DEPTH,
} from '../../src/lib/scroll-depth';

// Guards the proof-reach metric (PRD v6 S3.2 / D14): the `case_study_read`
// event must fire at 75% scroll depth, exactly once, on project pages.
describe('case-study read threshold (S3.2)', () => {
  it('is 75%', () => {
    expect(CASE_STUDY_READ_DEPTH).toBe(0.75);
  });

  it('computes scroll depth as scrollY / (scrollHeight - innerHeight)', () => {
    expect(scrollDepthPct(0, 3000, 1000)).toBe(0);
    expect(scrollDepthPct(1000, 3000, 1000)).toBe(0.5);
    expect(scrollDepthPct(1500, 3000, 1000)).toBe(0.75);
    expect(scrollDepthPct(2000, 3000, 1000)).toBe(1);
  });

  it('clamps below 0 and above 1 (overscroll / bounce)', () => {
    expect(scrollDepthPct(-200, 3000, 1000)).toBe(0);
    expect(scrollDepthPct(4000, 3000, 1000)).toBe(1);
  });

  it('treats a page shorter than the viewport as fully read', () => {
    expect(scrollDepthPct(0, 800, 1000)).toBe(1);
    expect(scrollDepthPct(0, 1000, 1000)).toBe(1);
  });

  it('does not fire before 75% and fires at or past it', () => {
    expect(reachedCaseStudyRead(1499, 3000, 1000)).toBe(false);
    expect(reachedCaseStudyRead(1500, 3000, 1000)).toBe(true);
    expect(reachedCaseStudyRead(2000, 3000, 1000)).toBe(true);
    // short page → already read on load
    expect(reachedCaseStudyRead(0, 700, 1000)).toBe(true);
  });

  it('matches project case-study pages, in both locales and sub-parts', () => {
    expect(caseStudySlug('/projects/volta/')).toBe('volta');
    expect(caseStudySlug('/projects/volta')).toBe('volta');
    expect(caseStudySlug('/projects/volta/funnel/')).toBe('volta');
    expect(caseStudySlug('/en/projects/churn/')).toBe('churn');
    expect(caseStudySlug('/en/projects/causal')).toBe('causal');
  });

  it('never matches the projects index or non-project routes', () => {
    expect(caseStudySlug('/projects/')).toBeNull();
    expect(caseStudySlug('/projects')).toBeNull();
    expect(caseStudySlug('/en/projects/')).toBeNull();
    expect(caseStudySlug('/posts/churn-uplift-discount/')).toBeNull();
    expect(caseStudySlug('/')).toBeNull();
    expect(caseStudySlug('/value/')).toBeNull();
  });
});
