/* ============================================================
   SANTA SLEAZE — Generator
   Two modes:
     • AI mode  — identity-preserving "billionaire Santa" outfit swap
                  via a browser-callable image-editing API (BYO key).
     • Quick    — local festive overlay composited on <canvas>
                  (no key needed; instant fallback / preview).

   The uploaded photo never touches our servers — AI calls go
   straight from the browser to the provider with the user's key,
   which is stored only in localStorage.
   ============================================================ */

/* ---- the reference prompt that produced good results ---- */
const DEFAULT_PROMPT = `Preserve the original character exactly as shown. Do not modify face, eyes, hair, skin tone, body shape, age, expression, pose, art style, anatomy, proportions, or identity. Keep the original character fully recognizable. Clothing and accessories only.

Replace the existing outfit with a luxury billionaire Santa Claus outfit made from premium red velvet and white fur. Add an elegant Santa hat matching the outfit. Add diamond grillz while preserving the original mouth shape and facial expression.

Add multiple luxury platinum and gold chains, iced out luxury watches, diamond bracelets, diamond rings, luxury belt buckle, and high-end jewelry. Make the jewelry look authentic, expensive, and tastefully excessive.

Maintain the original composition, original pose, original facial features, original hairstyle, original character design, and original art style.

Outfit swap only. No face swap. No body modification. No hairstyle modification. No character redesign.

Luxury Christmas billionaire aesthetic, ultra detailed, high quality, premium materials, realistic jewelry reflections, rich textures, festive luxury atmosphere.

Do not alter facial structure. Do not change hairstyle. Do not change eye shape. Do not change expression. Do not change body proportions. Do not change age. Do not change gender. Do not change art style. Do not make realistic if the source image is stylized. Do not redesign the character. Do not add text, logos, brand names, watermarks, signatures, necklaces with words, pendants containing letters, or any written elements.`;

const SETTINGS_KEY = 'santaSleazeSettings';

const GENS = {
  canvas: null, ctx: null,
  sourceImg: null,
  size: 768,
  mode: 'ai',                 // 'ai' | 'overlay'
  overlay: { hat: true, snow: 60, frame: 'red' },
  settings: {
    provider: 'gemini',
    model: 'gemini-2.5-flash-image',
    apiKey: '',
    prompt: DEFAULT_PROMPT,
  },
  hasResult: false,
};

/* ---------------- settings persistence ---------------- */
function loadSettings() {
  try {
    const s = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
    Object.assign(GENS.settings, s);
  } catch (_) {}
}
function saveSettings() {
  try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(GENS.settings)); } catch (_) {}
}

