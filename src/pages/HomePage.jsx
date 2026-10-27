import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Code2, X } from 'lucide-react';
import PageTitle from '../components/PageTitle';
import { PresentationIcon } from '../components/PresentationIcon';
import { StrategyIcon } from '../components/StrategyIcon';
import { departments } from '../data/services';
import { projects } from '../data/projects';

const icons = { marketing: StrategyIcon, business: PresentationIcon, software: Code2 };
const filters = ['All Projects', 'Marketing', 'Consulting', 'Software'];

function DepartmentCard({ department, index }) {
  const Icon = icons[department.slug];
  return (
    <article className={`department-card department-card--${department.slug}`}>
      <div className="department-card__image">
        <img src={department.image} alt="" width="1376" height="768" loading="lazy" decoding="async" />
      </div>
      <div className="department-card__content">
        <div className="department-card__topline"><span>0{index + 1} / OUR EXPERTISE</span><Icon size={23} strokeWidth={1.6} aria-hidden="true" /></div>
        <div className="department-card__body">
          <h3>{department.cardTitle}</h3>
          <p>{department.cardDescription}</p>
          <div className="department-card__services">
            <p className="department-card__services-label">KEY SERVICES</p>
            <ul>{department.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>
          </div>
        </div>
        <Link className="department-card__link" to={`/services/${department.slug}`} aria-label={`Learn more about ${department.cardTitle}`}>
          <span>Learn More</span><ArrowRight size={18} aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}

function ProjectModal({ project, onClose }) {
  const dialogRef = useRef(null);
  const closeRef = useRef(null);

  useEffect(() => {
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'Tab' && dialogRef.current) {
        const focusable = [...dialogRef.current.querySelectorAll('a[href], button:not([disabled])')];
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
      previousFocus?.focus();
    };
  }, [onClose]);

  return createPortal(
    <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div className="project-modal" role="dialog" aria-modal="true" aria-labelledby="project-modal-title" ref={dialogRef}>
        <button className="modal-close" type="button" aria-label="Close project details" onClick={onClose} ref={closeRef}><X size={21} /></button>
        <img src={project.image} alt="" />
        <div className="project-modal__body">
          <p className="eyebrow">FEATURED WORK / {project.category.toUpperCase()}</p>
          <h2 id="project-modal-title">{project.title}</h2>
          <p>{project.summary}</p>
          <div className="modal-facts"><div><span>PROJECT TYPE</span><strong>{project.type}</strong></div><div><span>DEPARTMENT</span><strong>Software Solutions</strong></div></div>
          <p>Have a project in mind? Let’s talk about what we can build together.</p>
          <Link className="button button--primary" to="/consultation?service=software" onClick={onClose}>Start a conversation <ArrowRight size={17} /></Link>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function FeaturedWork() {
  const location = useLocation();
  const queryCategory = new URLSearchParams(location.search).get('category');
  const categoryFromQuery = filters.find((filter) => filter.toLowerCase() === queryCategory?.toLowerCase());
  const [activeFilter, setActiveFilter] = useState(categoryFromQuery || 'Software');
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    if (categoryFromQuery) setActiveFilter(categoryFromQuery);
  }, [categoryFromQuery]);

  const visibleProjects = activeFilter === 'All Projects' ? projects : projects.filter((project) => project.category === activeFilter);

  return (
    <section className="work-section section" id="work">
      <div className="container">
        <div className="section-heading section-heading--center">
          <p className="eyebrow">IDEAS IN ACTION</p>
          <h2>Featured Work</h2>
          <p>A curated selection of projects and capabilities that showcase our integrated approach to solving business challenges across all departments.</p>
        </div>
        <div className="work-filters" role="group" aria-label="Filter featured work">
          {filters.map((filter) => (
            <button key={filter} type="button" className={filter === activeFilter ? 'is-active' : ''} aria-pressed={filter === activeFilter} onClick={() => setActiveFilter(filter)}>{filter}</button>
          ))}
        </div>
        <div className="work-grid" aria-live="polite">
          {visibleProjects.map((project) => (
            <article className="work-card" key={project.id}>
              <div className="work-card__image">
                <img src={project.image} alt="" loading="lazy" />
                <span className="work-card__category">{project.category} / {project.service ? 'CAPABILITY' : 'FEATURED PROJECT'}</span>
                <ArrowUpRight className="work-card__image-icon" size={23} aria-hidden="true" />
              </div>
              <div className="work-card__content">
                <div className="work-card__meta">
                  <div><span>{project.service ? 'CAPABILITY' : 'CLIENT'}</span><h3>{project.title}</h3></div>
                  <div><span>FOCUS</span><p>{project.type}</p></div>
                  <div><span>DETAILS</span><p>{project.meta}</p></div>
                </div>
                <div className="work-card__actions">
                  {project.service
                    ? <Link className="button button--primary button--small" to={`/services/${project.service}`}>Explore Service <ArrowRight size={15} /></Link>
                    : <button className="button button--primary button--small" type="button" onClick={() => setSelectedProject(project)}>View Case Study <ArrowRight size={15} /></button>}
                  <Link className="button button--outline-light button--small" to={`/consultation?service=${project.service || 'software'}`}>Discuss a Project</Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
      {selectedProject && <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />}
    </section>
  );
}

export default function HomePage() {
  return (
    <main id="main-content">
      <PageTitle title="Strategic solutions for modern businesses" description="KWH Holdings brings marketing, business strategy, and software development together to help modern businesses grow." />
      <section className="home-hero">
        <div className="container home-hero__inner">
          <p className="eyebrow eyebrow--center"><span></span> STRATEGY · CREATIVITY · TECHNOLOGY <span></span></p>
          <h1><span>Strategic Solutions</span><br />for Modern Businesses</h1>
          <p>We bridge the gap between vision and execution with integrated consulting across marketing, business strategy and software development. Scale your business with confidence.</p>
          <div className="button-row button-row--center">
            <Link className="button button--primary" to="/consultation">Start Your Journey <ArrowRight size={17} aria-hidden="true" /></Link>
            <Link className="button button--outline" to="/#work">View Our Work <ArrowUpRight size={17} aria-hidden="true" /></Link>
          </div>
        </div>
      </section>

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
          <section className="approach-panel" id="approach" aria-labelledby="approach-title">
            <div className="approach-panel__intro">
              <p className="eyebrow eyebrow--light">BETTER TOGETHER</p>
              <h2 id="approach-title">Integrated Approach</h2>
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
        <div className="container about-grid">
          <div className="about-copy">
            <p className="eyebrow">THE PEOPLE BEHIND THE WORK</p>
            <h2 id="about-title">About KWH Holdings</h2>
            <p className="about-copy__intro">Founded by a team of professionals from marketing, business strategy and tech development, KWH Holdings was created to bridge the gap between vision and execution for modern companies.</p>
            <div className="about-copy__details">
              <div>
                <h3>Our Mission</h3>
                <p>To empower businesses with innovative, sustainable and strategic solutions across marketing, business development and software, helping them scale and thrive in a rapidly evolving digital economy.</p>
              </div>
              <div>
                <h3>Why We Started</h3>
                <p>We identified a recurring challenge: companies often had innovative ideas but lacked integrated support across strategy, marketing and software. KWH was formed to deliver holistic consulting under one roof.</p>
              </div>
            </div>
          </div>
          <aside className="values-card" aria-labelledby="values-title">
            <div className="values-card__heading"><div><p className="eyebrow eyebrow--light">WHAT GUIDES US</p><h3 id="values-title">Core Values</h3></div><span aria-hidden="true">✳</span></div>
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
      <FeaturedWork />
    </main>
  );
}
