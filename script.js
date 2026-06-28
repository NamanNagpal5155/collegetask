// ============ API URLs ============
const API_ALL = 'https://dummyjson.com/products?limit=194';
const API_SINGLE = 'https://dummyjson.com/products';

// ============ Cart Management ============
function getCart() {
  return JSON.parse(localStorage.getItem('cart')) || [];
}

function saveCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
}

function updateCartCount() {
  const cart = getCart();
  const total = cart.reduce((sum, item) => sum + item.quantity, 0);
  document.querySelectorAll('#cart-count').forEach(el => el.textContent = total);
}

function addToCart(product) {
  let cart = getCart();
  const existing = cart.find(item => item.id === product.id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({
      id: product.id,
      title: product.title,
      price: product.price,
      discountPercentage: product.discountPercentage,
      thumbnail: product.thumbnail,
      quantity: 1
    });
  }
  saveCart(cart);
  updateCartCount();
  showToast(`${product.title} added to cart!`);
}

function removeFromCart(productId) {
  let cart = getCart().filter(item => item.id !== productId);
  saveCart(cart);
  updateCartCount();
  displayCart();
}

function updateQuantity(productId, delta) {
  let cart = getCart();
  const item = cart.find(i => i.id === productId);
  if (!item) return;
  item.quantity += delta;
  if (item.quantity <= 0) {
    cart = cart.filter(i => i.id !== productId);
  }
  saveCart(cart);
  updateCartCount();
  displayCart();
}

// ============ Toast ============
function showToast(message) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), 2500);
}

// ============ Listing Page ============
async function displayProducts() {
  const grid = document.getElementById('product-grid');
  const loading = document.getElementById('loading');
  try {
    const res = await fetch(API_ALL);
    const data = await res.json();
    loading.style.display = 'none';
    data.products.forEach(p => {
      const card = document.createElement('div');
      card.className = 'product-card';
      card.onclick = () => window.location.href = `product.html?id=${p.id}`;
      const discountedPrice = (p.price * (1 - p.discountPercentage / 100)).toFixed(2);
      card.innerHTML = `
        <img src="${p.thumbnail}" alt="${p.title}" loading="lazy">
        <div class="card-body">
          <div class="category">${p.category}</div>
          <h3>${p.title}</h3>
          <div class="rating">${'★'.repeat(Math.round(p.rating))}${'☆'.repeat(5 - Math.round(p.rating))} (${p.rating})</div>
          <div class="price">
            $${discountedPrice}
            <span class="original">$${p.price}</span>
          </div>
        </div>
      `;
      grid.appendChild(card);
    });
    updateCartCount();
  } catch (err) {
    loading.textContent = 'Failed to load products. Please try again.';
  }
}

// ============ Product Detail Page ============
async function displayProductDetail() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const detailDiv = document.getElementById('product-detail');
  const loading = document.getElementById('loading');

  if (!id) {
    loading.style.display = 'none';
    detailDiv.innerHTML = '<p>No product ID specified.</p>';
    return;
  }

  try {
    const res = await fetch(`${API_SINGLE}/${id}`);
    const p = await res.json();
    loading.style.display = 'none';

    const discountedPrice = (p.price * (1 - p.discountPercentage / 100)).toFixed(2);
    const stockClass = p.stock > 0 ? 'in-stock' : 'out-of-stock';
    const stockText = p.stock > 0 ? `In Stock (${p.stock} available)` : 'Out of Stock';

    let thumbHtml = '';
    if (p.images && p.images.length > 1) {
      thumbHtml = `<div class="thumbnails">${p.images.map((img, i) =>
        `<img src="${img}" class="${i === 0 ? 'active' : ''}" onclick="changeMainImage(this, '${img}')">`
      ).join('')}</div>`;
    }

    let reviewsHtml = '';
    if (p.reviews && p.reviews.length > 0) {
      reviewsHtml = `<div class="reviews-section"><h2>Reviews (${p.reviews.length})</h2>`;
      p.reviews.forEach(r => {
        reviewsHtml += `
          <div class="review-card">
            <div class="reviewer">${r.reviewerName || 'Anonymous'}</div>
            <div class="review-rating">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</div>
            <div class="review-comment">${r.comment}</div>
          </div>
        `;
      });
      reviewsHtml += '</div>';
    }

    detailDiv.innerHTML = `
      <div class="image-section">
        <img id="main-image" src="${p.images ? p.images[0] : p.thumbnail}" alt="${p.title}">
        ${thumbHtml}
      </div>
      <div class="info-section">
        <div class="category">${p.category}</div>
        <h1>${p.title}</h1>
        <div class="price-detail">
          $${discountedPrice}
          <span class="original">$${p.price}</span>
        </div>
        <div class="discount">Save ${p.discountPercentage}%</div>
        <div class="rating-detail">
          ${'★'.repeat(Math.round(p.rating))}${'☆'.repeat(5 - Math.round(p.rating))}
          <span>${p.rating} / 5</span>
        </div>
        <div class="description">${p.description}</div>
        <div class="stock ${stockClass}">${stockText}</div>
        <button class="add-to-cart" ${p.stock === 0 ? 'disabled' : ''} onclick="addToCartFromDetail()">
          ${p.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
        </button>
        ${reviewsHtml}
      </div>
    `;

    // store product data for addToCartFromDetail
    window._currentProduct = {
      id: p.id,
      title: p.title,
      price: p.price,
      discountPercentage: p.discountPercentage,
      thumbnail: p.thumbnail
    };

    updateCartCount();
  } catch (err) {
    loading.style.display = 'none';
    detailDiv.innerHTML = '<p>Failed to load product details.</p>';
  }
}

