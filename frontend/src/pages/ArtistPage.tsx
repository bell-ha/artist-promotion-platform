/**
 * ArtistPage.tsx — /artist/:username 동적 라우터
 *
 * GET /profile/{username} 응답을 받아 active_template에 따라
 * ArtistTemplate1 / ArtistTemplate2로 분기하여 렌더링.
 *
 * API의 album_section은 분리 배열 형식이므로 cards[] 통합 배열로 변환 후 전달.
 */

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { BACKEND_URL } from "../lib/api";
import ArtistTemplate1 from "./ArtistTemplate1";
import ArtistTemplate2 from "./ArtistTemplate2";
import type { Template1Data, T1AlbumCard } from "../types/template1";
import type { Template2Data, T2AlbumCard } from "../types/template2";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mergeAlbumCards(albumSection: any): T1AlbumCard[] {
  if (!albumSection) return [];
  const cards: T1AlbumCard[] = [
    ...(albumSection.youtube_cards ?? []).map((c: any) => ({ ...c, type: "youtube" as const })),
    ...(albumSection.soundcloud_cards ?? []).map((c: any) => ({ ...c, type: "soundcloud" as const })),
    ...(albumSection.image_cards ?? []).map((c: any) => ({ ...c, type: "image" as const })),
    ...(albumSection.no_image_cards ?? []).map((c: any) => ({ ...c, type: "no_image" as const })),
  ];
  return cards.sort((a, b) => a.order - b.order);
}

type PageState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "t1"; data: Template1Data }
  | { status: "t2"; data: Template2Data };

export default function ArtistPage() {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const [state, setState] = useState<PageState>({ status: "loading" });

  useEffect(() => {
    if (!username) { setState({ status: "error" }); return; }
    setState({ status: "loading" });
    axios
      .get(`${BACKEND_URL}/profile/public/${username}`)
      .then(r => {
        const d = r.data;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const cards = mergeAlbumCards(d.album_section) as any[];
        if (d.active_template === 1) {
          setState({
            status: "t1",
            data: {
              username: d.username,
              name_section: d.name_section ?? { name: "", english_name: "" },
              album_section: { cards: cards as T1AlbumCard[] },
              text_sections: d.text_sections ?? [],
              contact_section: d.contact_section ?? {},
            },
          });
        } else if (d.active_template === 2) {
          setState({
            status: "t2",
            data: {
              username: d.username,
              name_section: d.name_section ?? { name: "", english_name: "" },
              album_section: { cards: cards as T2AlbumCard[] },
              text_sections: d.text_sections ?? [],
              image_sections: d.image_sections ?? [],
              contact_section: d.contact_section ?? {},
            },
          });
        } else {
          setState({ status: "error" });
        }
      })
      .catch(() => setState({ status: "error" }));
  }, [username]);

  if (state.status === "loading") {
    return (
      <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
        로딩 중...
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#fff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
        <p style={{ fontSize: 18 }}>프로필을 찾을 수 없습니다.</p>
        <button onClick={() => navigate("/")} style={{ border: "1px solid rgba(255,255,255,.3)", background: "transparent", color: "#fff", padding: "8px 20px", borderRadius: 6, cursor: "pointer" }}>
          홈으로
        </button>
      </div>
    );
  }

  if (state.status === "t2") return <ArtistTemplate2 data={state.data} />;
  return <ArtistTemplate1 data={state.data} />;
}
