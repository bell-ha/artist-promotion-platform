import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Main from "./pages/Main";
import MyPage from "./pages/MyPage";
import EditProfile from "./pages/EditProfile";
import Profile from "./pages/Profile";
import CategoryList from "./pages/CategoryList";
import About from "./pages/About";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Guide from "./pages/Guide";
import Footer from "./components/Footer";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Main />} />

        {/* /login으로 들어와도 Main을 보여주고, Main에서 로그인 모달을 열게 함 */}
        <Route path="/login" element={<Main />} />

        {/* 마이페이지 */}
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/mypage/edit" element={<EditProfile />} />
        <Route path="/mypage/profile" element={<Profile />} />

        {/* 카테고리 목록 (mock) */}
        <Route path="/category/:category/:item" element={<CategoryList />} />
        <Route path="/category/:category" element={<CategoryList />} />

        {/* 회사 정보 페이지 */}
        <Route path="/about" element={<About />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/guide" element={<Guide />} />

        {/* 없는 주소는 홈으로 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Footer />
    </Router>
  );
}