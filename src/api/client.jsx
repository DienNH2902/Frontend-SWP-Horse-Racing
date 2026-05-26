import axios from "axios";
import { attachInterceptors } from "./interceptor";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error("Missing VITE_API_BASE_URL. Please set it in your .env file.");
}

export const apiClient = attachInterceptors(axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
}));
