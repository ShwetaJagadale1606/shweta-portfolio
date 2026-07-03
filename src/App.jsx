import { useEffect, useRef, useState } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion, useScroll, useSpring } from 'framer-motion';
import Lenis from 'lenis';
import Preloader from './components/Preloader';
import Cursor from './components/Cursor';
import Nav from './components/Nav';
import Hero from './components/Hero';
import Work from './components/Work';
import TechArsenal from './components/TechArsenal';
import Experience from './components/Experience';
import Persona from './components/Persona';
import Footer from './components/Footer';
import ProjectPage from './components/ProjectPage';

function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 26, mass: 0.4 });
  return <motion.div className="scroll-progress" style={{ scaleX }} />;
}

const pageMotion = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.19, 1, 0.22, 1] } },
  exit: { opacity: 0, y: -16, transition: { duration: 0.3, ease: [0.76, 0, 0.24, 1] } },
};

function Home({ started, onNavigate }) {
  return (
    <motion.div {...pageMotion}>
      <main>
        <Hero started={started} onNavigate={onNavigate} />
        <Work />
        <TechArsenal />
        <Experience onNavigate={onNavigate} />
        <Persona onNavigate={onNavigate} />
      </main>
      <Footer onNavigate={onNavigate} />
    </motion.div>
  );
}

export default function App() {
  const [loading, setLoading] = useState(true);
  const lenisRef = useRef(null);
  const pendingTarget = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.115,
      smoothWheel: true,
      wheelMultiplier: 1,
    });
    lenisRef.current = lenis;
    if (import.meta.env.DEV) window.__lenis = lenis;
    lenis.stop();

    let rafId;
    const raf = (time) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  useEffect(() => {
    if (!loading) {
      window.scrollTo(0, 0);
      lenisRef.current?.start();
    }
  }, [loading]);

  // On every route change: jump to top, then honour any pending section target
  useEffect(() => {
    lenisRef.current?.scrollTo(0, { immediate: true });
    if (location.pathname === '/' && pendingTarget.current) {
      const target = pendingTarget.current;
      pendingTarget.current = null;
      // Wait for the home page to mount and lay out
      setTimeout(() => lenisRef.current?.scrollTo(target, { offset: 0 }), 450);
    }
  }, [location.pathname]);

  const scrollTo = (target) => {
    if (location.pathname !== '/') {
      pendingTarget.current = target;
      navigate('/');
      return;
    }
    lenisRef.current?.scrollTo(target, { offset: 0 });
  };

  return (
    <>
      <ScrollProgress />
      <Cursor />
      <AnimatePresence mode="wait">
        {loading && <Preloader onComplete={() => setLoading(false)} />}
      </AnimatePresence>
      <Nav onNavigate={scrollTo} started={!loading} />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Home started={!loading} onNavigate={scrollTo} />} />
          <Route path="/work/:slug" element={<ProjectPage pageMotion={pageMotion} />} />
        </Routes>
      </AnimatePresence>
    </>
  );
}
