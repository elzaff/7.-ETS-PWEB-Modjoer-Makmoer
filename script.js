// logika keranjang buat website modjoer

// ambil keranjang dari localstorage kalo ada
let myCart = JSON.parse(localStorage.getItem('modjoer_cart')) || [];

// fungsi buat simpan keranjang
function storeCart() {
    localStorage.setItem('modjoer_cart', JSON.stringify(myCart));
}

// buka tutup keranjang sidebar
function toggleCart() {
    const sidebar = document.getElementById('cartSidebar');
    if (sidebar) {
        sidebar.classList.toggle('show');
    }
}

// format harga kerupiah
function formatRupiah(amount) {
    return 'IDR ' + amount.toLocaleString('id-ID');
}

// nambahin item ke keranjang
function putInCart(id, name, price, img) {
    const existingItem = myCart.find(item => item.id === id);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        myCart.push({
            id: id,
            name: name,
            price: parseInt(price),
            img: img,
            quantity: 1
        });
    }
    storeCart();
    showCart();
    
    // buka otomatis pas nambah barang
    const sidebar = document.getElementById('cartSidebar');
    if (sidebar && !sidebar.classList.contains('show')) {
        sidebar.classList.add('show');
    }
}

// ngubah jumlah item
function changeQty(id, change) {
    const itemIndex = myCart.findIndex(item => item.id === id);
    if (itemIndex > -1) {
        myCart[itemIndex].quantity += change;
        if (myCart[itemIndex].quantity <= 0) {
            myCart.splice(itemIndex, 1);
        }
        storeCart();
        showCart();
        showCheckoutPage(); // update kalo lagi di page checkout
    }
}

// hapus dari keranjang
function removeItem(id) {
    myCart = myCart.filter(item => item.id !== id);
    storeCart();
    showCart();
    showCheckoutPage(); // update kalo lagi di page checkout
}

