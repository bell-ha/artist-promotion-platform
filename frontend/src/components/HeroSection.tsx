import { ASSETS } from "../lib/assets";

interface HeroSectionProps {
  title?: string;
  subtitle?: string;
  bg1Url?: string | null;
  bg2Url?: string | null;
}

const DEFAULT_TITLE = "가치를 위한, 기록의 첫 걸음";
const DEFAULT_SUBTITLE =
  "가격은 협상의 결과이고, 가치는 존재의 본질입니다. SEIHI는 아티스트의 가치를 지키는 플랫폼입니다.\n영광스러운 첫 시작을 저희와 함께해주세요.";

export default function HeroSection({
  title = DEFAULT_TITLE,
  subtitle = DEFAULT_SUBTITLE,
  bg1Url,
  bg2Url,
}: HeroSectionProps) {
  return (
    <section
      className="relative overflow-hidden h-[897px] max-md:h-[480px] bg-hero-bg"
    >
      {/* 레이어 1: DB URL 우선, 없으면 로컬 에셋 */}
      <img
        src={bg1Url || ASSETS.heroBg1}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* 레이어 2: DB URL 우선, 없으면 로컬 에셋 */}
      <img
        src={bg2Url || ASSETS.heroBg2}
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
          {title}
        </h1>
        <p
          className="mt-[86px] max-md:mt-[32px] font-inter font-medium text-[15px] max-md:text-[13px] text-hero-sub opacity-[0.83] leading-[1.45] tracking-[0.38px]"
        >
          {subtitle.split("\n").map((line, i) => (
            <span key={i}>
              {line}
              {i < subtitle.split("\n").length - 1 && <br className="max-md:hidden" />}
            </span>
          ))}
        </p>
      </div>
    </section>
  );
}
