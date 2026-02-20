import React, { useEffect, useState } from "react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";

// ✅ 이미지 경로
import heroBg from "./images/background.png";
import d1 from "./images/discover1.png";
import d2 from "./images/discover2.png";
import d3 from "./images/discover3.png";
import d4 from "./images/discover4.png";
import spotlightImg from "./images/discover5.png";

const BACKEND_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:8000"
    : "https://port-0-artist-promotion-platform-backend-mk9v7xrma0e5b23b.sel3.cloudtype.app";

/**
 * ✅ Forgot Password API (백엔드에 맞게 경로만 바꾸면 됨)
 * - 1) 이메일로 OTP(또는 코드) 발송
 * - 2) OTP 검증
 * - 3) 새 비밀번호 설정
 *
 * 아래 기본값은 “가장 흔한” 패턴으로 넣어둔 거고,
 * 실제 백엔드가 다른 이름이면 이 3개만 수정하면 됩니다.
 */
const FORGOT_API = {
  sendOtp: (email) => `${BACKEND_URL}/auth/forgot-password/send-otp?email=${encodeURIComponent(email)}`,
  verifyOtp: () => `${BACKEND_URL}/auth/forgot-password/verify-otp`,
  resetPassword: () => `${BACKEND_URL}/auth/forgot-password/reset`,
};

