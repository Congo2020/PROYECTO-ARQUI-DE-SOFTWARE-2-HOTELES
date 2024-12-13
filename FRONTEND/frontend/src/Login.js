import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = ({ token, setToken }) => {
  const navigate = useNavigate();
  const [register, setRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [admin, setAdmin] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      navigate("/");
    }
  }, [token, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'username') {
      setUsername(value);
    } else if (name === 'password') {
      setPassword(value);
    } else if (name === 'admin') {
      setAdmin(value === '1');
    }
    setError('');
  };

  const resetForm = () => {
    setUsername('');
    setPassword('');
    setAdmin(false);
    setError('');
  };

  const validateForm = () => {
    if (!username || !password) {
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
      const response = await axios.post('http://localhost:8080/users', {
        username,
        password,
        admin
      }, {
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
      const response = await axios.post('http://localhost:8080/login', {
        username,
        password
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
  
      if (response.data.token) {
        console.log('Login successful');
        setToken(response.data.token);
        localStorage.setItem('userId', response.data.userId); // Guardar el userId en el almacenamiento local
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
        placeholder={label}
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
          value={username}
          onChange={handleInputChange}
          disabled={loading}
        />
        <FormField
          type="password"
          name="password"
          label="Contraseña"
          value={password}
          onChange={handleInputChange}
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !username || !password}
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
          value={username}
          onChange={handleInputChange}
          disabled={loading}
        />
        <FormField
          type="password"
          name="password"
          label="Contraseña"
          value={password}
          onChange={handleInputChange}
          disabled={loading}
        />
        <div className="form-group">
          <select
            id="admin"
            name="admin"
            value={admin ? '1' : '0'}
            onChange={handleInputChange}
            disabled={loading}
            className="form-input"
          >
            <option value="0">Usuario Común</option>
            <option value="1">Administrador</option>
          </select>
        </div>
        <button 
          type="submit" 
          disabled={loading || !username || !password}
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