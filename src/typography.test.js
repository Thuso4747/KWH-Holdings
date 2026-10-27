import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

// Vitest skips CSS imports, so load the real stylesheet for these style checks.
const styles = readFileSync(resolve(process.cwd(), 'src/styles.css'), 'utf8');
let stylesheet;

beforeAll(() => {
  stylesheet = document.createElement('style');
  stylesheet.textContent = styles;
  document.head.appendChild(stylesheet);
});

afterEach(() => { document.body.innerHTML = ''; });
afterAll(() => { stylesheet.remove(); });

describe('navigation and action typography', () => {
  it('shares the homepage navigation typography with service pages', () => {
    document.body.innerHTML = `
      <header class="site-header"><nav class="primary-nav"><a href="/">Home</a></nav></header>
      <header class="site-header site-header--service"><nav class="primary-nav"><a href="/">Home</a></nav></header>
    `;
    const [home, service] = document.querySelectorAll('.primary-nav a');
    const homeStyle = getComputedStyle(home);
    const serviceStyle = getComputedStyle(service);

    expect(serviceStyle.fontFamily).toBe(homeStyle.fontFamily);
    expect(serviceStyle.fontSize).toBe(homeStyle.fontSize);
    expect(serviceStyle.fontWeight).toBe(homeStyle.fontWeight);
    expect(serviceStyle.fontWeight).not.toBe('700');
  });

  it('anchors consultation department arrows to the bottom of their links', () => {
    document.body.innerHTML = `
      <div class="consultation-department-grid">
        <a href="/services/marketing"><h3>Marketing &amp; Digital</h3><p>Short description</p><span class="department-arrow">↗</span></a>
        <a href="/services/business"><h3>Business Strategy</h3><p>Longer description that can wrap across lines</p><span class="department-arrow">↗</span></a>
      </div>
    `;
    for (const link of document.querySelectorAll('.consultation-department-grid a')) {
      expect(getComputedStyle(link).display).toBe('flex');
      expect(getComputedStyle(link).flexDirection).toBe('column');
      expect(getComputedStyle(link.querySelector('.department-arrow')).marginTop).toBe('auto');
    }
  });

  it('keeps dashboard and service actions regular weight and without an underline', () => {
    document.body.innerHTML = `
      <a class="department-card__link" href="/services/marketing"><span>Learn More</span></a>
      <button class="offering-card__toggle" type="button"><span>Show More</span></button>
    `;
    for (const action of document.querySelectorAll('.department-card__link, .offering-card__toggle')) {
      expect(getComputedStyle(action).fontWeight).toBe('400');
      expect(getComputedStyle(action.querySelector('span')).textDecoration).not.toContain('underline');
    }
  });
});
