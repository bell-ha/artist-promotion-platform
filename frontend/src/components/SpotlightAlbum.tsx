import { ASSETS } from "../lib/assets";

interface SpotlightAlbumProps {
  subtitle?: string;
  imageUrl?: string | null;
  title?: string | null;
  artistName?: string | null;
  genre?: string | null;
}

export default function SpotlightAlbum({
  subtitle = "이번 달 가장 주목할 사운드 컬렉션",
  imageUrl,
  title = "Album / Portfolio Title",
  artistName = "Artist Name",
  genre = "Genre",
}: SpotlightAlbumProps) {
  const displayImage = imageUrl || ASSETS.spotlightAlbum;

  return (
    <section className="bg-spotlight-gradient">
      <div className="w-full flex justify-center">
        <div className="w-full pt-[58px] max-md:pt-[40px] pb-[68px] max-md:pb-[48px] text-center bg-spotlight-card">
          {/* 제목 */}
          <div className="text-white font-noto text-[38px] max-md:text-[24px] tracking-[1.92px]">
            <span
              className="font-black"
              style={{ textShadow: "0 0px 30px rgba(255,255,255,0.4)" }}
            >
              Spotlight{" "}
            </span>
            <span
              className="font-medium"
              style={{ textShadow: "0 0px 30px rgba(255,255,255,0.4)" }}
            >
              Album
            </span>
          </div>

          {/* 서브타이틀 */}
          <p
            className="mt-2 font-normal font-noto text-[24px] max-md:text-[16px] text-spotlight-sub"
            style={{ textShadow: "0 0px 30px rgba(255,255,255,0.4)" }}
          >
            {subtitle}
          </p>

          {/* 앨범 이미지 */}
          <div className="flex justify-center mt-[72px] max-md:mt-[32px] max-md:px-4">
            <div
              className="overflow-hidden w-[737px] max-md:w-full h-[428px] max-md:h-auto max-md:aspect-video rounded-[30px] border border-white/15"
              style={{
                boxShadow: "0 20px 24.9px -9px rgba(255, 255, 255, 0.21)",
              }}
            >
              <img
                src={displayImage}
                alt="Spotlight Album"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* 장식 선 */}
          <div className="my-[40px] max-md:my-[24px] mx-auto h-[3px] w-[235px] max-md:w-[120px] bg-[#CCC]" />

          {/* 앨범 메타 */}
          <div className="flex flex-col items-center font-noto text-[20px] max-md:text-[16px]">
            <div className="text-white font-bold">
              {title || "Album / Portfolio Title"}
            </div>
            <div className="font-medium" style={{ color: "rgba(255,255,255,0.7)" }}>
              {artistName || "Artist Name"}
            </div>
            <div className="font-normal" style={{ color: "rgba(255,255,255,0.55)" }}>
              {genre || "Genre"}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
