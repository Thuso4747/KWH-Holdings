import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import ServicePage from './pages/ServicePage';
import ConsultationPage from './pages/ConsultationPage';
import { servicePages } from './data/services';

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

  it('uses the supplied strategy icon for the marketing department', () => {
    renderAt(<HomePage />);
    const card = screen.getByRole('heading', { name: 'Marketing Strategy' }).closest('article');
    const icon = card.querySelector('.department-card__topline svg');
    expect(icon).toHaveAttribute('viewBox', '0 0 256 256');
    expect(icon).toHaveAttribute('aria-hidden', 'true');
    expect(icon.querySelector('path')).toHaveAttribute('fill', 'currentColor');
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
    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(within(card).getByText(/turn your vision into a clear set of priorities/i)).toBeVisible();
    expect(within(card).getByRole('link', { name: /discuss this service/i })).toHaveAttribute('href', '/consultation?service=business&focus=Strategic%20Planning');

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
