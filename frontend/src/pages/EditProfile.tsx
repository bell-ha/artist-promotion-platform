import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { BACKEND_URL } from "../lib/api";

// ── Types ──────────────────────────────────────────────────────────────────
interface CareerItem { id: number; name: string; }
interface CareerCategory { id: number; name: string; items: CareerItem[]; }

interface NameData {
  name: string; english_name: string;
  description1: string; description2: string;
  thumbnail_url: string;
  career_item_ids: number[];
}
const emptyName = (): NameData => ({
  name: "", english_name: "", description1: "", description2: "", thumbnail_url: "", career_item_ids: [],
});

interface CommonCardFields {
  project_title: string; album_name: string; composer: string;
  category_desc: string; year: string; description: string;
}
const emptyCommon = (): CommonCardFields => ({
  project_title: "", album_name: "", composer: "", category_desc: "", year: "", description: "",
});

interface YoutubeCard extends CommonCardFields { link: string; }
interface SoundcloudCard extends CommonCardFields { link: string; }
interface ImageCard extends CommonCardFields { hyperlink: string; image_url: string; }
interface NoImageCard extends CommonCardFields { mp3_url: string; }

interface AlbumData {
  youtube_cards: YoutubeCard[];
  soundcloud_cards: SoundcloudCard[];
  image_cards: ImageCard[];
  no_image_cards: NoImageCard[];
}
const emptyAlbum = (): AlbumData => ({
  youtube_cards: [], soundcloud_cards: [], image_cards: [], no_image_cards: [],
});

interface BodyItem { title: string; content: string; }
interface TextCard { title: string; detail: string; body_items: BodyItem[]; }
interface TextSection { title: string; description: string; cards: TextCard[]; }

// ── Sub-components ─────────────────────────────────────────────────────────
function Input({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={s.label}>{label}</div>
      <input style={s.input} value={value} onChange={e => onChange(e.target.value)} />
    </div>
  );
}

function Textarea({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={s.label}>{label}</div>
      <textarea style={{ ...s.input, height: 72, resize: "vertical" as const }} value={value} onChange={e => onChange(e.target.value)} />
    </div>
  );
}

function FileInput({ label, accept, currentUrl, onUploaded, uploading, setUploading, headers }: {
  label: string; accept: string; currentUrl: string;
  onUploaded: (url: string) => void;
  uploading: boolean; setUploading: (v: boolean) => void;
  headers: Record<string, string>;
}) {
  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await axios.post(`${BACKEND_URL}/profile/upload`, form, { headers });
      onUploaded(res.data.url);
    } catch {
      alert("파일 업로드 실패");
    }
    setUploading(false);
    e.target.value = "";
  };

  return (
    <div style={{ marginBottom: 14 }}>
      <div style={s.label}>{label}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4 }}>
        <label style={{ ...s.btn, cursor: uploading ? "not-allowed" : "pointer", opacity: uploading ? 0.5 : 1 }}>
          {uploading ? "업로드 중..." : "파일 선택"}
          <input type="file" accept={accept} style={{ display: "none" }} onChange={handleChange} disabled={uploading} />
        </label>
        {currentUrl && (
          <span style={{ fontSize: 12, color: "rgba(255,255,255,.5)", wordBreak: "break-all" }}>
            ✓ 업로드됨
          </span>
        )}
      </div>
      {currentUrl && accept.includes("image") && (
        <img src={currentUrl} alt="" style={{ marginTop: 8, maxHeight: 80, borderRadius: 6, border: "1px solid rgba(255,255,255,.12)" }} />
      )}
    </div>
  );
}

function SectionHeader({ title }: { title: string }) {
  return <div style={s.sectionHeader}>{title}</div>;
}

function CardBox({ title, onRemove, children }: { title: string; onRemove: () => void; children: React.ReactNode }) {
  return (
    <div style={s.cardBox}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
        <b style={{ color: "#fff" }}>{title}</b>
        <button style={s.btnDanger} onClick={onRemove}>삭제</button>
      </div>
      {children}
    </div>
  );
}

