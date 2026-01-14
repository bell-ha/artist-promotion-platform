import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
// import "./index.css";  <-- 이 줄을 지우거나 주석 처리하세요!
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);