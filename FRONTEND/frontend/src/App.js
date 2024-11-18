import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Login from "./Login";
import Home from "./Home"; // Add this import
import Hotels from './Hotels';

function App() {
  const [token, setToken] = useState(null);

  // Protected Route component
  const ProtectedRoute = ({ children }) => {
    if (!token) {
      return <Navigate to="/login" />;
    }
    return children;
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={
          token ? <Navigate to="/" /> : <Login token={token} setToken={setToken} />
        } />
        <Route path="/" element={
          <ProtectedRoute>
            <Home token={token} setToken={setToken} />
          </ProtectedRoute>
        } />
        <Route path="/hotels" element={
  <ProtectedRoute>
    <Hotels token={token} />
  </ProtectedRoute>
} />
      </Routes>
    </Router>
  );
}

export default App;