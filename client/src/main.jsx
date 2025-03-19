import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { CartProvider } from "./pages/cart/cartContext.jsx";
import { WishlistProvider } from "./pages/Wishlist/WishlistContext.jsx";
import { AuthProvider } from "./Context/authContext.jsx";

createRoot(document.getElementById("root")).render(
  // <StrictMode>
  <AuthProvider>
  <CartProvider>
    <WishlistProvider>
      <App />
    </WishlistProvider>
  </CartProvider>
  </AuthProvider>
  // </StrictMode>,
);
// There is no need of the strict mode in production?