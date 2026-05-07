import { useState, useEffect } from "react";
import { GoogleLogin } from "@react-oauth/google";
import type { CredentialResponse } from "@react-oauth/google";
import axios from "axios";
import { BACKEND_URL, FORGOT_API } from "../lib/api";
import type { AuthModalsProps } from "../types/auth";

export default function AuthModals({ isOpen, mode, onClose, onModeChange, onLoginSuccess }: AuthModalsProps) {
  const [userEmail, setUserEmail] = useState("");
  const [userPw, setUserPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showSignInPw, setShowSignInPw] = useState(false);
  const [showSignUpPw, setShowSignUpPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  const [newNickname, setNewNickname] = useState("");
  const [isNicknameAvailable, setIsNicknameAvailable] = useState(false);

  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);

  // Forgot Password
  const [fpEmail, setFpEmail] = useState("");
  const [fpOtp, setFpOtp] = useState("");
  const [fpNewPw, setFpNewPw] = useState("");
  const [fpConfirmPw, setFpConfirmPw] = useState("");
  const [fpOtpSent, setFpOtpSent] = useState(false);
  const [fpVerified, setFpVerified] = useState(false);
  const [fpBusy, setFpBusy] = useState(false);
  const [showFpNewPw, setShowFpNewPw] = useState(false);
  const [showFpConfirmPw, setShowFpConfirmPw] = useState(false);
  const [fpOtpTimer, setFpOtpTimer] = useState(0);

  // Google OAuth 신규 유저 닉네임
  const [isNicknameModalOpen, setIsNicknameModalOpen] = useState(false);
  const [googleEmail, setGoogleEmail] = useState("");

  // OTP countdown (signup)
  useEffect(() => {
    if (otpTimer <= 0) return;
    const id = setTimeout(() => setOtpTimer(t => t - 1), 1000);
    return () => clearTimeout(id);
  }, [otpTimer]);

  // OTP countdown (forgot password)
  useEffect(() => {
    if (fpOtpTimer <= 0) return;
    const id = setTimeout(() => setFpOtpTimer(t => t - 1), 1000);
    return () => clearTimeout(id);
  }, [fpOtpTimer]);

  const handleClose = () => {
    onClose();
    setFpEmail("");
    setFpOtp("");
    setFpNewPw("");
    setFpConfirmPw("");
    setFpOtpSent(false);
    setFpVerified(false);
    setFpBusy(false);
    setFpOtpTimer(0);
  };

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    try {
      const res = await axios.post(`${BACKEND_URL}/auth/google`, {
        token: credentialResponse.credential,
      });
      const { access_token, is_new_user, nickname, email } = res.data as {
        access_token: string;
        is_new_user: boolean;
        nickname: string;
        email: string;
      };
      localStorage.setItem("token", access_token);
      setGoogleEmail(email || "");

      if (is_new_user === true) {
        handleClose();
        setIsNicknameModalOpen(true);
      } else {
        localStorage.setItem("nickname", nickname);
        window.location.reload();
      }
    } catch (e) {
      const err = e as { response?: { data?: { detail?: string } } };
      alert("구글 로그인 실패: " + (err.response?.data?.detail || "알 수 없는 오류"));
    }
  };

  const handleCheckNickname = async () => {
    if (!newNickname) return alert("닉네임을 입력해주세요.");
    try {
      const res = await axios.get(
        `${BACKEND_URL}/auth/check-nickname?nickname=${encodeURIComponent(newNickname)}`
      );
      const data = res.data as { available: boolean };
      setIsNicknameAvailable(data.available);
      alert(data.available ? "사용 가능한 닉네임입니다." : "이미 사용 중인 닉네임입니다.");
    } catch {
      alert("확인 중 오류가 발생했습니다.");
    }
  };

  const handleUpdateNickname = async () => {
    if (!isNicknameAvailable) return alert("닉네임 중복 확인을 해주세요.");
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${BACKEND_URL}/auth/update-nickname`,
        { nickname: newNickname },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      localStorage.setItem("nickname", newNickname);
      alert("닉네임 설정이 완료되었습니다!");
      window.location.reload();
    } catch (e) {
      const err = e as { response?: { data?: { detail?: string } } };
      alert("저장 실패: " + (err.response?.data?.detail || "오류 발생"));
    }
  };

  const handleSignIn = async () => {
    try {
      const res = await axios.post(`${BACKEND_URL}/auth/login`, {
        email: userEmail,
        password: userPw,
      });
      const data = res.data as { access_token: string; nickname: string };
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("nickname", data.nickname);
      onLoginSuccess({ nickname: data.nickname });
      handleClose();
    } catch (e) {
      const err = e as { response?: { data?: { detail?: string } } };
      alert(err.response?.data?.detail || "로그인 실패");
    }
  };

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSendOtp = async () => {
    if (!isValidEmail(userEmail)) return alert("올바른 이메일 형식을 입력해주세요.");
    try {
      await axios.post(`${BACKEND_URL}/auth/send-otp?email=${encodeURIComponent(userEmail)}`);
      setIsOtpSent(true);
      setIsEmailVerified(false);
      setOtp("");
      setOtpTimer(300);
      alert("인증번호 발송 완료");
    } catch {
      alert("발송 실패");
    }
  };

  const handleVerifyOtp = async () => {
    try {
      const res = await axios.post(`${BACKEND_URL}/auth/verify-otp`, { email: userEmail, otp });
      const data = res.data as { status: string };
      if (data.status === "verified") {
        setIsEmailVerified(true);
        setOtpTimer(0);
        alert("인증 성공");
      }
    } catch (e) {
      const err = e as { response?: { data?: { detail?: string } } };
      alert(err.response?.data?.detail || "인증번호 오류");
    }
  };

  const handleSignUp = async () => {
    if (userPw.length < 6) return alert("비밀번호는 6자 이상이어야 합니다.");
    if (userPw !== confirmPw) return alert("비밀번호가 일치하지 않습니다.");
    try {
      await axios.post(`${BACKEND_URL}/auth/signup`, {
        nickname: newNickname,
        email: userEmail,
        password: userPw,
      });
      alert("가입 성공! 로그인해주세요.");
      setUserEmail("");
      setUserPw("");
      setConfirmPw("");
      setNewNickname("");
      setIsNicknameAvailable(false);
      setOtp("");
      setIsOtpSent(false);
      setIsEmailVerified(false);
      setOtpTimer(0);
      onModeChange("signin");
    } catch (e) {
      const err = e as { response?: { data?: { detail?: string } } };
      alert("가입 실패: " + (err.response?.data?.detail || "알 수 없는 오류"));
    }
  };

  const fpSendOtp = async () => {
    if (!fpEmail) return alert("이메일을 입력해주세요.");
    if (!isValidEmail(fpEmail)) return alert("올바른 이메일 형식을 입력해주세요.");
    setFpBusy(true);
    try {
      await axios.post(FORGOT_API.sendOtp(fpEmail));
      setFpOtpSent(true);
      setFpOtpTimer(300);
      setFpOtp("");
      setFpVerified(false);
      alert("비밀번호 재설정 인증코드를 발송했습니다.");
    } catch (e) {
      const err = e as { response?: { data?: { detail?: string } } };
      alert("발송 실패: " + (err.response?.data?.detail || "오류가 발생했습니다."));
    } finally {
      setFpBusy(false);
    }
  };

  const fpVerifyOtp = async () => {
    if (!fpOtp) return alert("인증코드를 입력해주세요.");
    setFpBusy(true);
    try {
      const res = await axios.post(FORGOT_API.verifyOtp(), { email: fpEmail, otp: fpOtp });
      const data = res.data as { status?: string; verified?: boolean };
      const ok = data?.status === "verified" || data?.verified === true;
      if (ok) {
        setFpVerified(true);
        setFpOtpTimer(0);
        alert("인증 성공");
      } else {
        alert("인증 실패");
      }
    } catch (e) {
      const err = e as { response?: { data?: { detail?: string } } };
      alert("인증 실패: " + (err.response?.data?.detail || "오류가 발생했습니다."));
    } finally {
      setFpBusy(false);
    }
  };

  const fpResetPassword = async () => {
    if (!fpVerified) return alert("먼저 인증을 완료해주세요.");
    if (!fpNewPw || fpNewPw.length < 6) return alert("새 비밀번호를 6자 이상 입력해주세요.");
    if (fpNewPw !== fpConfirmPw) return alert("비밀번호가 일치하지 않습니다.");
    setFpBusy(true);
    try {
      await axios.post(FORGOT_API.resetPassword(), { email: fpEmail, otp: fpOtp, new_password: fpNewPw });
      alert("비밀번호가 변경되었습니다. 다시 로그인해주세요.");
      onModeChange("signin");
      setUserEmail(fpEmail);
      setUserPw("");
      setFpEmail(""); setFpOtp(""); setFpNewPw(""); setFpConfirmPw("");
      setFpOtpSent(false); setFpVerified(false); setFpOtpTimer(0);
    } catch (e) {
      const err = e as { response?: { data?: { detail?: string } } };
      alert("변경 실패: " + (err.response?.data?.detail || "오류가 발생했습니다."));
    } finally {
      setFpBusy(false);
    }
  };

  const formatTimer = (secs: number) =>
    secs <= 0 ? "만료됨" : `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, "0")}`;

  // googleEmail is stored for reference but nickname update now uses the JWT token
  void googleEmail;

  if (!isOpen && !isNicknameModalOpen) return null;

  return (
    <>
      {/* Auth Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,.45)", backdropFilter: "blur(10px)" }}
          onMouseDown={(e) => { if (e.target === e.currentTarget) handleClose(); }}
        >
          <div
            className="relative w-[min(520px,92vw)] p-[26px] rounded-[18px] border border-white/20"
            style={{
              background: "rgba(90,90,90,.55)",
              boxShadow: "0 26px 70px rgba(0,0,0,.65)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-[10px] right-[12px] w-[34px] h-[34px] rounded-full border border-white/22 flex items-center justify-center text-white/92 text-[22px] cursor-pointer"
              style={{ background: "rgba(0,0,0,.25)" }}
              type="button"
              onClick={handleClose}
              aria-label="Close"
            >
              ×
            </button>

            <div className="text-center font-black tracking-[.18em] text-white/92 mb-[14px] text-[12px]">
              {mode === "signin" && "LOG IN"}
              {mode === "signup" && "SIGN UP"}
              {mode === "forgot" && "RESET PASSWORD"}
            </div>

            <div className="bg-white/96 rounded-[14px] p-[22px] text-[#141414]">
              <div className="text-center font-black tracking-[.12em] mb-[14px]">SEIHI</div>

              {/* SIGN IN */}
              {mode === "signin" && (
                <>
                  <Field label="E-mail">
                    <input className={inputCls} type="email" value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)} placeholder="example@email.com" />
                  </Field>
                  <Field label="Password">
                    <div className="relative">
                      <input
                        className={inputPwCls}
                        type={showSignInPw ? "text" : "password"}
                        value={userPw}
                        onChange={(e) => setUserPw(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSignIn()}
                        placeholder="••••••••"
                      />
                      <button type="button" className={eyeBtnCls} onClick={() => setShowSignInPw(s => !s)}>
                        {showSignInPw ? "숨기기" : "보기"}
                      </button>
                    </div>
                  </Field>
                  <button className={btnBlockCls} type="button" onClick={handleSignIn}>Log In</button>
                  <div className="mt-[10px] flex justify-between items-center">
                    <button className={linkBtnCls} type="button"
                      onClick={() => { onModeChange("forgot"); setFpEmail(userEmail || ""); }}>
                      Forgot password?
                    </button>
                    <button className={linkBtnCls} type="button" onClick={() => onModeChange("signup")}>
                      Sign up
                    </button>
                  </div>
                  <Divider />
                  <div className="flex justify-center">
                    <GoogleLogin onSuccess={handleGoogleSuccess} />
                  </div>
                </>
              )}

              {/* SIGN UP */}
              {mode === "signup" && (
                <>
                  <Field label="Nickname">
                    <div className="flex gap-2 items-center">
                      <input className={inputCls} type="text" value={newNickname}
                        onChange={(e) => { setNewNickname(e.target.value); setIsNicknameAvailable(false); }}
                        placeholder="닉네임" />
                      <button className={miniBtnCls} type="button" onClick={handleCheckNickname}>중복확인</button>
                    </div>
                    <div className={`mt-[6px] text-[10px] ${isNicknameAvailable ? "text-green-600 font-bold" : "text-black/45"}`}>
                      {isNicknameAvailable ? "사용 가능한 닉네임입니다." : "닉네임 중복 확인을 진행해주세요."}
                    </div>
                  </Field>
                  <Field label="E-mail">
                    <div className="flex gap-2 items-center">
                      <input className={inputCls} type="email" value={userEmail}
                        onChange={(e) => {
                          setUserEmail(e.target.value);
                          setIsOtpSent(false);
                          setIsEmailVerified(false);
                          setOtp("");
                          setOtpTimer(0);
                        }}
                        placeholder="example@email.com" />
                      <button className={miniBtnCls} type="button" onClick={handleSendOtp}>인증발송</button>
                    </div>
                  </Field>
                  {isOtpSent && (
                    <Field label="OTP Code">
                      <div className="flex gap-2 items-center">
                        <input className={inputCls} type="text" value={otp}
                          onChange={(e) => setOtp(e.target.value)} placeholder="인증번호" />
                        <button className={miniBtnCls} type="button" onClick={handleVerifyOtp}>확인</button>
                      </div>
                      <div className="mt-[6px] flex justify-between items-center">
                        <div className={`text-[10px] ${isEmailVerified ? "text-green-600 font-bold" : "text-black/45"}`}>
                          {isEmailVerified ? "이메일 인증 완료" : "인증번호 확인을 완료해주세요."}
                        </div>
                        {!isEmailVerified && (
                          <div className={`text-[10px] font-bold ${otpTimer <= 60 && otpTimer > 0 ? "text-red-500" : otpTimer === 0 ? "text-red-600" : "text-black/45"}`}>
                            {formatTimer(otpTimer)}
                          </div>
                        )}
                      </div>
                    </Field>
                  )}
                  <Field label="Password">
                    <div className="relative">
                      <input className={inputPwCls} type={showSignUpPw ? "text" : "password"} value={userPw}
                        onChange={(e) => setUserPw(e.target.value)} placeholder="••••••••" />
                      <button type="button" className={eyeBtnCls} onClick={() => setShowSignUpPw(s => !s)}>
                        {showSignUpPw ? "숨기기" : "보기"}
                      </button>
                    </div>
                    <div className={`mt-[6px] text-[10px] ${userPw.length > 0 && userPw.length < 6 ? "text-red-500 font-bold" : "text-black/45"}`}>
                      6자 이상 입력해주세요.
                    </div>
                  </Field>
                  <Field label="Confirm Password">
                    <div className="relative">
                      <input className={inputPwCls} type={showConfirmPw ? "text" : "password"} value={confirmPw}
                        onChange={(e) => setConfirmPw(e.target.value)} placeholder="••••••••" />
                      <button type="button" className={eyeBtnCls} onClick={() => setShowConfirmPw(s => !s)}>
                        {showConfirmPw ? "숨기기" : "보기"}
                      </button>
                    </div>
                    {confirmPw.length > 0 && (
                      <div className={`mt-[6px] text-[10px] font-bold ${userPw === confirmPw ? "text-green-600" : "text-red-500"}`}>
                        {userPw === confirmPw ? "비밀번호가 일치합니다." : "비밀번호가 일치하지 않습니다."}
                      </div>
                    )}
                  </Field>
                  <button className={btnBlockCls} type="button" onClick={handleSignUp}
                    disabled={!(isEmailVerified && isNicknameAvailable && userPw.length >= 6 && userPw === confirmPw)}>
                    Sign up!
                  </button>
                  <div className="mt-[10px] flex justify-between items-center">
                    <button className={linkBtnCls} type="button" onClick={() => onModeChange("signin")}>
                      Already have an account?
                    </button>
                    <span />
                  </div>
                </>
              )}

              {/* FORGOT PASSWORD */}
              {mode === "forgot" && (
                <>
                  <Field label="E-mail">
                    <input className={inputCls} type="email" value={fpEmail}
                      onChange={(e) => setFpEmail(e.target.value)} placeholder="example@email.com" />
                  </Field>
                  <button className={btnBlockCls} type="button" onClick={fpSendOtp} disabled={fpBusy}>
                    {fpBusy ? "Sending..." : "Send code"}
                  </button>
                  {fpOtpSent && (
                    <>
                      <Field label="OTP Code">
                        <div className="flex gap-2 items-center">
                          <input className={inputCls} type="text" value={fpOtp}
                            onChange={(e) => setFpOtp(e.target.value)} placeholder="인증코드" />
                          <button className={miniBtnCls} type="button" onClick={fpVerifyOtp} disabled={fpBusy}>확인</button>
                        </div>
                        <div className="mt-[6px] flex justify-between items-center">
                          <div className={`text-[10px] ${fpVerified ? "text-green-600 font-bold" : "text-black/45"}`}>
                            {fpVerified ? "인증 완료" : "인증코드를 확인해주세요."}
                          </div>
                          {!fpVerified && (
                            <div className={`text-[10px] font-bold ${fpOtpTimer <= 60 && fpOtpTimer > 0 ? "text-red-500" : fpOtpTimer === 0 ? "text-red-600" : "text-black/45"}`}>
                              {formatTimer(fpOtpTimer)}
                            </div>
                          )}
                        </div>
                      </Field>
                      <Field label="New Password">
                        <div className="relative">
                          <input className={inputPwCls} type={showFpNewPw ? "text" : "password"} value={fpNewPw}
                            onChange={(e) => setFpNewPw(e.target.value)}
                            placeholder="새 비밀번호(6자 이상)" disabled={!fpVerified} />
                          <button type="button" className={eyeBtnCls} onClick={() => setShowFpNewPw(s => !s)} disabled={!fpVerified}>
                            {showFpNewPw ? "숨기기" : "보기"}
                          </button>
                        </div>
                      </Field>
                      <Field label="Confirm New Password">
                        <div className="relative">
                          <input className={inputPwCls} type={showFpConfirmPw ? "text" : "password"} value={fpConfirmPw}
                            onChange={(e) => setFpConfirmPw(e.target.value)}
                            placeholder="비밀번호 확인" disabled={!fpVerified} />
                          <button type="button" className={eyeBtnCls} onClick={() => setShowFpConfirmPw(s => !s)} disabled={!fpVerified}>
                            {showFpConfirmPw ? "숨기기" : "보기"}
                          </button>
                        </div>
                        {fpConfirmPw.length > 0 && (
                          <div className={`mt-[6px] text-[10px] font-bold ${fpNewPw === fpConfirmPw ? "text-green-600" : "text-red-500"}`}>
                            {fpNewPw === fpConfirmPw ? "비밀번호가 일치합니다." : "비밀번호가 일치하지 않습니다."}
                          </div>
                        )}
                      </Field>
                      <button className={btnBlockCls} type="button" onClick={fpResetPassword}
                        disabled={!fpVerified || fpBusy}>
                        Reset password
                      </button>
                    </>
                  )}
                  <div className="mt-[10px] flex justify-between items-center">
                    <button className={linkBtnCls} type="button" onClick={() => onModeChange("signin")}>
                      Back to login
                    </button>
                    <span />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Google 신규 유저 닉네임 모달 */}
      {isNicknameModalOpen && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,.45)", backdropFilter: "blur(10px)" }}
        >
          <div
            className="relative w-[min(520px,92vw)] p-[26px] rounded-[18px] border border-white/20"
            style={{ background: "rgba(90,90,90,.55)", boxShadow: "0 26px 70px rgba(0,0,0,.65)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-[10px] right-[12px] w-[34px] h-[34px] rounded-full border border-white/22 flex items-center justify-center text-white/92 text-[22px] cursor-pointer"
              style={{ background: "rgba(0,0,0,.25)" }}
              type="button"
              onClick={() => setIsNicknameModalOpen(false)}
              aria-label="Close"
            >
              ×
            </button>
            <div className="text-center font-black tracking-[.18em] text-white/92 mb-[14px] text-[12px]">WELCOME</div>
            <div className="bg-white/96 rounded-[14px] p-[22px] text-[#141414]">
              <div className="text-center font-black tracking-[.12em] mb-[14px]">SEIHI</div>
              <div className="text-[10px] text-black/50 leading-[1.45] mb-[12px]">
                마지막 단계입니다!<br />사용하실 닉네임을 설정해주세요.
              </div>
              <Field label="Nickname">
                <div className="flex gap-2 items-center">
                  <input className={inputCls} type="text" value={newNickname}
                    onChange={(e) => { setNewNickname(e.target.value); setIsNicknameAvailable(false); }}
                    placeholder="새 닉네임" />
                  <button className={miniBtnCls} type="button" onClick={handleCheckNickname}>중복확인</button>
                </div>
                <div className={`mt-[6px] text-[10px] ${isNicknameAvailable ? "text-green-600 font-bold" : "text-black/45"}`}>
                  {isNicknameAvailable ? "사용 가능한 닉네임입니다." : "닉네임 중복 확인을 진행해주세요."}
                </div>
              </Field>
              <button className={btnBlockCls} type="button" onClick={handleUpdateNickname}
                disabled={!isNicknameAvailable}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-[12px]">
      <div className="text-[11px] font-extrabold text-black/72 mb-[6px]">{label}</div>
      {children}
    </div>
  );
}

function Divider() {
  return (
    <div className="my-[14px] flex items-center gap-[10px]">
      <span className="flex-1 h-px bg-black/12" />
      <span className="text-[11px] font-black text-black/50 tracking-[.18em]">OR</span>
      <span className="flex-1 h-px bg-black/12" />
    </div>
  );
}

const inputCls = "w-full border border-black/12 rounded-[10px] px-[12px] py-[12px] outline-none bg-[rgba(240,240,240,.9)] text-[13px]";
const inputPwCls = "w-full border border-black/12 rounded-[10px] pl-[12px] pr-[52px] py-[12px] outline-none bg-[rgba(240,240,240,.9)] text-[13px]";
const eyeBtnCls = "absolute right-[10px] top-1/2 -translate-y-1/2 text-[11px] font-bold text-black/50 cursor-pointer bg-transparent border-none p-0 disabled:opacity-40";
const miniBtnCls = "flex-none border border-black/18 bg-white/90 rounded-[10px] px-[12px] py-[10px] cursor-pointer font-black text-[11px]";
const btnBlockCls = "w-full mt-[6px] border-none bg-[#111] text-white rounded-[10px] px-[12px] py-[12px] cursor-pointer font-black tracking-[.02em] disabled:bg-black/25 disabled:cursor-not-allowed";
const linkBtnCls = "border-none bg-transparent cursor-pointer text-[11px] font-extrabold text-black/62 underline";
