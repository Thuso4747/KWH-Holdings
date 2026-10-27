import { Link } from 'react-router-dom';

export default function Logo() {
  return (
    <Link className="brand" to="/" aria-label="KWH Holdings home">
      <img className="brand__image" src="/images/kwh-logo.png" alt="KWH Holdings" width="534" height="550" />
    </Link>
  );
}
