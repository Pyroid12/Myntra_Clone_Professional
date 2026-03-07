/* ============================================================
   MYNTRA CLONE — firebase.js
   Firebase Auth + Firestore backend

   SETUP STEPS (do this once):
   1. Go to https://console.firebase.google.com
   2. Click "Add project" → name it "Myntra Clone" → Create
   3. Click "Authentication" → Get Started → Enable "Google"
   4. Click "Firestore Database" → Create database → Start in test mode
   5. Click the </> Web icon → Register app → Copy your firebaseConfig
   6. Replace the firebaseConfig object below with YOUR values
   ============================================================ */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged }
    from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove }
    from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

/* ── YOUR FIREBASE CONFIG — Replace with your own values ── */
const firebaseConfig = {
  apiKey: "AIzaSyBUD18RFEk0ot9w1noQ_mLIKEUFcalIj7E",
  authDomain: "myntra-clone-4c7f9.firebaseapp.com",
  projectId: "myntra-clone-4c7f9",
  storageBucket: "myntra-clone-4c7f9.firebasestorage.app",
  messagingSenderId: "468539949171",
  appId: "1:468539949171:web:d2672a9f0975ce39412a06",
  measurementId: "G-QKSQ71PPHN"
};


/* ── Init ── */
const app  = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db   = getFirestore(app);

/* ── Current user (shared across all pages) ── */
let currentUser = null;

/* ── Auth State Listener ── */
onAuthStateChanged(auth, async function(user) {
    currentUser = user;
    if (user) {
        // User signed in
        updateHeaderForUser(user);
        await syncFromFirestore(user.uid);
    } else {
        // User signed out
        updateHeaderForGuest();
    }
    // Notify page-specific code
    if (typeof onAuthReady === 'function') onAuthReady(user);
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
        // Save to Firestore before signing out
        if (currentUser) await saveToFirestore(currentUser.uid);
        await signOut(auth);
        updateHeaderForGuest();
        if (typeof showToast === 'function') showToast('Signed out successfully');
    } catch(e) {
        console.error('Sign out error:', e);
    }
}

/* ── Save bag + wishlist to Firestore ── */
async function saveToFirestore(uid) {
    try {
        var bagItems      = JSON.parse(localStorage.getItem('bagItems')      || '[]');
        var wishlistItems = JSON.parse(localStorage.getItem('wishlistItems') || '[]');
        await setDoc(doc(db, 'users', uid), {
            bagItems:      bagItems,
            wishlistItems: wishlistItems,
            updatedAt:     new Date().toISOString(),
            email:         currentUser ? currentUser.email : '',
            name:          currentUser ? currentUser.displayName : ''
        }, { merge: true });
    } catch(e) {
        console.error('Save error:', e);
    }
}

/* ── Load bag + wishlist from Firestore ── */
async function syncFromFirestore(uid) {
    try {
        const snap = await getDoc(doc(db, 'users', uid));
        if (snap.exists()) {
            var data = snap.data();
            // Merge Firestore data with localStorage
            if (data.bagItems)      localStorage.setItem('bagItems',      JSON.stringify(data.bagItems));
            if (data.wishlistItems) localStorage.setItem('wishlistItems', JSON.stringify(data.wishlistItems));
            // Refresh page data if function exists
            if (typeof onLoad      === 'function') onLoad();
            if (typeof onBagLoad   === 'function') onBagLoad();
            if (typeof onWishlistLoad === 'function') onWishlistLoad();
        }
    } catch(e) {
        console.error('Sync error:', e);
    }
}

/* ── Auto-save on storage change ── */
window.addEventListener('storage-update', function() {
    if (currentUser) saveToFirestore(currentUser.uid);
});

/* ── Update Header UI ── */
function updateHeaderForUser(user) {
    var profileBtn  = document.getElementById('profileBtn');
    var profileName = document.getElementById('profileName');
    var profileIcon = document.getElementById('profileIcon');
    var signOutBtn  = document.getElementById('signOutBtn');

    if (profileName) profileName.textContent = user.displayName
        ? user.displayName.split(' ')[0]   // First name only
        : user.email.split('@')[0];

    if (profileIcon && user.photoURL) {
        profileIcon.style.display = 'none';
        var img = document.createElement('img');
        img.src = user.photoURL;
        img.className = 'user-avatar';
        profileIcon.parentNode.insertBefore(img, profileIcon);
    }
    if (signOutBtn) signOutBtn.style.display = 'flex';
    closeLoginModal();
}

function updateHeaderForGuest() {
    var profileName = document.getElementById('profileName');
    var signOutBtn  = document.getElementById('signOutBtn');
    var avatarImg   = document.querySelector('.user-avatar');
    var profileIcon = document.getElementById('profileIcon');

    if (profileName) profileName.textContent = 'Profile';
    if (signOutBtn)  signOutBtn.style.display = 'none';
    if (avatarImg)   avatarImg.remove();
    if (profileIcon) profileIcon.style.display = '';
}

/* ── Login Modal ── */
function openLoginModal() {
    var modal = document.getElementById('loginModal');
    if (modal) modal.classList.add('active');
}

function closeLoginModal() {
    var modal = document.getElementById('loginModal');
    if (modal) modal.classList.remove('active');
}

function showAuthError(msg) {
    var errEl = document.getElementById('authError');
    if (errEl) { errEl.textContent = msg; errEl.style.display = 'block'; }
}

/* ── Exports — make available globally ── */
window.signInWithGoogle = signInWithGoogle;
window.signOutUser      = signOutUser;
window.openLoginModal   = openLoginModal;
window.closeLoginModal  = closeLoginModal;
window.saveToFirestore  = saveToFirestore;
window.currentUser      = currentUser;
