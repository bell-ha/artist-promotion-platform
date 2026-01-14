import { useEffect, useState } from "react";

// ✅ 환경 변수에서 API 주소를 가져옵니다. 없을 경우 로컬 주소를 기본값으로 사용합니다.
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

function App() {
  const [artists, setArtists] = useState([]);

  useEffect(() => {
    // ✅ API_URL을 앞에 붙여서 절대 경로로 호출합니다.
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
      <h1>🎵 Artist Promotion Platform</h1>
      <hr />
      <ul>
        {artists.length > 0 ? (
          artists.map((a) => (
            <li key={a.id}>
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

export default App;