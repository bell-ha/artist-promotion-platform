import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import HeroSection from "../components/HeroSection";
import DiscoverSounds from "../components/DiscoverSounds";
import SpotlightAlbum from "../components/SpotlightAlbum";
import CTASection from "../components/CTASection";
import AuthModals from "../components/AuthModals";
import type { User, AuthMode } from "../types/auth";
import { isTokenExpired, clearSession } from "../lib/token";

export default function Main() {
  const location = useLocation();
  const navigate = useNavigate();

  // 로그인 세션 복원 (만료된 토큰은 자동 정리)
  useEffect(() => {
    const token = localStorage.getItem("token");
    const nickname = localStorage.getItem("nickname");
    if (token && nickname && !nickname.startsWith("User_")) {
      if (isTokenExpired(token)) {
        clearSession();
      } else {
        setUser({ nickname });
      }
    }
  }, []);

  // /login 경로 접근 시 로그인 모달 자동 오픈
  useEffect(() => {
    if (location.pathname === "/login") {
      navigate("/", { replace: true });
    }
  }, [location.pathname, navigate]);

  return (
    <>
      <Header />

      {/* 헤더 높이 128px(데스크탑) / 60px(모바일) 만큼 여백 */}
      <main className="pt-[128px] max-md:pt-[60px]">
        <HeroSection />
        <DiscoverSounds />
        <SpotlightAlbum />
        <CTASection />
      </main>
    </>
  );
}
