/* âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
   GuruGlass â Premium Public JS
   Integrations: Lenis Â· GSAP Â· AOS Â· Custom Cursor Â· Nav Â· Products Â· Forms
   âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ */

/* âââ Lenis Smooth Scroll âââââââââââââââââââââââââââââââââââââââââââââââââââ */
let lenis;

function initLenis() {
  if (typeof Lenis === 'undefined') return;
  lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    smoothTouch: false,
    touchMultiplier: 2,
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  // Hook GSAP ScrollTrigger if available
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);
  }
}

/* âââ Custom Cursor âââââââââââââââââââââââââââââââââââââââââââââââââââââââââ */
function initCursor() {
  const dot     = document.getElementById('cursorDot');
  const outline = document.getElementById('cursorOutline');
  if (!dot || !outline) return;

  let mouseX = 0, mouseY = 0;
  let outX = 0, outY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%,-50%)`;
  });

  // Smooth outline follow
  function animateOutline() {
    outX += (mouseX - outX) * 0.14;
    outY += (mouseY - outY) * 0.14;
    outline.style.transform = `translate(${outX}px, ${outY}px) translate(-50%,-50%)`;
    requestAnimationFrame(animateOutline);
  }
  animateOutline();

  // Hover states
  const hoverTargets = 'a, button, [data-tilt], .product-card, .btn, .nav-toggle, input, textarea, .swiper-button-next, .swiper-button-prev';

  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(hoverTargets)) {
      dot.classList.add('hovering');
      outline.classList.add('hovering');
    }
  });

  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(hoverTargets)) {
      dot.classList.remove('hovering');
      outline.classList.remove('hovering');
    }
  });

  document.addEventListener('mousedown', () => dot.classList.add('clicking'));
  document.addEventListener('mouseup', () => dot.classList.remove('clicking'));
}

/* âââ Nav Scroll Behavior âââââââââââââââââââââââââââââââââââââââââââââââââââ */
function initNav() {
  const nav    = document.querySelector('.nav');
  const toggle = document.querySelector('.nav-toggle');
  const links  = document.querySelector('.nav-links');

  if (nav) {
    const onScroll = () => {
      nav.classList.toggle('scrolled', window.scrollY > 40);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  if (toggle && links) {
    toggle.addEventListener('click', () => links.classList.toggle('open'));
    document.addEventListener('click', (e) => {
      if (!toggle.contains(e.target) && !links.contains(e.target)) {
        links.classList.remove('open');
      }
    });
  }

  // Active nav link
  const path = window.location.pathname;
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === path || (path === '/' && href === '/') || (path.startsWith(href) && href !== '/')) {
      a.classList.add('active');
    }
  });
}

/* âââ AOS Init ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ */
function initAOS() {
  if (typeof AOS === 'undefined') return;
  AOS.init({
    duration: 800,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    once: true,
    offset: 80,
  });
}

/* âââ Toast âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ */
function showToast(message, type = 'success') {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  const icon = type === 'success' ? 'â¦' : 'â';
  toast.innerHTML = `<span style="color:${type === 'success' ? 'var(--teal)' : '#e74c3c'}">${icon}</span><span>${message}</span>`;
  toast.className = `toast ${type}`;
  requestAnimationFrame(() => toast.classList.add('show'));
  setTimeout(() => toast.classList.remove('show'), 3800);
}

/* âââ Escape helper âââââââââââââââââââââââââââââââââââââââââââââââââââââââââ */
function escHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* âââ YouTube ID helper âââââââââââââââââââââââââââââââââââââââââââââââââââââ */
function getYouTubeId(url) {
  if (!url) return null;
  const match = url.match(/(?:v=|youtu\.be\/|embed\/)([\w-]{11})/);
  return match ? match[1] : null;
}

/* âââ Product Card Renderer âââââââââââââââââââââââââââââââââââââââââââââââââ */
function renderProductCard(p, index = 0) {
  const ytId = getYouTubeId(p.youtube_url);
  const delay = (index % 4) * 100;
  let mediaHtml = '';

  if (ytId) {
    mediaHtml = `
      <div class="product-media">
        <div class="video-wrapper">
          <iframe src="https://www.youtube.com/embed/${ytId}?rel=0&modestbranding=1&color=white"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowfullscreen loading="lazy"></iframe>
        </div>
        <span class="media-badge">â¶ Video</span>
        <a href="https://www.youtube.com/watch?v=${ytId}" class="product-media-overlay glightbox" data-gallery="products" data-type="video" data-title="${escHtml(p.name)}">
          <div class="product-media-overlay-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style="color:#0a0600"><path d="M8 5v14l11-7z"/></svg>
          </div>
        </a>
      </div>`;
  } else if (p.image_url) {
    mediaHtml = `
      <div class="product-media">
        <img src="${escHtml(p.image_url)}" alt="${escHtml(p.name)}" loading="lazy"
             onerror="this.src='https://images.unsplash.com/photo-1599714685195-ce0c7fe72ab6?w=800&q=80'">
        <span class="media-badge">â¦ Original</span>
        <a href="${escHtml(p.image_url)}" class="product-media-overlay glightbox" data-gallery="products" data-type="image" data-title="${escHtml(p.name)}">
          <div class="product-media-overlay-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0a0600" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35M11 8v6M8 11h6"/></svg>
          </div>
        </a>
      </div>`;
  } else {
    mediaHtml = `
      <div class="product-media" style="background:linear-gradient(135deg,#0a0a1a,rgba(107,33,168,0.2))">
        <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:3.5rem;opacity:0.2">ð</div>
        <span class="media-badge">â¦ Piece</span>
      </div>`;
  }

  const priceHtml = p.price
    ? `<span class="product-price">$${Number(p.price).toLocaleString()}</span>`
    : `<span class="product-price inquire">Inquire for pricing</span>`;

  return `
    <div class="product-card" data-tilt data-tilt-max="6" data-tilt-speed="400" data-tilt-glare data-tilt-max-glare="0.1" data-aos="fade-up" data-aos-delay="${delay}">
      ${mediaHtml}
      <div class="product-body">
        <h3 class="product-name">${escHtml(p.name)}</h3>
        <p class="product-description">${escHtml(p.description || '')}</p>
        <div class="product-footer">
          ${priceHtml}
          <a href="/contact?item=${encodeURIComponent(p.name)}" class="btn btn-teal product-cta">Inquire</a>
        </div>
      </div>
    </div>`;
}

/* âââ Product Loader ââââââââââââââââââââââââââââââââââââââââââââââââââââââââ */
async function loadProducts(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = `
    <div class="loading-grid">
      ${Array(4).fill(0).map(() => `
        <div class="skeleton-card">
          <div class="skeleton-media"></div>
          <div class="skeleton-body">
            <div class="skeleton-line"></div>
            <div class="skeleton-line short"></div>
            <div class="skeleton-line shorter"></div>
          </div>
        </div>`).join('')}
    </div>`;

  try {
    const res = await fetch('/api/products');
    const products = await res.json();

    if (!products.length) {
      container.innerHTML = `
        <div style="text-align:center;padding:80px 24px;color:var(--text-muted)">
          <div style="font-size:4rem;margin-bottom:20px;opacity:0.4">ð</div>
          <p style="font-family:'Cinzel',serif;letter-spacing:0.1em">New pieces arriving soon.</p>
          <p style="margin-top:8px;font-size:0.85rem">Reach out to commission something unique.</p>
          <a href="/contact" class="btn btn-gold" style="margin-top:32px">Request a Custom Piece</a>
        </div>`;
      return;
    }

    container.innerHTML = `<div class="products-grid">${products.map((p, i) => renderProductCard(p, i)).join('')}</div>`;

    // Re-init AOS for new elements
    if (typeof AOS !== 'undefined') AOS.refresh();

    // Re-init VanillaTilt
    if (typeof VanillaTilt !== 'undefined') {
      VanillaTilt.init(container.querySelectorAll('[data-tilt]'));
    }

    // Re-init GLightbox
    if (typeof GLightbox !== 'undefined') {
      GLightbox({ selector: '.glightbox', touchNavigation: true, loop: true, autoplayVideos: true });
    }

  } catch (err) {
    container.innerHTML = `
      <p style="text-align:center;color:var(--text-muted);padding:48px;font-family:'Cinzel',serif;letter-spacing:0.08em">
        Unable to load works. Please try again.
      </p>`;
  }
}

/* âââ Contact Form ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ */
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  // Pre-fill from query param
  const params = new URLSearchParams(window.location.search);
  const item = params.get('item');
  if (item) {
    const desc = form.querySelector('[name="order_description"]');
    if (desc && !desc.value) {
      desc.value = `I'm interested in: ${item}\n\n`;
    }
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('[type="submit"]');
    const originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Sendingâ¦';

    const data = Object.fromEntries(new FormData(form));
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const json = await res.json();
      if (json.success) {
        const successEl = document.getElementById('formSuccess');
        if (successEl) { successEl.style.display = 'block'; }
        form.style.display = 'none';
        showToast('Inquiry sent successfully!', 'success');
      } else {
        showToast(json.error || 'Something went wrong.', 'error');
        btn.disabled = false;
        btn.textContent = originalText;
      }
    } catch (err) {
      showToast('Network error. Please try again.', 'error');
      btn.disabled = false;
      btn.textContent = originalText;
    }
  });
}

