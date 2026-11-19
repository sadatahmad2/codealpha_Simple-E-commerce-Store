# NOVA MART — Premium Full Stack E-Commerce Platform

**NOVA MART** is a modern, responsive, full-stack e-commerce web application developed for **CodeAlpha Full Stack Development Internship – Task 1 (Simple E-commerce Store)**.

Built using **Python Django**, **Django REST Framework (DRF)**, and **pure HTML5, CSS3, and Vanilla JavaScript** (no frontend frameworks like React or Next.js) communicating via the Fetch API.

---

## 🌟 Key Features

### 1. Homepage & Visual Design
- **Modern UI/UX**: Inspired by Apple, Nike, and Amazon with clean typography, smooth transitions, micro-interactions, and light theme.
- **Announcement Bar**: Dynamic banner with dismiss feature highlighting deals and coupons.
- **Hero Section**: Impactful headline, call-to-actions, customer statistics, and floating visual elements.
- **Shop by Category**: Visual grid with interactive icons and links.
- **Curated Sections**: Handpicked **Featured Products**, **Trending Now**, and **Best Sellers**.
- **Special Flash Sale**: Interactive countdown timer with coupon codes (`NOVA10` and `FLASH20`).
- **Customer Testimonials & Value Propositions**: Real reviews and service guarantees (Free Delivery, 30-Day Returns, 24/7 Support).
- **Newsletter Subscription**: Direct subscription feedback with instant toast notification.
- **Universal Search**: Fast product search from the navigation bar.

### 2. Product Catalog & Filtering
- **Dynamic Product Grid**: Clean product cards displaying discount badges, ratings, original and discounted prices, stock badges, wishlist toggle, and quick cart actions.
- **Sidebar Filters**:
  - Live category radio selection.
  - Price range filter (Min / Max).
  - Sorting (Newest, Price: Low to High, Price: High to Low, Name).
- **Server-Side Pagination**: Clean pagination controls navigating catalog pages.
- **Empty & Loading States**: Shimmer skeleton loaders and interactive empty search states.

### 3. Product Details Page
- **Interactive Gallery**: High-resolution product images with thumbnail navigation and zoom hint.
- **Stock Indicators**: Real-time stock availability with low-stock warnings.
- **Quantity Selector**: Enforced minimum and maximum boundaries based on available inventory.
- **One-Click "Buy Now"**: Adds product to cart and immediately routes to checkout.
- **Customer Reviews System**:
  - Interactive star rating input (1 to 5 stars).
  - User review submission with duplication prevention.
  - Reviews list and live average rating calculations.
- **Related Products**: Smart recommendations from the same category.

### 4. Shopping Cart
- **Dynamic Session-Based Cart**: Works seamlessly for both guest and authenticated users.
- **Quantity Controls**: Real-time increment, decrement, and removal of cart items.
- **Financial Calculations**: Real-time subtotal, coupon discounts, shipping rules (Free over ₹999), and final total.
- **Empty Cart Experience**: Delightful empty state with direct links to trending recommendations.
- **Live Cart Badge**: Reactive count badges updated across all pages.

### 5. Secure Checkout & Order Processing
- **Server-Side Verification**: Validates stock availability and prices directly against the database to prevent client tampering.
- **Customer Information Form**: Name, email, phone, street address, city, state, and 6-digit PIN code.
- **Stock Management**: Automatically decrements product inventory upon order confirmation.
- **Unique Order Identification**: Generates unique tracking codes (e.g. `NM202611192214001234`).
- **Payment Method**: Cash on Delivery (COD) fully implemented; structured for pluggable online payment gateway integration.
- **Order Confirmation Page**: Detailed invoice summary with item breakdown, delivery timeline estimate, and delivery address.

### 6. User Authentication & Dashboard
- **Django Authentication**: Password hashing using Django's PBKDF2 algorithm.
- **Registration & Login**: Dual frontend implementation supporting both AJAX JSON requests and traditional form posts.
- **Password Strength Meter**: Real-time visual feedback on password complexity.
- **User Dashboard**:
  - **My Orders**: Complete historical records with order tracking timeline (Processing &rarr; Confirmed &rarr; Shipped &rarr; Delivered).
  - **Profile Management**: Update first name, last name, email, and phone.
  - **Saved Address**: Store default shipping address for accelerated checkout.
  - **Account Settings**: Manage email preferences and security.

