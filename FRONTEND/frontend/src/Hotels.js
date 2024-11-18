import React, { useEffect, useState } from 'react';
import axios from "axios";
import './Hotels.css';

const Hotels = ({ token }) => {
  const [hotels, setHotels] = useState([]); // Estado para almacenar hoteles
  const [searchQuery, setSearchQuery] = useState(""); // Estado para la barra de búsqueda
  const [error, setError] = useState("");
  const [reservationStatus, setReservationStatus] = useState(""); // Para mostrar si la reserva fue exitosa

  const fetchHotels = async () => {
    try {
      const response = await axios.get(`http://localhost:8082/search`, {
        params: {
          q: searchQuery,
          offset: 0,
          limit: 10
        },
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      setHotels(response.data);
      setError("");
    } catch (err) {
      console.error("Error fetching hotels:", err);
      setError("Failed to fetch hotels. Please try again.");
    }
  };

  const handleReserve = async (hotelId) => {
    const reservation = {
      hotel_id: hotelId,
      user_id: "user123", // Asumimos un ID de usuario. En un proyecto real, obtén esto del estado de autenticación.
      date: new Date(),
      status: "reservado"
    };

    try {
      const response = await axios.post(`http://localhost:8082/reserve`, reservation, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      setReservationStatus("Reserva realizada con éxito!");
    } catch (err) {
      console.error("Error reservando hotel:", err);
      setReservationStatus("Error al realizar la reserva. Intente de nuevo.");
    }
  };

  return (
    <div className="hotels-container">
      <h1>Hoteles</h1>
      <input
        type="text"
        placeholder="Buscar hoteles..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <button onClick={fetchHotels}>Buscar</button>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {reservationStatus && <p style={{ color: "green" }}>{reservationStatus}</p>}

      <ul>
        {hotels.map((hotel) => (
          <li key={hotel.id}>
            <h3>{hotel.name}</h3>
            <p>{hotel.address}, {hotel.city}, {hotel.state}</p>
            <p>Rating: {hotel.rating}</p>
            <p>Amenities: {hotel.amenities.join(", ")}</p>
            <button onClick={() => handleReserve(hotel.id)}>Reservar</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Hotels;
