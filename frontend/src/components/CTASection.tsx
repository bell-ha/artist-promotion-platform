import { ASSETS } from "../lib/assets";

export default function CTASection({ variant = "large" }: { variant?: "large" | "small" }) {
  if (variant === "small") {
    return (
      <section className="bg-black flex items-center justify-between max-md:flex-col max-md:items-center px-[110px] max-md:px-5 py-[80px] max-md:py-[48px] max-md:gap-6">
        {/* 로고 */}
        <div>
          <img
            src={ASSETS.logoFooter}
            alt="SEIHI"
            className="h-6 object-contain"
            onError={(e) => {
              const t = e.currentTarget;
              t.style.display = "none";
              const fallback = t.nextElementSibling as HTMLElement | null;
              if (fallback) fallback.style.display = "block";
            }}
          />
          <span className="font-black tracking-[.12em] text-[14px] text-white hidden">SEIHI</span>
        </div>

        {/* 검색창 */}
        <label
          className="flex items-center cursor-text w-[319px] max-md:w-full max-md:max-w-[319px] h-[43px] rounded-[19px] border border-[#f5f5f5] px-[16px] gap-[10px]"
        >
          <img
            src={ASSETS.iconSearch}
            alt=""
            aria-hidden="true"
            className="w-[18px] h-[18px] object-contain opacity-80"
            onError={(e) => { e.currentTarget.style.display = "none"; }}
          />
          <input
            className="flex-1 border-none outline-none bg-transparent text-white text-[14px]"
            style={{ caretColor: "white" }}
            placeholder="Search by artist or genre"
            type="search"
          />
        </label>

        {/* 소셜 아이콘 */}
        <div className="flex gap-4 items-center">
          <a href="#" aria-label="Website" className="opacity-70 hover:opacity-100 transition-opacity">
            <img src={ASSETS.iconWebsite} alt="Website" className="w-[22px] h-[22px] object-contain" onError={(e) => { e.currentTarget.style.display = "none"; }} />
          </a>
          <a href="#" aria-label="Mail" className="opacity-70 hover:opacity-100 transition-opacity">
            <img src={ASSETS.iconMail} alt="Mail" className="w-[22px] h-[22px] object-contain" onError={(e) => { e.currentTarget.style.display = "none"; }} />
          </a>
          <a href="#" aria-label="Instagram" className="opacity-70 hover:opacity-100 transition-opacity">
            <img src={ASSETS.iconInstagram} alt="Instagram" className="w-[22px] h-[22px] object-contain" onError={(e) => { e.currentTarget.style.display = "none"; }} />
          </a>
        </div>
      </section>
    );
  }

  return (
    <section className="relative">
      {/* 배경 이미지 */}
      <img
        src={ASSETS.ctaBg}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover"
      />
      {/* 어두운 오버레이 */}
      <div className="absolute inset-0 bg-cta-gradient" />

      {/* 콘텐츠 */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[400px] text-center px-6">
        <h3
          className="mt-[291px] max-md:mt-[80px] text-cta-text font-bold font-noto text-[51px] max-md:text-[28px] tracking-[3.2px] max-md:tracking-[1px] leading-[1.18]"
          style={{
            textShadow: "0 5px 4px rgba(255,255,255,0.58), -1px -1px 0 rgba(0,0,0,0.2), 1px -1px 0 rgba(0,0,0,0.2), -1px 1px 0 rgba(0,0,0,0.2), 1px 1px 0 rgba(0,0,0,0.2)",
          }}
        >
          새로운 사운드를 만나는
          <br />
          가장 좋은 방식
        </h3>

        <p
          className="mt-[59px] max-md:mt-[24px] font-medium font-noto text-[19px] max-md:text-[14px] leading-[1.45] tracking-[-0.12px]"
          style={{ color: "rgba(206,205,205,0.55)" }}
        >
          다양한 장르의 음악 포트폴리오를 한 화면에서 탐색해보세요.
        </p>

        {/* 액션 영역 */}
        <div className="flex items-center gap-4 mt-[160px] max-md:mt-[48px] flex-wrap justify-center w-full max-w-[400px] max-md:max-w-full max-md:px-0">
          <label
            className="flex items-center cursor-text w-[319px] max-md:w-full h-[43px] rounded-[19px] border border-[#f5f5f5] px-[16px] gap-[10px]"
          >
            <img
              src={ASSETS.iconSearch}
              alt=""
              aria-hidden="true"
              className="w-[18px] h-[18px] object-contain opacity-80"
              onError={(e) => { e.currentTarget.style.display = "none"; }}
            />
            <input
              className="flex-1 border-none outline-none bg-transparent text-white text-[14px]"
              style={{ caretColor: "white" }}
              placeholder="Search by artist or genre"
              type="search"
            />
          </label>
        </div>
      </div>

      {/* 푸터 바 */}
      <footer className="relative z-10 flex justify-between items-center max-md:flex-col max-md:items-center px-[110px] max-md:px-5 py-[80px] max-md:py-[48px] max-md:gap-6">
        {/* 좌: 로고 */}
        <div>
          <img
            src={ASSETS.logoFooter}
            alt="SEIHI"
            className="h-6 object-contain"
            onError={(e) => {
              const t = e.currentTarget;
              t.style.display = "none";
              const fallback = t.nextElementSibling as HTMLElement | null;
              if (fallback) fallback.style.display = "block";
            }}
          />
          <span className="font-black tracking-[.12em] text-[14px] text-white hidden">SEIHI</span>
        </div>

        {/* 우: 소셜 아이콘 */}
        <div className="flex gap-4 items-center">
          <a href="#" aria-label="Mail" className="opacity-70 hover:opacity-100 transition-opacity">
            <img
              src={ASSETS.iconMail}
              alt="Mail"
              className="w-[22px] h-[22px] object-contain"
              onError={(e) => { e.currentTarget.style.display = "none"; }}
            />
          </a>
          <a href="#" aria-label="Website" className="opacity-70 hover:opacity-100 transition-opacity">
            <img
              src={ASSETS.iconWebsite}
              alt="Website"
              className="w-[22px] h-[22px] object-contain"
              onError={(e) => { e.currentTarget.style.display = "none"; }}
            />
          </a>
          <a href="#" aria-label="Instagram" className="opacity-70 hover:opacity-100 transition-opacity">
            <img
              src={ASSETS.iconInstagram}
              alt="Instagram"
              className="w-[22px] h-[22px] object-contain"
              onError={(e) => { e.currentTarget.style.display = "none"; }}
            />
          </a>
        </div>
      </footer>
    </section>
  );
}
