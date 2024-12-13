import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Cookies from "universal-cookie";
import axios from "axios";
import Login from "./Login";
import Home from "./Home";
import Hotels from "./Hotels";
import Bookings from "./Bookings";
import HotelDetails from "./HotelsDetails"; // This should match your actual file name
import AdminHotels from "./AdminHotels";

function App() {
  const [token, setToken] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const cookies = new Cookies();

  useEffect(() => {
    const savedToken = localStorage.getItem("token") || cookies.get("token");
    const userId = localStorage.getItem("userId");
    if (savedToken && userId) {
      setToken(savedToken);
      localStorage.setItem("token", savedToken);
      cookies.set("token", savedToken, { path: "/" });
      // Aquí deberías hacer una llamada a la API para verificar si el usuario es administrador
      axios.get(`http://localhost:8080/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${savedToken}`
        }
      }).then(response => {
        setIsAdmin(response.data.admin);
      }).catch(error => {
        console.error('Error al verificar el rol del usuario:', error);
      });
    }
  }, [cookies]);

  const handleSetToken = (newToken) => {
    setToken(newToken);
    if (newToken) {
      localStorage.setItem("token", newToken);
      cookies.set("token", newToken, { path: "/" });
      const userId = localStorage.getItem("userId");
      // Aquí deberías hacer una llamada a la API para verificar si el usuario es administrador
      axios.get(`http://localhost:8080/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${newToken}`
        }
      }).then(response => {
        setIsAdmin(response.data.admin);
      }).catch(error => {
        console.error('Error al verificar el rol del usuario:', error);
      });
    } else {
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      cookies.remove("token", { path: "/" });
      setIsAdmin(false);
    }
  };

  const ProtectedRoute = ({ children }) => {
    if (!token) {
      return <Navigate to="/login" />;
    }
    return children;
  };

  const AdminRoute = ({ children }) => {
    if (!token || !isAdmin) {
      return <Navigate to="/" />;
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
              <Home token={token} setToken={handleSetToken} isAdmin={isAdmin} />
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
        <Route
          path="/admin/hotels"
          element={
            <AdminRoute>
              <AdminHotels token={token} />
            </AdminRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;