// =========================================================
// SOUNDS (Web Audio API Synthesizer)
// =========================================================

export const SoundFX = {
  muted: false,
  ctx: null,
  init() {
    if (this.ctx) return;
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch(e) {
      console.warn('Web Audio API not supported', e);
    }
  },
  play(type) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') {
      try { this.ctx.resume().catch(function(){}); } catch(e) {}
    }
    const now = this.ctx.currentTime;
    try {
      if (type === 'hit') {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(450, now);
        osc.frequency.exponentialRampToValueAtTime(1000, now + 0.12);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
      } else if (type === 'miss') {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.linearRampToValueAtTime(110, now + 0.2);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
      } else if (type === 'double') {
        this.playSingleBubble(now, 450);
        this.playSingleBubble(now + 0.08, 650);
      } else if (type === 'drag_grab') {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.linearRampToValueAtTime(420, now + 0.06);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.06);
        osc.start(now);
        osc.stop(now + 0.06);
      } else if (type === 'drag_match') {
        const notes = [523.25, 659.25, 783.99, 1046.50];
        notes.forEach((freq, idx) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.06);
          gain.gain.setValueAtTime(0.12, now + idx * 0.06);
          gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.06 + 0.25);
          osc.start(now + idx * 0.06);
          osc.stop(now + idx * 0.06 + 0.25);
        });
      } else if (type === 'maze_wall') {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(140, now);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.16);
        osc.start(now);
        osc.stop(now + 0.16);
      } else if (type === 'victory') {
        const fan = [261.63, 329.63, 392.00, 523.25];
        fan.forEach((freq, i) => {
          this.playNote(freq, now + i * 0.08, 0.4, 'sine');
        });
        const fan2 = [329.63, 392.00, 523.25, 659.25];
        fan2.forEach((freq, i) => {
          this.playNote(freq, now + 0.4 + i * 0.08, 0.5, 'sine');
        });
      } else if (type === 'trophy') {
        const arpeggio = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];
        arpeggio.forEach((freq, i) => {
          this.playNote(freq, now + i * 0.06, 0.45, 'sine');
        });
        [523.25, 659.25, 783.99, 1046.50].forEach(freq => {
          this.playNote(freq, now + 0.42, 0.8, 'sine');
        });
      }
    } catch(e) {
      console.error(e);
    }
  },
  playSingleBubble(time, freq) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.8, time + 0.08);
    gain.gain.setValueAtTime(0.15, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.08);
    osc.start(time);
    osc.stop(time + 0.08);
  },
  playNote(freq, startTime, duration, type = 'sine') {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);
    gain.gain.setValueAtTime(0.12, startTime);
    gain.gain.exponentialRampToValueAtTime(0.005, startTime + duration);
    osc.start(startTime);
    osc.stop(startTime + duration);
  }
};

export function toggleMute() {
  SoundFX.muted = !SoundFX.muted;
  const btn = document.getElementById('sound-toggle-global');
  if (btn) {
    btn.textContent = SoundFX.muted ? '🔇' : '🔊';
  }
  if (!SoundFX.muted) {
    SoundFX.init();
    if (SoundFX.ctx && SoundFX.ctx.state === 'suspended') {
      SoundFX.ctx.resume();
    }
  }
}

// Global attachment for inline HTML event handlers
window.SoundFX = SoundFX;
window.toggleMute = toggleMute;
