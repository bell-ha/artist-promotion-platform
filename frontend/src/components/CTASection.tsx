import { ASSETS } from "../lib/assets";

export default function CTASection({ variant = "large" }: { variant?: "large" | "small" }) {
  if (variant === "small") {
    return (
      <section className="bg-black flex items-center justify-between px-[110px] py-[80px]">
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
          className="flex items-center cursor-text"
          style={{
            border: "1px solid #f5f5f5",
            borderRadius: 19,
            width: 319,
            height: 43,
            padding: "0 16px",
            gap: 10,
          }}
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
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1E1B1B 0%, #1D0B0B 45%, #000000 100%)" }} />

      {/* 콘텐츠 */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[400px] text-center">
        <h3
          className="mt-[291px] text-[#f2f2f2] font-bold font-noto"
          style={{
            fontSize: 51,
            letterSpacing: "3.2px",
            lineHeight: 1.18,
            textShadow: "0 5px 4px rgba(255,255,255,0.58), -1px -1px 0 rgba(0,0,0,0.2), 1px -1px 0 rgba(0,0,0,0.2), -1px 1px 0 rgba(0,0,0,0.2), 1px 1px 0 rgba(0,0,0,0.2)",
          }}
        >
          새로운 사운드를 만나는
          <br />
          가장 좋은 방식
        </h3>

        <p
          className="mt-[59px] font-medium font-noto"
          style={{
            fontSize: 19,
            color: "rgba(206,205,205,0.55)",
            lineHeight: 1.45,
            letterSpacing: "-0.12px",
          }}
        >
          다양한 장르의 음악 포트폴리오를 한 화면에서 탐색해보세요.
        </p>

        {/* 액션 영역 */}
        <div className="flex items-center gap-4 mt-[160px] flex-wrap justify-center">
          <label
            className="flex items-center cursor-text"
            style={{
              border: "1px solid #f5f5f5",
              borderRadius: 19,
              width: 319,
              height: 43,
              padding: "0 16px",
              gap: 10,
            }}
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
      <footer
        className="relative z-10 flex justify-between items-center px-[110px] py-[80px]"
      >
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
