import axios from "axios";
import { attachInterceptors } from "./interceptor";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const apiClient = attachInterceptors(axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
}));
console.log(
  "ENV =",
  import.meta.env.VITE_API_BASE_URL
);