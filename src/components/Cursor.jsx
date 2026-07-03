import { useEffect, useState } from 'react';
import {
  motion,
  useMotionValue,
  useSpring,
  useVelocity,
  useTransform,
} from 'framer-motion';
import './Cursor.css';

export default function Cursor() {
  const [mode, setMode] = useState('default'); // default | hover | view | label | hidden
  const [label, setLabel] = useState('');
  const [pressed, setPressed] = useState(false);
  const [enabled, setEnabled] = useState(false);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);

  // Dot tracks tightly; ring lags behind for an elastic feel
  const dotX = useSpring(x, { stiffness: 1200, damping: 60, mass: 0.3 });
  const dotY = useSpring(y, { stiffness: 1200, damping: 60, mass: 0.3 });
  const ringX = useSpring(x, { stiffness: 320, damping: 28, mass: 0.7 });
  const ringY = useSpring(y, { stiffness: 320, damping: 28, mass: 0.7 });

  // Velocity-based squash & stretch on the ring
  const vx = useVelocity(ringX);
  const vy = useVelocity(ringY);
  const speed = useTransform([vx, vy], ([a, b]) => Math.min(Math.hypot(a, b) / 3500, 0.32));
  const angle = useTransform([vx, vy], ([a, b]) => (Math.atan2(b, a) * 180) / Math.PI);
  const scaleX = useTransform(speed, (s) => 1 + s);
  const scaleY = useTransform(speed, (s) => 1 - s * 0.6);
  const counterAngle = useTransform(angle, (a) => -a);

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    setEnabled(true);
    document.body.classList.add('has-cursor');

    const move = (e) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };

    const over = (e) => {
      const view = e.target.closest('[data-cursor="view"]');
      if (view) return setMode('view');
      const labelled = e.target.closest('[data-cursor-label]');
      if (labelled) {
        setLabel(labelled.getAttribute('data-cursor-label'));
        return setMode('label');
      }
      const interactive = e.target.closest('a, button, [data-cursor="hover"]');
      setMode(interactive ? 'hover' : 'default');
    };

    const down = () => setPressed(true);
    const up = () => setPressed(false);
    const leave = () => setMode('hidden');
    const enter = () => setMode('default');

    window.addEventListener('mousemove', move, { passive: true });
    window.addEventListener('mouseover', over, { passive: true });
    window.addEventListener('mousedown', down);
    window.addEventListener('mouseup', up);
    document.documentElement.addEventListener('mouseleave', leave);
    document.documentElement.addEventListener('mouseenter', enter);

    return () => {
      document.body.classList.remove('has-cursor');
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseover', over);
      window.removeEventListener('mousedown', down);
      window.removeEventListener('mouseup', up);
      document.documentElement.removeEventListener('mouseleave', leave);
      document.documentElement.removeEventListener('mouseenter', enter);
    };
  }, [x, y]);

  if (!enabled) return null;

  const hidden = mode === 'hidden';
  const press = pressed ? 0.85 : 1;

  return (
    <>
      {/* Lagging ring — morphs per interaction */}
      <motion.div
        className={`cursor-ring cursor-ring--${mode}`}
        style={{ x: ringX, y: ringY, rotate: angle, scaleX, scaleY }}
        animate={{ scale: hidden ? 0 : press }}
        transition={{ type: 'spring', stiffness: 400, damping: 26 }}
      >
        {/* Counter-rotate content so labels stay upright */}
        <motion.span className="cursor-ring__content" style={{ rotate: counterAngle }}>
          <span className="cursor-ring__view">
            View <span className="cursor-ring__view-arrow">↗</span>
          </span>
          <span className="cursor-ring__label hand">{label}</span>
        </motion.span>
      </motion.div>

      {/* Tight dot */}
      <motion.div
        className={`cursor-dot cursor-dot--${mode}`}
        style={{ x: dotX, y: dotY }}
        animate={{ scale: hidden ? 0 : press }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </>
  );
}
