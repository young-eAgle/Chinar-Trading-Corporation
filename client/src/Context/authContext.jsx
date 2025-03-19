import { createContext, useContext, useState, useEffect } from "react";
import { api, endpoints } from "../api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState("guest");
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const login = async (credentials) => {
    try {
      const response = await api.post(endpoints.login, credentials);
      
      if (response.data.success) {
        // Token is automatically stored in cookies by the backend
        // We can still store it in localStorage for backup
        if (response.data.token) {
          localStorage.setItem("token", response.data.token);
        }
        
        await fetchUserData();
        return response.data;
      } else {
        throw new Error(response.data.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await api.post(endpoints.logout);
      localStorage.removeItem("token");
      setUser(null);
      setRole("guest");
    } catch (error) {
      console.error("Logout error:", error);
      // Even if the server logout fails, clear local state
      localStorage.removeItem("token");
      setUser(null);
      setRole("guest");
      throw error;
    }
  };

  const refreshToken = async () => {
    try {
      setIsRefreshing(true);
      const response = await api.post(endpoints.refreshToken);
      
      if (response.data.success && response.data.token) {
        localStorage.setItem("token", response.data.token);
        await fetchUserData();
        return response.data;
      } else {
        throw new Error(response.data.message || "Token refresh failed");
      }
    } catch (error) {
      console.error("Token refresh error:", error);
      // If refresh fails, user needs to login again
      setUser(null);
      setRole("guest");
      throw error;
    } finally {
      setIsRefreshing(false);
    }
  };

  const fetchUserData = async () => {
    // If already refreshing, don't try to fetch user data
    if (isRefreshing) {
      return;
    }
    
    try {
      const response = await api.get(endpoints.me);
      const data = response.data;
      
      if (data.success && data.user) {
        setUser(data.user);
        setRole(data.user.role || "user");
      } else {
        setUser(null);
        setRole("guest");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      
      // If the error is due to token expiration, try to refresh the token
      // Only attempt token refresh if not already refreshing
      if (!isRefreshing && error.response && error.response.status === 401 && 
          error.response.data.code === "TOKEN_EXPIRED") {
        try {
          await refreshToken();
          // If refresh is successful, fetchUserData will be called again
          return;
        } catch (refreshError) {
          // If refresh fails, clear user state
          setUser(null);
          setRole("guest");
        }
      } else {
        // For other errors, clear user state
        setUser(null);
        setRole("guest");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initialize a flag to track if the component is mounted
    let isMounted = true;
    
    const initAuth = async () => {
      try {
        setLoading(true);
        await fetchUserData();
      } catch (error) {
        console.error("Auth initialization error:", error);
        // If there's an error during initialization, just set user to null
        setUser(null);
        setRole("guest");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    initAuth();
    
    // Clean up function
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <AuthContext.Provider value={{ 
      user, 
      role, 
      loading,
      isRefreshing,
      login,
      logout,
      refreshToken,
      fetchUserData 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);


// export const useAuth = () => {
//   const { user } = useContext(AuthContext);
//   return {
//       ...user,
//       isAdmin: user?.isAdmin || false,
//   };
// };
