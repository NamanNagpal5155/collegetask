# ShopHub — College Task

A simple e-commerce frontend built with vanilla HTML, CSS, and JavaScript as a college assignment.

## Tasks Completed

1. **Listing Page** — Displays all products fetched from the API in a grid layout.
2. **Product Detail Page** — Clicking a product navigates to a dedicated detail page with images, reviews, and add-to-cart.
3. **Cart Page** — Shows all cart items with quantity controls and a bill summary (subtotal, discount, total).

## APIs Used

- **All products:** `https://dummyjson.com/products?limit=194`
- **Single product:** `https://dummyjson.com/products/{id}`

## Pages

- **Home** (`index.html`) – Product grid
- **Product Detail** (`product.html?id=`) – Individual product view
- **Cart** (`cart.html`) – Cart management & bill summary

## Features

- Product listing with category, rating, and discounted pricing
- Product detail with image gallery and customer reviews
- Add to cart / remove from cart with quantity controls
- Persistent cart via `localStorage`
- Discount calculation and bill summary
- Toast notifications
- Fully responsive design

## Usage

Open any `.html` file in a browser. No build step or server required.
