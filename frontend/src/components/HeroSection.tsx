import { ASSETS } from "../lib/assets";

export default function HeroSection() {
  return (
    <section
      className="relative overflow-hidden"
      style={{ height: 897, background: "#210b0b" }}
    >
      {/* 레이어 1: hero-bg-1 — 블러 베이스 */}
      <img
        src={ASSETS.heroBg1}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* 레이어 2: hero-bg-2 — 그 위에 겹침 (opacity 56%, blur 15px) */}
      <img
        src={ASSETS.heroBg2}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* 어두운 오버레이 + 그라디언트 */}
      <div
        className="absolute inset-0"
        style={{
          opacity: 0.2,
          background: "#000000",
          filter: "blur(2px)",
        }}
      />

      {/* 하단 페이드 */}
      <div
        className="absolute bottom-0 left-0 right-0"
        style={{
          height: 160,
          background: "linear-gradient(to top, #0a0a0a 0%, transparent 100%)",
        }}
      />

      {/* 콘텐츠 */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-8">
        <h1
          className="m-0 text-[#fffffb] font-bold font-noto"
          style={{
            fontSize: 54,
            letterSpacing: "-1.36px",
            textShadow: "-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000, 0 10px 30px rgba(0,0,0,.55)",
            lineHeight: 1.1,
          }}
        >
          가치를 위한, 기록의 첫 걸음
        </h1>
        <p
          className="mt-[86px] font-inter font-medium"
          style={{
            fontSize: 15,
            color: "#b9babf",
            opacity: 0.83,
            lineHeight: 1.45,
            letterSpacing: "0.38px",
          }}
        >
          가격은 협상의 결과이고, 가치는 존재의 본질입니다. SEIHI는 아티스트의 가치를 지키는 플랫폼입니다.
          <br />
          영광스러운 첫 시작을 저희와 함께해주세요.
        </p>
      </div>
    </section>
  );
}
