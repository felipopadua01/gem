/* ============================================================
   SANTA SLEAZE — Generator
   Upload a photo -> festive overlay compositing on <canvas>
   -> gift-box "unwrap" reveal animation -> download / share.

   NOTE: AI / FPV face-to-meme generation is STUBBED here.
   Real model output should be wired into `generateImage()` below
   (return an image URL / dataURL). Everything else already works.
   ============================================================ */

const GENS = {
  canvas: null, ctx: null,
  sourceImg: null,            // uploaded HTMLImageElement
  size: 768,                  // square render size
  opts: { hat: true, snow: 60, frame: 'red' },
  hasResult: false,
};

/* ---------------- file handling ---------------- */
function handleFile(file) {
  if (!file || !file.type.startsWith('image/')) {
    toast('Please drop an image file 🎄');
    return;
  }
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      GENS.sourceImg = img;
      document.getElementById('emptyState').classList.add('hidden');
      document.getElementById('stageWrap').classList.remove('hidden');
      document.getElementById('controls').classList.remove('opacity-40', 'pointer-events-none');
      renderPreview();
      toast('Photo loaded — tweak the vibe, then unwrap! 🎁');
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

/* ---------------- compositing ---------------- */
function renderPreview() {
  const { ctx, size, sourceImg, opts } = GENS;
  if (!sourceImg) return;
  ctx.clearRect(0, 0, size, size);

  // cover-fit the source photo
  const r = Math.max(size / sourceImg.width, size / sourceImg.height);
  const w = sourceImg.width * r, h = sourceImg.height * r;
  ctx.drawImage(sourceImg, (size - w) / 2, (size - h) / 2, w, h);

  // moody color grade
  ctx.fillStyle = 'rgba(10,8,24,0.18)';
  ctx.fillRect(0, 0, size, size);
  const grad = ctx.createRadialGradient(size/2, size*0.45, size*0.2, size/2, size/2, size*0.75);
  grad.addColorStop(0, 'rgba(0,0,0,0)');
  grad.addColorStop(1, 'rgba(0,0,0,0.45)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  if (opts.hat) drawSantaHat(ctx, size);
  if (opts.snow > 0) drawSnow(ctx, size, opts.snow);
  drawFrame(ctx, size, opts.frame);
  drawWatermark(ctx, size);
}

function drawSantaHat(ctx, s) {
  // positioned across the top — playful, not anatomically precise
  ctx.save();
  const baseY = s * 0.18;
  // red cone
  ctx.beginPath();
  ctx.moveTo(s * 0.30, baseY);
  ctx.quadraticCurveTo(s * 0.46, -s * 0.06, s * 0.74, baseY * 0.7);
  ctx.lineTo(s * 0.70, baseY);
  ctx.closePath();
  ctx.fillStyle = '#e60026';
  ctx.shadowColor = 'rgba(255,45,85,.6)';
  ctx.shadowBlur = 30;
  ctx.fill();
  ctx.shadowBlur = 0;
  // white fur brim
  ctx.fillStyle = '#fff';
  roundRect(ctx, s * 0.26, baseY - s * 0.02, s * 0.5, s * 0.07, s * 0.035);
  ctx.fill();
  // pom-pom
  ctx.beginPath();
  ctx.arc(s * 0.75, baseY * 0.66, s * 0.045, 0, Math.PI * 2);
  ctx.fillStyle = '#fff';
  ctx.shadowColor = 'rgba(255,255,255,.7)';
  ctx.shadowBlur = 18;
  ctx.fill();
  ctx.restore();
}

function drawSnow(ctx, s, intensity) {
  ctx.save();
  const n = Math.round(intensity * 1.6);
  for (let i = 0; i < n; i++) {
    const x = Math.random() * s, y = Math.random() * s;
    const r = Math.random() * 2.4 + 0.6;
    ctx.globalAlpha = Math.random() * 0.6 + 0.25;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = '#eaf6ff';
    ctx.fill();
  }
  ctx.restore();
}

function drawFrame(ctx, s, style) {
  const colors = {
    red:   ['#ff2d55', '#ff0033'],
    green: ['#2bff88', '#00ff66'],
    gold:  ['#ffd76a', '#ffb800'],
  }[style] || ['#ff2d55', '#ff0033'];
  ctx.save();
  const g = ctx.createLinearGradient(0, 0, s, s);
  g.addColorStop(0, colors[0]); g.addColorStop(1, colors[1]);
  ctx.strokeStyle = g;
  ctx.lineWidth = 14;
  ctx.shadowColor = colors[0];
  ctx.shadowBlur = 28;
  roundRect(ctx, 12, 12, s - 24, s - 24, 22);
  ctx.stroke();
  // corner lights
  ctx.shadowBlur = 16;
  [[26,26],[s-26,26],[26,s-26],[s-26,s-26]].forEach(([x,y], i) => {
    ctx.beginPath();
    ctx.arc(x, y, 6, 0, Math.PI*2);
    ctx.fillStyle = i % 2 ? colors[1] : '#fff';
    ctx.fill();
  });
  ctx.restore();
}

function drawWatermark(ctx, s) {
  ctx.save();
  ctx.font = "700 22px 'Bebas Neue', sans-serif";
  ctx.fillStyle = 'rgba(255,255,255,.85)';
  ctx.shadowColor = 'rgba(255,45,85,.8)';
  ctx.shadowBlur = 10;
  ctx.textAlign = 'right';
  ctx.fillText('$SLEAZE · SANTA SLEAZE', s - 34, s - 30);
  ctx.restore();
}

/* small canvas helpers */
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/* ----------------------------------------------------------------
   PLACEHOLDER: real AI/FPV generation hook.
   Swap the body to call your backend and return a dataURL/Blob.
   Currently it just composites the festive overlay locally.
---------------------------------------------------------------- */
async function generateImage() {
  renderPreview();                       // <- replace with real API call
  return GENS.canvas.toDataURL('image/png');
}

/* ---------------- gift-box reveal flow ---------------- */
async function runGenerate() {
  if (!GENS.sourceImg) { toast('Upload a photo first 🎅'); return; }
  const overlay = document.getElementById('giftOverlay');
  overlay.classList.remove('hidden');
  resetGift();

  // shake the box
  if (window.gsap) {
    await gsap.to('#giftBox', { x: 0, duration: 0, })
    const tl = gsap.timeline();
    tl.to('#giftBox', { rotation: -4, duration: 0.08, yoyo: true, repeat: 5, transformOrigin: '50% 100%' })
      .to('#giftBox', { scale: 1.06, duration: 0.2, yoyo: true, repeat: 1 });
    await tl.then();
  } else {
    await wait(700);
  }

  // run (placeholder) generation while the box is "working"
  const resultURL = await generateImage();

  // pop the lid + sparks
  burstSparks(overlay);
  if (window.gsap) {
    await gsap.timeline()
      .to('#giftLid', { y: -90, rotation: -22, opacity: 0, duration: 0.45, ease: 'back.in(2)' })
      .to('#giftBody', { scale: 0.4, opacity: 0, duration: 0.4, ease: 'power2.in' }, '<')
      .then();
  } else {
    await wait(400);
  }

  // reveal result
  const out = document.getElementById('resultImg');
  out.src = resultURL;
  GENS.hasResult = true;
  overlay.classList.add('hidden');
  document.getElementById('resultActions').classList.remove('hidden');
  document.getElementById('stageWrap').scrollIntoView({ behavior: 'smooth', block: 'center' });
  toast('🎉 Unwrapped! Your Santa Sleaze is ready.');
}

function resetGift() {
  if (!window.gsap) return;
  gsap.set('#giftLid', { y: 0, rotation: 0, opacity: 1 });
  gsap.set('#giftBody', { scale: 1, opacity: 1 });
  gsap.set('#giftBox', { rotation: 0, scale: 1, x: 0 });
}

function burstSparks(host) {
  const colors = ['#ff2d55', '#2bff88', '#ffd76a', '#ffffff', '#bfe9ff'];
  const cx = host.clientWidth / 2, cy = host.clientHeight / 2;
  for (let i = 0; i < 40; i++) {
    const s = document.createElement('span');
    s.className = 'spark';
    s.style.background = colors[i % colors.length];
    s.style.left = cx + 'px'; s.style.top = cy + 'px';
    s.style.boxShadow = `0 0 10px ${s.style.background}`;
    host.appendChild(s);
    const ang = Math.random() * Math.PI * 2;
    const dist = Math.random() * 220 + 60;
    if (window.gsap) {
      gsap.to(s, {
        x: Math.cos(ang) * dist, y: Math.sin(ang) * dist - 40,
        opacity: 0, scale: Math.random() * 1.4 + 0.4,
        duration: Math.random() * 0.7 + 0.6, ease: 'power2.out',
        onComplete: () => s.remove(),
      });
    } else { setTimeout(() => s.remove(), 800); }
  }
}

/* ---------------- result actions ---------------- */
function downloadResult() {
  if (!GENS.hasResult) return;
  const a = document.createElement('a');
  a.href = document.getElementById('resultImg').src;
  a.download = 'santa-sleaze.png';
  a.click();
}
async function shareResult() {
  if (!GENS.hasResult) return;
  const url = document.getElementById('resultImg').src;
  try {
    const blob = await (await fetch(url)).blob();
    const file = new File([blob], 'santa-sleaze.png', { type: 'image/png' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], title: 'Santa Sleaze', text: 'I just got Santa Sleazed 🎅 $SLEAZE' });
      return;
    }
  } catch (_) {}
  toast('Sharing not supported here — image downloaded instead.');
  downloadResult();
}

