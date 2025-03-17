// lib/api.js
const API_BASE_URL = 'http://localhost:8080';

// Get the token from local storage
const getAuthToken = () => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('authToken');
    }
    return null;
};

// Helper function for API calls
export async function apiCall(endpoint, method = 'GET', body = null, useAuth = true) {
    const headers = {
        'Content-Type': 'application/json',
    };

    // Automatically use token from localStorage if useAuth is true
    if (useAuth) {
        const token = getAuthToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
    }

    const config = {
        method,
        headers,
        credentials: 'include', // Include cookies in requests
        body: body ? JSON.stringify(body) : null,
    };

    try {
        console.log(`Making API call to ${endpoint}`, { method, useAuth });

        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        console.log(`API response from ${endpoint}:`, { status: response.status });

        // Check if there's content to parse
        const contentType = response.headers.get("content-type");
        let data = null;

        if (contentType && contentType.includes("application/json")) {
            data = await response.json();
        } else if (response.status !== 204) { // No Content
            // For non-JSON responses that aren't 204 No Content
            const text = await response.text();
            if (text) {
                try {
                    // Try to parse as JSON anyway in case Content-Type is wrong
                    data = JSON.parse(text);
                } catch {
                    // If it's not JSON, just store the raw text
                    data = { message: text };
                }
            }
        }

        return {
            success: response.ok,
            data,
            status: response.status
        };
    } catch (error) {
        console.error(`API error for ${endpoint}:`, error);
        return {
            success: false,
            error: error.message,
            status: 0 // Network error or other client-side error
        };
    }
}

// Authentication related API calls
export const authService = {
    // Standard authentication methods - don't use auth headers
    login: (credentials) => apiCall('/auth/login', 'POST', credentials, false),
    signup: (userData) => apiCall('/auth/signup', 'POST', userData, false),

    // Password management
    setPassword: (passwordData) =>
        apiCall('/auth/set-password', 'POST', passwordData), // useAuth defaults to true

    // Account linking methods
    linkAccount: (provider, providerData) =>
        apiCall(`/auth/link/${provider}`, 'POST', providerData),

    unlinkAccount: (provider) =>
        apiCall(`/auth/unlink/${provider}`, 'POST', null),

    getLinkedAccounts: () =>
        apiCall('/users/me/linked-accounts', 'GET'),

    // OAuth initiation methods
    initiateOAuth: (provider) => {
        // The redirect URI to return to after authentication
        const redirectUri = encodeURIComponent(`${window.location.origin}/oauth-callback`);

        // Append a timestamp to prevent caching issues
        const timestamp = new Date().getTime();

        // Create the auth URL
        const authUrl = `${API_BASE_URL}/oauth2/authorize/${provider}?redirect_uri=${redirectUri}&t=${timestamp}`;

        console.log(`Initiating OAuth flow for provider: ${provider}`);

        return authUrl;
    },

    // OAuth initiation specifically for account linking
    initiateOAuthLink: (provider) => {
        // The redirect URI to return to after authentication for account linking
        const redirectUri = encodeURIComponent(`${window.location.origin}/link-callback`);

        // Append link=true to indicate this is for account linking
        const timestamp = new Date().getTime();

        // Create the auth URL with link=true parameter
        const authUrl = `${API_BASE_URL}/oauth2/authorize/${provider}?redirect_uri=${redirectUri}&link=true&t=${timestamp}`;

        console.log(`Initiating OAuth link flow for provider: ${provider}`);

        return authUrl;
    },

    // Verify token validity
    verifyToken: () =>
        apiCall('/auth/verify-token', 'GET'),

    // Refresh token
    refreshToken: (refreshToken) =>
        apiCall('/auth/refresh-token', 'POST', { refreshToken }, false), // Don't use auth header

    // Logout - clear tokens
    logout: () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('authToken');
        }
        return { success: true };
    }
};

// User related API calls
export const userService = {
    getCurrentUser: () => apiCall('/users/me', 'GET'),
    updateProfile: (profileData) => apiCall('/users/me/profile', 'PUT', profileData),
};

// Admin related API calls
export const adminService = {
    getAllUsers: () => apiCall('/admin/users', 'GET'),
    updateUserRoles: (userId, roles) => apiCall(`/admin/users/${userId}/roles`, 'PUT', roles),
    deleteUser: (userId) => apiCall(`/admin/users/${userId}`, 'DELETE'),
    getUserById: (userId) => apiCall(`/users/${userId}`, 'GET'),
};