# Myntra_Clone_Professional

# 🛍️ Myntra Clone

A fully functional, production-grade Myntra e-commerce clone built with vanilla HTML, CSS, and JavaScript — no frameworks required.

---

## 📁 Project Structure

```
myntra_improved/
├── index.html              # Homepage (product listing)
├── pages/
│   └── bag.html            # Shopping bag / cart page
├── css/
│   ├── index.css           # Global styles + homepage styles
│   └── bag.css             # Bag page styles
├── scripts/
│   ├── index.js            # Homepage logic (products, search, filter, wishlist)
│   └── bag.js              # Bag page logic (cart, quantities, coupon, order)
├── data/
│   └── items.js            # Product data (shared across all pages)
└── images/
    ├── 1.jpg – 8.jpg       # Product images
    └── myntra_logo.webp    # Myntra logo
```

---

## 🚀 How to Run

No build tools or server needed. Just open the file:

1. Extract the ZIP folder
2. Open `myntra_improved/index.html` in any modern browser
3. That's it — everything works locally!

> **Note:** localStorage is used to persist the bag and wishlist between pages, so both pages must be opened from the same folder.

---

## ✨ Features

### Homepage (`index.html`)
- **Sticky header** with logo, nav, search bar, and action icons
- **Hero banner** with animated CTA and stats
- **Category chips** — click to filter products by Men, Women, Beauty, etc.
- **Live search** — type in the search bar to filter products instantly
- **Sort options** — Recommended, Price Low→High, Price High→Low, Best Discount, Top Rated
- **Product cards** — image zoom on hover, wishlist heart button, discount badge
- **Add to Bag** — button changes to "Added ✓" once item is in the bag
- **Wishlist toggle** — heart icon saves/removes items with a toast notification
- **Toast notifications** — bottom pop-up for bag/wishlist actions

### Bag Page (`pages/bag.html`)
- **Bag items list** with product image, brand, name, size selector, and quantity stepper
- **Remove items** — X button removes item from cart and updates totals instantly
- **Quantity stepper** — increase/decrease item quantity (1–10), total updates live
- **Coupon codes** — enter a code to get a discount:
  - `MYNTRA10` → 10% off
  - `FIRST20` → 20% off
  - `SALE30` → 30% off
- **Order summary** — live calculation of MRP, discounts, coupon savings, delivery fee, and total
- **Free delivery** — automatically applied when order exceeds ₹999
- **Place Order** — clears the bag and redirects to homepage with a success message
- **Empty bag state** — friendly message with a "Shop Now" button when bag is empty
- **Sticky summary sidebar** — summary stays visible while scrolling through items
- **Responsive layout** — summary moves below items on mobile screens

---

## 🎨 Design Highlights

- Pixel-accurate Myntra color palette (`#ff3f6c` pink, `#282c3f` dark, `#03a685` green)
- CSS variables for easy theming
- Smooth hover animations on all interactive elements
- Animated bag badge that pops when count changes
- Mobile responsive down to 375px

---

## 🛠️ Technologies Used

| Technology | Usage |
|---|---|
| HTML5 | Page structure and semantics |
| CSS3 | Styling, animations, responsive layout |
| Vanilla JavaScript | All interactivity and logic |
| localStorage | Persisting bag and wishlist across pages |
| Google Fonts (Assistant) | Typography |
| Google Material Symbols | Icons throughout the UI |

---

## 📦 Adding More Products

Open `data/items.js` and add a new object to the `items` array:

```javascript
{
    id: '009',                          // Unique ID (string)
    image: 'images/9.jpg',              // Path to image
    company: 'Brand Name',
    item_name: 'Product description',
    original_price: 1999,
    current_price: 999,
    discount_percentage: 50,
    return_period: 14,                  // Days (or omit if no returns)
    delivery_date: 'Tomorrow',
    category: 'men',                    // men | women | kids | beauty | jewellery | home
    sizes: ['S', 'M', 'L', 'XL'],
    rating: { stars: 4.3, count: 512 },
    wishlist: false,
}
```

---

## 📄 License

This project is a clone built for educational purposes only.  
All trademarks and brand assets belong to [Myntra](https://www.myntra.com).

