const pool = require('../db');

// Login function
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Validate input
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                error: 'Username and password are required'
            });
        }

        // Find user in database (using the existing user structure)
        const [rows] = await pool.query(
            'SELECT * FROM users WHERE username = ? AND password_hash = ?',
            [username, password]
        );

        if (rows.length === 0) {
            return res.status(401).json({
                success: false,
                error: 'Invalid username or password'
            });
        }

        const user = rows[0];

        // Remove sensitive data
        const { password_hash, ...userWithoutPassword } = user;

        res.json({
            success: true,
            message: 'Login successful',
            user: userWithoutPassword
        });

    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};

// Get user by ID (for session management)
exports.getUserById = async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT id, username, email, user_type, phone FROM users WHERE id = ?',
            [req.params.id]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        res.json({
            success: true,
            user: rows[0]
        });

    } catch (err) {
        console.error('Get user error:', err);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};