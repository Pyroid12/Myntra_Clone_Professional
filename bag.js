var CONVENIENCE_FEE = 99;
var COUPON_CODES = { 'MYNTRA10': 0.10, 'FIRST20': 0.20, 'SALE30': 0.30 };
var bagItemObjects = [];
var quantities = {};
var appliedCoupon = null;

window.addEventListener('DOMContentLoaded', onBagLoad);

function onBagLoad() {
    loadBagItemObjects();
    renderBagPage();
    // Event delegation for bag actions
    document.addEventListener('click', function(e) {
        var removeBtn = e.target.closest('.remove-from-cart');
        var qtyBtn = e.target.closest('.qty-btn');
        var sizePill = e.target.closest('.size-pill');
        if (removeBtn) removeFromBag(removeBtn.dataset.id);
        if (qtyBtn) changeQty(qtyBtn.dataset.id, parseInt(qtyBtn.dataset.delta));
        if (sizePill) selectSize(sizePill, sizePill.dataset.item);
    });
}

function loadBagItemObjects() {
    var bagItems = [];
    try { bagItems = JSON.parse(localStorage.getItem('bagItems') || '[]'); } catch(e) {}
    bagItemObjects = bagItems.map(function(id) {
        return items.find(function(item) { return item.id == id; });
    }).filter(Boolean);
    bagItemObjects.forEach(function(item) {
        if (!quantities[item.id]) quantities[item.id] = 1;
    });
    updateBagBadge(bagItemObjects.length);
}

function updateBagBadge(count) {
    var badge = document.querySelector('.bag-item-count');
    if (!badge) return;
    badge.textContent = count;
    badge.style.visibility = count > 0 ? 'visible' : 'hidden';
}

function renderBagPage() {
    renderBagItems();
    renderBagSummary();
}

function renderBagItems() {
    var container = document.querySelector('.bag-items-container');
    if (!container) return;

    var count = bagItemObjects.length;
    var header = '<div class="bag-header"><h2>My Bag</h2><span>' + count + ' item' + (count !== 1 ? 's' : '') + '</span></div>';

    if (count === 0) {
        container.innerHTML = header +
            '<div class="empty-bag">' +
            '<div class="material-symbols-outlined empty-bag-icon">shopping_bag</div>' +
            '<h2>Your bag is empty</h2><p>Add items to it now</p>' +
            '<button class="btn-continue-shopping" id="continueBtn">Shop Now</button>' +
            '</div>';
        document.getElementById('continueBtn').addEventListener('click', function() {
            window.location.href='/Myntra_Clone_Professional/index.html';
        });
        return;
    }

    var html = header;
    bagItemObjects.forEach(function(item) { html += generateBagItemHTML(item); });
    container.innerHTML = html;
}

function generateBagItemHTML(item) {
    var qty = quantities[item.id] || 1;
    var hasDiscount = item.discount_percentage > 0;

    var sizesHTML = '';
    (item.sizes || ['M']).slice(0, 4).forEach(function(s, i) {
        sizesHTML += '<span class="size-pill ' + (i === 0 ? 'selected' : '') + '" data-item="' + item.id + '">' + s + '</span>';
    });

    var html = '<div class="bag-item-card" data-id="' + item.id + '">';
    html += '<div class="bag-item-img-wrap"><img class="bag-item-img" src="/Myntra_Clone_Professional/' + item.image + '" alt="' + item.item_name + '"></div>';
    html += '<div class="bag-item-details">';
    html += '<div class="bag-item-brand">' + item.company + '</div>';
    html += '<div class="bag-item-name">' + item.item_name + '</div>';
    html += '<div class="bag-item-size"><span class="size-label">SIZE:</span>' + sizesHTML + '</div>';
    html += '<div class="bag-item-qty">';
    html += '<button class="qty-btn" data-id="' + item.id + '" data-delta="-1">&#8722;</button>';
    html += '<span class="qty-val" id="qty-' + item.id + '">' + qty + '</span>';
    html += '<button class="qty-btn" data-id="' + item.id + '" data-delta="1">+</button>';
    html += '</div>';
    html += '<div class="bag-item-price"><span class="bag-current-price">&#8377;' + item.current_price.toLocaleString() + '</span>';
    if (hasDiscount) {
        html += '<span class="bag-original-price">&#8377;' + item.original_price.toLocaleString() + '</span>';
        html += '<span class="bag-discount">' + item.discount_percentage + '% OFF</span>';
    }
    html += '</div>';
    html += '<div class="bag-item-meta">';
    if (item.return_period) html += '<span class="return-highlight">' + item.return_period + ' days</span> return &nbsp;&middot;&nbsp; ';
    html += 'Delivery <span class="delivery-highlight">' + (item.delivery_date || 'in 3-5 days') + '</span>';
    html += '</div></div>';
    html += '<button class="remove-from-cart" data-id="' + item.id + '" title="Remove"><span class="material-symbols-outlined">close</span></button>';
    html += '</div>';
    return html;
}

function changeQty(itemId, delta) {
    quantities[itemId] = Math.max(1, Math.min(10, (quantities[itemId] || 1) + delta));
    var el = document.getElementById('qty-' + itemId);
    if (el) el.textContent = quantities[itemId];
    renderBagSummary();
}

function selectSize(el, itemId) {
    var card = document.querySelector('.bag-item-card[data-id="' + itemId + '"]');
    if (card) card.querySelectorAll('.size-pill').forEach(function(p) { p.classList.remove('selected'); });
    el.classList.add('selected');
}

