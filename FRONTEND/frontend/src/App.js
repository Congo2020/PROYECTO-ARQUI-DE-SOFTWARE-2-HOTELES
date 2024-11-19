import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Cookies from "universal-cookie";
import Login from "./Login";
import Home from "./Home";
import Hotels from "./Hotels";
import Bookings from "./Bookings";
import HotelDetails from "./HotelsDetails";

function App() {
  const [token, setToken] = useState(null);
  const cookies = new Cookies();

  useEffect(() => {
    const savedToken = localStorage.getItem("token") || cookies.get("token");
    if (savedToken) {
      setToken(savedToken);
      localStorage.setItem("token", savedToken);
      cookies.set("token", savedToken, { path: "/" });
    }
  }, []);

  const handleSetToken = (newToken) => {
    setToken(newToken);
    if (newToken) {
      localStorage.setItem("token", newToken);
      cookies.set("token", newToken, { path: "/" });
    } else {
      localStorage.removeItem("token");
      cookies.remove("token", { path: "/" });
    }
  };

  const ProtectedRoute = ({ children }) => {
    if (!token) {
      return <Navigate to="/login" />;
    }
    return children;
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={token ? <Navigate to="/" /> : <Login token={token} setToken={handleSetToken} />}
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home token={token} setToken={handleSetToken} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hotels"
          element={
            <ProtectedRoute>
              <Hotels token={token} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hotels/:id"
          element={
            <ProtectedRoute>
              <HotelDetails token={token} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bookings"
          element={
            <ProtectedRoute>
              <Bookings token={token} />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;