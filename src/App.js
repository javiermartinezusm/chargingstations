import './App.css';
import Header from './components/Header/Header';
import Locations from './components/Locations/Locations';
import FreeParks from './components/FreeParks/FreeParks';
import Contact from './components/Contact/Contact';
import Login from './components/Login/Login';
import Register from './components/Register/Register';
import MyBookings from './components/MyBookings/MyBookings';
import MyStations from './components/MyStations/MyStations';
import { Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

function App() {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [user, setUser] = useState(null);
  const location = useLocation();

  const handleLogout = () => {
    setUser(null);
  };

  useEffect(() => {
    if (location.pathname === '/') {
      setSelectedLocation(null);
    }
  }, [location]);

  return (
    <div className="App">
      <Header user={user} onLogout={handleLogout} />
      <Routes>
        <Route
          path="/"
          element={
            <>
              <Locations setSelectedLocation={setSelectedLocation} />
              {selectedLocation && <FreeParks locationId={selectedLocation} user={user} />}
            </>
          }
        />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={user ? <Navigate to="/" /> : <Login setUser={setUser} />} />
        <Route path="/register" element={<Register />} />
        {user && <Route path="/mybookings" element={<MyBookings user={user} />} />}
        {user?.tipo === 1 && <Route path="/mystations" element={<MyStations user={user} />} />}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

export default App;

