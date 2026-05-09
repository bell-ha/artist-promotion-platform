/**
 * ArtistTemplate1.tsx — 창작자 (Music Producer / Composer) 프로필 페이지
 *
 * 라우트 예시:
 *   /artist/:username  (active_template === "template1" 인 유저)
 *   /preview/template1  (더미데이터 미리보기)
 *
 * 데이터 흐름:
 *   - 현재는 dummyTemplate1 더미데이터 사용
 *   - 추후 GET /profile/:username 으로 교체 예정
 *   - Template1Data 타입으로 관리하므로 API 연동 시 타입만 맞추면 됨
 */

import { useNavigate } from "react-router-dom";
import type { Template1Data, T1AlbumCard, T1TextSection, T1ContactSection } from "../types/template1";
import { dummyTemplate1 } from "../data/dummyTemplate1";

// ── 유틸: YouTube URL → embed URL 변환 ────────
function toYoutubeEmbed(url: string): string {
  if (url.includes("/embed/")) return url;
  const m =
    url.match(/[?&]v=([^&]+)/) ||
    url.match(/youtu\.be\/([^?]+)/) ||
    url.match(/embed\/([^?]+)/);
  return m ? `https://www.youtube.com/embed/${m[1]}` : url;
}

// ── 유틸: SoundCloud URL → embed src ──────────
function toSoundcloudEmbed(url: string): string {
  const encoded = encodeURIComponent(url);
  return `https://w.soundcloud.com/player/?url=${encoded}&color=%23ff5500&auto_play=false&hide_related=false&show_comments=false&show_user=true&show_reposts=false&show_teaser=true&visual=true`;
}

// ─────────────────────────────────────────────
// 메인 페이지
// ─────────────────────────────────────────────
export default function ArtistTemplate1({ data = dummyTemplate1 }: { data?: Template1Data }) {
  const navigate = useNavigate();
  const sortedCards = [...data.album_section.cards].sort((a, b) => a.order - b.order);
  const sortedSections = [...data.text_sections].sort((a, b) => a.order - b.order);

  return (
    <div style={s.page}>
      {/* ── 백버튼 ── */}
      <button style={s.backBtn} onClick={() => navigate(-1)}>
        ←
      </button>

      {/* ── Hero / Name Section ── */}
      <HeroSection ns={data.name_section} />

      {/* ── Album + Text (회색 배경 영역) ── */}
      <div style={s.grayArea}>
        <section style={s.content}>
          {sortedCards.map((card, i) => (
            <AlbumCardBlock key={i} card={card} />
          ))}
        </section>

        {sortedSections.map((sec, i) => (
          <TextSectionBlock key={i} section={sec} />
        ))}
      </div>

      {/* ── Contact ── */}
      <ContactBlock contact={data.contact_section} />
    </div>
  );
}

// ─────────────────────────────────────────────
// HeroSection
// ─────────────────────────────────────────────
function HeroSection({ ns }: { ns: Template1Data["name_section"] }) {
  return (
    <header style={s.hero}>
      {/* 배경 이미지 */}
      {ns.thumbnail_url && (
        <div
          style={{
            ...s.heroBg,
            backgroundImage: `url(${ns.thumbnail_url})`,
          }}
        />
      )}
      <div style={s.heroOverlay} />

      <div style={s.heroContent}>
        {/* 사진 높이만큼 여백 */}
        <div style={s.heroPhotoSpacer} />

        {/* 이름 */}
        <h1 style={s.heroName}>{ns.name}</h1>
        <p style={s.heroNameEn}>{ns.english_name}</p>

        {/* 구분선 */}
        <div style={s.heroDivider} />

        {/* tagline → description1 순서 (Figma 기준) */}
        {ns.tagline && <p style={s.heroTagline}>{ns.tagline}</p>}
        {ns.description1 && <p style={s.heroRole}>{ns.description1}</p>}
        {ns.description2 && (
          <p style={s.heroDesc}>
            {ns.description2.split("\n").map((line, i) => (
              <span key={i}>{line}{i < ns.description2!.split("\n").length - 1 && <br />}</span>
            ))}
          </p>
        )}
      </div>
    </header>
  );
}

