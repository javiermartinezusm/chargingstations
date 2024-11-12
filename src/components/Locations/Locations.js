import React, { useEffect, useState } from 'react';
import "./Locations.css";
import { Helmet } from 'react-helmet-async';

function Locations({ setSelectedLocation }) {
  const [locations, setLocations] = useState([]);
  const [selectedLocationId, setSelectedLocationId] = useState(null);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await fetch(`${window.location.protocol}//${window.location.hostname}:5000/locations`);
        const data = await response.json();
        setLocations(data.locations);
      } catch (error) {
        console.error('Error al obtener las ubicaciones:', error);
      }
    };

    fetchLocations();
  }, []);

  const handleLocationClick = (id) => {
    setSelectedLocation(id);
    setSelectedLocationId(id);
  };

  return (
    <div>
      <Helmet>
        <title>Charging Stations as a Service</title>
      </Helmet>
      <h2>Selecciona una Ubicación</h2>
      <div>
        {locations.map(location => (
          <button
            className={`button ${selectedLocationId === location.id ? 'selected' : ''}`}
            key={location.id}
            onClick={() => handleLocationClick(location.id)}
          >
            {location.nombre}
          </button>
        ))}
      </div>
    </div>
  );
}

export default Locations;