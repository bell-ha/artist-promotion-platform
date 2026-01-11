import { useEffect, useState } from "react";

function App() {
  const [artists, setArtists] = useState([]);

  useEffect(() => {
    fetch("/api/artists")
      .then((res) => res.json())
      .then(setArtists)
      .catch(console.error);
  }, []);

  return (
    <div>
      <h1>Artists</h1>
      <ul>
        {artists.map((a) => (
          <li key={a.id}>{a.name}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
