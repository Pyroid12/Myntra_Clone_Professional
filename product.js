/* ============================================================
   MYNTRA CLONE — product.js
   ============================================================ */

var bagItems      = [];
var wishlistItems = [];
var currentItem   = null;
var selectedSize  = null;

window.addEventListener('DOMContentLoaded', onProductLoad);

function onProductLoad() {
    loadFromStorage();
    loadProduct();
    updateBagIcon();
    if (typeof updateBottomNavBadges === "function") updateBottomNavBadges();
    updateWishlistIcon();
}

function loadFromStorage() {
    try {
        bagItems      = JSON.parse(localStorage.getItem('bagItems')      || '[]');
        wishlistItems = JSON.parse(localStorage.getItem('wishlistItems') || '[]');
    } catch(e) { bagItems = []; wishlistItems = []; }
}

function saveToStorage() {
    localStorage.setItem('bagItems',      JSON.stringify(bagItems));
    localStorage.setItem('wishlistItems', JSON.stringify(wishlistItems));
    window.dispatchEvent(new Event('storage-update'));
}

/* ── Load product from URL param ── */
function loadProduct() {
    var params = new URLSearchParams(window.location.search);
    var id     = params.get('id');

    if (!id) { window.location.href = '/Myntra_Clone_Professional/index.html'; return; }

    currentItem = items.find(function(i) { return i.id == id; });
    if (!currentItem) { window.location.href = '/Myntra_Clone_Professional/index.html'; return; }

    // Update page title
    document.title = currentItem.company + ' — ' + currentItem.item_name + ' | Myntra';

    renderProduct();
    renderSimilar();
}