/* ---------------- toast ---------------- */
let toastTimer;
function toast(msg) {
  let t = document.getElementById('toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'toast';
    t.className = 'fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] px-5 py-3 rounded-full text-sm font-semibold card card-glow-green';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.style.opacity = '1';
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (t.style.opacity = '0'), 2600);
}

const wait = (ms) => new Promise(r => setTimeout(r, ms));

/* ---------------- wire up ---------------- */
document.addEventListener('DOMContentLoaded', () => {
  GENS.canvas = document.getElementById('genCanvas');
  if (!GENS.canvas) return;            // not on generator page
  GENS.canvas.width = GENS.canvas.height = GENS.size;
  GENS.ctx = GENS.canvas.getContext('2d');

  const drop = document.getElementById('dropZone');
  const input = document.getElementById('fileInput');

  drop.addEventListener('click', () => input.click());
  input.addEventListener('change', (e) => handleFile(e.target.files[0]));
  ['dragenter', 'dragover'].forEach(ev =>
    drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.add('drag'); }));
  ['dragleave', 'drop'].forEach(ev =>
    drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.remove('drag'); }));
  drop.addEventListener('drop', (e) => handleFile(e.dataTransfer.files[0]));

  // controls
  document.getElementById('optHat').addEventListener('change', (e) => { GENS.opts.hat = e.target.checked; renderPreview(); });
  document.getElementById('optSnow').addEventListener('input', (e) => { GENS.opts.snow = +e.target.value; renderPreview(); });
  document.querySelectorAll('[data-frame]').forEach(btn =>
    btn.addEventListener('click', () => {
      GENS.opts.frame = btn.dataset.frame;
      document.querySelectorAll('[data-frame]').forEach(b => b.classList.remove('ring-2'));
      btn.classList.add('ring-2');
      renderPreview();
    }));

  document.getElementById('generateBtn').addEventListener('click', runGenerate);
  document.getElementById('downloadBtn').addEventListener('click', downloadResult);
  document.getElementById('shareBtn').addEventListener('click', shareResult);
  document.getElementById('regenBtn').addEventListener('click', runGenerate);
});
