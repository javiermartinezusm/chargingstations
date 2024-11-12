import React, { useEffect, useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import './MyStations.css';

function MyStations({ user }) {
    const [locations, setLocations] = useState([]);
    const [stationCounts, setStationCounts] = useState({});
    const [quantity, setQuantity] = useState(1);
    const [reservations, setReservations] = useState([]); 
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [monitoringData, setMonitoringData] = useState({});
    const [viewingMonitoring, setViewingMonitoring] = useState(false); 
    const fetchLocationsData = useCallback(async () => {
        if (!user?.id) return;

        try {
            const locationsResponse = await fetch(`${window.location.protocol}//${window.location.hostname}:5000/locations?userId=${user.id}`);
            const locationsData = await locationsResponse.json();

            if (locationsData.status === "OK" && Array.isArray(locationsData.locations)) {
                setLocations(locationsData.locations);

                for (const location of locationsData.locations) {
                    const stationsResponse = await fetch(`${window.location.protocol}//${window.location.hostname}:5000/stations?locationId=${location.id}`);
                    const stationsData = await stationsResponse.json();

                    if (stationsData.status === "OK" && Array.isArray(stationsData.stations)) {
                        setStationCounts(prevCounts => ({
                            ...prevCounts,
                            [location.id]: stationsData.stations.length
                        }));
                    } else {
                        console.error('La respuesta de la API no es un array de estaciones:', stationsData);
                    }
                }
            } else {
                console.error('La respuesta de la API no es un array de ubicaciones:', locationsData);
                setLocations([]);
            }
        } catch (error) {
            console.error('Error al obtener las ubicaciones y estaciones:', error);
        }
    }, [user.id]);

    useEffect(() => {
        fetchLocationsData();
    }, [fetchLocationsData]);

    const handleAddStation = async (locationId) => {
        if (quantity <= 0) {
            alert('La cantidad debe ser mayor a 0');
            return;
        }

        try {
            const response = await fetch(`${window.location.protocol}//${window.location.hostname}:5000/stations`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ locationId, quantity })
            });
            const data = await response.json();

            if (data.status === "OK") {
                alert(`${quantity} estación(es) añadida(s) correctamente.`);
                setStationCounts(prevCounts => ({
                    ...prevCounts,
                    [locationId]: (prevCounts[locationId] || 0) + data.cantidad
                }));
            } else {
                console.error('Error al añadir estaciones:', data);
            }
        } catch (error) {
            console.error('Error en la solicitud de añadir estaciones:', error);
        }
    };

    const handleRemoveStation = async (locationId) => {
        if (quantity <= 0) {
            alert('La cantidad debe ser mayor a 0');
            return;
        }

        try {
            const response = await fetch(
                `${window.location.protocol}//${window.location.hostname}:5000/stations?locationId=${locationId}&quantity=${quantity}`,
                {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' }
                }
            );

            const data = await response.json();

            if (data.status === "OK") {
                alert(data.mensaje);
                setStationCounts(prevCounts => ({
                    ...prevCounts,
                    [locationId]: Math.max((prevCounts[locationId] || 0) - data.cantidad, 0)
                }));
            } else {
                console.error('Error al eliminar estaciones:', data);
                alert('No se pudo eliminar la estación. Revisa la consola para más detalles.');
            }
        } catch (error) {
            console.error('Error en la solicitud de eliminar estaciones:', error);
            alert('Error al intentar eliminar estaciones. Verifica la conexión con el servidor.');
        }
    };

    const handleViewReservations = async (location) => {
        setSelectedLocation(location);
        setViewingMonitoring(false);
        try {
            const response = await fetch(`${window.location.protocol}//${window.location.hostname}:5000/booking?locationId=${location.id}`);
            const data = await response.json();
            console.log(data)
            if (data.status === "OK" && Array.isArray(data.bookings)) {
                setReservations(data.bookings);
            } else {
                console.error('Error al obtener las reservas:', data);
            }
        } catch (error) {
            console.error('Error en la solicitud de reservas:', error);
        }
    };

    const handleMonitorCurrent = async (location) => {
        setSelectedLocation(location);
        setViewingMonitoring(true);
        try {
            const response = await fetch(`${window.location.protocol}//${window.location.hostname}:5000/current?locationId=${location.id}`);
            const data = await response.json();

            if (data.status === "OK" && Array.isArray(data.data)) {
                setMonitoringData(prevData => ({
                    ...prevData,
                    [location.id]: data.data
                }));
            } else if (data.status === 404) {
                setMonitoringData(prevData => ({
                    ...prevData,
                    [location.id]: []
                }));
            } else {
                console.error('Error al obtener datos de corriente:', data);
            }
        } catch (error) {
            console.error('Error en la solicitud de monitoreo de corriente:', error);
        }
    };

    return (
        <div>
            <Helmet>
                <title>Mis Estaciones - Charging Stations as a Service</title>
            </Helmet>
            <h2>Mis Estaciones</h2>
            <div>
                <label htmlFor="quantity">Cantidad de estaciones:</label>
                <input
                    type="number"
                    id="quantity"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, e.target.value))}
                    min="1"
                />
            </div>
            <table className="styled-table">
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Cantidad de Estaciones</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {locations.map(location => (
                        <tr key={location.id}>
                            <td>{location.nombre}</td>
                            <td>{stationCounts[location.id] || 0}</td>
                            <td>
                                <button onClick={() => handleAddStation(location.id)} className="action-btn add-btn">Añadir Estación</button>
                                <button onClick={() => handleRemoveStation(location.id)} className="action-btn remove-btn">Quitar Estación</button>
                                <button onClick={() => handleViewReservations(location)} className="action-btn view-btn">Ver Reservas</button>
                                <button onClick={() => handleMonitorCurrent(location)} className="action-btn monitor-btn">Monitorear Consumo</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {!viewingMonitoring && selectedLocation && (
                <div className="reservations-list">
                    <h3>Reservas Futuras para la Localización {selectedLocation.nombre}</h3>
                    <table className="styled-table">
                        <thead>
                            <tr>
                                <th>Estación</th>
                                <th>Inicio Reserva</th>
                                <th>Fin Reserva</th>
                                <th>Usuario</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reservations.length > 0 ? (
                                reservations.map((reservation, index) => (
                                    <tr key={index}>
                                        <td>{reservation.station_id}</td>
                                        <td>{new Date(reservation.inicio_reserva).toLocaleString()}</td>
                                        <td>{new Date(reservation.fin_reserva).toLocaleString()}</td>
                                        <td>{reservation.nombre_completo}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4">No hay reservas para esta ubicación.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
            {viewingMonitoring && selectedLocation && (
                <div className="monitoring-data">
                    <h3>Datos de Monitoreo para {selectedLocation.nombre}</h3>
                    <table className="styled-table">
                        <thead>
                            <tr>
                                <th>Estación</th>
                                <th>Consumo</th>
                                <th>Fecha</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Array.isArray(monitoringData[selectedLocation.id]) && monitoringData[selectedLocation.id].length > 0 ? (
                                monitoringData[selectedLocation.id].map((data, index) => (
                                    <tr key={index}>
                                        <td>{data.station_id}</td>
                                        <td>{data.valor_medicion}</td>
                                        <td>{new Date(data.timestamp).toLocaleString()}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="3">No hay datos disponibles para monitorear.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default MyStations;
