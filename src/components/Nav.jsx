import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Magnetic from './Magnetic';
import './Nav.css';

const links = [
  { label: 'Work', target: '#work' },
  { label: 'Skills', target: '#arsenal' },
  { label: 'Contact', target: '#contact' },
];

export default function Nav({ onNavigate, started }) {
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    let last = 0;
    const onScroll = () => {
      const cur = window.scrollY;
      setHidden(cur > last && cur > 140);
      last = cur;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Lock page scroll while the menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const go = (target) => {
    setMenuOpen(false);
    onNavigate(target);
  };

  return (
    <>
      <motion.header
        className="nav"
        initial={{ y: '-120%' }}
        animate={{ y: started && (!hidden || menuOpen) ? '0%' : '-120%' }}
        transition={{ duration: 0.6, ease: [0.19, 1, 0.22, 1] }}
      >
        <button className="nav__brand" onClick={() => go(0)} aria-label="Back to top">
          shweta jagadale<span className="nav__brand-mark">✿</span>
        </button>

        <nav className="nav__links" aria-label="Primary">
          {links.map((link) => (
            <Magnetic key={link.label} strength={0.25}>
              <button className="nav__link" onClick={() => go(link.target)}>
                <span className="nav__link-dot" />
                {link.label}
              </button>
            </Magnetic>
          ))}
        </nav>

        {/* Mobile hamburger */}
        <button
          className={`nav__burger ${menuOpen ? 'is-open' : ''}`}
          onClick={() => setMenuOpen((o) => !o)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
        >
          <span />
          <span />
        </button>
      </motion.header>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="nav-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.25 } }}
            transition={{ duration: 0.35 }}
          >
            <nav className="nav-menu__links" aria-label="Mobile">
              {links.map((link, i) => (
                <motion.button
                  key={link.label}
                  className="nav-menu__link"
                  onClick={() => go(link.target)}
                  initial={{ y: 44, opacity: 0 }}
                  animate={{
                    y: 0,
                    opacity: 1,
                    transition: { delay: 0.12 + i * 0.08, duration: 0.6, ease: [0.19, 1, 0.22, 1] },
                  }}
                  exit={{ opacity: 0 }}
                >
                  <span className="meta nav-menu__num">(0{i + 1})</span>
                  {link.label}
                </motion.button>
              ))}
            </nav>

            <motion.div
              className="nav-menu__foot"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: 0.4 } }}
            >
              <a href="mailto:hello@shweta.dev">hello@shweta.dev</a>
              <span className="meta">Pune, India ✿</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