function changeMainImage(el, src) {
  document.getElementById('main-image').src = src;
  document.querySelectorAll('.thumbnails img').forEach(img => img.classList.remove('active'));
  el.classList.add('active');
}

function addToCartFromDetail() {
  if (window._currentProduct) {
    addToCart(window._currentProduct);
  }
}

// ============ Cart Page ============
function displayCart() {
  const cart = getCart();
  const content = document.getElementById('cart-content');

  if (cart.length === 0) {
    content.innerHTML = `
      <div class="empty-cart">
        <h2>Your cart is empty</h2>
        <p>Browse our products and add items to your cart.</p>
        <a href="index.html">Browse Products</a>
      </div>
    `;
    updateCartCount();
    return;
  }

  let itemsHtml = '<div class="cart-layout"><div class="cart-items">';
  let subtotal = 0;
  let totalDiscount = 0;

  cart.forEach(item => {
    const itemPrice = item.price * (1 - item.discountPercentage / 100);
    const itemTotal = itemPrice * item.quantity;
    const itemDiscount = (item.price * item.discountPercentage / 100) * item.quantity;
    subtotal += item.price * item.quantity;
    totalDiscount += itemDiscount;

    itemsHtml += `
      <div class="cart-item">
        <img src="${item.thumbnail}" alt="${item.title}">
        <div class="item-info">
          <h3>${item.title}</h3>
          <div class="item-price">$${itemPrice.toFixed(2)}</div>
        </div>
        <div class="quantity-controls">
          <button onclick="updateQuantity(${item.id}, -1)">−</button>
          <span>${item.quantity}</span>
          <button onclick="updateQuantity(${item.id}, 1)">+</button>
        </div>
        <div class="item-total">$${itemTotal.toFixed(2)}</div>
        <button class="remove-btn" onclick="removeFromCart(${item.id})">&times;</button>
      </div>
    `;
  });

  const discountedTotal = subtotal - totalDiscount;

  itemsHtml += '</div>';

  // Bill Summary
  itemsHtml += `
    <div class="bill-summary">
      <h2>Bill Summary</h2>
      <div class="bill-row">
        <span>Subtotal</span>
        <span>$${subtotal.toFixed(2)}</span>
      </div>
      <div class="bill-row discount">
        <span>Discount</span>
        <span>-$${totalDiscount.toFixed(2)}</span>
      </div>
      <div class="bill-row total">
        <span>Total</span>
        <span>$${discountedTotal.toFixed(2)}</span>
      </div>
      <button class="checkout-btn" onclick="checkout()">Proceed to Checkout</button>
    </div>
  </div>`;

  content.innerHTML = itemsHtml;
  updateCartCount();
}

function checkout() {
  showToast('Order placed successfully! Thank you for shopping.');
  localStorage.removeItem('cart');
  updateCartCount();
  setTimeout(() => displayCart(), 500);
}

// ============ Init cart count on page load ============
document.addEventListener('DOMContentLoaded', updateCartCount);
