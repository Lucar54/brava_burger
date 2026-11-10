const products = [
  {
    id: 'brava-clasica',
    name: 'BRAVA CLÁSICA',
    description: 'Carne, cheddar, lechuga y salsa especial.',
    price: 12000,
    image:
      'https://images.unsplash.com/photo-1550317138-10000687a72b?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'double-brava',
    name: 'DOUBLE BRAVA',
    description: 'Doble carne, doble cheddar y panceta.',
    price: 15000,
    image:
      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'bbq-extreme',
    name: 'BBQ EXTREME',
    description: 'Carne, cheddar, cebolla crispy y salsa BBQ.',
    price: 14000,
    image:
      'https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'crispy-chicken',
    name: 'CRISPY CHICKEN',
    description: 'Pollo crocante, cheddar y salsa especial.',
    price: 13000,
    image:
      'https://images.unsplash.com/photo-1520072959219-c595dc870360?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'bacon-deluxe',
    name: 'BACON DELUXE',
    description: 'Carne, panceta, cheddar y cebolla caramelizada.',
    price: 16000,
    image:
      'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'brava-triple',
    name: 'BRAVA TRIPLE',
    description: 'Triple carne, triple cheddar y salsa de la casa.',
    price: 19000,
    image:
      'https://images.unsplash.com/photo-1512152272829-e3139592d56f?auto=format&fit=crop&w=800&q=80'
  }
];

const cartStorageKey = 'brava-burger-cart';

const state = {
  cart: loadCart()
};

const menuGrid = document.getElementById('menu-grid');
const cartItemsEl = document.getElementById('cart-items');
const cartCountBadge = document.getElementById('cart-count-badge');
const itemCountEl = document.getElementById('item-count');
const subtotalEl = document.getElementById('subtotal');
const totalEl = document.getElementById('total');
const emptyCartBtn = document.getElementById('empty-cart');
const checkoutBtn = document.getElementById('checkout-whatsapp');
const menuToggle = document.querySelector('.menu-toggle');
const mainNav = document.getElementById('main-nav');

function formatPrice(value) {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0
  }).format(value);
}

function loadCart() {
  try {
    const savedCart = JSON.parse(localStorage.getItem(cartStorageKey) || '[]');
    return Array.isArray(savedCart) ? savedCart : [];
  } catch (error) {
    console.warn('No se pudo cargar el carrito.', error);
    return [];
  }
}

function saveCart() {
  localStorage.setItem(cartStorageKey, JSON.stringify(state.cart));
}

function getProductById(productId) {
  return products.find((product) => product.id === productId);
}

function updateCartSummary() {
  const totalProducts = state.cart.reduce((total, item) => total + item.quantity, 0);
  const subtotal = state.cart.reduce((total, item) => {
    const product = getProductById(item.id);
    return total + (product ? product.price * item.quantity : 0);
  }, 0);

  cartCountBadge.textContent = String(totalProducts);
  itemCountEl.textContent = String(totalProducts);
  subtotalEl.textContent = formatPrice(subtotal);
  totalEl.textContent = formatPrice(subtotal);
}

function addToCart(productId) {
  const existingItem = state.cart.find((item) => item.id === productId);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    state.cart.push({ id: productId, quantity: 1 });
  }

  saveCart();
  renderCart();
  updateCartSummary();
}

function changeQuantity(productId, delta) {
  const item = state.cart.find((cartItem) => cartItem.id === productId);

  if (!item) {
    return;
  }

  item.quantity += delta;

  if (item.quantity <= 0) {
    state.cart = state.cart.filter((cartItem) => cartItem.id !== productId);
  }

  saveCart();
  renderCart();
  updateCartSummary();
}

function removeFromCart(productId) {
  state.cart = state.cart.filter((item) => item.id !== productId);
  saveCart();
  renderCart();
  updateCartSummary();
}

