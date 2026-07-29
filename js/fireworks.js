// =========================================================
// GWIAZDKI & FAJERWERKI
// =========================================================

export function animateStars(count) {
  const el = document.getElementById('res-stars');
  if (!el) return;
  el.textContent = '☆☆☆';
  el.style.transition = 'none';
  const filled = '⭐', empty = '☆';
  let i = 0;
  function showNext() {
    if (i >= count) return;
    i++;
    el.textContent = filled.repeat(i) + empty.repeat(3 - i);
    el.style.transform = 'scale(1.3)';
    setTimeout(() => { el.style.transform = 'scale(1)'; el.style.transition = 'transform .15s'; }, 150);
    if (i < count) setTimeout(showNext, 350);
  }
  if (count > 0) setTimeout(showNext, 500);
}

let _fwRaf = null;
let _fwCtx  = null;
let _fwParticles = [];

export function startFireworks(stars) {
  const canvas = document.getElementById('fireworks-canvas');
  if (!canvas) return;
  canvas.width  = canvas.offsetWidth  || window.innerWidth;
  canvas.height = canvas.offsetHeight || window.innerHeight;
  _fwCtx = canvas.getContext('2d');
  _fwParticles = [];

  const maxLaunches = stars === 3 ? 12 : stars === 2 ? 7 : 4;
  let launched = 0;

  function launchRocket() {
    if (launched >= maxLaunches) return;
    launched++;
    const x = 60 + Math.random() * (canvas.width - 120);
    const y = canvas.height * (0.2 + Math.random() * 0.5);
    explode(x, y, stars);
    if (launched < maxLaunches) {
      setTimeout(launchRocket, 300 + Math.random() * 500);
    }
  }

  launchRocket();
  _fwRaf = requestAnimationFrame(drawFireworks);
}

export function stopFireworks() {
  if (_fwRaf) { cancelAnimationFrame(_fwRaf); _fwRaf = null; }
  _fwParticles = [];
  const canvas = document.getElementById('fireworks-canvas');
  if (canvas && _fwCtx) _fwCtx.clearRect(0, 0, canvas.width, canvas.height);
}

function explode(x, y, stars) {
  const palettes = [
    ['#ff4081','#ff6d00','#ffd740'],
    ['#00e676','#00d4ff','#ffd740','#ff4081'],
    ['#ffd740','#00d4ff','#ab47bc','#00e676','#ff4081','#ff6d00'],
  ];
  const palette = palettes[Math.min(stars - 1, 2)];
  const count = 28 + stars * 10;
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 / count) * i + Math.random() * 0.3;
    const speed = 2.5 + Math.random() * 4 * stars;
    _fwParticles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 1,
      color: palette[Math.floor(Math.random() * palette.length)],
      life: 1.0,
      decay: 0.012 + Math.random() * 0.018,
      size: 3 + Math.random() * 3,
      trail: [],
    });
  }
}

function drawFireworks() {
  const canvas = document.getElementById('fireworks-canvas');
  if (!canvas || !_fwCtx) return;
  _fwCtx.fillStyle = 'rgba(15,25,35,0.18)';
  _fwCtx.fillRect(0, 0, canvas.width, canvas.height);

  _fwParticles = _fwParticles.filter(p => p.life > 0);
  for (const p of _fwParticles) {
    p.trail.push({x: p.x, y: p.y});
    if (p.trail.length > 5) p.trail.shift();

    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.12;
    p.vx *= 0.97;
    p.vy *= 0.97;
    p.life -= p.decay;
    if (p.life < 0) p.life = 0;

    if (p.trail.length > 1) {
      _fwCtx.beginPath();
      _fwCtx.moveTo(p.trail[0].x, p.trail[0].y);
      for (const pt of p.trail) _fwCtx.lineTo(pt.x, pt.y);
      _fwCtx.strokeStyle = p.color + Math.round(p.life * 80).toString(16).padStart(2,'0');
      _fwCtx.lineWidth = p.size * 0.5;
      _fwCtx.stroke();
    }

    _fwCtx.beginPath();
    _fwCtx.arc(p.x, p.y, Math.max(0, p.size * p.life), 0, Math.PI * 2);
    _fwCtx.fillStyle = p.color + Math.round(p.life * 255).toString(16).padStart(2,'0');
    _fwCtx.fill();
  }

  if (_fwParticles.length > 0) {
    _fwRaf = requestAnimationFrame(drawFireworks);
  } else {
    _fwRaf = null;
  }
}
