/* ============================================================
   MYNTRA CLONE — firebase.js
   Firebase Auth + Firestore backend
   ============================================================ */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged }
    from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc }
    from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

/* ──  FIREBASE CONFIG —  ── */
const firebaseConfig = {
apiKey: "AIzaSyBUD18RFEk0ot9w1noQ_mLIKEUFcalIj7E",
authDomain: "myntra-clone-4c7f9.firebaseapp.com",
projectId: "myntra-clone-4c7f9",
storageBucket: "myntra-clone-4c7f9.firebasestorage.app",
messagingSenderId: "468539949171",
appId: "1:468539949171:web:d2672a9f0975ce39412a06",
measurementId: "G-QKSQ71PPHN"
};

/* ── EmailJS Config ──────────────────────────
   1. Go to https://www.emailjs.com and create free account
   2. Add Gmail service → copy Service ID
   3. Create email template → copy Template ID
   4. Go to Account → copy Public Key
   5. Replace the values below
   ─────────────────────────────────────────── */
const EMAILJS_SERVICE_ID  = 'service_4ilqc3l';   // e.g. service_abc123
const EMAILJS_TEMPLATE_ID = 'template_oga9v27';  // e.g. template_xyz789
const EMAILJS_PUBLIC_KEY  = 'nC-Cy0nr5u-iWoGgm';   // e.g. user_aBcDeFgHiJkL

/* ── Init ── */
const app  = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db   = getFirestore(app);

let currentUser = null;

/* ── Auth State Listener ── */
onAuthStateChanged(auth, async function(user) {
    currentUser = user;
    window.currentUser = user;

    if (user) {
        updateHeaderForUser(user);
        await syncFromFirestore(user.uid);
    } else {
        updateHeaderForGuest();
    }
});

/* ── Init notifications after auth ready ── */
document.addEventListener('DOMContentLoaded', async function() {
    if (typeof initNotifications === 'function') await initNotifications();
});

/* ── Google Sign In ── */
async function signInWithGoogle() {
    try {
        const provider = new GoogleAuthProvider();
        const result   = await signInWithPopup(auth, provider);
        return result.user;
    } catch(e) {
        console.error('Sign in error:', e);
        showAuthError(e.message);
    }
}

/* ── Sign Out ── */
async function signOutUser() {
    try {
        if (currentUser) await saveToFirestore(currentUser.uid);
        await signOut(auth);
    } catch(e) {
        console.error('Sign out error:', e);
    }
}

/* ── Save to Firestore ── */
async function saveToFirestore(uid) {
    if (!uid) return;
    try {
        var bagItems      = JSON.parse(localStorage.getItem('bagItems')      || '[]');
        var wishlistItems = JSON.parse(localStorage.getItem('wishlistItems') || '[]');
        await setDoc(doc(db, 'users', uid), {
            bagItems:      bagItems,
            wishlistItems: wishlistItems,
            email:         currentUser ? currentUser.email        : '',
            name:          currentUser ? currentUser.displayName  : '',
            updatedAt:     new Date().toISOString()
        }, { merge: true });
        console.log('✅ Saved to Firestore');
    } catch(e) {
        console.error('❌ Save error:', e);
    }
}

/* ── Load from Firestore ── */
async function syncFromFirestore(uid) {
    try {
        const snap = await getDoc(doc(db, 'users', uid));
        if (snap.exists()) {
            var data = snap.data();
            if (data.bagItems)      localStorage.setItem('bagItems',      JSON.stringify(data.bagItems));
            if (data.wishlistItems) localStorage.setItem('wishlistItems', JSON.stringify(data.wishlistItems));
            console.log('✅ Synced from Firestore:', data);
            // Update in-memory variables directly
            if (typeof bagItems !== 'undefined' && data.bagItems)
                bagItems = data.bagItems;
            if (typeof wishlistItems !== 'undefined' && data.wishlistItems)
                wishlistItems = data.wishlistItems;
            // Re-render UI
            if (typeof renderProducts     === 'function') renderProducts();
            if (typeof renderBag          === 'function') renderBag();
            if (typeof renderWishlist     === 'function') renderWishlist();
            if (typeof updateBagIcon      === 'function') updateBagIcon();
            if (typeof updateWishlistIcon === 'function') updateWishlistIcon();
        } else {
            // First time user — save empty doc so it appears in Firestore
            await saveToFirestore(uid);
        }
    } catch(e) {
        console.error('❌ Sync error:', e);
    }
}

