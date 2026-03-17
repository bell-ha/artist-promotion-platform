import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import HeroSection from "../components/HeroSection";
import DiscoverSounds from "../components/DiscoverSounds";
import SpotlightAlbum from "../components/SpotlightAlbum";
import CTASection from "../components/CTASection";
import AuthModals from "../components/AuthModals";
import type { User, AuthMode } from "../types/auth";

export default function Main() {
  const [user, setUser] = useState<User | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("signin");

  const location = useLocation();
  const navigate = useNavigate();

  // 로그인 세션 복원
  useEffect(() => {
    const token = localStorage.getItem("token");
    const nickname = localStorage.getItem("nickname");
    if (token && nickname && !nickname.startsWith("User_")) {
      setUser({ nickname });
    }
  }, []);

  // /login 경로 접근 시 로그인 모달 자동 오픈
  useEffect(() => {
    if (location.pathname === "/login") {
      setAuthMode("signin");
      setAuthOpen(true);
      navigate("/", { replace: true });
    }
  }, [location.pathname, navigate]);

  return (
    <>
      <Header
        user={user}
        onSignUp={() => { setAuthMode("signup"); setAuthOpen(true); }}
        onLogIn={() => { setAuthMode("signin"); setAuthOpen(true); }}
        onLogOut={() => { localStorage.clear(); window.location.reload(); }}
      />

      {/* 헤더 높이 128px 만큼 여백 */}
      <main style={{ paddingTop: 128 }}>
        <HeroSection />
        <DiscoverSounds />
        <SpotlightAlbum />
        <CTASection />
      </main>

      <AuthModals
        isOpen={authOpen}
        mode={authMode}
        onClose={() => setAuthOpen(false)}
        onModeChange={setAuthMode}
        onLoginSuccess={(u) => {
          setUser(u);
          setAuthOpen(false);
        }}
      />
    </>
  );
}