export default function Main() {
  // ===== 로그인/가입 기능 상태 =====
  const [user, setUser] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNicknameModalOpen, setIsNicknameModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState("signin"); // signin | signup | forgot

  const [userEmail, setUserEmail] = useState("");
  const [userPw, setUserPw] = useState("");

  const [newNickname, setNewNickname] = useState("");
  const [isNicknameAvailable, setIsNicknameAvailable] = useState(false);

  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);

  // ===== Forgot Password 상태 =====
  const [fpEmail, setFpEmail] = useState("");
  const [fpOtp, setFpOtp] = useState("");
  const [fpNewPw, setFpNewPw] = useState("");
  const [fpOtpSent, setFpOtpSent] = useState(false);
  const [fpVerified, setFpVerified] = useState(false);
  const [fpBusy, setFpBusy] = useState(false);

  // (선택) /login 접근 시 로그인 모달 자동 오픈
  const location = useLocation();
  const navigate = useNavigate();

  // ===== 상단 직업군/소분류 =====
  const careerCategories = [
    { label: "Performer", items: ["보컬", "인디 싱어송라이터", "뮤지컬배우"] },
    {
      label: "Instrumentalist",
      items: ["기타리스트", "피아니스트", "드러머", "베이시스트", "오케스트라 연주자", "세션 연주자"],
    },
    {
      label: "Creator",
      items: ["대중음악 작곡가", "영화음악 작곡가", "게임음악 작곡가", "광고음악 작곡가", "비트메이커", "탑라이너"],
    },
    {
      label: "Sound Designer",
      items: ["사운드 디자이너", "폴리 아티스트", "인터랙티브 오디오 디자이너"],
    },
    {
      label: "Audio Engineer",
      items: ["레코딩 엔지니어", "믹싱/마스터링 엔지니어", "라이브 PA 엔지니어", "방송 음향 감독"],
    },
    { label: "Audio Programer", items: ["프론트엔드 개발자", "백엔드 개발자"] },
    {
      label: "Visual Aartist",
      items: ["미디어아트 작가", "미술 작가", "설치미술가", "공연 테크니컬 디렉터"],
    },
  ];

  // ===== 초기 로그인 유지 =====
  useEffect(() => {
    const token = localStorage.getItem("token");
    const nickname = localStorage.getItem("nickname");
    if (token && nickname && !nickname.startsWith("User_")) {
      setUser({ nickname });
    }
  }, []);

  useEffect(() => {
    if (location.pathname === "/login") {
      setAuthMode("signin");
      setIsModalOpen(true);
      navigate("/", { replace: true });
    }
  }, [location.pathname, navigate]);

  // ===== 유틸 =====
  const openAuth = (mode) => {
    setAuthMode(mode);
    setIsModalOpen(true);
  };

  const closeAuth = () => {
    setIsModalOpen(false);
    // forgot 상태는 닫을 때 초기화(원하면 제거 가능)
    setFpEmail("");
    setFpOtp("");
    setFpNewPw("");
    setFpOtpSent(false);
    setFpVerified(false);
    setFpBusy(false);
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.reload();
  };

  // ===== Google Login =====
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await axios.post(`${BACKEND_URL}/auth/google`, {
        token: credentialResponse.credential,
      });

      const { access_token, is_new_user, nickname, email } = res.data;

      localStorage.setItem("token", access_token);
      setUserEmail(email || "");

      if (is_new_user === true) {
        setIsModalOpen(false);
        setIsNicknameModalOpen(true);
      } else {
        localStorage.setItem("nickname", nickname);
        window.location.reload();
      }
    } catch (e) {
      alert("구글 로그인 실패: " + (e.response?.data?.detail || "알 수 없는 오류"));
    }
  };

  // ===== Nickname check/update =====
  const handleCheckNickname = async () => {
    if (!newNickname) return alert("닉네임을 입력해주세요.");
    try {
      const res = await axios.get(
        `${BACKEND_URL}/auth/check-nickname?nickname=${encodeURIComponent(newNickname)}`
      );
      setIsNicknameAvailable(res.data.available);
      alert(res.data.available ? "사용 가능한 닉네임입니다." : "이미 사용 중인 닉네임입니다.");
    } catch {
      alert("확인 중 오류가 발생했습니다.");
    }
  };

  const handleUpdateNickname = async () => {
    if (!isNicknameAvailable) return alert("닉네임 중복 확인을 해주세요.");
    try {
      await axios.post(`${BACKEND_URL}/auth/update-nickname`, {
        email: userEmail,
        nickname: newNickname,
      });
      localStorage.setItem("nickname", newNickname);
      alert("닉네임 설정이 완료되었습니다!");
      window.location.reload();
    } catch (e) {
      alert("저장 실패: " + (e.response?.data?.detail || "오류 발생"));
    }
  };

  // ===== Sign in =====
  const handleSignIn = async () => {
    try {
      const res = await axios.post(`${BACKEND_URL}/auth/login`, {
        email: userEmail,
        password: userPw,
      });
      localStorage.setItem("token", res.data.access_token);
      localStorage.setItem("nickname", res.data.nickname);
      window.location.reload();
    } catch (e) {
      alert(e.response?.data?.detail || "로그인 실패");
    }
  };

  // ===== Sign up (OTP) =====
  const handleSendOtp = async () => {
    try {
      await axios.post(`${BACKEND_URL}/auth/send-otp?email=${encodeURIComponent(userEmail)}`);
      setIsOtpSent(true);
      alert("인증번호 발송 완료");
    } catch {
      alert("발송 실패");
    }
  };

  const handleVerifyOtp = async () => {
    try {
      const res = await axios.post(`${BACKEND_URL}/auth/verify-otp`, { email: userEmail, otp });
      if (res.data.status === "verified") {
        setIsEmailVerified(true);
        alert("인증 성공");
      }
    } catch {
      alert("인증번호 오류");
    }
  };

  const handleSignUp = async () => {
    try {
      await axios.post(`${BACKEND_URL}/auth/signup`, {
        nickname: newNickname,
        email: userEmail,
        password: userPw,
      });
      alert("가입 성공!");
      setAuthMode("signin");
    } catch {
      alert("가입 실패");
    }
  };

  // ===== Forgot password (API 연결) =====
  const fpSendOtp = async () => {
    if (!fpEmail) return alert("이메일을 입력해주세요.");
    setFpBusy(true);
    try {
      await axios.post(FORGOT_API.sendOtp(fpEmail));
      setFpOtpSent(true);
      alert("비밀번호 재설정 인증코드를 발송했습니다.");
    } catch (e) {
      // API 이름이 다르면 여기서 터질 수 있음 → 메시지로 안내
      alert(
        "발송 실패: " +
          (e.response?.data?.detail ||
            "API 경로가 다를 수 있어요. Main.jsx의 FORGOT_API 경로를 백엔드에 맞게 수정하세요.")
      );
    } finally {
      setFpBusy(false);
    }
  };

  const fpVerifyOtp = async () => {
    if (!fpOtp) return alert("인증코드를 입력해주세요.");
    setFpBusy(true);
    try {
      const res = await axios.post(FORGOT_API.verifyOtp(), { email: fpEmail, otp: fpOtp });
      // 보통 {status:"verified"} / {verified:true} 둘 다 대응
      const ok = res.data?.status === "verified" || res.data?.verified === true;
      if (ok) {
        setFpVerified(true);
        alert("인증 성공");
      } else {
        alert("인증 실패");
      }
    } catch (e) {
      alert(
        "인증 실패: " +
          (e.response?.data?.detail ||
            "API 경로가 다를 수 있어요. Main.jsx의 FORGOT_API.verifyOtp를 확인하세요.")
      );
    } finally {
      setFpBusy(false);
    }
  };

  const fpResetPassword = async () => {
    if (!fpVerified) return alert("먼저 인증을 완료해주세요.");
    if (!fpNewPw || fpNewPw.length < 6) return alert("새 비밀번호를 6자 이상 입력해주세요.");
    setFpBusy(true);
    try {
      await axios.post(FORGOT_API.resetPassword(), { email: fpEmail, otp: fpOtp, new_password: fpNewPw });
      alert("비밀번호가 변경되었습니다. 다시 로그인해주세요.");
      // 로그인 모드로 복귀
      setAuthMode("signin");
      setUserEmail(fpEmail);
      setUserPw("");
      setFpEmail("");
      setFpOtp("");
      setFpNewPw("");
      setFpOtpSent(false);
      setFpVerified(false);
    } catch (e) {
      alert(
        "변경 실패: " +
          (e.response?.data?.detail ||
            "API 경로가 다를 수 있어요. Main.jsx의 FORGOT_API.resetPassword를 확인하세요.")
      );
    } finally {
      setFpBusy(false);
    }
  };

  // ===== Render =====
  return (
    <GoogleOAuthProvider clientId="163502629915-hnul9f78fgomial7ktg27rubjapt0vu4.apps.googleusercontent.com">
      <div className="page">
        <style>{css}</style>

        {/* TOP BAR */}
        <header className="topbar">
          <div className="topbar__inner">
            <div className="logo">SEIHI</div>

            <nav className="careerNav" aria-label="Career categories">
              {careerCategories.map((cat) => (
                <div className="careerNav__item" key={cat.label}>
                  <button className="careerNav__trigger" type="button">
                    {cat.label}
                  </button>

                  <div className="careerNav__dropdown" role="menu" aria-label={`${cat.label} subcategories`}>
                    {cat.items.map((name) => (
                      <button
                        key={name}
                        className="careerNav__sub"
                        type="button"
                        role="menuitem"
                        onClick={(e) => e.preventDefault()} // 아직 기능 없음
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </nav>

            <div className="auth">
              {user ? (
                <div className="auth__user">
                  <span className="nickname">
                    <strong>{user.nickname}</strong>님
                  </span>
                  <button className="btn btn--ghost" onClick={handleLogout} type="button">
                    LogOut
                  </button>
                </div>
              ) : (
                <>
                  <button className="btn btn--ghost" onClick={() => openAuth("signup")} type="button">
                    Sign Up
                  </button>
                  <button className="btn btn--primary" onClick={() => openAuth("signin")} type="button">
                    Log In
                  </button>
                </>
              )}
            </div>
          </div>
        </header>

        {/* HERO */}
        <main>
          <section className="hero">
            <div className="hero__image" style={{ backgroundImage: `url(${heroBg})` }} />
            <div className="hero__overlay" />
            <div className="hero__inner">
              <h1 className="hero__title">가치를 위한, 기록의 첫 걸음</h1>
              <p className="hero__desc">
                가격은 협상의 결과이고, 가치는 존재의 본질입니다. SEIHI는 아티스트의 가치를 지키는 플랫폼입니다.
                <br />
                영광스러운 첫 시작을 저희와 함께해주세요.
              </p>
            </div>
          </section>

          {/* DISCOVER */}
          <section className="discover">
            <div className="discover__inner">
              <h2 className="discover__title">
                DISCOVER <span className="discover__new">NEW</span> SOUNDS
              </h2>
              <p className="discover__sub">다양한 장르의 사운드를 한 화면에서</p>

              <div className="discover__row" aria-label="Discover cards">
                <div className="tile" style={{ backgroundImage: `url(${d1})` }} />
                <div className="tile is-strong" style={{ backgroundImage: `url(${d2})` }} />
                <div className="tile is-strong" style={{ backgroundImage: `url(${d3})` }} />
                <div className="tile" style={{ backgroundImage: `url(${d4})` }} />
              </div>
            </div>
          </section>

          {/* SPOTLIGHT */}
          <section className="spotlight">
            <div className="spotlight__inner">
              <h3 className="spotlight__title">Spotlight Album</h3>
              <p className="spotlight__sub">이번 달 가장 주목할 사운드 컬렉션</p>

              <div className="spotlight__card">
                <div className="spotlight__cover" style={{ backgroundImage: `url(${spotlightImg})` }} />
              </div>

              <div className="spotlight__meta">
                <div>Album / Portfolio Title</div>
                <div>Artist Name</div>
                <div>Role / Category</div>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="cta">
            <div className="cta__inner">
              <h3 className="cta__title">새로운 사운드를 만나는 가장 좋은 방식</h3>
              <p className="cta__sub">다양한 장르의 사운드 포트폴리오를 한 화면에서 탐색해보세요.</p>

              <div className="cta__actions">
                <button className="btn btn--primary" type="button">
                  Browse
                </button>
                <span className="cta__or">OR</span>
                <label className="searchbox">
                  <span className="srOnly">Search</span>
                  <input placeholder="Search by artist or genre" />
                </label>
              </div>

              <footer className="footer">
                <div className="footer__logo">SEIHI</div>
                <div className="footer__icons">
                  <span className="dot" />
                  <span className="dot" />
                  <span className="dot" />
                </div>
              </footer>
            </div>
          </section>
        </main>

        {/* ===== AUTH MODAL (PDF 느낌: Shell + Card + X) ===== */}
        {isModalOpen && (
          <div className="modalOverlay" onClick={closeAuth}>
            <div className="modalShell" onClick={(e) => e.stopPropagation()}>
              <button className="modalClose" type="button" onClick={closeAuth} aria-label="Close">
                ×
              </button>

              <div className="modalShell__title">
                {authMode === "signin" && "LOG IN"}
                {authMode === "signup" && "SIGN UP"}
                {authMode === "forgot" && "RESET PASSWORD"}
              </div>

              <div className="modalCard">
                <div className="modalBrand">SEIHI</div>

                {/* SIGN IN */}
                {authMode === "signin" && (
                  <>
                    <div className="field">
                      <div className="label">E-mail</div>
                      <input
                        className="inputModern"
                        type="email"
                        value={userEmail}
                        onChange={(e) => setUserEmail(e.target.value)}
                        placeholder="example@email.com"
                      />
                    </div>

                    <div className="field">
                      <div className="label">Password</div>
                      <input
                        className="inputModern"
                        type="password"
                        value={userPw}
                        onChange={(e) => setUserPw(e.target.value)}
                        placeholder="••••••••"
                      />
                    </div>

                    <button className="btnBlock" type="button" onClick={handleSignIn}>
                      Log In
                    </button>

                    <div className="rowBetween">
                      <button
                        className="linkBtn"
                        type="button"
                        onClick={() => {
                          setAuthMode("forgot");
                          setFpEmail(userEmail || "");
                        }}
                      >
                        Forgot password?
                      </button>

                      <button className="linkBtn" type="button" onClick={() => setAuthMode("signup")}>
                        Sign up
                      </button>
                    </div>

                    <div className="divider">
                      <span className="divider__line" />
                      <span className="divider__text">OR</span>
                      <span className="divider__line" />
                    </div>

                    <div className="googleWrap">
                      <GoogleLogin onSuccess={handleGoogleSuccess} />
                    </div>
                  </>
                )}

                {/* SIGN UP (기능 유지: nickname / email otp / password) */}
                {authMode === "signup" && (
                  <>
                    <div className="field">
                      <div className="label">Nickname</div>
                      <div className="inline">
                        <input
                          className="inputModern"
                          type="text"
                          value={newNickname}
                          onChange={(e) => {
                            setNewNickname(e.target.value);
                            setIsNicknameAvailable(false);
                          }}
                          placeholder="닉네임"
                        />
                        <button className="miniBtn" type="button" onClick={handleCheckNickname}>
                          중복확인
                        </button>
                      </div>
                      <div className={`hintLine ${isNicknameAvailable ? "ok" : ""}`}>
                        {isNicknameAvailable ? "사용 가능한 닉네임입니다." : "닉네임 중복 확인을 진행해주세요."}
                      </div>
                    </div>

                    <div className="field">
                      <div className="label">E-mail</div>
                      <div className="inline">
                        <input
                          className="inputModern"
                          type="email"
                          value={userEmail}
                          onChange={(e) => setUserEmail(e.target.value)}
                          placeholder="example@email.com"
                        />
                        <button className="miniBtn" type="button" onClick={handleSendOtp}>
                          인증발송
                        </button>
                      </div>
                    </div>

                    {isOtpSent && (
                      <div className="field">
                        <div className="label">OTP Code</div>
                        <div className="inline">
                          <input
                            className="inputModern"
                            type="text"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            placeholder="인증번호"
                          />
                          <button className="miniBtn" type="button" onClick={handleVerifyOtp}>
                            확인
                          </button>
                        </div>
                        <div className={`hintLine ${isEmailVerified ? "ok" : ""}`}>
                          {isEmailVerified ? "이메일 인증 완료" : "인증번호 확인을 완료해주세요."}
                        </div>
                      </div>
                    )}

                    <div className="field">
                      <div className="label">Password</div>
                      <input
                        className="inputModern"
                        type="password"
                        value={userPw}
                        onChange={(e) => setUserPw(e.target.value)}
                        placeholder="••••••••"
                      />
                    </div>

                    <button
                      className="btnBlock"
                      type="button"
                      onClick={handleSignUp}
                      disabled={!(isEmailVerified && isNicknameAvailable)}
                    >
                      Sign up!
                    </button>

                    <div className="rowBetween">
                      <button className="linkBtn" type="button" onClick={() => setAuthMode("signin")}>
                        Already have an account?
                      </button>
                      <span />
                    </div>
                  </>
                )}

                {/* FORGOT PASSWORD */}
                {authMode === "forgot" && (
                  <>
                    <div className="field">
                      <div className="label">E-mail</div>
                      <input
                        className="inputModern"
                        type="email"
                        value={fpEmail}
                        onChange={(e) => setFpEmail(e.target.value)}
                        placeholder="example@email.com"
                      />
                    </div>

                    <button className="btnBlock" type="button" onClick={fpSendOtp} disabled={fpBusy}>
                      {fpBusy ? "Sending..." : "Send code"}
                    </button>

                    {fpOtpSent && (
                      <>
                        <div className="field">
                          <div className="label">OTP Code</div>
                          <div className="inline">
                            <input
                              className="inputModern"
                              type="text"
                              value={fpOtp}
                              onChange={(e) => setFpOtp(e.target.value)}
                              placeholder="인증코드"
                            />
                            <button className="miniBtn" type="button" onClick={fpVerifyOtp} disabled={fpBusy}>
                              확인
                            </button>
                          </div>
                          <div className={`hintLine ${fpVerified ? "ok" : ""}`}>
                            {fpVerified ? "인증 완료" : "인증코드를 확인해주세요."}
                          </div>
                        </div>

                        <div className="field">
                          <div className="label">New Password</div>
                          <input
                            className="inputModern"
                            type="password"
                            value={fpNewPw}
                            onChange={(e) => setFpNewPw(e.target.value)}
                            placeholder="새 비밀번호(6자 이상)"
                            disabled={!fpVerified}
                          />
                        </div>

                        <button className="btnBlock" type="button" onClick={fpResetPassword} disabled={!fpVerified || fpBusy}>
                          Reset password
                        </button>
                      </>
                    )}

                    <div className="rowBetween">
                      <button className="linkBtn" type="button" onClick={() => setAuthMode("signin")}>
                        Back to login
                      </button>
                      <span />
                    </div>

                    <div className="smallNote">
                      * 만약 “발송 실패 / 인증 실패”가 뜨면, 백엔드의 실제 엔드포인트 이름과 다를 수 있어요.
                      <br />
                      그 경우 Main.jsx 상단의 <b>FORGOT_API</b> 경로만 맞춰주면 됩니다.
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 구글 신규 유저 닉네임 모달 (UI는 기존 톤 유지) */}
        {isNicknameModalOpen && (
          <div className="modalOverlay" onClick={() => {}}>
            <div className="modalShell" onClick={(e) => e.stopPropagation()}>
              <button
                className="modalClose"
                type="button"
                onClick={() => setIsNicknameModalOpen(false)}
                aria-label="Close"
              >
                ×
              </button>

              <div className="modalShell__title">WELCOME</div>

              <div className="modalCard">
                <div className="modalBrand">SEIHI</div>
                <div className="smallNote" style={{ marginTop: 0 }}>
                  마지막 단계입니다!<br />사용하실 닉네임을 설정해주세요.
                </div>

                <div className="field">
                  <div className="label">Nickname</div>
                  <div className="inline">
                    <input
                      className="inputModern"
                      type="text"
                      value={newNickname}
                      onChange={(e) => {
                        setNewNickname(e.target.value);
                        setIsNicknameAvailable(false);
                      }}
                      placeholder="새 닉네임"
                    />
                    <button className="miniBtn" type="button" onClick={handleCheckNickname}>
                      중복확인
                    </button>
                  </div>
                  <div className={`hintLine ${isNicknameAvailable ? "ok" : ""}`}>
                    {isNicknameAvailable ? "사용 가능한 닉네임입니다." : "닉네임 중복 확인을 진행해주세요."}
                  </div>
                </div>

                <button className="btnBlock" type="button" onClick={handleUpdateNickname} disabled={!isNicknameAvailable}>
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </GoogleOAuthProvider>
  );
}

const css = `
:root{
  --text:#f2f2f2;
  --line: rgba(255,255,255,.10);
}

*{ box-sizing:border-box; }
html, body{ height:100%; }
body{
  margin:0;
  color:var(--text);
  background:#0a0a0a;
  font-family:"Pretendard","Noto Sans KR",system-ui,-apple-system,Segoe UI,Roboto,sans-serif;
}

.page{ min-height:100vh; }

.srOnly{
  position:absolute !important;
  width:1px; height:1px;
  padding:0; margin:-1px;
  overflow:hidden; clip:rect(0,0,0,0);
  white-space:nowrap; border:0;
}

/* TOPBAR */
.topbar{
  position:sticky; top:0; z-index:50;
  background: rgba(0,0,0,.78);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--line);
}
.topbar__inner{
  max-width: 1200px;
  margin: 0 auto;
  padding: 14px 18px;
  display:flex;
  align-items:center;
  gap: 16px;
}
.logo{
  font-weight:900;
  letter-spacing:.12em;
  font-size: 18px;
  white-space:nowrap;
}
.auth{ display:flex; gap:8px; align-items:center; }
.auth__user{ display:flex; gap:10px; align-items:center; }
.nickname{ font-size:13px; opacity:.95; }

.btn{
  border: 1px solid rgba(255,255,255,.18);
  background: transparent;
  color: #fff;
  padding: 8px 10px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 800;
  font-size: 12px;
}
.btn--primary{
  background:#fff;
  color:#000;
  border-color:#fff;
}
.btn--ghost{
  background: rgba(255,255,255,.06);
}

/* CAREER NAV */
.careerNav{
  flex:1;
  display:flex;
  justify-content:center;
  align-items:center;
  gap: 14px;
  flex-wrap:wrap;
  text-transform: uppercase;
  opacity: .95;
}
.careerNav__item{
  position:relative;
  padding-bottom: 14px; /* hover 브릿지 */
}
.careerNav__trigger{
  border:none;
  background:transparent;
  color: rgba(214,210,210,1);
  padding: 6px 4px;
  cursor: default;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: .35em;
  opacity: .95;
}
.careerNav__item:hover .careerNav__trigger{
  color:#fff;
}
.careerNav__dropdown{
  position:absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  min-width: 240px;
  padding: 10px;
  border-radius: 14px;
  background: rgba(0,0,0,.88);
  border: 1px solid rgba(255,255,255,.12);
  box-shadow: 0 18px 40px rgba(0,0,0,.55);
  backdrop-filter: blur(10px);
  display:none;
  z-index: 100;
}
.careerNav__item:hover .careerNav__dropdown{
  display:block;
}
.careerNav__sub{
  width:100%;
  text-align:left;
  border:none;
  background:transparent;
  color: rgba(255,255,255,.88);
  padding: 10px 10px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 13px;
  text-transform: none;
  letter-spacing: 0;
}
.careerNav__sub:hover{
  background: rgba(255,255,255,.06);
  color:#fff;
}

/* HERO (PDF 톤: 비네팅/블러/더 진한 그라데이션) */
.hero{
  position: relative;
  height: 560px;
  overflow: hidden;
  border-bottom: 1px solid var(--line);
}
.hero__image{
  position:absolute;
  inset:0;
  background-size: cover;
  background-position: center;
  transform: scale(1.05);
  filter: saturate(.85) contrast(.95) brightness(.92);
}
.hero__overlay{
  position:absolute;
  inset:0;
  background:
    radial-gradient(900px 520px at 50% 40%, rgba(255,255,255,.08), rgba(0,0,0,0) 55%),
    linear-gradient(180deg, rgba(0,0,0,.20) 0%, rgba(0,0,0,.70) 58%, rgba(0,0,0,.96) 100%);
}
.hero__inner{
  position:relative;
  max-width: 1200px;
  margin:0 auto;
  height: 100%;
  padding: 0 16px;
  display:flex;
  flex-direction:column;
  justify-content:center;
  align-items:center;
  text-align:center;
}
.hero__title{
  margin:0;
  font-size: 44px;
  font-weight: 900;
  letter-spacing: -0.02em;
  text-shadow: 0 10px 30px rgba(0,0,0,.55);
}
.hero__desc{
  margin: 14px 0 0;
  max-width: 760px;
  font-size: 12px;
  line-height: 1.6;
  color: rgba(255,255,255,.78);
}

/* DISCOVER */
.discover{
  padding: 76px 0 56px;
  background:
    radial-gradient(900px 420px at 50% 0%, rgba(116,40,40,.30), rgba(0,0,0,0) 60%),
    linear-gradient(180deg, rgba(0,0,0,.96), rgba(0,0,0,.92));
  border-bottom: 1px solid var(--line);
}
.discover__inner{
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 16px;
  text-align:center;
}
.discover__title{
  margin:0;
  font-size: 28px;
  font-weight: 900;
  letter-spacing: .08em;
  text-shadow: 0 8px 28px rgba(0,0,0,.55);
}
.discover__new{
  letter-spacing: .18em;
}
.discover__sub{
  margin: 10px 0 22px;
  font-size: 11px;
  color: rgba(255,255,255,.62);
}
.discover__row{
  display:flex;
  gap: 16px;
  justify-content:center;
  align-items:flex-end;
  flex-wrap:nowrap;
  overflow-x:auto;
  padding-bottom: 8px;
}
.tile{
  width: 170px;
  height: 120px;
  border-radius: 8px;
  background-size: cover;
  background-position: center;
  border: 1px solid rgba(255,255,255,.14);
  box-shadow: 0 16px 30px rgba(0,0,0,.65);
  flex: 0 0 auto;
}
.tile.is-strong{
  width: 190px;
  height: 130px;
}

/* SPOTLIGHT */
.spotlight{
  background: linear-gradient(180deg, rgba(0,0,0,.92), rgba(38,0,24,.88));
  padding: 56px 0 56px;
  border-bottom: 1px solid var(--line);
}
.spotlight__inner{
  max-width: 900px;
  margin: 0 auto;
  padding: 0 16px;
  text-align:center;
}
.spotlight__title{
  margin:0;
  font-size: 16px;
  font-weight: 900;
}
.spotlight__sub{
  margin: 8px 0 18px;
  font-size: 11px;
  color: rgba(255,255,255,.65);
}
.spotlight__card{
  display:flex;
  justify-content:center;
}
.spotlight__cover{
  width: min(720px, 92vw);
  height: 210px;
  border-radius: 12px;
  background-size: cover;
  background-position: center;
  border: 1px solid rgba(255,255,255,.14);
  box-shadow: 0 18px 40px rgba(0,0,0,.62);
}
.spotlight__meta{
  margin-top: 14px;
  font-size: 9px;
  color: rgba(255,255,255,.65);
  display:flex;
  flex-direction:column;
  gap: 6px;
}

/* CTA */
.cta{
  background:
    radial-gradient(900px 420px at 50% 0%, rgba(116,40,40,.30), rgba(0,0,0,0) 60%),
    linear-gradient(180deg, rgba(0,0,0,.96), rgba(0,0,0,.98));
  padding: 76px 0 36px;
}
.cta__inner{
  max-width: 980px;
  margin: 0 auto;
  padding: 0 16px;
  text-align:center;
}
.cta__title{
  margin:0;
  font-size: 22px;
  font-weight: 900;
}
.cta__sub{
  margin: 10px 0 20px;
  font-size: 10px;
  color: rgba(255,255,255,.62);
}
.cta__actions{
  display:flex;
  justify-content:center;
  align-items:center;
  gap: 10px;
  flex-wrap:wrap;
}
.cta__or{
  font-weight: 900;
  opacity:.9;
  font-size: 10px;
}
.searchbox{
  display:flex;
  align-items:center;
  background: rgba(255,255,255,.08);
  border: 1px solid rgba(255,255,255,.12);
  border-radius: 999px;
  padding: 8px 12px;
  min-width: min(420px, 88vw);
}
.searchbox input{
  width: 100%;
  border: none;
  outline: none;
  background: transparent;
  color: #fff;
  font-size: 12px;
}

/* Footer */
.footer{
  margin-top: 26px;
  display:flex;
  justify-content:space-between;
  align-items:center;
  opacity: .9;
}
.footer__logo{
  font-weight: 900;
  letter-spacing: .12em;
  font-size: 12px;
}
.footer__icons{
  display:flex;
  gap: 8px;
  align-items:center;
}
.dot{
  width: 10px;
  height: 10px;
  border-radius: 999px;
  border: 1px solid rgba(255,255,255,.2);
  opacity: .85;
}

/* ===== MODAL (PDF 느낌) ===== */
.modalOverlay{
  position:fixed;
  inset:0;
  background: rgba(0,0,0,.45);
  backdrop-filter: blur(10px);
  display:flex;
  justify-content:center;
  align-items:center;
  z-index:1000;
  padding:16px;
}

.modalShell{
  width: min(520px, 92vw);
  padding: 26px;
  border-radius: 18px;
  background: rgba(90, 90, 90, .55);
  border: 1px solid rgba(255,255,255,.18);
  box-shadow: 0 26px 70px rgba(0,0,0,.65);
  position: relative;
}

.modalClose{
  position:absolute;
  top: 10px;
  right: 12px;
  width: 34px;
  height: 34px;
  border-radius: 999px;
  border: 1px solid rgba(255,255,255,.22);
  background: rgba(0,0,0,.25);
  color: rgba(255,255,255,.92);
  font-size: 22px;
  cursor:pointer;
}

.modalShell__title{
  text-align:center;
  font-weight: 900;
  letter-spacing: .18em;
  color: rgba(255,255,255,.92);
  margin-bottom: 14px;
  font-size: 12px;
}

.modalCard{
  background: rgba(255,255,255,.96);
  border-radius: 14px;
  padding: 22px;
  color: #141414;
}

.modalBrand{
  text-align:center;
  font-weight: 900;
  letter-spacing: .12em;
  margin-bottom: 14px;
}

.field{
  margin-bottom: 12px;
}

.label{
  font-size: 11px;
  font-weight: 800;
  color: rgba(0,0,0,.72);
  margin-bottom: 6px;
}

.inputModern{
  width:100%;
  border: 1px solid rgba(0,0,0,.12);
  border-radius: 10px;
  padding: 12px 12px;
  outline: none;
  background: rgba(240,240,240,.9);
  font-size: 13px;
}

.inline{
  display:flex;
  gap: 8px;
  align-items:center;
}

.miniBtn{
  flex: 0 0 auto;
  border: 1px solid rgba(0,0,0,.18);
  background: rgba(255,255,255,.9);
  border-radius: 10px;
  padding: 10px 12px;
  cursor:pointer;
  font-weight: 900;
  font-size: 11px;
}

.btnBlock{
  width:100%;
  margin-top: 6px;
  border: none;
  background: #111;
  color:#fff;
  border-radius: 10px;
  padding: 12px 12px;
  cursor:pointer;
  font-weight: 900;
  letter-spacing: .02em;
}

.btnBlock:disabled{
  background: rgba(0,0,0,.25);
  cursor: not-allowed;
}

.rowBetween{
  margin-top: 10px;
  display:flex;
  justify-content:space-between;
  align-items:center;
}

.linkBtn{
  border:none;
  background: transparent;
  cursor:pointer;
  font-size: 11px;
  font-weight: 800;
  color: rgba(0,0,0,.62);
  text-decoration: underline;
}

.divider{
  margin: 14px 0 12px;
  display:flex;
  align-items:center;
  gap: 10px;
}
.divider__line{
  height:1px;
  background: rgba(0,0,0,.12);
  flex:1;
}
.divider__text{
  font-size: 11px;
  font-weight: 900;
  color: rgba(0,0,0,.50);
  letter-spacing: .18em;
}

.googleWrap{
  display:flex;
  justify-content:center;
}

.hintLine{
  margin-top: 6px;
  font-size: 10px;
  color: rgba(0,0,0,.45);
}
.hintLine.ok{
  color: rgba(0,120,0,.72);
  font-weight: 800;
}

.smallNote{
  margin-top: 12px;
  font-size: 10px;
  color: rgba(0,0,0,.50);
  line-height: 1.45;
}

@media (max-width: 900px){
  .careerNav{ gap:10px; }
  .careerNav__trigger{ letter-spacing:.25em; }
  .hero{ height: 520px; }
}
`;