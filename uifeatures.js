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

    // Hide after 1.8s
    setTimeout(function() {
        splash.classList.add('hidden');
        // Remove from DOM after transition
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
