export default function ServiceHeadlinePhrase({ words, prefix, suffix }) {
  return (
    <span className="service-flip" aria-hidden="true">
      {words.map((word, index) => (
        <span
          className={`service-flip__stage ${index === 0 ? 'service-flip__stage--first' : ''}`.trim()}
          style={{ '--word-delay': `${index * 2}s` }}
          key={word}
        >
          {prefix && <><span className="service-hero__fixed-word">{prefix}</span>{' '}</>}
          <span className="service-flip__clip"><span className="service-flip__word">{word}</span></span>
          {suffix && <>{' '}<span className="service-hero__fixed-word">{suffix}</span></>}
        </span>
      ))}
    </span>
  );
}
