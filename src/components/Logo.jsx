import { Link } from 'react-router-dom';

export default function Logo({ inverse = false }) {
  return (
    <Link className={`brand ${inverse ? 'brand--inverse' : ''}`} to="/" aria-label="KWH Holdings home">
      <svg className="brand__mark" viewBox="0 0 52 50" fill="none" aria-hidden="true">
        <path d="M25 2 10 9.5V39L25 31.5V2Z" fill="currentColor" />
        <path d="M28 2 42 9V19L28 12V2ZM28 15.5 44 23.5V34L28 26V15.5ZM28 29.5 46 38.5V49L28 40V29.5Z" fill="currentColor" />
        <path d="M15 7.5V36.5M20 5V34M10 18.5 25 11M10 28 25 20.5" stroke="var(--brand-cutout, #e8eeee)" strokeWidth="1.5" />
      </svg>
      <span className="brand__words"><strong>KWH</strong>{' '}<span>Holdings</span></span>
    </Link>
  );
}
