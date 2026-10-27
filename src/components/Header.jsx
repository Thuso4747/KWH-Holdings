import { useLayoutEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import Logo from './Logo';
import { useServiceHeader } from './useServiceHeader';

const items = [
  { label: 'Home', to: '/' },
  { label: 'Services', to: '/#services' },
  { label: 'About', to: '/#about' },
  { label: 'Work', to: '/#work' },
  { label: 'Contact', to: '/consultation' },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuToggleRef = useRef(null);
  const location = useLocation();
  const isServicePage = /^\/(?:services\/(?:marketing|business|software)|marketing|business|software)\/?$/.test(location.pathname);
  const serviceHeader = useServiceHeader(isServicePage, location.pathname, menuOpen);

  useLayoutEffect(() => { setMenuOpen(false); }, [location.pathname]);

  function isActive(label) {
    if (label === 'Home') return location.pathname === '/' && !location.hash;
    if (label === 'Services') return isServicePage || location.hash === '#services';
    if (label === 'About') return location.hash === '#about';
    if (label === 'Work') return location.hash === '#work';
    if (label === 'Contact') return location.pathname === '/consultation';
    return false;
  }

  function openServiceNavigation() {
    const mobile = window.matchMedia?.('(max-width: 760px)').matches ?? window.innerWidth <= 760;
    serviceHeader.show('manual');
    if (mobile) setMenuOpen(true);
    const focusTarget = mobile ? menuToggleRef.current : serviceHeader.headerRef.current?.querySelector('.primary-nav a');
    focusTarget?.focus({ preventScroll: true });
  }

  function closeServiceNavigation() {
    setMenuOpen(false);
    serviceHeader.hide(true);
    window.setTimeout(() => serviceHeader.triggerRef.current?.focus({ preventScroll: true }), 0);
  }

  function handleMenuToggle() {
    if (menuOpen && isServicePage) closeServiceNavigation();
    else setMenuOpen(!menuOpen);
  }

  function handleHeaderBlur(event) {
    if (!event.currentTarget.contains(event.relatedTarget)) setMenuOpen(false);
    if (isServicePage) serviceHeader.onBlur(event);
  }

  return (
    <>
      {isServicePage && (
        <button
          ref={serviceHeader.triggerRef}
          className={`service-nav-trigger ${serviceHeader.isVisible ? 'is-hidden' : ''}`}
          type="button"
          aria-label="Show navigation"
          aria-controls="site-header"
          aria-expanded={serviceHeader.isVisible}
          tabIndex={serviceHeader.isVisible ? -1 : 0}
          onClick={openServiceNavigation}
        >
          <Menu size={22} aria-hidden="true" />
        </button>
      )}
      <header
        id="site-header"
        ref={serviceHeader.headerRef}
        className={`site-header ${isServicePage ? 'site-header--service' : ''} ${isServicePage && serviceHeader.isVisible ? 'is-revealed' : ''}`}
        onFocusCapture={isServicePage ? serviceHeader.onFocus : undefined}
        onBlurCapture={handleHeaderBlur}
        onKeyDownCapture={(event) => {
          if (isServicePage && event.key === 'Escape') {
            event.preventDefault();
            closeServiceNavigation();
          }
        }}
      >
        <div className="header-inner container">
          <div onClick={() => setMenuOpen(false)}><Logo /></div>
          <button
            ref={menuToggleRef}
            type="button"
            className="menu-toggle"
            aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={menuOpen}
            aria-controls="primary-navigation"
            onClick={handleMenuToggle}
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
    </>
  );
}
