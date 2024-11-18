import React, { useEffect, useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './MyStations.css';

function MyStations({ user }) {
    const [locations, setLocations] = useState([]);
    const [stationCounts, setStationCounts] = useState({});
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
            console.log(data)
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
                    {monitoringData[selectedLocation.id]?.length > 0 ? (
                        Object.values(monitoringData[selectedLocation.id].reduce((acc, curr) => {
                            const stationId = curr.station_id;
                            if (!acc[stationId]) {
                                acc[stationId] = [];
                            }
                            acc[stationId].push(curr);  // Agrupar datos por station_id
                            return acc;
                        }, {}))
                        .map((data, index) => (
                            <div key={index} className="graph-container">
                                <h4>Estación {data[0].station_id}</h4>
                                <ResponsiveContainer width="80%" height={300}>
                                    <LineChart data={data}>
                                        <CartesianGrid stroke="#ccc" />
                                        <XAxis
                                            dataKey="timestamp"
                                            tickFormatter={(tick) => {
                                                // Formatear las horas en el eje X
                                                const date = new Date(tick);
                                                return `${date.getHours()}:${date.getMinutes()}`;
                                            }}
                                        />
                                        <YAxis label={{ value: 'Consumo [W]', angle: -90, position: 'insideLeft' }} />
                                        <Tooltip
                                            labelFormatter={(label) => new Date(label).toLocaleString()}
                                        />
                                        <Legend />
                                        <Line type="monotone" dataKey="valor_medicion" stroke="#8884d8" name="Consumo [W]" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        ))
                    ) : (
                        <p>No hay datos disponibles para monitorear.</p>
                    )}
                </div>
            )}
        </div>
    );
}

export default MyStations;
