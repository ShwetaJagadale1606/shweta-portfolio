import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import Wish from './Wish';
import './Hero.css';

const photos = ['/images/p-1-web.jpg', '/images/p-2.jpg', '/images/p-3.jpg'];

const charReveal = {
  hidden: { y: '115%' },
  visible: (i) => ({
    y: '0%',
    transition: { duration: 0.9, ease: [0.19, 1, 0.22, 1], delay: 0.18 + i * 0.04 },
  }),
};

const fade = {
  hidden: { opacity: 0, y: 16 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease: [0.19, 1, 0.22, 1], delay: 0.7 + i * 0.12 },
  }),
};

function Word({ text, italic, offset }) {
  return (
    <span className={`hero__word ${italic ? 'hero__word--italic' : ''}`} aria-hidden="true">
      {text.split('').map((ch, i) => (
        <span key={i} className="hero__char-mask">
          <motion.span className="hero__char" variants={charReveal} custom={offset + i}>
            {ch}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

export default function Hero({ started, onNavigate }) {
  const ref = useRef(null);
  const [photo, setPhoto] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 140]);
  const opacity = useTransform(scrollYProgress, [0, 0.85], [1, 0]);

  useEffect(() => {
    const id = setInterval(() => setPhoto((p) => (p + 1) % photos.length), 3000);
    return () => clearInterval(id);
  }, []);

  return (
    <section ref={ref} className="hero" id="top">
      {/* Glow blobs */}
      <div className="hero__blob hero__blob--pink" aria-hidden="true" />
      <div className="hero__blob hero__blob--blue" aria-hidden="true" />

      {/* Sparkles */}
      <span className="spark hero__spark-1" aria-hidden="true">✦</span>
      <span className="spark spark--blue hero__spark-2" aria-hidden="true">✧</span>
      <span className="spark hero__spark-3" aria-hidden="true">✧</span>
      <span className="spark spark--blue hero__spark-4" aria-hidden="true">✦</span>

      {/* Wish chatbot — lives in the hero only */}
      {started && <Wish />}

      <motion.div
        className="hero__inner container"
        style={{ y, opacity }}
        initial="hidden"
        animate={started ? 'visible' : 'hidden'}
      >
        <motion.span className="hero__hello hand" variants={fade} custom={0}>
          hello, I&rsquo;m
        </motion.span>

        <h1 className="hero__title" aria-label="Shweta Jagadale">
          <span className="hero__title-line">
            <Word text="Shweta" offset={0} />
            <motion.span
              className="hero__photo-pill"
              data-cursor-label="hello ✿"
              variants={{
                hidden: { scale: 0, rotate: -30 },
                visible: {
                  scale: 1,
                  rotate: -4,
                  transition: { type: 'spring', stiffness: 200, damping: 16, delay: 0.55 },
                },
              }}
            >
              <AnimatePresence mode="popLayout">
                <motion.img
                  key={photos[photo]}
                  src={photos[photo]}
                  alt=""
                  initial={{ opacity: 0, scale: 1.15 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6, ease: [0.19, 1, 0.22, 1] }}
                />
              </AnimatePresence>
            </motion.span>
            <Word text="Jagadale" italic offset={6} />
          </span>
        </h1>

        <motion.p className="hero__sub" variants={fade} custom={1}>
          Software engineer specialising in <em className="serif-i">resilient</em> backend
          architecture & <em className="serif-i">refined</em> interfaces — Java, Spring Boot,
          React.
        </motion.p>

        <motion.div className="hero__ctas" variants={fade} custom={2}>
          <button className="hero__cta-primary" onClick={() => onNavigate('#contact')}>
            Let&rsquo;s work together
          </button>
          <button className="hero__cta-ghost" onClick={() => onNavigate('#work')}>
            see my work
          </button>
        </motion.div>
      </motion.div>

      <motion.div
        className="hero__foot container"
        initial="hidden"
        animate={started ? 'visible' : 'hidden'}
      >
        <motion.span className="meta" variants={fade} custom={3}>
          Pune, India — 18.52°N
        </motion.span>
        <motion.button
          className="hero__scroll-cue"
          variants={fade}
          custom={4}
          onClick={() => onNavigate('#work')}
          aria-label="Scroll to work"
        >
          <span className="hero__scroll-track">
            <span className="hero__scroll-thumb" />
          </span>
        </motion.button>
        <motion.span className="meta hero__status" variants={fade} custom={5}>
          <span className="hero__pulse" />
          Open to opportunities
        </motion.span>
      </motion.div>
    </section>
  );
}
