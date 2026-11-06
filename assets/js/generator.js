
/* ============================================================
   SANTA SLEAZE — GENERATOR
   GPT Image + Cloudflare Worker + Turnstile

   Modes:
   swap = Outfit Swap (all visible people)
   pfp  = Sleaze PFP (main person, square portrait)

   Daily limit: 7 per IP, enforced by Cloudflare D1.
   Prompts and OpenAI API key stay on the Worker.
   ============================================================ */

const WORKER_URL =
  "https://santa-sleaze-generator.felipopadua01.workers.dev";

// PUBLIC Site Key from Cloudflare Turnstile.
// Never put the Turnstile Secret Key or OpenAI API key here.
const TURNSTILE_SITE_KEY = "0x4AAAAAAF2uhfsGhnAlQet8";

const MAX_FILE_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp"
];

const GENS = {
  canvas: null,
  ctx: null,
  sourceImg: null,
  sourceFile: null,
  mode: "swap",
  size: 768,
  hasResult: false,
  resultURL: null,
  busy: false,
  turnstileId: null
};

/* ---------------- DOM helpers ---------------- */

function el(id) {
  return document.getElementById(id);
}

function status(message = "") {
  const target = el("generationStatus");
  if (target) target.textContent = message;
}

let toastTimer;

function toast(message) {
  let target = el("toast");

  if (!target) {
    target = document.createElement("div");
    target.id = "toast";
    target.className =
      "fixed bottom-6 left-1/2 -translate-x-1/2 " +
      "z-[100] px-5 py-3 rounded-full text-sm " +
      "font-semibold card card-glow-green " +
      "max-w-[90vw] text-center";

    document.body.appendChild(target);
  }

  target.textContent = message;
  target.style.opacity = "1";

  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {
    target.style.opacity = "0";
  }, 4000);
}

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/* ---------------- Turnstile ---------------- */

function hasSiteKey() {
  return (
    TURNSTILE_SITE_KEY &&
    TURNSTILE_SITE_KEY !== "PASTE_YOUR_SITE_KEY_HERE"
  );
}

function initTurnstile() {
  if (!hasSiteKey()) {
    status("Turnstile Site Key needs to be configured.");
    return;
  }

  if (!window.turnstile) {
    return;
  }

  if (GENS.turnstileId !== null) {
    return;
  }

  const container = el("turnstileWidget");
  if (!container) return;

  GENS.turnstileId = window.turnstile.render(
    container,
    {
      sitekey: TURNSTILE_SITE_KEY,
      theme: "dark",
      appearance: "always",
      callback: () => {
        if (!GENS.busy) {
          status("Security verification complete.");
        }
      },
      "expired-callback": () => {
        status("Security verification expired. Please verify again.");
      },
      "error-callback": () => {
        status("Security verification unavailable. Please retry.");
      }
    }
  );
}

function getTurnstileToken() {
  if (
    !window.turnstile ||
    GENS.turnstileId === null
  ) {
    return "";
  }

  return window.turnstile.getResponse(
    GENS.turnstileId
  ) || "";
}

function resetTurnstile() {
  if (
    window.turnstile &&
    GENS.turnstileId !== null
  ) {
    window.turnstile.reset(GENS.turnstileId);
  }
}

/* ---------------- Upload handling ---------------- */

function validateFile(file) {
  if (!file) {
    throw new Error("Please select a photo.");
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error("Use JPG, PNG or WebP.");
  }

  if (file.size === 0) {
    throw new Error("This image is empty.");
  }

  if (file.size > MAX_FILE_BYTES) {
    throw new Error("Maximum image size is 5 MB.");
  }
}

