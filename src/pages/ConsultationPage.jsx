import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Clipboard, Mail, Phone, Send } from 'lucide-react';
import { DiagonalArrowIcon } from '../components/DiagonalArrowIcon';
import PageTitle from '../components/PageTitle';

const contactEmail = 'haroldlowa25@gmail.com';
const areas = [
  { value: 'marketing', label: 'Marketing Strategy' },
  { value: 'business', label: 'Business Consulting' },
  { value: 'software', label: 'Software Solutions' },
  { value: 'multiple', label: 'More than one department' },
  { value: 'unsure', label: 'Not sure yet' },
];
const stepNames = ['Basic Info', 'Project Details', 'Goals & Challenges'];

function makeSummary(form) {
  const area = areas.find((item) => item.value === form.area)?.label || 'Not specified';
  return [
    'Hello KWH Holdings,',
    '',
    'I would like to request a free consultation.',
    '',
    `Name: ${form.fullName.trim()}`,
    `Email: ${form.email.trim()}`,
    `Company: ${form.company.trim() || 'Not provided'}`,
    `Phone: ${form.phone.trim() || 'Not provided'}`,
    `Preferred contact method: ${form.contactMethod}`,
    '',
    `Area of interest: ${area}`,
    `Ideal timeline: ${form.timeline || 'Not specified'}`,
    `Project details: ${form.details.trim() || 'Not provided'}`,
    '',
    `Goals: ${form.goals.trim()}`,
    `Challenges: ${form.challenges.trim() || 'Not provided'}`,
    '',
    'Thank you.',
  ].join('\n');
}

function Field({ id, label, children, optional = false }) {
  return <div className="form-field"><label htmlFor={id}>{label} {optional && <span>(optional)</span>}</label>{children}</div>;
}

