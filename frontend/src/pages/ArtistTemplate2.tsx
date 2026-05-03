/**
 * ArtistTemplate2.tsx — 퍼포머 (Guitarist / Session Artist) 프로필 페이지
 *
 * 라우트 예시:
 *   /artist/:username  (active_template === "template2" 인 유저)
 *   /preview/template2  (더미데이터 미리보기)
 *
 * Template 1 과 다른 점:
 *   - ImageSection 추가 (Technical / 장비 사진 등)
 *   - NameSection에 activity_area 필드 존재
 *   - 앨범 섹션 레이블이 "PERFORMANCE ARCHIVE" / "DISCOGRAPHY / SESSION WORK" 등으로 구분
 */

import { useNavigate } from "react-router-dom";
import type {
  Template2Data,
  T2AlbumCard,
  T2TextSection,
  T2ImageSection,
  T2ContactSection,
} from "../types/template2";
import { dummyTemplate2 } from "../data/dummyTemplate2";

// ── 유틸: YouTube URL → embed ─────────────────
function toYoutubeEmbed(url: string): string {
  if (url.includes("/embed/")) return url;
  const m =
    url.match(/[?&]v=([^&]+)/) ||
    url.match(/youtu\.be\/([^?]+)/) ||
    url.match(/embed\/([^?]+)/);
  return m ? `https://www.youtube.com/embed/${m[1]}` : url;
}

// ── 유틸: SoundCloud URL → embed ──────────────
function toSoundcloudEmbed(url: string): string {
  const encoded = encodeURIComponent(url);
  return `https://w.soundcloud.com/player/?url=${encoded}&color=%23ff5500&auto_play=false&hide_related=false&show_comments=false&show_user=true&show_reposts=false&show_teaser=true&visual=true`;
}

// ─────────────────────────────────────────────
// 메인 페이지
// ─────────────────────────────────────────────
export default function ArtistTemplate2({ data = dummyTemplate2 }: { data?: Template2Data }) {
  const navigate = useNavigate();

  const sortedCards = [...data.album_section.cards].sort((a, b) => a.order - b.order);
  const sortedTextSections = [...data.text_sections].sort((a, b) => a.order - b.order);
  const sortedImageSections = [...data.image_sections].sort((a, b) => a.order - b.order);

  return (
    <div style={s.page}>
      {/* ── 백버튼 ── */}
      <button style={s.backBtn} onClick={() => navigate(-1)}>
        ←
      </button>

      {/* ── Hero / Name Section ── */}
      <HeroSection ns={data.name_section} />

      {/* ── Album / Performance / Session Cards ── */}
      <section style={s.content}>
        {sortedCards.map((card, i) => (
          <AlbumCardBlock key={i} card={card} />
        ))}
      </section>

      {/* ── Text Sections (Band Activity 등) ── */}
      {sortedTextSections.map((sec, i) => (
        <TextSectionBlock key={i} section={sec} />
      ))}

      {/* ── Image Sections (Technical / 장비 사진 등) ── */}
      {sortedImageSections.map((sec, i) => (
        <ImageSectionBlock key={i} section={sec} />
      ))}

      {/* ── Contact ── */}
      <ContactBlock contact={data.contact_section} />
    </div>
  );
}

// ─────────────────────────────────────────────
// HeroSection
// ─────────────────────────────────────────────
function HeroSection({ ns }: { ns: Template2Data["name_section"] }) {
  return (
    <header style={s.hero}>
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
        {ns.jobs.length > 0 && (
          <div style={s.jobRow}>
            {ns.jobs.map((j) => (
              <span key={j.id} style={s.jobTag}>
                {j.name}
              </span>
            ))}
          </div>
        )}

        <h1 style={s.heroName}>{ns.name}</h1>
        <p style={s.heroNameEn}>{ns.english_name}</p>

        {ns.description1 && <p style={s.heroRole}>{ns.description1}</p>}

        {ns.activity_area && (
          <p style={s.heroArea}>📍 {ns.activity_area}</p>
        )}

        {ns.description2 && <p style={s.heroDesc}>{ns.description2}</p>}
      </div>
    </header>
  );
}

