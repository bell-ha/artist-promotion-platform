import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Main from "./pages/Main";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Main />} />

        {/* /login으로 들어와도 Main을 보여주고, Main에서 로그인 모달을 열게 함 */}
        <Route path="/login" element={<Main />} />

        {/* 없는 주소는 홈으로 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}