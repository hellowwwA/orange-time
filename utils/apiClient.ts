/**
 * A wrapper around the native `fetch` API to handle automatic token refreshing.
 * Intercepts 401 Unauthorized responses, calls the /api/auth/refresh endpoint,
 * and retries the original request if successful.
 */

interface RequestOptions extends RequestInit {
  // Custom options can go here if needed in the future
}

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: Response | PromiseLike<Response>) => void;
  reject: (reason?: any) => void;
  request: () => Promise<Response>;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(prom.request());
    }
  });
  failedQueue = [];
};

export const apiClient = async (
  url: string | Request | URL,
  options: RequestOptions = {}
): Promise<Response> => {
  // Execute the initial request
  let response = await fetch(url, options);

  // If unauthorized (401), we might need to refresh the token
  if (response.status === 401 && url !== '/api/auth/refresh' && url !== '/api/auth/github/callback') {
    if (isRefreshing) {
      // If already refreshing, queue the request and return a promise
      return new Promise<Response>((resolve, reject) => {
        failedQueue.push({
          resolve,
          reject,
          request: () => fetch(url, options),
        });
      });
    }

    isRefreshing = true;

    try {
      // Attempt to refresh the token. 
      // The refresh endpoint knows how to read the HTTP-only refresh_token cookie
      // and will set the new access_token cookie automatically.
      const refreshResponse = await fetch('/api/auth/refresh', {
        method: 'POST',
      });

      if (refreshResponse.ok) {
        // Refresh was successful. The browser has updated the access_token.
        isRefreshing = false;
        processQueue(null);
        // Retry the original request
        response = await fetch(url, options);
      } else {
        // Refresh failed (e.g., refresh token expired or is invalid)
        isRefreshing = false;
        processQueue(new Error('Token refresh failed'));
        // We could manually trigger a logout or redirect if needed, 
        // but typically passing the 401 back to the caller lets the UI handle it.
      }
    } catch (err) {
      isRefreshing = false;
      processQueue(err instanceof Error ? err : new Error('Token refresh error'));
    }
  }

  return response;
};
