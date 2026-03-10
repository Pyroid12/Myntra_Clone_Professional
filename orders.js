/* ============================================================
   MYNTRA CLONE — orders.js
   ============================================================ */

var allOrders   = [];
var activeFilter = 'all';

window.addEventListener('DOMContentLoaded', onOrdersLoad);

function onOrdersLoad() {
    loadOrders();
    renderOrders();
    bindTabs();
    updateIcons();
}

/* ── Load orders from localStorage ── */
function loadOrders() {
    try {
        allOrders = JSON.parse(localStorage.getItem('orderHistory') || '[]');
    } catch(e) { allOrders = []; }
}

/* ── Render orders ── */
function renderOrders() {
    var list      = document.getElementById('ordersList');
    var countEl   = document.getElementById('ordersCount');
    if (!list) return;

    var filtered = activeFilter === 'all'
        ? allOrders
        : allOrders.filter(function(o) { return o.status.toLowerCase() === activeFilter; });

    if (countEl) countEl.textContent = allOrders.length + ' order' + (allOrders.length !== 1 ? 's' : '');

    if (filtered.length === 0) {
        list.innerHTML = renderEmpty();
        return;
    }

    // Show newest first
    var sorted = filtered.slice().reverse();
    list.innerHTML = sorted.map(renderOrderCard).join('');

    // Bind reorder/cancel buttons
    list.addEventListener('click', handleOrderAction);
}

/* ── Render single order card ── */
function renderOrderCard(order) {
    var statusConfig = {
        'Delivered':  { cls: 'delivered',  icon: 'check_circle', steps: 4 },
        'Processing': { cls: 'processing', icon: 'pending',       steps: 1 },
        'Shipped':    { cls: 'shipped',    icon: 'local_shipping', steps: 3 },
        'Cancelled':  { cls: 'cancelled', icon: 'cancel',         steps: 0 }
    };
    var sc = statusConfig[order.status] || statusConfig['Processing'];

    var html = '<div class="order-card" data-id="' + order.id + '">';

    // Header
    html += '<div class="order-card-header">';
    html += '<div>';
    html += '<div class="order-id">Order #' + order.id + '</div>';
    html += '<div class="order-date">' + formatDate(order.date) + '</div>';
    html += '</div>';
    html += '<span class="order-status ' + sc.cls + '">';
    html += '<span class="material-symbols-outlined">' + sc.icon + '</span>' + order.status;
    html += '</span>';
    html += '<div class="order-total">₹' + order.total.toLocaleString() + '</div>';
    html += '</div>';

    // Items
    html += '<div class="order-items">';
    order.items.forEach(function(item) {
        html += '<div class="order-item">';
        html += '<img class="order-item-img" src="/Myntra_Clone_Professional/' + item.image + '" alt="' + item.item_name + '" loading="lazy">';
        html += '<div class="order-item-info">';
        html += '<div class="order-item-brand">' + item.company + '</div>';
        html += '<div class="order-item-name">' + item.item_name + '</div>';
        html += '<div class="order-item-meta">';
        html += '<span>Size: ' + (item.selectedSize || 'M') + '</span>';
        html += '<span>Qty: ' + (item.qty || 1) + '</span>';
        if (item.return_period) html += '<span>' + item.return_period + ' day return</span>';
        html += '</div>';
        html += '</div>';
        html += '<div class="order-item-price">₹' + item.current_price.toLocaleString() + '</div>';
        html += '</div>';
    });
    html += '</div>';

    // Footer with timeline + actions
    html += '<div class="order-card-footer">';

    // Timeline (only for non-cancelled)
    if (order.status !== 'Cancelled') {
        var steps = [
            { label: 'Ordered',   icon: 'shopping_bag' },
            { label: 'Packed',    icon: 'inventory_2'  },
            { label: 'Shipped',   icon: 'local_shipping' },
            { label: 'Delivered', icon: 'home'         }
        ];
        html += '<div class="order-timeline">';
        steps.forEach(function(step, idx) {
            var done = idx < sc.steps;
            html += '<div class="timeline-step">';
            html += '<div class="timeline-dot ' + (done ? 'done' : '') + '">';
            html += '<span class="material-symbols-outlined">' + (done ? 'check' : step.icon) + '</span>';
            html += '</div>';
            html += '<div class="timeline-label">' + step.label + '</div>';
            html += '</div>';
            if (idx < steps.length - 1) {
                html += '<div class="timeline-line ' + (idx < sc.steps - 1 ? 'done' : '') + '"></div>';
            }
        });
        html += '</div>';
    } else {
        html += '<div style="font-size:13px;color:#c62828;font-weight:600;">⚠️ This order was cancelled</div>';
    }

    // Action buttons
    html += '<div class="order-actions">';
    html += '<button class="btn-order-action btn-reorder" data-action="reorder" data-id="' + order.id + '">Reorder</button>';
    if (order.status === 'Processing') {
        html += '<button class="btn-order-action btn-cancel" data-action="cancel" data-id="' + order.id + '">Cancel</button>';
    }
    html += '</div>';
    html += '</div>'; // footer

    html += '</div>'; // card
    return html;
}

