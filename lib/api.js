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
        body: body ? JSON.stringify(body) : null,
    };

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        const data = await response.json();

        return {
            success: response.ok,
            data,
            status: response.status
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
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