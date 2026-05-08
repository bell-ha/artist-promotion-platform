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
import Upgrade from "./pages/Upgrade";
import Footer from "./components/Footer";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <div key={location.pathname} className="page-transition">
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/login" element={<Main />} />

        <Route path="/mypage" element={<MyPage />} />
        <Route path="/mypage/edit" element={<EditProfile />} />
        <Route path="/mypage/profile" element={<Profile />} />

        <Route path="/category/:category/:item" element={<CategoryList />} />
        <Route path="/category/:category" element={<CategoryList />} />

        <Route path="/upgrade" element={<Upgrade />} />

        <Route path="/about" element={<About />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/guide" element={<Guide />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <AnimatedRoutes />
      <Footer />
    </Router>
  );
}
