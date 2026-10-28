import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import ScrollManager from './components/ScrollManager';
import HomePage from './pages/HomePage';
import ServicePage from './pages/ServicePage';
import ConsultationPage from './pages/ConsultationPage';
import { departments, servicePages } from './data/services';
import { projects } from './data/projects';

function renderAt(element, path = '/') {
  return render(<MemoryRouter initialEntries={[path]}>{element}</MemoryRouter>);
}

describe('footer', () => {
  it('keeps contact navigation without displaying direct contact details', () => {
    renderAt(<><ConsultationPage /><Footer /></>, '/consultation');
    const footer = screen.getByRole('contentinfo');
    expect(within(footer).queryByText('072 831 5667')).not.toBeInTheDocument();
    expect(within(footer).queryByText('haroldlowa25@gmail.com')).not.toBeInTheDocument();
    expect(footer.querySelector('a[href^="tel:"], a[href^="mailto:"]')).toBeNull();
    expect(within(footer).getByRole('link', { name: 'Contact Us' })).toHaveAttribute('href', '/consultation');
    expect(within(footer).getByRole('link', { name: 'Free Consultation' })).toHaveAttribute('href', '/consultation');

    const main = screen.getByRole('main');
    expect(within(main).getByRole('link', { name: '072 831 5667' })).toHaveAttribute('href', 'tel:+27728315667');
    expect(within(main).getByRole('link', { name: 'haroldlowa25@gmail.com' })).toHaveAttribute('href', 'mailto:haroldlowa25@gmail.com');
  });
});

