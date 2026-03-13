/* ============================================================
   MYNTRA CLONE — spinwheel.js
   Spin & Win Coupon Wheel
   ============================================================ */

/* ── Segments ── */
var SEGMENTS = [
    { label: 'MYNTRA10', desc: '10% Off',       color: '#ff3f6c', emoji: '🎉' },
    { label: 'TRYNOW',   desc: 'Try Again!',    color: '#eaeaec', emoji: '😅' },
    { label: 'FIRST20',  desc: '20% Off',       color: '#f7b733', emoji: '🔥' },
    { label: 'TRYNOW',   desc: 'Try Again!',    color: '#eaeaec', emoji: '😅' },
    { label: 'SALE30',   desc: '30% Off',       color: '#ff905a', emoji: '🤩' },
    { label: 'TRYNOW',   desc: 'Try Again!',    color: '#eaeaec', emoji: '😅' },
    { label: 'FREE5',    desc: '₹5 Off',        color: '#4caf50', emoji: '🎊' },
    { label: 'TRYNOW',   desc: 'Try Again!',    color: '#eaeaec', emoji: '😅' },
];

var SPIN_DURATION = 4000; // ms
var currentAngle  = 0;
var isSpinning    = false;
var canvas, ctx;

/* ══════════════════════════════════════
   INJECT HTML
══════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', function () {
    buildSpinWidget();
    checkAlreadyPlayed();
});

function buildSpinWidget() {
    var wrap = document.createElement('div');
    wrap.id  = 'spinWidget';
    wrap.innerHTML = [
        /* Trigger button */
        '<button class="spin-trigger" onclick="openSpinWheel()" id="spinTrigger">',
            '<span class="spin-trigger-icon">🎰</span>',
            '<div class="spin-trigger-text">',
                '<span>Spin & Win</span>',
                '<span>Free coupons!</span>',
            '</div>',
        '</button>',

        /* Overlay */
        '<div class="spin-overlay" id="spinOverlay" onclick="closeSpinWheel(event)">',
            '<div class="spin-modal" id="spinModal">',

                /* Close */
                '<button class="spin-close" onclick="closeSpinWheel(null)">✕</button>',

                /* Header */
                '<div class="spin-modal-tag">🎁 Daily Reward</div>',
                '<div class="spin-modal-title">Spin & <span>Win!</span></div>',
                '<div class="spin-modal-sub">Spin the wheel for exclusive Myntra coupons</div>',

                /* Wheel */
                '<div class="spin-wheel-wrap" id="spinWheelWrap">',
                    '<div class="spin-pointer"></div>',
                    '<canvas id="spinCanvas" width="280" height="280"></canvas>',
                    '<button class="spin-center-btn" id="spinCenterBtn" onclick="doSpin()">',
                        '<span class="material-symbols-outlined">refresh</span>',
                        'SPIN',
                    '</button>',
                '</div>',

                /* Spin button */
                '<button class="spin-btn" id="spinMainBtn" onclick="doSpin()">',
                    '<span class="material-symbols-outlined">casino</span>',
                    'SPIN THE WHEEL',
                '</button>',
                '<div class="spin-note">',
                    '<span class="material-symbols-outlined">info</span>',
                    'One free spin per day',
                '</div>',

                /* Result (hidden until win) */
                '<div class="spin-result" id="spinResult">',
                    '<div class="spin-result-emoji" id="spinResultEmoji"></div>',
                    '<div class="spin-result-title" id="spinResultTitle"></div>',
                    '<div class="spin-coupon-box">',
                        '<div class="spin-coupon-label">Your Coupon Code</div>',
                        '<div class="spin-coupon-code" id="spinCouponCode"></div>',
                        '<div class="spin-coupon-desc" id="spinCouponDesc"></div>',
                    '</div>',
                    '<button class="spin-copy-btn" id="spinCopyBtn" onclick="copyCoupon()">',
                        '<span class="material-symbols-outlined">content_copy</span> Copy Code',
                    '</button>',
                    '<button class="spin-use-btn" onclick="useCouponNow()">',
                        '<span class="material-symbols-outlined">shopping_bag</span> Use on My Bag',
                    '</button>',
                '</div>',

                /* Already played */
                '<div class="spin-already-played" id="spinAlreadyPlayed">',
                    '<div class="spin-already-played-icon">⏰</div>',
                    '<p>You\'ve already spun today!<br>Come back tomorrow for another spin.</p>',
                    '<div class="spin-already-coupon" id="spinAlreadyCoupon"></div>',
                    '<button class="spin-use-btn" onclick="useCouponNow()">',
                        '<span class="material-symbols-outlined">shopping_bag</span> Use My Coupon',
                    '</button>',
                '</div>',

            '</div>',
        '</div>'
    ].join('');

    document.body.appendChild(wrap);

    // Init canvas
    canvas = document.getElementById('spinCanvas');
    ctx    = canvas.getContext('2d');
    drawWheel(0);
}

