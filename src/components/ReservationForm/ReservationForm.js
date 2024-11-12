import React, { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns-tz';
import './ReservationForm.css';

function ReservationForm({ totalStations, locationId, onClose, user }) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedTime, setSelectedTime] = useState('');
  const [availableStationsCount, setAvailableStationsCount] = useState(totalStations);
  const [userHasBooking, setUserHasBooking] = useState(false);

  const fetchAvailableStations = useCallback(async (date, time) => {
    const localDateTime = new Date(`${date}T${time}:00`);

    const chileTime = format(localDateTime, "yyyy-MM-dd HH:mm:ss", { timeZone: 'America/Santiago' });

    const startTime = chileTime;
    const endTime = new Date(localDateTime.getTime() + 30 * 60000);
    const endTimeFormatted = format(endTime, "yyyy-MM-dd HH:mm:ss", { timeZone: 'America/Santiago' });

    console.log('Start Time:', startTime);
    console.log('End Time:', endTimeFormatted);

    try {
      const response = await fetch(`${window.location.protocol}//${window.location.hostname}:5000/booking?locationId=${locationId}&startTime=${startTime}&endTime=${endTimeFormatted}`);
      const data = await response.json();
      if (data.status === "OK") {
        const bookedCount = data.bookings.length;
        const availableCount = totalStations - bookedCount;
        setAvailableStationsCount(availableCount); 

        const userHasBooking = data.bookings.some(booking => booking.user_id === user.id);
        setUserHasBooking(userHasBooking);
      } else {
        console.error(data.mensaje);
      }
    } catch (error) {
      console.error('Error fetching available stations:', error);
    }
  }, [locationId, totalStations, user.id]);

  useEffect(() => {
    if (selectedTime) {
      fetchAvailableStations(selectedDate, selectedTime);
    }
  }, [selectedDate, selectedTime, fetchAvailableStations]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Reserva realizada para:', selectedDate, selectedTime);

    const localDateTime = new Date(`${selectedDate}T${selectedTime}:00`);
    const startTime = format(localDateTime, "yyyy-MM-dd HH:mm:ss", { timeZone: 'America/Santiago' });
    const endTime = new Date(localDateTime.getTime() + 30 * 60000);
    const endTimeFormatted = format(endTime, "yyyy-MM-dd HH:mm:ss", { timeZone: 'America/Santiago' });

    try {
      const response = await fetch(`${window.location.protocol}//${window.location.hostname}:5000/booking`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          location_id: locationId,
          user_id: user.id,
          startTime: startTime,
          endTime: endTimeFormatted,
        }),
      });

      const data = await response.json();
      if (data.status === "OK") {
        console.log('Reserva exitosa:', data);
      } else {
        console.error(data.mensaje);
      }
    } catch (error) {
      console.error('Error realizando la reserva:', error);
    }

    onClose();
  };

  const generateTimeOptions = () => {
    const options = [];
    const now = new Date();
    const today = new Date().toISOString().split("T")[0];

    const isToday = selectedDate === today;

    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;

        if (isToday) {
          const optionTime = new Date(`${selectedDate}T${time}:00`);
          if (optionTime <= now) {
            continue;
          }
        }

        options.push(time);
      }
    }
    return options;
  };

  return (
    <div className="reservation-popup">
      <div className="reservation-content">
        <button className="close-button" onClick={onClose}>X</button>
        <h3>Reservar Estación</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <label htmlFor="date" className='label'>Día:</label>
            <input
              type="date"
              id="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
            />
          </div>
          <div className="form-row">
            <label htmlFor="time" className='label'>Horario:</label>
            <select
              id="time"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              required
            >
              <option value="">Seleccione un horario</option>
              {generateTimeOptions().map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
          </div>
          <div>
            <p>Estaciones disponibles: {availableStationsCount}</p>
          </div>
          {availableStationsCount <= 0 ? (
  <div className="no-availability-message">No hay estaciones disponibles para este horario.</div>
) : userHasBooking ? (
  <div className="no-availability-message">Ya tienes una reserva para este horario.</div>
) : null}

          <button 
            type="submit" 
            className="submit-button" 
            disabled={availableStationsCount <= 0 || userHasBooking}
          >
            Reservar
          </button>
        </form>
      </div>
    </div>
  );
}

export default ReservationForm;
