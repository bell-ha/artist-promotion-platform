import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { BACKEND_URL } from "../lib/api";

interface ArtistResult {
  id: number;
  nickname: string;
  name: string | null;
  english_name: string | null;
  thumbnail_url: string | null;
}

interface SearchModalProps {
  query: string;
  onClose: () => void;
}

export default function SearchModal({ query, onClose }: SearchModalProps) {
  const navigate = useNavigate();
  const [results, setResults] = useState<ArtistResult[]>([]);
  const [loading, setLoading] = useState(true);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLoading(true);
    axios
      .get<ArtistResult[]>(`${BACKEND_URL}/profile/search`, { params: { q: query } })
      .then((res) => setResults(res.data))
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  }, [query]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const go = (id: number) => {
    navigate(`/artist/${id}`);
    onClose();
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[300] flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.82)", backdropFilter: "blur(12px)" }}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div
        className="w-full max-w-[680px] rounded-[20px] overflow-hidden"
        style={{
          background: "rgba(18,18,18,0.97)",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 32px 80px rgba(0,0,0,0.7)",
        }}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/8">
          <div>
            <p className="text-white/40 text-[11px] font-inter tracking-[1.5px] uppercase mb-1">Search Results</p>
            <h2 className="text-white font-bold text-[18px] tracking-[-0.3px]">"{query}"</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all text-[16px]"
            aria-label="닫기"
          >
            ✕
          </button>
        </div>

        {/* 결과 영역 */}
        <div className="p-6" style={{ maxHeight: "60vh", overflowY: "auto" }}>
          {loading ? (
            <div className="flex justify-center py-12">
              <div
                className="w-6 h-6 rounded-full border-2 border-white/20 border-t-white/80"
                style={{ animation: "spin 0.7s linear infinite" }}
              />
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-white/30 text-[14px]">검색 결과가 없습니다.</p>
              <p className="text-white/18 text-[12px] mt-2">다른 이름이나 장르로 검색해보세요.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 max-sm:grid-cols-1 gap-3">
              {results.map((artist) => (
                <button
                  key={artist.id}
                  onClick={() => go(artist.id)}
                  className="flex items-center gap-4 p-3 rounded-[14px] text-left transition-all hover:bg-white/6 active:scale-[0.98]"
                  style={{ border: "1px solid rgba(255,255,255,0.06)" }}
                >
                  {/* 썸네일 */}
                  <div
                    className="flex-shrink-0 w-[52px] h-[52px] rounded-[10px] overflow-hidden"
                    style={{ background: "rgba(255,255,255,0.06)" }}
                  >
                    {artist.thumbnail_url ? (
                      <img
                        src={artist.thumbnail_url}
                        alt={artist.name ?? artist.nickname}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/20 text-[20px]">♪</div>
                    )}
                  </div>

                  {/* 텍스트 */}
                  <div className="min-w-0">
                    <p className="text-white font-semibold text-[14px] truncate leading-snug">
                      {artist.name || artist.nickname}
                    </p>
                    {artist.english_name && (
                      <p className="text-white/45 text-[12px] truncate mt-[2px]">{artist.english_name}</p>
                    )}
                    <p className="text-white/25 text-[11px] mt-[3px] truncate">@{artist.nickname}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 결과 수 */}
        {!loading && results.length > 0 && (
          <div className="px-6 py-3 border-t border-white/6">
            <p className="text-white/25 text-[11px]">{results.length}명의 아티스트</p>
          </div>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