/* ── Render full product page ── */
function renderProduct() {
    var item       = currentItem;
    var inBag      = bagItems.some(function(id) { return id == item.id; });
    var inWishlist = wishlistItems.some(function(id) { return id == item.id; });
    var hasDiscount = item.discount_percentage > 0;

    var bagBtnText  = inBag
        ? '<span class="material-symbols-outlined">check</span> Added to Bag'
        : '<span class="material-symbols-outlined">shopping_bag</span> Add to Bag';

    var wishBtnText = inWishlist
        ? '<span class="material-symbols-outlined">favorite</span> Wishlisted'
        : '<span class="material-symbols-outlined">favorite_border</span> Wishlist';

    var sizesHTML = item.sizes.map(function(size) {
        return '<button class="pd-size-btn" data-size="' + size + '">' + size + '</button>';
    }).join('');

    var starsHTML = '';
    var fullStars  = Math.floor(item.rating.stars);
    var halfStar   = (item.rating.stars - fullStars) >= 0.5;
    for (var i = 0; i < fullStars; i++)  starsHTML += '★';
    if (halfStar) starsHTML += '½';

    var html = '';

    // Breadcrumb
    html += '<div class="pd-breadcrumb">';
    html += '<a href="/Myntra_Clone_Professional/index.html">Home</a>';
    html += '<span>›</span>';
    html += '<a href="/Myntra_Clone_Professional/index.html">' + capitalise(item.category) + '</a>';
    html += '<span>›</span>';
    html += '<span>' + item.company + '</span>';
    html += '</div>';

    // Main grid
    html += '<div class="pd-main">';

    // LEFT — Image
    html += '<div class="pd-image-section">';
    html += '<div class="pd-main-img-wrap">';
    if (hasDiscount) html += '<div class="pd-img-badge">' + item.discount_percentage + '% OFF</div>';
    html += '<img class="pd-main-img" id="pdMainImg" src="/Myntra_Clone_Professional/' + item.image + '" alt="' + item.item_name + '">';
    html += '</div>';

    // Thumbnails (same image repeated for demo)
    html += '<div class="pd-thumbnails">';
    for (var t = 0; t < 4; t++) {
        html += '<div class="pd-thumb ' + (t === 0 ? 'active' : '') + '" data-img="/Myntra_Clone_Professional/' + item.image + '">';
        html += '<img src="/Myntra_Clone_Professional/' + item.image + '" alt="view ' + (t+1) + '">';
        html += '</div>';
    }
    html += '</div>';

    // Share + Wishlist image buttons
    html += '<div class="pd-img-actions">';
    html += '<button class="pd-img-action-btn pd-share-btn" onclick="shareProduct()" title="Share this product">';
    html += '<span class="material-symbols-outlined">share</span> Share</button>';
    html += '<button class="pd-img-action-btn ' + (inWishlist ? 'active' : '') + '" id="imgWishBtn" onclick="toggleWishlist()">';
    html += '<span class="material-symbols-outlined">' + (inWishlist ? 'favorite' : 'favorite_border') + '</span> Wishlist</button>';
    html += '</div>';
    html += '</div>'; // end image section

    // RIGHT — Details
    html += '<div class="pd-details">';

    // Brand & Name
    html += '<div class="pd-brand">' + item.company + '</div>';
    html += '<div class="pd-name">' + item.item_name + '</div>';

    // Rating
    if (item.rating.count > 0) {
        html += '<div class="pd-rating">';
        html += '<span class="pd-rating-pill"><span class="material-symbols-outlined">star</span>' + item.rating.stars + '</span>';
        html += '<span class="pd-rating-count">' + item.rating.count.toLocaleString() + ' Ratings</span>';
        html += '<span class="pd-rating-divider">|</span>';
        html += '<span class="pd-verified">Verified Buyers</span>';
        html += '</div>';
    }

    // Price
    html += '<div class="pd-price-section">';
    html += '<div class="pd-price-row">';
    html += '<span class="pd-current-price">&#8377;' + item.current_price.toLocaleString() + '</span>';
    if (hasDiscount) {
        html += '<span class="pd-original-price">&#8377;' + item.original_price.toLocaleString() + '</span>';
        html += '<span class="pd-discount">(' + item.discount_percentage + '% OFF)</span>';
    }
    html += '</div>';
    html += '<div class="pd-tax-note">Inclusive of all taxes</div>';
    html += '</div>';

    // Offers
    html += '<div class="pd-offers">';
    html += '<div class="pd-offers-title">🏷️ Available Offers</div>';
    html += '<div class="pd-offer-item"><span class="material-symbols-outlined">sell</span>10% off on first order. Use code <strong>FIRST20</strong></div>';
    html += '<div class="pd-offer-item"><span class="material-symbols-outlined">sell</span>Extra 30% off on orders above ₹999. Use code <strong>SALE30</strong></div>';
    html += '<div class="pd-offer-item"><span class="material-symbols-outlined">sell</span>Free delivery on orders above ₹999</div>';
    html += '</div>';

    // Size selector
    html += '<div class="pd-size-section">';
    html += '<div class="pd-size-header">';
    html += '<span class="pd-size-label">Select Size</span>';
    if (item.sizes[0] !== 'One Size') {
        html += '<button class="pd-size-guide" onclick="openSizeGuide()"><span class="material-symbols-outlined">straighten</span> Size Guide</button>';
    }
    html += '</div>';
    html += '<div class="pd-sizes">' + sizesHTML + '</div>';
    html += '<div class="pd-size-error" id="sizeError">Please select a size</div>';
    html += '</div>';

    // CTA Buttons
    html += '<div class="pd-cta-buttons">';
    html += '<button class="btn-pd-bag ' + (inBag ? 'added' : '') + '" id="pdBagBtn">' + bagBtnText + '</button>';
    html += '<button class="btn-pd-wishlist ' + (inWishlist ? 'active' : '') + '" id="pdWishBtn">' + wishBtnText + '</button>';
    html += '</div>';

    // Delivery info
    html += '<div class="pd-delivery">';
    html += '<div class="pd-delivery-title">Delivery & Services</div>';
    html += '<div class="pd-delivery-row"><span class="material-symbols-outlined">local_shipping</span>';
    html += '<span>Delivery <strong>' + item.delivery_date + '</strong> | Free on orders above ₹999</span></div>';
    html += '<div class="pd-delivery-row"><span class="material-symbols-outlined">location_on</span>';
    html += '<span>Delivering to <strong>Mumbai, 400001</strong></span></div>';
    html += '<div class="pd-delivery-row"><span class="material-symbols-outlined">verified_user</span>';
    html += '<span><strong>100% Original</strong> products from verified brands</span></div>';
    html += '</div>';

    // Return policy
    html += '<div class="pd-return">';
    html += '<span class="material-symbols-outlined">autorenew</span>';
    html += '<span><strong>' + item.return_period + ' Days</strong> return policy — Easy returns &amp; exchanges</span>';
    html += '</div>';

    // Accordion
    html += '<div class="pd-accordion">';
    html += accordionItem('Product Details', '<ul><li>Brand: ' + item.company + '</li><li>Category: ' + capitalise(item.category) + '</li><li>Style: Casual</li><li>Country of Origin: India</li></ul>', true);
    html += accordionItem('Size & Fit', '<p>Model is wearing size M. Model height: 5\'8"</p><br><p>Refer to size guide for accurate fit information.</p>', false);
    html += accordionItem('Material & Care', '<ul><li>High quality materials</li><li>Machine wash cold</li><li>Do not bleach</li><li>Tumble dry low</li></ul>', false);
    html += '</div>';

    html += '</div>'; // end details
    html += '</div>'; // end main grid

    document.getElementById('productPage').innerHTML = html;
    bindProductEvents();
}

