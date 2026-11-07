
/* ============================================================
   SANTA SLEAZE — shared nav + footer (injected, no server needed)
   ============================================================ */

const DEX_URL = 'https://dexscreener.com/solana/';

const NAV_LINKS = [
  { href: '/',              label: 'Home' },
  { href: '/generator/',    label: 'Generator' },
  { href: '/about/',        label: 'About' },
  { href: '/tokenomics/',   label: 'Tokenomics' },
  { href: '/how-to-buy/',   label: 'How to Buy' },
  { href: '/roadmap/',      label: 'Roadmap' },
  { href: '/gallery/',      label: 'Gallery' },
];

const SOCIALS = `
<a href="https://x.com/santasleaze" aria-label="X / Twitter" class="hover:text-white text-[var(--muted)] transition">
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.9 2H22l-7.5 8.6L23 22h-6.8l-5-6.5L5.4 22H2.3l8-9.2L1.6 2h6.9l4.5 6 5.9-6Zm-1.2 18h1.7L7.4 3.8H5.6L17.7 20Z"/>
  </svg>
</a>


/* ============================================================
   PAGE NORMALIZER
   ============================================================ */

function normalizePath(path) {

  // Remove query/hash
  path = path.split('?')[0].split('#')[0];

  // Convert index.html to /
  if (path === '/index.html') {
    return '/';
  }

  // Remove .html if it still exists
  path = path.replace(/\.html$/, '');

  // Always start with /
  if (!path.startsWith('/')) {
    path = '/' + path;
  }

  // Add trailing slash except for root
  if (path !== '/' && !path.endsWith('/')) {
    path += '/';
  }

  return path.toLowerCase();
}


/* ============================================================
   CURRENT PAGE
   ============================================================ */

function currentPage() {
  return normalizePath(location.pathname);
}


/* ============================================================
   CHECK ACTIVE LINK
   ============================================================ */

function isActivePage(href) {

  const current = currentPage();
  const target = normalizePath(href);

  return current === target;
}


/* ============================================================
   NAVIGATION
   ============================================================ */

function renderNav() {

  const links = NAV_LINKS.map(l => {

    const active = isActivePage(l.href);

    return `
      <a
        href="${l.href}"
        class="nav-link ${active ? 'active' : ''}"
      >
        ${l.label}
      </a>
    `;

  }).join('');


  const mobileLinks = NAV_LINKS.map(l => {

    const active = isActivePage(l.href);

    return `
      <a
        href="${l.href}"
        class="block py-3 nav-link ${active ? 'active' : ''}"
      >
        ${l.label}
      </a>
    `;

  }).join('');


  const nav = document.createElement('header');

  nav.className = 'nav';

  nav.innerHTML = `
    <div class="lights-string"></div>

    <div class="container-x flex items-center justify-between py-4">

      <a href="/" class="flex items-center gap-2 group">

        <span class="text-2xl">🎅</span>

        <span class="font-glitch text-xl tracking-tight">
          <span class="neon-red">SANTA</span>
          <span class="neon-green">SLEAZE</span>
        </span>

      </a>


      <nav class="hidden lg:flex items-center gap-7">
        ${links}
      </nav>


      <div class="hidden lg:flex items-center gap-4">

        <div class="flex items-center gap-3">
          ${SOCIALS}
        </div>

        <a
          href="${DEX_URL}"
          target="_blank"
          rel="noopener noreferrer"
          class="btn btn-green text-sm"
        >
          Buy $SS
        </a>

      </div>


      <button
        id="burger"
        class="lg:hidden text-2xl"
        aria-label="Menu"
      >
        ☰
      </button>

    </div>


    <div
      id="mobileMenu"
      class="lg:hidden hidden container-x pb-5 border-b border-[var(--line)]"
    >

      ${mobileLinks}

      <div class="flex items-center gap-4 mt-4">

        ${SOCIALS}

        <a
          href="${DEX_URL}"
          target="_blank"
          rel="noopener noreferrer"
          class="btn btn-green text-sm ml-auto"
        >
          Buy $SS
        </a>

      </div>

    </div>
  `;


  document.body.prepend(nav);


  /* ==========================================================
     SCROLL STYLE
     ========================================================== */

  const onScroll = () => {

    nav.classList.toggle(
      'scrolled',
      window.scrollY > 24
    );

  };


  window.addEventListener(
    'scroll',
    onScroll,
    { passive: true }
  );


  onScroll();


  /* ==========================================================
     MOBILE TOGGLE
     ========================================================== */

  const burger = nav.querySelector('#burger');
  const menu = nav.querySelector('#mobileMenu');


  burger.addEventListener('click', () => {

    menu.classList.toggle('hidden');

  });

}


/* ============================================================
   FOOTER
   ============================================================ */

function renderFooter() {

  const links = NAV_LINKS.map(l => {

    const active = isActivePage(l.href);

    return `
      <a
        href="${l.href}"
        class="nav-link ${active ? 'active' : ''}"
      >
        ${l.label}
      </a>
    `;

  }).join('');


  const footer = document.createElement('footer');

  footer.className =
    'mt-10 border-t border-[var(--line)] bg-[rgba(7,7,12,.6)]';


  footer.innerHTML = `

    <div class="divider-lights"></div>

    <div class="container-x py-12 grid gap-10 md:grid-cols-3">


      <div>

        <div class="font-glitch text-2xl mb-3">
          <span class="neon-red">SANTA</span>
          <span class="neon-green">SLEAZE</span>
        </div>

        <p class="text-[var(--muted)] text-sm max-w-xs">
          The sleaziest Santa on the chain.
          Upload your face, unwrap your meme,
          and spread festive degeneracy. 🎁
        </p>

        <div class="flex items-center gap-4 mt-5">
          ${SOCIALS}
        </div>

      </div>


      <div>

        <div class="eyebrow mb-4">
          Explore
        </div>

        <div class="grid grid-cols-2 gap-2 text-sm">
          ${links}
        </div>

      </div>


      <div>

        <div class="eyebrow mb-4">
          Get $SS
        </div>

        <p class="text-[var(--muted)] text-sm mb-4">
          Not financial advice. This is a meme.
          Have fun, stay festive, ape responsibly.
        </p>

        <a
          href="/how-to-buy/"
          class="btn btn-red text-sm"
        >
          🎄 How to Buy
        </a>

      </div>

    </div>


    <div
      class="container-x py-6 border-t border-[var(--line)]
      flex flex-col md:flex-row items-center
      justify-between gap-3 text-xs text-[var(--muted)]"
    >

      <span>
        © ${new Date().getFullYear()} Santa Sleaze.
        All wrapping rights reserved.
      </span>

      <span>
        Made with 🎅 + ❄️ — a community meme experiment.
      </span>

    </div>

  `;


  document.body.appendChild(footer);

}


/* ============================================================
   INITIALIZE
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  renderNav();
  renderFooter();

});
