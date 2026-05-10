import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { BACKEND_URL } from "../lib/api";
import { useAuthGuard } from "../hooks/useAuthGuard";

function Eye() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );
}

function EyeOff() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );
}

const PLAN_LABEL: Record<string, string> = {
  free: "Free",
  standard: "Standard",
  premium: "Premium",
};

export default function MyPage() {
  useAuthGuard();
  const navigate = useNavigate();
  const [nickname, setNickname] = useState<string>("");
  const [token, setToken] = useState<string>("");
  const [plan, setPlan] = useState<string>("free");
  const [provider, setProvider] = useState<string>("");
  const [userId, setUserId] = useState<string>(localStorage.getItem("user_id") || "");
  const isAdmin = localStorage.getItem("role")?.toUpperCase() === "ADMIN";

  const [showNicknameModal, setShowNicknameModal] = useState(false);
  const [newNickname, setNewNickname] = useState("");
  const [nicknameLoading, setNicknameLoading] = useState(false);
  const [nicknameError, setNicknameError] = useState("");

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentPwError, setCurrentPwError] = useState("");
  const [confirmError, setConfirmError] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  useEffect(() => {
    const t = localStorage.getItem("token") || "";
    const n = localStorage.getItem("nickname") || "";
    setToken(t);
    setNickname(n);
    if (!t) { navigate("/"); return; }

    axios
      .get(`${BACKEND_URL}/payment/my-plan`, {
        headers: { Authorization: `Bearer ${t}` },
      })
      .then((res) => {
        const data = res.data as { plan: string };
        setPlan(data.plan);
      })
      .catch(() => {});

    axios
      .get(`${BACKEND_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${t}` },
      })
      .then((res) => {
        const data = res.data as { provider: string; user_id: number };
        setProvider(data.provider);
        if (data.user_id) {
          localStorage.setItem("user_id", String(data.user_id));
          setUserId(String(data.user_id));
        }
      })
      .catch(() => {});
  }, [navigate]);

  const closeNicknameModal = () => {
    setShowNicknameModal(false);
    setNewNickname("");
    setNicknameError("");
  };

  const handleChangeNickname = async () => {
    if (!newNickname.trim()) {
      setNicknameError("닉네임을 입력해주세요.");
      return;
    }
    setNicknameLoading(true);
    try {
      await axios.post(
        `${BACKEND_URL}/auth/update-nickname`,
        { nickname: newNickname.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      localStorage.setItem("nickname", newNickname.trim());
      setNickname(newNickname.trim());
      closeNicknameModal();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setNicknameError(err.response?.data?.detail || "오류가 발생했습니다.");
      }
    } finally {
      setNicknameLoading(false);
    }
  };

  const closePasswordModal = () => {
    setShowPasswordModal(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setCurrentPwError("");
    setConfirmError("");
    setShowCurrentPw(false);
    setShowNewPw(false);
    setShowConfirmPw(false);
  };

  const handleCurrentPwBlur = async () => {
    if (!currentPassword) return;
    try {
      await axios.post(
        `${BACKEND_URL}/auth/verify-password`,
        { password: currentPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCurrentPwError("");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setCurrentPwError(err.response?.data?.detail || "현재 비밀번호가 틀렸습니다.");
      }
    }
  };

  const handleConfirmBlur = () => {
    if (!confirmPassword) return;
    if (newPassword.length < 6) {
      setConfirmError("새 비밀번호는 6자 이상이어야 합니다.");
    } else if (newPassword !== confirmPassword) {
      setConfirmError("비밀번호가 일치하지 않습니다.");
    } else {
      setConfirmError("");
    }
  };

  const handleChangePassword = async () => {
    setCurrentPwError("");
    if (newPassword !== confirmPassword) {
      setConfirmError("비밀번호가 일치하지 않습니다.");
      return;
    }
    if (newPassword.length < 6) {
      setConfirmError("새 비밀번호는 6자 이상이어야 합니다.");
      return;
    }
    setPasswordLoading(true);
    try {
      await axios.put(
        `${BACKEND_URL}/auth/change-password`,
        { current_password: currentPassword, new_password: newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      closePasswordModal();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const detail = err.response?.data?.detail || "오류가 발생했습니다.";
        if (detail.includes("현재 비밀번호")) {
          setCurrentPwError(detail);
        } else {
          setConfirmError(detail);
        }
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
    window.location.reload();
  };

  return (
    <div className="mypage">
      <style>{css}</style>

      <header className="topbar">
        <div className="topbar__inner">
          <div className="logo" onClick={() => navigate("/")} role="button" tabIndex={0}>
            SEIHI
          </div>
          <div className="right">
            <button className="btn btn--ghost" type="button" onClick={() => navigate("/")}>
              Home
            </button>
            <button className="btn btn--ghost" type="button" onClick={handleLogout}>
              LogOut
            </button>
          </div>
        </div>
      </header>

      <main className="container">
        <h1 className="title">My Page</h1>
        <p className="sub">내 정보 / 활동을 관리하는 공간</p>

        <section className="card">
          <div className="card__head">
            <div className="avatar" />
            <div style={{ flex: 1 }}>
              <div className="label">Nickname</div>
              <div className="value" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                {nickname || "Unknown"}
                <span style={{
                  fontSize: "10px", fontWeight: 900, letterSpacing: ".1em",
                  padding: "3px 9px", borderRadius: "999px",
                  background: plan === "premium" ? "rgba(255,215,0,.15)" : plan === "standard" ? "rgba(255,255,255,.12)" : "rgba(255,255,255,.07)",
                  color: plan === "premium" ? "#f5c842" : plan === "standard" ? "rgba(255,255,255,.8)" : "rgba(255,255,255,.4)",
                  border: plan === "premium" ? "1px solid rgba(245,200,66,.3)" : "1px solid rgba(255,255,255,.14)",
                }}>
                  {PLAN_LABEL[plan] ?? "Free"}
                </span>
              </div>
            </div>
          </div>
          <div className="divider" />
          <div className="grid">
            <div className="box">
              <div className="box__label">Account</div>
              <div className="box__value">{token ? "Logged in" : "Guest"}</div>
            </div>
            <div className="box">
              <div className="box__label">Portfolio</div>
              <div className="box__value">Coming soon</div>
            </div>
            <div className="box">
              <div className="box__label">Uploads</div>
              <div className="box__value">0</div>
            </div>
            <div className="box">
              <div className="box__label">Likes</div>
              <div className="box__value">0</div>
            </div>
          </div>
          <div className="actions">
            <button className="btn btn--primary" type="button" onClick={() => navigate("/mypage/edit")}>
              Edit profile
            </button>
            <button className="btn btn--ghost" type="button" onClick={() => setShowNicknameModal(true)}>
              Change Nickname
            </button>
            <button className="btn btn--ghost" type="button" onClick={() => {
              if (userId) navigate(`/artist/${userId}`);
            }}>
              My portfolio
            </button>
            {provider === "local" && (
              <button className="btn btn--ghost" type="button" onClick={() => setShowPasswordModal(true)}>
                Change Password
              </button>
            )}
            <button className="btn btn--ghost" type="button" onClick={() => navigate("/upgrade")}
              style={{ borderColor: "rgba(255,255,255,.35)" }}>
              ✦ Upgrade Plan
            </button>
            {isAdmin && (
              <button className="btn btn--ghost" type="button" onClick={() => navigate("/admin")}
                style={{ borderColor: "rgba(255,200,0,.4)", color: "#ffc800" }}>
                Admin
              </button>
            )}
          </div>
        </section>
      </main>

      {showNicknameModal && (
        <div className="modal-overlay" onClick={closeNicknameModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal__title">닉네임 변경</h2>
            <div className="modal__fields">
              <div className="field-wrap">
                <input
                  className="modal__input"
                  type="text"
                  placeholder="새 닉네임"
                  value={newNickname}
                  onChange={(e) => { setNewNickname(e.target.value); setNicknameError(""); }}
                  onKeyDown={(e) => e.key === "Enter" && handleChangeNickname()}
                />
              </div>
              {nicknameError && <p className="field-err">{nicknameError}</p>}
            </div>
            <div className="modal__actions">
              <button className="btn btn--ghost" type="button" onClick={closeNicknameModal}>
                취소
              </button>
              <button className="btn btn--primary" type="button" onClick={handleChangeNickname} disabled={nicknameLoading}>
                {nicknameLoading ? "변경 중..." : "변경하기"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showPasswordModal && (
        <div className="modal-overlay" onClick={closePasswordModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal__title">비밀번호 변경</h2>
            <div className="modal__fields">
              <div className="field-wrap">
                <input
                  className="modal__input"
                  type={showCurrentPw ? "text" : "password"}
                  placeholder="현재 비밀번호"
                  value={currentPassword}
                  onChange={(e) => { setCurrentPassword(e.target.value); setCurrentPwError(""); }}
                  onBlur={handleCurrentPwBlur}
                />
                <button className="pw-eye" type="button" onClick={() => setShowCurrentPw((v) => !v)}>
                  {showCurrentPw ? <EyeOff /> : <Eye />}
                </button>
              </div>
              {currentPwError && <p className="field-err">{currentPwError}</p>}

              <div className="field-wrap">
                <input
                  className="modal__input"
                  type={showNewPw ? "text" : "password"}
                  placeholder="새 비밀번호 (6자 이상)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <button className="pw-eye" type="button" onClick={() => setShowNewPw((v) => !v)}>
                  {showNewPw ? <EyeOff /> : <Eye />}
                </button>
              </div>

              <div className="field-wrap">
                <input
                  className="modal__input"
                  type={showConfirmPw ? "text" : "password"}
                  placeholder="새 비밀번호 확인"
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setConfirmError(""); }}
                  onBlur={handleConfirmBlur}
                />
                <button className="pw-eye" type="button" onClick={() => setShowConfirmPw((v) => !v)}>
                  {showConfirmPw ? <EyeOff /> : <Eye />}
                </button>
              </div>
              {confirmError && <p className="field-err">{confirmError}</p>}
            </div>
            <div className="modal__actions">
              <button className="btn btn--ghost" type="button" onClick={closePasswordModal}>
                취소
              </button>
              <button className="btn btn--primary" type="button" onClick={handleChangePassword} disabled={passwordLoading}>
                {passwordLoading ? "변경 중..." : "변경하기"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const css = `
:root{ --text:#f2f2f2; --line: rgba(255,255,255,.10); }
*{ box-sizing:border-box; }
html, body{ height:100%; }
body{ margin:0; color:var(--text); background:#0a0a0a; font-family:"Pretendard","Noto Sans KR",system-ui,-apple-system,Segoe UI,Roboto,sans-serif; }
.mypage{ min-height:100vh; }
.topbar{ position:sticky; top:0; z-index:50; background: rgba(0,0,0,.78); backdrop-filter: blur(10px); border-bottom: 1px solid var(--line); }
.topbar__inner{ max-width: 1200px; margin: 0 auto; padding: 14px 18px; display:flex; align-items:center; justify-content:space-between; gap: 16px; }
.logo{ font-weight:900; letter-spacing:.12em; font-size: 18px; white-space:nowrap; cursor:pointer; }
.right{ display:flex; gap:8px; align-items:center; }
.btn{ border: 1px solid rgba(255,255,255,.18); background: transparent; color: #fff; padding: 8px 10px; border-radius: 6px; cursor: pointer; font-weight: 800; font-size: 12px; }
.btn--primary{ background:#fff; color:#000; border-color:#fff; }
.btn--ghost{ background: rgba(255,255,255,.06); }
.container{ max-width: 980px; margin: 0 auto; padding: 40px 16px 80px; }
.title{ margin: 0; font-size: 34px; font-weight: 900; letter-spacing: -0.02em; }
.sub{ margin: 10px 0 22px; font-size: 12px; color: rgba(255,255,255,.62); }
.card{ border: 1px solid rgba(255,255,255,.14); background: rgba(255,255,255,.04); border-radius: 16px; box-shadow: 0 18px 40px rgba(0,0,0,.55); padding: 20px; }
.card__head{ display:flex; align-items:center; gap: 14px; }
.avatar{ width: 54px; height: 54px; border-radius: 999px; border: 1px solid rgba(255,255,255,.16); background: radial-gradient(circle at 30% 30%, rgba(255,255,255,.18), rgba(255,255,255,.02)); }
.label{ font-size: 11px; color: rgba(255,255,255,.65); font-weight: 800; }
.value{ margin-top: 2px; font-size: 18px; font-weight: 900; }
.divider{ height:1px; background: rgba(255,255,255,.10); margin: 16px 0; }
.grid{ display:grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
.box{ border: 1px solid rgba(255,255,255,.12); background: rgba(0,0,0,.22); border-radius: 14px; padding: 14px; }
.box__label{ font-size: 10px; color: rgba(255,255,255,.58); font-weight: 900; letter-spacing: .12em; text-transform: uppercase; }
.box__value{ margin-top: 8px; font-size: 14px; font-weight: 900; }
.actions{ margin-top: 16px; display:flex; gap: 10px; flex-wrap: wrap; }
@media (max-width: 640px){ .grid{ grid-template-columns: 1fr; } }
.modal-overlay{ position:fixed; inset:0; background:rgba(0,0,0,.6); backdrop-filter:blur(4px); display:flex; align-items:center; justify-content:center; z-index:100; }
.modal{ background:#111; border:1px solid rgba(255,255,255,.14); border-radius:16px; padding:28px 24px; width:100%; max-width:380px; }
.modal__title{ margin:0 0 20px; font-size:18px; font-weight:900; }
.modal__fields{ display:flex; flex-direction:column; gap:10px; }
.field-wrap{ position:relative; }
.modal__input{ background:rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.14); border-radius:8px; padding:12px 42px 12px 14px; color:#fff; font-size:14px; outline:none; width:100%; box-sizing:border-box; }
.modal__input::placeholder{ color:rgba(255,255,255,.35); }
.modal__input:focus{ border-color:rgba(255,255,255,.4); }
.pw-eye{ position:absolute; right:12px; top:50%; transform:translateY(-50%); background:none; border:none; cursor:pointer; color:rgba(255,255,255,.4); padding:0; display:flex; align-items:center; }
.pw-eye:hover{ color:rgba(255,255,255,.8); }
.field-err{ margin:2px 0 0; font-size:12px; color:#ff6b6b; }
.modal__actions{ margin-top:20px; display:flex; gap:10px; justify-content:flex-end; }
`;
