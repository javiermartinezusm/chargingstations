// src/components/Register.js
import React, { useState } from 'react';
import './Register.css';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';

function Register() {
  const [name, setName] = useState('');
  const [last_name, setLast_Name] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const tipo = 0;
  const handleRegister = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }

    try {
      const response = await fetch(`${window.location.protocol}//${window.location.hostname}:5000/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, last_name, email, password, tipo}),
      });
      const data = await response.json();

      if (data.status === 'OK') {
        alert('Registro exitoso, ahora puedes iniciar sesión.');
        navigate('/login');
      } else {
        alert('Error en el registro.');
      }
    } catch (error) {
      console.error('Error registrando usuario:', error);
    }
  };

  return (
    <div className="register-container">
      <Helmet>
        <title>Registro - Charging Station as a Service</title>
      </Helmet>
      <form className="register-form" onSubmit={handleRegister}>
        <label htmlFor="name">Nombre</label>
        <input
          type="text"
          id="name"
          className="input-field"
          placeholder="Ingrese su nombre"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <label htmlFor="last_name">Apellido</label>
        <input
          type="text"
          id="last_name"
          className="input-field"
          placeholder="Ingrese su apellido"
          value={last_name}
          onChange={(e) => setLast_Name(e.target.value)}
          required
        />

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

        <label htmlFor="confirmPassword">Confirmar Contraseña</label>
        <input
          type={showPassword ? 'text' : 'password'}
          id="confirmPassword"
          className="input-field"
          placeholder="Confirme su contraseña"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
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

        <button type="submit" className="register-button">Registrarse</button>
      </form>
    </div>
  );
}

export default Register;
