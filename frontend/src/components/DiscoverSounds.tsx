import { useState } from "react";
import { ASSETS } from "../lib/assets";

const CARDS = [
  { src: ASSETS.discoverCard1, alt: "Discover album 1" },
  { src: ASSETS.discoverCard2, alt: "Discover album 2" },
  { src: ASSETS.discoverCard3, alt: "Discover album 3" },
  { src: ASSETS.discoverCard4, alt: "Discover album 4" },
];

export default function DiscoverSounds() {
  const [active, setActive] = useState(1);

  return (
    <section
      className="w-full pb-[465px] relative"
      style={{
        background: "linear-gradient(180deg, #0B0807 -8%, #130908 5%, #210B0B 10%, #BC6464 35%, #000 60%)",
      }}
    >
      <div className="max-w-[1280px] mx-auto mt-[307px] text-center">
        {/* 제목 — DISCOVER NEW SOUNDS */}
        <div className="inline-flex items-end gap-[0.5em] mb-[31px]">
          <span
            className="font-medium font-noto text-[#D9DDE3]"
            style={{
              fontSize: 48,
              lineHeight: 1.16,
              letterSpacing: "0.48px",
              textShadow: "-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000, 0 4px 2px rgba(255,255,255,0.25)",
            }}
          >
            DISCOVER
          </span>
          <span
            className="font-bold font-noto text-white pb-[10px]"
            style={{
              fontSize: 48,
              lineHeight: 1.16,
              letterSpacing: "5.76px",
              textShadow: "-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000, 0 4px 2px rgba(255,255,255,0.25), 0 0 40px rgba(255,255,255,0.35)",
            }}
          >
            NEW
          </span>
          <span
            className="font-medium font-noto text-[#D9DDE3]"
            style={{
              fontSize: 48,
              lineHeight: 1.16,
              letterSpacing: "0.48px",
              textShadow: "-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000, 0 4px 2px rgba(255,255,255,0.25)",
            }}
          >
            SOUNDS
          </span>
        </div>

        {/* 서브타이틀 */}
        <p
          className="mb-[100px] font-medium font-noto"
          style={{
            fontSize: 28,
            color: "#797D8D",
            lineHeight: 1.2,
            letterSpacing: "-0.56px",
            textShadow: "0 4px 2px rgba(255,255,255,0.25)",
          }}
        >
          다양한 장르의 사운드를 한 화면에서
        </p>

      </div>

      {/* 카드 캐러셀 */}
      <div className="w-full flex items-center justify-center gap-0 mt-2" style={{ position: "relative", zIndex: 10 }}>
            {CARDS.map((card, i) => {
              const dist = Math.abs(i - active);
              const isActive = i === active;
              const scale = isActive ? 1 : dist === 1 ? 0.88 : 0.76;
              const filter = isActive ? "none" : dist === 1 ? "brightness(0.6)" : "brightness(0.35)";
              const zIndex = 10 + CARDS.length - dist;
              const width = isActive ? 432 : dist === 1 ? 380 : 320;
              const height = isActive ? 401 : dist === 1 ? 354 : 298;
              return (
                <div
                  key={card.alt}
                  onMouseEnter={() => setActive(i)}
                  className="flex-none rounded-2xl overflow-hidden relative cursor-pointer"
                  style={{
                    width,
                    height,
                    filter,
                    zIndex,
                    transform: `scale(${scale})`,
                    marginLeft: i === 0 ? 0 : -20,
                    border: "1px solid rgba(255,255,255,0.5)",
                    boxShadow: "0 8px 24px 9px black",
                    transition: "all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                  }}
                >
                  <img src={card.src} alt={card.alt} className="absolute inset-0 w-full h-full object-cover" />
                </div>
              );
            })}
      </div>
    </section>
  );
}
