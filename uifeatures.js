/* ============================================================
   MYNTRA CLONE — uifeatures.js
   Dark Mode + Card Animations + Back to Top + Splash Screen
   ============================================================ */

document.addEventListener('DOMContentLoaded', function() {
    initSplashScreen();
    initDarkMode();
    initBackToTop();
});

/* ══════════════════════════════════════
   1. SPLASH SCREEN
══════════════════════════════════════ */
function initSplashScreen() {
    var splash = document.getElementById('splashScreen');
    if (!splash) return;

    // If page already loaded before (returning visitor), skip splash
    if (sessionStorage.getItem('splashShown')) {
        if (splash.parentNode) splash.parentNode.removeChild(splash);
        return;
    }

    sessionStorage.setItem('splashShown', 'true');

    // Hide after 1.8s
    setTimeout(function() {
        splash.classList.add('hidden');
        setTimeout(function() {
            if (splash.parentNode) splash.parentNode.removeChild(splash);
        }, 500);
    }, 1800);
}

/* ══════════════════════════════════════
   2. DARK MODE
══════════════════════════════════════ */
function initDarkMode() {
    // Load saved preference
    var saved = localStorage.getItem('darkMode');
    if (saved === 'true') {
        document.body.classList.add('dark-mode');
        updateDarkModeBtn(true);
    }
}

function toggleDarkMode() {
    var isDark = document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', isDark);
    updateDarkModeBtn(isDark);
    if (typeof showToast === 'function') {
        showToast(isDark ? '🌙 Dark mode on' : '☀️ Light mode on');
    }
}

function updateDarkModeBtn(isDark) {
    var btn  = document.getElementById('darkModeBtn');
    var icon = document.getElementById('darkModeIcon');
    var text = document.getElementById('darkModeText');
    if (icon) icon.textContent = isDark ? 'light_mode' : 'dark_mode';
    if (text) text.textContent = isDark ? 'Light' : 'Dark';
}

/* ══════════════════════════════════════
   3. BACK TO TOP
══════════════════════════════════════ */
function initBackToTop() {
    var btn = document.getElementById('backToTop');
    if (!btn) return;

    // Show/hide on scroll
    window.addEventListener('scroll', function() {
        if (window.scrollY > 400) {
            btn.classList.add('visible');
        } else {
            btn.classList.remove('visible');
        }
    });

    // Scroll to top on click
    btn.addEventListener('click', function() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

/* ══════════════════════════════════════
   FLASH SALE COUNTDOWN TIMER
══════════════════════════════════════ */
function initFlashTimer() {
    var endTime = localStorage.getItem('flashSaleEnd');

    // Set new 6-hour timer if not set or expired
    if (!endTime || Date.now() > parseInt(endTime)) {
        endTime = Date.now() + (6 * 60 * 60 * 1000); // 6 hours
        localStorage.setItem('flashSaleEnd', endTime);
    }

    function tick() {
        var diff = parseInt(endTime) - Date.now();
        if (diff <= 0) {
            // Reset timer
            endTime = Date.now() + (6 * 60 * 60 * 1000);
            localStorage.setItem('flashSaleEnd', endTime);
            diff = parseInt(endTime) - Date.now();
        }
        var h = Math.floor(diff / 3600000);
        var m = Math.floor((diff % 3600000) / 60000);
        var s = Math.floor((diff % 60000) / 1000);

        var fh = document.getElementById('fh');
        var fm = document.getElementById('fm');
        var fs = document.getElementById('fs');
        if (fh) fh.textContent = String(h).padStart(2,'0');
        if (fm) fm.textContent = String(m).padStart(2,'0');
        if (fs) fs.textContent = String(s).padStart(2,'0');
    }
    tick();
    setInterval(tick, 1000);
}

/* ══════════════════════════════════════
   HERO BANNER SLIDER
══════════════════════════════════════ */
function initHeroSlider() {
    var slides   = document.getElementById('heroSlides');
    var dots     = document.querySelectorAll('.hero-dot');
    var prevBtn  = document.getElementById('heroPrev');
    var nextBtn  = document.getElementById('heroNext');
    if (!slides) return;

    var current  = 0;
    var total    = dots.length;
    var autoplay = null;

    function goTo(idx) {
        current = (idx + total) % total;
        slides.style.transform = 'translateX(-' + (current * 100) + '%)';
        dots.forEach(function(d, i) { d.classList.toggle('active', i === current); });
    }

    function startAutoplay() {
        autoplay = setInterval(function() { goTo(current + 1); }, 3000);
    }

    function stopAutoplay() {
        clearInterval(autoplay);
    }

    // Arrow clicks
    if (prevBtn) prevBtn.addEventListener('click', function() { stopAutoplay(); goTo(current - 1); startAutoplay(); });
    if (nextBtn) nextBtn.addEventListener('click', function() { stopAutoplay(); goTo(current + 1); startAutoplay(); });

    // Dot clicks
    dots.forEach(function(dot) {
        dot.addEventListener('click', function() {
            stopAutoplay();
            goTo(parseInt(dot.dataset.idx));
            startAutoplay();
        });
    });

    // Touch swipe support
    var startX = 0;
    slides.addEventListener('touchstart', function(e) { startX = e.touches[0].clientX; }, {passive:true});
    slides.addEventListener('touchend', function(e) {
        var diff = startX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) {
            stopAutoplay();
            goTo(diff > 0 ? current + 1 : current - 1);
            startAutoplay();
        }
    }, {passive:true});

    startAutoplay();
}

/* ══════════════════════════════════════
   CONFETTI ON ORDER PLACED
══════════════════════════════════════ */
function launchConfetti() {
    var container = document.createElement('div');
    container.className = 'confetti-container';
    document.body.appendChild(container);

    var colors = ['#ff3f6c','#ff905a','#ffbc57','#4285f4','#34a853','#9c27b0','#fff'];
    var shapes = ['circle','square','triangle'];

    for (var i = 0; i < 120; i++) {
        (function(i) {
            setTimeout(function() {
                var piece = document.createElement('div');
                piece.className = 'confetti-piece';
                var color = colors[Math.floor(Math.random() * colors.length)];
                var size  = Math.random() * 10 + 6;
                var left  = Math.random() * 100;
                var dur   = Math.random() * 2 + 2;
                var delay = Math.random() * 1.5;

                piece.style.cssText =
                    'left:' + left + '%;' +
                    'width:' + size + 'px;' +
                    'height:' + size + 'px;' +
                    'background:' + color + ';' +
                    'border-radius:' + (Math.random() > .5 ? '50%' : '2px') + ';' +
                    'animation-duration:' + dur + 's;' +
                    'animation-delay:' + delay + 's;';

                container.appendChild(piece);
            }, i * 10);
        })(i);
    }

    // Remove after animation
    setTimeout(function() {
        if (container.parentNode) container.parentNode.removeChild(container);
    }, 5000);
}

// Make globally available for bag.js
window.launchConfetti = launchConfetti;

/* ── Init all on DOMContentLoaded ── */
var _origInit = document.addEventListener;
document.addEventListener('DOMContentLoaded', function() {
    initFlashTimer();
    initHeroSlider();
});
