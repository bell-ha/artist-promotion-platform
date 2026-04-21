import { useNavigate } from "react-router-dom";
import { ASSETS } from "../lib/assets";

export default function SimpleHeader() {
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black border-b border-white/10 h-[64px]">
      <div className="flex items-center px-6 h-full">
        <div
          className="flex items-center cursor-pointer"
          onClick={() => navigate("/")}
        >
          <img
            src={ASSETS.logo}
            alt="SEIHI"
            className="w-[80px] object-contain"
            onError={(e) => {
              const t = e.currentTarget;
              t.style.display = "none";
              const fallback = t.nextElementSibling as HTMLElement | null;
              if (fallback) fallback.style.display = "block";
            }}
          />
          <span className="font-black tracking-[.12em] text-[18px] text-white hidden">
            SEIHI
          </span>
        </div>
      </div>
    </header>
  );
}