/* ---------------- file handling ---------------- */
function handleFile(file) {
  if (!file || !file.type.startsWith('image/')) { toast('Please drop an image file 🎄'); return; }
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      GENS.sourceImg = img;
      GENS.hasResult = false;
      document.getElementById('emptyState').classList.add('hidden');
      document.getElementById('stageWrap').classList.remove('hidden');
      document.getElementById('resultActions').classList.add('hidden');
      document.getElementById('controls').classList.remove('opacity-40', 'pointer-events-none');
      showCanvas();
      renderPreview();
      toast('Photo loaded — pick a mode, then unwrap! 🎁');
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

/* downscale source -> base64 (keeps payload + cost sane) */
function getSourceBase64(maxDim = 1024) {
  const img = GENS.sourceImg;
  const r = Math.min(1, maxDim / Math.max(img.width, img.height));
  const w = Math.round(img.width * r), h = Math.round(img.height * r);
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  c.getContext('2d').drawImage(img, 0, 0, w, h);
  const dataURL = c.toDataURL('image/jpeg', 0.92);
  return { mimeType: 'image/jpeg', base64: dataURL.split(',')[1] };
}

/* ---------------- stage helpers ---------------- */
function showCanvas() {
  document.getElementById('genCanvas').classList.remove('hidden');
  document.getElementById('resultImg').classList.add('hidden');
}
function showResult(url) {
  const out = document.getElementById('resultImg');
  out.src = url;
  out.classList.remove('hidden');
  document.getElementById('genCanvas').classList.add('hidden');
}

/* ---------------- preview / overlay compositing ---------------- */
function renderPreview() {
  const { ctx, size, sourceImg } = GENS;
  if (!sourceImg) return;
  ctx.clearRect(0, 0, size, size);

  const r = Math.max(size / sourceImg.width, size / sourceImg.height);
  const w = sourceImg.width * r, h = sourceImg.height * r;
  ctx.drawImage(sourceImg, (size - w) / 2, (size - h) / 2, w, h);

  if (GENS.mode !== 'overlay') return; // AI mode shows the raw photo as preview

  ctx.fillStyle = 'rgba(10,8,24,0.18)';
  ctx.fillRect(0, 0, size, size);
  const grad = ctx.createRadialGradient(size/2, size*0.45, size*0.2, size/2, size/2, size*0.75);
  grad.addColorStop(0, 'rgba(0,0,0,0)');
  grad.addColorStop(1, 'rgba(0,0,0,0.45)');
  ctx.fillStyle = grad; ctx.fillRect(0, 0, size, size);

  const o = GENS.overlay;
  if (o.hat) drawSantaHat(ctx, size);
  if (o.snow > 0) drawSnow(ctx, size, o.snow);
  drawFrame(ctx, size, o.frame);
  drawWatermark(ctx, size);
}

function drawSantaHat(ctx, s) {
  ctx.save();
  const baseY = s * 0.18;
  ctx.beginPath();
  ctx.moveTo(s * 0.30, baseY);
  ctx.quadraticCurveTo(s * 0.46, -s * 0.06, s * 0.74, baseY * 0.7);
  ctx.lineTo(s * 0.70, baseY); ctx.closePath();
  ctx.fillStyle = '#e60026'; ctx.shadowColor = 'rgba(255,45,85,.6)'; ctx.shadowBlur = 30; ctx.fill();
  ctx.shadowBlur = 0; ctx.fillStyle = '#fff';
  roundRect(ctx, s * 0.26, baseY - s * 0.02, s * 0.5, s * 0.07, s * 0.035); ctx.fill();
  ctx.beginPath(); ctx.arc(s * 0.75, baseY * 0.66, s * 0.045, 0, Math.PI * 2);
  ctx.fillStyle = '#fff'; ctx.shadowColor = 'rgba(255,255,255,.7)'; ctx.shadowBlur = 18; ctx.fill();
  ctx.restore();
}
function drawSnow(ctx, s, intensity) {
  ctx.save();
  const n = Math.round(intensity * 1.6);
  for (let i = 0; i < n; i++) {
    ctx.globalAlpha = Math.random() * 0.6 + 0.25;
    ctx.beginPath(); ctx.arc(Math.random()*s, Math.random()*s, Math.random()*2.4+0.6, 0, Math.PI*2);
    ctx.fillStyle = '#eaf6ff'; ctx.fill();
  }
  ctx.restore();
}
function drawFrame(ctx, s, style) {
  const colors = { red:['#ff2d55','#ff0033'], green:['#2bff88','#00ff66'], gold:['#ffd76a','#ffb800'] }[style] || ['#ff2d55','#ff0033'];
  ctx.save();
  const g = ctx.createLinearGradient(0,0,s,s); g.addColorStop(0,colors[0]); g.addColorStop(1,colors[1]);
  ctx.strokeStyle = g; ctx.lineWidth = 14; ctx.shadowColor = colors[0]; ctx.shadowBlur = 28;
  roundRect(ctx, 12, 12, s-24, s-24, 22); ctx.stroke();
  ctx.shadowBlur = 16;
  [[26,26],[s-26,26],[26,s-26],[s-26,s-26]].forEach(([x,y],i)=>{ ctx.beginPath(); ctx.arc(x,y,6,0,Math.PI*2); ctx.fillStyle = i%2?colors[1]:'#fff'; ctx.fill(); });
  ctx.restore();
}
function drawWatermark(ctx, s) {
  ctx.save(); ctx.font = "700 22px 'Bebas Neue', sans-serif";
  ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.shadowColor = 'rgba(255,45,85,.8)'; ctx.shadowBlur = 10;
  ctx.textAlign = 'right'; ctx.fillText('$SS · SANTA SLEAZE', s - 34, s - 30); ctx.restore();
}
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath(); ctx.moveTo(x+r,y);
  ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r);
  ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+w,y,r); ctx.closePath();
}

