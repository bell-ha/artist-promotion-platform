import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ASSETS } from "../lib/assets";
import type { User, AuthMode, CareerCategory } from "../types/auth";
import AuthModals from "./AuthModals";

const CATEGORIES: CareerCategory[] = [
  { label: "PERFORMER", items: ["보컬", "인디 싱어송라이터", "뮤지컬배우"] },
  { label: "INSTRUMENTALIST", items: ["기타리스트", "피아니스트", "드러머", "베이시스트", "오케스트라 연주자", "세션 연주자"] },
  { label: "CREATOR", items: ["대중음악 작곡가", "영화음악 작곡가", "게임음악 작곡가", "광고음악 작곡가", "비트메이커", "탑라이너"] },
  { label: "SOUND DESIGNER", items: ["사운드 디자이너", "폴리 아티스트", "인터랙티브 오디오 디자이너"] },
  { label: "AUDIO ENGINEER", items: ["레코딩 엔지니어", "믹싱/마스터링 엔지니어", "라이브 PA 엔지니어", "방송 음향 감독"] },
  { label: "AUDIO PROGRAMMER", items: ["프론트엔드 개발자", "백엔드 개발자"] },
  { label: "VISUAL ARTIST", items: ["미디어아트 작가", "미술 작가", "설치미술가", "공연 테크니컬 디렉터"] },
];