/* âââ GSAP Scroll Animations (for pages that include GSAP) âââââââââââââââââ */
function initGSAPAnimations() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  gsap.registerPlugin(ScrollTrigger);

  // Animate feature items
  gsap.utils.toArray('.feature-item').forEach((item, i) => {
    gsap.from(item, {
      scrollTrigger: {
        trigger: item,
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
      y: 40,
      opacity: 0,
      duration: 0.8,
      delay: i * 0.12,
      ease: 'power3.out',
    });
  });

  // Section titles parallax
  gsap.utils.toArray('.section-title').forEach(title => {
    gsap.from(title, {
      scrollTrigger: {
        trigger: title,
        start: 'top 90%',
        toggleActions: 'play none none none',
      },
      y: 30,
      opacity: 0,
      duration: 1,
      ease: 'power3.out',
    });
  });

  // CTA banner
  const ctaBanner = document.querySelector('.cta-banner');
  if (ctaBanner) {
    gsap.from(ctaBanner.querySelector('h2'), {
      scrollTrigger: {
        trigger: ctaBanner,
        start: 'top 80%',
      },
      y: 40,
      opacity: 0,
      duration: 1,
      ease: 'power3.out',
    });
  }
}

/* âââ DOMContentLoaded ââââââââââââââââââââââââââââââââââââââââââââââââââââââ */
document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initCursor();
  initAOS();
  initContactForm();

  // Lenis runs after libs load (called from inline script or Here)
  if (typeof Lenis !== 'undefined') initLenis();

  // GSAP animations
  if (typeof gsap !== 'undefined') initGSAPAnimations();
});

// Allow external call after libs loaded
window.GuruGlass = { initLenis, initGSAPAnimations };
