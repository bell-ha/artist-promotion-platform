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
    // 임시 닉네임(User_...)이 아닐 때만 로그인 상태로 표시
    if (token && nickname && !nickname.startsWith("User_")) {
      setUser({ nickname });
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.location.reload();
  };

  // 1. 구글 로그인 성공 시 처리 (이 부분이 핵심!)
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await axios.post(`${BACKEND_URL}/auth/google`, { 
        token: credentialResponse.credential 
      });
      
      const { access_token, is_new_user, nickname, email } = res.data;
      
      // 토큰과 이메일은 미리 저장
      localStorage.setItem("token", access_token);
      setUserEmail(email);

      if (is_new_user === true) {
        // 신규 유저면 로그인 모달 닫고, 닉네임 설정 모달 강제 오픈
        setIsModalOpen(false);
        setIsNicknameModalOpen(true);
      } else {
        // 기존 유저면 닉네임 저장 후 리로드
        localStorage.setItem("nickname", nickname);
        window.location.reload();
      }
    } catch (e) {
      alert("구글 로그인 실패: " + (e.response?.data?.detail || "알 수 없는 오류"));
    }
  };

  // 2. 닉네임 중복 확인
  const handleCheckNickname = async () => {
    if (!newNickname) return alert("닉네임을 입력해주세요.");
    try {
      const res = await axios.get(`${BACKEND_URL}/auth/check-nickname?nickname=${newNickname}`);
      setIsNicknameAvailable(res.data.available);
      alert(res.data.available ? "사용 가능한 닉네임입니다." : "이미 사용 중인 닉네임입니다.");
    } catch (e) { alert("확인 중 오류가 발생했습니다."); }
  };

  // 3. 닉네임 최종 업데이트 (구글 신규유저용)
  const handleUpdateNickname = async () => {
    if (!isNicknameAvailable) return alert("닉네임 중복 확인을 해주세요.");
    try {
      await axios.post(`${BACKEND_URL}/auth/update-nickname`, { 
        email: userEmail, 
        nickname: newNickname 
      });
      localStorage.setItem("nickname", newNickname);
      alert("닉네임 설정이 완료되었습니다!");
      window.location.reload();
    } catch (e) { 
      alert("저장 실패: " + (e.response?.data?.detail || "오류 발생")); 
    }
  };

  // --- 기존 회원가입/로그인 핸들러 ---
  const handleSignIn = async () => {
    try {
      const res = await axios.post(`${BACKEND_URL}/auth/login`, { email: userEmail, password: userPw });
      localStorage.setItem("token", res.data.access_token);
      localStorage.setItem("nickname", res.data.nickname);
      window.location.reload();
    } catch (e) { alert(e.response?.data?.detail || "로그인 실패"); }
  };

  const handleSendOtp = async () => {
    try {
      await axios.post(`${BACKEND_URL}/auth/send-otp?email=${userEmail}`);
      setIsOtpSent(true);
      alert("인증번호 발송 완료");
    } catch (e) { alert("발송 실패"); }
  };

  const handleVerifyOtp = async () => {
    try {
      const res = await axios.post(`${BACKEND_URL}/auth/verify-otp`, { email: userEmail, otp });
      if (res.data.status === "verified") { setIsEmailVerified(true); alert("인증 성공"); }
    } catch (e) { alert("인증번호 오류"); }
  };

  const handleSignUp = async () => {
    try {
      await axios.post(`${BACKEND_URL}/auth/signup`, { nickname: newNickname, email: userEmail, password: userPw });
      alert("가입 성공!"); setAuthMode("signin");
    } catch (e) { alert("가입 실패"); }
  };

  // --- 디자인 스타일 ---
  const modalOverlay = { position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 };
  const modalContent = { backgroundColor: "#5D5755", padding: "40px 30px", width: "360px" };
  const innerWhiteBox = { backgroundColor: "white", padding: "25px", display: "flex", flexDirection: "column", gap: "12px" };
  const inputStyle = { backgroundColor: "#DED3D1", border: "none", padding: "12px", width: "100%", boxSizing: "border-box" };

  return (
    <GoogleOAuthProvider clientId="163502629915-hnul9f78fgomial7ktg27rubjapt0vu4.apps.googleusercontent.com">
      <div style={{ fontFamily: "'Pretendard', sans-serif" }}>
        
        {/* 네비게이션 바 */}
        <nav style={{ display: "flex", justifyContent: "space-between", height: "75px", backgroundColor: "#f9f7f6", borderBottom: "1px solid #eaeaea", position: "sticky", top: 0 }}>
          <div style={{display:"flex", flex:1}}>
            {genres.slice(0, 5).map(g => (
              <button key={g} onClick={() => setSelectedGenre(g)} style={{flex:1, border:"none", background:"none", cursor:"pointer", borderRight:"1px solid #eee"}}>
                {g}
              </button>
            ))}
          </div>
          <div style={{flex:1.2, display:"flex", justifyContent:"center", alignItems:"center", fontWeight:"800"}}>StudioSeiHa Artist_Platform</div>
          <div style={{display:"flex", flex:1}}>
            {genres.slice(5).map(g => (
              <button key={g} onClick={() => setSelectedGenre(g)} style={{flex:1, border:"none", background:"none", cursor:"pointer", borderRight:"1px solid #eee"}}>
                {g}
              </button>
            ))}
            <div style={{flex:1, display:"flex", justifyContent:"center", alignItems:"center"}}>
              {user ? (
                <span><strong>{user.nickname}</strong>님 <button onClick={handleLogout}>LogOut</button></span>
              ) : (
                <button onClick={() => {setAuthMode("signin"); setIsModalOpen(true);}} style={{fontWeight:"700", border:"none", background:"none", cursor:"pointer"}}>Log In</button>
              )}
            </div>
          </div>
        </nav>

        {/* 로그인/회원가입 모달 */}
        {isModalOpen && (
          <div style={modalOverlay} onClick={() => setIsModalOpen(false)}>
            <div style={modalContent} onClick={e => e.stopPropagation()}>
              <h2 style={{color:"white", marginBottom:"20px"}}>{authMode === "signin" ? "Sign In" : "Sign Up"}</h2>
              <div style={innerWhiteBox}>
                {authMode === "signin" ? (
                  <>
                    <div style={{display:"flex", justifyContent:"center"}}><GoogleLogin onSuccess={handleGoogleSuccess} /></div>
                    <div style={{textAlign:"center", margin:"10px 0", fontSize:"12px"}}>OR</div>
                    <input type="text" placeholder="Email" style={inputStyle} value={userEmail} onChange={e => setUserEmail(e.target.value)} />
                    <input type="password" placeholder="Password" style={inputStyle} value={userPw} onChange={e => setUserPw(e.target.value)} />
                    <button onClick={handleSignIn} style={{padding:"12px", background:"#DED3D1", border:"none", fontWeight:"bold"}}>Sign In</button>
                    <p style={{fontSize:"12px", textAlign:"center"}}>계정이 없나요? <span onClick={() => setAuthMode("signup")} style={{fontWeight:"bold", cursor:"pointer"}}>회원가입</span></p>
                  </>
                ) : (
                  <>
                    <div style={{display:"flex", gap:"5px"}}>
                      <input type="text" placeholder="Nickname" style={{...inputStyle, flex:1}} value={newNickname} onChange={e => {setNewNickname(e.target.value); setIsNicknameAvailable(false);}} />
                      <button onClick={handleCheckNickname} style={{fontSize:"10px"}}>중복확인</button>
                    </div>
                    <div style={{display:"flex", gap:"5px"}}>
                      <input type="email" placeholder="Email" style={{...inputStyle, flex:1}} value={userEmail} onChange={e => setUserEmail(e.target.value)} />
                      <button onClick={handleSendOtp} style={{fontSize:"10px"}}>인증발송</button>
                    </div>
                    {isOtpSent && <div style={{display:"flex", gap:"5px"}}><input type="text" placeholder="OTP" style={{...inputStyle, flex:1}} value={otp} onChange={e => setOtp(e.target.value)} /><button onClick={handleVerifyOtp} style={{fontSize:"10px"}}>확인</button></div>}
                    <input type="password" placeholder="Password" style={inputStyle} value={userPw} onChange={e => setUserPw(e.target.value)} />
                    <button onClick={handleSignUp} disabled={!(isEmailVerified && isNicknameAvailable)} style={{padding:"12px", background: (isEmailVerified && isNicknameAvailable) ? "#5D5755" : "#ccc", color:"white", border:"none"}}>가입하기</button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 구글 신규 유저 전용: 닉네임 변경 모달 */}
        {isNicknameModalOpen && (
          <div style={modalOverlay}>
            <div style={modalContent}>
              <h2 style={{color:"white", marginBottom:"15px"}}>Welcome!</h2>
              <div style={innerWhiteBox}>
                <p style={{fontSize:"13px", textAlign:"center"}}>마지막 단계입니다!<br/>사용하실 닉네임을 설정해주세요.</p>
                <div style={{display:"flex", gap:"5px"}}>
                  <input 
                    type="text" 
                    placeholder="새 닉네임 입력" 
                    style={{...inputStyle, flex:1}} 
                    value={newNickname} 
                    onChange={e => {setNewNickname(e.target.value); setIsNicknameAvailable(false);}} 
                  />
                  <button onClick={handleCheckNickname} style={{fontSize:"10px"}}>중복확인</button>
                </div>
                <button 
                  onClick={handleUpdateNickname} 
                  disabled={!isNicknameAvailable}
                  style={{padding:"12px", background: isNicknameAvailable ? "#5D5755" : "#ccc", color:"white", border:"none", cursor:"pointer", fontWeight:"bold"}}
                >
                  설정 완료
                </button>
              </div>
            </div>
          </div>
        )}

        <main style={{textAlign:"center", marginTop:"100px"}}>
          <h1>{selectedGenre === "All" ? "원하는 아티스트를 찾아보세요" : `${selectedGenre} 아티스트`}</h1>
        </main>
      </div>
    </GoogleOAuthProvider>
  );
}

export default Main;