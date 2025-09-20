import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import ApiService from '../../services/ApiService';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const [statistics, setStatistics] = useState({
        buildings: 0,
        floors: 0,
        sensors: 0,
        users: 0,
        activeSensors: 0,
        inactiveSensors: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const { user, logout, isAdmin } = useAuth();
    const navigate = useNavigate();

    // Check if user is admin
    useEffect(() => {
        if (!isAdmin) {
            navigate('/campus');
            return;
        }
    }, [isAdmin, navigate]);

    // Load dashboard data
    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            setError('');

            const [
                buildingsData,
                sensorsData,
                usersData,
                sensorStats
            ] = await Promise.all([
                ApiService.getAllBuildings(),
                ApiService.getAllSensors(),
                ApiService.getAllUsers(),
                ApiService.getSensorStatistics()
            ]);

            // Count buildings and floors
            let buildingCount = 0;
            let floorCount = 0;

            if (buildingsData && Array.isArray(buildingsData)) {
                buildingCount = buildingsData.length;
                floorCount = buildingsData.reduce((total, building) =>
                    total + (building.floors ? building.floors.length : 0), 0
                );
            }

            setStatistics({
                buildings: buildingCount,
                floors: floorCount,
                sensors: sensorsData?.length || 0,
                users: usersData?.length || 0,
                activeSensors: sensorStats?.statistics?.active_sensors || 0,
                inactiveSensors: sensorStats?.statistics?.inactive_sensors || 0
            });

        } catch (err) {
            console.error('Error loading dashboard data:', err);
            setError('שגיאה בטעינת נתוני הדשבורד');
        } finally {
            setLoading(false);
        }
    };

    const handleNavigation = (path) => {
        navigate(path);
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
            <div className="admin-dashboard-page">
                <div className="admin-loading">
                    <div className="admin-loading-spinner"></div>
                    <p>טוען נתוני דשבורד...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-dashboard-page">
            {/* Header */}
            <header className="admin-header">
                <div className="admin-header-container">
                    <div className="admin-user-section">
                        <div className="admin-user-info">
                            <span className="admin-user-name">שלום, {user?.username}</span>
                            <span className="admin-user-role">{getRoleText(user?.user_type)}</span>
                        </div>
                        <button
                            className="admin-logout-btn"
                            onClick={logout}
                        >
                            התנתק
                        </button>
                    </div>

                    <div className="admin-logo-section">
                        <div className="admin-logo">
                            <span className="admin-logo-text">ADMIN DASHBOARD</span>
                            <img
                                src="/assets/images/hit-logo.webp"
                                alt="HIT Logo"
                                className="admin-logo-hit"
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                }}
                            />
                        </div>
                    </div>
                </div>
            </header>

            <div className="admin-main-content">
                <h1 className="admin-page-title">דשבורד ניהול</h1>

                {error && (
                    <div className="error-message" style={{marginBottom: '2rem'}}>
                        <span>⚠️</span>
                        {error}
                        <button onClick={loadDashboardData} style={{marginRight: '1rem'}}>
                            נסה שוב
                        </button>
                    </div>
                )}

                {/* Dashboard Cards */}
                <div className="admin-dashboard-grid">
                    <div
                        className="admin-card"
                        onClick={() => handleNavigation('/campus')}
                    >
                        <div className="admin-card-icon campus">
                            🏢
                        </div>
                        <h3 className="admin-card-title">ניהול קמפוס</h3>
                        <p className="admin-card-description">
                            ניהול בניינים, קומות ותצוגת מפת הקמפוס
                        </p>
                        <div className="admin-card-stats">
                            <div className="admin-card-stat">
                                <span className="admin-card-stat-number">{statistics.buildings}</span>
                                <span className="admin-card-stat-label">בניינים</span>
                            </div>
                            <div className="admin-card-stat">
                                <span className="admin-card-stat-number">{statistics.floors}</span>
                                <span className="admin-card-stat-label">קומות</span>
                            </div>
                        </div>
                    </div>

                    <div
                        className="admin-card"
                        onClick={() => handleNavigation('/sensor-management')}
                    >
                        <div className="admin-card-icon sensors">
                            📡
                        </div>
                        <h3 className="admin-card-title">ניהול סנסורים</h3>
                        <p className="admin-card-description">
                            ניהול וניטור סנסורים, עדכון סטטוס ומיקום
                        </p>
                        <div className="admin-card-stats">
                            <div className="admin-card-stat">
                                <span className="admin-card-stat-number">{statistics.activeSensors}</span>
                                <span className="admin-card-stat-label">פעילים</span>
                            </div>
                            <div className="admin-card-stat">
                                <span className="admin-card-stat-number">{statistics.sensors}</span>
                                <span className="admin-card-stat-label">סה״כ</span>
                            </div>
                        </div>
                    </div>

                    <div
                        className="admin-card"
                        onClick={() => handleNavigation('/user-management')}
                    >
                        <div className="admin-card-icon users">
                            👥
                        </div>
                        <h3 className="admin-card-title">ניהול משתמשים</h3>
                        <p className="admin-card-description">
                            ניהול משתמשים, הרשאות ומעקב פעילות
                        </p>
                        <div className="admin-card-stats">
                            <div className="admin-card-stat">
                                <span className="admin-card-stat-number">{statistics.users}</span>
                                <span className="admin-card-stat-label">משתמשים</span>
                            </div>
                            <div className="admin-card-stat">
                                <span className="admin-card-stat-number">3</span>
                                <span className="admin-card-stat-label">רמות</span>
                            </div>
                        </div>
                    </div>

                    <div
                        className="admin-card"
                        onClick={() => handleNavigation('/reports')}
                    >
                        <div className="admin-card-icon reports">
                            📊
                        </div>
                        <h3 className="admin-card-title">דוחות וסטטיסטיקות</h3>
                        <p className="admin-card-description">
                            צפייה בדוחות מפורטים וסטטיסטיקות מערכת
                        </p>
                        <div className="admin-card-stats">
                            <div className="admin-card-stat">
                                <span className="admin-card-stat-number">24/7</span>
                                <span className="admin-card-stat-label">ניטור</span>
                            </div>
                            <div className="admin-card-stat">
                                <span className="admin-card-stat-number">∞</span>
                                <span className="admin-card-stat-label">נתונים</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="admin-quick-actions">
                    <h3 className="admin-quick-actions-title">פעולות מהירות</h3>
                    <div className="admin-actions-grid">
                        <button
                            className="admin-action-btn"
                            onClick={() => handleNavigation('/campus')}
                        >
                            הוסף בניין חדש
                        </button>
                        <button
                            className="admin-action-btn"
                            onClick={() => handleNavigation('/sensor-management')}
                        >
                            הוסף סנסור חדש
                        </button>
                        <button
                            className="admin-action-btn"
                            onClick={() => handleNavigation('/user-management')}
                        >
                            צור משתמש חדש
                        </button>
                        <button
                            className="admin-action-btn"
                            onClick={loadDashboardData}
                        >
                            רענן נתונים
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;