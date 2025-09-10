import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage/HomePage';
import CampusMapView from './components/CampusMapView/CampusMapView';
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
        <Route path="/adminpanel" element={<div style={{color: 'white', padding: '2rem'}}>Admin Panel</div>} />
        <Route path="/contact" element={<div style={{color: 'white', padding: '2rem'}}>Contact</div>} />
        <Route path="/staff" element={<div style={{color: 'white', padding: '2rem'}}>Staff</div>} />
        <Route path="/settings" element={<div style={{color: 'white', padding: '2rem'}}>Settings</div>} />
        <Route path="/help" element={<div style={{color: 'white', padding: '2rem'}}>Help</div>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;