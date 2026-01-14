import { useEffect, useState } from "react";
import { Link } from "react-router-dom"; // 페이지 이동을 위해 필요

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

function Main() {
  const [artists, setArtists] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/api/artists`)
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then(setArtists)
      .catch((err) => console.error("Fetch error:", err));
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>🎵 Artist Promotion Platform</h1>
        {/* 로그인 페이지로 가는 링크 추가 */}
        <Link to="/login">
          <button style={{ padding: '8px 16px', cursor: 'pointer' }}>로그인 하러가기</button>
        </Link>
      </div>
      <hr />
      <ul>
        {artists.length > 0 ? (
          artists.map((a) => (
            <li key={a.id} style={{ marginBottom: '20px' }}>
              <strong>{a.name}</strong> - {a.genre} ({a.country})
              {a.image_url && (
                <div>
                  <img src={a.image_url} alt={a.name} width="200" style={{ borderRadius: '8px', marginTop: '10px' }} />
                </div>
              )}
            </li>
          ))
        ) : (
          <p>아티스트 정보가 없습니다.</p>
        )}
      </ul>
    </div>
  );
}

export default Main;