function renderMenu() {
  menuGrid.innerHTML = products
    .map(
      (product) => `
        <article class="product-card reveal">
          <div class="product-image">
            <img src="${product.image}" alt="${product.name}" />
          </div>
          <div class="product-body">
            <div class="product-head">
              <h3 class="product-name">${product.name}</h3>
              <span class="product-price">${formatPrice(product.price)}</span>
            </div>
            <p class="product-description">${product.description}</p>
            <div class="product-actions">
              <button class="add-to-cart" type="button" data-product-id="${product.id}">
                Agregar
              </button>
            </div>
          </div>
        </article>
      `
    )
    .join('');

  document.querySelectorAll('.add-to-cart').forEach((button) => {
    button.addEventListener('click', () => {
      addToCart(button.dataset.productId);
    });
  });

  observeRevealElements();
}

function renderCart() {
  if (state.cart.length === 0) {
    cartItemsEl.innerHTML = `
      <div class="empty-cart">
        <div>
          <p>Tu carrito está vacío.</p>
          <p>Agrega una hamburguesa para comenzar.</p>
        </div>
      </div>
    `;
    return;
  }

  cartItemsEl.innerHTML = state.cart
    .map((item) => {
      const product = getProductById(item.id);

      if (!product) {
        return '';
      }

      return `
        <article class="cart-item" data-product-id="${product.id}">
          <div class="cart-item-image">
            <img src="${product.image}" alt="${product.name}" />
          </div>

          <div class="cart-item-content">
            <span class="cart-item-name">${product.name}</span>
            <span class="cart-item-price">${formatPrice(product.price * item.quantity)}</span>
          </div>

          <div class="cart-item-controls">
            <div class="qty-control" aria-label="Cantidad de ${product.name}">
              <button class="qty-btn" type="button" data-action="decrease" data-product-id="${product.id}" aria-label="Disminuir cantidad">−</button>
              <span>${item.quantity}</span>
              <button class="qty-btn" type="button" data-action="increase" data-product-id="${product.id}" aria-label="Aumentar cantidad">+</button>
            </div>

            <button class="remove-item" type="button" data-product-id="${product.id}">
              Eliminar
            </button>
          </div>
        </article>
      `;
    })
    .join('');

  document.querySelectorAll('.qty-btn').forEach((button) => {
    button.addEventListener('click', () => {
      const { productId, action } = button.dataset;
      changeQuantity(productId, action === 'increase' ? 1 : -1);
    });
  });

  document.querySelectorAll('.remove-item').forEach((button) => {
    button.addEventListener('click', () => {
      removeFromCart(button.dataset.productId);
    });
  });
}

function openWhatsApp(message) {
  const encodedMessage = encodeURIComponent(message);
  window.open(`https://wa.me/56900000000?text=${encodedMessage}`, '_blank', 'noopener');
}

function setupMenuToggle() {
  menuToggle.addEventListener('click', () => {
    const isOpen = mainNav.classList.toggle('is-open');
    menuToggle.classList.toggle('is-open', isOpen);
    menuToggle.setAttribute('aria-expanded', String(isOpen));
  });

  mainNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      mainNav.classList.remove('is-open');
      menuToggle.classList.remove('is-open');
      menuToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

function observeRevealElements() {
  const revealElements = document.querySelectorAll('.reveal');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  revealElements.forEach((element) => observer.observe(element));
}

function setupEmptyCart() {
  emptyCartBtn.addEventListener('click', () => {
    state.cart = [];
    saveCart();
    renderCart();
    updateCartSummary();
  });
}

function setupCheckout() {
  checkoutBtn.addEventListener('click', () => {
    if (state.cart.length === 0) {
      openWhatsApp('Hola BRAVA BURGER, quiero consultar por un pedido nuevo.');
      return;
    }

    const productList = state.cart
      .map((item) => {
        const product = getProductById(item.id);
        return product ? `${item.quantity}x ${product.name}` : '';
      })
      .filter(Boolean)
      .join(', ');

    const total = state.cart.reduce((sum, item) => {
      const product = getProductById(item.id);
      return sum + (product ? product.price * item.quantity : 0);
    }, 0);

    const message = `Hola BRAVA BURGER, quiero confirmar mi pedido: ${productList}. Total estimado: ${formatPrice(total)}.`;
    openWhatsApp(message);
  });
}

function init() {
  renderMenu();
  renderCart();
  updateCartSummary();
  setupMenuToggle();
  setupEmptyCart();
  setupCheckout();
  observeRevealElements();
}

init();
