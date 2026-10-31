import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api",
});

const getLocalToken = () => localStorage.getItem("token");
const getLocalRefreshToken = () => localStorage.getItem("refreshToken");
const setLocalTokens = (accessToken, refreshToken) => {
  if (accessToken) localStorage.setItem("token", accessToken);
  if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
};
const clearLocalTokens = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
};

let isRefreshing = false;
const refreshSubscribers = [];

const processQueue = (error, token = null) => {
  refreshSubscribers.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  refreshSubscribers.length = 0;
};

api.interceptors.request.use((config) => {
  const token = getLocalToken();
  if (token && config.headers && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    if (
      status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      originalRequest.url !== "/refresh-token"
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshSubscribers.push({ resolve, reject });
        }).then((newToken) => {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;
      const refreshToken = getLocalRefreshToken();

      if (!refreshToken) {
        clearLocalTokens();
        isRefreshing = false;
        return Promise.reject(error);
      }

      try {
        const response = await api.post("/refresh-token", { refreshToken });
        const { token: newToken, refreshToken: newRefreshToken } = response.data;
        setLocalTokens(newToken, newRefreshToken);
        processQueue(null, newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearLocalTokens();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default api;