// nampilin keranjang di sidebar
function showCart() {
    const container = document.getElementById('cart-items-container');
    const counter = document.getElementById('cart-counter');
    const totalPriceEl = document.getElementById('cart-total-price');
    const checkoutBtn = document.getElementById('cart-checkout-btn');

    if (!container) return; // keluar kalo ga ada container

    container.innerHTML = '';
    let totalItems = 0;
    let totalPrice = 0;

    if (myCart.length === 0) {
        container.innerHTML = `
            <div class="text-center text-muted my-auto">
                <span class="material-symbols-outlined mb-2" style="font-size: 48px; opacity: 0.5;">shopping_basket</span>
                <p>Keranjang Anda kosong.</p>
            </div>
        `;
        if (checkoutBtn) checkoutBtn.classList.add('disabled');
    } else {
        if (checkoutBtn) checkoutBtn.classList.remove('disabled');
        
        myCart.forEach(item => {
            totalItems += item.quantity;
            totalPrice += item.price * item.quantity;

            const itemEl = document.createElement('div');
            itemEl.className = 'd-flex gap-3 align-items-center';
            itemEl.innerHTML = `
                <img src="${item.img}" alt="${item.name}" style="width: 64px; height: 64px; object-fit: cover; border-radius: 8px;">
                <div class="flex-grow-1">
                    <h3 class="font-serif fs-6 m-0 mb-1" style="color: var(--text-stone-dark);">${item.name}</h3>
                    <p class="text-primary fw-semibold m-0" style="font-size: 14px;">${formatRupiah(item.price * item.quantity)}</p>
                </div>
                <div class="d-flex flex-column align-items-end gap-2">
                    <button class="btn btn-link p-0 text-muted" onclick="removeItem('${item.id}')" title="Hapus">
                        <span class="material-symbols-outlined" style="font-size: 18px;">delete</span>
                    </button>
                    <div class="d-flex align-items-center gap-2 bg-light rounded px-2 py-1 border">
                        <button class="btn btn-link p-0 text-dark text-decoration-none" onclick="changeQty('${item.id}', -1)" style="line-height: 1;">-</button>
                        <span class="small fw-semibold" style="min-width: 12px; text-align: center;">${item.quantity}</span>
                        <button class="btn btn-link p-0 text-dark text-decoration-none" onclick="changeQty('${item.id}', 1)" style="line-height: 1;">+</button>
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
        totalPriceEl.textContent = formatRupiah(totalPrice);
    }
}

// nampilin halaman checkout
function showCheckoutPage() {
    const listContainer = document.getElementById('checkout-item-list');
    if (!listContainer) return;

    const subtotalEl = document.getElementById('checkout-subtotal');
    const taxEl = document.getElementById('checkout-tax');
    const totalEl = document.getElementById('checkout-total');
    const submitBtn = document.getElementById('checkout-submit-btn');

    listContainer.innerHTML = '';
    let subtotal = 0;

    if (myCart.length === 0) {
        listContainer.innerHTML = '<p class="text-muted text-center py-4">Keranjang Anda kosong. Kembali ke <a href="menu.html">Menu</a>.</p>';
        submitBtn.disabled = true;
        subtotalEl.textContent = 'IDR 0';
        taxEl.textContent = 'IDR 0';
        totalEl.textContent = 'IDR 0';
        return;
    }

    submitBtn.disabled = false;

    myCart.forEach(item => {
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
                    <button class="btn btn-link p-0 text-danger text-decoration-none small" onclick="removeItem('${item.id}')" style="font-size: 12px;">Hapus</button>
                </div>
            </div>
            <span class="fw-semibold text-dark">${formatRupiah(item.price * item.quantity)}</span>
        `;
        listContainer.appendChild(itemEl);
    });

    const tax = subtotal * 0.11; // pajak pb1 11%
    const delivery = 0; // ga ada ongkir, fokus makan di tempat/takeaway
    const total = subtotal + tax + delivery;

    subtotalEl.textContent = formatRupiah(subtotal);
    taxEl.textContent = formatRupiah(tax);
    totalEl.textContent = formatRupiah(total);
}

// jalanin pas mau bayar
function submitOrder(event) {
    event.preventDefault();
    if (myCart.length === 0) return;
    
    // ambil isian form
    const fullName = document.getElementById('fullName') ? document.getElementById('fullName').value.trim() : '';
    const paymentElement = document.querySelector('input[name="payment"]:checked');
    const paymentMethod = paymentElement ? paymentElement.value : 'Cash';
    
    // bikin rincian pesanan
    let orderDetails = myCart.map(item => `- ${item.quantity}x ${item.name}`).join('%0A');
    
    // kalimat pesan buat wa
    const greeting = fullName ? `Halo kak, saya ${fullName}, saya mau pesan:` : `Halo kak, saya mau pesan:`;
    const message = `${greeting}%0A${orderDetails}%0A%0AMetode Pembayaran: ${paymentMethod}`;
    
    // nomor wa admin
    const waNumber = "628974294466"; 
    const waUrl = `https://wa.me/${waNumber}?text=${message}`;
    
    // kosongin keranjang terus pindah ke wa
    myCart = [];
    storeCart();
    window.location.href = waUrl;
}

// pas halaman baru kelar loading
document.addEventListener("DOMContentLoaded", () => {
    showCart();
    showCheckoutPage();
    
    const checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', submitOrder);
    }
});

// ganti varian harga pas diklik di menu
function changeVariant(itemId) {
    const card = document.getElementById(itemId);
    if (!card) return;

    const selectedRadio = card.querySelector('input[type="radio"]:checked');
    if (!selectedRadio) return;

    const price = parseInt(selectedRadio.getAttribute('data-price'));
    const icon = selectedRadio.getAttribute('data-icon');
    const iconColor = selectedRadio.getAttribute('data-icon-color');

    // benerin format harga
    const formattedPrice = "Rp" + price.toLocaleString('id-ID');
    
    // ganti tulisan di html
    const priceDisplay = card.querySelector('.active-price');
    const iconDisplay = card.querySelector('.active-icon');

    if (priceDisplay) priceDisplay.innerText = formattedPrice;
    if (iconDisplay) {
        iconDisplay.innerText = icon;
        iconDisplay.style.color = iconColor;
    }
}

// milih varian terus dimasukin ke keranjang
function putVariantInCart(itemId) {
    const card = document.getElementById(itemId);
    if (!card) return;

    const selectedRadio = card.querySelector('input[type="radio"]:checked');
    if (!selectedRadio) return;

    const id = selectedRadio.getAttribute('data-id');
    const name = selectedRadio.getAttribute('data-name');
    const price = parseInt(selectedRadio.getAttribute('data-price'));
    
    const imgElement = card.querySelector('img');
    const img = imgElement ? imgElement.src : selectedRadio.getAttribute('data-img');

    putInCart(id, name, price, img);
}
