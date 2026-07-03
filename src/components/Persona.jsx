import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, animate, useMotionValue } from 'framer-motion';
import { Mail, Send } from 'lucide-react';
import Lofi from './lofi';
import './Persona.css';

// Brand icons (removed from lucide) as inline SVGs
const LinkedinIcon = ({ size = 17 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true">
    <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45z" />
  </svg>
);

const GithubIcon = ({ size = 17 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true">
    <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.55v-2.17c-3.2.7-3.87-1.37-3.87-1.37-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.75 2.69 1.25 3.34.95.1-.74.4-1.25.72-1.53-2.55-.29-5.23-1.28-5.23-5.68 0-1.25.45-2.28 1.18-3.08-.12-.29-.51-1.46.11-3.05 0 0 .96-.31 3.15 1.18a10.9 10.9 0 0 1 5.74 0c2.18-1.49 3.14-1.18 3.14-1.18.62 1.59.23 2.76.11 3.05.73.8 1.18 1.83 1.18 3.08 0 4.41-2.69 5.38-5.25 5.66.41.35.77 1.04.77 2.1v3.11c0 .3.21.66.8.55A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z" />
  </svg>
);

const photos = ['/images/p-1-web.jpg', '/images/p-2.jpg', '/images/p-3.jpg'];

const joys = [
  { emoji: '☕', name: 'chai' },
  { emoji: '📷', name: 'camera' },
  { emoji: '🎧', name: 'headphones' },
  { emoji: '🌷', name: 'flowers' },
  { emoji: '📓', name: 'journal' },
  { emoji: '🍜', name: 'street food' },
];

const loves = [
  'café hunting',
  'photography',
  'sunset walks',
  'lofi playlists',
  'doodling',
  'journaling',
];

const socials = [
  { label: 'LinkedIn', icon: LinkedinIcon, href: 'https://www.linkedin.com/in/shweta-jagadale-160602sj/' },
  { label: 'GitHub', icon: GithubIcon, href: 'https://github.com/ShwetaJagadale1606' },
  { label: 'Email', icon: Mail, href: 'mailto:hello@shweta.dev' },
];

const cellReveal = {
  hidden: { y: 30, opacity: 0, scale: 0.98 },
  visible: (i) => ({
    y: 0,
    opacity: 1,
    scale: 1,
    transition: { duration: 0.75, ease: [0.19, 1, 0.22, 1], delay: i * 0.06 },
  }),
};

// A love chip: draggable within the card, falls like a thrown ball on drop
function LoveChip({ label, blue, tilt, containerRef, chipRef, drop }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useMotionValue(tilt);

  useEffect(() => {
    if (!drop) return;
    animate(x, drop.x, { delay: drop.delay, duration: 0.65, ease: 'easeOut' });
    animate(y, [0, drop.y, drop.y - 16, drop.y, drop.y - 5, drop.y], {
      delay: drop.delay,
      duration: 1.05,
      times: [0, 0.4, 0.6, 0.76, 0.88, 1],
      ease: ['easeIn', 'easeOut', 'easeIn', 'easeOut', 'easeIn'],
    });
    animate(rotate, drop.rot, { delay: drop.delay, duration: 1.05, ease: 'easeOut' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drop]);

  return (
    <motion.span
      ref={chipRef}
      className={`persona-love ${blue ? 'persona-love--blue' : ''}`}
      style={{ x, y, rotate }}
      drag
      dragConstraints={containerRef}
      dragElastic={0.12}
      dragMomentum
      whileDrag={{ scale: 1.12, zIndex: 10 }}
      whileHover={{ scale: 1.05 }}
    >
      {label}
    </motion.span>
  );
}

function Cell({ i, className, children, ...rest }) {
  return (
    <motion.div
      className={`persona-cell ${className}`}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
      variants={cellReveal}
      custom={i}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

// TODO: paste the Google Sheets / Apps Script web-app URL here to store messages
const COLLAB_ENDPOINT = '';

const CHIP_TILTS = [-6, 4, -3, 7, -5, 3];
// Settled pile flush with the card's bottom border: 3 on the floor, 2 on top, 1 crowning
const CHIP_PILE = [
  { l: 0.02, b: 2, r: -8 },
  { l: 0.35, b: 2, r: 5 },
  { l: 0.67, b: 2, r: -3 },
  { l: 0.17, b: 28, r: 10 },
  { l: 0.49, b: 28, r: -7 },
  { l: 0.33, b: 53, r: 4 },
];

export default function Persona() {
  const [photo, setPhoto] = useState(0);
  const [playing, setPlaying] = useState(false);
  const lofiRef = useRef(null);
  const lovesRef = useRef(null);
  const loveCardRef = useRef(null);
  const chipRefs = useRef([]);
  const [drops, setDrops] = useState(null);

  useEffect(() => {
    loveCardRef.current = lovesRef.current?.closest('.persona-cell') ?? null;
  }, []);
  const [form, setForm] = useState({ name: '', msg: '' });
  const [sendState, setSendState] = useState('idle');

  const submitCollab = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.msg.trim() || sendState === 'sending') return;
    setSendState('sending');
    try {
      if (COLLAB_ENDPOINT) {
        await fetch(COLLAB_ENDPOINT, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: form.name, message: form.msg, at: new Date().toISOString() }),
        });
      } else {
        await new Promise((r) => setTimeout(r, 900));
      }
      setSendState('sent');
    } catch {
      setSendState('idle');
    }
  };

  // One-way gravity drop — chips stay piled until the page reloads
  const dropLoves = () => {
    if (drops) return;
    const card = loveCardRef.current?.getBoundingClientRect();
    if (!card) return;
    setDrops(
      chipRefs.current.map((el, i) => {
        const rect = el.getBoundingClientRect();
        const target = CHIP_PILE[i % CHIP_PILE.length];
        return {
          x: card.left + card.width * target.l - rect.left,
          y: card.bottom - target.b - rect.height - rect.top,
          rot: target.r,
          delay: i * 0.08,
        };
      })
    );
  };

  useEffect(() => {
    const id = setInterval(() => setPhoto((p) => (p + 1) % photos.length), 3200);
    return () => clearInterval(id);
  }, []);

  useEffect(() => () => lofiRef.current?.stop(), []);

  const toggleMusic = () => {
    lofiRef.current ||= new Lofi();
    setPlaying(lofiRef.current.toggle());
  };

  return (
    <section className="persona container" id="persona">
      <motion.div
        className="section-head"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
      >
        <h2>
          Life, <span className="serif-i persona__head-accent">beyond the code</span>
        </h2>
        <span className="meta">(04)</span>
      </motion.div>

      <div className="persona__grid">
        {/* Profile — tall */}
        <Cell i={0} className="persona-cell--profile">
          <div className="persona-profile__photo" data-cursor-label="hey! ✿">
            <AnimatePresence mode="popLayout">
              <motion.img
                key={photos[photo]}
                src={photos[photo]}
                alt="Shweta"
                initial={{ opacity: 0, scale: 1.06 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.7, ease: [0.19, 1, 0.22, 1] }}
              />
            </AnimatePresence>
            <span className="persona-profile__wave hand">that&rsquo;s me ✿</span>
          </div>
          <div className="persona-profile__text">
            <span className="persona-cell__label">The human behind the work</span>
            <h3>
              Hey, I&rsquo;m <em className="serif-i">Shweta</em>
            </h3>
            <p>Pune girl — collector of sunsets, playlists and half-finished sketchbooks.</p>
          </div>
        </Cell>

        {/* Music — playable generative lofi */}
        <Cell i={1} className="persona-cell--music">
          <span className="persona-cell__label">On repeat</span>
          <div className="persona-music">
            <button
              className={`persona-music__vinyl ${playing ? '' : 'is-paused'}`}
              onClick={toggleMusic}
              aria-label={playing ? 'Pause music' : 'Play music'}
            >
              <span className="persona-music__label">{playing ? '❚❚' : '▶'}</span>
            </button>
            <div>
              <p className="persona-music__title">Lofi beats to code to</p>
              <p className="persona-music__sub">
                {playing ? 'now playing — generative lofi ✿' : 'tap the record to play'}
              </p>
            </div>
          </div>
          <div className={`persona-music__eq ${playing ? '' : 'is-paused'}`} aria-hidden="true">
            {Array.from({ length: 14 }).map((_, i) => (
              <span key={i} style={{ animationDelay: `${i * 0.09}s` }} />
            ))}
          </div>
        </Cell>

        {/* Little joys */}
        <Cell i={2} className="persona-cell--tools">
          <span className="persona-cell__label">Little joys</span>
          <div className="persona-tools">
            {joys.map((joy, i) => (
              <span
                key={joy.name}
                className="persona-tool"
                style={{ '--tilt': `${[-8, 6, -5, 8, -7, 5][i]}deg` }}
                title={joy.name}
              >
                <span className="persona-tool__emoji">{joy.emoji}</span>
              </span>
            ))}
          </div>
        </Cell>

        {/* Things I love — click once and gravity takes them */}
        <Cell
          i={3}
          className={`persona-cell--loves ${drops ? 'is-dropped' : ''}`}
          onClick={dropLoves}
          data-cursor={drops ? undefined : 'hover'}
        >
          <span className="persona-cell__label">
            Things I love <span className="persona-cell__hint hand">— tap ✿</span>
          </span>
          <div ref={lovesRef} className="persona-loves">
            {loves.map((love, i) => (
              <LoveChip
                key={love}
                label={love}
                blue={i % 2 === 1}
                tilt={CHIP_TILTS[i]}
                containerRef={loveCardRef}
                chipRef={(el) => (chipRefs.current[i] = el)}
                drop={drops ? drops[i] : null}
              />
            ))}
          </div>
        </Cell>

        {/* Socials */}
        <Cell i={4} className="persona-cell--socials">
          <span className="persona-cell__label">Find me</span>
          <div className="persona-socials">
            {socials.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target={social.href.startsWith('http') ? '_blank' : undefined}
                rel="noopener noreferrer"
                aria-label={social.label}
                className="persona-social"
              >
                <social.icon size={17} strokeWidth={1.6} />
              </a>
            ))}
          </div>
        </Cell>

        {/* Now */}
        <Cell i={5} className="persona-cell--stat">
          <p className="persona-stat__num serif-i">now ✿</p>
          <span className="persona-cell__label">learning, building, wandering</span>
        </Cell>



        {/* Collab — mini contact form */}
        <Cell i={6} className="persona-cell--collab">
          <div className="persona-collab__text">
            <span className="persona-cell__label">Say hi!</span>
            <h3 className="persona-collab__title">
              Let&rsquo;s <em className="serif-i">connect</em>.
            </h3>
            <p className="persona-collab__sub">a little note is all it takes ✿</p>
          </div>

          <AnimatePresence mode="wait">
            {sendState === 'sent' ? (
              <motion.div
                key="sent"
                className="persona-collab__sent"
                initial={{ opacity: 0, scale: 0.92, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 18 }}
              >
                <span className="hand">sent! she&rsquo;ll get back to you soon ✿</span>
                <button
                  type="button"
                  className="persona-collab__again"
                  onClick={() => {
                    setForm({ name: '', msg: '' });
                    setSendState('idle');
                  }}
                >
                  send another
                </button>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                className="persona-collab__form"
                onSubmit={submitCollab}
                exit={{ opacity: 0, y: -8, transition: { duration: 0.25 } }}
              >
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="your name"
                  aria-label="Your name"
                  className="persona-collab__field persona-collab__field--name"
                />
                <input
                  value={form.msg}
                  onChange={(e) => setForm({ ...form, msg: e.target.value })}
                  placeholder="your message ✿"
                  aria-label="Your message"
                  className="persona-collab__field persona-collab__field--msg"
                />
                <button
                  type="submit"
                  className="persona-collab__send"
                  aria-label="Send message"
                  disabled={sendState === 'sending'}
                >
                  {sendState === 'sending' ? (
                    <span className="persona-collab__spinner" aria-hidden="true" />
                  ) : (
                    <Send size={14} strokeWidth={1.7} />
                  )}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </Cell>
      </div>
    </section>
  );
}
