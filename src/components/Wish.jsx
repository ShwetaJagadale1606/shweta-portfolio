import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Mic, Volume2, VolumeX, Sparkles } from 'lucide-react';
import './Wish.css';

/* ---------- Tiny frontend brain — answers about Shweta ---------- */

const KB = [
  {
    keys: ['skill', 'stack', 'tech', 'technolog', 'tools', 'language'],
    reply:
      'Her core stack is Java & Spring Boot on the backend, React on the frontend — with TypeScript, MySQL, MongoDB, Docker and AWS in the toolbelt ✿',
  },
  {
    keys: ['experience', 'job', 'career', 'tcs', 'company', 'organisation', 'organization'],
    reply:
      'Shweta is a Software Engineer at Tata Consultancy Services (2024 — now), building enterprise apps with Java, Spring Boot & microservices. Before that: a dev internship at a Pune startup and open-source contributions.',
  },
  {
    keys: ['enterprise portal'],
    reply:
      'Enterprise Portal (No. 001) — a legacy monolith carved into Spring Boot microservices with a React frontend, shipped on AWS with full CI/CD. Check the Selected works section for the full story!',
  },
  {
    keys: ['inventory'],
    reply:
      'Inventory Manager (No. 002) — real-time stock tracking with a focus on correctness: optimistic locking, careful transactions and tuned queries.',
  },
  {
    keys: ['analytics', 'dashboard'],
    reply:
      'Analytics Dashboard (No. 003) — a live data dashboard that updates smoothly without flicker or noise.',
  },
  {
    keys: ['microservices platform', 'platform', 'gateway'],
    reply:
      'Microservices Platform (No. 004) — service discovery, an API gateway and centralised logging: one query traces a request across every service.',
  },
  {
    keys: ['project', 'work', 'portfolio', 'built', 'build'],
    reply:
      'Four selected works: Enterprise Portal, Inventory Manager, Analytics Dashboard & Microservices Platform. Ask me about any of them — or scroll to Selected works ✿',
  },
  {
    keys: ['contact', 'email', 'hire', 'reach', 'connect', 'available', 'open to'],
    reply:
      'She’s open to opportunities! Say hi at hello@shweta.dev, or find her on LinkedIn & GitHub — links are in the footer ✿',
  },
  {
    keys: ['hobby', 'hobbies', 'fun', 'love', 'free time', 'coffee', 'chai', 'cafe', 'café', 'photo'],
    reply:
      'Off the clock: café hunting, photography walks, curating lofi playlists and doodling ideas — fueled by an infinite supply of chai ✿',
  },
  {
    keys: ['music', 'song', 'lofi', 'playlist', 'listen'],
    reply:
      'Lofi beats to code to — always on repeat. There’s even a playable record in the “Life, beyond the code” section. Give it a spin!',
  },
  {
    keys: ['where', 'location', 'based', 'pune', 'city', 'live'],
    reply:
      'Pune, India — 18.52°N. The bento grid has a little photo strip of her favourite corners of the city ✿',
  },
  {
    keys: ['education', 'college', 'degree', 'btech', 'b.tech', 'study', 'university'],
    reply:
      'B.Tech in Computer Science (2020 — 2024) from Government Engineering College — strong roots in data structures, databases and operating systems.',
  },
  {
    keys: ['hi', 'hello', 'hey', 'namaste', 'hola', 'yo'],
    reply: 'Hello hello ✿ I’m Wish — Shweta’s tiny assistant. Ask me about her skills, experience, projects, or how to reach her!',
  },
  {
    keys: ['who are you', 'your name', 'wish', 'what are you', 'bot'],
    reply:
      'I’m Wish ✿ — a little front-end bot living in this corner of the site. No servers, no APIs — just me and everything I know about Shweta.',
  },
  {
    keys: ['who', 'about', 'shweta', 'she', 'her'],
    reply:
      'Shweta Jagadale — a software engineer at TCS in Pune, working with Java, Spring Boot and React. Off the clock: cafés, cameras and lofi ✿',
  },
];

const FALLBACK =
  'Hmm, that one’s beyond my tiny brain ✿ Try asking about her skills, experience, projects, hobbies — or how to contact her!';

const SUGGESTIONS = ['skills', 'experience', 'projects', 'hobbies', 'contact'];

