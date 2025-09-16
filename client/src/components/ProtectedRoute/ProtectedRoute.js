import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ProtectedRoute = ({ children, requiredRole = null, requiredPermission = null }) => {
    const { isAuthenticated, user, hasPermission, loading } = useAuth();

    // Show loading while auth is being determined
    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                background: 'rgba(29, 97, 92, 0.471)',
                color: '#2d5a27'
            }}>
                <div style={{textAlign: 'center'}}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        border: '4px solid #e0e0e0',
                        borderTop: '4px solid #4CAF50',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 1rem'
                    }}></div>
                    <p>טוען...</p>
                </div>
            </div>
        );
    }

    // Check if user is authenticated
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Check specific role requirement
    if (requiredRole && user?.user_type !== requiredRole) {
        // Redirect based on user's actual role
        switch (user?.user_type) {
            case 'admin':
                return <Navigate to="/admin-dashboard" replace />;
            case 'maintainer':
                return <Navigate to="/sensor-management" replace />;
            case 'user':
            default:
                return <Navigate to="/campus" replace />;
        }
    }

    // Check permission requirement
    if (requiredPermission && !hasPermission(requiredPermission)) {
        // Redirect to appropriate page based on user's permissions
        if (hasPermission('admin')) {
            return <Navigate to="/admin-dashboard" replace />;
        } else if (hasPermission('maintenance')) {
            return <Navigate to="/sensor-management" replace />;
        } else {
            return <Navigate to="/campus" replace />;
        }
    }

    return children;
};

export default ProtectedRoute;