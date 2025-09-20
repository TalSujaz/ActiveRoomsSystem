import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage/HomePage';
import CampusMapView from './components/CampusMapView/CampusMapView';
import AdminDashboard from './components/AdminDashboard/AdminDashboard';
import LoginPage from './components/LoginPage/LoginPage';
import SensorManagement from './components/SensorManagement/SensorManagement';
import './App.css';

function App() {
  return (
      <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/campus" element={<CampusMapView />} />
          {/* Add later */}
        <Route path="/building/:buildingId" element={<div style={{color: 'white', padding: '2rem'}}>Building View</div>} />
        <Route path="/floor/:floorId" element={<div style={{color: 'white', padding: '2rem'}}>Floor View</div>} />
        <Route path="/adminpanel" element={<AdminDashboard />} />
        <Route path="/contact" element={<div style={{color: 'white', padding: '2rem'}}>Contact</div>} />
        <Route path="/staff" element={<div style={{color: 'white', padding: '2rem'}}>Staff</div>} />
        <Route path="/settings" element={<div style={{color: 'white', padding: '2rem'}}>Settings</div>} />
        <Route path="/help" element={<div style={{color: 'white', padding: '2rem'}}>Help</div>} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/sensor-management" element={<SensorManagement />} />
        </Routes>
      </div>
    </Router>
    
  );
}

export default App;