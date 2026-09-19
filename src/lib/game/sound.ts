// Sound manager — synthesizes game sounds with the Web Audio API.
// No external assets, no network calls. Sounds are buttery and subtle.

type SoundName =
  | 'tap'        // soft click when selecting a cell
  | 'select'     // ascending pitch as you add to selection
  | 'correct'    // bright chord when word is found
  | 'spangram'   // special fanfare for spangram
  | 'error'      // dull buzz for wrong word
  | 'hint'       // gentle ding for hint unlock
  | 'win'        // victory fanfare
  | 'lose'       // sad descending tone
  | 'tick';      // clock tick for last 10 seconds in hard mode

let ctx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let muted = false;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    try {
      ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      masterGain = ctx.createGain();
      masterGain.gain.value = 0.18;
      masterGain.connect(ctx.destination);
    } catch {
      return null;
    }
  }
  if (ctx && ctx.state === 'suspended') {
    void ctx.resume();
  }
  return ctx;
}

interface ToneOptions {
  freq: number;
  duration: number;
  type?: OscillatorType;
  attack?: number;
  decay?: number;
  sustain?: number;
  release?: number;
  volume?: number;
  startTime?: number;
  pitchBendTo?: number;
}

function playTone(opts: ToneOptions): void {
  const c = getCtx();
  if (!c || !masterGain) return;
  const now = opts.startTime ?? c.currentTime;
  const vol = opts.volume ?? 0.5;
  const attack = opts.attack ?? 0.005;
  const decay = opts.decay ?? 0.05;
  const sustain = opts.sustain ?? 0.3;
  const release = opts.release ?? 0.15;

  const osc = c.createOscillator();
  osc.type = opts.type ?? 'sine';
  osc.frequency.setValueAtTime(opts.freq, now);
  if (opts.pitchBendTo) {
    osc.frequency.exponentialRampToValueAtTime(opts.pitchBendTo, now + opts.duration);
  }

  const gain = c.createGain();
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(vol, now + attack);
  gain.gain.linearRampToValueAtTime(vol * sustain, now + attack + decay);
  gain.gain.linearRampToValueAtTime(0, now + opts.duration + release);

  osc.connect(gain);
  gain.connect(masterGain);
  osc.start(now);
  osc.stop(now + opts.duration + release + 0.05);
}

function playChord(freqs: number[], duration: number, type: OscillatorType = 'sine', volume = 0.4): void {
  const c = getCtx();
  if (!c) return;
  const now = c.currentTime;
  freqs.forEach((f, i) => {
    playTone({
      freq: f,
      duration,
      type,
      volume,
      startTime: now + i * 0.04,
      attack: 0.01,
      decay: 0.1,
      sustain: 0.4,
      release: 0.3,
    });
  });
}

const SOUNDS: Record<SoundName, () => void> = {
  tap: () => playTone({
    freq: 280, duration: 0.04, type: 'triangle',
    volume: 0.25, attack: 0.002, decay: 0.02, sustain: 0.1, release: 0.04,
  }),

  select: () => playTone({
    freq: 440, duration: 0.06, type: 'sine',
    volume: 0.2, attack: 0.005, decay: 0.04, sustain: 0.2, release: 0.08,
    pitchBendTo: 660,
  }),

  correct: () => playChord([523.25, 659.25, 783.99], 0.25, 'sine', 0.35), // C-E-G major chord

  spangram: () => {
    // Ascending arpeggio + chord
    playChord([523.25, 659.25, 783.99, 1046.50], 0.4, 'sine', 0.4);
    setTimeout(() => playChord([659.25, 830.61, 987.77, 1318.51], 0.5, 'sine', 0.35), 150);
  },

  error: () => playTone({
    freq: 220, duration: 0.18, type: 'sawtooth',
    volume: 0.2, attack: 0.005, decay: 0.05, sustain: 0.3, release: 0.15,
    pitchBendTo: 110,
  }),

  hint: () => playChord([880, 1108.73], 0.3, 'sine', 0.25), // A5 + C#6

  win: () => {
    // Triumphant ascending arpeggio
    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
    notes.forEach((n, i) => {
      setTimeout(() => playTone({
        freq: n, duration: 0.15, type: 'sine',
        volume: 0.35, attack: 0.01, decay: 0.05, sustain: 0.4, release: 0.2,
      }), i * 100);
    });
    setTimeout(() => playChord([523.25, 659.25, 783.99, 1046.50], 0.6, 'sine', 0.4), 600);
  },

  lose: () => {
    // Descending sad tone
    const notes = [440, 349.23, 261.63];
    notes.forEach((n, i) => {
      setTimeout(() => playTone({
        freq: n, duration: 0.3, type: 'triangle',
        volume: 0.3, attack: 0.01, decay: 0.1, sustain: 0.3, release: 0.3,
      }), i * 200);
    });
  },

  tick: () => playTone({
    freq: 1200, duration: 0.03, type: 'square',
    volume: 0.1, attack: 0.001, decay: 0.01, sustain: 0.05, release: 0.02,
  }),
};

export function playSound(name: SoundName): void {
  if (muted) return;
  try {
    SOUNDS[name]();
  } catch {
    // ignore audio errors
  }
}

export function setMuted(m: boolean): void {
  muted = m;
}

export function isMuted(): boolean {
  return muted;
}

// Initialize on first user interaction (browsers require this)
export function initAudio(): void {
  getCtx();
}
