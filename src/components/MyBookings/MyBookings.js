// src/components/MyBookings.js
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns-tz';
import './MyBookings.css';
import { Helmet } from 'react-helmet-async';

function MyBookings({ user }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const getPreviousHalfHour = (date) => {
    const previousHalfHour = new Date(date);
    const minutes = previousHalfHour.getMinutes();
    previousHalfHour.setMinutes(minutes < 30 ? 0 : 30);
    previousHalfHour.setSeconds(0, 0);
    return previousHalfHour;
  };

  const handleCancelBooking = async (bookingId) => {
    const confirmCancel = window.confirm('¿Estás seguro de que deseas cancelar esta reserva?');
    if (!confirmCancel) return;
  
    try {
      const response = await fetch(`${window.location.protocol}//${window.location.hostname}:5000/booking/${bookingId}?user_id=${user.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      const data = await response.json();
      if (data.status === 'OK') {
        setBookings((prevBookings) => prevBookings.filter((booking) => booking.id !== bookingId));
      } else {
        console.error(data.mensaje);
      }
    } catch (error) {
      console.error('Error cancelando la reserva:', error);
    }
  };
  
  

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const now = new Date();
        const chileTime = format(now, "yyyy-MM-dd HH:mm:ss", { timeZone: 'America/Santiago' });
        const startTime = format(getPreviousHalfHour(now), "yyyy-MM-dd HH:mm:ss", { timeZone: 'America/Santiago' });
        const response = await fetch(
          `${window.location.protocol}//${window.location.hostname}:5000/booking?user_id=${user.id}&startTime=${startTime}`
        );

        const data = await response.json();
        if (data.status === 'OK') {
          const nowChile = new Date(chileTime);

          const filteredBookings = data.bookings
            .filter((booking) => {
              const startTime = new Date(booking.inicio_reserva);
              const endTime = new Date(booking.fin_reserva);
              return (startTime <= nowChile && endTime > nowChile) || startTime > nowChile;
            })
            .sort((a, b) => new Date(a.inicio_reserva) - new Date(b.inicio_reserva)); 

          setBookings(filteredBookings);
        } else {
          console.error(data.mensaje);
        }
      } catch (error) {
        console.error('Error fetching bookings:', error);
      } finally {
        setLoading(false);
      }
    };
  
    if (user) {
      fetchBookings();
    }
  }, [user]);

  if (loading) {
    return <div>Cargando reservas...</div>;
  }

  return (
    <div className="my-bookings">
      <Helmet>Mis Reservas - Charging Stations as a Service</Helmet>
      <h3>Mis Reservas</h3>
      {bookings.length === 0 ? (
        <p>No tienes reservas activas.</p>
      ) : (
        <table className="bookings-table">
          <thead>
            <tr>
              <th>Ubicación</th>
              <th>Estación</th>
              <th>Inicio</th>
              <th>Fin</th>
              <th>Cancelar reserva</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking.id}>
                <td>{booking.location_name}</td>
                <td>{booking.station_id}</td>
                <td>{new Date(booking.inicio_reserva).toLocaleString('es-CL', { timeZone: 'America/Santiago' })}</td>
                <td>{new Date(booking.fin_reserva).toLocaleString('es-CL', { timeZone: 'America/Santiago' })}</td>
                <td>
                  <button onClick={() => handleCancelBooking(booking.id)}>Cancelar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default MyBookings;
