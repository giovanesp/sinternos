import axios from "axios";
import { useAuthStore } from "./auth";

let baseUrl = import.meta.env.APP_URL || "http://localhost:3000";

if (baseUrl.endsWith("/")) {
    baseUrl = baseUrl.slice(0, -1);
}

if (!baseUrl.endsWith("/api")) {
    baseUrl += "/api";
}

const api = axios.create({
    baseURL: baseUrl,
});

api.interceptors.request.use((config) => {
    const token = useAuthStore.getState().token;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err.response?.status === 401) {
            useAuthStore.getState().logout();
        }
        return Promise.reject(err);
    },
);

export default api;