// ─────────────────────────────────────────────
// AlbumCardBlock — card 타입별 렌더
// ─────────────────────────────────────────────
function AlbumCardBlock({ card }: { card: T1AlbumCard }) {
  return (
    <article style={s.albumBlock}>
      {/* 섹션 레이블 */}
      {card.project_title && (
        <SectionLabel label={card.project_title} sub={card.project_subtitle} />
      )}

      {/* 미디어 영역 */}
      <div style={s.mediaWrap}>
        {card.type === "youtube" && (
          <iframe
            style={s.iframe}
            src={toYoutubeEmbed(card.link)}
            title={card.album_name ?? "YouTube"}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        )}

        {card.type === "soundcloud" && (
          <iframe
            style={{ ...s.iframe, height: 166 }}
            src={toSoundcloudEmbed(card.link)}
            title={card.album_name ?? "SoundCloud"}
            allow="autoplay"
            scrolling="no"
            frameBorder="no"
          />
        )}

        {card.type === "image" && card.image_url && (
          <a
            href={card.hyperlink ?? "#"}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: "block" }}
          >
            <img src={card.image_url} alt={card.album_name} style={s.albumImg} />
          </a>
        )}

        {card.type === "no_image" && (
          <div style={s.noImagePlaceholder}>
            <span style={s.noImageIcon}>♪</span>
            <span style={s.noImageText}>{card.album_name ?? "Audio Track"}</span>
          </div>
        )}
      </div>

      {/* 앨범 정보 */}
      <AlbumInfo card={card} />
    </article>
  );
}

