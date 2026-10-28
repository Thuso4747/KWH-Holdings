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

  it('centres the standard navigation between the brand and menu control', () => {
    document.body.innerHTML = `
      <header class="site-header site-header--standard"><div class="header-inner">
        <div class="header-brand">Brand</div><nav class="primary-nav primary-nav--inline">Home</nav><button class="menu-toggle">Menu</button>
      </div></header>
    `;
    const inner = getComputedStyle(document.querySelector('.header-inner'));
    expect(inner.display).toBe('grid');
    expect(inner.gridTemplateColumns).toBe('minmax(0, 1fr) auto minmax(0, 1fr)');
    expect(getComputedStyle(document.querySelector('.menu-toggle')).justifySelf).toBe('end');
  });

  it('centres the logo independently of the menu control on mobile', () => {
    const mobile = [...stylesheet.sheet.cssRules].find((rule) => rule.conditionText === '(max-width: 760px)');
    const ruleFor = (selector) => [...mobile.cssRules].find((rule) => rule.selectorText === selector).style;
    expect(ruleFor('.site-header--standard .header-inner').display).toBe('grid');
    expect(ruleFor('.site-header--standard .header-inner').gridTemplateColumns).toBe('minmax(0, 1fr) auto minmax(0, 1fr)');
    expect(ruleFor('.site-header--standard .header-brand').gridColumn).toBe('2');
    expect(ruleFor('.site-header--standard .header-brand').justifySelf).toBe('center');
    expect(ruleFor('.site-header--standard .menu-toggle').gridColumn).toBe('3');
    expect(ruleFor('.site-header--standard .primary-nav--inline').display).toBe('none');
    expect(ruleFor('.site-header--standard .primary-nav--dropdown').maxHeight).toBe('calc(100dvh - var(--header-min-height) - 12px)');
  });

  it('gives the dashboard a viewport-sized minimum without fixing its height', () => {
    document.body.innerHTML = '<section class="home-hero"><div class="home-hero__inner">Dashboard content</div><a class="home-hero__scroll" href="/#vision">Scroll to explore</a></section>';
    const hero = getComputedStyle(document.querySelector('.home-hero'));
    const header = getComputedStyle(document.documentElement);
    expect(hero.display).toBe('grid');
    expect(hero.gridTemplateRows).toBe('minmax(min-content, 1fr) auto');
    expect(hero.minHeight).toBe('calc(100dvh - var(--header-min-height))');
    expect(hero.height === '' || hero.height === 'auto').toBe(true);
    expect(header.getPropertyValue('--header-min-height').trim()).toBe('126px');
    expect(styles).toContain('min-height: calc(100vh - var(--header-min-height))');
    expect(styles).toContain('--header-min-height: 90px');
  });

  it('balances the home hero and allows its columns to wrap', () => {
    document.body.innerHTML = `
      <section class="home-hero"><div class="home-hero__inner">
        <div class="home-hero__headline"><h1>Strategic Solutions</h1></div>
        <div class="home-hero__summary"><p>Our approach</p></div>
      </div></section>
    `;
    const innerStyle = getComputedStyle(document.querySelector('.home-hero__inner'));
    expect(innerStyle.display).toBe('flex');
    expect(innerStyle.flexWrap).toBe('wrap');
    expect(innerStyle.alignItems).toBe('center');
    expect(getComputedStyle(document.querySelector('.home-hero__headline')).minWidth).toBe('0px');
    expect(getComputedStyle(document.querySelector('.home-hero__summary')).minWidth).toBe('0px');
  });

  it('allows home hero buttons to reflow when text is enlarged', () => {
    document.body.innerHTML = '<section class="home-hero"><a class="button" href="/#services">View our services <svg></svg></a></section>';
    const button = document.querySelector('.home-hero .button');
    expect(getComputedStyle(button).maxWidth).toBe('100%');
    expect(getComputedStyle(button).whiteSpace).toBe('normal');
    expect(getComputedStyle(button.querySelector('svg')).flex).toBe('0 0 auto');
  });

  it('anchors consultation department arrows to the bottom of their links', () => {
    document.body.innerHTML = `
      <div class="consultation-department-grid">
        <a href="/services/marketing"><h3>Marketing &amp; Digital</h3><p>Short description</p><svg class="department-arrow" aria-hidden="true"></svg></a>
        <a href="/services/business"><h3>Business Strategy</h3><p>Longer description that can wrap across lines</p><svg class="department-arrow" aria-hidden="true"></svg></a>
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
