import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ApiService from '../services/ApiService';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Initialize auth state from localStorage
    useEffect(() => {
        const initAuth = () => {
            const savedUser = localStorage.getItem('user');

            if (savedUser) {
                try {
                    setUser(JSON.parse(savedUser));
                } catch (error) {
                    console.error('Failed to parse saved user:', error);
                    localStorage.removeItem('user');
                }
            }
            setLoading(false);
        };

        initAuth();
    }, []);

    const login = async (username, password) => {
        try {
            const response = await ApiService.login(username, password);

            if (response.success) {
                // Save user to localStorage and state
                localStorage.setItem('user', JSON.stringify(response.user));
                setUser(response.user);

                return { success: true };
            } else {
                return {
                    success: false,
                    error: response.error
                };
            }
        } catch (error) {
            console.error('Login failed:', error);
            return {
                success: false,
                error: error.message || 'Login failed'
            };
        }
    };

    // Updated logout function that redirects to login
    const logout = () => {
        localStorage.removeItem('user');
        setUser(null);

        // Force redirect to login page
        window.location.href = '/login';
    };

    // Helper functions for user roles
    const isAdmin = () => user?.user_type === 'admin';
    const isMaintainer = () => user?.user_type === 'maintainer';
    const isUser = () => user?.user_type === 'user';
    const isAuthenticated = () => !!user;

    const value = {
        user,
        loading,
        login,
        logout,
        isAuthenticated,
        isAdmin: isAdmin(),
        isMaintainer: isMaintainer(),
        isUser: isUser(),
        // Functions
        checkRole: (role) => user?.user_type === role,
        hasPermission: (permission) => {
            if (!user) return false;

            switch (permission) {
                case 'admin':
                    return user.user_type === 'admin';
                case 'maintenance':
                    return user.user_type === 'admin' || user.user_type === 'maintainer';
                case 'view':
                    return true; // All authenticated users can view
                default:
                    return false;
            }
        }
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};