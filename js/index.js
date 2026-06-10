const slides = document.querySelectorAll('.slide');
const dots = document.querySelectorAll('.dot');
const menuToggle = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.list-container');
const menuIcon = menuToggle ? menuToggle.querySelector('i') : null;
const slider = document.querySelector('.slider');
const newsletterForm = document.querySelector('#newsletter-form');
const newsletterMessage = document.querySelector('#newsletter-message');
const cartButtons = document.querySelectorAll('.cart-btn');
const cartToggle = document.querySelector('#cart-toggle');
const cartModal = document.querySelector('#cart-modal');
const cartItemsContainer = document.querySelector('#cart-items');
const cartCount = document.querySelector('#cart-count');
const cartTotal = document.querySelector('#cart-total');
const themeToggle = document.querySelector('#theme-toggle');
const autoplayDelay = 4500;
let currentSlide = 0;
let autoplay;
let cart = [];

const descriptions = {
  Toffee: 'Sweet caramel bite for the longest Halloween night.',
  Bone: 'A spooky accessory with just enough charm for your costume.',
  Scarecrow: 'Classic harvest decor ready to guard the candy table.',
  'Candy Cane': 'Striped candy with a playful seasonal twist.',
  Pumpkin: 'Bright pumpkin candy for a warm Halloween basket.',
  Ghost: 'A tiny floating friend for your haunted setup.',
  'Haunted House': 'Mini haunted house for shelves, desks, and party tables.',
  'Halloween Candle': 'Cozy candlelight with a mysterious Halloween glow.',
  'Witch Broom': 'Decorative broom for quick flights through the night.',
};

document.body.classList.add('page-ready');

const showSlide = (index) => {
  if (!slider || !slides.length) {
    return;
  }

  currentSlide = (index + slides.length) % slides.length;
  slider.style.transform = `translateX(-${currentSlide * 100}%)`;

  slides.forEach((slide, slideIndex) => {
    slide.classList.toggle('active', slideIndex === currentSlide);
  });

  dots.forEach((dot, dotIndex) => {
    dot.classList.toggle('active', dotIndex === currentSlide);
  });
};

const startAutoplay = () => {
  window.clearInterval(autoplay);

  autoplay = window.setInterval(() => {
    showSlide(currentSlide + 1);
  }, autoplayDelay);
};

const closeMobileMenu = () => {
  if (!menuToggle || !navigation) {
    return;
  }

  navigation.classList.remove('is-open');
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Open menu');

  if (menuIcon) {
    menuIcon.className = 'bx bx-menu';
  }
};

if (menuToggle && navigation) {
  menuToggle.addEventListener('click', () => {
    const isOpen = navigation.classList.toggle('is-open');

    menuToggle.setAttribute('aria-expanded', String(isOpen));
    menuToggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');

    if (menuIcon) {
      menuIcon.className = isOpen ? 'bx bx-x' : 'bx bx-menu';
    }
  });

  navigation.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      closeMobileMenu();
    });
  });

  document.addEventListener('click', (event) => {
    if (!navigation.classList.contains('is-open')) {
      return;
    }

    if (!navigation.contains(event.target) && !menuToggle.contains(event.target)) {
      closeMobileMenu();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeMobileMenu();
    }
  });
}

dots.forEach((dot, index) => {
  dot.addEventListener('click', () => {
    showSlide(index);
    startAutoplay();
  });
});

if (slider && slides.length) {
  showSlide(0);
  startAutoplay();
}

if (newsletterForm) {
  newsletterForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const emailInput = newsletterForm.querySelector('#email');

    if (!emailInput || !emailInput.value.trim()) {
      if (newsletterMessage) {
        newsletterMessage.textContent = 'Please enter your email.';
      }

      return;
    }

    if (newsletterMessage) {
      newsletterMessage.textContent = 'Thanks for subscribing!';
    }

    newsletterForm.reset();
  });
}

const formatPrice = (value) => `$${value.toFixed(2)}`;

const getProductFromButton = (button) => {
  const card = button.closest('.treat-card, .newarrival-card');
  const name = button.dataset.product || 'Item';
  const image = card ? card.querySelector('img') : null;
  const category = card ? card.querySelector('.card-div-two > span, h3 + span') : null;
  const priceNodes = card ? card.querySelectorAll('.price span, h3 + span + span') : [];
  const priceText = priceNodes.length ? priceNodes[0].textContent : '$0';

  return {
    id: name.toLowerCase().replace(/\s+/g, '-'),
    name,
    image: image ? image.getAttribute('src') : '',
    price: Number(priceText.replace(/[^0-9.]/g, '')) || 0,
    category: category ? category.textContent : 'Halloween item',
    description: descriptions[name] || 'A seasonal Halloween favorite.',
  };
};

