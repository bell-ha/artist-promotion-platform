import { ASSETS } from "../lib/assets";

export default function SpotlightAlbum() {
  return (
    <section
      className=""
      style={{
        background: "linear-gradient(180deg, rgba(0,0,0,.92), rgba(38,0,24,.88))",
      }}
    >
      <div className="w-full flex justify-center">
        <div className="w-full pt-[72px] pb-[85px] text-center bg-[#1d0614]" >
          {/* 제목 */}
          <div
            className="text-white font-noto"
            style={{ fontSize: 48, letterSpacing: "1.92px" }}
          >
            <span style={{ fontWeight: 900, textShadow: "0 0px 30px rgba(255,255,255,0.4)" }}>Spotlight </span>
            <span style={{ fontWeight: 500, textShadow: "0 0px 30px rgba(255,255,255,0.4)" }}>Album</span>
          </div>

          {/* 서브타이틀 */}
          <p
            className="mt-2 font-normal font-noto"
            style={{
              fontSize: 30,
              color: "#bec4d9",
              textShadow: "0 0px 30px rgba(255,255,255,0.4)",
            }}
          >
            이번 달 가장 주목할 사운드 컬렉션
          </p>

          {/* 앨범 이미지 */}
          <div className="flex justify-center mt-[90px]">
            <div
              className="overflow-hidden w-[1151px] h-[668px]"
              style={{
                aspectRatio: "2 / 1",
                borderRadius: 30,
                border: "1px solid rgba(255,255,255,0.15)",
                boxShadow: "0 20px 24.9px -9px rgba(255, 255, 255, 0.21)",
              }}
            >
              <img
                src={ASSETS.spotlightAlbum}
                alt="Spotlight Album"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* 장식 선 */}
          <div
            className="my-[40px] mx-auto"
            style={{
              height: 3,
              width: 235,
              background: "#CCCCCC",
            }}
          />

          {/* 앨범 메타 */}
          <div className="flex flex-col items-center font-noto text-[20px]">
            <div className="text-white font-bold" >
              Album / Portfolio Title
            </div>
            <div style={{ color: "rgba(255,255,255,0.7)", fontWeight: 500 }}>
              Artist Name
            </div>
            <div style={{ color: "rgba(255,255,255,0.55)", fontWeight: 400 }}>
              Genre
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}