function accordionItem(title, body, open) {
    return '<div class="pd-accordion-item">' +
        '<button class="pd-accordion-header ' + (open ? 'open' : '') + '">' +
        title + '<span class="material-symbols-outlined">expand_more</span></button>' +
        '<div class="pd-accordion-body ' + (open ? 'open' : '') + '">' + body + '</div>' +
        '</div>';
}

/* ── Bind all events ── */
function bindProductEvents() {
    // Size buttons
    document.querySelectorAll('.pd-size-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.pd-size-btn').forEach(function(b) { b.classList.remove('selected'); });
            btn.classList.add('selected');
            selectedSize = btn.dataset.size;
            document.getElementById('sizeError').style.display = 'none';
        });
    });

    // Auto-select if only one size
    if (currentItem.sizes.length === 1) {
        selectedSize = currentItem.sizes[0];
        var btn = document.querySelector('.pd-size-btn');
        if (btn) btn.classList.add('selected');
    }

    // Bag button
    var bagBtn = document.getElementById('pdBagBtn');
    if (bagBtn) bagBtn.addEventListener('click', addToBag);

    // Wishlist button
    var wishBtn = document.getElementById('pdWishBtn');
    if (wishBtn) wishBtn.addEventListener('click', toggleWishlist);

    // Thumbnails
    document.querySelectorAll('.pd-thumb').forEach(function(thumb) {
        thumb.addEventListener('click', function() {
            document.querySelectorAll('.pd-thumb').forEach(function(t) { t.classList.remove('active'); });
            thumb.classList.add('active');
            document.getElementById('pdMainImg').src = thumb.dataset.img;
        });
    });

    // Accordion
    document.querySelectorAll('.pd-accordion-header').forEach(function(header) {
        header.addEventListener('click', function() {
            var body = header.nextElementSibling;
            header.classList.toggle('open');
            body.classList.toggle('open');
        });
    });
}

/* ── Add to Bag ── */
function addToBag() {
    if (currentItem.sizes[0] !== 'One Size' && !selectedSize) {
        document.getElementById('sizeError').style.display = 'block';
        showToast('Please select a size first!');
        return;
    }
    var alreadyIn = bagItems.some(function(id) { return id == currentItem.id; });
    if (!alreadyIn) {
        bagItems.push(currentItem.id);
        saveToStorage();
        updateBagIcon();
        var btn = document.getElementById('pdBagBtn');
        if (btn) {
            btn.classList.add('added');
            btn.innerHTML = '<span class="material-symbols-outlined">check</span> Added to Bag';
        }
        showToast('Added to Bag — ' + currentItem.company);
    } else {
        window.location.href = '/Myntra_Clone_Professional/bag.html';
    }
}

/* ── Toggle Wishlist ── */
function toggleWishlist() {
    var inWishlist = wishlistItems.some(function(id) { return id == currentItem.id; });
    if (inWishlist) {
        wishlistItems = wishlistItems.filter(function(id) { return id != currentItem.id; });
        showToast('Removed from Wishlist');
    } else {
        wishlistItems.push(currentItem.id);
        showToast('Added to Wishlist ❤️');
    }
    saveToStorage();
    updateWishlistIcon();

    // Update both wishlist buttons
    var inWL = wishlistItems.some(function(id) { return id == currentItem.id; });
    var pdWishBtn  = document.getElementById('pdWishBtn');
    var imgWishBtn = document.getElementById('imgWishBtn');
    if (pdWishBtn) {
        pdWishBtn.classList.toggle('active', inWL);
        pdWishBtn.innerHTML = inWL
            ? '<span class="material-symbols-outlined">favorite</span> Wishlisted'
            : '<span class="material-symbols-outlined">favorite_border</span> Wishlist';
    }
    if (imgWishBtn) {
        imgWishBtn.classList.toggle('active', inWL);
        imgWishBtn.innerHTML = '<span class="material-symbols-outlined">' + (inWL ? 'favorite' : 'favorite_border') + '</span> Wishlist';
    }
}

