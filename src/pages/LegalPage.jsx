import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import PageTitle from '../components/PageTitle';

const content = {
  privacy: {
    title: 'Privacy Policy',
    intro: 'Your privacy matters to us. This page explains how the consultation request on this website works.',
    sections: [
      ['Consultation requests', 'The consultation form prepares a message in your email application. This website does not send your form answers to a server. You decide whether to send the prepared email, and your email provider handles it when you do.'],
      ['Information you share', 'If you contact us, the details you choose to include may be used to respond to your enquiry and discuss your project. Please avoid sending sensitive information that is not needed for an initial conversation.'],
      ['Questions', 'For questions about information you have shared with us, please contact us at haroldlowa25@gmail.com.'],
    ],
  },
  terms: {
    title: 'Terms of Service',
    intro: 'These terms cover your use of the KWH Holdings website and the information provided on it.',
    sections: [
      ['Website information', 'The content on this website is provided for general information about our services. It is not a substitute for advice tailored to your circumstances.'],
      ['Consultations and services', 'A consultation request does not establish a service agreement. The scope, timing, and terms of any work will be discussed and agreed separately.'],
      ['Contact', 'If you have any questions about these terms, please contact us at haroldlowa25@gmail.com.'],
    ],
  },
  cookies: {
    title: 'Cookie Information',
    intro: 'A little more about the technologies used by this website.',
    sections: [
      ['Cookies on this website', 'This website does not use analytics or advertising cookies. Your browser, email provider, or the service hosting the website may use their own necessary technologies.'],
      ['Your choices', 'You can manage or clear cookies in your browser settings. If you have questions, contact us at haroldlowa25@gmail.com.'],
    ],
  },
};

export default function LegalPage({ page }) {
  const { title, intro, sections } = content[page];
  return (
    <main id="main-content" className="legal-page section">
      <PageTitle title={title} description={intro} />
      <div className="container legal-page__inner">
        <Link className="back-link" to="/"><ArrowLeft size={16} /> Back to home</Link>
        <p className="eyebrow">KWH HOLDINGS</p>
        <h1>{title}</h1>
        <p className="legal-page__intro">{intro}</p>
        {sections.map(([heading, body]) => <section key={heading}><h2>{heading}</h2><p>{body}</p></section>)}
        <Link className="button button--primary" to="/consultation">Contact Us</Link>
      </div>
    </main>
  );
}
