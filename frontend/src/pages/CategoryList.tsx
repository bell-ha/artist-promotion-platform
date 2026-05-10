import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../components/Header";
import CTASection from "../components/CTASection";
import { ASSETS } from "../lib/assets";
import { BACKEND_URL } from "../lib/api";

interface Artist {
  id: number;
  nickname: string;
  name: string | null;
  english_name: string | null;
  thumbnail_url: string | null;
  active_template: number;
}

const PAGE_SIZE = 12;

export default function CategoryList() {
  const { category, item } = useParams<{ category: string; item: string }>();
  const navigate = useNavigate();
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);

  const decodedCategory = category ? decodeURIComponent(category) : "";
  const decodedItem = item ? decodeURIComponent(item) : decodedCategory;

  useEffect(() => {
    setLoading(true);
    setVisibleCount(PAGE_SIZE);
    axios.get(`${BACKEND_URL}/profile/career-items`)
      .then(r => {
        const cats = r.data as { name: string; items: { id: number; name: string }[] }[];
        for (const cat of cats) {
          const found = cat.items.find(i => i.name === decodedItem);
          if (found) {
            return axios.get(`${BACKEND_URL}/profile/public/list?career_item_id=${found.id}`);
          }
        }
        return null;
      })
      .then(r => { if (r) setArtists(r.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [decodedItem]);

  const visible = artists.slice(0, visibleCount);
  const hasMore = visibleCount < artists.length;

  return (
    <>
      <Header />

      <main className="bg-black min-h-screen pt-[128px] max-md:pt-[60px]">
        {/* 히어로 */}
        <div className="relative w-full overflow-hidden h-[823px] max-md:h-[360px]">
          <img
            src={ASSETS.heroBg1}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-category-hero-gradient" />
          <div className="absolute bottom-0 left-0 right-0 px-[48px] max-md:px-4 pb-[48px] max-md:pb-6">
            <h1 className="text-white font-bold text-[40px] max-md:text-[24px] leading-tight tracking-[-1.2px] mb-[8px] max-md:mb-[4px]">
              {decodedItem}
            </h1>
            <p className="text-white/70 text-[20px] max-md:text-[14px] font-normal">
              {decodedCategory}
            </p>
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
        {loading ? (
          <div className="px-[40px] max-md:px-4 text-white/40 text-[14px] py-8">불러오는 중...</div>
        ) : artists.length === 0 ? (
          <div className="px-[40px] max-md:px-4 text-white/40 text-[14px] py-8">등록된 아티스트가 없습니다.</div>
        ) : (
          <div className="px-[40px] max-md:px-4 grid grid-cols-4 max-md:grid-cols-2 gap-[16px] max-md:gap-[10px]">
            {visible.map((artist) => (
              <div
                key={artist.nickname}
                className="relative aspect-square rounded-[8px] overflow-hidden cursor-pointer group"
                onClick={() => navigate(`/artist/${artist.id}`)}
              >
                <img
                  src={artist.thumbnail_url ?? ASSETS.heroBg1}
                  alt={artist.name ?? artist.nickname}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute bottom-0 left-0 right-0 px-[12px] py-[10px] bg-card-label-gradient">
                  <p className="text-white text-[13px] max-md:text-[11px] font-bold leading-tight">
                    {artist.name ?? artist.nickname}
                  </p>
                  {artist.english_name && (
                    <p className="text-white/70 text-[11px] max-md:text-[10px] font-normal mt-[2px]">
                      {artist.english_name}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

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