function removeFromBag(itemId) {
    var bagItems = [];
    try { bagItems = JSON.parse(localStorage.getItem('bagItems') || '[]'); } catch(e) {}
    bagItems = bagItems.filter(function(id) { return id != itemId; });
    localStorage.setItem('bagItems', JSON.stringify(bagItems));
    window.dispatchEvent(new Event('storage-update'));
    bagItemObjects = bagItemObjects.filter(function(item) { return item.id != itemId; });
    delete quantities[itemId];
    renderBagPage();
    updateBagBadge(bagItemObjects.length);
}

function applyCoupon() {
    var input = document.querySelector('.coupon-input');
    var code = (input ? input.value : '').toUpperCase().trim();
    if (COUPON_CODES[code]) {
        appliedCoupon = { code: code, rate: COUPON_CODES[code] };
        renderBagSummary();
        showBagToast('Coupon applied! ' + (COUPON_CODES[code] * 100).toFixed(0) + '% off');
    } else {
        showBagToast('Invalid code. Try: MYNTRA10, FIRST20, SALE30');
    }
}

function removeCoupon() {
    appliedCoupon = null;
    renderBagSummary();
}

function renderBagSummary() {
    var summaryEl = document.querySelector('.bag-summary');
    if (!summaryEl) return;

    var totalMRP = 0, totalDiscount = 0;
    bagItemObjects.forEach(function(item) {
        var qty = quantities[item.id] || 1;
        totalMRP += item.original_price * qty;
        totalDiscount += (item.original_price - item.current_price) * qty;
    });

    var couponDiscount = appliedCoupon ? Math.round((totalMRP - totalDiscount) * appliedCoupon.rate) : 0;
    var delivery = (totalMRP - totalDiscount) >= 999 ? 0 : CONVENIENCE_FEE;
    var total = totalMRP - totalDiscount - couponDiscount + delivery;
    var savings = totalDiscount + couponDiscount;

    var html = '<div class="summary-card">';
    html += '<div class="coupon-section"><div class="coupon-input-wrap">';
    html += '<input class="coupon-input" placeholder="Enter coupon code" value="' + (appliedCoupon ? appliedCoupon.code : '') + '">';
    html += '<button class="btn-apply-coupon" id="applyBtn">APPLY</button></div>';
    if (appliedCoupon) {
        html += '<div style="font-size:12px;color:#03a685;margin-top:6px;">&#10003; ' + (appliedCoupon.rate * 100).toFixed(0) + '% off applied <span id="removeCouponBtn" style="color:#ff3f6c;cursor:pointer;margin-left:8px;">Remove</span></div>';
    } else {
        html += '<div style="font-size:11px;color:#94969f;margin-top:6px;">Try: MYNTRA10, FIRST20, SALE30</div>';
    }
    html += '</div>';
    html += '<div class="price-header">PRICE DETAILS (' + bagItemObjects.length + ' Item' + (bagItemObjects.length !== 1 ? 's' : '') + ')</div>';
    html += '<div class="price-row"><span class="price-row-label">Total MRP</span><span>&#8377;' + totalMRP.toLocaleString() + '</span></div>';
    html += '<div class="price-row"><span class="price-row-label">Discount on MRP</span><span class="price-row-discount">&#8722;&#8377;' + totalDiscount.toLocaleString() + '</span></div>';
    if (appliedCoupon) html += '<div class="price-row"><span class="price-row-label">Coupon Discount</span><span class="price-row-discount">&#8722;&#8377;' + couponDiscount.toLocaleString() + '</span></div>';
    html += '<div class="price-row"><span class="price-row-label">Convenience Fee</span><span>' + (delivery === 0 ? '<span style="color:#03a685;font-weight:700;">FREE</span>' : '&#8377;' + delivery) + '</span></div>';
    html += '<hr class="price-divider">';
    html += '<div class="price-total"><span>Total Amount</span><span>&#8377;' + total.toLocaleString() + '</span></div>';
    if (savings > 0) html += '<div class="savings-note">You will save &#8377;' + savings.toLocaleString() + ' on this order &#127881;</div>';
    html += '<button class="btn-place-order" id="placeOrderBtn"><span class="material-symbols-outlined">bolt</span> PLACE ORDER</button>';
    html += '<div class="safe-note"><span class="material-symbols-outlined">lock</span> Safe and Secure Payments</div>';
    html += '</div>';

    summaryEl.innerHTML = html;

    // Bind buttons safely - no inline onclick
    document.getElementById('applyBtn').addEventListener('click', applyCoupon);
    document.getElementById('placeOrderBtn').addEventListener('click', placeOrder);
    var removeBtn = document.getElementById('removeCouponBtn');
    if (removeBtn) removeBtn.addEventListener('click', removeCoupon);
}

function placeOrder() {
    if (bagItemObjects.length === 0) { showBagToast('Your bag is empty!'); return; }
    localStorage.removeItem('bagItems');
    showBagToast('Order placed successfully!');
    setTimeout(function() { window.location.href='/Myntra_Clone_Professional/index.html'; }, 1800);
}

function showBagToast(msg) {
    var toast = document.getElementById('bag-toast');
    if (!toast) return;
    toast.innerHTML = '<span class="material-symbols-outlined">check_circle</span> ' + msg;
    toast.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(function() { toast.classList.remove('show'); }, 2500);
}
