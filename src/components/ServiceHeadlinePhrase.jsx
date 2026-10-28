import { useLayoutEffect, useRef } from 'react';

export default function ServiceHeadlinePhrase({ words, prefix, suffix }) {
  const phraseRef = useRef(null);

  useLayoutEffect(() => {
    const phrase = phraseRef.current;
    if (!phrase || !suffix) return undefined;

    const stages = [...phrase.querySelectorAll('.service-flip__stage')];
    const suffixes = stages.map((stage) => stage.querySelector('.service-flip__suffix'));
    const clips = [...phrase.querySelectorAll('.service-flip__clip')];
    let frame = null;
    let disposed = false;

    // The positioned stages share an origin; offsets ignore the suffix's visual transform.
    const measure = () => {
      const positions = suffixes.map((item) => ({ x: item.offsetLeft, y: item.offsetTop }));
      stages.forEach((stage, index) => {
        const previous = positions[(index + positions.length - 1) % positions.length];
        stage.style.setProperty('--suffix-from-x', `${previous.x - positions[index].x}px`);
        stage.style.setProperty('--suffix-from-y', `${previous.y - positions[index].y}px`);
      });
    };
    const schedule = () => {
      if (disposed || frame !== null) return;
      frame = window.requestAnimationFrame(() => {
        frame = null;
        measure();
      });
    };

    measure();
    const observer = window.ResizeObserver ? new window.ResizeObserver(schedule) : null;
    [phrase, ...suffixes, ...clips].forEach((element) => observer?.observe(element));
    window.addEventListener('resize', schedule);
    document.fonts?.addEventListener?.('loadingdone', schedule);
    document.fonts?.ready?.then(() => { if (!disposed) schedule(); });

    return () => {
      disposed = true;
      observer?.disconnect();
      window.removeEventListener('resize', schedule);
      document.fonts?.removeEventListener?.('loadingdone', schedule);
      if (frame !== null) window.cancelAnimationFrame(frame);
    };
  }, [words, suffix]);

  // The first suffix starts in place; its move begins only on the next loop.
  return (
    <span className={`service-flip${suffix ? ' service-flip--with-suffix' : ''}`} aria-hidden="true" ref={phraseRef}>
      {words.map((word, index) => (
        <span
          className={`service-flip__stage ${index === 0 ? 'service-flip__stage--first' : ''}`.trim()}
          style={{ '--word-delay': `${index * 2}s`, '--suffix-delay': `${index === 0 ? 8 : index * 2}s` }}
          key={word}
        >
          {prefix && <><span className="service-hero__fixed-word">{prefix}</span>{' '}</>}
          <span className="service-flip__clip"><span className="service-flip__word">{word}</span></span>
          {suffix && <>{' '}<span className="service-hero__fixed-word service-flip__suffix">{suffix}</span></>}
        </span>
      ))}
    </span>
  );
}
