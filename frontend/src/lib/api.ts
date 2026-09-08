import axios from "axios";
import { clearSession } from "./token";

// 접속 주소는 환경변수로 정한다.
// 기존에는 hostname이 localhost면 무조건 :8000을 보게 하드코딩돼 있어서,
// 백엔드를 다른 포트로 띄우면 .env를 고쳐도 반영되지 않았다.
// (실제로 그 포트에 다른 프로젝트가 떠 있어 엉뚱한 서버를 보고 있었다.)
export const BACKEND_URL =
  import.meta.env.VITE_API_URL ??
  (window.location.hostname === "localhost"
    ? "http://localhost:8000"
    : "https://port-0-artist-promotion-platform-backend-mn4pw77p26c83403.sel3.cloudtype.app");

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
