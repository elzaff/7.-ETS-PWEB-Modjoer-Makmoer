// Modjoer Makmoer - Cart Logic (Non-Backend CRUD)

// 1. Initialize Cart from LocalStorage
let cart = JSON.parse(localStorage.getItem('modjoer_cart')) || [];

// 2. Save Cart to LocalStorage
function saveCart() {
    localStorage.setItem('modjoer_cart', JSON.stringify(cart));
}

// 3. Toggle Cart Sidebar
function toggleCart() {
    const sidebar = document.getElementById('cartSidebar');
    if (sidebar) {
        sidebar.classList.toggle('show');
    }
}

// 4. Format Currency
function formatCurrency(amount) {
    return 'IDR ' + amount.toLocaleString('id-ID');
}

// 5. Add to Cart
function addToCart(id, name, price, img) {
    const existingItem = cart.find(item => item.id === id);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: id,
            name: name,
            price: parseInt(price),
            img: img,
            quantity: 1
        });
    }
    saveCart();
    renderCart();
    
    // Auto open cart when adding item
    const sidebar = document.getElementById('cartSidebar');
    if (sidebar && !sidebar.classList.contains('show')) {
        sidebar.classList.add('show');
    }
}

// 6. Update Quantity
function updateQuantity(id, change) {
    const itemIndex = cart.findIndex(item => item.id === id);
    if (itemIndex > -1) {
        cart[itemIndex].quantity += change;
        if (cart[itemIndex].quantity <= 0) {
            cart.splice(itemIndex, 1);
        }
        saveCart();
        renderCart();
        renderCheckout(); // In case we are on checkout page
    }
}

// 7. Remove from Cart
function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    saveCart();
    renderCart();
    renderCheckout(); // In case we are on checkout page
}

// 8. Render Cart Sidebar (for menu.html & index.html)
function renderCart() {
    const container = document.getElementById('cart-items-container');
    const counter = document.getElementById('cart-counter');
    const totalPriceEl = document.getElementById('cart-total-price');
    const checkoutBtn = document.getElementById('cart-checkout-btn');

    if (!container) return; // Not on a page with cart sidebar

    container.innerHTML = '';
    let totalItems = 0;
    let totalPrice = 0;

    if (cart.length === 0) {
        container.innerHTML = `
            <div class="text-center text-muted my-auto">
                <span class="material-symbols-outlined mb-2" style="font-size: 48px; opacity: 0.5;">shopping_basket</span>
                <p>Your basket is empty.</p>
            </div>
        `;
        if (checkoutBtn) checkoutBtn.classList.add('disabled');
    } else {
        if (checkoutBtn) checkoutBtn.classList.remove('disabled');
        
        cart.forEach(item => {
            totalItems += item.quantity;
            totalPrice += item.price * item.quantity;

            const itemEl = document.createElement('div');
            itemEl.className = 'd-flex gap-3 align-items-center';
            itemEl.innerHTML = `
                <img src="${item.img}" alt="${item.name}" style="width: 64px; height: 64px; object-fit: cover; border-radius: 8px;">
                <div class="flex-grow-1">
                    <h3 class="font-serif fs-6 m-0 mb-1" style="color: var(--text-stone-dark);">${item.name}</h3>
                    <p class="text-primary fw-semibold m-0" style="font-size: 14px;">${formatCurrency(item.price * item.quantity)}</p>
                </div>
                <div class="d-flex flex-column align-items-end gap-2">
                    <button class="btn btn-link p-0 text-muted" onclick="removeFromCart('${item.id}')" title="Remove">
                        <span class="material-symbols-outlined" style="font-size: 18px;">delete</span>
                    </button>
                    <div class="d-flex align-items-center gap-2 bg-light rounded px-2 py-1 border">
                        <button class="btn btn-link p-0 text-dark text-decoration-none" onclick="updateQuantity('${item.id}', -1)" style="line-height: 1;">-</button>
                        <span class="small fw-semibold" style="min-width: 12px; text-align: center;">${item.quantity}</span>
                        <button class="btn btn-link p-0 text-dark text-decoration-none" onclick="updateQuantity('${item.id}', 1)" style="line-height: 1;">+</button>
                    </div>
                </div>
            `;
            container.appendChild(itemEl);
        });
    }

    if (counter) {
        counter.textContent = totalItems;
        if (totalItems > 0) {
            counter.classList.remove('d-none');
        } else {
            counter.classList.add('d-none');
        }
    }

    if (totalPriceEl) {
        totalPriceEl.textContent = formatCurrency(totalPrice);
    }
}

