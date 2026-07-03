import { useRef } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowUpRight, ArrowLeft } from 'lucide-react';
import { getProject, getNextProject } from '../data/projects';
import './ProjectPage.css';

const lineReveal = {
  hidden: { y: '112%' },
  visible: (i) => ({
    y: '0%',
    transition: { duration: 1, ease: [0.19, 1, 0.22, 1], delay: 0.1 + i * 0.09 },
  }),
};

const fade = {
  hidden: { opacity: 0, y: 22 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.85, ease: [0.19, 1, 0.22, 1], delay: i * 0.09 },
  }),
};

export default function ProjectPage({ pageMotion }) {
  const { slug } = useParams();
  const project = getProject(slug);
  const coverRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: coverRef,
    offset: ['start end', 'end start'],
  });
  const coverY = useTransform(scrollYProgress, [0, 1], ['-10%', '10%']);

  if (!project) return <Navigate to="/" replace />;

  const next = getNextProject(slug);

  return (
    <motion.div {...pageMotion}>
      <main className="project">
        {/* Hero */}
        <header className="project__hero container">
          <motion.div
            className="project__meta-row"
            initial="hidden"
            animate="visible"
            variants={fade}
            custom={0}
          >
            <Link to="/" className="project__back">
              <ArrowLeft size={14} strokeWidth={1.8} />
              <span className="meta">All works</span>
            </Link>
            <span className="meta">
              No. {project.index} — {project.category} — ©{project.year}
            </span>
          </motion.div>

          <h1 className="project__title">
            <span className="reveal-line">
              <motion.span initial="hidden" animate="visible" variants={lineReveal} custom={0}>
                {project.title}
              </motion.span>
            </span>
          </h1>

          <motion.p
            className="project__outcome serif-i"
            initial="hidden"
            animate="visible"
            variants={fade}
            custom={1}
          >
            {project.outcome}
          </motion.p>

          <motion.div
            className="project__tags"
            initial="hidden"
            animate="visible"
            variants={fade}
            custom={2}
          >
            {project.tags.map((tag) => (
              <span key={tag} className="project__tag">
                {tag}
              </span>
            ))}
          </motion.div>
        </header>

        {/* Cover band */}
        <motion.div
          ref={coverRef}
          className="project__cover"
          style={{ '--glow': project.glow }}
          initial={{ clipPath: 'inset(0 0 100% 0)' }}
          animate={{ clipPath: 'inset(0 0 0% 0)' }}
          transition={{ duration: 1, ease: [0.76, 0, 0.24, 1], delay: 0.35 }}
        >
          <motion.div className="project__cover-inner" style={{ y: coverY }}>
            <span className="project__cover-num serif-i">{project.index}</span>
            <span className="project__cover-star spark" aria-hidden="true">✦</span>
          </motion.div>
        </motion.div>

        {/* Info grid */}
        <section className="project__info container">
          {[
            { label: 'Role', value: project.role },
            { label: 'Timeline', value: project.timeline },
            { label: 'Stack', value: project.stack.join(' · ') },
          ].map((item, i) => (
            <motion.div
              key={item.label}
              className="project__info-col"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-40px' }}
              variants={fade}
              custom={i}
            >
              <span className="meta meta--accent">{item.label}</span>
              <p>{item.value}</p>
            </motion.div>
          ))}
          <motion.a
            className="project__repo"
            href={project.repo}
            target="_blank"
            rel="noopener noreferrer"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            variants={fade}
            custom={3}
          >
            View code <ArrowUpRight size={15} strokeWidth={1.6} />
          </motion.a>
        </section>

        {/* Overview */}
        <section className="project__overview container">
          <motion.span
            className="meta meta--accent"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={fade}
            custom={0}
          >
            (01) — Overview
          </motion.span>
          <motion.p
            className="project__intro"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={fade}
            custom={1}
          >
            {project.intro}
          </motion.p>
          <div className="project__body">
            {project.body.map((para, i) => (
              <motion.p
                key={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-40px' }}
                variants={fade}
                custom={i}
              >
                {para}
              </motion.p>
            ))}
          </div>
        </section>

        {/* Highlights */}
        <section className="project__highlights container">
          <motion.span
            className="meta meta--accent"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={fade}
            custom={0}
          >
            (02) — What makes it tick
          </motion.span>
          <div>
            {project.highlights.map((h, i) => (
              <motion.div
                key={h.title}
                className="project__highlight"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-40px' }}
                variants={fade}
                custom={i}
              >
                <span className="meta project__highlight-num">0{i + 1}</span>
                <div>
                  <h3>{h.title}</h3>
                  <p>{h.text}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Next project */}
        <Link to={`/work/${next.slug}`} className="project__next" data-cursor="view">
          <div className="container project__next-inner">
            <span className="meta meta--accent">Next project</span>
            <div className="project__next-row">
              <h2 className="project__next-title">
                {next.title}
                <em className="serif-i"> →</em>
              </h2>
              <span className="meta">No. {next.index}</span>
            </div>
          </div>
        </Link>
      </main>
    </motion.div>
  );
}
