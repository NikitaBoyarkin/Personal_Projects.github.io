import { describe, it, expect, afterEach } from "bun:test";
import { withBase } from '../../src/lib/path';

const ORIGINAL_BASE_URL = import.meta.env.BASE_URL;

describe('withBase', () => {
  afterEach(() => {
    if (ORIGINAL_BASE_URL === undefined) {
      delete process.env.BASE_URL;
    } else {
      process.env.BASE_URL = ORIGINAL_BASE_URL;
    }
  });

  it('prepends the astro base and normalizes slashes', () => {
    process.env.BASE_URL = '/Personal_Projects.github.io/';
    expect(withBase('writing/')).toBe('/Personal_Projects.github.io/writing/');
  });

  it('strips a leading slash on the path', () => {
    process.env.BASE_URL = '/Personal_Projects.github.io/';
    expect(withBase('/about')).toBe('/Personal_Projects.github.io/about');
  });

  it('handles a root base', () => {
    process.env.BASE_URL = '/';
    expect(withBase('writing/')).toBe('/writing/');
  });
});