/* ══════════════════════════════════════
   DRAW WHEEL ON CANVAS
══════════════════════════════════════ */
function drawWheel(angle) {
    var n   = SEGMENTS.length;
    var arc = (2 * Math.PI) / n;
    var cx  = canvas.width  / 2;
    var cy  = canvas.height / 2;
    var r   = cx - 2;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    SEGMENTS.forEach(function(seg, i) {
        var startAngle = angle + i * arc;
        var endAngle   = startAngle + arc;

        /* Slice */
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, r, startAngle, endAngle);
        ctx.closePath();
        ctx.fillStyle = seg.color;
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth   = 2;
        ctx.stroke();

        /* Label */
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(startAngle + arc / 2);
        ctx.textAlign    = 'right';
        ctx.fillStyle    = seg.color === '#eaeaec' ? '#535766' : '#fff';
        ctx.font         = 'bold 13px sans-serif';
        ctx.fillText(seg.label === 'TRYNOW' ? seg.desc : seg.label, r - 12, 5);
        ctx.font = '18px sans-serif';
        ctx.fillText(seg.emoji, r - 80, 7);
        ctx.restore();
    });

    /* Center circle */
    ctx.beginPath();
    ctx.arc(cx, cy, 28, 0, 2 * Math.PI);
    ctx.fillStyle   = '#fff';
    ctx.fill();
    ctx.strokeStyle = '#ff3f6c';
    ctx.lineWidth   = 3;
    ctx.stroke();
}

/* ══════════════════════════════════════
   SPIN LOGIC
══════════════════════════════════════ */
function doSpin() {
    if (isSpinning) return;

    // Check already played today
    var lastSpin = localStorage.getItem('spinWheelDate');
    var today    = new Date().toDateString();
    if (lastSpin === today) {
        showAlreadyPlayed();
        return;
    }

    isSpinning = true;
    disableSpinBtns(true);

    /* Pick winning segment randomly — bias toward coupons */
    var winIndex;
    var rand = Math.random();
    if (rand < 0.25)      winIndex = 0; // MYNTRA10
    else if (rand < 0.45) winIndex = 2; // FIRST20
    else if (rand < 0.55) winIndex = 4; // SALE30
    else if (rand < 0.65) winIndex = 6; // FREE5
    else                   winIndex = [1,3,5,7][Math.floor(Math.random()*4)]; // Try Again

    var n          = SEGMENTS.length;
    var arc        = (2 * Math.PI) / n;
    var targetAngle = -(winIndex * arc + arc / 2) + Math.PI / 2; // land pointer on segment center

    /* Extra full rotations for drama */
    var extraSpins  = (5 + Math.floor(Math.random() * 4)) * 2 * Math.PI;
    var finalAngle  = currentAngle + extraSpins + (targetAngle - (currentAngle % (2 * Math.PI)));

    var start    = null;
    var startVal = currentAngle;

    function easeOut(t) {
        return 1 - Math.pow(1 - t, 4);
    }

    function animate(ts) {
        if (!start) start = ts;
        var elapsed  = ts - start;
        var progress = Math.min(elapsed / SPIN_DURATION, 1);
        var eased    = easeOut(progress);
        var angle    = startVal + (finalAngle - startVal) * eased;

        currentAngle = angle;
        drawWheel(angle);

        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            isSpinning = false;
            currentAngle = finalAngle % (2 * Math.PI);
            showResult(SEGMENTS[winIndex]);

            // Save spin date
            localStorage.setItem('spinWheelDate',   new Date().toDateString());
            localStorage.setItem('spinWheelResult',  SEGMENTS[winIndex].label);
        }
    }

    requestAnimationFrame(animate);
}