/* ================================================================
   IMAGE GENERATION
   'free'   -> Pollinations.ai (no key, text-to-image, instant)
   'gemini' -> callGemini()  (free key, identity-preserving outfit swap)
   'overlay'-> festive canvas composite (no key)
   ================================================================ */
async function generateImage() {
  if (GENS.mode === 'overlay') {
    renderForOverlay();
    return GENS.canvas.toDataURL('image/png');
  }
  if (GENS.mode === 'free') {
    return await callPollinations({
      prompt: buildPollinationsPrompt(),
      seed: Math.floor(Math.random() * 1e6),
    });
  }
  // gemini (identity-preserving)
  const { base64, mimeType } = getSourceBase64(1024);
  return await callGemini({
    base64, mimeType,
    prompt: GENS.settings.prompt || DEFAULT_PROMPT,
    key: GENS.settings.apiKey,
    model: GENS.settings.model || 'gemini-2.5-flash-image',
  });
}

function renderForOverlay() {
  const prev = GENS.mode; GENS.mode = 'overlay';
  renderPreview(); GENS.mode = prev;
}

/* ---- Pollinations.ai : free, no API key, text-to-image ----
   Generates a fresh "billionaire Santa" from the prompt. It does NOT
   trace the uploaded face (text-to-image) — that's the trade-off for
   being 100% free with zero setup. The photo's only used for an
   optional subject hint (e.g. "a man" / "a woman" / "a cartoon").   */
function buildPollinationsPrompt() {
  const hint = (document.getElementById('subjectHint')?.value || '').trim();
  const subject = hint || 'a person';
  return `${subject} as a luxury billionaire Santa Claus, premium red velvet coat with thick white fur trim, elegant matching Santa hat, shiny diamond grillz on teeth, multiple gold and platinum iced-out cuban link chains, diamond-encrusted luxury watch, diamond rings and bracelets, opulent festive Christmas billionaire aesthetic, dramatic studio lighting, snow, ultra detailed, photorealistic, sharp focus, high quality portrait`;
}

function callPollinations({ prompt, seed }) {
  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}`
    + `?width=1024&height=1024&model=flux&nologo=true&seed=${seed}`;
  return new Promise((resolve, reject) => {
    const img = new Image();              // no crossOrigin: display + <a download> work without CORS
    const timer = setTimeout(() => reject(new Error('Free generator timed out — try again.')), 70000);
    img.onload = () => { clearTimeout(timer); resolve(url); };
    img.onerror = () => { clearTimeout(timer); reject(new Error('Free generator is busy — try again in a moment.')); };
    img.src = url;
  });
}

/* Google Gemini image model — browser-callable image editing.
   Sends the photo + prompt, returns the edited image as a dataURL. */
async function callGemini({ base64, mimeType, prompt, key, model }) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(key)}`;
  const body = {
    contents: [{
      role: 'user',
      parts: [
        { text: prompt },
        { inline_data: { mime_type: mimeType, data: base64 } },
      ],
    }],
    generationConfig: { responseModalities: ['TEXT', 'IMAGE'] },
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    let msg = `Request failed (HTTP ${res.status})`;
    try { const e = await res.json(); if (e.error?.message) msg = e.error.message; } catch (_) {}
    throw new Error(msg);
  }

  const data = await res.json();
  const parts = data?.candidates?.[0]?.content?.parts || [];
  const part = parts.find(p => p.inlineData || p.inline_data);
  const inline = part?.inlineData || part?.inline_data;
  if (!inline?.data) {
    const block = data?.promptFeedback?.blockReason;
    throw new Error(block ? `Blocked by the model (${block})` : 'No image was returned — try another photo or model.');
  }
  return `data:${inline.mimeType || inline.mime_type || 'image/png'};base64,${inline.data}`;
}

