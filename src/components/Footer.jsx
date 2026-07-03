import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowUp } from 'lucide-react';
import Magnetic from './Magnetic';
import './Footer.css';

const socials = [
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/shweta-jagadale-160602sj/' },
  { label: 'GitHub', href: 'https://github.com/ShwetaJagadale1606' },
  { label: 'Email', href: 'mailto:hello@shweta.dev' },
];

const lineReveal = {
  hidden: { y: '112%' },
  visible: (i) => ({
    y: '0%',
    transition: { duration: 1, ease: [0.19, 1, 0.22, 1], delay: i * 0.1 },
  }),
};

function useLocalTime() {
  const [time, setTime] = useState('');
  useEffect(() => {
    const tick = () =>
      setTime(
        new Intl.DateTimeFormat('en-GB', {
          hour: '2-digit',
          minute: '2-digit',
          timeZone: 'Asia/Kolkata',
        }).format(new Date())
      );
    tick();
    const id = setInterval(tick, 10_000);
    return () => clearInterval(id);
  }, []);
  return time;
}

export default function Footer({ onNavigate }) {
  const time = useLocalTime();

  return (
    <footer className="footer" id="contact">
      <div className="container footer__inner">
        <motion.span
          className="meta meta--accent"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          (05) — Have an idea?
        </motion.span>

        <motion.h2
          className="footer__title"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          <span className="reveal-line">
            <motion.span variants={lineReveal} custom={0}>
              Let&rsquo;s make something
            </motion.span>
          </span>
          <span className="reveal-line">
            <motion.span variants={lineReveal} custom={1}>
              <em className="footer__title-accent">lovely</em> together
              <span className="footer__title-dot">.</span>
            </motion.span>
          </span>
        </motion.h2>

        <motion.div
          className="footer__cta"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.35, ease: [0.19, 1, 0.22, 1] }}
        >
          <Magnetic strength={0.3}>
            <a className="footer__email" href="mailto:hello@shweta.dev">
              hello@shweta.dev
              <ArrowUpRight size={20} strokeWidth={1.5} />
            </a>
          </Magnetic>
        </motion.div>

        <div className="footer__grid">
          <div className="footer__col">
            <span className="meta">Socials</span>
            <ul>
              {socials.map((social) => (
                <li key={social.label}>
                  <a
                    className="footer__link"
                    href={social.href}
                    target={social.href.startsWith('http') ? '_blank' : undefined}
                    rel="noopener noreferrer"
                  >
                    {social.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer__col">
            <span className="meta">Local time</span>
            <p className="footer__time">
              {time} <span className="footer__time-zone">IST — Pune, IN</span>
            </p>
          </div>

          <div className="footer__col footer__col--top">
            <Magnetic strength={0.4}>
              <button
                className="footer__top-btn"
                onClick={() => onNavigate(0)}
                aria-label="Back to top"
              >
                <ArrowUp size={18} strokeWidth={1.5} />
              </button>
            </Magnetic>
          </div>
        </div>

        <div className="footer__bottom">
          <span className="meta">©2026 Shweta Jagadale</span>
          <span className="meta">made with ♡ in Pune</span>
        </div>
      </div>
    </footer>
  );
}