### 7. Comprehensive Django Admin Panel
- Custom Django admin interface for managing:
  - **Categories** (with prepopulated slugs).
  - **Products** (with inline images, stock editable directly in list view, and filters).
  - **Orders & Order Items** (with inline items, customer contact, and status management).
  - **Customer Reviews** (with star rating filters).
  - **Custom Users** (extended with phone, address, and profile data).

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | HTML5, CSS3, Modern Vanilla JavaScript (ES6+), Fetch API |
| **Backend** | Python 3.9+, Django 4.2+, Django REST Framework 3.14+ |
| **Database** | SQLite (development) & Django ORM (PostgreSQL-ready) |
| **Authentication** | Django Built-in Session & Model Authentication |
| **Security** | CSRF Protection, Password Hashing, Input Sanitization |

---

## 📁 Directory Structure

```text
task1/
├── manage.py                   # Django CLI management script
├── requirements.txt            # Python dependencies
├── .env                        # Environment variables (SECRET_KEY, DEBUG)
├── db.sqlite3                  # Development SQLite database
├── media/                      # Uploaded media (products, categories, gallery)
├── novamart/                   # Django Project Root
│   ├── __init__.py
│   ├── asgi.py
│   ├── settings.py             # Project configuration (apps, middleware, templates, static)
│   ├── urls.py                 # Master URL configuration
│   └── wsgi.py
├── static/                     # Static Assets
│   ├── css/
│   │   ├── base.css            # Base typography, reset, design tokens, navbar, footer
│   │   ├── components.css      # Modals, badges, review cards, skeletons
│   │   └── responsive.css      # Breakpoints for desktops, tablets, and smartphones
│   ├── js/
│   │   ├── utils.js            # CSRF helper, apiCall fetch wrapper, Toast, Wishlist
│   │   ├── cart.js             # Reactive cart state manager
│   │   ├── home.js             # Homepage category, product loader, countdown timer
│   │   ├── products.js         # Catalog filters, pagination, sort, search
│   │   ├── product_detail.js   # Gallery switcher, quantity, review submission
│   │   ├── cart_page.js        # Cart page rendering, coupon calculations
│   │   ├── checkout.js         # Form validation & order placement
│   │   ├── auth.js             # Password toggle, strength meter, login/register
│   │   └── dashboard.js        # Tab switching, profile update, order history
│   └── images/
│       └── placeholder.jpg     # Default product fallback placeholder
├── templates/                  # HTML5 Templates
│   ├── base.html               # Base layout (header, announcement bar, mobile drawer, footer)
│   ├── auth/
│   │   ├── login.html          # Clean sign-in page with brand visual
│   │   └── register.html       # Sign-up page with live validation
│   └── store/
│       ├── home.html           # Full homepage with all 9 requested sections
│       ├── products.html       # Product catalog with sidebar filters & pagination
│       ├── product_detail.html # Product detail page with gallery, tabs & reviews
│       ├── cart.html           # Dynamic shopping cart & order summary
│       ├── checkout.html       # Multi-step checkout with COD
│       ├── order_success.html  # Order confirmation & delivery estimate
│       └── dashboard.html      # User dashboard & order tracking timeline
├── store/                      # Core E-Commerce Django Application
│   ├── admin.py                # Admin configurations with inlines
│   ├── models.py               # Category, Product, ProductImage, Order, OrderItem, Review
│   ├── serializers.py          # DRF Serializers
│   ├── urls.py                 # Store route declarations
│   ├── views.py                # Template Views & REST API endpoints
│   ├── tests.py                # Complete test suite
│   └── management/
│       └── commands/
│           └── seed_data.py    # Database seeder (24 products, 6 categories, admin user)
└── users/                      # User Management Django Application
    ├── admin.py                # CustomUser admin configuration
    ├── models.py               # CustomUser model (phone, address, city, state, pincode)
    ├── serializers.py          # User auth and profile serializers
    ├── urls.py                 # Auth routes
    ├── views.py                # Auth API views & page views
    └── tests.py                # Auth test suite
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
Ensure you have Python 3.9+ installed on your system:
```bash
python3 --version
```

### 2. Install Dependencies
Install all required packages from `requirements.txt`:
```bash
pip install -r requirements.txt
```

### 3. Database Migrations
Initialize the SQLite database and create tables:
```bash
python manage.py makemigrations users
python manage.py makemigrations store
python manage.py migrate
```

### 4. Seed Sample Products & Create Admin
Run the automated seed command to populate 6 categories, 24 realistic products, and the default superuser account:
```bash
python manage.py seed_data
```

Default credentials:
- **Username**: `admin`
- **Password**: `admin123`
- **Email**: `admin@novamart.com`

### 5. Run Development Server
Start the Django development server:
```bash
python manage.py runserver
```
Visit **[http://127.0.0.1:8000/](http://127.0.0.1:8000/)** in your browser.

---

## 🧪 Running Automated Tests

A comprehensive unit and integration test suite is included in `store/tests.py` and `users/tests.py`.

Run the test suite with:
```bash
python manage.py test
```

Expected output:
```text
Found 14 test(s).
Creating test database for alias 'default'...
System check identified no issues (0 silenced).
..............
----------------------------------------------------------------------
Ran 14 tests in 3.338s

