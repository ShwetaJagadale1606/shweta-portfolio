import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import './Preloader.css';

const greetings = ['नमस्ते', 'Hello', 'Bonjour', 'こんにちは', 'Hola', 'Ciao', 'नमस्कार'];

const lipEase = [0.76, 0, 0.24, 1];

export default function Preloader({ onComplete }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index === greetings.length - 1) {
      const done = setTimeout(onComplete, 650);
      return () => clearTimeout(done);
    }
    const t = setTimeout(() => setIndex(index + 1), index === 0 ? 850 : 220);
    return () => clearTimeout(t);
  }, [index, onComplete]);

  return (
    <motion.div
      className="preloader"
      initial={{ y: 0 }}
      exit={{ y: '-100vh', transition: { duration: 0.8, ease: lipEase, delay: 0.1 } }}
    >
      {/* Curved lip below the curtain — flattens as it lifts */}
      <svg
        className="preloader__lip"
        viewBox="0 0 1000 300"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <motion.path
          initial={{ d: 'M0 0 L1000 0 Q500 300 0 0 Z' }}
          exit={{ d: 'M0 0 L1000 0 Q500 0 0 0 Z', transition: { duration: 0.8, ease: lipEase } }}
        />
      </svg>

      <motion.p
        className="preloader__word"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { duration: 0.5 } }}
        exit={{ opacity: 0, transition: { duration: 0.25 } }}
      >
        <span className="preloader__dot" />
        {greetings[index]}
      </motion.p>

      <p className="preloader__brand meta">Shweta Jagadale — Portfolio ©2026</p>
    </motion.div>
  );
}