describe('navigation and home sections', () => {
  it('removes links to the featured-work section from the header and footer', () => {
    renderAt(<><Header /><Footer /></>);
    expect(screen.queryByRole('link', { name: 'Work' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Featured Work' })).not.toBeInTheDocument();
    expect(document.querySelector('a[href*="#work"]')).toBeNull();
  });

  it('links the home dashboard to services without showing featured work', () => {
    renderAt(<HomePage />);
    expect(screen.getByRole('link', { name: 'View our services' })).toHaveAttribute('href', '/#services');
    expect(screen.getByRole('region', { name: 'Our Departments' })).toHaveAttribute('id', 'services');
    expect(screen.queryByRole('heading', { name: 'Featured Work' })).not.toBeInTheDocument();
    expect(document.querySelector('#work')).toBeNull();
    expect(screen.queryByRole('button', { name: /view case study/i })).not.toBeInTheDocument();
  });

  it('provides a scroll link from the dashboard to the next section', () => {
    renderAt(<HomePage />);
    const link = screen.getByRole('link', { name: 'Scroll to explore' });
    const hero = link.closest('.home-hero');
    const vision = document.getElementById('vision');
    expect(link).toHaveAttribute('href', '/#vision');
    expect(vision).toHaveAttribute('aria-labelledby', 'home-visual-title');
    expect(within(vision).getByRole('heading', { name: /from vision\s+to execution/i })).toBeInTheDocument();
    expect(hero.nextElementSibling).toBe(vision);
  });

  it('scrolls to the vision section when the scroll link is activated', async () => {
    const user = userEvent.setup();
    const scrollIntoView = vi.spyOn(HTMLElement.prototype, 'scrollIntoView');
    renderAt(<><ScrollManager /><HomePage /></>);
    const vision = document.getElementById('vision');
    scrollIntoView.mockClear();
    await user.click(screen.getByRole('link', { name: 'Scroll to explore' }));
    await waitFor(() => expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' }));
    expect(scrollIntoView.mock.instances).toContain(vision);
  });

  it('keeps Home active when the vision section is linked directly', () => {
    renderAt(<Header />, '/#vision');
    const navigation = screen.getByRole('navigation', { name: 'Primary navigation' });
    expect(within(navigation).getByRole('link', { name: 'Home' })).toHaveAttribute('aria-current', 'page');
  });

  it('retains the project records and supplied Musato logo for future use', () => {
    expect(projects.map((project) => project.id)).toEqual(['musato', 'asg', 'campaign-management', 'strategic-planning']);
    const musato = projects.find((project) => project.id === 'musato');
    expect(musato.logo).toEqual({ src: '/images/musato-technologies-logo.png', width: 1275, height: 277 });
    expect(existsSync(resolve(process.cwd(), `public${musato.logo.src}`))).toBe(true);
  });

  it('releases the home overlay and its background when a link is selected', async () => {
    const user = userEvent.setup();
    renderAt(<><Header /><main>Page content</main><footer className="site-footer">Footer</footer></>);
    const homeLink = screen.getByRole('link', { name: 'KWH Holdings home' });
    expect(within(homeLink).getByRole('img', { name: 'KWH Holdings' })).toHaveAttribute('src', '/images/kwh-logo.png');
    const header = screen.getByRole('banner');
    const main = screen.getByRole('main');
    const toggle = screen.getByRole('button', { name: /open navigation/i });
    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(header).toHaveAttribute('inert');
    expect(main).toHaveAttribute('inert');
    const menu = screen.getByRole('navigation', { name: 'Navigation menu' });
    await user.click(within(menu).getByRole('link', { name: 'Contact' }));
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(header).not.toHaveAttribute('inert');
    expect(main).not.toHaveAttribute('inert');
    expect(document.body).not.toHaveClass('mobile-menu-open');
    expect(document.body.style.overflow).not.toBe('hidden');
    expect(screen.queryByRole('dialog', { name: 'Navigation menu' })).not.toBeInTheDocument();
  });

  it('keeps the centred home navigation and opens a full-screen mobile menu', async () => {
    const user = userEvent.setup();
    renderAt(<Header />);
    expect(screen.getByRole('banner')).toHaveClass('site-header--home');
    const navigation = screen.getByRole('navigation', { name: 'Primary navigation' });
    expect(navigation).toHaveClass('primary-nav--inline');
    expect(within(navigation).getAllByRole('link').map((link) => link.textContent)).toEqual(['Home', 'Services', 'About', 'Contact']);
    const toggle = screen.getByRole('button', { name: 'Open navigation menu' });
    const menu = document.getElementById(toggle.getAttribute('aria-controls'));
    expect(toggle.querySelector('svg.menu-icon animate')).not.toBeNull();
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(menu).not.toBeVisible();

    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    const dialog = screen.getByRole('dialog', { name: 'Navigation menu' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toContainElement(menu);
    expect(menu).toBeVisible();
    expect(document.querySelector('.mobile-menu__backdrop')).toHaveAttribute('aria-hidden', 'true');
    expect(document.querySelector('.standard-menu-backdrop')).not.toBeInTheDocument();
    expect(within(menu).getByRole('link', { name: 'Services' })).toHaveAttribute('href', '/#services');
    expect(within(menu).getByRole('link', { name: 'Start a project' })).toHaveAttribute('href', '/consultation');

    await user.keyboard('{Escape}');
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(menu).not.toBeVisible();
    await waitFor(() => expect(toggle).toHaveFocus());
  });

  it('traps focus in the home overlay and restores the background on close', async () => {
    const user = userEvent.setup();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'auto';
    try {
      renderAt(<><a className="skip-link" href="#main-content">Skip to content</a><Header /><main id="main-content"><button>Page action</button></main><footer className="site-footer">Footer</footer></>);
      const header = screen.getByRole('banner');
      const toggle = screen.getByRole('button', { name: 'Open navigation menu' });
      const main = document.querySelector('main');
      const footer = document.querySelector('.site-footer');
      const skipLink = document.querySelector('.skip-link');
      footer.setAttribute('inert', ''); // Preserve a pre-existing inert state.
      await user.click(toggle);
      const dialog = screen.getByRole('dialog', { name: 'Navigation menu' });
      const close = within(dialog).getByRole('button', { name: 'Close navigation menu' });
      const lastLink = within(dialog).getByRole('link', { name: 'Start a project' });
      expect(close).toHaveFocus();
      expect(header).toHaveAttribute('inert'); // Includes the logo and the original toggle.
      expect(main).toHaveAttribute('inert');
      expect(footer).toHaveAttribute('inert');
      expect(skipLink).toHaveAttribute('inert');
      expect(document.body).toHaveClass('mobile-menu-open');
      expect(document.body.style.overflow).toBe('hidden');
      await user.tab({ shift: true });
      expect(lastLink).toHaveFocus();
      await user.tab();
      expect(close).toHaveFocus();
      await user.click(close);
      expect(header).not.toHaveAttribute('inert');
      expect(main).not.toHaveAttribute('inert');
      expect(skipLink).not.toHaveAttribute('inert');
      expect(footer).toHaveAttribute('inert');
      expect(document.body).not.toHaveClass('mobile-menu-open');
      expect(document.body.style.overflow).toBe('auto');
      await waitFor(() => expect(toggle).toHaveFocus());
    } finally {
      document.body.style.overflow = previousOverflow;
    }
  });

  it('dismisses the home menu when its backdrop is clicked', async () => {
    const user = userEvent.setup();
    renderAt(<Header />);
    const toggle = screen.getByRole('button', { name: 'Open navigation menu' });
    await user.click(toggle);
    await user.click(document.querySelector('.mobile-menu__backdrop'));
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await waitFor(() => expect(toggle).toHaveFocus());
  });

  it('uses the supplied decorative arrow in the mobile navigation without changing link names', async () => {
    const user = userEvent.setup();
    renderAt(<Header />);
    await user.click(screen.getByRole('button', { name: 'Open navigation menu' }));
    const menu = screen.getByRole('navigation', { name: 'Navigation menu' });
    expect(menu.querySelector('.navigation-menu__heading')).toHaveAttribute('aria-hidden', 'true');

    const labels = ['Home', 'Services', 'About', 'Contact', 'Start a project'];
    const links = within(menu).getAllByRole('link');
    expect(links).toHaveLength(labels.length);
    links.forEach((link, index) => {
      expect(link).toHaveAccessibleName(labels[index]);
      expect(link).not.toHaveTextContent('↗');
      const icon = link.querySelector('svg');
      expect(icon).toHaveAttribute('aria-hidden', 'true');
      expect(icon).toHaveAttribute('focusable', 'false');
      expect(icon.querySelectorAll('path')[1]).toHaveAttribute('d', 'M18 18L6 6m2 12h10V8');
      if (index < 4) {
        expect(link.querySelector('.navigation-menu__index')).toHaveAttribute('aria-hidden', 'true');
        expect(link.querySelector('.navigation-menu__index')).toHaveTextContent(`0${index + 1}`);
      }
    });
  });

  it('closes the home mobile menu and moves focus to navigation when the viewport widens', async () => {
    const descriptor = Object.getOwnPropertyDescriptor(window, 'matchMedia');
    const listeners = new Set();
    let isDesktop = false;
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: () => ({
        get matches() { return isDesktop; },
        addEventListener: (_, listener) => listeners.add(listener),
        removeEventListener: (_, listener) => listeners.delete(listener),
      }),
    });
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => { callback(0); return 1; });
    try {
      const user = userEvent.setup();
      renderAt(<Header />);
      const toggle = screen.getByRole('button', { name: 'Open navigation menu' });
      await user.click(toggle);
      expect(toggle).toHaveAttribute('aria-expanded', 'true');
      isDesktop = true;
      // A browser can blur the now-hidden overlay control before the media event.
      const close = screen.getByRole('button', { name: 'Close navigation menu' });
      act(() => {
        close.blur();
        listeners.forEach((listener) => listener({ matches: true }));
      });
      expect(toggle).toHaveAttribute('aria-expanded', 'false');
      expect(document.body).not.toHaveClass('mobile-menu-open');
      expect(screen.getByRole('banner')).not.toHaveAttribute('inert');
      expect(within(screen.getByRole('navigation', { name: 'Primary navigation' })).getByRole('link', { name: 'Home' })).toHaveFocus();
    } finally {
      if (descriptor) Object.defineProperty(window, 'matchMedia', descriptor);
      else delete window.matchMedia;
    }
  });

  it('uses the supplied animated icon for both menu controls', () => {
    renderAt(<Header />, '/services/marketing');
    const buttons = [
      screen.getByRole('button', { name: 'Show navigation' }),
      screen.getByRole('button', { name: 'Open navigation menu' }),
    ];
    for (const button of buttons) {
      const icon = button.querySelector('svg.menu-icon');
      expect(icon).toHaveAttribute('aria-hidden', 'true');
      expect([...icon.querySelectorAll('g > path')].map((path) => path.getAttribute('d'))).toEqual([
        'M19 5h-14', 'M19 12h-9', 'M19 19h-14', 'M7 9l-3 3l3 3',
      ]);
      expect(icon.querySelectorAll('animate')).toHaveLength(4);
    }
  });

  it('removes the logo from service navigation while keeping the Home link', () => {
    renderAt(<Header />, '/services/marketing');
    expect(screen.queryByRole('link', { name: 'KWH Holdings home' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: 'Services' })).toHaveAttribute('aria-current', 'page');
  });

  it('changes service navigation contrast over light content and dark areas', () => {
    renderAt(<><Header /><main><section className="service-hero" /><div className="benefit-card" /></main><footer className="site-footer" /></>, '/services/business');
    const header = screen.getByRole('banner');
    const trigger = screen.getByRole('button', { name: 'Show navigation' });
    const hero = document.querySelector('.service-hero');
    const footer = document.querySelector('.site-footer');
    const heroRect = vi.spyOn(hero, 'getBoundingClientRect');
    const footerRect = vi.spyOn(footer, 'getBoundingClientRect').mockReturnValue({ top: 1000, bottom: 1200 });
    hero.style.setProperty('--service-fade-depth', '260px');
    heroRect.mockReturnValue({ top: 0, bottom: 600, height: 600 });
    fireEvent.scroll(window);
    expect(header).not.toHaveClass('is-over-light');

    // A taller hero still switches in its fixed-depth fade rather than at a percentage of its height.
    heroRect.mockReturnValue({ top: -1050, bottom: 180, height: 1230 });
    fireEvent.scroll(window);
    expect(header).not.toHaveClass('is-over-light');
    heroRect.mockReturnValue({ top: -1140, bottom: 90, height: 1230 });
    fireEvent.scroll(window);
    expect(header).toHaveClass('is-over-light');
    expect(trigger).toHaveClass('is-over-light');

    // The mobile fade has a different depth; the transparent header reads the CSS value on resize.
    hero.style.setProperty('--service-fade-depth', '220px');
    heroRect.mockReturnValue({ top: -1070, bottom: 160, height: 1230 });
    fireEvent.resize(window);
    expect(header).not.toHaveClass('is-over-light');
    heroRect.mockReturnValue({ top: -1090, bottom: 140, height: 1230 });
    fireEvent.scroll(window);
    expect(header).toHaveClass('is-over-light');

    // The redesigned benefits are light, while the footer remains dark.
    heroRect.mockReturnValue({ top: -1230, bottom: 0, height: 1230 });
    fireEvent.scroll(window);
    expect(header).toHaveClass('is-over-light');
    footerRect.mockReturnValue({ top: 0, bottom: 300 });
    fireEvent.scroll(window);
    expect(header).not.toHaveClass('is-over-light');
    expect(trigger).not.toHaveClass('is-over-light');
  });

  it('reveals the service navigation near the top and hides it after the pointer leaves', async () => {
    renderAt(<Header />, '/services/marketing');
    const header = screen.getByRole('banner');
    expect(header).toHaveClass('site-header--service');
    expect(header).not.toHaveClass('is-revealed');

    fireEvent.mouseMove(window, { clientY: 30 });
    expect(header).toHaveClass('is-revealed');
    fireEvent.mouseMove(window, { clientY: 300 });
    await waitFor(() => expect(header).not.toHaveClass('is-revealed'));
  });

  it('reveals the service navigation on upward scroll and hides it on downward scroll', () => {
    const scrollYDescriptor = Object.getOwnPropertyDescriptor(window, 'scrollY');
    Object.defineProperty(window, 'scrollY', { configurable: true, writable: true, value: 0 });
    vi.useFakeTimers();
    try {
      renderAt(<Header />, '/services/business');
      const header = screen.getByRole('banner');
      act(() => vi.advanceTimersByTime(150));
      window.scrollY = 500;
      fireEvent.scroll(window);
      expect(header).not.toHaveClass('is-revealed');
      window.scrollY = 300;
      fireEvent.scroll(window);
      expect(header).toHaveClass('is-revealed');
      window.scrollY = 600;
      fireEvent.scroll(window);
      expect(header).not.toHaveClass('is-revealed');
    } finally {
      vi.useRealTimers();
      Object.defineProperty(window, 'scrollY', scrollYDescriptor);
    }
  });

  it('ignores touch-generated mouse movement when deciding whether to hide on scroll', () => {
    const scrollYDescriptor = Object.getOwnPropertyDescriptor(window, 'scrollY');
    Object.defineProperty(window, 'scrollY', { configurable: true, writable: true, value: 0 });
    vi.useFakeTimers();
    try {
      renderAt(<Header />, '/services/business');
      const header = screen.getByRole('banner');
      act(() => vi.advanceTimersByTime(150));
      const touch = new Event('pointerdown');
      Object.defineProperty(touch, 'pointerType', { value: 'touch' });
      fireEvent(window, touch);
      fireEvent.mouseMove(window, { clientY: 30 });
      expect(header).not.toHaveClass('is-revealed');
      window.scrollY = 500;
      fireEvent.scroll(window);
      window.scrollY = 300;
      fireEvent.scroll(window);
      expect(header).toHaveClass('is-revealed');
      window.scrollY = 600;
      fireEvent.scroll(window);
      expect(header).not.toHaveClass('is-revealed');
    } finally {
      vi.useRealTimers();
      Object.defineProperty(window, 'scrollY', scrollYDescriptor);
    }
  });

  it('opens and closes the service navigation with the mobile trigger', async () => {
    const widthDescriptor = Object.getOwnPropertyDescriptor(window, 'innerWidth');
    Object.defineProperty(window, 'innerWidth', { configurable: true, writable: true, value: 390 });
    try {
      const user = userEvent.setup();
      renderAt(<Header />, '/services/software');
      const header = screen.getByRole('banner');
      const trigger = screen.getByRole('button', { name: 'Show navigation' });
      const firstIcon = trigger.querySelector('.menu-icon');
      await user.click(trigger);
      expect(header).toHaveClass('is-revealed');
      const hiddenIcon = trigger.querySelector('.menu-icon');
      expect(hiddenIcon).not.toBe(firstIcon);
      const close = screen.getByRole('button', { name: 'Close navigation menu' });
      expect(close).toHaveAttribute('aria-expanded', 'true');
      const menu = screen.getByRole('navigation', { name: 'Primary navigation' });
      const services = within(menu).getByRole('link', { name: 'Services' });
      expect(services).toHaveAttribute('aria-current', 'page');
      expect(services.querySelector('.navigation-menu__arrow path:last-child')).toHaveAttribute('d', 'M18 18L6 6m2 12h10V8');
      expect(within(menu).getByRole('link', { name: 'Start a project' }).querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
      await user.click(close);
      expect(header).not.toHaveClass('is-revealed');
      expect(trigger.querySelector('.menu-icon')).not.toBe(hiddenIcon);
      await waitFor(() => expect(trigger).toHaveFocus());
    } finally {
      Object.defineProperty(window, 'innerWidth', widthDescriptor);
    }
  });

  it('keeps the transparent mobile service menu accessible and restores the page on close', async () => {
    const widthDescriptor = Object.getOwnPropertyDescriptor(window, 'innerWidth');
    const previousOverflow = document.body.style.overflow;
    Object.defineProperty(window, 'innerWidth', { configurable: true, writable: true, value: 390 });
    document.body.style.overflow = 'auto';
    try {
      const user = userEvent.setup();
      renderAt(<><a className="skip-link" href="#main-content">Skip to content</a><Header /><main id="main-content"><button>Page action</button></main><footer className="site-footer">Footer</footer></>, '/services/software');
      const main = document.querySelector('main');
      const footer = document.querySelector('.site-footer');
      const skipLink = document.querySelector('.skip-link');
      footer.setAttribute('inert', ''); // Preserve a pre-existing inert state.
      const trigger = screen.getByRole('button', { name: 'Show navigation' });
      await user.click(trigger);
      const dialog = screen.getByRole('dialog', { name: 'Navigation menu' });
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(main).toHaveAttribute('inert');
      expect(footer).toHaveAttribute('inert');
      expect(skipLink).toHaveAttribute('inert');
      expect(document.body).toHaveClass('service-menu-open');
      expect(document.body.style.overflow).toBe('hidden');

      const close = within(dialog).getByRole('button', { name: 'Close navigation menu' });
      const lastLink = within(dialog).getByRole('link', { name: 'Start a project' });
      expect(close).toHaveFocus();
      await user.tab({ shift: true });
      expect(lastLink).toHaveFocus();
      await user.tab();
      expect(close).toHaveFocus();
      await user.keyboard('{Escape}');
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(main).not.toHaveAttribute('inert');
      expect(skipLink).not.toHaveAttribute('inert');
      expect(footer).toHaveAttribute('inert');
      expect(document.body).not.toHaveClass('service-menu-open');
      expect(document.body.style.overflow).toBe('auto');
      await waitFor(() => expect(trigger).toHaveFocus());
    } finally {
      document.body.style.overflow = previousOverflow;
      Object.defineProperty(window, 'innerWidth', widthDescriptor);
    }
  });

  it('reveals service navigation for keyboard focus and returns focus on Escape', async () => {
    const user = userEvent.setup();
    renderAt(<Header />, '/services/software');
    const header = screen.getByRole('banner');
    const trigger = screen.getByRole('button', { name: 'Show navigation' });
    await user.tab();
    expect(trigger).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(screen.getByRole('link', { name: 'Home' })).toHaveFocus();
    expect(header).toHaveClass('is-revealed');
    await user.keyboard('{Escape}');
    expect(header).not.toHaveClass('is-revealed');
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it('keeps the standard header on non-service pages', () => {
    renderAt(<Header />, '/consultation');
    expect(screen.getByRole('banner')).not.toHaveClass('site-header--service');
    expect(screen.getByRole('banner')).not.toHaveClass('site-header--home');
    expect(screen.getByRole('link', { name: 'KWH Holdings home' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Show navigation' })).not.toBeInTheDocument();
  });

  it('retains the non-modal consultation dropdown on desktop', async () => {
    const user = userEvent.setup();
    renderAt(<><Header /><main>Page content</main></>, '/consultation');
    const main = screen.getByRole('main');
    const toggle = screen.getByRole('button', { name: 'Open navigation menu' });
    await user.click(toggle);
    expect(screen.getByRole('navigation', { name: 'Navigation menu' })).toHaveClass('primary-nav--dropdown');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(main).not.toHaveAttribute('inert');
    fireEvent.pointerDown(document.body);
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  it('opens an accessible full-screen menu on the mobile consultation page', async () => {
    const widthDescriptor = Object.getOwnPropertyDescriptor(window, 'innerWidth');
    const previousOverflow = document.body.style.overflow;
    Object.defineProperty(window, 'innerWidth', { configurable: true, writable: true, value: 390 });
    document.body.style.overflow = 'auto';
    try {
      const user = userEvent.setup();
      renderAt(<><a className="skip-link" href="#main-content">Skip to content</a><Header /><main id="main-content"><button>Page action</button></main><footer className="site-footer">Footer</footer></>, '/consultation');
      const header = screen.getByRole('banner');
      const main = screen.getByRole('main');
      const footer = document.querySelector('.site-footer');
      const skipLink = document.querySelector('.skip-link');
      const toggle = screen.getByRole('button', { name: 'Open navigation menu' });
      expect(document.getElementById(toggle.getAttribute('aria-controls'))).toBeInTheDocument();
      footer.setAttribute('inert', '');
      await user.click(toggle);
      const dialog = screen.getByRole('dialog', { name: 'Navigation menu' });
      const close = within(dialog).getByRole('button', { name: 'Close navigation menu' });
      const lastLink = within(dialog).getByRole('link', { name: 'Start a project' });
      expect(dialog).toHaveClass('mobile-menu-overlay');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(close).toHaveFocus();
      expect(toggle).toHaveAttribute('aria-expanded', 'true');
      expect(within(dialog).getByRole('link', { name: 'Contact' })).toHaveAttribute('aria-current', 'page');
      expect(lastLink).toHaveAttribute('href', '/consultation');
      expect(document.querySelector('.standard-menu-backdrop')).not.toBeInTheDocument();
      for (const element of [header, main, footer, skipLink]) expect(element).toHaveAttribute('inert');
      expect(document.body).toHaveClass('mobile-menu-open');
      expect(document.body.style.overflow).toBe('hidden');
      await user.tab({ shift: true });
      expect(lastLink).toHaveFocus();
      await user.tab();
      expect(close).toHaveFocus();
      await user.keyboard('{Escape}');
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      for (const element of [header, main, skipLink]) expect(element).not.toHaveAttribute('inert');
      expect(footer).toHaveAttribute('inert'); // Preserve a pre-existing inert state.
      expect(document.body).not.toHaveClass('mobile-menu-open');
      expect(document.body.style.overflow).toBe('auto');
      await waitFor(() => expect(toggle).toHaveFocus());
      await user.click(toggle);
      await user.click(document.querySelector('.mobile-menu__backdrop'));
      expect(toggle).toHaveAttribute('aria-expanded', 'false');
      await waitFor(() => expect(toggle).toHaveFocus());
    } finally {
      document.body.style.overflow = previousOverflow;
      Object.defineProperty(window, 'innerWidth', widthDescriptor);
    }
  });

  it('keeps consultation form answers when the mobile menu is closed or links to this page', async () => {
    const widthDescriptor = Object.getOwnPropertyDescriptor(window, 'innerWidth');
    Object.defineProperty(window, 'innerWidth', { configurable: true, writable: true, value: 390 });
    try {
      const user = userEvent.setup();
      renderAt(<><Header /><ConsultationPage /></>, '/consultation');
      const name = screen.getByRole('textbox', { name: 'Full Name' });
      await user.type(name, 'Lerato');
      const toggle = screen.getByRole('button', { name: 'Open navigation menu' });
      await user.click(toggle);
      await user.click(screen.getByRole('button', { name: 'Close navigation menu' }));
      expect(name).toHaveValue('Lerato');
      await user.click(toggle);
      const dialog = screen.getByRole('dialog', { name: 'Navigation menu' });
      await user.click(within(dialog).getByRole('link', { name: 'Start a project' }));
      expect(name).toHaveValue('Lerato');
      expect(document.body).not.toHaveClass('mobile-menu-open');
      expect(screen.getByRole('main')).not.toHaveAttribute('inert');
    } finally {
      Object.defineProperty(window, 'innerWidth', widthDescriptor);
    }
  });

  it('closes the consultation menu across mobile and desktop breakpoints', async () => {
    const widthDescriptor = Object.getOwnPropertyDescriptor(window, 'innerWidth');
    Object.defineProperty(window, 'innerWidth', { configurable: true, writable: true, value: 390 });
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => { callback(0); return 1; });
    try {
      const user = userEvent.setup();
      renderAt(<><Header /><main>Page content</main></>, '/consultation');
      const toggle = screen.getByRole('button', { name: 'Open navigation menu' });
      await user.click(toggle);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      window.innerWidth = 1024;
      fireEvent.resize(window);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(toggle).toHaveAttribute('aria-expanded', 'false');
      expect(toggle).toHaveFocus();
      expect(document.body).not.toHaveClass('mobile-menu-open');
      expect(screen.getByRole('main')).not.toHaveAttribute('inert');
      await user.click(toggle);
      expect(screen.getByRole('navigation', { name: 'Navigation menu' })).toHaveClass('primary-nav--dropdown');
      window.innerWidth = 390;
      fireEvent.resize(window);
      expect(toggle).toHaveAttribute('aria-expanded', 'false');
      expect(toggle).toHaveFocus();
      await user.click(toggle);
      expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
    } finally {
      Object.defineProperty(window, 'innerWidth', widthDescriptor);
    }
  });

  it('keeps the existing non-modal dropdown on other mobile pages', async () => {
    const widthDescriptor = Object.getOwnPropertyDescriptor(window, 'innerWidth');
    Object.defineProperty(window, 'innerWidth', { configurable: true, writable: true, value: 390 });
    try {
      const user = userEvent.setup();
      renderAt(<><Header /><main>Page content</main></>, '/privacy');
      const toggle = screen.getByRole('button', { name: 'Open navigation menu' });
      await user.click(toggle);
      expect(screen.getByRole('navigation', { name: 'Navigation menu' })).toHaveClass('primary-nav--dropdown');
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(screen.getByRole('main')).not.toHaveAttribute('inert');
      fireEvent.pointerDown(document.body);
      expect(toggle).toHaveAttribute('aria-expanded', 'false');
    } finally {
      Object.defineProperty(window, 'innerWidth', widthDescriptor);
    }
  });

  it('offers direct department navigation in the image-led introduction', () => {
    renderAt(<HomePage />);
    const navigation = screen.getByRole('navigation', { name: 'Explore our departments' });
    expect(within(navigation).getAllByRole('link')).toHaveLength(3);
    for (const department of departments) {
      expect(within(navigation).getByRole('link', { name: department.cardTitle })).toHaveAttribute('href', `/services/${department.slug}`);
    }
    expect(navigation.closest('section').querySelector('img')).toHaveAttribute('alt', '');
  });

  it('shows each department with its services and a distinct accessible link', () => {
    renderAt(<HomePage />);
    const section = screen.getByRole('region', { name: 'Our Departments' });
    expect(within(section).getAllByRole('article')).toHaveLength(3);
    for (const department of departments) {
      const card = within(section).getByRole('heading', { name: department.cardTitle }).closest('article');
      expect(within(card).getByText('KEY SERVICES')).toBeInTheDocument();
      const services = within(card).getByRole('list', { name: `${department.cardTitle} key services` });
      for (const service of department.bullets) expect(within(services).getByText(service)).toBeInTheDocument();
      const link = within(card).getByRole('link', { name: `Learn more about ${department.cardTitle}` });
      expect(link).toHaveAttribute('href', `/services/${department.slug}`);
      expect(link).toHaveTextContent('Learn More');
      expect(link.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
      expect(card.querySelector('img')).not.toBeInTheDocument();
    }
  });

  it.each([
    { slug: 'software', title: 'Software Solutions', image: '/images/software-solutions.jpg' },
    { slug: 'business', title: 'Business Consulting', image: '/images/business-consulting.jpg' },
    { slug: 'marketing', title: 'Marketing Strategy', image: '/images/marketing-strategy.jpg' },
  ])('keeps the supplied $title image on its service page', ({ slug, image }) => {
    const service = renderAt(<ServicePage service={servicePages[slug]} />, `/services/${slug}`);
    expect(service.container.querySelector('.service-hero')).toHaveStyle({ backgroundImage: `url(${image})` });
  });

  it('presents the integrated approach as an ordered sequence', () => {
    renderAt(<HomePage />);
    const section = screen.getByRole('region', { name: 'Integrated Approach' });
    expect(within(section).getByText('Unlike traditional consulting firms, we provide holistic solutions that seamlessly integrate marketing, strategy and technology to deliver exceptional results.')).toBeInTheDocument();
    const steps = within(section).getByRole('list', { name: 'Our integrated approach' });
    expect(steps.tagName).toBe('OL');
    const items = within(steps).getAllByRole('listitem');
    expect(items).toHaveLength(3);
    expect(items.map((item) => within(item).getByRole('heading').textContent)).toEqual(['Analyze', 'Strategize', 'Execute']);
    expect(items.map((item) => item.querySelector('[aria-hidden="true"]').textContent)).toEqual(['01', '02', '03']);
    expect(within(items[0]).getByText('Deep dive into your business goals and challenges.')).toBeInTheDocument();
    expect(within(items[1]).getByText('Develop integrated solutions across all departments.')).toBeInTheDocument();
    expect(within(items[2]).getByText('Implement and optimize for measurable results.')).toBeInTheDocument();
  });

  it('retains the about story and all five core values in reading order', () => {
    renderAt(<HomePage />);
    const section = screen.getByRole('region', { name: 'About KWH Holdings' });
    expect(section).toHaveAttribute('id', 'about');
    expect(within(section).getAllByRole('heading').map((heading) => heading.textContent)).toEqual([
      'About KWH Holdings', 'Our Mission', 'Why We Started', 'Core Values',
    ]);
    expect(within(section).getByText('Founded by a team of professionals from marketing, business strategy and tech development, KWH Holdings was created to bridge the gap between vision and execution for modern companies.')).toBeInTheDocument();
    expect(within(section).getByText('To empower businesses with innovative, sustainable and strategic solutions across marketing, business development and software, helping them scale and thrive in a rapidly evolving digital economy.')).toBeInTheDocument();
    expect(within(section).getByText('We identified a recurring challenge: companies often had innovative ideas but lacked integrated support across strategy, marketing and software. KWH was formed to deliver holistic consulting under one roof.')).toBeInTheDocument();
    const values = within(section).getByRole('complementary', { name: 'Core Values' });
    expect(values).not.toHaveTextContent('✳');
    expect([...values.querySelectorAll('dl > div')].map((item) => [item.querySelector('dt')?.textContent, item.querySelector('dd')?.textContent])).toEqual([
      ['Integrity', 'Transparency, honesty and ethical practices.'],
      ['Innovation', 'Creativity and technology to solve challenges.'],
      ['Client Needs Prioritized', 'Solutions tailored to client goals and success.'],
      ['Collaboration', 'Strong partnerships based on trust.'],
      ['Excellence', 'Measurable results with professionalism.'],
    ]);
  });

  it('uses the supplied strategy icon for the marketing department', () => {
    renderAt(<HomePage />);
    const card = screen.getByRole('heading', { name: 'Marketing Strategy' }).closest('article');
    const icon = card.querySelector('.department-card__topline svg');
    expect(icon).toHaveAttribute('viewBox', '0 0 256 256');
    expect(icon).toHaveAttribute('aria-hidden', 'true');
    expect(icon.querySelector('path')).toHaveAttribute('fill', 'currentColor');
  });

  it('uses the supplied presentation icon for the business department', () => {
    renderAt(<HomePage />);
    const card = screen.getByRole('heading', { name: 'Business Consulting' }).closest('article');
    const icon = card.querySelector('.department-card__topline svg');
    expect(icon).toHaveAttribute('viewBox', '0 0 24 24');
    expect(icon).toHaveAttribute('aria-hidden', 'true');
    expect(icon.querySelector('g')).toHaveAttribute('stroke', 'currentColor');
    expect(icon.querySelectorAll('path')[1]).toHaveAttribute('d', 'm8 12l3-3l2 2l3-3');
  });
});

describe('service pages', () => {
  it.each(Object.values(servicePages))('links $label hero to its service offerings', (service) => {
    renderAt(<ServicePage service={service} />, `/services/${service.slug}`);
    expect(screen.getByRole('link', { name: 'View Services' })).toHaveAttribute('href', `/services/${service.slug}#service-offerings`);
    expect(screen.getByRole('region', { name: `Our ${service.shortLabel} Services` })).toHaveAttribute('id', 'service-offerings');
    expect(document.querySelector('a[href*="#work"]')).toBeNull();
  });

  it.each(Object.values(servicePages))('retains the full $label offering information', (service) => {
    renderAt(<ServicePage service={service} />, `/services/${service.slug}`);
    const section = screen.getByRole('region', { name: `Our ${service.shortLabel} Services` });
    expect(within(section).getByText(service.intro)).toBeVisible();
    for (const offering of service.offerings) {
      const row = within(section).getByRole('heading', { name: offering.title }).closest('article');
      expect(within(row).getByText(offering.description)).toBeVisible();
      const tags = within(row).getByRole('list', { name: 'Areas of expertise' });
      expect(within(tags).getAllByRole('listitem').map((item) => item.textContent)).toEqual(offering.tags);
      const toggle = within(row).getByRole('button', { name: 'Show More' });
      const detail = document.getElementById(toggle.getAttribute('aria-controls'));
      expect(toggle.compareDocumentPosition(detail) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
      expect(detail).toHaveTextContent(offering.detail);
      expect(detail).toHaveAttribute('hidden');
    }
  });

  it.each(Object.values(servicePages))('toggles Show More and Show Less for $label', async (service) => {
    const user = userEvent.setup();
    renderAt(<ServicePage service={service} />, `/services/${service.slug}`);
    const section = screen.getByRole('region', { name: `Our ${service.shortLabel} Services` });
    const toggles = within(section).getAllByRole('button', { name: 'Show More' });
    expect(toggles).toHaveLength(service.offerings.length);

    for (const toggle of toggles) {
      const detail = document.getElementById(toggle.getAttribute('aria-controls'));
      expect(detail).toHaveAttribute('hidden');
      await user.click(toggle);
      expect(toggle).toHaveAccessibleName('Show Less');
      expect(toggle).toHaveAttribute('aria-expanded', 'true');
      expect(detail).toBeVisible();
      await user.click(toggle);
      expect(toggle).toHaveAccessibleName('Show More');
      expect(toggle).toHaveAttribute('aria-expanded', 'false');
      expect(detail).toHaveAttribute('hidden');
    }
  });

  it('expands service information and supports keyboard-accessible tabs', async () => {
    const user = userEvent.setup();
    renderAt(<ServicePage service={servicePages.business} />);
    const card = screen.getByRole('heading', { name: 'Strategic Planning' }).closest('article');
    const toggle = within(card).getByRole('button', { name: 'Show More' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(toggle.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
    const detail = document.getElementById(toggle.getAttribute('aria-controls'));
    expect(detail).toHaveAttribute('hidden');
    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(toggle).toHaveAccessibleName('Show Less');
    expect(toggle.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
    expect(within(card).getByText(/turn your vision into a clear set of priorities/i)).toBeVisible();
    expect(within(card).getByRole('link', { name: /discuss this service/i })).toHaveAttribute('href', '/consultation?service=business&focus=Strategic%20Planning');
    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(toggle).toHaveAccessibleName('Show More');
    expect(detail).toHaveAttribute('hidden');

    const tabs = screen.getAllByRole('tab');
    for (const tab of tabs) {
      const panel = document.getElementById(tab.getAttribute('aria-controls'));
      expect(panel).toHaveAttribute('role', 'tabpanel');
      expect(panel).toHaveAttribute('aria-labelledby', tab.id);
      expect(panel.hasAttribute('hidden')).toBe(tab.getAttribute('aria-selected') === 'false');
    }
    const methodology = screen.getByRole('tab', { name: 'Methodology' });
    await user.click(methodology);
    expect(screen.getByRole('tabpanel')).toHaveTextContent('A thoughtful approach, from start to finish');
    expect(screen.getByRole('heading', { name: '01. Discover' })).toBeVisible();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'Our Team' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'Our Team' })).toHaveFocus();
    expect(document.getElementById(methodology.getAttribute('aria-controls'))).toHaveAttribute('hidden');
  });
});

describe('consultation request', () => {
  it('lists only the three departments and links to their service pages', () => {
    renderAt(<ConsultationPage />, '/consultation');
    const section = screen.getByRole('region', { name: 'Our Departments' });
    expect(within(section).getByText('ONE TEAM, MANY PERSPECTIVES')).toBeInTheDocument();
    expect(within(section).getAllByRole('link')).toHaveLength(3);
    for (const [title, slug] of [
      ['Marketing & Digital', 'marketing'],
      ['Business Strategy', 'business'],
      ['Technology Solutions', 'software'],
    ]) {
      const link = within(section).getByRole('heading', { name: title }).closest('a');
      expect(link).toHaveAttribute('href', `/services/${slug}`);
      const arrow = link.querySelector('svg.department-arrow');
      expect(arrow).toHaveAttribute('aria-hidden', 'true');
      expect(arrow.querySelectorAll('path')[1]).toHaveAttribute('d', 'M18 18L6 6m2 12h10V8');
      expect(link).not.toHaveTextContent('↗');
    }
    expect(within(section).queryByRole('heading', { name: 'Creative & Design' })).not.toBeInTheDocument();
  });

  it('validates each step, preserves answers, and prepares an honest email handoff', async () => {
    const user = userEvent.setup();
    renderAt(<ConsultationPage />, '/consultation?service=business&focus=Strategic%20Planning');

    await user.click(screen.getByRole('button', { name: /next step/i }));
    expect(screen.getByRole('heading', { name: 'Basic Information' })).toBeInTheDocument();
    await user.type(screen.getByLabelText('Full Name'), 'Alex Example');
    await user.type(screen.getByLabelText('Email Address'), 'alex@example.com');
    await user.click(screen.getByLabelText('Phone'));
    expect(screen.getByLabelText('Phone Number')).toBeRequired();
    await user.type(screen.getByLabelText('Phone Number'), '072 123 4567');
    await user.click(screen.getByRole('button', { name: /next step/i }));

    expect(screen.getByRole('heading', { name: 'Project Details' })).toBeInTheDocument();
    expect(screen.getByLabelText('Area of Interest')).toHaveValue('business');
    expect(screen.getByLabelText(/Project Details/i, { selector: 'textarea' })).toHaveValue('I would like to discuss Strategic Planning.');
    await user.selectOptions(screen.getByLabelText(/Ideal Timeline/), 'Within 1–3 months');
    await user.click(screen.getByRole('button', { name: /next step/i }));
    await user.type(screen.getByLabelText('What are your goals?'), 'Grow our business & improve operations.');
    await user.click(screen.getByRole('button', { name: /previous/i }));
    expect(screen.getByLabelText(/Ideal Timeline/)).toHaveValue('Within 1–3 months');
    await user.click(screen.getByRole('button', { name: /next step/i }));
    expect(screen.getByLabelText('What are your goals?')).toHaveValue('Grow our business & improve operations.');
    await user.click(screen.getByRole('button', { name: /prepare request/i }));

    expect(screen.getByRole('heading', { name: 'Your request is ready' })).toBeInTheDocument();
    expect(screen.getByText(/isn’t sent until you choose to send it/i)).toBeInTheDocument();
    const editAnswers = screen.getByRole('button', { name: 'Edit my answers' });
    expect(editAnswers.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
    expect(editAnswers).not.toHaveTextContent('←');
    const emailLink = screen.getByRole('link', { name: /open email app/i });
    const href = decodeURIComponent(emailLink.getAttribute('href'));
    expect(href).toContain('mailto:haroldlowa25@gmail.com');
    expect(href).toContain('alex@example.com');
    expect(href).toContain('Grow our business & improve operations.');
    await user.click(editAnswers);
    expect(screen.getByRole('heading', { name: 'Goals & Challenges' })).toBeInTheDocument();
    expect(screen.getByLabelText('What are your goals?')).toHaveValue('Grow our business & improve operations.');
  });

  it('rejects a name containing only whitespace', async () => {
    const user = userEvent.setup();
    renderAt(<ConsultationPage />, '/consultation');
    await user.type(screen.getByLabelText('Full Name'), '   ');
    await user.type(screen.getByLabelText('Email Address'), 'alex@example.com');
    await user.click(screen.getByRole('button', { name: /next step/i }));
    expect(screen.getByLabelText('Full Name')).toBeInvalid();
    expect(screen.getByRole('heading', { name: 'Basic Information' })).toBeInTheDocument();
  });
});
