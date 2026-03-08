/* ============================================================
   MYNTRA CLONE — wishlist.js
   ============================================================ */

var wishlistItems = [];
var bagItems = [];

window.addEventListener('DOMContentLoaded', onWishlistLoad);

function onWishlistLoad() {
    loadFromStorage();
    renderWishlist();
    updateBagIcon();
    if (typeof updateBottomNavBadges === "function") updateBottomNavBadges();
    bindClearAll();
}

function loadFromStorage() {
    try {
        wishlistItems = JSON.parse(localStorage.getItem('wishlistItems') || '[]');
        bagItems      = JSON.parse(localStorage.getItem('bagItems')      || '[]');
    } catch(e) { wishlistItems = []; bagItems = []; }
}

function saveToStorage() {
    localStorage.setItem('wishlistItems', JSON.stringify(wishlistItems));
    localStorage.setItem('bagItems',      JSON.stringify(bagItems));
}

/* ── Render ── */
function renderWishlist() {
    var grid    = document.getElementById('wishlistGrid');
    var countEl = document.getElementById('wlCount');
    if (!grid) return;

    var wishProducts = wishlistItems
        .map(function(id) { return items.find(function(i) { return i.id == id; }); })
        .filter(Boolean);

    if (countEl) countEl.textContent = wishProducts.length + ' item' + (wishProducts.length !== 1 ? 's' : '');

    if (wishProducts.length === 0) {
        grid.innerHTML =
            '<div class="wl-empty">' +
            '<div class="material-symbols-outlined wl-empty-icon">favorite_border</div>' +
            '<h2>Your Wishlist is empty</h2>' +
            '<p>Save items you love by clicking the ♡ on any product</p>' +
            '<button class="btn-wl-shop" onclick="window.location.href=\'/Myntra_Clone_Professional/index.html\'">Continue Shopping</button>' +
            '</div>';
        return;
    }

    var html = '';
    wishProducts.forEach(function(item) { html += generateWishCard(item); });
    grid.innerHTML = html;

    // Bind events via delegation
    grid.addEventListener('click', handleGridClick);
}

function handleGridClick(e) {
    var removeBtn = e.target.closest('.wl-remove-btn');
    var bagBtn    = e.target.closest('.btn-wl-bag');
    if (removeBtn) removeFromWishlist(removeBtn.dataset.id);
    if (bagBtn)    addToBagFromWishlist(bagBtn.dataset.id);
}

function generateWishCard(item) {
    var inBag      = bagItems.some(function(id) { return id == item.id; });
    var hasDiscount = item.discount_percentage > 0;

    var ratingHTML = item.rating.count > 0
        ? '<span class="wl-rating-pill"><span class="material-symbols-outlined">star</span>' + item.rating.stars + '</span>' +
          '<span class="wl-rating-count">(' + item.rating.count.toLocaleString() + ')</span>'
        : '<span class="wl-rating-count" style="color:#94969f">No ratings</span>';

    var bagBtnHTML = inBag
        ? '<button class="btn-wl-bag added" data-id="' + item.id + '"><span class="material-symbols-outlined">check</span> Added</button>'
        : '<button class="btn-wl-bag" data-id="' + item.id + '"><span class="material-symbols-outlined">shopping_bag</span> Add to Bag</button>';

    var html = '<div class="wl-card">';
    html += '<button class="wl-remove-btn" data-id="' + item.id + '" title="Remove from Wishlist">';
    html += '<span class="material-symbols-outlined">close</span></button>';
    html += '<div class="wl-img-wrap">';
    if (hasDiscount) html += '<div class="wl-discount-badge">' + item.discount_percentage + '% OFF</div>';
    html += '<img class="wl-img" src="/Myntra_Clone_Professional/' + item.image + '" alt="' + item.item_name + '" loading="lazy">';
    html += '</div>';
    html += '<div class="wl-body">';
    html += '<div class="wl-rating">' + ratingHTML + '</div>';
    html += '<div class="wl-brand">' + item.company + '</div>';
    html += '<div class="wl-name">' + item.item_name + '</div>';
    html += '<div class="wl-price">';
    html += '<span class="wl-current">&#8377;' + item.current_price.toLocaleString() + '</span>';
    if (hasDiscount) {
        html += '<span class="wl-original">&#8377;' + item.original_price.toLocaleString() + '</span>';
        html += '<span class="wl-off">(' + item.discount_percentage + '% OFF)</span>';
    }
    html += '</div>';
    html += '<div class="wl-actions">' + bagBtnHTML + '</div>';
    html += '</div></div>';
    return html;
}

/* ── Actions ── */
function removeFromWishlist(itemId) {
    wishlistItems = wishlistItems.filter(function(id) { return id != itemId; });
    saveToStorage();
    renderWishlist();
    showToast('Removed from Wishlist');
}

function addToBagFromWishlist(itemId) {
    var alreadyIn = bagItems.some(function(id) { return id == itemId; });
    if (!alreadyIn) {
        bagItems.push(itemId);
        saveToStorage();
        updateBagIcon();
        var item = items.find(function(i) { return i.id == itemId; });
        showToast('Added to Bag — ' + (item ? item.company : 'Item'));
        // Update button
        var btn = document.querySelector('.btn-wl-bag[data-id="' + itemId + '"]');
        if (btn) {
            btn.classList.add('added');
            btn.innerHTML = '<span class="material-symbols-outlined">check</span> Added';
        }
    } else {
        showToast('Already in your Bag!');
    }
}

function bindClearAll() {
    var btn = document.getElementById('clearAllBtn');
    if (!btn) return;
    btn.addEventListener('click', function() {
        if (wishlistItems.length === 0) return;
        wishlistItems = [];
        saveToStorage();
        renderWishlist();
        showToast('Wishlist cleared');
    });
}

function updateBagIcon() {
    var badge = document.querySelector('.bag-item-count');
    if (!badge) return;
    badge.textContent   = bagItems.length;
    badge.style.visibility = bagItems.length > 0 ? 'visible' : 'hidden';
}

function showToast(msg) {
    var toast = document.getElementById('toast');
    if (!toast) return;
    toast.innerHTML = '<span class="material-symbols-outlined">check_circle</span> ' + msg;
    toast.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(function() { toast.classList.remove('show'); }, 2500);
}

/* ── Bottom Nav Badges ── */
function updateBottomNavBadges() {
    var bagBadge  = document.getElementById('bn-bag-count');
    var wishBadge = document.getElementById('bn-wish-count');
    if (bagBadge) {
        bagBadge.textContent = bagItems.length;
        bagBadge.classList.toggle('visible', bagItems.length > 0);
    }
    if (wishBadge) {
        wishBadge.textContent = wishlistItems.length;
        wishBadge.classList.toggle('visible', wishlistItems.length > 0);
    }
}
