var bagItems = [];
var wishlistItems = [];
var activeCategory = 'all';
var sortOrder = 'default';

window.addEventListener('DOMContentLoaded', onLoad);

function onLoad() {
    loadFromStorage();
    renderProducts();
    updateBagIcon();
    bindSearch();
    bindSort();
    bindCategories();
}

function loadFromStorage() {
    try {
        bagItems = JSON.parse(localStorage.getItem('bagItems') || '[]');
        wishlistItems = JSON.parse(localStorage.getItem('wishlistItems') || '[]');
        items.forEach(function(item) {
            item.wishlist = wishlistItems.indexOf(item.id) !== -1;
        });
    } catch (e) { bagItems = []; wishlistItems = []; }
}

function saveToStorage() {
    localStorage.setItem('bagItems', JSON.stringify(bagItems));
    localStorage.setItem('wishlistItems', JSON.stringify(wishlistItems));
}

function addToBag(itemId, event) {
    if (event) event.stopPropagation();
    var alreadyIn = bagItems.some(function(id) { return id == itemId; });
    if (!alreadyIn) {
        bagItems.push(itemId);
        saveToStorage();
        updateBagIcon();
        var item = items.find(function(i) { return i.id == itemId; });
        showToast('Added to Bag — ' + (item ? item.company : 'Item'));
        var btn = document.querySelector('[data-id="' + itemId + '"] .btn-add-bag');
        if (btn) {
            btn.classList.add('added');
            btn.innerHTML = '<span class="material-symbols-outlined">check</span> Added';
        }
    } else {
        showToast('Already in your bag!');
    }
}

function updateBagIcon() {
    var badge = document.querySelector('.bag-item-count');
    if (!badge) return;
    if (bagItems.length > 0) {
        badge.textContent = bagItems.length;
        badge.style.visibility = 'visible';
    } else {
        badge.style.visibility = 'hidden';
    }
}

function toggleWishlist(itemId, event) {
    if (event) event.stopPropagation();
    var item = items.find(function(i) { return i.id == itemId; });
    if (!item) return;
    item.wishlist = !item.wishlist;
    if (item.wishlist) {
        if (wishlistItems.indexOf(itemId) === -1) wishlistItems.push(itemId);
        showToast('Added to Wishlist');
    } else {
        wishlistItems = wishlistItems.filter(function(id) { return id != itemId; });
        showToast('Removed from Wishlist');
    }
    saveToStorage();
    var btn = document.querySelector('[data-id="' + itemId + '"] .wishlist-btn');
    if (btn) {
        btn.classList.toggle('active', item.wishlist);
        btn.querySelector('.material-symbols-outlined').textContent = item.wishlist ? 'favorite' : 'favorite_border';
    }
}

function showToast(message) {
    var toast = document.getElementById('toast');
    if (!toast) return;
    toast.innerHTML = '<span class="material-symbols-outlined">check_circle</span> ' + message;
    toast.classList.add('show');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(function() { toast.classList.remove('show'); }, 2500);
}

function renderProducts() {
    var container = document.querySelector('.items-container');
    if (!container) return;
    var filtered = items.slice();
    if (activeCategory !== 'all') {
        filtered = filtered.filter(function(item) { return item.category === activeCategory; });
    }
    var searchInput = document.querySelector('.search_input');
    var searchVal = searchInput ? searchInput.value.toLowerCase().trim() : '';
    if (searchVal) {
        filtered = filtered.filter(function(item) {
            return item.company.toLowerCase().indexOf(searchVal) !== -1 ||
                   item.item_name.toLowerCase().indexOf(searchVal) !== -1 ||
                   (item.category || '').toLowerCase().indexOf(searchVal) !== -1;
        });
    }
    if (sortOrder === 'price-asc') filtered.sort(function(a,b){ return a.current_price - b.current_price; });
    else if (sortOrder === 'price-desc') filtered.sort(function(a,b){ return b.current_price - a.current_price; });
    else if (sortOrder === 'discount') filtered.sort(function(a,b){ return b.discount_percentage - a.discount_percentage; });
    else if (sortOrder === 'rating') filtered.sort(function(a,b){ return b.rating.stars - a.rating.stars; });

    var countEl = document.querySelector('.filter-count');
    if (countEl) countEl.innerHTML = filtered.length + ' <span>items</span>';

    if (filtered.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="material-symbols-outlined empty-icon">search_off</div><div class="empty-title">No products found</div><div class="empty-sub">Try a different search or category</div></div>';
        return;
    }
    var html = '';
    filtered.forEach(function(item) { html += generateItemHTML(item); });
    container.innerHTML = html;
}

