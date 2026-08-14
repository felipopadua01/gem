/* ============================================================
   SANTA SLEAZE — shared nav + footer (injected, no server needed)
   ============================================================ */

const NAV_LINKS = [
  { href: 'index.html',       label: 'Home' },
  { href: 'generator.html',   label: 'Generator' },
  { href: 'about.html',       label: 'About' },
  { href: 'tokenomics.html',  label: 'Tokenomics' },
  { href: 'how-to-buy.html',  label: 'How to Buy' },
  { href: 'roadmap.html',     label: 'Roadmap' },
  { href: 'gallery.html',     label: 'Gallery' },
];

const SOCIALS = `
<a href="https://x.com/santasleaze" target="_blank" rel="noopener noreferrer" aria-label="X / Twitter"
<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18.9 2H22l-7.5 8.6L23 22h-6.8l-5-6.5L5.4 22H2.3l8-9.2L1.6 2h6.9l4.5 6 5.9-6Zm-1.2 18h1.7L7.4 3.8H5.6L17.7 20Z"/></svg>
  </a>
  <a href="#" aria-label="Telegram" class="hover:text-white text-[var(--muted)] transition">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M21.9 4.3 18.7 19c-.2 1-.9 1.3-1.8.8l-4.9-3.6-2.4 2.3c-.3.3-.5.5-1 .5l.3-4.9 9-8.1c.4-.3-.1-.5-.6-.2L6.4 13.1l-4.8-1.5c-1-.3-1-1 .2-1.5L20.6 2.6c.9-.3 1.6.2 1.3 1.7Z"/></svg>
  </a>
  <a href="#" aria-label="DexScreener" class="hover:text-white text-[var(--muted)] transition">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 17l5-6 4 4 5-7 4 5" stroke-linecap="round" stroke-linejoin="round"/></svg>
  </a>`;

function currentPage() {
  const path = location.pathname.split('/').pop();
  return path === '' ? 'index.html' : path;
}

function renderNav() {
  const here = currentPage();
  const links = NAV_LINKS.map(l =>
    `<a href="${l.href}" class="nav-link ${l.href === here ? 'active' : ''}">${l.label}</a>`
  ).join('');

  const mobileLinks = NAV_LINKS.map(l =>
    `<a href="${l.href}" class="block py-3 nav-link ${l.href === here ? 'active' : ''}">${l.label}</a>`
  ).join('');

  const nav = document.createElement('header');
  nav.className = 'nav';
  nav.innerHTML = `
    <div class="lights-string"></div>
    <div class="container-x flex items-center justify-between py-4">
      <a href="index.html" class="flex items-center gap-2 group">
        <span class="text-2xl">🎅</span>
        <span class="font-glitch text-xl tracking-tight">
          <span class="neon-red">SANTA</span> <span class="neon-green">SLEAZE</span>
        </span>
      </a>
      <nav class="hidden lg:flex items-center gap-7">${links}</nav>
      <div class="hidden lg:flex items-center gap-4">
        <div class="flex items-center gap-3">${SOCIALS}</div>
        <a href="how-to-buy.html" class="btn btn-green text-sm">Buy $SS</a>
      </div>
      <button id="burger" class="lg:hidden text-2xl" aria-label="Menu">☰</button>
    </div>
    <div id="mobileMenu" class="lg:hidden hidden container-x pb-5 border-b border-[var(--line)]">
      ${mobileLinks}
      <div class="flex items-center gap-4 mt-4">${SOCIALS}
        <a href="how-to-buy.html" class="btn btn-green text-sm ml-auto">Buy $SS</a>
      </div>
    </div>`;
  document.body.prepend(nav);

  // scroll style
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 24);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // mobile toggle
  const burger = nav.querySelector('#burger');
  const menu = nav.querySelector('#mobileMenu');
  burger.addEventListener('click', () => menu.classList.toggle('hidden'));
}

function renderFooter() {
  const links = NAV_LINKS.map(l => `<a href="${l.href}" class="nav-link">${l.label}</a>`).join('');
  const footer = document.createElement('footer');
  footer.className = 'mt-10 border-t border-[var(--line)] bg-[rgba(7,7,12,.6)]';
  footer.innerHTML = `
    <div class="divider-lights"></div>
    <div class="container-x py-12 grid gap-10 md:grid-cols-3">
      <div>
        <div class="font-glitch text-2xl mb-3"><span class="neon-red">SANTA</span> <span class="neon-green">SLEAZE</span></div>
        <p class="text-[var(--muted)] text-sm max-w-xs">The sleaziest Santa on the chain. Upload your face, unwrap your meme, and spread festive degeneracy. 🎁</p>
        <div class="flex items-center gap-4 mt-5">${SOCIALS}</div>
      </div>
      <div>
        <div class="eyebrow mb-4">Explore</div>
        <div class="grid grid-cols-2 gap-2 text-sm">${links}</div>
      </div>
      <div>
        <div class="eyebrow mb-4">Get $SS</div>
        <p class="text-[var(--muted)] text-sm mb-4">Not financial advice. This is a meme. Have fun, stay festive, ape responsibly.</p>
        <a href="how-to-buy.html" class="btn btn-red text-sm">🎄 How to Buy</a>
      </div>
    </div>
    <div class="container-x py-6 border-t border-[var(--line)] flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-[var(--muted)]">
      <span>© ${new Date().getFullYear()} Santa Sleaze. All wrapping rights reserved.</span>
      <span>Made with 🎅 + ❄️ — a community meme experiment.</span>
    </div>`;
  document.body.appendChild(footer);
}

document.addEventListener('DOMContentLoaded', () => {
  renderNav();
  renderFooter();
});
