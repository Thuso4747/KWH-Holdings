import { act, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ServiceHeadlinePhrase from './components/ServiceHeadlinePhrase';

const words = ['Business', 'Brand', 'Startup', 'Venture'];

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('service headline transitions', () => {
  it('tracks the previous suffix position, recalculates after layout changes, and cleans up', async () => {
    let positions = [
      { x: 300, y: 0 }, { x: 200, y: 0 }, { x: 0, y: 80 }, { x: 260, y: 0 },
    ];
    const positionFor = (element, axis) => {
      if (!element.classList.contains('service-flip__suffix')) return 0;
      const word = element.closest('.service-flip__stage').querySelector('.service-flip__word').textContent;
      return positions[words.indexOf(word)][axis];
    };
    vi.spyOn(HTMLElement.prototype, 'offsetLeft', 'get').mockImplementation(function () { return positionFor(this, 'x'); });
    vi.spyOn(HTMLElement.prototype, 'offsetTop', 'get').mockImplementation(function () { return positionFor(this, 'y'); });

    const observe = vi.fn();
    const disconnect = vi.fn();
    let notifyResize;
    vi.stubGlobal('ResizeObserver', vi.fn(function (callback) {
      notifyResize = callback;
      return { observe, disconnect };
    }));
    const frames = [];
    const requestFrame = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      frames.push(callback);
      return 70 + frames.length;
    });
    const cancelFrame = vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});
    const addWindowListener = vi.spyOn(window, 'addEventListener');
    const removeWindowListener = vi.spyOn(window, 'removeEventListener');
    let resolveFonts;
    const fonts = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      ready: new Promise((resolve) => { resolveFonts = resolve; }),
    };
    const oldFonts = Object.getOwnPropertyDescriptor(document, 'fonts');
    Object.defineProperty(document, 'fonts', { configurable: true, value: fonts });

    try {
      const { container, unmount } = render(<ServiceHeadlinePhrase words={words} suffix="Today" />);
      expect(container.querySelector('.service-flip')).toHaveClass('service-flip--with-suffix');
      const stages = [...container.querySelectorAll('.service-flip__stage')];
      const offsets = () => stages.map((stage) => [
        stage.style.getPropertyValue('--suffix-from-x'),
        stage.style.getPropertyValue('--suffix-from-y'),
      ]);
      expect(offsets()).toEqual([['-40px', '0px'], ['100px', '0px'], ['200px', '-80px'], ['-260px', '80px']]);
      expect(stages.map((stage) => stage.style.getPropertyValue('--suffix-delay'))).toEqual(['8s', '2s', '4s', '6s']);
      expect(observe).toHaveBeenCalledTimes(9); // phrase, four suffixes and four word clips
      const resizeHandler = addWindowListener.mock.calls.find(([type]) => type === 'resize')[1];
      expect(fonts.addEventListener).toHaveBeenCalledWith('loadingdone', resizeHandler);

      positions = positions.map((position, index) => index === 2 ? { ...position, y: 100 } : position);
      act(() => {
        notifyResize();
        resizeHandler();
        fonts.addEventListener.mock.calls[0][1]();
      });
      expect(requestFrame).toHaveBeenCalledTimes(1); // coalesced into one measurement
      act(() => frames[0]());
      expect(offsets()).toEqual([['-40px', '0px'], ['100px', '0px'], ['200px', '-100px'], ['-260px', '100px']]);

      act(() => notifyResize());
      expect(requestFrame).toHaveBeenCalledTimes(2);
      unmount();
      expect(disconnect).toHaveBeenCalledOnce();
      expect(removeWindowListener).toHaveBeenCalledWith('resize', resizeHandler);
      expect(fonts.removeEventListener).toHaveBeenCalledWith('loadingdone', resizeHandler);
      expect(cancelFrame).toHaveBeenCalledWith(72);
      await act(async () => {
        notifyResize();
        resolveFonts();
        await fonts.ready;
      });
      expect(requestFrame).toHaveBeenCalledTimes(2);
    } finally {
      if (oldFonts) Object.defineProperty(document, 'fonts', oldFonts);
      else delete document.fonts;
    }
  });

  it('still schedules a measurement on resize without ResizeObserver', () => {
    vi.stubGlobal('ResizeObserver', undefined);
    const requestFrame = vi.spyOn(window, 'requestAnimationFrame').mockReturnValue(14);
    const cancelFrame = vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});
    const { unmount } = render(<ServiceHeadlinePhrase words={words} suffix="Today" />);
    act(() => window.dispatchEvent(new Event('resize')));
    expect(requestFrame).toHaveBeenCalledOnce();
    unmount();
    expect(cancelFrame).toHaveBeenCalledWith(14);
  });

  it('does not set up suffix measurement for a fixed prefix', () => {
    const observer = vi.fn();
    vi.stubGlobal('ResizeObserver', observer);
    const { container } = render(<ServiceHeadlinePhrase words={['Impact', 'Influence']} prefix="Brand" />);
    expect(container.querySelectorAll('.service-flip__suffix')).toHaveLength(0);
    expect(container.querySelector('.service-flip')).not.toHaveClass('service-flip--with-suffix');
    expect(observer).not.toHaveBeenCalled();
  });
});
