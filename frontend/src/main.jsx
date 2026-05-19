import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./index.css";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Predict from "./pages/Predict";
import Students from "./pages/Students";
import History from "./pages/History";
import NotFound from "./pages/NotFound";
import Layout from "./components/Layout";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
};

function App() {
  const [dark, setDark] = useState(
    () => localStorage.getItem("theme") === "dark"
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login dark={dark} setDark={setDark} />} />
        <Route path="/signup" element={<Signup dark={dark} setDark={setDark} />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout dark={dark} setDark={setDark} />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="predict" element={<Predict />} />
          <Route path="students" element={<Students />} />
          <Route path="history" element={<History />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
