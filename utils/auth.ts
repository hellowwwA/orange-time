import axios from 'axios';

const API_BASE_URL = ''; // Use relative path to leverage Vite proxy

// Create axios instance with credentials support
const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // Important: allows cookies to be sent
    headers: {
        'Content-Type': 'application/json',
    },
});

export interface User {
    id: number;
    githubId: string;
    username: string;
    email: string | null;
    avatarUrl: string | null;
}

/**
 * Get GitHub authorization URL
 */
export const getGitHubAuthUrl = async (): Promise<string> => {
    try {
        const response = await api.get<{ authUrl: string }>('/api/auth/github');
        return response.data.authUrl;
    } catch (error) {
        console.error('Failed to get GitHub auth URL:', error);
        throw error;
    }
};

/**
 * Get current user information
 * Returns null if user is not authenticated
 */
export const getCurrentUser = async (): Promise<User | null> => {
    try {
        const response = await api.get<User>('/api/user/info');
        return response.data;
    } catch (error: any) {
        if (error.response?.status === 401) {
            return null; // User not authenticated
        }
        console.error('Failed to get current user:', error);
        throw error;
    }
};

/**
 * Logout current user
 */
export const logout = async (): Promise<void> => {
    try {
        await api.post('/api/auth/logout');
    } catch (error) {
        console.error('Failed to logout:', error);
        throw error;
    }
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = async (): Promise<boolean> => {
    const user = await getCurrentUser();
    return user !== null;
};
