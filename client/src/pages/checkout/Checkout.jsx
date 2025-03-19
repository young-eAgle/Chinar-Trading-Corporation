import React, { useState, useEffect, memo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../cart/cartContext";
import { useAuth } from "../../Context/authContext";
// import { countries } from 'countries-list';
import { motion, AnimatePresence } from "framer-motion";
import {
  FaCreditCard,
  FaLock,
  FaExclamationCircle,
  FaCheckCircle,
  FaSpinner,
} from "react-icons/fa";
import { toast } from "react-hot-toast";
import { useNotification } from '../../features/notifications/context/NotificationContext';
import { api, endpoints } from "../../api";

// Loading skeleton for form fields
const FormFieldSkeleton = () => (
  <div className="animate-pulse space-y-2">
    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
    <div className="h-10 bg-gray-200 rounded"></div>
  </div>
);

// Form field component with validation
const FormField = memo(({ label, name, type = "text", value, onChange, error, placeholder, required = true }) => (
  <div className="space-y-1">
    <label className="block text-sm font-medium text-gray-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
        error ? "border-red-500" : "border-gray-300"
      }`}
    />
    {error && (
      <motion.p
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-red-500 text-sm"
      >
        {error}
      </motion.p>
    )}
  </div>
));

FormField.displayName = 'FormField';

// Order summary component
const OrderSummary = memo(({ cart, subtotal, shipping, total }) => (
  <div className="bg-white rounded-lg shadow-md p-6">
    <h3 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h3>
    <div className="space-y-4">
      {cart.map((item) => (
        <div key={item._id} className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img
              src={item.imageUrl}
              alt={item.name}
              className="w-12 h-12 rounded-md object-cover"
            />
            <div>
              <p className="text-sm font-medium">{item.name}</p>
              <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
            </div>
          </div>
          <span className="font-medium">
            Rs.{(parseFloat(item.price.toString().replace(/,/g, "")) * (item.quantity ?? 1)).toLocaleString()}
          </span>
        </div>
      ))}
      <div className="border-t pt-4 space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-600">Subtotal</span>
          <span className="font-medium">Rs.{subtotal.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Shipping</span>
          <span className="font-medium">
            {shipping === 0 ? "3000" : `${shipping.toLocaleString()}`}
          </span>
        </div>
        <div className="flex justify-between text-lg font-bold">
          <span>Total</span>
          <span className="text-green-600">Rs{total.toLocaleString()}</span>
        </div>
      </div>
    </div>
  </div>
));

OrderSummary.displayName = 'OrderSummary';

const Checkout = () => {
  const { cart, dispatch } = useCart();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [errors, setErrors] = useState({});
  const [billingSameAsShipping, setBillingSameAsShipping] = useState(true);
  const [shippingAddress, setShippingAddress] = useState({
    country: "Pakistan",
    firstName: "",
    lastName: "",
    email: "",
    address: "",
    apartment: "",
    city: "",
    postalCode: "",
    phone: "",
  });
  const [billingAddress, setBillingAddress] = useState({
    firstName: "",
    lastName: "",
    email: "",
    address: "",
    apartment: "",
    city: "",
    postalCode: "",
    phone: "",
    country: "Pakistan",
  });
  const { permission, requestPermission } = useNotification();
  const { user } = useAuth();

  useEffect(() => {
    // Simulate loading state
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const shipping = cart.length > 0 && cart.reduce((acc, item) => acc + parseFloat(item.price.toString().replace(/,/g, "")), 0) > 1000 ? 3000 : 3000;
  const subtotal = cart.reduce((acc, item) => {
    const price = parseFloat(item.price.toString().replace(/,/g, "")) || 0;
    const quantity = item.quantity ?? 1;
    return acc + price * quantity;
  }, 0);
  const total = subtotal + shipping;

  // Validate form
  const validateForm = () => {
    let tempErrors = {};
    const requiredFields = ["firstName", "lastName", "email", "address", "phone"];
    
    // Validate shipping address
    requiredFields.forEach(field => {
      if (!shippingAddress[field]?.trim()) {
        tempErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required.`;
      }
    });

    // Validate email format
    if (shippingAddress.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shippingAddress.email)) {
      tempErrors.email = "Please enter a valid email address.";
    }

    // Validate phone format
    if (shippingAddress.phone && !/^\+?[\d\s-]{10,}$/.test(shippingAddress.phone)) {
      tempErrors.phone = "Please enter a valid phone number.";
    }

    // Validate billing address if different from shipping
    if (!billingSameAsShipping) {
      requiredFields.forEach(field => {
        if (!billingAddress[field]?.trim()) {
          tempErrors[`billing${field.charAt(0).toUpperCase() + field.slice(1)}`] = 
            `Billing ${field.charAt(0).toUpperCase() + field.slice(1)} is required.`;
        }
      });
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress(prev => ({ ...prev, [name]: value }));
    if (billingSameAsShipping) {
      setBillingAddress(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleBillingChange = (e) => {
    const { name, value } = e.target;
    setBillingAddress(prev => ({ ...prev, [name]: value }));
  };

  const handleClearCart = () => {
    dispatch({ type: "CLEAR_CART" });
  };

  const handleCompleteOrder = async () => {
    if (!validateForm()) {
      toast.error('Please fill in all required fields!');
      return;
    }

    try {
      setIsSubmitting(true);

      // Create order data object
      const orderData = {
        orderItems: cart.map(item => ({
          _id: item._id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          imageUrl: item.imageUrl || item.image
        })),
        shippingAddress: {
          ...shippingAddress,
          fullName: `${shippingAddress.firstName} ${shippingAddress.lastName}`
        },
        billingAddress: billingSameAsShipping 
          ? { ...shippingAddress, fullName: `${shippingAddress.firstName} ${shippingAddress.lastName}` }
          : { ...billingAddress, fullName: `${billingAddress.firstName} ${billingAddress.lastName}` },
        paymentMethod: "Cash On Delivery",
        totalPrice: total,
        tax: 0,
        shipping: shipping,
        subTotal: subtotal,
        customerType: user ? "registered" : "guest"
      };

      console.log("Submitting order data:", orderData);

      const token = localStorage.getItem("token");
      const headers = {
        ...(token && { "Authorization": `Bearer ${token}` })
      };

      const response = await api.post(endpoints.placeOrder, orderData, { headers });

      const data = response.data;
      if (data.success) {
        handleClearCart();
        
        // Request notification permission if not already granted
        if (permission !== 'granted') {
          await requestPermission();
        }

        // Redirect based on user type
        navigate(`/order-success/${data.order._id}`);

        toast.success('Order placed successfully!');
      } else {
        toast.error(data.message || 'Failed to place order');
      }
    } catch (error) {
      console.error('Order Error:', error);
      toast.error('Something went wrong while placing your order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <FaExclamationCircle className="text-red-500 text-4xl mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-10 mt-20">
      <div className="container mx-auto px-4">
        {/* Checkout Heading */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900">Secure Checkout</h1>
          <p className="text-gray-600 mt-2">
            Complete your order details below and enjoy seamless shopping
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {isLoading ? (
              <div className="space-y-6">
                <FormFieldSkeleton />
                <FormFieldSkeleton />
                <FormFieldSkeleton />
                <FormFieldSkeleton />
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
                {/* Contact Information */}
                <div>
                  <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
                  <FormField
                    label="Email"
                    name="email"
                    type="email"
                    value={shippingAddress.email}
                    onChange={handleShippingChange}
                    error={errors.email}
                    placeholder="Enter your email"
                  />
                </div>

                {/* Shipping Address */}
                <div>
                  <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      label="First Name"
                      name="firstName"
                      value={shippingAddress.firstName}
                      onChange={handleShippingChange}
                      error={errors.firstName}
                      placeholder="Enter first name"
                    />
                    <FormField
                      label="Last Name"
                      name="lastName"
                      value={shippingAddress.lastName}
                      onChange={handleShippingChange}
                      error={errors.lastName}
                      placeholder="Enter last name"
                    />
                  </div>
                  <FormField
                    label="Address"
                    name="address"
                    value={shippingAddress.address}
                    onChange={handleShippingChange}
                    error={errors.address}
                    placeholder="Enter your address"
                  />
                  <FormField
                    label="Apartment/Suite"
                    name="apartment"
                    value={shippingAddress.apartment}
                    onChange={handleShippingChange}
                    placeholder="Apartment, suite, etc. (optional)"
                    required={false}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      label="City"
                      name="city"
                      value={shippingAddress.city}
                      onChange={handleShippingChange}
                      placeholder="Enter city"
                    />
                    <FormField
                      label="Postal Code"
                      name="postalCode"
                      value={shippingAddress.postalCode}
                      onChange={handleShippingChange}
                      placeholder="Enter postal code"
                      required={false}
                    />
                  </div>
                  <FormField
                    label="Phone"
                    name="phone"
                    type="tel"
                    value={shippingAddress.phone}
                    onChange={handleShippingChange}
                    error={errors.phone}
                    placeholder="Enter phone number"
                  />
                </div>

                {/* Billing Address */}
                <div>
                  <div className="flex items-center mb-4">
                    <input
                      type="checkbox"
                      id="billingSameAsShipping"
                      checked={billingSameAsShipping}
                      onChange={(e) => setBillingSameAsShipping(e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="billingSameAsShipping" className="ml-2 text-sm text-gray-700">
                      Billing address same as shipping
                    </label>
                  </div>

                  {!billingSameAsShipping && (
                    <div className="space-y-4">
                      <h2 className="text-xl font-semibold">Billing Address</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          label="First Name"
                          name="firstName"
                          value={billingAddress.firstName}
                          onChange={handleBillingChange}
                          error={errors.billingFirstName}
                          placeholder="Enter first name"
                        />
                        <FormField
                          label="Last Name"
                          name="lastName"
                          value={billingAddress.lastName}
                          onChange={handleBillingChange}
                          error={errors.billingLastName}
                          placeholder="Enter last name"
                        />
                      </div>
                      <FormField
                        label="Address"
                        name="address"
                        value={billingAddress.address}
                        onChange={handleBillingChange}
                        error={errors.billingAddress}
                        placeholder="Enter your address"
                      />
                      <FormField
                        label="Apartment/Suite"
                        name="apartment"
                        value={billingAddress.apartment}
                        onChange={handleBillingChange}
                        placeholder="Apartment, suite, etc. (optional)"
                        required={false}
                      />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          label="City"
                          name="city"
                          value={billingAddress.city}
                          onChange={handleBillingChange}
                          error={errors.billingCity}
                          placeholder="Enter city"
                        />
                        <FormField
                          label="Postal Code"
                          name="postalCode"
                          value={billingAddress.postalCode}
                          onChange={handleBillingChange}
                          placeholder="Enter postal code"
                          required={false}
                        />
                      </div>
                      <FormField
                        label="Phone"
                        name="phone"
                        type="tel"
                        value={billingAddress.phone}
                        onChange={handleBillingChange}
                        error={errors.billingPhone}
                        placeholder="Enter phone number"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <OrderSummary
              cart={cart}
              subtotal={subtotal}
              shipping={shipping}
              total={total}
            />

            {/* Payment Section */}
            <div className="bg-white rounded-lg shadow-md p-6 mt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">Payment</h3>
                <FaLock className="text-gray-400" />
              </div>
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <FaCreditCard />
                  <span>Cash On Delivery</span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCompleteOrder}
                  disabled={isSubmitting || cart.length === 0}
                  className="w-full bg-green-500 text-white py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <FaCheckCircle />
                      Place Order
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add notification permission banner */}
      {permission !== 'granted' && (
        <div className="fixed bottom-0 left-0 right-0 bg-blue-50 p-4 border-t border-blue-100">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <p className="text-blue-700">Enable notifications to receive order updates</p>
            <button
              onClick={requestPermission}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              Enable Notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;
