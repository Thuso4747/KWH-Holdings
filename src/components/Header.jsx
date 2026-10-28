import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { X } from 'lucide-react';
import Logo from './Logo';
import { DiagonalArrowIcon } from './DiagonalArrowIcon';
import { MenuIcon } from './MenuIcon';
import { useServiceHeader } from './useServiceHeader';

const items = [
  { label: 'Home', to: '/' },
  { label: 'Services', to: '/#services' },
  { label: 'About', to: '/#about' },
  { label: 'Contact', to: '/consultation' },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuToggleRef = useRef(null);
  const homeMenuRef = useRef(null);
  const homeMenuCloseRef = useRef(null);
  const homeMenuHadFocus = useRef(false);
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const isServicePage = /^\/(?:services\/(?:marketing|business|software)|marketing|business|software)\/?$/.test(location.pathname);
  const serviceHeader = useServiceHeader(isServicePage, location.pathname, menuOpen);
  const isServiceMenuOpen = isServicePage && menuOpen;
  const isHomeMenuOpen = isHomePage && menuOpen;

  useLayoutEffect(() => {
    homeMenuHadFocus.current = false;
    setMenuOpen(false);
  }, [location.pathname, location.search, location.hash]);

  // The standard dropdown outside the home and service pages is not modal.
  useEffect(() => {
    if (!menuOpen || isServicePage || isHomePage) return undefined;
    const onPointerDown = (event) => {
      if (!serviceHeader.headerRef.current?.contains(event.target)) {
        homeMenuHadFocus.current = false;
        setMenuOpen(false);
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [isHomePage, isServicePage, menuOpen, serviceHeader.headerRef]);

  // The home menu is mobile-only; close it and preserve focus when widening.
  useEffect(() => {
    if (!isHomePage || !window.matchMedia) return undefined;
    const desktop = window.matchMedia('(min-width: 761px)');
    const onChange = (event) => {
      if (!event.matches) return;
      const header = serviceHeader.headerRef.current;
      // CSS may hide the focused mobile control before this media event fires.
      const focusWasInMenu = document.activeElement === menuToggleRef.current
        || homeMenuRef.current?.contains(document.activeElement)
        || (homeMenuHadFocus.current && document.activeElement === document.body);
      homeMenuHadFocus.current = false;
      setMenuOpen(false);
      if (focusWasInMenu) {
        window.requestAnimationFrame(() => header?.querySelector('.primary-nav--inline a')?.focus({ preventScroll: true }));
      }
    };
    if (desktop.addEventListener) desktop.addEventListener('change', onChange);
    else desktop.addListener(onChange);
    return () => {
      if (desktop.removeEventListener) desktop.removeEventListener('change', onChange);
      else desktop.removeListener(onChange);
    };
  }, [isHomePage, serviceHeader.headerRef]);

  // Both mobile overlays keep the background inert and restore its previous state on close.
  useLayoutEffect(() => {
    if (!isServiceMenuOpen && !isHomeMenuOpen) return undefined;
    const backgroundElements = [...document.querySelectorAll('main, .site-footer, .skip-link')];
    if (isHomeMenuOpen && serviceHeader.headerRef.current) backgroundElements.push(serviceHeader.headerRef.current);
    const alreadyInert = backgroundElements.map((element) => element.hasAttribute('inert'));
    const previousOverflow = document.body.style.overflow;
    const menuClass = isHomeMenuOpen ? 'home-menu-open' : 'service-menu-open';
    const hadMenuClass = document.body.classList.contains(menuClass);
    // Move focus out of the header before making the blurred background inert.
    if (isHomeMenuOpen) homeMenuCloseRef.current?.focus({ preventScroll: true });
    backgroundElements.forEach((element) => element.setAttribute('inert', ''));
    document.body.classList.add(menuClass);
    document.body.style.overflow = 'hidden';
    return () => {
      backgroundElements.forEach((element, index) => {
        if (!alreadyInert[index]) element.removeAttribute('inert');
      });
      if (!hadMenuClass) document.body.classList.remove(menuClass);
      document.body.style.overflow = previousOverflow;
    };
  }, [isHomeMenuOpen, isServiceMenuOpen, serviceHeader.headerRef]);

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
    if (label === 'Home') return location.pathname === '/' && (!location.hash || location.hash === '#vision');
    if (label === 'Services') return isServicePage || location.hash === '#services';
    if (label === 'About') return location.hash === '#about';
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

  function closeHomeNavigation() {
    setMenuOpen(false);
    window.setTimeout(() => menuToggleRef.current?.focus({ preventScroll: true }), 0);
  }

  function handleMenuToggle() {
    if (menuOpen && isServicePage) closeServiceNavigation();
    else if (menuOpen && isHomePage) closeHomeNavigation();
    else setMenuOpen(!menuOpen);
  }

  function handleHeaderFocus(event) {
    if (isServicePage) serviceHeader.onFocus();
    if (isHomePage) homeMenuHadFocus.current = event.target === menuToggleRef.current;
  }

  function handleHeaderBlur(event) {
    // The modal backdrop handles outside clicks; do not unmount it on blur first.
    if (isServiceMenuOpen || isHomeMenuOpen) return;
    if (!event.currentTarget.contains(event.relatedTarget)) {
      const widening = isHomePage && (window.matchMedia?.('(min-width: 761px)').matches ?? window.innerWidth > 760);
      if (event.relatedTarget || !widening) homeMenuHadFocus.current = false;
      setMenuOpen(false);
    }
    if (isServicePage) serviceHeader.onBlur(event);
  }

  function trapMenuFocus(event, container) {
    if (event.key !== 'Tab' || !container) return;
    const controls = [...container.querySelectorAll('.menu-toggle, .home-menu__close, .primary-nav a[href]')];
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

  function handleHeaderKeyDown(event) {
    if (event.key === 'Escape') {
      if (isServicePage) {
        event.preventDefault();
        closeServiceNavigation();
      } else if (menuOpen) {
        event.preventDefault();
        setMenuOpen(false);
        menuToggleRef.current?.focus({ preventScroll: true });
      }
      return;
    }
    if (isServiceMenuOpen) trapMenuFocus(event, serviceHeader.headerRef.current);
  }

  function handleHomeMenuKeyDown(event) {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeHomeNavigation();
      return;
    }
    trapMenuFocus(event, homeMenuRef.current);
  }

  function renderNavigationLinks(menuDetails = false) {
    return items.map((item, index) => (
      <Link
        key={item.label}
        to={item.to}
        className={isActive(item.label) ? 'is-active' : ''}
        aria-current={isActive(item.label) ? 'page' : undefined}
        onClick={() => setMenuOpen(false)}
      >
        {menuDetails && <span className="navigation-menu__index" aria-hidden="true">0{index + 1}</span>}
        <span className={menuDetails ? 'navigation-menu__label' : undefined}>{item.label}</span>
        {menuDetails && <DiagonalArrowIcon className="navigation-menu__arrow" size={19} />}
      </Link>
    ));
  }

  function renderMenuContents() {
    return (
      <>
        <div className="navigation-menu__heading" aria-hidden="true"><span>Explore</span><span>KWH Holdings</span></div>
        {renderNavigationLinks(true)}
        <Link className="mobile-nav-cta" to="/consultation" onClick={() => setMenuOpen(false)}>
          <span>Start a project</span><DiagonalArrowIcon size={19} />
        </Link>
      </>
    );
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
      {!isServicePage && !isHomePage && menuOpen && <div className="standard-menu-backdrop" aria-hidden="true" />}
      <header
        id="site-header"
        ref={serviceHeader.headerRef}
        className={`site-header ${isServicePage ? 'site-header--service' : 'site-header--standard'} ${isHomePage ? 'site-header--home' : ''} ${isServicePage && serviceHeader.overLightContent ? 'is-over-light' : ''} ${isServicePage && serviceHeader.isVisible ? 'is-revealed' : ''}`}
        role={isServiceMenuOpen ? 'dialog' : undefined}
        aria-modal={isServiceMenuOpen ? 'true' : undefined}
        aria-label={isServiceMenuOpen ? 'Navigation menu' : undefined}
        onFocusCapture={handleHeaderFocus}
        onBlurCapture={handleHeaderBlur}
        onKeyDownCapture={handleHeaderKeyDown}
      >
        <div className="header-inner container">
          {!isServicePage && <div className="header-brand" onClick={() => setMenuOpen(false)}><Logo /></div>}
          {!isServicePage && (
            <nav className="primary-nav primary-nav--inline" aria-label="Primary navigation">
              {renderNavigationLinks()}
            </nav>
          )}
          <button
            ref={menuToggleRef}
            type="button"
            className="menu-toggle"
            aria-label={menuOpen && !isHomePage ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={menuOpen}
            aria-controls="primary-navigation"
            onClick={handleMenuToggle}
          >
            {menuOpen && !isHomePage ? <X size={24} aria-hidden="true" /> : <MenuIcon aria-hidden="true" />}
          </button>
          {!isHomePage && (
            <nav
              id="primary-navigation"
              className={`primary-nav ${!isServicePage ? 'primary-nav--dropdown' : ''} ${menuOpen ? 'is-open' : ''}`}
              aria-label={isServicePage ? 'Primary navigation' : 'Navigation menu'}
              hidden={!isServicePage && !menuOpen}
            >
              {renderMenuContents()}
            </nav>
          )}
        </div>
      </header>
      {isHomePage && (
        <div
          ref={homeMenuRef}
          className="home-menu-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
          hidden={!isHomeMenuOpen}
          onKeyDownCapture={handleHomeMenuKeyDown}
          onFocusCapture={() => { homeMenuHadFocus.current = true; }}
        >
          <div className="home-menu__backdrop" aria-hidden="true" onClick={closeHomeNavigation} />
          <button
            ref={homeMenuCloseRef}
            type="button"
            className="home-menu__close"
            aria-label="Close navigation menu"
            aria-controls="primary-navigation"
            aria-expanded={isHomeMenuOpen}
            onClick={closeHomeNavigation}
          >
            <X size={24} aria-hidden="true" />
          </button>
          <nav id="primary-navigation" className={`primary-nav home-menu__nav ${isHomeMenuOpen ? 'is-open' : ''}`} aria-label="Navigation menu">
            {renderMenuContents()}
          </nav>
        </div>
      )}
    </>
  );
}
