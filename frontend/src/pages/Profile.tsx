/**
 * Profile.tsx — 내 프로필 데이터 확인 페이지 (개발용)
 *
 * 사용 API
 * ─────────────────────────────────────────────
 * GET  /profile/me          → 전체 프로필 데이터 (name/album/text sections)
 * GET  /profile/career-items → 직업 카테고리 목록
 *
 * 인증: Authorization: Bearer <token>  (localStorage의 "token")
 * ─────────────────────────────────────────────
 */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { BACKEND_URL } from "../lib/api";

export default function Profile() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token") || "";
  const headers = { Authorization: `Bearer ${token}` };

  const [profile, setProfile] = useState<unknown>(null);
  const [categories, setCategories] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) { navigate("/"); return; }

    Promise.all([
      axios.get(`${BACKEND_URL}/profile/me`, { headers }),
      axios.get(`${BACKEND_URL}/profile/career-items`),
    ])
      .then(([profileRes, catRes]) => {
        setProfile(profileRes.data);
        setCategories(catRes.data);
      })
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line

  return (
    <div style={s.page}>
      <header style={s.header}>
        <span style={s.logo}>SEIHI</span>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={s.btn} onClick={() => navigate("/mypage/edit")}>Edit Profile</button>
          <button style={s.btn} onClick={() => navigate("/mypage")}>← Back</button>
        </div>
      </header>

      <main style={s.main}>
        <h1 style={s.title}>My Profile Data</h1>

        {loading && <p style={s.muted}>불러오는 중...</p>}
        {error && <p style={{ color: "#f66" }}>{error}</p>}

        {/* ── API 설명 ─────────────────────────────── */}
        <Section title="API Endpoints">
          <ApiRow method="GET" path="/profile/me" auth desc="전체 프로필 (name_section, album_section, text_sections, active_template)" />
          <ApiRow method="GET" path="/profile/career-items" desc="직업 카테고리 + 아이템 목록 (인증 불필요)" />
          <ApiRow method="PUT" path="/profile/name-section" auth desc="Name Section 저장" />
          <ApiRow method="PUT" path="/profile/album-section" auth desc="Album Section 저장 (4종 카드 배열)" />
          <ApiRow method="PUT" path="/profile/text-sections" auth desc="Text Sections 저장" />
          <ApiRow method="POST" path="/profile/upload" auth desc="파일 업로드 → Cloudinary → URL 반환" />
        </Section>

        {/* ── GET /profile/me 결과 ─────────────────── */}
        <Section title={`GET ${BACKEND_URL}/profile/me`}>
          <JsonBlock data={profile} />
        </Section>

        {/* ── GET /profile/career-items 결과 ──────── */}
        <Section title={`GET ${BACKEND_URL}/profile/career-items`}>
          <JsonBlock data={categories} />
        </Section>
      </main>
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={s.section}>
      <div style={s.sectionTitle}>{title}</div>
      {children}
    </div>
  );
}

function ApiRow({ method, path, desc, auth }: { method: string; path: string; desc: string; auth?: boolean }) {
  const methodColor: Record<string, string> = { GET: "#4ade80", POST: "#60a5fa", PUT: "#fbbf24", DELETE: "#f87171" };
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 10, fontSize: 13 }}>
      <span style={{ color: methodColor[method] ?? "#fff", fontWeight: 900, minWidth: 38 }}>{method}</span>
      <code style={{ color: "#e2e8f0", background: "rgba(255,255,255,.07)", padding: "2px 8px", borderRadius: 4, fontFamily: "monospace" }}>{path}</code>
      {auth && <span style={{ color: "#a78bfa", fontSize: 11, marginTop: 2 }}>🔒 Bearer</span>}
      <span style={{ color: "rgba(255,255,255,.5)", fontSize: 12, marginTop: 2 }}>{desc}</span>
    </div>
  );
}

function JsonBlock({ data }: { data: unknown }) {
  if (data === null) return <p style={s.muted}>데이터 없음</p>;
  return (
    <pre style={s.pre}>{JSON.stringify(data, null, 2)}</pre>
  );
}

// ── Styles ──────────────────────────────────────────────────────────────────
const s: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", background: "#0d1117", color: "#e6edf3", fontFamily: "'Pretendard','Noto Sans KR',monospace" },
  header: { position: "sticky", top: 0, zIndex: 50, background: "rgba(13,17,23,.9)", backdropFilter: "blur(8px)", borderBottom: "1px solid rgba(255,255,255,.08)", padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" },
  logo: { fontWeight: 900, letterSpacing: ".12em", fontSize: 16 },
  main: { maxWidth: 900, margin: "0 auto", padding: "36px 20px 80px" },
  title: { margin: "0 0 28px", fontSize: 24, fontWeight: 900 },
  section: { marginBottom: 36, border: "1px solid rgba(255,255,255,.10)", borderRadius: 10, padding: 20 },
  sectionTitle: { fontSize: 12, fontWeight: 900, letterSpacing: ".08em", color: "rgba(255,255,255,.45)", marginBottom: 14, textTransform: "uppercase" as const },
  pre: { background: "#161b22", border: "1px solid rgba(255,255,255,.08)", borderRadius: 8, padding: 16, fontSize: 12, lineHeight: 1.6, overflowX: "auto", whiteSpace: "pre-wrap", wordBreak: "break-all", color: "#c9d1d9", margin: 0 },
  muted: { color: "rgba(255,255,255,.35)", fontSize: 13, margin: 0 },
  btn: { border: "1px solid rgba(255,255,255,.15)", background: "rgba(255,255,255,.05)", color: "#fff", padding: "6px 12px", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 700 },
};
