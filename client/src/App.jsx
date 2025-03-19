import { useState } from "react";
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/react-query';
import Navbar from "./components/Navbar";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Signup from "./pages/sign-up/Signup";
import Wishlist from "./pages/Wishlist/Wishlist";
import HomePage from "./pages/home/HomePage";
import ListingPage from "./pages/listing/ListingPage";
import About from "./pages/about/About";
import AddReviews from "./pages/reviews/AddReviews";
import Reviews from "./pages/reviews/reviews";
import Cart from "./pages/cart/cart";
import RollingLogos from "./pages/RollingLogos";
import Footer from "./components/Footer/Footer";
import DetailsPage from "./pages/details/Detail";
import BulkUpload from "./pages/bulk-upload/uploadProduct";
import Checkout from "./pages/checkout/checkout";
import MultipleUpload from './pages/bulk-upload/MultipleUpload';
import AdminOrders from "./pages/orders/AdminOrder";
import MyOrders from "./pages/orders/MyOrders";
import WhatsappChat from "./components/whatsappChat";
import { CartProvider } from "./pages/cart/cartContext";
import { AdminProvider } from "./Context/adminContext";
// 

import "./App.css";
import ReviewList from "./pages/reviews/ReviewList";
import ContactUs from "./pages/contact-us/ContactUs";
import { Navigate } from "react-router-dom";
import { useAuth } from "./Context/authContext";
import ProtectedRoutes from "./Context/ProtectedRoutes";
import OrderSuccessPage from './pages/orders/OrderSuccess';
import TrackOrder from './pages/orders/OrderTracking';
import { NotificationProvider } from "./features/notifications/context/NotificationContext";
// import { NotificationBell } from '../../notifications/components/NotificationBell';
import NotificationBell from './features/notifications/components/NotificationBell';
import ToastContainer from 'react-hot-toast';
import AdminDashboard from './pages/AdminDashboard';
import AdminLoign from './pages/AdminLogin';
import AdminRegister from './pages/AdminRegister';

function App() {
  const { user } = useAuth();

  return (
    <AdminProvider>
    <QueryClientProvider client={queryClient}>
      <NotificationProvider>
        <CartProvider>
          <BrowserRouter>
            <div className="flex flex-col min-h-screen">
              <header className="sticky top-0 z-50 bg-white shadow-md">
                <Navbar />
                <div className="absolute right-4 top-4">
                  <NotificationBell />
                </div>
                <div className="absolute right-4 top-4">
                  <WhatsappChat />
                </div>
              </header>

              <main className="flex-grow">
                <Routes>
                  {/* 🔹 Public Routes (Accessible to All) */}
                  <Route path="/" element={<HomePage />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/wishlist" element={<Wishlist />} />
                  <Route path="products/category/:categoryId" element={<ListingPage />} />
                  <Route path="products/subcategory/:subcategoryId" element={<ListingPage />} />
                  <Route path="products/search" element={<ListingPage />} />
                  <Route path="products/filters" element={<ListingPage />} />
                  <Route path="/products/:id" element={<DetailsPage />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/about us" element={<About />} />
                  <Route path="/contact us" element={<ContactUs />} />
                  <Route path="/order-success/:orderId" element={<OrderSuccessPage />} />
                  <Route path="/my-orders" element={<MyOrders />} />
                  <Route path="/track-order/:orderId" element={<TrackOrder />} />
                  <Route path="/admin/dashboard" element={<AdminDashboard />} />
                  <Route path="/admin/login" element={<AdminLoign />} />
                  <Route path="/admin/register" element={<AdminRegister />} />
                  <Route path="/admin/order-management" element={<AdminOrders />} />

                  {/* 🔹 Customer & Guest Restricted Routes */}
                  <Route path="/checkout" element={
                    <ProtectedRoutes allowedRoles={["customer", "guest", "admin"]}>
                      <Checkout />
                    </ProtectedRoutes>
                  } />

                  {/* 🔹 Admin-Only Routes */}
                  <Route path="/admin-order" element={
                    <ProtectedRoutes allowedRoles={["admin"]}>
                      <AdminOrders />
                    </ProtectedRoutes>
                  } />

                  {/* <Route path="/user-order" element={
                    <ProtectedRoutes allowedRoles={["admin", "customer, guest"]}>
                      <UserOrders />
                    </ProtectedRoutes>
                  } /> */}

                  <Route path="/upload" element={
                    <ProtectedRoutes allowedRoles={["admin"]}>
                      <BulkUpload />
                    </ProtectedRoutes>
                  } />

                  <Route path="/multiple-upload" element={
                    <ProtectedRoutes allowedRoles={["admin"]}>
                      <MultipleUpload />
                    </ProtectedRoutes>
                  } />

                  <Route path="/reviews" element={
                    <ProtectedRoutes allowedRoles={["admin", "customer", "guest"]}>
                      <Reviews />
                    </ProtectedRoutes>
                  } />
                </Routes>
              </main>

              <footer>
                <RollingLogos />
                <Reviews />
                <Footer />
              </footer>
            </div>
          </BrowserRouter>
        </CartProvider>
        <ToastContainer />
      </NotificationProvider>
    </QueryClientProvider>
    </AdminProvider>
  );
}

export default App;
