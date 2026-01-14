import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Main from './pages/Main';
import LoginPage from './pages/LoginPage';

function App() {
  return (
    <Router>
      <Routes>
        {/* "/" 주소일 때는 Main 페이지를 보여줌 */}
        <Route path="/" element={<Main />} />
        
        {/* "/login" 주소일 때는 LoginPage 페이지를 보여줌 */}
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </Router>
  );
}

export default App;