function ConsultationForm() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const initialService = params.get('service');
  const initialFocus = params.get('focus');
  const [step, setStep] = useState(0);
  const [ready, setReady] = useState(false);
  const [copyStatus, setCopyStatus] = useState('');
  const [form, setForm] = useState({
    fullName: '', email: '', company: '', phone: '', contactMethod: 'Email',
    area: areas.some((area) => area.value === initialService) ? initialService : '',
    timeline: '', details: initialFocus ? `I would like to discuss ${initialFocus}.` : '', goals: '', challenges: '',
  });
  const headingRef = useRef(null);
  const previousProgress = useRef(`${step}-${ready}`);

  useEffect(() => {
    const progress = `${step}-${ready}`;
    if (previousProgress.current !== progress) headingRef.current?.focus({ preventScroll: true });
    previousProgress.current = progress;
  }, [step, ready]);

  useEffect(() => {
    const search = new URLSearchParams(location.search);
    const service = search.get('service');
    const focus = search.get('focus');
    if (areas.some((area) => area.value === service)) {
      setForm((current) => ({ ...current, area: service, ...(focus ? { details: `I would like to discuss ${focus}.` } : {}) }));
    }
  }, [location.search]);

  const summary = useMemo(() => makeSummary(form), [form]);
  const mailto = `mailto:${contactEmail}?subject=${encodeURIComponent('Free consultation request from ' + form.fullName.trim())}&body=${encodeURIComponent(summary)}`;
  const update = (event) => {
    event.target.setCustomValidity('');
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };
  const handleSubmit = (event) => {
    event.preventDefault();
    const requiredText = step === 0
      ? [['fullName', 'Please enter your full name.'], ...(form.contactMethod !== 'Email' ? [['phone', 'Please enter your phone number.']] : [])]
      : step === 2 ? [['goals', 'Please tell us about your goals.']] : [];
    for (const [name, message] of requiredText) {
      if (!form[name].trim()) {
        const field = event.currentTarget.elements.namedItem(name);
        field.setCustomValidity(message);
        field.reportValidity();
        return;
      }
    }
    if (step < stepNames.length - 1) setStep((current) => current + 1);
    else setReady(true);
  };

  async function copyDetails() {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(summary);
      setCopyStatus('Request details copied.');
    } catch {
      setCopyStatus('Open “View request details” below to select and copy your answers.');
    }
  }

  return (
    <>
      <ol className="form-steps" aria-label="Consultation request progress">
        {stepNames.map((name, index) => (
          <li className={`${index === step && !ready ? 'is-current' : ''} ${index < step || ready ? 'is-complete' : ''}`} key={name} aria-current={index === step && !ready ? 'step' : undefined}>
            <span className="form-steps__number">{index < step || ready ? <Check size={17} aria-hidden="true" /> : index + 1}</span>
            <span className="form-steps__label">{name}</span>
          </li>
        ))}
      </ol>
      <div className="consultation-form-wrap">
        {ready ? (
          <div className="form-ready" aria-live="polite">
            <div className="form-ready__icon"><Check size={25} /></div>
            <p className="eyebrow eyebrow--light">ONE LAST STEP</p>
            <h2 tabIndex="-1" ref={headingRef}>Your request is ready</h2>
            <p>Open your email app to review and send your consultation request. Your message isn’t sent until you choose to send it.</p>
            <div className="button-row button-row--center">
              <a className="button button--primary" href={mailto}><Mail size={17} /> Open Email App</a>
              <button className="button button--outline-light" type="button" onClick={copyDetails}><Clipboard size={16} /> Copy Details</button>
            </div>
            {copyStatus && <p className="copy-status" role="status">{copyStatus}</p>}
            <details className="request-details"><summary>View request details</summary><pre>{summary}</pre></details>
            <button className="text-button text-button--light" type="button" onClick={() => { setReady(false); setCopyStatus(''); }}><ArrowLeft size={16} aria-hidden="true" /> Edit my answers</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-heading">
              <span>0{step + 1} / 03</span>
              <h2 tabIndex="-1" ref={headingRef}>{['Basic Information', 'Project Details', 'Goals & Challenges'][step]}</h2>
              <p>{['Let’s start with a few details about you.', 'Tell us a little about the project you have in mind.', 'Help us understand where you want to go.'][step]}</p>
            </div>
            {step === 0 && (
              <>
                <div className="form-grid">
                  <Field id="fullName" label="Full Name"><input id="fullName" name="fullName" type="text" placeholder="Enter your full name" autoComplete="name" value={form.fullName} onChange={update} required maxLength={120} /></Field>
                  <Field id="email" label="Email Address"><input id="email" name="email" type="email" placeholder="Enter your email" autoComplete="email" value={form.email} onChange={update} required maxLength={254} /></Field>
                  <Field id="company" label="Company Name" optional><input id="company" name="company" type="text" placeholder="Enter your company name" autoComplete="organization" value={form.company} onChange={update} maxLength={120} /></Field>
                  <Field id="phone" label="Phone Number" optional={form.contactMethod === 'Email'}><input id="phone" name="phone" type="tel" placeholder="Enter your phone number" autoComplete="tel" value={form.phone} onChange={update} required={form.contactMethod !== 'Email'} maxLength={40} /></Field>
                </div>
                <fieldset className="contact-method">
                  <legend>Preferred Contact Method</legend>
                  <div>{['Email', 'Phone', 'Both'].map((method) => <label key={method}><input name="contactMethod" type="radio" value={method} checked={form.contactMethod === method} onChange={update} /> <span>{method}</span></label>)}</div>
                </fieldset>
              </>
            )}
            {step === 1 && (
              <div className="form-grid">
                <Field id="area" label="Area of Interest"><select id="area" name="area" value={form.area} onChange={update} required><option value="">Select an area</option>{areas.map((area) => <option key={area.value} value={area.value}>{area.label}</option>)}</select></Field>
                <Field id="timeline" label="Ideal Timeline" optional><select id="timeline" name="timeline" value={form.timeline} onChange={update}><option value="">Select a timeline</option><option>As soon as possible</option><option>Within 1–3 months</option><option>Within 3–6 months</option><option>Just exploring</option></select></Field>
                <div className="form-field--wide"><Field id="details" label="Project Details" optional><textarea id="details" name="details" rows="4" placeholder="Tell us a little about what you’re working on" value={form.details} onChange={update} maxLength={1000} /></Field></div>
              </div>
            )}
            {step === 2 && (
              <div className="form-grid form-grid--single">
                <Field id="goals" label="What are your goals?"><textarea id="goals" name="goals" rows="4" placeholder="What would you like to achieve?" value={form.goals} onChange={update} required maxLength={1000} /></Field>
                <Field id="challenges" label="What challenges are you facing?" optional><textarea id="challenges" name="challenges" rows="4" placeholder="Share anything that’s standing in your way" value={form.challenges} onChange={update} maxLength={1000} /></Field>
                <p className="form-note"><Mail size={17} aria-hidden="true" /> Next, we’ll prepare an email with your answers. You can review it before sending.</p>
              </div>
            )}
            <div className="form-actions">
              {step > 0 ? <button className="button button--outline-light" type="button" onClick={() => setStep((current) => current - 1)}><ArrowLeft size={16} /> Previous</button> : <span />}
              <button className="button button--primary" type="submit">{step === 2 ? 'Prepare Request' : 'Next Step'} {step === 2 ? <Send size={16} /> : <ArrowRight size={16} />}</button>
            </div>
          </form>
        )}
      </div>
    </>
  );
}

