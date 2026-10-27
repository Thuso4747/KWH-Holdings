import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

const REVEAL_ZONE = 72;
const HIDE_DELAY = 240;
const SCROLL_THRESHOLD = 5;

/** Keep the service hero unobstructed while making navigation easy to reveal. */
export function useServiceHeader(enabled, pathname, menuOpen) {
  const [isVisible, setIsVisible] = useState(false);
  const headerRef = useRef(null);
  const triggerRef = useRef(null);
  const hideTimer = useRef(null);
  const reason = useRef(null);
  const pointerNearHeader = useRef(false);
  const keyboardInUse = useRef(false);
  const menuOpenRef = useRef(menuOpen);
  menuOpenRef.current = menuOpen;

  const cancelHide = useCallback(() => {
    window.clearTimeout(hideTimer.current);
    hideTimer.current = null;
  }, []);

  const show = useCallback((source = 'manual') => {
    if (!enabled) return;
    cancelHide();
    reason.current = source;
    setIsVisible(true);
  }, [cancelHide, enabled]);

  const hide = useCallback((force = false) => {
    if (!enabled) return;
    const activeElement = document.activeElement;
    const focusInside = headerRef.current?.contains(activeElement);
    if (!force && (menuOpenRef.current || (keyboardInUse.current && focusInside))) return;
    if (!keyboardInUse.current && focusInside) activeElement.blur();
    cancelHide();
    reason.current = null;
    setIsVisible(false);
  }, [cancelHide, enabled]);

  const scheduleHide = useCallback(() => {
    cancelHide();
    hideTimer.current = window.setTimeout(() => hide(), HIDE_DELAY);
  }, [cancelHide, hide]);

  // Reset before painting a new route so its hero always starts unobstructed.
  useLayoutEffect(() => {
    cancelHide();
    setIsVisible(false);
    reason.current = null;
    pointerNearHeader.current = false;
  }, [cancelHide, pathname]);

  useEffect(() => {
    if (!enabled) return undefined;

    let lastScrollY = Math.max(window.scrollY, 0);
    let scrollReady = false;
    let ignoreMouseUntil = 0;
    // Ignore the router's initial scroll-to-top when entering a service page.
    const initialScrollTimer = window.setTimeout(() => {
      lastScrollY = Math.max(window.scrollY, 0);
      scrollReady = true;
    }, 150);

    const onMouseMove = (event) => {
      // Taps can produce compatibility mouse events; they are not hover intent.
      if (event.sourceCapabilities?.firesTouchEvents || Date.now() < ignoreMouseUntil) return;
      const headerHeight = headerRef.current?.offsetHeight || 126;
      pointerNearHeader.current = event.clientY <= headerHeight + 12;
      if (event.clientY <= REVEAL_ZONE) show('hover');
      else if (pointerNearHeader.current) cancelHide();
      else if (reason.current === 'hover') scheduleHide();
    };
    const onScroll = () => {
      const currentY = Math.max(window.scrollY, 0);
      if (!scrollReady) {
        lastScrollY = currentY;
        return;
      }
      const change = currentY - lastScrollY;
      if (Math.abs(change) < SCROLL_THRESHOLD) return;
      if (change < 0) show('scroll');
      else if (!pointerNearHeader.current) hide();
      lastScrollY = currentY;
    };
    const onKeyDown = (event) => {
      if (event.key === 'Tab') keyboardInUse.current = true;
    };
    const onPointerDown = (event) => {
      keyboardInUse.current = false;
      if (event.pointerType === 'touch') {
        pointerNearHeader.current = false;
        ignoreMouseUntil = Date.now() + 800;
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('pointerdown', onPointerDown);
    return () => {
      window.clearTimeout(initialScrollTimer);
      cancelHide();
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('pointerdown', onPointerDown);
    };
  }, [cancelHide, enabled, hide, pathname, scheduleHide, show]);

  const onFocus = () => show(keyboardInUse.current ? 'focus' : 'hover');
  const onBlur = (event) => {
    if (!event.currentTarget.contains(event.relatedTarget)) scheduleHide();
  };

  return { headerRef, triggerRef, isVisible, show, hide, onFocus, onBlur };
}
