import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Importar useNavigate
import { jwtDecode } from "jwt-decode"; // Asegúrate de importar jwt-decode
import Cookies from "universal-cookie";
import "./Bookings.css";


const Bookings = ({ token }) => {
  const [reservations, setReservations] = useState([]); // Lista de reservas
  const [reservationStatus, setReservationStatus] = useState(""); // Mensajes
  const navigate = useNavigate(); // Usar el hook useNavigate

  // Obtener userID desde el token
  const cookies = new Cookies();
  const token1 = cookies.get("token");
  const decodedToken = jwtDecode(token1); // Decodificar el token
  const userID = decodedToken.user_id; // Obtener el ID del usuario
  console.log("User ID desde el token:", userID); // Log para verificar

  // Traer las reservas del usuario
  const fetchReservations = async () => {
    try {
      const response = await axios.get(`http://localhost:8081/users/${userID}/reservations`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Verifica si la respuesta incluye el nombre del hotel
      console.log(response.data); // Agrega este log para verificar la estructura de la respuesta

      setReservations(response.data); // Aquí se guarda la lista de reservas
    } catch (err) {
      console.error("Error fetching reservations:", err);
      setReservationStatus("No se pudieron obtener las reservas. Intente nuevamente.");
    }
  };

  // Cancelar una reserva
  const handleCancelReservation = async (reservationId) => {
    const confirmCancel = window.confirm("¿Estás seguro de que deseas cancelar esta reserva?");
    if (!confirmCancel) return;

    try {
      await axios.delete(`http://localhost:8081/hotels/reservations/${reservationId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReservationStatus("Reserva cancelada con éxito!");
      fetchReservations(); // Refresca las reservas después de cancelar
    } catch (err) {
      console.error("Error cancelando reserva:", err);
      setReservationStatus("Error al cancelar la reserva. Intente de nuevo.");
    }
  };

  // Función para navegar hacia atrás
  const handleGoBack = () => {
    navigate(-1); // Esto hace que el navegador vuelva a la página anterior
  };

  useEffect(() => {
    fetchReservations();
  }, [token, userID]); // Dependencia del token y userID para actualizar las reservas cuando cambian

  return (
    <div className="reservations-container">
      <h1>Mis Reservas</h1>

      {/* Mensajes */}
      {reservationStatus && <p style={{ color: reservationStatus.includes("Error") ? "red" : "green" }}>{reservationStatus}</p>}

      {/* Lista de reservas */}
      <ul>
        {reservations.length === 0 ? (
          <p>No tienes reservas. Realiza una nueva reserva.</p>
        ) : (
          reservations.map((reservation) => (
            <li key={reservation.id}>
              {/* Asegúrate de que el nombre del hotel esté disponible */}
              <h3>{reservation.hotel_name || "Hotel desconocido"}</h3> 
              <p>Check-in: {new Date(reservation.check_in).toLocaleDateString()}</p>
              <p>Check-out: {new Date(reservation.check_out).toLocaleDateString()}</p>
              <button onClick={() => handleCancelReservation(reservation.id)}>Cancelar Reserva</button>
            </li>
          ))
        )}
      </ul>

      {/* Botón para volver */}
      <button onClick={handleGoBack}>Volver</button>
    </div>
  );
};

export default Bookings;
