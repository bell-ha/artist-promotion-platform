import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import CTASection from "../components/CTASection";
import { ASSETS } from "../lib/assets";
import type { User } from "../types/auth";

const MOCK_IMAGES = [
  ASSETS.discoverCard1,
  ASSETS.discoverCard2,
  ASSETS.discoverCard3,
  ASSETS.discoverCard4,
  ASSETS.spotlightAlbum,
  ASSETS.heroBg1,
];

const MOCK_CARDS = Array.from({ length: 24 }, (_, i) => ({
  id: i + 1,
  image: MOCK_IMAGES[i % MOCK_IMAGES.length],
  artist: "Artist",
  album: "Album Name",
}));

const PAGE_SIZE = 12;

function getUser(): User | null {
  const token = localStorage.getItem("token");
  const nickname = localStorage.getItem("nickname");
  if (token && nickname && !nickname.startsWith("User_")) return { nickname };
  return null;
}

export default function CategoryList() {
  const { category, item } = useParams<{ category: string; item: string }>();
  const navigate = useNavigate();
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const user = getUser();

  const decodedCategory = category ? decodeURIComponent(category) : "";
  const decodedItem = item ? decodeURIComponent(item) : decodedCategory;

  const visible = MOCK_CARDS.slice(0, visibleCount);
  const hasMore = visibleCount < MOCK_CARDS.length;

  return (
    <>
      <Header
        user={user}
        onSignUp={() => navigate("/login")}
        onLogIn={() => navigate("/login")}
        onLogOut={() => { localStorage.clear(); window.location.reload(); }}
      />

      <main className="bg-black min-h-screen pt-[128px]">
        {/* 히어로 */}
        <div className="relative w-full overflow-hidden h-[823px] max-md:h-[360px]">
          <img
            src={ASSETS.heroBg1}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-category-hero-gradient" />
          <div className="absolute bottom-0 left-0 right-0 px-[48px] max-md:px-4 pb-[48px] max-md:pb-6 flex items-end justify-between max-md:flex-col max-md:items-start max-md:gap-3">
            <div>
              <h1 className="text-white font-bold text-[40px] max-md:text-[24px] leading-tight tracking-[-1.2px] mb-[8px] max-md:mb-[4px]">Artist</h1>
              <p className="text-white/70 text-[20px] max-md:text-[14px] font-normal">Album Name</p>
            </div>
            <button
              type="button"
              className="inline-flex items-center justify-center font-bold font-noto text-[18px] max-md:text-[14px] px-[20px] max-md:px-3 py-[18px] max-md:py-3 cursor-pointer tracking-[-1.12px] leading-[120.492%] transition-colors duration-200 rounded-[27px] bg-white text-[#392626]"
              style={{ boxShadow: "0 4px 4px 0 rgba(0,0,0,0.23)" }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.85)")}
              onMouseLeave={e => (e.currentTarget.style.background = "#FFF")}
            >
              아티스트 페이지 보기
            </button>
          </div>
        </div>

        {/* 섹션 타이틀 */}
        <div className="px-[40px] max-md:px-4 py-[28px] max-md:py-[20px]">
          <h2 className="text-white font-bold text-[22px] max-md:text-[18px] tracking-tight inline-block border-b border-white pb-[6px]">
            {decodedItem}
            {decodedItem !== decodedCategory && (
              <span className="text-white/40 font-normal text-[15px] max-md:text-[13px] ml-[12px]">{decodedCategory}</span>
            )}
          </h2>
        </div>

        {/* 카드 그리드 */}
        <div className="px-[40px] max-md:px-4 grid grid-cols-4 max-md:grid-cols-2 gap-[16px] max-md:gap-[10px]">
          {visible.map((card) => (
            <div key={card.id} className="relative aspect-square rounded-[8px] overflow-hidden cursor-pointer group">
              <img
                src={card.image}
                alt={`${card.artist} . ${card.album}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {/* 레이블 overlay */}
              <div className="absolute bottom-0 left-0 right-0 px-[12px] py-[10px] bg-card-label-gradient">
                <p className="text-white text-[13px] max-md:text-[11px] font-medium leading-tight">
                  {card.artist} . {card.album}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* 더보기 */}
        {hasMore && (
          <div className="flex justify-center py-[48px] max-md:py-[32px]">
            <button
              type="button"
              className="border border-white/40 text-white text-[14px] px-[36px] py-[12px] rounded-full hover:bg-white/8 transition-colors"
              onClick={() => setVisibleCount((v) => v + PAGE_SIZE)}
            >
              더보기
            </button>
          </div>
        )}
        {!hasMore && <div className="py-[48px] max-md:py-[32px]" />}

        <CTASection variant="small" />
      </main>
    </>
  );
}
