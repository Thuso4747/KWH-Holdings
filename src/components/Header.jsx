import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { X } from 'lucide-react';
import Logo from './Logo';
import { MenuIcon } from './MenuIcon';
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
  const isServiceMenuOpen = isServicePage && menuOpen;

  useLayoutEffect(() => { setMenuOpen(false); }, [location.pathname]);

  // On small screens the transparent menu sits over the page as a modal.
  useLayoutEffect(() => {
    if (!isServiceMenuOpen) return undefined;
    const backgroundElements = [...document.querySelectorAll('main, .site-footer, .skip-link')];
    const alreadyInert = backgroundElements.map((element) => element.hasAttribute('inert'));
    const previousOverflow = document.body.style.overflow;
    const hadMenuClass = document.body.classList.contains('service-menu-open');
    backgroundElements.forEach((element) => element.setAttribute('inert', ''));
    document.body.classList.add('service-menu-open');
    document.body.style.overflow = 'hidden';
    return () => {
      backgroundElements.forEach((element, index) => {
        if (!alreadyInert[index]) element.removeAttribute('inert');
      });
      if (!hadMenuClass) document.body.classList.remove('service-menu-open');
      document.body.style.overflow = previousOverflow;
    };
  }, [isServiceMenuOpen]);

  useEffect(() => {
    if (!isServiceMenuOpen || !window.matchMedia) return undefined;
    const mobile = window.matchMedia('(max-width: 760px)');
    const onChange = (event) => {
      if (!event.matches) {
        setMenuOpen(false);
        window.requestAnimationFrame(() => serviceHeader.headerRef.current?.querySelector('.primary-nav a')?.focus({ preventScroll: true }));
      }
    };
    if (mobile.addEventListener) mobile.addEventListener('change', onChange);
    else mobile.addListener(onChange);
    return () => {
      if (mobile.removeEventListener) mobile.removeEventListener('change', onChange);
      else mobile.removeListener(onChange);
    };
  }, [isServiceMenuOpen, serviceHeader.headerRef]);

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
    // The modal backdrop handles outside clicks; do not unmount it on blur first.
    if (isServiceMenuOpen) return;
    if (!event.currentTarget.contains(event.relatedTarget)) setMenuOpen(false);
    if (isServicePage) serviceHeader.onBlur(event);
  }

  function handleHeaderKeyDown(event) {
    if (!isServicePage) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      closeServiceNavigation();
      return;
    }
    if (!isServiceMenuOpen || event.key !== 'Tab') return;
    const controls = [...serviceHeader.headerRef.current.querySelectorAll('.menu-toggle, .primary-nav a[href]')];
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  }

  return (
    <>
      {isServicePage && (
        <button
          ref={serviceHeader.triggerRef}
          className={`service-nav-trigger ${serviceHeader.overLightContent ? 'is-over-light' : ''} ${serviceHeader.isVisible ? 'is-hidden' : ''}`}
          type="button"
          aria-label="Show navigation"
          aria-controls="site-header"
          aria-expanded={serviceHeader.isVisible}
          tabIndex={serviceHeader.isVisible ? -1 : 0}
          onClick={openServiceNavigation}
        >
          <MenuIcon key={serviceHeader.isVisible ? 'hidden' : 'shown'} aria-hidden="true" />
        </button>
      )}
      {isServiceMenuOpen && <div className="service-menu-backdrop" aria-hidden="true" onClick={closeServiceNavigation} />}
      <header
        id="site-header"
        ref={serviceHeader.headerRef}
        className={`site-header ${isServicePage ? 'site-header--service' : ''} ${isServicePage && serviceHeader.overLightContent ? 'is-over-light' : ''} ${isServicePage && serviceHeader.isVisible ? 'is-revealed' : ''}`}
        role={isServiceMenuOpen ? 'dialog' : undefined}
        aria-modal={isServiceMenuOpen ? 'true' : undefined}
        aria-label={isServiceMenuOpen ? 'Navigation menu' : undefined}
        onFocusCapture={isServicePage ? serviceHeader.onFocus : undefined}
        onBlurCapture={handleHeaderBlur}
        onKeyDownCapture={handleHeaderKeyDown}
      >
        <div className="header-inner container">
          {!isServicePage && <div onClick={() => setMenuOpen(false)}><Logo /></div>}
          <button
            ref={menuToggleRef}
            type="button"
            className="menu-toggle"
            aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={menuOpen}
            aria-controls="primary-navigation"
            onClick={handleMenuToggle}
          >
            {menuOpen ? <X size={24} aria-hidden="true" /> : <MenuIcon aria-hidden="true" />}
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
