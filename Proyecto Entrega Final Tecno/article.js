const productList = document.getElementById('product-list');
const cartSection = document.getElementById('cart-section');
const cartItemsContainer = document.getElementById('cart-items');
const cartCount = document.getElementById('cart-count');
const totalPrice = document.getElementById('total-price');
const viewCartBtn = document.getElementById('view-cart-btn');
const clearCartBtn = document.getElementById('clear-cart-btn');

// ------------------ Carrito ------------------
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// ------------------ Obtener Productos ------------------
async function fetchProducts() {
  try {
    const res = await fetch('https://dummyjson.com/products?limit=12');
    const data = await res.json();
    renderProducts(data.products);
  } catch (err) {
    productList.innerHTML = '<p>Error al cargar productos</p>';
    console.error(err);
  }
}

// ------------------ Renderizar Productos ------------------
function renderProducts(products) {
  productList.innerHTML = '';
  products.forEach(product => {
    const card = document.createElement('div');
    card.classList.add('product-card');
    card.innerHTML = `
      <img src="${product.thumbnail}" alt="${product.title}">
      <h3>${product.title}</h3>
      <p>$${product.price}</p>
      <button data-id="${product.id}" data-title="${product.title}" data-price="${product.price}" data-thumb="${product.thumbnail}">Agregar al carrito</button>
    `;
    productList.appendChild(card);
  });

  // Agregar eventos a botones
  document.querySelectorAll('.product-card button').forEach(button => {
    button.addEventListener('click', () => {
      addToCart(button.dataset);
    });
  });
}

// ------------------ Agregar al carrito ------------------
function addToCart(product) {
  const existing = cart.find(item => item.id == product.id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({
      id: product.id,
      title: product.title,
      price: parseFloat(product.price),
      thumbnail: product.thumb,
      quantity: 1
    });
  }
  saveCart();
  updateCartCount();
}

// ------------------ Guardar y cargar carrito ------------------
function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

// ------------------ Contador del carrito ------------------
function updateCartCount() {
  const count = cart.reduce((acc, item) => acc + item.quantity, 0);
  cartCount.textContent = count;
}

// ------------------ Mostrar carrito ------------------
function showCart() {
  cartSection.classList.toggle('hidden');
  renderCart();
}

// ------------------ Renderizar productos del carrito ------------------
function renderCart() {
  cartItemsContainer.innerHTML = '';

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = '<p>El carrito está vacío.</p>';
    totalPrice.textContent = '0';
    return;
  }

  cart.forEach(item => {
    const div = document.createElement('div');
    div.classList.add('cart-item');
    div.innerHTML = `
      <img src="${item.thumbnail}" alt="${item.title}">
      <p>${item.title}</p>
      <p>$${item.price}</p>
      <input type="number" min="1" value="${item.quantity}" data-id="${item.id}">
      <button data-id="${item.id}" class="remove-btn">Eliminar</button>
    `;
    cartItemsContainer.appendChild(div);
  });

  // Total
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  totalPrice.textContent = total.toFixed(2);

  // Eventos de cantidad
  document.querySelectorAll('.cart-item input').forEach(input => {
    input.addEventListener('change', e => {
      const id = e.target.dataset.id;
      const newQty = parseInt(e.target.value);
      const item = cart.find(i => i.id == id);
      if (item && newQty >= 1) {
        item.quantity = newQty;
        saveCart();
        updateCartCount();
        renderCart();
      }
    });
  });

  // Eliminar producto
  document.querySelectorAll('.remove-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      const id = e.target.dataset.id;
      cart = cart.filter(item => item.id != id);
      saveCart();
      updateCartCount();
      renderCart();
    });
  });
}

// ------------------ Vaciar carrito ------------------
clearCartBtn.addEventListener('click', () => {
  cart = [];
  saveCart();
  updateCartCount();
  renderCart();
});

// ------------------ Eventos ------------------
viewCartBtn.addEventListener('click', showCart);

// ------------------ Inicializar ------------------
fetchProducts();
updateCartCount();