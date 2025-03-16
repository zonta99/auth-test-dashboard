// lib/api.js
const API_BASE_URL = 'http://localhost:8080';

// Helper function for API calls
export async function apiCall(endpoint, method = 'GET', body = null, token = null) {
    const headers = {
        'Content-Type': 'application/json',
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        method,
        headers,
        credentials: 'include', // Include cookies in requests
        body: body ? JSON.stringify(body) : null,
    };

    try {
        console.log(`Making API call to ${endpoint}`, { method, hasToken: !!token });

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
    login: (credentials) => apiCall('/auth/login', 'POST', credentials),
    signup: (userData) => apiCall('/auth/signup', 'POST', userData),
};

// User related API calls
export const userService = {
    getCurrentUser: (token) => apiCall('/users/me', 'GET', null, token),
    updateProfile: (token, profileData) => apiCall('/users/me/profile', 'PUT', profileData, token),
};

// Admin related API calls
export const adminService = {
    getAllUsers: (token) => apiCall('/admin/users', 'GET', null, token),
    updateUserRoles: (token, userId, roles) => apiCall(`/admin/users/${userId}/roles`, 'PUT', roles, token),
    deleteUser: (token, userId) => apiCall(`/admin/users/${userId}`, 'DELETE', null, token),
    getUserById: (token, userId) => apiCall(`/users/${userId}`, 'GET', null, token),
};