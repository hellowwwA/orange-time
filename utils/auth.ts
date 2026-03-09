import axios from 'axios';

const API_BASE_URL = ''; // Use relative path to leverage Vite proxy
const GUEST_MODE_KEY = 'guestMode';

// Create axios instance with credentials support
const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // Important: allows cookies to be sent
    headers: {
        'Content-Type': 'application/json',
    },
});

// Refresh token logic
let isRefreshing = false;
let failedQueue: Array<{ resolve: (value?: unknown) => void; reject: (reason?: any) => void }> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            originalRequest.url !== '/api/auth/refresh' &&
            originalRequest.url !== '/api/auth/logout'
        ) {
            // If in guest mode, do not trigger refresh or logout on 401
            if (isGuestMode()) {
                return Promise.reject(error);
            }

            if (isRefreshing) {
                return new Promise(function (resolve, reject) {
                    failedQueue.push({ resolve, reject });
                })
                    .then(() => {
                        return api(originalRequest);
                    })
                    .catch((err) => {
                        return Promise.reject(err);
                    });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                await axios.post('/api/auth/refresh', {}, {
                    withCredentials: true,
                    baseURL: window.location.origin
                });
                processQueue(null);
                return api(originalRequest);
            } catch (err) {
                processQueue(err as Error, null);
                // The refresh token is expired or invalid
                console.log('Refresh token expired or invalid. Redirecting to login.');
                disableGuestMode();
                document.cookie = "JSESSIONID=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                window.location.href = '/login';
                return Promise.reject(err);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export interface User {
    id: number;
    githubId: string;
    username: string;
    email: string | null;
    avatarUrl: string | null;
}

/**
 * Enable guest mode in local storage
 */
export const enableGuestMode = (): void => {
    try {
        localStorage.setItem(GUEST_MODE_KEY, 'true');
    } catch (error) {
        console.error('Failed to enable guest mode:', error);
    }
};

/**
 * Disable guest mode in local storage
 */
export const disableGuestMode = (): void => {
    try {
        localStorage.removeItem(GUEST_MODE_KEY);
    } catch (error) {
        console.error('Failed to disable guest mode:', error);
    }
};

/**
 * Read guest mode state
 */
export const isGuestMode = (): boolean => {
    try {
        return localStorage.getItem(GUEST_MODE_KEY) === 'true';
    } catch (error) {
        console.error('Failed to read guest mode:', error);
        return false;
    }
};

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
