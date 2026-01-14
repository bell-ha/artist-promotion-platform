import { Link } from "react-router-dom"; // 페이지 이동을 위해 필요

function Main() {
  // 아티스트 관련 state와 useEffect를 모두 삭제했습니다.

  return (
    <div style={{ 
      padding: "40px", 
      textAlign: "center", 
      maxWidth: "800px", 
      margin: "0 auto",
      fontFamily: "sans-serif"
    }}>
      <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '40px' 
      }}>
        <h1 style={{ margin: 0, fontSize: '24px', color: '#333' }}>
          🎵 Artist Promotion Platform
        </h1>
        
        {/* 로그인 페이지로 이동하는 버튼 */}
        <Link to="/login">
          <button style={{ 
            padding: '10px 20px', 
            backgroundColor: '#007bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold'
          }}>
            로그인 하러가기
          </button>
        </Link>
      </header>

      <hr style={{ border: '0.5px solid #eee' }} />

      <main style={{ marginTop: '60px' }}>
        <h2 style={{ fontSize: '32px', marginBottom: '20px' }}>
          당신의 예술을 세상과 연결하세요.
        </h2>
        <p style={{ fontSize: '18px', color: '#666', lineHeight: '1.6' }}>
          이 플랫폼은 아티스트들의 홍보와 성장을 지원합니다.<br />
          로그인하여 더 많은 기능을 탐색해 보세요.
        </p>

        <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'center', gap: '20px' }}>
          <div style={cardStyle}>✨ 포트폴리오 관리</div>
          <div style={cardStyle}>🌍 글로벌 네트워크</div>
          <div style={cardStyle}>📈 성장 분석</div>
        </div>
      </main>
    </div>
  );
}

// 간단한 카드 스타일
const cardStyle = {
  padding: '20px',
  border: '1px solid #ddd',
  borderRadius: '12px',
  width: '150px',
  fontSize: '14px',
  fontWeight: '600',
  color: '#444',
  backgroundColor: '#f9f9f9'
};

export default Main;