function answer(text) {
  const q = text.toLowerCase();
  for (const item of KB) {
    if (item.keys.some((k) => q.includes(k))) return item.reply;
  }
  return FALLBACK;
}

/* ---------- Voice helpers ---------- */

const speak = (text) => {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const clean = text.replace(/[✿✦✧♡—]/g, ',');
  const utterance = new SpeechSynthesisUtterance(clean);
  utterance.rate = 1.02;
  utterance.pitch = 1.08;
  const voices = window.speechSynthesis.getVoices();
  const preferred =
    voices.find((v) => /female|samantha|zira|veena|kanya/i.test(v.name)) ||
    voices.find((v) => v.lang.startsWith('en'));
  if (preferred) utterance.voice = preferred;
  window.speechSynthesis.speak(utterance);
};

const Recognition =
  typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);


/* ---------- Component ---------- */

export default function Wish() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Hi, I’m Wish ✿ — ask me anything about Shweta!' },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [voiceOn, setVoiceOn] = useState(false);
  const [listening, setListening] = useState(false);
  const bodyRef = useRef(null);
  const recRef = useRef(null);
  const voiceOnRef = useRef(voiceOn);
  voiceOnRef.current = voiceOn;

  // Annotation note under the launcher
  const [noteStart, setNoteStart] = useState(false);
  const [pixels, setPixels] = useState(4000);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      const total = Math.max(0, document.body.scrollHeight - window.innerHeight);
      setPixels(Math.max(100, Math.round(total / 100) * 100));
      setNoteStart(true);
    }, 1700);
    const onScroll = () => setScrolled(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      clearTimeout(t);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  const noteWords1 = `don’t want to scroll ${pixels.toLocaleString()} pixels?`.split(' ');
  const noteWords2 = ['make', 'a', 'wish', 'here'];
  // line two waves in only after line one has settled
  const line2Delay = 0.2 + noteWords1.length * 0.13 + 0.5;

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, typing, open]);

  useEffect(() => () => window.speechSynthesis?.cancel(), []);

  const send = (raw) => {
    const text = raw.trim();
    if (!text) return;
    setMessages((m) => [...m, { from: 'user', text }]);
    setInput('');
    setTyping(true);
    setTimeout(() => {
      const reply = answer(text);
      setMessages((m) => [...m, { from: 'bot', text: reply }]);
      setTyping(false);
      if (voiceOnRef.current) speak(reply);
    }, 750 + Math.random() * 500);
  };

  const toggleMic = () => {
    if (!Recognition) return;
    if (listening) {
      recRef.current?.stop();
      setListening(false);
      return;
    }
    const rec = new Recognition();
    recRef.current = rec;
    rec.lang = 'en-IN';
    rec.interimResults = false;
    rec.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setListening(false);
      send(transcript);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    setListening(true);
    rec.start();
  };

  return (
    <>
      {/* Launcher */}
      <motion.button
        className={`wish-fab ${open ? 'wish-fab--open' : ''}`}
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? 'Close chat' : 'Chat with Wish'}
        initial={{ scale: 0, rotate: -40 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 1.2 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
      >
        <span className="wish-fab__waves" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
        <span className="wish-fab__ring" aria-hidden="true" />
        {open ? <X size={19} strokeWidth={1.8} /> : <Sparkles size={19} strokeWidth={1.8} />}
      </motion.button>

      {/* Annotation note with arrow up to the launcher */}
      <AnimatePresence>
        {!open && (
          <motion.button
            className={`wish-note ${scrolled ? 'wish-note--hidden' : ''}`}
            onClick={() => setOpen(true)}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0, transition: { delay: 1.5, duration: 0.6 } }}
            exit={{ opacity: 0, y: -6, transition: { duration: 0.25 } }}
            aria-label="Open chat with Wish"
          >
            <svg className="wish-note__arrow" viewBox="0 0 44 66" aria-hidden="true">
              <motion.path
                d="M10 64 C 38 60, 44 42, 34 30 C 27 21, 22 15, 21 7"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1, transition: { delay: 1.6, duration: 1.2, ease: 'easeInOut' } }}
              />
              <motion.path
                d="M14 15 L21 4 L28 14"
                fill="none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { delay: 2.6, duration: 0.4 } }}
              />
            </svg>
            {noteStart && (
              <>
                <span className="wish-note__line hand">
                  {noteWords1.map((word, i) => (
                    <motion.span
                      key={i}
                      className="wish-note__word"
                      initial={{ opacity: 0, y: 10, rotate: 5 }}
                      animate={{
                        opacity: 1,
                        y: 0,
                        rotate: 0,
                        transition: {
                          delay: 0.2 + i * 0.13,
                          duration: 0.75,
                          ease: [0.19, 1, 0.22, 1],
                        },
                      }}
                    >
                      {word}
                    </motion.span>
                  ))}
                </span>
                <span className="wish-note__line wish-note__line--accent hand">
                  {noteWords2.map((word, i) => (
                    <motion.span
                      key={i}
                      className="wish-note__word"
                      initial={{ opacity: 0, y: 10, rotate: 5 }}
                      animate={{
                        opacity: 1,
                        y: 0,
                        rotate: 0,
                        transition: {
                          delay: line2Delay + i * 0.15,
                          duration: 0.75,
                          ease: [0.19, 1, 0.22, 1],
                        },
                      }}
                    >
                      {word}
                    </motion.span>
                  ))}
                  <motion.span
                    className="wish-note__word wish-note__flower"
                    initial={{ opacity: 0, scale: 0, rotate: -60 }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      rotate: 0,
                      transition: {
                        delay: line2Delay + noteWords2.length * 0.15 + 0.1,
                        type: 'spring',
                        stiffness: 240,
                        damping: 12,
                      },
                    }}
                  >
                    ❀
                  </motion.span>
                </span>
              </>
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="wish-panel"
            initial={{ opacity: 0, y: -14, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
          >
            <header className="wish-panel__head">
              <div className="wish-panel__id">
                <span className="wish-panel__orb" aria-hidden="true">
                  <Sparkles size={15} strokeWidth={1.8} />
                </span>
                <div>
                  <p className="wish-panel__name serif-i">Wish ✿</p>
                  <p className="wish-panel__tag">
                    <span className="wish-panel__status" /> online — Shweta’s assistant
                  </p>
                </div>
              </div>
              <div className="wish-panel__actions">
                <button
                  className={`wish-panel__icon-btn ${voiceOn ? 'is-on' : ''}`}
                  onClick={() => {
                    if (voiceOn) window.speechSynthesis?.cancel();
                    setVoiceOn(!voiceOn);
                  }}
                  aria-label={voiceOn ? 'Mute voice replies' : 'Speak replies aloud'}
                  title={voiceOn ? 'Voice on' : 'Voice off'}
                >
                  {voiceOn ? <Volume2 size={14} strokeWidth={1.7} /> : <VolumeX size={14} strokeWidth={1.7} />}
                </button>
                <button
                  className="wish-panel__icon-btn"
                  onClick={() => setOpen(false)}
                  aria-label="Close chat"
                >
                  <X size={14} strokeWidth={1.7} />
                </button>
              </div>
            </header>

            <div ref={bodyRef} className="wish-panel__body" data-lenis-prevent>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  className={`wish-msg wish-msg--${msg.from}`}
                  initial={{ opacity: 0, y: 10, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.35, ease: [0.19, 1, 0.22, 1] }}
                >
                  {msg.text}
                </motion.div>
              ))}
              {typing && (
                <motion.div
                  className="wish-msg wish-msg--bot wish-msg--typing"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <span /><span /><span />
                </motion.div>
              )}
            </div>

            <div className="wish-panel__chips">
              {SUGGESTIONS.map((chip, i) => (
                <button
                  key={chip}
                  className={`wish-chip ${i % 2 ? 'wish-chip--blue' : ''}`}
                  onClick={() => send(chip)}
                >
                  {chip}
                </button>
              ))}
            </div>

            <form
              className="wish-panel__input"
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={listening ? 'listening… ✿' : 'ask me about Shweta…'}
                aria-label="Message Wish"
              />
              {Recognition && (
                <button
                  type="button"
                  className={`wish-panel__mic ${listening ? 'is-listening' : ''}`}
                  onClick={toggleMic}
                  aria-label="Speak your question"
                >
                  <Mic size={15} strokeWidth={1.7} />
                </button>
              )}
              <button type="submit" className="wish-panel__send" aria-label="Send">
                <Send size={14} strokeWidth={1.7} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
