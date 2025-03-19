import { api } from "../api";

// Fetch orders for a registered user
export const fetchUserOrders = async (userId, token) => {
  try {
    console.log("Fetching orders for user:", userId);
    
    // Make sure we have authorization
    if (!token) {
      throw new Error("Authentication token is required");
    }
    
    const response = await api.get("/orders/user", {
      headers: { 
        Authorization: `Bearer ${token}`
      }
    });
    
    console.log(`Received ${response.data.length} orders for user`);
    return response.data;
  } catch (error) {
    console.error("Error fetching user orders:", error.response?.data || error.message);
    throw error;
  }
};

// Fetch orders for a guest user
export const fetchGuestOrders = async (email) => {
  try {
    console.log("Fetching guest orders for email:", email);
    
    if (!email) {
      throw new Error("Email is required to fetch guest orders");
    }
    
    const response = await api.get("/orders/guest", {
      params: { email } // This will be converted to a query string parameter
    });
    
    console.log(`Received ${response.data.length} orders for guest email`);
    return response.data;
  } catch (error) {
    console.error("Error fetching guest orders:", error.response?.data || error.message);
    throw error;
  }
};

// Fetch orders from the last 24 hours
export const fetchPendingOrders = async (admin) => {
  try {
      const response = await api.get("/orders/admin/pending-orders", {
        headers: { 
          Authorization: `Bearer ${admin?.token}` 
        }
      });
      return response.data;
  } catch (error) {
      console.error("Error fetching pending orders:", error);
      throw error;
  }
};

// Fetch a single order by ID
export const fetchOrderById = async (orderId, token) => {
  try {
    const response = await api.get(`/orders/${orderId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching order details:", error.response?.data || error.message);
    throw error;
  }
};

// Fetch all orders (Admin)
export const fetchAllOrders = async (admin) => {
  try {
      const response = await api.get("/orders/admin/all-orders", {
        headers: { 
          Authorization: `Bearer ${admin?.token}` 
        }
      });
      return response.data;
  } catch (error) {
      console.error("Error fetching all orders:", error);
      throw error;
  }
};

// Update order status
export const updateOrderStatus = async (orderId, status, token) => {
  try {
      const response = await api.put(
          `/orders/${orderId}/status`,
          { status },
          {
              headers: { Authorization: `Bearer ${token}` }
          }
      );
      return response.data;
  } catch (error) {
      console.error("Error updating order status:", error);
      throw error;
  }
};

export const downloadInvoice = async (orderId, token) => {
    try {
        const response = await api.get(`/orders/${orderId}/invoice`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            responseType: 'blob'
        });

        // Get the blob from the response
        const blob = response.data;
        
        // Create a URL for the blob
        const url = window.URL.createObjectURL(blob);
        
        // Create a temporary link element
        const link = document.createElement('a');
        link.href = url;
        link.download = `invoice-${orderId}.pdf`; // Set the filename
        
        // Append to body, click, and remove
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up the URL
        window.URL.revokeObjectURL(url);

        return true;
    } catch (error) {
        console.error('Error downloading invoice:', error);
        throw error;
    }
};