// ─────────────────────────────────────────────
// AlbumCardBlock
// ─────────────────────────────────────────────
function AlbumCardBlock({ card }: { card: T2AlbumCard }) {
  return (
    <article style={s.albumBlock}>
      {card.project_title && (
        <SectionLabel label={card.project_title} sub={card.project_subtitle} />
      )}

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
            <span style={s.noImageIcon}>♩</span>
            <span style={s.noImageText}>{card.album_name ?? "Audio Track"}</span>
          </div>
        )}
      </div>

      <AlbumInfo card={card} />
    </article>
  );
}

// ─────────────────────────────────────────────
// AlbumInfo
// ─────────────────────────────────────────────
function AlbumInfo({ card }: { card: T2AlbumCard }) {
  return (
    <div style={s.albumInfo}>
      {card.album_name && <h3 style={s.albumName}>{card.album_name}</h3>}

      <div style={s.albumMeta}>
        {card.composer && <span style={s.metaLabel}>{card.composer}</span>}
        {card.category_desc && <span style={s.metaDot}>·</span>}
        {card.category_desc && <span style={s.metaLabel}>{card.category_desc}</span>}
      </div>

      {card.year && <p style={s.albumYear}>{card.year}</p>}
      {card.description && <p style={s.albumDesc}>{card.description}</p>}

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
function TextSectionBlock({ section }: { section: T2TextSection }) {
  const sortedCards = [...section.cards].sort((a, b) => a.order - b.order);

  return (
    <section style={s.textSection}>
      <SectionLabel label={section.title ?? ""} />

      {section.description && (
        <p style={s.textSectionDesc}>{section.description}</p>
      )}

      <div style={s.bandGrid}>
        {sortedCards.map((card, i) => (
          <div key={i} style={s.bandCard}>
            {card.title && <h4 style={s.bandCardTitle}>{card.title}</h4>}
            {card.detail && <p style={s.textCardDetail}>{card.detail}</p>}

            {[...card.body_items]
              .sort((a, b) => a.order - b.order)
              .map((item, j) => (
                <div key={j} style={s.bodyItem}>
                  {item.title && <span style={s.bodyItemLabel}>{item.title}</span>}
                  {item.content && <span style={s.bodyItemContent}>{item.content}</span>}
                </div>
              ))}
          </div>
        ))}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// ImageSectionBlock (Template 2 전용)
// ─────────────────────────────────────────────
function ImageSectionBlock({ section }: { section: T2ImageSection }) {
  const sortedImages = [...section.images].sort((a, b) => a.order - b.order);

  return (
    <section style={s.imageSection}>
      {section.title && <SectionLabel label={section.title} />}
      {section.description && (
        <p style={s.textSectionDesc}>{section.description}</p>
      )}

      <div style={s.imageGrid}>
        {sortedImages.map((img, i) => (
          <div key={i} style={s.imageGridItem}>
            <img src={img.image_url} alt={`gear-${i}`} style={s.gearImg} />
          </div>
        ))}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// ContactBlock
// ─────────────────────────────────────────────
function ContactBlock({ contact }: { contact: T2ContactSection }) {
  const phones = [contact.phone1, contact.phone2].filter(Boolean);
  const emails = [contact.email1, contact.email2, contact.email3].filter(Boolean);

  return (
    <section style={s.contactSection}>
      <SectionLabel label="CONTACT" />

      <div style={s.contactInner}>
        {contact.extra_description && (
          <h2 style={s.contactCta}>{contact.extra_description}</h2>
        )}

        <div style={s.contactGrid}>
          {phones.map((p, i) => (
            <a key={i} href={`tel:${p}`} style={s.contactItem}>
              {p}
            </a>
          ))}
          {emails.map((e, i) => (
            <a key={i} href={`mailto:${e}`} style={s.contactItem}>
              {e}
            </a>
          ))}
        </div>

        <div style={s.snsRow}>
          {contact.instagram_url && (
            <SnsIcon href={contact.instagram_url} label="Instagram" icon="IG" />
          )}
          {contact.tiktok_url && (
            <SnsIcon href={contact.tiktok_url} label="TikTok" icon="TK" />
          )}
          {contact.youtube_url && (
            <SnsIcon href={contact.youtube_url} label="YouTube" icon="YT" />
          )}
        </div>
      </div>
    </section>
  );
}

function SnsIcon({ href, label, icon }: { href: string; label: string; icon: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" style={s.snsIcon} title={label}>
      {icon}
    </a>
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

  // Hero
  hero: {
    position: "relative",
    minHeight: 480,
    display: "flex",
    alignItems: "flex-end",
    overflow: "hidden",
    background: "#1c1c1c",
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
      "linear-gradient(to bottom, rgba(17,17,17,0.1) 0%, rgba(17,17,17,0.65) 60%, rgba(17,17,17,0.97) 100%)",
  },
  heroContent: {
    position: "relative",
    zIndex: 2,
    padding: "60px 36px 48px",
    maxWidth: 760,
    width: "100%",
    margin: "0 auto",
  },
  jobRow: {
    display: "flex",
    flexWrap: "wrap" as const,
    gap: 8,
    marginBottom: 16,
  },
  jobTag: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.1em",
    color: "rgba(255,255,255,0.55)",
    background: "rgba(255,255,255,0.07)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 20,
    padding: "4px 12px",
    textTransform: "uppercase" as const,
  },
  heroName: {
    margin: "0 0 6px",
    fontSize: 42,
    fontWeight: 900,
    lineHeight: 1.15,
    letterSpacing: "-0.01em",
  },
  heroNameEn: {
    margin: "0 0 8px",
    fontSize: 20,
    fontWeight: 400,
    color: "rgba(255,255,255,0.65)",
    letterSpacing: "0.04em",
  },
  heroRole: {
    margin: "0 0 6px",
    fontSize: 14,
    fontWeight: 600,
    color: "rgba(255,255,255,0.7)",
    letterSpacing: "0.04em",
  },
  heroArea: {
    margin: "0 0 10px",
    fontSize: 12,
    color: "rgba(255,255,255,0.4)",
  },
  heroDesc: {
    margin: 0,
    fontSize: 13,
    lineHeight: 1.75,
    color: "rgba(255,255,255,0.5)",
    maxWidth: 540,
  },

  // Content wrapper
  content: {
    maxWidth: 760,
    margin: "0 auto",
    padding: "0 24px",
  },

  // Album block
  albumBlock: {
    padding: "48px 0 8px",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },
  mediaWrap: {
    marginBottom: 20,
    borderRadius: 8,
    overflow: "hidden",
    background: "#1e1e1e",
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
    maxHeight: 360,
  },
  noImagePlaceholder: {
    height: 140,
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    background: "#1e1e1e",
    color: "rgba(255,255,255,0.3)",
  },
  noImageIcon: { fontSize: 32, opacity: 0.4 },
  noImageText: { fontSize: 13, letterSpacing: "0.06em" },

  // Album info
  albumInfo: { padding: "4px 0 24px" },
  albumName: {
    margin: "0 0 6px",
    fontSize: 20,
    fontWeight: 700,
    letterSpacing: "-0.01em",
  },
  albumMeta: { display: "flex", alignItems: "center", gap: 6, marginBottom: 4 },
  metaLabel: { fontSize: 12, color: "rgba(255,255,255,0.45)", letterSpacing: "0.04em" },
  metaDot: { fontSize: 12, color: "rgba(255,255,255,0.25)" },
  albumYear: {
    margin: "0 0 10px",
    fontSize: 12,
    color: "rgba(255,255,255,0.35)",
  },
  albumDesc: {
    margin: "0 0 10px",
    fontSize: 13,
    lineHeight: 1.75,
    color: "rgba(255,255,255,0.55)",
  },
  albumLink: {
    fontSize: 12,
    color: "rgba(255,255,255,0.35)",
    textDecoration: "underline",
    wordBreak: "break-all" as const,
  },

  // SectionLabel
  sectionLabel: { marginBottom: 24, paddingTop: 8 },
  sectionLabelText: {
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: "0.12em",
    color: "rgba(255,255,255,0.4)",
    textTransform: "uppercase" as const,
    display: "block",
    marginBottom: 4,
  },
  sectionLabelSub: {
    fontSize: 13,
    color: "rgba(255,255,255,0.55)",
    display: "block",
    marginBottom: 10,
  },
  sectionDivider: {
    height: 1,
    background: "rgba(255,255,255,0.09)",
    marginTop: 8,
  },

  // Text sections
  textSection: {
    maxWidth: 760,
    margin: "0 auto",
    padding: "48px 24px 8px",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },
  textSectionDesc: {
    fontSize: 13,
    lineHeight: 1.75,
    color: "rgba(255,255,255,0.5)",
    margin: "0 0 24px",
  },

  // Band grid (inline tags)
  bandGrid: {
    display: "flex",
    flexWrap: "wrap" as const,
    gap: 10,
    paddingBottom: 24,
  },
  bandCard: {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 6,
    padding: "10px 16px",
    minWidth: 120,
  },
  bandCardTitle: {
    margin: 0,
    fontSize: 14,
    fontWeight: 600,
    color: "rgba(255,255,255,0.8)",
  },
  textCardDetail: {
    margin: "4px 0 0",
    fontSize: 12,
    color: "rgba(255,255,255,0.4)",
  },
  bodyItem: {
    display: "flex",
    gap: 10,
    marginBottom: 4,
    fontSize: 13,
    lineHeight: 1.6,
  },
  bodyItemLabel: {
    minWidth: 72,
    color: "rgba(255,255,255,0.35)",
    fontWeight: 600,
    fontSize: 11,
    letterSpacing: "0.04em",
    paddingTop: 2,
  },
  bodyItemContent: {
    color: "rgba(255,255,255,0.65)",
    wordBreak: "break-all" as const,
  },

  // Image section (Template 2 전용)
  imageSection: {
    maxWidth: 760,
    margin: "0 auto",
    padding: "48px 24px 8px",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },
  imageGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: 12,
    paddingBottom: 24,
  },
  imageGridItem: {
    borderRadius: 8,
    overflow: "hidden",
    background: "#1e1e1e",
  },
  gearImg: {
    width: "100%",
    display: "block",
    objectFit: "cover" as const,
    aspectRatio: "4 / 3",
  },

  // Contact
  contactSection: {
    maxWidth: 760,
    margin: "0 auto",
    padding: "56px 24px 80px",
  },
  contactInner: { paddingTop: 12 },
  contactCta: {
    fontSize: 28,
    fontWeight: 900,
    margin: "0 0 28px",
    letterSpacing: "-0.02em",
    color: "#f0f0f0",
  },
  contactGrid: {
    display: "flex",
    flexDirection: "column" as const,
    gap: 8,
    marginBottom: 24,
  },
  contactItem: {
    fontSize: 14,
    color: "rgba(255,255,255,0.6)",
    textDecoration: "none",
    lineHeight: 1.6,
  },
  snsRow: {
    display: "flex",
    gap: 12,
    marginTop: 8,
  },
  snsIcon: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 36,
    height: 36,
    borderRadius: "50%",
    border: "1px solid rgba(255,255,255,0.15)",
    background: "rgba(255,255,255,0.05)",
    color: "rgba(255,255,255,0.6)",
    fontSize: 11,
    fontWeight: 700,
    textDecoration: "none",
    letterSpacing: "0.03em",
  },
};