function CommonFields<T extends CommonCardFields>({ card, update }: { card: T; update: (c: T) => void }) {
  const set = (key: keyof CommonCardFields) => (v: string) => update({ ...card, [key]: v });
  return (
    <>
      <Input label="프로젝트 제목" value={card.project_title} onChange={set("project_title")} />
      <Input label="Album Name" value={card.album_name} onChange={set("album_name")} />
      <Input label="작곡가 / Arranger" value={card.composer} onChange={set("composer")} />
      <Input label="카테고리 설명" value={card.category_desc} onChange={set("category_desc")} />
      <Input label="제작년도" value={card.year} onChange={set("year")} />
      <Textarea label="설명" value={card.description} onChange={set("description")} />
    </>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────
export default function EditProfile() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token") || "";
  const headers = { Authorization: `Bearer ${token}` };

  const [activeTemplate, setActiveTemplate] = useState<1 | 2 | 3>(1);
  const [categories, setCategories] = useState<CareerCategory[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState("");

  const [nameData, setNameData] = useState<NameData>(emptyName());
  const [albumData, setAlbumData] = useState<AlbumData>(emptyAlbum());
  const [textSections, setTextSections] = useState<TextSection[]>([]);

  useEffect(() => {
    if (!token) { navigate("/"); return; }
    axios.get(`${BACKEND_URL}/profile/career-items`).then(r => setCategories(r.data)).catch(() => {});
    axios.get(`${BACKEND_URL}/profile/me`, { headers }).then(r => {
      const d = r.data;
      if (d.active_template) setActiveTemplate(d.active_template as 1 | 2 | 3);
      if (d.name_section) {
        setNameData({
          name: d.name_section.name ?? "",
          english_name: d.name_section.english_name ?? "",
          description1: d.name_section.description1 ?? "",
          description2: d.name_section.description2 ?? "",
          thumbnail_url: d.name_section.thumbnail_url ?? "",
          career_item_ids: d.name_section.career_item_ids ?? [],
        });
      }
      if (d.album_section) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const toStr = (cards: any[]) => cards.map(c => ({ ...c, year: c.year != null ? String(c.year) : "" }));
        setAlbumData({
          youtube_cards: toStr(d.album_section.youtube_cards ?? []) as YoutubeCard[],
          soundcloud_cards: toStr(d.album_section.soundcloud_cards ?? []) as SoundcloudCard[],
          image_cards: toStr(d.album_section.image_cards ?? []) as ImageCard[],
          no_image_cards: toStr(d.album_section.no_image_cards ?? []) as NoImageCard[],
        });
      }
      if (d.text_sections) setTextSections(d.text_sections);
    }).catch(() => {});
  }, []); // eslint-disable-line

  const notify = (text: string) => { setMsg(text); setTimeout(() => setMsg(""), 2500); };
  const toInt = (v: string) => (v === "" ? null : parseInt(v));

  // ── 전체 저장 ──────────────────────────────────────────────────────────
  const saveAll = async () => {
    setSaving(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const toNum = (cards: any[]) => cards.map(c => ({ ...c, year: toInt(c.year) }));
      await Promise.all([
        axios.put(`${BACKEND_URL}/profile/name-section`, nameData, { headers }),
        axios.put(`${BACKEND_URL}/profile/album-section`, {
          youtube_cards: toNum(albumData.youtube_cards),
          soundcloud_cards: toNum(albumData.soundcloud_cards),
          image_cards: toNum(albumData.image_cards),
          no_image_cards: toNum(albumData.no_image_cards),
        }, { headers }),
        axios.put(`${BACKEND_URL}/profile/text-sections`, { sections: textSections }, { headers }),
      ]);
      notify("저장 완료!");
    } catch { notify("저장 실패"); }
    setSaving(false);
  };

  // ── Job toggle ──────────────────────────────────────────────────────────
  const toggleJob = (id: number) => {
    setNameData(p => ({
      ...p,
      career_item_ids: p.career_item_ids.includes(id)
        ? p.career_item_ids.filter(x => x !== id)
        : [...p.career_item_ids, id],
    }));
  };

  // ── Album helpers ───────────────────────────────────────────────────────
  const updateCard = <T,>(key: keyof AlbumData, i: number, c: T) =>
    setAlbumData(p => ({ ...p, [key]: (p[key] as T[]).map((v, idx) => idx === i ? c : v) }));
  const removeCard = (key: keyof AlbumData, i: number) =>
    setAlbumData(p => ({ ...p, [key]: (p[key] as unknown[]).filter((_, idx) => idx !== i) }));

  // ── Text section helpers ────────────────────────────────────────────────
  const addTextSection = () => setTextSections(p => [...p, { title: "", description: "", cards: [] }]);
  const removeTextSection = (si: number) => setTextSections(p => p.filter((_, i) => i !== si));
  const updateSec = (si: number, key: keyof Pick<TextSection, "title" | "description">, v: string) =>
    setTextSections(p => p.map((sec, i) => i === si ? { ...sec, [key]: v } : sec));
  const addTextCard = (si: number) =>
    setTextSections(p => p.map((sec, i) => i === si ? { ...sec, cards: [...sec.cards, { title: "", detail: "", body_items: [] }] } : sec));
  const removeTextCard = (si: number, ci: number) =>
    setTextSections(p => p.map((sec, i) => i === si ? { ...sec, cards: sec.cards.filter((_, j) => j !== ci) } : sec));
  const updateTextCard = (si: number, ci: number, key: keyof Pick<TextCard, "title" | "detail">, v: string) =>
    setTextSections(p => p.map((sec, i) => i === si ? {
      ...sec, cards: sec.cards.map((c, j) => j === ci ? { ...c, [key]: v } : c),
    } : sec));
  const addBodyItem = (si: number, ci: number) =>
    setTextSections(p => p.map((sec, i) => i === si ? {
      ...sec, cards: sec.cards.map((c, j) => j === ci ? { ...c, body_items: [...c.body_items, { title: "", content: "" }] } : c),
    } : sec));
  const removeBodyItem = (si: number, ci: number, bi: number) =>
    setTextSections(p => p.map((sec, i) => i === si ? {
      ...sec, cards: sec.cards.map((c, j) => j === ci ? { ...c, body_items: c.body_items.filter((_, k) => k !== bi) } : c),
    } : sec));
  const updateBodyItem = (si: number, ci: number, bi: number, key: keyof BodyItem, v: string) =>
    setTextSections(p => p.map((sec, i) => i === si ? {
      ...sec, cards: sec.cards.map((c, j) => j === ci ? {
        ...c, body_items: c.body_items.map((b, k) => k === bi ? { ...b, [key]: v } : b),
      } : c),
    } : sec));

  const fileProps = { uploading, setUploading, headers };

  return (
    <div style={s.page}>
      <header style={s.topbar}>
        <div style={s.topbarInner}>
          <div style={s.logo} onClick={() => navigate("/")} role="button" tabIndex={0}>SEIHI</div>
          <button style={s.btn} onClick={() => navigate("/mypage")}>Back</button>
        </div>
      </header>

      {msg && <div style={s.toast}>{msg}</div>}

      <main style={s.main}>
        <h1 style={s.title}>Edit Profile</h1>

        {/* 현재 템플릿 (enum 표시) */}
        <div style={{ marginBottom: 36 }}>
          <div style={s.label}>현재 템플릿</div>
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            {([1, 2, 3] as (1 | 2 | 3)[]).map(n => (
              <div key={n} style={{
                padding: "6px 16px", borderRadius: 20, fontSize: 12, fontWeight: 700, letterSpacing: ".04em",
                border: activeTemplate === n ? "1px solid #fff" : "1px solid rgba(255,255,255,.15)",
                background: activeTemplate === n ? "#fff" : "transparent",
                color: activeTemplate === n ? "#000" : "rgba(255,255,255,.25)",
              }}>
                Template {n}
              </div>
            ))}
          </div>
        </div>

        {activeTemplate === 1 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 48 }}>

            {/* ── NAME SECTION ─────────────────────────── */}
            <div>
              <SectionHeader title="Name Section" />
              <FileInput
                label="썸네일 사진"
                accept="image/*"
                currentUrl={nameData.thumbnail_url}
                onUploaded={url => setNameData(p => ({ ...p, thumbnail_url: url }))}
                {...fileProps}
              />
              <Input label="이름" value={nameData.name} onChange={v => setNameData(p => ({ ...p, name: v }))} />
              <Input label="영어 이름" value={nameData.english_name} onChange={v => setNameData(p => ({ ...p, english_name: v }))} />
              <Textarea label="설명1" value={nameData.description1} onChange={v => setNameData(p => ({ ...p, description1: v }))} />
              <Textarea label="설명2" value={nameData.description2} onChange={v => setNameData(p => ({ ...p, description2: v }))} />

              <div style={{ ...s.label, marginBottom: 8 }}>직업 선택 (복수 가능)</div>
              {categories.length === 0 && (
                <p style={{ color: "rgba(255,255,255,.4)", fontSize: 13, margin: "0 0 12px" }}>
                  카테고리 데이터 없음 (seed 실행 필요)
                </p>
              )}
              {categories.map(cat => (
                <div key={cat.id} style={{ marginBottom: 12 }}>
                  <div style={{ color: "rgba(255,255,255,.45)", fontSize: 11, fontWeight: 700, marginBottom: 6, letterSpacing: ".08em" }}>{cat.name}</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {cat.items.map(item => (
                      <label key={item.id} style={s.checkLabel}>
                        <input type="checkbox" checked={nameData.career_item_ids.includes(item.id)} onChange={() => toggleJob(item.id)} style={{ marginRight: 5 }} />
                        {item.name}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* ── ALBUM SECTION ────────────────────────── */}
            <div>
              <SectionHeader title="Album Section" />
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
                <button style={s.btn} onClick={() => setAlbumData(p => ({ ...p, youtube_cards: [...p.youtube_cards, { ...emptyCommon(), link: "" }] }))}>+ YouTube 카드</button>
                <button style={s.btn} onClick={() => setAlbumData(p => ({ ...p, soundcloud_cards: [...p.soundcloud_cards, { ...emptyCommon(), link: "" }] }))}>+ SoundCloud 카드</button>
                <button style={s.btn} onClick={() => setAlbumData(p => ({ ...p, image_cards: [...p.image_cards, { ...emptyCommon(), hyperlink: "", image_url: "" }] }))}>+ Image 카드</button>
                <button style={s.btn} onClick={() => setAlbumData(p => ({ ...p, no_image_cards: [...p.no_image_cards, { ...emptyCommon(), mp3_url: "" }] }))}>+ No-Image 카드</button>
              </div>

              {albumData.youtube_cards.map((c, i) => (
                <CardBox key={i} title={`YouTube #${i + 1}`} onRemove={() => removeCard("youtube_cards", i)}>
                  <Input label="YouTube 링크" value={c.link} onChange={v => updateCard("youtube_cards", i, { ...c, link: v })} />
                  <CommonFields card={c} update={nc => updateCard("youtube_cards", i, nc)} />
                </CardBox>
              ))}
              {albumData.soundcloud_cards.map((c, i) => (
                <CardBox key={i} title={`SoundCloud #${i + 1}`} onRemove={() => removeCard("soundcloud_cards", i)}>
                  <Input label="SoundCloud 링크" value={c.link} onChange={v => updateCard("soundcloud_cards", i, { ...c, link: v })} />
                  <CommonFields card={c} update={nc => updateCard("soundcloud_cards", i, nc)} />
                </CardBox>
              ))}
              {albumData.image_cards.map((c, i) => (
                <CardBox key={i} title={`Image 카드 #${i + 1}`} onRemove={() => removeCard("image_cards", i)}>
                  <Input label="하이퍼링크" value={c.hyperlink} onChange={v => updateCard("image_cards", i, { ...c, hyperlink: v })} />
                  <FileInput
                    label="이미지"
                    accept="image/*"
                    currentUrl={c.image_url}
                    onUploaded={url => updateCard("image_cards", i, { ...c, image_url: url })}
                    {...fileProps}
                  />
                  <CommonFields card={c} update={nc => updateCard("image_cards", i, nc)} />
                </CardBox>
              ))}
              {albumData.no_image_cards.map((c, i) => (
                <CardBox key={i} title={`No-Image 카드 #${i + 1}`} onRemove={() => removeCard("no_image_cards", i)}>
                  <FileInput
                    label="MP3 파일"
                    accept="audio/*"
                    currentUrl={c.mp3_url}
                    onUploaded={url => updateCard("no_image_cards", i, { ...c, mp3_url: url })}
                    {...fileProps}
                  />
                  <CommonFields card={c} update={nc => updateCard("no_image_cards", i, nc)} />
                </CardBox>
              ))}
              {Object.values(albumData).flat().length === 0 && (
                <p style={{ color: "rgba(255,255,255,.4)", fontSize: 13, margin: "0 0 12px" }}>카드를 추가해보세요.</p>
              )}
            </div>

            {/* ── TEXT SECTIONS ────────────────────────── */}
            <div>
              <SectionHeader title="Text Sections" />
              <button style={{ ...s.btn, marginBottom: 16 }} onClick={addTextSection}>+ Text Section 추가</button>
              {textSections.length === 0 && (
                <p style={{ color: "rgba(255,255,255,.4)", fontSize: 13, margin: "0 0 12px" }}>섹션을 추가해보세요.</p>
              )}
              {textSections.map((sec, si) => (
                <div key={si} style={{ ...s.cardBox, marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                    <b style={{ color: "#fff" }}>Section #{si + 1}</b>
                    <button style={s.btnDanger} onClick={() => removeTextSection(si)}>섹션 삭제</button>
                  </div>
                  <Input label="섹션 제목" value={sec.title} onChange={v => updateSec(si, "title", v)} />
                  <Textarea label="섹션 설명" value={sec.description} onChange={v => updateSec(si, "description", v)} />
                  {sec.cards.map((card, ci) => (
                    <div key={ci} style={{ ...s.cardBox, background: "rgba(255,255,255,.04)", marginTop: 10 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                        <b style={{ color: "rgba(255,255,255,.8)", fontSize: 13 }}>Card #{ci + 1}</b>
                        <button style={s.btnDanger} onClick={() => removeTextCard(si, ci)}>카드 삭제</button>
                      </div>
                      <Input label="제목" value={card.title} onChange={v => updateTextCard(si, ci, "title", v)} />
                      <Textarea label="세부 사항" value={card.detail} onChange={v => updateTextCard(si, ci, "detail", v)} />
                      {card.body_items.map((b, bi) => (
                        <div key={bi} style={{ background: "rgba(255,255,255,.05)", borderRadius: 8, padding: 10, marginBottom: 6 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                            <span style={{ color: "rgba(255,255,255,.6)", fontSize: 12 }}>본문 #{bi + 1}</span>
                            <button style={{ ...s.btnDanger, padding: "2px 8px", fontSize: 11 }} onClick={() => removeBodyItem(si, ci, bi)}>삭제</button>
                          </div>
                          <Input label="제목" value={b.title} onChange={v => updateBodyItem(si, ci, bi, "title", v)} />
                          <Input label="내용" value={b.content} onChange={v => updateBodyItem(si, ci, bi, "content", v)} />
                        </div>
                      ))}
                      <button style={{ ...s.btn, fontSize: 12, padding: "4px 10px", marginTop: 6 }} onClick={() => addBodyItem(si, ci)}>+ 본문 추가</button>
                    </div>
                  ))}
                  <button style={{ ...s.btn, marginTop: 10 }} onClick={() => addTextCard(si)}>+ 카드 추가</button>
                </div>
              ))}
            </div>

            {/* ── 전체 저장 버튼 ────────────────────────── */}
            <button
              style={{ ...s.btnPrimary, width: "100%", padding: "14px", fontSize: 15, opacity: (saving || uploading) ? 0.6 : 1 }}
              disabled={saving || uploading}
              onClick={saveAll}
            >
              {saving ? "저장 중..." : "저장"}
            </button>

          </div>
        )}
      </main>
    </div>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────
const s: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", background: "#0a0a0a", color: "#f2f2f2", fontFamily: "'Pretendard','Noto Sans KR',system-ui,sans-serif" },
  topbar: { position: "sticky", top: 0, zIndex: 50, background: "rgba(0,0,0,.78)", backdropFilter: "blur(10px)", borderBottom: "1px solid rgba(255,255,255,.10)" },
  topbarInner: { maxWidth: 1200, margin: "0 auto", padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" },
  logo: { fontWeight: 900, letterSpacing: ".12em", fontSize: 18, cursor: "pointer" },
  main: { maxWidth: 720, margin: "0 auto", padding: "40px 16px 80px" },
  title: { margin: "0 0 24px", fontSize: 30, fontWeight: 900 },
  sectionHeader: { fontSize: 16, fontWeight: 900, letterSpacing: ".04em", borderBottom: "1px solid rgba(255,255,255,.12)", paddingBottom: 10, marginBottom: 20, color: "#fff" },
  label: { fontSize: 11, color: "rgba(255,255,255,.6)", fontWeight: 700, marginBottom: 4, textTransform: "uppercase" as const, letterSpacing: ".06em" },
  input: { width: "100%", background: "rgba(255,255,255,.07)", border: "1px solid rgba(255,255,255,.14)", borderRadius: 6, color: "#fff", padding: "8px 10px", fontSize: 14, outline: "none", boxSizing: "border-box" as const },
  btn: { border: "1px solid rgba(255,255,255,.18)", background: "rgba(255,255,255,.06)", color: "#fff", padding: "8px 12px", borderRadius: 6, cursor: "pointer", fontWeight: 700, fontSize: 13 },
  btnPrimary: { background: "#fff", color: "#000", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 900, fontSize: 14 },
  btnDanger: { background: "rgba(255,60,60,.15)", border: "1px solid rgba(255,60,60,.3)", color: "#ff6060", padding: "4px 10px", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 700 },
  cardBox: { border: "1px solid rgba(255,255,255,.12)", background: "rgba(255,255,255,.03)", borderRadius: 12, padding: 16, marginBottom: 12 },
  checkLabel: { display: "flex", alignItems: "center", background: "rgba(255,255,255,.07)", border: "1px solid rgba(255,255,255,.12)", borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontSize: 13 },
  toast: { position: "fixed", top: 80, right: 20, background: "#fff", color: "#000", borderRadius: 8, padding: "10px 18px", fontWeight: 700, fontSize: 14, zIndex: 999 },
};
