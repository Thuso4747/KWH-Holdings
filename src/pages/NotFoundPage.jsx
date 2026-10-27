import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import PageTitle from '../components/PageTitle';

export default function NotFoundPage() {
  return <main id="main-content" className="not-found section"><PageTitle title="Page not found" /><div className="container"><p className="eyebrow">404 / PAGE NOT FOUND</p><h1>Let’s get you back on track.</h1><p>We couldn’t find the page you were looking for.</p><Link className="button button--primary" to="/"><ArrowLeft size={17} /> Back to Home</Link></div></main>;
}
