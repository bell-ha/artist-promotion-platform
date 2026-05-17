import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../components/Header";
import HeroSection from "../components/HeroSection";
import DiscoverSounds from "../components/DiscoverSounds";
import SpotlightAlbum from "../components/SpotlightAlbum";
import CTASection from "../components/CTASection";
import { BACKEND_URL } from "../lib/api";

export interface MainPageData {
  hero: { title: string; subtitle: string; bg1_url: string | null; bg2_url: string | null };
  discover: {
    subtitle: string;
    cards: { slot_order: number; image_url: string }[];
  };
  spotlight: {
    subtitle: string;
    image_url: string | null;
    title: string | null;
    artist_name: string | null;
    genre: string | null;
  };
  cta: { title: string; subtitle: string };
}

export default function Main() {
  const location = useLocation();
  const navigate = useNavigate();
  const [pageData, setPageData] = useState<MainPageData | null>(null);

  useEffect(() => {
    if (location.pathname === "/login") {
      navigate("/", { replace: true });
      return;
    }
    axios
      .get<MainPageData>(`${BACKEND_URL}/main-page`)
      .then((res) => setPageData(res.data))
      .catch(() => {
        // API 실패 시 각 컴포넌트의 기본값으로 동작
      });
  }, [location.pathname, navigate]);

  return (
    <>
      <Header />
      <main className="pt-[128px] max-xl:pt-[60px]">
        <HeroSection
          title={pageData?.hero.title}
          subtitle={pageData?.hero.subtitle}
          bg1Url={pageData?.hero.bg1_url}
          bg2Url={pageData?.hero.bg2_url}
        />
        <DiscoverSounds
          subtitle={pageData?.discover.subtitle}
          cards={pageData?.discover.cards}
        />
        <SpotlightAlbum
          subtitle={pageData?.spotlight.subtitle}
          imageUrl={pageData?.spotlight.image_url}
          title={pageData?.spotlight.title}
          artistName={pageData?.spotlight.artist_name}
          genre={pageData?.spotlight.genre}
        />
        <CTASection
          ctaTitle={pageData?.cta.title}
          ctaSubtitle={pageData?.cta.subtitle}
        />
      </main>
    </>
  );
}