/* ---------------- gift-box reveal flow ---------------- */
async function runGenerate() {
  if (!GENS.sourceImg) { toast('Upload a photo first 🎅'); return; }
  if (GENS.mode === 'gemini' && !GENS.settings.apiKey) {
    toast('Add your API key for HD mode, or switch to Free / Quick 🔑');
    document.getElementById('apiKey')?.focus();
    return;
  }

  const overlay = document.getElementById('giftOverlay');
  const label = document.getElementById('giftLabel');
  overlay.classList.remove('hidden');
  resetGift();
  const labels = { free: 'Sleazing… (free AI is cooking)', gemini: 'Sleazing… (AI is wrapping your gift)', overlay: 'Unwrapping…' };
  label.textContent = labels[GENS.mode] || 'Unwrapping…';

  if (window.gsap) {
    const tl = gsap.timeline();
    tl.to('#giftBox', { rotation: -4, duration: 0.08, yoyo: true, repeat: 5, transformOrigin: '50% 100%' })
      .to('#giftBox', { scale: 1.06, duration: 0.2, yoyo: true, repeat: 1 });
    // keep the box gently jiggling while the request is in flight
    gsap.to('#giftBox', { rotation: 3, duration: 0.5, yoyo: true, repeat: -1, ease: 'sine.inOut', delay: 0.9 });
  }

  let resultURL;
  try {
    resultURL = await generateImage();
  } catch (err) {
    gsap?.killTweensOf?.('#giftBox');
    overlay.classList.add('hidden');
    toast('⚠️ ' + (err.message || 'Generation failed'));
    return;
  }
  gsap?.killTweensOf?.('#giftBox');

  burstSparks(overlay);
  if (window.gsap) {
    await gsap.timeline()
      .to('#giftLid', { y: -90, rotation: -22, opacity: 0, duration: 0.45, ease: 'back.in(2)' })
      .to('#giftBody', { scale: 0.4, opacity: 0, duration: 0.4, ease: 'power2.in' }, '<')
      .then();
  } else { await wait(400); }

  showResult(resultURL);
  document.getElementById('resultImg').dataset.url = resultURL;
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
    s.className = 'spark'; s.style.background = colors[i % colors.length];
    s.style.left = cx + 'px'; s.style.top = cy + 'px';
    s.style.boxShadow = `0 0 10px ${s.style.background}`;
    host.appendChild(s);
    const ang = Math.random() * Math.PI * 2, dist = Math.random() * 220 + 60;
    if (window.gsap) {
      gsap.to(s, { x: Math.cos(ang)*dist, y: Math.sin(ang)*dist - 40, opacity: 0,
        scale: Math.random()*1.4 + 0.4, duration: Math.random()*0.7 + 0.6, ease: 'power2.out',
        onComplete: () => s.remove() });
    } else { setTimeout(() => s.remove(), 800); }
  }
}

/* ---------------- result actions ---------------- */
function currentResultURL() {
  return document.getElementById('resultImg').dataset.url || document.getElementById('resultImg').src;
}
function downloadResult() {
  if (!GENS.hasResult) return;
  const a = document.createElement('a');
  a.href = currentResultURL(); a.download = 'santa-sleaze.png'; a.click();
}
async function shareResult() {
  if (!GENS.hasResult) return;
  try {
    const blob = await (await fetch(currentResultURL())).blob();
    const file = new File([blob], 'santa-sleaze.png', { type: blob.type || 'image/png' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], title: 'Santa Sleaze', text: 'I just got Santa Sleazed 🎅 $SS' });
      return;
    }
  } catch (_) {}
  toast('Sharing not supported here — downloading instead.');
  downloadResult();
}

/* ---------------- toast ---------------- */
let toastTimer;
function toast(msg) {
  let t = document.getElementById('toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'toast';
    t.className = 'fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] px-5 py-3 rounded-full text-sm font-semibold card card-glow-green max-w-[90vw] text-center';
    document.body.appendChild(t);
  }
  t.textContent = msg; t.style.opacity = '1';
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (t.style.opacity = '0'), 3200);
}
const wait = (ms) => new Promise(r => setTimeout(r, ms));