// 9. Render Checkout Page
function renderCheckout() {
    const listContainer = document.getElementById('checkout-item-list');
    if (!listContainer) return; // Not on checkout page

    const subtotalEl = document.getElementById('checkout-subtotal');
    const taxEl = document.getElementById('checkout-tax');
    const totalEl = document.getElementById('checkout-total');
    const submitBtn = document.getElementById('checkout-submit-btn');

    listContainer.innerHTML = '';
    let subtotal = 0;

    if (cart.length === 0) {
        listContainer.innerHTML = '<p class="text-muted text-center py-4">Your basket is empty. Go back to <a href="menu.html">Menu</a>.</p>';
        submitBtn.disabled = true;
        subtotalEl.textContent = 'IDR 0';
        taxEl.textContent = 'IDR 0';
        totalEl.textContent = 'IDR 0';
        return;
    }

    submitBtn.disabled = false;

    cart.forEach(item => {
        subtotal += item.price * item.quantity;
        const itemEl = document.createElement('div');
        itemEl.className = 'd-flex justify-content-between align-items-center';
        itemEl.innerHTML = `
            <div class="d-flex align-items-center gap-3">
                <div class="position-relative">
                    <img src="${item.img}" alt="${item.name}" style="width: 56px; height: 56px; object-fit: cover; border-radius: 8px;">
                    <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-dark">
                        ${item.quantity}
                    </span>
                </div>
                <div>
                    <h3 class="font-serif fs-6 m-0" style="color: var(--text-stone-dark);">${item.name}</h3>
                    <button class="btn btn-link p-0 text-danger text-decoration-none small" onclick="removeFromCart('${item.id}')" style="font-size: 12px;">Remove</button>
                </div>
            </div>
            <span class="fw-semibold text-dark">${formatCurrency(item.price * item.quantity)}</span>
        `;
        listContainer.appendChild(itemEl);
    });

    const tax = subtotal * 0.11; // 11% PB1 tax
    const delivery = 0; // Delivery fee removed for dine-in/takeaway focus
    const total = subtotal + tax + delivery;

    subtotalEl.textContent = formatCurrency(subtotal);
    taxEl.textContent = formatCurrency(tax);
    totalEl.textContent = formatCurrency(total);
}

// 10. Handle Checkout Submission
function processCheckout(event) {
    event.preventDefault();
    if (cart.length === 0) return;
    
    // Get form data
    const fullName = document.getElementById('fullName') ? document.getElementById('fullName').value.trim() : '';
    const paymentElement = document.querySelector('input[name="payment"]:checked');
    const paymentMethod = paymentElement ? paymentElement.value : 'Cash';
    
    // Build order items string
    let orderDetails = cart.map(item => `- ${item.quantity}x ${item.name}`).join('%0A');
    
    // Format message
    const greeting = fullName ? `Halo kak, saya ${fullName}, saya mau pesan:` : `Halo kak, saya mau pesan:`;
    const message = `${greeting}%0A${orderDetails}%0A%0AMetode Pembayaran: ${paymentMethod}`;
    
    // Admin WhatsApp Number
    const waNumber = "628974294466"; 
    const waUrl = `https://wa.me/${waNumber}?text=${message}`;
    
    // Clear cart and redirect
    cart = [];
    saveCart();
    window.location.href = waUrl;
}

// 11. Initialize on Page Load
document.addEventListener("DOMContentLoaded", () => {
    renderCart();
    renderCheckout();
    
    const checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', processCheckout);
    }
});

// 12. Handle Variant Selection on Menu Cards
function updateVariant(itemId) {
    const card = document.getElementById(itemId);
    if (!card) return;

    const selectedRadio = card.querySelector('input[type="radio"]:checked');
    if (!selectedRadio) return;

    const price = parseInt(selectedRadio.getAttribute('data-price'));
    const icon = selectedRadio.getAttribute('data-icon');
    const iconColor = selectedRadio.getAttribute('data-icon-color');

    // Format price
    const formattedPrice = "Rp" + price.toLocaleString('id-ID');
    
    // Update DOM
    const priceDisplay = card.querySelector('.active-price');
    const iconDisplay = card.querySelector('.active-icon');

    if (priceDisplay) priceDisplay.innerText = formattedPrice;
    if (iconDisplay) {
        iconDisplay.innerText = icon;
        iconDisplay.style.color = iconColor;
    }
}

// 13. Handle Add to Cart for Variant Cards
function addVariantToCart(itemId) {
    const card = document.getElementById(itemId);
    if (!card) return;

    const selectedRadio = card.querySelector('input[type="radio"]:checked');
    if (!selectedRadio) return;

    const id = selectedRadio.getAttribute('data-id');
    const name = selectedRadio.getAttribute('data-name');
    const price = parseInt(selectedRadio.getAttribute('data-price'));
    const img = selectedRadio.getAttribute('data-img');

    addToCart(id, name, price, img);
}
