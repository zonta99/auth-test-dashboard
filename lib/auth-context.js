// lib/auth-context.js
'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { authService, userService } from './api';
import { useRouter } from 'next/navigation';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Check if token exists in localStorage
        const storedToken = localStorage.getItem('authToken');
        if (storedToken) {
            fetchUserProfile();
        } else {
            setLoading(false);
        }
    }, []);

    // Function to fetch user profile
    const fetchUserProfile = async () => {
        try {
            console.log('Fetching user profile');

            const result = await userService.getCurrentUser();
            console.log('User profile fetch result:', { success: result.success });

            if (result.success && result.data) {
                setCurrentUser(result.data);
                setLoading(false);
                return { success: true, data: result.data };
            } else {
                // Token might be invalid
                console.log('Invalid token or fetch failed, logging out');
                // Don't call logout() directly from here to avoid redirect loops
                setCurrentUser(null);
                localStorage.removeItem('authToken');
                setLoading(false);
                return { success: false, message: 'Failed to fetch user profile' };
            }
        } catch (error) {
            console.error('Error fetching user profile:', error);
            // Don't call logout() directly from here to avoid redirect loops
            setCurrentUser(null);
            localStorage.removeItem('authToken');
            setLoading(false);
            return { success: false, message: error.message || 'Error fetching user profile' };
        }
    };

    // Login function
    const login = async (email, password) => {
        try {
            const result = await authService.login({ email, password });

            if (result.success && result.data?.accessToken) {
                const accessToken = result.data.accessToken;
                localStorage.setItem('authToken', accessToken);
                await fetchUserProfile();
                return { success: true };
            } else {
                return {
                    success: false,
                    message: result.data?.message || 'Login failed'
                };
            }
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Network error occurred'
            };
        }
    };

    // Signup function
    const signup = async (name, email, password) => {
        try {
            const result = await authService.signup({ name, email, password });

            return {
                success: result.success,
                message: result.data?.message || 'Signup failed'
            };
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Network error occurred'
            };
        }
    };

    // Logout function
    const logout = () => {
        authService.logout(); // This now handles token removal internally
        setCurrentUser(null);
        router.push('/login');
    };

    const value = {
        currentUser,
        login,
        signup,
        logout,
        fetchUserProfile,
        isAuthenticated: !!currentUser,
        isAdmin: currentUser?.roles?.includes('ROLE_ADMIN')
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}