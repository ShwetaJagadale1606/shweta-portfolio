import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import './Experience.css';

const entries = [
  {
    year: '2020',
    span: '2020 — 2024',
    role: 'B.Tech, Computer Science',
    place: 'Government Engineering College',
    text: 'Foundations — data structures, databases, operating systems, and the first taste of building things that actually work.',
    tags: ['DSA', 'DBMS', 'OS'],
  },
  {
    year: '2022',
    span: '2022',
    role: 'Open Source Contributor',
    place: 'GitHub & personal projects',
    text: 'Shipped personal tools and contributed patches — learning to read other people’s code and leave it better than I found it.',
    tags: ['Python', 'Java', 'Git'],
  },
  {
    year: '2023',
    span: '2023 — 2024',
    role: 'Software Developer Intern',
    place: 'Tech startup, Pune',
    text: 'Built REST APIs and React dashboards for a SaaS product — cut API response times by 40% with query tuning and caching.',
    tags: ['React', 'Node.js', 'MySQL'],
  },
  {
    year: '2024',
    span: '2024 — Now',
    role: 'Software Engineer',
    place: 'Tata Consultancy Services',
    text: 'Enterprise applications with Java, Spring Boot and microservices — owning features end to end, from design to production.',
    tags: ['Java', 'Spring Boot', 'Microservices'],
    current: true,
  },
];

function Card({ entry }) {
  return (
    <div className={`exp-card ${entry.current ? 'exp-card--current' : ''}`}>
      <div className="exp-card__top">
        <span className="meta meta--accent">{entry.span}</span>
        {entry.current && <span className="exp-card__badge">Now</span>}
      </div>
      <h3>{entry.role}</h3>
      <p className="exp-card__place">{entry.place}</p>
      <p className="exp-card__text">{entry.text}</p>
      <div className="exp-card__tags">
        {entry.tags.map((tag) => (
          <span key={tag}>{tag}</span>
        ))}
      </div>
    </div>
  );
}

export default function Experience({ onNavigate }) {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const [dist, setDist] = useState(0);
  const [line, setLine] = useState({ left: 0, width: 0 });
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' && window.matchMedia('(max-width: 899px)').matches
  );

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 899px)');
    const onChange = (e) => setIsMobile(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    if (isMobile) return;
    const measure = () => {
      const track = trackRef.current;
      if (!track) return;
      setDist(Math.max(0, track.scrollWidth - window.innerWidth));
      // Line spans from the first node to the last node — no further
      const items = track.querySelectorAll('.exp-item');
      if (items.length > 1) {
        const first = items[0];
        const last = items[items.length - 1];
        setLine({ left: first.offsetLeft, width: last.offsetLeft - first.offsetLeft + 11 });
      }
    };
    measure();
    const late = setTimeout(measure, 700); // re-measure after fonts settle
    window.addEventListener('resize', measure);
    return () => {
      clearTimeout(late);
      window.removeEventListener('resize', measure);
    };
  }, [isMobile]);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });
  const x = useTransform(scrollYProgress, [0, 1], [0, -dist]);

  const head = (
    <motion.div
      className="section-head container"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
    >
      <h2>
        The journey <span className="serif-i exp__head-accent">so far</span>
      </h2>
      <span className="meta">(03) — scroll</span>
    </motion.div>
  );

  /* ------- Mobile: vertical timeline ------- */
  if (isMobile) {
    return (
      <section className="exp" id="experience">
        {head}
        <div className="exp-mobile container">
          <div className="exp-mobile__line" aria-hidden="true" />
          {entries.map((entry, i) => (
            <motion.div
              key={entry.year}
              className="exp-mobile__item"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.7, ease: [0.19, 1, 0.22, 1], delay: i * 0.05 }}
            >
              <span className={`exp-dot ${entry.current ? 'exp-dot--current' : ''}`} />
              <span className="exp-mobile__year serif-i">{entry.year}</span>
              <Card entry={entry} />
            </motion.div>
          ))}
        </div>
      </section>
    );
  }

  /* ------- Desktop: pinned horizontal scrub ------- */
  return (
    <section
      ref={sectionRef}
      className="exp"
      id="experience"
      style={{ height: `calc(100vh + ${dist}px)` }}
    >
      <div className="exp__pin">
        {head}
        <div className="exp__stage">
          <motion.div ref={trackRef} className="exp__track" style={{ x }}>
            {/* Base line + scroll-filled progress — rides with the track, ends at the last node */}
            <div
              className="exp__line"
              style={{ left: line.left, width: line.width }}
              aria-hidden="true"
            />
            <motion.div
              className="exp__line exp__line--progress"
              style={{ left: line.left, width: line.width, scaleX: scrollYProgress }}
              aria-hidden="true"
            />
            {entries.map((entry, i) => (
              <div
                key={entry.year}
                className={`exp-item ${i % 2 ? 'exp-item--below' : 'exp-item--above'}`}
              >
                <span className="exp-item__ghost serif-i" aria-hidden="true">
                  {entry.year}
                </span>
                <span className={`exp-dot ${entry.current ? 'exp-dot--current' : ''}`} />
                <Card entry={entry} />
              </div>
            ))}

            {/* End cap */}
            <div className="exp-item exp-item--above exp-item--cta">
              <span className="exp-item__ghost serif-i" aria-hidden="true">
                next
              </span>
              <span className="exp-dot exp-dot--open" />
              <button className="exp-cta" onClick={() => onNavigate?.('#contact')}>
                <span className="hand">the next chapter — your team? ✿</span>
                <span className="exp-cta__link serif-i">let’s connect →</span>
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
