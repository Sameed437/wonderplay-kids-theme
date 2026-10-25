/**
 * WONDERPLAY MOTION ENGINE
 * Powers scroll reveals, 3D card tilt, shoppable video reels, hotspots & live sales toast
 */

document.addEventListener('DOMContentLoaded', () => {
  initScrollReveals();
  init3DTilt();
  initHotspots();
  initSocialProofToast();
  initVideoReels();
  initCartDrawer();
});

/* 1. SCROLL REVEALS (Intersection Observer) */
function initScrollReveals() {
  const reveals = document.querySelectorAll('.reveal-on-scroll');
  if (!('IntersectionObserver' in window)) {
    reveals.forEach(el => el.classList.add('is-revealed'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  reveals.forEach(el => observer.observe(el));
}

/* 2. 3D CARD TILT ON MOUSEMOVE */
function init3DTilt() {
  const cards = document.querySelectorAll('.tilt-card');
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -7;
      const rotateY = ((x - centerX) / centerX) * 7;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
    });
  });
}

/* 3. INTERACTIVE SHOPPING HOTSPOTS */
function initHotspots() {
  const pins = document.querySelectorAll('.hotspot-pin');
  pins.forEach(pin => {
    pin.addEventListener('click', (e) => {
      e.stopPropagation();
      const targetId = pin.getAttribute('data-target');
      const popover = document.getElementById(targetId);

      // Close all other popovers
      document.querySelectorAll('.hotspot-popover').forEach(p => {
        if (p !== popover) p.classList.remove('is-active');
      });

      if (popover) {
        popover.classList.toggle('is-active');
      }
    });
  });

  document.addEventListener('click', () => {
    document.querySelectorAll('.hotspot-popover').forEach(p => p.classList.remove('is-active'));
  });
}

/* 4. REAL-TIME SOCIAL PROOF SALES TOAST */
function initSocialProofToast() {
  const toast = document.getElementById('sales-toast');
  if (!toast) return;

  const salesData = [
    { name: 'Sarah L. from Seattle, WA', item: 'Montessori Natural Wooden Rainbow Stacker', time: '2 minutes ago' },
    { name: 'Marcus R. from Austin, TX', item: 'Solar & Hydro Robotic Science Explorers Kit', time: '5 minutes ago' },
    { name: 'Jessica T. from Chicago, IL', item: 'Barnaby the Calming Weighted Plush Bear', time: 'Just now' },
    { name: 'David K. from Denver, CO', item: 'Ergonomic Wooden Balance Bike', time: '4 minutes ago' },
    { name: 'Emily P. from Boston, MA', item: 'Luminescent Magnetic Architectural Tiles', time: '1 minute ago' }
  ];

  let currentIndex = 0;

  function showToast() {
    const data = salesData[currentIndex];
    const nameEl = toast.querySelector('.toast-customer');
    const itemEl = toast.querySelector('.toast-item');
    const timeEl = toast.querySelector('.toast-time');

    if (nameEl) nameEl.textContent = data.name;
    if (itemEl) itemEl.textContent = data.item;
    if (timeEl) timeEl.textContent = data.time;

    toast.classList.add('is-visible');

    setTimeout(() => {
      toast.classList.remove('is-visible');
      currentIndex = (currentIndex + 1) % salesData.length;
    }, 5000);
  }

  // First toast after 3 seconds, then every 16 seconds
  setTimeout(() => {
    showToast();
    setInterval(showToast, 16000);
  }, 3000);
}

/* 5. SHOPPABLE VIDEO REELS INTERACTIVITY */
function initVideoReels() {
  const reelCards = document.querySelectorAll('.reel-video-card');
  reelCards.forEach(card => {
    const video = card.querySelector('video');
    if (!video) return;

    card.addEventListener('mouseenter', () => {
      video.play().catch(() => {});
    });

    card.addEventListener('mouseleave', () => {
      video.pause();
    });
  });
}

/* 6. AJAX CART DRAWER WITH FREE SHIPPING PROGRESS */
function initCartDrawer() {
  const drawer = document.getElementById('cart-drawer');
  const overlay = document.getElementById('cart-drawer-overlay');
  const closeBtn = document.getElementById('cart-drawer-close');
  const openBtns = document.querySelectorAll('.open-cart-drawer');

  function openDrawer() {
    if (drawer) drawer.classList.add('is-open');
    if (overlay) overlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    updateCartUI();
  }

  function closeDrawer() {
    if (drawer) drawer.classList.remove('is-open');
    if (overlay) overlay.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  openBtns.forEach(btn => btn.addEventListener('click', (e) => {
    e.preventDefault();
    openDrawer();
  }));

  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
  if (overlay) overlay.addEventListener('click', closeDrawer);

  // Quick Add Event Listener
  document.querySelectorAll('.btn-add-card').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      const variantId = btn.getAttribute('data-variant-id');
      if (!variantId) return;

      const originalHtml = btn.innerHTML;
      btn.innerHTML = '<span>Adding... ✨</span>';
      btn.disabled = true;

      try {
        const response = await fetch('/cart/add.js', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: [{ id: variantId, quantity: 1 }] })
        });

        if (response.ok) {
          btn.innerHTML = '<span>Added! 🎉</span>';
          setTimeout(() => {
            btn.innerHTML = originalHtml;
            btn.disabled = false;
            openDrawer();
          }, 600);
        } else {
          btn.innerHTML = '<span>Error</span>';
          setTimeout(() => { btn.innerHTML = originalHtml; btn.disabled = false; }, 2000);
        }
      } catch (err) {
        console.error(err);
        btn.innerHTML = originalHtml;
        btn.disabled = false;
      }
    });
  });

  async function updateCartUI() {
    try {
      const res = await fetch('/cart.js');
      const cart = await res.json();

      // Update counters
      document.querySelectorAll('.bag-count, .cart-count').forEach(el => {
        el.textContent = cart.item_count;
      });

      // Update free shipping bar ($50 goal)
      const freeShippingGoal = 5000; // in cents
      const progressEl = document.getElementById('shipping-progress-bar');
      const textEl = document.getElementById('shipping-progress-text');
      if (progressEl && textEl) {
        const percentage = Math.min(100, Math.round((cart.total_price / freeShippingGoal) * 100));
        progressEl.style.width = `${percentage}%`;

        if (cart.total_price >= freeShippingGoal) {
          textEl.innerHTML = '🎉 <strong>Congratulations!</strong> You earned <strong>FREE Tracked Shipping</strong>!';
          progressEl.style.backgroundColor = '#10B981';
        } else {
          const remaining = ((freeShippingGoal - cart.total_price) / 100).toFixed(2);
          textEl.innerHTML = `Add <strong>$${remaining}</strong> more to unlock <strong>FREE Shipping</strong>!`;
          progressEl.style.backgroundColor = '#D96E54';
        }
      }
    } catch (err) {
      console.warn('Could not update cart UI:', err);
    }
  }
}
