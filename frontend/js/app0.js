const API_URL = "http://127.0.0.1:8000";
const WHATSAPP_NUMBER = "237600000000";

const rootEl = document.documentElement;
const themeBtn = document.getElementById("theme-toggle");
const searchInput = document.getElementById("search-input");
const categorySelect = document.getElementById("category-select");
const gridEl = document.getElementById("products-grid");
const cartCountEl = document.getElementById("cart-count");
const cartSummaryEl = document.getElementById("cart-summary");
const whatsappBtn = document.getElementById("whatsapp-btn");

let products = [];
let cart = [];

// 1. Thème clair / sombre
function setTheme(theme) {
  rootEl.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);
  themeBtn.textContent = theme === "dark" ? "Mode clair" : "Mode sombre";
}

setTheme(localStorage.getItem("theme") || "light");

themeBtn.addEventListener("click", () => {
  const next = rootEl.getAttribute("data-theme") === "dark" ? "light" : "dark";
  setTheme(next);
});

// 2. Chargement des produits depuis FastAPI
async function fetchProducts() {
  const params = new URLSearchParams();
  const q = searchInput.value.trim();
  const category = categorySelect.value;

  if (q) params.set("q", q);
  if (category && category !== "all") params.set("category", category);

  const queryString = params.toString();
  const url = `${API_URL}/products${queryString ? `?${queryString}` : ""}`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Erreur réseau API");
    products = await res.json();
    renderProducts();
  } catch (err) {
    gridEl.innerHTML = `<p>Impossible de charger les produits. Vérifiez que FastAPI tourne sur ${API_URL}.</p>`;
    console.error(err);
  }
}

function renderProducts() {
  if (products.length === 0) {
    gridEl.innerHTML = `<p>Aucun produit trouvé.</p>`;
    return;
  }

  gridEl.innerHTML = products
    .map(
      (item) => `
      <article class="card" data-id="${item.id}">
        <img src="${item.image_url}" alt="${item.title}" />
        <div class="card__body">
          <span class="tag">${item.category}</span>
          <h2>${item.title}</h2>
          <p>${item.description}</p>
          <div class="card__foot">
            <strong>${Number(item.price).toLocaleString("fr-FR")} FCFA</strong>
            <button class="btn add-btn" type="button" data-id="${item.id}">Ajouter</button>
          </div>
        </div>
      </article>
    `
    )
    .join("");

  document.querySelectorAll(".add-btn").forEach((btn) => {
    btn.addEventListener("click", () => addToCart(Number(btn.dataset.id)));
  });
}

searchInput.addEventListener("input", fetchProducts);
categorySelect.addEventListener("change", fetchProducts);

// 3. Panier & récapitulatif
function addToCart(productId) {
  const product = products.find((p) => p.id === productId);
  if (!product) return;

  const existing = cart.find((item) => item.id === productId);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id: product.id, title: product.title, price: product.price, qty: 1 });
  }
  renderCart();
}

function renderCart() {
  const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  cartCountEl.textContent = String(totalQty);

  if (cart.length === 0) {
    cartSummaryEl.textContent = "Votre panier est vide.";
    return;
  }

  const lines = cart.map(
    (item) => `${item.title} x${item.qty} (${(item.price * item.qty).toLocaleString("fr-FR")} FCFA)`
  );
  cartSummaryEl.textContent = `${lines.join(" | ")} — Total : ${totalPrice.toLocaleString("fr-FR")} FCFA`;
}

// 4. Redirection WhatsApp
whatsappBtn.addEventListener("click", () => {
  if (cart.length === 0) {
    alert("Ajoutez au moins un produit avant de commander.");
    return;
  }

  const name = document.getElementById("customer-name").value.trim() || "Client";
  const address = document.getElementById("customer-address").value.trim() || "Non précisée";
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const itemsText = cart
    .map((item) => `- ${item.title} x${item.qty} : ${(item.price * item.qty).toLocaleString("fr-FR")} FCFA`)
    .join("\n");

  const message =
    `Bonjour MaBoutique, je souhaite commander :\n${itemsText}\n\n` +
    `Total : ${totalPrice.toLocaleString("fr-FR")} FCFA\n` +
    `Nom : ${name}\n` +
    `Livraison : ${address}`;

  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank", "noopener,noreferrer");
});

fetchProducts();