/* ══════════════════════════════════════
   SHARE PRODUCT — Full Web Share API
══════════════════════════════════════ */
function shareProduct() {
    if (!currentItem) return;

    // Try native Web Share API first (mobile)
    if (navigator.share) {
        navigator.share({
            title : currentItem.company + ' — ' + currentItem.item_name,
            text  : '🛍️ Check out this on Myntra!\n' +
                    currentItem.item_name + '\n' +
                    '₹' + currentItem.current_price + ' (' + currentItem.discount_percentage + '% OFF)\n',
            url   : window.location.href
        }).then(function() {
            showToast('✅ Shared successfully!');
        }).catch(function(err) {
            if (err.name !== 'AbortError') openShareModal();
        });
    } else {
        // Desktop — open beautiful share modal
        openShareModal();
    }
}

function openShareModal() {
    if (!currentItem) return;

    // Fill product preview
    var img = document.getElementById('sharePreviewImg');
    var base = '/Myntra_Clone_Professional/';
    if (img) img.src = base + currentItem.image;

    var brand = document.getElementById('sharePreviewBrand');
    var name  = document.getElementById('sharePreviewName');
    var price = document.getElementById('sharePreviewPrice');
    var orig  = document.getElementById('sharePreviewOriginal');
    var disc  = document.getElementById('sharePreviewDiscount');
    if (brand) brand.textContent = currentItem.company;
    if (name)  name.textContent  = currentItem.item_name;
    if (price) price.textContent = '₹' + currentItem.current_price.toLocaleString();
    if (orig && currentItem.discount_percentage > 0) {
        orig.textContent = '₹' + currentItem.original_price.toLocaleString();
    }
    if (disc && currentItem.discount_percentage > 0) {
        disc.textContent = currentItem.discount_percentage + '% OFF';
    }

    // Fill URL bar
    var urlEl = document.getElementById('shareCopyUrl');
    if (urlEl) urlEl.textContent = window.location.href;

    // Open modal
    var overlay = document.getElementById('shareModalOverlay');
    if (overlay) overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeShareModal(e) {
    if (e && e.target !== document.getElementById('shareModalOverlay')) return;
    var overlay = document.getElementById('shareModalOverlay');
    if (overlay) overlay.classList.remove('open');
    document.body.style.overflow = '';
}

function shareVia(platform) {
    if (!currentItem) return;
    var url     = encodeURIComponent(window.location.href);
    var text    = encodeURIComponent(
        '🛍️ ' + currentItem.item_name + ' by ' + currentItem.company +
        ' — ₹' + currentItem.current_price + ' (' + currentItem.discount_percentage + '% OFF) on Myntra!'
    );
    var rawUrl  = window.location.href;

    switch (platform) {
        case 'whatsapp':
            window.open('https://wa.me/?text=' + text + '%20' + url, '_blank');
            closeShareModal({ target: document.getElementById('shareModalOverlay') });
            showToast('Opening WhatsApp… 💬');
            break;

        case 'twitter':
            window.open('https://twitter.com/intent/tweet?text=' + text + '&url=' + url, '_blank');
            closeShareModal({ target: document.getElementById('shareModalOverlay') });
            showToast('Opening Twitter… 🐦');
            break;

        case 'facebook':
            window.open('https://www.facebook.com/sharer/sharer.php?u=' + url, '_blank');
            closeShareModal({ target: document.getElementById('shareModalOverlay') });
            showToast('Opening Facebook… 👍');
            break;

        case 'instagram':
            // Instagram doesn't support direct URL sharing — copy link instead
            copyToClipboard(rawUrl);
            closeShareModal({ target: document.getElementById('shareModalOverlay') });
            showToast('Link copied! Paste it in Instagram Stories 📸');
            break;

        case 'sms':
            window.open('sms:?body=' + text + '%20' + url);
            closeShareModal({ target: document.getElementById('shareModalOverlay') });
            showToast('Opening SMS… 💬');
            break;

        case 'email':
            var subject = encodeURIComponent('Check out this product on Myntra!');
            var body    = encodeURIComponent(
                'Hi!\n\nI found this amazing product on Myntra:\n\n' +
                currentItem.item_name + ' by ' + currentItem.company + '\n' +
                'Price: ₹' + currentItem.current_price + ' (' + currentItem.discount_percentage + '% OFF)\n\n' +
                rawUrl + '\n\nHappy Shopping! 🛍️'
            );
            window.open('mailto:?subject=' + subject + '&body=' + body);
            closeShareModal({ target: document.getElementById('shareModalOverlay') });
            showToast('Opening Email… 📧');
            break;

        case 'copy':
            copyToClipboard(rawUrl);
            closeShareModal({ target: document.getElementById('shareModalOverlay') });
            showToast('✅ Link copied to clipboard!');
            break;

        case 'native':
            closeShareModal({ target: document.getElementById('shareModalOverlay') });
            if (navigator.share) {
                navigator.share({
                    title: currentItem.company + ' — ' + currentItem.item_name,
                    text : '🛍️ ' + currentItem.item_name + ' ₹' + currentItem.current_price,
                    url  : rawUrl
                });
            } else {
                copyToClipboard(rawUrl);
                showToast('✅ Link copied to clipboard!');
            }
            break;
    }
}

function copyShareLink() {
    var rawUrl = window.location.href;
    copyToClipboard(rawUrl);
    var btn = document.getElementById('shareCopyBtn');
    if (btn) {
        btn.textContent = 'Copied!';
        btn.classList.add('copied');
        setTimeout(function() {
            btn.textContent = 'Copy';
            btn.classList.remove('copied');
        }, 2000);
    }
}

function copyToClipboard(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).catch(function() {
            fallbackCopy(text);
        });
    } else {
        fallbackCopy(text);
    }
}

