const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Nav (mobile menu) ---------- */
const nav = document.getElementById('nav');
const toggle = document.getElementById('navToggle');

toggle.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  toggle.setAttribute('aria-expanded', open);
  toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
});
document.querySelectorAll('#navLinks a').forEach(a =>
  a.addEventListener('click', () => {
    nav.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  })
);

// hairline border once the page scrolls
const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 8);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// sliding highlight: follows hover, rests on the section you're in
const pill = document.querySelector('.nav-pill');
const navItems = [...document.querySelectorAll('.nav-links > a:not(.btn)')];
let activeLink = null;

function movePill(link) {
  if (!pill) return;
  if (!link) { pill.style.opacity = '0'; return; }
  pill.style.width = `${link.offsetWidth}px`;
  pill.style.transform = `translateX(${link.offsetLeft - 4}px)`;
  pill.style.opacity = '1';
}
navItems.forEach(a => a.addEventListener('mouseenter', () => movePill(a)));
document.querySelector('.nav-links').addEventListener('mouseleave', () => movePill(activeLink));

const sectionIO = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const link = e.target.id ? navItems.find(a => a.getAttribute('href') === `#${e.target.id}`) : null;
    navItems.forEach(a => a.classList.toggle('active', a === link));
    activeLink = link || null;
    movePill(activeLink);
  });
}, { rootMargin: '-45% 0px -50% 0px' });
document.querySelectorAll('main > section').forEach(el => sectionIO.observe(el));
window.addEventListener('resize', () => movePill(activeLink));

/* ---------- Count-up numbers ---------- */
function countUp(el) {
  if (el.dataset.counted) return;
  el.dataset.counted = '1';
  const to = parseFloat(el.dataset.to);
  const dec = parseInt(el.dataset.dec || '0', 10);
  if (reduce) { el.textContent = to.toFixed(dec); return; }
  const start = performance.now();
  const dur = 2200;
  const tick = now => {
    const t = Math.min((now - start) / dur, 1);
    el.textContent = (to * (1 - Math.pow(1 - t, 4))).toFixed(dec);
    if (t < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

/* ---------- Reveal on scroll ---------- */
const targets = document.querySelectorAll('.reveal, .lines, .rule:not(.reveal .rule)');

const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('in');
    e.target.querySelectorAll('.count').forEach(countUp);
    io.unobserve(e.target);
  });
}, { threshold: 0.2, rootMargin: '0px 0px -8% 0px' });

targets.forEach(el => {
  // stagger items that sit side by side (rows, steps, quotes, stats)
  const sibs = [...el.parentElement.children].filter(c => c.classList.contains('reveal'));
  const idx = sibs.indexOf(el);
  if (idx > 0) el.style.transitionDelay = `${Math.min(idx, 4) * 120}ms`;
  io.observe(el);
});

/* ---------- Hero result card: count-up + rotating slides ---------- */
function runCount(el) {
  const to = parseFloat(el.dataset.to);
  const dec = parseInt(el.dataset.dec || '0', 10);
  if (reduce) { el.textContent = to.toFixed(dec); return; }
  const start = performance.now();
  const dur = 2000;
  const tick = now => {
    const t = Math.min((now - start) / dur, 1);
    el.textContent = (to * (1 - Math.pow(1 - t, 4))).toFixed(dec);
    if (t < 1) requestAnimationFrame(tick);
  };
  el.textContent = (0).toFixed(dec);
  requestAnimationFrame(tick);
}

const card = document.querySelector('.hero-card');
const slides = card ? [...card.querySelectorAll('[data-slide]')] : [];
const dots = card ? [...card.querySelectorAll('.hc-dots button')] : [];
let current = 0, timer = null;

function showSlide(i) {
  current = (i + slides.length) % slides.length;
  slides.forEach((s, n) => s.classList.toggle('active', n === current));
  dots.forEach((d, n) => { d.classList.toggle('active', n === current); d.setAttribute('aria-selected', n === current); });
  const num = slides[current].querySelector('.hc-count');
  if (num) runCount(num);
}
function autoplay() {
  clearInterval(timer);
  if (!reduce && slides.length > 1) timer = setInterval(() => showSlide(current + 1), 6000);
}
dots.forEach((d, n) => d.addEventListener('click', () => { showSlide(n); autoplay(); }));
if (card) {
  card.addEventListener('mouseenter', () => clearInterval(timer));
  card.addEventListener('mouseleave', autoplay);
}

/* hero plays on load */
window.addEventListener('load', () => {
  const hero = document.querySelector('.hero');
  const order = [hero.querySelector('.lines'), ...hero.querySelectorAll('.reveal')];
  order.forEach((el, i) => setTimeout(() => {
    el.classList.add('in');
    if (el === card) { showSlide(0); autoplay(); }
  }, 100 + i * 160));
});


