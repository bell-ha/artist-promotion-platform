import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { BACKEND_URL } from "../lib/api";

// ── Types ──────────────────────────────────────
interface Stats {
  total_users: number;
  today_signups: number;
  paid_users: number;
  active_artists: number;
  total_uploads: number;
}
interface RecentSignup { id: number; nickname: string; email: string; created_at: string; }
interface RecentUpload { user_id: number; type: string; title: string | null; album: string | null; }
interface AdminUser {
  id: number; email: string; nickname: string; role: string;
  is_active: boolean; subscription_plan: string; provider: string; created_at: string;
}
interface UserDetail extends AdminUser {
  thumbnail_url: string | null; real_name: string | null; english_name: string | null;
  active_template: number;
  uploads: { type: string; id: number; title: string | null; album: string | null }[];
}

type Tab = "dashboard" | "users" | "storage" | "mainpage";

// ── MainPage types ────────────────────────────
interface AdminMainPageSettings {
  content: {
    hero_title: string; hero_subtitle: string;
    hero_bg1_url: string | null; hero_bg2_url: string | null;
    discover_subtitle: string; cta_title: string; cta_subtitle: string;
  };
  spotlight: {
    subtitle: string; artist_id: number | null; image_url: string | null;
    title: string | null; artist_name: string | null; genre: string | null;
    resolved_url: string | null;
  };
  cards: {
    id: number; slot_order: number; artist_id: number | null;
    image_url: string | null; resolved_url: string | null;
  }[];
}

