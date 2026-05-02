// Shared Javascript for SMF Supplement Website

// --- CART LOGIC (localStorage) ---
let cart = JSON.parse(localStorage.getItem('smf_cart')) || [];

function addToCart(name, price, img) {
    const existing = cart.find(item => item.name === name);
    if (existing) {
        existing.qty += 1;
    } else {
        cart.push({ name, price, img, qty: 1 });
    }
    saveCart();
    updateCartBadge();
    // Optional: visual feedback
    const toast = document.createElement('div');
    toast.innerText = `${name} added to cart!`;
    toast.style.cssText = 'position:fixed; bottom:100px; left:50%; transform:translateX(-50%); background:rgba(0,0,0,0.8); color:white; padding:10px 20px; border-radius:20px; z-index:2000;';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
}

function saveCart() {
    localStorage.setItem('smf_cart', JSON.stringify(cart));
}

function updateCartBadge() {
    const badges = document.querySelectorAll('.cart-badge');
    const totalItems = cart.reduce((acc, item) => acc + item.qty, 0);
    badges.forEach(badge => {
        badge.innerText = totalItems;
        badge.style.display = totalItems > 0 ? 'block' : 'none';
    });
}

// --- VIEW TOGGLE ---
function setView(mode) {
    const container = document.querySelector('.products-container');
    const toggleBtn = document.getElementById('viewToggle');

    if (!container) return;

    if (mode === 'grid') {
        container.classList.remove('list-view');
        container.classList.add('grid-view');
        if (toggleBtn) toggleBtn.innerHTML = '📋 Switch to List';
    } else {
        container.classList.remove('grid-view');
        container.classList.add('list-view');
        if (toggleBtn) toggleBtn.innerHTML = '🔲 Switch to Grid';
    }
    localStorage.setItem('smf_view_mode', mode);
}

function toggleView() {
    const currentMode = localStorage.getItem('smf_view_mode') || 'grid';
    const newMode = currentMode === 'grid' ? 'list' : 'grid';
    setView(newMode);
}

// --- MODAL & SLIDER LOGIC ---
let modalImages = [];
let currentImageIndex = 0;
let currentProduct = {}; // Global to store product for modal "Add to Cart"

function openProductModal(name, images, price, desc) {
    currentProduct = { name, price, images }; // Store for Add to Cart button
    modalImages = Array.isArray(images) ? images : [images];
    currentImageIndex = 0;

    document.getElementById('modalName').innerText = name;
    document.getElementById('modalPrice').innerText = '₹' + price;
    document.getElementById('modalDesc').innerText = desc;

    // Set first image
    updateModalImage();

    document.getElementById('productModal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    document.getElementById('productModal').style.display = 'none';
    document.body.style.overflow = 'auto';
}

function updateModalImage() {
    const imgEl = document.getElementById('modalImg');
    const counterEl = document.getElementById('imageCounter');
    if (imgEl) imgEl.src = modalImages[currentImageIndex];
    if (counterEl) counterEl.innerText = `${currentImageIndex + 1} / ${modalImages.length}`;
}

function changeImage(dir) {
    currentImageIndex += dir;
    if (currentImageIndex < 0) currentImageIndex = modalImages.length - 1;
    if (currentImageIndex >= modalImages.length) currentImageIndex = 0;
    updateModalImage();
}

// --- CART PAGE LOGIC ---
function renderCartPage() {
    const container = document.getElementById('cartItemsList');
    const subtotalEl = document.getElementById('subtotal');
    if (!container) return;

    if (cart.length === 0) {
        container.innerHTML = '<div style="text-align:center; padding:50px;">Your cart is empty.</div>';
        if (subtotalEl) subtotalEl.innerText = '0';
        return;
    }

    let html = '';
    let grandTotal = 0;

    cart.forEach((item, index) => {
        const itemTotal = item.price * item.qty;
        grandTotal += itemTotal;
        html += `
            <div class="cart-item">
                <img src="${item.img}" alt="${item.name}">
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p class="price">₹${item.price}</p>
                    <div class="qty-control">
                        <button class="qty-btn" onclick="updateQty(${index}, -1)">-</button>
                        <span>${item.qty}</span>
                        <button class="qty-btn" onclick="updateQty(${index}, 1)">+</button>
                    </div>
                </div>
                <div style="text-align:right">
                    <p style="font-weight:bold">₹${itemTotal}</p>
                    <button onclick="removeFromCart(${index})" style="background:none; border:none; color:red; cursor:pointer; font-size:12px; margin-top:10px;">Remove</button>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
    if (subtotalEl) subtotalEl.innerText = grandTotal;
}

function updateQty(index, change) {
    cart[index].qty += change;
    if (cart[index].qty < 1) cart[index].qty = 1;
    saveCart();
    renderCartPage();
    updateCartBadge();
}

function removeFromCart(index) {
    cart.splice(index, 1);
    saveCart();
    renderCartPage();
    updateCartBadge();
}

function checkoutWhatsApp() {
    const whatsappNumber = "917339563621";
    if (cart.length === 0) { alert("Cart empty"); return; }

    let msg = "Order Details:\n\n";
    let total = 0;
    cart.forEach(item => {
        msg += `- ${item.name} x${item.qty} = ₹${item.price * item.qty}\n`;
        total += item.price * item.qty;
    });
    msg += `\n*Grand Total: ₹${total}*`;

    window.location.href = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(msg)}`;
}

function Products() {
    window.location.href = 'products.html';
}

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    updateCartBadge();

    // Set initial view mode based on screen size or storage
    const storedView = localStorage.getItem('smf_view_mode');
    if (storedView) {
        setView(storedView);
    } else {
        // Defaults: Mobile/Tablet -> list, Desktop -> grid
        if (window.innerWidth <= 768) {
            setView('list');
        } else {
            setView('grid');
        }
    }

    // Initialize Lucide icons if the library is loaded
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
});

// Close modal on outside click
window.onclick = function (event) {
    const modal = document.getElementById('productModal');
    if (event.target == modal) closeModal();
}