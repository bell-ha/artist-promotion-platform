import { useNavigate } from "react-router-dom";
import { ASSETS } from "../lib/assets";
import type { User, CareerCategory } from "../types/auth";

const CATEGORIES: CareerCategory[] = [
  { label: "PERFORMER", items: ["보컬", "인디 싱어송라이터", "뮤지컬배우"] },
  { label: "INSTRUMENTALIST", items: ["기타리스트", "피아니스트", "드러머", "베이시스트", "오케스트라 연주자", "세션 연주자"] },
  { label: "CREATOR", items: ["대중음악 작곡가", "영화음악 작곡가", "게임음악 작곡가", "광고음악 작곡가", "비트메이커", "탑라이너"] },
  { label: "SOUND DESIGNER", items: ["사운드 디자이너", "폴리 아티스트", "인터랙티브 오디오 디자이너"] },
  { label: "AUDIO ENGINEER", items: ["레코딩 엔지니어", "믹싱/마스터링 엔지니어", "라이브 PA 엔지니어", "방송 음향 감독"] },
  { label: "AUDIO PROGRAMMER", items: ["프론트엔드 개발자", "백엔드 개발자"] },
  { label: "VISUAL ARTIST", items: ["미디어아트 작가", "미술 작가", "설치미술가", "공연 테크니컬 디렉터"] },
];

interface HeaderProps {
  user: User | null;
  onSignUp: () => void;
  onLogIn: () => void;
  onLogOut: () => void;
}

export default function Header({ user, onSignUp, onLogIn, onLogOut }: HeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black border-b border-white/10 h-[128px]">
      <div className="flex items-center px-[126px] justify-between h-full">
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


        {/* 우: 인증 버튼 */}
        <div className="flex gap-2 items-center pb-1 font-inter">
          {user ? (
            <>
              <span className="text-[13px] text-white/95">
                <strong>{user.nickname}</strong>님
              </span>
              <button
                className="border border-white/18 bg-white/6 text-white px-[10px] py-[8px] rounded-[6px] cursor-pointer font-extrabold text-[12px] hover:bg-white/12 transition-colors"
                type="button"
                onClick={() => navigate("/mypage")}
              >
                MyPage
              </button>
              <button
                className="border border-white/18 bg-white/6 text-white px-[10px] py-[8px] rounded-[6px] cursor-pointer font-extrabold text-[12px] hover:bg-white/12 transition-colors"
                type="button"
                onClick={onLogOut}
              >
                LogOut
              </button>
            </>
          ) : (
            <>
              <button
                className="border-none bg-transparent text-white px-[10px] py-[8px] cursor-pointer font-normal text-[15px] hover:opacity-70 transition-opacity"
                type="button"
                onClick={onSignUp}
              >
                Sign Up
              </button>
              <button
                className="border bg-white text-black px-[14px] py-[8px] rounded-[6px] bg-transparent cursor-pointer font-normal text-[14px] hover:bg-white/70 transition-colors"
                type="button"
                onClick={onLogIn}
              >
                Log In
              </button>
            </>
          )}
        </div>
      </div>

      {/* 중: 카테고리 네비 */}
      <nav className="absolute bottom-[22px] left-0 right-0 flex justify-center flex-wrap font-noto" aria-label="Career categories">
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
  );
}
