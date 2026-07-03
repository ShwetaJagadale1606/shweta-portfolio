import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import './TechArsenal.css';

// Each skill is a small planet — hi = sunlit surface, lo = shadow side
const SKILLS = [
  { name: 'Java', src: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg', hi: '#c1553b', lo: '#5e2417' }, // Mars
  { name: 'Spring Boot', src: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/spring/spring-original.svg', hi: '#d3a15f', lo: '#7a4c28' }, // Jupiter
  { name: 'React', src: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg', hi: '#3f6ad8', lo: '#16296b' }, // Neptune
  { name: 'TypeScript', src: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg', hi: '#e3c188', lo: '#96702f' }, // Venus
  { name: 'JavaScript', src: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg', hi: '#9a9aa3', lo: '#45454f' }, // Mercury
  { name: 'Python', src: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg', hi: '#4287c8', lo: '#1c4d33' }, // Earth
  { name: 'Node.js', src: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg', hi: '#d8b877', lo: '#82602c' }, // Saturn
  { name: 'MySQL', src: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg', hi: '#b9b9c2', lo: '#5c5c68' }, // Moon
  { name: 'MongoDB', src: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg', hi: '#c9a186', lo: '#6b4c37' }, // Pluto
  { name: 'Docker', src: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg', hi: '#7fd4d4', lo: '#2f7078' }, // Uranus
  { name: 'AWS', src: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/amazonwebservices/amazonwebservices-plain-wordmark.svg', invert: true, hi: '#e8a33c', lo: '#9c4f12' }, // Sun-kissed
  { name: 'Git', src: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg', hi: '#d18d4f', lo: '#7c3f1a' }, // Titan
];

const ACHIEVEMENTS = [
  'Software Engineer @ TCS',
  'B.Tech in Computer Science',
  'Open-source contributor',
  '4 selected works shipped',
  'Cut API response times 40% as an intern',
];

// Two orbit rings, six satellites each, evenly spaced — precise placement
const RING_OF = SKILLS.map((_, i) => (i < 6 ? 0 : 1));
const BASE_ANGLE = SKILLS.map((_, i) =>
  ((i % 6) / 6) * Math.PI * 2 + (i < 6 ? 0 : Math.PI / 6)
);
const RING_SPEED = [0.00026, -0.00017]; // rad/ms — inner forward, outer reverse

const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

const ARRANGE_MS = 950;
const STAGGER_MS = 45;
const GLOBE_MS = 5200;
const GRID_HOLD_MS = 4200;
const SCATTER_MS = 900;
const TILT = -0.21; // Earth-style axis tilt (~12°)

export default function TechArsenal() {
  const stageRef = useRef(null);
  const cardRefs = useRef([]);
  const phaseRef = useRef('idle'); // idle | globe | arranging | grid
  const [phase, setPhase] = useState('idle');

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    let raf = 0;
    let started = false;
    let theta = 0;
    let last = 0;
    let phaseStart = 0;
    let fromPos = [];
    let toPos = [];
    let targets = [];

    const computeTargets = () => {
      const w = stage.clientWidth;
      const cols = w < 560 ? 3 : 6;
      const rows = Math.ceil(SKILLS.length / cols);
      const slotW = Math.min(w < 560 ? 106 : 168, (w - 20) / cols);
      const slotH = w < 560 ? 96 : 138;
      return SKILLS.map((_, i) => ({
        x: ((i % cols) + 0.5) * slotW - (cols * slotW) / 2,
        y: (Math.floor(i / cols) + 0.5) * slotH - (rows * slotH) / 2,
      }));
    };

    // Ring radii cached — reading clientWidth per card per frame causes layout thrash.
    // The visible ring elements are sized from the SAME numbers, so cards track them exactly.
    const rings = [
      { Rx: 0, Ry: 0 },
      { Rx: 0, Ry: 0 },
    ];
    const ringEls = stage.querySelectorAll('.arsenal__ring');

    // Galaxy canvas
    const canvas = stage.querySelector('.arsenal__canvas');
    const ctx = canvas.getContext('2d');
    let dpr = 1;
    let cw = 0;
    let ch = 0;
    let small = false;
    let starCount = 90;
    const STAR_COLORS = ['234, 232, 242', '139, 163, 255', '239, 138, 178'];
    const stars = Array.from({ length: 90 }, (_, i) => ({
      x: Math.random(),
      y: Math.random(),
      r: 0.5 + Math.random() * 1.1,
      color: STAR_COLORS[i % 3 === 0 ? 1 : i % 5 === 0 ? 2 : 0],
      base: 0.25 + Math.random() * 0.5,
      tw: Math.random() * Math.PI * 2,
      twSpeed: 0.0006 + Math.random() * 0.0012,
      drift: 0.000004 + Math.random() * 0.000008,
    }));

    const measure = () => {
      const w = stage.clientWidth;
      small = w < 640;
      // Portrait phones get rounder, tighter orbits that clear the core and the edges
      rings[0].Rx = small ? w * 0.31 : Math.min(w * 0.27, 420);
      rings[0].Ry = rings[0].Rx * (small ? 0.52 : 0.3);
      rings[1].Rx = small ? w * 0.38 : Math.min(w * 0.41, 640);
      rings[1].Ry = rings[1].Rx * (small ? 0.58 : 0.3);
      ringEls.forEach((el) => {
        const r = el.dataset.ring === '1' ? 1 : 0;
        el.style.width = `${rings[r].Rx * 2}px`;
        el.style.height = `${rings[r].Ry * 2}px`;
      });
      cw = w;
      ch = stage.clientHeight;
      // Mobile perf budget: lower canvas resolution + fewer stars
      dpr = Math.min(window.devicePixelRatio || 1, small ? 1.5 : 2);
      starCount = small ? 42 : 90;
      canvas.width = cw * dpr;
      canvas.height = ch * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    measure();

    const drawSpace = (now) => {
      ctx.clearRect(0, 0, cw, ch);

      // breathing wall lights
      const breath = 0.6 + 0.4 * Math.sin(now * 0.0006);
      const leftGlow = ctx.createLinearGradient(0, 0, cw * 0.3, 0);
      leftGlow.addColorStop(0, `rgba(139, 163, 255, ${0.09 * breath})`);
      leftGlow.addColorStop(1, 'rgba(139, 163, 255, 0)');
      ctx.fillStyle = leftGlow;
      ctx.fillRect(0, 0, cw * 0.3, ch);
      const rightGlow = ctx.createLinearGradient(cw, 0, cw * 0.7, 0);
      rightGlow.addColorStop(0, `rgba(239, 138, 178, ${0.08 * (1.6 - breath)})`);
      rightGlow.addColorStop(1, 'rgba(239, 138, 178, 0)');
      ctx.fillStyle = rightGlow;
      ctx.fillRect(cw * 0.7, 0, cw * 0.3, ch);

      // slow nebula blobs orbiting the centre
      const na = now * 0.00003;
      for (let n = 0; n < 3; n++) {
        const angle = na + (n * Math.PI * 2) / 3;
        const nx = cw / 2 + Math.cos(angle) * cw * 0.18;
        const ny = ch / 2 + Math.sin(angle) * ch * 0.22;
        const nr = Math.min(cw, ch) * 0.45;
        const grad = ctx.createRadialGradient(nx, ny, 0, nx, ny, nr);
        const tint = n === 0 ? '139, 163, 255' : n === 1 ? '239, 138, 178' : '183, 138, 240';
        grad.addColorStop(0, `rgba(${tint}, 0.045)`);
        grad.addColorStop(1, `rgba(${tint}, 0)`);
        ctx.fillStyle = grad;
        ctx.fillRect(nx - nr, ny - nr, nr * 2, nr * 2);
      }

      // drifting, twinkling stars
      for (let i = 0; i < starCount; i++) {
        const s = stars[i];
        const x = ((s.x + now * s.drift) % 1) * cw;
        const y = s.y * ch;
        const alpha = s.base * (0.55 + 0.45 * Math.sin(now * s.twSpeed + s.tw));
        ctx.fillStyle = `rgba(${s.color}, ${alpha})`;
        ctx.beginPath();
        ctx.arc(x, y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const cosT = Math.cos(TILT);
    const sinT = Math.sin(TILT);

    const spherePos = (i, clock) => {
      const ring = RING_OF[i];
      const phi = BASE_ANGLE[i] + RING_SPEED[ring] * clock;
      const ex = rings[ring].Rx * Math.cos(phi);
      const ey = rings[ring].Ry * Math.sin(phi);
      // same tilt as the drawn rings
      const x = ex * cosT - ey * sinT;
      const y = ex * sinT + ey * cosT;
      const z = Math.sin(phi); // bottom of the ellipse = front
      return { x, y, z };
    };

    const apply = (el, x, y, s, o, z) => {
      el.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px) scale(${s})`;
      el.style.opacity = o;
      el.style.zIndex = String(100 + Math.round(z * 60));
    };

    // Phones orbit with smaller, calmer tiles
    const orbitScale = (depth) => (small ? 0.48 + 0.3 * depth : 0.68 + 0.42 * depth);

    const captureSphere = () =>
      SKILLS.map((_, i) => {
        const { x, y, z } = spherePos(i, theta);
        const depth = (z + 1) / 2;
        return { x, y, s: orbitScale(depth), o: 0.5 + 0.5 * depth };
      });

    const setPhaseAll = (p, now) => {
      phaseRef.current = p;
      phaseStart = now;
      setPhase(p);
    };

    const snapToGrid = () => {
      targets = computeTargets();
      cardRefs.current.forEach((el, i) => el && apply(el, targets[i].x, targets[i].y, 1, 1, 1));
      phaseRef.current = 'grid';
      setPhase('grid');
      drawSpace(performance.now()); // static backdrop for reduced motion
    };

    // Endless cycle: globe → arranging → grid (hold) → scattering → globe …
    let frameFlip = false;
    const tick = (now) => {
      if (!last) last = now;
      const dt = Math.min(now - last, 50);
      last = now;
      const p = phaseRef.current;

      // Background paints at half rate on phones — cards stay at full 60fps
      frameFlip = !frameFlip;
      if (!small || frameFlip) drawSpace(now);

      if (p === 'globe') {
        theta += dt; // clock in ms — ring speeds are rad/ms
        cardRefs.current.forEach((el, i) => {
          if (!el) return;
          const { x, y, z } = spherePos(i, theta);
          const depth = (z + 1) / 2;
          apply(el, x, y, orbitScale(depth), 0.5 + 0.5 * depth, z);
        });
        if (now - phaseStart > GLOBE_MS) {
          targets = computeTargets();
          fromPos = captureSphere();
          setPhaseAll('arranging', now);
        }
      } else if (p === 'arranging') {
        cardRefs.current.forEach((el, i) => {
          if (!el) return;
          const t = Math.min(Math.max((now - phaseStart - i * STAGGER_MS) / ARRANGE_MS, 0), 1);
          const e = easeInOutCubic(t);
          const f = fromPos[i];
          const g = targets[i];
          apply(el, f.x + (g.x - f.x) * e, f.y + (g.y - f.y) * e, f.s + (1 - f.s) * e, f.o + (1 - f.o) * e, 1);
        });
        if (now - phaseStart > ARRANGE_MS + SKILLS.length * STAGGER_MS) {
          cardRefs.current.forEach((el, i) => el && apply(el, targets[i].x, targets[i].y, 1, 1, 1));
          setPhaseAll('grid', now);
        }
      } else if (p === 'grid') {
        if (now - phaseStart > GRID_HOLD_MS) {
          fromPos = targets.map((g) => ({ x: g.x, y: g.y, s: 1, o: 1 }));
          toPos = captureSphere();
          setPhaseAll('scattering', now);
        }
      } else if (p === 'scattering') {
        cardRefs.current.forEach((el, i) => {
          if (!el) return;
          const t = Math.min(Math.max((now - phaseStart - i * 30) / SCATTER_MS, 0), 1);
          const e = easeInOutCubic(t);
          const f = fromPos[i];
          const g = toPos[i];
          apply(el, f.x + (g.x - f.x) * e, f.y + (g.y - f.y) * e, f.s + (g.s - f.s) * e, f.o + (g.o - f.o) * e, 1);
        });
        if (now - phaseStart > SCATTER_MS + SKILLS.length * 30) {
          setPhaseAll('globe', now);
        }
      }
      if (running) raf = requestAnimationFrame(tick);
    };

    // Pause the whole engine when the stage is off-screen — zero idle cost
    let running = false;
    let pausedAt = 0;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const startLoop = () => {
      if (running) return;
      running = true;
      if (pausedAt) {
        phaseStart += performance.now() - pausedAt;
        pausedAt = 0;
      }
      last = 0;
      raf = requestAnimationFrame(tick);
    };

    const stopLoop = () => {
      if (!running) return;
      running = false;
      pausedAt = performance.now();
      cancelAnimationFrame(raf);
    };

    const start = () => {
      theta = 0;
      phaseRef.current = 'globe';
      phaseStart = performance.now();
      setPhase('globe');
      startLoop();
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!started) {
            started = true;
            if (reduced) snapToGrid();
            else start();
          } else if (!reduced) {
            startLoop();
          }
        } else {
          stopLoop();
        }
      },
      { threshold: 0.05, rootMargin: '80px 0px' }
    );
    io.observe(stage);

    const onResize = () => {
      measure();
      if (phaseRef.current === 'grid') snapToGrid();
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <section className="arsenal" id="arsenal">
      {/* Achievements marquee — single row */}
      <div className="arsenal__marquee" aria-label="Achievements">
        <div className="arsenal__marquee-track">
          {[0, 1].map((copy) => (
            <div key={copy} className="arsenal__marquee-group" aria-hidden={copy === 1}>
              {ACHIEVEMENTS.map((achievement, i) => (
                <span
                  key={achievement}
                  className={`arsenal__marquee-item ${i % 2 ? 'arsenal__marquee-item--italic' : ''}`}
                >
                  {achievement}
                  <span className="arsenal__marquee-star">{i % 2 ? '✧' : '✦'}</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="container">
        <motion.div
          className="section-head"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
        >
          <h2>
            Tech <span className="serif-i arsenal__head-accent">arsenal</span>
          </h2>
          <span className="meta">(02)</span>
        </motion.div>

      </div>

      {/* Globe → grid stage — full-bleed */}
      <div className="arsenal__stage-wrap">
        <div ref={stageRef} className={`arsenal__stage is-${phase}`}>
          {/* Galaxy atmosphere — single canvas, no layer artifacts */}
          <canvas className="arsenal__canvas" aria-hidden="true" />

          {/* Planet core + orbit rings — back arcs behind the core, front arcs above it */}
          <div className="arsenal__planet" aria-hidden="true">
            <span className="arsenal__ring arsenal__ring--r1 arsenal__ring--back" data-ring="0" />
            <span className="arsenal__ring arsenal__ring--r2 arsenal__ring--back" data-ring="1" />
            <span className="arsenal__planet-core" />
            <span className="arsenal__ring arsenal__ring--r1 arsenal__ring--front" data-ring="0" />
            <span className="arsenal__ring arsenal__ring--r2 arsenal__ring--front" data-ring="1" />
          </div>
          {SKILLS.map((skill, i) => (
            <div
              key={skill.name}
              ref={(el) => (cardRefs.current[i] = el)}
              className="arsenal-card"
            >
              <span
                className="arsenal-card__tile"
                style={{ '--p-hi': skill.hi, '--p-lo': skill.lo }}
              >
                <img
                  src={skill.src}
                  alt={skill.name}
                  loading="lazy"
                  style={skill.invert ? { filter: 'invert(0.9)' } : undefined}
                />
              </span>
              <span className="arsenal-card__name">{skill.name}</span>
            </div>
          ))}

        </div>
      </div>
    </section>
  );
}
