# 🛍️ Myntra Clone — Professional

A full-featured, production-level e-commerce fashion web app built as a clone of [Myntra](https://www.myntra.com), deployed on GitHub Pages with Firebase backend, PWA support, and premium UI features.

🔗 **Live Site:** [pyroid12.github.io/Myntra_Clone_Professional](https://pyroid12.github.io/Myntra_Clone_Professional/)

---

## 📸 Preview

![Myntra Clone](myntra_logo.webp)

---

## ✨ Complete Feature List

### 🏠 Homepage
- Sticky responsive header with logo, navigation, search bar
- ⏰ **Flash Sale Countdown Timer** — live 6-hour countdown banner
- 🎠 **Auto-sliding Hero Banner** — 4 slides, swipe support, dot indicators
- Shop by Category chips — All, Men, Women, Kids, Beauty, Jewellery, Home
- Filter bar with sort options — Price, Discount, Rating, Recommended
- 🦴 **Skeleton Loading Cards** — shimmer placeholders before products load
- ✨ **Animated product cards** — staggered fade-in on load
- Product grid with 8 fashion products
- Live search with instant filtering
- Add to Bag with badge count animation
- Wishlist toggle with heart icon
- Toast notifications for all actions
- Fully responsive — mobile, tablet, desktop

### 🛍️ Bag Page
- Product cards with size selector and quantity stepper
- Coupon codes — `MYNTRA10`, `FIRST20`, `SALE30`
- Dynamic price calculation with savings
- Free delivery on orders above ₹999
- Sticky order summary sidebar
- 🎉 **Confetti animation** on Place Order
- Redirects to Order History after placing order

### ❤️ Wishlist Page
- 4-column grid of wishlisted products
- Add to Bag directly from wishlist
- Remove individual items or Clear All
- Wishlist count badge on header icon
- Empty state with Shop Now button

### 🛒 Product Detail Page
- Large product image with zoom on hover
- Thumbnail image strip
- Full price, discount, rating details
- Size selector with validation
- Add to Bag + Wishlist buttons
- Delivery info, return policy
- Offers & coupon section
- Accordion — Product Details, Size & Fit, Material & Care
- Share button — Web Share API
- Similar Products grid at bottom

### 📦 Order History Page
- All past orders saved automatically
- Order ID, date, total, status badges
- Product images with size, qty, price per item
- 📍 **Visual delivery timeline** — Ordered → Packed → Shipped → Delivered
- Filter tabs — All, Delivered, Processing, Cancelled
- Reorder button — adds items back to bag instantly
- Cancel order for Processing orders
- Dark mode support

### 🔐 Firebase Backend
- Google Login / Signup via popup
- User data saved to Firestore — bag + wishlist
- Auto-sync across all devices on login
- Firestore Security Rules protecting user data
- Sign out with data persistence

### 📱 PWA — Progressive Web App
- Install as app on Android / iPhone / Desktop
- Works offline — all products and images cached
- Custom install banner on homepage
- App shortcuts for Bag and Wishlist
- Full screen standalone mode

### 🎨 Premium UI Features
- 🌙 **Dark Mode** — full site dark theme, saved to localStorage
- 💫 **Splash Screen** — animated logo on first visit
- 🎯 **Back to Top** button — appears after scrolling
- 📱 **Mobile Bottom Navigation** — Home, Wishlist, Bag, Profile
- Badge counts on Bag and Wishlist icons

---

## 🗂️ Project Structure

```
Myntra_Clone_Professional/
│
├── index.html           # Homepage
├── bag.html             # Shopping Bag
├── wishlist.html        # Wishlist
├── product.html         # Product Detail
├── orders.html          # Order History
│
├── index.css            # Main stylesheet
├── bag.css              # Bag styles
├── wishlist.css         # Wishlist styles
├── product.css          # Product detail styles
├── orders.css           # Order history styles
├── auth.css             # Login modal styles
├── bottomnav.css        # Mobile bottom nav
├── uifeatures.css       # Dark mode, skeleton, animations
│
├── index.js             # Homepage logic
├── bag.js               # Bag logic
├── wishlist.js          # Wishlist logic
├── product.js           # Product detail logic
├── orders.js            # Order history logic
├── items.js             # Product data
├── firebase.js          # Firebase Auth + Firestore
├── uifeatures.js        # Dark mode, slider, confetti, timer
│
├── sw.js                # Service Worker (PWA)
├── manifest.json        # PWA Manifest
│
├── myntra_logo.webp     # Myntra logo
├── 1.jpg – 8.jpg        # Product images
└── README.md            # This file
```

---

## 🛠️ Tech Stack

| Technology | Usage |
|---|---|
| HTML5 | Structure & semantic markup |
| CSS3 | Styling, animations, responsive design |
| Vanilla JavaScript | Logic, DOM manipulation, local storage |
| Firebase Authentication | Google Login / Signup |
| Firebase Firestore | Cloud database for user data |
| Service Worker | Offline support & caching |
| Web Share API | Native share on mobile |
| GitHub Pages | Free hosting & deployment |

---

## 🔥 Firebase Setup

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Create a new project — name it `Myntra Clone`
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

## 📱 Pages & Routes

| Page | URL |
|---|---|
| Homepage | `/index.html` |
| Product Detail | `/product.html?id=001` |
| Shopping Bag | `/bag.html` |
| Wishlist | `/wishlist.html` |
| Order History | `/orders.html` |

---

## 🚀 Local Development

1. Clone the repository:
```bash
git clone https://github.com/Pyroid12/Myntra_Clone_Professional.git
```

2. Open with Live Server in VS Code

3. Add your Firebase config to `firebase.js`

4. Open `http://localhost:5500/Myntra_Clone_Professional/`

---

## 📦 Deployment

Deployed on **GitHub Pages** for free:

1. Fork this repository
2. Go to **Settings → Pages**
3. Set source to **main branch / root**
4. Live at `yourusername.github.io/Myntra_Clone_Professional/`

---

## 🙏 Acknowledgements

- Design inspired by [Myntra](https://www.myntra.com)
- Icons by [Google Material Symbols](https://fonts.google.com/icons)
- Fonts by [Google Fonts](https://fonts.google.com)
- Backend by [Firebase](https://firebase.google.com)

---

## 👨‍💻 Developer

**Yash Rendalkar**
- GitHub: [@Pyroid12](https://github.com/Pyroid12)
- Live Project: [pyroid12.github.io/Myntra_Clone_Professional](https://pyroid12.github.io/Myntra_Clone_Professional/)

---

## 📄 License

This project is built for educational purposes only.
Myntra is a registered trademark of Myntra Designs Pvt. Ltd.

---

⭐ **If you found this project helpful, please star it on GitHub!**
