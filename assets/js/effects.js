/* ============================================================
   SANTA SLEAZE — global effects
   snowfall (tsParticles), scroll reveals, floating gifts
   ============================================================ */

const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- snowfall via tsParticles ---------- */
function initSnow() {
  if (prefersReduced || typeof tsParticles === 'undefined') return;
  if (!document.getElementById('tsparticles')) {
    const c = document.createElement('div');
    c.id = 'tsparticles';
    document.body.prepend(c);
  }
  tsParticles.load({
    id: 'tsparticles',
    options: {
      fpsLimit: 60,
      detectRetina: true,
      fullScreen: { enable: false },
      particles: {
        number: { value: 110, density: { enable: true, area: 900 } },
        color: { value: ['#ffffff', '#bfe9ff', '#ffd76a'] },
        opacity: { value: { min: 0.2, max: 0.85 } },
        size: { value: { min: 1, max: 4 } },
        shape: { type: 'circle' },
        move: {
          enable: true,
          direction: 'bottom',
          speed: { min: 0.6, max: 2.2 },
          straight: false,
          drift: { min: -0.6, max: 0.6 },
          outModes: { default: 'out', bottom: 'out', top: 'none' },
        },
        wobble: { enable: true, distance: 8, speed: 4 },
      },
      emitters: [],
    },
  });
}

/* ---------- scroll reveal ---------- */
function initReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window) || prefersReduced) {
    els.forEach(e => e.classList.add('in'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        e.target.style.transitionDelay = (e.target.dataset.delay || 0) + 'ms';
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.15 });
  els.forEach(e => io.observe(e));
}

/* ---------- floating gift decorations ---------- */
function spawnFloatingGifts(host, count = 6) {
  if (!host) return;
  const emojis = ['🎁', '🎄', '⛄', '🔔', '🍬', '⭐'];
  for (let i = 0; i < count; i++) {
    const g = document.createElement('span');
    g.textContent = emojis[i % emojis.length];
    g.className = 'floaty pointer-events-none select-none absolute';
    g.style.left = Math.random() * 90 + 5 + '%';
    g.style.top = Math.random() * 80 + 5 + '%';
    g.style.fontSize = (Math.random() * 1.6 + 1.2) + 'rem';
    g.style.opacity = (Math.random() * 0.4 + 0.25).toString();
    g.style.animationDelay = (Math.random() * 4) + 's';
    g.style.filter = 'drop-shadow(0 0 10px rgba(255,255,255,.25))';
    host.appendChild(g);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initSnow();
  initReveal();
  document.querySelectorAll('[data-gifts]').forEach(h =>
    spawnFloatingGifts(h, parseInt(h.dataset.gifts) || 6));
});