/* ── Auto-save whenever storage-update event fires ── */
window.addEventListener('storage-update', function() {
    if (window.currentUser) {
        saveToFirestore(window.currentUser.uid);
    }
});

/* ── Header UI ── */

/* ══════════════════════════════════════
   SEND LOGIN EMAIL via EmailJS
══════════════════════════════════════ */
async function sendLoginEmail(user) {
    // Don't send if EmailJS not configured yet
    if (EMAILJS_PUBLIC_KEY === 'YOUR_PUBLIC_KEY') {
        console.log('⚠️ EmailJS not configured — skipping email');
        return;
    }

    // Only send once per session (not on every page load)
    var sessionKey = 'loginEmailSent_' + user.uid;
    if (sessionStorage.getItem(sessionKey)) return;
    sessionStorage.setItem(sessionKey, 'true');

    try {
        // Dynamically load EmailJS SDK
        if (!window.emailjs) {
            await new Promise(function(resolve, reject) {
                var script    = document.createElement('script');
                script.src    = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js';
                script.onload = resolve;
                script.onerror = reject;
                document.head.appendChild(script);
            });
            window.emailjs.init(EMAILJS_PUBLIC_KEY);
        }

        var now      = new Date();
        var timeStr  = now.toLocaleString('en-IN', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
            hour: '2-digit', minute: '2-digit', hour12: true
        });

        var templateParams = {
            to_email    : user.email,
            to_name     : user.displayName || user.email.split('@')[0],
            login_time  : timeStr,
            user_email  : user.email,
            site_name   : 'Myntra Clone',
            site_url    : window.location.origin + '/Myntra_Clone_Professional/',
        };

        await window.emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams);
        console.log('✅ Login email sent to', user.email);

    } catch(err) {
        console.log('❌ Email send failed:', err);
    }
}

function updateHeaderForUser(user) {
    var profileName = document.getElementById('profileName');
    var profileIcon = document.getElementById('profileIcon');
    var signOutBtn  = document.getElementById('signOutBtn');
    var profileBtn  = document.getElementById('profileBtn');

    if (profileName) profileName.textContent = user.displayName
        ? user.displayName.split(' ')[0]
        : user.email.split('@')[0];

    // Show user photo
    if (profileIcon && user.photoURL && !document.querySelector('.user-avatar')) {
        var img     = document.createElement('img');
        img.src     = user.photoURL;
        img.className = 'user-avatar';
        profileIcon.replaceWith(img);
    }

    if (signOutBtn) signOutBtn.style.display = 'flex';
    if (profileBtn) profileBtn.onclick = null; // disable re-opening modal
    closeLoginModal();
    if (typeof showToast === 'function') showToast('Welcome, ' + (user.displayName ? user.displayName.split(' ')[0] : 'User') + '! 👋');
    sendLoginEmail(user); // Send login confirmation email
}

function updateHeaderForGuest() {
    var profileName = document.getElementById('profileName');
    var signOutBtn  = document.getElementById('signOutBtn');
    var avatar      = document.querySelector('.user-avatar');
    var profileBtn  = document.getElementById('profileBtn');

    if (profileName) profileName.textContent = 'Profile';
    if (signOutBtn)  signOutBtn.style.display = 'none';
    if (avatar) {
        var icon      = document.createElement('span');
        icon.className = 'material-symbols-outlined action_icon';
        icon.id        = 'profileIcon';
        icon.textContent = 'person';
        avatar.replaceWith(icon);
    }
    if (profileBtn) profileBtn.onclick = openLoginModal;
    if (typeof showToast === 'function') showToast('Signed out successfully');
}

/* ── Modal ── */
function openLoginModal() {
    var modal = document.getElementById('loginModal');
    if (modal) modal.classList.add('active');
}
function closeLoginModal() {
    var modal = document.getElementById('loginModal');
    if (modal) modal.classList.remove('active');
}
function showAuthError(msg) {
    var el = document.getElementById('authError');
    if (el) { el.textContent = msg; el.style.display = 'block'; }
}

/* ── Make everything global ── */
window.signInWithGoogle  = signInWithGoogle;
window.signOutUser       = signOutUser;
window.openLoginModal    = openLoginModal;
window.closeLoginModal   = closeLoginModal;
window.saveToFirestore   = saveToFirestore;
