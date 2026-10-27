import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-intro">
            <Link className="footer-brand" to="/">KWH Holdings<span>.</span></Link>
            <p>Strategic solutions for modern businesses. We bridge the gap between vision and execution with integrated consulting.</p>
          </div>
          <div>
            <h2>Services</h2>
            <ul>
              <li><Link to="/services/marketing">Marketing Strategy</Link></li>
              <li><Link to="/services/business">Business Consulting</Link></li>
              <li><Link to="/services/software">Software Solutions</Link></li>
              <li><Link to="/services/software#service-offerings">Process Automation</Link></li>
              <li><Link to="/services/marketing#service-offerings">Brand Development</Link></li>
            </ul>
          </div>
          <div>
            <h2>Company</h2>
            <ul>
              <li><Link to="/#about">About Us</Link></li>
              <li><Link to="/#approach">Our Approach</Link></li>
              <li><Link to="/#work">Featured Work</Link></li>
              <li><Link to="/#services">Our Departments</Link></li>
            </ul>
          </div>
          <div>
            <h2>Contact &amp; Support</h2>
            <ul>
              <li><Link to="/consultation">Contact Us</Link></li>
              <li><Link to="/consultation">Free Consultation</Link></li>
              <li><a href="tel:+27728315667">072 831 5667</a></li>
              <li><a href="mailto:haroldlowa25@gmail.com">haroldlowa25@gmail.com</a></li>
              <li><Link to="/privacy">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} KWH Holdings. All rights reserved.</p>
          <div><Link to="/privacy">Privacy</Link><Link to="/terms">Terms</Link><Link to="/cookies">Cookies</Link></div>
        </div>
      </div>
    </footer>
  );
}
