import { ASSETS } from "../lib/assets";

export default function HeroSection() {
  return (
    <section
      className="relative overflow-hidden h-[897px] max-md:h-[480px] bg-hero-bg"
    >
      {/* 레이어 1: hero-bg-1 — 블러 베이스 */}
      <img
        src={ASSETS.heroBg1}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* 레이어 2: hero-bg-2 — 그 위에 겹침 */}
      <img
        src={ASSETS.heroBg2}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* 어두운 오버레이 */}
      <div
        className="absolute inset-0 opacity-20"
        style={{ filter: "blur(2px)", background: "#000000" }}
      />

      {/* 하단 페이드 */}
      <div className="absolute bottom-0 left-0 right-0 h-[160px] max-md:h-[80px] bg-fade-bottom" />

      {/* 콘텐츠 */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-8">
        <h1
          className="m-0 text-hero-text font-bold font-noto text-[54px] max-md:text-[32px] tracking-[-1.36px] leading-[1.1]"
          style={{
            textShadow: "-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000, 0 10px 30px rgba(0,0,0,.55)",
          }}
        >
          가치를 위한, 기록의 첫 걸음
        </h1>
        <p
          className="mt-[86px] max-md:mt-[32px] font-inter font-medium text-[15px] max-md:text-[13px] text-hero-sub opacity-[0.83] leading-[1.45] tracking-[0.38px]"
        >
          가격은 협상의 결과이고, 가치는 존재의 본질입니다. SEIHI는 아티스트의 가치를 지키는 플랫폼입니다.
          <br className="max-md:hidden" />
          영광스러운 첫 시작을 저희와 함께해주세요.
        </p>
      </div>
    </section>
  );
}
