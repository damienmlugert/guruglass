/* ═══════════════════════════════════════════════════════════════════════════
   GuruGlass — Shared Public JS
   ═══════════════════════════════════════════════════════════════════════════ */

// ─── Nav toggle (mobile) ────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.nav-toggle');
  const links  = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => links.classList.toggle('open'));
    document.addEventListener('click', (e) => {
      if (!toggle.contains(e.target) && !links.contains(e.target)) {
        links.classList.remove('open');
      }
    });
  }

  // Active nav link
  const currentPath = window.location.pathname;
  document.querySelectorAll('.nav-links a').forEach(a => {
    if (a.getAttribute('href') === currentPath) a.classList.add('active');
  });
});

// ─── Toast ─────────────────────────────────────────────────────────────────
function showToast(message, type = 'success') {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  const icon = type === 'success' ? '✓' : '✕';
  toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;
  toast.className = `toast ${type}`;
  requestAnimationFrame(() => toast.classList.add('show'));
  setTimeout(() => toast.classList.remove('show'), 3500);
}

// ─── Product loader (products page) ────────────────────────────────────────
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
          <div style="font-size:3rem;margin-bottom:16px">🔮</div>
          <p>New pieces arriving soon. Reach out to commission something unique.</p>
          <a href="/contact" class="btn btn-gold" style="margin-top:24px">Request a Custom Piece</a>
        </div>`;
      return;
    }

    container.innerHTML = `<div class="products-grid">${products.map(renderProductCard).join('')}</div>`;
  } catch (err) {
    container.innerHTML = `<p style="text-align:center;color:var(--text-muted);padding:40px">Unable to load products. Please try again.</p>`;
  }
}

function getYouTubeId(url) {
  if (!url) return null;
  const match = url.match(/(?:v=|youtu\.be\/|embed\/)([\w-]{11})/);
  return match ? match[1] : null;
}

function renderProductCard(p) {
  const ytId = getYouTubeId(p.youtube_url);
  let mediaHtml = '';

  if (ytId) {
    mediaHtml = `
      <div class="product-media">
        <div class="video-wrapper">
          <iframe src="https://www.youtube.com/embed/${ytId}?rel=0&modestbranding=1"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowfullscreen loading="lazy"></iframe>
        </div>
        <span class="media-badge">▶ Video</span>
      </div>`;
  } else if (p.image_url) {
    mediaHtml = `
      <div class="product-media">
        <img src="${escHtml(p.image_url)}" alt="${escHtml(p.name)}" loading="lazy"
             onerror="this.src='https://images.unsplash.com/photo-1599714685195-ce0c7fe72ab6?w=800&q=80'">
        <span class="media-badge">✦ Original</span>
      </div>`;
  } else {
    mediaHtml = `
      <div class="product-media" style="background:linear-gradient(135deg,#0d1117,#1a7a6e22)">
        <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:3rem;opacity:0.3">🔷</div>
        <span class="media-badge">✦ Piece</span>
      </div>`;
  }

  const priceHtml = p.price
    ? `<span class="product-price">$${Number(p.price).toLocaleString()}</span>`
    : `<span class="product-price inquire">Inquire for pricing</span>`;

  return `
    <div class="product-card">
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

// ─── Contact form ───────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
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
    btn.disabled = true;
    btn.textContent = 'Sending…';

    const data = Object.fromEntries(new FormData(form));
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const json = await res.json();
      if (json.success) {
        document.getElementById('formSuccess').style.display = 'block';
        form.style.display = 'none';
      } else {
        showToast(json.error || 'Something went wrong.', 'error');
        btn.disabled = false;
        btn.textContent = 'Send Inquiry';
      }
    } catch (err) {
      showToast('Network error. Please try again.', 'error');
      btn.disabled = false;
      btn.textContent = 'Send Inquiry';
    }
  });
});

// ─── Escape helper ─────────────────────────────────────────────────────────
function escHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
