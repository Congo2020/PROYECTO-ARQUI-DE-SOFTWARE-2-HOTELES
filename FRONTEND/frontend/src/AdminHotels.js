import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './AdminHotels.css';

const AdminHotels = ({ token }) => {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [country, setCountry] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [pricePerNight, setPricePerNight] = useState('');
    const [rating, setRating] = useState('');
    const [availableRooms, setAvailableRooms] = useState('');
    const [checkInTime, setCheckInTime] = useState('');
    const [checkOutTime, setCheckOutTime] = useState('');
    const [amenities, setAmenities] = useState('');
    const [images, setImages] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        switch (name) {
            case 'name':
                setName(value);
                break;
            case 'description':
                setDescription(value);
                break;
            case 'address':
                setAddress(value);
                break;
            case 'city':
                setCity(value);
                break;
            case 'state':
                setState(value);
                break;
            case 'country':
                setCountry(value);
                break;
            case 'phone':
                setPhone(value);
                break;
            case 'email':
                setEmail(value);
                break;
            case 'pricePerNight':
                setPricePerNight(value);
                break;
            case 'rating':
                setRating(value);
                break;
            case 'availableRooms':
                setAvailableRooms(value);
                break;
            case 'checkInTime':
                setCheckInTime(value);
                break;
            case 'checkOutTime':
                setCheckOutTime(value);
                break;
            case 'amenities':
                setAmenities(value);
                break;
            case 'images':
                setImages(value);
                break;
            default:
                break;
        }
        setError('');
    };

    const resetForm = () => {
        setName('');
        setDescription('');
        setAddress('');
        setCity('');
        setState('');
        setCountry('');
        setPhone('');
        setEmail('');
        setPricePerNight('');
        setRating('');
        setAvailableRooms('');
        setCheckInTime('');
        setCheckOutTime('');
        setAmenities('');
        setImages('');
        setError('');
    };

    const validateForm = () => {
        if (!name || !description || !address || !city || !state || !country || !phone || !email || !pricePerNight || !rating || !availableRooms || !checkInTime || !checkOutTime || !amenities || !images) {
            setError('Por favor complete todos los campos');
            return false;
        }
        return true;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!validateForm()) return;

        setLoading(true);
        try {
            const response = await axios.post('http://localhost:8081/hotels', {
                name,
                description,
                address,
                city,
                state,
                country,
                phone,
                email,
                price_per_night: parseFloat(pricePerNight),
                rating: parseFloat(rating),
                available_rooms: parseInt(availableRooms, 10),
                check_in_time: checkInTime,
                check_out_time: checkOutTime,
                amenities: amenities.split(',').map(item => item.trim()),
                images: images.split(',').map(item => item.trim())
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.data.id) {
                alert('Hotel creado exitosamente');
                resetForm();
                navigate('/hotels');
            }
        } catch (error) {
            setError(error.response?.data?.error || 'Error al crear hotel');
            console.error('Error al crear hotel:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-hotels-container">
            <h1>Crear Hotel</h1>
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleSubmit} className="admin-hotels-form" noValidate>
                <div className="form-group">
                    <input
                        type="text"
                        name="name"
                        value={name}
                        onChange={handleInputChange}
                        required
                        autoComplete="off"
                        spellCheck="false"
                        autoCapitalize="off"
                        className="form-input"
                        placeholder="Nombre del Hotel"
                    />
                </div>
                <div className="form-group">
                    <textarea
                        name="description"
                        value={description}
                        onChange={handleInputChange}
                        required
                        autoComplete="off"
                        spellCheck="false"
                        autoCapitalize="off"
                        className="form-input"
                        placeholder="Descripción del Hotel"
                    />
                </div>
                <div className="form-group">
                    <input
                        type="text"
                        name="address"
                        value={address}
                        onChange={handleInputChange}
                        required
                        autoComplete="off"
                        spellCheck="false"
                        autoCapitalize="off"
                        className="form-input"
                        placeholder="Dirección del Hotel"
                    />
                </div>
                <div className="form-group">
                    <input
                        type="text"
                        name="city"
                        value={city}
                        onChange={handleInputChange}
                        required
                        autoComplete="off"
                        spellCheck="false"
                        autoCapitalize="off"
                        className="form-input"
                        placeholder="Ciudad"
                    />
                </div>
                <div className="form-group">
                    <input
                        type="text"
                        name="state"
                        value={state}
                        onChange={handleInputChange}
                        required
                        autoComplete="off"
                        spellCheck="false"
                        autoCapitalize="off"
                        className="form-input"
                        placeholder="Estado"
                    />
                </div>
                <div className="form-group">
                    <input
                        type="text"
                        name="country"
                        value={country}
                        onChange={handleInputChange}
                        required
                        autoComplete="off"
                        spellCheck="false"
                        autoCapitalize="off"
                        className="form-input"
                        placeholder="País"
                    />
                </div>
                <div className="form-group">
                    <input
                        type="text"
                        name="phone"
                        value={phone}
                        onChange={handleInputChange}
                        required
                        autoComplete="off"
                        spellCheck="false"
                        autoCapitalize="off"
                        className="form-input"
                        placeholder="Teléfono"
                    />
                </div>
                <div className="form-group">
                    <input
                        type="email"
                        name="email"
                        value={email}
                        onChange={handleInputChange}
                        required
                        autoComplete="off"
                        spellCheck="false"
                        autoCapitalize="off"
                        className="form-input"
                        placeholder="Correo Electrónico"
                    />
                </div>
                <div className="form-group">
                    <input
                        type="number"
                        name="pricePerNight"
                        value={pricePerNight}
                        onChange={handleInputChange}
                        required
                        autoComplete="off"
                        spellCheck="false"
                        autoCapitalize="off"
                        className="form-input"
                        placeholder="Precio por Noche"
                    />
                </div>
                <div className="form-group">
                    <input
                        type="number"
                        name="rating"
                        value={rating}
                        onChange={handleInputChange}
                        required
                        autoComplete="off"
                        spellCheck="false"
                        autoCapitalize="off"
                        className="form-input"
                        placeholder="Calificación"
                    />
                </div>
                <div className="form-group">
                    <input
                        type="number"
                        name="availableRooms"
                        value={availableRooms}
                        onChange={handleInputChange}
                        required
                        autoComplete="off"
                        spellCheck="false"
                        autoCapitalize="off"
                        className="form-input"
                        placeholder="Habitaciones Disponibles"
                    />
                </div>
                <div className="form-group">
                    <input
                        type="datetime-local"
                        name="checkInTime"
                        value={checkInTime}
                        onChange={handleInputChange}
                        required
                        autoComplete="off"
                        spellCheck="false"
                        autoCapitalize="off"
                        className="form-input"
                        placeholder="Hora de Check-In"
                    />
                </div>
                <div className="form-group">
                    <input
                        type="datetime-local"
                        name="checkOutTime"
                        value={checkOutTime}
                        onChange={handleInputChange}
                        required
                        autoComplete="off"
                        spellCheck="false"
                        autoCapitalize="off"
                        className="form-input"
                        placeholder="Hora de Check-Out"
                    />
                </div>
                <div className="form-group">
                    <textarea
                        name="amenities"
                        value={amenities}
                        onChange={handleInputChange}
                        required
                        autoComplete="off"
                        spellCheck="false"
                        autoCapitalize="off"
                        className="form-input"
                        placeholder="Comodidades (separadas por comas)"
                    />
                </div>
                <div className="form-group">
                    <textarea
                        name="images"
                        value={images}
                        onChange={handleInputChange}
                        required
                        autoComplete="off"
                        spellCheck="false"
                        autoCapitalize="off"
                        className="form-input"
                        placeholder="URLs de Imágenes (separadas por comas)"
                    />
                </div>
                <button 
                    type="submit" 
                    disabled={loading || !name || !description || !address || !city || !state || !country || !phone || !email || !pricePerNight || !rating || !availableRooms || !checkInTime || !checkOutTime || !amenities || !images}
                    className="submit-button"
                >
                    {loading ? 'Cargando...' : 'Crear Hotel'}
                </button>
            </form>
        </div>
    );
};

export default AdminHotels;