// ── Main ──────────────────────────────────────
export default function AdminPage() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const [tab, setTab] = useState<Tab>("dashboard");
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentSignups, setRecentSignups] = useState<RecentSignup[]>([]);
  const [recentUploads, setRecentUploads] = useState<RecentUpload[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    if (role?.toUpperCase() !== "ADMIN") { navigate("/", { replace: true }); return; }
    fetchDashboard();
  }, []);

  useEffect(() => {
    if ((tab === "users" || tab === "mainpage") && users.length === 0) fetchUsers();
  }, [tab]);

  const fetchDashboard = async () => {
    const [statsRes, recentRes] = await Promise.all([
      axios.get(`${BACKEND_URL}/admin/stats`, authHeader).catch(() => null),
      axios.get(`${BACKEND_URL}/admin/recent`, authHeader).catch(() => null),
    ]);
    if (statsRes) setStats(statsRes.data);
    if (recentRes) {
      setRecentSignups(recentRes.data.recent_signups ?? []);
      setRecentUploads(recentRes.data.recent_uploads ?? []);
    }
  };

  const fetchUsers = async () => {
    const res = await axios.get(`${BACKEND_URL}/admin/users`, authHeader).catch(() => null);
    if (res) setUsers(res.data);
  };

  const openUserDetail = async (userId: number) => {
    setLoadingDetail(true);
    const res = await axios.get(`${BACKEND_URL}/admin/users/${userId}`, authHeader).catch(() => null);
    if (res) setSelectedUser(res.data);
    setLoadingDetail(false);
  };

  const toggleActive = async (userId: number) => {
    await axios.patch(`${BACKEND_URL}/admin/users/${userId}/active`, {}, authHeader);
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_active: !u.is_active } : u));
    if (selectedUser?.id === userId) setSelectedUser(prev => prev ? { ...prev, is_active: !prev.is_active } : null);
  };

  const changePlan = async (userId: number, plan: string) => {
    await axios.patch(`${BACKEND_URL}/admin/users/${userId}/plan`, { plan }, authHeader);
    const normalized = plan.toUpperCase();
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, subscription_plan: normalized } : u));
    if (selectedUser?.id === userId) setSelectedUser(prev => prev ? { ...prev, subscription_plan: normalized } : null);
  };

  const deleteUser = async (userId: number) => {
    if (!confirm("정말로 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) return;
    await axios.delete(`${BACKEND_URL}/admin/users/${userId}`, authHeader);
    setUsers(prev => prev.filter(u => u.id !== userId));
    setSelectedUser(null);
  };

  const filteredUsers = users.filter(u =>
    u.nickname.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#0a0a0a", color: "#fff", fontFamily: "Inter, sans-serif" }}>
      {/* 사이드바 */}
      <aside style={{ width: 200, borderRight: "1px solid rgba(255,255,255,0.08)", padding: "28px 0", flexShrink: 0, display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "0 20px 24px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em", marginBottom: 4 }}>SEIHI</div>
          <div style={{ fontSize: 15, fontWeight: 700 }}>Admin</div>
        </div>
        <nav style={{ flex: 1, padding: "12px 0" }}>
          {([
            { key: "dashboard", label: "대시보드" },
            { key: "users", label: "회원 관리" },
            { key: "storage", label: "파일 관리" },
            { key: "mainpage", label: "메인페이지" },
          ] as { key: Tab; label: string }[]).map(item => (
            <button key={item.key} onClick={() => setTab(item.key)} style={{
              width: "100%", textAlign: "left", padding: "10px 20px", background: "transparent",
              border: "none", cursor: "pointer", fontSize: 13, fontWeight: tab === item.key ? 600 : 400,
              color: tab === item.key ? "#fff" : "rgba(255,255,255,0.45)",
              borderLeft: tab === item.key ? "2px solid #fff" : "2px solid transparent",
            }}>
              {item.label}
            </button>
          ))}
        </nav>
        <div style={{ padding: "16px 20px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <button onClick={() => navigate("/mypage")} style={ghostBtn}>← MyPage</button>
          <button onClick={() => { localStorage.clear(); window.location.href = "/"; }} style={{ ...ghostBtn, marginTop: 6, color: "rgba(255,100,100,0.7)" }}>
            LogOut
          </button>
        </div>
      </aside>

      {/* 본문 */}
      <main style={{ flex: 1, padding: "32px 40px", overflowY: "auto" }}>
        {tab === "dashboard" && (
          <Dashboard stats={stats} recentSignups={recentSignups} recentUploads={recentUploads} />
        )}
        {tab === "storage" && <StorageTab authHeader={authHeader} />}
        {tab === "mainpage" && <MainPageTab authHeader={authHeader} users={users} />}
        {tab === "users" && (
          <UsersTab
            users={filteredUsers}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedUser={selectedUser}
            loadingDetail={loadingDetail}
            onSelect={openUserDetail}
            onClose={() => setSelectedUser(null)}
            onToggleActive={toggleActive}
            onChangePlan={changePlan}
            onDelete={deleteUser}
          />
        )}
      </main>
    </div>
  );
}

// ── 대시보드 ──────────────────────────────────
function Dashboard({ stats, recentSignups, recentUploads }: {
  stats: Stats | null;
  recentSignups: RecentSignup[];
  recentUploads: RecentUpload[];
}) {
  const statCards = [
    { label: "총 회원", value: stats?.total_users ?? "-" },
    { label: "오늘 가입", value: stats?.today_signups ?? "-" },
    { label: "유료 구독", value: stats?.paid_users ?? "-" },
    { label: "활성 아티스트", value: stats?.active_artists ?? "-" },
    { label: "총 업로드", value: stats?.total_uploads ?? "-" },
  ];

  return (
    <div>
      <h2 style={pageTitle}>대시보드</h2>

      {/* 통계 카드 */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, marginBottom: 32 }}>
        {statCards.map(c => (
          <div key={c.label} style={statCard}>
            <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>{c.value}</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{c.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* 최근 가입 */}
        <div style={panel}>
          <div style={panelTitle}>최근 가입</div>
          {recentSignups.length === 0
            ? <p style={empty}>없음</p>
            : recentSignups.map(u => (
              <div key={u.id} style={listRow}>
                <span style={{ fontWeight: 500 }}>{u.nickname}</span>
                <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>{u.created_at.slice(0, 10)}</span>
              </div>
            ))
          }
        </div>

        {/* 최근 업로드 */}
        <div style={panel}>
          <div style={panelTitle}>최근 업로드</div>
          {recentUploads.length === 0
            ? <p style={empty}>없음</p>
            : recentUploads.map((u, i) => (
              <div key={i} style={listRow}>
                <span style={{ fontWeight: 500 }}>{u.title ?? "(제목 없음)"}</span>
                <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>{u.type}</span>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
}

// ── 회원 관리 ──────────────────────────────────
function UsersTab({ users, searchQuery, setSearchQuery, selectedUser, loadingDetail, onSelect, onClose, onToggleActive, onChangePlan, onDelete }: {
  users: AdminUser[];
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  selectedUser: UserDetail | null;
  loadingDetail: boolean;
  onSelect: (id: number) => void;
  onClose: () => void;
  onToggleActive: (id: number) => void;
  onChangePlan: (id: number, plan: string) => void;
  onDelete: (id: number) => void;
}) {
  return (
    <div style={{ display: "flex", gap: 20 }}>
      {/* 목록 */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <h2 style={pageTitle}>회원 관리</h2>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>{users.length}명</span>
        </div>
        <input
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="닉네임 / 이메일 검색"
          style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, padding: "8px 12px", color: "#fff", fontSize: 13, marginBottom: 12, boxSizing: "border-box" }}
        />
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                {["ID", "닉네임", "이메일", "플랜", "상태", "가입일"].map(h => (
                  <th key={h} style={{ padding: "8px 10px", textAlign: "left", color: "rgba(255,255,255,0.35)", fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr
                  key={u.id}
                  onClick={() => onSelect(u.id)}
                  style={{
                    borderBottom: "1px solid rgba(255,255,255,0.05)",
                    cursor: "pointer",
                    background: selectedUser?.id === u.id ? "rgba(255,255,255,0.05)" : "transparent",
                  }}
                >
                  <td style={td}>{u.id}</td>
                  <td style={{ ...td, fontWeight: 500 }}>{u.nickname}</td>
                  <td style={{ ...td, color: "rgba(255,255,255,0.5)" }}>{u.email}</td>
                  <td style={td}><PlanBadge plan={u.subscription_plan} /></td>
                  <td style={td}>
                    <span style={{ color: u.is_active ? "#4ade80" : "#f87171", fontWeight: 600 }}>
                      {u.is_active ? "활성" : "비활성"}
                    </span>
                  </td>
                  <td style={{ ...td, color: "rgba(255,255,255,0.4)" }}>{u.created_at?.slice(0, 10)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 상세 패널 */}
      {(selectedUser || loadingDetail) && (
        <div style={{ width: 300, flexShrink: 0, ...panel, position: "sticky", top: 0, alignSelf: "flex-start" }}>
          {loadingDetail ? (
            <p style={empty}>불러오는 중...</p>
          ) : selectedUser ? (
            <UserDetailPanel
              user={selectedUser}
              onClose={onClose}
              onToggleActive={onToggleActive}
              onChangePlan={onChangePlan}
              onDelete={onDelete}
            />
          ) : null}
        </div>
      )}
    </div>
  );
}

// ── 회원 상세 패널 ──────────────────────────────
function UserDetailPanel({ user, onClose, onToggleActive, onChangePlan, onDelete }: {
  user: UserDetail;
  onClose: () => void;
  onToggleActive: (id: number) => void;
  onChangePlan: (id: number, plan: string) => void;
  onDelete: (id: number) => void;
}) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15 }}>{user.nickname}</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{user.email}</div>
        </div>
        <button onClick={onClose} style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: 16 }}>✕</button>
      </div>

      {user.thumbnail_url && (
        <img src={user.thumbnail_url} alt="" style={{ width: "100%", borderRadius: 6, marginBottom: 12, objectFit: "cover", maxHeight: 140 }} />
      )}

      <div style={{ fontSize: 12, marginBottom: 16 }}>
        {[
          ["실명", user.real_name],
          ["영문명", user.english_name],
          ["역할", user.role],
          ["플랜", user.subscription_plan],
          ["템플릿", `Template ${user.active_template}`],
          ["로그인", user.provider],
          ["가입일", user.created_at?.slice(0, 10)],
        ].map(([label, val]) => val ? (
          <div key={label as string} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            <span style={{ color: "rgba(255,255,255,0.4)" }}>{label}</span>
            <span>{val}</span>
          </div>
        ) : null)}
      </div>

      {/* 업로드 */}
      {user.uploads.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 6 }}>업로드 ({user.uploads.length})</div>
          {user.uploads.map((up, i) => (
            <div key={i} style={{ fontSize: 11, padding: "4px 0", color: "rgba(255,255,255,0.6)", display: "flex", gap: 6 }}>
              <span style={{ color: "rgba(255,255,255,0.3)" }}>{up.type}</span>
              <span>{up.title ?? "(제목없음)"}</span>
            </div>
          ))}
        </div>
      )}

      {/* 액션 */}
      <div style={{ marginBottom: 10 }}>
        <a
          href={`/artist/${user.id}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ ...actionBtn, display: "block", textAlign: "center", textDecoration: "none", borderColor: "rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.7)" }}
        >
          포트폴리오 보기 ↗
        </a>
      </div>

      {user.role !== "ADMIN" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <button
            onClick={() => onToggleActive(user.id)}
            style={{ ...actionBtn, borderColor: user.is_active ? "rgba(248,113,113,0.4)" : "rgba(74,222,128,0.4)", color: user.is_active ? "#f87171" : "#4ade80" }}
          >
            {user.is_active ? "비활성화" : "활성화"}
          </button>

          <div style={{ display: "flex", gap: 6 }}>
            {["free", "standard", "premium"].map(p => (
              <button
                key={p}
                onClick={() => onChangePlan(user.id, p)}
                style={{
                  ...actionBtn, flex: 1, fontSize: 10,
                  background: user.subscription_plan === p ? "rgba(255,255,255,0.1)" : "transparent",
                  borderColor: "rgba(255,255,255,0.15)",
                }}
              >
                {p}
              </button>
            ))}
          </div>

          <button onClick={() => onDelete(user.id)} style={{ ...actionBtn, borderColor: "rgba(248,113,113,0.3)", color: "rgba(248,113,113,0.7)", marginTop: 4 }}>
            계정 삭제
          </button>
        </div>
      )}
    </div>
  );
}

// ── 파일 관리 (Cloudinary 고아 파일) ──────────────
interface OrphanFile {
  public_id: string;
  resource_type: string;
  url: string;
  bytes: number;
  created_at: string;
}

function StorageTab({ authHeader }: { authHeader: { headers: { Authorization: string } } }) {
  const [scanning, setScanning] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [orphans, setOrphans] = useState<OrphanFile[] | null>(null);
  const [totalMb, setTotalMb] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [done, setDone] = useState<{ deleted: number; failed: string[] } | null>(null);

  const scan = async () => {
    setScanning(true);
    setOrphans(null);
    setDone(null);
    setSelected(new Set());
    const res = await axios.get(`${BACKEND_URL}/admin/cloudinary/orphans`, authHeader).catch(() => null);
    if (res) {
      setOrphans(res.data.orphans);
      setTotalMb(res.data.total_mb);
      setSelected(new Set(res.data.orphans.map((o: OrphanFile) => o.public_id)));
    }
    setScanning(false);
  };

  const toggleSelect = (pid: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(pid) ? next.delete(pid) : next.add(pid);
      return next;
    });
  };

  const deleteSelected = async () => {
    if (!confirm(`선택한 ${selected.size}개 파일을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) return;
    setDeleting(true);
    const res = await axios.delete(`${BACKEND_URL}/admin/cloudinary/orphans`, {
      ...authHeader,
      data: { public_ids: Array.from(selected) },
    }).catch(() => null);
    if (res) {
      setDone(res.data);
      setOrphans(prev => prev ? prev.filter(o => !selected.has(o.public_id)) : null);
      setSelected(new Set());
    }
    setDeleting(false);
  };

  return (
    <div>
      <h2 style={pageTitle}>파일 관리</h2>
      <div style={{ marginBottom: 20, display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={scan} disabled={scanning} style={{ ...actionBtn, width: "auto", padding: "8px 20px", fontSize: 13 }}>
          {scanning ? "스캔 중..." : "고아 파일 스캔"}
        </button>
        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>
          DB에 없는 Cloudinary 파일을 찾습니다
        </span>
      </div>

      {done && (
        <div style={{ ...panel, marginBottom: 16, borderColor: "rgba(74,222,128,0.3)" }}>
          <span style={{ fontSize: 13, color: "#4ade80" }}>✓ {done.deleted}개 삭제 완료</span>
          {done.failed.length > 0 && <span style={{ fontSize: 12, color: "#f87171", marginLeft: 12 }}>실패: {done.failed.length}개</span>}
        </div>
      )}

      {orphans !== null && (
        orphans.length === 0 ? (
          <div style={panel}>
            <p style={{ ...empty, color: "#4ade80" }}>고아 파일이 없습니다. 깨끗해요!</p>
          </div>
        ) : (
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>
                총 <strong style={{ color: "#fff" }}>{orphans.length}개</strong> / <strong style={{ color: "#f87171" }}>{totalMb} MB</strong>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => setSelected(new Set(orphans.map(o => o.public_id)))}
                  style={{ ...actionBtn, width: "auto", padding: "5px 12px", fontSize: 11 }}
                >
                  전체 선택
                </button>
                <button
                  onClick={deleteSelected}
                  disabled={deleting || selected.size === 0}
                  style={{ ...actionBtn, width: "auto", padding: "5px 14px", fontSize: 11, borderColor: "rgba(248,113,113,0.5)", color: "#f87171" }}
                >
                  {deleting ? "삭제 중..." : `선택 삭제 (${selected.size}개)`}
                </button>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {orphans.map(o => (
                <div
                  key={o.public_id}
                  onClick={() => toggleSelect(o.public_id)}
                  style={{
                    ...panel, padding: "10px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: 12,
                    borderColor: selected.has(o.public_id) ? "rgba(248,113,113,0.4)" : "rgba(255,255,255,0.08)",
                    background: selected.has(o.public_id) ? "rgba(248,113,113,0.05)" : "rgba(255,255,255,0.03)",
                  }}
                >
                  <input type="checkbox" checked={selected.has(o.public_id)} onChange={() => {}} style={{ flexShrink: 0 }} />
                  {o.resource_type === "image" && (
                    <img src={o.url} alt="" style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 4, flexShrink: 0 }} />
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {o.public_id}
                    </div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>
                      {o.resource_type} · {(o.bytes / 1024).toFixed(1)} KB · {o.created_at.slice(0, 10)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      )}
    </div>
  );
}

// ── 메인페이지 관리 ──────────────────────────────
function MainPageTab({
  authHeader,
  users,
}: {
  authHeader: { headers: { Authorization: string } };
  users: AdminUser[];
}) {
  const [settings, setSettings] = useState<AdminMainPageSettings | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [saveResult, setSaveResult] = useState<Record<string, "ok" | "err" | null>>({
    text: null, spotlight: null, cards: null,
  });

  const emptyText = { hero_title: "", hero_subtitle: "", hero_bg1_url: "", hero_bg2_url: "", discover_subtitle: "", cta_title: "", cta_subtitle: "" };
  const emptySpot = { subtitle: "", artist_id: "" as string, image_url: "", title: "", artist_name: "", genre: "" };
  const emptyCards = [1, 2, 3, 4].map((s) => ({ slot_order: s, artist_id: "", image_url: "" }));

  const [textForm, setTextForm] = useState(emptyText);
  const [savedText, setSavedText] = useState(emptyText);

  const [spotForm, setSpotForm] = useState(emptySpot);
  const [savedSpot, setSavedSpot] = useState(emptySpot);

  const [cardForms, setCardForms] = useState(emptyCards);
  const [savedCards, setSavedCards] = useState(emptyCards);

  const isTextDirty = JSON.stringify(textForm) !== JSON.stringify(savedText);
  const isSpotDirty = JSON.stringify(spotForm) !== JSON.stringify(savedSpot);
  const isCardsDirty = JSON.stringify(cardForms) !== JSON.stringify(savedCards);

  const notify = (key: string, ok: boolean) => {
    setSaveResult((p) => ({ ...p, [key]: ok ? "ok" : "err" }));
    setTimeout(() => setSaveResult((p) => ({ ...p, [key]: null })), 2500);
  };

  const applyData = (data: AdminMainPageSettings) => {
    setSettings(data);
    const t = {
      hero_title: data.content.hero_title,
      hero_subtitle: data.content.hero_subtitle,
      hero_bg1_url: data.content.hero_bg1_url ?? "",
      hero_bg2_url: data.content.hero_bg2_url ?? "",
      discover_subtitle: data.content.discover_subtitle,
      cta_title: data.content.cta_title,
      cta_subtitle: data.content.cta_subtitle,
    };
    const s = {
      subtitle: data.spotlight.subtitle,
      artist_id: data.spotlight.artist_id ? String(data.spotlight.artist_id) : "",
      image_url: data.spotlight.image_url ?? "",
      title: data.spotlight.title ?? "",
      artist_name: data.spotlight.artist_name ?? "",
      genre: data.spotlight.genre ?? "",
    };
    const c = [1, 2, 3, 4].map((slot) => {
      const existing = data.cards.find((card) => card.slot_order === slot);
      return { slot_order: slot, artist_id: existing?.artist_id ? String(existing.artist_id) : "", image_url: existing?.image_url ?? "" };
    });
    setTextForm(t); setSavedText(t);
    setSpotForm(s); setSavedSpot(s);
    setCardForms(c); setSavedCards(c);
  };

  const fetchSettings = async () => {
    const res = await axios.get(`${BACKEND_URL}/admin/main-page`, authHeader).catch(() => null);
    if (res) applyData(res.data);
  };

  useEffect(() => { fetchSettings(); }, []);

  const saveText = async () => {
    setSaving("text");
    const ok = await axios.patch(`${BACKEND_URL}/admin/main-page/content`, textForm, authHeader).then(() => true).catch(() => false);
    setSaving(null);
    if (ok) setSavedText(textForm);
    notify("text", ok);
  };

  const saveSpotlight = async () => {
    setSaving("spotlight");
    const body: Record<string, unknown> = {
      subtitle: spotForm.subtitle,
      image_url: spotForm.image_url || null,
      title: spotForm.title || null,
      artist_name: spotForm.artist_name || null,
      genre: spotForm.genre || null,
    };
    if (spotForm.artist_id) { body.artist_id = Number(spotForm.artist_id); }
    else { body.clear_artist = true; }
    const ok = await axios.patch(`${BACKEND_URL}/admin/main-page/spotlight`, body, authHeader).then(() => true).catch(() => false);
    if (ok) { const res = await axios.get(`${BACKEND_URL}/admin/main-page`, authHeader).catch(() => null); if (res) applyData(res.data); }
    setSaving(null);
    notify("spotlight", ok);
  };

  const saveCards = async () => {
    setSaving("cards");
    const cards = cardForms.filter((c) => c.artist_id || c.image_url).map((c) => ({
      slot_order: c.slot_order, artist_id: c.artist_id ? Number(c.artist_id) : null, image_url: c.image_url || null,
    }));
    const ok = await axios.patch(`${BACKEND_URL}/admin/main-page/discover-cards`, { cards }, authHeader).then(() => true).catch(() => false);
    if (ok) { const res = await axios.get(`${BACKEND_URL}/admin/main-page`, authHeader).catch(() => null); if (res) applyData(res.data); }
    setSaving(null);
    notify("cards", ok);
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 6, padding: "8px 10px", color: "#fff", fontSize: 12, boxSizing: "border-box",
  };
  const labelStyle: React.CSSProperties = {
    fontSize: 11, color: "rgba(255,255,255,0.4)", display: "block", marginBottom: 4,
  };

  const SaveButton = ({ sKey, dirty, onClick }: { sKey: string; dirty: boolean; onClick: () => void }) => {
    const isSaving = saving === sKey;
    const result = saveResult[sKey];
    const label = isSaving ? "저장 중..." : result === "ok" ? "✓ 저장 완료" : result === "err" ? "✗ 저장 실패" : dirty ? "저장" : "변경 없음";
    const borderColor = isSaving ? "rgba(255,255,255,0.1)" : result === "ok" ? "rgba(74,222,128,0.7)" : result === "err" ? "rgba(248,113,113,0.7)" : dirty ? "rgba(74,222,128,0.5)" : "rgba(255,255,255,0.1)";
    const color = isSaving ? "rgba(255,255,255,0.3)" : result === "ok" ? "#4ade80" : result === "err" ? "#f87171" : dirty ? "#4ade80" : "rgba(255,255,255,0.25)";
    return (
      <button
        onClick={onClick}
        disabled={isSaving || (!dirty && !result)}
        style={{ ...actionBtn, width: "auto", padding: "7px 18px", fontSize: 12, marginTop: 12, borderColor, color, cursor: (isSaving || (!dirty && !result)) ? "default" : "pointer" }}
      >
        {label}
      </button>
    );
  };

  const userOptions = users.filter((u) => u.role !== "ADMIN");

  return (
    <div>
      <h2 style={pageTitle}>메인페이지 관리</h2>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

        {/* ① 텍스트 편집 */}
        <div style={panel}>
          <div style={panelTitle}>텍스트 편집</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {([
              { key: "hero_title", label: "Hero 제목" },
              { key: "hero_bg1_url", label: "배경 이미지 1 URL (레이어 1)" },
              { key: "hero_bg2_url", label: "배경 이미지 2 URL (레이어 2)" },
              { key: "discover_subtitle", label: "Discover 서브타이틀" },
              { key: "cta_subtitle", label: "CTA 부제" },
            ] as { key: keyof typeof textForm; label: string }[]).map(({ key, label }) => (
              <div key={key}>
                <label style={labelStyle}>{label}</label>
                <input
                  style={inputStyle}
                  value={textForm[key]}
                  onChange={(e) => setTextForm((p) => ({ ...p, [key]: e.target.value }))}
                />
              </div>
            ))}
            {([
              { key: "hero_subtitle", label: "Hero 부제 (\\n으로 줄바꿈)" },
              { key: "cta_title", label: "CTA 제목 (\\n으로 줄바꿈)" },
            ] as { key: keyof typeof textForm; label: string }[]).map(({ key, label }) => (
              <div key={key}>
                <label style={labelStyle}>{label}</label>
                <textarea
                  style={{ ...inputStyle, resize: "vertical", minHeight: 64 }}
                  value={textForm[key]}
                  onChange={(e) => setTextForm((p) => ({ ...p, [key]: e.target.value }))}
                />
              </div>
            ))}
          </div>
          <SaveButton sKey="text" dirty={isTextDirty} onClick={saveText} />
        </div>

        {/* ② Spotlight 앨범 */}
        <div style={panel}>
          <div style={panelTitle}>Spotlight 앨범</div>
          <div style={{ display: "flex", gap: 16 }}>
            {/* 미리보기 */}
            <div style={{ flexShrink: 0 }}>
              {settings?.spotlight.resolved_url ? (
                <img
                  src={settings.spotlight.resolved_url}
                  alt="spotlight"
                  style={{ width: 100, height: 100, objectFit: "cover", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)" }}
                />
              ) : (
                <div style={{ width: 100, height: 100, borderRadius: 8, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>미리보기</span>
                </div>
              )}
            </div>

            {/* 폼 */}
            <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div>
                <label style={labelStyle}>서브타이틀</label>
                <input style={inputStyle} value={spotForm.subtitle}
                  onChange={(e) => setSpotForm((p) => ({ ...p, subtitle: e.target.value }))} />
              </div>
              <div>
                <label style={labelStyle}>아티스트 선택 (썸네일 자동 적용)</label>
                <select
                  style={{ ...inputStyle, cursor: "pointer" }}
                  value={spotForm.artist_id}
                  onChange={(e) => setSpotForm((p) => ({ ...p, artist_id: e.target.value }))}
                >
                  <option value="">-- 직접 입력 --</option>
                  {userOptions.map((u) => (
                    <option key={u.id} value={String(u.id)}>
                      {u.nickname} ({u.email})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>직접 이미지 URL (아티스트 미선택 시)</label>
                <input style={inputStyle} value={spotForm.image_url}
                  onChange={(e) => setSpotForm((p) => ({ ...p, image_url: e.target.value }))}
                  placeholder="https://..." />
              </div>
              <div>
                <label style={labelStyle}>제목</label>
                <input style={inputStyle} value={spotForm.title}
                  onChange={(e) => setSpotForm((p) => ({ ...p, title: e.target.value }))} />
              </div>
              <div>
                <label style={labelStyle}>아티스트명 (표시용)</label>
                <input style={inputStyle} value={spotForm.artist_name}
                  onChange={(e) => setSpotForm((p) => ({ ...p, artist_name: e.target.value }))} />
              </div>
              <div>
                <label style={labelStyle}>장르</label>
                <input style={inputStyle} value={spotForm.genre}
                  onChange={(e) => setSpotForm((p) => ({ ...p, genre: e.target.value }))} />
              </div>
            </div>
          </div>
          <SaveButton sKey="spotlight" dirty={isSpotDirty} onClick={saveSpotlight} />
        </div>

        {/* ③ Discover 카드 4개 */}
        <div style={panel}>
          <div style={panelTitle}>Discover 카드 (슬롯 1~4)</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {cardForms.map((card, idx) => {
              const resolvedUrl = settings?.cards.find((c) => c.slot_order === card.slot_order)?.resolved_url;
              return (
                <div key={card.slot_order} style={{ ...panel, display: "flex", gap: 10, padding: 12 }}>
                  {/* 미리보기 */}
                  {resolvedUrl ? (
                    <img src={resolvedUrl} alt={`slot${card.slot_order}`}
                      style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 6, flexShrink: 0, border: "1px solid rgba(255,255,255,0.1)" }} />
                  ) : (
                    <div style={{ width: 64, height: 64, borderRadius: 6, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>슬롯{card.slot_order}</span>
                    </div>
                  )}
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                    <div>
                      <label style={labelStyle}>슬롯 {card.slot_order} — 아티스트 선택</label>
                      <select
                        style={{ ...inputStyle, cursor: "pointer" }}
                        value={card.artist_id}
                        onChange={(e) => setCardForms((prev) => prev.map((c, i) => i === idx ? { ...c, artist_id: e.target.value } : c))}
                      >
                        <option value="">-- 직접 입력 --</option>
                        {userOptions.map((u) => (
                          <option key={u.id} value={String(u.id)}>
                            {u.nickname}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>직접 이미지 URL</label>
                      <input
                        style={inputStyle}
                        value={card.image_url}
                        placeholder="https://..."
                        onChange={(e) => setCardForms((prev) => prev.map((c, i) => i === idx ? { ...c, image_url: e.target.value } : c))}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <SaveButton sKey="cards" dirty={isCardsDirty} onClick={saveCards} />
        </div>

      </div>
    </div>
  );
}

// ── 공통 컴포넌트 ──────────────────────────────
function PlanBadge({ plan }: { plan: string }) {
  const key = plan.toLowerCase();
  const colors: Record<string, string> = {
    premium: "#ffc800", standard: "#60a5fa", free: "rgba(255,255,255,0.3)",
  };
  return (
    <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 3, border: `1px solid ${colors[key] ?? "rgba(255,255,255,0.2)"}`, color: colors[key] ?? "rgba(255,255,255,0.4)" }}>
      {key.toUpperCase()}
    </span>
  );
}

// ── 스타일 상수 ──────────────────────────────
const pageTitle: React.CSSProperties = { fontSize: 18, fontWeight: 700, margin: "0 0 20px" };
const statCard: React.CSSProperties = {
  background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 8, padding: "16px 18px",
};
const panel: React.CSSProperties = {
  background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 8, padding: 16,
};
const panelTitle: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.5)", marginBottom: 10, letterSpacing: "0.05em" };
const listRow: React.CSSProperties = {
  display: "flex", justifyContent: "space-between", alignItems: "center",
  padding: "7px 0", borderBottom: "1px solid rgba(255,255,255,0.05)", fontSize: 12,
};
const empty: React.CSSProperties = { fontSize: 12, color: "rgba(255,255,255,0.3)", margin: 0 };
const td: React.CSSProperties = { padding: "9px 10px", color: "rgba(255,255,255,0.8)" };
const ghostBtn: React.CSSProperties = {
  width: "100%", background: "transparent", border: "1px solid rgba(255,255,255,0.1)",
  color: "rgba(255,255,255,0.5)", padding: "7px 10px", borderRadius: 5, cursor: "pointer", fontSize: 11,
};
const actionBtn: React.CSSProperties = {
  background: "transparent", border: "1px solid rgba(255,255,255,0.15)",
  color: "rgba(255,255,255,0.7)", padding: "6px 10px", borderRadius: 5, cursor: "pointer", fontSize: 11, width: "100%",
};