function handleFile(file) {
  if (GENS.busy) return;

  try {
    validateFile(file);
  } catch (error) {
    toast("⚠️ " + error.message);
    return;
  }

  const reader = new FileReader();

  reader.onerror = () => {
    toast("⚠️ Unable to read this photo.");
  };

  reader.onload = event => {
    const image = new Image();

    image.onerror = () => {
      toast("⚠️ Invalid or unsupported image.");
    };

    image.onload = () => {
      GENS.sourceImg = image;
      GENS.sourceFile = file;
      GENS.hasResult = false;
      GENS.resultURL = null;

      el("emptyState").classList.add("hidden");
      el("stageWrap").classList.remove("hidden");
      el("resultActions").classList.add("hidden");

      el("controls").classList.remove(
        "opacity-40",
        "pointer-events-none"
      );

      showCanvas();
      renderPreview();

      status("Photo ready. Choose your mode and generate.");
      toast("Photo loaded! 🎅");
    };

    image.src = event.target.result;
  };

  reader.readAsDataURL(file);
}

/* ---------------- Preview ---------------- */

function showCanvas() {
  el("genCanvas").classList.remove("hidden");
  el("resultImg").classList.add("hidden");
}

function showResult(url) {
  const image = el("resultImg");

  image.src = url;
  image.dataset.url = url;

  image.classList.remove("hidden");
  el("genCanvas").classList.add("hidden");
}

function renderPreview() {
  const { ctx, canvas, sourceImg, size } = GENS;

  if (!sourceImg || !ctx || !canvas) return;

  canvas.width = size;
  canvas.height = size;

  ctx.clearRect(0, 0, size, size);

  const scale = Math.min(
    size / sourceImg.width,
    size / sourceImg.height
  );

  const width = sourceImg.width * scale;
  const height = sourceImg.height * scale;

  ctx.fillStyle = "#0c0c14";
  ctx.fillRect(0, 0, size, size);

  ctx.drawImage(
    sourceImg,
    (size - width) / 2,
    (size - height) / 2,
    width,
    height
  );
}

/* ---------------- Mode switching ---------------- */

function setMode(mode) {
  if (GENS.busy) return;
  if (!["swap", "pfp"].includes(mode)) return;

  GENS.mode = mode;

  document.querySelectorAll("[data-mode]").forEach(button => {
    const active = button.dataset.mode === mode;

    button.classList.toggle("mode-active", active);
    button.setAttribute(
      "aria-pressed",
      String(active)
    );
  });

  const description = el("modeDescription");

  if (description) {
    if (mode === "swap") {
      description.innerHTML = `
        <div class="eyebrow mb-3">
          Outfit Swap · Everyone gets Sleazed
        </div>

        <p class="text-xs text-[var(--muted)] leading-relaxed">
          Transform every visible person with Santa Sleaze
          velvet outfits, hats and luxury jewelry.
          Preserve their identities, poses and original
          background.
        </p>
      `;
    } else {
      description.innerHTML = `
        <div class="eyebrow mb-3">
          Sleaze PFP · Luxury Profile Picture
        </div>

        <p class="text-xs text-[var(--muted)] leading-relaxed">
          Create a premium square Santa Sleaze portrait.
          Keep your identity and original background.
          One Cuban link chain, with adaptive grillz,
          watches and rings when appropriate.
        </p>
      `;
    }
  }

  const generateButton = el("generateBtn");

  if (generateButton) {
    generateButton.textContent =
      mode === "pfp"
        ? "💎 Generate Sleaze PFP"
        : "🎁 Sleaze Everyone";
  }

  if (GENS.sourceImg) {
    showCanvas();
    renderPreview();

    GENS.hasResult = false;
    GENS.resultURL = null;

    el("resultActions").classList.add("hidden");
  }
}

/* ---------------- Image generation ---------------- */

