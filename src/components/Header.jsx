import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import Logo from './Logo';

const items = [
  { label: 'Home', to: '/' },
  { label: 'Services', to: '/#services' },
  { label: 'About', to: '/#about' },
  { label: 'Work', to: '/#work' },
  { label: 'Contact', to: '/consultation' },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  function isActive(label) {
    if (label === 'Home') return location.pathname === '/' && !location.hash;
    if (label === 'Services') return location.pathname.startsWith('/services/') || location.hash === '#services';
    if (label === 'About') return location.hash === '#about';
    if (label === 'Work') return location.hash === '#work';
    if (label === 'Contact') return location.pathname === '/consultation';
    return false;
  }

  return (
    <header className="site-header">
      <div className="header-inner container">
        <div onClick={() => setMenuOpen(false)}><Logo /></div>
        <button
          type="button"
          className="menu-toggle"
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={menuOpen}
          aria-controls="primary-navigation"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <nav id="primary-navigation" className={`primary-nav ${menuOpen ? 'is-open' : ''}`} aria-label="Primary navigation">
          {items.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className={isActive(item.label) ? 'is-active' : ''}
              aria-current={isActive(item.label) ? 'page' : undefined}
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <Link className="mobile-nav-cta" to="/consultation" onClick={() => setMenuOpen(false)}>Start a project <span aria-hidden="true">↗</span></Link>
        </nav>
      </div>
    </header>
  );
}
