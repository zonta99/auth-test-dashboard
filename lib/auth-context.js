// lib/auth-context.js
'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { authService, userService } from './api';
import { useRouter } from 'next/navigation';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Check if token exists in localStorage
        const storedToken = localStorage.getItem('authToken');
        if (storedToken) {
            setToken(storedToken);
            fetchUserProfile(storedToken);
        } else {
            setLoading(false);
        }
    }, []);

    // Function to fetch user profile
    const fetchUserProfile = async (authToken) => {
        try {
            console.log('Fetching user profile with token', { hasToken: !!authToken });

            const result = await userService.getCurrentUser(authToken);
            console.log('User profile fetch result:', { success: result.success });

            if (result.success && result.data) {
                setCurrentUser(result.data);
                setToken(authToken); // Ensure token is set in state
                setLoading(false);
                return { success: true, data: result.data };
            } else {
                // Token might be invalid
                console.log('Invalid token or fetch failed, logging out');
                // Don't call logout() directly from here to avoid redirect loops
                setCurrentUser(null);
                setToken(null);
                localStorage.removeItem('authToken');
                setLoading(false);
                return { success: false, message: 'Failed to fetch user profile' };
            }
        } catch (error) {
            console.error('Error fetching user profile:', error);
            // Don't call logout() directly from here to avoid redirect loops
            setCurrentUser(null);
            setToken(null);
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
                setToken(accessToken);
                localStorage.setItem('authToken', accessToken);
                await fetchUserProfile(accessToken);
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
        setCurrentUser(null);
        setToken(null);
        localStorage.removeItem('authToken');
        router.push('/login');
    };

    const value = {
        currentUser,
        token,
        login,
        signup,
        logout,
        isAuthenticated: !!token && !!currentUser,
        isAdmin: currentUser?.roles?.includes('ROLE_ADMIN'),
        fetchUserProfile
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