async function generateImage() {
  if (!GENS.sourceFile) {
    throw new Error("Upload a photo first.");
  }

  const token = getTurnstileToken();

  if (!token) {
    throw new Error(
      "Complete the security verification first."
    );
  }

  const form = new FormData();

  form.append(
    "image",
    GENS.sourceFile,
    GENS.sourceFile.name || "photo.jpg"
  );

  form.append("mode", GENS.mode);
  form.append("turnstileToken", token);

  let response;

  try {
    response = await fetch(
      `${WORKER_URL}/generate`,
      {
        method: "POST",
        body: form
      }
    );
  } catch {
    throw new Error(
      "Unable to connect to the generator. Try again."
    );
  } finally {
    // Turnstile tokens are single-use.
    // A new verification is required for each request.
    resetTurnstile();
  }

  let data;

  try {
    data = await response.json();
  } catch {
    throw new Error(
      `Invalid server response (HTTP ${response.status}).`
    );
  }

  if (response.status === 429) {
    throw new Error(
      "You've reached your 7 daily generations. " +
      "Come back tomorrow! 🎅"
    );
  }

  if (!response.ok) {
    const messages = {
      "Security verification failed":
        "Security verification failed. Please try again.",
      "Image generation failed":
        "The AI could not generate your image.",
      "Invalid image format":
        "Invalid image. Try another JPG, PNG or WebP."
    };

    const message =
      messages[data.error] ||
      data.error ||
      `Generation failed (HTTP ${response.status}).`;

    throw new Error(message);
  }

  if (!data.success || !data.image) {
    throw new Error("The server returned no image.");
  }

  return {
    image: data.image,
    remaining: data.remaining
  };
}

/* ---------------- Gift animation ---------------- */

function resetGift() {
  if (!window.gsap) return;

  gsap.killTweensOf("#giftBox");

  gsap.set("#giftLid", {
    y: 0,
    rotation: 0,
    opacity: 1
  });

  gsap.set("#giftBody", {
    scale: 1,
    opacity: 1
  });

  gsap.set("#giftBox", {
    rotation: 0,
    scale: 1,
    x: 0
  });
}

function burstSparks(host) {
  const colors = [
    "#ff2d55",
    "#2bff88",
    "#ffd76a",
    "#ffffff",
    "#bfe9ff"
  ];

  const cx = host.clientWidth / 2;
  const cy = host.clientHeight / 2;

  for (let i = 0; i < 40; i++) {
    const spark = document.createElement("span");

    spark.className = "spark";
    spark.style.background = colors[i % colors.length];
    spark.style.left = cx + "px";
    spark.style.top = cy + "px";
    spark.style.boxShadow =
      `0 0 10px ${spark.style.background}`;

    host.appendChild(spark);

    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * 220 + 60;

    if (window.gsap) {
      gsap.to(spark, {
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance - 40,
        opacity: 0,
        scale: Math.random() * 1.4 + 0.4,
        duration: Math.random() * 0.7 + 0.6,
        ease: "power2.out",
        onComplete: () => spark.remove()
      });
    } else {
      setTimeout(() => spark.remove(), 800);
    }
  }
}

function setBusy(busy) {
  GENS.busy = busy;

  const button = el("generateBtn");
  const regenerate = el("regenBtn");

  if (button) {
    button.disabled = busy;
    button.style.opacity = busy ? "0.6" : "1";
  }

  if (regenerate) {
    regenerate.disabled = busy;
  }

  document.querySelectorAll("[data-mode]").forEach(button => {
    button.disabled = busy;
  });
}

async function runGenerate() {
  if (GENS.busy) return;

  if (!GENS.sourceImg || !GENS.sourceFile) {
    toast("Upload a photo first 🎅");
    return;
  }

  if (!getTurnstileToken()) {
    toast("Complete the security verification first 🔒");
    return;
  }

  setBusy(true);

  const overlay = el("giftOverlay");
  const label = el("giftLabel");

  overlay.classList.remove("hidden");
  resetGift();

  label.textContent =
    GENS.mode === "pfp"
      ? "Creating your Sleaze PFP…"
      : "Sleazing everyone…";

  status("AI is generating your image. Please wait…");

  if (window.gsap) {
    gsap.to("#giftBox", {
      rotation: 3,
      duration: 0.5,
      yoyo: true,
      repeat: -1,
      ease: "sine.inOut"
    });
  }

  try {
    const result = await generateImage();

    if (window.gsap) {
      gsap.killTweensOf("#giftBox");
    }

    burstSparks(overlay);

    if (window.gsap) {
      await gsap.timeline()
        .to("#giftLid", {
          y: -90,
          rotation: -22,
          opacity: 0,
          duration: 0.45,
          ease: "back.in(2)"
        })
        .to("#giftBody", {
          scale: 0.4,
          opacity: 0,
          duration: 0.4,
          ease: "power2.in"
        }, "<")
        .then();
    } else {
      await wait(400);
    }

    showResult(result.image);

    GENS.resultURL = result.image;
    GENS.hasResult = true;

    overlay.classList.add("hidden");
    el("resultActions").classList.remove("hidden");

    const remaining = Number.isInteger(result.remaining)
      ? result.remaining
      : null;

    status(
      remaining === null
        ? "Your Santa Sleaze image is ready!"
        : `Image ready! ${remaining} generations remaining today.`
    );

    el("stageWrap").scrollIntoView({
      behavior: "smooth",
      block: "center"
    });

    toast("🎉 Unwrapped! Your Santa Sleaze is ready.");

  } catch (error) {
    if (window.gsap) {
      gsap.killTweensOf("#giftBox");
    }

    overlay.classList.add("hidden");

    const message =
      error?.message || "Generation failed.";

    status(message);
    toast("⚠️ " + message);

  } finally {
    setBusy(false);
  }
}