function generateItemHTML(item) {
    var inBag = bagItems.some(function(id) { return id == item.id; });
    var ratingHTML = item.rating.count > 0
        ? '<span class="rating-pill"><span class="material-symbols-outlined">star</span>' + item.rating.stars + '</span><span class="rating-count">(' + item.rating.count.toLocaleString() + ')</span>'
        : '<span class="rating-count" style="color:#94969f">No ratings yet</span>';
    var discountHTML = item.discount_percentage > 0
        ? '<span class="original-price">&#8377;' + item.original_price.toLocaleString() + '</span><span class="discount">(' + item.discount_percentage + '% OFF)</span>' : '';
    var discountBadge = item.discount_percentage > 0
        ? '<div class="discount-badge">' + item.discount_percentage + '% OFF</div>' : '';
    var bagBtnHTML = inBag
        ? '<button class="btn-add-bag added" onclick="addToBag(\'' + item.id + '\', event)"><span class="material-symbols-outlined">check</span> Added</button>'
        : '<button class="btn-add-bag" onclick="addToBag(\'' + item.id + '\', event)"><span class="material-symbols-outlined">shopping_bag</span> Add to Bag</button>';

    return '<div class="item-container" data-id="' + item.id + '">' +
        '<button class="wishlist-btn ' + (item.wishlist ? 'active' : '') + '" onclick="toggleWishlist(\'' + item.id + '\', event)">' +
        '<span class="material-symbols-outlined">' + (item.wishlist ? 'favorite' : 'favorite_border') + '</span></button>' +
        '<div class="item-image-wrap">' +
        '<img class="item-image" src="images/' + item.image + '" alt="' + item.item_name + '" loading="lazy">' +
        discountBadge + '</div>' +
        '<div class="item-body">' +
        '<div class="rating">' + ratingHTML + '</div>' +
        '<div class="company-name">' + item.company + '</div>' +
        '<div class="item-name">' + item.item_name + '</div>' +
        '<div class="price"><span class="current-price">&#8377;' + item.current_price.toLocaleString() + '</span>' + discountHTML + '</div>' +
        bagBtnHTML + '</div></div>';
}

function bindSearch() {
    var input = document.querySelector('.search_input');
    if (!input) return;
    var timer;
    input.addEventListener('input', function() { clearTimeout(timer); timer = setTimeout(renderProducts, 300); });
}

function bindSort() {
    var sel = document.querySelector('.sort-select');
    if (!sel) return;
    sel.addEventListener('change', function(e) { sortOrder = e.target.value; renderProducts(); });
}

function bindCategories() {
    document.querySelectorAll('.category-chip').forEach(function(chip) {
        chip.addEventListener('click', function() {
            document.querySelectorAll('.category-chip').forEach(function(c) { c.classList.remove('active'); });
            chip.classList.add('active');
            activeCategory = chip.dataset.cat;
            renderProducts();
        });
    });
}

function filterByNav(el, cat) {
    activeCategory = cat;
    document.querySelectorAll('.category-chip').forEach(function(c) {
        c.classList.toggle('active', c.dataset.cat === cat);
    });
    renderProducts();
    var section = document.querySelector('.items-section');
    if (section) section.scrollIntoView({ behavior: 'smooth' });
}

function sortByDiscount() {
    sortOrder = 'discount';
    var sel = document.querySelector('.sort-select');
    if (sel) sel.value = 'discount';
    renderProducts();
}
