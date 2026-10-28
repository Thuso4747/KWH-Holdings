import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Minus } from 'lucide-react';
import PageTitle from '../components/PageTitle';
import ServiceHeadlinePhrase from '../components/ServiceHeadlinePhrase';

function OfferingCard({ offering, service, index }) {
  const [expanded, setExpanded] = useState(false);
  const detailsId = `${service.slug}-offering-${index}`;
  return (
    <article className="offering-card">
      <span className="offering-card__number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
      <h3>{offering.title}</h3>
      <div className="offering-card__body">
        <p>{offering.description}</p>
        <ul className="tag-list" aria-label="Areas of expertise">{offering.tags.map((tag) => <li key={tag}>{tag}</li>)}</ul>
        <button className="offering-card__toggle" type="button" aria-expanded={expanded} aria-controls={detailsId} onClick={() => setExpanded(!expanded)}>
          <span>{expanded ? 'Show Less' : 'Show More'}</span>
          {expanded ? <Minus size={19} aria-hidden="true" /> : <ArrowRight size={19} aria-hidden="true" />}
        </button>
        <div className="offering-card__detail" id={detailsId} hidden={!expanded}>
          <p>{offering.detail}</p>
          <Link to={`/consultation?service=${service.slug}&focus=${encodeURIComponent(offering.title)}`}>Discuss this service <ArrowUpRight size={16} aria-hidden="true" /></Link>
        </div>
      </div>
    </article>
  );
}

function ServiceTabs({ service }) {
  const [active, setActive] = useState(0);
  const tabsRef = useRef([]);

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
        {service.tabs.map((tab, tabIndex) => (
          <div className="service-tab-panel" role="tabpanel" id={`panel-${service.slug}-${tabIndex}`} aria-labelledby={`tab-${service.slug}-${tabIndex}`} tabIndex="0" hidden={tabIndex !== active} key={tab.label}>
            <div className="section-heading service-panel-heading">
              <div>
                <p className="eyebrow">THE KWH DIFFERENCE</p>
                <h2>{tab.heading}</h2>
              </div>
              <p>{tab.description}</p>
            </div>
            <div className="benefits-grid">
              {tab.cards.map((card, index) => (
                <article className="benefit-card" key={card.title}>
                  <span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                  <div>
                    <h3 aria-label={card.title}>{card.title.replace(/^\d{2}\.\s*/, '')}</h3>
                    <p>{card.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function ServicePage({ service }) {
  return (
    <main id="main-content">
      <PageTitle title={service.label} description={service.intro} />
      <section className={`service-hero service-hero--${service.slug}`} style={{ backgroundImage: `url(${service.image})` }}>
        <div className="container service-hero__inner">
          <p className="eyebrow eyebrow--light">KWH HOLDINGS / {service.label.toUpperCase()}</p>
          <h1 aria-label={`${service.heroFirst} ${service.heroAccent}`}>
            {service.heroFirst}<br />
            <ServiceHeadlinePhrase words={service.heroWords} prefix={service.heroPrefix} suffix={service.heroSuffix} />
          </h1>
          <p>{service.heroDescription}</p>
          <div className="button-row">
            <Link className="button button--white" to={`/consultation?service=${service.slug}`}>Start Project <ArrowRight size={17} /></Link>
            <Link className="button button--outline-light" to="#service-offerings">View Services <ArrowUpRight size={17} aria-hidden="true" /></Link>
          </div>
        </div>
      </section>
      <section className="service-offerings section" id="service-offerings" aria-labelledby="service-offerings-title">
        <div className="container">
          <div className="section-heading service-offerings__heading">
            <div>
              <p className="eyebrow">OUR EXPERTISE</p>
              <h2 id="service-offerings-title">Our <span>{service.shortLabel}</span> Services</h2>
            </div>
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
