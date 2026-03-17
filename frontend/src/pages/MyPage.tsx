import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function MyPage() {
  const navigate = useNavigate();
  const [nickname, setNickname] = useState<string>("");
  const [token, setToken] = useState<string>("");

  useEffect(() => {
    const t = localStorage.getItem("token") || "";
    const n = localStorage.getItem("nickname") || "";
    setToken(t);
    setNickname(n);
    if (!t) navigate("/");
  }, [navigate]);

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
            <div>
              <div className="label">Nickname</div>
              <div className="value">{nickname || "Unknown"}</div>
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
            <button className="btn btn--primary" type="button" onClick={() => alert("프로필 편집 기능은 추후 연결!")}>
              Edit profile
            </button>
            <button className="btn btn--ghost" type="button" onClick={() => alert("내 포트폴리오 기능은 추후 연결!")}>
              My portfolio
            </button>
          </div>
        </section>
      </main>
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
`;
