import { describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import ServicePage from './pages/ServicePage';
import ConsultationPage from './pages/ConsultationPage';
import { departments, servicePages } from './data/services';

function renderAt(element, path = '/') {
  return render(<MemoryRouter initialEntries={[path]}>{element}</MemoryRouter>);
}

describe('navigation and featured work', () => {
  it('opens and closes the mobile navigation when a link is selected', async () => {
    const user = userEvent.setup();
    renderAt(<Header />);
    const homeLink = screen.getByRole('link', { name: 'KWH Holdings home' });
    expect(within(homeLink).getByRole('img', { name: 'KWH Holdings' })).toHaveAttribute('src', '/images/kwh-logo.png');
    const toggle = screen.getByRole('button', { name: /open navigation/i });
    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await user.click(screen.getByRole('link', { name: 'Contact' }));
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
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
    const hero = document.querySelector('.service-hero');
    const footer = document.querySelector('.site-footer');
    const heroRect = vi.spyOn(hero, 'getBoundingClientRect');
    const footerRect = vi.spyOn(footer, 'getBoundingClientRect').mockReturnValue({ top: 1000, bottom: 1200 });
    const originalElementsFromPoint = Object.getOwnPropertyDescriptor(document, 'elementsFromPoint');
    Object.defineProperty(document, 'elementsFromPoint', { configurable: true, value: vi.fn(() => []) });
    try {
      heroRect.mockReturnValue({ top: 0, bottom: 600, height: 600 });
      fireEvent.scroll(window);
      expect(header).not.toHaveClass('is-over-light');

      // A taller hero (for example at enlarged text sizes) still switches in its fixed-depth fade.
      heroRect.mockReturnValue({ top: -1050, bottom: 180, height: 1230 });
      fireEvent.scroll(window);
      expect(header).not.toHaveClass('is-over-light');
      heroRect.mockReturnValue({ top: -1140, bottom: 90, height: 1230 });
      fireEvent.scroll(window);
      expect(header).toHaveClass('is-over-light');

      heroRect.mockReturnValue({ top: -500, bottom: 100, height: 600 });
      fireEvent.resize(window);
      expect(header).toHaveClass('is-over-light');

      document.elementsFromPoint.mockReturnValue([document.querySelector('.benefit-card')]);
      fireEvent.scroll(window);
      expect(header).not.toHaveClass('is-over-light');

      document.elementsFromPoint.mockReturnValue([]);
      footerRect.mockReturnValue({ top: 0, bottom: 300 });
      fireEvent.scroll(window);
      expect(header).not.toHaveClass('is-over-light');
    } finally {
      if (originalElementsFromPoint) Object.defineProperty(document, 'elementsFromPoint', originalElementsFromPoint);
      else delete document.elementsFromPoint;
    }
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
    expect(screen.getByRole('link', { name: 'KWH Holdings home' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Show navigation' })).not.toBeInTheDocument();
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
      expect(card.querySelector('img')).toHaveAttribute('src', department.image);
      expect(card.querySelector('img')).toHaveAttribute('alt', '');
    }
  });

  it.each([
    { slug: 'software', title: 'Software Solutions', image: '/images/software-solutions.jpg', width: '1281' },
    { slug: 'business', title: 'Business Consulting', image: '/images/business-consulting.jpg', width: '1272' },
    { slug: 'marketing', title: 'Marketing Strategy', image: '/images/marketing-strategy.jpg', width: '1272' },
  ])('uses the supplied $title image on the homepage and service page', ({ slug, title, image, width }) => {
    const home = renderAt(<HomePage />);
    const card = screen.getByRole('heading', { name: title }).closest('article');
    const photo = card.querySelector('.department-card__image img');
    expect(photo).toHaveAttribute('src', image);
    expect(photo).toHaveAttribute('width', width);
    expect(photo).toHaveAttribute('height', '719');
    expect(photo).toHaveAttribute('alt', '');
    home.unmount();

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

  it('retains the about story and all five core values', () => {
    renderAt(<HomePage />);
    const section = screen.getByRole('region', { name: 'About KWH Holdings' });
    expect(within(section).getByRole('heading', { name: 'Our Mission' })).toBeInTheDocument();
    expect(within(section).getByRole('heading', { name: 'Why We Started' })).toBeInTheDocument();
    const values = within(section).getByRole('complementary', { name: 'Core Values' });
    for (const value of ['Integrity', 'Innovation', 'Client Needs Prioritized', 'Collaboration', 'Excellence']) {
      expect(within(values).getByText(value)).toBeInTheDocument();
    }
    expect(values.querySelectorAll('dt')).toHaveLength(5);
    expect(values.querySelectorAll('dd')).toHaveLength(5);
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

  it('filters work and opens an accessible project dialog', async () => {
    const user = userEvent.setup();
    renderAt(<HomePage />);
    expect(screen.getByText('Musato Technologies')).toBeInTheDocument();
    expect(screen.getByText('ASG IT Support Services')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Marketing', pressed: false }));
    expect(screen.getByText('Digital Campaign Management', { selector: '.work-card h3' })).toBeInTheDocument();
    expect(screen.queryByText('Musato Technologies')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Software' }));
    const caseStudyButton = screen.getAllByRole('button', { name: /view case study/i })[0];
    await user.click(caseStudyButton);
    const dialog = screen.getByRole('dialog', { name: 'Musato Technologies' });
    expect(within(dialog).getByText(/mobile application project/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /close project details/i })).toHaveFocus();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(caseStudyButton).toHaveFocus();
  });
});

describe('service pages', () => {
  it('expands service information and supports keyboard-accessible tabs', async () => {
    const user = userEvent.setup();
    renderAt(<ServicePage service={servicePages.business} />);
    const card = screen.getByRole('heading', { name: 'Strategic Planning' }).closest('article');
    const toggle = within(card).getByRole('button', { name: 'Learn More' });
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
    expect(toggle).toHaveAccessibleName('Learn More');
    expect(detail).toHaveAttribute('hidden');

    const methodology = screen.getByRole('tab', { name: 'Methodology' });
    await user.click(methodology);
    expect(screen.getByRole('tabpanel')).toHaveTextContent('A thoughtful approach, from start to finish');
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'Our Team' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'Our Team' })).toHaveFocus();
  });
});

describe('consultation request', () => {
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
    const emailLink = screen.getByRole('link', { name: /open email app/i });
    const href = decodeURIComponent(emailLink.getAttribute('href'));
    expect(href).toContain('mailto:haroldlowa25@gmail.com');
    expect(href).toContain('alex@example.com');
    expect(href).toContain('Grow our business & improve operations.');
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
