import React, { useState } from "react";
import axios from "axios";
import "./Hotels.css";
import { useNavigate } from "react-router-dom"; // Importar useNavigate
import  {jwtDecode} from "jwt-decode";
import Cookies from "universal-cookie";


const Hotels = ({ token }) => {
  const [hotels, setHotels] = useState([]); // Lista de hoteles
  const [searchQuery, setSearchQuery] = useState(""); // Consulta de búsqueda
  const [reservationStatus, setReservationStatus] = useState(""); // Estado de la reserva
  const [checkInDate, setCheckInDate] = useState(""); // Fecha de check-in
  const [checkOutDate, setCheckOutDate] = useState(""); // Fecha de check-out
  const [showConfirmModal, setShowConfirmModal] = useState(false); // Para mostrar el modal de confirmación
  const [hotelToReserve, setHotelToReserve] = useState(null); // Guardamos el hotel seleccionado
  const navigate = useNavigate(); // Usar el hook useNavigate

  
  const cookies = new Cookies();
  const token1 = cookies.get("token");
const decodedToken =  jwtDecode(token1);
const userID = decodedToken.user_id;
const username = decodedToken.username;
console.log("User ID desde el token:", userID);


  // Buscar hoteles
  const fetchHotels = async () => {
    try {
      const response = await axios.get("http://localhost:8082/search", {
        params: { q: searchQuery, offset: 0, limit: 10 },
        headers: { Authorization: `Bearer ${token}` },
      });
      setHotels(response.data); // Guardamos los hoteles encontrados
      setReservationStatus(""); // Limpia mensajes anteriores
    } catch (err) {
      console.error("Error fetching hotels:", err);
      setReservationStatus("No se pudieron obtener los hoteles. Intente nuevamente.");
    }
  };

  // Confirmar la reserva
  const handleConfirmReserve = async () => {
    if (!checkInDate || !checkOutDate) {
      setReservationStatus("Por favor, selecciona las fechas de Check-in y Check-out.");
      return;
    }

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    if (checkIn >= checkOut) {
      setReservationStatus("La fecha de Check-out debe ser posterior a la de Check-in.");
      return;
    }

    // Encontrar el nombre del hotel usando el hotelToReserve
    const selectedHotel = hotels.find(hotel => hotel.id === hotelToReserve);

    // Asegurarse de que encontramos el hotel
    if (!selectedHotel) {
      setReservationStatus("No se encontró el hotel seleccionado.");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:8081/hotels/reservations",
        {
          hotel_id: hotelToReserve,
          hotel_name: selectedHotel.name, // Añadimos el nombre del hotel aquí
          user_id: String(userID), // Reemplazar con el ID de usuario real
          check_in: checkIn,
          check_out: checkOut
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setReservationStatus("Reserva realizada con éxito!");
      setShowConfirmModal(false); // Cerrar el modal
    } catch (err) {
      console.error("Error reservando hotel:", err);
      setReservationStatus("Error al realizar la reserva. Intente de nuevo.");
    }
  };

  // Mostrar el modal de confirmación
  const handleReserve = (hotelId) => {
    setHotelToReserve(hotelId); // Guardamos el hotel que el usuario quiere reservar
    setShowConfirmModal(true); // Mostramos el modal
  };

  // Cerrar el modal
  const closeModal = () => {
    setShowConfirmModal(false);
  };

  // Función para navegar hacia atrás
  const handleGoBack = () => {
    navigate(-1); // Esto hace que el navegador vuelva a la página anterior
  };

  return (
    <div className="hotels-container">
      <h1>Hoteles Disponibles</h1>

      <div>
        <input
          type="text"
          placeholder="Buscar hoteles..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button onClick={fetchHotels}>Buscar</button>
      </div>

      <div>
        <input
          type="date"
          value={checkInDate}
          onChange={(e) => setCheckInDate(e.target.value)}
          placeholder="Fecha de Check-in"
        />
        <input
          type="date"
          value={checkOutDate}
          onChange={(e) => setCheckOutDate(e.target.value)}
          placeholder="Fecha de Check-out"
        />
      </div>

      {reservationStatus && <p style={{ color: reservationStatus.includes("Error") ? "red" : "green" }}>{reservationStatus}</p>}

      <ul>
        {hotels.length === 0 ? (
          <p>No se encontraron hoteles. Intente otra búsqueda.</p>
        ) : (
          hotels.map((hotel) => (
            <li key={hotel.id}>
              <h3>{hotel.name}</h3>
              <p>{hotel.address}, {hotel.city}</p>
              <p>Precio: ${hotel.price}</p>
              <button onClick={() => handleReserve(hotel.id)}>Reservar</button>
            </li>
          ))
        )}
      </ul>

      {/* Modal de confirmación */}
      {showConfirmModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>¿Estás seguro que quieres reservar este hotel?</h3>
            <button onClick={handleConfirmReserve}>Confirmar Reserva</button>
            <button onClick={closeModal}>Cancelar</button>
          </div>
        </div>
      )}

      {/* Botón para volver */}
      <button onClick={handleGoBack}>Volver</button>
    </div>
  );
};

export default Hotels;
