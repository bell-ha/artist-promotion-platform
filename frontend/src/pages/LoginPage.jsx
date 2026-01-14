import React, { useState } from 'react';
import axios from 'axios';

const LoginPage = () => {
  const [isDirect, setIsDirect] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, { email, password });
      localStorage.setItem('token', res.data.access_token);
      alert(`${res.data.nickname}님 환영합니다!`);
      window.location.href = '/';
    } catch (err) {
      alert("로그인 실패!");
    }
  };

  return (
    <div style={{ padding: '50px', textAlign: 'center' }}>
      <h1>로그인</h1>
      {!isDirect ? (
        <>
          <button onClick={() => alert("구글 연동 준비 중!")} style={btnStyle}>구글 계정으로 로그인</button><br/>
          <button onClick={() => setIsDirect(true)} style={btnStyle}>직접 이메일로 로그인</button>
        </>
      ) : (
        <form onSubmit={handleLogin} style={{ display: 'inline-block', textAlign: 'left' }}>
          <input type="email" placeholder="이메일" onChange={e => setEmail(e.target.value)} /><br/>
          <input type="password" placeholder="비밀번호" onChange={e => setPassword(e.target.value)} /><br/>
          <button type="submit">로그인 하기</button>
        </form>
      )}
    </div>
  );
};

const btnStyle = { margin: '10px', padding: '10px 20px', cursor: 'pointer' };
export default LoginPage;