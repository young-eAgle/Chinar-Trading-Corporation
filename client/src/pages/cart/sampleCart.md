
### 🛒 **Step-by-Step Cart Functionality Integration**

---

### 1️⃣ **Cart Context Setup (Global State Management)**
We'll use React's Context API to manage cart operations (add, remove, update quantity) globally.

#### 📂 **Create `CartContext.js` in `src/context/`**
```jsx
import React, { createContext, useContext, useReducer } from "react";

const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case "ADD_TO_CART": {
      const existingItem = state.find((item) => item._id === action.payload._id);
      if (existingItem) {
        return state.map((item) =>
          item._id === action.payload._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...state, { ...action.payload, quantity: 1 }];
    }

    case "REMOVE_FROM_CART":
      return state.filter((item) => item._id !== action.payload);

    case "CLEAR_CART":
      return [];

    case "UPDATE_QUANTITY":
      return state.map((item) =>
        item._id === action.payload._id
          ? { ...item, quantity: action.payload.quantity }
          : item
      );

    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [cart, dispatch] = useReducer(cartReducer, []);
  return (
    <CartContext.Provider value={{ cart, dispatch }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
```

---

### 2️⃣ **Wrap `CartProvider` in `App.js`**
```jsx
import { CartProvider } from "./context/CartContext";

function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="products/category/:categoryId" element={<ListingPage />} />
          <Route path="products/subcategory/:subcategoryId" element={<ListingPage />} />
          <Route path="products/search" element={<ListingPage />} />
          <Route path="/cart" element={<CartPage />} /> {/* 🆕 Cart Page */}
        </Routes>
      </BrowserRouter>
    </CartProvider>
  );
}
```

---

### 3️⃣ **Add 'Add to Cart' Button in `ProductCard`**
```jsx
import { useCart } from "../context/CartContext";

const ProductCard = ({ product }) => {
  const { dispatch } = useCart();

  const handleAddToCart = () => {
    dispatch({ type: "ADD_TO_CART", payload: product });
  };

  return (
    <div className="border p-4 rounded-lg shadow-lg flex flex-col items-center">
      <img src={product.imageUrl} alt={product.name} className="w-full h-48 object-cover" />
      <h3 className="mt-2 font-bold text-lg">{product.name}</h3>
      <p>Price: Rs. {product.discountedPrice}</p>
      <button
        onClick={handleAddToCart}
        className="mt-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
      >
        Add to Cart
      </button>
    </div>
  );
};
```

---

### 4️⃣ **Create `CartPage.js` for Cart Display & Management**
```jsx
import React from "react";
import { useCart } from "../context/CartContext";

const CartPage = () => {
  const { cart, dispatch } = useCart();

  const handleRemove = (id) => dispatch({ type: "REMOVE_FROM_CART", payload: id });
  const handleClearCart = () => dispatch({ type: "CLEAR_CART" });

  const totalAmount = cart.reduce(
    (acc, item) => acc + item.discountedPrice * item.quantity,
    0
  );

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">🛒 Your Cart</h2>
      {cart.length === 0 ? (
        <p className="text-center">Your cart is empty.</p>
      ) : (
        <div>
          {cart.map((item) => (
            <div key={item._id} className="flex justify-between items-center mb-4 p-4 border rounded-lg">
              <img src={item.imageUrl} alt={item.name} className="w-24 h-24 object-cover" />
              <div className="flex-1 px-4">
                <h3 className="font-semibold">{item.name}</h3>
                <p>Price: Rs. {item.discountedPrice} x {item.quantity}</p>
              </div>
              <button onClick={() => handleRemove(item._id)} className="bg-red-500 text-white px-3 py-1 rounded">Remove</button>
            </div>
          ))}
          <h3 className="text-xl font-semibold">Total: Rs. {totalAmount}</h3>
          <button onClick={handleClearCart} className="mt-4 bg-gray-700 text-white px-5 py-2 rounded">Clear Cart</button>
        </div>
      )}
    </div>
  );
};

export default CartPage;
```

// ---

// ### 5️⃣ **Cart Icon in Navbar with Item Count**
```jsx
import { useCart } from "../context/CartContext";
import { Link } from "react-router-dom";

// Inside Navbar return:
<Link to="/cart" className="relative">
  <i className="fa-solid fa-cart-shopping text-2xl"></i>
  {cart.length > 0 && (
    <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full px-2 text-sm">
      {cart.length}
    </span>
  )}
</Link>
```

// ---

// ### 🎯 **What's Done:**
// - ✅ Global cart state management.
// - ✅ Product add/remove from cart.
// - ✅ Cart page with total calculation.
// - ✅ Cart icon with item count in Navbar.

// ---

// ### 🔜 **Next Steps:**
// - 📝 Checkout process with order summary.
// - 💳 Integration with payment gateway (if required).
// - 🎨 UI polishing & responsive tweaks.

// Let me know if you'd like any adjustments before moving ahead with the checkout flow! 🚀