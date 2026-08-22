import { describe, it, expect, vi, afterAll } from 'vitest';
import { withBase } from '../../src/lib/path';

describe('withBase', () => {
  afterAll(() => vi.unstubAllEnvs());

  it('prepends the astro base and normalizes slashes', () => {
    vi.stubEnv('BASE_URL', '/Personal_Projects.github.io/');
    expect(withBase('writing/')).toBe('/Personal_Projects.github.io/writing/');
  });

  it('strips a leading slash on the path', () => {
    vi.stubEnv('BASE_URL', '/Personal_Projects.github.io/');
    expect(withBase('/about')).toBe('/Personal_Projects.github.io/about');
  });

  it('handles a root base', () => {
    vi.stubEnv('BASE_URL', '/');
    expect(withBase('writing/')).toBe('/writing/');
  });
});