/* ── Empty state ── */
function renderEmpty() {
    if (activeFilter !== 'all') {
        return '<div class="orders-empty">' +
            '<div class="material-symbols-outlined orders-empty-icon">inbox</div>' +
            '<h2>No ' + activeFilter + ' orders</h2>' +
            '<p>You have no orders with this status yet.</p>' +
            '</div>';
    }
    return '<div class="orders-empty">' +
        '<div class="material-symbols-outlined orders-empty-icon">shopping_bag</div>' +
        '<h2>No Orders Yet</h2>' +
        '<p>Looks like you haven\'t placed any orders yet.<br>Start shopping to see your orders here!</p>' +
        '<button class="btn-start-shopping" onclick="window.location.href=\'/Myntra_Clone_Professional/index.html\'">Start Shopping</button>' +
        '</div>';
}

/* ── Handle reorder / cancel ── */
function handleOrderAction(e) {
    var btn = e.target.closest('.btn-order-action');
    if (!btn) return;

    var action  = btn.dataset.action;
    var orderId = btn.dataset.id;
    var order   = allOrders.find(function(o) { return o.id == orderId; });
    if (!order) return;

    if (action === 'reorder') {
        // Add items back to bag
        var bagItems = JSON.parse(localStorage.getItem('bagItems') || '[]');
        order.items.forEach(function(item) {
            if (!bagItems.includes(item.id)) bagItems.push(item.id);
        });
        localStorage.setItem('bagItems', JSON.stringify(bagItems));
        showToast('Items added to Bag! 🛍️');
        setTimeout(function() {
            window.location.href = '/Myntra_Clone_Professional/bag.html';
        }, 1000);
    }

    if (action === 'cancel') {
        order.status = 'Cancelled';
        saveOrders();
        renderOrders();
        showToast('Order #' + orderId + ' cancelled');
    }
}

/* ── Filter tabs ── */
function bindTabs() {
    document.querySelectorAll('.orders-tab').forEach(function(tab) {
        tab.addEventListener('click', function() {
            document.querySelectorAll('.orders-tab').forEach(function(t) { t.classList.remove('active'); });
            tab.classList.add('active');
            activeFilter = tab.dataset.filter;
            renderOrders();
        });
    });
}

/* ── Save orders ── */
function saveOrders() {
    localStorage.setItem('orderHistory', JSON.stringify(allOrders));
}

/* ── Format date ── */
function formatDate(dateStr) {
    var d = new Date(dateStr);
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear() +
           ' at ' + d.getHours().toString().padStart(2,'0') + ':' + d.getMinutes().toString().padStart(2,'0');
}

/* ── Update header icons ── */
function updateIcons() {
    var bagCount  = JSON.parse(localStorage.getItem('bagItems') || '[]').length;
    var wishCount = JSON.parse(localStorage.getItem('wishlistItems') || '[]').length;

    var bagBadge  = document.getElementById('bag-count');
    var wishBadge = document.getElementById('wishlist-count');
    if (bagBadge)  { bagBadge.textContent  = bagCount;  bagBadge.style.visibility  = bagCount  > 0 ? 'visible' : 'hidden'; }
    if (wishBadge) { wishBadge.textContent = wishCount; wishBadge.style.visibility = wishCount > 0 ? 'visible' : 'hidden'; }

    var bnBag  = document.getElementById('bn-bag-count');
    var bnWish = document.getElementById('bn-wish-count');
    if (bnBag)  { bnBag.textContent  = bagCount;  bnBag.classList.toggle('visible',  bagCount  > 0); }
    if (bnWish) { bnWish.textContent = wishCount; bnWish.classList.toggle('visible', wishCount > 0); }
}

/* ── Toast ── */
function showToast(msg) {
    var toast = document.getElementById('toast');
    if (!toast) return;
    toast.innerHTML = '<span class="material-symbols-outlined">check_circle</span> ' + msg;
    toast.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(function() { toast.classList.remove('show'); }, 2500);
}
