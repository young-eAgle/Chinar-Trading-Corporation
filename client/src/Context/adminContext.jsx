import { createContext, useState, useEffect, useContext } from 'react';
import { toast } from 'react-hot-toast';
import { api, endpoints } from "../api";

const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
    const [admin, setAdmin] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if admin is logged in
        const adminInfo = localStorage.getItem('adminInfo');
        if (adminInfo) {
            setAdmin(JSON.parse(adminInfo));
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            setLoading(true);
            
            const response = await api.post(endpoints.adminLogin, { email, password });
            const data = response.data;
            
            // Save admin info to localStorage
            localStorage.setItem('adminInfo', JSON.stringify(data));
            setAdmin(data);
            toast.success('Login successful');
            return true;
        } catch (error) {
            console.error('Login error:', error);
            const errorMessage = error.response?.data?.message || 'Invalid credentials';
            toast.error(errorMessage);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            setLoading(true);
            
            await api.post(endpoints.adminLogout, {}, {
                headers: {
                    'Authorization': `Bearer ${admin?.token}`
                }
            });
            
            // Clear admin info from localStorage
            localStorage.removeItem('adminInfo');
            setAdmin(null);
            toast.success('Logged out successfully');
        } catch (error) {
            console.error('Logout error:', error);
            toast.error('An error occurred during logout');
        } finally {
            setLoading(false);
        }
    };

    const hasPermission = (permission) => {
        if (!admin) return false;
        
        // Super admin has all permissions
        if (admin.role === 'admin' && admin.isAdmin) return true;
        
        // Check if admin has the specific permission
        return admin.permissions && admin.permissions.includes(permission);
    };

    return (
        <AdminContext.Provider
            value={{
                admin,
                loading,
                login,
                logout,
                hasPermission
            }}
        >
            {children}
        </AdminContext.Provider>
    );
};

export const useAdmin = () => {
    const context = useContext(AdminContext);
    if (!context) {
        throw new Error('useAdmin must be used within an AdminProvider');
    }
    return context;
};

export default AdminContext; 