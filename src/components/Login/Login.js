// src/components/Login.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import { Helmet } from 'react-helmet-async';

function Login({ setUser }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${window.location.protocol}//${window.location.hostname}:5000/users?email=${email}&password=${password}`);
      const data = await response.json();

      if (data.status === 'OK') {
        setUser(data.user);
      } else {
        alert('Invalid credentials');
      }
    } catch (error) {
      console.error('Error logging in:', error);
    }
  };

  const handleRegisterRedirect = () => {
    navigate('/register');
  };

  return (
    <div className="login-container">
      <Helmet>
        <title>Iniciar Sesión - Charging Station as a Service</title>
      </Helmet>
      <form className="login-form" onSubmit={handleLogin}>
        <label htmlFor="email">Correo</label>
        <input
          type="email"
          id="email"
          className="input-field"
          placeholder="Ingrese su correo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <label htmlFor="password">Contraseña</label>
        <input
          type={showPassword ? 'text' : 'password'}
          id="password"
          className="input-field"
          placeholder="Ingrese su contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        
        <div className="checkbox-container">
          <input
            type="checkbox"
            id="show-password"
            checked={showPassword}
            onChange={() => setShowPassword(!showPassword)}
          />
          <label htmlFor="show-password">Mostrar contraseña</label>
        </div>

        <button type="submit" className="login-button">Iniciar Sesión</button>
        <button type="button" className="register-button" onClick={handleRegisterRedirect}>
          Registrarse
        </button>
      </form>
    </div>
  );
}

export default Login;
