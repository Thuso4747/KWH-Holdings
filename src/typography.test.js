import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import styles from './styles.css?raw';

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

  it('keeps both Learn More actions regular weight and without an underline', () => {
    document.body.innerHTML = `
      <a class="department-card__link" href="/services/marketing"><span>Learn More</span></a>
      <button class="offering-card__toggle" type="button"><span>Learn More</span></button>
    `;
    for (const action of document.querySelectorAll('.department-card__link, .offering-card__toggle')) {
      expect(getComputedStyle(action).fontWeight).toBe('400');
      expect(getComputedStyle(action.querySelector('span')).textDecoration).not.toContain('underline');
    }
  });
});
