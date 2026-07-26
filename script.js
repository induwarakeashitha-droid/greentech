/* ============================================
   GREEN TECH PRESENTATION — SCRIPT
   Scroll reveals, progress, particles, nav
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ---- Floating Particles (Hero Section) ----
  const heroParticles = document.getElementById('heroParticles');
  if (heroParticles) {
    for (let i = 0; i < 8; i++) {
      const p = document.createElement('span');
      p.classList.add('particle');
      const size = Math.random() * 28 + 10;
      p.style.width = size + 'px';
      p.style.height = size + 'px';
      p.style.left = Math.random() * 100 + '%';
      p.style.top = Math.random() * 100 + '%';
      p.style.animationDelay = (Math.random() * 6) + 's';
      p.style.animationDuration = (Math.random() * 6 + 6) + 's';
      heroParticles.appendChild(p);
    }
  }

  // ---- Scroll Reveal (Intersection Observer) ----
  const reveals = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  reveals.forEach(el => revealObserver.observe(el));

  // ---- Progress Bar ----
  const progressBar = document.getElementById('progressBar');
  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    if (progressBar) progressBar.style.width = pct + '%';
  }, { passive: true });

  // ---- Dot Nav ----
  const dots = document.querySelectorAll('.dot-nav .dot');
  const sections = [];
  dots.forEach(dot => {
    const id = dot.getAttribute('data-target');
    const sec = document.getElementById(id);
    if (sec) sections.push({ el: sec, dot: dot });
    dot.addEventListener('click', () => {
      if (sec) sec.scrollIntoView({ behavior: 'smooth' });
    });
  });

  const dotObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        dots.forEach(d => d.classList.remove('active'));
        const match = sections.find(s => s.el === entry.target);
        if (match) match.dot.classList.add('active');
      }
    });
  }, { threshold: 0.35 });

  sections.forEach(s => dotObserver.observe(s.el));

});
