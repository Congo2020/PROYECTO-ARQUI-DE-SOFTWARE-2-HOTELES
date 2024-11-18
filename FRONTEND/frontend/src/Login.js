import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Cookies from 'universal-cookie';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const cookies = new Cookies();

const Login = ({ token, setToken }) => {
    const navigate = useNavigate();
    const [register, setRegister] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (token) {
            navigate("/");
        }
    }, [token, navigate]);

    // Simplified input handler
    const handleInputChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setError(''); // Clear error on input change
    }, []);

    const resetForm = useCallback(() => {
        setFormData({ username: '', password: '' });
        setError('');
    }, []);

    const validateForm = () => {
        if (!formData.username || !formData.password) {
            setError('Por favor complete todos los campos');
            return false;
        }
        return true;
    };

    const handleSubmitRegister = async (event) => {
        event.preventDefault();
        if (!validateForm()) return;
        
        setLoading(true);
        try {
            const response = await axios.post('http://localhost:8080/users', formData, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.data.id) {
                alert('Usuario creado exitosamente');
                setRegister(false);
                resetForm();
            }
        } catch (error) {
            setError(error.response?.data?.error || 'Error al crear usuario');
            console.error('Error de registro:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitLogin = async (event) => {
        event.preventDefault();
        if (!validateForm()) return;
    
        setLoading(true);
        try {
            const response = await axios.post('http://localhost:8080/login', formData, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
    
            if (response.data.token) {
                // Add console.log to debug
                console.log('Login successful, token:', response.data.token);
                setToken(response.data.token);
                cookies.set('rol', response.data.role, { path: '/' });
                navigate('/');
            }
        } catch (error) {
            setError(error.response?.data?.error || 'Error al iniciar sesión');
            console.error('Error de login:', error);
        } finally {
            setLoading(false);
        }
    };
    
    const FormField = ({ type, name, label, value, onChange, disabled }) => (
        <div className="form-group">
            <label htmlFor={name}>{label}</label>
            <input
                type={type}
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                disabled={disabled}
                required
                autoComplete="off"
                spellCheck="false"
                autoCapitalize="off"
                className="form-input"
            />
        </div>
    );

    const LoginForm = () => (
        <div className="login-container">
            <h1>Iniciar Sesión</h1>
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleSubmitLogin} className="login-form" noValidate>
                <FormField
                    type="text"
                    name="username"
                    label="Usuario"
                    value={formData.username}
                    onChange={handleInputChange}
                    disabled={loading}
                />
                <FormField
                    type="password"
                    name="password"
                    label="Contraseña"
                    value={formData.password}
                    onChange={handleInputChange}
                    disabled={loading}
                />
                <button 
                    type="submit" 
                    disabled={loading || !formData.username || !formData.password}
                    className="submit-button"
                >
                    {loading ? 'Cargando...' : 'Iniciar Sesión'}
                </button>
            </form>
        </div>
    );

    const RegisterForm = () => (
        <div className="login-container">
            <h1>Crear Usuario</h1>
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleSubmitRegister} className="login-form" noValidate>
                <FormField
                    type="text"
                    name="username"
                    label="Usuario"
                    value={formData.username}
                    onChange={handleInputChange}
                    disabled={loading}
                />
                <FormField
                    type="password"
                    name="password"
                    label="Contraseña"
                    value={formData.password}
                    onChange={handleInputChange}
                    disabled={loading}
                />
                <button 
                    type="submit" 
                    disabled={loading || !formData.username || !formData.password}
                    className="submit-button"
                >
                    {loading ? 'Cargando...' : 'Crear Usuario'}
                </button>
            </form>
        </div>
    );

    return (
        <div className="auth-container">
            <button 
                className="toggle-button" 
                onClick={() => {
                    setRegister(!register);
                    resetForm();
                }}
                disabled={loading}
            >
                {register ? 'Volver al Login' : 'Crear Usuario'}
            </button>
            {register ? <RegisterForm /> : <LoginForm />}
        </div>
    );
};

export default Login;