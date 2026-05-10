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

type Tab = "dashboard" | "users";

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
    if (tab === "users" && users.length === 0) fetchUsers();
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
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, subscription_plan: plan } : u));
    if (selectedUser?.id === userId) setSelectedUser(prev => prev ? { ...prev, subscription_plan: plan } : null);
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

// ── 공통 컴포넌트 ──────────────────────────────
function PlanBadge({ plan }: { plan: string }) {
  const colors: Record<string, string> = {
    premium: "#ffc800", standard: "#60a5fa", free: "rgba(255,255,255,0.3)",
  };
  return (
    <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 3, border: `1px solid ${colors[plan] ?? "rgba(255,255,255,0.2)"}`, color: colors[plan] ?? "rgba(255,255,255,0.4)" }}>
      {plan}
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