export default function Header() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("signin");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [expandedCat, setExpandedCat] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const nickname = localStorage.getItem("nickname");
    if (token && nickname && !nickname.startsWith("User_")) {
      setUser({ nickname });
    }
  }, []);

  const closeDrawer = () => {
    setDrawerOpen(false);
    setExpandedCat(null);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-black border-b border-white/10 h-[128px]">
        <div className="flex items-center px-[126px] max-xl:px-4 justify-between h-full">
          {/* 좌: 로고 */}
          <div className="flex items-end pb-1">
            <img
              src={ASSETS.logo}
              alt="SEIHI"
              className="w-[110px] object-contain cursor-pointer"
              onClick={() => navigate("/")}
              onError={(e) => {
                const t = e.currentTarget;
                t.style.display = "none";
                const fallback = t.nextElementSibling as HTMLElement | null;
                if (fallback) fallback.style.display = "block";
              }}
            />
            <span
              className="font-black tracking-[.12em] text-[18px] text-white hidden cursor-pointer"
              onClick={() => navigate("/")}
            >
              SEIHI
            </span>
          </div>

          {/* 우: 인증 버튼 (데스크탑) + 햄버거 (모바일) */}
          <div className="flex gap-2 items-center pb-1 font-inter">
            {/* 인증 버튼 — 데스크탑만 */}
            <div className="flex gap-2 items-center max-xl:hidden">
              {user ? (
                <>
                  <span className="text-[13px] text-white/95">
                    <strong>{user.nickname}</strong>님
                  </span>
                  <div className="relative">
                    <button
                      className="border border-white/18 bg-white/6 text-white px-[10px] py-[8px] rounded-[6px] cursor-pointer font-extrabold text-[12px] hover:bg-white/12 transition-colors flex items-center gap-[6px]"
                      type="button"
                      onClick={() => setMenuOpen((v) => !v)}
                    >
                      더보기
                      <span className="text-[9px] text-white/50">{menuOpen ? "▲" : "▼"}</span>
                    </button>
                    {menuOpen && (
                      <>
                        <div className="fixed inset-0 z-[90]" onClick={() => setMenuOpen(false)} />
                        <div
                          className="absolute right-0 top-[calc(100%+8px)] min-w-[140px] rounded-[12px] border border-white/12 overflow-hidden z-[100]"
                          style={{
                            background: "rgba(10,10,10,0.96)",
                            boxShadow: "0 16px 36px rgba(0,0,0,0.6)",
                            backdropFilter: "blur(12px)",
                          }}
                        >
                          <button
                            className="w-full text-left border-none bg-transparent text-white px-[14px] py-[11px] cursor-pointer text-[12px] font-extrabold hover:bg-white/8 transition-colors border-b border-white/8"
                            type="button"
                            onClick={() => { navigate("/upgrade"); setMenuOpen(false); }}
                          >
                            ✦ Upgrade
                          </button>
                          <button
                            className="w-full text-left border-none bg-transparent text-white/85 px-[14px] py-[11px] cursor-pointer text-[12px] font-semibold hover:bg-white/8 hover:text-white transition-colors border-b border-white/8"
                            type="button"
                            onClick={() => { navigate("/mypage"); setMenuOpen(false); }}
                          >
                            MyPage
                          </button>
                          <button
                            className="w-full text-left border-none bg-transparent text-white/60 px-[14px] py-[11px] cursor-pointer text-[12px] font-semibold hover:bg-white/8 hover:text-white/85 transition-colors"
                            type="button"
                            onClick={() => { localStorage.clear(); window.location.reload(); }}
                          >
                            LogOut
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <button
                    className="border-none bg-transparent text-white px-[10px] py-[8px] cursor-pointer font-normal text-[15px] hover:opacity-70 transition-opacity"
                    type="button"
                    onClick={() => { setAuthMode("signup"); setAuthOpen(true); }}
                  >
                    Sign Up
                  </button>
                  <button
                    className="border bg-white text-black px-[14px] py-[8px] rounded-[6px] bg-transparent cursor-pointer font-normal text-[14px] hover:bg-white/70 transition-colors"
                    type="button"
                    onClick={() => { setAuthMode("signin"); setAuthOpen(true); }}
                  >
                    Log In
                  </button>
                </>
              )}
            </div>

            {/* 햄버거 버튼 — 모바일만 */}
            <button
              className="hidden max-xl:flex flex-col justify-center items-center gap-[5px] w-[36px] h-[36px] bg-transparent border-none cursor-pointer"
              type="button"
              aria-label="메뉴 열기"
              onClick={() => setDrawerOpen(true)}
            >
              <span className="block w-[22px] h-[2px] bg-white rounded-full" />
              <span className="block w-[22px] h-[2px] bg-white rounded-full" />
              <span className="block w-[22px] h-[2px] bg-white rounded-full" />
            </button>
          </div>
        </div>

        {/* 중: 카테고리 네비 — 데스크탑만 */}
        <nav className="absolute bottom-[22px] left-0 right-0 flex justify-center flex-wrap font-noto max-xl:hidden" aria-label="Career categories">
          {CATEGORIES.map((cat, i) => (
            <div key={cat.label} className="flex items-center">
              {i > 0 && <span className="text-white/30 text-[10px] font-light mx-[8px]">/</span>}
              <div className="relative group">
                <button
                  className="border-none bg-transparent text-[#D6D2D2] cursor-pointer text-[13px] font-normal font-noto leading-[184%] tracking-[0.91px] group-hover:text-white transition-colors"
                  type="button"
                >
                  {cat.label}
                </button>

                {/* 드롭다운 */}
                <div
                  className="absolute top-full left-1/2 -translate-x-1/2 min-w-[200px] p-[10px] rounded-[14px] border border-white/12 hidden group-hover:block z-[100]"
                  style={{
                    background: "rgba(0,0,0,.88)",
                    boxShadow: "0 18px 40px rgba(0,0,0,.55)",
                    backdropFilter: "blur(10px)",
                  }}
                  role="menu"
                >
                  {cat.items.map((item) => (
                    <button
                      key={item}
                      className="w-full text-left border-none bg-transparent text-white/88 px-[10px] py-[10px] rounded-[10px] cursor-pointer text-[13px] hover:bg-white/6 hover:text-white transition-colors"
                      type="button"
                      role="menuitem"
                      onClick={() => navigate(`/category/${encodeURIComponent(cat.label)}/${encodeURIComponent(item)}`)}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </nav>
      </header>

      {/* 모바일 드로어 */}
      {drawerOpen && (
        <div className="fixed inset-0 z-[200] flex xl:hidden">
          {/* 배경 오버레이 */}
          <div
            className="absolute inset-0 bg-black/60"
            style={{ backdropFilter: "blur(4px)" }}
            onClick={closeDrawer}
          />

          {/* 드로어 패널 */}
          <div
            className="relative ml-auto w-[80%] max-w-[320px] h-full overflow-y-auto"
            style={{ background: "rgba(10,10,10,0.98)", borderLeft: "1px solid rgba(255,255,255,0.1)" }}
          >
            {/* 드로어 상단 */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <span className="font-black tracking-[.12em] text-[16px] text-white">SEIHI</span>
              <button
                className="bg-transparent border-none cursor-pointer text-white/70 hover:text-white text-[22px] leading-none"
                type="button"
                aria-label="메뉴 닫기"
                onClick={closeDrawer}
              >
                ✕
              </button>
            </div>

            {/* 인증 영역 */}
            <div className="px-5 py-4 border-b border-white/10 flex gap-2">
              {user ? (
                <div className="flex flex-col gap-2 w-full">
                  <button
                    className="w-full border border-white/35 bg-white/10 text-white py-[9px] rounded-[6px] cursor-pointer font-extrabold text-[13px] hover:bg-white/20 transition-colors"
                    type="button"
                    onClick={() => { navigate("/upgrade"); closeDrawer(); }}
                  >
                    ✦ Upgrade Plan
                  </button>
                  <div className="flex gap-2">
                    <button
                      className="flex-1 border border-white/18 bg-white/6 text-white py-[9px] rounded-[6px] cursor-pointer font-extrabold text-[13px] hover:bg-white/12 transition-colors"
                      type="button"
                      onClick={() => { navigate("/mypage"); closeDrawer(); }}
                    >
                      MyPage
                    </button>
                    <button
                      className="flex-1 border border-white/18 bg-white/6 text-white py-[9px] rounded-[6px] cursor-pointer font-extrabold text-[13px] hover:bg-white/12 transition-colors"
                      type="button"
                      onClick={() => { localStorage.clear(); window.location.reload(); closeDrawer(); }}
                    >
                      LogOut
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <button
                    className="flex-1 border-none bg-transparent text-white py-[9px] cursor-pointer font-normal text-[14px] hover:opacity-70 transition-opacity"
                    type="button"
                    onClick={() => { setAuthMode("signup"); setAuthOpen(true); closeDrawer(); }}
                  >
                    Sign Up
                  </button>
                  <button
                    className="flex-1 border bg-white text-black py-[9px] rounded-[6px] cursor-pointer font-normal text-[14px] hover:bg-white/70 transition-colors"
                    type="button"
                    onClick={() => { setAuthMode("signin"); setAuthOpen(true); closeDrawer(); }}
                  >
                    Log In
                  </button>
                </>
              )}
            </div>

            {/* 카테고리 목록 */}
            <nav className="py-2" aria-label="Career categories">
              {CATEGORIES.map((cat) => (
                <div key={cat.label}>
                  <button
                    className="w-full text-left px-5 py-[14px] bg-transparent border-none text-[13px] font-bold font-noto tracking-[0.91px] text-[#D6D2D2] hover:text-white hover:bg-white/4 transition-colors flex items-center justify-between"
                    type="button"
                    onClick={() => setExpandedCat(expandedCat === cat.label ? null : cat.label)}
                  >
                    {cat.label}
                    <span className="text-white/40 text-[10px]">
                      {expandedCat === cat.label ? "▲" : "▼"}
                    </span>
                  </button>
                  {expandedCat === cat.label && (
                    <div className="bg-white/3 border-t border-white/6">
                      {cat.items.map((item) => (
                        <button
                          key={item}
                          className="w-full text-left px-8 py-[12px] bg-transparent border-none text-[13px] font-noto text-white/70 hover:text-white hover:bg-white/6 transition-colors cursor-pointer"
                          type="button"
                          onClick={() => {
                            navigate(`/category/${encodeURIComponent(cat.label)}/${encodeURIComponent(item)}`);
                            closeDrawer();
                          }}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </div>
        </div>
      )}

      <AuthModals
        isOpen={authOpen}
        mode={authMode}
        onClose={() => setAuthOpen(false)}
        onModeChange={setAuthMode}
        onLoginSuccess={(u) => { setUser(u); setAuthOpen(false); }}
      />
    </>
  );
}
