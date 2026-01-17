import React, { useState, useEffect } from "react";
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import axios from "axios";

const BACKEND_URL = "https://port-0-artist-promotion-platform-backend-mk9v7xrma0e5b23b.sel3.cloudtype.app";

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

  // --- 통신 함수들 ---
  const handleSignIn = async () => {
    if (!userEmail || !userPw) return alert("이메일과 비밀번호를 입력해주세요.");
    try {
      const res = await axios.post(`${BACKEND_URL}/auth/login`, { email: userEmail, password: userPw });
      localStorage.setItem("token", res.data.access_token);
      localStorage.setItem("nickname", res.data.nickname);
      window.location.reload();
    } catch (e) { alert(e.response?.data?.detail || "로그인 실패"); }
  };

  const handleSendOtp = async () => {
    if (!userEmail) return alert("이메일을 입력해주세요.");
    try {
      await axios.post(`${BACKEND_URL}/auth/send-otp?email=${userEmail}`);
      setIsOtpSent(true);
      alert("인증번호가 발송되었습니다.");
    } catch (e) { alert("발송 실패"); }
  };

  const handleVerifyOtp = async () => {
    try {
      const res = await axios.post(`${BACKEND_URL}/auth/verify-otp`, { email: userEmail, otp });
      if (res.data.status === "verified") {
        setIsEmailVerified(true);
        alert("이메일 인증 성공!");
      }
    } catch (e) { alert("인증번호가 틀렸거나 만료되었습니다."); }
  };

  const handleCheckNickname = async () => {
    if (!newNickname) return alert("닉네임을 입력해주세요.");
    try {
      const res = await axios.get(`${BACKEND_URL}/auth/check-nickname?nickname=${newNickname}`);
      setIsNicknameAvailable(res.data.available);
      alert(res.data.available ? "사용 가능한 닉네임입니다." : "이미 사용 중인 닉네임입니다.");
    } catch (e) { alert("확인 중 오류가 발생했습니다."); }
  };

  const handleSignUp = async () => {
    try {
      await axios.post(`${BACKEND_URL}/auth/signup`, {
        nickname: newNickname, email: userEmail, password: userPw
      });
      alert("가입 성공! 로그인 해주세요.");
      setAuthMode("signin");
    } catch (e) { alert(e.response?.data?.detail || "가입 실패"); }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await axios.post(`${BACKEND_URL}/auth/google`, { token: credentialResponse.credential });
      localStorage.setItem("token", res.data.access_token);
      setUserEmail(res.data.email);
      if (res.data.is_new_user) {
        setIsModalOpen(false);
        setIsNicknameModalOpen(true);
      } else {
        localStorage.setItem("nickname", res.data.nickname);
        window.location.reload();
      }
    } catch (e) { alert("구글 로그인 실패"); }
  };

  const handleUpdateNickname = async () => {
    try {
      await axios.post(`${BACKEND_URL}/auth/update-nickname`, { email: userEmail, nickname: newNickname });
      localStorage.setItem("nickname", newNickname);
      window.location.reload();
    } catch (e) { alert("닉네임 저장 실패"); }
  };

  // --- 스타일 ---
  const navStyle = { display: "flex", justifyContent: "space-between", height: "75px", backgroundColor: "#f9f7f6", borderBottom: "1px solid #eaeaea", position: "sticky", top: 0, zIndex: 10 };
  const genreButtonStyle = (g) => ({ flex: 1, border: "none", backgroundColor: selectedGenre === g ? "#eee" : "transparent", cursor: "pointer", fontSize: "14px", fontWeight: selectedGenre === g ? "700" : "400", borderRight: "1px solid rgba(0,0,0,0.05)" });
  const modalOverlay = { position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 };
  const modalContent = { backgroundColor: "#5D5755", padding: "40px 30px", width: "380px" };
  const innerWhiteBox = { backgroundColor: "white", padding: "25px", display: "flex", flexDirection: "column", gap: "12px" };
  const inputStyle = { backgroundColor: "#DED3D1", border: "none", padding: "12px", width: "100%", boxSizing: "border-box", outline: "none" };
  const verifyBtn = { padding: "0 10px", border: "1px solid #333", background: "none", cursor: "pointer", fontSize: "12px", whiteSpace: "nowrap" };
  const submitBtn = { border: "none", padding: "12px", fontWeight: "bold", cursor: "pointer", width: "100%" };

  return (
    <GoogleOAuthProvider clientId="163502629915-hnul9f78fgomial7ktg27rubjapt0vu4.apps.googleusercontent.com">
      <div style={{ fontFamily: "'Pretendard', sans-serif", color: "#333" }}>
        
        {/* 네비게이션 */}
        <nav style={navStyle}>
          <div style={{display:"flex", flex:1}}>
            {genres.slice(0, 5).map(g => <button key={g} onClick={() => setSelectedGenre(g)} style={genreButtonStyle(g)}>{g}</button>)}
          </div>
          <div style={{flex:1.2, display:"flex", justifyContent:"center", alignItems:"center", fontWeight:"800", fontSize:"20px"}}>StudioSeiHa Artist_Platform</div>
          <div style={{display:"flex", flex:1}}>
            {genres.slice(5).map(g => <button key={g} onClick={() => setSelectedGenre(g)} style={genreButtonStyle(g)}>{g}</button>)}
            <div style={{flex:1.5, display:"flex", justifyContent:"center", alignItems:"center", borderLeft:"1px solid rgba(0,0,0,0.05)"}}>
              {user ? (
                <div style={{fontSize:"14px"}}>
                  <strong>{user.nickname}</strong>님 <button onClick={handleLogout} style={{marginLeft:"10px", cursor:"pointer"}}>LogOut</button>
                </div>
              ) : (
                <button onClick={() => {setAuthMode("signin"); setIsModalOpen(true);}} style={{background:"none", border:"none", fontWeight:"700", cursor:"pointer"}}>Log In</button>
              )}
            </div>
          </div>
        </nav>

        {/* 메인 */}
        <main style={{ textAlign: "center", marginTop: "120px" }}>
          <h1 style={{fontSize: "48px", fontWeight: "800", marginBottom: "40px"}}>
            {selectedGenre === "All" ? "원하는 아티스트를 찾아보세요" : `${selectedGenre} 아티스트`}
          </h1>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px", padding: "0 100px" }}>
             {[1,2,3,4,5,6].map(i => <div key={i} style={{ height: "250px", backgroundColor: "#eee" }}></div>)}
          </div>
        </main>

        {/* 로그인/회원가입 모달 */}
        {isModalOpen && (
          <div style={modalOverlay} onClick={() => setIsModalOpen(false)}>
            <div style={modalContent} onClick={e => e.stopPropagation()}>
              <h2 style={{color:"white", marginBottom:"20px"}}>{authMode === "signin" ? "Sign In" : "Sign Up"}</h2>
              <div style={innerWhiteBox}>
                {authMode === "signin" ? (
                  <>
                    <div style={{display:"flex", justifyContent:"center"}}><GoogleLogin onSuccess={handleGoogleSuccess} /></div>
                    <div style={{textAlign:"center", fontSize:"12px", color:"#888", margin:"5px 0"}}>OR</div>
                    <input type="text" placeholder="Email" style={inputStyle} value={userEmail} onChange={e => setUserEmail(e.target.value)} />
                    <input type="password" placeholder="Password" style={inputStyle} value={userPw} onChange={e => setUserPw(e.target.value)} />
                    <button onClick={handleSignIn} style={{...submitBtn, backgroundColor:"#DED3D1"}}>Sign In</button>
                    <p style={{fontSize:"12px", textAlign:"center"}}>계정이 없나요? <span onClick={() => {setAuthMode("signup"); setUserEmail(""); setUserPw("");}} style={{fontWeight:"bold", cursor:"pointer"}}>회원가입</span></p>
                  </>
                ) : (
                  <>
                    <div style={{display:"flex", gap:"5px"}}>
                      <input type="text" placeholder="Nickname" style={{...inputStyle, flex:1}} value={newNickname} onChange={e => {setNewNickname(e.target.value); setIsNicknameAvailable(false);}} />
                      <button onClick={handleCheckNickname} style={verifyBtn}>중복확인</button>
                    </div>
                    <div style={{display:"flex", gap:"5px"}}>
                      <input type="email" placeholder="Email" style={{...inputStyle, flex:1}} value={userEmail} onChange={e => setUserEmail(e.target.value)} disabled={isEmailVerified} />
                      <button onClick={handleSendOtp} style={verifyBtn} disabled={isEmailVerified}>인증발송</button>
                    </div>
                    {isOtpSent && !isEmailVerified && (
                      <div style={{display:"flex", gap:"5px"}}>
                        <input type="text" placeholder="인증번호 6자리" style={{...inputStyle, flex:1}} value={otp} onChange={e => setOtp(e.target.value)} />
                        <button onClick={handleVerifyOtp} style={verifyBtn}>확인</button>
                      </div>
                    )}
                    <input type="password" placeholder="Password" style={inputStyle} value={userPw} onChange={e => setUserPw(e.target.value)} />
                    <button 
                      onClick={handleSignUp} 
                      disabled={!(isEmailVerified && isNicknameAvailable)} 
                      style={{...submitBtn, backgroundColor: (isEmailVerified && isNicknameAvailable) ? "#5D5755" : "#ccc", color:"white"}}
                    >
                      가입하기
                    </button>
                    <p style={{fontSize:"12px", textAlign:"center"}}>이미 계정이 있나요? <span onClick={() => setAuthMode("signin")} style={{fontWeight:"bold", cursor:"pointer"}}>로그인</span></p>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 구글 신규유저 전용 닉네임 설정 모달 */}
        {isNicknameModalOpen && (
          <div style={modalOverlay}>
            <div style={modalContent}>
              <h2 style={{color:"white", marginBottom:"15px"}}>Welcome!</h2>
              <div style={innerWhiteBox}>
                <p style={{fontSize:"13px", textAlign:"center"}}>마지막 단계입니다!<br/>사용하실 닉네임을 설정해주세요.</p>
                <div style={{display:"flex", gap:"5px"}}>
                  <input type="text" placeholder="새 닉네임 입력" style={{...inputStyle, flex:1}} value={newNickname} onChange={e => {setNewNickname(e.target.value); setIsNicknameAvailable(false);}} />
                  <button onClick={handleCheckNickname} style={verifyBtn}>중복확인</button>
                </div>
                <button 
                  onClick={handleUpdateNickname} 
                  disabled={!isNicknameAvailable} 
                  style={{...submitBtn, backgroundColor: isNicknameAvailable ? "#5D5755" : "#ccc", color:"white"}}
                >
                  설정 완료
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </GoogleOAuthProvider>
  );
}

export default Main;