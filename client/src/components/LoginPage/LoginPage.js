import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './LoginPage.css';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login, isAuthenticated, user } = useAuth();
    const navigate = useNavigate();

    // Redirect if already logged in
    useEffect(() => {
        if (isAuthenticated && user) {
            redirectBasedOnRole();
        }
    }, [isAuthenticated, user]);

    const redirectBasedOnRole = () => {
        if (!user) return;

        setTimeout(() => {
            switch (user.user_type) {
                case 'admin':
                    navigate('/adminpanel', { replace: true });
                    break;
                case 'maintainer':
                    navigate('/sensor-management', { replace: true });
                    break;
                case 'user':
                default:
                    navigate('/campus', { replace: true });
                    break;
            }
        }, 100); // Small delay to ensure state is updated
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Basic validation
        if (!username.trim() || !password.trim()) {
            setError('אנא הזן שם משתמש וסיסמה');
            setLoading(false);
            return;
        }

        try {
            const result = await login(username.trim(), password);

            if (result.success) {
                // Login successful - redirect will happen via useEffect
                // Small delay to ensure state update
                setTimeout(() => {
                    redirectBasedOnRole();
                }, 200);
            } else {
                setError(result.error || 'שגיאה בהתחברות');
            }
        } catch (err) {
            console.error('Login error:', err);
            setError('שגיאת שרת. נסה שוב מאוחר יותר');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (setter) => (e) => {
        setter(e.target.value);
        if (error) setError(''); // Clear error when user starts typing
    };

    return (
        <div className="login-page">
            {/* Background with floating elements */}
            <div className="login-background">
                <div className="floating-elements">
                    <div className="floating-element"></div>
                    <div className="floating-element"></div>
                    <div className="floating-element"></div>
                </div>
            </div>

            {/* Login form container */}
            <div className="login-container">
                <div className="login-header">
                    <div className="login-logo">
                        <img
                            src="/assets/images/hit-logo.webp"
                            alt="HIT Logo"
                            className="logo-hit"
                            onError={(e) => {
                                e.target.style.display = 'none';
                            }}
                        />
                    </div>
                    <h1 className="login-title">SMART CAMPUS</h1>
                    <p className="login-subtitle">מערכת ניהול חדרים פעילים</p>

                    {/* Back to home button */}
                    <button
                        className="back-to-home-btn"
                        onClick={() => navigate('/')}
                        type="button"
                    >
                        ← חזרה לעמוד הראשי
                    </button>
                </div>

                <form className="login-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="username" className="form-label">
                            שם משתמש
                        </label>
                        <input
                            type="text"
                            id="username"
                            className="form-input"
                            placeholder="הזן שם משתמש"
                            value={username}
                            onChange={handleInputChange(setUsername)}
                            disabled={loading}
                            autoComplete="username"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password" className="form-label">
                            סיסמה
                        </label>
                        <input
                            type="password"
                            id="password"
                            className="form-input"
                            placeholder="הזן סיסמה"
                            value={password}
                            onChange={handleInputChange(setPassword)}
                            disabled={loading}
                            autoComplete="current-password"
                            required
                        />
                    </div>

                    {error && (
                        <div className="error-message">
                            <span>⚠️</span>
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className={`login-button ${loading ? 'loading' : ''}`}
                        disabled={loading}
                    >
                        {loading ? (
                            <div className="loading-spinner"></div>
                        ) : (
                            'התחבר'
                        )}
                    </button>
                </form>

                <div className="login-footer">
                    <p>מערכת Active Rooms Detection</p>
                    <p>HIT - Holon Institute of Technology</p>
                    <div style={{
                        marginTop: '1rem',
                        fontSize: '0.8rem',
                        color: '#888',
                        textAlign: 'center'
                    }}>
                        <p><strong>משתמשי לדוגמא:</strong></p>
                        <p>מנהל: admin / admin123</p>
                        <p>תחזוקאי: maintainer / maint123</p>
                        <p>משתמש: user / user123</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;