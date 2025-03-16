// lib/auth-context.js
'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import {authService, userService} from './api';
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
            const result = await userService.getCurrentUser(authToken);

            if (result.success) {
                setCurrentUser(result.data);
            } else {
                // Token might be invalid
                logout();
            }
        } catch (error) {
            console.error('Error fetching user profile:', error);
            logout();
        } finally {
            setLoading(false);
        }
    };

    // Login function
    const login = async (email, password) => {
        try {
            const result = await authService.login({ email, password });

            if (result.success && result.data.accessToken) {
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
                message: 'Network error occurred'
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
                message: 'Network error occurred'
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
        isAuthenticated: !!token,
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