/* ══════════════════════════════════════
   SHOW RESULT
══════════════════════════════════════ */
function showResult(seg) {
    var isCoupon = seg.label !== 'TRYNOW';

    // Hide wheel section
    document.getElementById('spinWheelWrap').style.display = 'none';
    document.getElementById('spinMainBtn').style.display   = 'none';
    document.querySelector('.spin-note').style.display     = 'none';

    if (isCoupon) {
        document.getElementById('spinResultEmoji').textContent  = seg.emoji;
        document.getElementById('spinResultTitle').textContent  = '🎉 You Won!';
        document.getElementById('spinCouponCode').textContent   = seg.label;
        document.getElementById('spinCouponDesc').textContent   = seg.desc + ' on your next order';
        document.getElementById('spinResult').classList.add('show');
    } else {
        // Try again — show simple message then close
        document.getElementById('spinResultEmoji').textContent = '😅';
        document.getElementById('spinResultTitle').textContent = 'Better luck next time!';
        document.getElementById('spinCouponCode').textContent  = 'No coupon';
        document.getElementById('spinCouponDesc').textContent  = 'Come back tomorrow for another spin!';
        document.querySelector('.spin-coupon-box').style.display  = 'none';
        document.getElementById('spinCopyBtn').style.display      = 'none';
        document.querySelector('.spin-use-btn').style.display     = 'none';
        document.getElementById('spinResult').classList.add('show');
    }

    if (typeof showToast === 'function') {
        showToast(isCoupon ? '🎉 You won ' + seg.label + '!' : '😅 Try again tomorrow!');
    }
}

/* ══════════════════════════════════════
   COPY COUPON
══════════════════════════════════════ */
function copyCoupon() {
    var code = document.getElementById('spinCouponCode').textContent;
    if (!code || code === 'No coupon') return;

    if (navigator.clipboard) {
        navigator.clipboard.writeText(code);
    } else {
        var ta = document.createElement('textarea');
        ta.value = code;
        ta.style.cssText = 'position:fixed;opacity:0';
        document.body.appendChild(ta);
        ta.select(); document.execCommand('copy');
        document.body.removeChild(ta);
    }

    var btn = document.getElementById('spinCopyBtn');
    btn.innerHTML = '<span class="material-symbols-outlined">check</span> Copied!';
    btn.classList.add('copied');
    setTimeout(function() {
        btn.innerHTML = '<span class="material-symbols-outlined">content_copy</span> Copy Code';
        btn.classList.remove('copied');
    }, 2000);

    if (typeof showToast === 'function') showToast('✅ Coupon code copied!');
}

/* ── Use coupon now → go to bag ── */
function useCouponNow() {
    var code = document.getElementById('spinCouponCode') ?
               document.getElementById('spinCouponCode').textContent :
               localStorage.getItem('spinWheelResult');

    if (code && code !== 'No coupon' && code !== 'TRYNOW') {
        localStorage.setItem('pendingCoupon', code);
    }
    closeSpinWheel(null);
    window.location.href = '/Myntra_Clone_Professional/bag.html';
}

/* ══════════════════════════════════════
   ALREADY PLAYED
══════════════════════════════════════ */
function checkAlreadyPlayed() {
    // Show trigger only after 5 seconds
    setTimeout(function() {
        var trigger = document.getElementById('spinTrigger');
        if (trigger) trigger.style.display = 'flex';
    }, 5000);
}

function showAlreadyPlayed() {
    document.getElementById('spinWheelWrap').style.display = 'none';
    document.getElementById('spinMainBtn').style.display   = 'none';
    document.querySelector('.spin-note').style.display     = 'none';

    var saved = localStorage.getItem('spinWheelResult') || '';
    var el    = document.getElementById('spinAlreadyCoupon');
    if (el) el.textContent = saved !== 'TRYNOW' ? saved : '—';

    document.getElementById('spinAlreadyPlayed').classList.add('show');
}

/* ══════════════════════════════════════
   OPEN / CLOSE
══════════════════════════════════════ */
function openSpinWheel() {
    var overlay = document.getElementById('spinOverlay');
    if (overlay) overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeSpinWheel(e) {
    if (e && e.target !== document.getElementById('spinOverlay')) return;
    var overlay = document.getElementById('spinOverlay');
    if (overlay) overlay.classList.remove('open');
    document.body.style.overflow = '';
}

function disableSpinBtns(disabled) {
    var btn1 = document.getElementById('spinMainBtn');
    var btn2 = document.getElementById('spinCenterBtn');
    if (btn1) btn1.disabled = disabled;
    if (btn2) btn2.disabled = disabled;
}

/* ══════════════════════════════════════
   AUTO-APPLY PENDING COUPON ON BAG PAGE
══════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', function() {
    var pending = localStorage.getItem('pendingCoupon');
    if (pending && window.location.pathname.includes('bag')) {
        localStorage.removeItem('pendingCoupon');
        setTimeout(function() {
            var input = document.getElementById('couponInput');
            var btn   = document.getElementById('applyCouponBtn');
            if (input && btn) {
                input.value = pending;
                btn.click();
                if (typeof showToast === 'function') showToast('🎉 Spin & Win coupon applied!');
            }
        }, 800);
    }
});