const getCartTotal = () => cart.reduce((total, item) => total + item.price * item.quantity, 0);

const getCartQuantity = () => cart.reduce((total, item) => total + item.quantity, 0);

const updateCartButtonLabel = () => {
  if (!cartToggle) {
    return;
  }

  cartToggle.setAttribute('aria-label', `Open cart with ${getCartQuantity()} items`);
};

const renderCart = () => {
  if (!cartItemsContainer || !cartCount || !cartTotal) {
    return;
  }

  cartCount.textContent = String(getCartQuantity());
  cartTotal.textContent = formatPrice(getCartTotal());
  updateCartButtonLabel();

  if (!cart.length) {
    cartItemsContainer.innerHTML = '<p class="cart-empty">Your cart is empty.</p>';
    return;
  }

  cartItemsContainer.innerHTML = cart.map((item) => `
    <article class="cart-item">
      <img src="${item.image}" alt="${item.name}">
      <div>
        <h3>${item.name}</h3>
        <p>${item.description}</p>
        <strong>${formatPrice(item.price)}</strong>
        <div class="cart-quantity" aria-label="${item.name} quantity">
          <button type="button" data-cart-action="decrease" data-product-id="${item.id}" aria-label="Remove one ${item.name}">-</button>
          <span>${item.quantity}</span>
          <button type="button" data-cart-action="increase" data-product-id="${item.id}" aria-label="Add one ${item.name}">+</button>
        </div>
      </div>
      <button class="cart-remove" type="button" data-cart-action="remove" data-product-id="${item.id}" aria-label="Remove ${item.name}">
        <i class="bx bx-trash" aria-hidden="true"></i>
      </button>
    </article>
  `).join('');
};

const openCart = () => {
  if (!cartModal) {
    return;
  }

  cartModal.classList.add('is-open');
  cartModal.setAttribute('aria-hidden', 'false');
};

const closeCart = () => {
  if (!cartModal) {
    return;
  }

  cartModal.classList.remove('is-open');
  cartModal.setAttribute('aria-hidden', 'true');
};

const addToCart = (product) => {
  const existingProduct = cart.find((item) => item.id === product.id);

  if (existingProduct) {
    existingProduct.quantity += 1;
  } else {
    cart = [...cart, { ...product, quantity: 1 }];
  }

  renderCart();
  openCart();
};

const updateCartItem = (productId, action) => {
  cart = cart.reduce((items, item) => {
    if (item.id !== productId) {
      return [...items, item];
    }

    if (action === 'remove') {
      return items;
    }

    const quantity = action === 'increase' ? item.quantity + 1 : item.quantity - 1;

    if (quantity < 1) {
      return items;
    }

    return [...items, { ...item, quantity }];
  }, []);

  renderCart();
};

const setTheme = (isDark) => {
  document.body.classList.toggle('dark-theme', isDark);

  if (!themeToggle) {
    return;
  }

  const icon = themeToggle.querySelector('i');

  themeToggle.setAttribute('aria-pressed', String(isDark));
  themeToggle.setAttribute('aria-label', isDark ? 'Switch to orange mode' : 'Switch to dark mode');

  if (icon) {
    icon.className = isDark ? 'bx bx-sun' : 'bx bx-moon';
  }

  window.localStorage.setItem('halloween-theme', isDark ? 'dark' : 'orange');
};

cartButtons.forEach((button) => {
  button.addEventListener('click', () => {
    addToCart(getProductFromButton(button));
  });
});

if (cartToggle) {
  cartToggle.addEventListener('click', openCart);
}

if (cartModal) {
  cartModal.querySelectorAll('[data-cart-close]').forEach((closeButton) => {
    closeButton.addEventListener('click', closeCart);
  });

  cartModal.addEventListener('click', (event) => {
    const actionButton = event.target.closest('[data-cart-action]');

    if (!actionButton) {
      return;
    }

    updateCartItem(actionButton.dataset.productId, actionButton.dataset.cartAction);
  });
}

if (themeToggle) {
  const savedTheme = window.localStorage.getItem('halloween-theme');

  setTheme(savedTheme === 'dark');

  themeToggle.addEventListener('click', () => {
    setTheme(!document.body.classList.contains('dark-theme'));
  });
}

const revealElements = document.querySelectorAll('section, footer, .card, .treat-card, .newarrival-card');

if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealElements.forEach((element, index) => {
    element.classList.add('reveal');
    element.style.setProperty('--reveal-delay', `${Math.min(index % 6, 4) * 70}ms`);
    revealObserver.observe(element);
  });
} else {
  revealElements.forEach((element) => {
    element.classList.add('is-visible');
  });
}

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeCart();
  }
});

renderCart();
