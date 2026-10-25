// WonderPlay Kids Theme JS
document.addEventListener('DOMContentLoaded', () => {
  console.log('🎈 WonderPlay Kids Theme initialized');

  // Quick Add to Cart handling via Shopify Ajax API
  document.querySelectorAll('.btn-add-card').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      const variantId = btn.getAttribute('data-variant-id');
      if (!variantId) return;

      const originalText = btn.innerText;
      btn.innerText = 'Adding...';
      btn.disabled = true;

      try {
        const response = await fetch('/cart/add.js', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: [{ id: variantId, quantity: 1 }] })
        });

        if (response.ok) {
          btn.innerText = 'Added! 🎉';
          // Update cart count
          const cartRes = await fetch('/cart.js');
          const cartData = await cartRes.json();
          document.querySelectorAll('.cart-count').forEach(el => {
            el.innerText = cartData.item_count;
          });
          setTimeout(() => {
            btn.innerText = originalText;
            btn.disabled = false;
          }, 2000);
        } else {
          btn.innerText = 'Error';
          setTimeout(() => {
            btn.innerText = originalText;
            btn.disabled = false;
          }, 2000);
        }
      } catch (err) {
        console.error('Add to cart failed:', err);
        btn.innerText = originalText;
        btn.disabled = false;
      }
    });
  });
});
