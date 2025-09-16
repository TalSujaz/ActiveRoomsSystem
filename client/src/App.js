import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import LoginPage from './components/LoginPage/LoginPage';
import HomePage from './components/HomePage/HomePage';
import CampusMapView from './components/CampusMapView/CampusMapView';
import SensorManagement from './components/SensorManagement/SensorManagement';
import AdminDashboard from './components/AdminDashboard/AdminDashboard';
import './App.css';

function App() {
  return (
      <AuthProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />

              {/* Protected Routes */}
              <Route
                  path="/campus"
                  element={
                    <ProtectedRoute requiredPermission="view">
                      <CampusMapView />
                    </ProtectedRoute>
                  }
              />

              <Route
                  path="/sensor-management"
                  element={
                    <ProtectedRoute requiredPermission="maintenance">
                      <SensorManagement />
                    </ProtectedRoute>
                  }
              />

              <Route
                  path="/admin-dashboard"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
              />

              {/* Placeholder routes for future development */}
              <Route
                  path="/building/:buildingId"
                  element={
                    <ProtectedRoute requiredPermission="view">
                      <div style={{color: 'white', padding: '2rem', textAlign: 'center'}}>
                        <h2>תצוגת בניין</h2>
                        <p>בפיתוח...</p>
                      </div>
                    </ProtectedRoute>
                  }
              />

              <Route
                  path="/floor/:floorId"
                  element={
                    <ProtectedRoute requiredPermission="view">
                      <div style={{color: 'white', padding: '2rem', textAlign: 'center'}}>
                        <h2>תצוגת קומה</h2>
                        <p>בפיתוח...</p>
                      </div>
                    </ProtectedRoute>
                  }
              />

              <Route
                  path="/user-management"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <div style={{color: 'white', padding: '2rem', textAlign: 'center'}}>
                        <h2>ניהול משתמשים</h2>
                        <p>בפיתוח...</p>
                      </div>
                    </ProtectedRoute>
                  }
              />

              <Route
                  path="/reports"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <div style={{color: 'white', padding: '2rem', textAlign: 'center'}}>
                        <h2>דוחות וסטטיסטיקות</h2>
                        <p>בפיתוח...</p>
                      </div>
                    </ProtectedRoute>
                  }
              />

              {/* Legacy routes - keeping for compatibility */}
              <Route
                  path="/adminpanel"
                  element={<Navigate to="/admin-dashboard" replace />}
              />
              <Route
                  path="/contact"
                  element={
                    <div style={{color: 'white', padding: '2rem', textAlign: 'center'}}>
                      <h2>צור קשר</h2>
                      <p>בפיתוח...</p>
                    </div>
                  }
              />
              <Route
                  path="/staff"
                  element={
                    <div style={{color: 'white', padding: '2rem', textAlign: 'center'}}>
                      <h2>צוות</h2>
                      <p>בפיתוח...</p>
                    </div>
                  }
              />
              <Route
                  path="/settings"
                  element={
                    <ProtectedRoute requiredPermission="view">
                      <div style={{color: 'white', padding: '2rem', textAlign: 'center'}}>
                        <h2>הגדרות</h2>
                        <p>בפיתוח...</p>
                      </div>
                    </ProtectedRoute>
                  }
              />
              <Route
                  path="/help"
                  element={
                    <div style={{color: 'white', padding: '2rem', textAlign: 'center'}}>
                      <h2>עזרה</h2>
                      <p>בפיתוח...</p>
                    </div>
                  }
              />

              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
  );
}

export default App;