// ─────────────────────────────────────────────
// AlbumInfo
// ─────────────────────────────────────────────
function AlbumInfo({ card }: { card: T1AlbumCard }) {
  return (
    <div style={s.albumInfo}>
      {card.album_name && <h3 style={s.albumName}>{card.album_name}</h3>}
      <div style={s.albumInfoDivider} />
      {card.composer && <p style={s.metaLabel}>{card.composer}</p>}
      {card.category_desc && <p style={s.albumCategory}>{card.category_desc}</p>}
      {card.year && <p style={s.albumYear}>{card.year}</p>}
      {card.description && (
        <p style={s.albumDesc}>
          {card.description.split("\n").map((line, i, arr) => (
            <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
          ))}
        </p>
      )}
      {"hyperlink" in card && card.hyperlink && (
        <a href={card.hyperlink} target="_blank" rel="noopener noreferrer" style={s.albumLink}>
          {card.hyperlink}
        </a>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// TextSectionBlock
// ─────────────────────────────────────────────
function TextSectionBlock({ section }: { section: T1TextSection }) {
  const sortedCards = [...section.cards].sort((a, b) => a.order - b.order);

  return (
    <section style={s.textSection}>
      <SectionLabel label={section.title ?? ""} />

      {section.description && (
        <p style={s.textSectionDesc}>{section.description}</p>
      )}

      <div style={s.textCardGrid}>
        {sortedCards.map((card, i) => (
          <div key={i} style={s.textCard}>
            {card.title && <h4 style={s.textCardTitle}>{card.title}</h4>}
            {card.detail && <p style={s.textCardDetail}>{card.detail}</p>}

            {[...card.body_items]
              .sort((a, b) => a.order - b.order)
              .map((item, j) => (
                <div key={j} style={s.bodyItem}>
                  {item.title && <span style={s.bodyItemLabel}>{item.title}</span>}
                  {item.content && (
                    <span style={s.bodyItemContent}>{item.content}</span>
                  )}
                </div>
              ))}
          </div>
        ))}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// ContactBlock
// ─────────────────────────────────────────────
function ContactBlock({ contact }: { contact: T1ContactSection }) {
  const phones = [contact.phone1, contact.phone2].filter(Boolean);
  const emails = [contact.email1, contact.email2, contact.email3].filter(Boolean);

  const snsItems = [
    contact.instagram_url && { url: contact.instagram_url, icon: "instagram" },
    contact.tiktok_url    && { url: contact.tiktok_url,    icon: "tiktok" },
    contact.youtube_url   && { url: contact.youtube_url,   icon: "youtube" },
  ].filter(Boolean) as { url: string; icon: string }[];

  return (
    <section style={s.contactSection}>
      {/* CONTACT 레이블 */}
      <p style={s.contactLabel}>CONTACT</p>

      {/* 종이 이미지 (텍스트 포함) */}
      <img
        src="/src/assets/images/paper.png"
        alt="Work with ME!"
        style={s.contactPaperImg}
      />

      {/* 전화 / 이메일 */}
      <div style={s.contactGrid}>
        {phones.map((p, i) => (
          <a key={i} href={`tel:${p}`} style={s.contactItem}>{p}</a>
        ))}
        {emails.map((e, i) => (
          <a key={i} href={`mailto:${e}`} style={s.contactItem}>{e}</a>
        ))}
      </div>

      {/* Send mail 버튼 */}
      {contact.email1 && (
        <a href={`mailto:${contact.email1}`} style={s.sendMailBtn}>Send mail</a>
      )}

      {/* SNS 링크 (텍스트만, 가운데 정렬) */}
      <div style={s.snsRow}>
        {snsItems.map(({ url }, i) => (
          <a key={i} href={url} target="_blank" rel="noopener noreferrer" style={s.snsTextLink}>
            {url}
          </a>
        ))}
      </div>
    </section>
  );
}


// ─────────────────────────────────────────────
// SectionLabel
// ─────────────────────────────────────────────
function SectionLabel({ label, sub }: { label: string; sub?: string }) {
  return (
    <div style={s.sectionLabel}>
      <span style={s.sectionLabelText}>{label}</span>
      {sub && <span style={s.sectionLabelSub}>{sub}</span>}
      <div style={s.sectionDivider} />
    </div>
  );
}

// ─────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────
const s: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#111111",
    color: "#f0f0f0",
    fontFamily: "'Pretendard', 'Noto Sans KR', 'Inter', system-ui, sans-serif",
  },

  // Back button
  backBtn: {
    position: "fixed" as const,
    top: 20,
    left: 20,
    zIndex: 100,
    background: "rgba(17,17,17,0.75)",
    backdropFilter: "blur(8px)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 20,
    color: "rgba(255,255,255,0.7)",
    fontSize: 13,
    fontWeight: 600,
    padding: "8px 16px",
    cursor: "pointer",
    letterSpacing: "0.03em",
  },

  // Nav
  nav: {
    position: "sticky",
    top: 0,
    zIndex: 100,
    background: "rgba(17,17,17,0.92)",
    backdropFilter: "blur(12px)",
    borderBottom: "1px solid rgba(255,255,255,0.07)",
    padding: "14px 24px",
    display: "flex",
    alignItems: "center",
  },
  navLogo: {
    fontWeight: 900,
    letterSpacing: "0.15em",
    fontSize: 15,
    cursor: "pointer",
    color: "#f0f0f0",
  },

  // Hero
  hero: {
    position: "relative",
    overflow: "hidden",
    background: "#1a1a1a",
  },
  heroBg: {
    position: "absolute",
    inset: 0,
    backgroundSize: "cover",
    backgroundPosition: "center top",
    backgroundRepeat: "no-repeat",
  },
  heroOverlay: {
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(to bottom, rgba(17,17,17,0) 0%, rgba(17,17,17,0) 35%, rgba(17,17,17,0.55) 52%, rgba(17,17,17,0.88) 62%, rgba(17,17,17,1) 70%)",
  },
  heroContent: {
    position: "relative",
    zIndex: 2,
    paddingBottom: 60,
    width: "100%",
    textAlign: "center" as const,
  },
  heroPhotoSpacer: {
    height: "56vw",
    maxHeight: 680,
    minHeight: 320,
  },
  heroName: {
    margin: "0 0 4px",
    fontSize: "clamp(32px, 5.5vw, 52px)",
    fontWeight: 900,
    lineHeight: 1.05,
    letterSpacing: "0.12em",
    textShadow: "0px 4px 4px rgba(130,130,130,0.39)",
  },
  heroNameEn: {
    margin: "0 0 20px",
    fontSize: "clamp(18px, 3vw, 38px)",
    fontWeight: 700,
    color: "rgba(255,255,255,0.95)",
    letterSpacing: "0.16em",
    lineHeight: 1.336,
  },
  heroDivider: {
    width: "min(400px, 70%)",
    height: 1,
    background: "rgba(255,255,255,0.4)",
    margin: "0 auto 20px",
  },
  heroTagline: {
    margin: "0 0 6px",
    fontSize: "clamp(12px, 1.6vw, 22px)",
    fontWeight: 700,
    color: "rgba(255,255,255,0.95)",
    letterSpacing: "0.19em",
  },
  heroRole: {
    margin: "16px 0 0",
    fontSize: "clamp(11px, 1.2vw, 17px)",
    fontWeight: 400,
    color: "rgba(255,255,255,0.85)",
    letterSpacing: "0.09em",
  },
  heroDesc: {
    margin: "12px auto 0",
    fontSize: "clamp(10px, 1vw, 14px)",
    lineHeight: 1.75,
    color: "rgba(255,255,255,0.7)",
    maxWidth: "min(680px, 90%)",
    fontWeight: 300,
  },

  // 회색 배경 영역 (히어로 이후 ~ Contact 전)
  grayArea: {
    background: "#cfcfcf",
    color: "#111",
  },

  // Content wrapper
  content: {
    maxWidth: 720,
    margin: "0 auto",
    padding: "0 24px",
    textAlign: "center" as const,
  },

  // Album block
  albumBlock: {
    padding: "56px 0 16px",
    borderBottom: "1px solid rgba(0,0,0,0.1)",
    textAlign: "center" as const,
  },
  mediaWrap: {
    marginBottom: 28,
    borderRadius: 12,
    overflow: "hidden",
    background: "#2a2a2a",
    maxWidth: 680,
    margin: "0 auto 28px",
  },
  iframe: {
    width: "100%",
    height: 340,
    border: "none",
    display: "block",
  },
  albumImg: {
    width: "100%",
    display: "block",
    objectFit: "cover" as const,
    maxHeight: 400,
  },
  noImagePlaceholder: {
    height: 160,
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    background: "#2a2a2a",
    color: "rgba(255,255,255,0.3)",
  },
  noImageIcon: { fontSize: 36, opacity: 0.4 },
  noImageText: { fontSize: 13, letterSpacing: "0.06em" },

  // Album info
  albumInfo: { padding: "8px 0 32px", textAlign: "center" as const },
  albumName: {
    margin: "0 0 10px",
    fontSize: 26,
    fontWeight: 700,
    letterSpacing: "0.09em",
    color: "#111",
  },
  albumInfoDivider: {
    width: 240,
    height: 1,
    background: "rgba(0,0,0,0.2)",
    margin: "0 auto 14px",
  },
  metaLabel: {
    display: "block",
    margin: "0 0 4px",
    fontSize: 13,
    fontWeight: 700,
    color: "rgba(0,0,0,0.7)",
    letterSpacing: "0.09em",
  },
  albumCategory: {
    margin: "0 0 4px",
    fontSize: 13,
    fontWeight: 500,
    color: "rgba(0,0,0,0.5)",
    letterSpacing: "0.09em",
  },
  albumYear: {
    margin: "0 0 12px",
    fontSize: 12,
    color: "rgba(0,0,0,0.4)",
    letterSpacing: "0.09em",
  },
  albumDesc: {
    margin: "0 auto 10px",
    fontSize: 13,
    lineHeight: 1.8,
    color: "rgba(0,0,0,0.55)",
    fontWeight: 300,
    maxWidth: 560,
  },
  albumLink: {
    display: "block",
    fontSize: 11,
    color: "rgba(0,0,0,0.35)",
    textDecoration: "none",
    wordBreak: "break-all" as const,
    fontWeight: 100,
    letterSpacing: "0.04em",
  },

  // SectionLabel
  sectionLabel: {
    marginBottom: 32,
    paddingTop: 8,
    textAlign: "center" as const,
  },
  sectionLabelText: {
    fontSize: 18,
    fontWeight: 900,
    letterSpacing: "0.18em",
    color: "rgba(0,0,0,0.85)",
    textTransform: "uppercase" as const,
    display: "block",
    marginBottom: 8,
  },
  sectionLabelSub: {
    fontSize: 14,
    fontWeight: 700,
    color: "rgba(0,0,0,0.55)",
    display: "block",
    marginBottom: 12,
    letterSpacing: "0.06em",
  },
  sectionDivider: {
    height: 1,
    background: "rgba(0,0,0,0.12)",
    marginTop: 12,
    maxWidth: 280,
    margin: "12px auto 0",
  },

  // Text sections
  textSection: {
    maxWidth: 720,
    margin: "0 auto",
    padding: "56px 24px 16px",
    borderBottom: "1px solid rgba(0,0,0,0.1)",
    textAlign: "center" as const,
  },
  textSectionDesc: {
    fontSize: 14,
    lineHeight: 1.8,
    color: "rgba(0,0,0,0.55)",
    margin: "0 0 32px",
    fontWeight: 500,
    letterSpacing: "0.05em",
  },
  textCardGrid: {
    display: "flex",
    flexDirection: "column" as const,
    gap: 20,
    paddingBottom: 32,
  },
  textCard: {
    background: "rgba(255,255,255,0.45)",
    border: "1px solid rgba(0,0,0,0.08)",
    borderRadius: 10,
    padding: "28px 24px",
  },
  textCardTitle: {
    margin: "0 0 16px",
    fontSize: 16,
    fontWeight: 700,
    color: "rgba(0,0,0,0.85)",
    letterSpacing: "0.09em",
    textAlign: "center" as const,
  },
  textCardDetail: {
    margin: "0 0 10px",
    fontSize: 13,
    color: "rgba(0,0,0,0.45)",
    textAlign: "center" as const,
  },
  bodyItem: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center" as const,
    gap: 4,
    marginBottom: 20,
    lineHeight: 1.6,
    textAlign: "center" as const,
  },
  bodyItemLabel: {
    color: "rgba(0,0,0,0.45)",
    fontWeight: 600,
    fontSize: 12,
    letterSpacing: "0.09em",
    textTransform: "uppercase" as const,
  },
  bodyItemContent: {
    color: "rgba(0,0,0,0.75)",
    fontSize: 14,
    fontWeight: 400,
    letterSpacing: "0.05em",
    wordBreak: "break-all" as const,
  },

  // Contact
  contactSection: {
    background: "#e9e9e9",
    padding: "56px 24px 72px",
    textAlign: "center" as const,
    color: "#333",
  },
  contactLabel: {
    fontSize: 15,
    fontWeight: 700,
    letterSpacing: "0.15em",
    color: "rgba(0,0,0,0.7)",
    margin: "0 0 16px",
  },
  contactPaperImg: {
    display: "block",
    width: "100%",
    maxWidth: 680,
    margin: "0 auto 40px",
    mixBlendMode: "multiply" as const,
  },
  contactGrid: {
    display: "flex",
    flexDirection: "column" as const,
    gap: 8,
    marginBottom: 28,
    alignItems: "center" as const,
  },
  contactItem: {
    fontSize: 14,
    fontWeight: 300,
    color: "#4b4949",
    textDecoration: "none",
    lineHeight: 1.7,
    letterSpacing: "0.04em",
  },
  sendMailBtn: {
    display: "inline-block",
    margin: "0 auto 36px",
    padding: "12px 36px",
    borderRadius: 40,
    background: "rgba(0,0,0,0.1)",
    color: "#111",
    fontSize: 16,
    fontWeight: 700,
    letterSpacing: "0.06em",
    textDecoration: "none",
    cursor: "pointer",
    border: "1px solid rgba(0,0,0,0.15)",
  },
  snsRow: {
    display: "flex",
    flexDirection: "column" as const,
    gap: 12,
    alignItems: "center" as const,
    marginTop: 8,
  },
  snsTextLink: {
    fontSize: 14,
    fontWeight: 300,
    color: "#4b4949",
    textDecoration: "none",
    letterSpacing: "0.03em",
    lineHeight: 1.6,
  },
};