OK
Destroying test database for alias 'default'...
```

---

## 📡 REST API Reference

| Endpoint | Method | Description | Auth Required |
|---|---|---|---|
| `/api/categories/` | `GET` | List all product categories | No |
| `/api/products/` | `GET` | Filter, search, and paginate products (`?search=`, `?category=`, `?min_price=`, `?max_price=`, `?sort=`, `?page=`) | No |
| `/api/products/<slug>/` | `GET` | Retrieve single product details | No |
| `/api/products/featured/` | `GET` | List featured products (limit 8) | No |
| `/api/products/trending/` | `GET` | List trending products (limit 8) | No |
| `/api/products/bestsellers/` | `GET` | List best-selling products (limit 8) | No |
| `/api/cart/` | `GET` | Retrieve current session cart items and subtotal | No |
| `/api/cart/` | `POST` | Add item to cart (`product_id`, `quantity`) with stock validation | No |
| `/api/cart/` | `PUT` | Update item quantity in cart | No |
| `/api/cart/` | `DELETE` | Remove item or clear cart | No |
| `/api/checkout/` | `POST` | Validate stock, compute amounts, place order, and decrement stock | Yes |
| `/api/orders/` | `GET` | List orders belonging to the logged-in user | Yes |
| `/api/orders/<order_number>/` | `GET` | Retrieve single order details for authenticated user | Yes |
| `/api/reviews/` | `GET` | List customer reviews for a product (`?product_id=`) | No |
| `/api/reviews/create/` | `POST` | Submit customer product review & rating (1–5) | Yes |
| `/api/auth/register/` | `POST` | Register a new user account | No |
| `/api/auth/login/` | `POST` | Authenticate user credentials and create session | No |
| `/api/auth/logout/` | `POST` | End session and log user out | Yes |
| `/api/auth/profile/` | `GET`, `PUT` | View or update customer profile & delivery address | Yes |

---

## 🔒 Security Best Practices Implemented
- **CSRF Token Validation**: Enforced across all mutating requests (POST/PUT/DELETE) using Django's CSRF token protection.
- **Server-Side Price & Quantity Integrity**: Order totals and stock checks are strictly calculated on the server to prevent client-side price tampering.
- **Inventory Safety**: Negative quantities and out-of-stock orders are blocked with clear feedback.
- **Secure Password Storage**: Standard PBKDF2 hashing via Django's authentication system (plain-text passwords are never stored).
- **Environment Isolation**: `SECRET_KEY` and debug configurations are separated into `.env`.

---

## 💻 CodeAlpha Internship Verification
Developed specifically for **CodeAlpha Full Stack Development Internship – Task 1 (Simple E-commerce Store)**.
All project specifications, architecture guidelines, database models, and user experience requirements have been fulfilled.
