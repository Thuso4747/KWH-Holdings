import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDown, ArrowRight, ArrowUpRight, Code2 } from 'lucide-react';
import PageTitle from '../components/PageTitle';
import { PresentationIcon } from '../components/PresentationIcon';
import { StrategyIcon } from '../components/StrategyIcon';
import { departments } from '../data/services';

const icons = { marketing: StrategyIcon, business: PresentationIcon, software: Code2 };
const heroWords = ['Solutions', 'Systems', 'Innovations', 'Improvements'];

function DepartmentCard({ department, index }) {
  const Icon = icons[department.slug];
  return (
    <article className={`department-card department-card--${department.slug}`}>
      <span className="department-card__index" aria-hidden="true">0{index + 1}</span>
      <div className="department-card__identity">
        <div className="department-card__topline"><span>OUR EXPERTISE</span><Icon size={23} strokeWidth={1.6} aria-hidden="true" /></div>
        <h3>{department.cardTitle}</h3>
      </div>
      <div className="department-card__body">
        <p>{department.cardDescription}</p>
        <div className="department-card__services">
          <p className="department-card__services-label">KEY SERVICES</p>
          <ul role="list" aria-label={`${department.cardTitle} key services`}>{department.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>
        </div>
        <Link className="department-card__link" to={`/services/${department.slug}`} aria-label={`Learn more about ${department.cardTitle}`}>
          <span>Learn More</span><ArrowUpRight size={20} aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}

function HomeVisual({ headingRef }) {
  return (
    <section className="home-visual" id="vision" aria-labelledby="home-visual-title">
      <img src="/images/city-connections.jpg" alt="" width="1584" height="672" loading="lazy" decoding="async" />
      <div className="container home-visual__inner">
        <div className="home-visual__intro">
          <p className="eyebrow eyebrow--light">BRINGING IT ALL TOGETHER</p>
          <h2 id="home-visual-title" ref={headingRef} tabIndex="-1">From vision{' '}<br />to execution.</h2>
        </div>
        <nav className="home-visual__links" aria-label="Explore our departments">
          {departments.map((department, index) => (
            <Link key={department.slug} to={`/services/${department.slug}`}>
              <span><span className="home-visual__index" aria-hidden="true">0{index + 1}</span>{department.cardTitle}</span>
              <ArrowUpRight size={19} aria-hidden="true" />
            </Link>
          ))}
        </nav>
      </div>
    </section>
  );
}

export default function HomePage() {
  const [showScrollPrompt, setShowScrollPrompt] = useState(true);
  const heroRef = useRef(null);
  const visionHeadingRef = useRef(null);

  useEffect(() => {
    let frame = null;
    let lastVisible;
    const update = () => {
      frame = null;
      if (!heroRef.current) return;
      // Keep the prompt available throughout an oversized hero, then hide it as the next section enters.
      const visible = heroRef.current.getBoundingClientRect().bottom >= window.innerHeight - 24;
      if (visible !== lastVisible) {
        lastVisible = visible;
        setShowScrollPrompt(visible);
      }
    };
    const scheduleUpdate = () => {
      if (frame === null) frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate);
    const observer = window.ResizeObserver ? new window.ResizeObserver(scheduleUpdate) : null;
    observer?.observe(heroRef.current);
    return () => {
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
      observer?.disconnect();
      if (frame !== null) window.cancelAnimationFrame(frame);
    };
  }, []);

  function focusVisionHeading(event) {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    visionHeadingRef.current?.focus({ preventScroll: true });
  }

  return (
    <main id="main-content">
      <PageTitle title="Strategic solutions for modern businesses" description="KWH Holdings brings marketing, business strategy, and software development together to help modern businesses grow." />
      <section className="home-hero" ref={heroRef}>
        <div className="container home-hero__inner">
          <div className="home-hero__headline">
            <p className="eyebrow"><span aria-hidden="true">+</span> STRATEGY · CREATIVITY · TECHNOLOGY</p>
            <h1 aria-label="Strategic Solutions for Modern Businesses">
              <span className="home-hero__headline-accent">
                <span className="home-hero__headline-prefix">Strategic</span>{' '}
                <span className="rotating-word" aria-hidden="true">
                  <span className="rotating-word__sizer">Improvements</span>
                  {heroWords.map((word, index) => (
                    <span
                      className={`rotating-word__item ${index === 0 ? 'rotating-word__item--first' : ''}`}
                      style={{ '--word-delay': `${index * 2}s` }}
                      key={word}
                    >
                      {word}
                    </span>
                  ))}
                </span>
              </span><br />for Modern Businesses
            </h1>
          </div>
          <div className="home-hero__summary">
            <p>We bridge the gap between vision and execution with integrated consulting across marketing, business strategy and software development. Scale your business with confidence.</p>
            <div className="button-row">
              <Link className="button button--primary" to="/consultation">Start Your Journey <ArrowRight size={17} aria-hidden="true" /></Link>
              <Link className="button button--outline" to="/#services">View our services <ArrowUpRight size={17} aria-hidden="true" /></Link>
            </div>
          </div>
        </div>
        <Link
          className={`home-hero__scroll ${showScrollPrompt ? '' : 'is-hidden'}`}
          to="/#vision"
          tabIndex={showScrollPrompt ? undefined : -1}
          onClick={focusVisionHeading}
        >
          Scroll to explore <ArrowDown size={16} aria-hidden="true" />
        </Link>
      </section>

      <HomeVisual headingRef={visionHeadingRef} />

      <section className="departments-section section" id="services" aria-labelledby="departments-title">
        <div className="container">
          <div className="section-heading departments-heading">
            <div>
              <p className="eyebrow">WHAT WE DO</p>
              <h2 id="departments-title">Our Departments</h2>
            </div>
            <p>Comprehensive solutions across three core areas of expertise, designed to accelerate your business growth and digital transformation.</p>
          </div>
          <div className="department-grid">{departments.map((department, index) => <DepartmentCard key={department.slug} department={department} index={index} />)}</div>
          <section className="approach-section" id="approach" aria-labelledby="approach-title">
            <div className="approach-heading">
              <div>
                <p className="eyebrow">BETTER TOGETHER</p>
                <h2 id="approach-title">Integrated Approach</h2>
              </div>
              <p>Unlike traditional consulting firms, we provide holistic solutions that seamlessly integrate marketing, strategy and technology to deliver exceptional results.</p>
            </div>
            <ol className="approach-steps" role="list" aria-label="Our integrated approach">
              <li><span className="approach-steps__number" aria-hidden="true">01</span><div><h3>Analyze</h3><p>Deep dive into your business goals and challenges.</p></div></li>
              <li><span className="approach-steps__number" aria-hidden="true">02</span><div><h3>Strategize</h3><p>Develop integrated solutions across all departments.</p></div></li>
              <li><span className="approach-steps__number" aria-hidden="true">03</span><div><h3>Execute</h3><p>Implement and optimize for measurable results.</p></div></li>
            </ol>
          </section>
        </div>
      </section>

      <section className="about-section section" id="about" aria-labelledby="about-title">
        <div className="container">
          <div className="about-intro">
            <div>
              <p className="eyebrow">THE PEOPLE BEHIND THE WORK</p>
              <h2 id="about-title">About KWH Holdings</h2>
            </div>
            <p className="about-intro__summary">Founded by a team of professionals from marketing, business strategy and tech development, KWH Holdings was created to bridge the gap between vision and execution for modern companies.</p>
          </div>
          <div className="about-story">
            <div>
              <h3>Our Mission</h3>
              <p>To empower businesses with innovative, sustainable and strategic solutions across marketing, business development and software, helping them scale and thrive in a rapidly evolving digital economy.</p>
            </div>
            <div>
              <h3>Why We Started</h3>
              <p>We identified a recurring challenge: companies often had innovative ideas but lacked integrated support across strategy, marketing and software. KWH was formed to deliver holistic consulting under one roof.</p>
            </div>
          </div>
          <aside className="about-values" aria-labelledby="values-title">
            <div className="about-values__heading"><p className="eyebrow">WHAT GUIDES US</p><h3 id="values-title">Core Values</h3></div>
            <dl>
              <div><dt>Integrity</dt><dd>Transparency, honesty and ethical practices.</dd></div>
              <div><dt>Innovation</dt><dd>Creativity and technology to solve challenges.</dd></div>
              <div><dt>Client Needs Prioritized</dt><dd>Solutions tailored to client goals and success.</dd></div>
              <div><dt>Collaboration</dt><dd>Strong partnerships based on trust.</dd></div>
              <div><dt>Excellence</dt><dd>Measurable results with professionalism.</dd></div>
            </dl>
          </aside>
        </div>
      </section>
    </main>
  );
}
