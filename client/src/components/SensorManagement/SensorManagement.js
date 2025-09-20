import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import ApiService from '../../services/ApiService';
import './SensorManagement.css';

const SensorManagement = () => {
    const [sensors, setSensors] = useState([]);
    const [filteredSensors, setFilteredSensors] = useState([]);
    const [statistics, setStatistics] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const { user, logout, hasPermission } = useAuth();
    const navigate = useNavigate();

    // Check permissions
    useEffect(() => {
        if (!hasPermission('maintenance')) {
            navigate('/campus');
            return;
        }
    }, [hasPermission, navigate]);

    // Load data on component mount
    useEffect(() => {
        loadData();
    }, []);

    // Filter sensors when search term or status filter changes
    useEffect(() => {
        filterSensors();
    }, [sensors, searchTerm, statusFilter]);

    const loadData = async () => {
        try {
            setLoading(true);
            setError('');

            console.log('Loading sensor management data...');

            // First check if we can reach the server
            try {
                const healthCheck = await fetch('http://localhost:3001/api/areas');
                console.log('Health check response:', healthCheck.status);
            } catch (healthError) {
                console.error('Health check failed:', healthError);
                setError('לא ניתן להתחבר לשרת. בדוק שהשרת פועל על פורט 3001');
                return;
            }

            const [sensorsData, statsData] = await Promise.all([
                ApiService.getAllSensorsWithAreas().catch(err => {
                    console.error('Failed to get sensors with areas:', err);
                    return { success: false, error: err.message };
                }),
                ApiService.getSensorStatistics().catch(err => {
                    console.error('Failed to get sensor statistics:', err);
                    return { success: false, error: err.message };
                })
            ]);

            console.log('Sensors data:', sensorsData);
            console.log('Stats data:', statsData);

            if (sensorsData.success) {
                setSensors(sensorsData.sensors || []);
            } else {
                console.warn('Sensors request failed:', sensorsData.error);
                // עדיין נציג את הדף אבל עם רשימה ריקה
                setSensors([]);
            }

            if (statsData.success) {
                setStatistics(statsData.statistics || {});
            } else {
                console.warn('Statistics request failed:', statsData.error);
                // ברירת מחדל לסטטיסטיקות
                setStatistics({
                    total_sensors: 0,
                    active_sensors: 0,
                    inactive_sensors: 0,
                    error_sensors: 0
                });
            }

            // אם אין שגיאות קריטיות, נמשיך
            if (!sensorsData.success && !statsData.success) {
                setError('שגיאה בטעינת הנתונים מהשרת');
            }

        } catch (err) {
            console.error('Error loading data:', err);
            setError('שגיאה בטעינת הנתונים: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const filterSensors = () => {
        let filtered = sensors;

        // Filter by search term
        if (searchTerm.trim()) {
            filtered = filtered.filter(sensor =>
                sensor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                sensor.area_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                sensor.building_name?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filter by status
        if (statusFilter !== 'all') {
            filtered = filtered.filter(sensor => sensor.status === statusFilter);
        }

        setFilteredSensors(filtered);
    };

    const handleStatusChange = async (sensorId, newStatus) => {
        try {
            const response = await ApiService.updateSensorStatus(sensorId, newStatus);

            if (response.success) {
                // Update local state
                setSensors(prev =>
                    prev.map(sensor =>
                        sensor.id === sensorId
                            ? { ...sensor, status: newStatus }
                            : sensor
                    )
                );

                // Reload statistics
                const statsData = await ApiService.getSensorStatistics();
                if (statsData.success) {
                    setStatistics(statsData.statistics);
                }
            } else {
                alert('שגיאה בעדכון הסטטוס');
            }
        } catch (err) {
            console.error('Error updating status:', err);
            alert('שגיאה בעדכון הסטטוס');
        }
    };

    const handleCoordinatesUpdate = (sensor) => {
        // This would open a modal or navigate to coordinates editing page
        const x = prompt('הזן קואורדינטת X:', sensor.coordinates?.x || '50');
        const y = prompt('הזן קואורדינטת Y:', sensor.coordinates?.y || '50');

        if (x !== null && y !== null) {
            updateCoordinates(sensor.id, { x: parseFloat(x), y: parseFloat(y) });
        }
    };

    const updateCoordinates = async (sensorId, coordinates) => {
        try {
            const response = await ApiService.updateSensorCoordinates(sensorId, coordinates);

            if (response.success) {
                // Update local state
                setSensors(prev =>
                    prev.map(sensor =>
                        sensor.id === sensorId
                            ? {
                                ...sensor,
                                coordinates: JSON.stringify(coordinates)
                            }
                            : sensor
                    )
                );
            } else {
                alert('שגיאה בעדכון הקואורדינטות');
            }
        } catch (err) {
            console.error('Error updating coordinates:', err);
            alert('שגיאה בעדכון הקואורדינטות');
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'active': return 'פעיל';
            case 'inactive': return 'לא פעיל';
            case 'error': return 'שגיאה';
            default: return 'לא ידוע';
        }
    };

    const getRoleText = (userType) => {
        switch (userType) {
            case 'admin': return 'מנהל';
            case 'maintainer': return 'תחזוקאי';
            case 'user': return 'משתמש';
            default: return userType;
        }
    };

    if (loading) {
        return (
            <div className="sensor-management-page">
                <div className="sensor-loading">
                    <div className="sensor-loading-spinner"></div>
                    <p>טוען נתונים...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="sensor-management-page">
            {/* Header */}
            <header className="sensor-header">
                <div className="sensor-header-container">
                    <div className="sensor-user-section">
                        <div className="sensor-user-info">
                            <span className="sensor-user-name">שלום, {user?.username}</span>
                            <span className="sensor-user-role">{getRoleText(user?.user_type)}</span>
                        </div>
                        <button
                            className="sensor-logout-btn"
                            onClick={logout}
                        >
                            התנתק
                        </button>
                    </div>

                    <div className="sensor-logo-section">
                        <div className="sensor-logo">
                            <span className="sensor-logo-text">SENSOR MANAGEMENT</span>
                            <img
                                src="/assets/images/hit-logo.webp"
                                alt="HIT Logo"
                                className="sensor-logo-hit"
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                }}
                            />
                        </div>
                    </div>
                </div>
            </header>

            <div className="sensor-main-content">
                <h1 className="sensor-page-title">ניהול סנסורים</h1>

                {error && (
                    <div className="error-message" style={{marginBottom: '2rem'}}>
                        <span>⚠️</span>
                        {error}
                        <button onClick={loadData} style={{marginRight: '1rem'}}>
                            נסה שוב
                        </button>
                    </div>
                )}

                {/* Statistics */}
                <div className="sensor-statistics">
                    <div className="sensor-stat-card">
            <span className="sensor-stat-number total">
              {statistics.total_sensors || 0}
            </span>
                        <span className="sensor-stat-label">סה״כ סנסורים</span>
                    </div>
                    <div className="sensor-stat-card">
            <span className="sensor-stat-number active">
              {statistics.active_sensors || 0}
            </span>
                        <span className="sensor-stat-label">פעילים</span>
                    </div>
                    <div className="sensor-stat-card">
            <span className="sensor-stat-number inactive">
              {statistics.inactive_sensors || 0}
            </span>
                        <span className="sensor-stat-label">לא פעילים</span>
                    </div>
                    <div className="sensor-stat-card">
            <span className="sensor-stat-number error">
              {statistics.error_sensors || 0}
            </span>
                        <span className="sensor-stat-label">שגיאות</span>
                    </div>
                </div>

                {/* Controls */}
                <div className="sensor-controls">
                    <div className="sensor-search">
                        <input
                            type="text"
                            className="sensor-search-input"
                            placeholder="חפש לפי שם סנסור, אזור או בניין..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="sensor-filter">
                        <button
                            className={`sensor-filter-btn ${statusFilter === 'all' ? 'active' : ''}`}
                            onClick={() => setStatusFilter('all')}
                        >
                            הכל
                        </button>
                        <button
                            className={`sensor-filter-btn ${statusFilter === 'active' ? 'active' : ''}`}
                            onClick={() => setStatusFilter('active')}
                        >
                            פעיל
                        </button>
                        <button
                            className={`sensor-filter-btn ${statusFilter === 'inactive' ? 'active' : ''}`}
                            onClick={() => setStatusFilter('inactive')}
                        >
                            לא פעיל
                        </button>
                        <button
                            className={`sensor-filter-btn ${statusFilter === 'error' ? 'active' : ''}`}
                            onClick={() => setStatusFilter('error')}
                        >
                            שגיאה
                        </button>
                    </div>
                </div>

                {/* Sensors Table */}
                <div className="sensor-table-container">
                    {filteredSensors.length === 0 ? (
                        <div className="sensor-empty">
                            <div className="sensor-empty-icon">📡</div>
                            <p>
                                {sensors.length === 0
                                    ? 'לא נמצאו סנסורים במערכת. יתכן ועדיין לא הוגדרו סנסורים או שהשרת אינו זמין.'
                                    : 'לא נמצאו סנסורים העונים לקריטריונים של החיפוש.'
                                }
                            </p>
                            {sensors.length === 0 && (
                                <div style={{marginTop: '1rem'}}>
                                    <button
                                        className="sensor-filter-btn"
                                        onClick={loadData}
                                    >
                                        נסה לטעון שוב
                                    </button>
                                    <p style={{fontSize: '0.9rem', color: '#666', marginTop: '1rem'}}>
                                        אם השגיאה נמשכת, בדוק שהשרת פועל על פורט 3001
                                    </p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <table className="sensor-table">
                            <thead>
                            <tr>
                                <th>פעולות</th>
                                <th>קואורדינטות</th>
                                <th>סטטוס</th>
                                <th>אזור</th>
                                <th>בניין</th>
                                <th>שם הסנסור</th>
                                <th>מזהה</th>
                            </tr>
                            </thead>
                            <tbody>
                            {filteredSensors.map((sensor) => (
                                <tr key={sensor.id}>
                                    <td>
                                        <div className="sensor-actions">
                                            <select
                                                className="sensor-action-btn status"
                                                value={sensor.status}
                                                onChange={(e) => handleStatusChange(sensor.id, e.target.value)}
                                            >
                                                <option value="active">פעיל</option>
                                                <option value="inactive">לא פעיל</option>
                                                <option value="error">שגיאה</option>
                                            </select>
                                            <button
                                                className="sensor-action-btn coordinates"
                                                onClick={() => handleCoordinatesUpdate(sensor)}
                                            >
                                                ערוך מיקום
                                            </button>
                                        </div>
                                    </td>
                                    <td>
                                        {sensor.coordinates ? (
                                            (() => {
                                                try {
                                                    const coords = JSON.parse(sensor.coordinates);
                                                    return `X: ${coords.x || 0}, Y: ${coords.y || 0}`;
                                                } catch {
                                                    return 'לא זמין';
                                                }
                                            })()
                                        ) : (
                                            'לא הוגדר'
                                        )}
                                    </td>
                                    <td>
                      <span className={`sensor-status ${sensor.status}`}>
                        <span className="sensor-status-dot"></span>
                          {getStatusText(sensor.status)}
                      </span>
                                    </td>
                                    <td>{sensor.area_name || 'לא ידוע'}</td>
                                    <td>{sensor.building_name || 'לא ידוע'}</td>
                                    <td>{sensor.name || 'ללא שם'}</td>
                                    <td>#{sensor.id}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SensorManagement;