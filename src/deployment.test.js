import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const rootFile = (name) => resolve(process.cwd(), name);

describe('static site deployment', () => {
  it('serves the Vite build with Cloudflare single-page routing and branch previews', () => {
    const config = JSON.parse(readFileSync(rootFile('wrangler.jsonc'), 'utf8'));
    expect(config.name).toBe('kwh-holdings');
    expect(config.assets).toEqual({ directory: './dist', not_found_handling: 'single-page-application' });
    expect(config.previews).toEqual({});
    expect(config.main).toBeUndefined();
  });

  it('does not copy the incompatible catch-all redirect into Cloudflare assets', () => {
    expect(existsSync(rootFile('public/_redirects'))).toBe(false);
  });

  it('keeps the single-page fallback for Netlify repository builds', () => {
    const config = readFileSync(rootFile('netlify.toml'), 'utf8');
    expect(config).toMatch(/\[\[redirects\]\][\s\S]*from\s*=\s*"\/\*"[\s\S]*to\s*=\s*"\/index\.html"[\s\S]*status\s*=\s*200/);
    expect(config).toMatch(/publish\s*=\s*"dist"/);
  });
});