function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;opacity:0;pointer-events:none';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch(e) {}
    document.body.removeChild(ta);
}

/* ── Similar Products ── */
function renderSimilar() {
    var similar = items.filter(function(i) {
        return i.id !== currentItem.id && i.category === currentItem.category;
    });

    if (similar.length === 0) {
        similar = items.filter(function(i) { return i.id !== currentItem.id; }).slice(0, 4);
    }

    if (similar.length === 0) return;

    var section = document.getElementById('similarSection');
    var grid    = document.getElementById('similarGrid');
    if (!section || !grid) return;

    section.style.display = 'block';

    var html = '';
    similar.forEach(function(item) {
        var hasDiscount = item.discount_percentage > 0;
        html += '<div class="item-container" data-id="' + item.id + '" onclick="window.location.href=\'/Myntra_Clone_Professional/product.html?id=' + item.id + '\'">';
        html += '<div class="item-image-wrap">';
        html += '<img class="item-image" src="/Myntra_Clone_Professional/' + item.image + '" alt="' + item.item_name + '" loading="lazy">';
        html += '</div>';
        html += '<div class="item-body">';
        html += '<div class="company-name">' + item.company + '</div>';
        html += '<div class="item-name">' + item.item_name + '</div>';
        html += '<div class="price">';
        html += '<span class="current-price">&#8377;' + item.current_price.toLocaleString() + '</span>';
        if (hasDiscount) {
            html += '<span class="original-price">&#8377;' + item.original_price.toLocaleString() + '</span>';
            html += '<span class="discount">(' + item.discount_percentage + '% OFF)</span>';
        }
        html += '</div></div></div>';
    });
    grid.innerHTML = html;
}