/* ---------------- mode switching ---------------- */
function setMode(mode) {
  GENS.mode = mode;
  document.querySelectorAll('[data-mode]').forEach(b =>
    b.classList.toggle('mode-active', b.dataset.mode === mode));
  document.getElementById('freePanel').classList.toggle('hidden', mode !== 'free');
  document.getElementById('aiPanel').classList.toggle('hidden', mode !== 'gemini');
  document.getElementById('overlayPanel').classList.toggle('hidden', mode !== 'overlay');
  const labels = { free: '🎁 Sleaze Me (Free)', gemini: '💎 Sleaze Me (HD)', overlay: '🎨 Quick Overlay' };
  document.getElementById('generateBtn').textContent = labels[mode] || '🎁 Sleaze Me';
  if (GENS.sourceImg) { showCanvas(); renderPreview(); }
}

/* ---------------- wire up ---------------- */
document.addEventListener('DOMContentLoaded', () => {
  GENS.canvas = document.getElementById('genCanvas');
  if (!GENS.canvas) return;
  GENS.canvas.width = GENS.canvas.height = GENS.size;
  GENS.ctx = GENS.canvas.getContext('2d');
  loadSettings();

  // upload
  const drop = document.getElementById('dropZone');
  const input = document.getElementById('fileInput');
  drop.addEventListener('click', () => input.click());
  input.addEventListener('change', (e) => handleFile(e.target.files[0]));
  ['dragenter','dragover'].forEach(ev => drop.addEventListener(ev, (e)=>{ e.preventDefault(); drop.classList.add('drag'); }));
  ['dragleave','drop'].forEach(ev => drop.addEventListener(ev, (e)=>{ e.preventDefault(); drop.classList.remove('drag'); }));
  drop.addEventListener('drop', (e) => handleFile(e.dataTransfer.files[0]));

  // mode toggle
  document.querySelectorAll('[data-mode]').forEach(b => b.addEventListener('click', () => setMode(b.dataset.mode)));

  // AI settings inputs
  const apiKey = document.getElementById('apiKey');
  const modelId = document.getElementById('modelId');
  const promptText = document.getElementById('promptText');
  apiKey.value = GENS.settings.apiKey;
  modelId.value = GENS.settings.model;
  promptText.value = GENS.settings.prompt;
  apiKey.addEventListener('input', e => { GENS.settings.apiKey = e.target.value.trim(); saveSettings(); });
  modelId.addEventListener('input', e => { GENS.settings.model = e.target.value.trim(); saveSettings(); });
  promptText.addEventListener('input', e => { GENS.settings.prompt = e.target.value; saveSettings(); });
  document.getElementById('resetPrompt').addEventListener('click', () => {
    GENS.settings.prompt = DEFAULT_PROMPT; promptText.value = DEFAULT_PROMPT; saveSettings(); toast('Prompt reset 🎄');
  });
  const adv = document.getElementById('advancedToggle');
  adv.addEventListener('click', () => document.getElementById('advanced').classList.toggle('hidden'));

  // overlay controls
  document.getElementById('optHat').addEventListener('change', e => { GENS.overlay.hat = e.target.checked; renderPreview(); });
  document.getElementById('optSnow').addEventListener('input', e => { GENS.overlay.snow = +e.target.value; renderPreview(); });
  document.querySelectorAll('[data-frame]').forEach(btn => btn.addEventListener('click', () => {
    GENS.overlay.frame = btn.dataset.frame;
    document.querySelectorAll('[data-frame]').forEach(b => b.classList.remove('ring-2'));
    btn.classList.add('ring-2'); renderPreview();
  }));

  document.getElementById('generateBtn').addEventListener('click', runGenerate);
  document.getElementById('downloadBtn').addEventListener('click', downloadResult);
  document.getElementById('shareBtn').addEventListener('click', shareResult);
  document.getElementById('regenBtn').addEventListener('click', runGenerate);

  setMode('free');
});