export default function ConsultationPage() {
  return (
    <main id="main-content">
      <PageTitle title="Free consultation" description="Tell KWH Holdings about your business goals and challenges and start your free consultation." />
      <section className="consultation-section section">
        <div className="container">
          <div className="section-heading section-heading--center consultation-heading">
            <p className="eyebrow">LET’S GET TO KNOW EACH OTHER</p>
            <h1><span>Get Your</span> Free <span>Consultation</span></h1>
            <p>Tell us about your business goals and challenges. Our experts will provide personalized recommendations across marketing, strategy and technology solutions.</p>
          </div>
          <ConsultationForm />
          <div className="consultation-info-grid">
            <div className="consultation-info-card">
              <p className="eyebrow eyebrow--light">YOUR NEXT STEPS</p>
              <h2>What to Expect</h2>
              <ul className="expect-list">
                <li><span></span><div><h3>Free 30-Minute Consultation</h3><p>Initial discussion about your goals and challenges.</p></div></li>
                <li><span></span><div><h3>Custom Strategy Proposal</h3><p>Tailored recommendations across our departments.</p></div></li>
                <li><span></span><div><h3>No Obligation</h3><p>Complete freedom to choose your next steps.</p></div></li>
              </ul>
            </div>
            <div className="consultation-info-card consultation-info-card--contact">
              <p className="eyebrow eyebrow--light">WE’RE HERE TO HELP</p>
              <h2>Need Immediate Help?</h2>
              <div className="contact-detail"><Phone size={18} /><div><h3>Call Us Directly</h3><a href="tel:+27728315667">072 831 5667</a></div></div>
              <div className="contact-detail"><Mail size={18} /><div><h3>Email Us</h3><a href={`mailto:${contactEmail}`}>{contactEmail}</a></div></div>
              <div className="contact-detail"><span className="contact-detail__dot"></span><div><h3>Response Time</h3><p>Within 24 hours on business days</p></div></div>
            </div>
          </div>
        </div>
      </section>
      <section className="consultation-departments section" aria-labelledby="consultation-departments-title">
        <div className="container">
          <div className="section-heading section-heading--center"><p className="eyebrow">ONE TEAM, MANY PERSPECTIVES</p><h2 id="consultation-departments-title">Our Departments</h2></div>
          <div className="consultation-department-grid">
            <Link to="/services/marketing"><h3>Marketing &amp; Digital</h3><p>Social Media, Content Strategy, Email Marketing</p><DiagonalArrowIcon className="department-arrow" size={20} /></Link>
            <Link to="/services/business"><h3>Business Strategy</h3><p>Growth Planning, Market Analysis, Process Optimization</p><DiagonalArrowIcon className="department-arrow" size={20} /></Link>
            <Link to="/services/software"><h3>Technology Solutions</h3><p>Web Development, Mobile Apps, System Integration</p><DiagonalArrowIcon className="department-arrow" size={20} /></Link>
          </div>
        </div>
      </section>
    </main>
  );
}
