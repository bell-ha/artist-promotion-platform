/**
 * ArtistTemplate2.tsx — 퍼포머 (Guitarist / Session Artist) 프로필 페이지
 */

import { useNavigate } from "react-router-dom";
import type {
  Template2Data,
  T2AlbumCard,
  T2TextSection,
  T2ContactSection,
} from "../types/template2";
import { dummyTemplate2 } from "../data/dummyTemplate2";

function toYoutubeEmbed(url: string): string {
  if (url.includes("/embed/")) return url;
  const m =
    url.match(/[?&]v=([^&]+)/) ||
    url.match(/youtu\.be\/([^?]+)/) ||
    url.match(/embed\/([^?]+)/);
  return m ? `https://www.youtube.com/embed/${m[1]}` : url;
}

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
  return (
    <div style={s.page}>
      <button style={s.backBtn} onClick={() => navigate(-1)}>←</button>

      <HeroSection ns={data.name_section} />

      <section style={s.content}>
        {sortedCards.map((card, i) => (
          <AlbumCardBlock key={i} card={card} />
        ))}
      </section>

      {sortedTextSections.map((sec, i) => (
        <TextSectionBlock key={i} section={sec} />
      ))}

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
        <div style={{ ...s.heroBg, backgroundImage: `url(${ns.thumbnail_url})` }} />
      )}
      <div style={s.heroOverlay} />

      <div style={s.heroContent}>
        <div style={s.heroPhotoSpacer} />

        <h1 style={s.heroName}>{ns.name}</h1>
        <p style={s.heroNameEn}>{ns.english_name}</p>

        <div style={s.heroDivider} />

        {ns.tagline && <p style={s.heroTagline}>{ns.tagline}</p>}
        {ns.description1 && <p style={s.heroRole}>{ns.description1}</p>}
        {ns.description2 && (
          <p style={s.heroDesc}>
            {ns.description2.split("\n").map((line, i, arr) => (
              <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
            ))}
          </p>
        )}
        {ns.activity_area && (
          <div style={s.heroAreaWrap}>
            <span style={s.heroAreaLabel}>활동기반 도시</span>
            <span style={s.heroArea}>{ns.activity_area}</span>
          </div>
        )}
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
          <a href={card.hyperlink ?? "#"} target="_blank" rel="noopener noreferrer" style={{ display: "block" }}>
            <img src={card.image_url} alt={card.album_name} style={s.albumImg} />
          </a>
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
function TextSectionBlock({ section }: { section: T2TextSection }) {
  const sortedCards = [...section.cards].sort((a, b) => a.order - b.order);

  return (
    <section style={s.textSection}>
      <SectionLabel label={section.title ?? ""} />
      {section.description && <p style={s.textSectionDesc}>{section.description}</p>}

      {section.title === "Band Activity" ? (
        <div style={s.bandSingleCardWrap}>
          <div style={s.bandSingleCard}>
            <div style={s.bandSingleList}>
              {sortedCards.map((card, i) => (
                <div key={i} style={s.bandSingleItem}>
                  {card.title && <div style={s.bandSingleText}>{card.title}</div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : section.title === "Technical · Production Info" ? (
        <>
          {section.images && section.images.length > 0 && (
            <div style={s.imageGrid}>
              {[...section.images].sort((a, b) => a.order - b.order).map((img, i) => (
                <div key={i} style={s.imageGridItem}>
                  <img src={img.image_url} alt={`tech-${i}`} style={s.gearImg} />
                </div>
              ))}
            </div>
          )}
          <div style={s.bandSingleCardWrap}>
            <div style={s.bandSingleCard}>
              <div style={s.techList}>
                {sortedCards.map((card, i) => (
                  <div key={i} style={s.techItem}>
                    {card.title && <p style={s.techTitle}>{card.title}</p>}
                    <div style={s.techContents}>
                      {[...card.body_items]
                        .sort((a, b) => a.order - b.order)
                        .map((item, j) => (
                          item.content && <p key={j} style={s.techContent}>{item.content}</p>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      ) : (
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
      )}
    </section>
  );
}

// ─────────────────────────────────────────────
// ─────────────────────────────────────────────
// ContactBlock
// ─────────────────────────────────────────────
function ContactBlock({ contact }: { contact: T2ContactSection }) {
  const phones = [contact.phone1, contact.phone2].filter(Boolean);
  const emails = [contact.email1, contact.email2, contact.email3].filter(Boolean);
  const snsLinks = [contact.instagram_url, contact.tiktok_url, contact.youtube_url].filter(Boolean) as string[];

  return (
    <section style={s.contactSection}>
      <div style={s.contactPaperWrap}>
        <img src="/src/assets/images/paper2.png" alt="" style={s.contactPaperImg} />

        <div style={s.contactOverlay}>
          <p style={s.contactLabel}>contact</p>

          <div style={s.contactBody}>
            {/* 왼쪽: 연락처 + [Send Mail] */}
            <div style={s.contactLeft}>
              <div style={s.contactGrid}>
                {phones.map((p, i) => (
                  <a key={i} href={`tel:${p}`} style={s.contactItem}>{p}</a>
                ))}
                {emails.map((e, i) => (
                  <a key={i} href={`mailto:${e}`} style={s.contactItem}>{e}</a>
                ))}
              </div>
              {contact.email1 && (
                <a href={`mailto:${contact.email1}`} style={s.sendMailBtn}>[Send Mail]</a>
              )}
            </div>

            {/* 오른쪽: SNS */}
            <div style={s.snsRow}>
              {snsLinks.map((url, i) => (
                <a key={i} href={url} target="_blank" rel="noopener noreferrer" style={s.snsTextLink}>
                  {url}
                </a>
              ))}
            </div>
          </div>
        </div>
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
    margin: "0 0 8px",
    fontSize: "clamp(12px, 1.6vw, 22px)",
    fontWeight: 700,
    color: "rgba(255,255,255,0.95)",
    letterSpacing: "0.19em",
  },
  heroRole: {
    margin: "0 0 10px",
    fontSize: "clamp(11px, 1.2vw, 16px)",
    fontWeight: 400,
    color: "rgba(255,255,255,0.7)",
    letterSpacing: "0.08em",
    lineHeight: 1.6,
  },
  heroAreaWrap: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    gap: 2,
    margin: "20px 0 12px",
  },
  heroAreaLabel: {
    fontSize: "clamp(9px, 0.9vw, 11px)",
    fontWeight: 400,
    color: "rgba(255,255,255,0.35)",
    letterSpacing: "0.12em",
  },
  heroArea: {
    fontSize: "clamp(11px, 1.1vw, 14px)",
    fontWeight: 500,
    color: "rgba(255,255,255,0.6)",
    letterSpacing: "0.08em",
  },
  heroDesc: {
    margin: "12px auto 0",
    fontSize: "clamp(10px, 1vw, 14px)",
    lineHeight: 1.75,
    color: "rgba(255,255,255,0.7)",
    maxWidth: "min(680px, 90%)",
    fontWeight: 300,
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
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    textAlign: "center" as const,
  },
  mediaWrap: {
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
  // Album info
  albumInfo: { padding: "8px 0 32px", textAlign: "center" as const },
  albumName: {
    margin: "0 0 10px",
    fontSize: 26,
    fontWeight: 700,
    letterSpacing: "0.09em",
    color: "#f0f0f0",
  },
  albumInfoDivider: {
    width: 240,
    height: 1,
    background: "rgba(255,255,255,0.2)",
    margin: "0 auto 14px",
  },
  metaLabel: {
    display: "block",
    margin: "0 0 4px",
    fontSize: 13,
    fontWeight: 700,
    color: "rgba(255,255,255,0.75)",
    letterSpacing: "0.09em",
  },
  albumCategory: {
    margin: "0 0 4px",
    fontSize: 13,
    fontWeight: 500,
    color: "rgba(255,255,255,0.55)",
    letterSpacing: "0.09em",
  },
  albumYear: {
    margin: "0 0 12px",
    fontSize: 12,
    color: "rgba(255,255,255,0.35)",
    letterSpacing: "0.09em",
  },
  albumDesc: {
    margin: "0 auto 10px",
    fontSize: 13,
    lineHeight: 1.8,
    color: "rgba(255,255,255,0.5)",
    fontWeight: 300,
    maxWidth: 560,
  },
  albumLink: {
    display: "block",
    fontSize: 11,
    color: "rgba(255,255,255,0.3)",
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
    color: "rgba(255,255,255,0.9)",
    textTransform: "uppercase" as const,
    display: "block",
    marginBottom: 8,
  },
  sectionLabelSub: {
    fontSize: 14,
    fontWeight: 700,
    color: "rgba(255,255,255,0.65)",
    display: "block",
    marginBottom: 12,
    letterSpacing: "0.06em",
  },
  sectionDivider: {
    height: 1,
    background: "rgba(255,255,255,0.12)",
    maxWidth: 280,
    margin: "12px auto 0",
  },

  // Text sections
  textSection: {
    maxWidth: 720,
    margin: "0 auto",
    padding: "56px 24px 16px",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    textAlign: "center" as const,
  },
  textSectionDesc: {
    fontSize: 14,
    lineHeight: 1.8,
    color: "rgba(255,255,255,0.55)",
    margin: "0 0 32px",
    fontWeight: 500,
    letterSpacing: "0.05em",
  },

  // Band grid
  bandGrid: {
    display: "flex",
    flexWrap: "wrap" as const,
    gap: 10,
    paddingBottom: 32,
    justifyContent: "center" as const,
  },
  bandSingleCardWrap: {
    display: "flex",
    justifyContent: "center",
    paddingBottom: 32,
  },
  bandSingleCard: {
    width: "100%",
    maxWidth: 680,
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 14,
    padding: "36px 28px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.6)",
    backdropFilter: "blur(6px)",
  },
  bandSingleList: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    gap: 18,
  },

  // Technical · Production Info
  techList: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    gap: 48,
    paddingBottom: 32,
  },
  techItem: {
    textAlign: "center" as const,
    maxWidth: 560,
    width: "100%",
  },
  techTitle: {
    margin: "0 0 8px",
    fontSize: 14,
    fontWeight: 700,
    color: "rgba(255,255,255,0.9)",
    letterSpacing: "0.08em",
  },
  techContents: {
    display: "flex",
    flexDirection: "column" as const,
    gap: 2,
  },
  techContent: {
    margin: 0,
    fontSize: 13,
    fontWeight: 300,
    color: "rgba(255,255,255,0.55)",
    letterSpacing: "0.04em",
    lineHeight: 1.7,
  },
  bandSingleItem: {
    width: "100%",
    textAlign: "center" as const,
  },
  bandSingleText: {
    fontSize: 14,
    fontWeight: 500,
    color: "rgba(255,255,255,0.85)",
    letterSpacing: "0.06em",
  },
  bandCard: {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 8,
    padding: "12px 18px",
    minWidth: 120,
    textAlign: "center" as const,
  },
  bandCardTitle: {
    margin: "0 0 4px",
    fontSize: 14,
    fontWeight: 700,
    color: "rgba(255,255,255,0.9)",
    letterSpacing: "0.06em",
    textAlign: "center" as const,
  },
  textCardDetail: {
    margin: "4px 0 0",
    fontSize: 12,
    color: "rgba(255,255,255,0.4)",
    textAlign: "center" as const,
  },
  bodyItem: {
    display: "flex",
    gap: 8,
    marginBottom: 4,
    fontSize: 12,
    lineHeight: 1.6,
    justifyContent: "center" as const,
  },
  bodyItemLabel: {
    color: "rgba(255,255,255,0.38)",
    fontWeight: 600,
    fontSize: 11,
    letterSpacing: "0.04em",
    paddingTop: 1,
  },
  bodyItemContent: {
    color: "rgba(255,255,255,0.65)",
    wordBreak: "break-all" as const,
  },

  imageGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: 12,
    paddingBottom: 32,
  },
  imageGridItem: {
    borderRadius: 12,
    overflow: "hidden",
    background: "#2a2a2a",
  },
  gearImg: {
    width: "100%",
    display: "block",
    objectFit: "cover" as const,
    aspectRatio: "4 / 3",
  },

  // Contact
  contactSection: {
    background: "transparent",
    padding: "0 24px 80px",
  },
  contactPaperWrap: {
    position: "relative" as const,
    maxWidth: 800,
    margin: "0 auto",
  },
  contactPaperImg: {
    display: "block",
    width: "100%",
    mixBlendMode: "screen" as const,
  },
  contactOverlay: {
    position: "absolute" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: "7% 8% 14%",
    display: "flex",
    flexDirection: "column" as const,
  },
  contactLabel: {
    fontFamily: "'Courier New', 'Courier', monospace",
    fontSize: "clamp(16px, 2.2vw, 26px)",
    fontWeight: 400,
    letterSpacing: "0.27em",
    color: "#191105",
    margin: "0 0 6%",
  },
  contactBody: {
    display: "flex",
    gap: "6%",
    alignItems: "stretch",
    flex: 1,
  },
  contactLeft: {
    flex: 1,
    display: "flex",
    flexDirection: "column" as const,
    gap: 16,
    paddingLeft: "4%",
  },
  contactGrid: {
    display: "flex",
    flexDirection: "column" as const,
    gap: 6,
    alignItems: "flex-start" as const,
  },
  contactItem: {
    fontFamily: "'Courier New', 'Courier', monospace",
    fontSize: "clamp(10px, 1.3vw, 15px)",
    color: "#191105",
    textDecoration: "none",
    lineHeight: 1.7,
    letterSpacing: "0.04em",
  },
  sendMailBtn: {
    display: "inline-block",
    fontFamily: "Georgia, 'Times New Roman', serif",
    fontSize: "clamp(14px, 2vw, 22px)",
    fontWeight: 400,
    color: "#191105",
    textDecoration: "none",
    letterSpacing: "0.24em",
  },
  snsRow: {
    flex: 1,
    display: "flex",
    flexDirection: "column" as const,
    gap: 10,
    alignItems: "flex-start" as const,
    justifyContent: "flex-end" as const,
  },
  snsTextLink: {
    fontFamily: "'Courier New', 'Courier', monospace",
    fontSize: "clamp(9px, 1.1vw, 13px)",
    fontWeight: 400,
    color: "#4b4949",
    textDecoration: "none",
    letterSpacing: "0.03em",
    lineHeight: 1.6,
  },
};
