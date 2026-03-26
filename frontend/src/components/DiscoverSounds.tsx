import { useEffect, useRef, useState } from "react";
import { ASSETS } from "../lib/assets";

const BASE_CARDS = [
  { src: ASSETS.discoverCard1, alt: "Discover album 1" },
  { src: ASSETS.discoverCard2, alt: "Discover album 2" },
  { src: ASSETS.discoverCard3, alt: "Discover album 3" },
  { src: ASSETS.discoverCard4, alt: "Discover album 4" },
];
const CARDS = [...BASE_CARDS, ...BASE_CARDS, ...BASE_CARDS];
const TOTAL = CARDS.length;       // 12
const STEP_DEG = 360 / TOTAL;    // 30
const RADIUS = 466;              // px: 카드 간격 ~25px (chord = CARD_W + 25)

const TEXT_SHADOW_BASE = "-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000, 0 4px 2px rgba(255,255,255,0.25)";
const TEXT_SHADOW_NEW = `${TEXT_SHADOW_BASE}, 0 0 40px rgba(255,255,255,0.35)`;

// 카드 크기 (원본의 절반)
const CARD_W = 216;
const CARD_H = 200;

export default function DiscoverSounds() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [newTriggered, setNewTriggered] = useState(false);

  // 캐러셀 드래그
  const carouselRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const dragStartOffset = useRef(0);

  // 섹션이 뷰포트에 들어오면 NEW 애니메이션 트리거
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNewTriggered(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // 캐러셀 초기 렌더 + 드래그 이벤트
  useEffect(() => {
    function applyTransforms() {
      const cards = carouselRef.current?.querySelectorAll<HTMLElement>("[data-card]");
      cards?.forEach((el, i) => {
        const raw = (i * STEP_DEG + offsetRef.current) % 360;
        const norm = raw > 180 ? raw - 360 : raw;
        const abs = Math.abs(norm);
        const cos = Math.cos(abs * Math.PI / 180);
        const sizeScale = 0.5 + Math.max(0, cos) * 0.5;
        el.style.transform = `rotateY(${norm}deg) translateZ(${RADIUS}px) scale(${sizeScale})`;
        el.style.opacity = String(Math.max(0, Math.pow(cos, 1.5)));
        el.style.display = abs > 115 ? "none" : "block";
      });
    }

    // 초기 렌더
    applyTransforms();

    function onMouseDown(e: MouseEvent) {
      isDragging.current = true;
      dragStartX.current = e.clientX;
      dragStartOffset.current = offsetRef.current;
      document.body.style.userSelect = "none";
    }

    function onMouseMove(e: MouseEvent) {
      if (!isDragging.current) return;
      const dx = e.clientX - dragStartX.current;
      // 드래그 감도: 1px = 0.2deg
      offsetRef.current = dragStartOffset.current + dx * 0.2;
      applyTransforms();
    }

    function onMouseUp() {
      if (!isDragging.current) return;
      isDragging.current = false;
      document.body.style.userSelect = "";
    }

    const container = carouselRef.current?.parentElement;
    container?.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    return () => {
      container?.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="w-full pb-[465px] relative"
      style={{
        background: "linear-gradient(180deg, #0B0807 -8%, #130908 5%, #210B0B 10%, #BC6464 35%, #000 60%)",
      }}
    >
      <div className="max-w-[1280px] mx-auto mt-[307px] text-center">
        {/* 제목 — DISCOVER NEW SOUNDS */}
        <div className="mb-[31px]" style={{ display: "inline-flex", alignItems: "flex-end", gap: "0.7em" }}>
          <span
            className="font-medium font-noto text-[#D9DDE3]"
            style={{
              fontSize: 48,
              lineHeight: 1.16,
              letterSpacing: "0.48px",
              textShadow: TEXT_SHADOW_BASE,
            }}
          >
            DISCOVER
          </span>

          {/* NEW 래퍼: phantom으로 공간 차지, floating span이 위에 겹침 */}
          <span style={{ position: "relative", display: "inline-block" }}>
            {/* phantom: 공간 확보 */}
            <span
              className="font-bold font-noto"
              style={{
                fontSize: 48,
                lineHeight: 1.16,
                letterSpacing: "5.76px",
                visibility: "hidden",
                display: "block",
              }}
            >
              NEW
            </span>
            {/* 실제 NEW — 뷰포트 진입 시 위로 이동 */}
            <span
              className={`font-bold font-noto${newTriggered ? " new-float-trigger" : ""}`}
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                textAlign: "center",
                fontSize: 48,
                lineHeight: 1.16,
                letterSpacing: "5.76px",
                textShadow: TEXT_SHADOW_NEW,
                color: "white",
                whiteSpace: "nowrap",
              }}
            >
              NEW
            </span>
          </span>

          <span
            className="font-medium font-noto text-[#D9DDE3]"
            style={{
              fontSize: 48,
              lineHeight: 1.16,
              letterSpacing: "0.48px",
              textShadow: TEXT_SHADOW_BASE,
            }}
          >
            SOUNDS
          </span>
        </div>

        {/* 서브타이틀 */}
        <p
          className="mb-[80px] font-medium font-noto"
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

      {/* 3D 캐러셀 */}
      <div
        style={{
          perspective: "2000px",
          perspectiveOrigin: "50% 50%",
          width: "100%",
          height: 300,
          position: "relative",
          zIndex: 10,
          cursor: "grab",
        }}
      >
        <div
          ref={carouselRef}
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            transformStyle: "preserve-3d",
          }}
        >
          {CARDS.map((card, i) => {
            const initRaw = (i * STEP_DEG) % 360;
            const initNorm = initRaw > 180 ? initRaw - 360 : initRaw;
            const initAbs = Math.abs(initNorm);
            const initCos = Math.cos(initAbs * Math.PI / 180);
            const initScale = 0.5 + Math.max(0, initCos) * 0.5;
            const initOpacity = Math.max(0, Math.pow(initCos, 1.5));

            return (
              <div
                key={i}
                data-card={i}
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  width: CARD_W,
                  height: CARD_H,
                  marginLeft: -CARD_W / 2,
                  marginTop: -CARD_H / 2,
                  borderRadius: 12,
                  border: "1px solid rgba(255,255,255,0.5)",
                  boxShadow: "0 4px 16px 4px black",
                  transform: `rotateY(${initNorm}deg) translateZ(${RADIUS}px) scale(${initScale})`,
                  opacity: initOpacity,
                  display: initAbs > 115 ? "none" : "block",
                  pointerEvents: "none",
                }}
              >
                <img
                  src={card.src}
                  alt={card.alt}
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    borderRadius: 12,
                    draggable: false,
                  } as React.CSSProperties}
                  draggable={false}
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
