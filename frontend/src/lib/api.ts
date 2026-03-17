export const BACKEND_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:8000"
    : "https://port-0-artist-promotion-platform-backend-mk9v7xrma0e5b23b.sel3.cloudtype.app";

export const FORGOT_API = {
  sendOtp: (email: string) =>
    `${BACKEND_URL}/auth/forgot-password/send-otp?email=${encodeURIComponent(email)}`,
  verifyOtp: () => `${BACKEND_URL}/auth/forgot-password/verify-otp`,
  resetPassword: () => `${BACKEND_URL}/auth/forgot-password/reset`,
};
