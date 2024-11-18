import React from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import './Home.css';

const Home = ({ token, setToken }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    setToken(null);
    navigate('/login');
  };

  if (!token) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="home-container">
      <h1>Bienvenido a la Gestión de Hoteles</h1>
      <div className="welcome-content">
        <p>Has iniciado sesión con éxito.</p>
        <p className="token-info">Token: {token.slice(0, 20)}...</p>
        <div className="dashboard">
          <h2>Panel de Control</h2>
          <div className="dashboard-cards">
            <div className="card" onClick={() => navigate('/rooms')}>
              <h3>Gestión de Habitaciones</h3>
              <p>Agregar, editar o eliminar habitaciones.</p>
            </div>
            <div className="card" onClick={() => navigate('/bookings')}>
              <h3>Reservas</h3>
              <p>Ver y gestionar reservas de clientes.</p>
            </div>
            <div className="card" onClick={() => navigate('/customers')}>
              <h3>Clientes</h3>
              <p>Gestionar información de clientes y reseñas.</p>
            </div>
            <div className="card" onClick={() => navigate('/hotels')}>
              <h3>Hoteles</h3>
              <p>Buscar y explorar hoteles disponibles.</p>
            </div>
          </div>
        </div>
        <button className="logout-button" onClick={handleLogout}>
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
};

export default Home;