import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import Cookies from "universal-cookie";

const HotelDetails = ({ token }) => {
  const { id } = useParams();  // Extraer el hotelId de la URL
  const [hotel, setHotel] = useState(null);
  const [error, setError] = useState(null);
  const cookies = new Cookies();
  const token1 = cookies.get("token");
  const decodedToken = jwtDecode(token1);
  const userID = decodedToken.user_id;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHotelDetails = async () => {
      try {
        // Hacer la solicitud para obtener los detalles del hotel
        const response = await axios.get(`http://localhost:8081/hotels/${id}`, {
          headers: {
            Authorization: `Bearer ${token1}`,
          },
        });
        setHotel(response.data);  // Guardar los datos del hotel
      } catch (err) {
        setError("Error al obtener los detalles del hotel.");
        console.error("Error fetching hotel details:", err);
      }
    };

    if (id) {
      fetchHotelDetails();
    }
  }, [id, token1]);

  // Manejar si hay un error o si no hay detalles del hotel aún
  if (error) {
    return <p>{error}</p>;
  }

  if (!hotel) {
    return <p>Cargando detalles del hotel...</p>;
  }

  return (
    <div className="hotel-details-container">
      <button onClick={() => navigate(-1)}>Volver</button>

      <h1>{hotel.name}</h1>
      <p>{hotel.address}, {hotel.city}</p>
      <p>{hotel.description}</p>
      <p>Precio por noche: ${hotel.price_per_night}</p>

      {/* Mostrar imágenes del hotel */}
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

      <p>Disponible desde: {new Date(hotel.available_from).toLocaleDateString()}</p>
      <p>Disponible hasta: {new Date(hotel.available_until).toLocaleDateString()}</p>

      <button onClick={() => alert("¡Reserva tu estancia aquí!")}>Reservar este hotel</button>
    </div>
  );
};

export default HotelDetails;