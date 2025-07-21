import axios from 'axios';
import { authService } from './auth';

const apiClient = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any = null, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000; // Initial delay of 1 second

// Request interceptor for adding auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = authService.getToken();
    console.log('Request Interceptor: Current Token', token);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling errors and token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    originalRequest._retryCount = originalRequest._retryCount || 0;

    // Check for network errors (e.g., no internet, connection refused) or 5xx server errors
    if (
      (error.code === 'ECONNABORTED' || error.message === 'Network Error' || (error.response && error.response.status >= 500)) &&
      originalRequest._retryCount < MAX_RETRIES
    ) {
      originalRequest._retryCount++;
      const delay = RETRY_DELAY_MS * Math.pow(2, originalRequest._retryCount - 1); // Exponential backoff
      console.log(`Retrying request ${originalRequest.url} (Attempt ${originalRequest._retryCount}/${MAX_RETRIES}) after ${delay}ms`);

      return new Promise((resolve) => {
        setTimeout(() => resolve(apiClient(originalRequest)), delay);
      });
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { access_token } = await authService.refreshToken();
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        processQueue(null, access_token);
        return apiClient(originalRequest);
      } catch (refreshError) {
        console.error("Token refresh failed in interceptor:", refreshError);
        processQueue(refreshError, null);
        authService.logout(); // Explicitly log out the user
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient; 