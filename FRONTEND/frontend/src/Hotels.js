import React, { useState } from "react";
import axios from "axios";
import "./Hotels.css";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import Cookies from "universal-cookie";

const Hotels = ({ token }) => {
  const [hotels, setHotels] = useState([]);
  const [availability, setAvailability] = useState({}); // Estado para la disponibilidad
  const [searchQuery, setSearchQuery] = useState("");
  const [reservationStatus, setReservationStatus] = useState("");
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [hotelToReserve, setHotelToReserve] = useState(null);
  const navigate = useNavigate();

  const cookies = new Cookies();
  const token1 = cookies.get("token");
  const decodedToken = jwtDecode(token1);
  const userID = decodedToken.user_id;

  // Obtener la fecha actual en formato adecuado (YYYY-MM-DD)
  const today = new Date().toISOString().split("T")[0];

  // Buscar hoteles
  const fetchHotels = async () => {
    try {
      const response = await axios.get("http://localhost:8082/search", {
        params: { q: searchQuery, offset: 0, limit: 10 },
        headers: { Authorization: `Bearer ${token}` },
      });
      setHotels(response.data);
      setReservationStatus("");
    } catch (err) {
      console.error("Error fetching hotels:", err);
      setReservationStatus("No se pudieron obtener los hoteles. Intente nuevamente.");
    }
  };

  const checkAvailability = async () => {
    if (!checkInDate || !checkOutDate) {
      setReservationStatus("Por favor, selecciona las fechas de Check-in y Check-out.");
      return;
    }
  
    const hotelIDs = hotels.map((hotel) => hotel.id); // Obtener IDs de los hoteles
    try {
      const response = await axios.post(
        "http://localhost:8081/hotels/availability",
        {
          hotel_ids: hotelIDs,
          check_in: checkInDate,
          check_out: checkOutDate,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      const availabilityMap = response.data; // Usar el objeto directamente
      setAvailability(availabilityMap); // Guardar disponibilidad
    } catch (err) {
      console.error("Error checking availability:", err);
      setReservationStatus("Error al verificar la disponibilidad.");
    }
  };
  
  // Confirmar la reserva
  const handleConfirmReserve = async () => {
    if (!checkInDate || !checkOutDate) {
      setReservationStatus("Por favor, selecciona las fechas de Check-in y Check-out.");
      return;
    }

    const selectedHotel = hotels.find((hotel) => hotel.id === hotelToReserve);
    if (!selectedHotel) {
      setReservationStatus("No se encontró el hotel seleccionado.");
      return;
    }

    try {
      const checkIn = new Date(checkInDate);
      const checkOut = new Date(checkOutDate);
      await axios.post(
        "http://localhost:8081/hotels/reservations",
        {
          hotel_id: hotelToReserve,
          hotel_name: selectedHotel.name,
          user_id: String(userID),
          check_in: checkIn,
          check_out: checkOut,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setReservationStatus("Reserva realizada con éxito!");
      setShowConfirmModal(false);
    } catch (err) {
      console.error("Error reservando hotel:", err);
      setReservationStatus("Error al realizar la reserva. Intente de nuevo.");
    }
  };

  // Mostrar el modal de confirmación
  const handleReserve = (hotelId) => {
    setHotelToReserve(hotelId);
    setShowConfirmModal(true);
  };

  const closeModal = () => {
    setShowConfirmModal(false);
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
          min={today} // Establecer la fecha mínima como hoy
        />
        <input
          type="date"
          value={checkOutDate}
          onChange={(e) => setCheckOutDate(e.target.value)}
          placeholder="Fecha de Check-out"
          min={checkInDate || today} // Establecer la fecha mínima como la fecha de check-in o hoy
        />
        <button onClick={checkAvailability}>Verificar Disponibilidad</button>
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
          

              <div className="hotel-images">
                {hotel.images?.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Imagen ${index + 1} de ${hotel.name}`}
                    className="hotel-image"
                  />
                ))}
              </div>

              <button
                onClick={() => handleReserve(hotel.id)}
                style={{
                  backgroundColor: availability[hotel.id] ? "green" : "grey",
                  cursor: availability[hotel.id] ? "pointer" : "not-allowed",
                }}
                disabled={!availability[hotel.id]}
              >
                Reservar
              </button>
              <button onClick={() => navigate(`/hotels/${hotel.id}`)}>Ver más</button>
            </li>
          ))
        )}
      </ul>

      {showConfirmModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>¿Estás seguro que quieres reservar este hotel?</h3>
            <button onClick={handleConfirmReserve}>Confirmar Reserva</button>
            <button onClick={closeModal}>Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Hotels;