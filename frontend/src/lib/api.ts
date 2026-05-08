import axios from "axios";
import { clearSession } from "./token";

export const BACKEND_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:8000"
    : "https://port-0-artist-promotion-platform-backend-mn4pw77p26c83403.sel3.cloudtype.app";

export const FORGOT_API = {
  sendOtp: (email: string) =>
    `${BACKEND_URL}/auth/forgot-password/send-otp?email=${encodeURIComponent(email)}`,
  verifyOtp: () => `${BACKEND_URL}/auth/forgot-password/verify-otp`,
  resetPassword: () => `${BACKEND_URL}/auth/forgot-password/reset`,
};

// 401 응답 시 자동 로그아웃 (인증 API 제외)
axios.interceptors.response.use(
  (res) => res,
  (error) => {
    const isAuthEndpoint = (error.config?.url as string)?.includes("/auth/");
    if (
      error.response?.status === 401 &&
      !isAuthEndpoint &&
      localStorage.getItem("token")
    ) {
      clearSession();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
