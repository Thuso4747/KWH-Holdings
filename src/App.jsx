import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import ScrollManager from './components/ScrollManager';
import HomePage from './pages/HomePage';
import ServicePage from './pages/ServicePage';
import ConsultationPage from './pages/ConsultationPage';
import LegalPage from './pages/LegalPage';
import NotFoundPage from './pages/NotFoundPage';
import { servicePages } from './data/services';

export default function App() {
  return (
    <BrowserRouter>
      <ScrollManager />
      <a className="skip-link" href="#main-content">Skip to content</a>
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        {Object.values(servicePages).map((service) => (
          <Route key={service.slug} path={`/services/${service.slug}`} element={<ServicePage key={service.slug} service={service} />} />
        ))}
        <Route path="/marketing" element={<Navigate to="/services/marketing" replace />} />
        <Route path="/business" element={<Navigate to="/services/business" replace />} />
        <Route path="/software" element={<Navigate to="/services/software" replace />} />
        <Route path="/consultation" element={<ConsultationPage />} />
        <Route path="/privacy" element={<LegalPage page="privacy" />} />
        <Route path="/terms" element={<LegalPage page="terms" />} />
        <Route path="/cookies" element={<LegalPage page="cookies" />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}
