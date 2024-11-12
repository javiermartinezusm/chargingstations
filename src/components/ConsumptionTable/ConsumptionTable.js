// ConsumptionTable.js
import React, { useEffect } from 'react';
import './ConsumptionTable.css';

function ConsumptionTable({ locationName, data, onClose }) {
    return (
        <div className="consumption-modal">
            <div className="modal-content">
                <h3>Consumo en tiempo real para {locationName}</h3>
                <button onClick={onClose} className="close-btn">Cerrar</button>
                <table className="styled-table">
                    <thead>
                        <tr>
                            <th>Estación</th>
                            <th>Consumo Actual (kW)</th>
                            <th>Fecha/Hora</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.length > 0 ? (
                            data.map((record, index) => (
                                <tr key={index}>
                                    <td>{record.station_id}</td>
                                    <td>{record.current_consumption}</td>
                                    <td>{new Date(record.timestamp).toLocaleString()}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="3">No hay datos de consumo disponibles.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default ConsumptionTable;
