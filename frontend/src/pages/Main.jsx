import React, { useState, useEffect } from "react";
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import axios from "axios";

const BACKEND_URL = window.location.hostname === "localhost" 
  ? "http://localhost:8000" 
  : "https://port-0-artist-promotion-platform-backend-mk9v7xrma0e5b23b.sel3.cloudtype.app";

function Main() {
  const [user, setUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNicknameModalOpen, setIsNicknameModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState("signin");
  
  const [userEmail, setUserEmail] = useState("");
  const [userPw, setUserPw] = useState("");
  const [newNickname, setNewNickname] = useState("");
  const [isNicknameAvailable, setIsNicknameAvailable] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState("All");

  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);

  // --- 기획안에 있던 모든 장르 리스트 ---
  const genres = ["Pop", "JAZZ", "EDM", "Rock", "Music Tech", "Film Music", "Other"];

  useEffect(() => {
    const token = localStorage.getItem("token");
    const nickname = localStorage.getItem("nickname");
    if (token && nickname && !nickname.startsWith("User_")) {
      setUser({ nickname });
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.location.reload();
  };

  const handleSignIn = async () => {
    if (!userEmail || !userPw) return alert("이메일과 비밀번호를 입력해주세요.");
    try {
      const res = await axios.post(`${BACKEND_URL}/auth/login`, { email: userEmail, password: userPw });
      localStorage.setItem("token", res.data.access_token);
      localStorage.setItem("nickname", res.data.nickname);
      setUser({ nickname: res.data.nickname });
      setIsModalOpen(false);
      window.location.reload();
    } catch (e) { alert(e.response?.data?.detail || "로그인 실패"); }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const response = await axios.post(`${BACKEND_URL}/auth/google`, { token: credentialResponse.credential });
      const { access_token, is_new_user, nickname, email } = response.data;
      localStorage.setItem("token", access_token);
      setUserEmail(email);
      if (is_new_user) {
        setIsModalOpen(false); 
        setIsNicknameModalOpen(true); 
      } else {
        localStorage.setItem("nickname", nickname);
        setUser({ nickname });
        window.location.reload();
      }
    } catch (error) { alert("로그인 오류"); }
  };

  // --- 스타일 정의 (기획안 디자인 반영) ---
  const navStyle = { 
    display: "flex", 
    justifyContent: "space-between", 
    alignItems: "stretch", // 높이를 꽉 채우기 위해 stretch
    height: "75px", 
    backgroundColor: "#f9f7f6", 
    borderBottom: "1px solid #eaeaea", 
    position: "sticky", 
    top: 0, 
    zIndex: 10,
    fontFamily: "'Pretendard', sans-serif"
  };

  const genreSectionStyle = {
    display: "flex",
    flex: 1,
  };

  const genreButtonStyle = (g) => ({
    flex: 1,
    border: "none",
    backgroundColor: selectedGenre === g ? "#eee" : "transparent",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: selectedGenre === g ? "700" : "400",
    transition: "background 0.2s",
    borderRight: "1px solid rgba(0,0,0,0.05)",
    padding: "0 10px"
  });

  const logoStyle = {
    flex: 1.2,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "20px",
    fontWeight: "800",
    letterSpacing: "-0.5px"
  };

  const authSectionStyle = {
    flex: 1,
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingRight: "40px"
  };

  const modalOverlay = { position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 };
  const modalContent = { backgroundColor: "#5D5755", padding: "40px 30px", width: "360px", position: "relative" };
  const innerWhiteBox = { backgroundColor: "white", padding: "25px" };
  const inputStyle = { backgroundColor: "#DED3D1", border: "none", padding: "12px", outline: "none", width: "100%", boxSizing: "border-box" };
  const submitBtn = { border: "none", padding: "12px", fontWeight: "bold", cursor: "pointer", width: "100%" };

  return (
    <GoogleOAuthProvider clientId="163502629915-hnul9f78fgomial7ktg27rubjapt0vu4.apps.googleusercontent.com">
      <div style={{ fontFamily: "'Pretendard', sans-serif", color: "#333" }}>
        
        {/* 수정된 네비게이션 바 */}
        <nav style={navStyle}>
          {/* 왼쪽 장르 (5개) */}
          <div style={genreSectionStyle}>
            {genres.slice(0, 5).map(g => (
              <button key={g} onClick={() => setSelectedGenre(g)} style={genreButtonStyle(g)}>
                {g}
              </button>
            ))}
          </div>

          {/* 중앙 로고 */}
          <div style={logoStyle}>StudioSeiHa Artist_Platform</div>

          {/* 오른쪽 장르 (나머지) + 로그인 상태 */}
          <div style={{...genreSectionStyle, flex: 1}}>
            {genres.slice(5).map(g => (
              <button key={g} onClick={() => setSelectedGenre(g)} style={genreButtonStyle(g)}>
                {g}
              </button>
            ))}
            
            {/* 로그인/로그아웃 버튼 섹션 */}
            <div style={{...authSectionStyle, flex: 1.5, borderLeft: "1px solid rgba(0,0,0,0.05)"}}>
              {user ? (
                <div style={{display:"flex", alignItems:"center", gap:"15px"}}>
                  <span style={{fontSize:"14px"}}><strong>{user.nickname}</strong>님</span>
                  <button onClick={handleLogout} style={{background:"none", border:"1px solid #ccc", padding:"4px 8px", cursor:"pointer", fontSize:"12px"}}>Log Out</button>
                </div>
              ) : (
                <button 
                  onClick={() => {setAuthMode("signin"); setIsModalOpen(true);}} 
                  style={{background:"none", border:"none", cursor:"pointer", fontWeight:"700", fontSize:"14px"}}
                >
                  Log In
                </button>
              )}
            </div>
          </div>
        </nav>

        {/* 메인 콘텐츠 영역 */}
        <main style={{ textAlign: "center", marginTop: "120px" }}>
          <h1 style={{fontSize: "48px", fontWeight: "800", marginBottom: "40px"}}>
            {selectedGenre === "All" ? "원하는 아티스트를 찾아보세요" : `${selectedGenre} 아티스트`}
          </h1>
          
          {/* 아티스트 카드들이 들어갈 자리 (기획안의 회색 박스들) */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px", padding: "0 100px" }}>
             {[1,2,3,4,5,6].map(i => (
               <div key={i} style={{ height: "250px", backgroundColor: "#eee" }}></div>
             ))}
          </div>
        </main>

        {/* 로그인 모달 생략 (위의 코드와 동일) */}
        {isModalOpen && (
          <div style={modalOverlay} onClick={() => setIsModalOpen(false)}>
            <div style={modalContent} onClick={e => e.stopPropagation()}>
              <h2 style={{color:"white", marginBottom:"20px"}}>{authMode === "signin" ? "Sign In" : "Sign Up"}</h2>
              <div style={innerWhiteBox}>
                {authMode === "signin" ? (
                  <div style={{display:"flex", flexDirection:"column", gap:"10px"}}>
                    <div style={{display:"flex", justifyContent:"center"}}><GoogleLogin onSuccess={handleGoogleSuccess} /></div>
                    <div style={{textAlign:"center", fontSize:"12px", color:"#888", margin:"10px 0"}}>OR</div>
                    <input type="text" placeholder="ID (Email)" style={inputStyle} value={userEmail} onChange={(e) => setUserEmail(e.target.value)} />
                    <input type="password" placeholder="PW" style={inputStyle} value={userPw} onChange={(e) => setUserPw(e.target.value)} />
                    <button onClick={handleSignIn} style={{...submitBtn, backgroundColor:"#DED3D1"}}>Sign In</button>
                    <p style={{fontSize:"12px", textAlign:"center"}}>계정이 없나요? <span onClick={() => setAuthMode("signup")} style={{fontWeight:"bold", cursor:"pointer"}}>회원가입</span></p>
                  </div>
                ) : (
                  /* 회원가입 UI 생략... (이전 코드 참고) */
                  <div style={{textAlign:"center", fontSize:"12px"}}>회원가입 로직 포함...</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </GoogleOAuthProvider>
  );
}

export default Main;