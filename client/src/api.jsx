import axios from "axios";

// Use environment variables for configuration
const API_URL = import.meta.env.VITE_API_URL || "http://46.202.166.65";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  timeout: 30000 // 30 second timeout
});

// Flag to prevent multiple refresh token requests
let isRefreshing = false;
// Store pending requests that should be retried after token refresh
let failedQueue = [];

// Process the queue of failed requests
const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

// Add request interceptor
api.interceptors.request.use(
  (config) => {
    // Ensure we're not sending requests while the page is unloading
    if (window.isUnloading) {
      return Promise.reject(new Error('Page is unloading'));
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Track page unloading to prevent requests during navigation
window.addEventListener('beforeunload', () => {
  window.isUnloading = true;
});

// Add response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    // Don't retry if the page is unloading or if the request was manually cancelled
    if (window.isUnloading || axios.isCancel(error)) {
      return Promise.reject(error);
    }
    
    const originalRequest = error.config;
    
    // Prevent infinite retry loops
    if (originalRequest._retry) {
      return Promise.reject(error);
    }
    
    // Handle common error responses globally
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error("Response error:", error.response.status, error.response.data);
      
      // Handle authentication errors
      if (error.response.status === 401) {
        // Check if it's a token expiration error
        if (error.response.data.code === "TOKEN_EXPIRED" && !originalRequest._retry) {
          if (isRefreshing) {
            // If token refresh is already in progress, add this request to the queue
            return new Promise((resolve, reject) => {
              failedQueue.push({ resolve, reject });
            })
              .then(token => {
                return api(originalRequest);
              })
              .catch(err => {
                return Promise.reject(err);
              });
          }

          originalRequest._retry = true;
          isRefreshing = true;

          try {
            // Call the refresh token endpoint
            const response = await api.post(endpoints.refreshToken);
            
            if (response.data.success) {
              // Process all the requests in the queue with the new token
              processQueue(null, response.data.token);
              
              // Return the original request with the new token
              return api(originalRequest);
            }
          } catch (refreshError) {
            // If refresh token fails, process the queue with error
            processQueue(refreshError, null);
            
            // Don't automatically redirect to prevent potential loops
            console.log("Token refresh failed");
            
            return Promise.reject(refreshError);
          } finally {
            isRefreshing = false;
          }
        } else if (error.response.data.code === "ALL_TOKENS_EXPIRED") {
          // If all tokens are expired, we need to clear the auth state
          // This should be handled by components, not automatically redirected
          console.log("All tokens expired - authentication required");
        } else {
          console.log("Unauthorized request");
          // Don't automatically redirect to prevent potential loops
          // A failed request will be handled by the components using the API
        }
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error("Request error:", error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error("Error:", error.message);
    }
    
    return Promise.reject(error);
  }
);

// API endpoints
const endpoints = {
  // Auth
  login: "/users/login",
  signup: "/users/signup",
  logout: "/users/logout",
  refreshToken: "/users/refresh-token",
  me: "/users/me",
  
  // Products
  getProducts: "/products",
  getProductById: (id) => `/products/${id}`,
  searchProducts: (query) => `/products/search?query=${query}`,
  getProductsByCategory: (id) => `/products/category/${id}`,
  getProductsBySubcategory: (id) => `/products/subcategory/${id}`,
  
  // Categories & Subcategories
  getCategories: "/categories",
  getSubcategories: (categoryId) => `/subcategories/category/${categoryId}`,
  
  // Orders
  placeOrder: "/orders/place-order",
  getOrders: "/orders",
  getOrder: (id) => `/orders/order/${id}`,
  getOrderTracking: (id) => `/orders/order/${id}`,
  
  // Admin
  adminLogin: "/admin/login",
  adminLogout: "/admin/logout",
  adminRegister: "/admin/register",
  adminDashboard: "/admin/dashboard",
  adminUsers: "/admin/users",
  
  // Others
  notifications: "/api/notifications",
  reviews: "/api/reviews",
  wishlist: "/wishlist"
};

export { api, endpoints };
export default api;
