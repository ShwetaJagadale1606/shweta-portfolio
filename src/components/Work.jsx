import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useTransform, useMotionTemplate } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import projects from '../data/projects';
import './Work.css';

const MotionLink = motion.create(Link);

const rowReveal = {
  hidden: { y: 40, opacity: 0 },
  visible: (i) => ({
    y: 0,
    opacity: 1,
    transition: { duration: 0.85, ease: [0.19, 1, 0.22, 1], delay: i * 0.08 },
  }),
};

function Cover({ project }) {
  return (
    <div className="work-cover" style={{ '--glow': project.glow }}>
      <span className="work-cover__num serif-i">{project.index}</span>
      <span className="work-cover__title meta">{project.title}</span>
    </div>
  );
}

export default function Work() {
  // Hover state lives entirely in motion values — zero React re-renders on hover
  const active = useMotionValue(-1);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const px = useSpring(x, { stiffness: 260, damping: 30, mass: 0.6 });
  const py = useSpring(y, { stiffness: 260, damping: 30, mass: 0.6 });
  const scale = useSpring(useTransform(active, (v) => (v < 0 ? 0 : 1)), {
    stiffness: 320,
    damping: 26,
  });
  const stripPct = useSpring(useTransform(active, (v) => Math.max(v, 0) * -100), {
    stiffness: 240,
    damping: 28,
  });
  const stripY = useMotionTemplate`${stripPct}%`;
  const listRef = useRef(null);

  const onMove = (e) => {
    const rect = listRef.current?.getBoundingClientRect();
    if (!rect) return;
    x.set(e.clientX - rect.left);
    y.set(e.clientY - rect.top);
  };

  return (
    <section className="work container" id="work">
      <motion.div
        className="section-head"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
      >
        <h2>
          Selected <span className="serif-i work__head-accent">works</span>
        </h2>
        <span className="meta">(01 — 04)</span>
      </motion.div>

      <div
        ref={listRef}
        className="work__list"
        onMouseMove={onMove}
        onMouseLeave={() => active.set(-1)}
      >
        {projects.map((project, i) => (
          <MotionLink
            key={project.slug}
            className="work-row"
            to={`/work/${project.slug}`}
            data-cursor="view"
            onMouseEnter={() => active.set(i)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={rowReveal}
            custom={i}
          >
            <span className="work-row__index meta">No. {project.index}</span>

            <div className="work-row__mobile-cover">
              <Cover project={project} />
            </div>

            <div className="work-row__main">
              <h3 className="work-row__title">{project.title}</h3>
              <p className="work-row__outcome">{project.outcome}</p>
            </div>

            <div className="work-row__side">
              <div className="work-row__tags">
                {project.tags.map((tag) => (
                  <span key={tag} className="work-row__tag">
                    {tag}
                  </span>
                ))}
              </div>
              <span className="work-row__year meta">©{project.year}</span>
            </div>

            <span className="work-row__arrow">
              <ArrowUpRight size={22} strokeWidth={1.5} />
            </span>
          </MotionLink>
        ))}

        {/* Cursor-following preview (desktop only) */}
        <motion.div
          className="work__preview"
          style={{ x: px, y: py, scale, opacity: scale }}
          aria-hidden="true"
        >
          <motion.div className="work__preview-strip" style={{ y: stripY }}>
            {projects.map((project) => (
              <Cover key={project.slug} project={project} />
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
