/* Portfolio interactions — Mubashira Zainab */

// ===== NAV =====
const nav = document.getElementById('nav');
const navMenu = document.getElementById('navMenu');
const navToggle = document.getElementById('navToggle');
const toTop = document.getElementById('toTop');

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
  toTop.classList.toggle('visible', window.scrollY > 500);
}, { passive: true });

navToggle.addEventListener('click', () => {
  navToggle.classList.toggle('open');
  navMenu.classList.toggle('open');
});
navMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  navToggle.classList.remove('open');
  navMenu.classList.remove('open');
}));
toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

// Active link on scroll
const links = [...document.querySelectorAll('.nav-menu a.link')];
const sections = links.map(l => document.querySelector(l.getAttribute('href'))).filter(Boolean);
const spy = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + e.target.id));
    }
  });
}, { rootMargin: '-45% 0px -50% 0px' });
sections.forEach(s => spy.observe(s));

// ===== Reveal on scroll =====
const reveals = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in-view'); io.unobserve(e.target); }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });
  reveals.forEach(el => io.observe(el));
} else {
  reveals.forEach(el => el.classList.add('in-view'));
}

// ===== Lightbox =====
const lb = document.getElementById('lightbox');
const lbImg = document.getElementById('lightboxImg');
const lbCap = document.getElementById('lightboxCap');
function openLightbox(src, cap) {
  lbImg.src = src; lbImg.alt = cap || '';
  lbCap.textContent = cap || '';
  lb.classList.add('active');
  document.body.style.overflow = 'hidden';
}
function closeLightbox() {
  lb.classList.remove('active');
  document.body.style.overflow = '';
  setTimeout(() => { if (!lb.classList.contains('active')) lbImg.removeAttribute('src'); }, 300);
}
document.querySelectorAll('[data-lightbox]').forEach(el => {
  el.addEventListener('click', () => openLightbox(el.dataset.lightbox, el.dataset.caption));
});
document.getElementById('lightboxClose').addEventListener('click', closeLightbox);
lb.addEventListener('click', e => { if (e.target === lb) closeLightbox(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });

// ===== DBMS video: graceful fallback if the file is missing =====
const vFrame = document.getElementById('videoFrame');
const vid = document.getElementById('dbmsVideo');
if (vid) {
  const sources = vid.querySelectorAll('source');
  // Only flag as missing when the LAST source also fails (so the WebM backup can take over).
  sources[sources.length - 1].addEventListener('error', () => vFrame.classList.add('no-video'));
  vid.addEventListener('error', () => vFrame.classList.add('no-video'));
}

// ===== Contact form =====
// Sends through FormSubmit (delivers to the inbox below). The first ever
// submission triggers an activation email from FormSubmit that must be confirmed once.
const TO_EMAIL = 'mubashirazainab2418@gmail.com';
const form = document.getElementById('contactForm');
const status = document.getElementById('formStatus');
const btn = document.getElementById('formBtn');

function setStatus(msg, kind) { status.textContent = msg; status.className = 'form-status ' + (kind || ''); }

form.addEventListener('submit', async e => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(form).entries());
  if (data._honey) return;                       // bot trap
  if (!data.name.trim() || !data.email.trim() || !data.message.trim()) {
    setStatus('Please fill in your name, email and message.', 'err'); return;
  }
  if (!/^\S+@\S+\.\S+$/.test(data.email)) { setStatus('Please enter a valid email address.', 'err'); return; }

  const subject = (data.subject || '').trim() || 'Portfolio enquiry';
  btn.disabled = true; setStatus('Sending…');
  try {
    const res = await fetch('https://formsubmit.co/ajax/' + TO_EMAIL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        name: data.name, email: data.email, message: data.message,
        _subject: 'Portfolio: ' + subject, _replyto: data.email, _template: 'table', _captcha: 'false'
      })
    });
    const out = await res.json().catch(() => ({}));
    if (res.ok && String(out.success) !== 'false') {
      form.reset();
      setStatus('Thank you — your message has been sent. I will reply soon.', 'ok');
    } else { throw new Error('send failed'); }
  } catch (err) {
    // Fallback: open the visitor's email app with the message pre-filled
    const body = `Hi Mubashira,\n\nMy name is ${data.name} (${data.email}).\n\n${data.message}`;
    window.location.href = `mailto:${TO_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setStatus('Could not send directly — opening your email app instead.', 'err');
  } finally { btn.disabled = false; }
});
