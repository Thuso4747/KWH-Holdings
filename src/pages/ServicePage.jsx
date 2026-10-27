import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Minus, Plus } from 'lucide-react';
import PageTitle from '../components/PageTitle';

function OfferingCard({ offering, service, index }) {
  const [expanded, setExpanded] = useState(false);
  const detailsId = `${service.slug}-offering-${index}`;
  return (
    <article className={`offering-card ${expanded ? 'is-expanded' : ''}`}>
      <div className="offering-card__number">0{index + 1} <span>/ {service.shortLabel.toUpperCase()}</span></div>
      <h3>{offering.title}</h3>
      <p>{offering.description}</p>
      <ul className="tag-list" aria-label="Areas of expertise">{offering.tags.map((tag) => <li key={tag}>{tag}</li>)}</ul>
      <div className="offering-card__detail" id={detailsId} hidden={!expanded}>
        <p>{offering.detail}</p>
        <Link to={`/consultation?service=${service.slug}&focus=${encodeURIComponent(offering.title)}`}>Discuss this service <ArrowUpRight size={15} /></Link>
      </div>
      <button className="offering-card__toggle" type="button" aria-expanded={expanded} aria-controls={detailsId} onClick={() => setExpanded(!expanded)}>
        <span>{expanded ? 'Show Less' : 'Learn More'}</span>
        {expanded ? <Minus size={19} aria-hidden="true" /> : <ArrowRight size={19} aria-hidden="true" />}
      </button>
    </article>
  );
}

function ServiceTabs({ service }) {
  const [active, setActive] = useState(0);
  const tabsRef = useRef([]);
  const tab = service.tabs[active];

  function handleKeys(event, index) {
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % service.tabs.length;
    if (event.key === 'ArrowLeft') next = (index - 1 + service.tabs.length) % service.tabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = service.tabs.length - 1;
    if (next !== undefined) {
      event.preventDefault();
      setActive(next);
      tabsRef.current[next]?.focus();
    }
  }

  return (
    <section className="service-why section" id="why-us">
      <div className="container">
        <div className="service-tabs" role="tablist" aria-label={`${service.shortLabel} service information`}>
          {service.tabs.map((item, index) => (
            <button
              key={item.label}
              id={`tab-${service.slug}-${index}`}
              ref={(node) => { tabsRef.current[index] = node; }}
              type="button"
              role="tab"
              aria-selected={index === active}
              aria-controls={`panel-${service.slug}-${index}`}
              tabIndex={index === active ? 0 : -1}
              className={index === active ? 'is-active' : ''}
              onClick={() => setActive(index)}
              onKeyDown={(event) => handleKeys(event, index)}
            >{item.label}</button>
          ))}
        </div>
        <div className="service-tab-panel" role="tabpanel" id={`panel-${service.slug}-${active}`} aria-labelledby={`tab-${service.slug}-${active}`} tabIndex="0">
          <div className="section-heading section-heading--center">
            <p className="eyebrow">THE KWH DIFFERENCE</p>
            <h2>{tab.heading}</h2>
            <p>{tab.description}</p>
          </div>
          <div className="benefits-grid">
            {tab.cards.map((card, index) => (
              <article className="benefit-card" key={card.title}>
                <span>0{index + 1}</span>
                <h3>{card.title}</h3>
                <p>{card.description}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function ServicePage({ service }) {
  const category = service.slug === 'business' ? 'Consulting' : service.shortLabel;
  return (
    <main id="main-content">
      <PageTitle title={service.label} description={service.intro} />
      <section className={`service-hero service-hero--${service.slug}`} style={{ backgroundImage: `url(${service.image})` }}>
        <div className="container service-hero__inner">
          <p className="eyebrow eyebrow--light">KWH HOLDINGS / {service.label.toUpperCase()}</p>
          <h1>{service.heroFirst}<br /><span>{service.heroAccent}</span></h1>
          <p>{service.heroDescription}</p>
          <div className="button-row">
            <Link className="button button--white" to={`/consultation?service=${service.slug}`}>Start Project <ArrowRight size={17} /></Link>
            <Link className="button button--outline-light" to={`/?category=${category}#work`}>{service.heroLink} <ArrowUpRight size={17} /></Link>
          </div>
        </div>
      </section>
      <section className="service-offerings section" id="service-offerings">
        <div className="container">
          <div className="section-heading section-heading--center">
            <p className="eyebrow">OUR EXPERTISE</p>
            <h2>Our <span>{service.shortLabel}</span> Services</h2>
            <p>{service.intro}</p>
          </div>
          <div className="offerings-grid">
            {service.offerings.map((offering, index) => <OfferingCard key={offering.title} offering={offering} service={service} index={index} />)}
          </div>
        </div>
      </section>
      <ServiceTabs service={service} />
      <section className="service-cta">
        <div className="container service-cta__inner">
          <div><p className="eyebrow">YOUR NEXT CHAPTER STARTS HERE</p><h2>Let’s make something happen.</h2></div>
          <Link className="button button--primary" to={`/consultation?service=${service.slug}`}>Start Your Project <ArrowRight size={17} /></Link>
        </div>
      </section>
    </main>
  );
}