/* ---------------- Result actions ---------------- */

function currentResultURL() {
  return GENS.resultURL;
}

function downloadResult() {
  if (!GENS.hasResult) return;

  const link = document.createElement("a");

  link.href = currentResultURL();
  link.download =
    GENS.mode === "pfp"
      ? "santa-sleaze-pfp.png"
      : "santa-sleaze-outfit-swap.png";

  document.body.appendChild(link);
  link.click();
  link.remove();
}

async function shareResult() {
  if (!GENS.hasResult) return;

  try {
    const response = await fetch(currentResultURL());
    const blob = await response.blob();

    const file = new File(
      [blob],
      "santa-sleaze.png",
      { type: "image/png" }
    );

    if (
      navigator.canShare &&
      navigator.canShare({ files: [file] })
    ) {
      await navigator.share({
        files: [file],
        title: "Santa Sleaze",
        text: "I just got Santa Sleazed 🎅 $SS"
      });

      return;
    }
  } catch {
    // Fallback to download.
  }

  toast("Sharing unavailable — downloading instead.");
  downloadResult();
}

/* ---------------- Initialize ---------------- */

document.addEventListener("DOMContentLoaded", () => {
  GENS.canvas = el("genCanvas");

  if (!GENS.canvas) return;

  GENS.canvas.width = GENS.size;
  GENS.canvas.height = GENS.size;
  GENS.ctx = GENS.canvas.getContext("2d");

  const drop = el("dropZone");
  const input = el("fileInput");

  if (drop && input) {
    drop.addEventListener("click", () => {
      if (!GENS.busy) input.click();
    });

    input.addEventListener("change", event => {
      handleFile(event.target.files[0]);
      input.value = "";
    });

    ["dragenter", "dragover"].forEach(type => {
      drop.addEventListener(type, event => {
        event.preventDefault();
        if (!GENS.busy) drop.classList.add("drag");
      });
    });

    ["dragleave", "drop"].forEach(type => {
      drop.addEventListener(type, event => {
        event.preventDefault();
        drop.classList.remove("drag");
      });
    });

    drop.addEventListener("drop", event => {
      handleFile(event.dataTransfer.files[0]);
    });
  }

  document.querySelectorAll("[data-mode]").forEach(button => {
    button.addEventListener("click", () => {
      setMode(button.dataset.mode);
    });
  });

  el("generateBtn")?.addEventListener(
    "click",
    runGenerate
  );

  el("downloadBtn")?.addEventListener(
    "click",
    downloadResult
  );

  el("shareBtn")?.addEventListener(
    "click",
    shareResult
  );

  el("regenBtn")?.addEventListener(
    "click",
    runGenerate
  );

  setMode("swap");

  // The Turnstile script is loaded with defer.
  // Wait briefly until its API becomes available.
  if (window.turnstile) {
    initTurnstile();
  } else {
    let attempts = 0;

    const check = setInterval(() => {
      attempts++;

      if (window.turnstile) {
        clearInterval(check);
        initTurnstile();
      } else if (attempts >= 50) {
        clearInterval(check);
        status(
          "Security verification could not load. Refresh the page."
        );
      }
    }, 200);
  }
});
