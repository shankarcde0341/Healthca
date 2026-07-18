import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;
export const TOKEN_KEY = "healthca_token";

export const api = axios.create({
  baseURL: API,
  headers: { "Content-Type": "application/json" },
});

// Attach bearer token from localStorage on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function apiErrorMessage(err, fallback = "Something went wrong.") {
  const detail = err?.response?.data?.detail;
  if (detail == null) return err?.message || fallback;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return (
      detail
        .map((e) => (e && typeof e.msg === "string" ? e.msg : ""))
        .filter(Boolean)
        .join(" ") || fallback
    );
  }
  if (detail?.msg) return String(detail.msg);
  return fallback;
}
