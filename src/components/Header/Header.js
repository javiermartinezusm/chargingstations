// src/components/Header.js
import React from 'react';
import { NavLink } from 'react-router-dom';
import './Header.css';

function Header({ user, onLogout }) {
  return (
    <header className="header">
      <div className="logo-title">
        <div className="logo">
          <NavLink to="/" className="logo">
            <img src="/logo.png" alt="Logo del Equipo" />
          </NavLink>
        </div>
        <div className="web_title">
          <NavLink to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            <h2>Charging Station as a Service</h2>
          </NavLink>
        </div>
      </div>
      <nav className="nav">
        <ul>
          <li>
            <NavLink to="/" exact className="nav-link" activeClassName="active">
              Inicio
            </NavLink>
          </li>
          <li>
            <NavLink to="/contact" className="nav-link" activeClassName="active">
              Contacto
            </NavLink>
          </li>
          {user?.tipo === 1 && (
            <li>
              <NavLink to="/mystations" className="nav-link" activeClassName="active">
                Mis Estaciones
              </NavLink>
            </li>
          )}
          {user ? (
            <>
              <li>
                <NavLink to="/mybookings" className="nav-link" activeClassName="active">
                  Mis Reservas
                </NavLink>
              </li>
              <li>
                <NavLink to="/" onClick={onLogout}>
                  Cerrar Sesión
                </NavLink>
              </li>
              <li className="divider"></li>
              <li>
                <span className="user-name">{user.nombre} {user.apellido}</span>
              </li>
            </>
          ) : (
            <li>
              <NavLink to="/login" className="nav-link" activeClassName="active">
                Iniciar Sesión
              </NavLink>
            </li>
          )}
        </ul>
      </nav>
    </header>
  );
}

export default Header;
