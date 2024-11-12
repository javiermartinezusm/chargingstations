// src/components/FreeParks.js
import React, { useEffect, useState, useCallback } from 'react';
import './FreeParks.css'
import ReservationForm from '../ReservationForm/ReservationForm';
import blackCar from '../images/black_car.png';
import redCharger from '../images/red_charger.png';
import greenCharger from '../images/green_charger.png';
import warningIcon from '../images/alerta.png';


function FreeParks({ locationId, user }) {
  const [parkingData, setParkingData] = useState([]);
  const [showReservationForm, setShowReservationForm] = useState(false);

  const fetchParkingData = useCallback(async () => {
    if (!locationId) return;

    try {
      const response = await fetch(`${window.location.protocol}//${window.location.hostname}:5000/stations?locationId=${locationId}`);
      const data = await response.json();

      if (data.status === "OK" && Array.isArray(data.stations)) {
        setParkingData(data.stations);
      } else {
        console.error('La respuesta de la API no es un array de estaciones:', data);
        setParkingData([]);
      }
    } catch (error) {
      console.error('Error al obtener las estaciones de carga:', error);
    }
  }, [locationId]);

  useEffect(() => {
    fetchParkingData();
    const interval = setInterval(fetchParkingData, 5000);

    return () => clearInterval(interval);
  }, [fetchParkingData]);

  const getImageByState = (state) => {
    switch (state) {
      case 0:
        return greenCharger;
      case 1:
        return redCharger;
      case 2:
        return blackCar;
      default:
        return null;
    }
  };
  
  const getStateByNumber = (state) => {
    switch (state) {
      case 0:
        return "Disponible";
      case 1:
        return "Ocupado";
      case 2:
        return "No disponible";
      default:
        return null;
    }
  };

  return (
    <div>
      <h2>Estaciones de Carga Disponibles</h2>
      <div className="parking-container">
        {parkingData.length > 0 ? (
          parkingData.map((park) => (
            <div key={park.id} className="parking-spot">
              <img src={getImageByState(park.estado)} alt={`Estado ${park.estado}`} />
              <p>{getStateByNumber(park.estado)}</p>
            </div>
          ))
        ) : (
          <p>No hay estaciones disponibles para esta ubicación.</p>
        )}
      </div>
      {parkingData.length > 0 && (
        user ? (
          <button className="reserve-button" onClick={() => setShowReservationForm(true)}>RESERVAR</button>
        ) : (
          <div className="login-warning">
            <img src={warningIcon} alt="Advertencia" className="warning-icon" />
            <p>Debes iniciar sesión para hacer una reserva.</p>
          </div>
        )
      )}
      {showReservationForm && <ReservationForm onClose={() => setShowReservationForm(false)} user={user} locationId={locationId} totalStations={parkingData.length}/>}
    </div>
  );
}

export default FreeParks;
