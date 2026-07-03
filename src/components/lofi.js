// Tiny generative lofi engine — no audio assets, pure Web Audio API.
// Chord pad (Fmaj7 → Em7 → Dm7 → Cmaj7), soft boom-bap drums, vinyl crackle.

const BPM = 72;
const BEAT = 60 / BPM;
const BAR = BEAT * 4;

const CHORDS = [
  [174.61, 220.0, 261.63, 329.63], // Fmaj7
  [164.81, 196.0, 246.94, 293.66], // Em7
  [146.83, 174.61, 220.0, 261.63], // Dm7
  [130.81, 164.81, 196.0, 246.94], // Cmaj7
];

export default class Lofi {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.crackle = null;
    this.timer = null;
    this.nextBar = 0;
    this.barIndex = 0;
    this.playing = false;
  }

  toggle() {
    if (this.playing) this.stop();
    else this.start();
    return this.playing;
  }

  start() {
    if (this.playing) return;
    this.ctx ||= new (window.AudioContext || window.webkitAudioContext)();
    const ctx = this.ctx;
    ctx.resume();

    this.master = ctx.createGain();
    this.master.gain.setValueAtTime(0.0001, ctx.currentTime);
    this.master.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + 1.2);
    this.master.connect(ctx.destination);

    this.startCrackle();

    this.nextBar = ctx.currentTime + 0.1;
    // Lookahead scheduler — keeps timing tight without drift
    this.timer = setInterval(() => {
      while (this.nextBar < ctx.currentTime + 1.2) {
        this.scheduleBar(this.nextBar, this.barIndex);
        this.nextBar += BAR;
        this.barIndex += 1;
      }
    }, 250);

    this.playing = true;
  }

  stop() {
    if (!this.playing) return;
    const ctx = this.ctx;
    clearInterval(this.timer);
    this.master.gain.cancelScheduledValues(ctx.currentTime);
    this.master.gain.setValueAtTime(this.master.gain.value, ctx.currentTime);
    this.master.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);
    const master = this.master;
    const crackle = this.crackle;
    setTimeout(() => {
      crackle?.stop();
      master.disconnect();
    }, 450);
    this.playing = false;
  }

  noiseBuffer(seconds, amp = 1) {
    const ctx = this.ctx;
    const buffer = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * amp;
    return buffer;
  }

  startCrackle() {
    const ctx = this.ctx;
    const buffer = ctx.createBuffer(1, ctx.sampleRate * 3, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.012; // hiss
      if (Math.random() < 0.0004) data[i] = (Math.random() * 2 - 1) * 0.5; // pops
    }
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.loop = true;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 2600;
    bp.Q.value = 0.6;
    const gain = ctx.createGain();
    gain.gain.value = 0.5;
    src.connect(bp).connect(gain).connect(this.master);
    src.start();
    this.crackle = src;
  }

  scheduleBar(t, barIndex) {
    this.pad(t, CHORDS[barIndex % CHORDS.length]);
    // Kick — boom on 1, ghost on the 2-and-a-half
    this.kick(t, 0.9);
    this.kick(t + BEAT * 2.5, 0.55);
    // Snare-ish brush on 2 and 4
    this.snare(t + BEAT);
    this.snare(t + BEAT * 3);
    // Swung hats on 8ths, occasionally dropped
    for (let i = 0; i < 8; i++) {
      if (Math.random() < 0.16) continue;
      const swing = i % 2 ? 0.09 : 0;
      this.hat(t + i * (BEAT / 2) + swing, i % 2 ? 0.045 : 0.075);
    }
  }

  pad(t, freqs) {
    const ctx = this.ctx;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 950;
    lp.connect(this.master);
    freqs.forEach((freq) => {
      [0, 1].forEach((voice) => {
        const osc = ctx.createOscillator();
        osc.type = voice ? 'triangle' : 'sine';
        osc.frequency.value = freq * (voice ? 1.0015 : 0.9985); // gentle detune
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.exponentialRampToValueAtTime(voice ? 0.028 : 0.05, t + 0.7);
        gain.gain.setValueAtTime(voice ? 0.028 : 0.05, t + BAR - 0.5);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + BAR + 0.25);
        osc.connect(gain).connect(lp);
        osc.start(t);
        osc.stop(t + BAR + 0.4);
      });
    });
  }

  kick(t, vel) {
    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(115, t);
    osc.frequency.exponentialRampToValueAtTime(43, t + 0.13);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(vel, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.28);
    osc.connect(gain).connect(this.master);
    osc.start(t);
    osc.stop(t + 0.32);
  }

  snare(t) {
    const ctx = this.ctx;
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuffer(0.14, 0.6);
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 1600;
    bp.Q.value = 0.9;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.11, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.14);
    src.connect(bp).connect(gain).connect(this.master);
    src.start(t);
  }

  hat(t, vel) {
    const ctx = this.ctx;
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuffer(0.05, 0.5);
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 7200;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(vel, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
    src.connect(hp).connect(gain).connect(this.master);
    src.start(t);
  }
}
