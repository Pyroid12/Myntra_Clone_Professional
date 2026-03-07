# 🛍️ Myntra Clone — Professional

A full-featured e-commerce fashion web app built as a clone of [Myntra](https://www.myntra.com), deployed on GitHub Pages with Firebase backend.

🔗 **Live Site:** [pyroid12.github.io/Myntra_Clone_Professional](https://pyroid12.github.io/Myntra_Clone_Professional/)

---

## 📸 Preview

![Myntra Clone Preview](myntra_logo.webp)

---

## ✨ Features

### 🏠 Homepage
- Responsive sticky header with logo, navigation, search bar
- Hero banner with gradient and sale statistics
- Shop by Category chips (All, Men, Women, Kids, Beauty, Jewellery, Home)
- Filter bar with sort options (Price, Discount, Rating)
- Product grid with 8 fashion products
- Live search with instant filtering
- Add to Bag with badge count animation
- Wishlist toggle with heart icon
- Toast notifications for all actions
- Fully responsive (mobile, tablet, desktop)

### 🛍️ Bag Page
- Product cards with size selector and quantity stepper
- Coupon codes — `MYNTRA10`, `FIRST20`, `SALE30`
- Dynamic price calculation with savings
- Free delivery on orders above ₹999
- Sticky order summary sidebar
- Place Order clears cart and redirects

### ❤️ Wishlist Page
- 4-column grid of wishlisted products
- Add to Bag directly from wishlist
- Remove individual items or Clear All
- Wishlist count badge on header icon
- Empty state with Shop Now button

### 🔐 Firebase Backend
- Google Login / Signup via popup
- User data saved to Firestore (bag + wishlist)
- Auto-sync across devices on login
- Sign out with data persistence
- Firestore Security Rules protecting user data

### 📱 PWA (Progressive Web App)
- Install as app on Android / iPhone / Desktop
- Works offline — all products and images cached
- Custom install banner on homepage
- App shortcuts for Bag and Wishlist
- Full screen standalone mode (no browser bar)

---

## 🗂️ Project Structure

```
Myntra_Clone_Professional/
│
├── index.html          # Homepage
├── bag.html            # Shopping Bag page
├── wishlist.html       # Wishlist page
│
├── index.css           # Main stylesheet
├── bag.css             # Bag page styles
├── wishlist.css        # Wishlist page styles
├── auth.css            # Login modal styles
│
├── index.js            # Homepage logic
├── bag.js              # Bag page logic
├── wishlist.js         # Wishlist page logic
├── items.js            # Product data
├── firebase.js         # Firebase Auth + Firestore
│
├── sw.js               # Service Worker (PWA)
├── manifest.json       # PWA Manifest
│
├── myntra_logo.webp    # Myntra logo
├── 1.jpg – 8.jpg       # Product images
└── README.md           # This file
```

---

## 🛠️ Tech Stack

| Technology | Usage |
|---|---|
| HTML5 | Structure |
| CSS3 | Styling, animations, responsive design |
| Vanilla JavaScript | Logic, DOM manipulation |
| Firebase Authentication | Google Login / Signup |
| Firebase Firestore | Cloud database |
| Service Worker | Offline support, caching |
| GitHub Pages | Free hosting |

---

## 🔥 Firebase Setup

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Create a new project
3. Enable **Google Authentication**
4. Create **Firestore Database** in test mode
5. Register a Web App and copy `firebaseConfig`
6. Paste your config in `firebase.js`
7. Add `pyroid12.github.io` to Authorized Domains
8. Add Firestore Security Rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null
                         && request.auth.uid == userId;
    }
  }
}
```

---

## 🎮 Coupon Codes

| Code | Discount |
|---|---|
| `MYNTRA10` | 10% off |
| `FIRST20` | 20% off |
| `SALE30` | 30% off |

---

## 📦 Deployment

This project is deployed on **GitHub Pages** for free.

To deploy your own copy:
1. Fork this repository
2. Go to **Settings → Pages**
3. Set source to **main branch / root**
4. Your site will be live at `yourusername.github.io/Myntra_Clone_Professional/`

---

## 👨‍💻 Developer

**Yash Rendalkar**
- GitHub: [@Pyroid12](https://github.com/Pyroid12)
- Live Project: [pyroid12.github.io/Myntra_Clone_Professional](https://pyroid12.github.io/Myntra_Clone_Professional/)

---

## 📄 License

This project is for educational purposes only.
Myntra is a trademark of Myntra Designs Pvt. Ltd.

---

⭐ If you found this project helpful, please give it a star on GitHub!