/* ── Utils ── */
function capitalise(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function updateBagIcon() {
    var badge = document.getElementById('bag-count');
    if (!badge) return;
    badge.textContent = bagItems.length;
    badge.style.visibility = bagItems.length > 0 ? 'visible' : 'hidden';
}

function updateWishlistIcon() {
    var badge = document.getElementById('wishlist-count');
    if (!badge) return;
    badge.textContent = wishlistItems.length;
    badge.style.visibility = wishlistItems.length > 0 ? 'visible' : 'hidden';
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

/* ══════════════════════════════════════
   SIZE GUIDE BOTTOM SHEET
══════════════════════════════════════ */

// CM data — women: [size, chest, waist, hips, ukSize]
var SG_WOMEN_CM = [
    ['XS',  '76-80',  '60-64',  '84-88',  '6'],
    ['S',   '81-85',  '65-69',  '89-93',  '8'],
    ['M',   '86-90',  '70-74',  '94-98',  '10'],
    ['L',   '91-96',  '75-80',  '99-104', '12'],
    ['XL',  '97-102', '81-86',  '105-110','14'],
    ['XXL', '103-108','87-92',  '111-116','16'],
];
// CM data — men: [size, chest, waist, shoulder, ukSize]
var SG_MEN_CM = [
    ['XS',  '76-80',  '64-68',  '38-39', 'XS'],
    ['S',   '84-88',  '70-74',  '40-41', 'S'],
    ['M',   '92-96',  '78-82',  '42-43', 'M'],
    ['L',   '100-104','86-90',  '44-45', 'L'],
    ['XL',  '108-112','94-98',  '46-47', 'XL'],
    ['XXL', '116-120','102-106','48-49', 'XXL'],
];

var sgCurrentUnit = 'cm';

function openSizeGuide() {
    var overlay = document.getElementById('sizeGuideOverlay');
    if (!overlay) return;
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    sgRenderTables();
    // Auto-switch to shoes tab if product is shoes
    if (currentItem && currentItem.category === 'men' &&
        currentItem.item_name.toLowerCase().match(/shoe|sneaker|boot|sandal/)) {
        var shoeTab = document.querySelector('.sg-tab[data-tab="shoes"]');
        if (shoeTab) sgTab(shoeTab, 'shoes');
    }
}

function closeSizeGuide(e) {
    if (e && e.target !== document.getElementById('sizeGuideOverlay')) return;
    var overlay = document.getElementById('sizeGuideOverlay');
    if (overlay) overlay.classList.remove('open');
    document.body.style.overflow = '';
}

function sgTab(btn, tabId) {
    document.querySelectorAll('.sg-tab').forEach(function(t) { t.classList.remove('active'); });
    document.querySelectorAll('.sg-panel').forEach(function(p) { p.classList.remove('active'); });
    btn.classList.add('active');
    var panel = document.getElementById('sg-' + tabId);
    if (panel) panel.classList.add('active');
}

function sgUnit(unit) {
    sgCurrentUnit = unit;
    document.getElementById('sgCmBtn').classList.toggle('active', unit === 'cm');
    document.getElementById('sgInBtn').classList.toggle('active', unit === 'in');
    sgRenderTables();
}

function sgConvert(val, unit) {
    if (unit === 'cm') return val;
    // Convert "86-90" → "33.9-35.4"
    return val.split('-').map(function(n) {
        return (parseFloat(n) / 2.54).toFixed(1);
    }).join('-');
}

function sgRenderTables() {
    var unit = sgCurrentUnit;

    // Women
    var wb = document.getElementById('sgWomenBody');
    if (wb) {
        wb.innerHTML = SG_WOMEN_CM.map(function(row) {
            return '<tr>' +
                '<td>' + row[0] + '</td>' +
                '<td>' + sgConvert(row[1], unit) + '</td>' +
                '<td>' + sgConvert(row[2], unit) + '</td>' +
                '<td>' + sgConvert(row[3], unit) + '</td>' +
                '<td>' + row[4] + '</td>' +
            '</tr>';
        }).join('');
    }

    // Men
    var mb = document.getElementById('sgMenBody');
    if (mb) {
        mb.innerHTML = SG_MEN_CM.map(function(row) {
            return '<tr>' +
                '<td>' + row[0] + '</td>' +
                '<td>' + sgConvert(row[1], unit) + '</td>' +
                '<td>' + sgConvert(row[2], unit) + '</td>' +
                '<td>' + sgConvert(row[3], unit) + '</td>' +
                '<td>' + row[4] + '</td>' +
            '</tr>';
        }).join('');
    }

    // Highlight selected size row if any
    if (selectedSize) {
        document.querySelectorAll('.sg-table tbody tr').forEach(function(row) {
            var sizeCell = row.querySelector('td:first-child');
            if (sizeCell && sizeCell.textContent.trim() === selectedSize) {
                row.classList.add('highlight');
            } else {
                row.classList.remove('highlight');
            }
        });
    }
}
