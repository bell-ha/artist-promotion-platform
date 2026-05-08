import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { isTokenExpired, clearSession } from "../lib/token";

export function useAuthGuard() {
  const navigate = useNavigate();

  useEffect(() => {
    const check = () => {
      const token = localStorage.getItem("token");
      if (!token || isTokenExpired(token)) {
        clearSession();
        navigate("/login", { replace: true });
      }
    };

    check();
    const id = setInterval(check, 60_000); // 1분마다 재확인
    return () => clearInterval(id);
  }, [navigate]);
}
